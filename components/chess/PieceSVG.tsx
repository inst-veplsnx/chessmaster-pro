import Image from 'next/image'
import { PieceType, Color } from '@/lib/engine/types'

interface PieceSVGProps {
  type: PieceType
  color: Color
  className?: string
}

const TYPE_CHAR: Record<PieceType, string> = {
  king: 'K',
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
  pawn: 'P',
}

export function PieceSVG({ type, color, className }: PieceSVGProps) {
  const file = `${color === 'white' ? 'w' : 'b'}${TYPE_CHAR[type]}.svg`
  return (
    <Image
      src={`/pieces/classic/${file}`}
      alt={`${color} ${type}`}
      fill
      unoptimized
      draggable={false}
      className={className}
    />
  )
}
