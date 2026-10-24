// Стартовый каталог. При первом запуске сервер переносит эти товары в хранилище,
// дальше ими управляют из админки. Линейка и цены на iPhone взяты из прайсов канала @gadget_58
// (октябрь 2026), остальные цены ориентировочные. Б/у — реальное наличие из канала, цена по запросу.

import type { Color, MemoryOption, Product } from './catalog'

type SeedProduct = Omit<Product, 'quantity' | 'photos' | 'createdAt' | 'updatedAt' | 'hidden' | 'preorder'>

const white: Color[] = [{ name: 'Белый', hex: '#f4f4f2' }]

const gb = (n: number) => (n >= 1024 ? `${n / 1024} ТБ` : `${n} ГБ`)
/** Варианты памяти: список объёмов и доплаты к базовой цене. */
const mem = (...options: [number, number][]): MemoryOption[] => options.map(([size, delta]) => ({ label: gb(size), delta }))

const pro18Colors: Color[] = [
  { name: 'Бордовый', hex: '#6b2737' },
  { name: 'Ледниковый', hex: '#cddde6' },
  { name: 'Серебристый', hex: '#e3e4e6' },
  { name: 'Чёрный', hex: '#2b2b2e' },
]
const pro17Colors: Color[] = [
  { name: 'Космический оранжевый', hex: '#e8743b' },
  { name: 'Глубокий синий', hex: '#2c3e63' },
  { name: 'Серебристый', hex: '#e3e4e6' },
]
const simNote = 'Есть версии SIM + eSIM и только eSIM, цены немного отличаются: уточняйте у менеджера.'

/** Б/у iPhone из актуального наличия: цену магазин сообщает в личных сообщениях. */
const used = (
  id: string,
  title: string,
  memory: number[],
  color: Color,
  battery: number,
  note: string,
  specs: [string, string][],
  grade?: string,
): SeedProduct => ({
  id,
  category: 'iphone',
  title,
  price: 0,
  condition: 'used',
  colors: [color],
  memory: mem(...memory.map((m) => [m, 0] as [number, number])),
  used: { battery, grade },
  specs,
  description: `${note} Можно проверить перед покупкой. Стоимость подскажет менеджер: нажмите «Узнать цену».`,
})

