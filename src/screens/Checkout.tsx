import { useState } from 'react'
import { findProduct } from '../data/products'
import { Chip, Field, Header, MainButton } from '../components/ui'
import { cartTotal, formatPrice, useStore } from '../lib/store'
import { submit } from '../lib/api'
import { tg } from '../lib/telegram'
import { shop } from '../lib/config'

export const isPhone = (v: string) => v.replace(/\D/g, '').length >= 10

export function Checkout() {
  const cart = useStore((s) => s.cart)
  const clearCart = useStore((s) => s.clearCart)
  const reset = useStore((s) => s.reset)
  const user = tg.user
  const [name, setName] = useState(user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : '')
  const [phone, setPhone] = useState('')
  const [delivery, setDelivery] = useState<'pickup' | 'courier'>('pickup')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = cartTotal(cart)
  const valid = name.trim() && isPhone(phone) && (delivery === 'pickup' || address.trim())

  const send = async () => {
    if (!valid) {
      tg.haptic.error()
      setError('Заполните имя, телефон' + (delivery === 'courier' ? ' и адрес' : ''))
      return
    }
    setLoading(true)
    setError('')
    try {
      const number = await submit({
        kind: 'order',
        name: name.trim(),
        phone: phone.trim(),
        delivery,
        address: delivery === 'courier' ? address.trim() : undefined,
        comment: comment.trim() || undefined,
        items: cart.map((c) => ({
          title: findProduct(c.productId)?.title ?? c.productId,
          color: c.color,
          memory: c.memory,
          qty: c.qty,
          price: c.price,
        })),
        total,
      })
      tg.haptic.success()
      clearCart()
      reset({ name: 'success', kind: 'order', number })
    } catch (e) {
      tg.haptic.error()
      setError(e instanceof Error ? e.message : 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-28">
      <Header title="Оформление" />
      <div className="mx-4 overflow-hidden rounded-2xl bg-section">
        <Field label="Имя" value={name} onChange={setName} placeholder="Как к вам обращаться" />
        <Field label="Телефон" value={phone} onChange={setPhone} type="tel" placeholder="+7 900 000-00-00" />
      </div>

      <div className="mt-5 px-4 text-sm font-semibold">Получение</div>
      <div className="mt-2 flex gap-2 px-4">
        <Chip active={delivery === 'pickup'} onClick={() => setDelivery('pickup')}>
          🏬 Самовывоз
        </Chip>
        <Chip active={delivery === 'courier'} onClick={() => setDelivery('courier')}>
          🚚 Курьер
        </Chip>
      </div>
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-section">
        {delivery === 'pickup' ? (
          <div className="px-4 py-3 text-sm">
            {shop.address}
            <div className="text-hint">{shop.hours}</div>
          </div>
        ) : (
          <Field label="Адрес доставки" value={address} onChange={setAddress} placeholder="Улица, дом, квартира" />
        )}
        <Field label="Комментарий" value={comment} onChange={setComment} placeholder="Например, удобное время" multiline />
      </div>

      <div className="mx-4 mt-5 rounded-2xl bg-section p-4 text-sm">
        <div className="flex justify-between text-base font-bold">
          <span>К оплате</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mt-1 text-hint">Оплата при получении: наличными, картой или переводом. Менеджер свяжется для подтверждения.</div>
      </div>

      {error && <div className="mx-4 mt-3 text-sm text-danger">{error}</div>}

      <MainButton text="Подтвердить заказ" onClick={send} loading={loading} />
    </div>
  )
}
