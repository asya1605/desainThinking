import React from 'react'
import { Check, Clock, FileText, MapPin, Radar, Sparkles, Zap } from 'lucide-react'
import {
  Button,
  Card,
  CardTitle,
  CategoryBadge,
  IdChip,
  MetaRow,
  ReasonChip,
  Screen,
  StatusBadge,
  TextLink,
  Tracker,
  type Act,
} from '../shared/foundit/ui'
import { DROP_POINTS, LOST_REPORTS, SKOR_NOTE, candidatesFor, getItem } from '../shared/foundit/data'

export const args = {
  state: 'ada-kandidat',
  reportId: 'FI-L-26-0021',
}

export const argTypes = {
  state: { control: 'radio', options: ['ada-kandidat', 'belum-ada-kandidat'] },
  reportId: { control: 'text' },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function LaporanTerkirim(props: Props) {
  const { state, reportId, onAction } = { ...args, ...props }
  const report = LOST_REPORTS[reportId]
  const cand = candidatesFor(reportId)[0]
  const item = cand ? getItem(cand.itemId) : undefined
  // Kandidat hanya tampil jika memang terkait dengan ID laporan ini di master data.
  const ada = state === 'ada-kandidat' && !!item
  const reportedTime = report?.reported?.replace(/^Dilaporkan /, '')
  return (
    <Screen>
      <div className="bg-white px-4 pt-12 pb-6 text-center">
        <div className="relative mx-auto flex size-24 items-center justify-center rounded-full bg-success/10">
          <span className="flex size-16 items-center justify-center rounded-full bg-success text-white">
            <Check className="size-9" strokeWidth={3} />
          </span>
          <Sparkles className="absolute -top-1 -right-1 size-6 fill-yellow text-amber" strokeWidth={1.5} />
          <Sparkles className="absolute bottom-1 -left-2 size-4 fill-yellow text-amber" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 font-display text-[24px] font-bold">Laporan Terkirim!</h1>
        <p className="mt-1 text-[14px] text-muted">Laporan kehilanganmu sudah tercatat.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-soft py-1 pr-1 pl-4">
          <span className="text-[12px] text-muted">Nomor Laporan:</span>
          <IdChip id={reportId} copy tone="blue" onCopy={() => onAction?.('salin')} />
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4 pb-8">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-muted">Barang yang kamu laporkan</p>
            <StatusBadge label={ada ? 'Kandidat Ditemukan' : 'Dilaporkan'} />
          </div>
          <div className="flex gap-3">
            {report?.photo && <img src={report.photo} alt="" className="size-16 shrink-0 rounded-xl object-cover" />}
            <div className="min-w-0 flex-1">
              {report?.category && <CategoryBadge category={report.category} />}
              <p className="mt-1.5 font-display text-[16px] font-semibold leading-snug">{report?.title ?? 'Belum diketahui'}</p>
              <div className="mt-1 space-y-0.5">
                {report?.location && <MetaRow icon={<MapPin strokeWidth={1.5} />}>{report.location}</MetaRow>}
                {report?.lostWhen && <MetaRow icon={<Clock strokeWidth={1.5} />}>{report.lostWhen}</MetaRow>}
              </div>
            </div>
          </div>
        </Card>

        {ada && item && cand ? (
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-blue-soft text-primary">
                <Zap className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-display text-[17px] font-semibold leading-tight">Sistem menemukan 1 barang yang mirip</p>
                <p className="text-[12px] text-muted">Hasil pencocokan otomatis</p>
              </div>
            </div>
            <button onClick={() => onAction?.('bandingkan')} className="relative mt-4 block aspect-[16/10] w-full overflow-hidden rounded-xl">
              {item.image && <img src={item.image} alt="" className="absolute inset-0 size-full object-cover" />}
              <span className="absolute top-2 left-2 inline-flex h-7 items-center rounded-full bg-primary px-3 text-[12px] font-bold text-white">{cand.score}% mirip</span>
              <span className="absolute top-2 right-2 rounded-full bg-white">
                <StatusBadge label="Dititipkan" />
              </span>
            </button>
            <p className="mt-3 font-display text-[16px] font-semibold">{item.name}</p>
            <MetaRow icon={<MapPin strokeWidth={1.5} />} className="mt-1">
              {item.location}
            </MetaRow>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <ReasonChip>Kategori sama</ReasonChip>
              <ReasonChip>Lokasi sama</ReasonChip>
              <ReasonChip>Warna sama</ReasonChip>
            </div>
            <p className="mt-3 text-[12px] text-muted">{SKOR_NOTE}</p>
          </Card>
        ) : (
          <Card className="flex flex-col items-center text-center">
            <div className="relative flex size-24 items-center justify-center rounded-full bg-blue-soft">
              <span className="absolute inset-3 rounded-full border border-primary/20" />
              <Radar className="size-10 text-primary" strokeWidth={1.5} />
              <span className="absolute top-5 right-5 size-2.5 rounded-full bg-pink" />
            </div>
            <p className="mt-4 font-display text-[17px] font-semibold">Belum ada barang yang mirip</p>
            <p className="mt-1 text-[13px] leading-[1.5] text-muted">
              Kami akan memberi kabar begitu ada barang temuan yang cocok. Sambil menunggu, kamu bisa menelusuri daftar temuan.
            </p>
          </Card>
        )}

        <Card>
          <CardTitle right={<span className="text-[12px] font-semibold text-primary">Langkah {ada ? 2 : 1} dari 4</span>}>Status Laporan</CardTitle>
          <Tracker
            steps={[
              { title: 'Dilaporkan', time: reportedTime, desc: 'Laporan tersimpan.', state: ada ? 'done' : 'active' },
              { title: 'Kandidat Ditemukan', desc: ada ? '1 barang mirip ditemukan' : 'Sistem terus mencari barang yang mirip', state: ada ? 'active' : 'todo' },
              { title: 'Verifikasi', desc: 'Petugas memeriksa klaimmu', state: 'todo' },
              { title: 'Kembali', desc: `Serah-terima di ${DROP_POINTS.posko.name}`, state: 'todo' },
            ]}
          />
        </Card>

        <div className="space-y-3 pt-2">
          <Button className="w-full" arrow onClick={() => onAction?.(ada ? 'bandingkan' : 'telusuri')}>
            {ada ? 'Lihat Kandidat & Bandingkan' : 'Telusuri Barang Temuan'}
          </Button>
          <Button variant="secondary" className="w-full" icon={<FileText className="size-5" strokeWidth={1.5} />} onClick={() => onAction?.('laporan-saya')}>
            Buka Laporan Saya
          </Button>
          <div className="flex justify-center">
            <TextLink onClick={() => onAction?.('beranda')}>Kembali ke Beranda</TextLink>
          </div>
        </div>
      </div>
    </Screen>
  )
}
