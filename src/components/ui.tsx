import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { tg } from '../lib/telegram'
import { useStore } from '../lib/store'

// Экраны из стека навигации остаются смонтированными (так сохраняются фильтры и прокрутка),
// но управлять нативными кнопками Telegram может только верхний.
export const ActiveScreen = createContext(true)

// Кнопка «Назад»: в Telegram используем нативную, в браузере рисуем свою в шапке.
export function useBackButton(enabled: boolean) {
  const back = useStore((s) => s.back)
  useEffect(() => {
    const btn = tg.backButton()
    if (!btn) return
    if (!enabled) {
      btn.hide()
      return
    }
    const onClick = () => {
      tg.haptic.tap()
      back()
    }
    btn.show()
    btn.onClick(onClick)
    return () => btn.offClick(onClick)
  }, [enabled, back])
}

type MainButtonProps = {
  text: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

// Главная кнопка внизу экрана: нативная MainButton в Telegram, своя кнопка в браузере.
export function MainButton({ text, onClick, disabled, loading }: MainButtonProps) {
  const active = useContext(ActiveScreen)
  const handler = useRef(onClick)
  handler.current = onClick

  useEffect(() => {
    const btn = tg.mainButton()
    if (!btn || !active) return
    const cb = () => handler.current()
    btn.onClick(cb)
    btn.show()
    return () => {
      btn.offClick(cb)
      btn.hide()
    }
  }, [active])

  useEffect(() => {
    const btn = tg.mainButton()
    if (!btn || !active) return
    btn.setText(text)
    if (disabled) btn.disable()
    else btn.enable()
    if (loading) btn.showProgress(false)
    else btn.hideProgress()
  }, [text, disabled, loading, active])

  if (tg.isTelegram || !active) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-bg/90 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="h-12 w-full rounded-xl bg-accent font-semibold text-accent-text transition active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Отправляем…' : text}
      </button>
    </div>
  )
}

export function Header({ title, right }: { title: string; right?: ReactNode }) {
  const canGoBack = useStore((s) => s.stack.length > 1)
  const back = useStore((s) => s.back)
  return (
    <div className="sticky top-0 z-20 flex h-12 items-center gap-2 bg-bg2/90 px-4 backdrop-blur">
      {canGoBack && !tg.isTelegram && (
        <button onClick={back} className="-ml-2 px-2 text-2xl leading-none text-link" aria-label="Назад">
          ‹
        </button>
      )}
      <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>
      {right}
    </div>
  )
}

export function Section({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-5">
      {title && (
        <div className="mb-2 flex items-baseline justify-between px-4">
          <h2 className="text-[17px] font-bold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={() => {
        tg.haptic.select()
        onClick()
      }}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active ? 'bg-accent text-accent-text' : 'bg-section text-text'
      }`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  multiline?: boolean
}) {
  const cls = 'w-full bg-transparent py-1 text-[16px] outline-none placeholder:text-hint'
  return (
    <label className="block border-b border-hint/15 px-4 py-2.5 last:border-0">
      <span className="text-xs text-hint">{label}</span>
      {multiline ? (
        <textarea rows={2} className={`${cls} resize-none`} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

export function Empty({ emoji, title, text, action }: { emoji: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 pt-20 text-center">
      <div className="text-6xl">{emoji}</div>
      <div className="mt-4 text-lg font-bold">{title}</div>
      <div className="mt-1 text-sm text-hint">{text}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
