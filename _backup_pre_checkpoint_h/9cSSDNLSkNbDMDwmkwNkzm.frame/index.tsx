import React, { useState } from 'react'
import {
  Calendar,
  Check,
  Clock,
  Download,
  FileWarning,
  Hourglass,
  Info,
  Lock,
  Navigation,
  Plus,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react'
import {
  BottomNav,
  Button,
  Card,
  CardTitle,
  IconCircle,
  IdChip,
  InfoBox,
  Logo,
  Modal,
  PageHeader,
  PhotoTile,
  QR,
  Screen,
  Sheet,
  SIMULATED_PHOTO,
  StatusBadge,
  TextArea,
  TextLink,
  Tracker,
  cx,
  type Act,
} from '../shared/foundit/ui'
import { CLAIMS, CLAIM_STAGE_LABEL, DROP_POINTS, TODAY_ISO, USERS, claimStage, claimSupports, getItem, type Claim, type UserKey } from '../shared/foundit/data'
import { PICKUP_SLOTS, dayLabel, pickupDates, qrSeed, ticketPayload, validateEvidence, validateSchedule } from '../shared/foundit/store'

export const args = {
  claimId: 'FI-K-26-0188',
  pengguna: 'rara',
  state: 'menunggu-verifikasi',
  overlay: 'none',
}

export const argTypes = {
  claimId: { control: 'select', options: ['FI-K-26-0188', 'FI-K-26-0191'] },
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
  state: { control: 'select', options: ['menunggu-verifikasi', 'perlu-bukti-tambahan', 'disetujui', 'tiket-siap', 'ditolak'] },
  overlay: { control: 'select', options: ['none', 'tambah-bukti', 'pilih-jadwal', 'batalkan-klaim'] },
}

type Props = Partial<typeof args> & {
  onAction?: Act
  /** Simpan jadwal (prototipe memanggil store). */
  onSchedule?: (dateISO: string, time: string) => void
  /** Kirim bukti tambahan (prototipe memanggil store). */
  onEvidence?: (photos: string[], note: string) => void
}

const short = (s?: string) => s?.replace(/ 20\d\d,/, '')

export default function StatusKlaim(props: Props) {
  const { claimId, pengguna, state, overlay, onAction } = { ...args, ...props }
  const claim: Claim | undefined = CLAIMS[claimId]
  const nav = <BottomNav active="laporan" onAction={onAction} />

  // Klaim hanya bisa dibuka pemohonnya sendiri.
  if (!claim || claim.claimant !== (pengguna as UserKey)) {
    return (
      <Screen nav={nav}>
        <PageHeader title="Status Klaim" onBack={() => onAction?.('kembali')} />
        <div className="px-4 pt-4">
          <InfoBox tone="red" icon={<TriangleAlert strokeWidth={1.75} />}>
            Klaim {claimId || 'ini'} tidak ditemukan di akunmu.
          </InfoBox>
        </div>
      </Screen>
    )
  }

  // Tampilan tahap hanya jika didukung data klaim; jika tidak, tampilkan tahap saat ini.
  const stage = claimSupports(claim, state) ? state : claimStage(claim)
  const item = getItem(claim.itemId)
  const sensitive = !!item?.isSensitive
  const itemName = sensitive ? 'Detail disembunyikan' : (item?.name ?? 'Belum diketahui')
  const point = item?.depositPoint ? DROP_POINTS[item.depositPoint] : undefined
  const req = claim.evidenceRequest

  const overlays = (
    <>
      <Sheet open={overlay === 'tambah-bukti' && !!req && !req.response} onClose={() => onAction?.('tutup')}>
        {req && <TambahBukti message={req.message} onSubmit={props.onEvidence} onAction={onAction} />}
      </Sheet>
      <Sheet open={overlay === 'pilih-jadwal' && !!claim.approval && !claim.rejection} height={600} onClose={() => onAction?.('tutup')}>
        <PilihJadwal claim={claim} onSubmit={props.onSchedule} onAction={onAction} />
      </Sheet>
      <Modal open={overlay === 'batalkan-klaim'} onClose={() => onAction?.('tutup')}>
        <div className="flex justify-center">
          <IconCircle tone="red" size={64}>
            <TriangleAlert className="size-7" strokeWidth={1.75} />
          </IconCircle>
        </div>
        <h2 className="mt-4 font-display text-[20px] font-bold">Batalkan klaim ini?</h2>
        <p className="mt-2 text-[14px] leading-[1.5] text-muted">
          Klaim <span className="font-mono font-semibold text-primary">{claim.id}</span> akan ditarik.
          {claim.laporanId ? ' Laporan kehilanganmu tetap aktif.' : ''}
        </p>
        <Button variant="danger-solid" className="mt-5 w-full" onClick={() => onAction?.('ya-batalkan')}>
          Ya, Batalkan
        </Button>
        <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
          Tidak
        </TextLink>
      </Modal>
    </>
  )

  if (stage === 'tiket-siap') return <TiketSiap claim={claim} itemName={itemName} onAction={onAction} nav={nav} overlay={overlays} />
  if (stage === 'ditolak') return <Ditolak claim={claim} itemName={itemName} onAction={onAction} nav={nav} />

  const bukti = stage === 'perlu-bukti-tambahan'
  const ok = stage === 'disetujui'
  return (
    <Screen nav={nav} overlay={overlays}>
      <PageHeader title="Status Klaim" onBack={() => onAction?.('kembali')} />
      <div className="space-y-4 px-4 pt-1 pb-6">
        <Card>
          <div className="flex items-start gap-3">
            <IconCircle tone={ok ? 'green' : bukti ? 'orange' : 'amber'} size={52}>
              {ok ? (
                <ShieldCheck className="size-6" strokeWidth={1.75} />
              ) : bukti ? (
                <FileWarning className="size-6" strokeWidth={1.75} />
              ) : (
                <Hourglass className="size-6" strokeWidth={1.75} />
              )}
            </IconCircle>
            <div className="min-w-0 flex-1">
              <StatusBadge label={ok ? 'Disetujui' : bukti ? 'Perlu Bukti Tambahan' : 'Diajukan'} />
              <div className="mt-2">
                <IdChip id={claim.id} copy tone="blue" onCopy={() => onAction?.('salin')} />
              </div>
              <p className="mt-1.5 text-[12px] text-muted">
                Diajukan {claim.submitted} · {claim.path === 'kandidat' ? 'Dari kandidat AI' : 'Klaim langsung'}
              </p>
            </div>
          </div>
        </Card>

        {bukti && req && (
          <>
            <div className="rounded-2xl border-l-4 border-orange bg-orange/[0.06] p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-orange text-[13px] font-bold text-white">
                  {req.by
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{req.by} · Petugas Posko</p>
                  <p className="text-[12px] text-muted">{short(req.requested)}</p>
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-[1.5]">{req.message}</p>
            </div>
            {req.response ? (
              <InfoBox tone="green" icon={<Check strokeWidth={1.75} />}>
                Bukti terkirim {short(req.response.sent)}. Petugas akan memeriksanya.
              </InfoBox>
            ) : (
              req.due && (
                <p className="flex items-center gap-2 px-1 text-[13px] font-semibold text-orange">
                  <Calendar className="size-4" strokeWidth={1.75} />
                  Kirim sebelum {req.due}
                </p>
              )
            )}
          </>
        )}

        <button onClick={() => onAction?.('kartu-barang')} className="flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-card">
          {item?.image && !sensitive ? (
            <img src={item.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
              <Lock className="size-6" strokeWidth={1.5} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-snug">{itemName}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <IdChip id={claim.itemId} />
              {point && (
                <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                  <ShieldCheck className="size-4 text-success" strokeWidth={1.75} />
                  {point.name}
                </span>
              )}
            </div>
          </div>
        </button>

        <Card onClick={() => onAction?.('kartu-proses')}>
          <CardTitle>Proses Klaim</CardTitle>
          <Tracker
            steps={[
              { title: 'Klaim diajukan', time: claim.submittedShort, state: 'done' },
              {
                title: 'Diperiksa petugas',
                desc: bukti ? 'Menunggu bukti tambahan darimu' : ok ? `Klaim disetujui ${claim.approval?.by ?? 'petugas'}` : 'Petugas mencocokkan ciri rahasia dan bukti',
                state: ok ? 'done' : 'active',
                color: bukti ? '#EA580C' : undefined,
                time: ok ? short(claim.approval?.decided) : undefined,
              },
              { title: 'Pilih jadwal', state: ok ? (claim.schedule ? 'done' : 'active') : 'todo', desc: ok ? (claim.schedule ? `${claim.schedule.day}, ${claim.schedule.time}` : 'Pilih waktu pengambilan') : undefined },
              { title: `Ambil di ${DROP_POINTS.posko.name}`, state: 'todo' },
            ]}
          />
        </Card>

        {!ok && (
          <InfoBox tone="blue" icon={<Clock strokeWidth={1.75} />} onClick={() => onAction?.('kartu-info')}>
            Petugas memeriksa klaim pada jam layanan {DROP_POINTS.posko.hours}. Kamu akan mendapat notifikasi.
          </InfoBox>
        )}

        {claim.laporanId && <TextLink onClick={() => onAction?.('lihat-laporan')}>Lihat laporan {claim.laporanId} →</TextLink>}

        {ok ? (
          <Button className="w-full" arrow onClick={() => onAction?.(claim.schedule ? 'buka-tiket' : 'pilih-jadwal')}>
            {claim.schedule ? 'Buka Tiket QR' : 'Pilih Jadwal Pengambilan'}
          </Button>
        ) : bukti && req && !req.response ? (
          <div>
            <Button className="w-full" arrow onClick={() => onAction?.('tambah-bukti')}>
              Tambah Bukti
            </Button>
            <div className="flex justify-center">
              <TextLink tone="danger" className="text-[13px]" onClick={() => onAction?.('batalkan')}>
                Batalkan Klaim
              </TextLink>
            </div>
          </div>
        ) : (
          <Button variant="danger" className="w-full" onClick={() => onAction?.('batalkan')}>
            Batalkan Klaim
          </Button>
        )}
      </div>
    </Screen>
  )
}

function TiketSiap({ claim, itemName, onAction, nav, overlay }: { claim: Claim; itemName: string; onAction?: Act; nav: React.ReactNode; overlay: React.ReactNode }) {
  const schedule = claim.schedule!
  const point = DROP_POINTS[schedule.pointKey]
  const owner = USERS[claim.claimant]
  const item = getItem(claim.itemId)
  const payload = ticketPayload(claim.id) ?? ''
  const isToday = schedule.dateISO === TODAY_ISO
  return (
    <Screen nav={nav} overlay={overlay}>
      <PageHeader
        title="Tiket Pengambilan"
        subtitle={`Bawa tiket ini ke ${point.name}`}
        right="share"
        onRight={() => onAction?.('bagikan')}
        onBack={() => onAction?.('kembali')}
      />
      <div className="space-y-4 px-4 pt-1 pb-6">
        <Card>
          <div className="flex items-start gap-3">
            <IconCircle tone="blue" size={48}>
              <ShieldCheck className="size-6" strokeWidth={1.75} />
            </IconCircle>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-[17px] font-semibold">Klaim Disetujui Petugas</p>
                <StatusBadge label="Disetujui" />
              </div>
              <p className="mt-1 text-[13px] leading-[1.5] text-muted">Bawa tiket ini dan identitas asli ke posko sesuai jadwal.</p>
            </div>
          </div>
        </Card>

        <div className="rounded-3xl bg-white shadow-card">
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge label={CLAIM_STAGE_LABEL['tiket-siap']} />
              <span className="font-mono text-[12px] font-semibold text-muted">ID Tiket: {claim.id}</span>
            </div>
            <button onClick={() => onAction?.('qr')} className="mx-auto mt-5 block" aria-label={`QR tiket ${claim.id}`}>
              <QR size={212} seed={qrSeed(payload)} color="#0B1B6B" center={<Logo size={36} />} />
            </button>
            <p className="mt-3 text-center text-[12px] text-muted">Pindai di {point.name} saat serah-terima.</p>
            <p className="mt-1 text-center text-[11px] text-faint">QR prototipe, belum terhubung ke pemindai posko.</p>
            {claim.ticketValidUntil && (
              <div className="mt-3 flex justify-center">
                <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-pink-soft px-3 text-[12px] font-semibold text-pink">
                  <Clock className="size-4" strokeWidth={1.75} />
                  Berlaku sampai {claim.ticketValidUntil}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <span className="-ml-3 size-6 shrink-0 rounded-full bg-page" />
            <span className="mx-2 flex-1 border-t-2 border-dashed border-line" />
            <span className="-mr-3 size-6 shrink-0 rounded-full bg-page" />
          </div>
          <div className="p-5">
            <p className="text-[12px] font-semibold text-muted">Ringkasan Barang</p>
            <div className="mt-2 flex gap-3">
              {item?.image && !item.isSensitive ? (
                <img src={item.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
                  <Lock className="size-5" strokeWidth={1.5} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-snug">{itemName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <IdChip id={claim.itemId} />
                  {item && <span className="text-[12px] text-muted">{item.category}</span>}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-muted">
              Atas nama <span className="font-semibold text-ink">{owner.name}</span>
              {owner.nim ? ` · ${owner.nim}` : ''}
            </p>
          </div>
        </div>

        <Card>
          <CardTitle
            right={
              <TextLink className="min-h-0 text-[13px]" onClick={() => onAction?.('ubah-jadwal')}>
                Ubah Jadwal
              </TextLink>
            }
          >
            <span className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" strokeWidth={1.5} />
              Jadwal Kedatangan
            </span>
          </CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-soft p-3">
              <p className="text-[11px] font-medium text-muted">Hari & Tanggal</p>
              <p className="mt-0.5 text-[14px] font-semibold leading-snug">
                {schedule.day}
                {isToday ? ' (Hari ini)' : ''}
              </p>
            </div>
            <div className="rounded-xl bg-blue-soft p-3">
              <p className="text-[11px] font-medium text-muted">Jam</p>
              <p className="mt-0.5 text-[14px] font-semibold">{schedule.time} WIB</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <IconCircle tone="green" size={44}>
              <ShieldCheck className="size-5" strokeWidth={1.75} />
            </IconCircle>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-semibold">{point.name}</p>
              {point.address && <p className="text-[13px] text-muted">{point.address}</p>}
              <p className="text-[13px] text-muted">{point.hours}</p>
              {point.officer && <p className="mt-1 text-[13px]">Petugas jaga: {point.officer}</p>}
            </div>
          </div>
          <Button variant="secondary" className="mt-3 w-full" icon={<Navigation className="size-4" strokeWidth={1.75} />} onClick={() => onAction?.('petunjuk-arah')}>
            Petunjuk Arah
          </Button>
        </Card>

        <Card>
          <CardTitle>Yang Wajib Dibawa</CardTitle>
          <ol className="space-y-2.5">
            {['KTM asli atau e-KTM', 'QR tiket ini (bisa dibuka tanpa internet setelah disimpan)', 'Siap menandatangani BAST di posko'].map((t, i) => (
              <li key={t} className="flex gap-3 text-[14px] leading-[1.5]">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-soft text-[12px] font-bold text-primary">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-3 pt-1">
          <Button className="w-full" icon={<Download className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('simpan-tiket')}>
            Simpan Tiket ke Galeri
          </Button>
          {claim.laporanId && (
            <Button variant="secondary" className="w-full" onClick={() => onAction?.('lihat-laporan')}>
              Lihat Laporan
            </Button>
          )}
          <div className="flex justify-center">
            <TextLink tone="danger" className="text-[13px]" onClick={() => onAction?.('batalkan')}>
              Batalkan Klaim
            </TextLink>
          </div>
        </div>
      </div>
    </Screen>
  )
}

function Ditolak({ claim, itemName, onAction, nav }: { claim: Claim; itemName: string; onAction?: Act; nav: React.ReactNode }) {
  const item = getItem(claim.itemId)
  const rejection = claim.rejection!
  return (
    <Screen nav={nav}>
      <PageHeader title="Status Klaim" onBack={() => onAction?.('kembali')} />
      <div className="space-y-4 px-4 pt-1 pb-6">
        <Card>
          <div className="flex items-start gap-3">
            <IconCircle tone="red" size={52}>
              <X className="size-6" strokeWidth={2} />
            </IconCircle>
            <div className="min-w-0 flex-1">
              <StatusBadge label="Ditolak" />
              <div className="mt-2">
                <IdChip id={claim.id} tone="blue" />
              </div>
              <p className="mt-1.5 text-[12px] text-muted">Diajukan {claim.submitted}</p>
            </div>
          </div>
        </Card>
        <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-card">
          {item?.image && !item.isSensitive ? (
            <img src={item.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
              <Lock className="size-6" strokeWidth={1.5} />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-snug">{itemName}</p>
            <div className="mt-1.5">
              <IdChip id={claim.itemId} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border-l-4 border-danger bg-danger/[0.06] p-4">
          <p className="text-[12px] font-semibold text-danger">Alasan dari petugas</p>
          <p className="mt-1 text-[15px] font-semibold leading-[1.5]">{rejection.reason}</p>
          <p className="mt-2 text-[12px] text-muted">
            Diputuskan {rejection.decided} · {rejection.by}
          </p>
        </div>
        <InfoBox tone="blue" icon={<Info strokeWidth={1.75} />}>
          Merasa keliru? Datang ke {DROP_POINTS.posko.name} dengan bukti kepemilikan.
        </InfoBox>
        <Button className="w-full" onClick={() => onAction?.('lokasi-posko')}>
          Lihat Lokasi Posko
        </Button>
        <div className="-mt-2 flex justify-center">
          <TextLink onClick={() => onAction?.('beranda')}>Kembali ke Beranda</TextLink>
        </div>
      </div>
    </Screen>
  )
}

function TambahBukti({ message, onSubmit, onAction }: { message: string; onSubmit?: (photos: string[], note: string) => void; onAction?: Act }) {
  const [photos, setPhotos] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const err = validateEvidence(photos, note)
  const send = () => {
    if (sending) return
    if (err) return setTried(true)
    setSending(true)
    if (onSubmit) onSubmit(photos, note)
    else onAction?.('kirim-bukti')
  }
  return (
    <div>
      <h2 className="font-display text-[20px] font-bold">Tambah Bukti</h2>
      <p className="mt-1 text-[13px] text-muted">Permintaan petugas: {message}</p>
      <div className="mt-4 flex gap-3">
        {photos.map((src, i) => (
          <div key={i} className="relative size-24 shrink-0">
            <PhotoTile src={src} className="size-full rounded-xl" />
            <button
              aria-label="Hapus foto"
              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
              className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-ink text-white ring-2 ring-white"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        ))}
        {photos.length < 3 && (
          <button
            onClick={() => setPhotos([...photos, SIMULATED_PHOTO])}
            className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-faint text-[12px] font-semibold text-muted"
          >
            <Plus className="size-5" strokeWidth={1.75} />
            Tambah
          </button>
        )}
      </div>
      <div className="mt-4">
        <TextArea label="Keterangan" value={note} onChange={setNote} placeholder="Contoh: kapan foto ini diambil" />
      </div>
      {tried && err && <p className="mt-2 text-[12px] font-medium text-danger">{err}</p>}
      <Button className="mt-5 w-full" arrow variant={sending ? 'disabled' : undefined} onClick={send}>
        {sending ? 'Mengirim…' : 'Kirim Bukti'}
      </Button>
      <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
        Batal
      </TextLink>
    </div>
  )
}

function PilihJadwal({ claim, onSubmit, onAction }: { claim: Claim; onSubmit?: (dateISO: string, time: string) => void; onAction?: Act }) {
  const dates = pickupDates(3)
  const point = DROP_POINTS.posko
  const [date, setDate] = useState(claim.schedule?.dateISO ?? '')
  const [time, setTime] = useState(claim.schedule?.time ?? '')
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const err = validateSchedule(date, time)
  const send = () => {
    if (sending) return
    if (err) return setTried(true)
    setSending(true)
    if (onSubmit) onSubmit(date, time)
    else onAction?.('konfirmasi-jadwal')
  }
  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <IconCircle tone="green" size={72}>
          <span className="flex size-12 items-center justify-center rounded-full bg-success text-white">
            <Check className="size-7" strokeWidth={3} />
          </span>
        </IconCircle>
        <h2 className="mt-4 font-display text-[20px] font-bold leading-tight">
          {claim.schedule ? 'Ubah jadwal pengambilan' : 'Klaim disetujui! Pilih jadwal pengambilan'}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
          <ShieldCheck className="size-4 text-success" strokeWidth={1.75} />
          {point.name} · {point.hours}
        </p>
      </div>
      <p className="mt-5 mb-2 text-[13px] font-semibold">Tanggal</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tanggal">
        {dates.map((d) => {
          const label = dayLabel(d).replace(/^(\w{3})\w*, (\d+) (\w{3})\w* \d+$/, '$1, $2 $3')
          return (
            <button
              key={d}
              role="radio"
              aria-checked={date === d}
              onClick={() => setDate(d)}
              className={cx('h-14 rounded-xl text-[14px] font-semibold transition-colors duration-150', date === d ? 'bg-primary text-white' : 'bg-white ring-1 ring-line')}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p className="mt-4 mb-2 text-[13px] font-semibold">Jam</p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Jam">
        {PICKUP_SLOTS.map((t) => (
          <button
            key={t}
            role="radio"
            aria-checked={time === t}
            onClick={() => setTime(t)}
            className={cx('flex h-12 items-center justify-center rounded-xl text-[14px] font-semibold transition-colors duration-150', time === t ? 'bg-primary text-white' : 'bg-white ring-1 ring-line')}
          >
            {t}
          </button>
        ))}
      </div>
      {tried && err && <p className="mt-2 text-[12px] font-medium text-danger">{err}</p>}
      {claim.ticketValidUntil && <p className="mt-3 text-[12px] text-muted">Tiket berlaku sampai {claim.ticketValidUntil}. Jadwal bisa diubah sebelum itu.</p>}
      <Button className="mt-5 w-full" arrow variant={sending ? 'disabled' : undefined} onClick={send}>
        {sending ? 'Menyimpan…' : 'Konfirmasi Jadwal'}
      </Button>
    </div>
  )
}
