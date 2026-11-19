import React from 'react'
import { ArrowRight, Bell, Building2, ChevronRight, FolderOpen, GraduationCap, Lock, MapPin, Plus, Search, Sparkles, Upload } from 'lucide-react'
import { BottomNav, Button, HomeHeader, ItemCard, Screen, Sheet, StatusBadge, TextLink, cx, type Act } from '../shared/foundit/ui'
import { GuestLaporSheetBody } from '../shared/foundit/sheets'
import {
  BERANDA_ITEM_IDS,
  CLAIM_STAGE_LABEL,
  DROP_POINTS,
  FOUND_ITEMS,
  IMG,
  USERS,
  claimStage,
  claimsOf,
  foundView,
  getItem,
  lostStage,
  reportsOf,
  type UserKey,
} from '../shared/foundit/data'

export const args = {
  akun: 'civitas',
  pengguna: 'rara',
  sheet: 'none',
}

export const argTypes = {
  akun: { control: 'radio', options: ['civitas', 'tamu'] },
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
  sheet: { control: 'radio', options: ['none', 'pilih-laporan', 'fitur-lapor-tamu'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function Beranda(props: Props) {
  const { akun, pengguna, sheet, onAction } = { ...args, ...props }
  const guest = akun === 'tamu'
  const userKey = (props.pengguna ?? pengguna ?? 'rara') as UserKey
  const user = USERS[userKey]
  const firstName = user?.name ? user.name.split(' ')[0] : 'Civitas'

  const items = BERANDA_ITEM_IDS.map((id) => getItem(id)).filter((it): it is NonNullable<typeof it> => !!it)

  // Ambil klaim atau laporan aktif milik pengguna saat ini
  const activeClaim = claimsOf(userKey).find((c) => claimStage(c) !== 'ditolak')
  const activeLost = !activeClaim ? reportsOf(userKey).lost.find((r) => lostStage(r) < 4) : undefined
  const activeFound = !activeClaim && !activeLost ? reportsOf(userKey).found.find((r) => r.status !== 'Diserahkan') : undefined

  let activeData: {
    title: string
    img?: string
    statusLabel: string
    desc: string
    actionLabel: string
    actionTarget: string
  } | null = null

  if (activeClaim) {
    const item = getItem(activeClaim.itemId)
    const sensitive = !!item?.isSensitive
    const stage = claimStage(activeClaim)
    activeData = {
      title: sensitive ? 'Detail disembunyikan' : (item?.name ?? 'Klaim Barang'),
      img: sensitive ? undefined : item?.image,
      statusLabel: stage === 'tiket-siap' ? 'Siap Diserahkan' : CLAIM_STAGE_LABEL[stage],
      desc:
        stage === 'tiket-siap' && activeClaim.schedule
          ? `Ambil ${activeClaim.schedule.day.split(',')[0]}, ${activeClaim.schedule.day.split(' ')[1]} ${activeClaim.schedule.day.split(' ')[2]?.slice(0, 3)} · ${activeClaim.schedule.time} di ${DROP_POINTS[activeClaim.schedule.pointKey].name}`
          : 'Klaim sedang dalam proses verifikasi petugas.',
      actionLabel: stage === 'tiket-siap' ? 'Buka Tiket' : 'Status Klaim',
      actionTarget: 'laporan-aktif:' + activeClaim.id,
    }
  } else if (activeLost) {
    const stage = lostStage(activeLost)
    activeData = {
      title: activeLost.title ?? 'Laporan Kehilangan',
      img: activeLost.photo,
      statusLabel: ['Dilaporkan', 'Kandidat Ditemukan', 'Verifikasi', 'Kembali'][stage - 1],
      desc: `${activeLost.reported ?? 'Laporan dibuat'} · Sedang mencari kandidat mirip`,
      actionLabel: 'Lihat Laporan',
      actionTarget: 'laporan-aktif:' + activeLost.id,
    }
  } else if (activeFound) {
    const view = foundView(activeFound)
    activeData = {
      title: view.isSensitive ? 'Detail disembunyikan' : view.name,
      img: view.isSensitive ? undefined : view.image,
      statusLabel: activeFound.status,
      desc:
        activeFound.status === 'Dititipkan'
          ? `Diterima petugas di ${activeFound.pointKey ? DROP_POINTS[activeFound.pointKey].name : 'Posko'}`
          : 'Menunggu barang dititipkan ke posko.',
      actionLabel: 'Lihat Detail',
      actionTarget: 'laporan-aktif:' + activeFound.itemId,
    }
  }
  return (
    <Screen
      nav={<BottomNav variant={guest ? 'tamu' : 'civitas'} active="beranda" notif={!guest} pressed={sheet === 'pilih-laporan' || sheet === 'fitur-lapor-tamu'} onAction={onAction} />}
      overlay={
        <>
          <Sheet open={sheet === 'pilih-laporan'} bottom={76} onClose={() => onAction?.('tutup')}>
            <h2 className="font-display text-[20px] font-bold">Mau melapor apa?</h2>
            <div className="mt-4 space-y-3">
              <ChoiceCard
                tone="yellow"
                icon={<Plus className="size-6" strokeWidth={2} />}
                title="Saya Kehilangan Barang"
                text="Isi laporan, sistem akan mencarikan barang yang mirip."
                onClick={() => onAction?.('pilih:kehilangan')}
              />
              <ChoiceCard
                tone="blue"
                icon={<Search className="size-6" strokeWidth={2} />}
                title="Saya Menemukan Barang"
                text="Laporkan, lalu titipkan ke posko paling lambat 1×24 jam."
                onClick={() => onAction?.('pilih:menemukan')}
              />
            </div>
            <div className="mt-2 flex justify-center">
              <TextLink tone="muted" onClick={() => onAction?.('tutup')}>
                Batal
              </TextLink>
            </div>
          </Sheet>
          <Sheet open={sheet === 'fitur-lapor-tamu'} bottom={76} onClose={() => onAction?.('tutup')}>
            <GuestLaporSheetBody onAction={onAction} />
          </Sheet>
        </>
      }
    >
      <HomeHeader guest={guest} onAction={onAction} pengguna={userKey} />

      <div className="px-4">
        {/* Hero */}
        <section className="relative rounded-[24px] bg-primary p-5 pb-4 text-white">
          {!guest && (
            <button
              onClick={() => onAction?.('lonceng')}
              aria-label="Notifikasi"
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/15"
            >
              <Bell className="size-5" strokeWidth={1.75} />
              <span className="absolute top-2.5 right-3 size-2.5 rounded-full bg-pink ring-2 ring-primary" />
            </button>
          )}
          <h1 className="pr-12 font-display text-[24px] font-bold">{guest ? 'Halo, Tamu!' : `Hai, ${firstName}! 👋`}</h1>
          <p className="mt-1 text-[14px] text-white/80">
            {guest ? 'Cari barangmu yang tertinggal di Fakultas Vokasi' : 'Lost & Found Fakultas Vokasi UNAIR'}
          </p>
          <button onClick={() => onAction?.('cari')} className="mt-5 flex h-12 w-full items-center gap-2.5 rounded-xl bg-white px-3 text-left">
            <Search className="size-5 shrink-0 text-muted" strokeWidth={1.5} />
            <span className="truncate text-[13px] text-faint">Cari barang temuan (contoh: tumbler, KTM, kunci)</span>
          </button>
        </section>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex h-7 items-center rounded-full bg-blue-soft px-3 text-[12px] font-semibold text-primary">Fakultas Vokasi</span>
          <span className="text-[12px] font-medium text-muted">Kampus B Surabaya</span>
        </div>

        {/* Aksi utama */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => onAction?.('kehilangan')} className="flex h-[120px] flex-col justify-between rounded-[20px] bg-yellow p-4 text-left text-ink">
            <span className="flex size-9 items-center justify-center rounded-full bg-white">
              <Plus className="size-5" strokeWidth={2.25} />
            </span>
            <span>
              <span className="block font-display text-[18px] font-bold leading-tight">Saya Kehilangan</span>
              <span className="mt-0.5 block text-[12px] text-ink/70">Laporkan barangmu</span>
            </span>
          </button>
          <button onClick={() => onAction?.('menemukan')} className="flex h-[120px] flex-col justify-between rounded-[20px] bg-primary p-4 text-left text-white">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <Search className="size-5" strokeWidth={2} />
            </span>
            <span>
              <span className="block font-display text-[18px] font-bold leading-tight">Saya Menemukan</span>
              <span className="mt-0.5 block text-[12px] text-white/80">Titipkan & bantu sesama</span>
            </span>
          </button>
        </div>

        {guest ? (
          <>
            <button onClick={() => onAction?.('tamu-posko')} className="mt-3 flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-yellow bg-white p-4 text-left">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-yellow-soft">
                <Building2 className="size-5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold">Tamu? Lapor langsung di Posko Dekanat Lt. 1</span>
                <span className="mt-0.5 block text-[12px] text-muted">Buka Senin-Jumat 07.00-18.00</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted" strokeWidth={1.5} />
            </button>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-blue-soft p-4">
              <GraduationCap className="size-6 shrink-0 text-primary" strokeWidth={1.5} />
              <p className="min-w-0 flex-1 text-[13px] font-medium leading-[1.5]">Civitas UNAIR? Masuk untuk melapor dan klaim di aplikasi</p>
              <Button small onClick={() => onAction?.('banner-masuk')}>
                Masuk
              </Button>
            </div>
          </>
        ) : activeData ? (
          <button onClick={() => onAction?.(activeData.actionTarget)} className="mt-4 block w-full rounded-2xl border-l-4 border-violet bg-white p-4 text-left shadow-card">
            <p className="text-[12px] font-medium text-muted">Laporan aktifmu</p>
            <div className="mt-2 flex gap-3">
              {activeData.img ? (
                <img src={activeData.img} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
                  <Lock className="size-6" strokeWidth={1.5} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-[16px] font-semibold leading-snug">{activeData.title}</p>
                <div className="mt-1.5">
                  <StatusBadge label={activeData.statusLabel} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-[1.5] text-ink">{activeData.desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
              {activeData.actionLabel} <ArrowRight className="size-4" strokeWidth={2} />
            </span>
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-white/70 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-soft text-primary">
              <FolderOpen className="size-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-display text-[14px] font-semibold text-ink">Belum ada laporan aktif</p>
              <p className="mt-0.5 text-[12px] leading-[1.4] text-muted">Laporan kehilangan atau temuan yang sedang berjalan akan dipantau di sini.</p>
            </div>
          </div>
        )}

        {/* Cara kerja */}
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[18px] font-semibold">Cara Kerjanya</h2>
            <span className="text-[12px] font-medium text-muted">3 langkah</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <HowStep icon={<Upload className="size-5 text-primary" strokeWidth={1.5} />} title="1. Laporkan" text="Unggah foto & ciri barang" />
            <HowStep icon={<Sparkles className="size-5 text-amber" strokeWidth={1.5} />} title="2. Dicocokkan" text="Sistem mencari yang mirip" />
            <HowStep icon={<Building2 className="size-5 text-success" strokeWidth={1.5} />} title="3. Ambil di Posko" text="Verifikasi di Posko Dekanat" />
          </div>
        </section>

        {/* Temuan terbaru */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px] font-semibold">Barang Temuan Terbaru</h2>
            <TextLink onClick={() => onAction?.('lihat-semua')} className="text-[13px]">
              Lihat Semua ›
            </TextLink>
          </div>
          <p className="-mt-1 text-[12px] text-muted">Diperbarui 10 menit lalu</p>
          <div className="mt-3 space-y-4">
            {items.map((it) => (
              <React.Fragment key={it.id}>
                <ItemCard item={it} onClick={() => onAction?.('barang:' + it.id)} />
              </React.Fragment>
            ))}
          </div>
        </section>

        <button onClick={() => onAction?.('titik')} className="mt-6 mb-6 flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
            <MapPin className="size-5" strokeWidth={1.5} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] font-semibold">Titik Penitipan & Panduan</span>
            <span className="mt-0.5 block text-[12px] text-muted">2 titik aktif, jam layanan, cara klaim</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted" strokeWidth={1.5} />
        </button>
      </div>
    </Screen>
  )
}

function HowStep({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-3 shadow-card">
      <span className="flex size-9 items-center justify-center rounded-full bg-page">{icon}</span>
      <p className="mt-2 text-[13px] font-semibold leading-tight">{title}</p>
      <p className="mt-1 text-[11px] leading-[1.4] text-muted">{text}</p>
    </div>
  )
}

function ChoiceCard({
  tone,
  icon,
  title,
  text,
  onClick,
}: {
  tone: 'yellow' | 'blue'
  icon: React.ReactNode
  title: string
  text: string
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="flex min-h-[88px] w-full items-center gap-3 rounded-2xl border border-line p-4 text-left">
      <span className={cx('flex size-12 shrink-0 items-center justify-center rounded-xl', tone === 'yellow' ? 'bg-yellow text-ink' : 'bg-primary text-white')}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-[1.5] text-muted">{text}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted" strokeWidth={1.5} />
    </button>
  )
}
