import { PIECE_VALUES } from './constants'
export function evaluate(board) {
  let score = 0
  for (const piece of board) {
    if (!piece) continue
    const value = PIECE_VALUES[piece.type]
    score += piece.color === 'white' ? value : -value
  }
  return score
}
export function evaluateFor(board, color) {
  const raw = evaluate(board)
  return color === 'white' ? raw : -raw
}
