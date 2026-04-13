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
    title: t('mlbTitle'),
    description: 'Top MLB waiver wire streamers. Starting pitchers and hot hitters with favorable matchups and high fantasy value.',
    alternates: { canonical: `https://fantasy-waiver-radar.vercel.app/${locale}/mlb` },
  };
}

export default async function MLBPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const selectedPosition = sp?.position || 'all';

  const players = selectedPosition === 'all'
    ? playersData.MLB
    : playersData.MLB.filter(p => p.position === selectedPosition);

  const positions = ['all', ...positionsData.MLB];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <SportTabs locale={locale} />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">⚾</span>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            MLB Waiver Wire Streamers
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Top fantasy baseball waiver targets — 2025 Season
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

      <div className="mb-4 p-4 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
        <p className="text-sm font-medium" style={{ color: '#92400e' }}>
          🌟 Pitcher Streamers: Great week for starters with favorable home matchups
        </p>
      </div>

      <PlayerTable players={players as Parameters<typeof PlayerTable>[0]['players']} locale={locale} sport="MLB" />
    </div>
  );
}
