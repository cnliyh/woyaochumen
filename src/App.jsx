import { useEffect, useState } from 'react'
import { getScenario } from './data/scenarios.js'
import { loadDb, saveDb } from './lib/storage.js'
import { licenseStatus, markPurchased } from './lib/entitlement.js'
import Home from './screens/Home.jsx'
import ItemList from './screens/ItemList.jsx'
import About from './screens/About.jsx'
import Lock from './screens/Lock.jsx'

export default function App() {
  const [db, setDb] = useState(loadDb)
  const [license, setLicense] = useState(licenseStatus)
  const [openId, setOpenId] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [lockedId, setLockedId] = useState(null)

  useEffect(() => {
    saveDb(db)
  }, [db])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [openId, aboutOpen, lockedId])

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
    if (license.locked) setLockedId(id)
    else setOpenId(id)
  }

  function buy() {
    markPurchased()
    setLicense(licenseStatus())
    if (lockedId) {
      setOpenId(lockedId)
      setLockedId(null)
    }
  }

  const scenario = openId ? getScenario(openId) : null

  if (scenario) {
    return (
      <ItemList
        key={scenario.id}
        scenario={scenario}
        lists={db.lists[scenario.id] || {}}
        onBack={() => setOpenId(null)}
        onAdd={(groupId, name) => addItem(scenario.id, groupId, name)}
        onRemove={(groupId, name) => removeItem(scenario.id, groupId, name)}
      />
    )
  }

  if (aboutOpen) {
    return (
      <About
        license={license}
        onBack={() => setAboutOpen(false)}
        onPurchase={() => {
          buy()
          setAboutOpen(false)
        }}
      />
    )
  }

  if (lockedId) {
    return (
      <Lock
        scenarioName={getScenario(lockedId)?.name || '清单'}
        onBack={() => setLockedId(null)}
        onPurchase={buy}
      />
    )
  }

  return <Home lists={db.lists} onOpen={openScenario} onAbout={() => setAboutOpen(true)} />
}
