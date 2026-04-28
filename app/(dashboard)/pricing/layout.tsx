import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Цены',
  description:
    'Выберите план ChessMaster Pro. Бесплатный, Pro ($9.99/мес) и Team ($29.99/мес). 7 дней бесплатного периода.',
  openGraph: {
    title: 'Цены — ChessMaster Pro',
    description: 'Бесплатно, Pro и Team планы. Начните с 7-дневного пробного периода.',
    url: 'https://chessmasterpro.com/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
