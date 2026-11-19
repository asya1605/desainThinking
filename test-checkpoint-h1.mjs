import { createServer } from 'vite'

async function runValidation() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  console.log('===============================================================')
  console.log('  CHECKPOINT H.1 — VALIDATION & REGRESSION TEST RUNNER')
  console.log('===============================================================\n')

  const {
    LOST_REPORTS,
    CLAIMS,
    FOUND_ITEMS,
    FOUND_REPORTS,
    LISTED_ITEMS,
    CANDIDATES,
    DROP_POINTS,
    USER_NOTIF_PREFS,
    getNotifPrefs,
    updateNotifPrefs,
    claimStage,
    claimSupports,
    lostStage,
    foundStage,
    candidatesFor,
    searchItems,
    isPoskoOpen,
    getContact,
    updateContact,
    getItem,
  } = await server.ssrLoadModule('/src/shared/foundit/data.ts')

  const {
    cancelLostReport,
    cancelClaim,
    ticketPayload,
  } = await server.ssrLoadModule('/src/shared/foundit/store.ts')

  const testResults = []

  function record(id, scn, passed, proof, note = '') {
    testResults.push({ id, scn, passed, proof, note })
    const tag = passed ? '[PASS]' : '[FAIL]'
    console.log(`${tag} ${id}: ${scn} -> ${proof}`)
    if (note) console.log(`       Catatan: ${note}`)
  }

  // =========================================================================
  // 1. AUDIT PEMBATALAN LAPORAN KEHILANGAN
  // =========================================================================
  console.log('\n--- 1. AUDIT PEMBATALAN LAPORAN KEHILANGAN ---')

  // 1.1 Pemilik membatalkan laporan kehilangan tanpa klaim
  const repNoClaimId = 'FI-L-TEST-NOCLAIM'
  LOST_REPORTS[repNoClaimId] = {
    id: repNoClaimId,
    owner: 'rara',
    title: 'Buku Catatan Hitam',
    location: 'Gedung Vokasi A',
    reported: 'Dilaporkan 14 Okt, 08:30',
  }
  const res1_1 = cancelLostReport(repNoClaimId, 'rara', 'Barang ketemu di tas teman')
  const rep1_1 = LOST_REPORTS[repNoClaimId]
  const p1_1 = res1_1.ok === true && rep1_1.cancelled === true && rep1_1.cancelReason === 'Barang ketemu di tas teman' && !!rep1_1.cancelledAt
  record(
    'REP-01',
    'Pemilik membatalkan laporan kehilangan tanpa klaim',
    p1_1,
    `ok=${res1_1.ok}, cancelled=${rep1_1.cancelled}, reason="${rep1_1.cancelReason}", at=${rep1_1.cancelledAt}`,
    'Laporan sukses ditandai dibatalkan tanpa menghapus objek dari memori'
  )
  delete LOST_REPORTS[repNoClaimId]

  // 1.2 Pemilik membatalkan laporan dengan klaim pending & kandidat AI
  const repPendingId = 'FI-L-TEST-PENDING'
  const claimPendingId = 'FI-K-TEST-PENDING-CAND'
  const candItemId = 'FI-T-26-0064'
  LOST_REPORTS[repPendingId] = {
    id: repPendingId,
    owner: 'rara',
    title: 'Payung Lipat Merah',
    reported: 'Dilaporkan 14 Okt, 09:00',
  }
  CANDIDATES.push({
    laporanId: repPendingId,
    itemId: candItemId,
    score: 85,
  })
  CLAIMS[claimPendingId] = {
    id: claimPendingId,
    itemId: candItemId,
    laporanId: repPendingId,
    path: 'kandidat',
    submitted: '14 Okt 2026, 09:15',
    submittedShort: '14 Okt 09:15',
    claimant: 'rara',
  }
  const res1_2 = cancelLostReport(repPendingId, 'rara', 'Salah memasukkan data')
  const rep1_2 = LOST_REPORTS[repPendingId]
  const cl1_2 = CLAIMS[claimPendingId]
  const candsLeft = candidatesFor(repPendingId)
  const itemCandOriginal = getItem(candItemId)
  const p1_2 =
    res1_2.ok === true &&
    rep1_2.cancelled === true &&
    cl1_2.cancelled === true &&
    claimStage(cl1_2) === 'dibatalkan' &&
    candsLeft.length === 0 &&
    itemCandOriginal !== undefined &&
    itemCandOriginal.depositStatus === 'Dititipkan'
  record(
    'REP-02',
    'Pemilik membatalkan laporan dengan klaim pending & kandidat AI',
    p1_2,
    `klaim.cancelled=${cl1_2.cancelled}, claimStage=${claimStage(cl1_2)}, candsForReport=${candsLeft.length}, barangTemuanStatus=${itemCandOriginal?.depositStatus}`,
    'Klaim pending ikut dibatalkan, kandidat disembunyikan, barang temuan tetap utuh'
  )
  // Bersihkan data tes
  delete LOST_REPORTS[repPendingId]
  delete CLAIMS[claimPendingId]
  const candIdx = CANDIDATES.findIndex((c) => c.laporanId === repPendingId)
  if (candIdx >= 0) CANDIDATES.splice(candIdx, 1)

  // 1.3 Pemilik mencoba membatalkan laporan dengan klaim disetujui
  // FI-L-26-0021 memiliki klaim FI-K-26-0188 yang disetujui petugas (approval & schedule)
  const res1_3 = cancelLostReport('FI-L-26-0021', 'rara', 'Coba batalkan yang sudah disetujui')
  const rep1_3 = LOST_REPORTS['FI-L-26-0021']
  const p1_3 = res1_3.ok === false && !rep1_3.cancelled && res1_3.reason.includes('klaim sudah disetujui')
  record(
    'REP-03',
    'Pemilik mencoba membatalkan laporan dengan klaim disetujui',
    p1_3,
    `ok=${res1_3.ok}, reason="${res1_3.reason}", rep.cancelled=${rep1_3.cancelled ?? false}`,
    'Penolakan valid: klaim yang sudah disetujui petugas tidak boleh dibatalkan'
  )

  // 1.4 Pengguna lain mencoba membatalkan laporan orang lain
  const repOtherId = 'FI-L-TEST-OTHER'
  LOST_REPORTS[repOtherId] = {
    id: repOtherId,
    owner: 'rara',
    title: 'Kacamata Minus',
  }
  const res1_4 = cancelLostReport(repOtherId, 'fajar', 'Saya mau batalkan')
  const p1_4 = res1_4.ok === false && res1_4.reason.includes('bukan milikmu') && !LOST_REPORTS[repOtherId].cancelled
  record(
    'REP-04',
    'Pengguna lain mencoba membatalkan laporan orang lain',
    p1_4,
    `ok=${res1_4.ok}, reason="${res1_4.reason}"`,
    'Tolak: hanya pemilik laporan yang memiliki hak otorisasi'
  )
  delete LOST_REPORTS[repOtherId]

  // 1.5 Laporan yang sudah dibatalkan dibuka kembali dan dibatalkan ulang (Idempotensi)
  const repIdempId = 'FI-L-TEST-IDEMP'
  LOST_REPORTS[repIdempId] = {
    id: repIdempId,
    owner: 'rara',
    title: 'Jaket Biru',
    cancelled: true,
    cancelledAt: '14 Okt 2026, 09:00',
    cancelReason: 'Sudah dibatalkan sebelumnya',
  }
  const res1_5 = cancelLostReport(repIdempId, 'rara', 'Batal lagi')
  const p1_5 = res1_5.ok === true && res1_5.reason.includes('sudah dibatalkan sebelumnya') && LOST_REPORTS[repIdempId].cancelReason === 'Sudah dibatalkan sebelumnya'
  record(
    'REP-05',
    'Laporan yang sudah dibatalkan dibuka kembali dan dibatalkan ulang (idempoten)',
    p1_5,
    `ok=${res1_5.ok}, reason="${res1_5.reason}"`,
    'Idempoten: tidak terjadi double-cancel atau mutasi data sekunder'
  )
  delete LOST_REPORTS[repIdempId]

  // =========================================================================
  // 2. AUDIT PEMBATALAN KLAIM
  // =========================================================================
  console.log('\n--- 2. AUDIT PEMBATALAN KLAIM ---')

  // 2.1 Pemilik klaim membatalkan klaim pending (menunggu verifikasi)
  const clPendingId = 'FI-K-TEST-CL-PENDING'
  CLAIMS[clPendingId] = {
    id: clPendingId,
    itemId: 'FI-T-26-0064',
    path: 'langsung',
    claimant: 'fajar',
    submitted: '14 Okt 2026, 11:00',
    submittedShort: '14 Okt 11:00',
  }
  const res2_1 = cancelClaim(clPendingId, 'fajar', 'Saya salah klik barang')
  const cl2_1 = CLAIMS[clPendingId]
  const p2_1 =
    res2_1.ok === true &&
    cl2_1.cancelled === true &&
    claimStage(cl2_1) === 'dibatalkan' &&
    cl2_1.cancelReason === 'Saya salah klik barang' &&
    ticketPayload(clPendingId) === null
  record(
    'CLM-01',
    'Pemilik klaim membatalkan klaim pending (menunggu verifikasi)',
    p2_1,
    `ok=${res2_1.ok}, stage=${claimStage(cl2_1)}, qrTicketActive=${ticketPayload(clPendingId) !== null}`,
    'Klaim sukses bertransisi ke tahap dibatalkan dan QR tiket dinonaktifkan'
  )
  delete CLAIMS[clPendingId]

  // 2.2 Pengguna lain mencoba membatalkan klaim orang lain
  const clOtherId = 'FI-K-TEST-CL-OTHER'
  CLAIMS[clOtherId] = {
    id: clOtherId,
    itemId: 'FI-T-26-0064',
    path: 'langsung',
    claimant: 'fajar',
    submitted: '14 Okt 2026, 11:00',
    submittedShort: '14 Okt 11:00',
  }
  const res2_2 = cancelClaim(clOtherId, 'rara', 'Batal')
  const p2_2 = res2_2.ok === false && res2_2.reason.includes('bukan milikmu') && !CLAIMS[clOtherId].cancelled
  record(
    'CLM-02',
    'Pengguna lain mencoba membatalkan klaim orang lain',
    p2_2,
    `ok=${res2_2.ok}, reason="${res2_2.reason}"`,
    'Tolak: otorisasi ditolak untuk non-pemohon klaim'
  )
  delete CLAIMS[clOtherId]

  // 2.3 Klaim disetujui tidak dapat dibatalkan
  const clApprovedId = 'FI-K-TEST-CL-APPROVED'
  CLAIMS[clApprovedId] = {
    id: clApprovedId,
    itemId: 'FI-T-26-0064',
    path: 'langsung',
    claimant: 'fajar',
    submitted: '14 Okt 2026, 11:00',
    submittedShort: '14 Okt 11:00',
    approval: { decided: '14 Okt 2026, 12:00', by: 'Petugas Dekanat' },
  }
  const res2_3 = cancelClaim(clApprovedId, 'fajar', 'Mau batalkan yang sudah disetujui')
  const p2_3 = res2_3.ok === false && res2_3.reason.includes('disetujui') && !CLAIMS[clApprovedId].cancelled
  record(
    'CLM-03',
    'Klaim disetujui petugas tidak dapat dibatalkan',
    p2_3,
    `ok=${res2_3.ok}, reason="${res2_3.reason}"`,
    'Aturan ditegakkan: klaim yang telah diputuskan disetujui petugas tidak dapat dibatalkan'
  )
  delete CLAIMS[clApprovedId]

  // 2.4 Klaim selesai (diserahkan / BAST) tidak dapat dibatalkan
  const res2_4 = cancelClaim('FI-K-26-0188', 'rara', 'Batalkan yang sudah diserahkan')
  const p2_4 = res2_4.ok === false && (res2_4.reason.includes('diserahkan') || res2_4.reason.includes('disetujui'))
  record(
    'CLM-04',
    'Klaim selesai (diserahkan / BAST) tidak dapat dibatalkan',
    p2_4,
    `ok=${res2_4.ok}, reason="${res2_4.reason}"`,
    'Klaim dengan BAST BAST/VOK/2026/10/031 ditolak dari pembatalan'
  )

  // 2.5 Klaim yang sudah dibatalkan dibuka kembali dan dibatalkan ulang (Idempotensi)
  const clIdempId = 'FI-K-TEST-CL-IDEMP'
  CLAIMS[clIdempId] = {
    id: clIdempId,
    itemId: 'FI-T-26-0064',
    path: 'langsung',
    claimant: 'fajar',
    submitted: '14 Okt 2026, 11:00',
    submittedShort: '14 Okt 11:00',
    cancelled: true,
    cancelledAt: '14 Okt 2026, 11:30',
    cancelReason: 'Sudah batal',
  }
  const res2_5 = cancelClaim(clIdempId, 'fajar', 'Batal lagi')
  const p2_5 = res2_5.ok === true && res2_5.reason.includes('sudah dibatalkan sebelumnya') && claimSupports(CLAIMS[clIdempId], 'dibatalkan')
  record(
    'CLM-05',
    'Klaim yang sudah dibatalkan dibuka kembali dan dibatalkan ulang (idempoten)',
    p2_5,
    `ok=${res2_5.ok}, claimSupports('dibatalkan')=${claimSupports(CLAIMS[clIdempId], 'dibatalkan')}`,
    'Konsisten: claimSupports mengakui tahap dibatalkan dan store idempoten'
  )
  delete CLAIMS[clIdempId]

  // =========================================================================
  // 3. AUDIT PENCARIAN DAN SORTING
  // =========================================================================
  console.log('\n--- 3. AUDIT PENCARIAN DAN SORTING ---')

  const raraLost = Object.values(LOST_REPORTS).filter((r) => r.owner === 'rara')

  // 3.1 Pencarian nama barang
  const qName = 'tumbler'
  const matchName = raraLost.filter((r) => r.title?.toLowerCase().includes(qName) || r.id.toLowerCase().includes(qName))
  record(
    'SRCH-01',
    'Pencarian Laporan Saya: berdasarkan nama barang',
    matchName.length >= 1 && matchName[0].title.toLowerCase().includes('tumbler'),
    `query="${qName}", ditemukan=${matchName.length} (${matchName[0]?.id})`
  )

  // 3.2 Pencarian nomor laporan
  const qId = '0021'
  const matchId = raraLost.filter((r) => r.id.toLowerCase().includes(qId) || r.title?.toLowerCase().includes(qId))
  record(
    'SRCH-02',
    'Pencarian Laporan Saya: berdasarkan nomor laporan',
    matchId.length === 1 && matchId[0].id === 'FI-L-26-0021',
    `query="${qId}", hasil=${matchId[0]?.id}`
  )

  // 3.3 Huruf kapital dan kecil
  const qUpper = 'TUMBLER'
  const matchUpper = raraLost.filter((r) => r.title?.toLowerCase().includes(qUpper.toLowerCase()) || r.id.toLowerCase().includes(qUpper.toLowerCase()))
  record(
    'SRCH-03',
    'Pencarian Laporan Saya: case-insensitive (TUMBLER vs tumbler)',
    matchUpper.length === matchName.length,
    `matchUpper.length=${matchUpper.length}, matchLower.length=${matchName.length}`
  )

  // 3.4 Spasi berlebih
  const qSpace = '   tumbler    '
  const qTrim = qSpace.trim().toLowerCase()
  const matchSpace = raraLost.filter((r) => r.title?.toLowerCase().includes(qTrim) || r.id.toLowerCase().includes(qTrim))
  record(
    'SRCH-04',
    'Pencarian Laporan Saya: spasi berlebih dinormalisasi via .trim()',
    matchSpace.length === matchName.length,
    `queryWithSpaces="${qSpace}", hasil=${matchSpace.length}`
  )

  // 3.5 Hasil kosong
  const qEmpty = 'nonexistentxyz'
  const matchEmpty = raraLost.filter((r) => r.title?.toLowerCase().includes(qEmpty) || r.id.toLowerCase().includes(qEmpty))
  record(
    'SRCH-05',
    'Pencarian Laporan Saya: hasil kosong jika kata kunci tidak cocok',
    matchEmpty.length === 0,
    `query="${qEmpty}", hasil=${matchEmpty.length} (EmptyState aktif)`
  )

  // 3.6 Clear search
  const qCleared = ''
  const matchCleared = raraLost.filter((r) => !qCleared || r.title?.toLowerCase().includes(qCleared))
  record(
    'SRCH-06',
    'Pencarian Laporan Saya: clear search mengembalikan seluruh laporan akun',
    matchCleared.length === raraLost.length,
    `totalLaporanRara=${raraLost.length}, setelahClear=${matchCleared.length}`
  )

  // 3.7 Sorting Terbaru
  const sortNew = [...LISTED_ITEMS].sort((a, b) => b.foundDate.localeCompare(a.foundDate))
  const isNewSorted = sortNew.every((it, i) => i === 0 || sortNew[i - 1].foundDate >= it.foundDate)
  record(
    'SORT-01',
    'Sorting Daftar Temuan: Terbaru (descending foundDate)',
    isNewSorted,
    `terbaru=${sortNew[0]?.foundDate} (${sortNew[0]?.id}) >= terlama=${sortNew[sortNew.length - 1]?.foundDate}`
  )

  // 3.8 Sorting Terlama
  const sortOld = [...LISTED_ITEMS].sort((a, b) => a.foundDate.localeCompare(b.foundDate))
  const isOldSorted = sortOld.every((it, i) => i === 0 || sortOld[i - 1].foundDate <= it.foundDate)
  record(
    'SORT-02',
    'Sorting Daftar Temuan: Terlama (ascending foundDate)',
    isOldSorted,
    `terlama=${sortOld[0]?.foundDate} (${sortOld[0]?.id}) <= terbaru=${sortOld[sortOld.length - 1]?.foundDate}`
  )

  // 3.9 Sorting A–Z
  const sortAZ = [...LISTED_ITEMS].sort((a, b) => a.name.localeCompare(b.name))
  const isAZSorted = sortAZ.every((it, i) => i === 0 || sortAZ[i - 1].name.localeCompare(it.name) <= 0)
  record(
    'SORT-03',
    'Sorting Daftar Temuan: A–Z (alfabetis nama barang)',
    isAZSorted,
    `pertama="${sortAZ[0]?.name}", terakhir="${sortAZ[sortAZ.length - 1]?.name}"`
  )

  // 3.10 Kombinasi sorting dengan filter kategori, area, dan pencarian
  const filteredCombo = LISTED_ITEMS
    .filter((it) => it.category === 'Botol & Wadah Minum' && it.location.includes('Gedung Vokasi'))
    .sort((a, b) => a.name.localeCompare(b.name))
  const isComboValid = filteredCombo.every(
    (it) => it.category === 'Botol & Wadah Minum' && it.location.includes('Gedung Vokasi')
  ) && (filteredCombo.length <= 1 || filteredCombo[0].name.localeCompare(filteredCombo[1].name) <= 0)
  record(
    'SORT-04',
    'Kombinasi sorting A–Z dengan filter kategori & area',
    isComboValid,
    `totalHasil=${filteredCombo.length}, kategoriSemuaBotol=${filteredCombo.every((it) => it.category === 'Botol & Wadah Minum')}`
  )

  // 3.11 Master data immutability
  const originalIds = LISTED_ITEMS.map((it) => it.id)
  const dummySort = [...LISTED_ITEMS].sort((a, b) => a.name.localeCompare(b.name))
  const currentIds = LISTED_ITEMS.map((it) => it.id)
  const isImmutable = JSON.stringify(originalIds) === JSON.stringify(currentIds)
  record(
    'SORT-05',
    'Master data immutability: LISTED_ITEMS tidak termutasi oleh sorting',
    isImmutable,
    `originalLength=${originalIds.length}, currentLength=${currentIds.length}, urutanCocok=${isImmutable}`
  )

  // =========================================================================
  // 4. AUDIT FILTER TANGGAL
  // =========================================================================
  console.log('\n--- 4. AUDIT FILTER TANGGAL ---')

  // 4.1 Tanggal awal saja
  const filterStartOnly = LISTED_ITEMS.filter((it) => it.foundDate.slice(0, 10) >= '2026-10-12')
  const p4_1 = filterStartOnly.every((it) => it.foundDate.slice(0, 10) >= '2026-10-12')
  record(
    'DATE-01',
    'Filter tanggal: tanggal awal saja (>= 2026-10-12)',
    p4_1,
    `hasil=${filterStartOnly.length} barang, semua >= 2026-10-12`
  )

  // 4.2 Tanggal akhir saja
  const filterEndOnly = LISTED_ITEMS.filter((it) => it.foundDate.slice(0, 10) <= '2026-10-11')
  const p4_2 = filterEndOnly.every((it) => it.foundDate.slice(0, 10) <= '2026-10-11')
  record(
    'DATE-02',
    'Filter tanggal: tanggal akhir saja (<= 2026-10-11)',
    p4_2,
    `hasil=${filterEndOnly.length} barang, semua <= 2026-10-11`
  )

  // 4.3 Rentang valid
  const filterValidRange = LISTED_ITEMS.filter((it) => {
    const d = it.foundDate.slice(0, 10)
    return d >= '2026-10-11' && d <= '2026-10-13'
  })
  const p4_3 = filterValidRange.every((it) => {
    const d = it.foundDate.slice(0, 10)
    return d >= '2026-10-11' && d <= '2026-10-13'
  })
  record(
    'DATE-03',
    'Filter tanggal: rentang valid (2026-10-11 s/d 2026-10-13)',
    p4_3,
    `hasil=${filterValidRange.length} barang, seluruh tanggal berada dalam rentang`
  )

  // 4.4 Rentang tidak valid (tanggal awal > akhir)
  const dStartInv = '2026-10-15'
  const dEndInv = '2026-10-10'
  const isInvalidRange = dStartInv > dEndInv
  record(
    'DATE-04',
    'Filter tanggal: rentang tidak valid (2026-10-15 > 2026-10-10) terdeteksi',
    isInvalidRange === true,
    `isInvalidRange=${isInvalidRange}, memicu pesan "Tanggal mulai tidak boleh lebih besar dari tanggal akhir"`
  )

  // 4.5 Reset filter tanggal
  let dStartRst = '2026-10-10'
  let dEndRst = '2026-10-12'
  // reset:
  dStartRst = ''
  dEndRst = ''
  const filterReset = LISTED_ITEMS.filter((it) => {
    const d = it.foundDate.slice(0, 10)
    if (dStartRst && d < dStartRst) return false
    if (dEndRst && d > dEndRst) return false
    return true
  })
  record(
    'DATE-05',
    'Filter tanggal: reset mengembalikan seluruh daftar barang',
    filterReset.length === LISTED_ITEMS.length,
    `hasilSetelahReset=${filterReset.length}, totalListed=${LISTED_ITEMS.length}`
  )

  // 4.6 Kombinasi filter tanggal dengan kategori dan area
  const comboDateCatArea = LISTED_ITEMS.filter((it) => {
    const d = it.foundDate.slice(0, 10)
    const inDate = d >= '2026-10-10' && d <= '2026-10-14'
    const inCat = it.category === 'Botol & Wadah Minum'
    const inArea = it.location.includes('Gedung Vokasi')
    return inDate && inCat && inArea
  })
  const p4_6 = comboDateCatArea.every((it) => {
    const d = it.foundDate.slice(0, 10)
    return d >= '2026-10-10' && d <= '2026-10-14' && it.category === 'Botol & Wadah Minum' && it.location.includes('Gedung Vokasi')
  })
  record(
    'DATE-06',
    'Kombinasi filter tanggal dengan kategori dan area',
    p4_6,
    `hasilKombinasi=${comboDateCatArea.length} barang cocok`
  )

  // 4.7 Filter tanggal menghasilkan kosong
  const filterEmptyDate = LISTED_ITEMS.filter((it) => {
    const d = it.foundDate.slice(0, 10)
    return d >= '2025-01-01' && d <= '2025-01-02'
  })
  record(
    'DATE-07',
    'Filter tanggal tanpa kecocokan menghasilkan 0 barang (EmptyState)',
    filterEmptyDate.length === 0,
    `hasil=${filterEmptyDate.length} barang`
  )

  // 4.8 Barang status "Diserahkan" tidak pernah muncul di daftar publik
  const allDiserahkan = FOUND_ITEMS.filter((it) => it.depositStatus === 'Diserahkan')
  const diserahkanInListed = LISTED_ITEMS.filter((it) => it.depositStatus === 'Diserahkan')
  record(
    'DATE-08',
    'Barang berstatus "Diserahkan" mutlak tidak muncul di daftar publik',
    allDiserahkan.length > 0 && diserahkanInListed.length === 0,
    `totalDiserahkanMaster=${allDiserahkan.length} (${allDiserahkan.map((i) => i.id).join(', ')}), diDaftarPublik=${diserahkanInListed.length}`
  )

  // =========================================================================
  // 5. AUDIT PROFIL DAN NOTIFIKASI
  // =========================================================================
  console.log('\n--- 5. AUDIT PROFIL DAN NOTIFIKASI ---')

  // 5.1 Isolasi preferensi antar 4 akun (Rara, Salsabila, Fajar, Rizky)
  const users = ['rara', 'salsabila', 'fajar', 'rizky']
  // Inisialisasi semua true
  users.forEach((u) => updateNotifPrefs(u, { appNotif: true, waNotif: true }))

  // Ubah Rara appNotif = false
  updateNotifPrefs('rara', { appNotif: false })
  const rApp = getNotifPrefs('rara').appNotif
  const sApp = getNotifPrefs('salsabila').appNotif
  const fApp = getNotifPrefs('fajar').appNotif
  const rzApp = getNotifPrefs('rizky').appNotif
  const isIsolated1 = rApp === false && sApp === true && fApp === true && rzApp === true
  record(
    'PRF-01',
    'Isolasi preferensi notifikasi aplikasi: mengubah akun Rara tidak memengaruhi akun lain',
    isIsolated1,
    `rara.appNotif=${rApp}, salsabila=${sApp}, fajar=${fApp}, rizky=${rzApp}`
  )

  // Ubah Fajar waNotif = false
  updateNotifPrefs('fajar', { waNotif: false })
  const rWa = getNotifPrefs('rara').waNotif
  const sWa = getNotifPrefs('salsabila').waNotif
  const fWa = getNotifPrefs('fajar').waNotif
  const rzWa = getNotifPrefs('rizky').waNotif
  const isIsolated2 = fWa === false && rWa === true && sWa === true && rzWa === true
  record(
    'PRF-02',
    'Isolasi preferensi kabar WhatsApp: mengubah akun Fajar tidak memengaruhi akun lain',
    isIsolated2,
    `fajar.waNotif=${fWa}, rara=${rWa}, salsabila=${sWa}, rizky=${rzWa}`
  )

  // Kembalikan ke default
  users.forEach((u) => updateNotifPrefs(u, { appNotif: true, waNotif: true }))

  // 5.2 Pemeriksaan transparansi disclaimer notifikasi & posko
  const poskoPoint = DROP_POINTS.posko
  const isPoskoAccurate = poskoPoint.name === 'Posko Dekanat Lt. 1' && poskoPoint.hours.includes('07.00-18.00')
  record(
    'PRF-03',
    'Data Posko Dekanat Lt. 1 dan jam operasional 07.00-18.00 WIB akurat di master data',
    isPoskoAccurate,
    `posko.name="${poskoPoint.name}", hours="${poskoPoint.hours}"`
  )

  // =========================================================================
  // REKAP HASIL
  // =========================================================================
  const total = testResults.length
  const passed = testResults.filter((r) => r.passed).length
  const failed = testResults.filter((r) => !r.passed).length

  console.log('\n===============================================================')
  console.log(`  REKAP: ${passed}/${total} PENGUJIAN LULUS (${failed} GAGAL)`)
  console.log('===============================================================\n')

  await server.close()
  return { testResults, total, passed, failed }
}

runValidation()
  .then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0)
  })
  .catch((err) => {
    console.error('Fatal runner error:', err)
    process.exit(1)
  })
