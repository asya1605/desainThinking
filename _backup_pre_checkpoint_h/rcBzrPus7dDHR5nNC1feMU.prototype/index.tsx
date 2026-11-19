import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Splash from '../2D9dixQHD18pLKzX546hpX.frame'
import Masuk from '../dKXRH5Z3czZwVMggZrdpkE.frame'
import Beranda from '../rBc4FigYu9kEM4jXhNFqqA.frame'
import Pencarian from '../o52f3iEairFE198ZrxsvGJ.frame'
import DaftarTemuan from '../4EJsRf58QpvxogGMGcFMQd.frame'
import DetailBarang from '../q3NVhoHN9AdFF5tUk4ENfq.frame'
import LaporKehilangan from '../7rD6YFMeyHbTdYKoGVn1Qi.frame'
import Mencocokkan from '../gBoZXscdQWCDVUhHk9jpFQ.frame'
import LaporanTerkirim from '../pkCsapNA1KJaBt1CZuPmoo.frame'
import LaporTemuan from '../2716PmrmGz9BvA6eQCxciH.frame'
import KodePenitipan from '../9rvHDd6EK1RvHjrFrxWg3j.frame'
import Bandingkan from '../8dgbba3VbXTwkvJJYbst2t.frame'
import FormKlaim from '../sMRGdVv9Kr3pejx8xAw1xV.frame'
import StatusKlaim from '../9cSSDNLSkNbDMDwmkwNkzm.frame'
import LaporanSaya from '../xtGrgg2GQc3JRG4AZ42Bz3.frame'
import DetailLaporan from '../ithaTU8k81a2YNuECYrcnJ.frame'
import Notifikasi from '../kk36SbXkEryv5v45QH6wWr.frame'
import TitikPenitipan from '../5eT5cShK2SZtYCRL2BX6X1.frame'
import DetailTitik from '../iv2XuX2PhGxT5EsY1vBrZb.frame'
import Profil from '../fFFwL92NGXegEMY7mwsgT9.frame'
import { Toast, shareOrCopy } from '../shared/foundit/ui'
import { CLAIMS, DROP_POINTS, FOUND_REPORTS, candidatesFor, claimStage, claimsOf, getItem, relatedLostReport, type DropPointKey, type UserKey } from '../shared/foundit/data'
import {
  EMPTY_FOUND,
  EMPTY_LOST,
  FAJAR_CLAIM_DRAFT,
  RARA_LOST_DRAFT,
  SALSABILA_FOUND_DRAFT,
  emptyClaim,
  type ClaimForm,
  type FoundForm,
  type LostForm,
} from '../shared/foundit/forms'
import {
  hideCandidate,
  markAllRead,
  markRead,
  setSchedule,
  submitCandidateClaim,
  submitDirectClaim,
  submitEvidence,
  submitFound,
  submitLost,
} from '../shared/foundit/store'
import { targetExists, type Notif } from '../shared/foundit/notifications'

export const viewport = 'mobile'

export const folders = [
  { id: 'masuk', name: 'Pengenalan & Masuk', frames: ['2D9dixQHD18pLKzX546hpX', 'dKXRH5Z3czZwVMggZrdpkE'] },
  {
    id: 'telusuri',
    name: 'Beranda & Telusuri',
    frames: ['rBc4FigYu9kEM4jXhNFqqA', 'o52f3iEairFE198ZrxsvGJ', '4EJsRf58QpvxogGMGcFMQd', 'q3NVhoHN9AdFF5tUk4ENfq'],
  },
  {
    id: 'lapor',
    name: 'Lapor Kehilangan & Temuan',
    frames: ['7rD6YFMeyHbTdYKoGVn1Qi', 'gBoZXscdQWCDVUhHk9jpFQ', 'pkCsapNA1KJaBt1CZuPmoo', '2716PmrmGz9BvA6eQCxciH', '9rvHDd6EK1RvHjrFrxWg3j'],
  },
  { id: 'klaim', name: 'Kandidat & Klaim', frames: ['8dgbba3VbXTwkvJJYbst2t', 'sMRGdVv9Kr3pejx8xAw1xV', '9cSSDNLSkNbDMDwmkwNkzm'] },
  { id: 'laporan', name: 'Laporan Saya', frames: ['xtGrgg2GQc3JRG4AZ42Bz3', 'ithaTU8k81a2YNuECYrcnJ'] },
  {
    id: 'lainnya',
    name: 'Notifikasi, Titik & Profil',
    frames: ['kk36SbXkEryv5v45QH6wWr', '5eT5cShK2SZtYCRL2BX6X1', 'iv2XuX2PhGxT5EsY1vBrZb', 'fFFwL92NGXegEMY7mwsgT9'],
  },
]

