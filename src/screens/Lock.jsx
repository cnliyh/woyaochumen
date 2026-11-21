import { PRICE, TRIAL_DAYS } from '../lib/config.js'

export default function Lock({ scenarioName, onBack, onPurchase }) {
  return (
    <div className="screen lock-screen">
      <section className="hero lock-hero">
        <div className="lock-title">试用已结束</div>
        <p className="lock-text">
          {TRIAL_DAYS} 天免费试用到期，扫码支付 {PRICE} 元一次买断，即可永久解锁「{scenarioName}」等全部清单。
        </p>
      </section>

      <button className="buy-btn" onClick={onPurchase}>
        {PRICE} 元 · 扫码解锁
      </button>
      <button className="text-btn" onClick={onBack}>
        返回首页
      </button>
      <p className="hint">网页版始终免费 · 收藏网址随时使用</p>
    </div>
  )
}
