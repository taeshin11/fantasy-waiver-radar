import Link from 'next/link';
import RecommendationBadge from './RecommendationBadge';
import OwnershipBadge from './OwnershipBadge';

type NFLPlayer = {
  id: string; name: string; slug: string; team: string; sport: 'NFL'; position: string;
  ownership: number; addRate: number; dropRate: number; fantasyPoints: number; projectedPoints: number;
  injuryReplacement: string | null; tier: string;
};

type NBAPlayer = {
  id: string; name: string; slug: string; team: string; sport: 'NBA'; position: string;
  ownership: number; addRate: number; dropRate: number; points: number; rebounds: number;
  assists: number; steals: number; projectedValue: number;
};

type MLBPlayer = {
  id: string; name: string; slug: string; team: string; sport: 'MLB'; position: string;
  ownership: number; addRate: number; dropRate: number; projectedValue: number;
  era?: number; avg?: number;
};

type NHLPlayer = {
  id: string; name: string; slug: string; team: string; sport: 'NHL'; position: string;
  ownership: number; addRate: number; dropRate: number; projectedValue: number;
  goals?: number; assists?: number; wins?: number;
};

type Player = NFLPlayer | NBAPlayer | MLBPlayer | NHLPlayer;

type Props = {
  players: Player[];
  locale: string;
  sport?: string;
};

function getTier(player: Player): string {
  if ('tier' in player) return player.tier;
  const pv = 'projectedValue' in player ? player.projectedValue : 0;
  if (player.addRate > 50) return 'mustAdd';
  if (pv > 30) return 'stream';
  return 'stash';
}

function getStatDisplay(player: Player): string {
  if (player.sport === 'NFL') {
    return `${(player as NFLPlayer).projectedPoints} proj pts`;
  }
  if (player.sport === 'NBA') {
    const p = player as NBAPlayer;
    return `${p.points}/${p.rebounds}/${p.assists}`;
  }
  if (player.sport === 'MLB') {
    const p = player as MLBPlayer;
    return p.era !== undefined ? `ERA: ${p.era}` : `AVG: ${p.avg}`;
  }
  if (player.sport === 'NHL') {
    const p = player as NHLPlayer;
    return p.wins !== undefined ? `${p.wins} W` : `${p.goals}G/${p.assists}A`;
  }
  return '';
}

export default function PlayerTable({ players, locale, sport }: Props) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        No players found for the selected filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)' }}>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Player</th>
            {!sport && <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Sport</th>}
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Pos</th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Team</th>
            <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Own%</th>
            <th className="text-right px-4 py-3 font-semibold trend-up">Add%</th>
            <th className="text-right px-4 py-3 font-semibold trend-down">Drop%</th>
            <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Stats</th>
            <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Rec</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => (
            <tr
              key={player.id}
              className="transition-colors hover:opacity-90"
              style={{
                background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-alt)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/${locale}/players/${player.slug}`}
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {player.name}
                </Link>
                {'injuryReplacement' in player && player.injuryReplacement && (
                  <div className="text-xs mt-0.5" style={{ color: '#d97706' }}>
                    Replacing {player.injuryReplacement}
                  </div>
                )}
              </td>
              {!sport && (
                <td className="px-4 py-3">
                  <span className="font-medium text-xs px-2 py-0.5 rounded" style={{ background: 'var(--surface-alt)' }}>
                    {player.sport}
                  </span>
                </td>
              )}
              <td className="px-4 py-3 font-mono text-xs">{player.position}</td>
              <td className="px-4 py-3 text-xs font-medium">{player.team}</td>
              <td className="px-4 py-3 text-right">
                <OwnershipBadge ownership={player.ownership} />
              </td>
              <td className="px-4 py-3 text-right font-semibold trend-up">
                +{player.addRate}%
              </td>
              <td className="px-4 py-3 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                {player.dropRate}%
              </td>
              <td className="px-4 py-3 text-right text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {getStatDisplay(player)}
              </td>
              <td className="px-4 py-3 text-center">
                <RecommendationBadge tier={getTier(player)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
