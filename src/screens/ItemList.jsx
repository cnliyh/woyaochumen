import { useState } from 'react'
import Icon from '../components/Icons.jsx'
import useLongPress from '../hooks/useLongPress.js'

function ItemChip({ name, onAskRemove }) {
  const press = useLongPress(() => onAskRemove(name))

  return (
    <div
      className="item-chip"
      {...press}
      onPointerDown={(event) => {
        event.stopPropagation()
        press.onPointerDown(event)
      }}
    >
      {name}
    </div>
  )
}

function GroupBlock({ group, adding, draft, onDraft, onSubmit, onCancel, onStartAdd, onAskRemove }) {
  const press = useLongPress(onStartAdd)
  const { onPointerDown, ...rest } = press

  return (
    <section
      className="group"
      {...rest}
      onPointerDown={(event) => {
        event.stopPropagation()
        onPointerDown(event)
      }}
    >
      <div className="group-head">
        <span className="group-name">{group.name}</span>
        <span className="group-count">{group.items.length}</span>
      </div>

      {group.items.length === 0 && <p className="group-empty">长按空白添加</p>}

      <div className="item-grid">
        {group.items.map((name) => (
          <ItemChip key={name} name={name} onAskRemove={(value) => onAskRemove(group.id, value)} />
        ))}
      </div>

      {adding && (
        <div className="add-box" onPointerDown={(event) => event.stopPropagation()}>
          <input
            autoFocus
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit()
              if (event.key === 'Escape') onCancel()
            }}
            placeholder={`添加到「${group.name}」`}
          />
          <button onClick={onSubmit}>添加</button>
        </div>
      )}
    </section>
  )
}

export default function ItemList({ scenario, lists, onBack, onAdd, onRemove }) {
  const [adding, setAdding] = useState(null)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(null)

  const groups = scenario.groups.map((group) => ({
    ...group,
    items: lists[group.id] || []
  }))
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  const lastGroupId = scenario.groups[scenario.groups.length - 1].id

  function startAdd(groupId) {
    setDraft('')
    setAdding(groupId)
  }

  function submit() {
    const value = draft.trim()
    if (value && adding) onAdd(adding, value)
    setDraft('')
    setAdding(null)
  }

  const fillerPress = useLongPress(() => {
    if (!adding) startAdd(lastGroupId)
  })

  return (
    <div className="screen list-screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="返回">
          <Icon name="back" size={20} />
        </button>
        <span className="list-icon" data-tone={scenario.tone}>
          <Icon name={scenario.icon} size={18} />
        </span>
        <div className="topbar-title">{scenario.name}</div>
        <span className="count-badge">{total} 件</span>
      </header>

      {groups.map((group) => (
        <GroupBlock
          key={group.id}
          group={group}
          adding={adding === group.id}
          draft={draft}
          onDraft={setDraft}
          onSubmit={submit}
          onCancel={() => {
            setDraft('')
            setAdding(null)
          }}
          onStartAdd={() => startAdd(group.id)}
          onAskRemove={(groupId, name) => setPending({ groupId, name })}
        />
      ))}

      <div className="list-fill" {...fillerPress} />

      <p className="hint">长按物品删除 · 长按空白添加</p>

      {pending && (
        <div className="sheet-backdrop" onPointerDown={(event) => event.stopPropagation()}>
          <div className="sheet">
            <p className="sheet-title">删除「{pending.name}」？</p>
            <button
              className="sheet-danger"
              onClick={() => {
                onRemove(pending.groupId, pending.name)
                setPending(null)
              }}
            >
              删除
            </button>
            <button className="sheet-cancel" onClick={() => setPending(null)}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
