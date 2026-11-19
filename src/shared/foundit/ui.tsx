import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Clock,
  Copy,
  CreditCard,
  CupSoda,
  Ellipsis,
  FileText,
  House,
  ImagePlus,
  Info,
  KeyRound,
  Lock,
  LogIn,
  MapPin,
  Package,
  Plus,
  Search,
  Share2,
  Shield,
  Shirt,
  Smartphone,
  TriangleAlert,
  Wallet,
  X,
} from 'lucide-react'
import { DROP_POINTS, IMG, SKOR_NOTE, USERS, getItem, type Category, type FoundItem, type UserKey } from './data'

export type Act = (action: string) => void
export const EASE = [0.23, 1, 0.32, 1] as const

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

/* ───────────── Screen shell ───────────── */

export function Screen({
  children,
  nav,
  footer,
  overlay,
  className,
}: {
  children: React.ReactNode
  nav?: React.ReactNode
  footer?: React.ReactNode
  overlay?: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex h-screen w-full justify-center bg-line">
      <div className="relative flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-page font-sans text-ink">
        <div className={cx('no-scrollbar min-h-0 flex-1 overflow-y-auto', className)}>{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-line bg-white px-4 pt-3 pb-5">{footer}</div>
        )}
        {nav}
        {overlay}
      </div>
    </div>
  )
}

/* ───────────── Brand ───────────── */

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center bg-primary text-white"
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
    >
      <MapPin style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2} />
      <span
        className="absolute rounded-full bg-yellow ring-2 ring-white"
        style={{ width: size * 0.22, height: size * 0.22, right: -size * 0.04, top: -size * 0.04 }}
      />
    </div>
  )
}

export function BrandLockup({ sub = true }: { sub?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={32} />
      <div className="leading-tight">
        <p className="font-display text-[16px] font-bold text-primary">FoundIt Vokasi</p>
        {sub && <p className="text-[11px] text-muted">Universitas Airlangga</p>}
      </div>
    </div>
  )
}

/* ───────────── Headers ───────────── */

