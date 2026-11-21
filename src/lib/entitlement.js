import { TRIAL_DAYS, LICENSE_LIST_URLS, ADMIN_CODES } from './config.js'

const KEY = 'woyaochumen.license.v1'
const DEVICE_KEY = 'woyaochumen.device.v1'
const DAY = 24 * 60 * 60 * 1000
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

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
    return { app: false, admin: false, purchased: true, daysLeft: null, locked: false }
  }
  const license = ensureLicense()
  const used = Math.floor((Date.now() - new Date(license.start).getTime()) / DAY)
  const daysLeft = Math.max(0, TRIAL_DAYS - used)
  return {
    app: true,
    admin: isAdmin(),
    purchased: license.purchased,
    daysLeft,
    locked: !license.purchased && daysLeft <= 0
  }
}

// 扫码支付的本地记录。真正校验收款需要商户号 + 服务端回调，此处先按诚信解锁。
export function markPurchased(method = 'qr') {
  write({ ...ensureLicense(), purchased: true, purchasedAt: new Date().toISOString(), method })
}

// 作者设备：只有白名单里的硬件才显示管理员入口
export function isAdmin() {
  if (!isAppShell()) return false
  return ADMIN_CODES.includes(deviceCode())
}

// 本机设备码：首次生成后固定，用于在仓库名单里登记
export function deviceCode() {
  let saved = localStorage.getItem(DEVICE_KEY)
  if (!saved || !/^[0-9A-Z]{8}$/.test(saved)) {
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    saved = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('')
    localStorage.setItem(DEVICE_KEY, saved)
  }
  return `${saved.slice(0, 4)}-${saved.slice(4)}`
}

function compact(code) {
  return String(code || '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
}

// 从仓库名单里核验本机是否已登记授权；true=已登记，false=未登记，异常=网络问题
export async function verifyFromRepo() {
  const target = compact(deviceCode())
  let lastError = null
  for (const url of LICENSE_LIST_URLS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch(`${url}?t=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal
      })
      if (!response.ok) continue
      const data = await response.json()
      const codes = Array.isArray(data.codes) ? data.codes.map(compact) : []
      return codes.includes(target)
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError || new Error('无法连接授权名单')
}
