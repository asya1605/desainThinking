import React from 'react'
import { Building2, Clock, Copy, CreditCard } from 'lucide-react'
import { Button, IconCircle, IconButton, StatusBadge, TextLink, type Act } from './ui'

/** Isi sheet "Fitur Civitas / Lapor" untuk tamu. */
export function GuestLaporSheetBody({ onAction }: { onAction?: Act }) {
  return (
    <div className="flex flex-col items-center text-center">
      <IconCircle tone="blue" size={64}>
        <Building2 className="size-7" strokeWidth={1.5} />
      </IconCircle>
      <h2 className="mt-4 font-display text-[20px] font-bold">Tamu melapor langsung di posko</h2>
      <p className="mt-2 text-[14px] leading-[1.5] text-muted">
        Ceritakan barang yang hilang atau serahkan barang yang kamu temukan ke petugas. Petugas akan mencatat dan mengabarimu lewat WhatsApp.
      </p>
      <div className="mt-5 grid w-full grid-cols-1 gap-3 text-left min-[360px]:grid-cols-2">
        <MiniPoint name="Posko Dekanat Lt. 1" type="Posko Utama" hours="Senin-Jumat 07.00-18.00" desc="Laporan kehilangan dan titipan" />
        <MiniPoint name="Pos Satpam Gerbang Utama" type="Titik Satelit" hours="Buka 24 jam" desc="Hanya titipan barang temuan" />
      </div>
      <Button className="mt-5 w-full" arrow onClick={() => onAction?.('lihat-titik')}>
        Lihat Titik Penitipan
      </Button>
      <TextLink className="mt-1" onClick={() => onAction?.('masuk')}>
        Civitas UNAIR? Masuk
      </TextLink>
      <TextLink tone="muted" onClick={() => onAction?.('tutup')}>
        Tutup
      </TextLink>
    </div>
  )
}

function MiniPoint({ name, type, hours, desc }: { name: string; type: string; hours: string; desc: string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line p-3">
      <p className="font-display text-[15px] font-semibold leading-snug">{name}</p>
      <div className="mt-1.5">
        <StatusBadge label={type} color={type === 'Posko Utama' ? '#0000FF' : '#0891B2'} dot={false} />
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink">
        <Clock className="size-3.5 text-muted" strokeWidth={1.5} />
        {hours}
      </p>
      <p className="mt-1 text-[12px] leading-[1.5] text-muted">{desc}</p>
    </div>
  )
}

/** Isi sheet "Fitur Civitas / Klaim" untuk tamu. */
export function GuestKlaimSheetBody({ onAction, id = 'FI-T-26-0095' }: { onAction?: Act; id?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <IconCircle tone="blue" size={64}>
        <CreditCard className="size-7" strokeWidth={1.5} />
      </IconCircle>
      <h2 className="mt-4 font-display text-[20px] font-bold">Klaim barang di Posko Dekanat Lt. 1</h2>
      <p className="mt-2 text-[14px] leading-[1.5] text-muted">
        Datang ke Posko Dekanat Lt. 1 dengan KTP asli dan sebutkan ID barang ini. Petugas akan menanyakan ciri khusus barang.
      </p>
      <div className="mt-5 flex w-full items-center justify-between rounded-2xl bg-blue-soft py-3 pr-2 pl-4 text-left">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-muted">ID BARANG</p>
          <p className="font-mono text-[24px] font-bold text-primary">{id}</p>
        </div>
        <IconButton label="Salin ID" white onClick={() => onAction?.('salin')}>
          <Copy className="size-5 text-primary" strokeWidth={1.75} />
        </IconButton>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
        <Clock className="size-4" strokeWidth={1.5} />
        Senin-Jumat, 07.00-18.00 WIB
      </p>
      <Button className="mt-5 w-full" arrow onClick={() => onAction?.('lokasi-posko')}>
        Lihat Lokasi Posko
      </Button>
      <TextLink className="mt-1" onClick={() => onAction?.('masuk')}>
        Civitas UNAIR? Masuk untuk klaim di aplikasi
      </TextLink>
      <TextLink tone="muted" onClick={() => onAction?.('tutup')}>
        Tutup
      </TextLink>
    </div>
  )
}
