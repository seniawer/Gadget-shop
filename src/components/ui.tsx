import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { tg } from '../lib/telegram'
import { useStore } from '../lib/store'
import { Icon } from './Icon'

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

// Главное действие экрана: нативная MainButton в Telegram, своя кнопка внизу в браузере.
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
      btn.hideProgress()
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
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl bg-bg2/85 px-4 pt-3 pb-[calc(12px+var(--safe-bottom))] backdrop-blur-xl">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="pressable h-[52px] w-full rounded-2xl bg-accent text-[17px] font-semibold text-accent-text disabled:opacity-50"
      >
        {loading ? <Spinner /> : text}
      </button>
    </div>
  )
}

/** Отступ снизу под MainButton (в браузере она перекрывает контент). */
export const mainButtonSpace = tg.isTelegram ? 'pb-8' : 'pb-28'

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent align-middle ${className}`}
      aria-label="Загрузка"
    />
  )
}

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const canGoBack = useStore((s) => s.stack.length > 1)
  const back = useStore((s) => s.back)
  return (
    <header className="sticky top-0 z-20 bg-bg2/85 px-4 pt-[calc(10px+var(--safe-top))] pb-2.5 backdrop-blur-xl">
      <div className="flex min-h-9 items-center gap-2">
        {canGoBack && !tg.isTelegram && (
          <button onClick={back} className="-ml-1.5 flex items-center text-link" aria-label="Назад">
            <Icon name="chevron" className="rotate-180" size={26} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22px] leading-tight font-bold tracking-tight">{title}</h1>
          {subtitle && <div className="truncate text-[13px] text-hint">{subtitle}</div>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function IconButton({ label, onClick, children, badge }: { label: string; onClick: () => void; children: ReactNode; badge?: number }) {
  return (
    <button
      onClick={() => {
        tg.haptic.tap()
        onClick()
      }}
      aria-label={label}
      className="pressable relative grid h-10 w-10 place-items-center rounded-full bg-section text-text shadow-[var(--card-shadow)]"
    >
      {children}
      {!!badge && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full bg-accent px-1 text-center text-[11px] leading-[18px] font-bold text-accent-text">
          {badge}
        </span>
      )}
    </button>
  )
}

export function Section({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`mt-6 ${className}`}>
      {title && (
        <div className="mb-2.5 flex items-baseline justify-between px-4">
          <h2 className="text-[20px] font-bold tracking-tight">{title}</h2>
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
      className={`pressable shrink-0 rounded-full px-4 py-2 text-[15px] font-medium whitespace-nowrap transition-colors ${
        active ? 'bg-text text-bg' : 'bg-section text-text shadow-[var(--card-shadow)]'
      }`}
    >
      {children}
    </button>
  )
}

/** Горизонтальная лента чипсов. Скролл только внутри ленты, страница не уезжает вбок. */
export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="no-scrollbar -my-1 flex gap-2 overflow-x-auto px-4 py-1">{children}</div>
}

export function Group({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card mx-4 overflow-hidden ${className}`}>{children}</div>
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  multiline,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  inputMode?: 'numeric' | 'tel' | 'text'
  placeholder?: string
  multiline?: boolean
  required?: boolean
}) {
  const cls = 'w-full bg-transparent py-1 text-[17px] outline-none placeholder:text-hint/70'
  return (
    <label className="block border-b border-sep px-4 py-2.5 last:border-0">
      <span className="text-[13px] text-hint">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {multiline ? (
        <textarea rows={3} className={`${cls} resize-none`} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          className={cls}
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  )
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 border-b border-sep px-4 py-3 last:border-0">
      <span className="flex-1">
        <span className="block text-[17px]">{label}</span>
        {hint && <span className="block text-[13px] text-hint">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          tg.haptic.select()
          onChange(e.target.checked)
        }}
        className="peer sr-only"
      />
      <span className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-fill transition-colors peer-checked:bg-[#34c759] after:absolute after:top-[2px] after:left-[2px] after:h-[27px] after:w-[27px] after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-xl bg-fill p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => {
            tg.haptic.select()
            onChange(o.value)
          }}
          className={`flex-1 rounded-[10px] py-1.5 text-[15px] font-medium transition ${o.value === value ? 'bg-section shadow-sm' : 'text-hint'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  const step = (d: number) => {
    tg.haptic.select()
    onChange(Math.max(min, value + d))
  }
  return (
    <div className="flex items-center rounded-full bg-fill" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={() => step(-1)} disabled={value <= min} className="grid h-10 w-10 place-items-center disabled:opacity-30" aria-label="Меньше">
        <Icon name="minus" size={18} />
      </button>
      <input
        value={value}
        inputMode="numeric"
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ''))
          onChange(Number.isFinite(n) ? Math.max(min, n) : min)
        }}
        onFocus={(e) => e.target.select()}
        className="w-10 bg-transparent text-center text-[16px] font-semibold tabular-nums outline-none"
        aria-label="Количество"
      />
      <button type="button" onClick={() => step(1)} className="grid h-10 w-10 place-items-center" aria-label="Больше">
        <Icon name="plus" size={18} />
      </button>
    </div>
  )
}

export function Empty({ emoji, title, text, action }: { emoji: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 pt-16 pb-8 text-center">
      <div className="text-[56px] leading-none">{emoji}</div>
      <div className="mt-4 text-[20px] font-bold tracking-tight">{title}</div>
      <div className="mt-1.5 text-[15px] text-hint">{text}</div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function PillButton({ onClick, children, variant = 'accent' }: { onClick: () => void; children: ReactNode; variant?: 'accent' | 'plain' }) {
  return (
    <button
      onClick={() => {
        tg.haptic.tap()
        onClick()
      }}
      className={`pressable rounded-full px-6 py-3 text-[16px] font-semibold ${variant === 'accent' ? 'bg-accent text-accent-text' : 'bg-fill text-link'}`}
    >
      {children}
    </button>
  )
}

export function ToastHost() {
  const toast = useStore((s) => s.toast)
  const ref = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!toast) return
    if (toast.kind === 'success') tg.haptic.success()
    else tg.haptic.error()
    window.clearTimeout(ref.current)
    ref.current = window.setTimeout(() => useStore.setState({ toast: undefined }), 2600)
  }, [toast])
  if (!toast) return null
  return (
    <div
      key={toast.id}
      role="status"
      className="toast-in fixed top-[calc(12px+var(--safe-top))] left-1/2 z-50 flex w-max max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#1d1d1f]/90 px-4 py-3 text-[15px] font-medium text-white shadow-lg backdrop-blur"
    >
      <span className={toast.kind === 'success' ? 'text-[#34c759]' : 'text-[#ff453a]'}>
        <Icon name={toast.kind === 'success' ? 'check' : 'close'} size={18} stroke={2.4} />
      </span>
      {toast.text}
    </div>
  )
}
