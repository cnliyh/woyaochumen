import { useEffect, useState } from 'react'
import { SCENARIOS, scenarioCount } from '../data/scenarios.js'
import { todayParts } from '../lib/format.js'
import { describeWeather, fetchCurrentWeather, readWeatherCache, requestPosition, writeWeatherCache } from '../lib/weather.js'
import { APP_DOWNLOAD_URL } from '../lib/config.js'
import Icon from '../components/Icons.jsx'

const AUTO_REFRESH_MS = 6 * 60 * 60 * 1000
const ASK_KEY = 'woyaochumen.geoAsk.v1'

export default function Home({ lists, onOpen, onAbout }) {
  const [weather, setWeather] = useState(readWeatherCache)
  const [loading, setLoading] = useState(false)
  const { date, week } = todayParts()

  async function loadWeather() {
    setLoading(true)
    try {
      localStorage.setItem(ASK_KEY, String(Date.now()))
      const position = await requestPosition()
      const next = await fetchCurrentWeather(position.latitude, position.longitude)
      setWeather(next)
      writeWeatherCache(next)
    } catch {
      // 没有定位权限或网络时保留已有天气
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const now = Date.now()
    const lastAsk = Number(localStorage.getItem(ASK_KEY) || 0)
    const savedAt = weather?.savedAt || 0
    if (now - savedAt <= AUTO_REFRESH_MS) return
    if (now - lastAsk < 24 * 60 * 60 * 1000) return
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((state) => {
          if (state.state !== 'denied') loadWeather()
        })
        .catch(() => loadWeather())
    } else {
      loadWeather()
    }
  }, [])

  const info = weather ? describeWeather(weather.code) : null
  const hour = new Date().getHours()
  const isNight = weather?.isDay === undefined ? hour < 6 || hour >= 18 : !weather.isDay

  return (
    <div className="screen">
      <section className="hero" data-weather={info ? info.kind : 'none'} data-time={isNight ? 'night' : 'day'}>
        <div className="hero-brand">
          <div className="hero-name">我要出门</div>
          <div className="hero-sub">出门前，别忘记带东西</div>
        </div>

        <div className="hero-foot">
          <span className="hero-date">
            {date} · {week}
          </span>
          <button className="hero-weather" onClick={loadWeather} aria-label="刷新天气">
            {weather && info ? (
              <>
                <Icon name={info.kind} size={15} />
                <span>
                  {info.label} {Math.round(weather.temp)}°
                </span>
              </>
            ) : (
              <span>{loading ? '定位中…' : '获取天气'}</span>
            )}
          </button>
        </div>
      </section>

      <div className="scenario-grid">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            className="scenario-card"
            data-tone={scenario.tone}
            onClick={() => onOpen(scenario.id)}
          >
            <span className="sc-icon">
              <Icon name={scenario.icon} size={24} />
            </span>
            <span className="sc-name">{scenario.name}</span>
            <span className="sc-count">{scenarioCount(scenario, lists)} 件</span>
          </button>
        ))}
      </div>

      <footer className="home-foot">
        {APP_DOWNLOAD_URL ? (
          <a className="home-link" href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer">
            下载 App
          </a>
        ) : (
          <button className="home-link" onClick={onAbout}>
            下载 App
          </button>
        )}
        <span className="home-dot">·</span>
        <button className="home-link" onClick={onAbout}>
          关于
        </button>
      </footer>
    </div>
  )
}
