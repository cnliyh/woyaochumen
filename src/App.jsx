import { useEffect, useState } from 'react'
import { getScenario } from './data/scenarios.js'
import { loadDb, saveDb } from './lib/storage.js'
import { licenseStatus, markPurchased, verifyFromRepo } from './lib/entitlement.js'
import Home from './screens/Home.jsx'
import ItemList from './screens/ItemList.jsx'
import About from './screens/About.jsx'
import Lock from './screens/Lock.jsx'
import Pay from './screens/Pay.jsx'

export default function App() {
  const [db, setDb] = useState(loadDb)
  const [license, setLicense] = useState(licenseStatus)
  const [openId, setOpenId] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [lockedId, setLockedId] = useState(null)
  const [payOpen, setPayOpen] = useState(false)

  useEffect(() => {
    saveDb(db)
  }, [db])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [openId, aboutOpen, lockedId, payOpen])

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

  // 所有页面都走浏览器历史，安卓返回键 / 浏览器返回键都能正确回退
  useEffect(() => {
    function onPop(event) {
      applyRoute(event.state || {})
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function applyRoute(route) {
    setOpenId(route.scenario || null)
    setAboutOpen(Boolean(route.about))
    setLockedId(route.locked || null)
    setPayOpen(Boolean(route.pay))
  }

  function navigate(route) {
    window.history.pushState(route, '')
    applyRoute(route)
  }

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

  function openPay() {
    navigate({ pay: true })
  }

  function buy(method = 'repo') {
    markPurchased(method)
    setLicense(licenseStatus())
    if (lockedId) {
      const next = { scenario: lockedId }
      window.history.replaceState(next, '')
      applyRoute(next)
    } else {
      window.history.back()
    }
  }

  const scenario = openId ? getScenario(openId) : null

  if (payOpen) {
    return <Pay onBack={() => window.history.back()} onPaid={buy} />
  }

  if (scenario) {
    return (
      <ItemList
        key={scenario.id}
        scenario={scenario}
        lists={db.lists[scenario.id] || {}}
        onBack={() => window.history.back()}
        onAdd={(groupId, name) => addItem(scenario.id, groupId, name)}
        onRemove={(groupId, name) => removeItem(scenario.id, groupId, name)}
      />
    )
  }

  if (aboutOpen) {
    return <About license={license} onBack={() => window.history.back()} onPurchase={openPay} />
  }

  if (lockedId) {
    return (
      <Lock
        scenarioName={getScenario(lockedId)?.name || '清单'}
        onBack={() => window.history.back()}
        onPurchase={openPay}
      />
    )
  }

  return <Home lists={db.lists} onOpen={openScenario} onAbout={openAbout} />
}
