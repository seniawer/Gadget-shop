import { useMemo, useState } from 'react'
import { availability, type Product } from '../../shared/catalog'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard'
import { Chip, ChipRow, Empty, IconButton, PillButton } from '../components/ui'
import { Icon } from '../components/Icon'
import { useCatalog } from '../lib/catalog'
import { useStore } from '../lib/store'
import { tg } from '../lib/telegram'
import { shop, telegramUrl } from '../config'

type Filter = { id: string; label: string; match?: (p: Product) => boolean }

const filters: Filter[] = [
  { id: 'all', label: 'Все' },
  { id: 'iphone-new', label: 'Новые iPhone', match: (p) => p.category === 'iphone' && p.condition === 'new' },
  { id: 'used', label: 'Б/У', match: (p) => p.condition === 'used' },
  { id: 'ipad', label: 'iPad', match: (p) => p.category === 'ipad' && p.condition === 'new' },
  { id: 'mac', label: 'MacBook', match: (p) => p.category === 'mac' && p.condition === 'new' },
  { id: 'watch', label: 'Watch', match: (p) => p.category === 'watch' },
  { id: 'audio', label: 'AirPods', match: (p) => p.category === 'audio' },
  { id: 'accessories', label: 'Аксессуары', match: (p) => p.category === 'accessories' },
]

type Sort = 'popular' | 'cheap' | 'expensive' | 'fresh'
const sortLabel: Record<Sort, string> = {
  popular: 'Популярные',
  cheap: 'Сначала дешевле',
  expensive: 'Сначала дороже',
  fresh: 'Новые поступления',
}

const priceRanges = [
  { label: 'Любая цена', min: 0, max: Infinity },
  { label: 'до 30 000 ₽', min: 0, max: 30000 },
  { label: '30 000 – 80 000 ₽', min: 30000, max: 80000 },
  { label: 'от 80 000 ₽', min: 80000, max: Infinity },
]

// «Популярные»: в наличии и хиты выше, отсутствующие в конце.
const popularity = (p: Product) => {
  const a = availability(p).kind
  return (a === 'out' ? 10 : 0) + (p.tags?.includes('hit') ? 0 : p.tags?.includes('new') ? 1 : 2) + (p.condition === 'used' ? 1 : 0)
}

export function Home() {
  const { products, status, error, load } = useCatalog()
  const navigate = useStore((s) => s.navigate)
  const isAdmin = useStore((s) => s.isAdmin)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('popular')
  const [range, setRange] = useState(0)
  const [inStock, setInStock] = useState(false)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = filters.find((f) => f.id === filter)?.match
    const { min, max } = priceRanges[range]
    const result = products.filter(
      (p) =>
        (!match || match(p)) &&
        (!q || `${p.title} ${p.description}`.toLowerCase().includes(q)) &&
        p.price >= min &&
        p.price < max &&
        (!inStock || availability(p).kind === 'in_stock' || availability(p).kind === 'few'),
    )
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      popular: (a, b) => popularity(a) - popularity(b),
      cheap: (a, b) => a.price - b.price,
      expensive: (a, b) => b.price - a.price,
      fresh: (a, b) => b.createdAt - a.createdAt,
    }
    return result.sort(by[sort])
  }, [products, filter, query, sort, range, inStock])

  const filtered = filter !== 'all' || query || range > 0 || inStock
  const resetFilters = () => {
    setFilter('all')
    setQuery('')
    setRange(0)
    setInStock(false)
  }

  return (
    <div className="pb-6">
      <header className="px-4 pt-[calc(16px+var(--safe-top))]">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium tracking-wide text-hint uppercase">{shop.tagline}</div>
            <h1 className="text-[34px] leading-[1.1] font-extrabold tracking-tight">{shop.name}</h1>
          </div>
          {isAdmin && (
            <IconButton label="Админ-панель" onClick={() => navigate({ name: 'admin' })}>
              <Icon name="gear" size={20} />
            </IconButton>
          )}
        </div>
        <label className="card mt-4 flex h-12 items-center gap-2 px-4">
          <Icon name="search" size={19} className="text-hint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            enterKeyHint="search"
            placeholder="Поиск: iPhone 17, AirPods…"
            className="h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-hint"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-hint" aria-label="Очистить поиск">
              <Icon name="close" size={18} />
            </button>
          )}
        </label>
      </header>

      <div className="sticky top-0 z-10 mt-3 bg-bg2/85 py-2 backdrop-blur-xl">
        <ChipRow>
          {filters.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
          <Chip onClick={() => navigate({ name: 'repair' })}>🛠 Ремонт</Chip>
        </ChipRow>
      </div>

      <div className="mt-2 flex items-center gap-2 px-4">
        <SelectPill
          label="Цена"
          value={String(range)}
          active={range > 0}
          onChange={(v) => setRange(Number(v))}
          options={priceRanges.map((r, i) => ({ value: String(i), label: i ? r.label : 'Цена' }))}
        />
        <SelectPill
          label="Сортировка"
          value={sort}
          onChange={(v) => setSort(v as Sort)}
          options={Object.entries(sortLabel).map(([value, label]) => ({ value, label }))}
        />
        <button
          onClick={() => {
            tg.haptic.select()
            setInStock(!inStock)
          }}
          className={`flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[14px] font-medium transition-colors ${
            inStock ? 'bg-accent text-accent-text' : 'bg-fill text-text'
          }`}
        >
          {inStock && <Icon name="check" size={15} stroke={2.4} />}В наличии
        </button>
      </div>

      {filter === 'all' && !query && status === 'ready' && <Promo />}

      <div className="mt-4">
        {status === 'loading' || status === 'idle' ? (
          <ProductGridSkeleton />
        ) : status === 'error' ? (
          <Empty
            emoji="😕"
            title="Не удалось загрузить каталог"
            text={error ?? 'Проверьте интернет и попробуйте ещё раз'}
            action={<PillButton onClick={load}>Повторить</PillButton>}
          />
        ) : list.length ? (
          <>
            <div className="mb-2.5 px-4 text-[13px] text-hint">{countLabel(list.length)}</div>
            <ProductGrid products={list} />
          </>
        ) : (
          <Empty
            emoji="🔍"
            title="Ничего не нашлось"
            text={filtered ? 'Попробуйте другой запрос или сбросьте фильтры' : 'Скоро здесь появятся товары'}
            action={filtered && <PillButton onClick={resetFilters} variant="plain">Сбросить фильтры</PillButton>}
          />
        )}
      </div>
    </div>
  )
}

