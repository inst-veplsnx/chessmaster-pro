import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing', '/leaderboard'],
      disallow: ['/play', '/puzzles', '/analysis', '/settings', '/stats', '/profile', '/api/'],
    },
    sitemap: 'https://chessmasterpro.com/sitemap.xml',
  }
}
