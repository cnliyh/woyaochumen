import { useEffect, useRef, useState } from 'react'
import { getScenario } from './data/scenarios.js'
import { loadDb, saveDb } from './lib/storage.js'
import { licenseStatus, markPurchased, verifyFromRepo, isAdmin } from './lib/entitlement.js'
import Home from './screens/Home.jsx'
import ItemList from './screens/ItemList.jsx'
import About from './screens/About.jsx'
import Admin from './screens/Admin.jsx'
import Lock from './screens/Lock.jsx'
import Pay from './screens/Pay.jsx'

export default function App() {
  const [db, setDb] = useState(loadDb)
  const [license, setLicense] = useState(licenseStatus)
  const [openId, setOpenId] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [lockedId, setLockedId] = useState(null)
  const [payOpen, setPayOpen] = useState(false)
  const routeRef = useRef({})

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
    routeRef.current = next
    setOpenId(next.scenario || null)
    setAboutOpen(Boolean(next.about))
    setAdminOpen(Boolean(next.admin))
    setLockedId(next.locked || null)
    setPayOpen(Boolean(next.pay))
  }

  // 回主界面：直接清空当前路由，不依赖历史栈层级
  function goHome() {
    if (window.history.state && typeof window.history.replaceState === 'function') {
      window.history.replaceState({}, '')
    }
    applyRoute({})
  }

  function navigate(route) {
    window.history.pushState(route, '')
    applyRoute(route)
  }

  // 所有页面都走浏览器历史，网页版的浏览器返回键也能正确回退
  useEffect(() => {
    function onPop(event) {
      applyRoute(event.state || {})
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // 安卓硬件返回键：子页面一次返回就回主界面，主界面再按才退出
  useEffect(() => {
    if (!window.history.state) window.history.replaceState({}, '')
    window.__onBackPressed = () => {
      const route = routeRef.current || {}
      const inSubpage = Boolean(
        route.scenario || route.about || route.admin || route.locked || route.pay
      )
      if (!inSubpage) return 'exit'
      window.history.replaceState({}, '')
      applyRoute({})
      return 'handled'
    }
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

  // 解锁成功：原本因清单被拦下的，直接进清单；否则回主界面
  function buy(method = 'repo') {
    markPurchased(method)
    setLicense(licenseStatus())
    if (lockedId) {
      const next = { scenario: lockedId }
      window.history.replaceState(next, '')
      applyRoute(next)
    } else {
      goHome()
    }
  }

  const scenario = openId ? getScenario(openId) : null

  if (payOpen) {
    return <Pay onBack={goHome} onPaid={buy} />
  }

  if (scenario) {
    return (
      <ItemList
        key={scenario.id}
        scenario={scenario}
        lists={db.lists[scenario.id] || {}}
        onBack={goHome}
        onAdd={(groupId, name) => addItem(scenario.id, groupId, name)}
        onRemove={(groupId, name) => removeItem(scenario.id, groupId, name)}
      />
    )
  }

  if (adminOpen && license.admin) {
    return <Admin onBack={goHome} />
  }

  if (aboutOpen) {
    return (
      <About
        license={license}
        onBack={goHome}
        onPurchase={openPay}
        onAdmin={openAdmin}
      />
    )
  }

  if (lockedId) {
    return (
      <Lock
        scenarioName={getScenario(lockedId)?.name || '清单'}
        onBack={goHome}
        onPurchase={openPay}
      />
    )
  }

  return <Home lists={db.lists} onOpen={openScenario} onAbout={openAbout} />
}
