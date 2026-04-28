import { Crown, Users, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SubscriptionPlan } from '@/lib/supabase/types'

interface PlanBadgeProps {
  plan: SubscriptionPlan
  className?: string
  size?: 'sm' | 'default'
}

const PLAN_CONFIG = {
  free: {
    label: 'Free',
    icon: Zap,
    className: 'bg-secondary text-muted-foreground border-border/60',
  },
  pro: {
    label: 'Pro',
    icon: Crown,
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  team: {
    label: 'Team',
    icon: Users,
    className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  },
}

export function PlanBadge({ plan, className, size = 'default' }: PlanBadgeProps) {
  const config = PLAN_CONFIG[plan]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === 'sm' ? 'text-xs px-1.5 py-0 gap-1' : 'text-xs px-2 py-0.5 gap-1.5',
        className
      )}
    >
      <Icon className={cn('shrink-0', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
      {config.label}
    </Badge>
  )
}
