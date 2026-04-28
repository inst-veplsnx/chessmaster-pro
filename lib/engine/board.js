export function idx(file, rank) {
  return file + rank * 8
}
export function fileOf(square) {
  return square % 8
}
export function rankOf(square) {
  return Math.floor(square / 8)
}
export function isOnBoard(file, rank) {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8
}
export function squareName(square) {
  return String.fromCharCode(97 + fileOf(square)) + String(rankOf(square) + 1)
}
export function parseSquare(name) {
  const file = name.charCodeAt(0) - 97
  const rank = parseInt(name[1], 10) - 1
  return idx(file, rank)
}
export function opponent(color) {
  return color === 'white' ? 'black' : 'white'
}
export function findKing(board, color) {
  for (let i = 0; i < 64; i++) {
    const p = board[i]
    if (p?.type === 'king' && p.color === color) return i
  }
  return -1
}
export function copyBoard(board) {
  return board.slice()
}
export function pieceAt(board, square) {
  return board[square] ?? null
}
