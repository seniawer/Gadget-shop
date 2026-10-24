import { MainButton } from '../components/ui'
import { useStore } from '../lib/store'
import { tg } from '../lib/telegram'
import { shop } from '../lib/config'

export function Success({ kind, number }: { kind: 'order' | 'repair'; number: string }) {
  const reset = useStore((s) => s.reset)
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-8 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-500/15 text-5xl">✅</div>
      <div className="mt-5 text-2xl font-extrabold">{kind === 'order' ? 'Заказ оформлен!' : 'Вы записаны!'}</div>
      <div className="mt-1 text-hint">Номер заявки #{number}</div>
      <p className="mt-4 text-[15px]">
        Менеджер свяжется с вами в течение 5 минут для подтверждения. {shop.hours}.
      </p>
      <button onClick={() => tg.openChat(shop.manager)} className="mt-5 font-semibold text-link">
        Написать менеджеру
      </button>
      <MainButton text="На главную" onClick={() => reset()} />
    </div>
  )
}
