'use client'

import Link from 'next/link'
import { Settings, Swords, Trophy, Target, Flame } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { SkillsRadar } from '@/components/profile/SkillsRadar'
import { AchievementBadge } from '@/components/profile/AchievementBadge'
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap'
import { GameHistoryTable } from '@/components/profile/GameHistoryTable'
import { computeAchievements } from '@/lib/achievements'

interface Props {
  params: { username: string }
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-secondary" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-secondary" />
          <div className="h-4 w-24 rounded bg-secondary" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-secondary" />
        ))}
      </div>
    </div>
  )
}

export default function UserProfilePage({ params }: Props) {
  const { username } = params
  const { profile: myProfile } = useAuth()
  const { profile, recentGames, heatmapData, loading, error, loadMoreGames, hasMoreGames } =
    useProfile(username)

  const isOwnProfile = myProfile?.username === username

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <ProfileSkeleton />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <p className="text-muted-foreground">{error ?? 'Пользователь не найден'}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/leaderboard">К лидерборду</Link>
        </Button>
      </div>
    )
  }

  const achievements = computeAchievements(profile)
  const winRate =
    profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.display_name ?? profile.username}</h1>
              {profile.is_pro && (
                <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  PRO
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="text-muted-foreground">
                Рапид <span className="font-bold text-foreground">{profile.rating_rapid}</span>
              </span>
              <span className="text-muted-foreground">
                Блиц <span className="font-bold text-foreground">{profile.rating_blitz}</span>
              </span>
              <span className="text-muted-foreground">
                Пуля <span className="font-bold text-foreground">{profile.rating_bullet}</span>
              </span>
              <span className="text-muted-foreground">
                Задачи <span className="font-bold text-foreground">{profile.puzzle_rating}</span>
              </span>
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </Link>
          </Button>
        )}
      </div>

      {/* Stats + Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Swords} label="Партий сыграно" value={profile.games_played} />
          <StatCard icon={Trophy} label="Побед" value={profile.games_won} />
          <StatCard icon={Target} label="% побед" value={`${winRate}%`} />
          <StatCard icon={Flame} label="Задач решено" value={profile.puzzles_solved} />
        </div>
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Навыки</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SkillsRadar profile={profile} />
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {achievements.map(({ def, unlocked }) => (
              <AchievementBadge key={def.id} def={def} unlocked={unlocked} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">Активность за год</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      {/* Game History */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">История партий</CardTitle>
        </CardHeader>
        <CardContent>
          <GameHistoryTable
            games={recentGames}
            userId={profile.id}
            onLoadMore={loadMoreGames}
            hasMore={hasMoreGames}
          />
        </CardContent>
      </Card>
    </div>
  )
}
