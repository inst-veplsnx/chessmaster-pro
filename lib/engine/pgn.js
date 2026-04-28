import { PROMOTION_CHAR } from './constants'
import { fileOf, rankOf, squareName } from './board'
function promotionSuffix(type) {
  return '=' + PROMOTION_CHAR[type]
}

export function moveToSAN(state, move) {
  if (move.isCastling) {
    return move.isCastling === 'kingside' ? 'O-O' : 'O-O-O'
  }
  const piece = state.board[move.from]
  const isCapture = move.capturedPiece !== undefined || move.isEnPassant === true
  const toName = squareName(move.to)
  let san = ''
  if (piece.type === 'pawn') {
    if (isCapture) {
      san = String.fromCharCode(97 + fileOf(move.from)) + 'x' + toName
    } else {
      san = toName
    }
    if (move.promotion) {
      san += promotionSuffix(move.promotion)
    }
  } else {
    const pieceChar = piece.type === 'knight' ? 'N' : piece.type[0].toUpperCase()
    const fromFile = fileOf(move.from)
    const fromRank = rankOf(move.from)
    const ambiguous = state
      .getLegalMoves()
      .filter(
        (m) =>
          m.to === move.to &&
          m.from !== move.from &&
          state.board[m.from]?.type === piece.type &&
          state.board[m.from]?.color === piece.color
      )
    let dis = ''
    if (ambiguous.length > 0) {
      const sameFile = ambiguous.some((m) => fileOf(m.from) === fromFile)
      const sameRank = ambiguous.some((m) => rankOf(m.from) === fromRank)
      if (!sameFile) {
        dis = String.fromCharCode(97 + fromFile)
      } else if (!sameRank) {
        dis = String(fromRank + 1)
      } else {
        dis = String.fromCharCode(97 + fromFile) + String(fromRank + 1)
      }
    }
    san = pieceChar + dis + (isCapture ? 'x' : '') + toName
  }
  const next = state.makeMove(move)
  const result = next.getResult()
  if (result.status === 'checkmate') san += '#'
  else if (result.status === 'check') san += '+'
  return san
}
