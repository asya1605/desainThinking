/**
 * FoundIt Vokasi — master data (single source of truth).
 *
 * SIMULASI: semua data di file ini adalah mock data prototipe frontend.
 * Belum terhubung ke backend (Laravel) maupun SSO UNAIR. Setiap halaman
 * WAJIB membaca barang lewat `getItem(id)` / `FOUND_ITEMS`, bukan menyalin objek.
 *
 * Acuan: Panduan Desain Mobile App FoundIt (8 November 2026).
 * Relasi antardata selalu memakai ID (barang FI-T, laporan kehilangan FI-L,
 * klaim FI-K), bukan nama atau indeks array.
 * Kolom bertanda `// KONFIRMASI` belum ada di dokumen dan perlu dicek ke panduan.
 */

const CDN = 'https://cdn.magicpatterns.com/patterns/generated-images/'

export const IMG = {
  tumbler: CDN + 'a737d26a-7e46-4f33-b65c-d936165f7720.jpg',
  tumblerTutup: CDN + '364347cf-b2aa-4c3a-8f24-5dfe479bdb22.jpg',
  tumblerDasar: CDN + '1cfd92e5-af94-42c9-b14a-579f9f0f7303.jpg',
  dompet: CDN + 'e4f1e63c-a4d2-4b68-8a28-083ace461ef0.jpg',
  payung: CDN + 'e5fc7419-8d8c-4f43-af2d-552d36fdbce8.jpg',
  tws: CDN + '8d2f82c2-e4a1-48f6-9bba-8bc7647ea601.jpg',
  casingLaptop: CDN + 'c539749e-ed9b-44f6-9e62-45a30bbb334b.jpg',
  powerbank: CDN + '79e71042-e7ea-44ea-b783-bd0d61d9656f.jpg',
  tote: CDN + '265d85ca-f802-4c27-ae9f-4e2c5b6e2849.jpg',
  hoodie: CDN + 'ed03edbd-3fcc-41fb-a710-a1f609702d7b.jpg',
  locknlock: CDN + '8144769c-0630-4392-b153-8819815cd5ff.jpg',
  roseGold: CDN + '65276985-e394-4183-9783-3952e1ec3aeb.jpg',
  charger: CDN + '27a842a1-e706-4844-9da5-cfc86d3f4865.jpg',
  gedung: CDN + '6cccdecf-4070-4823-83e1-603ff57b1d87.jpg',
  rara: CDN + '203af023-7351-488e-8e08-26e00853adb3.jpg',
  raraTumbler: CDN + '55d08058-ed95-4607-8406-66d6494ac819.jpg',
  fajarDompet: CDN + '2066ee5a-a3d2-4da2-b154-9744971e88e4.jpg',
  splash1: CDN + '7ebd7c6a-7453-4472-8f5c-af1c75ee8239.jpg',
  splash2: CDN + '44de6a35-e7e8-4548-af12-2e0e56cdb68a.jpg',
  splash3: CDN + '97940505-fffe-4a8e-94a0-831496f86c56.jpg',
  peta: CDN + '20d541a2-5c26-4579-9352-c07725ab4fa4.jpg',
  mencocokkan: CDN + '379108bd-7d98-446e-bb23-ef1012f3779e.jpg',
  kosong: CDN + 'ec10d334-2758-49a6-8883-419d90135dc5.jpg',
}

export const CATEGORIES = [
  'Botol & Wadah Minum',
  'Elektronik & Gadget',
  'Dompet & Tas',
  'Pakaian',
  'Dokumen & Kartu',
  'Kunci',
  'Lainnya',
] as const

export type Category = (typeof CATEGORIES)[number]
export type DepositStatus = 'Belum Dititipkan' | 'Dititipkan' | 'Siap Diserahkan' | 'Diserahkan'

export const TUMBLER = 'Tumbler Corkcicle Pink Pastel 500ml'
export const POSKO = 'Posko Dekanat Lt. 1'
export const JAM_POSKO = 'Senin-Jumat 07.00-18.00'
export const SKOR_NOTE = 'Skor AI hanya bantuan, keputusan tetap oleh petugas.'
export const TODAY = 'Rabu, 14 Oktober 2026'
/** Tanggal demo dalam format ISO (dipakai validasi tanggal formulir). */
export const TODAY_ISO = '2026-10-14'

