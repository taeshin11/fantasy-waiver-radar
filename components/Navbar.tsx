'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Props = {
  locale: string;
};

export default function Navbar({ locale }: Props) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/nfl`, label: t('nfl') },
    { href: `/${locale}/nba`, label: t('nba') },
    { href: `/${locale}/mlb`, label: t('mlb') },
    { href: `/${locale}/nhl`, label: t('nhl') },
    { href: `/${locale}/rankings`, label: t('rankings') },
  ];

  const locales = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'pt'];

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ background: 'var(--accent)', color: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-lg text-white">
            <span>🏆</span>
            <span className="hidden sm:inline">{t('tagline')}</span>
            <span className="sm:hidden">FWR</span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value;
                const segments = pathname.split('/');
                segments[1] = newLocale;
                window.location.href = segments.join('/');
              }}
              className="text-sm bg-white/20 text-white border border-white/30 rounded px-2 py-1 cursor-pointer"
            >
              {locales.map((loc) => (
                <option key={loc} value={loc} className="text-black bg-white">
                  {loc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
