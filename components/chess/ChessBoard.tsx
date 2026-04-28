'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { GameState, Move, PieceType } from '@/lib/engine'
import { fileOf, rankOf } from '@/lib/engine/board'
import { Square } from './Square'
import { PieceSVG } from './PieceSVG'
import { PromotionDialog } from './PromotionDialog'

interface ChessBoardProps {
  gameState: GameState
  orientation?: 'white' | 'black'
  boardTheme?: 'classic' | 'marble' | 'cyberpunk' | 'tournament'
  interactive?: boolean
  highlightLastMove?: boolean
  showCoordinates?: boolean
  onMove?: (move: Move) => void
}

export function ChessBoard({
  gameState,
  orientation = 'white',
  boardTheme = 'classic',
  interactive = true,
  highlightLastMove = true,
  showCoordinates = true,
  onMove,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)
  const [legalMoves, setLegalMoves] = useState<Move[]>([])
  const [pendingPromotion, setPendingPromotion] = useState<{ from: number; to: number } | null>(
    null
  )
  const [dragPiece, setDragPiece] = useState<{ squareIndex: number } | null>(null)

  const lastMove = gameState.history[gameState.history.length - 1] ?? null
  const result = gameState.getResult()
  const isGameOver =
    result.status === 'checkmate' || result.status === 'stalemate' || result.status === 'draw'

  const isKingInCheck = useCallback(
    (squareIdx: number): boolean => {
      const piece = gameState.board[squareIdx]
      if (!piece || piece.type !== 'king') return false
      return gameState.isInCheck(piece.color)
    },
    [gameState]
  )

  const handleSquareClick = useCallback(
    (squareIdx: number) => {
      if (!interactive || isGameOver) return

      if (selectedSquare !== null) {
        const move = legalMoves.find((m) => m.to === squareIdx)
        if (move) {
          const piece = gameState.board[selectedSquare]
          if (piece?.type === 'pawn') {
            const rank = rankOf(squareIdx)
            if (
              (piece.color === 'white' && rank === 7) ||
              (piece.color === 'black' && rank === 0)
            ) {
              setPendingPromotion({ from: selectedSquare, to: squareIdx })
              setSelectedSquare(null)
              setLegalMoves([])
              return
            }
          }
          onMove?.(move)
          setSelectedSquare(null)
          setLegalMoves([])
          return
        }
      }

      const piece = gameState.board[squareIdx]
      if (piece && piece.color === gameState.turn) {
        const moves = gameState.getLegalMoves(squareIdx)
        setSelectedSquare(squareIdx)
        setLegalMoves(moves)
      } else {
        setSelectedSquare(null)
        setLegalMoves([])
      }
    },
    [interactive, isGameOver, selectedSquare, legalMoves, gameState, onMove]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as { squareIndex: number } | undefined
      if (data) setDragPiece({ squareIndex: data.squareIndex })
      const squareIdx = data?.squareIndex
      if (squareIdx !== undefined) {
        const piece = gameState.board[squareIdx]
        if (piece && piece.color === gameState.turn) {
          setSelectedSquare(squareIdx)
          setLegalMoves(gameState.getLegalMoves(squareIdx))
        }
      }
    },
    [gameState]
  )

  const handleDragCancel = useCallback(() => {
    setDragPiece(null)
    setSelectedSquare(null)
    setLegalMoves([])
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragPiece(null)
      const { active, over } = event
      if (!over) {
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }
      const fromData = active.data.current as {
        squareIndex: number
        piece: { type: PieceType; color: string }
      }
      const toSquare = parseInt((over.id as string).replace('square-', ''), 10)
      const fromSquare = fromData.squareIndex

      const move = legalMoves.find((m) => m.from === fromSquare && m.to === toSquare)
      if (move) {
        const piece = gameState.board[fromSquare]
        if (piece?.type === 'pawn') {
          const rank = rankOf(toSquare)
          if ((piece.color === 'white' && rank === 7) || (piece.color === 'black' && rank === 0)) {
            setPendingPromotion({ from: fromSquare, to: toSquare })
            setSelectedSquare(null)
            setLegalMoves([])
            return
          }
        }
        onMove?.(move)
      }
      setSelectedSquare(null)
      setLegalMoves([])
    },
    [legalMoves, gameState, onMove]
  )

  const handlePromotion = useCallback(
    (promotion: PieceType) => {
      if (!pendingPromotion) return
      const move = gameState
        .getLegalMoves(pendingPromotion.from)
        .find((m) => m.to === pendingPromotion.to && m.promotion === promotion)
      if (move) onMove?.(move)
      setPendingPromotion(null)
    },
    [pendingPromotion, gameState, onMove]
  )

  const squares = Array.from({ length: 64 }, (_, i) => i)
  const orderedSquares =
    orientation === 'white'
      ? squares.sort((a, b) => {
          const rankDiff = rankOf(b) - rankOf(a)
          return rankDiff !== 0 ? rankDiff : fileOf(a) - fileOf(b)
        })
      : squares.sort((a, b) => {
          const rankDiff = rankOf(a) - rankOf(b)
          return rankDiff !== 0 ? rankDiff : fileOf(b) - fileOf(a)
        })

  const legalTargetSet = new Set(legalMoves.map((m) => m.to))
  const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="relative w-full aspect-square rounded-sm overflow-hidden shadow-2xl"
        data-board-theme={boardTheme}
      >
        <div className="grid grid-cols-8 w-full h-full">
          {orderedSquares.map((squareIdx) => {
            const file = fileOf(squareIdx)
            const rank = rankOf(squareIdx)
            const isLight = (file + rank) % 2 !== 0
            const showFile = showCoordinates && (orientation === 'white' ? rank === 0 : rank === 7)
            const showRank = showCoordinates && (orientation === 'white' ? file === 0 : file === 7)

            return (
              <Square
                key={squareIdx}
                index={squareIdx}
                piece={gameState.board[squareIdx]}
                isLight={isLight}
                isSelected={selectedSquare === squareIdx}
                isLegalTarget={legalTargetSet.has(squareIdx)}
                isLastMoveFrom={highlightLastMove && lastMove?.from === squareIdx}
                isLastMoveTo={highlightLastMove && lastMove?.to === squareIdx}
                isInCheck={isKingInCheck(squareIdx)}
                showFileLabel={showFile}
                showRankLabel={showRank}
                fileLabel={FILES[file]}
                rankLabel={String(rank + 1)}
                interactive={interactive && !isGameOver}
                onClick={handleSquareClick}
              />
            )
          })}
        </div>

        <AnimatePresence>
          {result.status === 'checkmate' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-background rounded-2xl px-8 py-6 shadow-2xl text-center"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <p className="text-3xl font-bold mb-2">Checkmate!</p>
                <p className="text-muted-foreground capitalize">{result.winner} wins</p>
              </motion.div>
            </motion.div>
          )}
          {result.status === 'stalemate' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="bg-background rounded-2xl px-8 py-6 shadow-2xl text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <p className="text-3xl font-bold mb-2">Stalemate</p>
                <p className="text-muted-foreground">Draw by stalemate</p>
              </motion.div>
            </motion.div>
          )}
          {result.status === 'draw' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="bg-background rounded-2xl px-8 py-6 shadow-2xl text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <p className="text-3xl font-bold mb-2">Draw</p>
                <p className="text-muted-foreground capitalize">
                  {result.drawReason?.replace('-', ' ')}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DragOverlay dropAnimation={null}>
        {dragPiece && gameState.board[dragPiece.squareIndex] && (
          <div className="relative w-16 h-16 opacity-90 pointer-events-none">
            <PieceSVG
              type={gameState.board[dragPiece.squareIndex]!.type}
              color={gameState.board[dragPiece.squareIndex]!.color}
              className="w-full h-full scale-125 drop-shadow-2xl"
            />
          </div>
        )}
      </DragOverlay>

      <PromotionDialog
        open={!!pendingPromotion}
        color={gameState.turn}
        onSelect={handlePromotion}
        onCancel={() => setPendingPromotion(null)}
      />
    </DndContext>
  )
}
