import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Info, Lock, MapPin, Plus, TriangleAlert, X } from 'lucide-react'
import {
  Button,
  Card,
  CardTitle,
  Checkbox,
  Field,
  FieldLabel,
  FormHeader,
  IconCircle,
  IdChip,
  InfoBox,
  MetaRow,
  Modal,
  PhotoTile,
  Pill,
  Screen,
  SecretCard,
  SIMULATED_PHOTO,
  StatusBadge,
  TextArea,
  TextLink,
  type Act,
} from '../shared/foundit/ui'
import { FOUND_REPORTS, TODAY_ISO, USERS, getItem, type UserKey } from '../shared/foundit/data'
import { FAJAR_CLAIM_DRAFT, LOST_LOCATIONS, TIME_RANGES, emptyClaim, validateClaim, type ClaimForm, type Errors } from '../shared/foundit/forms'

export const args = {
  itemId: 'FI-T-26-0095',
  pengguna: 'fajar',
  state: 'langkah-1',
  modal: 'none',
}

export const argTypes = {
  itemId: { control: 'text' },
  pengguna: { control: 'select', options: ['fajar', 'rara', 'rizky', 'salsabila'] },
  state: { control: 'radio', options: ['langkah-1', 'langkah-2', 'error-validasi'] },
  modal: { control: 'radio', options: ['none', 'keluar-form'] },
}

type Props = Partial<typeof args> & {
  onAction?: Act
  /** Isian formulir, dipegang prototipe supaya tidak hilang antar langkah. */
  form?: ClaimForm
  onChange?: (f: ClaimForm) => void
}

const LABELS = ['1. Ceritakan kehilanganmu', '2. Bukti dan pernyataan']

