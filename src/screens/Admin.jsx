import { useCallback, useEffect, useState } from 'react'
import Icon from '../components/Icons.jsx'
import { GITHUB_REPO } from '../lib/config.js'
import { addLicense, getToken, loadLicenses, normalizeCode, saveToken } from '../lib/admin.js'

export default function Admin({ onBack }) {
  const [token, setToken] = useState(getToken())
  const [ready, setReady] = useState(Boolean(getToken()))
  const [codes, setCodes] = useState([])
  const [updated, setUpdated] = useState('')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState({ kind: 'idle', text: '' })

  const refresh = useCallback(async () => {
    if (!getToken()) return
    setBusy(true)
    try {
      const data = await loadLicenses()
      setCodes(data.codes)
      setUpdated(data.updated)
      setStatus({ kind: 'idle', text: '' })
    } catch (error) {
      setStatus({ kind: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (ready) refresh()
  }, [ready, refresh])

  function save() {
    const value = token.trim()
    if (!value) {
      setStatus({ kind: 'error', text: '请先填入访问令牌' })
      return
    }
    saveToken(value)
    setReady(true)
    setStatus({ kind: 'idle', text: '' })
  }

  async function approve() {
    const code = normalizeCode(input)
    if (!code) {
      setStatus({ kind: 'error', text: '设备码应为 8 位，例如 6ZJV-M5NZ' })
      return
    }
    setBusy(true)
    try {
      const result = await addLicense(code)
      setCodes(result.codes)
      setInput('')
      setUpdated(new Date().toISOString().slice(0, 10))
      setStatus({
        kind: 'ok',
        text: result.added
          ? `已放行 ${code}，客户在 App 里点「验证解锁」即可`
          : `${code} 已在名单里，无需重复添加`
      })
    } catch (error) {
      setStatus({ kind: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen admin-screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="返回">
          <Icon name="back" size={20} />
        </button>
        <div className="topbar-title">管理员</div>
      </header>

      <section className="panel">
        <h2 className="panel-title">访问令牌</h2>
        {ready ? (
          <div className="admin-token-row">
            <span className="admin-token-ok">已设置</span>
            <button
              className="device-copy"
              onClick={() => {
                saveToken('')
                setToken('')
                setReady(false)
                setCodes([])
                setStatus({ kind: 'idle', text: '' })
              }}
            >
              清除
            </button>
          </div>
        ) : (
          <>
            <input
              className="admin-input"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="粘贴 GitHub 细粒度令牌"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="link-btn admin-save" onClick={save}>
              保存令牌
            </button>
          </>
        )}
        <p className="fee-note">
          令牌只需 {GITHUB_REPO} 仓库的 Contents 读写权限，保存在本机，不会上传。创建地址：
          github.com/settings/personal-access-tokens/new
        </p>
      </section>

      {ready && (
        <>
          <section className="panel">
            <h2 className="panel-title">放行新设备</h2>
            <input
              className="admin-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="输入客户设备码，如 6ZJV-M5NZ"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="buy-btn" onClick={approve} disabled={busy}>
              {busy ? '正在提交…' : '确认放行'}
            </button>
            {status.text && (
              <p className={`hint ${status.kind === 'error' ? 'warn' : ''}`}>{status.text}</p>
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title">已授权设备（{codes.length}）</h2>
            {codes.length === 0 ? (
              <p className="panel-text">名单还是空的。</p>
            ) : (
              <ul className="admin-list">
                {codes.map((code) => (
                  <li key={code} className="admin-code">
                    <span>{normalizeCode(code) || code}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="admin-foot">
              {updated && <span>更新于 {updated}</span>}
              <button className="device-copy" onClick={refresh} disabled={busy}>
                刷新
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
