import { useState } from 'react'
import Icon from '../components/Icons.jsx'
import { CONTACT, PRICE } from '../lib/config.js'
import { deviceCode, verifyFromRepo } from '../lib/entitlement.js'

export default function Pay({ onBack, onPaid }) {
  const code = deviceCode()
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('idle')

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  async function verify() {
    setStatus('checking')
    try {
      const ok = await verifyFromRepo()
      if (ok) {
        onPaid('repo')
        return
      }
      setStatus('pending')
    } catch {
      setStatus('error')
    }
  }

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
        <img className="pay-qr" src="./pay-qr.png" alt="支付宝收款二维码" />
        <p className="pay-qr-tip">支付宝扫码支付（暂不支持微信）</p>
      </section>

      <ol className="pay-steps">
        <li>用支付宝扫上面的码支付 {PRICE} 元</li>
        <li>复制下方设备码，发给作者</li>
        <li>作者确认到账并登记后，点「验证解锁」</li>
      </ol>

      <section className="device-card">
        <div className="device-label">本机设备码</div>
        <div className="device-row">
          <span className="device-code">{code}</span>
          <button className="device-copy" onClick={copyCode}>
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <p className="device-tip">
          {CONTACT ? `付款后加微信 ${CONTACT}，把设备码发我` : '付款后把设备码发给作者，收到确认后再验证'}
        </p>
      </section>

      <button className="buy-btn" onClick={verify} disabled={status === 'checking'}>
        {status === 'checking' ? '正在核验…' : '我已完成支付，验证解锁'}
      </button>

      {status === 'pending' && (
        <p className="hint warn">还没查到这台设备的授权。确认已付款并把设备码发给作者后再试。</p>
      )}
      {status === 'error' && (
        <p className="hint warn">网络不通，暂时无法核验。稍后重试，或先连上网络。</p>
      )}

      <p className="hint">解锁记录保存在本机 · 换设备需重新登记</p>
    </div>
  )
}