const raw: SeedProduct[] = [
  {
    id: 'iphone-18-pro-max',
    category: 'iphone',
    title: 'iPhone 18 Pro Max',
    price: 209900,
    condition: 'new',
    colors: pro18Colors,
    memory: mem([256, 0], [512, 47000], [1024, 96000], [2048, 191000]),
    tags: ['hit', 'new'],
    specs: [
      ['Экран', '6,9″ Super Retina XDR, ProMotion 120 Гц'],
      ['Процессор', 'A20 Pro'],
      ['Камера', '48 + 48 + 48 Мп, переменная диафрагма, зум 4×'],
      ['Видео', 'до 45 ч'],
      ['Память', 'до 2 ТБ'],
    ],
    description: `Новый флагман уже в наличии. Главная камера с переменной диафрагмой, телевик 48 Мп и рекордная автономность: до 45 часов видео. ${simNote}`,
  },
  {
    id: 'iphone-18-pro',
    category: 'iphone',
    title: 'iPhone 18 Pro',
    price: 166900,
    condition: 'new',
    colors: pro18Colors,
    memory: mem([256, 0], [512, 24000], [1024, 83000]),
    tags: ['hit', 'new'],
    specs: [
      ['Экран', '6,3″ Super Retina XDR, ProMotion 120 Гц'],
      ['Процессор', 'A20 Pro'],
      ['Камера', '48 + 48 + 48 Мп, зум 4×'],
      ['Видео', 'до 36 ч'],
      ['Вес', '211 г'],
    ],
    description: `Всё лучшее из 18 Pro Max в корпусе, который удобно держать одной рукой. ${simNote}`,
  },
  {
    id: 'iphone-duo',
    category: 'iphone',
    title: 'iPhone Duo',
    price: 0,
    condition: 'new',
    colors: [
      { name: 'Ночное небо', hex: '#22293a' },
      { name: 'Звёздный белый', hex: '#f1efe9' },
    ],
    memory: mem([256, 0], [512, 0], [1024, 0], [2048, 0]),
    tags: ['new'],
    specs: [
      ['Экраны', '7,6″ внутренний и 5,4″ внешний'],
      ['Процессор', 'A20 Pro'],
      ['Камера', '48 + 48 Мп'],
      ['Корпус', 'Титан, IP68'],
      ['Разблокировка', 'Touch ID в боковой кнопке'],
    ],
    description: 'Первый складной iPhone: раскрывается в планшет с экраном 7,6″ и фиксируется под разными углами. Принимаем предзаказы, цену и сроки подскажет менеджер.',
  },
  {
    id: 'iphone-17-pro-max',
    category: 'iphone',
    title: 'iPhone 17 Pro Max',
    price: 110800,
    oldPrice: 112800,
    condition: 'new',
    colors: pro17Colors,
    memory: mem([256, 0], [512, 17000], [1024, 33000], [2048, 58000]),
    tags: ['sale'],
    specs: [
      ['Экран', '6,9″ Super Retina XDR, 120 Гц'],
      ['Процессор', 'A19 Pro'],
      ['Камера', '48 + 48 + 48 Мп, зум 8×'],
      ['Корпус', 'Алюминий'],
    ],
    description: `Прошлый флагман по сниженной цене, пока есть в наличии. ${simNote}`,
  },
  {
    id: 'iphone-17-pro',
    category: 'iphone',
    title: 'iPhone 17 Pro',
    price: 99800,
    oldPrice: 101800,
    condition: 'new',
    colors: pro17Colors,
    memory: mem([256, 0], [512, 15500], [1024, 31000]),
    tags: ['sale'],
    specs: [
      ['Экран', '6,3″ Super Retina XDR, 120 Гц'],
      ['Процессор', 'A19 Pro'],
      ['Камера', '48 + 48 + 48 Мп'],
      ['Корпус', 'Алюминий'],
    ],
    description: `Компактный Pro по специальной цене, количество ограничено. ${simNote}`,
  },
  {
    id: 'iphone-air',
    category: 'iphone',
    title: 'iPhone Air',
    price: 75900,
    condition: 'new',
    colors: [
      { name: 'Небесно-голубой', hex: '#cfe0f0' },
      { name: 'Светлое золото', hex: '#ecdcc0' },
      { name: 'Облачно-белый', hex: '#f4f4f2' },
      { name: 'Космический чёрный', hex: '#26272b' },
    ],
    memory: mem([256, 0], [512, 6000], [1024, 18000]),
    specs: [
      ['Экран', '6,5″ ProMotion, 120 Гц'],
      ['Процессор', 'A19 Pro'],
      ['Толщина', '5,6 мм'],
      ['Камера', '48 Мп'],
    ],
    description: 'Самый тонкий iPhone: 5,6 мм и 165 г. Титановая рамка и большой экран.',
  },
  {
    id: 'iphone-17',
    category: 'iphone',
    title: 'iPhone 17',
    price: 74900,
    oldPrice: 76900,
    condition: 'new',
    colors: [
      { name: 'Лавандовый', hex: '#d6cbe6' },
      { name: 'Шалфей', hex: '#bfcdb4' },
      { name: 'Туманно-голубой', hex: '#b7c9da' },
      { name: 'Белый', hex: '#f3f3f3' },
      { name: 'Чёрный', hex: '#2b2b2e' },
    ],
    memory: mem([256, 0], [512, 15000]),
    tags: ['hit'],
    specs: [
      ['Экран', '6,3″ ProMotion, 120 Гц'],
      ['Процессор', 'A19'],
      ['Камера', '48 + 48 Мп'],
      ['Фронтальная', '18 Мп Center Stage'],
    ],
    description: `Самый сбалансированный iPhone: экран 120 Гц, две камеры по 48 Мп и 256 ГБ памяти в базе. ${simNote}`,
  },
  {
    id: 'iphone-17e',
    category: 'iphone',
    title: 'iPhone 17e',
    price: 52900,
    condition: 'new',
    colors: [
      { name: 'Нежно-розовый', hex: '#f1d3d6' },
      { name: 'Белый', hex: '#f3f3f3' },
      { name: 'Чёрный', hex: '#2b2b2e' },
    ],
    memory: mem([256, 0], [512, 12000]),
    specs: [
      ['Экран', '6,1″ Super Retina XDR'],
      ['Процессор', 'A19'],
      ['Камера', '48 Мп'],
      ['Зарядка', 'MagSafe'],
    ],
    description: 'Самый доступный новый iPhone с актуальным процессором и 256 ГБ памяти.',
  },
  {
    id: 'iphone-16',
    category: 'iphone',
    title: 'iPhone 16',
    price: 55900,
    condition: 'new',
    colors: [
      { name: 'Ультрамарин', hex: '#7a86dc' },
      { name: 'Бирюзовый', hex: '#a5cdc8' },
      { name: 'Розовый', hex: '#f2c3d1' },
      { name: 'Чёрный', hex: '#2b2b2e' },
      { name: 'Белый', hex: '#f3f3f3' },
    ],
    memory: mem([128, 0], [256, 9000]),
    specs: [
      ['Экран', '6,1″ Super Retina XDR'],
      ['Процессор', 'A18'],
      ['Камера', '48 + 12 Мп'],
      ['Кнопка', 'Camera Control'],
    ],
    description: 'Проверенная модель по хорошей цене. Кнопка управления камерой и яркие цвета.',
  },
  {
    id: 'macbook-neo',
    category: 'mac',
    title: 'MacBook Neo 13″',
    price: 59990,
    condition: 'new',
    colors: [
      { name: 'Серебристый', hex: '#d9d9de' },
      { name: 'Румяный', hex: '#efccc6' },
      { name: 'Цитрус', hex: '#e9e08f' },
      { name: 'Индиго', hex: '#4b5089' },
    ],
    memory: [{ label: '8 / 256 ГБ', delta: 0 }],
    tags: ['new'],
    specs: [
      ['Экран', '13″ Liquid Retina'],
      ['Чип', 'A18 Pro'],
      ['Память', '8 ГБ / 256 ГБ'],
      ['Автономность', 'до 16 ч'],
    ],
    description: 'Самый доступный Mac в ярких цветах. Для учёбы, документов и сериалов.',
  },
  {
    id: 'macbook-air-13-m5',
    category: 'mac',
    title: 'MacBook Air 13″ M5',
    price: 109990,
    condition: 'new',
    colors: [
      { name: 'Небесно-голубой', hex: '#b8cde0' },
      { name: 'Серебристый', hex: '#d9d9de' },
      { name: 'Сияющая звезда', hex: '#e9dfcf' },
      { name: 'Тёмная ночь', hex: '#2e3440' },
    ],
    memory: [
      { label: '16 / 512 ГБ', delta: 0 },
      { label: '24 / 1 ТБ', delta: 40000 },
    ],
    tags: ['hit'],
    specs: [
      ['Экран', '13,6″ Liquid Retina'],
      ['Чип', 'Apple M5'],
      ['Память', 'от 16 ГБ / 512 ГБ'],
      ['Автономность', 'до 18 ч'],
    ],
    description: 'Лёгкий и тихий ноутбук без вентилятора. Хватит на весь день работы.',
  },
  {
    id: 'macbook-air-15-m5',
    category: 'mac',
    title: 'MacBook Air 15″ M5',
    price: 129990,
    condition: 'new',
    colors: [
      { name: 'Небесно-голубой', hex: '#b8cde0' },
      { name: 'Сияющая звезда', hex: '#e9dfcf' },
      { name: 'Тёмная ночь', hex: '#2e3440' },
      { name: 'Серебристый', hex: '#d9d9de' },
    ],
    memory: [
      { label: '16 / 512 ГБ', delta: 0 },
      { label: '24 / 1 ТБ', delta: 40000 },
    ],
    specs: [
      ['Экран', '15,3″ Liquid Retina'],
      ['Чип', 'Apple M5'],
      ['Память', 'от 16 ГБ / 512 ГБ'],
      ['Автономность', 'до 18 ч'],
    ],
    description: 'Большой экран в тонком корпусе. Шесть динамиков и автономность до 18 часов.',
  },
  {
    id: 'macbook-pro-14-m5',
    category: 'mac',
    title: 'MacBook Pro 14″ M5',
    price: 169990,
    condition: 'new',
    colors: [
      { name: 'Чёрный космос', hex: '#2c2c2e' },
      { name: 'Серебристый', hex: '#d9d9de' },
    ],
    memory: [
      { label: '16 ГБ / 1 ТБ', delta: 0 },
      { label: '24 ГБ / 1 ТБ', delta: 25000 },
    ],
    specs: [
      ['Экран', '14,2″ Liquid Retina XDR'],
      ['Чип', 'Apple M5'],
      ['Память', 'от 16 ГБ / 1 ТБ'],
      ['Автономность', 'до 24 ч'],
    ],
    description: 'Профессиональный ноутбук с экраном XDR и активным охлаждением для долгих нагрузок.',
  },
  {
    id: 'macbook-pro-16-m5-pro',
    category: 'mac',
    title: 'MacBook Pro 16″ M5 Pro',
    price: 279990,
    condition: 'new',
    colors: [
      { name: 'Чёрный космос', hex: '#2c2c2e' },
      { name: 'Серебристый', hex: '#d9d9de' },
    ],
    memory: [{ label: '24 ГБ / 1 ТБ', delta: 0 }],
    specs: [
      ['Экран', '16,2″ Liquid Retina XDR'],
      ['Чип', 'Apple M5 Pro'],
      ['Память', '24 ГБ / 1 ТБ'],
      ['Автономность', 'до 24 ч'],
    ],
    description: 'Максимум экрана и производительности для монтажа, 3D и разработки. Под заказ, срок уточняйте у менеджера.',
  },
  {
    id: 'ipad-pro-11-m5',
    category: 'ipad',
    title: 'iPad Pro 11″ M5',
    price: 99990,
    condition: 'new',
    colors: [
      { name: 'Чёрный космос', hex: '#2c2c2e' },
      { name: 'Серебристый', hex: '#d9d9de' },
    ],
    memory: mem([256, 0], [512, 20000], [1024, 55000]),
    specs: [
      ['Экран', '11″ Ultra Retina XDR (OLED)'],
      ['Чип', 'Apple M5'],
      ['Стилус', 'Apple Pencil Pro'],
      ['Толщина', '5,3 мм'],
    ],
    description: 'Самый мощный и тонкий iPad с OLED-экраном. Заменит ноутбук с клавиатурой Magic Keyboard.',
  },
  {
    id: 'ipad-air-11-m4',
    category: 'ipad',
    title: 'iPad Air 11″ M4',
    price: 62990,
    condition: 'new',
    colors: [
      { name: 'Серый космос', hex: '#6e6e73' },
      { name: 'Голубой', hex: '#a9c0d8' },
      { name: 'Фиолетовый', hex: '#c8b9da' },
      { name: 'Сияющая звезда', hex: '#e9dfcf' },
    ],
    memory: mem([128, 0], [256, 10000], [512, 30000]),
    tags: ['new'],
    specs: [
      ['Экран', '11″ Liquid Retina'],
      ['Чип', 'Apple M4'],
      ['Стилус', 'Apple Pencil Pro'],
    ],
    description: 'Производительность уровня Pro по доступной цене. Отличный выбор для учёбы и рисования.',
  },
  {
    id: 'ipad-11-a16',
    category: 'ipad',
    title: 'iPad 11″ (A16)',
    price: 36990,
    condition: 'new',
    colors: [
      { name: 'Голубой', hex: '#9fc2e2' },
      { name: 'Розовый', hex: '#f0c4cd' },
      { name: 'Жёлтый', hex: '#f3dd8c' },
      { name: 'Серебристый', hex: '#d9d9de' },
    ],
    memory: mem([128, 0], [256, 10000]),
    tags: ['hit'],
    specs: [
      ['Экран', '11″ Liquid Retina'],
      ['Чип', 'A16'],
      ['Стилус', 'Apple Pencil (USB-C)'],
    ],
    description: 'Универсальный планшет для учёбы, фильмов и игр. Самый популярный iPad.',
  },
  {
    id: 'ipad-mini-a17',
    category: 'ipad',
    title: 'iPad mini (A17 Pro)',
    price: 49990,
    condition: 'new',
    colors: [
      { name: 'Серый космос', hex: '#6e6e73' },
      { name: 'Голубой', hex: '#a9c0d8' },
      { name: 'Фиолетовый', hex: '#c8b9da' },
      { name: 'Сияющая звезда', hex: '#e9dfcf' },
    ],
    memory: mem([128, 0], [256, 10000]),
    specs: [
      ['Экран', '8,3″ Liquid Retina'],
      ['Чип', 'A17 Pro'],
      ['Стилус', 'Apple Pencil Pro'],
    ],
    description: 'Компактный iPad, который помещается в карман куртки. Удобно читать и делать заметки.',
  },
  {
    id: 'watch-ultra-4',
    category: 'watch',
    title: 'Apple Watch Ultra 4',
    price: 84990,
    condition: 'new',
    colors: [
      { name: 'Натуральный титан', hex: '#cbc5ba' },
      { name: 'Чёрный титан', hex: '#2b2b2e' },
    ],
    memory: [{ label: '49 мм', delta: 0 }],
    tags: ['new'],
    specs: [
      ['Корпус', 'Титан, 49 мм'],
      ['Автономность', 'до 2 дней'],
      ['Защита', 'WR100, дайвинг до 40 м'],
      ['Связь', 'Спутниковая SOS'],
    ],
    description: 'Самые выносливые Apple Watch: два дня без подзарядки, яркий экран и титановый корпус.',
  },
  {
    id: 'watch-s12',
    category: 'watch',
    title: 'Apple Watch Series 12',
    price: 42990,
    condition: 'new',
    colors: [
      { name: 'Светлое золото', hex: '#e6d3b3' },
      { name: 'Чёрный', hex: '#2b2b2e' },
      { name: 'Серый космос', hex: '#6e6e73' },
      { name: 'Ночной синий', hex: '#2d3753' },
    ],
    memory: [
      { label: '42 мм', delta: 0 },
      { label: '46 мм', delta: 3000 },
    ],
    tags: ['new'],
    specs: [
      ['Экран', 'Always-On Retina'],
      ['Здоровье', 'Пульс, ЭКГ, сон, давление'],
      ['Защита', 'WR50'],
    ],
    description: 'Новое поколение с улучшенными датчиками здоровья.',
  },
  {
    id: 'watch-se-3',
    category: 'watch',
    title: 'Apple Watch SE 3',
    price: 26990,
    condition: 'new',
    colors: [
      { name: 'Сияющая звезда', hex: '#e9dfcf' },
      { name: 'Тёмная ночь', hex: '#2e3440' },
    ],
    memory: [
      { label: '40 мм', delta: 0 },
      { label: '44 мм', delta: 3000 },
    ],
    specs: [
      ['Экран', 'Always-On Retina'],
      ['Здоровье', 'Пульс, сон, обнаружение падения'],
      ['Защита', 'WR50'],
    ],
    description: 'Доступные Apple Watch со всеми базовыми функциями. Хороший первый смарт-часы.',
  },
  {
    id: 'airpods-pro-3',
    category: 'audio',
    title: 'AirPods Pro 3',
    price: 17500,
    condition: 'new',
    colors: white,
    tags: ['hit'],
    specs: [
      ['Шумоподавление', 'Лучшее в линейке AirPods'],
      ['Автономность', 'до 8 ч, с кейсом до 24 ч'],
      ['Датчик', 'Пульс'],
      ['Кейс', 'MagSafe'],
    ],
    description: 'Лучшее шумоподавление среди AirPods, режим слухового аппарата и измерение пульса на тренировках.',
  },
  {
    id: 'airpods-5',
    category: 'audio',
    title: 'AirPods 5',
    price: 14500,
    condition: 'new',
    colors: white,
    tags: ['new'],
    specs: [
      ['Шумоподавление', 'Активное, в 1,5 раза сильнее AirPods 4'],
      ['Автономность', 'до 4 ч, с кейсом до 20 ч'],
      ['Кейс', 'USB-C'],
    ],
    description: 'Новые открытые AirPods: шумоподавление теперь в каждой модели.',
  },
  {
    id: 'airpods-max-2',
    category: 'audio',
    title: 'AirPods Max 2',
    price: 54900,
    condition: 'new',
    colors: [
      { name: 'Чёрный', hex: '#2b2b2e' },
      { name: 'Звёздная пыль', hex: '#d9d3c9' },
      { name: 'Синий', hex: '#90b0d6' },
      { name: 'Оранжевый', hex: '#f0a66c' },
    ],
    tags: ['new'],
    specs: [
      ['Тип', 'Полноразмерные'],
      ['Шумоподавление', 'в 1,5 раза сильнее прошлого поколения'],
      ['Автономность', 'до 20 ч'],
    ],
    description: 'Второе поколение полноразмерных AirPods: сильнее шумоподавление и новые цвета.',
  },
  {
    id: 'case-18-pro',
    category: 'accessories',
    title: 'Силиконовый чехол MagSafe для iPhone 18 Pro',
    price: 4490,
    condition: 'new',
    colors: [{ name: 'Голубой', hex: '#cfe0f0' }],
    specs: [
      ['Материал', 'Силикон, микрофибра внутри'],
      ['MagSafe', 'Да'],
    ],
    description: 'Оригинальный чехол: приятный на ощупь и не мешает беспроводной зарядке.',
  },
  {
    id: 'magsafe-charger',
    category: 'accessories',
    title: 'Зарядка MagSafe 25 Вт',
    price: 4990,
    condition: 'new',
    colors: white,
    specs: [
      ['Мощность', 'до 25 Вт'],
      ['Кабель', '1 м, USB-C'],
      ['Совместимость', 'iPhone 12 и новее'],
    ],
    description: 'Магнитная беспроводная зарядка. Быстро заряжает iPhone 16, 17 и 18.',
  },
  {
    id: 'adapter-20w',
    category: 'accessories',
    title: 'Адаптер питания USB-C 20 Вт',
    price: 1990,
    condition: 'new',
    colors: white,
    specs: [
      ['Мощность', '20 Вт'],
      ['Разъём', 'USB-C'],
    ],
    description: 'Оригинальный блок для быстрой зарядки iPhone и iPad.',
  },
  {
    id: 'cable-usb-c',
    category: 'accessories',
    title: 'Кабель USB-C, 1 м',
    price: 1990,
    condition: 'new',
    colors: white,
    specs: [
      ['Длина', '1 м'],
      ['Мощность', 'до 60 Вт'],
      ['Оплётка', 'Тканевая'],
    ],
    description: 'Плетёный кабель Apple для iPhone, iPad и MacBook.',
  },
  {
    id: 'pencil-pro',
    category: 'accessories',
    title: 'Apple Pencil Pro',
    price: 11990,
    condition: 'new',
    colors: white,
    specs: [
      ['Совместимость', 'iPad Pro M4/M5, iPad Air M2–M4, iPad mini A17 Pro'],
      ['Функции', 'Сжатие, вращение, тактильный отклик'],
    ],
    description: 'Стилус для рисования и заметок с поддержкой жестов.',
  },
  {
    id: 'pencil-usb-c',
    category: 'accessories',
    title: 'Apple Pencil (USB-C)',
    price: 7490,
    condition: 'new',
    colors: white,
    specs: [
      ['Совместимость', 'iPad (A16), iPad Air, iPad Pro, iPad mini, iPhone Duo'],
      ['Зарядка', 'USB-C'],
    ],
    description: 'Доступный стилус для учёбы и заметок. Работает и с новым iPhone Duo.',
  },
  {
    id: 'airtag',
    category: 'accessories',
    title: 'AirTag',
    price: 3490,
    condition: 'new',
    colors: white,
    memory: [
      { label: '1 шт', delta: 0 },
      { label: '4 шт', delta: 7500 },
    ],
    specs: [
      ['Поиск', 'Сеть «Локатор»'],
      ['Батарея', 'CR2032, около года'],
    ],
    description: 'Метка, чтобы не терять ключи, сумку или чемодан. Показывает, где вещь, прямо в «Локаторе».',
  },
  used('used-iphone-17-512', 'iPhone 17', [512], { name: 'Белый', hex: '#f3f3f3' }, 100, 'Практически новый: всего 2 цикла зарядки.', [
    ['Экран', '6,3″ ProMotion, 120 Гц'],
    ['Процессор', 'A19'],
    ['Камера', '48 + 48 Мп'],
  ], 'Как новый'),
  used('used-iphone-16-pro-max', 'iPhone 16 Pro Max', [256, 512], { name: 'Белый титан', hex: '#ecebe6' }, 89, 'В наличии 2 шт.: 256 ГБ (аккумулятор 88%) и 512 ГБ (89%).', [
    ['Экран', '6,9″ ProMotion, 120 Гц'],
    ['Процессор', 'A18 Pro'],
    ['Камера', '48 + 48 + 12 Мп, зум 5×'],
  ]),
  used('used-iphone-15-pro-max', 'iPhone 15 Pro Max', [256], { name: 'Синий титан', hex: '#3f4a5c' }, 85, 'В наличии 2 шт.: аккумулятор 85% и 84%.', [
    ['Экран', '6,7″ ProMotion, 120 Гц'],
    ['Процессор', 'A17 Pro'],
    ['Камера', '48 + 12 + 12 Мп, зум 5×'],
  ]),
  used('used-iphone-15-pro-256', 'iPhone 15 Pro', [256], { name: 'Синий титан', hex: '#3f4a5c' }, 79, 'Аккумулятор 79%.', [
    ['Экран', '6,1″ ProMotion, 120 Гц'],
    ['Процессор', 'A17 Pro'],
    ['Корпус', 'Титан'],
  ]),
  used('used-iphone-15-pro-128', 'iPhone 15 Pro', [128], { name: 'Натуральный титан', hex: '#a8a49c' }, 81, 'Аккумулятор 81%.', [
    ['Экран', '6,1″ ProMotion, 120 Гц'],
    ['Процессор', 'A17 Pro'],
    ['Корпус', 'Титан'],
  ]),
  used('used-iphone-14-pro-max-silver', 'iPhone 14 Pro Max', [256], { name: 'Серебристый', hex: '#e3e4e6' }, 79, 'Аккумулятор 79%.', [
    ['Экран', '6,7″ ProMotion, Always-On'],
    ['Процессор', 'A16 Bionic'],
    ['Камера', '48 + 12 + 12 Мп'],
  ]),
  used('used-iphone-14-pro-max-black', 'iPhone 14 Pro Max', [256], { name: 'Космический чёрный', hex: '#2f2e33' }, 74, 'Аккумулятор 74%, его можно заменить у нас в сервисе.', [
    ['Экран', '6,7″ ProMotion, Always-On'],
    ['Процессор', 'A16 Bionic'],
    ['Камера', '48 + 12 + 12 Мп'],
  ]),
  used('used-iphone-13-pro-max', 'iPhone 13 Pro Max', [128], { name: 'Небесно-голубой', hex: '#a7c1d9' }, 77, 'В наличии 2 шт.: аккумулятор 77% и 73%.', [
    ['Экран', '6,7″ ProMotion, 120 Гц'],
    ['Процессор', 'A15 Bionic'],
    ['Камера', '12 + 12 + 12 Мп, зум 3×'],
  ]),
  {
    id: 'dyson-airwrap',
    category: 'gadgets',
    title: 'Стайлер Dyson Airwrap',
    price: 0,
    condition: 'new',
    colors: [{ name: 'Абрикосовый топаз', hex: '#e9a27a' }],
    tags: ['new'],
    specs: [
      ['Тип', 'Мультистайлер'],
      ['Насадки', 'Для локонов, разглаживания и объёма'],
      ['Технология', 'Эффект Коанды, без экстремального нагрева'],
    ],
    description: 'Лимитированная коллекция Dyson в оттенке Apricot Topaz. Привезём под заказ, цену и сроки подскажет менеджер.',
  },
  {
    id: 'playstation-5',
    category: 'gadgets',
    title: 'Sony PlayStation 5',
    price: 0,
    condition: 'new',
    colors: white,
    specs: [
      ['Накопитель', 'SSD'],
      ['Геймпад', 'DualSense'],
      ['Разрешение', 'до 4K'],
    ],
    description: 'Мощная консоль с быстрым SSD и плавной графикой. Играйте один или с друзьями онлайн. Под заказ.',
  },
  {
    id: 'yandex-station-midi',
    category: 'gadgets',
    title: 'Яндекс Станция Миди',
    price: 0,
    condition: 'new',
    colors: [{ name: 'Чёрный', hex: '#2b2b2e' }],
    specs: [
      ['Звук', '24 Вт'],
      ['Ассистент', 'Алиса'],
      ['Умный дом', 'Хаб Zigbee'],
    ],
    description: 'Умная колонка с Алисой, LED-дисплеем и встроенным хабом Zigbee для умного дома. Разные модели и цвета под заказ.',
  },
]