const countLabel = (n: number) => {
  const mod10 = n % 10
  const mod100 = n % 100
  const word = mod10 === 1 && mod100 !== 11 ? 'товар' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'товара' : 'товаров'
  return `${n} ${word}`
}

function SelectPill({ value, options, onChange, active, label }: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  active?: boolean
  label: string
}) {
  return (
    <label className={`relative flex h-9 min-w-0 items-center rounded-full pr-7 pl-3 text-[14px] font-medium ${active ? 'bg-accent text-accent-text' : 'bg-fill'}`}>
      <select
        value={value}
        onChange={(e) => {
          tg.haptic.select()
          onChange(e.target.value)
        }}
        aria-label={label}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="truncate">{options.find((o) => o.value === value)?.label}</span>
      <Icon name="chevron" size={14} stroke={2.2} className="pointer-events-none absolute right-2.5 rotate-90 opacity-60" />
    </label>
  )
}

function Promo() {
  const navigate = useStore((s) => s.navigate)
  const banners = [
    { title: 'Предзаказ новинок', text: 'Привезём под заказ любую модель', cta: 'Узнать', gradient: 'from-[#1d1d1f] to-[#434344]', onClick: () => tg.openTelegramLink(telegramUrl(shop.managers[0], 'Здравствуйте! Хочу оформить предзаказ новинки.')) },
    { title: 'Ремонт за 30 минут', text: 'Замена батареи iPhone от 2 990 ₽', cta: 'Записаться', gradient: 'from-[#0071e3] to-[#42a1ff]', onClick: () => navigate({ name: 'repair' }) },
  ]
  return (
    <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
      {banners.map((b) => (
        <button
          key={b.title}
          onClick={() => {
            tg.haptic.tap()
            b.onClick()
          }}
          className={`pressable flex h-32 w-[82%] shrink-0 snap-center flex-col justify-between rounded-[20px] bg-gradient-to-br p-4 text-left text-white ${b.gradient}`}
        >
          <div>
            <div className="text-[20px] leading-tight font-bold tracking-tight">{b.title}</div>
            <div className="mt-1 text-[14px] opacity-80">{b.text}</div>
          </div>
          <span className="text-[15px] font-semibold">{b.cta} ›</span>
        </button>
      ))}
    </div>
  )
}
