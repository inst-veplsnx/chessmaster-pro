export type Color = 'white' | 'black'

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'

export interface Piece {
  type: PieceType
  color: Color
}

/** 64-element array; index = file + rank * 8 (rank 0 = rank 1, rank 7 = rank 8) */
export type Board = (Piece | null)[]

export interface CastlingRights {
  whiteKingside: boolean
  whiteQueenside: boolean
  blackKingside: boolean
  blackQueenside: boolean
}

export interface Move {
  from: number
  to: number
  promotion?: PieceType
  isEnPassant?: boolean
  isCastling?: 'kingside' | 'queenside'
  capturedPiece?: PieceType
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'

export type DrawReason = 'fifty-move' | 'repetition' | 'insufficient-material' | null

export interface GameResult {
  status: GameStatus
  winner: Color | null
  drawReason: DrawReason
}

export interface PGNMetadata {
  event?: string
  site?: string
  date?: string
  round?: string
  white?: string
  black?: string
  result?: string
}
