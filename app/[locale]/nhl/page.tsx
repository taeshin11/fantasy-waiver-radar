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
    title: t('nhlTitle'),
    description: 'Top NHL waiver wire targets. Goal scorers and goaltenders with hot schedules and low ownership.',
    alternates: { canonical: `https://fantasy-waiver-radar.vercel.app/${locale}/nhl` },
  };
}

export default async function NHLPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const selectedPosition = sp?.position || 'all';

  const players = selectedPosition === 'all'
    ? playersData.NHL
    : playersData.NHL.filter(p => p.position === selectedPosition);

  const positions = ['all', ...positionsData.NHL];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <SportTabs locale={locale} />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">🏒</span>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            NHL Waiver Wire Streamers
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Top fantasy hockey waiver targets — 2024-25 Season
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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{players.filter(p => p.position === 'G').length}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Goalies Available</div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>{players.filter(p => p.position === 'D').length}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>D-Men Trending</div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-bold" style={{ color: '#d97706' }}>3+</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Games/Week Avg</div>
        </div>
      </div>

      <PlayerTable players={players as Parameters<typeof PlayerTable>[0]['players']} locale={locale} sport="NHL" />
    </div>
  );
}
