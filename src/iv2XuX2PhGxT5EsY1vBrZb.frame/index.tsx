import React from 'react'
import { ArrowLeft, Check, Info, Map, MapPin } from 'lucide-react'
import {
  BottomNav,
  Button,
  Card,
  CardTitle,
  EmptyState,
  IconButton,
  IconCircle,
  InfoBox,
  PageHeader,
  Screen,
  StatusBadge,
  cx,
  type Act,
} from '../shared/foundit/ui'
import { DROP_POINTS, isPoskoOpen, type DropPointKey } from '../shared/foundit/data'

export const args = {
  pointKey: 'posko',
  akun: 'civitas',
}

export const argTypes = {
  pointKey: { control: 'select', options: ['posko', 'gerbang', 'vokasi-c', 'invalid'] },
  akun: { control: 'radio', options: ['civitas', 'tamu'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function DetailTitik(props: Props) {
  const { pointKey, akun, onAction } = { ...args, ...props }
  const guest = akun === 'tamu'
  const nav = <BottomNav variant={guest ? 'tamu' : 'civitas'} active={guest ? 'titik' : 'none'} notif={!guest} onAction={onAction} />

  const point = pointKey ? DROP_POINTS[pointKey as DropPointKey] : undefined

  if (!point) {
    return (
      <Screen nav={nav}>
        <PageHeader title="Detail Titik" onBack={() => onAction?.('kembali')} />
        <EmptyState
          illustration={
            <IconCircle tone="gray" size={96}>
              <MapPin className="size-10" strokeWidth={1.5} />
            </IconCircle>
          }
          title="Titik tidak ditemukan"
          text="Titik penitipan ini tidak terdaftar di sistem FoundIt Vokasi."
        >
          <Button variant="secondary" onClick={() => onAction?.('kembali')}>
            Kembali ke Daftar Titik
          </Button>
        </EmptyState>
      </Screen>
    )
  }

  return (
    <Screen
      nav={nav}
      footer={
        <Button
          className="w-full"
          icon={<Map className="size-5" strokeWidth={1.75} />}
          onClick={() => {
            if (onAction) {
              onAction('buka-peta')
            } else if (point.address) {
              try {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}`, '_blank', 'noopener,noreferrer')
              } catch {}
            }
          }}
        >
          Buka di Peta
        </Button>
      }
    >
      {point.photo ? (
        <div className="relative h-[220px]">
          <img src={point.photo} alt={point.name} className="size-full object-cover" />
          <div className="absolute top-3 left-3">
            <IconButton label="Kembali" white onClick={() => onAction?.('kembali')}>
              <ArrowLeft className="size-5" strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>
      ) : (
        <div className="relative flex h-[160px] items-center justify-center bg-blue-soft/60">
          <div className="absolute top-3 left-3">
            <IconButton label="Kembali" white onClick={() => onAction?.('kembali')}>
              <ArrowLeft className="size-5" strokeWidth={1.75} />
            </IconButton>
          </div>
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-card">
            <MapPin className="size-8 text-primary" strokeWidth={1.75} />
          </div>
        </div>
      )}

      <div className="relative -mt-6 space-y-4 rounded-t-[24px] bg-page px-4 pt-5 pb-6">
        <div>
          <h1 className="font-display text-[22px] font-bold">{point.name}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge label={point.type} color={point.type === 'Posko Utama' ? '#0000FF' : '#0891B2'} dot={false} />
            {point.key === 'posko' ? (
              isPoskoOpen() ? (
                <StatusBadge label="Buka sekarang" color="#16A34A" />
              ) : (
                <StatusBadge label="Tutup" color="#94A3B8" />
              )
            ) : point.active ? (
              <StatusBadge label={point.hours === 'Buka 24 jam' ? 'Buka 24 jam' : 'Buka sekarang'} color="#16A34A" />
            ) : (
              <StatusBadge label="Sedang tidak melayani" color="#94A3B8" />
            )}
          </div>
          {point.address && (
            <p className="mt-3 flex items-start gap-2 text-[14px] leading-[1.5] text-muted">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.5} />
              {point.address}
            </p>
          )}
        </div>

        {point.note && (
          <InfoBox tone="blue" icon={<Info strokeWidth={1.75} />}>
            {point.note}
          </InfoBox>
        )}

        {!point.active && (
          <div className="rounded-2xl border border-line bg-white p-4 text-center">
            <p className="font-display text-[15px] font-semibold text-ink">Titik Satelit Nonaktif</p>
            <p className="mt-1 text-[13px] leading-[1.5] text-muted">
              Titik penitipan ini sedang tidak melayani. Silakan menuju Posko Dekanat Lt. 1 atau Pos Satpam Gerbang Utama.
            </p>
          </div>
        )}

        <Card>
          <CardTitle>Jam Layanan</CardTitle>
          {point.hoursTable ? (
            <dl className="divide-y divide-line text-[14px]">
              {point.hoursTable.map(([d, h, today]) => (
                <div key={d as string} className={cx('flex justify-between py-2.5', today && 'font-semibold text-ink')}>
                  <dt className={today ? '' : 'text-muted'}>
                    {d}
                    {today && <span className="ml-2 text-[12px] font-semibold text-primary">Hari ini, Rabu</span>}
                  </dt>
                  <dd className={cx('tabular-nums', !today && 'text-muted')}>{h}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className={cx('text-[14px]', point.active ? 'font-semibold text-ink' : 'text-muted')}>{point.hours}</p>
          )}
        </Card>

        <Card>
          <CardTitle>Layanan</CardTitle>
          {point.services && point.services.length > 0 ? (
            <ul className="space-y-2.5">
              {point.services.map((s) => (
                <li key={s} className="flex items-center gap-3 text-[14px]">
                  <span className="flex size-6 items-center justify-center rounded-full bg-success/10 text-success">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-muted">Layanan di titik ini sedang tidak tersedia.</p>
          )}
        </Card>

        {point.bring && point.bring.length > 0 && (
          <Card>
            <CardTitle>Yang Perlu Dibawa</CardTitle>
            <ul className="space-y-2 text-[14px] leading-[1.5]">
              {point.bring.map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {point.officer && (
          <div className="flex items-center gap-3 px-1">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
              {point.officer
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </span>
            <p className="text-[14px]">
              Petugas jaga: <span className="font-semibold">{point.officer}</span>
            </p>
          </div>
        )}
      </div>
    </Screen>
  )
}
