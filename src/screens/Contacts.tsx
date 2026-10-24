import type { ReactNode } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { Group, Header } from '../components/ui'
import { routeUrl, shop, telegramUrl } from '../config'
import { useStore } from '../lib/store'
import { tg } from '../lib/telegram'

export function Contacts() {
  const isAdmin = useStore((s) => s.isAdmin)
  const navigate = useStore((s) => s.navigate)

  return (
    <div className="pb-6">
      <Header title="Контакты" />

      <div className="card mx-4 flex items-center gap-4 p-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-text text-[26px] text-bg">📱</div>
        <div className="min-w-0">
          <div className="text-[17px] leading-tight font-bold">{shop.fullName}</div>
          <button onClick={() => tg.openTelegramLink(telegramUrl(shop.channel))} className="mt-1 text-[15px] text-link">
            @{shop.channel}
          </button>
        </div>
      </div>

      <SectionTitle>Где нас найти</SectionTitle>
      <Group>
        <Row icon="pin" title={shop.address || 'Адрес уточняйте у менеджера'} subtitle={shop.address ? 'Магазин и сервисный центр' : undefined} />
        {shop.address && <ActionRow onClick={() => tg.openLink(routeUrl(shop.address))}>Построить маршрут</ActionRow>}
      </Group>

      <SectionTitle>График работы</SectionTitle>
      <Group>
        <Row icon="clock" title={shop.hours} subtitle={`${shop.responseTime}. ${shop.lateNote}`} />
      </Group>

      <SectionTitle>Менеджеры</SectionTitle>
      <Group>
        {shop.managers.map((m) => (
          <Row
            key={m}
            icon="chat"
            title={`Написать @${m}`}
            subtitle="Консультация, заказ, ремонт"
            onClick={() => tg.openTelegramLink(telegramUrl(m, 'Здравствуйте! '))}
          />
        ))}
      </Group>

      {shop.reviewsUrl && (
        <>
          <SectionTitle>Отзывы</SectionTitle>
          <Group>
            <Row icon="star" title="Отзывы покупателей" subtitle="Что о нас говорят" onClick={() => tg.openLink(shop.reviewsUrl)} />
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

function Row({ icon, title, subtitle, onClick }: { icon: IconName; title: string; subtitle?: string; onClick?: () => void }) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-link">
        <Icon name={icon} size={20} />
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