export default function FormKlaim(props: Props) {
  const { itemId, pengguna, state, modal, onAction } = { ...args, ...props }
  const step = state === 'langkah-2' ? 2 : 1
  const forcedError = state === 'error-validasi'
  const item = getItem(itemId)
  const user = USERS[pengguna as UserKey] ?? USERS.fajar

  const [local, setLocal] = useState<ClaimForm>(() =>
    forcedError ? emptyClaim(itemId) : itemId === FAJAR_CLAIM_DRAFT.itemId ? FAJAR_CLAIM_DRAFT : emptyClaim(itemId)
  )
  const form = props.form ?? local
  const set = (patch: Partial<ClaimForm>) => {
    const next = { ...form, ...patch }
    if (props.onChange) props.onChange(next)
    else setLocal(next)
  }

  const [showErrors, setShowErrors] = useState(forcedError)
  useEffect(() => setShowErrors(forcedError), [step, forcedError])
  const errors: Errors = showErrors ? validateClaim(step, form) : {}
  const errorCount = Object.keys(errors).length

  // Cegah klik ganda pada Kirim Klaim.
  const [sending, setSending] = useState(false)
  const next = () => {
    if (Object.keys(validateClaim(step, form)).length) return setShowErrors(true)
    if (step === 2) {
      if (sending) return
      setSending(true)
      return onAction?.('kirim-klaim')
    }
    onAction?.('lanjut')
  }

  const sensitive = !!item?.isSensitive
  const status = item ? (FOUND_REPORTS[item.id]?.status ?? item.depositStatus) : undefined

  return (
    <Screen
      footer={
        step === 1 ? (
          <Button className="w-full" arrow onClick={next}>
            Lanjut
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => onAction?.('kembali-langkah')}>
              Kembali
            </Button>
            <Button arrow variant={sending ? 'disabled' : undefined} onClick={next}>
              {sending ? 'Mengirim…' : 'Kirim Klaim'}
            </Button>
          </div>
        )
      }
      overlay={
        <Modal open={modal === 'keluar-form'} onClose={() => onAction?.('tutup')}>
          <div className="flex justify-center">
            <IconCircle tone="yellow" size={64}>
              <span className="font-display text-[28px] font-bold text-amber">!</span>
            </IconCircle>
          </div>
          <h2 className="mt-4 font-display text-[20px] font-bold">Batalkan pengajuan klaim?</h2>
          <p className="mt-2 text-[14px] leading-[1.5] text-muted">Klaim belum dikirim ke petugas. Jawaban yang sudah kamu isi akan dihapus.</p>
          <Button variant="danger-solid" className="mt-5 w-full" onClick={() => onAction?.('keluar-klaim')}>
            Ya, Batalkan Klaim
          </Button>
          <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
            Lanjut Mengisi
          </TextLink>
        </Modal>
      }
    >
      <FormHeader title="Ajukan Klaim" step={step} total={2} onBack={() => onAction?.('kembali')} labels={LABELS} />

      <div className="space-y-4 px-4 pt-1 pb-6">
        {errorCount > 0 && (
          <InfoBox tone="red" icon={<TriangleAlert strokeWidth={1.75} />}>
            <span className="font-semibold">{errorCount} isian wajib belum lengkap</span>
          </InfoBox>
        )}

        {/* Barang (dibaca dari master data berdasarkan ID) */}
        {item ? (
          <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-card">
            {sensitive || !item.image ? (
              <div className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
                <Lock className="size-6" strokeWidth={1.5} />
              </div>
            ) : (
              <img src={item.image} alt="" className="size-[72px] shrink-0 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <IdChip id={item.id} />
                {status && <StatusBadge label={status} />}
              </div>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug">{sensitive ? 'Detail disembunyikan' : item.name}</p>
              <MetaRow icon={<MapPin strokeWidth={1.5} />}>{item.location}</MetaRow>
            </div>
          </div>
        ) : (
          <InfoBox tone="red" icon={<TriangleAlert strokeWidth={1.75} />}>
            Barang {itemId} tidak ditemukan.
          </InfoBox>
        )}

        {step === 1 ? (
          <>
            <InfoBox tone="blue" icon={<Info strokeWidth={1.75} />}>
              Kamu belum punya laporan kehilangan untuk barang ini. Jawab beberapa pertanyaan agar petugas bisa memastikan barang ini milikmu.
            </InfoBox>
            <Card>
              <div className="space-y-4">
                <div>
                  <FieldLabel label="Kapan terakhir kamu memegangnya?" required />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      type="date"
                      max={TODAY_ISO}
                      icon={<Calendar strokeWidth={1.5} />}
                      value={form.date}
                      onChange={(v) => set({ date: v })}
                      state={errors.date ? 'error' : 'filled'}
                      error={errors.date}
                    />
                    <Field
                      icon={<Clock strokeWidth={1.5} />}
                      value={form.timeRange}
                      options={TIME_RANGES}
                      onChange={(v) => set({ timeRange: v })}
                      placeholder="Pilih jam"
                      state={errors.timeRange ? 'error' : 'filled'}
                      error={errors.timeRange}
                    />
                  </div>
                </div>
                <Field
                  label="Di mana kemungkinan hilang?"
                  required
                  icon={<MapPin strokeWidth={1.5} />}
                  value={form.location}
                  options={LOST_LOCATIONS}
                  onChange={(v) => set({ location: v })}
                  placeholder="Pilih lokasi"
                  state={errors.location ? 'error' : 'filled'}
                  error={errors.location}
                />
              </div>
            </Card>
            <SecretCard
              pink
              text="Sebutkan isi atau ciri khusus yang tidak terlihat di foto."
              value={form.secret}
              onChange={(v) => set({ secret: v })}
              placeholder="Contoh: isi, warna bagian dalam, atau tanda khusus"
              error={errors.secret}
            />
          </>
        ) : (
          <>
            <Card>
              <CardTitle right={<Pill tone="blue">Disarankan</Pill>}>Foto Bukti</CardTitle>
              <div className="flex gap-3">
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
                    className="flex size-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border-[1.5px] border-dashed border-faint text-[12px] font-semibold text-muted"
                  >
                    <Plus className="size-5" strokeWidth={1.75} />
                    Tambah
                  </button>
                )}
              </div>
              <p className="mt-2 text-[12px] leading-[1.5] text-muted">Foto lama saat memakai barang, struk pembelian, atau kotak barang.</p>
            </Card>
            <Card>
              <TextArea
                label="Keterangan tambahan (opsional)"
                value={form.note}
                onChange={(v) => set({ note: v })}
                placeholder="Contoh: asal barang, sejak kapan dipakai"
                error={errors.note}
              />
            </Card>
            <div className="rounded-2xl bg-line/50 p-4">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold">
                <Lock className="size-4 text-muted" strokeWidth={1.75} />
                Identitas pemohon
              </p>
              <p className="mt-2 text-[14px] font-semibold">{[user.name, user.nim, user.prodi].filter(Boolean).join(' · ')}</p>
              <p className="mt-1 text-[12px] text-muted">Diambil dari akun UNAIR. Tidak ditampilkan ke penemu.</p>
            </div>
            <div>
              <Checkbox checked={form.agree} onClick={() => set({ agree: !form.agree })}>
                Saya menyatakan barang ini milik saya. Klaim palsu dapat dikenai sanksi sesuai aturan kampus.
              </Checkbox>
              {errors.agree && <p className="mt-1 pl-8 text-[12px] font-medium text-danger">{errors.agree}</p>}
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
