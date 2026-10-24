import { availability, type Product } from '../../shared/catalog'

const styles = {
  in_stock: 'text-[#248a3d] bg-[#34c759]/12 dark:text-[#30d158]',
  few: 'text-[#c93400] bg-[#ff9500]/14 dark:text-[#ff9f0a]',
  out: 'text-hint bg-fill',
  preorder: 'text-link bg-accent/12',
}

export function StatusBadge({ product, className = '' }: { product: Pick<Product, 'quantity' | 'preorder'>; className?: string }) {
  const a = availability(product)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${styles[a.kind]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {a.label}
    </span>
  )
}
