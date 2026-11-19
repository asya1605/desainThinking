import React, { useEffect, useState } from 'react'
import { Bookmark, Calendar, Camera, Clock, CupSoda, Heart, ImagePlus, Lock, Map, MapPin, ShieldCheck, TriangleAlert, X } from 'lucide-react'
import {
  Button,
  Card,
  CardTitle,
  Checkbox,
  Field,
  FormHeader,
  IconCircle,
  InfoBox,
  Modal,
  PhotoTile,
  Screen,
  SecretCard,
  SIMULATED_PHOTO,
  StatusBadge,
  TextArea,
  TextLink,
  cx,
  type Act,
} from '../shared/foundit/ui'
import { CATEGORIES, DROP_POINTS, TODAY_ISO, type Category, type DropPointKey } from '../shared/foundit/data'
import {
  EMPTY_FOUND,
  FOUND_LOCATIONS,
  SALSABILA_FOUND_DRAFT,
  fmtDate,
  validateFound,
  type Errors,
  type FoundForm,
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
  form?: FoundForm
  onChange?: (f: FoundForm) => void
}

const LABELS = ['1. Barang', '2. Lokasi & Ciri', '3. Titik Penitipan']

export default function LaporTemuan(props: Props) {
  const { state, modal, onAction } = { ...args, ...props }
  const step = state === 'langkah-2' ? 2 : state === 'langkah-3' ? 3 : 1
  const forcedError = state === 'error-validasi'

  const [local, setLocal] = useState<FoundForm>(forcedError ? EMPTY_FOUND : SALSABILA_FOUND_DRAFT)
  const form = props.form ?? local
  const set = (patch: Partial<FoundForm>) => {
    const next = { ...form, ...patch }
    if (props.onChange) props.onChange(next)
    else setLocal(next)
  }

  const [showErrors, setShowErrors] = useState(forcedError)
  useEffect(() => setShowErrors(forcedError), [step, forcedError])
  const errors: Errors = showErrors ? validateFound(step, form) : {}
  const errorCount = Object.keys(errors).length
  const sensitive = form.category === 'Dokumen & Kartu'

  const next = () => {
    if (Object.keys(validateFound(step, form)).length) return setShowErrors(true)
    onAction?.(step === 3 ? 'kirim' : 'lanjut')
  }

  const footer =
    step === 1 ? (
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
    ) : step === 2 ? (
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => onAction?.('kembali-langkah')}>
          Kembali
        </Button>
        <Button arrow onClick={next}>
          Lanjut
        </Button>
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
      <FormHeader
        title="Lapor Barang Temuan"
        subtitle="Bantu kembalikan barang sesama civitas"
        step={step}
        total={3}
        labels={LABELS}
        onBack={() => onAction?.('kembali')}
      />

      <div className="space-y-4 px-4 pt-1 pb-6">
        {errorCount > 0 && (
          <InfoBox tone="red" icon={<TriangleAlert strokeWidth={1.75} />}>
            <span className="font-semibold">{errorCount} isian wajib belum lengkap</span>
          </InfoBox>
        )}

        {step === 1 && (
          <>
            <Card>
              <CardTitle right={<span className="inline-flex h-6 items-center rounded-full bg-danger/10 px-2.5 text-[11px] font-semibold text-danger">Wajib · min. 1 foto</span>}>
                Foto Barang
              </CardTitle>
              <p className="-mt-2 text-[12px] leading-[1.5] text-muted">Foto yang jelas memudahkan pemilik mengenali barangnya.</p>
              {!form.photo ? (
                <div
                  className={cx(
                    'mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center',
                    errors.photo ? 'border-danger bg-danger/5' : 'border-faint bg-page'
                  )}
                >
                  <Camera className={cx('size-10', errors.photo ? 'text-danger' : 'text-muted')} strokeWidth={1.5} />
                  <p className={cx('mt-2 text-[13px] font-semibold', errors.photo ? 'text-danger' : 'text-muted')}>Tambahkan minimal 1 foto barang</p>
                  <div className="mt-4 grid w-full grid-cols-2 gap-2">
                    <Button variant="secondary" small className="h-11 rounded-xl" icon={<Camera className="size-4" strokeWidth={1.75} />} onClick={() => set({ photo: SIMULATED_PHOTO })}>
                      Ambil Foto
                    </Button>
                    <Button variant="secondary" small className="h-11 rounded-xl" icon={<ImagePlus className="size-4" strokeWidth={1.75} />} onClick={() => set({ photo: SIMULATED_PHOTO })}>
                      Pilih Galeri
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl">
                  <PhotoTile src={form.photo} className="absolute inset-0 size-full" />
                  <span className="absolute top-2 left-2 inline-flex h-7 items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-white">Foto Utama</span>
                  <button
                    aria-label="Hapus foto"
                    onClick={() => set({ photo: null })}
                    className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-ink text-white"
                  >
                    <X className="size-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => set({ photo: SIMULATED_PHOTO })}
                    className="absolute right-2 bottom-2 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-semibold text-ink shadow-card"
                  >
                    <Camera className="size-4" strokeWidth={1.75} />
                    Ganti Foto
                  </button>
                </div>
              )}
            </Card>

            <InfoBox tone="blue" icon={<ShieldCheck strokeWidth={1.75} />}>
              <span className="font-semibold">Tips keamanan:</span> jangan foto nomor seri, isi dompet, atau data pribadi. Tulis detail itu di Ciri Rahasia.
            </InfoBox>

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
                {sensitive && (
                  <InfoBox tone="pink" icon={<Lock strokeWidth={1.75} />}>
                    Barang Dokumen & Kartu tampil di daftar publik sebagai "Detail disembunyikan", tanpa foto dan nama.
                  </InfoBox>
                )}
                <Field
                  label="Nama Barang"
                  required
                  value={form.name}
                  onChange={(v) => set({ name: v })}
                  placeholder="Contoh: Payung Lipat Biru Dongker"
                  state={errors.name ? 'error' : 'filled'}
                  error={errors.name}
                />
              </div>
            </Card>
          </>
        )}

        {step === 2 && (
          <>
            <Card>
              <CardTitle>Di mana dan kapan ditemukan?</CardTitle>
              <div className="space-y-4">
                <Field
                  label="Lokasi Ditemukan"
                  required
                  icon={<MapPin strokeWidth={1.5} />}
                  value={form.location}
                  options={FOUND_LOCATIONS}
                  onChange={(v) => set({ location: v })}
                  placeholder="Pilih lokasi"
                  state={errors.location ? 'error' : 'filled'}
                  error={errors.location}
                />
                <Field label="Detail Lokasi" value={form.locationDetail} onChange={(v) => set({ locationDetail: v })} placeholder="Contoh: meja sudut dekat jendela" />
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
                    label="Jam"
                    required
                    type="time"
                    icon={<Clock strokeWidth={1.5} />}
                    value={form.time}
                    onChange={(v) => set({ time: v })}
                    state={errors.time ? 'error' : 'filled'}
                    error={errors.time}
                  />
                </div>
              </div>
            </Card>
            <Card>
              <CardTitle>Deskripsi Publik</CardTitle>
              <TextArea
                value={form.description}
                onChange={(v) => set({ description: v })}
                placeholder="Warna, bentuk, kondisi barang…"
                error={errors.description}
                hint="Tampil di daftar temuan. Jangan tulis ciri khusus di sini."
              />
            </Card>
            <SecretCard
              pink
              icon={<Heart className="size-5" strokeWidth={1.75} />}
              title="Ciri Rahasia untuk Petugas"
              badge="Hanya kamu & petugas"
              text="Tulis detail yang tidak terlihat di foto. Petugas memakainya untuk menguji orang yang mengklaim."
              value={form.secret}
              onChange={(v) => set({ secret: v })}
              error={errors.secret}
            />
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display text-[20px] font-bold">Titipkan ke mana?</h2>
            <InfoBox tone="yellow" icon={<Clock strokeWidth={1.75} />}>
              Barang wajib dititipkan paling lambat <span className="font-semibold">1×24 jam</span> setelah laporan dikirim.
            </InfoBox>
            <div className="space-y-3" role="radiogroup" aria-label="Titik penitipan">
              {(Object.keys(DROP_POINTS) as DropPointKey[]).map((key) => {
                const p = DROP_POINTS[key]
                return (
                  <React.Fragment key={key}>
                  <RadioPoint
                    selected={form.point === key}
                    disabled={!p.active}
                    onSelect={() => set({ point: key })}
                    name={p.name}
                    badges={
                      !p.active ? (
                        <StatusBadge label="Sedang tidak melayani" />
                      ) : p.type === 'Posko Utama' ? (
                        <>
                          <StatusBadge label="Posko Utama" color="#0000FF" dot={false} />
                          <StatusBadge label="Disarankan" />
                        </>
                      ) : (
                        <StatusBadge label="Titik Satelit" color="#0891B2" dot={false} />
                      )
                    }
                    hours={p.active ? p.hours : undefined}
                    desc={key === 'posko' ? 'Barang langsung disimpan di rak posko.' : key === 'gerbang' ? 'Barang dipindah ke Posko Dekanat setiap pagi.' : undefined}
                  />
                  </React.Fragment>
                )
              })}
              {errors.point && <p className="text-[12px] font-medium text-danger">{errors.point}</p>}
            </div>
            <TextLink onClick={() => onAction?.('lihat-lokasi')}>
              <Map className="size-4" strokeWidth={1.75} />
              Lihat lokasi dan jam layanan
            </TextLink>
            <Card>
              <CardTitle
                right={
                  <TextLink className="min-h-0 text-[13px]" onClick={() => onAction?.('ubah:1')}>
                    Ubah
                  </TextLink>
                }
              >
                Ringkasan
              </CardTitle>
              <div className="flex gap-3">
                {form.photo && <PhotoTile src={form.photo} className="size-14 shrink-0 rounded-xl" />}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug">{form.name}</p>
                  <p className="mt-1 text-[12px] text-muted">
                    {form.location}
                    {form.locationDetail && ` · ${form.locationDetail}`} · {fmtDate(form.date)}, {form.time}
                  </p>
                </div>
              </div>
            </Card>
            <div>
              <Checkbox checked={form.agree} onClick={() => set({ agree: !form.agree })}>
                Saya akan menitipkan barang ini paling lambat 1×24 jam dan menunjukkan kode penitipan ke petugas.
              </Checkbox>
              {errors.agree && <p className="mt-1 pl-8 text-[12px] font-medium text-danger">{errors.agree}</p>}
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}

function RadioPoint({
  name,
  badges,
  hours,
  desc,
  selected,
  disabled,
  onSelect,
}: {
  name: string
  badges: React.ReactNode
  hours?: string
  desc?: string
  selected?: boolean
  disabled?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      role="radio"
      aria-checked={!!selected}
      disabled={disabled}
      onClick={onSelect}
      className={cx(
        'flex w-full items-start gap-3 rounded-2xl p-4 text-left',
        selected ? 'border-2 border-primary bg-blue-soft/50' : 'border border-line bg-white',
        disabled && 'opacity-50'
      )}
    >
      <span className={cx('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-primary' : 'border-faint')}>
        {selected && <span className="size-2.5 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[16px] font-semibold">{name}</span>
        <span className="mt-1.5 flex flex-wrap gap-1.5">{badges}</span>
        {hours && <span className="mt-2 block text-[13px] font-medium">{hours}</span>}
        {desc && <span className="mt-0.5 block text-[12px] leading-[1.5] text-muted">{desc}</span>}
      </span>
    </button>
  )
}
