import { ProductImage } from '../components/ProductImage'
import { Icon } from '../components/Icon'
import { Empty, Header, MainButton, mainButtonSpace, PillButton } from '../components/ui'
import { useCatalog } from '../lib/catalog'
import { cartCount, cartTotal, formatPrice, useStore } from '../lib/store'
import { tg } from '../lib/telegram'

export function Cart() {
  const cart = useStore((s) => s.cart)
  const setQty = useStore((s) => s.setQty)
  const clearCart = useStore((s) => s.clearCart)
  const navigate = useStore((s) => s.navigate)
  const reset = useStore((s) => s.reset)
  const products = useCatalog((s) => s.products)

  if (!cart.length)
    return (
      <>
        <Header title="Корзина" />
        <Empty
          emoji="🛒"
          title="Корзина пуста"
          text="Загляните в каталог, там много интересного"
          action={
            <PillButton onClick={() => reset()}>В каталог</PillButton>
          }
        />
      </>
    )

  const total = cartTotal(cart)

  return (
    <div className={mainButtonSpace}>
      <Header
        title="Корзина"
        right={
          <button onClick={clearCart} className="text-[15px] text-danger">
            Очистить
          </button>
        }
      />
      <div className="space-y-2.5 px-4">
        {cart.map((item) => {
          const product = products.find((p) => p.id === item.productId)
          const hex = product?.colors.find((c) => c.name === item.color)?.hex
          return (
            <div key={item.key} className="card flex gap-3 p-3">
              <button
                onClick={() => product && navigate({ name: 'product', id: product.id })}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl"
              >
                {product ? (
                  <ProductImage product={product} photo={product.photos[0]} color={hex} />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-fill text-hint">
                    <Icon name="box" />
                  </div>
                )}
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="truncate text-[16px] font-semibold">{item.title}</div>
                <div className="truncate text-xs text-hint">{[item.memory, item.color].filter(Boolean).join(' · ')}</div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold">{formatPrice(item.price * item.qty)}</span>
                  <div className="flex items-center gap-3 rounded-full bg-fill px-1">
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

      <div className="card mx-4 mt-4 space-y-2 p-4 text-[15px]">
        <div className="flex justify-between">
          <span className="text-hint">Товары ({cartCount(cart)})</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-hint">Доставка</span>
          <span>{total >= 30000 ? 'бесплатно' : 'при оформлении'}</span>
        </div>
        <div className="flex justify-between border-t border-sep pt-2 text-base font-bold">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <MainButton text={`Оформить заказ · ${formatPrice(total)}`} onClick={() => navigate({ name: 'checkout' })} />
    </div>
  )
}
