import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Рейтинг',
  description: 'Таблица лидеров ChessMaster Pro. Рейтинги игроков по блицу, рапиду и классике.',
  openGraph: {
    title: 'Рейтинг — ChessMaster Pro',
    description: 'Топ игроков платформы. Сравни свой ELO с лучшими.',
    url: 'https://chessmasterpro.com/leaderboard',
  },
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
