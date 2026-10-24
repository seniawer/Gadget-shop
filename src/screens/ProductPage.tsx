import { useState } from 'react'
import { availability, canBuy, categoryTitle } from '../../shared/catalog'
import { Gallery } from '../components/Gallery'
import { Icon } from '../components/Icon'
import { ManagerButtons } from '../components/ManagerButtons'
import { StatusBadge } from '../components/StatusBadge'
import { Empty, Header, MainButton, mainButtonSpace, Spinner } from '../components/ui'
import { shop, telegramUrl } from '../config'
import { useCatalog, useProduct } from '../lib/catalog'
import { formatPrice, useStore } from '../lib/store'
import { tg } from '../lib/telegram'

export function ProductPage({ id }: { id: string }) {
  const product = useProduct(id)
  const status = useCatalog((s) => s.status)
  const addToCart = useStore((s) => s.addToCart)
  const navigate = useStore((s) => s.navigate)
  const isFav = useStore((s) => s.favorites.includes(id))
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const [colorIdx, setColorIdx] = useState(0)
  const [memIdx, setMemIdx] = useState(0)
  const [added, setAdded] = useState(false)

  if (!product)
    return (
      <>
        <Header title="" />
        {status === 'loading' ? (
          <div className="grid place-items-center pt-32 text-hint">
            <Spinner />
          </div>
        ) : (
          <Empty emoji="🤷" title="Товар не найден" text="Возможно, его уже купили или убрали из каталога" />
        )}
      </>
    )

  const color = product.colors[colorIdx]
  const memory = product.memory?.[memIdx]
  const price = product.price + (memory?.delta ?? 0)
  const fullTitle = [product.title, product.memory && product.memory.length > 1 ? memory?.label : '', product.colors.length > 1 ? color?.name : '']
    .filter(Boolean)
    .join(', ')
  const managerText = `Здравствуйте! Интересует: ${fullTitle}, ${formatPrice(price)}`
  const state = availability(product).kind

  const mainAction = (() => {
    if (canBuy(product))
      return {
        text: added ? 'Перейти в корзину' : `В корзину · ${formatPrice(price)}`,
        onClick: () => {
          if (added) return navigate({ name: 'cart' })
          addToCart({ productId: product.id, title: product.title, color: color?.name ?? '', memory: memory?.label, price })
          tg.haptic.success()
          setAdded(true)
        },
      }
    const text = state === 'preorder' ? 'Оформить предзаказ' : 'Узнать о поступлении'
    const message =
      state === 'preorder'
        ? `Здравствуйте! Хочу оформить предзаказ: ${fullTitle}, ${formatPrice(price)}`
        : `Здравствуйте! Сообщите, пожалуйста, когда появится: ${fullTitle}`
    return { text, onClick: () => tg.openTelegramLink(telegramUrl(shop.managers[0], message)) }
  })()

  const pick = (fn: () => void) => {
    tg.haptic.select()
    fn()
    setAdded(false)
  }

  return (
    <div className={mainButtonSpace}>
      <Header
        title=""
        right={
          <button
            onClick={() => pick(() => toggleFavorite(id))}
            className={`grid h-10 w-10 place-items-center rounded-full ${isFav ? 'text-[#ff375f]' : 'text-hint'}`}
            aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
          >
            <Icon name="heart" size={24} filled={isFav} />
          </button>
        }
      />

      <Gallery product={product} color={color?.hex} />

      <div className="mt-5 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge product={product} />
          <span className="text-[13px] text-hint">
            {categoryTitle(product.category)} · {product.condition === 'used' ? 'Б/У' : 'Новый'}
          </span>
        </div>
        <h1 className="mt-2 text-[28px] leading-[1.15] font-bold tracking-tight">{product.title}</h1>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[26px] font-bold tracking-tight">{formatPrice(price)}</span>
          {product.oldPrice && <span className="text-[17px] text-hint line-through">{formatPrice(product.oldPrice + (memory?.delta ?? 0))}</span>}
        </div>
      </div>

      {product.colors.length > 1 && (
        <div className="mt-6 px-4">
          <div className="text-[15px] text-hint">
            Цвет: <span className="font-medium text-text">{color?.name}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-3">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => pick(() => setColorIdx(i))}
                aria-label={c.name}
                className={`h-10 w-10 rounded-full border border-black/10 ring-offset-2 ring-offset-bg2 ${i === colorIdx ? 'ring-2 ring-accent' : ''}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {product.memory && product.memory.length > 1 && (
        <div className="mt-6 px-4">
          <div className="text-[15px] text-hint">{product.category === 'watch' ? 'Размер' : 'Память'}</div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.memory.map((m, i) => (
              <button
                key={m.label}
                onClick={() => pick(() => setMemIdx(i))}
                className={`rounded-2xl border-2 px-4 py-2.5 text-[15px] font-semibold transition-colors ${
                  i === memIdx ? 'border-accent text-link' : 'card border-transparent'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.condition === 'used' && (
        <div className="mx-4 mt-6 grid grid-cols-3 gap-2 text-center">
          <Stat value={product.used?.battery ? `${product.used.battery}%` : '—'} label="Аккумулятор" />
          <Stat value={product.used?.grade || '—'} label="Состояние" />
          <Stat value={shop.warrantyUsed} label="Гарантия" />
          {product.used?.kit && (
            <div className="card col-span-3 px-4 py-3 text-left text-[15px]">
              <span className="text-hint">Комплект: </span>
              {product.used.kit}
            </div>
          )}
        </div>
      )}

      {product.description && <p className="mt-6 px-4 text-[17px] leading-relaxed whitespace-pre-line">{product.description}</p>}

      {product.specs.length > 0 && (
        <div className="card mx-4 mt-6 overflow-hidden">
          {product.specs.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-sep px-4 py-3 text-[15px] last:border-0">
              <span className="text-hint">{k}</span>
              <span className="text-right font-medium">{v}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 px-4">
        <div className="text-[17px] font-semibold">Остались вопросы? 💬</div>
        <div className="mt-0.5 text-[14px] text-hint">
          {shop.responseTime}, {shop.hours.toLowerCase()}
        </div>
        <ManagerButtons text={managerText} className="mt-3" />
      </div>

      <MainButton text={mainAction.text} onClick={mainAction.onClick} />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card px-2 py-3">
      <div className="text-[19px] font-bold tracking-tight">{value}</div>
      <div className="text-[12px] text-hint">{label}</div>
    </div>
  )
}
