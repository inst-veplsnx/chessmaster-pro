import type { Board, Color, Piece } from './types'

export function idx(file: number, rank: number): number {
  return file + rank * 8
}

export function fileOf(square: number): number {
  return square % 8
}

export function rankOf(square: number): number {
  return Math.floor(square / 8)
}

export function isOnBoard(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8
}

export function squareName(square: number): string {
  return String.fromCharCode(97 + fileOf(square)) + String(rankOf(square) + 1)
}

export function parseSquare(name: string): number {
  const file = name.charCodeAt(0) - 97
  const rank = parseInt(name[1], 10) - 1
  return idx(file, rank)
}

export function opponent(color: Color): Color {
  return color === 'white' ? 'black' : 'white'
}

export function findKing(board: Board, color: Color): number {
  for (let i = 0; i < 64; i++) {
    const p = board[i]
    if (p?.type === 'king' && p.color === color) return i
  }
  return -1
}

export function copyBoard(board: Board): Board {
  return board.slice()
}

export function pieceAt(board: Board, square: number): Piece | null {
  return board[square] ?? null
}
