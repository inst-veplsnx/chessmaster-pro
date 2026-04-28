import { GameState, Move, PieceType, parseSquare } from '@/lib/engine'

export function sq(name: string): number {
  return parseSquare(name)
}

export function state(fen: string): GameState {
  return GameState.fromFEN(fen)
}

export function hasMove(
  moves: Move[],
  from: string,
  to: string,
  opts: Partial<Pick<Move, 'promotion' | 'isCastling' | 'isEnPassant' | 'capturedPiece'>> = {}
): boolean {
  return moves.some(
    (m) =>
      m.from === sq(from) &&
      m.to === sq(to) &&
      m.promotion === opts.promotion &&
      m.isCastling === opts.isCastling &&
      ('isEnPassant' in opts ? !!m.isEnPassant === !!opts.isEnPassant : true) &&
      ('capturedPiece' in opts ? m.capturedPiece === opts.capturedPiece : true)
  )
}

export function move(from: string, to: string, extra: Partial<Move> = {}): Move {
  return { from: sq(from), to: sq(to), ...extra }
}
