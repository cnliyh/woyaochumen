import { SCENARIOS } from '../data/scenarios.js'

const KEY = 'woyaochumen.v2'

function defaults() {
  const lists = {}
  SCENARIOS.forEach((scenario) => {
    lists[scenario.id] = {}
    scenario.groups.forEach((group) => {
      lists[scenario.id][group.id] = [...group.items]
    })
  })
  return { version: 3, lists }
}

function migrateFromArray(scenario, saved) {
  const result = {}
  scenario.groups.forEach((group) => {
    result[group.id] = []
  })
  const fallbackId = scenario.groups[scenario.groups.length - 1].id
  saved.forEach((name) => {
    if (typeof name !== 'string' || !name.trim()) return
    const hit = scenario.groups.find((group) => group.items.includes(name))
    const targetId = hit ? hit.id : fallbackId
    if (!result[targetId].includes(name)) result[targetId].push(name)
  })
  return result
}

export function loadDb() {
  const base = defaults()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const data = JSON.parse(raw)

    SCENARIOS.forEach((scenario) => {
      const saved = data?.lists?.[scenario.id]
      if (Array.isArray(saved)) {
        base.lists[scenario.id] = migrateFromArray(scenario, saved)
        return
      }
      if (!saved || typeof saved !== 'object') return
      scenario.groups.forEach((group) => {
        const items = saved[group.id]
        if (Array.isArray(items)) {
          base.lists[scenario.id][group.id] = items.filter(
            (item) => typeof item === 'string' && item.trim()
          )
        }
      })
    })

    return base
  } catch {
    return base
  }
}

export function saveDb(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // 隐私模式或空间不足时忽略
  }
}
