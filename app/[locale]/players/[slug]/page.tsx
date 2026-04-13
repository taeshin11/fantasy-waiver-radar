import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RecommendationBadge from '@/components/RecommendationBadge';
import OwnershipBadge from '@/components/OwnershipBadge';
import TrendChart from '@/components/TrendChart';
import playersData from '@/data/players-fallback.json';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

type AnyPlayer = typeof playersData.NFL[0] | typeof playersData.NBA[0] | typeof playersData.MLB[0] | typeof playersData.NHL[0];

function findPlayer(slug: string): AnyPlayer | null {
  const allPlayers = [
    ...playersData.NFL,
    ...playersData.NBA,
    ...playersData.MLB,
    ...playersData.NHL,
  ];
  return allPlayers.find(p => p.slug === slug) || null;
}

export async function generateStaticParams() {
  const allPlayers = [
    ...playersData.NFL,
    ...playersData.NBA,
    ...playersData.MLB,
    ...playersData.NHL,
  ];
  const locales = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'pt'];
  return locales.flatMap(locale =>
    allPlayers.map(p => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const player = findPlayer(slug);
  if (!player) return { title: 'Player Not Found' };

  const tier = 'tier' in player ? player.tier : 'stream';
  const tierLabel = tier === 'mustAdd' ? 'Must Add' : tier === 'stream' ? 'Stream' : 'Stash';

  return {
    title: `${player.name} Fantasy Waiver Wire — ${tierLabel} | ${player.sport} ${player.position}`,
    description: `${player.name} trending +${player.addRate}% on waivers. ${tierLabel}. ${player.ownership}% owned. See stats, ownership trend, and add recommendation.`,
    alternates: { canonical: `https://fantasy-waiver-radar.vercel.app/${locale}/players/${slug}` },
    openGraph: {
      title: `${player.name} — Fantasy Waiver Wire Analysis`,
      description: `${player.name} add recommendation: ${tierLabel}. Trending +${player.addRate}% this week.`,
    },
  };
}

function getPlayerStats(player: AnyPlayer): Array<{ label: string; value: string | number }> {
  if (player.sport === 'NFL') {
    const p = player as typeof playersData.NFL[0];
    return [
      { label: 'Fantasy Points', value: p.fantasyPoints },
      { label: 'Projected Points', value: p.projectedPoints },
      { label: 'Position', value: p.position },
      { label: 'Team', value: p.team },
    ];
  }
  if (player.sport === 'NBA') {
    const p = player as typeof playersData.NBA[0];
    return [
      { label: 'Points', value: p.points },
      { label: 'Rebounds', value: p.rebounds },
      { label: 'Assists', value: p.assists },
      { label: 'Steals', value: p.steals },
    ];
  }
  if (player.sport === 'MLB') {
    const p = player as typeof playersData.MLB[0];
    const stats = [];
    if ('era' in p && p.era !== undefined) {
      stats.push({ label: 'ERA', value: p.era });
      stats.push({ label: 'WHIP', value: p.whip });
      stats.push({ label: 'K/9', value: p.strikeouts });
      stats.push({ label: 'Wins', value: p.wins });
    } else if ('avg' in p && p.avg !== undefined) {
      stats.push({ label: 'AVG', value: p.avg });
      stats.push({ label: 'HR', value: p.homeRuns });
      stats.push({ label: 'RBI', value: p.rbi });
      stats.push({ label: 'R', value: p.runs });
    }
    return stats;
  }
  if (player.sport === 'NHL') {
    const p = player as typeof playersData.NHL[0];
    if ('wins' in p && p.wins !== undefined) {
      return [
        { label: 'Wins', value: p.wins },
        { label: 'GAA', value: p.gaa },
        { label: 'SV%', value: p.savePercentage },
        { label: 'Shutouts', value: p.shutouts },
      ];
    }
    return [
      { label: 'Goals', value: p.goals || 0 },
      { label: 'Assists', value: p.assists || 0 },
      { label: '+/-', value: p.plusMinus || 0 },
      { label: 'Shots', value: p.shots || 0 },
    ];
  }
  return [];
}

export default async function PlayerPage({ params }: Props) {
  const { locale, slug } = await params;
  const player = findPlayer(slug);
  if (!player) notFound();

  const tier = 'tier' in player ? player.tier : 'stream';
  const stats = getPlayerStats(player);

  const sportIcons: Record<string, string> = { NFL: '🏈', NBA: '🏀', MLB: '⚾', NHL: '🏒' };
  const sportHrefs: Record<string, string> = { NFL: 'nfl', NBA: 'nba', MLB: 'mlb', NHL: 'nhl' };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    jobTitle: `${player.sport} ${player.position}`,
    memberOf: {
      '@type': 'SportsTeam',
      name: player.team,
      sport: player.sport,
    },
    url: `https://fantasy-waiver-radar.vercel.app/${locale}/players/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link href={`/${locale}`} className="hover:underline">Home</Link>
          {' / '}
          <Link href={`/${locale}/${sportHrefs[player.sport]}`} className="hover:underline capitalize">
            {player.sport}
          </Link>
          {' / '}
          <span>{player.name}</span>
        </nav>

        {/* Player Header */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'var(--surface-alt)', border: '2px solid var(--border)' }}
            >
              {sportIcons[player.sport]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{player.name}</h1>
                <RecommendationBadge tier={tier} />
              </div>
              <div className="flex flex-wrap gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="font-mono font-semibold">{player.position}</span>
                <span>·</span>
                <span>{player.team}</span>
                <span>·</span>
                <span>{player.sport}</span>
              </div>
              {'injuryReplacement' in player && player.injuryReplacement && (
                <div className="mt-2 text-sm px-3 py-1 rounded-full inline-block" style={{ background: '#fef3c7', color: '#92400e' }}>
                  Replacing: {player.injuryReplacement}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold trend-up">+{player.addRate}%</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Add Rate</div>
              </div>
              <div className="text-center">
                <OwnershipBadge ownership={player.ownership} />
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Owned</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trend Chart */}
            <div>
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
                7-Day Ownership Trend
              </h2>
              <TrendChart
                playerName={player.name}
                addRate={player.addRate}
                dropRate={player.dropRate}
                ownership={player.ownership}
              />
            </div>

            {/* Stats */}
            <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
                Stats This Season
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Add Recommendation */}
            <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}>
              <h3 className="font-bold mb-3" style={{ color: 'var(--text)' }}>Add Recommendation</h3>
              <div className="flex justify-center mb-4">
                <RecommendationBadge tier={tier} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Ownership</span>
                  <strong>{player.ownership}%</strong>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Add Rate</span>
                  <strong className="trend-up">+{player.addRate}%</strong>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Drop Rate</span>
                  <strong>{player.dropRate}%</strong>
                </div>
                {'projectedPoints' in player && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Proj. Points</span>
                    <strong>{player.projectedPoints}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl p-4" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text)' }}>Explore More</h3>
              <div className="space-y-2">
                <Link
                  href={`/${locale}/${sportHrefs[player.sport]}`}
                  className="block text-sm py-2 px-3 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                >
                  {sportIcons[player.sport]} All {player.sport} Trending
                </Link>
                <Link
                  href={`/${locale}/rankings`}
                  className="block text-sm py-2 px-3 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                >
                  🏆 Overall Rankings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
