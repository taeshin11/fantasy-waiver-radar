'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Props = {
  playerName: string;
  addRate: number;
  dropRate?: number;
  ownership: number;
};

function generateTrendData(baseValue: number, points: number = 7): number[] {
  const data = [];
  let current = Math.max(baseValue - 20, 5);
  for (let i = 0; i < points; i++) {
    current = Math.min(Math.max(current + (Math.random() - 0.3) * 10, 2), 100);
    data.push(Math.round(current * 10) / 10);
  }
  return data;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TrendChart({ playerName, addRate, dropRate = 0, ownership }: Props) {
  const addData = generateTrendData(addRate);
  const dropData = generateTrendData(dropRate);

  const data = {
    labels: DAYS,
    datasets: [
      {
        label: 'Add Rate %',
        data: addData,
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ea580c',
      },
      {
        label: 'Drop Rate %',
        data: dropData,
        borderColor: '#6b7280',
        backgroundColor: 'rgba(107, 114, 128, 0.05)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6b7280',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12 },
          padding: 16,
        },
      },
      title: {
        display: true,
        text: `${playerName} — 7-Day Ownership Trend`,
        font: { size: 14, weight: 'bold' as const },
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'line'>) =>
            `${ctx.dataset.label}: ${ctx.parsed.y ?? 0}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Line data={data} options={options} />
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{addRate}%</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Add Rate</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{ownership}%</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Ownership</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: '#6b7280' }}>{dropRate}%</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Drop Rate</div>
        </div>
      </div>
    </div>
  );
}
