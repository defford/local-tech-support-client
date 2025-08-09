import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface SegmentDatum {
  segment: string;
  score: number;
}

export function SegmentBreakdown({ data, onSelect }: { data: SegmentDatum[]; onSelect?: (segment: string) => void }) {
  const sorted = [...data].sort((a, b) => b.score - a.score);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={sorted} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeOpacity={0.2} />
          <XAxis dataKey="segment" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v}`, 'Score']} />
          <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} onClick={({ payload }) => onSelect?.(payload.segment)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SegmentBreakdown;



