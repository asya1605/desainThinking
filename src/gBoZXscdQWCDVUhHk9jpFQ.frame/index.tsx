import React from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { EASE, Screen, type Act } from '../shared/foundit/ui'
import { IMG } from '../shared/foundit/data'

export const args = {
  progress: 70,
}

export const argTypes = {
  progress: { control: 'range', min: 0, max: 100, step: 5 },
}

type Props = Partial<typeof args> & { onAction?: Act }

export default function Mencocokkan(props: Props) {
  const { progress, onAction } = { ...args, ...props }
  return (
    <Screen>
      <button onClick={() => onAction?.('ketuk')} className="flex min-h-full w-full flex-col items-center bg-[linear-gradient(180deg,#FFFFFF_0%,#EEF2FF_100%)] px-6 pt-20 pb-10 text-center">
        <div className="relative flex size-64 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-primary/25"
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: 'linear' }}
            />
          ))}
          <img src={IMG.mencocokkan} alt="" className="relative size-56 rounded-full object-cover mix-blend-multiply" />
        </div>
        <h1 className="mt-8 font-display text-[22px] font-bold">Mencocokkan laporanmu…</h1>
        <p className="mt-2 text-[14px] leading-[1.5] text-muted">Membandingkan dengan 84 barang temuan di Fakultas Vokasi.</p>

        <div className="mt-8 w-full max-w-[358px] rounded-2xl bg-white p-4 text-left shadow-card">
          {[
            ['Kategori dan nama', true],
            ['Lokasi dan waktu', true],
            ['Foto dan deskripsi', false],
          ].map(([label, done]) => (
            <div key={label as string} className="flex items-center justify-between py-2.5">
              <span className="text-[14px] font-medium">{label}</span>
              {done ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-success text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              ) : (
                <Loader2 className="size-6 animate-spin text-primary" strokeWidth={2} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 h-1.5 w-full max-w-[358px] overflow-hidden rounded-full bg-white">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        </div>
      </button>
    </Screen>
  )
}
