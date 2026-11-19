/**
 * FoundIt Vokasi — model formulir laporan kehilangan & laporan penemuan.
 *
 * SIMULASI FRONTEND: foto tidak benar-benar diunggah, dan laporan hanya
 * disimpan di memori prototipe (lihat `store.ts`). Belum ada backend.
 */
import { AREAS, IMG, TODAY_ISO, TUMBLER, type Category, type DropPointKey } from './data'

/* ───────────── Pilihan isian ───────────── */

export const LOST_LOCATIONS = ['Kantin Perpustakaan Pusat (Lt. 1)', ...AREAS, 'Di luar area kampus']
export const FOUND_LOCATIONS = ['Kantin Perpustakaan Pusat (Lt. 1)', ...AREAS]
export const TIME_RANGES = ['07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00', 'Tidak ingat']
export const MAX_TEXT = 300

/* ───────────── Laporan kehilangan ───────────── */

export interface LostForm {
  /** Diisi jika formulir ini melanjutkan laporan yang tercantum di panduan. */
  reportId?: string
  /** URL foto. Simulasi: tidak ada unggahan sungguhan. */
  photo: string | null
  category: Category | ''
  name: string
  location: string
  date: string
  timeRange: string
  description: string
  secret: string
  agree: boolean
}

export const EMPTY_LOST: LostForm = {
  photo: null,
  category: '',
  name: '',
  location: '',
  date: '',
  timeRange: '',
  description: '',
  secret: '',
  agree: false,
}

/** Draf alur demo Rara: laporan FI-L-26-0021 sesuai panduan. */
export const RARA_LOST_DRAFT: LostForm = {
  reportId: 'FI-L-26-0021',
  photo: IMG.tumbler,
  category: 'Botol & Wadah Minum',
  name: TUMBLER,
  location: 'Kantin Perpustakaan Pusat (Lt. 1)',
  date: '2026-10-12',
  timeRange: '09:00 - 11:00',
  description: 'Tumbler warna pink pastel, tutup putih, ada tali silikon.',
  secret: 'Ada stiker hologram kelinci kecil di dasar botol dan baret tipis di tutup.',
  agree: false,
}

export type Errors = Partial<Record<string, string>>

export function validateLost(step: number, f: LostForm): Errors {
  const e: Errors = {}
  if (step === 1) {
    if (!f.category) e.category = 'Pilih kategori barang'
    if (!f.name.trim()) e.name = 'Isi nama barang'
    else if (f.name.trim().length < 3) e.name = 'Nama barang minimal 3 huruf'
  }
  if (step === 2) {
    if (!f.location) e.location = 'Pilih lokasi terakhir'
    if (!f.date) e.date = 'Pilih tanggal'
    else if (f.date > TODAY_ISO) e.date = 'Tanggal tidak boleh setelah hari ini'
    if (!f.timeRange) e.timeRange = 'Pilih perkiraan jam'
    if (f.description.length > MAX_TEXT) e.description = `Maksimal ${MAX_TEXT} karakter`
  }
  if (step === 3) {
    if (!f.secret.trim()) e.secret = 'Tulis ciri khusus barangmu'
    else if (f.secret.trim().length < 10) e.secret = 'Ciri khusus minimal 10 karakter'
    else if (f.secret.length > MAX_TEXT) e.secret = `Maksimal ${MAX_TEXT} karakter`
    if (!f.agree) e.agree = 'Centang pernyataan ini untuk mengirim'
  }
  return e
}

/* ───────────── Laporan penemuan ───────────── */

export interface FoundForm {
  /** Diisi jika formulir ini melanjutkan laporan yang tercantum di panduan. */
  reportId?: string
  photo: string | null
  category: Category | ''
  name: string
  location: string
  locationDetail: string
  date: string
  time: string
  description: string
  secret: string
  point: DropPointKey | ''
  agree: boolean
}

export const EMPTY_FOUND: FoundForm = {
  photo: null,
  category: '',
  name: '',
  location: '',
  locationDetail: '',
  date: '',
  time: '',
  description: '',
  secret: '',
  point: '',
  agree: false,
}

