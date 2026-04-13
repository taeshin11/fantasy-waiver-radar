import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PlayerTable from '@/components/PlayerTable';
import playersData from '@/data/players-fallback.json';
import positionsData from '@/data/positions-fallback.json';

type Props = {
  params: Promise<{ locale: string; sport: string; position: string }>;
};

const SPORT_MAP: Record<string, keyof typeof playersData> = {
  nfl: 'NFL', nba: 'NBA', mlb: 'MLB', nhl: 'NHL',
};

export async function generateStaticParams() {
  const locales = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'pt'];
  const params = [];
  for (const locale of locales) {
    for (const [sport, positions] of Object.entries(positionsData)) {
      for (const position of positions) {
        params.push({ locale, sport: sport.toLowerCase(), position: position.toLowerCase() });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, sport, position } = await params;
  const sportKey = SPORT_MAP[sport.toLowerCase()];
  if (!sportKey) return { title: 'Not Found' };
  return {
    title: `${position.toUpperCase()} Waiver Wire Targets — ${sportKey} Fantasy 2025`,
    description: `Top ${position.toUpperCase()} waiver wire targets for ${sportKey} fantasy. Find available ${position.toUpperCase()}s with high add rates and low ownership.`,
    alternates: { canonical: `https://fantasy-waiver-radar.vercel.app/${locale}/positions/${sport}/${position}` },
  };
}

export default async function PositionPage({ params }: Props) {
  const { locale, sport, position } = await params;
  const sportKey = SPORT_MAP[sport.toLowerCase()];
  if (!sportKey) notFound();

  const sportPlayers = playersData[sportKey] as Parameters<typeof PlayerTable>[0]['players'];
  const players = sportPlayers.filter(
    p => p.position.toLowerCase() === position.toLowerCase()
  );

  if (players.length === 0) notFound();

  const sportIcons: Record<string, string> = { NFL: '🏈', NBA: '🏀', MLB: '⚾', NHL: '🏒' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href={`/${locale}`} className="hover:underline">Home</Link>
        {' / '}
        <Link href={`/${locale}/${sport}`} className="hover:underline uppercase">{sport}</Link>
        {' / '}
        <span className="uppercase">{position}</span>
      </nav>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">{sportIcons[sportKey]}</span>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {position.toUpperCase()} Waiver Wire Targets — {sportKey}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {players.length} {position.toUpperCase()}s available with trending add rates
          </p>
        </div>
      </div>

      {/* Position Navigation */}
      <div className="flex gap-2 flex-wrap mb-6">
        {positionsData[sportKey].map((pos) => (
          <Link
            key={pos}
            href={`/${locale}/positions/${sport}/${pos.toLowerCase()}`}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              pos.toLowerCase() === position.toLowerCase()
                ? { background: 'var(--accent)', color: 'white' }
                : { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }
            }
          >
            {pos}
          </Link>
        ))}
      </div>

      <PlayerTable players={players} locale={locale} sport={sportKey} />
    </div>
  );
}
