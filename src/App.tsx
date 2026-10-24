import { useEffect, useLayoutEffect, useRef } from 'react'
import { Icon, type IconName } from './components/Icon'
import { ActiveScreen, ToastHost, useBackButton } from './components/ui'
import { api } from './lib/api'
import { useCatalog } from './lib/catalog'
import { cartCount, useStore, type Screen } from './lib/store'
import { tg } from './lib/telegram'
import { AdminEdit } from './screens/admin/AdminEdit'
import { AdminList } from './screens/admin/AdminList'
import { Cart } from './screens/Cart'
import { Checkout } from './screens/Checkout'
import { Contacts } from './screens/Contacts'
import { Favorites } from './screens/Favorites'
import { Home } from './screens/Home'
import { ProductPage } from './screens/ProductPage'
import { Repair } from './screens/Repair'
import { Success } from './screens/Success'

function renderScreen(screen: Screen) {
  switch (screen.name) {
    case 'home':
      return <Home />
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
    case 'contacts':
      return <Contacts />
    case 'success':
      return <Success kind={screen.kind} number={screen.number} />
    case 'admin':
      return <AdminList />
    case 'admin-edit':
      return <AdminEdit id={screen.id} />
  }
}

const tabs: { name: 'home' | 'favorites' | 'cart' | 'contacts'; icon: IconName; label: string }[] = [
  { name: 'home', icon: 'home', label: 'Магазин' },
  { name: 'favorites', icon: 'heart', label: 'Избранное' },
  { name: 'cart', icon: 'bag', label: 'Корзина' },
  { name: 'contacts', icon: 'phone', label: 'Контакты' },
]

function TabBar({ current }: { current: Screen['name'] }) {
  const reset = useStore((s) => s.reset)
  const count = useStore((s) => cartCount(s.cart))

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-xl border-t border-sep bg-bg/90 pb-[var(--safe-bottom)] backdrop-blur-xl">
      {tabs.map((t) => {
        const active = current === t.name
        return (
          <button
            key={t.name}
            onClick={() => {
              tg.haptic.select()
              reset({ name: t.name })
            }}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-medium ${active ? 'text-link' : 'text-hint'}`}
          >
            <Icon name={t.icon} size={25} stroke={active ? 2 : 1.7} filled={active && t.name === 'favorites'} />
            {t.label}
            {t.name === 'cart' && count > 0 && (
              <span className="absolute top-1 left-1/2 ml-1.5 min-w-[18px] rounded-full bg-[#ff3b30] px-1 text-center text-[11px] leading-[18px] font-bold text-white">
                {count}
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
  const setAdmin = useStore((s) => s.setAdmin)
  const loadCatalog = useCatalog((s) => s.load)
  const top = stack[stack.length - 1]
  const scrolls = useRef<number[]>([])
  const prevDepth = useRef(stack.length)

  useBackButton(stack.length > 1)

  useEffect(() => {
    loadCatalog()
    // Кнопку админки показываем только тем, кого признал сервер. Сама защита — на сервере.
    if (tg.isTelegram) api.admin.me().then(setAdmin, () => setAdmin(false))
  }, [loadCatalog, setAdmin])

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

  const showTabs = stack.length === 1 && tabs.some((t) => t.name === top.name)

  return (
    <div className={`mx-auto min-h-screen max-w-xl ${showTabs ? 'pb-[calc(64px+var(--safe-bottom))]' : ''}`}>
      {stack.map((screen, i) => {
        const active = i === stack.length - 1
        return (
          <ActiveScreen.Provider key={`${i}-${JSON.stringify(screen)}`} value={active}>
            <div className={active ? 'screen-in' : 'hidden'}>{renderScreen(screen)}</div>
          </ActiveScreen.Provider>
        )
      })}
      {showTabs && <TabBar current={top.name} />}
      <ToastHost />
    </div>
  )
}
