import React from 'react'
import { ArrowRight, Calendar, FileText, FolderOpen, Hand, Info, Lock, MapPin, Plus, QrCode, Search } from 'lucide-react'
import {
  BottomNav,
  Button,
  EmptyState,
  HomeHeader,
  IdChip,
  MetaRow,
  MiniTracker,
  PhotoTile,
  Screen,
  StatusBadge,
  cx,
  type Act,
} from '../shared/foundit/ui'
import {
  CLAIM_STAGE_LABEL,
  DROP_POINTS,
  claimStage,
  claimsForReport,
  claimsOf,
  claimsOnItem,
  foundStage,
  foundView,
  getItem,
  lostStage,
  reportsOf,
  type Claim,
  type FoundReport,
  type LostReport,
  type UserKey,
} from '../shared/foundit/data'

export const args = {
  pengguna: 'rara',
  tab: 'kehilangan',
  filter: 'aktif',
}

export const argTypes = {
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
  tab: { control: 'radio', options: ['kehilangan', 'temuan'] },
  filter: { control: 'radio', options: ['aktif', 'selesai'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

const STAGE_LABEL = ['Dilaporkan', 'Kandidat Ditemukan', 'Verifikasi', 'Kembali']

export default function LaporanSaya(props: Props) {
  const { pengguna, tab, filter, onAction } = { ...args, ...props }
  const user = pengguna as UserKey
  const activeTab = tab === 'temuan' ? 'temuan' : 'kehilangan'
  const done = filter === 'selesai'

  // Semua isi dibaca dari master data, disaring berdasarkan pemilik.
  const { lost, found } = reportsOf(user)
  // Klaim langsung tidak punya laporan kehilangan, jadi tampil sebagai kartunya sendiri.
  const directClaims = claimsOf(user).filter((c) => c.path === 'langsung')
  const lostDone = (r: LostReport) => lostStage(r) === 4
  const directDone = (c: Claim) => claimStage(c) === 'ditolak'
  const foundDone = (r: FoundReport) => r.status === 'Diserahkan'

  const lostShown = lost.filter((r) => lostDone(r) === done)
  const directShown = directClaims.filter((c) => directDone(c) === done)
  const foundShown = found.filter((r) => foundDone(r) === done)
  const counts = [lost.length + directClaims.length, found.length]
  const shown = activeTab === 'kehilangan' ? lostShown.length + directShown.length : foundShown.length
  const total = activeTab === 'kehilangan' ? counts[0] : counts[1]

  // Sorotan tiket hanya jika ada klaim milik akun ini yang tiketnya siap.
  const ticket = activeTab === 'kehilangan' && !done ? claimsOf(user).find((c) => claimStage(c) === 'tiket-siap') : undefined
  const ticketItem = ticket ? getItem(ticket.itemId) : undefined

  return (
    <Screen nav={<BottomNav active="laporan" onAction={onAction} />}>
      <HomeHeader onAction={onAction} />
      <div className="px-4">
        <h1 className="font-display text-[24px] font-bold">Laporan Saya</h1>
        <p className="text-[14px] text-muted">Pantau laporan dan klaimmu.</p>

        <div className="mt-4 flex h-12 items-center gap-2.5 rounded-xl bg-white px-3 ring-1 ring-line">
          <Search className="size-5 text-muted" strokeWidth={1.5} />
          <span className="truncate text-[14px] text-faint">Cari nama barang atau nomor laporan…</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-white p-1 ring-1 ring-line">
          {(['kehilangan', 'temuan'] as const).map((t, i) => (
            <button
              key={t}
              onClick={() => onAction?.('tab:' + t)}
              className={cx('h-10 rounded-full text-[14px] font-semibold', activeTab === t ? 'bg-primary text-white' : 'text-muted')}
            >
              {t === 'kehilangan' ? 'Kehilangan' : 'Temuan'} ({counts[i]})
            </button>
          ))}
        </div>

        {total > 0 && (
          <div className="mt-3 flex gap-2">
            {(['aktif', 'selesai'] as const).map((f) => (
              <button
                key={f}
                onClick={() => onAction?.('filter:' + f)}
                className={cx(
                  'inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold',
                  filter === f ? 'bg-ink text-white' : 'bg-white font-medium ring-1 ring-line'
                )}
              >
                {f === 'aktif' ? 'Aktif' : 'Selesai'}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown === 0 ? (
        <EmptyState
          illustration={
            <div className="relative flex size-36 items-center justify-center rounded-full bg-blue-soft">
              <FolderOpen className="size-16 text-primary" strokeWidth={1.25} />
              <span className="absolute top-6 right-6 size-3 rounded-full bg-yellow" />
              <span className="absolute bottom-7 left-6 size-2.5 rounded-full bg-pink" />
            </div>
          }
          title={total === 0 ? 'Belum ada laporan' : done ? 'Belum ada yang selesai' : 'Tidak ada yang aktif'}
          text={total === 0 ? 'Laporan yang kamu buat akan muncul di sini.' : 'Ganti filter untuk melihat laporan lainnya.'}
        >
          {total === 0 && (
            <>
              <Button className="w-full" onClick={() => onAction?.('lapor-kehilangan')}>
                Lapor Kehilangan
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => onAction?.('lapor-temuan')}>
                Lapor Temuan
              </Button>
            </>
          )}
        </EmptyState>
      ) : (
        <div className="space-y-4 px-4 pt-4 pb-6">
          {ticket && ticket.schedule && (
            <button onClick={() => onAction?.('tiket:' + ticket.id)} className="relative block w-full overflow-hidden rounded-2xl bg-primary p-4 text-left text-white shadow-card">
              <QrCode className="absolute -right-4 -bottom-4 size-32 text-white/10" strokeWidth={1.25} />
              <p className="text-[11px] font-semibold tracking-wide text-white/80">TIKET SIAP</p>
              <p className="mt-1 font-display text-[18px] font-semibold">{ticketItem && !ticketItem.isSensitive ? ticketItem.name : 'Detail disembunyikan'}</p>
              <p className="mt-1 text-[13px] text-white/90">
                Ambil {ticket.schedule.day} · {ticket.schedule.time}
              </p>
              <p className="text-[13px] text-white/90">{DROP_POINTS[ticket.schedule.pointKey].name}</p>
              <span className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-primary">
                Buka Tiket QR <ArrowRight className="size-4" strokeWidth={2} />
              </span>
            </button>
          )}

          {activeTab === 'kehilangan' ? (
            <>
              {lostShown.map((r) => {
                const stage = lostStage(r)
                const claim = claimsForReport(r.id).find((c) => c.claimant === user)
                const cs = claim ? claimStage(claim) : undefined
                return (
                  <React.Fragment key={r.id}>
                    <ReportCard
                      id={r.id}
                      when={r.reported ?? 'Tanggal belum diketahui'}
                      img={r.photo}
                      name={r.title ?? 'Detail laporan belum diketahui'}
                      place={r.location ?? 'Lokasi belum diketahui'}
                      badges={
                        <>
                          <StatusBadge label={STAGE_LABEL[stage - 1]} />
                          {cs && <StatusBadge label={cs === 'tiket-siap' || cs === 'disetujui' ? 'Klaim Disetujui' : CLAIM_STAGE_LABEL[cs]} />}
                        </>
                      }
                    >
                      <div className="mt-4">
                        <MiniTracker active={stage - 1} done={stage === 4} />
                      </div>
                      {claim?.schedule && cs === 'tiket-siap' && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-soft px-3 py-2.5 text-[13px]">
                          <Calendar className="size-4 text-primary" strokeWidth={1.75} />
                          Jadwal ambil:{' '}
                          <span className="font-semibold">
                            {claim.schedule.day} ({claim.schedule.time})
                          </span>
                        </div>
                      )}
                      <div className={cx('mt-3 grid gap-2', claim ? 'grid-cols-2' : 'grid-cols-1')}>
                        {claim && (
                          <Button className="h-12" onClick={() => onAction?.((cs === 'tiket-siap' ? 'tiket:' : 'klaim:') + claim.id)}>
                            {cs === 'tiket-siap' ? 'Buka Tiket QR' : 'Status Klaim'}
                          </Button>
                        )}
                        <Button variant="secondary" onClick={() => onAction?.('detail:' + r.id)}>
                          Detail
                        </Button>
                      </div>
                    </ReportCard>
                  </React.Fragment>
                )
              })}
              {directShown.map((c) => {
                const it = getItem(c.itemId)
                const cs = claimStage(c)
                return (
                  <React.Fragment key={c.id}>
                    <ReportCard
                      id={c.id}
                      when={`Diajukan ${c.submittedShort}`}
                      img={it && !it.isSensitive ? it.image : undefined}
                      icon={<Hand className="size-6" strokeWidth={1.5} />}
                      name={it ? (it.isSensitive ? 'Detail disembunyikan' : it.name) : 'Barang belum diketahui'}
                      place={`Klaim langsung · ${c.itemId}`}
                      badges={<StatusBadge label={CLAIM_STAGE_LABEL[cs]} />}
                    >
                      <Button variant="secondary" className="mt-3 w-full" onClick={() => onAction?.((cs === 'tiket-siap' ? 'tiket:' : 'klaim:') + c.id)}>
                        {cs === 'tiket-siap' ? 'Buka Tiket QR' : 'Lihat Status Klaim'}
                      </Button>
                    </ReportCard>
                  </React.Fragment>
                )
              })}
            </>
          ) : (
            foundShown.map((r) => {
              const v = foundView(r)
              const stage = foundStage(r)
              const claimed = claimsOnItem(r.itemId).some((c) => !c.rejection)
              return (
                <React.Fragment key={r.itemId}>
                  <ReportCard
                    id={r.itemId}
                    when={r.reported}
                    img={v.isSensitive ? undefined : v.image}
                    name={v.isSensitive ? 'Detail disembunyikan' : v.name}
                    place={r.location}
                    badges={
                      <>
                        <StatusBadge label={STAGE_LABEL[stage - 1]} />
                        {stage < 4 && <StatusBadge label={r.status} />}
                      </>
                    }
                  >
                    {r.status === 'Diserahkan' && r.bast ? (
                      <MetaRow icon={<FileText strokeWidth={1.5} />} className="mt-3">
                        <span className="font-mono text-[12px] font-semibold text-primary">{r.bast.no}</span> · {r.bast.date}
                      </MetaRow>
                    ) : claimed ? (
                      <div className="mt-3 flex gap-2 rounded-xl bg-blue-soft px-3 py-2.5 text-[13px] leading-[1.5]">
                        <Info className="size-4 shrink-0 translate-y-0.5 text-primary" strokeWidth={1.75} />
                        Ada yang mengajukan klaim, sedang diverifikasi petugas.
                      </div>
                    ) : r.status === 'Belum Dititipkan' && r.deadline ? (
                      <div className="mt-3 flex gap-2 rounded-xl bg-orange/10 px-3 py-2.5 text-[13px] leading-[1.5]">
                        <Info className="size-4 shrink-0 translate-y-0.5 text-orange" strokeWidth={1.75} />
                        Titipkan sebelum {r.deadline}.
                      </div>
                    ) : null}
                    <Button variant="secondary" className="mt-3 w-full" onClick={() => onAction?.('detail:' + r.itemId)}>
                      Detail
                    </Button>
                  </ReportCard>
                </React.Fragment>
              )
            })
          )}

          <div className="rounded-2xl bg-yellow-soft p-4">
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow">
                <Plus className="size-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-display text-[16px] font-semibold">Ada barang lain yang tertinggal?</p>
                <p className="mt-0.5 text-[13px] text-muted">Laporkan agar sistem segera mencocokkan.</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11 px-2 text-[13px]" onClick={() => onAction?.('lapor-kehilangan')}>
                + Lapor Kehilangan
              </Button>
              <Button variant="outline" className="h-11 px-2 text-[13px]" onClick={() => onAction?.('lapor-temuan')}>
                + Lapor Temuan
              </Button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}

function ReportCard({
  id,
  when,
  img,
  icon,
  name,
  place,
  badges,
  children,
}: {
  id: string
  when: string
  img?: string
  icon?: React.ReactNode
  name: string
  place: string
  badges: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="h-1 bg-primary/70" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <IdChip id={id} />
          <span className="text-[12px] text-muted">{when}</span>
        </div>
        <div className="mt-3 flex gap-3">
          {img ? (
            <PhotoTile src={img} className="size-16 shrink-0 rounded-xl" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">{icon ?? <Lock className="size-6" strokeWidth={1.5} />}</span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-[16px] font-semibold leading-snug">{name}</p>
            <MetaRow icon={<MapPin strokeWidth={1.5} />} className="mt-0.5">
              {place}
            </MetaRow>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">{badges}</div>
        {children}
      </div>
    </div>
  )
}