// Количество для демо: часть новинок заканчивается, складной iPhone, топовый MacBook и гаджеты под заказ.
const stock: Record<string, number> = {
  'iphone-18-pro-max': 3,
  'iphone-17-pro': 2,
  'ipad-mini-a17': 0,
  'airpods-max-2': 2,
  'watch-ultra-4': 2,
  'used-iphone-13-pro-max': 2,
  'used-iphone-15-pro-max': 2,
  'used-iphone-16-pro-max': 2,
}
const preorder = new Set(['iphone-duo', 'macbook-pro-16-m5-pro', 'dyson-airwrap', 'playstation-5', 'yandex-station-midi'])

// Фото лежат в public/products: <id>-1.webp, <id>-2.webp… Первое фото главное.
const photoCount: Record<string, number> = {
  'iphone-18-pro-max': 4,
  'iphone-18-pro': 4,
  'iphone-duo': 4,
  'iphone-air': 4,
  'iphone-17': 4,
  'iphone-17e': 3,
  'iphone-16': 4,
  'macbook-air-13-m5': 4,
  'macbook-air-15-m5': 3,
  'macbook-pro-14-m5': 2,
  'macbook-pro-16-m5-pro': 2,
  'ipad-pro-11-m5': 2,
  'ipad-air-11-m4': 4,
  'ipad-11-a16': 4,
  'ipad-mini-a17': 4,
  'watch-ultra-4': 1,
  'watch-s12': 1,
  'watch-se-3': 1,
  'airpods-pro-3': 1,
  'airpods-5': 2,
  'airpods-max-2': 4,
  'case-18-pro': 2,
  'magsafe-charger': 2,
  'adapter-20w': 1,
  'cable-usb-c': 2,
  'pencil-pro': 2,
  'pencil-usb-c': 2,
  'airtag': 2,
}
// У этих товаров n-е фото соответствует n-му цвету: при выборе цвета галерея листается к нему.
const photoPerColor = new Set([
  'iphone-18-pro-max',
  'iphone-18-pro',
  'iphone-duo',
  'iphone-air',
  'iphone-17',
  'iphone-17e',
  'iphone-16',
  'macbook-air-13-m5',
  'macbook-air-15-m5',
  'macbook-pro-14-m5',
  'macbook-pro-16-m5-pro',
  'ipad-pro-11-m5',
  'ipad-air-11-m4',
  'ipad-11-a16',
  'ipad-mini-a17',
  'watch-ultra-4',
  'watch-s12',
  'watch-se-3',
  'airpods-max-2',
])

