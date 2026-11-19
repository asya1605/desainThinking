import React, { useEffect, useState } from 'react'
import { ArrowDownUp, Calendar, Check, CloudOff, Info, Search, Shield, SlidersHorizontal, X } from 'lucide-react'
import { BottomNav, Button, CategoryIcon, EmptyState, ItemCard, PageHeader, Screen, Sheet, cx, type Act } from '../shared/foundit/ui'
import { AREAS, CATEGORIES, LISTED_ITEMS } from '../shared/foundit/data'

export const args = {
  state: 'default',
  akun: 'civitas',
  sheet: 'none',
}

export const argTypes = {
  state: { control: 'radio', options: ['default', 'filter-kosong', 'gagal-memuat'] },
  akun: { control: 'radio', options: ['civitas', 'tamu'] },
  sheet: { control: 'radio', options: ['none', 'filter'] },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function DaftarBarangTemuan(props: Props) {
  const { state, akun, sheet, onAction } = { ...args, ...props }
  const guest = akun === 'tamu'
  const nav = <BottomNav variant={guest ? 'tamu' : 'civitas'} active="temuan" notif={!guest} onAction={onAction} />

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    state === 'filter-kosong' ? ['Kunci'] : []
  )
  const [selectedAreas, setSelectedAreas] = useState<string[]>(() =>
    state === 'filter-kosong' ? ['Gedung Vokasi A'] : []
  )
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  useEffect(() => {
    if (state === 'filter-kosong') {
      setSelectedCategories(['Kunci'])
      setSelectedAreas(['Gedung Vokasi A'])
      setSelectedStatuses([])
    } else if (state === 'default' && selectedCategories.includes('Kunci') && selectedAreas.includes('Gedung Vokasi A')) {
      setSelectedCategories([])
      setSelectedAreas([])
      setSelectedStatuses([])
    }
  }, [state])

  const toggleCategory = (c: string) => {
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }
  const toggleArea = (a: string) => {
    setSelectedAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }
  const toggleStatus = (s: string) => {
    setSelectedStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }
  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedAreas([])
    setSelectedStatuses([])
    onAction?.('reset-filter')
  }

  const filteredItems = LISTED_ITEMS.filter((it) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(it.category)) return false
    if (selectedAreas.length > 0 && !selectedAreas.some((a) => it.location.includes(a))) return false
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(it.depositStatus)) return false
    return true
  })

  const activeFilterCount = selectedCategories.length + selectedAreas.length + selectedStatuses.length
  const empty = filteredItems.length === 0

  if (state === 'gagal-memuat') {
    return (
      <Screen nav={nav}>
        <PageHeader title="Barang Temuan" onBack={() => onAction?.('kembali')} />
        <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
          <div className="relative flex size-40 items-center justify-center rounded-full bg-blue-soft">
            <CloudOff className="size-20 text-primary" strokeWidth={1.25} />
            <span className="absolute top-8 right-8 size-4 rounded-full bg-pink/80" />
            <span className="absolute bottom-9 left-7 size-3 rounded-full bg-yellow" />
          </div>
          <h2 className="mt-6 font-display text-[20px] font-bold">Tidak bisa memuat data</h2>
          <p className="mt-2 text-[14px] leading-[1.5] text-muted">Periksa koneksi internetmu, lalu coba lagi.</p>
          <Button className="mt-6 w-full max-w-[280px]" onClick={() => onAction?.('coba-lagi')}>
            Coba Lagi
          </Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen
      nav={nav}
      overlay={
        <FilterSheet
          open={sheet === 'filter'}
          selectedCategories={selectedCategories}
          selectedAreas={selectedAreas}
          selectedStatuses={selectedStatuses}
          onToggleCategory={toggleCategory}
          onToggleArea={toggleArea}
          onToggleStatus={toggleStatus}
          onReset={resetFilters}
          count={filteredItems.length}
          onAction={onAction}
        />
      }
    >
      <div className="px-4 pt-4">
        <button onClick={() => onAction?.('judul')} className="text-left">
          <h1 className="font-display text-[24px] font-bold">Barang Temuan</h1>
        </button>
        <p className="text-[12px] text-muted">{empty ? '0 barang' : `${filteredItems.length} barang · diperbarui 10 menit lalu`}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => onAction?.('cari')} className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-white px-3 text-left ring-1 ring-line">
            <Search className="size-5 text-muted" strokeWidth={1.5} />
            <span className="truncate text-[14px] text-faint">Cari barang temuan…</span>
          </button>
          <button
            onClick={() => onAction?.('filter')}
            aria-label="Filter"
            className={cx('relative flex size-12 shrink-0 items-center justify-center rounded-xl', activeFilterCount > 0 ? 'bg-primary text-white' : 'bg-blue-soft text-primary')}
          >
            <SlidersHorizontal className="size-5" strokeWidth={1.75} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-pink text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        {activeFilterCount > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedCategories.map((c) => (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-soft pr-1.5 pl-3 text-[12px] font-semibold text-primary"
              >
                Kategori: {c}
                <X className="size-4" strokeWidth={2} />
              </button>
            ))}
            {selectedAreas.map((a) => (
              <button
                key={a}
                onClick={() => toggleArea(a)}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-soft pr-1.5 pl-3 text-[12px] font-semibold text-primary"
              >
                Area: {a}
                <X className="size-4" strokeWidth={2} />
              </button>
            ))}
            {selectedStatuses.map((s) => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-soft pr-1.5 pl-3 text-[12px] font-semibold text-primary"
              >
                Status: {s}
                <X className="size-4" strokeWidth={2} />
              </button>
            ))}
          </div>
        ) : (
          <button className="mt-2 inline-flex h-11 items-center gap-1.5 text-[13px] font-medium text-muted">
            <ArrowDownUp className="size-4" strokeWidth={1.75} />
            Urutkan: <span className="font-semibold text-ink">Terbaru</span>
          </button>
        )}
      </div>

      {empty ? (
        <EmptyState title="Belum ada barang dengan filter ini" text="Coba ubah filter atau buat laporan kehilangan.">
          <Button variant="secondary" className="w-full" onClick={resetFilters}>
            Reset Filter
          </Button>
          <Button className="w-full" onClick={() => onAction?.('buat-laporan')}>
            Buat Laporan Kehilangan
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-4 px-4 pt-1 pb-6">
          {filteredItems.map((it) => (
            <React.Fragment key={it.id}>
              <ItemCard
                item={it}
                onClick={() => onAction?.('barang:' + it.id)}
                note={
                  it.isSensitive ? (
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
                      <Shield className="size-4 text-primary" strokeWidth={1.5} />
                      Nama dan foto disembunyikan demi keamanan pemilik.
                    </p>
                  ) : undefined
                }
              />
            </React.Fragment>
          ))}
          <div className="flex items-center gap-3 rounded-2xl bg-blue-soft p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-semibold">Tidak menemukan barangmu?</p>
              <p className="mt-1 text-[13px] leading-[1.5] text-muted">Buat laporan kehilangan agar kami bisa mencocokkan.</p>
            </div>
            <Button small onClick={() => onAction?.('lapor')}>
              Lapor
            </Button>
          </div>
        </div>
      )}
    </Screen>
  )
}

