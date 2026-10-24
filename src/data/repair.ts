// Прайс ремонта для экрана записи.

export type RepairService = { id: string; title: string; from: number; time: string }

export const repairDevices = ['iPhone', 'iPad', 'MacBook', 'Apple Watch', 'AirPods'] as const

export const repairServices: RepairService[] = [
  { id: 'battery', title: 'Замена аккумулятора', from: 2990, time: 'от 30 мин' },
  { id: 'screen', title: 'Замена дисплея', from: 6990, time: 'от 1 ч' },
  { id: 'glass', title: 'Замена заднего стекла', from: 3990, time: 'от 2 ч' },
  { id: 'port', title: 'Не заряжается / разъём', from: 1990, time: 'от 40 мин' },
  { id: 'camera', title: 'Ремонт камеры', from: 3490, time: 'от 1 ч' },
  { id: 'water', title: 'После попадания воды', from: 1490, time: 'диагностика' },
  { id: 'other', title: 'Другое / не знаю', from: 0, time: 'бесплатная диагностика' },
]
