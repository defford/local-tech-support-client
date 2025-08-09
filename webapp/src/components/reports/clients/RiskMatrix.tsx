import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Scatter } from 'recharts';

export interface RiskMatrixPoint {
  client: string;
  volume: number; // x
  severity: number; // y
  ageSum: number; // bubble size
  color?: string;
}

export function RiskMatrix({ data, onSelect }: { data: RiskMatrixPoint[]; onSelect?: (client: string) => void }) {
  const maxAge = Math.max(1, ...data.map((d) => d.ageSum));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ left: 16, right: 16, top: 8, bottom: 24 }}>
          <CartesianGrid strokeOpacity={0.2} />
          <XAxis type="number" dataKey="volume" name="Volume" tick={{ fontSize: 12 }} />
          <YAxis type="number" dataKey="severity" name="Severity" tick={{ fontSize: 12 }} />
          <ZAxis type="number" dataKey="ageSum" range={[60, 200]} domain={[0, maxAge]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, n) => [String(v), n]} />
          <Scatter data={data} fill="#f97316" onClick={({ payload }) => onSelect?.(payload.client)} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskMatrix;



