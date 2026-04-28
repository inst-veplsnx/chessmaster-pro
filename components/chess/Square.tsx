'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Piece } from '@/lib/engine/types'
import { PieceComponent } from './PieceComponent'
import { MoveIndicator } from './MoveIndicator'
import { CoordinateLabel } from './CoordinateLabel'

interface SquareProps {
  index: number
  piece: Piece | null
  isLight: boolean
  isSelected: boolean
  isLegalTarget: boolean
  isLastMoveFrom: boolean
  isLastMoveTo: boolean
  isInCheck: boolean
  showFileLabel: boolean
  showRankLabel: boolean
  fileLabel: string
  rankLabel: string
  interactive: boolean
  onClick: (index: number) => void
}

export function Square({
  index,
  piece,
  isLight,
  isSelected,
  isLegalTarget,
  isLastMoveFrom,
  isLastMoveTo,
  isInCheck,
  showFileLabel,
  showRankLabel,
  fileLabel,
  rankLabel,
  interactive,
  onClick,
}: SquareProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `square-${index}` })

  const baseClass = isLight ? 'board-square-light' : 'board-square-dark'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative aspect-square select-none',
        baseClass,
        isSelected && 'board-highlight-select',
        (isLastMoveFrom || isLastMoveTo) && !isSelected && 'board-highlight-move',
        isInCheck && 'board-highlight-check',
        isOver && 'brightness-110',
        interactive && 'cursor-pointer'
      )}
      onClick={() => onClick(index)}
    >
      {showRankLabel && <CoordinateLabel label={rankLabel} position="rank" isLight={isLight} />}
      {showFileLabel && <CoordinateLabel label={fileLabel} position="file" isLight={isLight} />}

      {isLegalTarget && <MoveIndicator isCapture={!!piece} />}

      {piece && (
        <PieceComponent
          piece={piece}
          squareIndex={index}
          interactive={interactive}
          isSelected={isSelected}
        />
      )}
    </div>
  )
}
