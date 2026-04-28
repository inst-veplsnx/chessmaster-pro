import type { Board, CastlingRights, Color, Move, PieceType } from './types'
import {
  BISHOP_DIRS,
  CASTLING_SQUARES,
  KING_DIRS,
  KNIGHT_OFFSETS,
  QUEEN_DIRS,
  ROOK_DIRS,
} from './constants'
import { fileOf, findKing, idx, isOnBoard, rankOf } from './board'

export function isSquareAttacked(board: Board, square: number, byColor: Color): boolean {
  const f = fileOf(square)
  const r = rankOf(square)

  const pawnOriginRank = byColor === 'white' ? r - 1 : r + 1
  if (pawnOriginRank >= 0 && pawnOriginRank < 8) {
    for (const pf of [f - 1, f + 1]) {
      if (pf < 0 || pf >= 8) continue
      const p = board[idx(pf, pawnOriginRank)]
      if (p?.type === 'pawn' && p.color === byColor) return true
    }
  }

  for (const [df, dr] of KNIGHT_OFFSETS) {
    const nf = f + df
    const nr = r + dr
    if (!isOnBoard(nf, nr)) continue
    const p = board[idx(nf, nr)]
    if (p?.type === 'knight' && p.color === byColor) return true
  }

  for (const [df, dr] of ROOK_DIRS) {
    let cf = f + df
    let cr = r + dr
    while (isOnBoard(cf, cr)) {
      const p = board[idx(cf, cr)]
      if (p) {
        if (p.color === byColor && (p.type === 'rook' || p.type === 'queen')) return true
        break
      }
      cf += df
      cr += dr
    }
  }

  for (const [df, dr] of BISHOP_DIRS) {
    let cf = f + df
    let cr = r + dr
    while (isOnBoard(cf, cr)) {
      const p = board[idx(cf, cr)]
      if (p) {
        if (p.color === byColor && (p.type === 'bishop' || p.type === 'queen')) return true
        break
      }
      cf += df
      cr += dr
    }
  }

  for (const [df, dr] of KING_DIRS) {
    const kf = f + df
    const kr = r + dr
    if (!isOnBoard(kf, kr)) continue
    const p = board[idx(kf, kr)]
    if (p?.type === 'king' && p.color === byColor) return true
  }

  return false
}

export function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color)
  if (king === -1) return false
  return isSquareAttacked(board, king, color === 'white' ? 'black' : 'white')
}

export function applyMoveToBoard(board: Board, move: Move): Board {
  const b = board.slice()
  const piece = b[move.from]!

  b[move.to] = move.promotion ? { type: move.promotion, color: piece.color } : piece
  b[move.from] = null

  if (move.isEnPassant) {
    const capturedRank = rankOf(move.to) + (piece.color === 'white' ? -1 : 1)
    b[idx(fileOf(move.to), capturedRank)] = null
  }

  if (move.isCastling === 'kingside') {
    if (piece.color === 'white') {
      b[5] = b[7] // f1 ← h1
      b[7] = null
    } else {
      b[61] = b[63] // f8 ← h8
      b[63] = null
    }
  } else if (move.isCastling === 'queenside') {
    if (piece.color === 'white') {
      b[3] = b[0] // d1 ← a1
      b[0] = null
    } else {
      b[59] = b[56] // d8 ← a8
      b[56] = null
    }
  }

  return b
}

function addPawnMoves(
  board: Board,
  from: number,
  color: Color,
  epSquare: number | null,
  out: Move[]
): void {
  const f = fileOf(from)
  const r = rankOf(from)
  const dir = color === 'white' ? 1 : -1
  const startRank = color === 'white' ? 1 : 6
  const promRank = color === 'white' ? 7 : 0

  const r1 = r + dir
  if (r1 >= 0 && r1 < 8) {
    const to1 = idx(f, r1)
    if (!board[to1]) {
      if (r1 === promRank) {
        for (const promo of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
          out.push({ from, to: to1, promotion: promo })
        }
      } else {
        out.push({ from, to: to1 })
      }

      if (r === startRank) {
        const r2 = r + 2 * dir
        const to2 = idx(f, r2)
        if (!board[to2]) {
          out.push({ from, to: to2 })
        }
      }
    }
  }

  for (const df of [-1, 1]) {
    const cf = f + df
    const cr = r + dir
    if (!isOnBoard(cf, cr)) continue
    const to = idx(cf, cr)
    const target = board[to]

    if (target && target.color !== color) {
      if (cr === promRank) {
        for (const promo of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
          out.push({ from, to, promotion: promo, capturedPiece: target.type })
        }
      } else {
        out.push({ from, to, capturedPiece: target.type })
      }
    }

    if (epSquare !== null && to === epSquare) {
      out.push({ from, to, isEnPassant: true, capturedPiece: 'pawn' })
    }
  }
}

