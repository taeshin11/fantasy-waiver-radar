import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import RecommendationBadge from '@/components/RecommendationBadge';
import OwnershipBadge from '@/components/OwnershipBadge';
import SportTabs from '@/components/SportTabs';
import playersData from '@/data/players-fallback.json';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('rankingsTitle'),
    description: 'Overall fantasy waiver wire priority rankings across NFL, NBA, MLB and NHL.',
    alternates: { canonical: `https://fantasy-waiver-radar.vercel.app/${locale}/rankings` },
  };
}

function getTier(addRate: number, ownership: number): string {
  if (addRate > 55 && ownership < 30) return 'mustAdd';
  if (addRate > 40) return 'stream';
  return 'stash';
}

type BasePlayer = {
  id: string; name: string; slug: string; team: string; sport: string; position: string;
  ownership: number; addRate: number; dropRate: number;
  projectedValue?: number; projectedPoints?: number; tier?: string;
};

export default async function RankingsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'rankings' });

  // Combine and rank all players
  const allPlayers: BasePlayer[] = [
    ...playersData.NFL.map(p => ({ ...p, projectedValue: p.projectedPoints })),
    ...playersData.NBA,
    ...playersData.MLB,
    ...playersData.NHL,
  ].sort((a, b) => b.addRate - a.addRate);

  const sportIcons: Record<string, string> = { NFL: '🏈', NBA: '🏀', MLB: '⚾', NHL: '🏒' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <SportTabs locale={locale} />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('subtitle')}</p>
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>#</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{t('player')}</th>
              <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{t('sport')}</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Pos / Team</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Own%</th>
              <th className="text-right px-4 py-3 font-semibold trend-up">Add%</th>
              <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{t('recommendation')}</th>
            </tr>
          </thead>
          <tbody>
            {allPlayers.map((player, i) => {
              const tier = player.tier || getTier(player.addRate, player.ownership);
              return (
                <tr
                  key={player.id}
                  style={{
                    background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-alt)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <td className="px-4 py-3 font-bold" style={{ color: 'var(--text-muted)' }}>
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/players/${player.slug}`}
                      className="font-semibold hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      {player.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-lg">
                    {sportIcons[player.sport] || player.sport}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-mono font-medium">{player.position}</span>
                    <span style={{ color: 'var(--text-muted)' }}> / {player.team}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <OwnershipBadge ownership={player.ownership} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold trend-up">+{player.addRate}%</td>
                  <td className="px-4 py-3 text-center">
                    <RecommendationBadge tier={tier} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