const FRAMES = {
  splash: Splash,
  masuk: Masuk,
  beranda: Beranda,
  pencarian: Pencarian,
  daftar: DaftarTemuan,
  detail: DetailBarang,
  laporKehilangan: LaporKehilangan,
  mencocokkan: Mencocokkan,
  terkirim: LaporanTerkirim,
  laporTemuan: LaporTemuan,
  kode: KodePenitipan,
  bandingkan: Bandingkan,
  formKlaim: FormKlaim,
  statusKlaim: StatusKlaim,
  laporanSaya: LaporanSaya,
  detailLaporan: DetailLaporan,
  notifikasi: Notifikasi,
  titik: TitikPenitipan,
  detailTitik: DetailTitik,
  profil: Profil,
} as const

type Key = keyof typeof FRAMES
type P = Record<string, string | number>
type Route = { f: Key; p?: P }

const BY_ID: Record<string, Key> = {
  '2D9dixQHD18pLKzX546hpX': 'splash',
  'dKXRH5Z3czZwVMggZrdpkE': 'masuk',
  'rBc4FigYu9kEM4jXhNFqqA': 'beranda',
  'o52f3iEairFE198ZrxsvGJ': 'pencarian',
  '4EJsRf58QpvxogGMGcFMQd': 'daftar',
  'q3NVhoHN9AdFF5tUk4ENfq': 'detail',
  '7rD6YFMeyHbTdYKoGVn1Qi': 'laporKehilangan',
  'gBoZXscdQWCDVUhHk9jpFQ': 'mencocokkan',
  'pkCsapNA1KJaBt1CZuPmoo': 'terkirim',
  '2716PmrmGz9BvA6eQCxciH': 'laporTemuan',
  '9rvHDd6EK1RvHjrFrxWg3j': 'kode',
  '8dgbba3VbXTwkvJJYbst2t': 'bandingkan',
  'sMRGdVv9Kr3pejx8xAw1xV': 'formKlaim',
  '9cSSDNLSkNbDMDwmkwNkzm': 'statusKlaim',
  'xtGrgg2GQc3JRG4AZ42Bz3': 'laporanSaya',
  'ithaTU8k81a2YNuECYrcnJ': 'detailLaporan',
  'kk36SbXkEryv5v45QH6wWr': 'notifikasi',
  '5eT5cShK2SZtYCRL2BX6X1': 'titik',
  'iv2XuX2PhGxT5EsY1vBrZb': 'detailTitik',
  'fFFwL92NGXegEMY7mwsgT9': 'profil',
}

const GUEST_OK: Key[] = ['splash', 'masuk', 'beranda', 'pencarian', 'daftar', 'detail', 'titik', 'detailTitik']

export const args = {
  isianForm: 'draf-demo',
  pengguna: 'rara',
}

export const argTypes = {
  isianForm: { control: 'radio', options: ['draf-demo', 'kosong'] },
  /** Akun Civitas yang sedang masuk (demo). Menentukan jalur klaim dan siapa pemilik laporan. */
  pengguna: { control: 'select', options: ['rara', 'fajar', 'rizky', 'salsabila'] },
}

type Props = Partial<typeof args> & { start?: string }