function addKnightMoves(board: Board, from: number, color: Color, out: Move[]): void {
  const f = fileOf(from)
  const r = rankOf(from)
  for (const [df, dr] of KNIGHT_OFFSETS) {
    const cf = f + df
    const cr = r + dr
    if (!isOnBoard(cf, cr)) continue
    const to = idx(cf, cr)
    const target = board[to]
    if (!target || target.color !== color) {
      out.push({ from, to, ...(target ? { capturedPiece: target.type } : {}) })
    }
  }
}

function addSlidingMoves(
  board: Board,
  from: number,
  color: Color,
  dirs: [number, number][],
  out: Move[]
): void {
  const f = fileOf(from)
  const r = rankOf(from)
  for (const [df, dr] of dirs) {
    let cf = f + df
    let cr = r + dr
    while (isOnBoard(cf, cr)) {
      const to = idx(cf, cr)
      const target = board[to]
      if (target) {
        if (target.color !== color) {
          out.push({ from, to, capturedPiece: target.type })
        }
        break
      }
      out.push({ from, to })
      cf += df
      cr += dr
    }
  }
}

function addKingMoves(
  board: Board,
  from: number,
  color: Color,
  castlingRights: CastlingRights,
  out: Move[]
): void {
  const f = fileOf(from)
  const r = rankOf(from)

  for (const [df, dr] of KING_DIRS) {
    const cf = f + df
    const cr = r + dr
    if (!isOnBoard(cf, cr)) continue
    const to = idx(cf, cr)
    const target = board[to]
    if (!target || target.color !== color) {
      out.push({ from, to, ...(target ? { capturedPiece: target.type } : {}) })
    }
  }

  if (color === 'white') {
    if (
      castlingRights.whiteKingside &&
      !board[5] &&
      !board[6] &&
      board[CASTLING_SQUARES.whiteRookKingside]?.type === 'rook' &&
      board[CASTLING_SQUARES.whiteRookKingside]?.color === 'white'
    ) {
      out.push({ from, to: 6, isCastling: 'kingside' })
    }
    if (
      castlingRights.whiteQueenside &&
      !board[1] &&
      !board[2] &&
      !board[3] &&
      board[CASTLING_SQUARES.whiteRookQueenside]?.type === 'rook' &&
      board[CASTLING_SQUARES.whiteRookQueenside]?.color === 'white'
    ) {
      out.push({ from, to: 2, isCastling: 'queenside' })
    }
  } else {
    if (
      castlingRights.blackKingside &&
      !board[61] &&
      !board[62] &&
      board[CASTLING_SQUARES.blackRookKingside]?.type === 'rook' &&
      board[CASTLING_SQUARES.blackRookKingside]?.color === 'black'
    ) {
      out.push({ from, to: 62, isCastling: 'kingside' })
    }
    if (
      castlingRights.blackQueenside &&
      !board[57] &&
      !board[58] &&
      !board[59] &&
      board[CASTLING_SQUARES.blackRookQueenside]?.type === 'rook' &&
      board[CASTLING_SQUARES.blackRookQueenside]?.color === 'black'
    ) {
      out.push({ from, to: 58, isCastling: 'queenside' })
    }
  }
}

function generatePseudoLegal(
  board: Board,
  color: Color,
  epSquare: number | null,
  castlingRights: CastlingRights
): Move[] {
  const moves: Move[] = []
  for (let from = 0; from < 64; from++) {
    const piece = board[from]
    if (!piece || piece.color !== color) continue
    switch (piece.type) {
      case 'pawn':
        addPawnMoves(board, from, color, epSquare, moves)
        break
      case 'knight':
        addKnightMoves(board, from, color, moves)
        break
      case 'bishop':
        addSlidingMoves(board, from, color, BISHOP_DIRS, moves)
        break
      case 'rook':
        addSlidingMoves(board, from, color, ROOK_DIRS, moves)
        break
      case 'queen':
        addSlidingMoves(board, from, color, QUEEN_DIRS, moves)
        break
      case 'king':
        addKingMoves(board, from, color, castlingRights, moves)
        break
    }
  }
  return moves
}

function isLegal(board: Board, move: Move, color: Color, opp: Color): boolean {
  if (move.isCastling) {
    if (isInCheck(board, color)) return false
    const transit = move.from + (move.isCastling === 'kingside' ? 1 : -1)
    if (isSquareAttacked(board, transit, opp)) return false
  }

  const newBoard = applyMoveToBoard(board, move)
  return !isInCheck(newBoard, color)
}

export function generateLegalMoves(
  board: Board,
  color: Color,
  epSquare: number | null,
  castlingRights: CastlingRights
): Move[] {
  const opp: Color = color === 'white' ? 'black' : 'white'
  return generatePseudoLegal(board, color, epSquare, castlingRights).filter((m) =>
    isLegal(board, m, color, opp)
  )
}
