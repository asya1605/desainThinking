/**
 * FoundIt Vokasi — penyimpanan laporan hasil formulir.
 *
 * SIMULASI FRONTEND: laporan disimpan di memori master data (`data.ts`)
 * selama prototipe terbuka. Belum ada backend; memuat ulang halaman
 * mengembalikan master data ke kondisi awal.
 */
import { CANDIDATES, CLAIMS, FOUND_ITEMS, FOUND_REPORTS, LOST_REPORTS, TODAY_ISO, candidateOf, type UserKey } from './data'
import { notificationsFor } from './notifications'
import { fmtDate, fmtDateTime, fmtShort, type ClaimForm, type FoundForm, type LostForm } from './forms'

const LOST_PREFIX = 'FI-L-26-'
const FOUND_PREFIX = 'FI-T-26-'

/** ID berikutnya: angka terbesar dengan prefiks yang sama + 1, empat digit. */
function nextId(prefix: string, ids: string[]) {
  const max = ids
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0)
  return prefix + String(max + 1).padStart(4, '0')
}

/** Jam demo: tanggal demo (TODAY_ISO) dengan jam saat ini. */
function demoNow() {
  const now = new Date()
  const [y, m, d] = TODAY_ISO.split('-').map(Number)
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes())
}

/**
 * Kirim laporan kehilangan. Laporan demo yang sudah ada (FI-L-26-0021)
 * diperbarui di tempat, tidak digandakan. Laporan baru mendapat ID FI-L-26-xxxx.
 */
export function submitLost(form: LostForm, owner: UserKey = 'rara'): string {
  const existing = form.reportId && LOST_REPORTS[form.reportId] && LOST_REPORTS[form.reportId].owner === owner ? LOST_REPORTS[form.reportId] : undefined
  const id = existing ? existing.id : nextId(LOST_PREFIX, Object.keys(LOST_REPORTS))
  const fields = {
    title: form.name.trim(),
    category: form.category || undefined,
    photo: form.photo ?? undefined,
    location: form.location,
    lostWhen: `${fmtDate(form.date)} · ${form.timeRange.replace(/ /g, '')}`,
    description: form.description.trim() || undefined,
    secret: form.secret.trim(),
  }
  LOST_REPORTS[id] = existing
    ? { ...existing, ...fields }
    : { id, owner, ...fields, reported: `Dilaporkan ${fmtShort(demoNow())}` }
  return id
}

/* ───────────── Klaim ───────────── */

const CLAIM_PREFIX = 'FI-K-26-'

function newClaimMeta() {
  const now = demoNow()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return {
    id: nextId(CLAIM_PREFIX, Object.keys(CLAIMS)),
    submitted: fmtDateTime(now),
    submittedShort: `${now.getDate()} Okt ${hh}:${mm}`,
  }
}

export type SubmitResult = { ok: boolean; claimId?: string; reason?: string }

/**
 * Klaim dari kandidat AI (MOB-09 → Confirmation Sheet → MOB-11).
 * Terikat ke ID laporan + ID barang. Klaim yang sudah tercatat untuk pasangan
 * yang sama dikembalikan apa adanya (demo Rara: FI-K-26-0188), tidak digandakan.
 */
export function submitCandidateClaim(laporanId: string, itemId: string, user: UserKey, evidencePhoto?: string): SubmitResult {
  const report = LOST_REPORTS[laporanId]
  if (!report) return { ok: false, reason: 'Laporan tidak ditemukan' }
  if (report.owner !== user) return { ok: false, reason: 'Laporan ini bukan milikmu' }
  const existing = Object.values(CLAIMS).find((c) => c.path === 'kandidat' && c.laporanId === laporanId && c.itemId === itemId)
  if (existing) return { ok: true, claimId: existing.id }
  if (!candidateOf(laporanId, itemId)) return { ok: false, reason: 'Barang ini bukan kandidat laporanmu' }
  const meta = newClaimMeta()
  CLAIMS[meta.id] = { ...meta, itemId, laporanId, path: 'kandidat', claimant: user, evidencePhoto }
  return { ok: true, claimId: meta.id }
}

/**
 * Klaim langsung dari Detail Barang (MOB-10 → MOB-11). Hanya untuk Civitas yang
 * tidak punya laporan kehilangan terkait barang ini. Klaim yang sudah tercatat untuk
 * pengguna + barang yang sama dikembalikan apa adanya (demo Fajar: FI-K-26-0191).
 */
