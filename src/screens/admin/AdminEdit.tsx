import { useEffect, useRef, useState, type ReactNode } from 'react'
import { categories, MAX_PHOTOS, type CategoryId, type Product, type ProductInput } from '../../../shared/catalog'
import { Icon } from '../../components/Icon'
import { ProductImage } from '../../components/ProductImage'
import { Field, Group, Header, MainButton, mainButtonSpace, Segmented, Spinner, Stepper, Toggle } from '../../components/ui'
import { useAdmin } from '../../lib/admin'
import { api } from '../../lib/api'
import { preparePhoto } from '../../lib/image'
import { useStore } from '../../lib/store'
import { tg } from '../../lib/telegram'

type Form = {
  title: string
  category: CategoryId
  condition: 'new' | 'used'
  price: string
  oldPrice: string
  quantity: number
  preorder: boolean
  hidden: boolean
  description: string
  specs: { k: string; v: string }[]
  photos: string[]
  battery: string
  grade: string
  kit: string
}

const toForm = (p?: Product): Form => ({
  title: p?.title ?? '',
  category: p?.category ?? 'iphone',
  condition: p?.condition ?? 'new',
  price: p ? String(p.price) : '',
  oldPrice: p?.oldPrice ? String(p.oldPrice) : '',
  quantity: p?.quantity ?? 1,
  preorder: Boolean(p?.preorder),
  hidden: Boolean(p?.hidden),
  description: p?.description ?? '',
  specs: p?.specs.map(([k, v]) => ({ k, v })) ?? [],
  photos: p?.photos ?? [],
  battery: p?.used?.battery ? String(p.used.battery) : '',
  grade: p?.used?.grade ?? '',
  kit: p?.used?.kit ?? '',
})

const parseMoney = (v: string) => (v.trim() === '' ? NaN : Number(v.replace(/[\s₽]/g, '')))

function validate(f: Form): string | ProductInput {
  if (!f.title.trim()) return 'Укажите название'
  const price = parseMoney(f.price)
  if (!Number.isInteger(price) || price < 0) return 'Цена должна быть целым неотрицательным числом'
  const oldPrice = f.oldPrice.trim() ? parseMoney(f.oldPrice) : 0
  if (!Number.isInteger(oldPrice) || oldPrice < 0) return 'Старая цена должна быть целым неотрицательным числом'
  const battery = f.battery.trim() ? Number(f.battery) : undefined
  if (battery !== undefined && (!Number.isInteger(battery) || battery < 0 || battery > 100)) return 'Аккумулятор: число от 0 до 100'
  return {
    title: f.title.trim(),
    category: f.category,
    condition: f.condition,
    price,
    oldPrice,
    quantity: f.quantity,
    preorder: f.preorder,
    hidden: f.hidden,
    description: f.description.trim(),
    specs: f.specs.map(({ k, v }) => [k.trim(), v.trim()] as [string, string]).filter(([k, v]) => k && v),
    photos: f.photos,
    used: f.condition === 'used' ? { battery, grade: f.grade.trim() || undefined, kit: f.kit.trim() || undefined } : undefined,
  }
}

