import { TRIAL_DAYS } from './config.js'

const KEY = 'woyaochumen.license.v1'
const DAY = 24 * 60 * 60 * 1000

// 网页版完全免费；只有装在 App 壳里才走试用与购买
export function isAppShell() {
  if (typeof window === 'undefined') return false
  if (window.__WOYAOCHUMEN_APP__ === true) return true
  if (window.Capacitor?.isNativePlatform?.()) return true
  return new URLSearchParams(window.location.search).get('app') === '1'
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

function write(license) {
  localStorage.setItem(KEY, JSON.stringify(license))
}

function ensureLicense() {
  const saved = read()
  if (saved) return saved
  const fresh = { start: new Date().toISOString(), purchased: false }
  write(fresh)
  return fresh
}

export function licenseStatus() {
  if (!isAppShell()) {
    return { app: false, purchased: true, daysLeft: null, locked: false }
  }
  const license = ensureLicense()
  const used = Math.floor((Date.now() - new Date(license.start).getTime()) / DAY)
  const daysLeft = Math.max(0, TRIAL_DAYS - used)
  return {
    app: true,
    purchased: license.purchased,
    daysLeft,
    locked: !license.purchased && daysLeft <= 0
  }
}

// 扫码支付的本地记录。真正校验收款需要商户号 + 服务端回调，此处先按诚信解锁。
export function markPurchased(method = 'qr') {
  write({ ...ensureLicense(), purchased: true, purchasedAt: new Date().toISOString(), method })
}
