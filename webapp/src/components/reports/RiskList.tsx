import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface RiskItem {
  id: string | number;
  title: string;
  subtitle?: string;
  score?: number;
  reasons?: string[];
  onClick?: () => void;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'destructive' }>;
}

export interface RiskListProps {
  title: string;
  items: RiskItem[];
  emptyMessage?: string;
}

export function RiskList({ title, items, emptyMessage = 'Nothing requires attention right now.' }: RiskListProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 p-3 border rounded-md hover:bg-muted/30 cursor-pointer" onClick={item.onClick}>
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.subtitle && <div className="text-xs text-muted-foreground">{item.subtitle}</div>}
                  {item.reasons && item.reasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.reasons.map((r, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {typeof item.score === 'number' && (
                    <Badge variant="secondary" className="text-xs">Score {item.score}</Badge>
                  )}
                  {item.actions && item.actions.length > 0 && (
                    <div className="flex gap-2">
                      {item.actions.map((a, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); a.onClick(); }}
                          className={`px-2 py-1 rounded text-xs border transition-colors ${
                            a.variant === 'destructive'
                              ? 'border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                              : a.variant === 'secondary'
                              ? 'border-border/60 text-foreground hover:bg-muted/30'
                              : 'border-primary text-primary hover:bg-primary/10'
                          }`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RiskList;



