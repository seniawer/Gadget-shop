import type { ReactNode } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { Logo } from '../components/Logo'
import { Group, Header } from '../components/ui'
import { phoneDigits, routeUrl, shop, telegramUrl } from '../config'
import { useStore } from '../lib/store'
import { tg } from '../lib/telegram'

export function Contacts() {
  const isAdmin = useStore((s) => s.isAdmin)
  const navigate = useStore((s) => s.navigate)
  const openChannel = () => tg.openTelegramLink(telegramUrl(shop.channel))

  return (
    <div className="pb-6">
      <Header title="Контакты" />

      <div className="card mx-4 p-4">
        <div className="flex items-center gap-3.5">
          <Logo size={60} />
          <div className="min-w-0">
            <div className="text-[17px] leading-tight font-bold">{shop.fullName}</div>
            <div className="mt-0.5 text-[15px] text-hint">@{shop.channel}</div>
          </div>
        </div>
        {shop.about && <p className="mt-3 text-[15px] leading-relaxed">{shop.about}</p>}
        <button
          onClick={() => {
            tg.haptic.tap()
            openChannel()
          }}
          className="pressable mt-4 h-11 w-full rounded-xl bg-fill text-[15px] font-semibold text-link"
        >
          Открыть канал в Telegram
        </button>
      </div>

      <SectionTitle>Где нас найти</SectionTitle>
      <Group>
        {shop.address && shop.storePhoto && (
          <img src={shop.storePhoto} alt="Вывеска магазина" loading="lazy" className="aspect-[16/10] w-full bg-fill object-cover" />
        )}
        <Row icon="pin" title={shop.address || 'Адрес и самовывоз уточняйте у менеджера'} subtitle={shop.address ? shop.storeHours : undefined} />
        {shop.address && <ActionRow onClick={() => tg.openLink(routeUrl(shop.mapQuery || shop.address))}>Построить маршрут</ActionRow>}
      </Group>

      <SectionTitle>Написать или позвонить</SectionTitle>
      <Group>
        {shop.managers.map((m) => (
          <Row
            key={m}
            icon="chat"
            title={shop.managerNames[m] ? `${shop.managerNames[m]} · @${m}` : `@${m}`}
            subtitle="Консультация, заказ, ремонт"
            onClick={() => tg.openTelegramLink(telegramUrl(m, 'Здравствуйте! '))}
          />
        ))}
        {shop.phones.map((p) => (
          <Row
            key={p.phone}
            icon="phone"
            title={p.phone}
            subtitle={`${p.name}, позвонить`}
            onClick={() => {
              window.location.href = `tel:+${phoneDigits(p.phone)}`
            }}
          />
        ))}
        {shop.phones
          .filter((p) => p.whatsapp)
          .map((p) => (
            <Row key={`wa-${p.phone}`} emoji="🟢" title="WhatsApp" subtitle={`${p.name}, ${p.phone}`} onClick={() => tg.openLink(`https://wa.me/${phoneDigits(p.phone)}`)} />
          ))}
        <Row icon="clock" title={shop.hours} subtitle={`${shop.responseTime}. ${shop.lateNote}`} />
      </Group>

      {shop.perks.length > 0 && (
        <>
          <SectionTitle>Почему у нас</SectionTitle>
          <div className="mx-4 grid grid-cols-2 gap-2.5">
            {shop.perks.map((p) => (
              <div key={p.title} className="card p-3.5">
                <div className="text-[24px] leading-none">{p.emoji}</div>
                <div className="mt-2 text-[15px] leading-tight font-semibold">{p.title}</div>
                <div className="mt-1 text-[13px] leading-snug text-hint">{p.text}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {shop.services.length > 0 && (
        <>
          <SectionTitle>Чем мы занимаемся</SectionTitle>
          <Group>
            {shop.services.map((s) => (
              <Row
                key={s.title}
                emoji={s.emoji}
                title={s.title}
                subtitle={s.text}
                onClick={s.title === 'Ремонт' ? () => navigate({ name: 'repair' }) : undefined}
              />
            ))}
          </Group>
        </>
      )}

      {(shop.social.length > 0 || shop.reviewsUrl) && (
        <>
          <SectionTitle>Мы в соцсетях</SectionTitle>
          <Group>
            {shop.social.map((s) => (
              <Row key={s.url} icon="chat" title={s.title} subtitle={s.url.replace(/^https?:\/\/(www\.)?/, '')} onClick={() => tg.openLink(s.url)} />
            ))}
            {shop.reviewsUrl && <Row icon="star" title="Отзывы покупателей" subtitle="Что о нас говорят" onClick={() => tg.openLink(shop.reviewsUrl)} />}
          </Group>
        </>
      )}

      {isAdmin && (
        <Group className="mt-8">
          <Row icon="gear" title="Админ-панель" subtitle="Товары, цены и наличие" onClick={() => navigate({ name: 'admin' })} />
        </Group>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="mt-7 mb-2 px-8 text-[13px] font-medium tracking-wide text-hint uppercase">{children}</div>
}

type RowProps = { icon?: IconName; emoji?: string; title: string; subtitle?: string; onClick?: () => void }

function Row({ icon, emoji, title, subtitle, onClick }: RowProps) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-[19px] text-link">
        {icon ? <Icon name={icon} size={20} /> : emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] leading-snug">{title}</span>
        {subtitle && <span className="block text-[14px] text-hint">{subtitle}</span>}
      </span>
      {onClick && <Icon name="chevron" size={18} className="text-hint/60" />}
    </>
  )
  const cls = 'flex w-full items-center gap-3 border-b border-sep px-4 py-3 text-left last:border-0'
  return onClick ? (
    <button
      className={`${cls} active:bg-fill`}
      onClick={() => {
        tg.haptic.tap()
        onClick()
      }}
    >
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
  )
}

function ActionRow({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={() => {
        tg.haptic.tap()
        onClick()
      }}
      className="w-full border-b border-sep px-4 py-3.5 text-left text-[17px] font-medium text-link last:border-0 active:bg-fill"
    >
      {children}
    </button>
  )
}
