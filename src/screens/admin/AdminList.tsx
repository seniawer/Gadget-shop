import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, type Product } from '../../../shared/catalog'
import { Icon } from '../../components/Icon'
import { ProductImage } from '../../components/ProductImage'
import { StatusBadge } from '../../components/StatusBadge'
import { Chip, ChipRow, Empty, Header, MainButton, mainButtonSpace, PillButton, Spinner, Stepper } from '../../components/ui'
import { useAdmin } from '../../lib/admin'
import { api } from '../../lib/api'
import { formatPrice, useStore } from '../../lib/store'
import { tg } from '../../lib/telegram'

export function AdminList() {
  const { products, status, error, load } = useAdmin()
  const navigate = useStore((s) => s.navigate)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    load()
  }, [load])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (filter === 'all' || (filter === 'hidden' ? p.hidden : filter === 'out' ? p.quantity === 0 && !p.preorder : p.category === filter)) &&
        (!q || p.title.toLowerCase().includes(q)),
    )
  }, [products, query, filter])

  return (
    <div className={mainButtonSpace}>
      <Header title="Админ-панель" subtitle={status === 'ready' ? `${products.length} товаров, скрыто ${products.filter((p) => p.hidden).length}` : undefined} />

      <div className="px-4">
        <label className="card flex h-11 items-center gap-2 px-4">
          <Icon name="search" size={18} className="text-hint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Поиск по названию"
            className="h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-hint"
          />
        </label>
      </div>
      <div className="mt-3">
        <ChipRow>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Все</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.title}
            </Chip>
          ))}
          <Chip active={filter === 'out'} onClick={() => setFilter('out')}>Нет в наличии</Chip>
          <Chip active={filter === 'hidden'} onClick={() => setFilter('hidden')}>Скрытые</Chip>
        </ChipRow>
      </div>

      <div className="mt-4">
        {status === 'loading' || status === 'idle' ? (
          <div className="grid place-items-center pt-20 text-hint">
            <Spinner />
          </div>
        ) : status === 'error' ? (
          <Empty emoji="🔒" title="Нет доступа" text={error ?? 'Не удалось загрузить товары'} action={<PillButton onClick={load}>Повторить</PillButton>} />
        ) : list.length ? (
          <div className="card mx-4 overflow-hidden">
            {list.map((p) => (
              <AdminRow key={p.id} product={p} onOpen={() => navigate({ name: 'admin-edit', id: p.id })} />
            ))}
          </div>
        ) : (
          <Empty emoji="📦" title="Товаров нет" text={query || filter !== 'all' ? 'Измените поиск или фильтр' : 'Добавьте первый товар'} />
        )}
      </div>

      <MainButton text="Добавить товар" onClick={() => navigate({ name: 'admin-edit' })} />
    </div>
  )
}

function AdminRow({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const upsert = useAdmin((s) => s.upsert)
  const showToast = useStore((s) => s.showToast)
  const [qty, setQty] = useState(product.quantity)
  const [saving, setSaving] = useState(false)
  const saved = useRef(product.quantity)

  useEffect(() => {
    setQty(product.quantity)
    saved.current = product.quantity
  }, [product.quantity])

  // Нажатия «+»/«−» копим и отправляем одним запросом через полсекунды.
  useEffect(() => {
    if (qty === saved.current) return
    const timer = window.setTimeout(async () => {
      setSaving(true)
      try {
        const updated = await api.admin.update(product.id, { quantity: qty })
        saved.current = updated.quantity
        upsert(updated)
      } catch (e) {
        setQty(saved.current)
        showToast(e instanceof Error ? e.message : 'Не удалось сохранить', 'error')
      } finally {
        setSaving(false)
      }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [qty, product.id, upsert, showToast])

  const toggleHidden = async () => {
    tg.haptic.select()
    try {
      const updated = await api.admin.update(product.id, { hidden: !product.hidden })
      upsert(updated)
      showToast(updated.hidden ? 'Скрыт из каталога' : 'Снова в каталоге')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не удалось сохранить', 'error')
    }
  }

  return (
    <div className={`border-b border-sep px-3 py-3 last:border-0 ${product.hidden ? 'opacity-60' : ''}`}>
      <button onClick={onOpen} className="flex w-full items-center gap-3 text-left">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
          <ProductImage product={product} photo={product.photos[0]} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold">{product.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-hint">
            <span>{formatPrice(product.price)}</span>
            {product.condition === 'used' && <span>· Б/У</span>}
            <StatusBadge product={{ ...product, quantity: qty }} />
            {product.hidden && <span className="text-[12px] font-semibold">Скрыт</span>}
          </div>
        </div>
        <Icon name="chevron" size={18} className="text-hint/60" />
      </button>
      <div className="mt-2.5 flex items-center justify-between pl-[68px]">
        <div className="flex items-center gap-2">
          <Stepper value={qty} onChange={setQty} />
          {saving && <Spinner className="h-4 w-4 text-hint" />}
        </div>
        <button
          onClick={toggleHidden}
          className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium ${product.hidden ? 'bg-accent/12 text-link' : 'bg-fill'}`}
          aria-label={product.hidden ? 'Показать в каталоге' : 'Скрыть из каталога'}
        >
          <Icon name={product.hidden ? 'eyeOff' : 'eye'} size={18} />
          {product.hidden ? 'Скрыт' : 'Виден'}
        </button>
      </div>
    </div>
  )
}
