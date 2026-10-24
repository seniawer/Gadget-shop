import { useEffect, useRef, useState } from 'react'
import type { Product } from '../../shared/catalog'
import { ProductImage } from './ProductImage'

/** Галерея фото со свайпом (scroll-snap) и точками-индикаторами. */
export function Gallery({ product, color, activePhoto }: { product: Product; color?: string; activePhoto?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const photos = product.photos.length ? product.photos : [undefined]

  // Выбрали цвет, у которого есть своё фото: листаем к нему.
  useEffect(() => {
    const el = ref.current
    const i = activePhoto ? product.photos.indexOf(activePhoto) : -1
    if (el && i >= 0) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }, [activePhoto, product.photos])

  return (
    <div className="card relative mx-4 overflow-hidden">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((photo, i) => (
          <div key={photo ?? i} className="h-full w-full shrink-0 snap-center">
            <ProductImage product={product} photo={photo} color={color} eager={i === 0} />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              aria-label={`Фото ${i + 1}`}
              onClick={() => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: 'smooth' })}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55'} shadow`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
