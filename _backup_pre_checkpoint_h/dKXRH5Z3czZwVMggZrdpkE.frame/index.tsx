import React, { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Globe, GraduationCap, KeyRound, Lock, Mail, TriangleAlert } from 'lucide-react'
import { BrandLockup, Button, Checkbox, Field, IconCircle, InfoBox, Logo, Screen, Sheet, TextLink, type Act } from '../shared/foundit/ui'
import { IMG } from '../shared/foundit/data'

export const args = {
  state: 'default',
  sheet: 'none',
  email: 'rara.anindya-2023@vokasi.unair.ac.id',
}

export const argTypes = {
  state: { control: 'radio', options: ['default', 'error'] },
  sheet: { control: 'radio', options: ['none', 'lupa-kata-sandi'] },
  email: { control: 'text' },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function Masuk(props: Props) {
  const { state, sheet, email, onAction } = { ...args, ...props }
  const error = state === 'error'
  const [emailVal, setEmailVal] = useState(email)
  const [passwordVal, setPasswordVal] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  return (
    <Screen
      overlay={
        <Sheet open={sheet === 'lupa-kata-sandi'} onClose={() => onAction?.('tutup')}>
          <div className="flex flex-col items-center text-center">
            <IconCircle tone="blue" size={64}>
              <KeyRound className="size-7" strokeWidth={1.5} />
            </IconCircle>
            <h2 className="mt-4 font-display text-[20px] font-bold">Lupa kata sandi?</h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-muted">
              Kata sandi FoundIt sama dengan akun UNAIR kamu. Atur ulang lewat Cybercampus atau hubungi helpdesk Fakultas Vokasi.
            </p>
            <Button className="mt-6 w-full" onClick={() => onAction?.('tutup')}>
              Mengerti
            </Button>
          </div>
        </Sheet>
      }
    >
      <div className="px-4 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <BrandLockup />
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-medium shadow-card">
            <GraduationCap className="size-4 text-primary" strokeWidth={1.5} />
            Fakultas Vokasi • Universitas Airlangga
          </span>
          <div className="relative mt-6">
            <Logo size={72} />
            <span className="absolute -right-1 -bottom-1 size-4 rounded-full bg-success ring-4 ring-page" />
          </div>
          <h1 className="mt-5 font-display text-[24px] font-bold leading-tight">Selamat Datang di FoundIt Vokasi</h1>
          <p className="mt-2 text-[14px] leading-[1.5] text-muted">Masuk untuk melapor, mengklaim, dan memantau barangmu.</p>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-card">
          {error && (
            <InfoBox tone="red" icon={<TriangleAlert strokeWidth={1.75} />} className="mb-4">
              Email atau kata sandi salah. Periksa lagi atau atur ulang kata sandi lewat Cybercampus.
            </InfoBox>
          )}
          <div className="space-y-4">
            <Field
              label="Email UNAIR"
              icon={<Mail strokeWidth={1.5} />}
              value={emailVal}
              onChange={setEmailVal}
              placeholder="nama@vokasi.unair.ac.id"
              state={error ? 'error' : 'filled'}
            />
            <Field
              label="Kata Sandi"
              icon={<Lock strokeWidth={1.5} />}
              type={showPassword ? 'text' : 'password'}
              value={error ? '' : passwordVal}
              onChange={setPasswordVal}
              placeholder="Masukkan kata sandi"
              state={error ? 'error' : 'filled'}
              trailing={
                <button
                  type="button"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowPassword((prev) => !prev)
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:text-ink focus:outline-none"
                >
                  {showPassword ? <EyeOff className="size-5" strokeWidth={1.5} /> : <Eye className="size-5" strokeWidth={1.5} />}
                </button>
              }
            />
          </div>
          <p className="mt-2 text-[12px] text-muted">Gunakan email dan kata sandi akun UNAIR kamu.</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <Checkbox checked={rememberMe} onClick={() => setRememberMe((prev) => !prev)}>
                Ingat saya di perangkat ini
              </Checkbox>
            </div>
            <TextLink onClick={() => onAction?.('lupa')} className="shrink-0 text-[13px]">
              Lupa kata sandi?
            </TextLink>
          </div>
          <Button className="mt-3 w-full" arrow onClick={() => onAction?.('masuk')}>
            Masuk
          </Button>
          <div className="my-4 flex items-center gap-3 text-[12px] text-faint">
            <span className="h-px flex-1 bg-line" />
            atau
            <span className="h-px flex-1 bg-line" />
          </div>
          <Button variant="secondary" className="w-full" icon={<Globe className="size-5" strokeWidth={1.5} />} onClick={() => onAction?.('tamu')}>
            Masuk sebagai Tamu
          </Button>
          <p className="mt-2 text-center text-[12px] text-muted">Tamu bisa melihat barang temuan dan titik penitipan.</p>
        </div>

        <button onClick={() => onAction?.('posko')} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-blue-soft p-3 text-left">
          <img src={IMG.gedung} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold">
              <span className="size-2 rounded-full bg-success" />
              Posko Dekanat Lt. 1 buka hari ini
            </p>
            <p className="mt-0.5 text-[12px] text-muted">Senin-Jumat, 07.00-18.00 WIB</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-primary" strokeWidth={1.5} />
        </button>
      </div>
    </Screen>
  )
}
