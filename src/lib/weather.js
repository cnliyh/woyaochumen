const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const CACHE_KEY = 'woyaochumen.weather.v1'
const CACHE_TTL = 30 * 60 * 1000

const WEATHER_CODES = [
  { codes: [0, 1], label: '晴', kind: 'sun' },
  { codes: [2], label: '多云', kind: 'cloud' },
  { codes: [3], label: '阴', kind: 'cloud' },
  { codes: [45, 48], label: '有雾', kind: 'fog' },
  { codes: [51, 53, 55, 56, 57], label: '毛毛雨', kind: 'rain' },
  { codes: [61, 63, 65, 66, 67], label: '下雨', kind: 'rain' },
  { codes: [71, 73, 75, 77], label: '下雪', kind: 'snow' },
  { codes: [80, 81, 82], label: '阵雨', kind: 'rain' },
  { codes: [85, 86], label: '阵雪', kind: 'snow' },
  { codes: [95, 96, 99], label: '雷雨', kind: 'storm' }
]

export function describeWeather(code) {
  const hit = WEATHER_CODES.find((item) => item.codes.includes(code))
  return hit || { label: '天气', kind: 'cloud' }
}

export function readWeatherCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.temp !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function writeWeatherCache(weather) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...weather, savedAt: Date.now() }))
  } catch {
    // 忽略
  }
}

export function requestPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('设备不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () => reject(new Error('未获得定位权限')),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: CACHE_TTL }
    )
  })
}

export async function fetchCurrentWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,weather_code',
    timezone: 'auto'
  })
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`)
  if (!res.ok) throw new Error('天气服务不可用')
  const data = await res.json()
  const current = data?.current
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('没有取到天气')
  }
  return { temp: current.temperature_2m, code: current.weather_code ?? 2 }
}
