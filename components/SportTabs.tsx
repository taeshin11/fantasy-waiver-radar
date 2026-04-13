'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  locale: string;
};

const SPORTS = [
  { id: 'all', label: 'All Sports', icon: '🏆', href: '' },
  { id: 'nfl', label: 'NFL', icon: '🏈', href: '/nfl' },
  { id: 'nba', label: 'NBA', icon: '🏀', href: '/nba' },
  { id: 'mlb', label: 'MLB', icon: '⚾', href: '/mlb' },
  { id: 'nhl', label: 'NHL', icon: '🏒', href: '/nhl' },
];

export default function SportTabs({ locale }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {SPORTS.map((sport) => {
        const href = `/${locale}${sport.href}`;
        const isActive = sport.href === '' ? pathname === `/${locale}` : pathname.includes(sport.href);
        return (
          <Link
            key={sport.id}
            href={href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'text-white shadow-sm'
                : 'hover:opacity-80'
            }`}
            style={
              isActive
                ? { background: 'var(--accent)', color: 'white' }
                : { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }
            }
          >
            <span>{sport.icon}</span>
            <span>{sport.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
