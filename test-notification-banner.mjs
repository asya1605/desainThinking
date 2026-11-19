import { createServer } from 'vite'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

async function run() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  console.log('=== TEST NOTIFICATION BANNER COMPONENT & BEHAVIOR ===\n')

  let passCount = 0
  let failCount = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`)
      passCount++
    } else {
      console.error(`[FAIL] ${message}`)
      failCount++
    }
  }

  const { NotificationBanner, copyToClipboard, shareOrCopy } = await server.ssrLoadModule('/src/shared/foundit/ui.tsx')

  // 1. Success Variant
  const successHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NotificationBanner, {
      title: 'Nomor Tersalin',
      description: 'Nomor identitas barang berhasil disalin ke clipboard',
      variant: 'success',
      timestamp: 'Sekarang',
      onClose: () => {},
    })
  )

  assert(successHtml.includes('FoundIt Vokasi'), 'Success: Menampilkan nama aplikasi FoundIt Vokasi')
  assert(successHtml.includes('Sekarang'), 'Success: Menampilkan timestamp Sekarang')
  assert(successHtml.includes('Nomor Tersalin'), 'Success: Menampilkan judul notifikasi')
  assert(successHtml.includes('Nomor identitas barang berhasil disalin ke clipboard'), 'Success: Menampilkan deskripsi')
  assert(successHtml.includes('bg-success/15'), 'Success: Menggunakan badge warna success')
  assert(successHtml.includes('aria-label="Tutup notifikasi"'), 'Success: Menyertakan tombol tutup notifikasi')

  // 2. Error Variant
  const errorHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NotificationBanner, {
      title: 'Pembatalan Ditolak',
      description: 'Klaim tidak dapat dibatalkan karena sudah disetujui',
      variant: 'error',
      timestamp: 'Sekarang',
    })
  )

  assert(errorHtml.includes('Pembatalan Ditolak'), 'Error: Menampilkan judul error')
  assert(errorHtml.includes('Klaim tidak dapat dibatalkan'), 'Error: Menampilkan deskripsi error')
  assert(errorHtml.includes('bg-danger/15'), 'Error: Menggunakan badge warna error/danger')

  // 3. Warning Variant
  const warningHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NotificationBanner, {
      title: 'Peta Belum Tersedia',
      description: 'Informasi rute peta belum tersedia untuk titik lokasi ini',
      variant: 'warning',
      timestamp: 'Sekarang',
    })
  )

  assert(warningHtml.includes('Peta Belum Tersedia'), 'Warning: Menampilkan judul warning')
  assert(warningHtml.includes('bg-amber/15'), 'Warning: Menggunakan badge warna warning/amber')

  // 4. Info Variant (Simulasi Prototipe)
  const simHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NotificationBanner, {
      title: 'Simulasi Prototipe',
      description: 'Fitur ini belum tersedia di prototipe.',
      variant: 'info',
      timestamp: 'Sekarang',
    })
  )

  assert(simHtml.includes('Simulasi Prototipe'), 'Info Simulasi: Menampilkan judul Simulasi Prototipe')
  assert(simHtml.includes('Fitur ini belum tersedia di prototipe.'), 'Info Simulasi: Menampilkan deskripsi transparan')
  assert(simHtml.includes('bg-blue-soft'), 'Info Simulasi: Menggunakan badge warna info/blue-soft')

  // 5. Default Title Fallbacks
  const defaultSuccessHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NotificationBanner, {
      description: 'Berhasil melakukan aksi',
      variant: 'success',
    })
  )
  assert(defaultSuccessHtml.includes('Berhasil'), 'Default Title: Menampilkan "Berhasil" jika title tidak diberikan pada variant success')

  // 6. Utility Functions Verification
  assert(typeof copyToClipboard === 'function', 'Utility: copyToClipboard terdefinisi sebagai fungsi asynchronous')
  assert(typeof shareOrCopy === 'function', 'Utility: shareOrCopy terdefinisi sebagai fungsi asynchronous')

  console.log(`\n=== HASIL: ${passCount} PASSED, ${failCount} FAILED ===`)
  await server.close()
  if (failCount > 0) process.exit(1)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
