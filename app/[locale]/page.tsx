import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import SportTabs from '@/components/SportTabs';
import PlayerTable from '@/components/PlayerTable';
import playersData from '@/data/players-fallback.json';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: {
      canonical: `https://fantasy-waiver-radar.vercel.app/${locale}`,
      languages: {
        en: '/en', ko: '/ko', ja: '/ja', zh: '/zh',
        es: '/es', fr: '/fr', de: '/de', pt: '/pt',
      },
    },
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDescription'),
      url: `https://fantasy-waiver-radar.vercel.app/${locale}`,
      siteName: 'FantasyWaiverRadar',
    },
  };
}

type AllPlayers = typeof playersData;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const faqT = await getTranslations({ locale, namespace: 'faq' });

  // Combine all sports players
  const allPlayers = [
    ...playersData.NFL,
    ...playersData.NBA,
    ...playersData.MLB,
    ...playersData.NHL,
  ].sort((a, b) => b.addRate - a.addRate).slice(0, 20);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FantasyWaiverRadar',
    url: 'https://fantasy-waiver-radar.vercel.app',
    description: 'Fantasy waiver wire trending players across NFL, NBA, MLB and NHL',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://fantasy-waiver-radar.vercel.app/en?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: faqT('q1'), acceptedAnswer: { '@type': 'Answer', text: faqT('a1') } },
      { '@type': 'Question', name: faqT('q2'), acceptedAnswer: { '@type': 'Answer', text: faqT('a2') } },
      { '@type': 'Question', name: faqT('q3'), acceptedAnswer: { '@type': 'Answer', text: faqT('a3') } },
      { '@type': 'Question', name: faqT('q4'), acceptedAnswer: { '@type': 'Answer', text: faqT('a4') } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {t('title')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('lastUpdated')}: {new Date().toLocaleDateString()} — Week 15
          </p>
        </div>

        {/* Sport Tabs */}
        <div className="mb-6">
          <SportTabs locale={locale} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'NFL Trending', value: `${playersData.NFL.length}`, icon: '🏈' },
            { label: 'NBA Hot Picks', value: `${playersData.NBA.length}`, icon: '🏀' },
            { label: 'MLB Streamers', value: `${playersData.MLB.length}`, icon: '⚾' },
            { label: 'NHL Targets', value: `${playersData.NHL.length}`, icon: '🏒' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trending Players Table */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
            {t('trendingAdds')}
          </h2>
          <PlayerTable players={allPlayers as Parameters<typeof PlayerTable>[0]['players']} locale={locale} />
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  {faqT(`q${n}` as 'q1' | 'q2' | 'q3' | 'q4')}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  {faqT(`a${n}` as 'a1' | 'a2' | 'a3' | 'a4')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
