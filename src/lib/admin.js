import { GITHUB_REPO } from './config.js'

const TOKEN_KEY = 'woyaochumen.gh.v1'
const API = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/licenses.json`
const BRANCH = 'main'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function saveToken(value) {
  const token = String(value || '').trim()
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// 统一设备码格式：8 位字母数字，显示成 XXXX-XXXX
export function normalizeCode(input) {
  const raw = String(input || '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
  if (raw.length !== 8) return null
  return `${raw.slice(0, 4)}-${raw.slice(4)}`
}

function decodeBase64(content) {
  const clean = String(content || '').replace(/\s/g, '')
  const binary = atob(clean)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

async function request(url, options = {}) {
  const token = getToken()
  if (!token) throw new Error('还没设置访问令牌')
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  })
  if (!response.ok) {
    let message = `GitHub 请求失败（${response.status}）`
    if (response.status === 401) message = '令牌无效或已过期'
    if (response.status === 403) message = '令牌权限不足，需要 Contents 读写权限'
    if (response.status === 404) message = '找不到授权名单文件'
    if (response.status === 409) message = '名单刚被改过，请刷新后重试'
    throw new Error(message)
  }
  return response.json()
}

export async function loadLicenses() {
  const data = await request(`${API}?ref=${BRANCH}&t=${Date.now()}`)
  let json = { updated: '', codes: [] }
  try {
    json = JSON.parse(decodeBase64(data.content))
  } catch {
    // 文件内容异常时按空名单处理
  }
  return {
    codes: Array.isArray(json.codes) ? json.codes : [],
    sha: data.sha,
    updated: json.updated || ''
  }
}

async function writeLicenses(codes, sha) {
  const body = {
    message: `licenses: update ${new Date().toISOString()}`,
    content: encodeBase64(
      `${JSON.stringify({ updated: new Date().toISOString().slice(0, 10), codes }, null, 2)}\n`
    ),
    branch: BRANCH,
    sha
  }
  await request(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

// 放行一台设备：把设备码写进仓库名单，App 侧「验证解锁」即可通过
export async function addLicense(input) {
  const code = normalizeCode(input)
  if (!code) throw new Error('设备码应为 8 位，例如 6ZJV-M5NZ')
  const current = await loadLicenses()
  if (current.codes.some((item) => normalizeCode(item) === code)) {
    return { added: false, codes: current.codes }
  }
  const codes = [...current.codes, code].sort()
  await writeLicenses(codes, current.sha)
  return { added: true, codes }
}
