import { useEffect, useRef, useState } from 'react'
import { getScenario } from './data/scenarios.js'
import { loadDb, saveDb } from './lib/storage.js'
import {
  licenseStatus,
  markPurchased,
  verifyFromRepo,
  isAdmin,
  isAppShell
} from './lib/entitlement.js'
import Home from './screens/Home.jsx'
import ItemList from './screens/ItemList.jsx'
import About from './screens/About.jsx'
import Admin from './screens/Admin.jsx'
import Lock from './screens/Lock.jsx'
import Pay from './screens/Pay.jsx'

// 网页版才用浏览器历史；App 里完全靠页面栈，避免原生返回键和 history 抢着回退
const useHistory = !isAppShell()

export default function App() {
  const [db, setDb] = useState(loadDb)
  const [license, setLicense] = useState(licenseStatus)
  const [openId, setOpenId] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [lockedId, setLockedId] = useState(null)
  const [payOpen, setPayOpen] = useState(false)
  const stackRef = useRef([])
  const skipPopRef = useRef(0)

  useEffect(() => {
    saveDb(db)
  }, [db])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [openId, aboutOpen, adminOpen, lockedId, payOpen])

  // 启动时静默核验一次：名单里已有本机设备码就直接解锁
  useEffect(() => {
    if (!license.app || license.purchased) return
    let cancelled = false
    verifyFromRepo()
      .then((ok) => {
        if (!cancelled && ok) {
          markPurchased('auto')
          setLicense(licenseStatus())
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  function applyRoute(route) {
    let next = route || {}
    // 管理员页只对作者设备开放，其他设备即使拿到路由也进不去
    if (next.admin && !isAdmin()) next = { ...next, admin: false }
    setOpenId(next.scenario || null)
    setAboutOpen(Boolean(next.about))
    setAdminOpen(Boolean(next.admin))
    setLockedId(next.locked || null)
    setPayOpen(Boolean(next.pay))
  }

  function navigate(route) {
    stackRef.current = [...stackRef.current, route]
    if (useHistory) window.history.pushState(route, '')
    applyRoute(route)
  }

  function popStack() {
    const stack = stackRef.current
    if (!stack.length) return false
    const nextStack = stack.slice(0, -1)
    stackRef.current = nextStack
    applyRoute(nextStack[nextStack.length - 1] || {})
    return true
  }

  // 返回上一级：有上一页就退一页；已经在主界面返回 false
  function goBack() {
    if (!stackRef.current.length) return false
    if (useHistory) {
      // 自己触发的回退会多来一次 popstate，用计数抵消，避免连退两级
      skipPopRef.current += 1
      window.history.back()
    }
    popStack()
    return true
  }

  // 网页版的浏览器返回键：同样只退一级
  useEffect(() => {
    if (!useHistory) return
    function onPop() {
      if (skipPopRef.current > 0) {
        skipPopRef.current -= 1
        return
      }
      popStack()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // 安卓硬件返回键：逐级返回，只有主界面才交给系统进后台
  useEffect(() => {
    window.__onBackPressed = () => (goBack() ? 'handled' : 'exit')
    return () => {
      delete window.__onBackPressed
    }
  }, [])

  function addItem(scenarioId, groupId, name) {
    const value = name.trim()
    if (!value) return
    setDb((prev) => {
      const groups = prev.lists[scenarioId] || {}
      const exists = Object.values(groups).some((items) => items.includes(value))
      if (exists) return prev
      return {
        ...prev,
        lists: {
          ...prev.lists,
          [scenarioId]: { ...groups, [groupId]: [...(groups[groupId] || []), value] }
        }
      }
    })
  }

  function removeItem(scenarioId, groupId, name) {
    setDb((prev) => {
      const groups = prev.lists[scenarioId] || {}
      return {
        ...prev,
        lists: {
          ...prev.lists,
          [scenarioId]: {
            ...groups,
            [groupId]: (groups[groupId] || []).filter((item) => item !== name)
          }
        }
      }
    })
  }

  function openScenario(id) {
    if (license.locked) {
      navigate({ locked: id })
      return
    }
    navigate({ scenario: id })
  }

  function openAbout() {
    navigate({ about: true })
  }

  function openAdmin() {
    navigate({ admin: true })
  }

  function openPay() {
    navigate({ pay: true })
  }

  // 解锁成功：原本因清单被拦下的，把当前页换成清单；否则退一级
  function buy(method = 'repo') {
    markPurchased(method)
    setLicense(licenseStatus())
    if (lockedId) {
      const stack = stackRef.current
      stackRef.current = [...stack.slice(0, -1), { scenario: lockedId }]
      if (useHistory) window.history.replaceState({ scenario: lockedId }, '')
      applyRoute({ scenario: lockedId })
    } else {
      goBack()
    }
  }

  const scenario = openId ? getScenario(openId) : null

  if (payOpen) {
    return <Pay onBack={goBack} onPaid={buy} />
  }

  if (scenario) {
    return (
      <ItemList
        key={scenario.id}
        scenario={scenario}
        lists={db.lists[scenario.id] || {}}
        onBack={goBack}
        onAdd={(groupId, name) => addItem(scenario.id, groupId, name)}
        onRemove={(groupId, name) => removeItem(scenario.id, groupId, name)}
      />
    )
  }

  if (adminOpen && license.admin) {
    return <Admin onBack={goBack} />
  }

  if (aboutOpen) {
    return (
      <About
        license={license}
        onBack={goBack}
        onPurchase={openPay}
        onAdmin={openAdmin}
      />
    )
  }

  if (lockedId) {
    return (
      <Lock
        scenarioName={getScenario(lockedId)?.name || '清单'}
        onBack={goBack}
        onPurchase={openPay}
      />
    )
  }

  return <Home lists={db.lists} onOpen={openScenario} onAbout={openAbout} />
}
