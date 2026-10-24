import { useState } from 'react'
import { shop } from '../config'

/** Логотип магазина (аватар канала). Если файла нет, показываем первую букву названия. */
export function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size }
  if (!shop.logo || failed)
    return (
      <div style={{ ...style, fontSize: size * 0.45 }} className={`grid shrink-0 place-items-center rounded-full bg-text font-extrabold text-bg ${className}`}>
        {shop.name.slice(0, 1)}
      </div>
    )
  return <img src={shop.logo} alt={shop.name} style={style} onError={() => setFailed(true)} className={`shrink-0 rounded-full bg-white object-cover ring-1 ring-black/8 ${className}`} />
}
