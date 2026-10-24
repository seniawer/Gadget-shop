import { findProduct } from '../data/products'
import { DeviceArt } from '../components/DeviceArt'
import { Empty, Header, MainButton } from '../components/ui'
import { cartCount, cartTotal, formatPrice, useStore } from '../lib/store'
import { tg } from '../lib/telegram'

export function Cart() {
  const cart = useStore((s) => s.cart)
  const setQty = useStore((s) => s.setQty)
  const clearCart = useStore((s) => s.clearCart)
  const navigate = useStore((s) => s.navigate)
  const reset = useStore((s) => s.reset)

  if (!cart.length)
    return (
      <>
        <Header title="Корзина" />
        <Empty
          emoji="🛒"
          title="Корзина пуста"
          text="Загляните в каталог, там много интересного"
          action={
            <button onClick={() => reset({ name: 'catalog' })} className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-text">
              В каталог
            </button>
          }
        />
      </>
    )

  const total = cartTotal(cart)

  return (
    <div className="pb-28">
      <Header
        title="Корзина"
        right={
          <button onClick={clearCart} className="text-sm text-danger">
            Очистить
          </button>
        }
      />
      <div className="space-y-2.5 px-4">
        {cart.map((item) => {
          const product = findProduct(item.productId)
          if (!product) return null
          const hex = product.colors.find((c) => c.name === item.color)?.hex
          return (
            <div key={item.key} className="flex gap-3 rounded-2xl bg-section p-3">
              <button
                onClick={() => navigate({ name: 'product', id: product.id })}
                className="h-20 w-20 shrink-0 rounded-xl bg-bg2"
              >
                <DeviceArt product={product} color={hex} className="h-full w-full p-1" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="truncate font-medium">{product.title}</div>
                <div className="truncate text-xs text-hint">{[item.memory, item.color].filter(Boolean).join(' · ')}</div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold">{formatPrice(item.price * item.qty)}</span>
                  <div className="flex items-center gap-3 rounded-full bg-bg2 px-1">
                    <button
                      onClick={() => {
                        tg.haptic.select()
                        setQty(item.key, item.qty - 1)
                      }}
                      className="h-7 w-7 text-lg"
                      aria-label="Меньше"
                    >
                      −
                    </button>
                    <span className="min-w-4 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => {
                        tg.haptic.select()
                        setQty(item.key, item.qty + 1)
                      }}
                      className="h-7 w-7 text-lg"
                      aria-label="Больше"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mx-4 mt-4 space-y-2 rounded-2xl bg-section p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-hint">Товары ({cartCount(cart)})</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-hint">Доставка</span>
          <span>{total >= 30000 ? 'бесплатно' : 'при оформлении'}</span>
        </div>
        <div className="flex justify-between border-t border-hint/15 pt-2 text-base font-bold">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <MainButton text={`Оформить заказ · ${formatPrice(total)}`} onClick={() => navigate({ name: 'checkout' })} />
    </div>
  )
}
