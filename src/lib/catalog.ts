import { create } from 'zustand'
import type { Product } from '../../shared/catalog'
import { seedProducts } from '../../shared/seed'
import { api, ApiError } from './api'

type CatalogState = {
  products: Product[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  error?: string
  load(): Promise<void>
}

export const useCatalog = create<CatalogState>()((set, get) => ({
  products: [],
  status: 'idle',
  async load() {
    if (get().status !== 'ready') set({ status: 'loading', error: undefined })
    try {
      set({ products: await api.products(), status: 'ready' })
    } catch (e) {
      // Повторная загрузка не удалась: оставляем то, что уже показано.
      if (get().status === 'ready') return
      // Без бэкенда (`vite preview`) или при сбое сервера показываем стартовый каталог, чтобы витрина не пустела.
      if (e instanceof ApiError && (e.status === 404 || e.status >= 500)) {
        console.warn('Каталог недоступен, показываем стартовый:', e.message)
        set({ products: seedProducts(), status: 'ready' })
      } else set({ status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  },
}))

export const useProduct = (id: string) => useCatalog((s) => s.products.find((p) => p.id === id))
