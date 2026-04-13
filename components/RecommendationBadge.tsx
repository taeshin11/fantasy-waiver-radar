type Props = {
  tier: string;
  label?: string;
};

export default function RecommendationBadge({ tier, label }: Props) {
  const config: Record<string, { text: string; className: string }> = {
    mustAdd: { text: label || 'Must Add', className: 'badge-must-add' },
    stream: { text: label || 'Stream', className: 'badge-stream' },
    stash: { text: label || 'Stash', className: 'badge-stash' },
    watch: { text: label || 'Watch', className: 'badge-watch' },
  };

  const badge = config[tier] || config.watch;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
      {badge.text}
    </span>
  );
}
