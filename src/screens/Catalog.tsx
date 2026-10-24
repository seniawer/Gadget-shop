import { useMemo, useState } from 'react'
import { categories, products, type CategoryId } from '../data/products'
import { ProductGrid } from '../components/ProductCard'
import { Chip, Empty, Header } from '../components/ui'

type Sort = 'popular' | 'cheap' | 'expensive'

const sortLabel: Record<Sort, string> = { popular: 'Популярные', cheap: 'Сначала дешевле', expensive: 'Сначала дороже' }

const priceRanges = [
  { label: 'Любая цена', min: 0, max: Infinity },
  { label: 'до 30 000 ₽', min: 0, max: 30000 },
  { label: '30–80 000 ₽', min: 30000, max: 80000 },
  { label: 'от 80 000 ₽', min: 80000, max: Infinity },
]

export function Catalog({ category: initialCategory, query: initialQuery }: { category?: string; query?: string }) {
  const [category, setCategory] = useState<CategoryId | 'all'>((initialCategory as CategoryId) ?? 'all')
  const [query, setQuery] = useState(initialQuery ?? '')
  const [sort, setSort] = useState<Sort>('popular')
  const [range, setRange] = useState(0)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const { min, max } = priceRanges[range]
    const filtered = products.filter((p) => {
      if (category === 'used' && p.condition !== 'used') return false
      if (category !== 'all' && category !== 'used' && p.category !== category) return false
      if (q && !`${p.title} ${p.description}`.toLowerCase().includes(q)) return false
      return p.price >= min && p.price < max
    })
    if (sort === 'cheap') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'expensive') return [...filtered].sort((a, b) => b.price - a.price)
    // «Популярные»: сначала хиты, потом новинки, б/у в конце.
    const score = (p: (typeof products)[number]) =>
      (p.tags?.includes('hit') ? 0 : p.tags?.includes('new') ? 1 : 2) + (p.condition === 'used' ? 3 : 0)
    return [...filtered].sort((a, b) => score(a) - score(b))
  }, [category, query, sort, range])

  const title = category === 'all' ? 'Каталог' : categories.find((c) => c.id === category)?.title ?? 'Каталог'

  return (
    <div className="pb-6">
      <Header title={title} />
      <div className="px-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍  Поиск по каталогу"
          enterKeyHint="search"
          className="h-11 w-full rounded-xl bg-section px-4 text-[16px] outline-none placeholder:text-hint"
        />
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        <Chip active={category === 'all'} onClick={() => setCategory('all')}>
          Все
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.emoji} {c.title}
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4">
        {priceRanges.map((r, i) => (
          <Chip key={r.label} active={range === i} onClick={() => setRange(i)}>
            {r.label}
          </Chip>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between px-4 text-sm">
        <span className="text-hint">{list.length} товаров</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="bg-transparent text-right font-medium text-link outline-none"
        >
          {Object.entries(sortLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3">
        {list.length ? (
          <ProductGrid products={list} />
        ) : (
          <Empty emoji="🔍" title="Ничего не нашлось" text="Попробуйте изменить запрос или сбросить фильтры" />
        )}
      </div>
    </div>
  )
}
