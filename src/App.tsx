import { useLayoutEffect, useRef } from 'react'
import { ActiveScreen, useBackButton } from './components/ui'
import { cartCount, useStore, type Screen } from './lib/store'
import { tg } from './lib/telegram'
import { Home } from './screens/Home'
import { Catalog } from './screens/Catalog'
import { ProductPage } from './screens/ProductPage'
import { Cart } from './screens/Cart'
import { Checkout } from './screens/Checkout'
import { Favorites } from './screens/Favorites'
import { Repair } from './screens/Repair'
import { Success } from './screens/Success'

function renderScreen(screen: Screen) {
  switch (screen.name) {
    case 'home':
      return <Home />
    case 'catalog':
      return <Catalog category={screen.category} query={screen.query} />
    case 'product':
      return <ProductPage id={screen.id} />
    case 'cart':
      return <Cart />
    case 'checkout':
      return <Checkout />
    case 'favorites':
      return <Favorites />
    case 'repair':
      return <Repair />
    case 'success':
      return <Success kind={screen.kind} number={screen.number} />
  }
}

const tabs = [
  { name: 'home', icon: '🏠', label: 'Главная' },
  { name: 'catalog', icon: '🗂️', label: 'Каталог' },
  { name: 'repair', icon: '🛠️', label: 'Ремонт' },
  { name: 'favorites', icon: '🤍', label: 'Избранное' },
  { name: 'cart', icon: '🛒', label: 'Корзина' },
] as const

function TabBar({ current }: { current: Screen['name'] }) {
  const reset = useStore((s) => s.reset)
  const navigate = useStore((s) => s.navigate)
  const count = useStore((s) => cartCount(s.cart))
  const favCount = useStore((s) => s.favorites.length)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-hint/15 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {tabs.map((t) => {
        const badge = t.name === 'cart' ? count : t.name === 'favorites' ? favCount : 0
        return (
          <button
            key={t.name}
            onClick={() => {
              tg.haptic.select()
              // Корзина и ремонт открываются поверх, чтобы из них можно было вернуться назад.
              if (t.name === 'cart' || t.name === 'repair') navigate({ name: t.name })
              else reset({ name: t.name })
            }}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              current === t.name ? 'text-link' : 'text-hint'
            }`}
          >
            <span className={`text-xl ${current === t.name ? '' : 'opacity-70 grayscale'}`}>{t.icon}</span>
            {t.label}
            {badge > 0 && (
              <span className="absolute top-1 left-1/2 ml-2 min-w-[18px] rounded-full bg-rose-500 px-1 text-[11px] leading-[18px] font-bold text-white">
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default function App() {
  const stack = useStore((s) => s.stack)
  const top = stack[stack.length - 1]
  const scrolls = useRef<number[]>([])
  const prevDepth = useRef(stack.length)

  useBackButton(stack.length > 1)

  // Запоминаем прокрутку каждого экрана в стеке и восстанавливаем при возврате назад.
  useLayoutEffect(() => {
    const depth = stack.length
    if (depth > prevDepth.current) window.scrollTo(0, 0)
    else window.scrollTo(0, scrolls.current[depth - 1] ?? 0)
    prevDepth.current = depth
    const onScroll = () => {
      scrolls.current[depth - 1] = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [stack])

  const showTabs = stack.length === 1 && top.name !== 'success'

  return (
    <div className={`mx-auto min-h-screen max-w-xl ${showTabs ? 'pb-20' : ''}`}>
      {stack.map((screen, i) => {
        const active = i === stack.length - 1
        return (
          <ActiveScreen.Provider key={`${i}-${screen.name}-${JSON.stringify(screen)}`} value={active}>
            <div className={active ? 'screen-in' : 'hidden'}>{renderScreen(screen)}</div>
          </ActiveScreen.Provider>
        )
      })}
      {showTabs && <TabBar current={top.name} />}
    </div>
  )
}
