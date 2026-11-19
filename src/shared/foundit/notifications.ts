/**
 * FoundIt Vokasi — notifikasi diturunkan dari peristiwa yang tercatat di master data.
 * Tidak ada notifikasi yang disimpan terpisah: tanpa peristiwa, tanpa notifikasi.
 * Status dibaca/belum dibaca disimpan di `store.ts`.
 */
import {
  CANDIDATES,
  CLAIMS,
  DROP_POINTS,
  FOUND_REPORTS,
  LOST_REPORTS,
  SERVICE_INFO,
  TODAY_ISO,
  candidatesFor,
  claimsOnItem,
  foundView,
  getItem,
  parseWhen,
  type UserKey,
} from './data'

export type NotifKind = 'jadwal' | 'disetujui' | 'ditolak' | 'bukti' | 'diterima' | 'kandidat' | 'temuan-diterima' | 'temuan-diklaim' | 'info'

/** Halaman tujuan, selalu dengan ID. */
export type NotifTarget =
  | { f: 'statusKlaim'; claimId: string; state: string }
  | { f: 'bandingkan'; laporanId: string; itemId: string }
  | { f: 'detailLaporan'; laporanId: string }
  | { f: 'detailTitik'; pointKey: string }

export interface Notif {
  id: string
  kind: NotifKind
  at: Date
  title: string
  text?: string
  /** Referensi ID yang ditampilkan di kartu. */
  ref?: string
  image?: string
  target: NotifTarget
  category: 'Klaim' | 'Laporan' | 'Info'
}

const name = (itemId: string) => {
  const it = getItem(itemId)
  return it ? (it.isSensitive ? 'Detail disembunyikan' : it.name) : itemId
}

