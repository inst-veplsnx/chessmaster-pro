import type { Color, PieceType } from './types'

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
}

export const KNIGHT_OFFSETS: [number, number][] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
]

export const ROOK_DIRS: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

export const BISHOP_DIRS: [number, number][] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

export const QUEEN_DIRS: [number, number][] = [...ROOK_DIRS, ...BISHOP_DIRS]
export const KING_DIRS: [number, number][] = QUEEN_DIRS

export const FEN_TO_PIECE: Record<string, { type: PieceType; color: Color }> = {
  K: { type: 'king', color: 'white' },
  Q: { type: 'queen', color: 'white' },
  R: { type: 'rook', color: 'white' },
  B: { type: 'bishop', color: 'white' },
  N: { type: 'knight', color: 'white' },
  P: { type: 'pawn', color: 'white' },
  k: { type: 'king', color: 'black' },
  q: { type: 'queen', color: 'black' },
  r: { type: 'rook', color: 'black' },
  b: { type: 'bishop', color: 'black' },
  n: { type: 'knight', color: 'black' },
  p: { type: 'pawn', color: 'black' },
}

export const PIECE_TO_FEN: Record<string, string> = {
  'king-white': 'K',
  'queen-white': 'Q',
  'rook-white': 'R',
  'bishop-white': 'B',
  'knight-white': 'N',
  'pawn-white': 'P',
  'king-black': 'k',
  'queen-black': 'q',
  'rook-black': 'r',
  'bishop-black': 'b',
  'knight-black': 'n',
  'pawn-black': 'p',
}

export const PROMOTION_CHAR: Record<PieceType, string> = {
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
  king: 'K',
  pawn: 'P',
}

export const CASTLING_SQUARES = {
  whiteKing: 4, // e1
  whiteRookKingside: 7, // h1
  whiteRookQueenside: 0, // a1
  blackKing: 60, // e8
  blackRookKingside: 63, // h8
  blackRookQueenside: 56, // a8
}
