import React from 'react'
import { ArrowLeft, ArrowRight, Clock, FileText, Hand, Hourglass, Images, Info, Lock, MapPin, PackageX, Search, Share2, ShieldCheck } from 'lucide-react'
import {
  BottomNav,
  Button,
  CategoryBadge,
  EmptyState,
  IconButton,
  IconCircle,
  IdChip,
  PageHeader,
  Pill,
  Screen,
  Sheet,
  StatusBadge,
  TextLink,
  cx,
  type Act,
} from '../shared/foundit/ui'
import { GuestKlaimSheetBody, GuestLaporSheetBody } from '../shared/foundit/sheets'
import { DROP_POINTS, LOST_REPORTS, getItem } from '../shared/foundit/data'

export const args = {
  itemId: 'FI-T-26-0095',
  akun: 'civitas',
  sheet: 'none',
  laporanId: 'FI-L-26-0021',
}

export const argTypes = {
  itemId: {
    control: 'select',
    options: [
      'FI-T-26-0095',
      'FI-T-26-0110',
      'FI-T-26-0089',
      'FI-T-26-0101',
      'FI-T-26-0072',
      'FI-T-26-0081',
      'FI-T-26-0019',
      'FI-T-26-0097',
      'FI-T-26-0042',
      'FI-T-26-0058',
      'FI-T-26-0064',
      'FI-T-26-0076',
      'FI-T-26-9999',
    ],
  },
  akun: { control: 'radio', options: ['civitas', 'tamu'] },
  sheet: { control: 'select', options: ['none', 'pilih-laporan-saya', 'fitur-klaim-tamu', 'fitur-lapor-tamu'] },
  laporanId: { control: 'select', options: ['FI-L-26-0021', 'FI-L-26-0031'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function DetailBarangTemuan(props: Props) {
  const { itemId, akun, sheet, laporanId, onAction } = { ...args, ...props }
  const item = getItem(itemId)
  const guest = akun === 'tamu'
  const nav = <BottomNav variant={guest ? 'tamu' : 'civitas'} active="temuan" notif={!guest} onAction={onAction} />

  // ID tidak ditemukan: tampilkan keadaan kosong, jangan ganti dengan barang lain.
  if (!item) {
    return (
      <Screen nav={nav}>
        <PageHeader title="Detail Barang" onBack={() => onAction?.('kembali')} />
        <EmptyState
          illustration={
            <IconCircle tone="gray" size={96}>
              <PackageX className="size-10" strokeWidth={1.5} />
            </IconCircle>
          }
          title="Barang tidak tersedia"
          text="Barang ini mungkin sudah diserahkan ke pemiliknya atau datanya sudah tidak tampil."
        >
          <Button variant="secondary" onClick={() => onAction?.('kembali')}>
            Kembali ke Daftar Temuan
          </Button>
        </EmptyState>
      </Screen>
    )
  }

  const sensitive = item.isSensitive
  const returned = item.depositStatus === 'Diserahkan'
  const ready = item.depositStatus === 'Siap Diserahkan'
  const notDeposited = item.depositStatus === 'Belum Dititipkan'
  const point = item.depositPoint ? DROP_POINTS[item.depositPoint] : undefined
  const photos = item.image ? 1 + (item.additionalImages?.length ?? 0) : 0
  const showSimilar = !returned && !ready && !sensitive && !notDeposited

  return (
    <Screen
      nav={nav}
      footer={
        <div className="space-y-2">
          {returned ? (
            <Button variant="disabled" className="w-full">
              Sudah Kembali ke Pemilik
            </Button>
          ) : ready ? (
            <>
              <Button variant="disabled" className="w-full">
                Sedang Proses Serah-Terima
              </Button>
              <div className="flex justify-center">
                <TextLink className="text-[13px]" onClick={() => onAction?.('hubungi-posko')}>
                  Merasa ini barangmu? Hubungi Posko Dekanat Lt. 1
                </TextLink>
              </div>
            </>
          ) : (
            <>
              <Button className="w-full" icon={<Hand className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('klaim')}>
                Ini Barang Saya – Ajukan Klaim
              </Button>
              {notDeposited && <p className="text-center text-[12px] text-muted">Klaim diproses setelah barang diterima posko.</p>}
              {sensitive && <p className="text-center text-[12px] text-muted">Siapkan identitas asli saat pengambilan.</p>}
              {showSimilar && (
                <Button variant="secondary" className="w-full" icon={<Search className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('kehilangan-serupa')}>
                  Saya Kehilangan Barang Serupa
                </Button>
              )}
            </>
          )}
        </div>
      }
      overlay={
        <>
          <Sheet open={sheet === 'pilih-laporan-saya'} onClose={() => onAction?.('tutup')}>
            <PilihLaporanSaya laporanId={laporanId} onAction={onAction} />
          </Sheet>
          <Sheet open={sheet === 'fitur-klaim-tamu'} onClose={() => onAction?.('tutup')}>
            <GuestKlaimSheetBody id={item.idConfirmed ? item.id : undefined} onAction={onAction} />
          </Sheet>
          <Sheet open={sheet === 'fitur-lapor-tamu'} onClose={() => onAction?.('tutup')}>
            <GuestLaporSheetBody onAction={onAction} />
          </Sheet>
        </>
      }
    >
      {/* Galeri */}
      <div className={cx('relative', sensitive ? 'h-[240px]' : 'h-[300px]')}>
        {sensitive || !item.image ? (
          <div className="flex size-full flex-col items-center justify-center gap-3 bg-blue-soft px-10 pb-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-white text-primary shadow-card">
              <Lock className="size-8" strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium leading-[1.5] text-ink">Foto dan nama disembunyikan untuk melindungi pemilik.</p>
          </div>
        ) : (
          <>
            <img src={item.image} alt={item.name} className="size-full object-cover" />
            {photos > 1 && (
              <div className="absolute inset-x-0 bottom-8 flex justify-center gap-1.5">
                {Array.from({ length: photos }).map((_, i) => (
                  <span key={i} className={i === 0 ? 'h-1.5 w-5 rounded-full bg-white' : 'size-1.5 rounded-full bg-white/60'} />
                ))}
              </div>
            )}
          </>
        )}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <IconButton label="Kembali" white onClick={() => onAction?.('kembali')}>
            <ArrowLeft className="size-5" strokeWidth={1.75} />
          </IconButton>
          <div className="flex items-center gap-2">
            {photos > 0 && !sensitive && (
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink/60 px-3 text-[12px] font-semibold text-white">
                <Images className="size-4" strokeWidth={1.75} />
                {photos} Foto
              </span>
            )}
            <IconButton label="Bagikan" white onClick={() => onAction?.('bagikan')}>
              <Share2 className="size-5" strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="relative -mt-6 rounded-t-[24px] bg-page px-4 pt-5 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={item.category} />
          <StatusBadge label={item.depositStatus} />
          {sensitive && <Pill tone="pink-outline">Sensitif</Pill>}
          {item.idConfirmed && (
            <span className="ml-auto">
              <IdChip id={item.id} />
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-[22px] font-bold leading-tight">
          {sensitive ? (
            <span className="inline-flex items-center gap-2">
              <Lock className="size-5 text-pink" strokeWidth={2} />
              Detail disembunyikan
            </span>
          ) : (
            item.name
          )}
        </h1>
        <p className="mt-1 text-[12px] text-muted">Terdaftar di FoundIt Vokasi</p>

        <div className="mt-4 divide-y divide-white rounded-2xl bg-blue-soft">
          <InfoLine icon={<MapPin className="size-5" strokeWidth={1.5} />} label="Lokasi Ditemukan" value={item.location} />
          <InfoLine icon={<Clock className="size-5" strokeWidth={1.5} />} label="Waktu Ditemukan" value={item.foundAtFull} />
        </div>

        {item.description && !sensitive && (
          <section className="mt-5">
            <h2 className="font-display text-[17px] font-semibold">Deskripsi Publik</h2>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-muted">{item.description}</p>
          </section>
        )}

        {ready && (
          <div className="mt-4 flex gap-3 rounded-2xl bg-violet/10 p-4">
            <Info className="size-5 shrink-0 text-violet" strokeWidth={1.75} />
            <p className="text-[13px] leading-[1.5]">Barang ini sedang menunggu diambil pemilik yang sudah diverifikasi petugas.</p>
          </div>
        )}

        {notDeposited && (
          <div className="mt-4 flex gap-3 rounded-2xl bg-orange/10 p-4">
            <Hourglass className="size-5 shrink-0 text-orange" strokeWidth={1.75} />
            <div>
              <p className="font-display text-[16px] font-semibold">Barang masih dibawa penemu</p>
              <p className="mt-1 text-[13px] leading-[1.5] text-muted">
                Wajib dititipkan ke Posko Dekanat Lt. 1{item.depositDeadline ? ` paling lambat ${item.depositDeadline}` : ' paling lambat 1×24 jam'}.
              </p>
            </div>
          </div>
        )}

        {!ready && !notDeposited && point && (
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-card">
            <div className="flex gap-3">
              <IconCircle tone="green" size={40}>
                <ShieldCheck className="size-5" strokeWidth={1.75} />
              </IconCircle>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-wide text-success">TITIK PENITIPAN RESMI</p>
                <p className="font-display text-[16px] font-semibold">{point.name}</p>
                <p className="text-[13px] text-muted">{point.hours}</p>
                {point.key === 'gerbang' && <p className="mt-1 text-[12px] leading-[1.5] text-muted">Klaim dan serah-terima tetap di Posko Dekanat Lt. 1.</p>}
              </div>
            </div>
            <TextLink className="mt-1 text-[13px]" onClick={() => onAction?.('petunjuk-arah:' + point.key)}>
              Petunjuk Arah <ArrowRight className="size-4" strokeWidth={2} />
            </TextLink>
          </div>
        )}

        {!ready && (
          <div className="mt-4 flex gap-3 rounded-2xl bg-yellow-soft p-4">
            <Lock className="size-5 shrink-0 text-amber" strokeWidth={1.75} />
            <div>
              <p className="font-display text-[16px] font-semibold">Ciri pembeda disembunyikan</p>
              <p className="mt-1 text-[13px] leading-[1.5] text-muted">
                {item.category === 'Dompet & Tas' && item.name.startsWith('Dompet') ? 'Isi dompet' : 'Isi'} dan ciri khusus hanya diketahui petugas. Kamu akan ditanya saat mengajukan klaim.
              </p>
            </div>
          </div>
        )}
      </div>
    </Screen>
  )
}

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted">{label}</p>
        <p className="text-[14px] font-semibold">{value}</p>
      </div>
    </div>
  )
}

/**
 * Sheet untuk Civitas yang sudah punya laporan kehilangan dengan kandidat barang ini.
 * Klaim lewat jalur Candidate Matching (Bandingkan), bukan Form Klaim Langsung.
 */
function PilihLaporanSaya({ laporanId, onAction }: { laporanId: string; onAction?: Act }) {
  const report = LOST_REPORTS[laporanId]
  if (!report) return null
  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <IconCircle tone="blue" size={64}>
          <FileText className="size-7" strokeWidth={1.5} />
        </IconCircle>
        <h2 className="mt-4 font-display text-[20px] font-bold">Kamu sudah punya laporan kehilangan</h2>
        <p className="mt-2 text-[14px] leading-[1.5] text-muted">Pakai laporanmu supaya tidak perlu mengisi ulang.</p>
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-primary bg-blue-soft/40 p-4">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-primary">
          <span className="size-2.5 rounded-full bg-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[12px] font-semibold text-primary">{report.id}</p>
          <p className="mt-0.5 text-[15px] font-semibold">{report.title ?? 'Belum diketahui'}</p>
          <p className="text-[12px] text-muted">{report.reported}</p>
        </div>
        <StatusBadge label="Dilaporkan" />
      </div>
      <Button className="mt-5 w-full" arrow onClick={() => onAction?.('bandingkan')}>
        Bandingkan dengan Laporan Ini
      </Button>
      <div className="mt-1 flex justify-center">
        <TextLink tone="muted" onClick={() => onAction?.('tutup')}>
          Batal
        </TextLink>
      </div>
    </div>
  )
}
