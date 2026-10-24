// Тонкая обёртка над window.Telegram.WebApp.
// Вне Telegram (обычный браузер) все вызовы безопасно ничего не делают,
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
  initDataUnsafe: { user?: { id: number; first_name: string; last_name?: string; username?: string } }
  colorScheme: 'light' | 'dark'
  platform: string
  ready(): void
  expand(): void
  close(): void
  setHeaderColor?(color: string): void
  setBackgroundColor?(color: string): void
  disableVerticalSwipes?(): void
  openTelegramLink(url: string): void
  MainButton: BottomButton
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void }
  HapticFeedback: {
    impactOccurred(style: HapticStyle): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  showAlert?(message: string): void
}

declare global {
  interface Window {
    Telegram?: { WebApp: WebApp }
  }
}

const webApp = (): WebApp | undefined => {
  const wa = window.Telegram?.WebApp
  // Скрипт Telegram есть и в браузере, но platform там 'unknown'.
  return wa && wa.platform !== 'unknown' ? wa : undefined
}

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
  init() {
    const wa = webApp()
    if (!wa) return
    wa.ready()
    wa.expand()
    wa.disableVerticalSwipes?.()
    wa.setHeaderColor?.('secondary_bg_color')
  },
  haptic: {
    tap: () => webApp()?.HapticFeedback.impactOccurred('light'),
    select: () => webApp()?.HapticFeedback.selectionChanged(),
    success: () => webApp()?.HapticFeedback.notificationOccurred('success'),
    error: () => webApp()?.HapticFeedback.notificationOccurred('error'),
  },
  mainButton: () => webApp()?.MainButton,
  backButton: () => webApp()?.BackButton,
  openChat(username: string) {
    const url = `https://t.me/${username}`
    const wa = webApp()
    if (wa) wa.openTelegramLink(url)
    else window.open(url, '_blank')
  },
}
