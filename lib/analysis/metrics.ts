import { ClassifiedMove, MoveQuality } from './classifier'

export interface GameMetrics {
  accuracy: number // 0-100
  brilliant: number
  great: number
  good: number
  inaccuracies: number
  mistakes: number
  blunders: number
  avgCpLoss: number
}

function cpLossToAccuracy(avgCpLoss: number): number {
  const accuracy = 103.1668 * Math.exp(-0.04354 * avgCpLoss) - 3.1669
  return Math.max(0, Math.min(100, Math.round(accuracy * 10) / 10))
}

export function calculateMetrics(moves: ClassifiedMove[]): GameMetrics {
  if (moves.length === 0) {
    return {
      accuracy: 0,
      brilliant: 0,
      great: 0,
      good: 0,
      inaccuracies: 0,
      mistakes: 0,
      blunders: 0,
      avgCpLoss: 0,
    }
  }

  const counts: Record<MoveQuality, number> = {
    brilliant: 0,
    great: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  }
  let totalLoss = 0

  for (const m of moves) {
    counts[m.quality]++
    totalLoss += Math.max(0, m.cpLoss)
  }

  const avgCpLoss = totalLoss / moves.length

  return {
    accuracy: cpLossToAccuracy(avgCpLoss),
    brilliant: counts.brilliant,
    great: counts.great,
    good: counts.good,
    inaccuracies: counts.inaccuracy,
    mistakes: counts.mistake,
    blunders: counts.blunder,
    avgCpLoss: Math.round(avgCpLoss),
  }
}

export function getTopMistakes(moves: ClassifiedMove[], n = 3): ClassifiedMove[] {
  return [...moves]
    .filter((m) => m.quality === 'mistake' || m.quality === 'blunder')
    .sort((a, b) => b.cpLoss - a.cpLoss)
    .slice(0, n)
}
