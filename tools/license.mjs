import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../public/licenses.json', import.meta.url)

function compact(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
}

function format(value) {
  const code = compact(value)
  if (code.length !== 8) {
    console.error('设备码应为 8 位，例如 K7M2-9QXW')
    process.exit(1)
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

const [command, rawCode, flag] = process.argv.slice(2)

if (command !== 'add' || !rawCode) {
  console.log('用法: node tools/license.mjs add <设备码> [--push]')
  process.exit(1)
}

const code = format(rawCode)
const data = JSON.parse(readFileSync(FILE, 'utf8'))
const codes = new Set((data.codes || []).map(format))

if (codes.has(code)) {
  console.log(`已存在: ${code}`)
  process.exit(0)
}

codes.add(code)
const next = {
  updated: new Date().toISOString().slice(0, 10),
  codes: [...codes].sort()
}
writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`)
console.log(`已登记: ${code}（共 ${next.codes.length} 台）`)

if (flag === '--push') {
  execFileSync('git', ['add', 'public/licenses.json'], { stdio: 'inherit' })
  execFileSync('git', ['commit', '-m', `登记设备码 ${code}`], { stdio: 'inherit' })
  execFileSync('git', ['push'], { stdio: 'inherit' })
  console.log('已推送到 GitHub，1~2 分钟后用户在 App 里点「验证解锁」即可')
} else {
  console.log('下一步: git add public/licenses.json && git commit -m "登记设备码" && git push')
}