/* ───────────── Titik penitipan (hanya tiga, resmi) ───────────── */

export type DropPointKey = 'posko' | 'gerbang' | 'vokasi-c'

export const DROP_POINTS: Record<
  DropPointKey,
  {
    key: DropPointKey
    name: string
    type: 'Posko Utama' | 'Titik Satelit'
    active: boolean
    hours: string
    hoursTable?: [string, string, boolean][]
    address?: string
    services: string[]
    note?: string
    bring?: string[]
    officer?: string
    photo?: string
  }
> = {
  posko: {
    key: 'posko',
    name: 'Posko Dekanat Lt. 1',
    type: 'Posko Utama',
    active: true,
    hours: 'Senin-Jumat 07.00-18.00',
    hoursTable: [
      ['Senin-Jumat', '07.00-18.00', true],
      ['Sabtu-Minggu', 'Tutup', false],
      ['Hari libur', 'Tutup', false],
    ],
    address: 'Gedung Dekanat Fakultas Vokasi, Lt. 1, Kampus B UNAIR, Surabaya',
    services: ['Menerima titipan barang temuan', 'Verifikasi klaim', 'Serah-terima dan BAST'],
    bring: ['Identitas asli (KTM atau KTP)', 'QR kode penitipan atau QR tiket klaim'],
    officer: 'Bambang S.',
    photo: IMG.gedung,
  },
  gerbang: {
    key: 'gerbang',
    name: 'Pos Satpam Gerbang Utama',
    type: 'Titik Satelit',
    active: true,
    hours: 'Buka 24 jam',
    services: ['Menerima titipan barang temuan'],
    note: 'Hanya menerima titipan. Barang dipindah ke Posko Dekanat setiap pagi. Klaim dan serah-terima dilakukan di Posko Dekanat Lt. 1.',
    bring: ['QR kode penitipan'],
  },
  'vokasi-c': {
    key: 'vokasi-c',
    name: 'Pos Satpam Gedung Vokasi C',
    type: 'Titik Satelit',
    active: false,
    hours: 'Sedang tidak melayani',
    services: [],
  },
}

/** Menentukan apakah Posko Dekanat sedang buka saat ini (Senin–Jumat 07.00–18.00 WIB). */
export function isPoskoOpen(date: Date = new Date()): boolean {
  const day = date.getDay()
  if (day === 0 || day === 6) return false
  const mins = date.getHours() * 60 + date.getMinutes()
  return mins >= 7 * 60 && mins < 18 * 60
}

/* ───────────── Barang temuan ───────────── */

export interface FoundItem {
  /** ID resmi, sama dengan label stiker barang. `null` jika belum ada di dokumen. */
  id: string
  /** Apakah ID sudah dikonfirmasi dokumen requirement. ID belum terkonfirmasi tidak ditampilkan di layar. */
  idConfirmed: boolean
  name: string
  category: Category
  description?: string
  image?: string
  additionalImages?: string[]
  location: string
  /** Label singkat untuk kartu daftar. */
  foundAt: string
  /** Label lengkap untuk halaman detail. */
  foundAtFull: string
  /** Untuk pengurutan "Terbaru". */
  foundDate: string
  depositPoint?: DropPointKey
  depositStatus: DepositStatus
  /** Batas titip untuk barang yang masih dibawa penemu. */
  depositDeadline?: string
  isSensitive: boolean
  searchableKeywords: string[]
}

