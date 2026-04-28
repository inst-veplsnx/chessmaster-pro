import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Задачи',
  description:
    '276 шахматных задач для подготовки к техническим интервью. Алгоритмы, системный дизайн и паттерны.',
}

export default function PuzzlesLayout({ children }: { children: React.ReactNode }) {
  return children
}
