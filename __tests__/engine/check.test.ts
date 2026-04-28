import { GameState, isInCheck, isSquareAttacked } from '@/lib/engine'
import { move, sq, state } from './helpers'

describe('isInCheck', () => {
  test('initial position: neither king in check', () => {
    const s = GameState.initial()
    expect(s.isInCheck('white')).toBe(false)
    expect(s.isInCheck('black')).toBe(false)
  })

  test('white king in check from black rook on same file', () => {
    const s = state('4r3/8/8/8/8/8/8/4K3 w - - 0 1')
    expect(s.isInCheck('white')).toBe(true)
  })

  test('white king in check from black queen diagonal', () => {
    const s = state('8/8/8/8/5q2/8/8/2K5 w - - 0 1')
    expect(s.isInCheck('white')).toBe(true)
  })

  test('white king in check from black knight', () => {
    const s = state('8/8/8/8/8/5n2/8/4K3 w - - 0 1')
    expect(s.isInCheck('white')).toBe(true)
  })

  test('white king in check from black pawn', () => {
    // Black pawn at d2 attacks e1
    const s = state('8/8/8/8/8/8/3p4/4K3 w - - 0 1')
    expect(s.isInCheck('white')).toBe(true)
  })

  test('discovered check: removing a blocking piece exposes check', () => {
    // White rook on e4 blocks black rook on e8 from checking white king on e1
    // Moving white rook unblocks the check
    const s = state('4r3/8/8/8/4R3/8/8/4K3 w - - 0 1')
    expect(s.isInCheck('white')).toBe(false)
    // Move white rook off the file
    const s2 = s.makeMove(move('e4', 'a4'))
    expect(s2.isInCheck('black')).toBe(false) // black turn now, check on white
    expect(isInCheck(s2.board, 'white')).toBe(true)
  })

  test('pinned piece cannot move (would expose king)', () => {
    // White rook on e4 is pinned against king on e1 by black rook on e8
    const s = state('4r3/8/8/8/4R3/8/8/4K3 w - - 0 1')
    const rookMoves = s.getLegalMoves(sq('e4'))
    // Pinned rook can only move along the pin (e-file), not off it
    for (const m of rookMoves) {
      // All legal moves should stay on the e-file
      expect(m.from % 8).toBe(m.to % 8)
    }
  })

  test('must resolve check: only moves that get out of check are legal', () => {
    // White king on e1, black rook on e8 — only moves that escape e-file or block are legal
    const s = state('4r3/8/8/8/8/8/8/4K2k w - - 0 1')
    const result = s.getResult()
    expect(result.status).toBe('check')
    const moves = s.getLegalMoves()
    // All legal moves must resolve check
    for (const m of moves) {
      const after = s.makeMove(m)
      expect(isInCheck(after.board, 'white')).toBe(false)
    }
  })
})

describe('isSquareAttacked', () => {
  test('e1 attacked by black rook on e8', () => {
    const s = state('4r3/8/8/8/8/8/8/8 w - - 0 1')
    expect(isSquareAttacked(s.board, sq('e1'), 'black')).toBe(true)
  })

  test('e1 not attacked when piece is blocking', () => {
    const s = state('4r3/8/8/8/8/8/4P3/8 w - - 0 1')
    expect(isSquareAttacked(s.board, sq('e1'), 'black')).toBe(false)
  })

  test('d4 attacked by white pawn on c3', () => {
    const s = state('8/8/8/8/8/2P5/8/8 w - - 0 1')
    expect(isSquareAttacked(s.board, sq('d4'), 'white')).toBe(true)
  })

  test('d4 not attacked by white pawn on d3 (pawns do not attack straight ahead)', () => {
    const s = state('8/8/8/8/8/3P4/8/8 w - - 0 1')
    expect(isSquareAttacked(s.board, sq('d4'), 'white')).toBe(false)
  })
})
