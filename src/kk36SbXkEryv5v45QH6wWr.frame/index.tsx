import React, { useState } from 'react'
import { Bell, Calendar, CheckCheck, ChevronRight, FileWarning, Headphones, Hourglass, Info, PackageCheck, ShieldCheck, Sparkles, Star, X } from 'lucide-react'
import { BottomNav, Button, EmptyState, HomeHeader, IconButton, PhotoTile, Screen, cx, type Act } from '../shared/foundit/ui'
import { TODAY_ISO, type UserKey } from '../shared/foundit/data'
import { notificationsFor, type Notif, type NotifKind } from '../shared/foundit/notifications'
import { isRead } from '../shared/foundit/store'

export const args = {
  pengguna: 'rara',
}

export const argTypes = {
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
}

type Props = Partial<typeof args> & {
  onAction?: Act
  /** Membuka tujuan notifikasi (prototipe menandai dibaca dan menavigasi berdasarkan ID). */
  onOpen?: (n: Notif) => void
  /** Berubah setiap status baca berubah, supaya daftar dibaca ulang. */
  version?: number
}

const CHIPS = ['Semua', 'Klaim', 'Laporan', 'Info'] as const

const KIND: Record<NotifKind, { label: string; icon: React.ReactNode; tone: string; cta?: string }> = {
  jadwal: { label: 'PENGINGAT JADWAL', icon: <Calendar strokeWidth={1.75} />, tone: 'bg-blue-soft text-primary', cta: 'Buka Tiket QR' },
  disetujui: { label: 'KLAIM DISETUJUI', icon: <ShieldCheck strokeWidth={1.75} />, tone: 'bg-success/10 text-success' },
  ditolak: { label: 'KLAIM DITOLAK', icon: <X strokeWidth={1.75} />, tone: 'bg-danger/10 text-danger' },
  bukti: { label: 'PERLU BUKTI', icon: <FileWarning strokeWidth={1.75} />, tone: 'bg-orange/10 text-orange' },
  diterima: { label: 'KLAIM DITERIMA', icon: <Hourglass strokeWidth={1.75} />, tone: 'bg-amber/15 text-amber' },
  kandidat: { label: 'KANDIDAT BARU', icon: <Sparkles strokeWidth={1.75} />, tone: 'bg-violet/10 text-violet', cta: 'Bandingkan' },
  'temuan-diterima': { label: 'TEMUAN DITITIPKAN', icon: <PackageCheck strokeWidth={1.75} />, tone: 'bg-teal/10 text-teal' },
  'temuan-diklaim': { label: 'KLAIM ATAS TEMUANMU', icon: <Info strokeWidth={1.75} />, tone: 'bg-blue-soft text-primary' },
  info: { label: 'INFO LAYANAN', icon: <Info strokeWidth={1.75} />, tone: 'bg-line/70 text-muted' },
}