/** Draf alur demo Salsabila: temuan FI-T-26-0042 sesuai panduan. */
export const SALSABILA_FOUND_DRAFT: FoundForm = {
  reportId: 'FI-T-26-0042',
  photo: IMG.tumbler,
  category: 'Botol & Wadah Minum',
  name: TUMBLER,
  location: 'Kantin Perpustakaan Pusat (Lt. 1)',
  locationDetail: 'Meja sudut dekat jendela',
  date: '2026-10-12',
  time: '11:10',
  description: 'Tumbler pink pastel bertutup putih, ditemukan di meja sudut kantin. Kondisi bersih.',
  secret: 'Ada stiker hologram kelinci kecil di dasar botol dan baret tipis di tutup.',
  point: 'posko',
  agree: false,
}

export function validateFound(step: number, f: FoundForm): Errors {
  const e: Errors = {}
  if (step === 1) {
    if (!f.photo) e.photo = 'Tambahkan minimal 1 foto barang'
    if (!f.category) e.category = 'Pilih kategori barang'
    if (!f.name.trim()) e.name = 'Isi nama barang'
    else if (f.name.trim().length < 3) e.name = 'Nama barang minimal 3 huruf'
  }
  if (step === 2) {
    if (!f.location) e.location = 'Pilih lokasi ditemukan'
    if (!f.date) e.date = 'Pilih tanggal'
    else if (f.date > TODAY_ISO) e.date = 'Tanggal tidak boleh setelah hari ini'
    if (!f.time) e.time = 'Isi jam ditemukan'
    if (f.description.length > MAX_TEXT) e.description = `Maksimal ${MAX_TEXT} karakter`
    if (!f.secret.trim()) e.secret = 'Tulis ciri rahasia untuk petugas'
    else if (f.secret.trim().length < 10) e.secret = 'Ciri rahasia minimal 10 karakter'
    else if (f.secret.length > MAX_TEXT) e.secret = `Maksimal ${MAX_TEXT} karakter`
  }
  if (step === 3) {
    if (!f.point) e.point = 'Pilih titik penitipan'
    if (!f.agree) e.agree = 'Centang pernyataan ini untuk mengirim'
  }
  return e
}

/* ───────────── Klaim langsung (MOB-10) ───────────── */

export interface ClaimForm {
  /** Barang yang diklaim. Isian selalu terikat ke satu ID barang. */
  itemId: string
  date: string
  timeRange: string
  location: string
  secret: string
  photo: string | null
  note: string
  agree: boolean
}

export function emptyClaim(itemId: string): ClaimForm {
  return { itemId, date: '', timeRange: '', location: '', secret: '', photo: null, note: '', agree: false }
}

/** Draf alur demo Fajar: klaim langsung FI-K-26-0191 untuk barang FI-T-26-0095. */
export const FAJAR_CLAIM_DRAFT: ClaimForm = {
  itemId: 'FI-T-26-0095',
  date: '2026-10-10',
  timeRange: '11:00 - 13:00',
  location: 'Area Mushola Vokasi',
  secret: 'Isinya uang sekitar 50 ribu dan kartu e-money biru.',
  photo: IMG.fajarDompet,
  note: 'Dompet pemberian kakak saat ulang tahun, dipakai sejak 2025.',
  agree: false,
}

export function validateClaim(step: number, f: ClaimForm): Errors {
  const e: Errors = {}
  if (step === 1) {
    if (!f.date) e.date = 'Pilih tanggal'
    else if (f.date > TODAY_ISO) e.date = 'Tanggal tidak boleh setelah hari ini'
    if (!f.timeRange) e.timeRange = 'Pilih perkiraan jam'
    if (!f.location) e.location = 'Pilih lokasi kemungkinan hilang'
    if (!f.secret.trim()) e.secret = 'Jawaban ini wajib untuk verifikasi kepemilikan'
    else if (f.secret.trim().length < 10) e.secret = 'Ciri khusus minimal 10 karakter'
    else if (f.secret.length > MAX_TEXT) e.secret = `Maksimal ${MAX_TEXT} karakter`
  }
  if (step === 2) {
    if (f.note.length > MAX_TEXT) e.note = `Maksimal ${MAX_TEXT} karakter`
    if (!f.agree) e.agree = 'Centang pernyataan ini untuk mengirim klaim'
  }
  return e
}

/* ───────────── Format tanggal ───────────── */

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** '2026-10-12' → '12 Okt 2026' */
export function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${BULAN[m - 1]} ${y}`
}

/** Date → '13 Okt 2026, 11:30' */
export function fmtDateTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`
}

/** Date → '12 Okt, 11:31' */
export function fmtShort(d: Date) {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${BULAN[d.getMonth()]}, ${hh}:${mm}`
}
