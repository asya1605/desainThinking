import React, { useEffect, useState } from 'react'
import { Bookmark, Calendar, Camera, Clock, CupSoda, ImagePlus, Info, MapPin, Plus, TriangleAlert, X } from 'lucide-react'
import {
  Button,
  Card,
  CardTitle,
  CategoryBadge,
  Checkbox,
  Field,
  FormHeader,
  IconCircle,
  InfoBox,
  MetaRow,
  Modal,
  PhotoTile,
  Pill,
  Screen,
  SecretCard,
  SIMULATED_PHOTO,
  TextArea,
  TextLink,
  type Act,
} from '../shared/foundit/ui'
import { CATEGORIES, TODAY_ISO, type Category } from '../shared/foundit/data'
import {
  EMPTY_LOST,
  LOST_LOCATIONS,
  RARA_LOST_DRAFT,
  TIME_RANGES,
  fmtDate,
  validateLost,
  type Errors,
  type LostForm,
} from '../shared/foundit/forms'

export const args = {
  state: 'langkah-1',
  modal: 'none',
}

export const argTypes = {
  state: { control: 'select', options: ['langkah-1', 'langkah-2', 'langkah-3', 'error-validasi'] },
  modal: { control: 'radio', options: ['none', 'keluar-form'] },
}

type Props = Partial<typeof args> & {
  onAction?: Act
  /** Isian formulir, dipegang prototipe supaya tidak hilang antar langkah. */
  form?: LostForm
  onChange?: (f: LostForm) => void
}

const LABELS = ['1. Barang', '2. Waktu & Lokasi', '3. Ciri Rahasia']