export const seedProducts = (now = Date.now()): Product[] =>
  raw.map((p, i) => {
    const photos = Array.from({ length: photoCount[p.id] ?? 0 }, (_, n) => `/products/${p.id}-${n + 1}.webp`)
    return {
      ...p,
      colors: photoPerColor.has(p.id) ? p.colors.map((c, n) => (photos[n] ? { ...c, photo: photos[n] } : c)) : p.colors,
      quantity: stock[p.id] ?? (p.condition === 'used' ? 1 : 5),
      preorder: preorder.has(p.id) || undefined,
      photos,
      createdAt: now - i * 1000,
      updatedAt: now - i * 1000,
    }
  })

/** Меняйте при каждом изменении стартового каталога: сервер подтянет новую версию в хранилище. */
export const SEED_VERSION = 2

/**
 * Переносит новую версию стартового каталога в уже сохранённый, ничего не удаляя.
 * - Товары стартового каталога, которые админ не трогал, заменяются новой версией.
 * - Те из них, которых в новой версии нет, скрываются: их можно вернуть в админке.
 * - Товары, которые админ правил или создал сам, остаются как есть (пустые фото дополняются).
 * - Новые товары добавляются.
 */
export function syncSeed(products: Product[], fresh: Product[]): Product[] {
  const isSeed = (p: Product) => !p.id.startsWith('p-')
  const untouched = (p: Product) => isSeed(p) && p.updatedAt === p.createdAt
  const current = new Map(products.map((p) => [p.id, p]))
  const freshIds = new Set(fresh.map((p) => p.id))

  const own = products.filter((p) => !isSeed(p))
  const synced = fresh.map((f) => {
    const p = current.get(f.id)
    if (!p || untouched(p)) return f
    return p.photos.length ? p : { ...p, photos: f.photos }
  })
  const retired = products.filter((p) => isSeed(p) && !freshIds.has(p.id)).map((p) => (untouched(p) ? { ...p, hidden: true } : p))
  return [...own, ...synced, ...retired]
}
