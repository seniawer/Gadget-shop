import { useState } from 'react'
import { findProduct } from '../data/products'
import { DeviceArt } from '../components/DeviceArt'
import { Empty, Header, MainButton } from '../components/ui'
import { formatPrice, useStore } from '../lib/store'
import { tg } from '../lib/telegram'
import { shop } from '../lib/config'

export function ProductPage({ id }: { id: string }) {
  const product = findProduct(id)
  const addToCart = useStore((s) => s.addToCart)
  const navigate = useStore((s) => s.navigate)
  const isFav = useStore((s) => s.favorites.includes(id))
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const [colorIdx, setColorIdx] = useState(0)
  const [memIdx, setMemIdx] = useState(0)
  const [added, setAdded] = useState(false)

  if (!product) return <Empty emoji="🤷" title="Товар не найден" text="Возможно, его уже купили" />

  const color = product.colors[colorIdx]
  const memory = product.memory?.[memIdx]
  const price = product.price + (memory?.delta ?? 0)

  const add = () => {
    if (added) {
      navigate({ name: 'cart' })
      return
    }
    addToCart({ productId: product.id, color: color.name, memory: memory?.label, price })
    tg.haptic.success()
    setAdded(true)
  }

  return (
    <div className="pb-28">
      <Header
        title=""
        right={
          <button
            onClick={() => {
              tg.haptic.select()
              toggleFavorite(id)
            }}
            className="text-2xl"
            aria-label="В избранное"
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        }
      />
      <div className="mx-4 aspect-[4/3] rounded-3xl bg-section">
        <DeviceArt product={product} color={color.hex} className="h-full w-full p-4" />
      </div>

      <div className="mt-4 px-4">
        {product.condition === 'used' && (
          <span className="mb-2 inline-block rounded-md bg-sky-500 px-2 py-0.5 text-xs font-bold text-white">Б/у, проверен</span>
        )}
        <h1 className="text-2xl leading-tight font-extrabold">{product.title}</h1>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatPrice(price)}</span>
          {product.oldPrice && <span className="text-hint line-through">{formatPrice(product.oldPrice + (memory?.delta ?? 0))}</span>}
        </div>
      </div>

      {product.colors.length > 1 && (
        <div className="mt-5 px-4">
          <div className="text-sm text-hint">
            Цвет: <span className="text-text">{color.name}</span>
          </div>
          <div className="mt-2 flex gap-3">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => {
                  tg.haptic.select()
                  setColorIdx(i)
                  setAdded(false)
                }}
                aria-label={c.name}
                className={`h-9 w-9 rounded-full border border-black/10 ring-offset-2 ring-offset-bg2 transition ${
                  i === colorIdx ? 'ring-2 ring-accent' : ''
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {product.memory && product.memory.length > 1 && (
        <div className="mt-5 px-4">
          <div className="text-sm text-hint">{product.category === 'watch' ? 'Размер' : 'Память'}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.memory.map((m, i) => (
              <button
                key={m.label}
                onClick={() => {
                  tg.haptic.select()
                  setMemIdx(i)
                  setAdded(false)
                }}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  i === memIdx ? 'border-accent bg-accent/10 text-link' : 'border-transparent bg-section'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.used && (
        <div className="mx-4 mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-section p-3">
            <div className="text-lg font-bold">{product.used.battery}%</div>
            <div className="text-xs text-hint">Аккумулятор</div>
          </div>
          <div className="rounded-2xl bg-section p-3">
            <div className="text-lg font-bold">{product.used.grade}</div>
            <div className="text-xs text-hint">Состояние</div>
          </div>
          <div className="rounded-2xl bg-section p-3">
            <div className="text-lg font-bold">3 мес</div>
            <div className="text-xs text-hint">Гарантия</div>
          </div>
          <div className="col-span-3 rounded-2xl bg-section p-3 text-left text-sm">
            <span className="text-hint">Комплект: </span>
            {product.used.kit}
          </div>
        </div>
      )}

      <p className="mt-5 px-4 text-[15px] leading-relaxed">{product.description}</p>

      <div className="mx-4 mt-5 overflow-hidden rounded-2xl bg-section">
        {product.specs.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-hint/15 px-4 py-3 text-sm last:border-0">
            <span className="text-hint">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-3 space-y-2 rounded-2xl bg-section p-4 text-sm">
        <div>🚚 Доставка по городу сегодня или завтра</div>
        <div>🏬 {shop.address}</div>
        <div>🛡️ Официальная гарантия, проверка при получении</div>
      </div>

      <button onClick={() => tg.openChat(shop.manager)} className="mx-4 mt-4 text-sm font-semibold text-link">
        Задать вопрос о товаре
      </button>

      <MainButton text={added ? 'Перейти в корзину' : `В корзину · ${formatPrice(price)}`} onClick={add} />
    </div>
  )
}
