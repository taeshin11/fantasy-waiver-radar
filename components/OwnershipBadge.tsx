type Props = {
  ownership: number;
};

export default function OwnershipBadge({ ownership }: Props) {
  let color = '#6b7280';
  if (ownership < 20) color = '#16a34a';
  else if (ownership < 50) color = '#d97706';
  else color = '#dc2626';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {ownership}%
    </span>
  );
}