export function submitDirectClaim(form: ClaimForm, user: UserKey): SubmitResult {
  const related = Object.values(LOST_REPORTS).find((r) => r.owner === user && !!candidateOf(r.id, form.itemId))
  if (related) return { ok: false, reason: `Gunakan laporan ${related.id} untuk mengklaim barang ini` }
  const existing = Object.values(CLAIMS).find((c) => c.path === 'langsung' && c.itemId === form.itemId && c.claimant === user)
  if (existing) return { ok: true, claimId: existing.id }
  if (!FOUND_ITEMS.some((it) => it.id === form.itemId)) return { ok: false, reason: 'Barang tidak ditemukan' }
  const meta = newClaimMeta()
  CLAIMS[meta.id] = {
    ...meta,
    itemId: form.itemId,
    path: 'langsung',
    claimant: user,
    answers: {
      date: form.date,
      timeRange: form.timeRange,
      location: form.location,
      secret: form.secret.trim(),
      note: form.note.trim() || undefined,
      photo: form.photo ?? undefined,
    },
  }
  return { ok: true, claimId: meta.id }
}

/* ───────────── Jadwal pengambilan ───────────── */

/** Posko Dekanat Lt. 1, Senin–Jumat 07.00–18.00. */
export const PICKUP_OPEN = 7 * 60
export const PICKUP_CLOSE = 18 * 60
export const PICKUP_SLOTS = ['08.00–10.00', '10.00–12.00', '13.00–15.00', '15.00–17.00']

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function isoToDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function dateToIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** '2026-10-14' → 'Rabu, 14 Oktober 2026' (format master data). */
export function dayLabel(iso: string) {
  const d = isoToDate(iso)
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN_PANJANG[d.getMonth()]} ${d.getFullYear()}`
}

/** Hari kerja berikutnya mulai hari ini (default 3, seperti desain). */
export function pickupDates(count = 3) {
  const out: string[] = []
  const d = isoToDate(TODAY_ISO)
  while (out.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(dateToIso(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

export function validateSchedule(dateISO: string, time: string): string | null {
  if (!dateISO) return 'Pilih tanggal pengambilan'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return 'Tanggal tidak valid'
  if (dateISO < TODAY_ISO) return 'Tanggal sudah lewat'
  const day = isoToDate(dateISO).getDay()
  if (day === 0 || day === 6) return 'Posko tutup pada Sabtu dan Minggu'
  if (!time) return 'Pilih jam pengambilan'
  const m = time.match(/^(\d{2})[.:](\d{2})\s*[–-]\s*(\d{2})[.:](\d{2})$/)
  if (!m) return 'Jam tidak valid'
  const start = Number(m[1]) * 60 + Number(m[2])
  const end = Number(m[3]) * 60 + Number(m[4])
  if (end <= start) return 'Jam tidak valid'
  if (start < PICKUP_OPEN || end > PICKUP_CLOSE) return 'Di luar jam layanan posko (07.00–18.00)'
  return null
}

/**
 * Simpan jadwal pengambilan. Hanya klaim yang sudah disetujui petugas.
 * Satu jadwal per klaim: memilih ulang menimpa jadwal lama, memilih nilai yang sama tidak mengubah apa pun.
 */
export function setSchedule(claimId: string, user: UserKey, dateISO: string, time: string): SubmitResult {
  const c = CLAIMS[claimId]
  if (!c) return { ok: false, reason: 'Klaim tidak ditemukan' }
  if (c.claimant !== user) return { ok: false, reason: 'Klaim ini bukan milikmu' }
  if (c.rejection) return { ok: false, reason: 'Klaim ditolak, jadwal tidak bisa dipilih' }
  if (!c.approval) return { ok: false, reason: 'Jadwal bisa dipilih setelah klaim disetujui petugas' }
  const err = validateSchedule(dateISO, time)
  if (err) return { ok: false, reason: err }
  if (c.schedule?.dateISO === dateISO && c.schedule.time === time) return { ok: true, claimId }
  c.schedule = { day: dayLabel(dateISO), time, pointKey: 'posko', dateISO, chosen: fmtDateTime(demoNow()) }
  return { ok: true, claimId }
}

/**
 * Isi QR tiket (prototipe, belum terhubung ke pemindai posko). Diturunkan dari ID klaim
 * dan jadwal, jadi membuka tiket berulang kali selalu menghasilkan QR yang sama.
 */
export function ticketPayload(claimId: string) {
  const c = CLAIMS[claimId]
  if (!c?.approval || !c.schedule) return null
  return `FOUNDIT|TIKET|${c.id}|${c.schedule.dateISO ?? c.schedule.day}|${c.schedule.time}`
}

export function qrSeed(payload: string) {
  let h = 0
  for (let i = 0; i < payload.length; i++) h = (h * 31 + payload.charCodeAt(i)) % 100000
  return h || 1
}

/* ───────────── Bukti tambahan ───────────── */

export function validateEvidence(photos: string[], note: string): string | null {
  if (!photos.length) return 'Tambahkan minimal 1 foto bukti'
  if (photos.length > 3) return 'Maksimal 3 foto'
  if (note.length > 300) return 'Keterangan maksimal 300 karakter'
  return null
}

/** Kirim bukti tambahan. Hanya jika petugas memang meminta. Kiriman kedua tidak menimpa yang pertama. */
export function submitEvidence(claimId: string, user: UserKey, photos: string[], note: string): SubmitResult {
  const c = CLAIMS[claimId]
  if (!c) return { ok: false, reason: 'Klaim tidak ditemukan' }
  if (c.claimant !== user) return { ok: false, reason: 'Klaim ini bukan milikmu' }
  if (!c.evidenceRequest) return { ok: false, reason: 'Petugas belum meminta bukti tambahan' }
  if (c.evidenceRequest.response) return { ok: true, claimId }
  const err = validateEvidence(photos, note)
  if (err) return { ok: false, reason: err }
  c.evidenceRequest.response = { sent: fmtDateTime(demoNow()), photos: [...photos], note: note.trim() || undefined }
  return { ok: true, claimId }
}

/* ───────────── Status baca notifikasi ───────────── */

/** Notifikasi yang sudah dibaca (awal: yang tampil sebagai dibaca di desain). */
const READ = new Set<string>(['diterima:FI-K-26-0188', 'kandidat:FI-L-26-0021:FI-T-26-0042', 'info:jam-posko'])

export function isRead(id: string) {
  return READ.has(id)
}
export function markRead(id: string) {
  READ.add(id)
}
export function markAllRead(user: UserKey) {
  for (const n of notificationsFor(user)) READ.add(n.id)
}
export function unreadCount(user: UserKey) {
  return notificationsFor(user).filter((n) => !READ.has(n.id)).length
}

/** "Bukan Barang Saya": kandidat disembunyikan dari laporan ini dan tidak muncul lagi. */
export function hideCandidate(laporanId: string, itemId: string, reason?: string) {
  const c = CANDIDATES.find((x) => x.laporanId === laporanId && x.itemId === itemId)
  if (c) c.hiddenByOwner = { reason }
}

/**
 * Kirim laporan penemuan. Barang demo yang sudah tercatat (FI-T-26-0042)
 * tidak digandakan: ID barang yang ada dikembalikan apa adanya.
 * Laporan baru mendapat ID FI-T-26-xxxx, kode DROP-xxxx, dan batas titip 1×24 jam.
 */
export function submitFound(form: FoundForm, finder: UserKey = 'salsabila'): string {
  if (form.reportId && FOUND_REPORTS[form.reportId] && FOUND_REPORTS[form.reportId].finder === finder) return form.reportId

  const id = nextId(FOUND_PREFIX, [...FOUND_ITEMS.map((it) => it.id), ...Object.keys(FOUND_REPORTS)])
  const used = new Set(Object.values(FOUND_REPORTS).map((r) => r.dropCode))
  let code = ''
  do code = `DROP-${1000 + Math.floor(Math.random() * 9000)}`
  while (used.has(code))

  const now = demoNow()
  const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  FOUND_REPORTS[id] = {
    itemId: id,
    finder,
    reported: `Dilaporkan ${fmtShort(now)}`,
    location: form.locationDetail.trim() ? `${form.location} · ${form.locationDetail.trim()}` : form.location,
    status: 'Belum Dititipkan',
    pointKey: form.point || undefined,
    dropCode: code,
    deadline: fmtDateTime(deadline),
    name: form.name.trim(),
    category: form.category || undefined,
    photo: form.photo ?? undefined,
    foundWhen: `${fmtDate(form.date)}, ${form.time}`,
    description: form.description.trim() || undefined,
    secret: form.secret.trim(),
  }
  return id
}