export function HomeHeader({ guest, onAction, pengguna = 'rara' }: { guest?: boolean; onAction?: Act; pengguna?: UserKey }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-3">
      <BrandLockup sub={false} />
      <div className="flex items-center gap-1">
        <IconButton label="Bantuan" onClick={() => onAction?.('header:bantuan')}>
          <CircleHelp className="size-6 text-muted" strokeWidth={1.5} />
        </IconButton>
        {guest ? (
          <button
            onClick={() => onAction?.('header:masuk')}
            className="h-9 rounded-full border border-primary px-4 text-[13px] font-semibold text-primary"
          >
            Masuk
          </button>
        ) : (
          <button onClick={() => onAction?.('header:profil')} className="flex size-11 items-center justify-center" aria-label="Profil">
            {pengguna === 'rara' ? (
              <img src={IMG.rara} alt="Rara" className="size-9 rounded-full object-cover ring-2 ring-white" />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-pink text-[13px] font-bold text-white ring-2 ring-white">
                {USERS[pengguna].name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export function IconButton({
  children,
  onClick,
  label,
  white,
}: {
  children: React.ReactNode
  onClick?: () => void
  label: string
  white?: boolean
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cx(
        'flex size-11 shrink-0 items-center justify-center rounded-full',
        white && 'bg-white shadow-card'
      )}
    >
      {children}
    </button>
  )
}

const RIGHT_ICONS = {
  share: Share2,
  help: CircleHelp,
  checks: CheckCheck,
  more: Ellipsis,
}

export function PageHeader({
  title,
  subtitle,
  right,
  onBack,
  onRight,
  noBack,
  close,
  center,
}: {
  title: string
  subtitle?: string
  right?: keyof typeof RIGHT_ICONS
  onBack?: () => void
  onRight?: () => void
  noBack?: boolean
  close?: boolean
  center?: boolean
}) {
  const R = right ? RIGHT_ICONS[right] : null
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 bg-page/95 px-3 pt-3 pb-2 backdrop-blur">
      {!noBack && (
        <IconButton label={close ? 'Tutup' : 'Kembali'} white onClick={onBack}>
          {close ? <X className="size-5" strokeWidth={1.75} /> : <ArrowLeft className="size-5" strokeWidth={1.75} />}
        </IconButton>
      )}
      <div className={cx('min-w-0 flex-1', center && 'text-center')}>
        <h1 className="truncate font-display text-[18px] font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-[12px] text-muted">{subtitle}</p>}
      </div>
      {R ? (
        <IconButton label="Aksi" white onClick={onRight}>
          <R className="size-5" strokeWidth={1.75} />
        </IconButton>
      ) : (
        !noBack && <div className="size-11 shrink-0" />
      )}
    </div>
  )
}

export function FormHeader({
  title,
  subtitle,
  step,
  total,
  labels,
  onBack,
  onHelp,
}: {
  title: string
  subtitle?: string
  step: number
  total: number
  labels?: string[]
  onBack?: () => void
  onHelp?: () => void
}) {
  return (
    <div className="sticky top-0 z-20 bg-page/95 px-3 pt-3 pb-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <IconButton label="Kembali" white onClick={onBack}>
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </IconButton>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[18px] font-semibold">{title}</h1>
          <p className="truncate text-[12px] text-muted">
            {subtitle ?? `Langkah ${step} dari ${total} · ${labels?.[step - 1]?.replace(/^\d\. /, '') ?? ''}`}
          </p>
        </div>
        <IconButton label="Bantuan" onClick={onHelp}>
          <CircleHelp className="size-6 text-muted" strokeWidth={1.5} />
        </IconButton>
      </div>
      {subtitle && (
        <p className="mt-1 px-1 text-[12px] font-medium text-ink">
          Langkah {step} dari {total} · {labels?.[step - 1]?.replace(/^\d\. /, '')}
        </p>
      )}
      <div className="mt-3 flex gap-1.5 px-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={cx('h-1.5 flex-1 rounded-full', i < step ? 'bg-primary' : 'bg-line')} />
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between gap-2 px-1">
          {labels.map((l, i) => (
            <span
              key={l}
              className={cx(
                'whitespace-nowrap text-[11px] font-semibold',
                i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-ink' : 'text-faint'
              )}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────────── Buttons ───────────── */

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'disabled' | 'text' | 'outline' | 'yellow'

export function Button({
  children,
  variant = 'primary',
  icon,
  arrow,
  onClick,
  className,
  small,
}: {
  children: React.ReactNode
  variant?: BtnVariant
  icon?: React.ReactNode
  arrow?: boolean
  onClick?: () => void
  className?: string
  small?: boolean
}) {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]'
  const size = small ? 'h-9 rounded-full px-4 text-[13px]' : variant === 'primary' || variant === 'danger-solid' ? 'h-[52px] rounded-xl px-5 text-[15px]' : 'h-12 rounded-xl px-5 text-[15px]'
  const v: Record<BtnVariant, string> = {
    primary: 'bg-primary text-white shadow-card',
    secondary: 'bg-blue-soft text-primary',
    danger: 'border border-danger bg-white text-danger',
    'danger-solid': 'bg-danger text-white',
    disabled: 'pointer-events-none bg-line text-faint',
    text: 'h-11 bg-transparent text-primary',
    outline: 'border border-primary bg-white text-primary',
    yellow: 'bg-yellow text-ink',
  }
  return (
    <button onClick={onClick} className={cx(base, size, v[variant], className)}>
      {icon}
      {children}
      {arrow && <ArrowRight className="size-[18px]" strokeWidth={2} />}
    </button>
  )
}

export function TextLink({
  children,
  onClick,
  tone = 'primary',
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  tone?: 'primary' | 'muted' | 'danger'
  className?: string
}) {
  const t = { primary: 'text-primary', muted: 'text-muted', danger: 'text-danger' }[tone]
  return (
    <button onClick={onClick} className={cx('inline-flex min-h-11 items-center justify-center gap-1.5 text-[14px] font-semibold', t, className)}>
      {children}
    </button>
  )
}

/* ───────────── Inputs ───────────── */

export function FieldLabel({ label, required, extra }: { label: string; required?: boolean; extra?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {required && <span className="text-[11px] font-semibold text-danger">Wajib</span>}
      {extra}
    </div>
  )
}

export function Field({
  label,
  required,
  icon,
  value,
  placeholder,
  state = 'filled',
  error,
  hint,
  trailing,
  dropdown,
  onClick,
  labelExtra,
  white,
  onChange,
  options,
  type = 'text',
  max,
}: {
  label?: string
  required?: boolean
  icon?: React.ReactNode
  value?: string
  placeholder?: string
  /** Jika diisi, kolom menjadi isian sungguhan. */
  onChange?: (v: string) => void
  /** Jika diisi bersama onChange, kolom menjadi pilihan (select). */
  options?: string[]
  type?: 'text' | 'date' | 'time' | 'password'
  max?: string
  state?: 'empty' | 'filled' | 'focus' | 'error'
  error?: string
  hint?: React.ReactNode
  trailing?: React.ReactNode
  dropdown?: boolean
  onClick?: () => void
  labelExtra?: React.ReactNode
  white?: boolean
}) {
  const border =
    state === 'error' ? 'border-danger' : state === 'focus' ? 'border-primary' : white ? 'border-line' : 'border-transparent'
  if (onChange) {
    return (
      <div className="min-w-0">
        {label && <FieldLabel label={label} required={required} extra={labelExtra} />}
        <label
          className={cx(
            'flex h-12 w-full items-center gap-2.5 rounded-xl border-[1.5px] px-3 transition-colors duration-150 ease-out focus-within:border-primary',
            white ? 'bg-white' : 'bg-blue-soft',
            border
          )}
        >
          {icon && <span className="shrink-0 text-muted [&>svg]:size-5">{icon}</span>}
          {options ? (
            <select
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={state === 'error'}
              className={cx('min-w-0 flex-1 appearance-none truncate bg-transparent text-[14px] outline-none', value ? 'text-ink' : 'text-faint')}
            >
              <option value="" disabled>
                {placeholder ?? 'Pilih'}
              </option>
              {options.map((o) => (
                <option key={o} value={o} className="text-ink">
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value ?? ''}
              max={max}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={state === 'error'}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
            />
          )}
          {trailing}
          {options && <ChevronDown className="pointer-events-none size-5 shrink-0 text-muted" strokeWidth={1.5} />}
        </label>
        {error && <p className="mt-1.5 text-[12px] font-medium text-danger">{error}</p>}
        {hint && !error && <div className="mt-1.5 text-[12px] text-muted">{hint}</div>}
      </div>
    )
  }
  return (
    <div className="min-w-0">
      {label && <FieldLabel label={label} required={required} extra={labelExtra} />}
      <button
        onClick={onClick}
        className={cx(
          'flex h-12 w-full items-center gap-2.5 rounded-xl border-[1.5px] px-3 text-left',
          white ? 'bg-white' : 'bg-blue-soft',
          border
        )}
      >
        {icon && <span className="shrink-0 text-muted [&>svg]:size-5">{icon}</span>}
        <span className={cx('min-w-0 flex-1 truncate text-[14px]', value ? 'text-ink' : 'text-faint')}>
          {value || placeholder}
          {state === 'focus' && <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-primary" />}
        </span>
        {trailing}
        {dropdown && <ChevronDown className="size-5 shrink-0 text-muted" strokeWidth={1.5} />}
      </button>
      {error && <p className="mt-1.5 text-[12px] font-medium text-danger">{error}</p>}
      {hint && !error && <div className="mt-1.5 text-[12px] text-muted">{hint}</div>}
    </div>
  )
}

export function TextArea({
  label,
  required,
  value,
  placeholder,
  count,
  max = 300,
  error,
  hint,
  white,
  onClick,
  onChange,
  rows = 3,
}: {
  label?: string
  required?: boolean
  value?: string
  placeholder?: string
  /** Jika diisi, area menjadi isian sungguhan dan menghitung karakter. */
  onChange?: (v: string) => void
  count?: number
  max?: number
  error?: string
  hint?: React.ReactNode
  white?: boolean
  onClick?: () => void
  rows?: number
}) {
  return (
    <div>
      {label && <FieldLabel label={label} required={required} />}
      {onChange ? (
        <textarea
          value={value ?? ''}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={cx(
            'block w-full resize-none rounded-xl border-[1.5px] px-3 py-3 text-[14px] leading-[1.5] text-ink outline-none transition-colors duration-150 ease-out placeholder:text-faint focus:border-primary',
            white ? 'bg-white' : 'bg-blue-soft',
            error ? 'border-danger' : white ? 'border-line' : 'border-transparent'
          )}
          style={{ minHeight: rows * 21 + 24 }}
        />
      ) : (
        <button
          onClick={onClick}
          className={cx(
            'block w-full rounded-xl border-[1.5px] px-3 py-3 text-left text-[14px] leading-[1.5]',
            white ? 'bg-white' : 'bg-blue-soft',
            error ? 'border-danger' : white ? 'border-line' : 'border-transparent'
          )}
          style={{ minHeight: rows * 21 + 24 }}
        >
          <span className={value ? 'text-ink' : 'text-faint'}>{value || placeholder}</span>
        </button>
      )}
      <div className="mt-1.5 flex items-start justify-between gap-3">
        <div className={cx('text-[12px]', error ? 'font-medium text-danger' : 'text-muted')}>{error ?? hint}</div>
        {(count !== undefined || onChange) && (
          <span className={cx('shrink-0 text-[12px] tabular-nums', (count ?? value?.length ?? 0) > max ? 'text-danger' : 'text-muted')}>
            {count ?? value?.length ?? 0}/{max}
          </span>
        )}
      </div>
    </div>
  )
}

export function Checkbox({ checked, children, onClick }: { checked?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-start gap-3 py-1 text-left">
      <span
        className={cx(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px]',
          checked ? 'border-primary bg-primary text-white' : 'border-faint bg-white'
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="text-[13px] leading-[1.5] text-ink">{children}</span>
    </button>
  )
}

export function Toggle({ on, onChange }: { on?: boolean; onChange?: (next: boolean) => void }) {
  if (onChange) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={!!on}
        onClick={() => onChange(!on)}
        className={cx(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none',
          on ? 'bg-primary' : 'bg-line'
        )}
      >
        <span
          className={cx(
            'absolute top-1 size-5 rounded-full bg-white shadow transition-all duration-200',
            on ? 'left-6' : 'left-1'
          )}
        />
      </button>
    )
  }
  return (
    <span className={cx('relative inline-flex h-7 w-12 shrink-0 rounded-full', on ? 'bg-primary' : 'bg-line')}>
      <span className={cx('absolute top-1 size-5 rounded-full bg-white shadow', on ? 'left-6' : 'left-1')} />
    </span>
  )
}

/* ───────────── Badges ───────────── */

export const STATUS_COLORS: Record<string, string> = {
  Dilaporkan: '#64748B',
  'Kandidat Ditemukan': '#0000FF',
  Verifikasi: '#F59E0B',
  Kembali: '#16A34A',
  Dibatalkan: '#94A3B8',
  Ditutup: '#DC2626',
  'Belum Dititipkan': '#EA580C',
  Dititipkan: '#0891B2',
  'Siap Diserahkan': '#7C3AED',
  Diserahkan: '#16A34A',
  Diajukan: '#F59E0B',
  'Perlu Bukti Tambahan': '#EA580C',
  Disetujui: '#16A34A',
  'Klaim Disetujui': '#16A34A',
  Ditolak: '#DC2626',
  Tersimpan: '#0891B2',
  Buka: '#16A34A',
  Bertugas: '#16A34A',
  Disarankan: '#16A34A',
  'Sedang tidak melayani': '#94A3B8',
}

export function StatusBadge({ label, color, dot = true }: { label: string; color?: string; dot?: boolean }) {
  const c = color ?? STATUS_COLORS[label] ?? '#64748B'
  return (
    <span
      className="inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold"
      style={{ backgroundColor: c + '1F', color: c }}
    >
      {dot && <span className="size-1.5 rounded-full" style={{ backgroundColor: c }} />}
      {label}
    </span>
  )
}

export function Pill({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'blue' | 'pink' | 'pink-outline' | 'white' | 'yellow' | 'violet'
  icon?: React.ReactNode
  className?: string
}) {
  const t = {
    neutral: 'bg-line/70 text-muted',
    blue: 'bg-blue-soft text-primary',
    pink: 'bg-pink text-white',
    'pink-outline': 'border border-pink text-pink bg-white',
    white: 'bg-white text-ink shadow-sm',
    yellow: 'bg-yellow text-ink',
    violet: 'bg-violet/10 text-violet',
  }[tone]
  return (
    <span className={cx('inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold [&>svg]:size-3.5', t, className)}>
      {icon}
      {children}
    </span>
  )
}

export function PrivatBadge({ children = 'Privat' }: { children?: React.ReactNode }) {
  return (
    <Pill tone="pink" icon={<Lock strokeWidth={2} />}>
      {children}
    </Pill>
  )
}

export function CategoryIcon({ category, className = 'size-4' }: { category: Category | string; className?: string }) {
  const map: Record<string, React.ElementType> = {
    'Botol & Wadah Minum': CupSoda,
    'Elektronik & Gadget': Smartphone,
    'Dompet & Tas': Wallet,
    Pakaian: Shirt,
    'Dokumen & Kartu': CreditCard,
    Kunci: KeyRound,
    Lainnya: Package,
  }
  const I = map[category] ?? Package
  return <I className={className} strokeWidth={1.5} />
}

export function CategoryBadge({ category }: { category: Category | string }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 text-[11px] font-semibold text-ink shadow-sm ring-1 ring-line">
      <CategoryIcon category={category} className="size-3.5 text-primary" />
      {category}
    </span>
  )
}

export function IdChip({ id, copy, onCopy, tone = 'neutral' }: { id: string; copy?: boolean; onCopy?: () => void; tone?: 'neutral' | 'blue' }) {
  return (
    <span
      className={cx(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full pl-2.5 font-mono text-[11px] font-semibold text-primary',
        copy ? 'pr-1' : 'pr-2.5',
        tone === 'blue' ? 'bg-blue-soft' : 'bg-line/60'
      )}
    >
      {id}
      {copy && (
        <button onClick={onCopy} aria-label="Salin" className="flex size-6 items-center justify-center rounded-full hover:bg-white/70">
          <Copy className="size-3.5" strokeWidth={1.75} />
        </button>
      )}
    </span>
  )
}

/* ───────────── Surfaces ───────────── */

export function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const C = onClick ? 'button' : 'div'
  return (
    <C onClick={onClick} className={cx('block w-full rounded-2xl bg-white p-4 text-left shadow-card', className)}>
      {children}
    </C>
  )
}

export function CardTitle({ children, right, className }: { children: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cx('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="font-display text-[17px] font-semibold">{children}</h2>
      {right}
    </div>
  )
}

export function IconCircle({
  children,
  tone = 'blue',
  size = 56,
}: {
  children: React.ReactNode
  tone?: 'blue' | 'yellow' | 'pink' | 'red' | 'green' | 'gray' | 'amber' | 'orange'
  size?: number
}) {
  const t = {
    blue: 'bg-blue-soft text-primary',
    yellow: 'bg-yellow-soft text-ink',
    pink: 'bg-pink-soft text-pink',
    red: 'bg-danger/10 text-danger',
    green: 'bg-success/10 text-success',
    gray: 'bg-line/70 text-muted',
    amber: 'bg-amber/15 text-amber',
    orange: 'bg-orange/10 text-orange',
  }[tone]
  return (
    <div className={cx('flex shrink-0 items-center justify-center rounded-full', t)} style={{ width: size, height: size }}>
      {children}
    </div>
  )
}

export function InfoBox({
  children,
  icon,
  tone = 'blue',
  className,
  onClick,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  tone?: 'blue' | 'yellow' | 'pink' | 'red' | 'orange' | 'gray' | 'green' | 'violet' | 'teal'
  className?: string
  onClick?: () => void
}) {
  const t = {
    blue: 'bg-blue-soft text-ink [&_.ib-icon]:text-primary',
    yellow: 'bg-yellow-soft text-ink [&_.ib-icon]:text-amber',
    pink: 'bg-pink-soft text-ink [&_.ib-icon]:text-pink',
    red: 'bg-danger/8 text-danger [&_.ib-icon]:text-danger',
    orange: 'bg-orange/8 text-ink [&_.ib-icon]:text-orange',
    gray: 'bg-line/60 text-ink [&_.ib-icon]:text-muted',
    green: 'bg-success/8 text-ink [&_.ib-icon]:text-success',
    violet: 'bg-violet/8 text-ink [&_.ib-icon]:text-violet',
    teal: 'bg-teal/8 text-ink [&_.ib-icon]:text-teal',
  }[tone]
  const C = onClick ? 'button' : 'div'
  return (
    <C onClick={onClick} className={cx('flex w-full items-start gap-3 rounded-xl p-3 text-left text-[13px] leading-[1.5]', t, className)}>
      {icon && <span className="ib-icon mt-px shrink-0 [&>svg]:size-5">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </C>
  )
}

export function MetaRow({ icon, children, className }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-start gap-2 text-[13px] leading-[1.5] text-muted', className)}>
      <span className="mt-0.5 shrink-0 [&>svg]:size-4">{icon}</span>
      <span className="min-w-0">{children}</span>
    </div>
  )
}

/* ───────────── Item cards ───────────── */

export function SensitivePhoto({ className, big }: { className?: string; big?: boolean }) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-2 bg-blue-soft text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-card">
        <Lock className="size-6" strokeWidth={1.5} />
      </div>
      <p className="font-display text-[15px] font-semibold text-ink">Detail disembunyikan</p>
      {big !== false && <p className="text-[12px] text-muted">Data pribadi pemilik dilindungi</p>}
    </div>
  )
}

/** Kartu barang daftar. Selalu dibangun dari satu `FoundItem` master data. */
export function ItemCard({
  item,
  showStored,
  storedBox,
  aspect = '16/10',
  onClick,
  note,
}: {
  item: FoundItem
  showStored?: boolean
  storedBox?: boolean
  aspect?: string
  onClick?: () => void
  note?: React.ReactNode
}) {
  const name = item.name
  const category = item.category
  const status = item.depositStatus
  const area = item.location
  const time = item.foundAt
  const img = item.image
  const sensitive = item.isSensitive
  const storedAt = showStored && item.depositPoint ? DROP_POINTS[item.depositPoint].name : undefined
  return (
    <div className="rounded-2xl bg-white p-3 shadow-card">
      <button onClick={onClick} className="relative block w-full overflow-hidden rounded-xl" style={{ aspectRatio: aspect }}>
        {sensitive ? (
          <SensitivePhoto className="absolute inset-0" />
        ) : (
          <img src={img} alt={name} className="absolute inset-0 size-full object-cover" />
        )}
        <div className="absolute top-2 left-2">
          <CategoryBadge category={category} />
        </div>
        <div className="absolute top-2 right-2 rounded-full bg-white">
          <StatusBadge label={status} />
        </div>
      </button>
      <div className="px-1 pt-3">
        <h3 className="font-display text-[16px] font-semibold leading-snug">{sensitive ? 'Detail disembunyikan' : name}</h3>
        <div className="mt-1.5 space-y-1">
          <MetaRow icon={<MapPin strokeWidth={1.5} />}>{area}</MetaRow>
          <MetaRow icon={<Clock strokeWidth={1.5} />}>{time}</MetaRow>
          {storedAt && !storedBox && <MetaRow icon={<Shield strokeWidth={1.5} />}>{storedAt}</MetaRow>}
        </div>
        {storedAt && storedBox && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-page px-3 py-2 text-[12px] text-muted">
            <Shield className="size-4 text-teal" strokeWidth={1.5} />
            Disimpan di: <span className="font-semibold text-ink">{storedAt}</span>
          </div>
        )}
        {note}
      </div>
      <Button variant="secondary" className="mt-3 w-full" arrow onClick={onClick}>
        Lihat Detail
      </Button>
    </div>
  )
}

export function ScoreRing({ value, size = 56, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2FF" strokeWidth={5} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#0000FF" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display font-bold text-primary" style={{ fontSize: size * 0.27 }}>
          {value}%
        </span>
        {label && <span className="mt-0.5 text-[10px] font-medium text-muted">{label}</span>}
      </div>
    </div>
  )
}

export function ReasonChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full bg-success/10 px-2.5 text-[12px] font-semibold text-success">
      <Check className="size-3.5" strokeWidth={2.5} />
      {children}
    </span>
  )
}

/** Kartu kandidat AI — hanya untuk kandidat milik pelapor. Skor adalah data simulasi. */
export function CandidateCard({ onClick, itemId = 'FI-T-26-0042' }: { onClick?: () => void; itemId?: string }) {
  const item = getItem(itemId)
  if (!item) return null
  return (
    <button onClick={onClick} className="block w-full rounded-2xl bg-white p-3 text-left shadow-card">
      <div className="flex gap-3">
        <img src={item.image} alt="" className="size-[72px] shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-semibold leading-snug">{item.name}</p>
          <MetaRow icon={<MapPin strokeWidth={1.5} />} className="mt-1">
            {item.location}
          </MetaRow>
        </div>
        <ScoreRing value={87} size={52} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <ReasonChip>Kategori sama</ReasonChip>
        <ReasonChip>Lokasi sama</ReasonChip>
        <ReasonChip>Warna sama</ReasonChip>
      </div>
      <p className="mt-2 text-[11px] text-muted">{SKOR_NOTE}</p>
    </button>
  )
}

/* ───────────── Tracker ───────────── */

export type TrackStep = { title: string; time?: string; desc?: string; state: 'done' | 'active' | 'todo'; color?: string }

export function Tracker({ steps }: { steps: TrackStep[] }) {
  return (
    <ol>
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        const color = s.color ?? '#0000FF'
        return (
          <li key={s.title} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span className={cx('absolute top-7 bottom-1 left-[13px] w-0.5 rounded-full', s.state === 'done' ? 'bg-success' : 'bg-line')} />
            )}
            {s.state === 'done' ? (
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <Check className="size-4" strokeWidth={3} />
              </span>
            ) : s.state === 'active' ? (
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color + '26' }}>
                <span className="size-3.5 rounded-full" style={{ backgroundColor: color }} />
              </span>
            ) : (
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-line bg-white">
                <span className="size-2 rounded-full bg-line" />
              </span>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cx('text-[14px] font-semibold', s.state === 'todo' && 'text-faint')} style={s.state === 'active' ? { color } : undefined}>
                  {s.title}
                </p>
                {s.time && <span className="shrink-0 text-[12px] tabular-nums text-muted">{s.time}</span>}
              </div>
              {s.desc && <p className={cx('mt-0.5 text-[13px] leading-[1.5]', s.state === 'todo' ? 'text-faint' : 'text-muted')}>{s.desc}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function MiniTracker({ active, done }: { active: number; done?: boolean }) {
  const labels = ['Dilaporkan', 'Kandidat', 'Verifikasi', 'Kembali']
  return (
    <div className="flex items-start">
      {labels.map((l, i) => {
        const state = done || i < active ? 'done' : i === active ? 'active' : 'todo'
        return (
          <div key={l} className="relative flex flex-1 flex-col items-center gap-1.5">
            {i > 0 && <span className={cx('absolute top-[9px] right-1/2 left-[-50%] h-0.5', state !== 'todo' ? 'bg-success' : 'bg-line')} style={{ marginRight: 10, marginLeft: 10 }} />}
            <span
              className={cx(
                'relative z-10 flex size-5 items-center justify-center rounded-full',
                state === 'done' && 'bg-success text-white',
                state === 'active' && 'bg-primary ring-4 ring-primary/15',
                state === 'todo' && 'border-2 border-line bg-white'
              )}
            >
              {state === 'done' && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={cx('text-[11px] font-semibold', state === 'active' ? 'text-primary' : state === 'done' ? 'text-ink' : 'text-faint')}>{l}</span>
          </div>
        )
      })}
    </div>
  )
}

export const REPORT_STEPS = ['Dilaporkan', 'Kandidat Ditemukan', 'Verifikasi', 'Kembali']

/* ───────────── Secret card ───────────── */

export function SecretCard({
  pink,
  title = 'Ciri Khusus / Rahasia',
  badge = 'Privat',
  text,
  value,
  placeholder = 'Tulis ciri yang hanya kamu tahu…',
  error,
  onAreaClick,
  onChange,
  icon,
}: {
  onChange?: (v: string) => void
  pink?: boolean
  title?: string
  badge?: string
  text?: string
  value?: string
  placeholder?: string
  error?: string
  onAreaClick?: () => void
  icon?: React.ReactNode
}) {
  return (
    <div className={cx('rounded-2xl border p-4', pink ? 'border-pink/25 bg-pink-soft' : 'border-yellow/70 bg-yellow-soft')}>
      <div className="flex items-center gap-3">
        <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-full', pink ? 'bg-pink/15 text-pink' : 'bg-yellow text-ink')}>
          {icon ?? <Shield className="size-5" strokeWidth={1.75} />}
        </span>
        <h3 className="min-w-0 flex-1 font-display text-[17px] font-semibold leading-tight">{title}</h3>
        <PrivatBadge>{badge}</PrivatBadge>
      </div>
      {text && <p className="mt-3 text-[13px] leading-[1.5] text-muted">{text}</p>}
      <div className="mt-3">
        <TextArea white value={value} placeholder={placeholder} error={error} onClick={onAreaClick} onChange={onChange} />
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-pink">
        <Lock className="size-3.5" strokeWidth={2} />
        Hanya petugas posko yang bisa membaca.
      </p>
    </div>
  )
}

/* ───────────── QR ───────────── */

export function QR({ size = 200, seed = 7, color = '#182631', center }: { size?: number; seed?: number; color?: string; center?: React.ReactNode }) {
  const n = 25
  const cells: [number, number][] = []
  let s = seed * 9301 + 49297
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rnd() > 0.52) cells.push([x, y])
  const u = size / n
  const F = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x * u} y={y * u} width={7 * u} height={7 * u} rx={u * 1.6} fill={color} />
      <rect x={(x + 1) * u} y={(y + 1) * u} width={5 * u} height={5 * u} rx={u} fill="#fff" />
      <rect x={(x + 2) * u} y={(y + 2) * u} width={3 * u} height={3 * u} rx={u * 0.6} fill={color} />
    </g>
  )
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x * u + 0.4} y={y * u + 0.4} width={u - 0.8} height={u - 0.8} rx={u * 0.25} fill={color} />
        ))}
        <F x={0} y={0} />
        <F x={n - 7} y={0} />
        <F x={0} y={n - 7} />
      </svg>
      {center && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white p-1">{center}</div>
        </div>
      )}
    </div>
  )
}

