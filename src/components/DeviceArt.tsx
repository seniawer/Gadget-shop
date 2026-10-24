import type { Product } from '../data/products'

// Векторная «фотография» товара: силуэт устройства, окрашенный в выбранный цвет.
// Для настоящего магазина замените на фото товара.

type Props = { product: Product; color?: string; className?: string }

const shade = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16)
  const c = (v: number) => Math.max(0, Math.min(255, v + amount))
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`
}

export function DeviceArt({ product, color, className = '' }: Props) {
  const hex = color ?? product.colors[0].hex
  const body = hex
  const edge = shade(hex, -40)
  const glass = '#0d0e12'
  const id = `g-${product.id}-${hex.slice(1)}`

  const art = (() => {
    switch (product.category) {
      case 'iphone':
        return (
          <g>
            <rect x="62" y="18" width="76" height="154" rx="16" fill={edge} />
            <rect x="65" y="21" width="70" height="148" rx="13" fill={`url(#${id})`} />
            <rect x="74" y="30" width="30" height="30" rx="9" fill={shade(hex, -25)} />
            <circle cx="83" cy="39" r="5.5" fill={glass} />
            <circle cx="95" cy="39" r="5.5" fill={glass} />
            <circle cx="83" cy="51" r="5.5" fill={glass} />
            <circle cx="96" cy="51" r="2" fill="#f5e6b8" />
          </g>
        )
      case 'mac':
        return (
          <g>
            <rect x="34" y="42" width="132" height="88" rx="8" fill={edge} />
            <rect x="38" y="46" width="124" height="80" rx="5" fill={glass} />
            <rect x="42" y="50" width="116" height="72" rx="3" fill={`url(#${id})`} opacity="0.85" />
            <path d="M22 132 h156 l-8 10 h-140 z" fill={body} />
            <rect x="88" y="132" width="24" height="3" rx="1.5" fill={edge} />
          </g>
        )
      case 'ipad':
        return (
          <g>
            <rect x="48" y="28" width="104" height="138" rx="12" fill={edge} />
            <rect x="52" y="32" width="96" height="130" rx="9" fill={glass} />
            <rect x="56" y="36" width="88" height="122" rx="6" fill={`url(#${id})`} opacity="0.9" />
          </g>
        )
      case 'watch':
        return (
          <g>
            <rect x="80" y="14" width="40" height="40" rx="8" fill={shade(hex, -15)} />
            <rect x="80" y="136" width="40" height="40" rx="8" fill={shade(hex, -15)} />
            <rect x="64" y="48" width="72" height="94" rx="20" fill={edge} />
            <rect x="68" y="52" width="64" height="86" rx="17" fill={glass} />
            <circle cx="100" cy="95" r="22" fill="none" stroke={`url(#${id})`} strokeWidth="5" />
            <rect x="136" y="78" width="5" height="16" rx="2.5" fill={edge} />
          </g>
        )
      case 'audio':
        return product.title.includes('Max') ? (
          <g>
            <path d="M58 104 a42 46 0 0 1 84 0" fill="none" stroke={edge} strokeWidth="9" strokeLinecap="round" />
            <rect x="44" y="96" width="34" height="56" rx="14" fill={`url(#${id})`} />
            <rect x="122" y="96" width="34" height="56" rx="14" fill={`url(#${id})`} />
          </g>
        ) : (
          <g>
            <rect x="56" y="80" width="88" height="70" rx="24" fill={`url(#${id})`} stroke={edge} strokeWidth="2" />
            <line x1="58" y1="104" x2="142" y2="104" stroke={edge} strokeWidth="2" />
            <circle cx="100" cy="125" r="3" fill={edge} />
            <path d="M78 76 q-4 -30 10 -40 q12 -4 10 12 v26" fill={body} stroke={edge} strokeWidth="2" />
            <path d="M122 76 q4 -30 -10 -40 q-12 -4 -10 12 v26" fill={body} stroke={edge} strokeWidth="2" />
          </g>
        )
      default:
        return (
          <g>
            <circle cx="100" cy="92" r="46" fill={`url(#${id})`} stroke={edge} strokeWidth="3" />
            <circle cx="100" cy="92" r="20" fill="none" stroke={edge} strokeWidth="3" opacity="0.5" />
            <path d="M100 138 v30" stroke={edge} strokeWidth="5" strokeLinecap="round" />
          </g>
        )
    }
  })()

  return (
    <svg viewBox="0 0 200 190" className={className} role="img" aria-label={product.title}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(hex, 30)} />
          <stop offset="1" stopColor={shade(hex, -20)} />
        </linearGradient>
      </defs>
      {art}
    </svg>
  )
}
