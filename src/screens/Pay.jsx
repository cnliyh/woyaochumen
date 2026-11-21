import { useState } from 'react'
import Icon from '../components/Icons.jsx'
import { CONTACT, PAY_URL, PRICE } from '../lib/config.js'
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

  // 复制设备码后唤起微信，粘贴发给作者
  async function sendToAuthor() {
    await copyText(code)
    setCopied(true)
    window.location.href = 'weixin://'
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
          <a className="pay-open" href={PAY_URL} rel="noreferrer">
            打开支付宝付款 ¥{PRICE}
          </a>
          <p className="pay-quick-tip">点按钮打开支付宝收款页，不用扫码。微信暂不支持。</p>
        </section>
      )}

      <section className="pay-qr-card">
        <img className="pay-qr" src="./pay-qr.png" alt="支付宝收款二维码" />
        <p className="pay-qr-tip">也可以用支付宝扫这个码</p>
      </section>

      <ol className="pay-steps">
        <li>支付宝付 {PRICE} 元（点按钮或扫码都行）</li>
        <li>把下方设备码发给作者</li>
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
        <button className="device-send" onClick={sendToAuthor}>
          复制并打开微信发给作者
        </button>
        <p className="device-tip">
          {CONTACT ? `也可加微信 ${CONTACT} 发送设备码` : '到微信里粘贴设备码发给作者，作者放行后回来点验证'}
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
