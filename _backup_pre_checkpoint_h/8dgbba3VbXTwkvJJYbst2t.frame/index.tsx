import React, { useEffect, useState } from 'react'
import { Calendar, Clock, CupSoda, Eye, EyeOff, FileText, Lock, MapPin, Palette, Plus, SearchX, ShieldCheck, Sparkles, User, X } from 'lucide-react'
import {
  BottomNav,
  Button,
  Card,
  CardTitle,
  Checkbox,
  EmptyState,
  IconCircle,
  IdChip,
  MetaRow,
  Modal,
  PageHeader,
  PhotoTile,
  Pill,
  ScoreRing,
  Screen,
  Sheet,
  SIMULATED_PHOTO,
  StatusBadge,
  TextLink,
  cx,
  type Act,
} from '../shared/foundit/ui'
import { DROP_POINTS, FOUND_REPORTS, LOST_REPORTS, SKOR_NOTE, USERS, candidateOf, getItem, type UserKey } from '../shared/foundit/data'

export const args = {
  laporanId: 'FI-L-26-0021',
  itemId: 'FI-T-26-0042',
  pengguna: 'rara',
  overlay: 'none',
}

export const argTypes = {
  laporanId: { control: 'select', options: ['FI-L-26-0021', 'FI-L-26-0031'] },
  itemId: { control: 'text' },
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
  overlay: { control: 'radio', options: ['none', 'konfirmasi-klaim', 'bukan-barang-saya'] },
}

type Props = Partial<typeof args> & {
  onAction?: Act
  /** Dipanggil saat klaim dikirim dari Confirmation Sheet. */
  onSubmitClaim?: (evidencePhoto?: string) => void
  /** Dipanggil saat kandidat ditandai Bukan Barang Saya. */
  onHide?: (reason?: string) => void
}

const REASONS = ['Warna beda', 'Merek beda', 'Lokasi beda', 'Lainnya']
const ASPECT_ICON = {
  kategori: <CupSoda strokeWidth={1.5} />,
  lokasi: <MapPin strokeWidth={1.5} />,
  waktu: <Clock strokeWidth={1.5} />,
  warna: <Palette strokeWidth={1.5} />,
}

