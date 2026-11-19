import React, { useEffect, useState } from 'react'
import { BookOpen, ChevronRight, Headphones, Info, Lock, LogOut, MessageCircle, User } from 'lucide-react'
import { BottomNav, Button, Card, CardTitle, Field, IconCircle, Modal, PageHeader, Screen, Sheet, TextLink, Toggle, type Act } from '../shared/foundit/ui'
import { IMG, USERS, getContact, maskPhone, reportsOf, updateContact, type UserKey } from '../shared/foundit/data'

export const args = {
  modal: 'none',
  pengguna: 'rara',
}

export const argTypes = {
  modal: { control: 'radio', options: ['none', 'keluar-akun'] },
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function Profil(props: Props) {
  const { modal, onAction } = { ...args, ...props }
  const userKey = (props.pengguna ?? args.pengguna) as UserKey
  const user = USERS[userKey]
  const [sheetUbah, setSheetUbah] = useState(false)
  const [phoneDraft, setPhoneDraft] = useState(() => getContact(userKey))
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [, setPhoneVersion] = useState(0)

  useEffect(() => {
    setPhoneDraft(getContact(userKey))
    setPhoneError(null)
  }, [userKey])

  const { lost, found } = reportsOf(userKey)
  const currentPhone = getContact(userKey)

  return (
    <Screen
      nav={<BottomNav active="none" onAction={onAction} />}
      overlay={
        <>
          <Modal open={modal === 'keluar-akun'} onClose={() => onAction?.('tutup')}>
            <div className="flex justify-center">
              <IconCircle tone="red" size={64}>
                <LogOut className="size-7" strokeWidth={1.75} />
              </IconCircle>
            </div>
            <h2 className="mt-4 font-display text-[20px] font-bold">Keluar dari akun?</h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-muted">Kamu bisa masuk lagi kapan saja dengan akun UNAIR.</p>
            <Button variant="danger-solid" className="mt-5 w-full" onClick={() => onAction?.('keluar-ya')}>
              Keluar
            </Button>
            <TextLink tone="muted" className="w-full" onClick={() => onAction?.('tutup')}>
              Batal
            </TextLink>
          </Modal>

          <Sheet open={sheetUbah} onClose={() => { setSheetUbah(false); setPhoneError(null); }}>
            <h2 className="font-display text-[20px] font-bold">Ubah Nomor WhatsApp</h2>
            <p className="mt-1 text-[13px] leading-[1.5] text-muted">
              Petugas menggunakan nomor ini untuk koordinasi penyerahan barang dan notifikasi tindak lanjut.
            </p>
            <div className="mt-4 space-y-3">
              <Field
                label="Nomor WhatsApp"
                icon={<MessageCircle strokeWidth={1.5} />}
                value={phoneDraft}
                onChange={(v) => {
                  setPhoneDraft(v)
                  if (phoneError) setPhoneError(null)
                }}
                placeholder="081234567890"
                state={phoneError ? 'error' : 'filled'}
                error={phoneError ?? undefined}
                hint="Gunakan format nomor seluler Indonesia (contoh: 081234567890)"
              />
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => {
                  const res = updateContact(userKey, phoneDraft)
                  if (!res.ok) {
                    setPhoneError(res.error ?? 'Nomor tidak valid')
                    return
                  }
                  setPhoneVersion((v) => v + 1)
                  setSheetUbah(false)
                  onAction?.('simpan-kontak')
                }}
              >
                Simpan Nomor
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setPhoneDraft(getContact(userKey))
                  setPhoneError(null)
                  setSheetUbah(false)
                }}
              >
                Batal
              </Button>
            </div>
          </Sheet>
        </>
      }
    >
      <PageHeader title="Profil" onBack={() => onAction?.('kembali')} />
      <div className="space-y-4 px-4 pt-1 pb-6">
        <div className="rounded-2xl bg-primary p-5 text-white shadow-card">
          <div className="flex items-center gap-4">
            {userKey === 'rara' ? (
              <img src={IMG.rara} alt="Rara" className="size-[72px] shrink-0 rounded-full object-cover ring-[3px] ring-white" />
            ) : (
              <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-white/20 text-white ring-[3px] ring-white">
                <User className="size-9" strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display text-[20px] font-bold leading-tight">{user?.name ?? 'Civitas Vokasi'}</p>
              <p className="mt-1 text-[12px] text-white/85">
                {user?.nim ? `${user.nim} · ${user.prodi ?? 'Fakultas Vokasi'}` : 'Fakultas Vokasi'}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-white/85">{`${userKey}@vokasi.unair.ac.id`}</p>
            </div>
          </div>
          <span className="mt-4 inline-flex h-7 items-center rounded-full bg-white/20 px-3 text-[12px] font-semibold">Civitas UNAIR</span>
        </div>
        <p className="-mt-1 flex items-center gap-1.5 px-1 text-[12px] text-muted">
          <Lock className="size-3.5" strokeWidth={1.75} />
          Data dari akun UNAIR, tidak bisa diubah di sini.
        </p>

        <Card>
          <CardTitle>Kontak</CardTitle>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
              <MessageCircle className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-muted">Nomor WhatsApp</p>
              <p className="text-[14px] font-semibold tabular-nums">{maskPhone(currentPhone)}</p>
            </div>
            <TextLink
              className="text-[13px]"
              onClick={() => {
                setPhoneDraft(getContact(userKey))
                setPhoneError(null)
                setSheetUbah(true)
              }}
            >
              Ubah
            </TextLink>
          </div>
        </Card>

        <Card>
          <CardTitle>Aktivitasku</CardTitle>
          <div className="grid grid-cols-2 divide-x divide-line">
            <div className="pr-4">
              <p className="font-display text-[28px] font-bold text-primary">{lost.length}</p>
              <p className="text-[13px] text-muted">Laporan kehilangan</p>
            </div>
            <div className="pl-4">
              <p className="font-display text-[28px] font-bold text-ink">{found.length}</p>
              <p className="text-[13px] text-muted">Laporan temuan</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Notifikasi</CardTitle>
          <div className="divide-y divide-line">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <span className="text-[14px]">Notifikasi aplikasi</span>
              <Toggle on />
            </div>
            <div className="flex items-center justify-between py-3 last:pb-0">
              <span className="text-[14px]">Kabar lewat WhatsApp</span>
              <Toggle on />
            </div>
          </div>
        </Card>

        <div className="divide-y divide-line rounded-2xl bg-white shadow-card">
          <MenuRow icon={<BookOpen strokeWidth={1.5} />} label="Panduan" onClick={() => onAction?.('panduan')} />
          <MenuRow icon={<Headphones strokeWidth={1.5} />} label="Hubungi Posko" onClick={() => onAction?.('hubungi-posko')} />
          <MenuRow icon={<Info strokeWidth={1.5} />} label="Tentang FoundIt Vokasi" sub="Versi 1.0" />
        </div>

        <Button variant="danger" className="w-full" icon={<LogOut className="size-5" strokeWidth={1.75} />} onClick={() => onAction?.('keluar')}>
          Keluar
        </Button>
      </div>
    </Screen>
  )
}

function MenuRow({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left">
      <span className="text-primary [&>svg]:size-5">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{label}</span>
        {sub && <span className="block text-[12px] text-muted">{sub}</span>}
      </span>
      <ChevronRight className="size-5 text-muted" strokeWidth={1.5} />
    </button>
  )
}
