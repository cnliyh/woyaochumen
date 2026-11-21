import { useState } from 'react'
import Icon from '../components/Icons.jsx'
import { PRICE } from '../lib/config.js'

export default function Pay({ onBack, onPaid }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="screen pay-screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="返回">
          <Icon name="back" size={20} />
        </button>
        <div className="topbar-title">解锁全部清单</div>
      </header>

      <section className="pay-head">
        <div className="pay-price">¥{PRICE}</div>
        <div className="pay-sub">一次买断 · 永久使用</div>
      </section>

      <section className="pay-qr-card">
        <img className="pay-qr" src="./pay-qr.png" alt="收款二维码" />
        <p className="pay-qr-tip">微信 / 支付宝 扫码支付</p>
      </section>

      <ol className="pay-steps">
        <li>打开微信或支付宝的「扫一扫」</li>
        <li>支付 {PRICE} 元</li>
        <li>支付完成后回到这里确认</li>
      </ol>

      <button className="buy-btn" onClick={() => setConfirming(true)}>
        我已完成支付
      </button>
      <p className="hint">解锁记录保存在本机 · 换设备需重新解锁</p>

      {confirming && (
        <div className="sheet-backdrop" onClick={() => setConfirming(false)}>
          <div className="sheet" onClick={(event) => event.stopPropagation()}>
            <p className="sheet-title">确认已完成 {PRICE} 元支付？</p>
            <button className="sheet-primary" onClick={onPaid}>
              已完成支付，解锁
            </button>
            <button className="sheet-cancel" onClick={() => setConfirming(false)}>
              还没付
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