export default function LaporKehilangan(props: Props) {
  const { state, modal, onAction } = { ...args, ...props }
  const step = state === 'langkah-2' ? 2 : state === 'langkah-3' ? 3 : 1
  const forcedError = state === 'error-validasi'

  // Dibuka sendiri: pakai isian lokal. Diputar prototipe: pakai isian dari prototipe.
  const [local, setLocal] = useState<LostForm>(forcedError ? EMPTY_LOST : RARA_LOST_DRAFT)
  const form = props.form ?? local
  const set = (patch: Partial<LostForm>) => {
    const next = { ...form, ...patch }
    if (props.onChange) props.onChange(next)
    else setLocal(next)
  }

  const [showErrors, setShowErrors] = useState(forcedError)
  useEffect(() => setShowErrors(forcedError), [step, forcedError])
  const errors: Errors = showErrors ? validateLost(step, form) : {}
  const errorCount = Object.keys(errors).length

  const next = () => {
    if (Object.keys(validateLost(step, form)).length) return setShowErrors(true)
    onAction?.(step === 3 ? 'kirim' : 'lanjut')
  }

  const footer =
    step === 2 ? (
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => onAction?.('kembali-langkah')}>
          Kembali
        </Button>
        <Button arrow onClick={next}>
          Lanjut
        </Button>
      </div>
    ) : step === 1 ? (
      <div>
        <Button className="w-full" arrow onClick={next}>
          Lanjut
        </Button>
        <div className="flex justify-center">
          <TextLink onClick={() => onAction?.('simpan-draf')}>
            <Bookmark className="size-4" strokeWidth={1.75} />
            Simpan Draf
          </TextLink>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => onAction?.('kembali-langkah')}>
          Kembali
        </Button>
        <Button arrow onClick={next}>
          Kirim Laporan
        </Button>
      </div>
    )

  return (
    <Screen
      footer={footer}
      overlay={
        <Modal open={modal === 'keluar-form'} onClose={() => onAction?.('tutup')}>
          <div className="flex justify-center">
            <IconCircle tone="yellow" size={64}>
              <span className="font-display text-[28px] font-bold text-amber">!</span>
            </IconCircle>
          </div>
          <h2 className="mt-4 font-display text-[20px] font-bold">Keluar dari laporan?</h2>
          <p className="mt-2 text-[14px] leading-[1.5] text-muted">Isian yang sudah kamu tulis bisa disimpan sebagai draf.</p>
          <Button className="mt-5 w-full" onClick={() => onAction?.('simpan-keluar')}>
            Simpan Draf & Keluar
          </Button>
          <TextLink tone="danger" className="mt-1 w-full" onClick={() => onAction?.('buang')}>
            Buang
          </TextLink>
          <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
            Lanjut Mengisi
          </TextLink>
        </Modal>
      }
    >
      <FormHeader title="Lapor Kehilangan" step={step} total={3} labels={LABELS} onBack={() => onAction?.('kembali')} />

      <div className="space-y-4 px-4 pt-1 pb-6">
        {errorCount > 0 && (
          <InfoBox tone="red" icon={<TriangleAlert strokeWidth={1.75} />}>
            <span className="font-semibold">{errorCount} isian wajib belum lengkap</span>
          </InfoBox>
        )}

        {step === 1 && (
          <>
            <Card>
              <CardTitle right={<Pill>Opsional</Pill>}>Foto Barang</CardTitle>
              <p className="-mt-2 text-[12px] leading-[1.5] text-muted">Foto lama saat memakai barang, atau gambar sejenis dari internet.</p>
              <div className="mt-3 flex gap-3">
                {form.photo && (
                  <div className="relative size-24 shrink-0">
                    <PhotoTile src={form.photo} className="size-full rounded-xl" />
                    <button
                      aria-label="Hapus foto"
                      onClick={() => set({ photo: null })}
                      className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-ink text-white ring-2 ring-white"
                    >
                      <X className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
                {!form.photo && (
                  <button
                    onClick={() => set({ photo: SIMULATED_PHOTO })}
                    className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-faint text-[12px] font-semibold text-muted"
                  >
                    <Plus className="size-5" strokeWidth={1.75} />
                    Tambah
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="secondary" small className="h-11 rounded-xl" icon={<Camera className="size-4" strokeWidth={1.75} />} onClick={() => set({ photo: SIMULATED_PHOTO })}>
                  Ambil Foto
                </Button>
                <Button variant="secondary" small className="h-11 rounded-xl" icon={<ImagePlus className="size-4" strokeWidth={1.75} />} onClick={() => set({ photo: SIMULATED_PHOTO })}>
                  Pilih Galeri
                </Button>
              </div>
            </Card>

            <Card>
              <CardTitle>Detail Barang</CardTitle>
              <div className="space-y-4">
                <Field
                  label="Kategori Barang"
                  required
                  icon={<CupSoda strokeWidth={1.5} />}
                  value={form.category}
                  options={[...CATEGORIES]}
                  onChange={(v) => set({ category: v as Category })}
                  placeholder="Pilih kategori"
                  state={errors.category ? 'error' : 'filled'}
                  error={errors.category}
                />
                <Field
                  label="Nama Barang"
                  required
                  value={form.name}
                  onChange={(v) => set({ name: v })}
                  placeholder="Contoh: Tumbler Corkcicle Pink 500ml"
                  state={errors.name ? 'error' : 'filled'}
                  error={errors.name}
                  hint="Tulis merek, warna, dan ukuran."
                  trailing={
                    form.name ? (
                      <button aria-label="Hapus nama" onClick={() => set({ name: '' })} className="-mr-1 flex size-8 items-center justify-center">
                        <X className="size-5 text-muted" strokeWidth={1.5} />
                      </button>
                    ) : undefined
                  }
                />
              </div>
            </Card>
          </>
        )}

        {step === 2 && (
          <Card>
            <CardTitle>Kapan dan di mana?</CardTitle>
            <div className="space-y-4">
              <Field
                label="Lokasi Terakhir"
                required
                icon={<MapPin className="text-pink" strokeWidth={1.5} />}
                value={form.location}
                options={LOST_LOCATIONS}
                onChange={(v) => set({ location: v })}
                placeholder="Pilih lokasi"
                state={errors.location ? 'error' : 'filled'}
                error={errors.location}
                hint={
                  <span className="flex items-center gap-1.5">
                    <Info className="size-4" strokeWidth={1.5} />
                    Bukan di kampus? Pilih 'Di luar area kampus'.
                  </span>
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Tanggal"
                  required
                  type="date"
                  max={TODAY_ISO}
                  icon={<Calendar strokeWidth={1.5} />}
                  value={form.date}
                  onChange={(v) => set({ date: v })}
                  state={errors.date ? 'error' : 'filled'}
                  error={errors.date}
                />
                <Field
                  label="Perkiraan Jam"
                  required
                  icon={<Clock strokeWidth={1.5} />}
                  value={form.timeRange}
                  options={TIME_RANGES}
                  onChange={(v) => set({ timeRange: v })}
                  placeholder="Pilih jam"
                  state={errors.timeRange ? 'error' : 'filled'}
                  error={errors.timeRange}
                />
              </div>
              <TextArea
                label="Deskripsi Barang"
                value={form.description}
                onChange={(v) => set({ description: v })}
                placeholder="Warna, bentuk, aksesori yang menempel…"
                error={errors.description}
                hint="Deskripsi dipakai untuk pencocokan, tidak tampil di daftar publik."
              />
            </div>
          </Card>
        )}

        {step === 3 && (
          <>
            <SecretCard
              text="Tulis ciri yang hanya kamu tahu. Ini dipakai petugas untuk memastikan barang benar milikmu."
              value={form.secret}
              onChange={(v) => set({ secret: v })}
              error={errors.secret}
            />
            <Card>
              <CardTitle>Ringkasan Laporan</CardTitle>
              <div className="divide-y divide-line">
                <div className="flex items-start gap-3 pb-3">
                  {form.photo && <PhotoTile src={form.photo} className="size-12 shrink-0 rounded-lg" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold leading-snug">{form.name}</p>
                    {form.category && (
                      <div className="mt-1">
                        <CategoryBadge category={form.category} />
                      </div>
                    )}
                  </div>
                  <TextLink className="min-h-0 text-[13px]" onClick={() => onAction?.('ubah:1')}>
                    Ubah
                  </TextLink>
                </div>
                <div className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <MetaRow icon={<MapPin strokeWidth={1.5} />}>{form.location}</MetaRow>
                    <MetaRow icon={<Clock strokeWidth={1.5} />}>
                      {fmtDate(form.date)} · {form.timeRange.replace(/ /g, '')}
                    </MetaRow>
                  </div>
                  <TextLink className="min-h-0 text-[13px]" onClick={() => onAction?.('ubah:2')}>
                    Ubah
                  </TextLink>
                </div>
                {form.description && <p className="pt-3 text-[13px] leading-[1.5] text-muted">{form.description}</p>}
              </div>
            </Card>
            <div>
              <Checkbox checked={form.agree} onClick={() => set({ agree: !form.agree })}>
                Data yang saya isi benar.
              </Checkbox>
              {errors.agree && <p className="mt-1 pl-8 text-[12px] font-medium text-danger">{errors.agree}</p>}
            </div>
            <div className="flex justify-center">
              <TextLink onClick={() => onAction?.('simpan-draf')}>
                <Bookmark className="size-4" strokeWidth={1.75} />
                Simpan Draf
              </TextLink>
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
