import { useState } from 'react'
import { repairDevices, repairServices } from '../data/products'
import { Chip, Field, Header, MainButton } from '../components/ui'
import { formatPrice, useStore } from '../lib/store'
import { submit } from '../lib/api'
import { tg } from '../lib/telegram'
import { isPhone } from './Checkout'

export function Repair() {
  const reset = useStore((s) => s.reset)
  const user = tg.user
  const [device, setDevice] = useState<string>(repairDevices[0])
  const [serviceId, setServiceId] = useState(repairServices[0].id)
  const [name, setName] = useState(user?.first_name ?? '')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const service = repairServices.find((s) => s.id === serviceId)!

  const send = async () => {
    if (!name.trim() || !isPhone(phone)) {
      tg.haptic.error()
      setError('Укажите имя и телефон')
      return
    }
    setLoading(true)
    setError('')
    try {
      const number = await submit({
        kind: 'repair',
        name: name.trim(),
        phone: phone.trim(),
        device,
        service: service.title,
        comment: comment.trim() || undefined,
      })
      tg.haptic.success()
      reset({ name: 'success', kind: 'repair', number })
    } catch (e) {
      tg.haptic.error()
      setError(e instanceof Error ? e.message : 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-28">
      <Header title="Ремонт" />
      <div className="mx-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-4 text-white">
        <div className="text-lg font-bold">Ремонт техники Apple</div>
        <div className="mt-1 text-sm opacity-90">Бесплатная диагностика, оригинальные запчасти, гарантия до 6 месяцев.</div>
      </div>

      <div className="mt-5 px-4 text-sm font-semibold">Устройство</div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4">
        {repairDevices.map((d) => (
          <Chip key={d} active={device === d} onClick={() => setDevice(d)}>
            {d}
          </Chip>
        ))}
      </div>

      <div className="mt-5 px-4 text-sm font-semibold">Что случилось?</div>
      <div className="mx-4 mt-2 overflow-hidden rounded-2xl bg-section">
        {repairServices.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              tg.haptic.select()
              setServiceId(s.id)
            }}
            className="flex w-full items-center gap-3 border-b border-hint/15 px-4 py-3 text-left last:border-0"
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                s.id === serviceId ? 'border-accent' : 'border-hint/40'
              }`}
            >
              {s.id === serviceId && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
            </span>
            <span className="flex-1">
              <span className="block text-[15px]">{s.title}</span>
              <span className="block text-xs text-hint">{s.time}</span>
            </span>
            <span className="text-sm font-semibold">{s.from ? `от ${formatPrice(s.from)}` : 'Бесплатно'}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 px-4 text-sm font-semibold">Контакты</div>
      <div className="mx-4 mt-2 overflow-hidden rounded-2xl bg-section">
        <Field label="Имя" value={name} onChange={setName} />
        <Field label="Телефон" value={phone} onChange={setPhone} type="tel" placeholder="+7 900 000-00-00" />
        <Field label="Опишите проблему" value={comment} onChange={setComment} placeholder="Модель, что произошло" multiline />
      </div>

      {error && <div className="mx-4 mt-3 text-sm text-danger">{error}</div>}

      <MainButton text="Записаться на ремонт" onClick={send} loading={loading} />
    </div>
  )
}
