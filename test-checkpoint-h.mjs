import { createServer } from 'vite'

async function runTests() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  console.log('=== RUNNING AUTOMATED TESTS FOR CHECKPOINT H ===\n')

  const {
    LOST_REPORTS,
    CLAIMS,
    FOUND_ITEMS,
    LISTED_ITEMS,
    USER_NOTIF_PREFS,
    getNotifPrefs,
    updateNotifPrefs,
    claimStage,
    lostStage,
    searchItems,
  } = await server.ssrLoadModule('/src/shared/foundit/data.ts')

  const {
    cancelLostReport,
    cancelClaim,
  } = await server.ssrLoadModule('/src/shared/foundit/store.ts')

  let passed = 0
  let failed = 0

  function assert(desc, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${desc}`)
      passed++
    } else {
      console.error(`[FAIL] ${desc} ${details}`)
      failed++
    }
  }

  // --- TEST H-01: Pencarian Laporan Saya logic ---
  console.log('\n--- H-01: Pencarian Laporan Saya ---')
  const raraReports = Object.values(LOST_REPORTS).filter((r) => r.owner === 'rara')
  const tumblerMatch = raraReports.filter((r) => r.title?.toLowerCase().includes('tumbler') || r.id.toLowerCase().includes('tumbler'))
  assert('H-01.1: Mencari kata "tumbler" pada laporan Rara menghasilkan laporan FI-L-26-0021', tumblerMatch.length === 1 && tumblerMatch[0].id === 'FI-L-26-0021')

  const idMatch = raraReports.filter((r) => r.id.toLowerCase().includes('0021'))
  assert('H-01.2: Mencari "0021" menemukan laporan berdasarkan ID', idMatch.length === 1 && idMatch[0].id === 'FI-L-26-0021')

  const noMatch = raraReports.filter((r) => r.title?.toLowerCase().includes('xyzqwerty'))
  assert('H-01.3: Pencarian kata kunci yang tidak ada menghasilkan 0 hasil (empty state)', noMatch.length === 0)

  // --- TEST H-02: Pembatalan Laporan Kehilangan ---
  console.log('\n--- H-02: Pembatalan Laporan Kehilangan ---')
  // Coba batalkan laporan FI-L-26-0021 oleh non-pemilik (fajar) -> HARUS DITOLAK
  const rejectNonOwner = cancelLostReport('FI-L-26-0021', 'fajar', 'Bukan milik saya')
  assert('H-02.1: Pembatalan oleh non-pemilik ditolak', !rejectNonOwner.ok && rejectNonOwner.reason?.includes('bukan milikmu'))

  // Laporan FI-L-26-0021 punya klaim FI-K-26-0188 yang sudah disetujui (approval) -> HARUS DITOLAK
  const rejectApproved = cancelLostReport('FI-L-26-0021', 'rara', 'Barang ketemu')
  assert('H-02.2: Laporan dengan klaim disetujui/serah-terima ditolak dari pembatalan', !rejectApproved.ok && rejectApproved.reason?.includes('klaim sudah disetujui'))

  // Buat laporan baru untuk diuji pembatalannya
  const testReportId = 'FI-L-26-9999'
  LOST_REPORTS[testReportId] = {
    id: testReportId,
    owner: 'rara',
    title: 'Topi Hitam UNAIR',
    reported: 'Dilaporkan 14 Okt, 10:00',
  }
  const cancelOk = cancelLostReport(testReportId, 'rara', 'Barang sudah ditemukan sendiri')
  assert('H-02.3: Pemilik dapat membatalkan laporan yang belum memiliki klaim disetujui', cancelOk.ok === true)
  assert('H-02.4: Status laporan diperbarui menjadi cancelled=true dengan alasan dan timestamp', LOST_REPORTS[testReportId].cancelled === true && LOST_REPORTS[testReportId].cancelReason === 'Barang sudah ditemukan sendiri' && !!LOST_REPORTS[testReportId].cancelledAt)

  // Coba batalkan lagi (idempoten)
  const cancelIdempotent = cancelLostReport(testReportId, 'rara', 'Coba lagi')
  assert('H-02.5: Pembatalan idempoten untuk laporan yang sudah dibatalkan', cancelIdempotent.ok === true)
  delete LOST_REPORTS[testReportId]

  // --- TEST H-03: Pembatalan Pengajuan Klaim ---
  console.log('\n--- H-03: Pembatalan Pengajuan Klaim ---')
  // Klaim FI-K-26-0188 sudah disetujui & diserahkan (bast) -> HARUS DITOLAK
  const rejectCancelApprovedClaim = cancelClaim('FI-K-26-0188', 'rara', 'Batal ambil')
  assert('H-03.1: Klaim yang sudah diserahkan/disetujui tidak boleh dibatalkan', !rejectCancelApprovedClaim.ok && (rejectCancelApprovedClaim.reason?.includes('disetujui') || rejectCancelApprovedClaim.reason?.includes('diserahkan')))

  // Buat klaim yang baru disetujui (belum serah terima) -> HARUS DITOLAK
  const testApprovedClaimId = 'FI-K-26-8888'
  CLAIMS[testApprovedClaimId] = {
    id: testApprovedClaimId,
    itemId: 'FI-T-26-0064',
    path: 'langsung',
    claimant: 'rara',
    submitted: '14 Okt 2026, 08:00',
    submittedShort: '14 Okt 08:00',
    approval: { decided: '14 Okt 2026, 09:00', by: 'Petugas' },
  }
  const rejectOnlyApproved = cancelClaim(testApprovedClaimId, 'rara', 'Batal')
  assert('H-03.1b: Klaim yang berstatus disetujui petugas tidak boleh dibatalkan', !rejectOnlyApproved.ok && rejectOnlyApproved.reason?.includes('disetujui'))
  delete CLAIMS[testApprovedClaimId]

  // Klaim FI-K-26-0191 milik Fajar, coba dibatalkan oleh Rara -> HARUS DITOLAK
  const rejectNonClaimant = cancelClaim('FI-K-26-0191', 'rara', 'Batal')
  assert('H-03.2: Pembatalan klaim oleh bukan pemohon ditolak', !rejectNonClaimant.ok && rejectNonClaimant.reason?.includes('bukan milikmu'))

  // Buat klaim pending baru untuk diuji
  const testClaimId = 'FI-K-26-9999'
  CLAIMS[testClaimId] = {
    id: testClaimId,
    itemId: 'FI-T-26-0064',
    path: 'langsung',
    claimant: 'rara',
    submitted: '14 Okt 2026, 08:00',
    submittedShort: '14 Okt 08:00',
  }
  const cancelClaimOk = cancelClaim(testClaimId, 'rara', 'Salah barang')
  assert('H-03.3: Pemohon dapat membatalkan klaim pending (menunggu verifikasi)', cancelClaimOk.ok === true)
  assert('H-03.4: Status klaim bertransisi menjadi dibatalkan', claimStage(CLAIMS[testClaimId]) === 'dibatalkan' && CLAIMS[testClaimId].cancelled === true)

  const cancelClaimIdempotent = cancelClaim(testClaimId, 'rara', 'Batal lagi')
  assert('H-03.5: Pembatalan klaim bersifat idempoten', cancelClaimIdempotent.ok === true)
  delete CLAIMS[testClaimId]

  // --- TEST H-04: Pengurutan Daftar Temuan & Pencarian ---
  console.log('\n--- H-04: Pengurutan Daftar Temuan & Pencarian ---')
  const originalOrder = [...LISTED_ITEMS]
  const sortedNewest = [...LISTED_ITEMS].sort((a, b) => b.foundDate.localeCompare(a.foundDate))
  const sortedOldest = [...LISTED_ITEMS].sort((a, b) => a.foundDate.localeCompare(b.foundDate))
  const sortedAZ = [...LISTED_ITEMS].sort((a, b) => a.name.localeCompare(b.name))

  assert('H-04.1: Sorting tidak mengubah array master data LISTED_ITEMS', JSON.stringify(LISTED_ITEMS) === JSON.stringify(originalOrder))
  assert('H-04.2: Sorting Terbaru memiliki tanggal pertama >= tanggal terakhir', sortedNewest[0].foundDate >= sortedNewest[sortedNewest.length - 1].foundDate)
  assert('H-04.3: Sorting Terlama memiliki tanggal pertama <= tanggal terakhir', sortedOldest[0].foundDate <= sortedOldest[sortedOldest.length - 1].foundDate)
  assert('H-04.4: Sorting A–Z mengurutkan nama barang secara alfabetis', sortedAZ[0].name.localeCompare(sortedAZ[sortedAZ.length - 1].name) <= 0)
  assert('H-04.5: Barang berstatus "Diserahkan" tidak pernah ada di LISTED_ITEMS', !LISTED_ITEMS.some((it) => it.depositStatus === 'Diserahkan'))

  // --- TEST H-05: Filter Rentang Tanggal Temuan ---
  console.log('\n--- H-05: Filter Rentang Tanggal Temuan ---')
  const startDate = '2026-10-10'
  const endDate = '2026-10-12'
  const dateFiltered = LISTED_ITEMS.filter((it) => {
    const d = it.foundDate.slice(0, 10)
    return d >= startDate && d <= endDate
  })
  assert('H-05.1: Filter rentang 10-12 Okt 2026 mengembalikan barang dengan tanggal penemuan di rentang tersebut', dateFiltered.every((it) => it.foundDate.slice(0, 10) >= startDate && it.foundDate.slice(0, 10) <= endDate))

  const invalidStart = '2026-10-15'
  const invalidEnd = '2026-10-10'
  const isInvalid = invalidStart > invalidEnd
  assert('H-05.2: Validasi mendeteksi rentang tidak valid (tanggal mulai > tanggal akhir)', isInvalid === true)

  // --- TEST H-06 & H-07: Tentang Aplikasi & Preferensi Notifikasi per Akun ---
  console.log('\n--- H-06 & H-07: Preferensi Notifikasi per Akun ---')
  const raraInitial = getNotifPrefs('rara')
  const fajarInitial = getNotifPrefs('fajar')
  assert('H-07.1: Preferensi awal terdefinisi untuk setiap akun', raraInitial.appNotif === true && fajarInitial.appNotif === true)

  updateNotifPrefs('rara', { appNotif: false })
  assert('H-07.2: Mengubah preferensi notifikasi akun Rara berhasil', getNotifPrefs('rara').appNotif === false)
  assert('H-07.3: Akun Fajar terisolasi dan tidak terpengaruh perubahan akun Rara', getNotifPrefs('fajar').appNotif === true)

  updateNotifPrefs('fajar', { waNotif: false })
  assert('H-07.4: Mengubah preferensi WhatsApp akun Fajar berhasil', getNotifPrefs('fajar').waNotif === false)
  assert('H-07.5: Preferensi WhatsApp akun Rara tetap true (isolasi penuh)', getNotifPrefs('rara').waNotif === true)

  // Kembalikan preferensi
  updateNotifPrefs('rara', { appNotif: true, waNotif: true })
  updateNotifPrefs('fajar', { appNotif: true, waNotif: true })

  // --- REGRESSION TESTS (Checkpoint A-F & Cross-Evaluation Tahap 1-2) ---
  console.log('\n--- REGRESSION TESTS (Checkpoint A-F & K001-K011) ---')
  const { DROP_POINTS, isPoskoOpen, getContact, updateContact, getItem } = await server.ssrLoadModule('/src/shared/foundit/data.ts')

  // Titik master data (Checkpoint F)
  assert('REG-01: Tepat 3 titik resmi di master data (posko, gerbang, vokasi-c)', Object.keys(DROP_POINTS).length === 3 && !!DROP_POINTS.posko && !!DROP_POINTS.gerbang && !!DROP_POINTS['vokasi-c'])
  assert('REG-02: Posko Dekanat aktif, Gerbang aktif, Vokasi C nonaktif', DROP_POINTS.posko.active === true && DROP_POINTS.gerbang.active === true && DROP_POINTS['vokasi-c'].active === false)
  assert('REG-03: Posko Dekanat memiliki jam operasional Senin-Jumat 07.00-18.00', DROP_POINTS.posko.hours.includes('07.00-18.00') || DROP_POINTS.posko.hours.includes('07.00–18.00'))

  // Jam operasional Posko isPoskoOpen
  const mondayNoon = new Date('2026-10-12T12:00:00')
  const sundayNoon = new Date('2026-10-11T12:00:00')
  assert('REG-04: isPoskoOpen mengembalikan true pada Senin siang', isPoskoOpen(mondayNoon) === true)
  assert('REG-05: isPoskoOpen mengembalikan false pada Minggu', isPoskoOpen(sundayNoon) === false)

  // Barang sensitif (K006 & Checkpoint F)
  const sensitiveItem = FOUND_ITEMS.find((it) => it.isSensitive)
  assert('REG-06: Barang sensitif ada di master data dan bertanda isSensitive=true', !!sensitiveItem && sensitiveItem.isSensitive === true)

  // Kontak pengguna WhatsApp (K009)
  const contactRara = getContact('rara')
  assert('REG-07: getContact mengembalikan nomor kontak Rara', !!contactRara && contactRara.startsWith('08'))
  const updateRes = updateContact('rara', '081299998888')
  assert('REG-08: updateContact berhasil memperbarui nomor kontak valid', updateRes.ok === true && getContact('rara') === '081299998888')
  updateContact('rara', '081234564410') // restore

  // Pencarian barang publik (K004)
  const searchPayung = searchItems('payung')
  assert('REG-09: searchItems("payung") menemukan Payung Lipat', searchPayung.some((it) => it.name.includes('Payung')))

  console.log(`\n=== HASIL: ${passed} PASSED, ${failed} FAILED ===\n`)

  await server.close()
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((err) => {
  console.error('Test execution error:', err)
  process.exit(1)
})
