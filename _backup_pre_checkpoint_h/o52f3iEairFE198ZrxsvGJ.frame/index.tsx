import React, { useEffect, useState } from 'react'
import { ArrowLeft, ChevronDown, CircleHelp, Clock, Mic, Search, SlidersHorizontal, X } from 'lucide-react'
import { BottomNav, Button, CategoryIcon, EmptyState, IconButton, ItemCard, Screen, TextLink, cx, type Act } from '../shared/foundit/ui'
import { CATEGORIES, IMG, LISTED_ITEMS, searchItems } from '../shared/foundit/data'

export const args = {
  state: 'riwayat',
  akun: 'civitas',
}

export const argTypes = {
  state: { control: 'radio', options: ['riwayat', 'hasil', 'tidak-ditemukan'] },
  akun: { control: 'radio', options: ['civitas', 'tamu'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function Pencarian(props: Props) {
  const { state, akun, onAction } = { ...args, ...props }
  const guest = akun === 'tamu'
  const defaultQuery = state === 'hasil' ? 'Tumbler pink' : state === 'tidak-ditemukan' ? 'kunci motor honda' : ''
  const [query, setQuery] = useState(defaultQuery)
  const [history, setHistory] = useState([
    { text: 'Tumbler pink', action: 'riwayat:tumbler' },
    { text: 'Kunci motor', action: 'riwayat:kunci' },
    { text: 'Dompet cokelat', action: 'riwayat:dompet' },
  ])

  useEffect(() => {
    setQuery(state === 'hasil' ? 'Tumbler pink' : state === 'tidak-ditemukan' ? 'kunci motor honda' : '')
  }, [state])

  const trimmed = query.trim()
  const isSearching = trimmed.length > 0
  const results = isSearching ? searchItems(trimmed, LISTED_ITEMS) : []

  // Ambil kategori-kategori unik dari hasil pencarian
  const resultCategories = Array.from(new Set(results.map((r) => r.category)))

  return (
    <Screen nav={!isSearching && state === 'riwayat' ? <Keyboard /> : <BottomNav variant={guest ? 'tamu' : 'civitas'} active="temuan" notif={!guest} onAction={onAction} />}>
      {/* Header cari */}
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-page/95 px-3 pt-3 pb-3 backdrop-blur">
        <IconButton label="Kembali" white onClick={() => onAction?.('kembali')}>
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </IconButton>
        <div
          className={cx(
            'flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border-[1.5px] bg-white px-3 transition-colors focus-within:border-primary',
            isSearching ? 'border-line' : 'border-primary'
          )}
        >
          <Search className="size-5 shrink-0 text-muted" strokeWidth={1.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari barang temuan…"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
          />
          {query ? (
            <button
              type="button"
              aria-label="Hapus kata kunci"
              onClick={() => setQuery('')}
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-line/40 hover:text-ink focus:outline-none"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
        {isSearching && results.length > 0 && (
          <button onClick={() => onAction?.('filter')} aria-label="Filter" className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-primary">
            <SlidersHorizontal className="size-5" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">1</span>
          </button>
        )}
      </div>

      {!isSearching && (
        <div className="px-4 pb-6">
          {history.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[17px] font-semibold">Pencarian Terkini</h2>
                <TextLink className="text-[13px]" onClick={() => setHistory([])}>
                  Hapus Semua
                </TextLink>
              </div>
              <ul className="mt-1 divide-y divide-line rounded-2xl bg-white px-4 shadow-card">
                {history.map(({ text, action }) => (
                  <li key={text} className="flex items-center">
                    <button
                      onClick={() => {
                        setQuery(text)
                        onAction?.(action)
                      }}
                      className="flex h-12 flex-1 items-center gap-3 text-left text-[14px]"
                    >
                      <Clock className="size-5 text-muted" strokeWidth={1.5} />
                      {text}
                    </button>
                    <IconButton label="Hapus" onClick={() => setHistory((prev) => prev.filter((h) => h.text !== text))}>
                      <X className="size-4 text-muted" strokeWidth={1.75} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h2 className={cx('font-display text-[17px] font-semibold', history.length > 0 ? 'mt-6' : 'mt-2')}>Kategori</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setQuery(c)
                  onAction?.('kategori:' + c)
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-medium shadow-sm ring-1 ring-line"
              >
                <CategoryIcon category={c} className="size-4 text-primary" />
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSearching && results.length > 0 && (
        <div className="px-4 pb-6">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <span className="inline-flex h-9 shrink-0 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-white">
              Semua {results.length}
            </span>
            {resultCategories.map((cat) => (
              <span key={cat} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium ring-1 ring-line">
                <CategoryIcon category={cat} className="size-4 text-primary" />
                {cat} {results.filter((r) => r.category === cat).length}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[14px] font-semibold">Ditemukan {results.length} barang</p>
            <button className="inline-flex h-11 items-center gap-1 text-[13px] font-medium text-muted">
              Paling mirip <ChevronDown className="size-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="mt-2 space-y-4">
            {results.map((item) => (
              <React.Fragment key={item.id}>
                <ItemCard item={item} aspect="4/3" showStored storedBox onClick={() => onAction?.('hasil:' + item.id)} />
              </React.Fragment>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-blue-soft p-4">
            <div className="flex gap-3">
              <CircleHelp className="size-6 shrink-0 text-primary" strokeWidth={1.5} />
              <div>
                <p className="font-display text-[16px] font-semibold">Barangmu belum ada di daftar temuan?</p>
                <p className="mt-1 text-[13px] leading-[1.5] text-muted">Buat laporan kehilangan, kami kabari kalau ada barang yang mirip.</p>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => onAction?.('buat-laporan')}>
              Buat Laporan Kehilangan
            </Button>
          </div>
        </div>
      )}

      {isSearching && results.length === 0 && (
        <EmptyState
          img={IMG.mencocokkan}
          title="Belum ada barang yang cocok"
          text="Coba kata lain atau periksa ejaan. Kalau barangmu belum ditemukan, buat laporan supaya kami bisa mengabarimu."
        >
          <Button className="w-full" onClick={() => onAction?.('buat-laporan')}>
            Buat Laporan Kehilangan
          </Button>
        </EmptyState>
      )}
    </Screen>
  )
}

function Keyboard() {
  const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
  return (
    <div className="shrink-0 bg-[#D1D5DB] px-1 pt-2 pb-6">
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <div key={r} className="flex justify-center gap-1.5 px-0.5">
            {i === 2 && <Key wide>⇧</Key>}
            {r.split('').map((k) => (
              <React.Fragment key={k}>
                <Key>{k}</Key>
              </React.Fragment>
            ))}
            {i === 2 && <Key wide>⌫</Key>}
          </div>
        ))}
        <div className="flex gap-1.5 px-0.5">
          <Key wide>123</Key>
          <Key wide>
            <Mic className="mx-auto size-4" strokeWidth={1.75} />
          </Key>
          <div className="flex h-10 flex-[4] items-center justify-center rounded-md bg-white text-[14px] shadow-[0_1px_0_#9CA3AF]">spasi</div>
          <div className="flex h-10 flex-[2] items-center justify-center rounded-md bg-primary text-[14px] font-medium text-white">Cari</div>
        </div>
      </div>
    </div>
  )
}

function Key({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={cx(
        'flex h-10 items-center justify-center rounded-md text-[17px] shadow-[0_1px_0_#9CA3AF]',
        wide ? 'flex-[1.4] bg-[#ADB3BC] text-[13px]' : 'flex-1 bg-white'
      )}
    >
      {children}
    </div>
  )
}
