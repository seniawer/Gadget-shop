import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Screen =
  | { name: 'home' }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'favorites' }
  | { name: 'repair' }
  | { name: 'contacts' }
  | { name: 'success'; kind: 'order' | 'repair'; number: string }
  | { name: 'admin' }
  | { name: 'admin-edit'; id?: string }

export type CartItem = {
  key: string
  productId: string
  title: string
  color: string
  memory?: string
  price: number
  qty: number
}

export type Toast = { id: number; text: string; kind: 'success' | 'error' }

type State = {
  stack: Screen[]
  cart: CartItem[]
  favorites: string[]
  isAdmin: boolean
  toast?: Toast
  navigate(screen: Screen): void
  back(): void
  reset(screen?: Screen): void
  addToCart(item: Omit<CartItem, 'key' | 'qty'>): void
  setQty(key: string, qty: number): void
  clearCart(): void
  toggleFavorite(id: string): void
  setAdmin(isAdmin: boolean): void
  showToast(text: string, kind?: Toast['kind']): void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      stack: [{ name: 'home' }],
      cart: [],
      favorites: [],
      isAdmin: false,
      navigate: (screen) => set((s) => ({ stack: [...s.stack, screen] })),
      back: () => set((s) => ({ stack: s.stack.length > 1 ? s.stack.slice(0, -1) : s.stack })),
      reset: (screen = { name: 'home' }) => set({ stack: [screen] }),
      addToCart: (item) =>
        set((s) => {
          const key = [item.productId, item.color, item.memory].join('|')
          const existing = s.cart.find((c) => c.key === key)
          return {
            cart: existing
              ? s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c))
              : [...s.cart, { ...item, key, qty: 1 }],
          }
        }),
      setQty: (key, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((c) => c.key !== key) : s.cart.map((c) => (c.key === key ? { ...c, qty } : c)),
        })),
      clearCart: () => set({ cart: [] }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        })),
      setAdmin: (isAdmin) => set({ isAdmin }),
      showToast: (text, kind = 'success') => set({ toast: { id: Date.now(), text, kind } }),
    }),
    {
      name: 'gadget-shop',
      version: 2,
      // Навигацию не сохраняем: после перезапуска всегда открываем главную.
      partialize: (s) => ({ cart: s.cart, favorites: s.favorites }),
      // v1 хранил корзину без названий товаров: такие позиции просто отбрасываем.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as { cart?: CartItem[]; favorites?: string[] }
        if (version < 2) return { favorites: state.favorites ?? [], cart: [] }
        return state
      },
    },
  ),
)

export const cartCount = (cart: CartItem[]) => cart.reduce((n, c) => n + c.qty, 0)
export const cartTotal = (cart: CartItem[]) => cart.reduce((n, c) => n + c.qty * c.price, 0)

export const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} ₽`
