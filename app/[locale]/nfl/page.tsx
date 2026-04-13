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
    title: t('nflTitle'),
    description: 'Top NFL waiver wire trending players. Running backs, wide receivers, and tight ends with high add rates and injury replacement value.',
    alternates: { canonical: `https://fantasy-waiver-radar.vercel.app/${locale}/nfl` },
    openGraph: { title: t('nflTitle'), url: `https://fantasy-waiver-radar.vercel.app/${locale}/nfl` },
  };
}

export default async function NFLPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const selectedPosition = sp?.position || 'all';

  const players = selectedPosition === 'all'
    ? playersData.NFL
    : playersData.NFL.filter(p => p.position === selectedPosition);

  const positions = ['all', ...positionsData.NFL];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'NFL Fantasy Waiver Wire Trending Players',
    description: 'Top NFL waiver wire picks for fantasy football',
    numberOfItems: players.length,
    itemListElement: players.slice(0, 5).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `https://fantasy-waiver-radar.vercel.app/${locale}/players/${p.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SportTabs locale={locale} />
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏈</span>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                NFL Waiver Wire Trending Players
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Top fantasy football waiver targets — Week 15 2024
              </p>
            </div>
          </div>
        </div>

        {/* Position Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {positions.map((pos) => (
            <a
              key={pos}
              href={`?position=${pos}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedPosition === pos ? 'text-white' : ''
              }`}
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

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
              {Math.round(players.reduce((s, p) => s + p.addRate, 0) / players.length)}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Add Rate</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {players.filter(p => p.tier === 'mustAdd').length}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Must Add</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xl font-bold" style={{ color: '#d97706' }}>
              {players.filter(p => p.injuryReplacement).length}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Injury Replacements</div>
          </div>
        </div>

        <PlayerTable players={players as Parameters<typeof PlayerTable>[0]['players']} locale={locale} sport="NFL" />
      </div>
    </>
  );
}
