import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface TopClientsBarDatum {
  client: string;
  score: number;
}

export function TopClientsBar({ data, onSelect }: { data: TopClientsBarDatum[]; onSelect?: (client: string) => void }) {
  const sorted = [...data].sort((a, b) => b.score - a.score).slice(0, 10);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={sorted} layout="vertical" margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid horizontal strokeOpacity={0.2} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="client" width={140} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`${v}`, 'Need Score']} />
          <Bar dataKey="score" fill="#ef4444" radius={[4, 4, 4, 4]} onClick={({ payload }) => onSelect?.(payload.client)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopClientsBar;



