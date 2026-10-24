import { products } from '../data/products'
import { ProductGrid } from '../components/ProductCard'
import { Empty, Header } from '../components/ui'
import { useStore } from '../lib/store'

export function Favorites() {
  const favorites = useStore((s) => s.favorites)
  const reset = useStore((s) => s.reset)
  const list = products.filter((p) => favorites.includes(p.id))

  return (
    <div className="pb-6">
      <Header title="Избранное" />
      {list.length ? (
        <ProductGrid products={list} />
      ) : (
        <Empty
          emoji="🤍"
          title="Пока пусто"
          text="Нажимайте на сердечко у товаров, чтобы сохранить их здесь"
          action={
            <button onClick={() => reset({ name: 'catalog' })} className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-text">
              В каталог
            </button>
          }
        />
      )}
    </div>
  )
}
