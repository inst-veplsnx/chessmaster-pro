'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Piece } from '@/lib/engine/types'
import { PieceSVG } from './PieceSVG'

interface PieceComponentProps {
  piece: Piece
  squareIndex: number
  interactive: boolean
  isSelected: boolean
}

export function PieceComponent({
  piece,
  squareIndex,
  interactive,
  isSelected,
}: PieceComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `piece-${squareIndex}`,
    data: { squareIndex, piece },
    disabled: !interactive,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
    zIndex: isDragging ? 50 : isSelected ? 20 : 10,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...(interactive ? { ...listeners, ...attributes } : {})}
      className="absolute inset-0.5 select-none touch-none"
      layoutId={`piece-${squareIndex}`}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <PieceSVG type={piece.type} color={piece.color} className="w-full h-full" />
    </motion.div>
  )
}
