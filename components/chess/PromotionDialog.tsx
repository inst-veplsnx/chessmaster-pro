'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PieceType, Color } from '@/lib/engine/types'
import { PieceSVG } from './PieceSVG'

const PROMOTION_PIECES: PieceType[] = ['queen', 'rook', 'bishop', 'knight']

interface PromotionDialogProps {
  open: boolean
  color: Color
  onSelect: (piece: PieceType) => void
  onCancel: () => void
}

export function PromotionDialog({ open, color, onSelect, onCancel }: PromotionDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-background border rounded-xl shadow-2xl p-4 pointer-events-auto">
              <p className="text-sm font-medium text-center mb-3 text-muted-foreground">
                Choose promotion piece
              </p>
              <div className="flex gap-2">
                {PROMOTION_PIECES.map((type) => (
                  <button
                    key={type}
                    className="w-16 h-16 rounded-lg border-2 border-transparent hover:border-primary hover:bg-accent transition-colors flex items-center justify-center"
                    onClick={() => onSelect(type)}
                    title={type}
                  >
                    <PieceSVG type={type} color={color} className="w-12 h-12" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
