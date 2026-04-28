'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import type { Profile } from '@/lib/supabase/types'

interface SkillsRadarProps {
  profile: Profile
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function buildSkills(profile: Profile) {
  const winRate =
    profile.games_played > 0 ? clamp((profile.games_won / profile.games_played) * 100) : 0

  return [
    { skill: 'Тактика', value: clamp((profile.puzzle_rating - 800) / 12) },
    { skill: 'Рапид', value: clamp((profile.rating_rapid - 800) / 12) },
    { skill: 'Блиц', value: clamp((profile.rating_blitz - 800) / 12) },
    { skill: 'Пуля', value: clamp((profile.rating_bullet - 800) / 12) },
    { skill: '% Побед', value: winRate },
  ]
}

export function SkillsRadar({ profile }: SkillsRadarProps) {
  const data = buildSkills(profile)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <Radar
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
