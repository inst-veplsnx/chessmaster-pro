import { GameState } from '@/lib/engine'
import { sq, state } from './helpers'

describe('Checkmate', () => {
  test("Fool's Mate (2-move checkmate)", () => {
    // 1. f3 e5 2. g4 Qh4#
    let s = GameState.initial()
    s = s.makeMove({ from: sq('f2'), to: sq('f3') })
    s = s.makeMove({ from: sq('e7'), to: sq('e5') })
    s = s.makeMove({ from: sq('g2'), to: sq('g4') })
    s = s.makeMove({ from: sq('d8'), to: sq('h4') })
    const result = s.getResult()
    expect(result.status).toBe('checkmate')
    expect(result.winner).toBe('black')
    expect(s.getLegalMoves()).toHaveLength(0)
  })

  test("Scholar's Mate (4-move checkmate)", () => {
    // 1. e4 e5 2. Bc4 Bc5 3. Qh5 Nc6 4. Qxf7#
    let s = GameState.initial()
    s = s.makeMove({ from: sq('e2'), to: sq('e4') })
    s = s.makeMove({ from: sq('e7'), to: sq('e5') })
    s = s.makeMove({ from: sq('f1'), to: sq('c4') })
    s = s.makeMove({ from: sq('f8'), to: sq('c5') })
    s = s.makeMove({ from: sq('d1'), to: sq('h5') })
    s = s.makeMove({ from: sq('b8'), to: sq('c6') })
    s = s.makeMove({ from: sq('h5'), to: sq('f7'), capturedPiece: 'pawn' })
    const result = s.getResult()
    expect(result.status).toBe('checkmate')
    expect(result.winner).toBe('white')
  })

  test('Back rank mate', () => {
    // White rook delivers back rank mate
    const s = state('6k1/5ppp/8/8/8/8/8/R7 w - - 0 1')
    const after = s.makeMove({ from: sq('a1'), to: sq('a8') })
    expect(after.getResult().status).toBe('checkmate')
    expect(after.getResult().winner).toBe('white')
  })

  test('Smothered mate (knight)', () => {
    // Classic smothered mate: black king on h8, surrounded by own pieces, white knight on f7 gives checkmate
    // Black king on h8, rook on g8, pawns on g7/h7 — white knight on f7 gives checkmate (black to move)
    const s2 = state('6rk/5Npp/8/8/8/8/8/K7 b - - 0 1')
    const result = s2.getResult()
    expect(result.status).toBe('checkmate')
    expect(result.winner).toBe('white')
  })

  test('checkmate returns no legal moves', () => {
    // White rook on a8, white king on h1, black king on f1 — need to verify this is actually mate
    // Let's use a known mate position: black king trapped
    const s2 = state('7k/6Q1/5K2/8/8/8/8/8 b - - 0 1')
    expect(s2.getResult().status).toBe('checkmate')
    expect(s2.getLegalMoves()).toHaveLength(0)
  })
})
