import type { Product } from '../../shared/catalog'
import { formatPrice, useStore } from '../lib/store'
import { tg } from '../lib/telegram'
import { Icon } from './Icon'
import { ProductImage } from './ProductImage'
import { StatusBadge } from './StatusBadge'

export function ProductCard({ product }: { product: Product }) {
  const navigate = useStore((s) => s.navigate)
  const isFav = useStore((s) => s.favorites.includes(product.id))
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const open = () => {
    tg.haptic.tap()
    navigate({ name: 'product', id: product.id })
  }

  return (
    <article className="card pressable relative flex cursor-pointer flex-col overflow-hidden" onClick={open}>
      <div className="relative aspect-square">
        <ProductImage product={product} photo={product.photos[0]} />
        {product.condition === 'used' && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            Б/У{product.used?.battery ? ` · ${product.used.battery}%` : ''}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            tg.haptic.select()
            toggleFavorite(product.id)
          }}
          className={`absolute top-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-bg/70 backdrop-blur ${isFav ? 'text-[#ff375f]' : 'text-hint'}`}
          aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
        >
          <Icon name="heart" size={19} filled={isFav} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3 pt-2.5">
        <StatusBadge product={product} className="self-start" />
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.6em] text-[15px] leading-[1.3] font-semibold">{product.title}</h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[17px] font-bold tracking-tight">
            {product.memory && product.memory.length > 1 ? 'от ' : ''}
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && <span className="text-[13px] text-hint line-through">{formatPrice(product.oldPrice)}</span>}
        </div>
        <span className="mt-2.5 rounded-xl bg-fill py-2 text-center text-[14px] font-semibold text-link">Подробнее</span>
      </div>
    </article>
  )
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4" aria-label="Загружаем каталог">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-square" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-4 w-16 rounded-full" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton mt-3 h-9 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
