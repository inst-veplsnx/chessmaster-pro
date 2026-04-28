'use client'

import { Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { AchievementDef } from '@/lib/achievements'

interface AchievementBadgeProps {
  def: AchievementDef
  unlocked: boolean
}

export function AchievementBadge({ def, unlocked }: AchievementBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
              unlocked
                ? 'border-primary/40 bg-primary/5 text-foreground'
                : 'border-border bg-secondary/30 text-muted-foreground opacity-50'
            }`}
          >
            <span className="text-2xl">{unlocked ? def.icon : <Lock className="h-6 w-6" />}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {unlocked ? def.title : '???'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{def.title}</p>
          <p className="text-xs text-muted-foreground">{def.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