export function QRCard({ label, code, onCopy }: { label: string; code: string; onCopy?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl bg-white p-3 shadow-card">
        <QR size={196} center={<Logo size={36} />} />
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-blue-soft py-2 pr-2 pl-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-muted">{label}</p>
          <p className="font-mono text-[22px] font-bold text-primary">{code}</p>
        </div>
        <IconButton label="Salin" onClick={onCopy}>
          <Copy className="size-5 text-primary" strokeWidth={1.75} />
        </IconButton>
      </div>
    </div>
  )
}

/* ───────────── Overlays ───────────── */

export function Sheet({
  open,
  onClose,
  children,
  height,
  bottom = 0,
}: {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  height?: number
  /** Leave this much room at the bottom uncovered, e.g. for the bottom navigation. */
  bottom?: number
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-x-0 top-0 z-40 flex flex-col justify-end overflow-hidden" style={{ bottom }} initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
          <motion.div
            className="no-scrollbar relative max-h-[92%] overflow-y-auto rounded-t-[24px] bg-white px-4 pt-2 pb-6"
            style={height ? { minHeight: height } : undefined}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Modal({ open, onClose, children }: { open: boolean; onClose?: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-40 flex items-center justify-center px-6">
          <motion.button
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
          <motion.div
            className="relative w-full max-w-[340px] rounded-[20px] bg-white p-6 text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info'

export interface NotificationBannerProps {
  title?: string
  description: string
  variant?: NotificationVariant
  timestamp?: string
  onClose?: () => void
  className?: string
}

/**
 * iOS Notification Banner Style
 * Pengganti global seluruh komponen toast/snackbar di FoundIt Vokasi.
 * Mengadopsi visual iOS banner kartu putih dengan app icon, judul, deskripsi, dan timestamp.
 */
export function NotificationBanner({
  title,
  description,
  variant = 'info',
  timestamp = 'Sekarang',
  onClose,
  className,
}: NotificationBannerProps) {
  const config = {
    success: {
      defaultTitle: 'Berhasil',
      icon: <Check className="size-3.5" strokeWidth={3} />,
      badgeBg: 'bg-success/15 text-success ring-1 ring-success/20',
    },
    error: {
      defaultTitle: 'Gagal',
      icon: <AlertCircle className="size-3.5" strokeWidth={2.5} />,
      badgeBg: 'bg-danger/15 text-danger ring-1 ring-danger/20',
    },
    warning: {
      defaultTitle: 'Perhatian',
      icon: <TriangleAlert className="size-3.5" strokeWidth={2.5} />,
      badgeBg: 'bg-amber/15 text-amber ring-1 ring-amber/20',
    },
    info: {
      defaultTitle: 'Informasi',
      icon: <Info className="size-3.5" strokeWidth={2.5} />,
      badgeBg: 'bg-blue-soft text-primary ring-1 ring-primary/20',
    },
  }[variant]

  const displayTitle = title ?? config.defaultTitle

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        'w-full max-w-[366px] overflow-hidden rounded-[16px] bg-white p-3.5 shadow-[0_10px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-all',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Logo Resmi FoundIt Vokasi di sisi kiri */}
        <div className="shrink-0 pt-0.5">
          <Logo size={28} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Header notifikasi: Nama Aplikasi · Timestamp + Status Badge / Close */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-[12px] font-semibold text-ink">FoundIt Vokasi</span>
              <span className="text-[10px] text-muted/60">·</span>
              <span className="shrink-0 text-[11px] text-muted">{timestamp}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className={cx('flex size-5 items-center justify-center rounded-full', config.badgeBg)}>
                {config.icon}
              </span>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup notifikasi"
                  className="flex size-5 items-center justify-center rounded-full text-muted transition hover:bg-line/60 hover:text-ink focus:outline-none"
                >
                  <X className="size-3" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* Judul & Deskripsi Notifikasi */}
          <div className="mt-1">
            {displayTitle && (
              <p className="font-display text-[13.5px] font-bold leading-snug text-ink">{displayTitle}</p>
            )}
            <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Backward compatibility: Toast delegasi ke iOS NotificationBanner */
export function Toast({
  text,
  className,
  variant,
  title,
}: {
  text: string
  className?: string
  variant?: NotificationVariant
  title?: string
}) {
  return (
    <NotificationBanner
      title={title}
      description={text}
      variant={variant}
      className={className}
    />
  )
}

/** Menyalin teks ke clipboard jika didukung di browser. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }
  return false
}

/** Berbagi konten via Web Share API atau fallback ke Clipboard jika tidak didukung. */
export async function shareOrCopy(payload: { title: string; text: string; url?: string }): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload)
      return 'shared'
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'failed'
      }
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      const full = payload.text + (payload.url ? `\n${payload.url}` : '')
      await navigator.clipboard.writeText(full)
      return 'copied'
    } catch {
      return 'failed'
    }
  }
  return 'failed'
}

