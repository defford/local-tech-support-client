import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface KpiProps {
  label: string;
  value: number | string;
  hint?: string;
  accent?: 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'gray' | 'emerald';
}

const accentToClasses: Record<NonNullable<KpiProps['accent']>, string> = {
  blue: 'border-l-blue-500 from-blue-50/50 dark:from-blue-950/30',
  green: 'border-l-green-500 from-green-50/50 dark:from-green-950/30',
  red: 'border-l-red-500 from-red-50/50 dark:from-red-950/30',
  yellow: 'border-l-yellow-500 from-yellow-50/50 dark:from-yellow-950/30',
  orange: 'border-l-orange-500 from-orange-50/50 dark:from-orange-950/30',
  gray: 'border-l-gray-500 from-gray-50/50 dark:from-gray-950/30',
  emerald: 'border-l-emerald-500 from-emerald-50/50 dark:from-emerald-950/30'
};

export function Kpi({ label, value, hint, accent = 'blue' }: KpiProps) {
  const classes = accentToClasses[accent];
  return (
    <Card className={`border-l-4 bg-gradient-to-r to-background ${classes}`}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default Kpi;



