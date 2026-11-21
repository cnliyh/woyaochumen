import Icon from '../components/Icons.jsx'
import { APP_DOWNLOAD_URL, APP_VERSION, PRICE, TRIAL_DAYS } from '../lib/config.js'

export default function About({ license, onBack, onPurchase }) {
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="返回">
          <Icon name="back" size={20} />
        </button>
        <div className="topbar-title">关于</div>
      </header>

      <section className="panel">
        <h1 className="about-name">我要出门</h1>
        <p className="about-tagline">出门前，别忘记带东西</p>
        <p className="about-version">版本 {APP_VERSION}</p>
      </section>

      <section className="panel">
        <h2 className="panel-title">费用</h2>
        <div className="fee-row">
          <span className="fee-label">网页版</span>
          <span className="fee-value is-free">完全免费</span>
        </div>
        <div className="fee-row">
          <span className="fee-label">App 版</span>
          <span className="fee-value">免费试用 {TRIAL_DAYS} 天</span>
        </div>
        <div className="fee-row">
          <span className="fee-label">试用结束</span>
          <span className="fee-value">{PRICE} 元一次买断</span>
        </div>
        <p className="fee-note">
          清单内容只保存在当前设备，不上传服务器。App 试用结束后未购买的，只能查看首页，打开清单需要先购买。
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">我的授权</h2>
        <div className="license-row">
          <span>{license.app ? 'App 版' : '网页版'}</span>
          {license.purchased ? (
            <span className="status-pill">{license.app ? '已购买' : '免费使用'}</span>
          ) : license.locked ? (
            <span className="status-pill is-locked">试用已结束</span>
          ) : (
            <span className="status-pill">试用中 · 剩余 {license.daysLeft} 天</span>
          )}
        </div>

        {license.app && !license.purchased && (
          <button className="buy-btn" onClick={onPurchase}>
            {PRICE} 元 · 一次买断
          </button>
        )}
        {!license.app && <p className="fee-note">网页版无需购买，收藏后随时打开即可。</p>}
      </section>

      <section className="panel">
        <h2 className="panel-title">下载</h2>
        {APP_DOWNLOAD_URL ? (
          <>
            <a className="link-btn" href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer">
              下载安卓 App（APK）
            </a>
            <div className="download-qr-card">
              <img className="download-qr" src="./download-qr.png" alt="下载 App 二维码" />
              <div className="download-qr-text">
                <strong>微信扫码下载安装</strong>
                <span>扫码后点右上角「在浏览器打开」再下载</span>
              </div>
            </div>
            <p className="fee-note">
              电脑或手机浏览器直接点上面按钮也能下载。安装包约 4MB，安装时如提示「未知来源」，允许安装即可。
            </p>
          </>
        ) : (
          <p className="panel-text">App 正在准备上架，暂时可以先用网页版，功能一样，完全免费。</p>
        )}
      </section>
    </div>
  )
}
