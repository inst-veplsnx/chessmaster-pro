'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSound } from '@/hooks/useSound'

const BOARD_THEMES = ['classic', 'marble', 'cyberpunk', 'tournament'] as const
type BoardTheme = (typeof BOARD_THEMES)[number]

const THEME_LABELS: Record<BoardTheme, string> = {
  classic: 'Classic Wood',
  marble: 'Marble',
  cyberpunk: 'Cyberpunk',
  tournament: 'Tournament',
}

function BoardThemePreview({ theme }: { theme: BoardTheme }) {
  return (
    <div
      data-board-theme={theme}
      className="overflow-hidden rounded-lg border-2"
      style={{ borderColor: 'var(--board-border)' }}
    >
      <div className="grid grid-cols-4 grid-rows-4">
        {Array.from({ length: 16 }, (_, i) => {
          const row = Math.floor(i / 4)
          const col = i % 4
          const isLight = (row + col) % 2 === 0
          return (
            <div
              key={i}
              className="h-8 w-8"
              style={{ backgroundColor: isLight ? 'var(--board-light)' : 'var(--board-dark)' }}
            />
          )
        })}
      </div>
      <div
        className="px-2 py-1 text-center text-xs font-medium"
        style={{ backgroundColor: 'var(--board-border)', color: 'white' }}
      >
        {THEME_LABELS[theme]}
      </div>
    </div>
  )
}

function AnimationDemo() {
  const [active, setActive] = useState<string | null>(null)

  const animations = [
    { key: 'piece-move', label: 'Piece Move', cls: 'animate-piece-move' },
    { key: 'capture-particle', label: 'Capture', cls: 'animate-capture-particle' },
    { key: 'check-pulse', label: 'Check Pulse', cls: 'animate-check-pulse' },
    { key: 'checkmate-shake', label: 'Checkmate', cls: 'animate-checkmate-shake' },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {animations.map(({ key, label, cls }) => (
        <button
          key={key}
          onClick={() => {
            setActive(key)
            setTimeout(() => setActive(null), 700)
          }}
          className={`flex h-12 w-32 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium transition-colors hover:bg-accent ${active === key ? cls : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function SoundDemo() {
  const {
    playMove,
    playCapture,
    playCheck,
    playGameEnd,
    playIllegal,
    muted,
    setMuted,
    volume,
    setVolume,
  } = useSound()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setMuted(!muted)}>
          {muted ? 'Unmute' : 'Mute'}
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-muted-foreground">Vol: {Math.round(volume * 100)}%</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Move', fn: playMove },
          { label: 'Capture', fn: playCapture },
          { label: 'Check', fn: playCheck },
          { label: 'Game End', fn: playGameEnd },
          { label: 'Illegal', fn: playIllegal },
        ].map(({ label, fn }) => (
          <Button key={label} variant="secondary" size="sm" onClick={fn}>
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function DesignSystemDemo() {
  return (
    <TooltipProvider>
      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="board-themes">Board Themes</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
          <TabsTrigger value="sound">Sound</TabsTrigger>
        </TabsList>

        {/* ── Components ── */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>All button variants and sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const).map(
                  (v) => (
                    <Button key={v} variant={v}>
                      {v}
                    </Button>
                  )
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['sm', 'default', 'lg'] as const).map((s) => (
                  <Button key={s} size={s}>
                    Size {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges &amp; Avatars</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              {(['default', 'secondary', 'destructive', 'outline'] as const).map((v) => (
                <Badge key={v} variant={v}>
                  {v}
                </Badge>
              ))}
              <Separator orientation="vertical" className="h-6" />
              {['GM', 'IM', 'FM'].map((title) => (
                <div key={title} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{title[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{title}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress &amp; Tooltips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Interview Readiness</p>
                <Progress value={68} className="h-2" />
                <p className="text-xs text-muted-foreground">68% — Keep practicing!</p>
              </div>
              <div className="flex gap-3">
                {[
                  { label: 'Algorithm', pct: 80 },
                  { label: 'System Design', pct: 55 },
                  { label: 'Debugging', pct: 70 },
                ].map(({ label, pct }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <div className="flex-1 cursor-pointer space-y-1">
                        <p className="text-xs font-medium">{label}</p>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{pct}% complete</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-sans text-2xl font-bold">Inter — UI Font</p>
              <p className="font-mono text-lg">JetBrains Mono — Notation &amp; Code</p>
              <p className="font-mono text-sm text-muted-foreground">
                1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 — Ruy Lopez
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Board Themes ── */}
        <TabsContent value="board-themes">
          <Card>
            <CardHeader>
              <CardTitle>Board Themes</CardTitle>
              <CardDescription>Four visual themes for the chess board</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                {BOARD_THEMES.map((theme) => (
                  <BoardThemePreview key={theme} theme={theme} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Animations ── */}
        <TabsContent value="animations">
          <Card>
            <CardHeader>
              <CardTitle>Chess Animations</CardTitle>
              <CardDescription>Click each button to preview the animation</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimationDemo />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sound ── */}
        <TabsContent value="sound">
          <Card>
            <CardHeader>
              <CardTitle>Sound Effects</CardTitle>
              <CardDescription>
                Procedurally generated via Web Audio API — no audio files needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SoundDemo />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  )
}
