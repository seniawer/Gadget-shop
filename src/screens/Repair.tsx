import { useState } from 'react'
import { repairDevices, repairServices } from '../data/repair'
import { Chip, ChipRow, Field, Group, Header, MainButton, mainButtonSpace } from '../components/ui'
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
    <div className={mainButtonSpace}>
      <Header title="Ремонт" />
      <div className="mx-4 rounded-[20px] bg-gradient-to-br from-[#0071e3] to-[#42a1ff] p-5 text-white">
        <div className="text-[20px] font-bold tracking-tight">Починим быстро 🛠</div>
        <div className="mt-1 text-[15px] opacity-90">Бесплатная диагностика, качественные запчасти и гарантия на работу.</div>
      </div>

<div className="mt-6 mb-2 px-4 text-[13px] font-medium tracking-wide text-hint uppercase">Устройство</div>
      <ChipRow>
        {repairDevices.map((d) => (
          <Chip key={d} active={device === d} onClick={() => setDevice(d)}>
            {d}
          </Chip>
        ))}
      </ChipRow>

<div className="mt-6 mb-2 px-4 text-[13px] font-medium tracking-wide text-hint uppercase">Что случилось?</div>
      <Group>
        {repairServices.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              tg.haptic.select()
              setServiceId(s.id)
            }}
            className="flex w-full items-center gap-3 border-b border-sep px-4 py-3.5 text-left last:border-0"
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                s.id === serviceId ? 'border-accent' : 'border-hint/40'
              }`}
            >
              {s.id === serviceId && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
            </span>
            <span className="flex-1">
              <span className="block text-[16px]">{s.title}</span>
              <span className="block text-[13px] text-hint">{s.time}</span>
            </span>
            <span className="text-[15px] font-semibold">{s.from ? `от ${formatPrice(s.from)}` : 'Бесплатно'}</span>
          </button>
        ))}
      </Group>

<div className="mt-6 mb-2 px-4 text-[13px] font-medium tracking-wide text-hint uppercase">Контакты</div>
      <Group>
        <Field label="Имя" value={name} onChange={setName} />
        <Field label="Телефон" value={phone} onChange={setPhone} type="tel" placeholder="+7 900 000-00-00" />
        <Field label="Опишите проблему" value={comment} onChange={setComment} placeholder="Модель, что произошло" multiline />
      </Group>

      {error && <div className="mx-4 mt-3 text-[15px] text-danger">{error}</div>}

      <MainButton text="Записаться на ремонт" onClick={send} loading={loading} />
    </div>
  )
}
