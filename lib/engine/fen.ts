import type { Board, CastlingRights, Color } from './types'
import { FEN_TO_PIECE, PIECE_TO_FEN } from './constants'
import { idx, squareName, parseSquare } from './board'

export interface FENParts {
  board: Board
  turn: Color
  castlingRights: CastlingRights
  enPassantSquare: number | null
  halfmoveClock: number
  fullmoveNumber: number
}

export function parseFEN(fen: string): FENParts {
  const parts = fen.trim().split(/\s+/)
  const [boardStr, turnStr, castlingStr, epStr, halfStr, fullStr] = parts

  const board: Board = Array(64).fill(null)
  let rank = 7
  let file = 0
  for (const ch of boardStr) {
    if (ch === '/') {
      rank--
      file = 0
    } else if (ch >= '1' && ch <= '8') {
      file += parseInt(ch, 10)
    } else {
      const piece = FEN_TO_PIECE[ch]
      if (piece) {
        board[idx(file, rank)] = { type: piece.type, color: piece.color }
        file++
      }
    }
  }

  const turn: Color = turnStr === 'w' ? 'white' : 'black'

  const castlingRights: CastlingRights = {
    whiteKingside: castlingStr?.includes('K') ?? false,
    whiteQueenside: castlingStr?.includes('Q') ?? false,
    blackKingside: castlingStr?.includes('k') ?? false,
    blackQueenside: castlingStr?.includes('q') ?? false,
  }

  const enPassantSquare = !epStr || epStr === '-' ? null : parseSquare(epStr)
  const halfmoveClock = parseInt(halfStr ?? '0', 10)
  const fullmoveNumber = parseInt(fullStr ?? '1', 10)

  return { board, turn, castlingRights, enPassantSquare, halfmoveClock, fullmoveNumber }
}

export function serializeFEN(
  board: Board,
  turn: Color,
  castlingRights: CastlingRights,
  enPassantSquare: number | null,
  halfmoveClock: number,
  fullmoveNumber: number
): string {
  const rows: string[] = []
  for (let r = 7; r >= 0; r--) {
    let row = ''
    let empty = 0
    for (let f = 0; f < 8; f++) {
      const piece = board[idx(f, r)]
      if (piece) {
        if (empty) {
          row += empty
          empty = 0
        }
        row += PIECE_TO_FEN[`${piece.type}-${piece.color}`]
      } else {
        empty++
      }
    }
    if (empty) row += empty
    rows.push(row)
  }

  const castlingStr =
    [
      castlingRights.whiteKingside ? 'K' : '',
      castlingRights.whiteQueenside ? 'Q' : '',
      castlingRights.blackKingside ? 'k' : '',
      castlingRights.blackQueenside ? 'q' : '',
    ].join('') || '-'

  const epStr = enPassantSquare !== null ? squareName(enPassantSquare) : '-'

  return `${rows.join('/')} ${turn === 'white' ? 'w' : 'b'} ${castlingStr} ${epStr} ${halfmoveClock} ${fullmoveNumber}`
}

export function positionKey(
  board: Board,
  turn: Color,
  castlingRights: CastlingRights,
  enPassantSquare: number | null
): string {
  const boardStr = board.map((p) => (p ? `${p.color[0]}${p.type[0]}` : '.')).join('')
  const c = castlingRights
  const cr =
    `${c.whiteKingside ? 'K' : ''}${c.whiteQueenside ? 'Q' : ''}${c.blackKingside ? 'k' : ''}${c.blackQueenside ? 'q' : ''}` ||
    '-'
  const ep = enPassantSquare !== null ? squareName(enPassantSquare) : '-'
  return `${boardStr}:${turn[0]}:${cr}:${ep}`
}

export function updateCastlingRights(
  rights: CastlingRights,
  from: number,
  to: number,
  board: Board
): CastlingRights {
  const r = { ...rights }
  const piece = board[from]

  if (piece?.type === 'king') {
    if (piece.color === 'white') {
      r.whiteKingside = false
      r.whiteQueenside = false
    } else {
      r.blackKingside = false
      r.blackQueenside = false
    }
  }

  if (piece?.type === 'rook') {
    if (from === 7) r.whiteKingside = false // h1
    if (from === 0) r.whiteQueenside = false // a1
    if (from === 63) r.blackKingside = false // h8
    if (from === 56) r.blackQueenside = false // a8
  }

  if (to === 7) r.whiteKingside = false
  if (to === 0) r.whiteQueenside = false
  if (to === 63) r.blackKingside = false
  if (to === 56) r.blackQueenside = false

  return r
}
