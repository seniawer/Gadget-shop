import { useState } from 'react'
import { categories, products } from '../data/products'
import { ProductGrid } from '../components/ProductCard'
import { Section } from '../components/ui'
import { useStore } from '../lib/store'
import { tg } from '../lib/telegram'
import { shop } from '../lib/config'

const banners = [
  {
    title: 'iPhone 17 уже в наличии',
    text: 'Все цвета и объёмы памяти',
    cta: 'Смотреть',
    gradient: 'from-orange-500 to-rose-500',
    go: { name: 'catalog', category: 'iphone' } as const,
  },
  {
    title: 'Ремонт за 30 минут',
    text: 'Замена батареи iPhone от 2 990 ₽',
    cta: 'Записаться',
    gradient: 'from-sky-500 to-indigo-600',
    go: { name: 'repair' } as const,
  },
  {
    title: 'Проверенные б/у',
    text: 'С гарантией 3 месяца',
    cta: 'Выбрать',
    gradient: 'from-emerald-500 to-teal-600',
    go: { name: 'catalog', category: 'used' } as const,
  },
]

export function Home() {
  const navigate = useStore((s) => s.navigate)
  const [query, setQuery] = useState('')
  const hits = products.filter((p) => p.tags?.includes('hit') && p.condition === 'new')
  const sale = products.filter((p) => p.oldPrice)
  const name = tg.user?.first_name

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <div className="text-sm text-hint">{name ? `Привет, ${name} 👋` : 'Привет 👋'}</div>
        <div className="text-2xl font-extrabold tracking-tight">{shop.name}</div>
      </div>

      <form
        className="mt-3 px-4"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ name: 'catalog', query: query.trim() })
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterKeyHint="search"
          placeholder="🔍  Поиск: iPhone 17, AirPods…"
          className="h-11 w-full rounded-xl bg-section px-4 text-[16px] outline-none placeholder:text-hint"
        />
      </form>

      <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
        {banners.map((b) => (
          <button
            key={b.title}
            onClick={() => {
              tg.haptic.tap()
              navigate(b.go)
            }}
            className={`flex h-36 w-[85%] shrink-0 snap-center flex-col justify-between rounded-2xl bg-gradient-to-br ${b.gradient} p-4 text-left text-white`}
          >
            <div>
              <div className="text-xl leading-tight font-extrabold">{b.title}</div>
              <div className="mt-1 text-sm opacity-90">{b.text}</div>
            </div>
            <span className="self-start rounded-full bg-white/25 px-3 py-1 text-sm font-semibold backdrop-blur">{b.cta} →</span>
          </button>
        ))}
      </div>

      <Section title="Категории">
        <div className="grid grid-cols-4 gap-2 px-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                tg.haptic.tap()
                navigate({ name: 'catalog', category: c.id })
              }}
              className="flex flex-col items-center gap-1 rounded-2xl bg-section py-3 transition active:scale-95"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[12px] font-medium">{c.title}</span>
            </button>
          ))}
          <button
            onClick={() => navigate({ name: 'repair' })}
            className="flex flex-col items-center gap-1 rounded-2xl bg-section py-3 transition active:scale-95"
          >
            <span className="text-2xl">🛠️</span>
            <span className="text-[12px] font-medium">Ремонт</span>
          </button>
        </div>
      </Section>

      <Section
        title="Хиты продаж"
        action={
          <button className="text-sm text-link" onClick={() => navigate({ name: 'catalog' })}>
            Все товары
          </button>
        }
      >
        <ProductGrid products={hits} />
      </Section>

      {sale.length > 0 && (
        <Section title="Скидки">
          <ProductGrid products={sale} />
        </Section>
      )}

      <div className="mx-4 mt-6 rounded-2xl bg-section p-4 text-sm">
        <div className="font-semibold">Остались вопросы?</div>
        <div className="mt-1 text-hint">
          Менеджер ответит в течение 5 минут. {shop.hours}.
        </div>
        <button onClick={() => tg.openChat(shop.manager)} className="mt-3 font-semibold text-link">
          Написать менеджеру
        </button>
      </div>
    </div>
  )
}
