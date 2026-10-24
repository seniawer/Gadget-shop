import type { Product } from '../data/products'
import { formatPrice, useStore } from '../lib/store'
import { tg } from '../lib/telegram'
import { DeviceArt } from './DeviceArt'

const tagLabel = { hit: 'Хит', new: 'Новинка', sale: 'Скидка' } as const
const tagColor = { hit: 'bg-amber-400 text-black', new: 'bg-emerald-500 text-white', sale: 'bg-rose-500 text-white' } as const

export function ProductCard({ product }: { product: Product }) {
  const navigate = useStore((s) => s.navigate)
  const isFav = useStore((s) => s.favorites.includes(product.id))
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const tag = product.condition === 'used' ? null : product.tags?.[0]

  return (
    <div
      onClick={() => {
        tg.haptic.tap()
        navigate({ name: 'product', id: product.id })
      }}
      className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-section p-3 transition active:scale-[0.98]"
    >
      <div className="relative -mx-1 aspect-square rounded-xl bg-bg2">
        <DeviceArt product={product} className="h-full w-full p-2" />
        {tag && (
          <span className={`absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${tagColor[tag]}`}>{tagLabel[tag]}</span>
        )}
        {product.condition === 'used' && (
          <span className="absolute top-2 left-2 rounded-md bg-sky-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
            Б/у · {product.used?.battery}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            tg.haptic.select()
            toggleFavorite(product.id)
          }}
          className="absolute top-1.5 right-1.5 grid h-8 w-8 place-items-center rounded-full text-lg"
          aria-label="В избранное"
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="mt-2.5 line-clamp-2 min-h-[2.5em] text-[14px] leading-tight font-medium">{product.title}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[15px] font-bold">
          {product.memory && product.memory.length > 1 ? 'от ' : ''}
          {formatPrice(product.price)}
        </span>
        {product.oldPrice && <span className="text-xs text-hint line-through">{formatPrice(product.oldPrice)}</span>}
      </div>
    </div>
  )
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