function FilterSheet({
  open,
  selectedCategories,
  selectedAreas,
  selectedStatuses,
  onToggleCategory,
  onToggleArea,
  onToggleStatus,
  onReset,
  count,
  onAction,
}: {
  open: boolean
  selectedCategories: string[]
  selectedAreas: string[]
  selectedStatuses: string[]
  onToggleCategory: (c: string) => void
  onToggleArea: (a: string) => void
  onToggleStatus: (s: string) => void
  onReset: () => void
  count: number
  onAction?: Act
}) {
  return (
    <Sheet open={open} height={640} onClose={() => onAction?.('tutup')}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[20px] font-bold">Filter</h2>
      </div>

      <Section title="Kategori Barang" hint="Pilih satu atau lebih">
        {CATEGORIES.map((c) => (
          <React.Fragment key={c}>
            <Chip
              on={selectedCategories.includes(c)}
              onClick={() => onToggleCategory(c)}
              icon={<CategoryIcon category={c} className="size-4" />}
            >
              {c}
            </Chip>
          </React.Fragment>
        ))}
      </Section>

      <Section title="Area Ditemukan">
        {AREAS.map((a) => (
          <React.Fragment key={a}>
            <Chip on={selectedAreas.includes(a)} onClick={() => onToggleArea(a)}>
              {a}
            </Chip>
          </React.Fragment>
        ))}
      </Section>

      <div className="mt-5">
        <p className="mb-2 text-[14px] font-semibold">Rentang Tanggal</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Dari', '14 Sep 2026'],
            ['Sampai', 'Hari ini'],
          ].map(([l, v]) => (
            <div key={l} className="flex h-12 items-center gap-2 rounded-xl bg-blue-soft px-3">
              <Calendar className="size-5 text-muted" strokeWidth={1.5} />
              <span className="text-[13px] text-muted">{l}</span>
              <span className="truncate text-[13px] font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <Section title="Status Penitipan">
        {(['Belum Dititipkan', 'Dititipkan', 'Siap Diserahkan'] as const).map((s) => (
          <React.Fragment key={s}>
            <Chip on={selectedStatuses.includes(s)} onClick={() => onToggleStatus(s)}>
              {s}
            </Chip>
          </React.Fragment>
        ))}
      </Section>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-soft px-3 py-2.5 text-[12px] text-ink">
        <Info className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
        Barang yang sudah dititipkan bisa langsung diklaim.
      </div>

      <div className="mt-5 grid grid-cols-[1fr_2fr] gap-3">
        <Button variant="secondary" onClick={onReset}>
          Reset
        </Button>
        <Button onClick={() => onAction?.('tampilkan')}>Tampilkan {count} Barang</Button>
      </div>
    </Sheet>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-[14px] font-semibold">{title}</p>
        {hint && <span className="text-[12px] text-muted">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ children, on, icon, onClick }: { children: React.ReactNode; on?: boolean; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium',
        on ? 'bg-primary text-white' : 'bg-white text-ink ring-1 ring-line'
      )}
    >
      {on ? <Check className="size-4" strokeWidth={2.5} /> : icon}
      {children}
    </button>
  )
}
