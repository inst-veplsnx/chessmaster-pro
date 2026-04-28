import { GameState } from '@/lib/engine'
import { move, sq, state } from './helpers'

describe('50-Move Rule', () => {
  test('draw by 50-move rule when halfmoveClock reaches 100', () => {
    // Create a state with halfmoveClock = 99, then make a non-pawn, non-capture move
    const s = state('8/8/4k3/8/8/4K3/8/7R w - - 99 60')
    const s2 = s.makeMove(move('h1', 'h2')) // rook move, no capture, no pawn
    expect(s2.halfmoveClock).toBe(100)
    const result = s2.getResult()
    expect(result.status).toBe('draw')
    expect(result.drawReason).toBe('fifty-move')
  })

  test('halfmoveClock resets on pawn move', () => {
    const s = state('8/8/4k3/8/8/4K3/4P3/8 w - - 50 30')
    const s2 = s.makeMove(move('e2', 'e4'))
    expect(s2.halfmoveClock).toBe(0)
  })

  test('halfmoveClock resets on capture', () => {
    const s = state('8/8/4k3/8/8/4K3/8/7R w - - 50 30')
    // Move rook to capture — need a black piece to capture
    const s2 = state('8/8/4k3/8/8/4K3/8/4r2R w - - 50 30')
    const s3 = s2.makeMove(move('h1', 'e1', { capturedPiece: 'rook' }))
    expect(s3.halfmoveClock).toBe(0)
  })

  test('halfmoveClock increments on non-pawn non-capture move', () => {
    const s = state('8/8/4k3/8/8/4K3/8/7R w - - 10 10')
    const s2 = s.makeMove(move('h1', 'h2'))
    expect(s2.halfmoveClock).toBe(11)
  })
})

describe('Threefold Repetition', () => {
  test('draw by threefold repetition when same position occurs 3 times', () => {
    // Two rooks shuffling back and forth
    let s = state('8/8/3k4/8/8/3K4/8/7R w - - 0 1')
    s = s.makeMove(move('h1', 'h2')) // pos A
    s = s.makeMove(move('d6', 'e6'))
    s = s.makeMove(move('h2', 'h1')) // pos B = initial
    s = s.makeMove(move('e6', 'd6')) // back to initial position (2nd time for initial)
    s = s.makeMove(move('h1', 'h2')) // pos A again
    s = s.makeMove(move('d6', 'e6'))
    s = s.makeMove(move('h2', 'h1')) // back to initial position (3rd time)
    s = s.makeMove(move('e6', 'd6'))
    const result = s.getResult()
    expect(result.status).toBe('draw')
    expect(result.drawReason).toBe('repetition')
  })
})

describe('Insufficient Material', () => {
  test('King vs King is a draw', () => {
    const s = state('k7/8/8/8/8/8/8/K7 w - - 0 1')
    expect(s.getResult().status).toBe('draw')
    expect(s.getResult().drawReason).toBe('insufficient-material')
  })

  test('King + Bishop vs King is a draw', () => {
    const s = state('k7/8/8/8/8/8/8/KB6 w - - 0 1')
    expect(s.getResult().status).toBe('draw')
    expect(s.getResult().drawReason).toBe('insufficient-material')
  })

  test('King + Knight vs King is a draw', () => {
    const s = state('k7/8/8/8/8/8/8/KN6 w - - 0 1')
    expect(s.getResult().status).toBe('draw')
    expect(s.getResult().drawReason).toBe('insufficient-material')
  })

  test('King + Bishop vs King + Bishop (same color) is a draw', () => {
    // Both bishops on light squares
    const s = state('k1b5/8/8/8/8/8/8/K1B5 w - - 0 1')
    // c1=light, c8=light (both file 2, rank 0 and rank 7: (2+0)%2=0, (2+7)%2=1) — both dark
    // Let me verify: c1 = idx(2,0) fileOf=2, rankOf=0, (2+0)%2=0 (dark)
    //                c8 = idx(2,7) fileOf=2, rankOf=7, (2+7)%2=1 (light) — not same color
    // Use b1 and b7 instead: b1=idx(1,0): (1+0)%2=1 (light), b7=idx(1,6): (1+6)%2=1 (light) — same!
    const s2 = state('k6b/8/8/8/8/8/8/K6B w - - 0 1')
    // h1=idx(7,0): (7+0)%2=1, h8=idx(7,7): (7+7)%2=0 — different color
    // a2=idx(0,1): (0+1)%2=1, a7=idx(0,6): (0+6)%2=0 — different
    // b1=idx(1,0): (1+0)%2=1, b8=idx(1,7): (1+7)%2=0 — different
    // c2=idx(2,1): (2+1)%2=1, c7=idx(2,6): (2+6)%2=0 — different
    // Need same parity: file+rank must both be even or both odd
    // b2=idx(1,1): parity=0, b7=idx(1,6): parity=1 — different
    // a1=idx(0,0): parity=0, a8=idx(0,7): parity=1 — different
    // c1=idx(2,0): parity=0, c8=idx(2,7): parity=1 — different
    // h2=idx(7,1): parity=0, h7=idx(7,6): parity=1 — different
    // The bishops must be on same colored squares. With one bishop per side:
    // Let's put both on light squares (parity 1): b1(parity 1), f8(idx(5,7):parity 0) — diff
    // b1(1+0=1, parity 1), b8(1+7=8, parity 0) — diff
    // Hmm let me just pick concrete squares:
    // c3=idx(2,2): (2+2)%2=0 (dark)
    // f6=idx(5,5): (5+5)%2=0 (dark) — both dark! Same color!
    const s3 = state('k7/8/5b2/8/8/2B5/8/K7 w - - 0 1')
    expect(s3.getResult().status).toBe('draw')
    expect(s3.getResult().drawReason).toBe('insufficient-material')
  })

  test('King + Rook vs King is NOT a draw (sufficient material)', () => {
    const s = state('k7/8/8/8/8/8/8/KR6 w - - 0 1')
    expect(s.getResult().drawReason).not.toBe('insufficient-material')
  })

  test('King + 2 Knights vs King is not automatically a draw (but is in practice — test what engine says)', () => {
    // By FIDE rules, KNN vs K is NOT insufficient material (theoretically can force mate with help)
    // But practically our engine doesn't auto-draw it — just check status isn't insufficient
    const s = state('k7/8/8/8/8/8/8/KNN5 w - - 0 1')
    expect(s.getResult().drawReason).not.toBe('insufficient-material')
  })
})