/* ───────────── Empty state ───────────── */

export function EmptyState({
  img,
  illustration,
  title,
  text,
  children,
}: {
  img?: string
  illustration?: React.ReactNode
  title: string
  text: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      {illustration ?? <img src={img ?? IMG.kosong} alt="" className="size-40 rounded-3xl object-cover mix-blend-multiply" />}
      <h2 className="mt-4 font-display text-[20px] font-bold">{title}</h2>
      <p className="mt-2 max-w-[300px] text-[14px] leading-[1.5] text-muted">{text}</p>
      {children && <div className="mt-6 flex w-full flex-col gap-3">{children}</div>}
    </div>
  )
}

/* ───────────── Drop point card ───────────── */

export function DropPointCard({
  name,
  type,
  hours,
  open = true,
  openLabel,
  desc,
  services,
  disabled,
  onClick,
  arrow = true,
}: {
  name: string
  type: 'Posko Utama' | 'Titik Satelit'
  hours?: string
  open?: boolean
  openLabel?: string
  desc?: string
  services?: string[]
  disabled?: boolean
  onClick?: () => void
  arrow?: boolean
  key?: React.Key
}) {
  return (
    <button
      onClick={onClick}
      className={cx('flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-card', disabled && 'opacity-70 shadow-none ring-1 ring-line')}
    >
      <IconCircle tone={disabled ? 'gray' : type === 'Posko Utama' ? 'blue' : 'gray'} size={44}>
        <Building2 className={cx('size-5', !disabled && type === 'Titik Satelit' && 'text-teal')} strokeWidth={1.5} />
      </IconCircle>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[16px] font-semibold">{name}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {!disabled && <StatusBadge label={type} color={type === 'Posko Utama' ? '#0000FF' : '#0891B2'} dot={false} />}
          {disabled ? <StatusBadge label="Sedang tidak melayani" /> : <StatusBadge label={openLabel ?? (open ? 'Buka' : 'Tutup')} color={open ? '#16A34A' : '#94A3B8'} />}
        </div>
        {hours && <MetaRow icon={<Clock strokeWidth={1.5} />} className="mt-2">{hours}</MetaRow>}
        {desc && <p className="mt-1 text-[12px] leading-[1.5] text-muted">{desc}</p>}
        {services && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {services.map((s) => (
              <React.Fragment key={s}>
                <Pill tone="blue">{s}</Pill>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      {arrow && <ArrowRight className={cx('mt-3 size-5 shrink-0', disabled ? 'text-faint' : 'text-muted')} strokeWidth={1.5} />}
    </button>
  )
}

/* ───────────── Bottom navigation ───────────── */

type NavKey = 'beranda' | 'temuan' | 'laporan' | 'notifikasi' | 'titik' | 'masuk' | 'none'

export function BottomNav({
  variant = 'civitas',
  active = 'beranda',
  notif = true,
  pressed,
  onAction,
}: {
  variant?: 'civitas' | 'tamu'
  active?: NavKey
  notif?: boolean
  pressed?: boolean
  onAction?: Act
}) {
  const items: { key: NavKey; label: string; icon: React.ElementType }[] =
    variant === 'civitas'
      ? [
          { key: 'beranda', label: 'Beranda', icon: House },
          { key: 'temuan', label: 'Temuan', icon: Search },
          { key: 'laporan', label: 'Laporan', icon: FileText },
          { key: 'notifikasi', label: 'Notifikasi', icon: Bell },
        ]
      : [
          { key: 'beranda', label: 'Beranda', icon: House },
          { key: 'temuan', label: 'Temuan', icon: Search },
          { key: 'titik', label: 'Titik', icon: MapPin },
          { key: 'masuk', label: 'Masuk', icon: LogIn },
        ]
  const Item = ({ it }: { it: (typeof items)[number] }) => {
    const on = active === it.key
    const I = it.icon
    return (
      <button onClick={() => onAction?.('nav:' + it.key)} className={cx('relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5', on ? 'text-primary' : 'text-muted')}>
        <span className="relative">
          <I className="size-6" strokeWidth={1.5} />
          {it.key === 'notifikasi' && notif && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-pink ring-2 ring-white" />}
        </span>
        <span className="text-[11px] font-semibold">{it.label}</span>
        <span className={cx('size-1 rounded-full', on ? 'bg-primary' : 'bg-transparent')} />
      </button>
    )
  }
  return (
    <nav className={cx('relative shrink-0 border-t border-line bg-white px-2 pb-4', pressed ? 'z-50' : 'z-30')}>
      <div className="flex items-end">
        <Item it={items[0]} />
        <Item it={items[1]} />
        <div className="flex flex-1 flex-col items-center">
          <button
            onClick={() => onAction?.('nav:lapor')}
            aria-label="Lapor"
            className={cx(
              'relative -mt-4 flex size-14 items-center justify-center rounded-full bg-yellow text-ink shadow-[0_4px_16px_rgba(24,38,49,0.18)] ring-4 ring-white transition-transform duration-150 ease-out active:scale-95',
              pressed && 'z-50 scale-95'
            )}
          >
            {pressed ? <X className="size-7" strokeWidth={2} /> : <Plus className="size-7" strokeWidth={2} />}
          </button>
          <span className="mt-0.5 text-[11px] font-semibold text-ink">Lapor</span>
          <span className="size-1" />
        </div>
        <Item it={items[2]} />
        <Item it={items[3]} />
      </div>
    </nav>
  )
}

/* ───────────── Foto formulir (simulasi) ───────────── */

/** Penanda foto simulasi: prototipe tidak mengunggah file sungguhan. */
export const SIMULATED_PHOTO = 'simulasi:foto'

/** Pratinjau foto formulir. Foto simulasi tampil sebagai ubin netral. */
export function PhotoTile({ src, className }: { src: string; className?: string }) {
  if (src === SIMULATED_PHOTO) {
    return (
      <div className={cx('flex flex-col items-center justify-center gap-1 bg-blue-soft text-primary', className)}>
        <ImagePlus className="size-6" strokeWidth={1.5} />
        <span className="px-2 text-center text-[11px] font-semibold">Foto terlampir</span>
      </div>
    )
  }
  return <img src={src} alt="" className={cx('object-cover', className)} />
}
