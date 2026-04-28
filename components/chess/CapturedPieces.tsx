'use client'

import { Color, PieceType } from '@/lib/engine/types'
import { PieceSVG } from './PieceSVG'

const PIECE_VALUES: Record<PieceType, number> = {
  queen: 9,
  rook: 5,
  bishop: 3,
  knight: 3,
  pawn: 1,
  king: 0,
}

interface CapturedPiecesProps {
  captured: PieceType[]
  color: Color
  showAdvantage?: boolean
  opponentCaptured?: PieceType[]
}

export function CapturedPieces({
  captured,
  color,
  showAdvantage,
  opponentCaptured,
}: CapturedPiecesProps) {
  const sorted = [...captured].sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a])

  const myValue = captured.reduce((s, p) => s + PIECE_VALUES[p], 0)
  const theirValue = (opponentCaptured ?? []).reduce((s, p) => s + PIECE_VALUES[p], 0)
  const advantage = myValue - theirValue

  return (
    <div className="flex items-center gap-1 min-h-[24px] flex-wrap">
      {sorted.map((type, i) => (
        <div key={i} className="relative w-5 h-5 opacity-80">
          <PieceSVG type={type} color={color} className="w-full h-full" />
        </div>
      ))}
      {showAdvantage && advantage > 0 && (
        <span className="text-xs text-muted-foreground ml-1">+{advantage}</span>
      )}
    </div>
  )
}
