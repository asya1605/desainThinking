import React from 'react'
import { GraduationCap } from 'lucide-react'
import { Button, Logo, Screen, cx, type Act } from '../shared/foundit/ui'
import { IMG } from '../shared/foundit/data'

export const args = {
  page: 1,
}

export const argTypes = {
  page: { control: 'radio', options: [1, 2, 3] },
}

type Props = Partial<typeof args> & { onAction?: Act }

const PAGES = [
  {
    img: IMG.splash1,
    title: 'Kelola Barang Temuan di Lingkungan Kampus',
    text: 'Daftarkan, lacak, dan ambil kembali barang temuan dengan mudah, aman, dan terverifikasi.',
  },
  {
    img: IMG.splash2,
    title: 'Laporkan dan Lacak Barang Hilang',
    text: 'Buat laporan dalam hitungan detik, lalu pantau status pencocokan barangmu secara langsung.',
  },
  {
    img: IMG.splash3,
    title: 'Ambil Kembali dengan Verifikasi Aman',
    text: 'Tunjukkan kode QR dan kartu identitas di Posko Dekanat Lt. 1 untuk mengambil barangmu.',
  },
]

export default function SplashPengenalan(props: Props) {
  const { page, onAction } = { ...args, ...props }
  const p = PAGES[Math.min(Math.max(page, 1), 3) - 1]
  const last = page === 3
  return (
    <Screen>
      <div className="relative flex min-h-full flex-col overflow-hidden px-6 pt-4 pb-8">
        {/* dekorasi tepi */}
        <div className="pointer-events-none absolute -top-16 -left-20 size-56 rounded-full bg-primary/[0.06]" />
        <div className="pointer-events-none absolute top-[46%] -right-24 size-56 rounded-full bg-pink/[0.07]" />
        <div className="pointer-events-none absolute top-14 right-6 grid grid-cols-5 gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="size-1 rounded-full bg-faint/40" />
          ))}
        </div>

        <div className="relative flex h-11 items-center justify-end">
          {!last && (
            <button onClick={() => onAction?.('lewati')} className="h-11 px-2 text-[14px] font-medium text-muted">
              Lewati
            </button>
          )}
        </div>

        <div className="relative flex flex-col items-center text-center">
          <Logo size={64} />
          <p className="mt-3 font-display text-[22px] font-bold text-primary">FoundIt Vokasi</p>
          <p className="text-[13px] text-muted">Universitas Airlangga</p>
          <span className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-medium text-ink shadow-card">
            <GraduationCap className="size-4 text-primary" strokeWidth={1.5} />
            Fakultas Vokasi • Universitas Airlangga
          </span>
        </div>

        <div className="relative mx-auto mt-6 w-full max-w-[300px]">
          <img src={p.img} alt="" className="aspect-square w-full rounded-[32px] object-cover mix-blend-multiply" />
        </div>

        <div className="relative mt-6 text-center">
          <h1 className="font-display text-[24px] font-bold leading-tight">{p.title}</h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-[1.5] text-muted">{p.text}</p>
        </div>

        <div className="relative mt-auto pt-8">
          <div className="mb-5 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <span key={i} className={cx('h-2 rounded-full', i === page ? 'w-6 bg-primary' : 'w-2 bg-line')} />
            ))}
          </div>
          <Button className="w-full" arrow onClick={() => onAction?.(last ? 'mulai' : 'lanjut')}>
            {last ? 'Mulai' : 'Lanjut'}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