const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function Notifikasi(props: Props) {
  const { pengguna, onAction } = { ...args, ...props }
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('Semua')
  const all = notificationsFor(pengguna as UserKey)
  const unread = all.filter((n) => !isRead(n.id)).length
  const list = chip === 'Semua' ? all : all.filter((n) => n.category === chip)
  const groups = group(list)
  const open = (n: Notif) => (props.onOpen ? props.onOpen(n) : onAction?.('notif:' + n.id))

  return (
    <Screen nav={<BottomNav active="notifikasi" notif={unread > 0} onAction={onAction} />}>
      <HomeHeader onAction={onAction} />
      <div className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[24px] font-bold">Notifikasi</h1>
              {unread > 0 && <span className="inline-flex h-6 items-center rounded-full bg-pink px-2.5 text-[11px] font-semibold text-white">{unread} Baru</span>}
            </div>
            <p className="text-[14px] text-muted">Kabar terbaru soal laporan dan klaimmu.</p>
          </div>
          <IconButton label="Tandai semua dibaca" white onClick={() => onAction?.('tandai-semua')}>
            <CheckCheck className="size-5 text-primary" strokeWidth={1.75} />
          </IconButton>
        </div>

        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => setChip(c)}
              className={cx('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors duration-150', chip === c ? 'bg-primary text-white' : 'bg-white ring-1 ring-line')}
            >
              {c}
              {c === 'Semua' && unread > 0 && (
                <span className={cx('flex size-5 items-center justify-center rounded-full text-[11px]', chip === c ? 'bg-white text-primary' : 'bg-primary text-white')}>{unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          illustration={
            <div className="relative flex size-36 items-center justify-center rounded-full bg-blue-soft">
              <Bell className="size-16 text-primary" strokeWidth={1.25} />
              <Star className="absolute top-6 right-6 size-5 fill-yellow text-amber" strokeWidth={1.5} />
              <Star className="absolute bottom-8 left-6 size-3.5 fill-pink text-pink" strokeWidth={1.5} />
            </div>
          }
          title="Belum ada notifikasi"
          text="Kabar soal laporan dan klaimmu akan muncul di sini."
        />
      ) : (
        <div className="px-4 pt-5 pb-6">
          {groups.map((g) => (
            <React.Fragment key={g.title}>
              <Group title={g.title}>
                {g.items.map((n) => {
                  const k = KIND[n.kind]
                  const unreadOne = !isRead(n.id)
                  return (
                    <React.Fragment key={n.id}>
                      <NotifCard
                        unread={unreadOne}
                        icon={k.icon}
                        iconTone={k.tone}
                        label={k.label}
                        time={`${String(n.at.getHours()).padStart(2, '0')}:${String(n.at.getMinutes()).padStart(2, '0')}`}
                        title={n.title}
                        text={n.text}
                        refId={n.ref}
                        onClick={() => open(n)}
                        extra={
                          n.image ? (
                            <div className="mt-2 flex items-center gap-2 rounded-xl bg-page p-2">
                              <PhotoTile src={n.image} className="size-9 rounded-lg" />
                              <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{n.text}</span>
                            </div>
                          ) : undefined
                        }
                        action={
                          k.cta ? (
                            <Button small variant={n.kind === 'kandidat' ? 'secondary' : undefined} onClick={() => open(n)}>
                              {k.cta}
                            </Button>
                          ) : undefined
                        }
                      />
                    </React.Fragment>
                  )
                })}
              </Group>
            </React.Fragment>
          ))}

          <button onClick={() => onAction?.('bantuan')} className="mt-2 flex w-full items-center gap-3 rounded-2xl bg-blue-soft p-4 text-left">
            <Headphones className="size-6 shrink-0 text-primary" strokeWidth={1.5} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">Butuh bantuan?</span>
              <span className="block text-[12px] text-muted">Hubungi Posko Dekanat Lt. 1</span>
            </span>
            <ChevronRight className="size-5 text-primary" strokeWidth={1.5} />
          </button>
          <div className="mt-2 flex justify-center">
            <button onClick={() => onAction?.('atur')} className="inline-flex h-11 items-center gap-1.5 text-[13px] font-medium text-muted">
              <Bell className="size-4" strokeWidth={1.75} />
              Atur notifikasi
            </button>
          </div>
        </div>
      )}
    </Screen>
  )
}

/** Kelompok tanggal relatif terhadap tanggal demo. */
function group(list: Notif[]) {
  const [y, m, d] = TODAY_ISO.split('-').map(Number)
  const today = new Date(y, m - 1, d).getTime()
  const day = 24 * 60 * 60 * 1000
  const out: { title: string; items: Notif[] }[] = []
  for (const n of list) {
    const start = new Date(n.at.getFullYear(), n.at.getMonth(), n.at.getDate()).getTime()
    const title = start === today ? 'Hari ini' : start === today - day ? 'Kemarin' : `${n.at.getDate()} ${BLN[n.at.getMonth()]}`
    const g = out.find((x) => x.title === title)
    if (g) g.items.push(n)
    else out.push({ title, items: [n] })
  }
  return out
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 text-[13px] font-semibold text-muted">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function NotifCard({
  unread,
  icon,
  iconTone,
  label,
  time,
  title,
  text,
  refId,
  extra,
  action,
  onClick,
}: {
  unread?: boolean
  icon: React.ReactNode
  iconTone: string
  label: string
  time: string
  title: string
  text?: string
  refId?: string
  extra?: React.ReactNode
  action?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div className={cx('relative overflow-hidden rounded-2xl bg-white p-4', unread ? 'shadow-card' : 'ring-1 ring-line')}>
      {unread && <span className="absolute inset-y-0 left-0 w-1 bg-primary" />}
      <button onClick={onClick} className="flex w-full gap-3 text-left">
        <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-full [&>svg]:size-5', iconTone)}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold tracking-wide text-muted">{label}</span>
            <span className="text-[12px] tabular-nums text-muted">{time}</span>
          </span>
          <span className="mt-0.5 flex items-start gap-2">
            <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug">{title}</span>
            {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-pink" />}
          </span>
          {extra ?? (text && <span className="mt-0.5 block text-[13px] leading-[1.5] text-muted">{text}</span>)}
          {refId && !text?.includes(refId) && <span className="mt-1 block font-mono text-[11px] font-semibold text-primary">{refId}</span>}
        </span>
      </button>
      {action && <div className="mt-3 pl-[52px]">{action}</div>}
    </div>
  )
}