export function AdminEdit({ id }: { id?: string }) {
  const { products, status, load, upsert, remove } = useAdmin()
  const back = useStore((s) => s.back)
  const showToast = useStore((s) => s.showToast)
  const product = id ? products.find((p) => p.id === id) : undefined
  const [form, setForm] = useState<Form>(() => toForm(product))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  // Фото, загруженные в этой форме: если уйти без сохранения, удалим их, чтобы не копился мусор.
  const freshUploads = useRef(new Set<string>())
  const savedPhotos = useRef<string[]>(product?.photos ?? [])

  useEffect(() => {
    if (status === 'idle') load()
  }, [status, load])

  // Товар мог подгрузиться уже после открытия формы.
  const loadedId = useRef(product?.id)
  useEffect(() => {
    if (product && loadedId.current !== product.id) {
      loadedId.current = product.id
      savedPhotos.current = product.photos
      setForm(toForm(product))
    }
  }, [product])

  useEffect(() => {
    const uploads = freshUploads.current
    return () => {
      for (const key of uploads) if (!savedPhotos.current.includes(key)) api.admin.deletePhoto(key).catch(() => undefined)
    }
  }, [])

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError('')
  }

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return
    const room = MAX_PHOTOS - form.photos.length - uploading
    const list = [...files].slice(0, Math.max(0, room))
    if (files.length > list.length) showToast(`Можно не больше ${MAX_PHOTOS} фото`, 'error')
    setUploading((n) => n + list.length)
    await Promise.all(
      list.map(async (file) => {
        try {
          const key = await api.admin.uploadPhoto(await preparePhoto(file))
          freshUploads.current.add(key)
          setForm((f) => ({ ...f, photos: [...f.photos, key] }))
        } catch (e) {
          showToast(e instanceof Error ? e.message : 'Не удалось загрузить фото', 'error')
        } finally {
          setUploading((n) => n - 1)
        }
      }),
    )
  }

  const save = async () => {
    const input = validate(form)
    if (typeof input === 'string') {
      setError(input)
      tg.haptic.error()
      return
    }
    setError('')
    setSaving(true)
    try {
      const saved = id ? await api.admin.update(id, input) : await api.admin.create(input)
      savedPhotos.current = saved.photos
      upsert(saved)
      showToast(id ? 'Изменения сохранены' : 'Товар добавлен')
      back()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
      tg.haptic.error()
    } finally {
      setSaving(false)
    }
  }

  const destroy = async () => {
    if (!id || !(await tg.confirm(`Удалить «${form.title}»? Это нельзя отменить.`))) return
    try {
      await api.admin.remove(id)
      savedPhotos.current = []
      remove(id)
      showToast('Товар удалён')
      back()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не удалось удалить', 'error')
    }
  }

  if (id && !product && status !== 'ready')
    return (
      <>
        <Header title="Товар" />
        <div className="grid place-items-center pt-20 text-hint">
          <Spinner />
        </div>
      </>
    )

  const preview = { id: id ?? 'new', category: form.category, title: form.title, colors: product?.colors ?? [] }

  return (
    <div className={mainButtonSpace}>
      <Header title={id ? 'Редактирование' : 'Новый товар'} />

      <Label>Фото · {form.photos.length} из {MAX_PHOTOS}</Label>
      <div className="grid grid-cols-3 gap-2 px-4">
        {form.photos.map((key, i) => (
          <div key={key} className="relative aspect-square overflow-hidden rounded-2xl">
            <ProductImage product={preview} photo={key} />
            {i === 0 ? (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">Главное</span>
            ) : (
              <button
                type="button"
                onClick={() => set('photos', [key, ...form.photos.filter((k) => k !== key)])}
                className="absolute bottom-1.5 left-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
                aria-label="Сделать главным"
              >
                <Icon name="star" size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => set('photos', form.photos.filter((k) => k !== key))}
              className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
              aria-label="Удалить фото"
            >
              <Icon name="close" size={15} stroke={2.4} />
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <div key={`u${i}`} className="skeleton grid aspect-square place-items-center rounded-2xl text-hint">
            <Spinner />
          </div>
        ))}
        {form.photos.length + uploading < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-sep text-[13px] font-medium text-link"
          >
            <Icon name="camera" size={26} />
            Добавить
          </button>
        )}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addPhotos(e.target.files)
          e.target.value = ''
        }}
      />
      <div className="mt-2 px-4 text-[13px] text-hint">JPEG, PNG или WebP до 5 МБ. Фото сжимаются автоматически.</div>

      <Label>Основное</Label>
      <Group>
        <Field label="Название" required value={form.title} onChange={(v) => set('title', v)} placeholder="iPhone 17 Pro 256 ГБ" />
        <label className="block border-b border-sep px-4 py-2.5">
          <span className="text-[13px] text-hint">Категория</span>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value as CategoryId)}
            className="w-full bg-transparent py-1 text-[17px] outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <div className="border-b border-sep px-4 py-3">
          <div className="mb-2 text-[13px] text-hint">Состояние</div>
          <Segmented
            value={form.condition}
            onChange={(v) => set('condition', v)}
            options={[
              { value: 'new', label: 'Новый' },
              { value: 'used', label: 'Б/У' },
            ]}
          />
        </div>
        <Field label="Цена, ₽" required inputMode="numeric" value={form.price} onChange={(v) => set('price', v.replace(/[^\d]/g, ''))} placeholder="0" />
        <Field label="Старая цена, ₽ (для скидки)" inputMode="numeric" value={form.oldPrice} onChange={(v) => set('oldPrice', v.replace(/[^\d]/g, ''))} />
      </Group>

      <Label>Наличие</Label>
      <Group>
        <div className="flex items-center justify-between border-b border-sep px-4 py-2.5">
          <span className="text-[17px]">Количество</span>
          <Stepper value={form.quantity} onChange={(v) => set('quantity', v)} />
        </div>
        <Toggle label="Под заказ" hint="Предзаказ новинки, статус «Под заказ»" checked={form.preorder} onChange={(v) => set('preorder', v)} />
        <Toggle label="Скрыть из каталога" hint="Товар виден только в админке" checked={form.hidden} onChange={(v) => set('hidden', v)} />
      </Group>

      {form.condition === 'used' && (
        <>
          <Label>Состояние б/у</Label>
          <Group>
            <Field label="Аккумулятор, %" inputMode="numeric" value={form.battery} onChange={(v) => set('battery', v.replace(/[^\d]/g, '').slice(0, 3))} placeholder="87" />
            <Field label="Внешний вид" value={form.grade} onChange={(v) => set('grade', v)} placeholder="A — как новый" />
            <Field label="Комплект" value={form.kit} onChange={(v) => set('kit', v)} placeholder="Коробка, кабель" />
          </Group>
        </>
      )}

      <Label>Описание</Label>
      <Group>
        <Field label="Описание" multiline value={form.description} onChange={(v) => set('description', v)} placeholder="Коротко о товаре" />
      </Group>

      <Label>Характеристики</Label>
      <Group>
        {form.specs.map((row, i) => (
          <div key={i} className="flex items-center gap-2 border-b border-sep px-4 py-2">
            <input
              value={row.k}
              placeholder="Экран"
              onChange={(e) => set('specs', form.specs.map((r, j) => (j === i ? { ...r, k: e.target.value } : r)))}
              className="w-[38%] min-w-0 bg-transparent py-1.5 text-[16px] text-hint outline-none"
            />
            <input
              value={row.v}
              placeholder="6,3″ OLED"
              onChange={(e) => set('specs', form.specs.map((r, j) => (j === i ? { ...r, v: e.target.value } : r)))}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[16px] outline-none"
            />
            <button type="button" onClick={() => set('specs', form.specs.filter((_, j) => j !== i))} className="text-hint" aria-label="Удалить строку">
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set('specs', [...form.specs, { k: '', v: '' }])} className="flex w-full items-center gap-2 px-4 py-3 text-[17px] text-link">
          <Icon name="plus" size={20} /> Добавить характеристику
        </button>
      </Group>

      {error && <div className="mx-4 mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-[15px] text-danger">{error}</div>}

      {id && (
        <Group className="mt-8">
          <button type="button" onClick={destroy} className="flex w-full items-center justify-center gap-2 px-4 py-3.5 text-[17px] font-medium text-danger">
            <Icon name="trash" size={20} /> Удалить товар
          </button>
        </Group>
      )}

      <MainButton text={id ? 'Сохранить' : 'Добавить товар'} onClick={save} loading={saving} disabled={uploading > 0} />
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <div className="mt-6 mb-2 px-8 text-[13px] font-medium tracking-wide text-hint uppercase">{children}</div>
}
