import { ManagerButtons } from '../components/ManagerButtons'
import { MainButton } from '../components/ui'
import { useStore } from '../lib/store'
import { shop } from '../config'

export function Success({ kind, number }: { kind: 'order' | 'repair'; number: string }) {
  const reset = useStore((s) => s.reset)
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-[#34c759]/15 text-5xl">✅</div>
      <div className="mt-5 text-[28px] font-bold tracking-tight">{kind === 'order' ? 'Заказ оформлен!' : 'Вы записаны!'}</div>
      <div className="mt-1 text-[15px] text-hint">Номер заявки #{number}</div>
      <p className="mt-4 text-[17px] leading-relaxed">
        Менеджер свяжется с вами для подтверждения. {shop.responseTime}, {shop.hours.toLowerCase()}.
      </p>
      <ManagerButtons text={`Здравствуйте! Пишу по заявке #${number}`} className="mt-6 w-full" />
      <MainButton text="На главную" onClick={() => reset()} />
    </div>
  )
}
