'use client'

import { useSettings, BoardTheme } from '@/hooks/useSettings'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib/utils'
import { Check, Volume2, Eye, Grid3x3, Sparkles, Lock } from 'lucide-react'
import { BillingSection } from '@/components/subscription/BillingSection'

const BOARD_THEMES: { key: BoardTheme; label: string; light: string; dark: string }[] = [
  { key: 'classic', label: 'Классика', light: '#f0d9b5', dark: '#b58863' },
  { key: 'marble', label: 'Мрамор', light: '#ece8e0', dark: '#8b8680' },
  { key: 'cyberpunk', label: 'Киберпанк', light: '#161625', dark: '#0a0a18' },
  { key: 'tournament', label: 'Турнир', light: '#fffef0', dark: '#6b9a45' },
]

function BoardPreview({
  light,
  dark,
  selected,
}: {
  light: string
  dark: string
  selected: boolean
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border-2 transition-all',
        selected ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent'
      )}
    >
      <div className="grid grid-cols-4">
        {Array.from({ length: 16 }, (_, i) => {
          const f = i % 4
          const r = Math.floor(i / 4)
          const isLight = (f + r) % 2 !== 0
          return (
            <div
              key={i}
              className="aspect-square"
              style={{ backgroundColor: isLight ? light : dark }}
            />
          )
        })}
      </div>
      {selected && (
        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  desc,
  value,
  onChange,
}: {
  icon: React.ElementType
  label: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          value ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
            value ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { settings, update, loaded } = useSettings()
  const { canAccessBoardThemes } = useSubscription()

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-xl font-bold">Настройки</h1>
        <p className="mt-1 text-sm text-muted-foreground">Персонализируй игровой опыт</p>
      </div>

      {/* Board theme */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Тема доски</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BOARD_THEMES.map(({ key, label, light, dark }) => {
            const isLocked = key !== 'classic' && !canAccessBoardThemes
            return (
              <button
                key={key}
                onClick={() => !isLocked && update('boardTheme', key)}
                disabled={isLocked}
                className={cn(
                  'group space-y-2 text-center relative',
                  isLocked && 'cursor-not-allowed'
                )}
                title={isLocked ? 'Доступно в Pro' : undefined}
              >
                <div className="relative">
                  <div className={cn(isLocked && 'opacity-40')}>
                    <BoardPreview
                      light={light}
                      dark={dark}
                      selected={settings.boardTheme === key}
                    />
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/30">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 shadow">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isLocked
                      ? 'text-muted-foreground/50'
                      : settings.boardTheme === key
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {label}
                </p>
              </button>
            )
          })}
        </div>
        {!canAccessBoardThemes && (
          <p className="text-xs text-muted-foreground text-center">
            Остальные темы доступны в{' '}
            <a href="/pricing" className="text-primary hover:underline">
              Pro плане
            </a>
          </p>
        )}

        {/* Live preview */}
        <div
          className="mt-4 overflow-hidden rounded-2xl border border-border/60 shadow-lg"
          data-board-theme={settings.boardTheme}
        >
          <div className="grid grid-cols-8">
            {Array.from({ length: 64 }, (_, i) => {
              const f = i % 8
              const r = 7 - Math.floor(i / 8)
              const isLight = (f + r) % 2 !== 0
              return (
                <div
                  key={i}
                  className={cn(
                    'aspect-square',
                    isLight ? 'board-square-light' : 'board-square-dark'
                  )}
                />
              )
            })}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">Предпросмотр</p>
      </section>

      {/* Toggles */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Игровые опции</h2>
        </div>
        <div className="space-y-2">
          <ToggleRow
            icon={Volume2}
            label="Звуковые эффекты"
            desc="Звуки ходов, взятий и шахов"
            value={settings.soundEnabled}
            onChange={(v) => update('soundEnabled', v)}
          />
          <ToggleRow
            icon={Sparkles}
            label="Анимации"
            desc="Плавные анимации фигур и подсветка"
            value={settings.animationsEnabled}
            onChange={(v) => update('animationsEnabled', v)}
          />
          <ToggleRow
            icon={Eye}
            label="Координаты доски"
            desc="Буквы и цифры по краям доски"
            value={settings.showCoordinates}
            onChange={(v) => update('showCoordinates', v)}
          />
          <ToggleRow
            icon={Grid3x3}
            label="Подсветка ходов"
            desc="Выделять последний ход и допустимые ходы"
            value={settings.highlightMoves}
            onChange={(v) => update('highlightMoves', v)}
          />
        </div>
      </section>

      {/* Billing */}
      <BillingSection />
    </div>
  )
}
