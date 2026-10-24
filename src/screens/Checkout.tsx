import { useState } from 'react'
import { Chip, Field, Group, Header, MainButton, mainButtonSpace } from '../components/ui'
import { cartTotal, formatPrice, useStore } from '../lib/store'
import { submit } from '../lib/api'
import { tg } from '../lib/telegram'
import { shop } from '../config'

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
          title: c.title,
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
    <div className={mainButtonSpace}>
      <Header title="Оформление" />
      <Group>
        <Field label="Имя" value={name} onChange={setName} placeholder="Как к вам обращаться" />
        <Field label="Телефон" value={phone} onChange={setPhone} type="tel" placeholder="+7 900 000-00-00" />
      </Group>

      <div className="mt-6 px-4 text-[13px] font-medium tracking-wide text-hint uppercase">Получение</div>
      <div className="mt-2 flex gap-2 px-4">
        <Chip active={delivery === 'pickup'} onClick={() => setDelivery('pickup')}>
          🏬 Самовывоз
        </Chip>
        <Chip active={delivery === 'courier'} onClick={() => setDelivery('courier')}>
          🚚 Курьер
        </Chip>
      </div>
      <Group className="mt-3">
        {delivery === 'pickup' ? (
          <div className="border-b border-sep px-4 py-3 text-[15px]">
            {shop.address || 'Адрес магазина подскажет менеджер'}
            <div className="text-hint">{shop.hours}</div>
          </div>
        ) : (
          <Field label="Адрес доставки" value={address} onChange={setAddress} placeholder="Улица, дом, квартира" />
        )}
        <Field label="Комментарий" value={comment} onChange={setComment} placeholder="Например, удобное время" multiline />
      </Group>

      <div className="card mx-4 mt-5 p-4 text-[15px]">
        <div className="flex justify-between text-base font-bold">
          <span>К оплате</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mt-1 text-hint">Оплата при получении: наличными, картой или переводом. Менеджер свяжется для подтверждения.</div>
      </div>

      {error && <div className="mx-4 mt-3 text-[15px] text-danger">{error}</div>}

      <MainButton text="Подтвердить заказ" onClick={send} loading={loading} />
    </div>
  )
}
