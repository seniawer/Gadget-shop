import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { findProduct } from '../data/products'

export type Screen =
  | { name: 'home' }
  | { name: 'catalog'; category?: string; query?: string }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'favorites' }
  | { name: 'repair' }
  | { name: 'success'; kind: 'order' | 'repair'; number: string }

export type CartItem = {
  key: string
  productId: string
  color: string
  memory?: string
  price: number
  qty: number
}

type State = {
  stack: Screen[]
  cart: CartItem[]
  favorites: string[]
  navigate(screen: Screen): void
  replace(screen: Screen): void
  back(): void
  reset(screen?: Screen): void
  addToCart(item: Omit<CartItem, 'key' | 'qty'>): void
  setQty(key: string, qty: number): void
  clearCart(): void
  toggleFavorite(id: string): void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      stack: [{ name: 'home' }],
      cart: [],
      favorites: [],
      navigate: (screen) => set((s) => ({ stack: [...s.stack, screen] })),
      replace: (screen) => set((s) => ({ stack: [...s.stack.slice(0, -1), screen] })),
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
    }),
    {
      name: 'gadget-shop',
      // Навигацию не сохраняем: после перезапуска всегда открываем главную.
      partialize: (s) => ({
        cart: s.cart.filter((c) => findProduct(c.productId)),
        favorites: s.favorites,
      }),
    },
  ),
)

export const useScreen = () => useStore((s) => s.stack[s.stack.length - 1])

export const cartCount = (cart: CartItem[]) => cart.reduce((n, c) => n + c.qty, 0)
export const cartTotal = (cart: CartItem[]) => cart.reduce((n, c) => n + c.qty * c.price, 0)

export const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} ₽`
