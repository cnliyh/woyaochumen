import { useEffect, useState } from 'react'
import { SCENARIOS, scenarioCount } from '../data/scenarios.js'
import { todayParts } from '../lib/format.js'
import { describeWeather, fetchCurrentWeather, readWeatherCache, requestPosition, writeWeatherCache } from '../lib/weather.js'
import { APP_DOWNLOAD_URL } from '../lib/config.js'
import Icon from '../components/Icons.jsx'

export default function Home({ lists, onOpen, onAbout }) {
  const [weather, setWeather] = useState(readWeatherCache)
  const [loading, setLoading] = useState(false)
  const { date, week } = todayParts()

  async function loadWeather() {
    setLoading(true)
    try {
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
    loadWeather()
  }, [])

  const info = weather ? describeWeather(weather.code) : null

  return (
    <div className="screen">
      <section className="hero">
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

      <div className="section-label">场景清单</div>

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