export const FOUND_ITEMS: FoundItem[] = [
  {
    id: 'FI-T-26-0110',
    idConfirmed: true,
    name: 'Payung Lipat Biru Dongker',
    category: 'Lainnya',
    image: IMG.payung,
    location: 'Aula Vokasi A',
    foundAt: 'Hari ini, 06:40',
    foundAtFull: '14 Okt 2026, 06:40 WIB',
    foundDate: '2026-10-14T06:40',
    depositPoint: 'gerbang',
    depositStatus: 'Dititipkan',
    isSensitive: false,
    searchableKeywords: ['payung', 'biru', 'dongker', 'lipat'],
  },
  {
    id: 'FI-T-26-0089',
    idConfirmed: true,
    name: 'Casing TWS Wireless Earbuds Hitam',
    category: 'Elektronik & Gadget',
    image: IMG.tws,
    location: 'R. Kuliah 204, Lt. 2 Gedung Vokasi',
    foundAt: '12 Okt, 14:05',
    foundAtFull: '12 Okt 2026, 14:05 WIB',
    foundDate: '2026-10-12T14:05',
    depositPoint: 'posko',
    depositStatus: 'Dititipkan',
    isSensitive: false,
    searchableKeywords: ['tws', 'earbuds', 'earphone', 'casing', 'hitam', 'wireless'],
  },
  {
    id: 'FI-T-26-0101',
    idConfirmed: true,
    name: 'Kartu identitas',
    category: 'Dokumen & Kartu',
    location: 'Area Mushola Vokasi',
    foundAt: 'Kemarin',
    foundAtFull: '13 Okt 2026, 13:10 WIB',
    foundDate: '2026-10-13T13:10',
    depositPoint: 'posko',
    depositStatus: 'Dititipkan',
    isSensitive: true,
    searchableKeywords: ['kartu', 'identitas', 'ktm', 'ktp', 'dokumen'],
  },
  {
    id: 'FI-T-26-0072',
    idConfirmed: true,
    name: 'Powerbank Anker 10.000mAh Hitam',
    category: 'Elektronik & Gadget',
    image: IMG.powerbank,
    location: 'Lab Komputer Vokasi',
    foundAt: 'Kemarin, 11:20',
    foundAtFull: '13 Okt 2026, 11:20 WIB',
    foundDate: '2026-10-13T11:20',
    depositStatus: 'Dititipkan', // KONFIRMASI: titik penitipan
    isSensitive: false,
    searchableKeywords: ['powerbank', 'anker', 'hitam', 'charger'],
  },
  {
    id: 'FI-T-26-0081',
    idConfirmed: true,
    name: 'Tote Bag Kanvas Krem Logo Vokasi',
    category: 'Dompet & Tas',
    image: IMG.tote,
    location: 'Lobi Gedung Vokasi C Lt. 1',
    foundAt: '2 hari lalu',
    foundAtFull: '12 Okt 2026',
    foundDate: '2026-10-12T00:00',
    depositStatus: 'Dititipkan', // KONFIRMASI: titik penitipan
    isSensitive: false,
    searchableKeywords: ['tote', 'tas', 'kanvas', 'krem'],
  },
  {
    id: 'FI-T-26-0019',
    idConfirmed: true,
    name: 'Jaket Hoodie Hitam UNAIR',
    category: 'Pakaian',
    image: IMG.hoodie,
    location: 'Aula Vokasi A',
    foundAt: '15 Sep',
    foundAtFull: '15 Sep 2026',
    foundDate: '2026-09-15T00:00',
    depositStatus: 'Dititipkan', // KONFIRMASI: titik penitipan
    isSensitive: false,
    searchableKeywords: ['jaket', 'hoodie', 'hitam', 'unair', 'baju'],
  },
  {
    id: 'FI-T-26-0095',
    idConfirmed: true,
    name: 'Dompet Kulit Cokelat Braun Buffel',
    category: 'Dompet & Tas',
    description: 'Dompet lipat kulit cokelat tua, ditemukan di rak sandal area mushola setelah salat Zuhur.',
    image: IMG.dompet,
    location: 'Area Mushola Vokasi',
    foundAt: '10 Okt, 12:30',
    foundAtFull: '10 Okt 2026, 12:30 WIB',
    foundDate: '2026-10-10T12:30',
    depositPoint: 'posko',
    depositStatus: 'Dititipkan',
    isSensitive: false,
    searchableKeywords: ['dompet', 'kulit', 'cokelat', 'coklat', 'braun', 'buffel'],
  },
  {
    id: 'FI-T-26-0097',
    idConfirmed: true,
    name: 'Casing Laptop Abu-abu 14 inci',
    category: 'Elektronik & Gadget',
    description: 'Casing laptop kain abu-abu dengan resleting, ditemukan di meja nomor 12.',
    image: IMG.casingLaptop,
    location: 'Lab Komputer Vokasi',
    foundAt: '12 Okt, 16:40',
    foundAtFull: '12 Okt 2026, 16:40 WIB',
    foundDate: '2026-10-12T16:40',
    depositStatus: 'Belum Dititipkan',
    depositDeadline: '13 Okt, 16:40',
    isSensitive: false,
    searchableKeywords: ['casing', 'laptop', 'sleeve', 'abu', 'tas laptop'],
  },
  {
    id: 'FI-T-26-0042',
    idConfirmed: true,
    name: TUMBLER,
    category: 'Botol & Wadah Minum',
    description: 'Tumbler pink pastel bertutup putih, ditemukan di meja sudut kantin. Kondisi bersih.',
    image: IMG.tumbler,
    additionalImages: [IMG.tumblerTutup],
    location: 'Meja sudut Kantin Perpustakaan Pusat',
    foundAt: '12 Okt, 11:10',
    foundAtFull: '12 Okt 2026, 11:10 WIB',
    foundDate: '2026-10-12T11:10',
    depositPoint: 'posko',
    depositStatus: 'Siap Diserahkan',
    isSensitive: false,
    searchableKeywords: ['tumbler', 'corkcicle', 'pink', 'botol', 'minum', 'pastel'],
  },
  {
    id: 'FI-T-26-0058',
    idConfirmed: true,
    name: 'Botol Minum Termos LocknLock Pink',
    category: 'Botol & Wadah Minum',
    image: IMG.locknlock,
    location: 'Perpustakaan Kampus B Lt. 2',
    foundAt: 'Kemarin, 14:15',
    foundAtFull: '13 Okt 2026, 14:15 WIB',
    foundDate: '2026-10-13T14:15',
    depositPoint: 'posko',
    depositStatus: 'Dititipkan',
    isSensitive: false,
    searchableKeywords: ['locknlock', 'termos', 'botol', 'minum', 'pink', 'tumbler'],
  },
  {
    id: 'FI-T-26-0064',
    idConfirmed: true,
    name: 'Tumbler Stainless Pink Rose Gold',
    category: 'Botol & Wadah Minum',
    image: IMG.roseGold,
    location: 'R. Kuliah 302 Gedung Vokasi A',
    foundAt: '3 hari lalu',
    foundAtFull: '11 Okt 2026',
    foundDate: '2026-10-11T00:00',
    depositPoint: 'gerbang',
    depositStatus: 'Dititipkan',
    isSensitive: false,
    searchableKeywords: ['tumbler', 'stainless', 'pink', 'rose gold', 'botol', 'minum'],
  },
  {
    // Temuan Salsabila yang sudah kembali ke pemiliknya (tidak tampil di daftar temuan).
    id: 'FI-T-26-0076',
    idConfirmed: true,
    name: 'Charger Laptop 65W Putih',
    category: 'Elektronik & Gadget',
    image: IMG.charger,
    location: 'Lab Komputer Vokasi',
    foundAt: '7 Okt, 13:20',
    foundAtFull: '7 Okt 2026, 13:20 WIB',
    foundDate: '2026-10-07T13:20',
    depositPoint: 'posko',
    depositStatus: 'Diserahkan',
    isSensitive: false,
    searchableKeywords: ['charger', 'laptop', 'adaptor', 'putih'],
  },
]

