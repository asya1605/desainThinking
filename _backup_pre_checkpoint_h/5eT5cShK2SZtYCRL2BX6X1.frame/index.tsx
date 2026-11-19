import React, { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, Plus, Search, Users } from 'lucide-react'
import { BottomNav, Card, CardTitle, DropPointCard, PageHeader, Screen, cx, type Act } from '../shared/foundit/ui'
import { DROP_POINTS, IMG, isPoskoOpen } from '../shared/foundit/data'

export const args = {
  tab: 'titik',
  akun: 'civitas',
}

export const argTypes = {
  tab: { control: 'radio', options: ['titik', 'panduan'] },
  akun: { control: 'radio', options: ['civitas', 'tamu'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function TitikPenitipan(props: Props) {
  const { tab, akun, onAction } = { ...args, ...props }
  const guest = akun === 'tamu'
  const [openKehilangan, setOpenKehilangan] = useState(true)
  const [openTemuan, setOpenTemuan] = useState(false)
  const [openTamu, setOpenTamu] = useState(false)

  return (
    <Screen nav={<BottomNav variant={guest ? 'tamu' : 'civitas'} active={guest ? 'titik' : 'none'} notif={!guest} onAction={onAction} />}>
      <PageHeader title="Titik Penitipan" onBack={() => onAction?.('kembali')} />
      <div className="px-4 pb-28">
        <div className="grid grid-cols-2 gap-1 rounded-full bg-white p-1 ring-1 ring-line">
          {(['titik', 'panduan'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onAction?.('tab:' + t)}
              className={cx('h-10 rounded-full text-[14px] font-semibold', tab === t ? 'bg-primary text-white' : 'text-muted')}
            >
              {t === 'titik' ? 'Titik' : 'Panduan'}
            </button>
          ))}
        </div>

        {tab === 'titik' ? (
          <>
            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-line">
              <img src={IMG.peta} alt="Peta Kampus B" className="absolute inset-0 size-full object-cover" />
              <Pin className="top-[30%] left-[48%]" color="#0000FF" label="Posko Dekanat" />
              <Pin className="top-[74%] left-[18%]" color="#0891B2" label="Gerbang Utama" />
              <Pin className="top-[44%] left-[78%]" color="#94A3B8" label="Vokasi C" />
            </div>
            <div className="mt-4 space-y-3">
              {Object.values(DROP_POINTS).map((pt) => {
                const poskoBuka = pt.key === 'posko' ? isPoskoOpen() : pt.active
                return (
                  <React.Fragment key={pt.key}>
                    <DropPointCard
                      name={pt.name}
                      type={pt.type}
                      disabled={!pt.active}
                      open={pt.active && (pt.key === 'posko' ? poskoBuka : true)}
                      openLabel={
                        pt.key === 'posko'
                          ? poskoBuka
                            ? 'Buka · tutup 18.00'
                            : 'Tutup · buka 07.00'
                          : pt.key === 'gerbang'
                            ? 'Buka 24 jam'
                            : undefined
                      }
                      desc={pt.key === 'posko' ? 'Gedung Dekanat Fakultas Vokasi, Kampus B' : pt.note}
                      services={pt.key === 'posko' ? ['Penitipan', 'Klaim', 'Serah-terima'] : pt.key === 'gerbang' ? ['Penitipan'] : undefined}
                      onClick={() => onAction?.('titik:' + pt.key)}
                    />
                  </React.Fragment>
                )
              })}
            </div>
          </>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <AccHead
                icon={<Plus className="size-5" strokeWidth={2} />}
                tone="bg-yellow text-ink"
                title="Kalau kehilangan barang"
                open={openKehilangan}
                onClick={() => setOpenKehilangan(!openKehilangan)}
              />
              {openKehilangan && (
                <ol className="mt-4 space-y-3">
                  {[
                    'Cari di daftar temuan',
                    'Buat laporan kehilangan',
                    'Bandingkan kandidat dan ajukan klaim',
                    'Ambil di Posko Dekanat Lt. 1 dengan QR dan KTM',
                  ].map((s, i) => (
                    <li key={s} className="flex gap-3 text-[14px] leading-[1.5]">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-soft text-[12px] font-bold text-primary">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <AccHead
                icon={<Search className="size-5" strokeWidth={2} />}
                tone="bg-primary text-white"
                title="Kalau menemukan barang"
                open={openTemuan}
                onClick={() => setOpenTemuan(!openTemuan)}
              />
              {openTemuan && (
                <ol className="mt-4 space-y-3">
                  {[
                    'Buat laporan penemuan di aplikasi',
                    'Dapatkan Kode Penitipan dan batas waktu 1×24 jam',
                    'Titipkan barang ke Posko Dekanat Lt. 1 atau Pos Gerbang Utama',
                    'Petugas memverifikasi barang dan mencatat ke sistem',
                  ].map((s, i) => (
                    <li key={s} className="flex gap-3 text-[14px] leading-[1.5]">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-soft text-[12px] font-bold text-primary">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <AccHead
                icon={<Users className="size-5" strokeWidth={1.75} />}
                tone="bg-blue-soft text-primary"
                title="Untuk tamu"
                open={openTamu}
                onClick={() => setOpenTamu(!openTamu)}
              />
              {openTamu && (
                <ol className="mt-4 space-y-3">
                  {[
                    'Tamu dapat melihat barang temuan dan lokasi titik di aplikasi',
                    'Untuk melapor atau klaim, datang langsung ke Posko Dekanat Lt. 1',
                    'Bawa kartu identitas asli (KTP) untuk verifikasi petugas',
                    'Petugas akan mencocokkan ciri khusus barang dan memproses serah-terima BAST',
                  ].map((s, i) => (
                    <li key={s} className="flex gap-3 text-[14px] leading-[1.5]">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-soft text-[12px] font-bold text-primary">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <Card className="mt-2">
              <CardTitle>Tanya-Jawab</CardTitle>
              <div className="divide-y divide-line">
                {[
                  ['Berapa lama barang disimpan?', '30 hari sejak diterima posko, lalu diserahkan ke Unit Sarpras.'],
                  ['Apa yang perlu dibawa saat mengambil?', 'Identitas asli (KTM atau KTP) dan QR tiket.'],
                ].map(([q, a]) => (
                  <div key={q} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-[14px] font-semibold">{q}</p>
                    <p className="mt-1 text-[13px] leading-[1.5] text-muted">{a}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Screen>
  )
}

function Pin({ className, color, label }: { className: string; color: string; label: string }) {
  return (
    <div className={cx('absolute flex -translate-x-1/2 -translate-y-full flex-col items-center', className)}>
      <span className="mb-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold shadow-sm">{label}</span>
      <MapPin className="size-7 drop-shadow" style={{ color, fill: color }} stroke="white" strokeWidth={1.5} />
    </div>
  )
}

function AccHead({
  icon,
  tone,
  title,
  open,
  onClick,
}: {
  icon: React.ReactNode
  tone: string
  title: string
  open?: boolean
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 text-left">
      <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-xl', tone)}>{icon}</span>
      <span className="flex-1 font-display text-[16px] font-semibold">{title}</span>
      {open ? <ChevronUp className="size-5 text-muted" strokeWidth={1.5} /> : <ChevronDown className="size-5 text-muted" strokeWidth={1.5} />}
    </button>
  )
}