/** Notifikasi milik satu akun, terbaru di atas. */
export function notificationsFor(user: UserKey): Notif[] {
  const out: Notif[] = []
  const push = (n: Omit<Notif, 'at'> & { at?: Date }) => {
    if (n.at) out.push(n as Notif)
  }

  // Pemilik laporan kehilangan: kandidat baru (skor hanya untuk pemilik).
  for (const r of Object.values(LOST_REPORTS).filter((x) => x.owner === user)) {
    for (const c of candidatesFor(r.id)) {
      const it = getItem(c.itemId)
      push({
        id: `kandidat:${r.id}:${c.itemId}`,
        kind: 'kandidat',
        at: parseWhen(c.foundAt),
        title: `Ada barang yang mirip dengan laporanmu (${c.score}%)`,
        text: it && !it.isSensitive ? it.location : undefined,
        ref: r.id,
        image: it && !it.isSensitive ? it.image : undefined,
        target: { f: 'bandingkan', laporanId: r.id, itemId: c.itemId },
        category: 'Laporan',
      })
    }
  }

  // Pemohon klaim: diterima, bukti, keputusan, jadwal.
  for (const k of Object.values(CLAIMS).filter((x) => x.claimant === user)) {
    const item = name(k.itemId)
    push({
      id: `diterima:${k.id}`,
      kind: 'diterima',
      at: parseWhen(k.submitted),
      title: 'Klaim diterima petugas',
      text: 'Petugas akan memeriksa klaimmu pada jam layanan.',
      ref: k.id,
      target: { f: 'statusKlaim', claimId: k.id, state: 'menunggu-verifikasi' },
      category: 'Klaim',
    })
    if (k.evidenceRequest) {
      push({
        id: `bukti:${k.id}`,
        kind: 'bukti',
        at: parseWhen(k.evidenceRequest.requested),
        title: 'Petugas meminta bukti tambahan',
        text: `${item} · ${k.id}`,
        ref: k.id,
        target: { f: 'statusKlaim', claimId: k.id, state: 'perlu-bukti-tambahan' },
        category: 'Klaim',
      })
    }
    if (k.rejection) {
      push({
        id: `ditolak:${k.id}`,
        kind: 'ditolak',
        at: parseWhen(k.rejection.decided),
        title: 'Klaim ditolak petugas',
        text: `${item} · ${k.id}`,
        ref: k.id,
        target: { f: 'statusKlaim', claimId: k.id, state: 'ditolak' },
        category: 'Klaim',
      })
    }
    if (k.approval) {
      push({
        id: `disetujui:${k.id}`,
        kind: 'disetujui',
        at: parseWhen(k.approval.decided),
        title: k.schedule ? 'Klaim disetujui petugas' : 'Klaim disetujui! Pilih jadwal pengambilan',
        text: `${item} · ${k.id}`,
        ref: k.id,
        target: { f: 'statusKlaim', claimId: k.id, state: 'disetujui' },
        category: 'Klaim',
      })
    }
    // Pengingat hanya pada hari jadwal (atau sesudahnya), pukul buka posko.
    if (k.approval && k.schedule?.dateISO && k.schedule.dateISO <= TODAY_ISO) {
      const [y, m, d] = k.schedule.dateISO.split('-').map(Number)
      const point = DROP_POINTS[k.schedule.pointKey]
      push({
        id: `jadwal:${k.id}:${k.schedule.dateISO}`,
        kind: 'jadwal',
        at: new Date(y, m - 1, d, 7, 0),
        title: k.schedule.dateISO === TODAY_ISO ? `Hari ini jadwal ambil ${item}` : `Jadwal ambil ${item}`,
        text: `${point.name}, ${k.schedule.time}. Bawa KTM dan QR tiket.`,
        ref: k.id,
        target: { f: 'statusKlaim', claimId: k.id, state: 'tiket-siap' },
        category: 'Klaim',
      })
    }
  }

  // Penemu: barang diterima petugas, dan ada klaim (tanpa identitas pemohon).
  for (const r of Object.values(FOUND_REPORTS).filter((x) => x.finder === user)) {
    const v = foundView(r)
    const label = v.isSensitive ? 'Detail disembunyikan' : v.name
    if (r.receivedAt) {
      push({
        id: `temuan-diterima:${r.itemId}`,
        kind: 'temuan-diterima',
        at: parseWhen(r.receivedAt),
        title: 'Barang temuanmu diterima petugas',
        text: `${label} · ${r.pointKey ? DROP_POINTS[r.pointKey].name : ''}`,
        ref: r.itemId,
        target: { f: 'detailLaporan', laporanId: r.itemId },
        category: 'Laporan',
      })
    }
    const first = claimsOnItem(r.itemId).sort((a, b) => (parseWhen(a.submitted)?.getTime() ?? 0) - (parseWhen(b.submitted)?.getTime() ?? 0))[0]
    if (first) {
      push({
        id: `temuan-diklaim:${r.itemId}`,
        kind: 'temuan-diklaim',
        at: parseWhen(first.submitted),
        title: 'Ada yang mengajukan klaim atas temuanmu',
        text: 'Petugas sedang memverifikasi. Identitas pemohon tidak ditampilkan.',
        ref: r.itemId,
        target: { f: 'detailLaporan', laporanId: r.itemId },
        category: 'Laporan',
      })
    }
  }

  for (const s of SERVICE_INFO) {
    push({ id: s.id, kind: 'info', at: parseWhen(s.at), title: s.title, text: s.text, target: { f: 'detailTitik', pointKey: s.pointKey }, category: 'Info' })
  }

  return out.sort((a, b) => b.at.getTime() - a.at.getTime())
}

/** Kandidat yang dirujuk sebuah notifikasi masih ada? Dipakai untuk fallback aman. */
export function targetExists(t: NotifTarget): boolean {
  if (t.f === 'statusKlaim') return !!CLAIMS[t.claimId]
  if (t.f === 'bandingkan') return CANDIDATES.some((c) => c.laporanId === t.laporanId && c.itemId === t.itemId && !c.hiddenByOwner)
  if (t.f === 'detailLaporan') return !!LOST_REPORTS[t.laporanId] || !!FOUND_REPORTS[t.laporanId]
  return !!DROP_POINTS[t.pointKey as keyof typeof DROP_POINTS]
}
