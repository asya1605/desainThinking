import React from 'react'
import { Check, Download, Hourglass, MapPin, Navigation, ShieldCheck, Star } from 'lucide-react'
import {
  Button,
  Card,
  CategoryBadge,
  IconCircle,
  IdChip,
  MetaRow,
  PageHeader,
  QR,
  Screen,
  StatusBadge,
  TextLink,
  type Act,
} from '../shared/foundit/ui'
import { DROP_POINTS, FOUND_REPORTS, foundView } from '../shared/foundit/data'

export const args = {
  itemId: 'FI-T-26-0042',
  sisa: 'Sisa 23 jam 59 menit',
}

export const argTypes = {
  itemId: { control: 'text' },
  sisa: { control: 'text' },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function KodePenitipan(props: Props) {
  const { itemId, sisa, onAction } = { ...args, ...props }
  const report = FOUND_REPORTS[itemId]
  const view = report ? foundView(report) : undefined
  const point = report?.pointKey ? DROP_POINTS[report.pointKey] : undefined
  const seed = Number(itemId.slice(-4)) || 1
  return (
    <Screen>
      <PageHeader
        title="Kode Penitipan"
        close
        center
        right="share"
        onRight={() => onAction?.('bagikan')}
        onBack={() => onAction?.('tutup-x')}
      />

      <div className="px-4 pb-8">
        <div className="flex flex-col items-center pt-2 text-center">
          <div className="relative">
            <IconCircle tone="blue" size={72}>
              <span className="flex size-11 items-center justify-center rounded-full bg-primary text-white">
                <Check className="size-6" strokeWidth={3} />
              </span>
            </IconCircle>
            <Star className="absolute -top-1 -right-1 size-5 fill-yellow text-amber" strokeWidth={1.5} />
          </div>
          <h1 className="mt-4 font-display text-[22px] font-bold">Laporan Temuan Terkirim!</h1>
          <p className="mt-1.5 max-w-[320px] text-[14px] leading-[1.5] text-muted">
            Terima kasih sudah membantu. Tunjukkan kode ini ke petugas saat menitipkan barang.
          </p>
        </div>

        {/* Tiket */}
        <div className="relative mt-6 rounded-3xl bg-white shadow-card">
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge label="Belum Dititipkan" />
              <IdChip id={itemId} copy onCopy={() => onAction?.('salin')} />
            </div>
            <div className="mt-5 flex justify-center">
              <QR
                size={208}
                seed={seed}
                center={
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="size-5" strokeWidth={3} />
                  </span>
                }
              />
            </div>
            <div className="mx-auto mt-5 w-fit rounded-2xl bg-blue-soft px-5 py-2 text-center">
              <p className="text-[11px] font-semibold tracking-wide text-muted">KODE PENITIPAN</p>
              <p className="font-mono text-[26px] font-bold text-primary">{report?.dropCode ?? 'Belum diketahui'}</p>
            </div>
            <p className="mt-2 text-center text-[12px] text-muted">Tunjukkan QR ini ke petugas untuk dipindai.</p>
          </div>
          <div className="relative flex items-center">
            <span className="-ml-3 size-6 shrink-0 rounded-full bg-page" />
            <span className="mx-2 flex-1 border-t-2 border-dashed border-line" />
            <span className="-mr-3 size-6 shrink-0 rounded-full bg-page" />
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 rounded-xl bg-orange/10 p-3">
              <Hourglass className="size-5 shrink-0 text-orange" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">Titipkan sebelum {report?.deadline ?? 'belum diketahui'}</p>
                <p className="text-[12px] font-semibold text-orange">{sisa}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {view?.image && <img src={view.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0">
                {view?.category && <CategoryBadge category={view.category} />}
                <p className="mt-1 text-[14px] font-semibold leading-snug">{view?.name ?? 'Belum diketahui'}</p>
                {report?.location && <MetaRow icon={<MapPin strokeWidth={1.5} />}>{report.location}</MetaRow>}
              </div>
            </div>
          </div>
        </div>

        {/* Titik tujuan */}
        <Card className="mt-4">
          <div className="flex gap-3">
            <IconCircle tone="green" size={44}>
              <ShieldCheck className="size-5" strokeWidth={1.75} />
            </IconCircle>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-wide text-muted">TITIK PENITIPAN</p>
              <p className="font-display text-[17px] font-semibold">{point?.name ?? 'Belum diketahui'}</p>
              {point?.address && <p className="text-[13px] text-muted">{point.address}</p>}
              {point && <p className="text-[13px] text-muted">{point.hours}</p>}
            </div>
          </div>
          <Button variant="secondary" className="mt-3 w-full" icon={<Navigation className="size-4" strokeWidth={1.75} />} onClick={() => onAction?.('petunjuk-arah')}>
            Petunjuk Arah
          </Button>
        </Card>

        {/* Langkah selanjutnya */}
        <h2 className="mt-6 font-display text-[18px] font-semibold">Langkah Selanjutnya</h2>
        <ol className="mt-3 rounded-2xl bg-white p-4 shadow-card">
          {[
            'Bawa barang dan tunjukkan QR',
            'Petugas memindai dan menempel label ID',
            'Kamu mendapat notifikasi saat barang diterima',
          ].map((t, i) => (
            <li key={t} className="relative flex gap-3 pb-4 last:pb-0">
              {i < 2 && <span className="absolute top-8 bottom-0 left-[15px] w-0.5 bg-blue-soft" />}
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-white">{i + 1}</span>
              <p className="pt-1.5 text-[14px] font-medium">{t}</p>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex gap-3 rounded-2xl bg-blue-soft p-4">
          <ShieldCheck className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-[13px] leading-[1.5]">Identitasmu tidak ditampilkan ke publik maupun ke pemilik barang.</p>
        </div>

        <div className="mt-6 space-y-3">
          <Button className="w-full" icon={<Download className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('simpan-qr')}>
            Simpan QR ke Galeri
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => onAction?.('laporan-saya')}>
            Lihat di Laporan Saya
          </Button>
          <div className="flex justify-center">
            <TextLink onClick={() => onAction?.('beranda')}>Kembali ke Beranda</TextLink>
          </div>
        </div>
      </div>
    </Screen>
  )
}
