import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import SportTabs from '@/components/SportTabs';
import PlayerTable from '@/components/PlayerTable';
import playersData from '@/data/players-fallback.json';
import positionsData from '@/data/positions-fallback.json';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ position?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('nbaTitle'),
    description: 'Top NBA waiver wire streaming pickups. Guards, forwards, and centers with high fantasy value and low ownership.',
    alternates: { canonical: `https://fantasy-waiver-radar.vercel.app/${locale}/nba` },
  };
}

export default async function NBAPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const selectedPosition = sp?.position || 'all';

  const players = selectedPosition === 'all'
    ? playersData.NBA
    : playersData.NBA.filter(p => p.position === selectedPosition);

  const positions = ['all', ...positionsData.NBA];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <SportTabs locale={locale} />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">🏀</span>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            NBA Waiver Wire Streaming Pickups
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Top fantasy basketball waiver targets — 2024-25 Season
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {positions.map((pos) => (
          <a
            key={pos}
            href={`?position=${pos}`}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              selectedPosition === pos
                ? { background: 'var(--accent)', color: 'white' }
                : { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }
            }
          >
            {pos === 'all' ? 'All Positions' : pos}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Trending Players', value: players.length },
          { label: 'Avg Add Rate', value: `${Math.round(players.reduce((s, p) => s + p.addRate, 0) / players.length)}%` },
          { label: 'Low Ownership', value: players.filter(p => p.ownership < 30).length },
          { label: 'High Upside', value: players.filter(p => p.projectedValue > 30).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{stat.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 text-xs px-2" style={{ color: 'var(--text-muted)' }}>
        Stats format: PTS/REB/AST per game
      </div>

      <PlayerTable players={players as Parameters<typeof PlayerTable>[0]['players']} locale={locale} sport="NBA" />
    </div>
  );
}
