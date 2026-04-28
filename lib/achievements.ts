import type { Profile } from './supabase/types'

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  check: (p: Profile) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_win',
    title: 'First Blood',
    description: 'Win your first game',
    icon: '⚔️',
    check: (p) => p.games_won >= 1,
  },
  {
    id: 'ten_wins',
    title: 'Veteran',
    description: 'Win 10 games',
    icon: '🏅',
    check: (p) => p.games_won >= 10,
  },
  {
    id: 'fifty_wins',
    title: 'Champion',
    description: 'Win 50 games',
    icon: '🏆',
    check: (p) => p.games_won >= 50,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Play 100 games',
    icon: '💯',
    check: (p) => p.games_played >= 100,
  },
  {
    id: 'puzzle_rookie',
    title: 'Puzzle Rookie',
    description: 'Solve 10 puzzles',
    icon: '🧩',
    check: (p) => p.puzzles_solved >= 10,
  },
  {
    id: 'puzzle_master',
    title: 'Puzzle Master',
    description: 'Solve 50 puzzles',
    icon: '🔮',
    check: (p) => p.puzzles_solved >= 50,
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Reach 1500 rating',
    icon: '⭐',
    check: (p) => p.rating >= 1500,
  },
  {
    id: 'expert',
    title: 'Expert',
    description: 'Reach 2000 rating',
    icon: '💫',
    check: (p) => p.rating >= 2000,
  },
]

export interface ComputedAchievement {
  def: AchievementDef
  unlocked: boolean
}

export function computeAchievements(profile: Profile): ComputedAchievement[] {
  return ACHIEVEMENTS.map((def) => ({
    def,
    unlocked: def.check(profile),
  }))
}
