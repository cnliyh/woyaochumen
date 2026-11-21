import { useState } from 'react'
import Icon from '../components/Icons.jsx'
import { PAY_URL, PRICE } from '../lib/config.js'
import { deviceCode, verifyFromRepo } from '../lib/entitlement.js'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }
}

export default function Pay({ onBack, onPaid }) {
  const code = deviceCode()
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('idle')

  async function copyCode() {
    const ok = await copyText(code)
    setCopied(ok)
    if (ok) setTimeout(() => setCopied(false), 1600)
  }

  // 先复制设备码，再跳到支付宝；客户把设备码粘贴到付款备注里
  async function payNow() {
    await copyText(code)
    setCopied(true)
    window.location.href = PAY_URL
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

      {PAY_URL && (
        <section className="pay-quick">
          <button className="pay-open" onClick={payNow}>
            打开支付宝付款 ¥{PRICE}
          </button>
          <p className="pay-quick-tip">
            点按钮会自动复制设备码，付款时粘贴到支付宝的「备注」里
          </p>
        </section>
      )}

      <section className="pay-qr-card">
        <img className="pay-qr" src="./pay-qr.png" alt="支付宝收款二维码" />
        <p className="pay-qr-tip">也可以扫码付款，记得先把设备码填进备注</p>
      </section>

      <ol className="pay-steps">
        <li>点上方按钮，设备码会自动复制</li>
        <li>在支付宝「备注」里粘贴设备码，付 {PRICE} 元</li>
        <li>作者按备注里的设备码放行后，点「验证解锁」</li>
      </ol>

      <section className="device-card">
        <div className="device-label">本机设备码（付款备注用）</div>
        <div className="device-row">
          <span className="device-code">{code}</span>
          <button className="device-copy" onClick={copyCode}>
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <p className="device-tip">
          扫码付款时，先复制这串码粘贴到支付宝备注里。作者只凭备注里的设备码放行。
        </p>
      </section>

      <button className="buy-btn" onClick={verify} disabled={status === 'checking'}>
        {status === 'checking' ? '正在核验…' : '我已完成支付，验证解锁'}
      </button>

      {status === 'pending' && (
        <p className="hint warn">还没查到这台设备的授权。确认付款备注里填了设备码，并等作者放行后再试。</p>
      )}
      {status === 'error' && (
        <p className="hint warn">网络不通，暂时无法核验。稍后重试，或先连上网络。</p>
      )}

      <p className="hint">解锁记录保存在本机 · 换设备需重新登记</p>
    </div>
  )
}
