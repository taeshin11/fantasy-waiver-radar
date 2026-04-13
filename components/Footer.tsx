'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function Footer() {
  const t = useTranslations('footer');
  const [visitors, setVisitors] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    fetch('/api/visitors', { method: 'POST' })
      .then(res => res.json())
      .then(data => setVisitors(data))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-12 py-8 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>FantasyWaiverRadar</span>
          </div>

          {visitors && (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('visitorsToday')}: <strong>{visitors.today.toLocaleString()}</strong>
              {' | '}
              {t('totalVisitors')}: <strong>{visitors.total.toLocaleString()}</strong>
            </div>
          )}

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {t('disclaimer')}
          </p>
        </div>
        <div className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} {t('copyright')}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
