import { useCatalog } from '../lib/catalog'
import { ProductGrid } from '../components/ProductCard'
import { Empty, Header, PillButton } from '../components/ui'
import { useStore } from '../lib/store'

export function Favorites() {
  const favorites = useStore((s) => s.favorites)
  const reset = useStore((s) => s.reset)
  const products = useCatalog((s) => s.products)
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
            <PillButton onClick={() => reset()}>В каталог</PillButton>
          }
        />
      )}
    </div>
  )
}
