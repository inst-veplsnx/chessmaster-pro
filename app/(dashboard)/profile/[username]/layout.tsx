import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username}`,
    description: `Профиль игрока ${username} на ChessMaster Pro. Рейтинг, история партий и достижения.`,
    openGraph: {
      title: `${username} — ChessMaster Pro`,
      description: `Шахматный профиль ${username}: рейтинг ELO, статистика и достижения.`,
      url: `https://chessmasterpro.com/profile/${username}`,
    },
  }
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
