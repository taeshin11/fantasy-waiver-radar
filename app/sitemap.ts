import { MetadataRoute } from 'next';
import playersData from '@/data/players-fallback.json';
import positionsData from '@/data/positions-fallback.json';

const BASE_URL = 'https://fantasy-waiver-radar.vercel.app';
const LOCALES = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'pt'];
const SPORTS = ['nfl', 'nba', 'mlb', 'nhl'];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  // Home pages
  for (const locale of LOCALES) {
    urls.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  }

  // Sport pages
  for (const locale of LOCALES) {
    for (const sport of SPORTS) {
      urls.push({
        url: `${BASE_URL}/${locale}/${sport}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  }

  // Rankings pages
  for (const locale of LOCALES) {
    urls.push({
      url: `${BASE_URL}/${locale}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  // Player pages
  const allPlayers = [
    ...playersData.NFL,
    ...playersData.NBA,
    ...playersData.MLB,
    ...playersData.NHL,
  ];
  for (const locale of LOCALES) {
    for (const player of allPlayers) {
      urls.push({
        url: `${BASE_URL}/${locale}/players/${player.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Position pages
  for (const locale of LOCALES) {
    for (const [sport, positions] of Object.entries(positionsData)) {
      for (const pos of positions) {
        urls.push({
          url: `${BASE_URL}/${locale}/positions/${sport.toLowerCase()}/${pos.toLowerCase()}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  }

  return urls;
}