export default function FoundItVokasi(props: Props) {
  const { start, isianForm } = { ...args, ...props }
  const pengguna = (props.pengguna ?? args.pengguna) as UserKey
  const freshClaim = (itemId: string) =>
    isianForm !== 'kosong' && itemId === FAJAR_CLAIM_DRAFT.itemId ? FAJAR_CLAIM_DRAFT : emptyClaim(itemId)
  const [claimForm, setClaimForm] = useState<ClaimForm>(() => freshClaim(FAJAR_CLAIM_DRAFT.itemId))
  const freshLost = () => (isianForm === 'kosong' ? EMPTY_LOST : RARA_LOST_DRAFT)
  const freshFound = () => (isianForm === 'kosong' ? EMPTY_FOUND : SALSABILA_FOUND_DRAFT)
  // Isian formulir dipegang di sini supaya tidak hilang saat berpindah tahap.
  const [lostForm, setLostForm] = useState<LostForm>(freshLost)
  const [foundForm, setFoundForm] = useState<FoundForm>(freshFound)
  useEffect(() => {
    setLostForm(freshLost())
    setFoundForm(freshFound())
  }, [isianForm])

  const [stack, setStack] = useState<Route[]>(() => [{ f: (start && BY_ID[start]) || 'splash' }])
  const [guest, setGuest] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [notifVersion, setNotifVersion] = useState(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  const route = stack[stack.length - 1]
  const p: P = route.p ?? {}

  // Tamu hanya boleh membuka halaman publik. Halaman Civitas diganti dengan
  // sheet instruksi ke pos petugas, jadi tidak ada celah navigasi.
  const guard = (r: Route): Route =>
    guest && !GUEST_OK.includes(r.f) ? { f: 'beranda', p: { akun: 'tamu', sheet: 'fitur-lapor-tamu' } } : r
  const go = (f: Key, props?: P) => setStack((s) => [...s, guard({ f, p: props })])
  const replace = (f: Key, props?: P) => setStack((s) => [...s.slice(0, -1), guard({ f, p: props })])
  const reset = (f: Key, props?: P) => setStack([{ f, p: props }])
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  // Kembali ke tahap formulir yang sudah dilewati, tanpa menumpuk riwayat.
  const backTo = (f: Key, state: string) =>
    setStack((s) => {
      const i = s.map((r) => r.f === f && r.p?.state === state).lastIndexOf(true)
      return i >= 0 ? s.slice(0, i + 1) : [...s.slice(0, -1), { f, p: { state } }]
    })
  // Buang semua layar `f` di puncak riwayat (mis. tahap form/overlay), lalu buka `next`.
  const leave = (f: Key, next?: Route) =>
    setStack((s) => {
      let i = s.length
      while (i > 0 && s[i - 1].f === f) i--
      const rest = s.slice(0, i)
      const out = next ? [...rest, next] : rest
      return out.length ? out : [{ f: 'beranda', p: { akun: 'civitas' } }]
    })
  const showToast = (t: string) => {
    clearTimeout(toastTimer.current)
    setToast(t)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }

  // Layar pencocokan otomatis lanjut setelah 2 detik.
  useEffect(() => {
    if (route.f !== 'mencocokkan') return
    const id = String(route.p?.reportId ?? '')
    const state = candidatesFor(id).length ? 'ada-kandidat' : 'belum-ada-kandidat'
    const t = setTimeout(() => replace('terkirim', { state, reportId: id }), 2000)
    return () => clearTimeout(t)
  }, [route])

  const idOf = (a: string) => a.slice(a.indexOf(':') + 1)
  const civ = guest ? { akun: 'tamu' } : { akun: 'civitas' }

  function onAction(a: string) {
    // Navigasi global
    if (a.startsWith('nav:')) {
      const n = a.slice(4)
      if (guest) {
        if (n === 'beranda') return reset('beranda', { akun: 'tamu' })
        if (n === 'temuan') return go('daftar', { akun: 'tamu' })
        if (n === 'lapor') {
          if (p.sheet === 'fitur-lapor-tamu') return back()
          return go('beranda', { akun: 'tamu', sheet: 'fitur-lapor-tamu' })
        }
        if (n === 'titik') return go('titik', { akun: 'tamu' })
        if (n === 'masuk') return reset('masuk')
      } else {
        if (n === 'beranda') return reset('beranda', { akun: 'civitas' })
        if (n === 'temuan') return go('daftar')
        if (n === 'lapor') {
          if (p.sheet === 'pilih-laporan') return back()
          return go('beranda', { akun: 'civitas', sheet: 'pilih-laporan' })
        }
        if (n === 'laporan') return go('laporanSaya', { tab: 'kehilangan', filter: 'aktif' })
        if (n === 'notifikasi') return go('notifikasi')
      }
      return
    }
    if (a === 'header:bantuan') return go('titik', { tab: 'panduan', ...civ })
    if (a === 'header:profil') return go('profil')
    if (a === 'header:masuk') return reset('masuk')
    if (a === 'tutup') return back()

    switch (route.f) {
      case 'splash': {
        const page = Number(p.page ?? 1)
        if (a === 'lanjut') return go('splash', { page: page + 1 })
        if (a === 'lewati' || a === 'mulai') return reset('masuk')
        return
      }
      case 'masuk': {
        if (a === 'masuk') return setGuest(false), reset('beranda', { akun: 'civitas' })
        if (a === 'tamu') return setGuest(true), reset('beranda', { akun: 'tamu' })
        if (a === 'lupa') return go('masuk', { ...p, sheet: 'lupa-kata-sandi' })
        if (a === 'posko') return go('detailTitik', { pointKey: 'posko', ...civ })
        if (a === 'isian-sandi' && p.state !== 'error') return replace('masuk', { state: 'error' })
        return
      }
      case 'beranda': {
        const tamu = p.akun === 'tamu'
        if (a === 'pilih:kehilangan') return replace('laporKehilangan', { state: 'langkah-1' })
        if (a === 'pilih:menemukan') return replace('laporTemuan', { state: 'langkah-1' })
        if (a === 'lihat-titik' || a === 'titik' || a === 'tamu-posko') return go('titik', civ)
        if (a === 'masuk' || a === 'banner-masuk') return reset('masuk')
        if (a === 'cari') return go('pencarian', { state: 'riwayat', ...civ })
        if (a === 'lihat-semua') return go('daftar', civ)
        if (a.startsWith('barang:')) return go('detail', { itemId: idOf(a), ...civ })
        if (tamu) {
          if (a === 'kehilangan' || a === 'menemukan') return go('beranda', { akun: 'tamu', sheet: 'fitur-lapor-tamu' })
          return
        }
        if (a === 'lonceng') return go('notifikasi')
        if (a === 'kehilangan') return go('laporKehilangan', { state: 'langkah-1' })
        if (a === 'menemukan') return go('laporTemuan', { state: 'langkah-1' })
        if (a.startsWith('laporan-aktif:')) {
          const id = idOf(a)
          if (id.startsWith('FI-K')) {
            const c = CLAIMS[id]
            const s = c ? (claimStage(c) === 'tiket-siap' ? 'tiket-siap' : claimStage(c)) : 'menunggu-verifikasi'
            return go('statusKlaim', { claimId: id, state: s })
          }
          if (id.startsWith('FI-L') || id.startsWith('FI-T')) {
            return go('detailLaporan', { laporanId: id })
          }
          return go('laporanSaya', { tab: 'kehilangan', filter: 'aktif' })
        }
        if (a === 'laporan-aktif') {
          // Tiket milik akun aktif, jika ada; jika tidak, ke Laporan Saya.
          const t = claimsOf(pengguna).find((c) => claimStage(c) === 'tiket-siap')
          return t ? go('statusKlaim', { claimId: t.id, state: 'tiket-siap' }) : go('laporanSaya', { tab: 'kehilangan', filter: 'aktif' })
        }
        return
      }
      case 'pencarian': {
        if (a === 'kembali') return back()
        if (a === 'riwayat:tumbler' || a === 'kategori:Botol & Wadah Minum') return go('pencarian', { state: 'hasil', ...civ })
        if (a === 'riwayat:kunci') return go('pencarian', { state: 'tidak-ditemukan', ...civ })
        if (a.startsWith('hasil:')) return go('detail', { itemId: idOf(a), ...civ })
        if (a === 'filter') return go('daftar', { ...civ, sheet: 'filter' })
        if (a === 'buat-laporan') return guest ? go('beranda', { akun: 'tamu', sheet: 'fitur-lapor-tamu' }) : go('laporKehilangan', { state: 'langkah-1' })
        return
      }
      case 'daftar': {
        const tamu = p.akun === 'tamu'
        if (a === 'kembali') return back()
        if (a === 'cari') return go('pencarian', { state: 'riwayat', ...civ })
        if (a === 'filter') return go('daftar', { ...p, sheet: 'filter' })
        if (a === 'judul') return go('daftar', { ...p, state: 'gagal-memuat' })
        if (a === 'coba-lagi' || a === 'reset-filter') return replace('daftar', { akun: p.akun ?? 'civitas', state: 'default' })
        if (a === 'chip:Kunci') return replace('daftar', { akun: p.akun ?? 'civitas', state: 'filter-kosong' })
        if (a === 'tampilkan' || a === 'reset') return back()
        if (a.startsWith('barang:')) {
          return go('detail', { itemId: idOf(a), ...civ })
        }
        if (a === 'lapor' || a === 'buat-laporan') return tamu ? go('beranda', { akun: 'tamu', sheet: 'fitur-lapor-tamu' }) : go('laporKehilangan', { state: 'langkah-1' })
        return
      }
      case 'detail': {
        const tamu = p.akun === 'tamu'
        if (a === 'kembali') return back()
        if (a === 'salin') return showToast('Nomor disalin')
        if (a === 'bagikan') {
          const item = getItem(String(p.itemId))
          if (!item) return showToast('Barang tidak ditemukan')
          const title = item.isSensitive ? 'Barang Temuan Sensitif' : item.name
          const text = item.isSensitive
            ? `[FoundIt Vokasi UNAIR]\nBarang Temuan: Detail disembunyikan demi keamanan\nKategori: ${item.category}\nLokasi: ${item.location}\nStatus: ${item.depositStatus}\nID: ${item.id}`
            : `[FoundIt Vokasi UNAIR]\nBarang Temuan: ${item.name}\nKategori: ${item.category}\nLokasi: ${item.location}\nStatus: ${item.depositStatus}\nID: ${item.id}`
          shareOrCopy({ title: `FoundIt Vokasi - ${title}`, text }).then((res) => {
            if (res === 'shared') showToast('Tautan berhasil dibagikan')
            else if (res === 'copied') showToast('Informasi barang disalin ke clipboard')
            else showToast('Berbagi dibatalkan atau tidak didukung')
          })
          return
        }
        if (a.startsWith('petunjuk-arah:')) {
          const pk = idOf(a)
          return go('detailTitik', { pointKey: pk, ...civ })
        }
        if (a === 'petunjuk-arah' || a === 'hubungi-posko' || a === 'lokasi-posko') return go('detailTitik', { pointKey: 'posko', ...civ })
        if (a === 'masuk') return reset('masuk')
        if (a === 'lihat-titik') return go('titik', civ)
        // Dari sheet Pilih Laporan Saya: jalur Candidate Matching, sheet diganti layar Bandingkan.
        if (a === 'bandingkan') return replace('bandingkan', { laporanId: String(p.laporanId), itemId: String(p.itemId) })
        if (a === 'klaim') {
          if (tamu || guest) return go('detail', { ...p, sheet: 'fitur-klaim-tamu' })
          const itemId = String(p.itemId)
          // Punya laporan kehilangan dengan kandidat barang ini → jalur kandidat, bukan Form Klaim.
          const rel = relatedLostReport(pengguna, itemId)
          if (rel) return go('detail', { ...p, sheet: 'pilih-laporan-saya', laporanId: rel.id })
          // Tidak punya laporan terkait → Klaim Langsung (MOB-10).
          if (claimForm.itemId !== itemId) setClaimForm(freshClaim(itemId))
          return go('formKlaim', { itemId, state: 'langkah-1' })
        }
        if (a === 'kehilangan-serupa') return tamu ? go('detail', { ...p, sheet: 'fitur-lapor-tamu' }) : go('laporKehilangan', { state: 'langkah-1' })
        return
      }
      case 'laporKehilangan': {
        const s = String(p.state ?? 'langkah-1')
        if (a === 'kembali') return go('laporKehilangan', { state: s, modal: 'keluar-form' })
        if (a === 'simpan-keluar') return reset('beranda', { akun: 'civitas' }), showToast('Draf tersimpan')
        if (a === 'buang') return setLostForm(freshLost()), reset('beranda', { akun: 'civitas' })
        if (a === 'simpan-draf') return showToast('Draf tersimpan')
        if (a === 'lanjut') return go('laporKehilangan', { state: s === 'langkah-2' ? 'langkah-3' : 'langkah-2' })
        if (a === 'kembali-langkah') return back()
        if (a === 'ubah:1') return backTo('laporKehilangan', 'langkah-1')
        if (a === 'ubah:2') return backTo('laporKehilangan', 'langkah-2')
        if (a === 'kirim') {
          const id = submitLost(lostForm, pengguna)
          setLostForm(freshLost())
          return reset('mencocokkan', { reportId: id })
        }
        return
      }
      case 'mencocokkan':
        if (a === 'ketuk') return replace('terkirim', { state: 'belum-ada-kandidat', reportId: p.reportId ?? '' })
        return
      case 'terkirim': {
        if (a === 'salin') return showToast('Nomor disalin')
        if (a === 'bandingkan') {
          const id = String(p.reportId ?? '')
          const c = candidatesFor(id)[0]
          return c ? go('bandingkan', { laporanId: id, itemId: c.itemId }) : showToast('Belum ada kandidat')
        }
        if (a === 'laporan-saya') return go('laporanSaya', { tab: 'kehilangan' })
        if (a === 'telusuri') return go('daftar')
        if (a === 'beranda') return reset('beranda', { akun: 'civitas' })
        return
      }
      case 'laporTemuan': {
        const s = String(p.state ?? 'langkah-1')
        if (a === 'kembali') return go('laporTemuan', { state: s, modal: 'keluar-form' })
        if (a === 'simpan-keluar') return reset('beranda', { akun: 'civitas' }), showToast('Draf tersimpan')
        if (a === 'buang') return setFoundForm(freshFound()), reset('beranda', { akun: 'civitas' })
        if (a === 'simpan-draf') return showToast('Draf tersimpan')
        if (a === 'lanjut') return go('laporTemuan', { state: s === 'langkah-2' ? 'langkah-3' : 'langkah-2' })
        if (a === 'kembali-langkah') return back()
        if (a === 'ubah:1') return backTo('laporTemuan', 'langkah-1')
        if (a === 'lihat-lokasi') return go('titik')
        if (a === 'kirim') {
          const id = submitFound(foundForm, pengguna)
          setFoundForm(freshFound())
          return reset('kode', { itemId: id })
        }
        return
      }
      case 'kode': {
        if (a === 'tutup-x' || a === 'beranda') return reset('beranda', { akun: 'civitas' })
        if (a === 'simpan-qr') return showToast('Tersimpan di galeri')
        if (a === 'salin') return showToast('Nomor disalin')
        if (a === 'bagikan') {
          const report = FOUND_REPORTS[String(p.itemId)]
          const ptName = report?.pointKey ? (DROP_POINTS[report.pointKey]?.name ?? 'Posko Dekanat Lt. 1') : 'Posko Dekanat Lt. 1'
          const text = `[FoundIt Vokasi UNAIR]\nKode Penitipan Barang\nKode: ${report?.dropCode ?? 'DROP-xxxx'}\nBatas Penitipan: ${report?.deadline ?? '1×24 jam'}\nTitik: ${ptName}`
          shareOrCopy({ title: 'FoundIt Vokasi - Kode Penitipan', text }).then((res) => {
            if (res === 'shared') showToast('Kode penitipan berhasil dibagikan')
            else if (res === 'copied') showToast('Kode penitipan disalin ke clipboard')
            else showToast('Berbagi dibatalkan atau tidak didukung')
          })
          return
        }
        if (a.startsWith('petunjuk-arah:')) {
          const pk = idOf(a)
          return go('detailTitik', { pointKey: pk, ...civ })
        }
        if (a === 'petunjuk-arah') return go('detailTitik', { pointKey: 'posko', ...civ })
        if (a === 'laporan-saya') return go('detailLaporan', { laporanId: String(p.itemId ?? '') })
        return
      }
      case 'bandingkan': {
        const base = { laporanId: String(p.laporanId ?? ''), itemId: String(p.itemId ?? '') }
        if (a === 'kembali') return back()
        if (a === 'ajukan-klaim') return go('bandingkan', { ...base, overlay: 'konfirmasi-klaim' })
        if (a === 'bukan') return go('bandingkan', { ...base, overlay: 'bukan-barang-saya' })
        return
      }
      case 'formKlaim': {
        const s = String(p.state ?? 'langkah-1')
        const itemId = String(p.itemId ?? claimForm.itemId)
        // Modal keluar milik Form Klaim sendiri.
        if (a === 'kembali') return go('formKlaim', { itemId, state: s, modal: 'keluar-form' })
        if (a === 'keluar-klaim') return setClaimForm(freshClaim(itemId)), leave('formKlaim')
        if (a === 'lanjut') return go('formKlaim', { itemId, state: 'langkah-2' })
        if (a === 'kembali-langkah') return back()
        if (a === 'kirim-klaim') {
          const res = submitDirectClaim(claimForm, pengguna)
          if (!res.ok) return showToast(res.reason)
          setClaimForm(freshClaim(itemId))
          return leave('formKlaim', { f: 'statusKlaim', p: { claimId: res.claimId!, state: 'menunggu-verifikasi' } })
        }
        return
      }
      case 'statusKlaim': {
        const s = String(p.state ?? 'menunggu-verifikasi')
        const k = { claimId: String(p.claimId ?? '') }
        const claim = CLAIMS[k.claimId]
        const stage = claim ? claimStage(claim) : undefined
        if (a === 'kembali') return back()
        if (a === 'salin') return showToast('Nomor disalin')
        if (a === 'bagikan') {
          if (!claim) return showToast('Tiket tidak ditemukan')
          const item = getItem(claim.itemId)
          const itemName = item?.isSensitive ? 'Detail disembunyikan' : item?.name ?? 'Barang Temuan'
          const ptName = claim.schedule?.pointKey ? (DROP_POINTS[claim.schedule.pointKey]?.name ?? 'Posko Dekanat Lt. 1') : 'Posko Dekanat Lt. 1'
          const scheduleText = claim.schedule ? `${claim.schedule.day}, ${claim.schedule.time}` : 'Menunggu jadwal'
          const text = `[FoundIt Vokasi UNAIR]\nTiket Pengambilan Barang\nNo. Tiket: ${claim.id}\nBarang: ${itemName}\nLokasi Pengambilan: ${ptName}\nJadwal: ${scheduleText}`
          shareOrCopy({ title: `FoundIt Vokasi - Tiket ${claim.id}`, text }).then((res) => {
            if (res === 'shared') showToast('Tiket berhasil dibagikan')
            else if (res === 'copied') showToast('Informasi tiket disalin ke clipboard')
            else showToast('Berbagi dibatalkan atau tidak didukung')
          })
          return
        }
        if (a === 'lihat-laporan') return claim?.laporanId ? go('detailLaporan', { laporanId: claim.laporanId }) : undefined
        if (a === 'batalkan') return go('statusKlaim', { ...k, state: s, overlay: 'batalkan-klaim' })
        // KONFIRMASI: pembatalan klaim belum disimpan ke store (lihat laporan Checkpoint E).
        if (a === 'ya-batalkan') return back(), showToast('Pembatalan belum tersedia di prototipe')
        if (a === 'tambah-bukti') return go('statusKlaim', { ...k, state: s, overlay: 'tambah-bukti' })
        if (a === 'pilih-jadwal' || a === 'ubah-jadwal') {
          if (!claim?.approval) return showToast('Jadwal bisa dipilih setelah klaim disetujui petugas')
          return go('statusKlaim', { ...k, state: stage === 'tiket-siap' ? 'tiket-siap' : 'disetujui', overlay: 'pilih-jadwal' })
        }
        if (a === 'buka-tiket') return replace('statusKlaim', { ...k, state: 'tiket-siap' })
        if (a.startsWith('petunjuk-arah:')) {
          const pk = idOf(a)
          return go('detailTitik', { pointKey: pk, ...civ })
        }
        if (a === 'petunjuk-arah' || a === 'lokasi-posko') {
          const pk = claim?.schedule?.pointKey ?? 'posko'
          return go('detailTitik', { pointKey: pk, ...civ })
        }
        if (a === 'simpan-tiket') return showToast('Tersimpan di galeri')
        if (a === 'qr') return showToast('QR prototipe: dipindai petugas saat serah-terima')
        if (a === 'beranda') return reset('beranda', { akun: 'civitas' })
        // Pintasan demo ke tahap berikutnya: hanya jika tahap itu memang tercatat di data klaim.
        if (s === 'menunggu-verifikasi' && claim) {
          if (a === 'kartu-proses' && claim.approval) return go('statusKlaim', { ...k, state: 'disetujui' })
          if (a === 'kartu-info' && claim.evidenceRequest) return go('statusKlaim', { ...k, state: 'perlu-bukti-tambahan' })
          if (a === 'kartu-barang' && claim.rejection) return go('statusKlaim', { ...k, state: 'ditolak' })
        }
        return
      }
      case 'laporanSaya': {
        const t = String(p.tab ?? 'kehilangan')
        const f = String(p.filter ?? 'aktif')
        if (a.startsWith('tab:')) return replace('laporanSaya', { tab: a.slice(4), filter: f })
        if (a.startsWith('filter:')) return replace('laporanSaya', { tab: t, filter: a.slice(7) })
        if (a.startsWith('tiket:')) return go('statusKlaim', { claimId: idOf(a), state: 'tiket-siap' })
        if (a.startsWith('klaim:')) {
          const c = CLAIMS[idOf(a)]
          return go('statusKlaim', { claimId: idOf(a), state: c ? claimStage(c) : 'menunggu-verifikasi' })
        }
        if (a.startsWith('detail:')) return go('detailLaporan', { laporanId: idOf(a) })
        if (a === 'lapor-kehilangan') return go('laporKehilangan', { state: 'langkah-1' })
        if (a === 'lapor-temuan') return go('laporTemuan', { state: 'langkah-1' })
        return
      }
      case 'detailLaporan': {
        const id = String(p.laporanId ?? '')
        if (a === 'kembali') return back()
        if (a === 'menu') return go('detailLaporan', { laporanId: id, modal: 'batalkan-laporan' })
        // KONFIRMASI: pembatalan laporan belum disimpan ke store.
        if (a === 'batalkan-laporan') return back(), showToast('Pembatalan belum tersedia di prototipe')
        if (a.startsWith('tiket:')) return go('statusKlaim', { claimId: idOf(a), state: 'tiket-siap' })
        if (a.startsWith('klaim:')) {
          const c = CLAIMS[idOf(a)]
          return go('statusKlaim', { claimId: idOf(a), state: c ? claimStage(c) : 'menunggu-verifikasi' })
        }
        if (a.startsWith('kandidat:')) {
          const [, laporanId, itemId] = a.split(':')
          return go('bandingkan', { laporanId, itemId })
        }
        if (a.startsWith('kode:')) return go('kode', { itemId: idOf(a) })
        if (a === 'unduh-bast') return showToast('BAST tersimpan')
        if (a === 'laporkan-lain') return go('beranda', { akun: 'civitas', sheet: 'pilih-laporan' })
        return
      }
      case 'notifikasi': {
        if (a === 'bantuan') return go('detailTitik', { pointKey: 'posko', ...civ })
        if (a === 'atur') return go('profil')
        if (a === 'tandai-semua') return markAllRead(pengguna), setNotifVersion((v) => v + 1)
        return
      }
      case 'titik': {
        if (a === 'kembali') return back()
        if (a === 'tab:panduan' || a === 'tab:titik') return replace('titik', { ...p, tab: a.slice(4) })
        if (a.startsWith('titik:')) return go('detailTitik', { pointKey: idOf(a), ...civ })
        return
      }
      case 'detailTitik': {
        const pk = String(p.pointKey ?? 'posko') as DropPointKey
        const pt = DROP_POINTS[pk]
        if (a === 'kembali') return back()
        if (a === 'buka-peta') {
          if (pt?.address) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pt.address)}`
            try {
              window.open(url, '_blank', 'noopener,noreferrer')
            } catch {}
            return showToast('Membuka peta: ' + pt.name)
          } else {
            return showToast('Peta belum tersedia untuk titik ini')
          }
        }
        return
      }
      case 'profil': {
        if (a === 'kembali') return back()
        if (a === 'panduan') return go('titik', { tab: 'panduan' })
        if (a === 'hubungi-posko') return go('detailTitik', { pointKey: 'posko', ...civ })
        if (a === 'simpan-kontak') return showToast('Nomor WhatsApp diperbarui (tersimpan untuk sesi ini)')
        if (a === 'keluar') return go('profil', { modal: 'keluar-akun' })
        if (a === 'keluar-ya') return setGuest(false), reset('masuk')
        return
      }
    }
  }

  const Frame = FRAMES[route.f] as React.ComponentType<Record<string, unknown>>
  const formProps =
    route.f === 'laporKehilangan'
      ? { form: lostForm, onChange: setLostForm }
      : route.f === 'laporTemuan'
        ? { form: foundForm, onChange: setFoundForm }
        : route.f === 'formKlaim'
          ? { form: claimForm, onChange: setClaimForm, pengguna }
          : route.f === 'bandingkan'
            ? {
                pengguna,
                // Confirmation Sheet → klaim terikat ID laporan + ID barang → Status Klaim.
                onSubmitClaim: (evidence?: string) => {
                  const res = submitCandidateClaim(String(p.laporanId ?? ''), String(p.itemId ?? ''), pengguna, evidence)
                  if (!res.ok) return showToast(res.reason), back()
                  setStack((s) => [...s.slice(0, -1), { f: 'statusKlaim', p: { claimId: res.claimId!, state: 'menunggu-verifikasi' } }])
                },
                // Bukan Barang Saya → kandidat disembunyikan, kembali ke layar sebelum Bandingkan.
                onHide: (reason?: string) => {
                  hideCandidate(String(p.laporanId ?? ''), String(p.itemId ?? ''), reason)
                  leave('bandingkan')
                  showToast('Kandidat disembunyikan')
                },
              }
            : route.f === 'statusKlaim'
              ? {
                  pengguna,
                  // Pilih Jadwal → simpan ke klaim → Tiket QR (overlay diganti, tidak menumpuk).
                  onSchedule: (dateISO: string, time: string) => {
                    const id = String(p.claimId ?? '')
                    const res = setSchedule(id, pengguna, dateISO, time)
                    if (!res.ok) return showToast(res.reason)
                    leave('statusKlaim', { f: 'statusKlaim', p: { claimId: id, state: 'tiket-siap' } })
                    showToast('Jadwal tersimpan')
                  },
                  onEvidence: (photos: string[], note: string) => {
                    const id = String(p.claimId ?? '')
                    const res = submitEvidence(id, pengguna, photos, note)
                    if (!res.ok) return showToast(res.reason)
                    back()
                    showToast('Bukti terkirim')
                  },
                }
              : route.f === 'laporanSaya' || route.f === 'detailLaporan' || route.f === 'beranda' || route.f === 'profil'
                ? { pengguna }
                : route.f === 'notifikasi'
                  ? {
                      pengguna,
                      version: notifVersion,
                      // Buka tujuan berdasarkan ID di notifikasi; tandai dibaca.
                      onOpen: (n: Notif) => {
                        markRead(n.id)
                        setNotifVersion((v) => v + 1)
                        if (!targetExists(n.target)) return showToast('Data notifikasi ini sudah tidak tersedia')
                        const t = n.target
                        if (t.f === 'statusKlaim') return go('statusKlaim', { claimId: t.claimId, state: t.state })
                        if (t.f === 'bandingkan') return go('bandingkan', { laporanId: t.laporanId, itemId: t.itemId })
                        if (t.f === 'detailLaporan') return go('detailLaporan', { laporanId: t.laporanId })
                        if (t.f === 'detailTitik') return go('detailTitik', { pointKey: t.pointKey, ...civ })
                        return go('detailTitik', civ)
                      },
                    }
                  : {}

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={route.f}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          <Frame {...p} {...formProps} onAction={onAction} />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            className="pointer-events-none absolute inset-x-0 bottom-[100px] z-50 flex justify-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <Toast text={toast} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