export default function BandingkanKandidat(props: Props) {
  const { laporanId, itemId, pengguna, overlay, onAction } = { ...args, ...props }
  const report = LOST_REPORTS[laporanId]
  const cand = candidateOf(laporanId, itemId)
  const item = getItem(itemId)
  const [reason, setReason] = useState<string | null>(null)
  const nav = <BottomNav active="laporan" onAction={onAction} />

  // Kandidat hanya untuk pemilik laporan, dan hanya jika masih terkait dengan laporan ini.
  if (!report || !cand || !item || report.owner !== pengguna) {
    return (
      <Screen nav={nav}>
        <PageHeader title="Bandingkan Kandidat" onBack={() => onAction?.('kembali')} />
        <EmptyState
          illustration={
            <IconCircle tone="gray" size={96}>
              <SearchX className="size-10" strokeWidth={1.5} />
            </IconCircle>
          }
          title="Kandidat tidak tersedia"
          text={
            report && report.owner !== pengguna
              ? 'Kandidat dan skor kecocokan hanya bisa dilihat pemilik laporan.'
              : 'Kandidat ini sudah kamu sembunyikan atau tidak lagi terkait dengan laporanmu. Sistem terus mencari.'
          }
        >
          <Button variant="secondary" onClick={() => onAction?.('kembali')}>
            Kembali
          </Button>
        </EmptyState>
      </Screen>
    )
  }

  const found = FOUND_REPORTS[item.id]
  const point = item.depositPoint ? DROP_POINTS[item.depositPoint] : undefined
  const sensitive = item.isSensitive
  const photos = sensitive ? [] : [item.image, ...(item.additionalImages ?? [])].filter((x): x is string => !!x)
  const status = found?.status ?? item.depositStatus
  const strong = cand.score >= 80

  return (
    <Screen
      nav={nav}
      overlay={
        <>
          <Sheet open={overlay === 'konfirmasi-klaim'} height={680} onClose={() => onAction?.('tutup')}>
            <KonfirmasiKlaim
              laporanId={laporanId}
              itemName={sensitive ? 'Detail disembunyikan' : item.name}
              itemId={item.id}
              user={report.owner}
              onSubmit={props.onSubmitClaim}
              onAction={onAction}
            />
          </Sheet>
          <Modal open={overlay === 'bukan-barang-saya'} onClose={() => onAction?.('tutup')}>
            <div className="flex justify-center">
              <IconCircle tone="gray" size={64}>
                <X className="size-7" strokeWidth={1.75} />
              </IconCircle>
            </div>
            <h2 className="mt-4 font-display text-[20px] font-bold">Bukan barangmu?</h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-muted">Kandidat ini disembunyikan dari laporanmu. Laporan tetap aktif dan sistem terus mencari.</p>
            <p className="mt-4 text-left text-[12px] font-medium text-muted">Alasan (opsional)</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Alasan">
              {REASONS.map((c) => (
                <button
                  key={c}
                  role="radio"
                  aria-checked={reason === c}
                  onClick={() => setReason(reason === c ? null : c)}
                  className={cx(
                    'inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150',
                    reason === c ? 'bg-primary text-white' : 'bg-white ring-1 ring-line'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <Button
              className="mt-5 w-full"
              onClick={() => {
                if (props.onHide) props.onHide(reason ?? undefined)
                else onAction?.('sembunyikan')
              }}
            >
              Ya, Sembunyikan
            </Button>
            <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
              Batal
            </TextLink>
          </Modal>
        </>
      }
    >
      <PageHeader title="Bandingkan Kandidat" subtitle="Laporanmu vs barang temuan" onBack={() => onAction?.('kembali')} />

      <div className="space-y-4 px-4 pt-1 pb-6">
        {/* Skor: hanya untuk pemilik laporan (sudah dicek di atas) */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <Pill tone="violet" icon={<Sparkles strokeWidth={2} />}>
                Kandidat AI
              </Pill>
              <p className="mt-2 font-display text-[22px] font-bold">{strong ? 'Sangat mirip' : 'Cukup mirip'}</p>
              <p className="mt-1 text-[12px] leading-[1.5] text-muted">
                Sistem membandingkan {cand.aspects?.length ?? 0} aspek antara laporanmu dan barang temuan.
              </p>
            </div>
            <ScoreRing value={cand.score} size={84} label="mirip" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <IdChip id={item.id} />
            <StatusBadge label={status} />
            {point && <Pill tone="blue">{point.name}</Pill>}
          </div>
        </Card>

        {/* Perbandingan */}
        <section>
          <h2 className="mb-3 font-display text-[18px] font-semibold">Perbandingan</h2>
          <div className="grid grid-cols-2 gap-3">
            <CompareCol
              label="Laporanmu"
              tone="pink"
              img={report.photo}
              id={report.id}
              name={report.title ?? 'Belum diketahui'}
              sub={report.category ?? 'Kategori belum diketahui'}
              when={report.lostWhen ?? 'Belum diketahui'}
              where={report.location ?? 'Belum diketahui'}
            />
            <CompareCol
              label="Barang temuan"
              tone="blue"
              img={sensitive ? undefined : item.image}
              id={item.id}
              name={sensitive ? 'Detail disembunyikan' : item.name}
              sub={item.category}
              when={item.foundAtFull.replace(' WIB', '')}
              where={item.location}
            />
          </div>
        </section>

        {/* Foto penemu (nama penemu tidak pernah ditampilkan) */}
        {photos.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-[18px] font-semibold">Foto dari Penemu</h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
              {photos.map((src, i) => (
                <figure key={src} className="w-[132px] shrink-0">
                  <img src={src} alt={`Foto ${i + 1}`} className="aspect-square w-full rounded-xl object-cover" />
                  <figcaption className="mt-1 text-[12px] text-muted">Foto {i + 1}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Parameter */}
        <Card>
          <CardTitle right={<Pill tone="blue">{cand.aspects?.length ?? 0} aspek</Pill>}>Parameter Kecocokan</CardTitle>
          <div className="divide-y divide-line">
            {(cand.aspects ?? []).map((a) => (
              <React.Fragment key={a.key}>
                <Param icon={ASPECT_ICON[a.key]} label={a.label} value={a.value} pct={a.pct} />
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-pink-soft px-3 py-3">
            <Lock className="size-5 text-pink" strokeWidth={1.75} />
            <span className="flex-1 text-[14px] font-semibold">Ciri rahasia</span>
            <Pill tone="pink">Dicek petugas</Pill>
          </div>
        </Card>

        {/* Penyimpanan */}
        {point && (
          <Card>
            <div className="flex items-start gap-3">
              <IconCircle tone="green" size={44}>
                <ShieldCheck className="size-5" strokeWidth={1.75} />
              </IconCircle>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-[16px] font-semibold">Disimpan di {point.name}</p>
                  <StatusBadge label="Tersimpan" />
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  {point.officer ? `Petugas jaga: ${point.officer} · ` : ''}
                  {point.hours}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3 pt-1">
          <Button className="w-full" icon={<User className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('ajukan-klaim')}>
            Ya, Ini Barang Saya! Ajukan Klaim
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => onAction?.('bukan')}>
            Bukan Barang Saya
          </Button>
        </div>
        <p className="flex gap-2 text-[12px] leading-[1.5] text-muted">
          <ShieldCheck className="size-4 shrink-0 text-pink" strokeWidth={1.75} />
          {SKOR_NOTE} Klaim palsu melanggar kode etik mahasiswa.
        </p>
      </div>
    </Screen>
  )
}

function CompareCol({
  label,
  tone,
  img,
  id,
  name,
  sub,
  when,
  where,
}: {
  label: string
  tone: 'pink' | 'blue'
  img?: string
  id: string
  name: string
  sub: string
  when: string
  where: string
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-3 shadow-card">
      <span className={cx('text-[12px] font-semibold', tone === 'pink' ? 'text-pink' : 'text-primary')}>{label}</span>
      {img ? (
        <PhotoTile src={img} className="mt-2 aspect-square w-full rounded-xl" />
      ) : (
        <div className="mt-2 flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl bg-blue-soft text-primary">
          <Lock className="size-6" strokeWidth={1.5} />
          <span className="text-[11px] font-medium text-muted">Tanpa foto</span>
        </div>
      )}
      <div className="mt-2">
        <IdChip id={id} />
      </div>
      <p className="mt-2 text-[14px] font-semibold leading-snug">{name}</p>
      <p className="mt-0.5 text-[12px] text-muted">{sub}</p>
      <div className="mt-auto space-y-1 pt-2">
        <MetaRow icon={<Calendar strokeWidth={1.5} />} className="text-[12px]">
          {when}
        </MetaRow>
        <MetaRow icon={<MapPin strokeWidth={1.5} />} className="text-[12px]">
          {where}
        </MetaRow>
      </div>
    </div>
  )
}

function Param({ icon, label, value, pct }: { icon: React.ReactNode; label: string; value: string; pct: number }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-soft text-primary [&>svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{label}</p>
        <p className="text-[12px] leading-[1.4] text-muted">{value}</p>
        <div className="mt-1.5 h-1 rounded-full bg-blue-soft">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="w-11 shrink-0 text-right font-display text-[16px] font-bold text-primary">{pct}%</span>
    </div>
  )
}

/** Confirmation Sheet: data laporan dikirim ke petugas, pengguna wajib menyatakan kepemilikan. */
function KonfirmasiKlaim({
  laporanId,
  itemId,
  itemName,
  user,
  onSubmit,
  onAction,
}: {
  laporanId: string
  itemId: string
  itemName: string
  user: UserKey
  onSubmit?: (evidencePhoto?: string) => void
  onAction?: Act
}) {
  const report = LOST_REPORTS[laporanId]
  const owner = USERS[user]
  const [agree, setAgree] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  useEffect(() => setSending(false), [laporanId, itemId])

  const send = () => {
    if (sending) return
    if (!agree) return setTried(true)
    setSending(true)
    if (onSubmit) onSubmit(photo ?? undefined)
    else onAction?.('kirim-klaim')
  }

  return (
    <div>
      <h2 className="font-display text-[20px] font-bold">Ajukan klaim untuk barang ini?</h2>
      <p className="mt-1.5 text-[14px] leading-[1.5] text-muted">Data dari laporanmu dikirim ke petugas. Kamu tidak perlu mengisi ulang.</p>
      <div className="mt-4 rounded-2xl bg-blue-soft p-4">
        <p className="text-[13px] font-semibold">Data yang dikirim</p>
        <ul className="mt-2 space-y-2.5 text-[13px] leading-[1.5]">
          <Row icon={<Sparkles strokeWidth={1.5} />}>
            Barang <span className="font-mono font-semibold text-primary">{itemId}</span> · {itemName}
          </Row>
          <Row icon={<FileText strokeWidth={1.5} />}>
            Laporan <span className="font-mono font-semibold text-primary">{laporanId}</span> · {report?.title ?? 'Belum diketahui'}
          </Row>
          {report?.lostWhen && <Row icon={<Clock strokeWidth={1.5} />}>Hilang {report.lostWhen.replace(' · ', ', ')}</Row>}
          {report?.location && <Row icon={<MapPin strokeWidth={1.5} />}>{report.location}</Row>}
          <Row
            icon={<Lock className="text-pink" strokeWidth={1.75} />}
            trailing={
              report?.secret ? (
                <button aria-label={showSecret ? 'Sembunyikan ciri rahasia' : 'Tampilkan ciri rahasia'} onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff className="size-4 text-muted" strokeWidth={1.5} /> : <Eye className="size-4 text-muted" strokeWidth={1.5} />}
                </button>
              ) : undefined
            }
          >
            Ciri rahasia: {report?.secret ? (showSecret ? report.secret : '••••••••') : 'belum diisi'}{' '}
            <span className="text-muted">(hanya kamu & petugas)</span>
          </Row>
          <Row icon={<User strokeWidth={1.5} />}>
            {owner.name}
            {owner.nim ? ` · ${owner.nim}` : ''}
          </Row>
        </ul>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[14px] font-semibold">Tambah foto bukti</p>
        <Pill>Opsional</Pill>
      </div>
      {photo ? (
        <div className="relative mt-2 size-20">
          <PhotoTile src={photo} className="size-full rounded-xl" />
          <button
            aria-label="Hapus foto"
            onClick={() => setPhoto(null)}
            className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-ink text-white ring-2 ring-white"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setPhoto(SIMULATED_PHOTO)}
          className="mt-2 flex h-20 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-faint text-[13px] font-semibold text-muted"
        >
          <Plus className="size-5" strokeWidth={1.75} />
          Unggah foto
        </button>
      )}
      <p className="mt-1.5 text-[12px] text-muted">Foto lama saat memakai barang, struk, atau kotak barang.</p>
      <div className="mt-4">
        <Checkbox checked={agree} onClick={() => setAgree(!agree)}>
          Saya menyatakan barang ini milik saya. Klaim palsu dapat dikenai sanksi sesuai aturan kampus.
        </Checkbox>
        {tried && !agree && <p className="mt-1 pl-8 text-[12px] font-medium text-danger">Centang pernyataan ini untuk mengirim klaim</p>}
      </div>
      <Button className="mt-4 w-full" arrow variant={sending ? 'disabled' : undefined} onClick={send}>
        {sending ? 'Mengirim…' : 'Kirim Klaim'}
      </Button>
      <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
        Batal
      </TextLink>
    </div>
  )
}

function Row({ icon, children, trailing }: { icon: React.ReactNode; children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-primary [&>svg]:size-4">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
      {trailing}
    </li>
  )
}
