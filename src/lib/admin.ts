import { create } from 'zustand'
import type { Product } from '../../shared/catalog'
import { api } from './api'
import { useCatalog } from './catalog'

type AdminState = {
  products: Product[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  error?: string
  load(): Promise<void>
  upsert(product: Product): void
  remove(id: string): void
}

// Список товаров для админки (включая скрытые). После изменений обновляем и публичный каталог.
export const useAdmin = create<AdminState>()((set, get) => ({
  products: [],
  status: 'idle',
  async load() {
    if (get().status !== 'ready') set({ status: 'loading', error: undefined })
    try {
      set({ products: await api.admin.products(), status: 'ready' })
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  },
  upsert(product) {
    const exists = get().products.some((p) => p.id === product.id)
    set({ products: exists ? get().products.map((p) => (p.id === product.id ? product : p)) : [product, ...get().products] })
    refreshCatalog()
  },
  remove(id) {
    set({ products: get().products.filter((p) => p.id !== id) })
    refreshCatalog()
  },
}))

let timer: number | undefined
const refreshCatalog = () => {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => useCatalog.getState().load(), 800)
}
