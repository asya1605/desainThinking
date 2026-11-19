import React, { useState } from 'react'
import { Clock, Download, FileSearch, Heart, Hourglass, Info, MapPin, PackageCheck, QrCode, ShieldCheck, Sparkles, Trash2 } from 'lucide-react'
import {
  BottomNav,
  Button,
  Card,
  CardTitle,
  CategoryBadge,
  EmptyState,
  IconCircle,
  IdChip,
  InfoBox,
  MetaRow,
  Modal,
  PageHeader,
  PhotoTile,
  Screen,
  StatusBadge,
  TextLink,
  Tracker,
  cx,
  type Act,
  type TrackStep,
} from '../shared/foundit/ui'
import {
  CLAIM_STAGE_LABEL,
  DROP_POINTS,
  FOUND_REPORTS,
  LOST_REPORTS,
  candidatesFor,
  candidatesOfItem,
  claimStage,
  claimsForReport,
  claimsOnItem,
  foundStage,
  foundView,
  getItem,
  lostStage,
  parseWhen,
  type UserKey,
} from '../shared/foundit/data'

export const args = {
  laporanId: 'FI-L-26-0021',
  pengguna: 'rara',
  modal: 'none',
}

export const argTypes = {
  laporanId: { control: 'select', options: ['FI-L-26-0021', 'FI-L-26-0008', 'FI-L-26-0031', 'FI-T-26-0042', 'FI-T-26-0076', 'FI-L-26-9999'] },
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
  modal: { control: 'radio', options: ['none', 'batalkan-laporan'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

const STAGES = ['Dilaporkan', 'Kandidat Ditemukan', 'Verifikasi', 'Kembali']
const short = (s?: string) => s?.replace(/^Dilaporkan /, '').replace(/ 20\d\d,/, ',')
const REASONS = ['Barang sudah ketemu sendiri', 'Salah input', 'Lainnya']

export default function DetailLaporan(props: Props) {
  const { laporanId, pengguna, modal, onAction } = { ...args, ...props }
  const user = pengguna as UserKey
  const lost = LOST_REPORTS[laporanId]
  const found = FOUND_REPORTS[laporanId]
  const [reason, setReason] = useState<string | null>(null)
  const nav = <BottomNav active="laporan" onAction={onAction} />

  // Hanya pemilik (kehilangan) atau penemu (temuan) yang bisa membuka laporannya.
  const mine = (lost && lost.owner === user) || (found && found.finder === user)
  if (!mine) {
    return (
      <Screen nav={nav}>
        <PageHeader title="Detail Laporan" onBack={() => onAction?.('kembali')} />
        <EmptyState
          illustration={
            <IconCircle tone="gray" size={96}>
              <FileSearch className="size-10" strokeWidth={1.5} />
            </IconCircle>
          }
          title="Laporan tidak ditemukan"
          text={`Laporan ${laporanId || ''} tidak ada di akunmu.`}
        >
          <Button variant="secondary" onClick={() => onAction?.('kembali')}>
            Kembali
          </Button>
        </EmptyState>
      </Screen>
    )
  }

  /* ───────── Laporan kehilangan ───────── */
  if (lost) {
    const stage = lostStage(lost)
    const cand = candidatesFor(lost.id)[0]
    const claim = claimsForReport(lost.id).find((c) => c.claimant === user)
    const cs = claim ? claimStage(claim) : undefined
    const item = claim ? getItem(claim.itemId) : cand ? getItem(cand.itemId) : undefined
    const steps: TrackStep[] = [
      { title: STAGES[0], time: short(lost.reported), desc: 'Laporan tersimpan.', state: stage > 1 ? 'done' : 'active' },
      {
        title: STAGES[1],
        time: stage > 1 ? short(cand?.foundAt) : undefined,
        desc: cand ? `${cand.itemId}, ${cand.score}% mirip.` : 'Sistem terus mencari barang yang mirip.',
        state: stage > 2 ? 'done' : stage === 2 ? 'active' : 'todo',
      },
      {
        title: STAGES[2],
        time: claim?.approval ? short(claim.approval.decided) : claim ? short(claim.submitted) : undefined,
        desc: !claim
          ? 'Petugas memeriksa klaimmu.'
          : claim.schedule
            ? `Klaim disetujui. Ambil ${claim.schedule.day}, ${claim.schedule.time}.`
            : cs === 'disetujui'
              ? 'Klaim disetujui. Pilih jadwal pengambilan.'
              : `Klaim ${claim.id} sedang diperiksa petugas.`,
        state: stage > 3 ? 'done' : stage === 3 ? 'active' : 'todo',
      },
      { title: STAGES[3], desc: `Serah-terima di ${DROP_POINTS.posko.name}.`, state: stage === 4 ? 'done' : 'todo' },
    ]
    // Riwayat hanya dari waktu yang tercatat.
    const history = [
      lost.reported && { at: short(lost.reported)!, label: 'Laporan dibuat', sort: parseWhen(lost.reported) },
      cand?.foundAt && { at: short(cand.foundAt)!, label: 'Kandidat ditemukan', sort: parseWhen(cand.foundAt) },
      claim && { at: short(claim.submitted)!, label: 'Klaim diajukan', sort: parseWhen(claim.submitted) },
      claim?.approval && { at: short(claim.approval.decided)!, label: 'Klaim disetujui petugas', sort: parseWhen(claim.approval.decided) },
      claim?.rejection && { at: short(claim.rejection.decided)!, label: 'Klaim ditolak petugas', sort: parseWhen(claim.rejection.decided) },
      claim?.schedule?.chosen && { at: short(claim.schedule.chosen)!, label: 'Jadwal pengambilan dipilih', sort: parseWhen(claim.schedule.chosen) },
      lost.cancelled && { at: short(lost.cancelledAt) ?? 'Baru saja', label: 'Laporan dibatalkan', sort: parseWhen(lost.cancelledAt) },
    ]
      .filter((x): x is { at: string; label: string; sort: Date | undefined } => !!x)
      .sort((a, b) => (b.sort?.getTime() ?? 0) - (a.sort?.getTime() ?? 0))

    return (
      <Screen
        nav={nav}
        footer={
          lost.cancelled ? undefined : cs === 'tiket-siap' ? (
            <Button className="w-full" arrow onClick={() => onAction?.('tiket:' + claim!.id)}>
              Buka Tiket QR
            </Button>
          ) : claim ? (
            <Button className="w-full" arrow onClick={() => onAction?.('klaim:' + claim.id)}>
              Lihat Status Klaim
            </Button>
          ) : cand ? (
            <Button className="w-full" icon={<Sparkles className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.(`kandidat:${lost.id}:${cand.itemId}`)}>
              Lihat Kandidat
            </Button>
          ) : undefined
        }
        overlay={
          <Modal open={modal === 'batalkan-laporan'} onClose={() => onAction?.('tutup')}>
            <div className="flex justify-center">
              <IconCircle tone="red" size={64}>
                <Trash2 className="size-7" strokeWidth={1.75} />
              </IconCircle>
            </div>
            <h2 className="mt-4 font-display text-[20px] font-bold">Batalkan laporan?</h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-muted">
              Laporan <span className="font-mono font-semibold text-primary">{lost.id}</span> dibatalkan{claim ? ' dan klaim yang aktif ikut ditarik' : ''}.
            </p>
            <p className="mt-4 text-left text-[12px] font-medium text-muted">Alasan (opsional)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REASONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setReason(reason === c ? null : c)}
                  className={cx('inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150', reason === c ? 'bg-primary text-white' : 'bg-white ring-1 ring-line')}
                >
                  {c}
                </button>
              ))}
            </div>
            <Button variant="danger-solid" className="mt-5 w-full" onClick={() => onAction?.(reason ? 'batalkan-laporan:' + reason : 'batalkan-laporan')}>
              Batalkan Laporan
            </Button>
            <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
              Tidak
            </TextLink>
          </Modal>
        }
      >
        <PageHeader title="Detail Laporan" right={stage < 4 && !lost.cancelled ? 'more' : undefined} onRight={() => onAction?.('menu')} onBack={() => onAction?.('kembali')} />

        <div className="space-y-4 px-4 pt-1 pb-6">
          <Card>
            <div className="flex gap-3">
              {lost.photo ? (
                <PhotoTile src={lost.photo} className="size-20 shrink-0 rounded-xl" />
              ) : (
                <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
                  <FileSearch className="size-7" strokeWidth={1.5} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <IdChip id={lost.id} />
                <p className="mt-1.5 font-display text-[16px] font-semibold leading-snug">{lost.title ?? 'Detail laporan belum diketahui'}</p>
                <div className="mt-1 space-y-0.5">
                  {lost.location && <MetaRow icon={<MapPin strokeWidth={1.5} />}>{lost.location}</MetaRow>}
                  {lost.lostWhen && <MetaRow icon={<Clock strokeWidth={1.5} />}>{lost.lostWhen}</MetaRow>}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lost.category && <CategoryBadge category={lost.category} />}
              <StatusBadge label={lost.cancelled ? 'Dibatalkan' : STAGES[stage - 1]} />
            </div>
          </Card>

          {lost.cancelled ? (
            <Card>
              <CardTitle>Status Laporan</CardTitle>
              <div className="rounded-xl border border-line bg-blue-soft/50 p-3 text-[13px] leading-[1.5]">
                <p className="font-semibold text-ink">Laporan telah dibatalkan</p>
                {lost.cancelledAt && <p className="mt-0.5 text-muted">Dibatalkan pada {lost.cancelledAt}</p>}
                {lost.cancelReason && <p className="mt-1 text-ink">Alasan: {lost.cancelReason}</p>}
              </div>
            </Card>
          ) : (
            <Card>
              <CardTitle right={<span className="text-[12px] font-semibold text-primary">{stage === 4 ? 'Selesai' : `Langkah ${stage} dari 4`}</span>}>Status Laporan</CardTitle>
              <Tracker steps={steps} />
            </Card>
          )}

          {claim && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="flex flex-col p-3">
                <p className="text-[12px] font-medium text-muted">Status Klaim</p>
                <p className="mt-1 font-mono text-[12px] font-semibold text-primary">{claim.id}</p>
                <div className="mt-auto pt-2">
                  <StatusBadge label={cs === 'tiket-siap' ? 'Disetujui' : CLAIM_STAGE_LABEL[cs!]} />
                </div>
              </Card>
              <Card className="flex flex-col p-3">
                <p className="text-[12px] font-medium text-muted">Status Barang</p>
                <p className="mt-1 text-[12px] font-medium">{item?.depositPoint ? DROP_POINTS[item.depositPoint].name : 'Belum diketahui'}</p>
                <div className="mt-auto pt-2">{item && <StatusBadge label={item.depositStatus} />}</div>
              </Card>
            </div>
          )}

          {history.length > 0 && (
            <Card>
              <CardTitle>Riwayat</CardTitle>
              <ul className="space-y-3">
                {history.map((h, i) => (
                  <li key={h.label} className="flex items-start gap-3">
                    <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', i === 0 ? 'bg-primary' : 'bg-faint')} />
                    <div>
                      <p className="text-[14px] font-medium">{h.label}</p>
                      <p className="text-[12px] tabular-nums text-muted">{h.at}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {lost.description && (
            <Card>
              <CardTitle>Deskripsi</CardTitle>
              <p className="text-[14px] leading-[1.5] text-muted">{lost.description}</p>
            </Card>
          )}
        </div>
      </Screen>
    )
  }

  /* ───────── Laporan temuan ───────── */
  const r = found!
  const v = foundView(r)
  const stage = foundStage(r)
  const point = r.pointKey ? DROP_POINTS[r.pointKey] : undefined
  const belum = r.status === 'Belum Dititipkan'
  const kembali = r.status === 'Diserahkan'
  const claims = claimsOnItem(r.itemId).filter((c) => !c.rejection)
  const firstClaim = claims.map((c) => c.submitted).sort((a, b) => (parseWhen(a)?.getTime() ?? 0) - (parseWhen(b)?.getTime() ?? 0))[0]
  const cand = candidatesOfItem(r.itemId)[0]
  const item = getItem(r.itemId)
  const steps: TrackStep[] = [
    { title: STAGES[0], time: short(r.reported), desc: belum ? 'Menunggu barang dititipkan.' : 'Laporan tersimpan.', state: belum && stage === 1 ? 'active' : 'done' },
    {
      title: STAGES[1],
      time: stage > 1 ? short(cand?.foundAt) : undefined,
      desc: stage > 1 ? 'Ada laporan kehilangan yang mirip.' : belum ? 'Dicocokkan setelah barang diterima posko.' : 'Sistem mencari laporan kehilangan yang mirip.',
      state: stage > 2 ? 'done' : stage === 2 ? 'active' : 'todo',
    },
    { title: STAGES[2], time: stage > 2 ? short(firstClaim) : undefined, desc: 'Petugas memeriksa klaim pemilik.', state: stage > 3 ? 'done' : stage === 3 ? 'active' : 'todo' },
    {
      title: STAGES[3],
      time: kembali ? r.bast?.date : undefined,
      desc: kembali ? `Diserahkan di ${point?.name ?? DROP_POINTS.posko.name}.` : `Serah-terima di ${DROP_POINTS.posko.name}.`,
      state: kembali ? 'done' : 'todo',
    },
  ]

  return (
    <Screen
      nav={nav}
      footer={
        belum && r.dropCode ? (
          <Button className="w-full" icon={<QrCode className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('kode:' + r.itemId)}>
            Tampilkan Kode Penitipan
          </Button>
        ) : undefined
      }
    >
      <PageHeader title="Detail Laporan" onBack={() => onAction?.('kembali')} />
      <div className="space-y-4 px-4 pt-1 pb-6">
        <Card>
          <div className="flex gap-3">
            {v.image && !v.isSensitive ? (
              <PhotoTile src={v.image} className="size-20 shrink-0 rounded-xl" />
            ) : (
              <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
                <ShieldCheck className="size-7" strokeWidth={1.5} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <IdChip id={r.itemId} />
              <p className="mt-1.5 font-display text-[16px] font-semibold leading-snug">{v.isSensitive ? 'Detail disembunyikan' : v.name}</p>
              <div className="mt-1 space-y-0.5">
                <MetaRow icon={<MapPin strokeWidth={1.5} />}>{r.location}</MetaRow>
                {(item?.foundAtFull ?? r.foundWhen) && <MetaRow icon={<Clock strokeWidth={1.5} />}>{item?.foundAtFull ?? r.foundWhen}</MetaRow>}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge label={STAGES[stage - 1]} />
            {!kembali && <StatusBadge label={r.status} />}
          </div>
        </Card>

        {kembali && r.bast && (
          <div className="rounded-2xl bg-success/10 p-4">
            <div className="flex items-start gap-3">
              <IconCircle tone="green" size={48}>
                <PackageCheck className="size-6" strokeWidth={1.75} />
              </IconCircle>
              <div className="min-w-0">
                <p className="font-display text-[18px] font-semibold">Barang sudah kembali ke pemiliknya</p>
                <p className="mt-1 text-[13px] leading-[1.5] text-muted">
                  Diserahkan {r.bast.date}
                  {point ? ` di ${point.name}` : ''}
                </p>
                <p className="mt-2 font-mono text-[13px] font-semibold text-primary">{r.bast.no}</p>
              </div>
            </div>
            <Button className="mt-4 w-full" icon={<Download className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('unduh-bast')}>
              Unduh BAST (PDF)
            </Button>
          </div>
        )}

        {belum && (
          <>
            {r.deadline && (
              <div className="rounded-2xl bg-orange/10 p-4">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-orange">
                  <Hourglass className="size-4" strokeWidth={1.75} />
                  Titipkan sebelum {r.deadline}
                </p>
                <p className="mt-1 text-[13px] text-muted">Batas penitipan 1×24 jam setelah laporan dikirim.</p>
              </div>
            )}
            {point && (
              <Card>
                <div className="flex items-center gap-3">
                  <IconCircle tone="green" size={40}>
                    <ShieldCheck className="size-5" strokeWidth={1.75} />
                  </IconCircle>
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-muted">TITIK TUJUAN</p>
                    <p className="text-[14px] font-semibold">
                      {point.name} · {point.hours}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {r.status === 'Dititipkan' && (
          <div className="flex gap-3 rounded-2xl bg-teal/10 p-4">
            <ShieldCheck className="size-5 shrink-0 text-teal" strokeWidth={1.75} />
            <div>
              <p className="text-[14px] font-semibold">{r.receivedAt ? `Diterima petugas ${r.receivedAt}` : 'Diterima petugas'}</p>
              <p className="mt-0.5 text-[13px] text-muted">
                {point?.name ?? 'Titik penitipan belum diketahui'} · ID label <span className="font-mono font-semibold text-primary">{r.itemId}</span>
              </p>
            </div>
          </div>
        )}

        {claims.length > 0 && !kembali && (
          <InfoBox tone="blue" icon={<Info strokeWidth={1.75} />}>
            Ada yang mengajukan klaim. Petugas sedang memverifikasi. Identitas pemohon tidak ditampilkan.
          </InfoBox>
        )}

        <Card>
          <CardTitle right={<span className="text-[12px] font-semibold text-primary">{kembali ? 'Selesai' : `Langkah ${stage} dari 4`}</span>}>Status Laporan</CardTitle>
          <Tracker steps={steps} />
        </Card>

        {belum && (
          <InfoBox tone="gray" icon={<Info strokeWidth={1.75} />}>
            Laporan yang tidak dititipkan dalam 1×24 jam akan ditinjau petugas.
          </InfoBox>
        )}

        {!belum && (
          <div className="flex items-center gap-3 rounded-2xl bg-pink-soft p-4">
            <Heart className="size-5 shrink-0 fill-pink text-pink" strokeWidth={1.5} />
            <p className="text-[14px] font-medium">Terima kasih sudah membantu sesama civitas.</p>
          </div>
        )}
      </div>
    </Screen>
  )
}
