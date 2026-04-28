import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Играть',
  description: 'Играй в шахматы против AI (20 уровней) или онлайн. Режимы: блиц, рапид, классика.',
}

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children
}
