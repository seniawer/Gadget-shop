// Тонкая обёртка над window.Telegram.WebApp.
// Вне Telegram (обычный браузер) вызовы безопасно заменяются браузерными аналогами,
// поэтому мини-апп можно открыть и проверить по прямой ссылке.

type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'

type BottomButton = {
  setText(text: string): void
  show(): void
  hide(): void
  enable(): void
  disable(): void
  showProgress(leaveActive?: boolean): void
  hideProgress(): void
  onClick(cb: () => void): void
  offClick(cb: () => void): void
}

type WebApp = {
  initData: string
  initDataUnsafe: { user?: { id: number; first_name: string; last_name?: string; username?: string }; start_param?: string }
  colorScheme: 'light' | 'dark'
  platform: string
  version: string
  ready(): void
  expand(): void
  close(): void
  isVersionAtLeast(version: string): boolean
  setHeaderColor?(color: string): void
  setBackgroundColor?(color: string): void
  setBottomBarColor?(color: string): void
  disableVerticalSwipes?(): void
  openLink(url: string): void
  openTelegramLink(url: string): void
  showConfirm(message: string, cb: (ok: boolean) => void): void
  onEvent(event: 'themeChanged', cb: () => void): void
  MainButton: BottomButton
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void }
  HapticFeedback: {
    impactOccurred(style: HapticStyle): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp: WebApp }
  }
}

const webApp = (): WebApp | undefined => {
  const wa = window.Telegram?.WebApp
  // Скрипт Telegram загружается и в браузере, но platform там 'unknown'.
  return wa && wa.platform !== 'unknown' ? wa : undefined
}

const supports = (version: string) => webApp()?.isVersionAtLeast?.(version) ?? false

export const tg = {
  get isTelegram() {
    return Boolean(webApp())
  },
  get initData() {
    return webApp()?.initData ?? ''
  },
  get user() {
    return webApp()?.initDataUnsafe.user
  },
  /** Тёмная тема: из Telegram, а в браузере из настроек системы. */
  get isDark() {
    const wa = webApp()
    return wa ? wa.colorScheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  onThemeChange(cb: () => void) {
    const wa = webApp()
    if (wa) wa.onEvent('themeChanged', cb)
    else window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb)
  },
  init() {
    const wa = webApp()
    if (!wa) return
    wa.ready()
    wa.expand()
    if (supports('7.7')) wa.disableVerticalSwipes?.()
    if (supports('6.1')) {
      wa.setHeaderColor?.('secondary_bg_color')
      wa.setBackgroundColor?.('secondary_bg_color')
    }
    if (supports('7.10')) wa.setBottomBarColor?.('secondary_bg_color')
  },
  haptic: {
    tap: () => webApp()?.HapticFeedback.impactOccurred('light'),
    select: () => webApp()?.HapticFeedback.selectionChanged(),
    success: () => webApp()?.HapticFeedback.notificationOccurred('success'),
    error: () => webApp()?.HapticFeedback.notificationOccurred('error'),
    warning: () => webApp()?.HapticFeedback.notificationOccurred('warning'),
  },
  mainButton: () => webApp()?.MainButton,
  backButton: () => webApp()?.BackButton,
  /** Ссылки на Telegram (t.me) открываем внутри Telegram. */
  openTelegramLink(url: string) {
    const wa = webApp()
    if (wa) wa.openTelegramLink(url)
    else window.open(url, '_blank', 'noopener')
  },
  /** Внешние ссылки (карты, отзывы) открываем во встроенном браузере. */
  openLink(url: string) {
    if (/^https:\/\/t\.me\//.test(url)) return tg.openTelegramLink(url)
    const wa = webApp()
    if (wa) wa.openLink(url)
    else window.open(url, '_blank', 'noopener')
  },
  confirm(message: string): Promise<boolean> {
    const wa = webApp()
    if (wa && supports('6.2')) return new Promise((resolve) => wa.showConfirm(message, resolve))
    return Promise.resolve(window.confirm(message))
  },
}
