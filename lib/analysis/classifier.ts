export type MoveQuality = 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'

export interface ClassifiedMove {
  san: string
  uci: string
  quality: MoveQuality
  cpLoss: number
  evalBefore: number
  evalAfter: number
  isBestMove: boolean
}

// cpLoss: centipawns lost by the moving player (0 = perfect, higher = worse)
export function classifyMove(cpLoss: number): MoveQuality {
  if (cpLoss <= 5) return 'great'
  if (cpLoss <= 20) return 'good'
  if (cpLoss <= 60) return 'inaccuracy'
  if (cpLoss <= 150) return 'mistake'
  return 'blunder'
}

export const QUALITY_STYLE: Record<MoveQuality, { bg: string; text: string; label: string }> = {
  brilliant: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: '!!' },
  great: { bg: 'bg-green-500/20', text: 'text-green-400', label: '!' },
  good: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '⊙' },
  inaccuracy: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '?!' },
  mistake: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: '?' },
  blunder: { bg: 'bg-red-500/20', text: 'text-red-400', label: '??' },
}
