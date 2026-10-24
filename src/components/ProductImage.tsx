import { useState } from 'react'
import { photoUrl, type Product } from '../../shared/catalog'
import { DeviceArt } from './DeviceArt'

type Props = {
  product: Pick<Product, 'id' | 'category' | 'title' | 'colors'>
  photo?: string
  color?: string
  eager?: boolean
  className?: string
}

/**
 * Фото товара с ленивой загрузкой. Контейнер задаёт соотношение сторон снаружи, поэтому вёрстка
 * не прыгает. Пока фото грузится или если его нет, показываем силуэт устройства.
 */
export function ProductImage({ product, photo, color, eager, className = '' }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showPhoto = photo && !failed

  return (
    <div className={`relative h-full w-full overflow-hidden bg-fill ${className}`}>
      {(!showPhoto || !loaded) && (
        <DeviceArt product={product} color={color} className={`absolute inset-0 h-full w-full p-[12%] ${showPhoto ? 'opacity-40' : ''}`} />
      )}
      {showPhoto && (
        <img
          src={photoUrl(photo)}
          alt={product.title}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