/** Barang yang masih tampil untuk publik (yang sudah diserahkan ke pemilik tidak tampil). */
export const LISTED_ITEMS = FOUND_ITEMS.filter((it) => it.depositStatus !== 'Diserahkan')

/** Cari barang berdasarkan ID. Tidak pernah mengganti dengan barang lain. */
export function getItem(id: string | undefined): FoundItem | undefined {
  return FOUND_ITEMS.find((item) => item.id === id)
}

/** Urutan "Terbaru". */
export function sortNewest(items: FoundItem[]) {
  return [...items].sort((a, b) => b.foundDate.localeCompare(a.foundDate))
}

/** Pencarian sederhana: setiap kata harus cocok dengan nama atau kata kunci. */
export function searchItems(query: string, items: FoundItem[] = LISTED_ITEMS) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!words.length) return items
  return items.filter((it) => {
    const hay = [it.name, it.category, ...(it.isSensitive ? [] : it.searchableKeywords)].join(' ').toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

/** Barang di Beranda "Barang Temuan Terbaru" (urutan sesuai brief). */
export const BERANDA_ITEM_IDS = ['FI-T-26-0110', 'FI-T-26-0089', 'FI-T-26-0101']

export const AREAS = [
  'Gedung Vokasi A',
  'Gedung Vokasi B',
  'Gedung Vokasi C',
  'Aula Vokasi A',
  'Lab Komputer Vokasi',
  'Area Mushola Vokasi',
  'Perpustakaan Pusat',
  'Kantin Vokasi',
  'Parkiran Barat Kampus B',
]

/* ───────────── Laporan & klaim ───────────── */

export type UserKey = 'rara' | 'salsabila' | 'fajar' | 'rizky'

export const USERS: Record<UserKey, { name: string; nim?: string; prodi?: string }> = {
  rara: { name: 'Rara Anindya Putri', nim: '434231012', prodi: 'D-IV Manajemen Perkantoran Digital' },
  salsabila: { name: 'Salsabila Putri' },
  fajar: { name: 'Fajar Nugroho', nim: '434241023', prodi: 'D-III Akuntansi' },
  rizky: { name: 'Rizky Ramadhan' },
}

/** Kontak pengguna (WhatsApp). Disimpan di memori sesi prototipe. */
export const USER_CONTACTS: Record<UserKey, string> = {
  rara: '081234564410',
  salsabila: '081298765432',
  fajar: '081345678901',
  rizky: '081398761234',
}

export function getContact(user: UserKey): string {
  return USER_CONTACTS[user] ?? '081234564410'
}

export function updateContact(user: UserKey, phone: string): { ok: boolean; error?: string } {
  const clean = phone.replace(/[\s-]/g, '')
  if (!clean) return { ok: false, error: 'Nomor WhatsApp tidak boleh kosong' }
  if (!/^(\+62|62|08)[0-9]{8,13}$/.test(clean)) {
    return { ok: false, error: 'Format nomor tidak valid (contoh: 081234567890)' }
  }
  USER_CONTACTS[user] = clean
  return { ok: true }
}

export function maskPhone(phone: string): string {
  const clean = phone.replace(/[\s-]/g, '')
  if (clean.length < 8) return clean
  return clean.slice(0, 4) + '-****-' + clean.slice(-4)
}

/** Preferensi notifikasi pengguna. Disimpan di memori sesi prototipe. */
export interface NotifPrefs {
  appNotif: boolean
  waNotif: boolean
}

export const USER_NOTIF_PREFS: Record<UserKey, NotifPrefs> = {
  rara: { appNotif: true, waNotif: true },
  salsabila: { appNotif: true, waNotif: true },
  fajar: { appNotif: true, waNotif: true },
  rizky: { appNotif: true, waNotif: true },
}

export function getNotifPrefs(user: UserKey): NotifPrefs {
  if (!USER_NOTIF_PREFS[user]) {
    USER_NOTIF_PREFS[user] = { appNotif: true, waNotif: true }
  }
  return USER_NOTIF_PREFS[user]
}

export function updateNotifPrefs(user: UserKey, prefs: Partial<NotifPrefs>): NotifPrefs {
  const current = getNotifPrefs(user)
  USER_NOTIF_PREFS[user] = { ...current, ...prefs }
  return USER_NOTIF_PREFS[user]
}

/** Laporan kehilangan (FI-L). */
export interface LostReport {
  id: string
  owner: UserKey
  /** Ringkasan barang yang dilaporkan hilang, sesuai panduan. */
  title?: string
  category?: Category
  photo?: string
  location?: string
  /** Contoh: '12 Okt 2026 · 09:00-11:00' */
  lostWhen?: string
  description?: string
  /** Ciri rahasia: hanya untuk petugas, tidak pernah tampil ke publik. */
  secret?: string
  reported?: string
  /** Barang hasil pencocokan, jika sudah ada. */
  matchedItemId?: string
  /** Status pembatalan oleh pemilik (Checkpoint H). */
  cancelled?: boolean
  cancelledAt?: string
  cancelReason?: string
}

export const LOST_REPORTS: Record<string, LostReport> = {
  'FI-L-26-0021': {
    id: 'FI-L-26-0021',
    owner: 'rara',
    title: TUMBLER,
    category: 'Botol & Wadah Minum',
    photo: IMG.tumbler,
    location: 'Kantin Perpustakaan Pusat (Lt. 1)',
    lostWhen: '12 Okt 2026 · 09:00-11:00',
    description: 'Tumbler warna pink pastel, tutup putih, ada tali silikon.',
    secret: 'Ada stiker hologram kelinci kecil di dasar botol dan baret tipis di tutup.',
    reported: 'Dilaporkan 12 Okt, 15:10',
    matchedItemId: 'FI-T-26-0042',
  },
  // KONFIRMASI: panduan hanya mencantumkan ID dan pemilik laporan ini.
  'FI-L-26-0008': { id: 'FI-L-26-0008', owner: 'rara' },
  'FI-L-26-0031': {
    id: 'FI-L-26-0031',
    owner: 'rizky',
    title: 'Dompet kulit cokelat',
    reported: 'Dilaporkan 10 Okt 2026',
  },
}

/** Laporan penemuan: barang (FI-T) yang dilaporkan seorang penemu. */
export type FoundReportStatus = 'Belum Dititipkan' | 'Dititipkan' | 'Diserahkan'

export interface FoundReport {
  itemId: string
  finder: UserKey
  reported: string
  location: string
  status: FoundReportStatus
  pointKey?: DropPointKey
  dropCode?: string
  /** Batas titip: 1×24 jam setelah laporan dikirim. */
  deadline?: string
  bast?: { no: string; date: string }
  /** Data barang untuk laporan baru yang belum ada di daftar temuan publik. */
  name?: string
  category?: Category
  photo?: string
  foundWhen?: string
  description?: string
  /** Ciri rahasia: hanya untuk petugas. */
  secret?: string
  /** Waktu barang diterima petugas di titik penitipan. */
  receivedAt?: string
}

export const FOUND_REPORTS: Record<string, FoundReport> = {
  'FI-T-26-0042': {
    itemId: 'FI-T-26-0042',
    finder: 'salsabila',
    reported: 'Dilaporkan 12 Okt, 11:31',
    location: 'Kantin Perpustakaan Pusat (Lt. 1)',
    status: 'Dititipkan',
    pointKey: 'posko',
    dropCode: 'DROP-4417',
    deadline: '13 Okt 2026, 11:30',
    receivedAt: '12 Okt 2026, 14:20',
  },
  'FI-T-26-0076': {
    itemId: 'FI-T-26-0076',
    finder: 'salsabila',
    reported: 'Dilaporkan 7 Okt, 13:20',
    location: 'Lab Komputer Vokasi',
    status: 'Diserahkan',
    pointKey: 'posko',
    bast: { no: 'BAST/VOK/2026/10/030', date: '9 Okt 2026' },
  },
}

/** Kandidat AI (simulasi, belum terhubung ke backend). Skor hanya untuk pemilik laporan. */
export interface Candidate {
  laporanId: string
  itemId: string
  score: number
  /** Waktu sistem menemukan kandidat ini. */
  foundAt?: string
  /** Rincian aspek kecocokan (simulasi pencocokan frontend). */
  aspects?: { key: 'kategori' | 'lokasi' | 'waktu' | 'warna'; label: string; value: string; pct: number }[]
  /** Diisi saat pemilik laporan menandai "Bukan Barang Saya". Kandidat ini tidak tampil lagi. */
  hiddenByOwner?: { reason?: string }
}

export const CANDIDATES: Candidate[] = [
  {
    laporanId: 'FI-L-26-0021',
    itemId: 'FI-T-26-0042',
    score: 87,
    foundAt: '12 Okt 2026, 15:10',
    aspects: [
      { key: 'kategori', label: 'Kategori', value: 'Botol & Wadah Minum', pct: 100 },
      { key: 'lokasi', label: 'Lokasi', value: 'Kantin Perpustakaan Pusat', pct: 95 },
      { key: 'waktu', label: 'Waktu', value: 'Ditemukan 10 menit setelah rentang hilang', pct: 90 },
      { key: 'warna', label: 'Warna & bentuk', value: 'Pink pastel, tutup putih', pct: 85 },
    ],
  },
]

/** Kandidat sebuah laporan kehilangan. Kandidat yang ditolak pemilik tidak ikut. */
export function candidatesFor(laporanId: string) {
  return CANDIDATES.filter((c) => c.laporanId === laporanId && !c.hiddenByOwner)
}

/** Kandidat untuk pasangan laporan + barang, jika masih tampil. */
export function candidateOf(laporanId: string, itemId: string) {
  return candidatesFor(laporanId).find((c) => c.itemId === itemId)
}

/** Laporan kehilangan milik pengguna yang punya kandidat barang ini (jalur Candidate Matching). */
export function relatedLostReport(user: UserKey, itemId: string) {
  return Object.values(LOST_REPORTS).find((r) => r.owner === user && !!candidateOf(r.id, itemId))
}

/** Laporan milik seorang pengguna. */
export function reportsOf(user: UserKey) {
  return {
    lost: Object.values(LOST_REPORTS).filter((r) => r.owner === user),
    found: Object.values(FOUND_REPORTS).filter((r) => r.finder === user),
  }
}

export interface Claim {
  id: string
  itemId: string
  /** Hanya klaim dari kandidat AI yang punya laporan kehilangan. */
  laporanId?: string
  path: 'kandidat' | 'langsung'
  submitted: string
  submittedShort: string
  claimant: UserKey
  /** Jadwal pengambilan. Satu jadwal per klaim; memilih ulang menimpa, tidak menambah. */
  schedule?: { day: string; time: string; pointKey: DropPointKey; dateISO?: string; chosen?: string }
  bast?: string
  /** Keputusan petugas: disetujui. Hanya petugas yang mengisi ini. */
  approval?: { decided: string; by: string }
  rejection?: { reason: string; decided: string; by: string }
  /** Permintaan bukti tambahan dari petugas, beserta kiriman pemohon jika sudah ada. */
  evidenceRequest?: {
    requested: string
    by: string
    message: string
    due?: string
    response?: { sent: string; photos: string[]; note?: string }
  }
  /** Masa berlaku tiket pengambilan. */
  ticketValidUntil?: string
  /** Isian Form Klaim (hanya jalur langsung). Ciri rahasia hanya untuk petugas. */
  answers?: { date: string; timeRange: string; location: string; secret: string; note?: string; photo?: string }
  /** Foto bukti opsional dari Confirmation Sheet (jalur kandidat). */
  evidencePhoto?: string
  /** Status pembatalan oleh pemilik (Checkpoint H). */
  cancelled?: boolean
  cancelledAt?: string
  cancelReason?: string
}

export const CLAIMS: Record<string, Claim> = {
  'FI-K-26-0188': {
    id: 'FI-K-26-0188',
    itemId: 'FI-T-26-0042',
    laporanId: 'FI-L-26-0021',
    path: 'kandidat',
    submitted: '13 Okt 2026, 09:10',
    submittedShort: '13 Okt 09:10',
    claimant: 'rara',
    approval: { decided: '13 Okt 2026, 16:30', by: 'Bambang S.' },
    schedule: { day: 'Rabu, 14 Oktober 2026', time: '10.00–12.00', pointKey: 'posko', dateISO: '2026-10-14', chosen: '13 Okt 2026, 16:45' },
    ticketValidUntil: '16 Okt 2026, 17:00',
    bast: 'BAST/VOK/2026/10/031',
  },
  'FI-K-26-0191': {
    id: 'FI-K-26-0191',
    itemId: 'FI-T-26-0095',
    path: 'langsung',
    claimant: 'fajar',
    submitted: '13 Okt 2026, 14:05',
    submittedShort: '13 Okt 14:05',
    rejection: {
      reason: 'Ciri yang disebutkan tidak sesuai dengan catatan petugas.',
      decided: '14 Okt 2026, 09:40',
      by: 'Bambang S.',
    },
  },
}

/** Klaim langsung yang tercatat untuk sebuah barang (jika ada di master data). */
export function claimForItem(itemId: string) {
  return Object.values(CLAIMS).find((c) => c.itemId === itemId && c.path === 'langsung')
}

/** Data tampilan laporan penemuan: dari daftar temuan jika ada, jika tidak dari laporan. */
export function foundView(r: FoundReport) {
  const it = getItem(r.itemId)
  return {
    name: it?.name ?? r.name ?? 'Barang temuan',
    category: (it?.category ?? r.category) as Category | undefined,
    image: it?.image ?? r.photo,
    isSensitive: it?.isSensitive ?? r.category === 'Dokumen & Kartu',
  }
}

/** Klaim milik seorang pengguna. */
export function claimsOf(user: UserKey) {
  return Object.values(CLAIMS).filter((c) => c.claimant === user)
}

/* ───────────── Status turunan (dibaca dari data, tidak disimpan terpisah) ───────────── */

export type ClaimStage = 'menunggu-verifikasi' | 'perlu-bukti-tambahan' | 'ditolak' | 'disetujui' | 'tiket-siap' | 'dibatalkan'

/** Status klaim saat ini. Tanpa keputusan petugas, klaim tetap Menunggu Verifikasi. */
export function claimStage(c: Claim): ClaimStage {
  if (c.cancelled) return 'dibatalkan'
  if (c.rejection) return 'ditolak'
  if (c.approval) return c.schedule ? 'tiket-siap' : 'disetujui'
  if (c.evidenceRequest && !c.evidenceRequest.response) return 'perlu-bukti-tambahan'
  return 'menunggu-verifikasi'
}

/** Apakah klaim pernah/sedang berada di tahap ini (untuk membuka tampilan tahap tersebut). */
export function claimSupports(c: Claim, stage: string) {
  if (c.cancelled) return stage === 'dibatalkan'
  if (stage === 'dibatalkan') return !!c.cancelled
  if (stage === 'menunggu-verifikasi') return true
  if (stage === 'perlu-bukti-tambahan') return !!c.evidenceRequest
  if (stage === 'ditolak') return !!c.rejection
  if (stage === 'disetujui') return !!c.approval
  if (stage === 'tiket-siap') return !!c.approval && !!c.schedule
  return false
}

export const CLAIM_STAGE_LABEL: Record<ClaimStage, string> = {
  'menunggu-verifikasi': 'Diajukan',
  'perlu-bukti-tambahan': 'Perlu Bukti Tambahan',
  ditolak: 'Ditolak',
  disetujui: 'Disetujui',
  'tiket-siap': 'Siap Diserahkan',
  dibatalkan: 'Dibatalkan',
}

/** Klaim yang terikat ke laporan kehilangan. */
export function claimsForReport(laporanId: string) {
  return Object.values(CLAIMS).filter((c) => c.laporanId === laporanId)
}

/** Klaim atas sebuah barang (dipakai untuk memberi tahu penemu tanpa identitas pemohon). */
export function claimsOnItem(itemId: string) {
  return Object.values(CLAIMS).filter((c) => c.itemId === itemId)
}

/** Semua kandidat sebuah barang yang masih tampil. */
export function candidatesOfItem(itemId: string) {
  return CANDIDATES.filter((c) => c.itemId === itemId && !c.hiddenByOwner)
}

/** Tahap tracker laporan (selalu empat: Dilaporkan → Kandidat Ditemukan → Verifikasi → Kembali). 1..4 */
export function lostStage(r: LostReport): 1 | 2 | 3 | 4 {
  const claims = claimsForReport(r.id).filter((c) => !c.rejection)
  if (claims.length) return 3
  if (candidatesFor(r.id).length) return 2
  return 1
}

export function foundStage(r: FoundReport): 1 | 2 | 3 | 4 {
  if (r.status === 'Diserahkan') return 4
  if (claimsOnItem(r.itemId).some((c) => !c.rejection)) return 3
  if (candidatesOfItem(r.itemId).length) return 2
  return 1
}

/** Laporan yang dimiliki pengguna (kehilangan sebagai pemilik, temuan sebagai penemu). */
export function ownsReport(user: UserKey, id: string) {
  return LOST_REPORTS[id]?.owner === user || FOUND_REPORTS[id]?.finder === user
}

/* ───────────── Waktu ───────────── */

const BLN: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11 }

/** '13 Okt 2026, 16:30' / 'Dilaporkan 12 Okt, 15:10' → Date (tahun default 2026). */
export function parseWhen(s?: string): Date | undefined {
  if (!s) return undefined
  const m = s.match(/(\d{1,2}) ([A-Z][a-z]{2})(?: (\d{4}))?(?:,? (\d{1,2})[:.](\d{2}))?/)
  if (!m || BLN[m[2]] === undefined) return undefined
  return new Date(Number(m[3] ?? 2026), BLN[m[2]], Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0))
}

/** Info layanan resmi untuk semua akun (bukan peristiwa laporan). */
export const SERVICE_INFO = [
  {
    id: 'info:jam-posko',
    at: '12 Okt 2026, 08:00',
    title: 'Jam layanan Posko Dekanat Lt. 1',
    text: 'Senin-Jumat 07.00-18.00. Sabtu, Minggu, dan hari libur tutup.',
    pointKey: 'posko' as DropPointKey,
  },
]
