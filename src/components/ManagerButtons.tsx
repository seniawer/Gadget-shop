import { shop, telegramUrl } from '../config'
import { tg } from '../lib/telegram'
import { Icon } from './Icon'

/** Кнопки «Написать менеджеру»: открывают чат с готовым текстом сообщения. */
export function ManagerButtons({ text, className = '' }: { text?: string; className?: string }) {
  return (
    <div className={`grid gap-2 ${shop.managers.length > 1 ? 'grid-cols-2' : ''} ${className}`}>
      {shop.managers.map((m) => (
        <button
          key={m}
          onClick={() => {
            tg.haptic.tap()
            tg.openTelegramLink(telegramUrl(m, text))
          }}
          className="pressable flex min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-fill px-3 py-3 text-[15px] font-semibold text-link"
        >
          <Icon name="chat" size={18} />
          <span className="truncate">@{m}</span>
        </button>
      ))}
    </div>
  )
}
