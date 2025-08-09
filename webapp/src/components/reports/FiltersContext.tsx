import { createContext, useContext, useMemo, useState } from 'react';

export type TimeRange = '7d' | '30d' | '90d';

export interface ReportsFilters {
  timeRange: TimeRange;
  priority?: string;
  serviceType?: string;
  clientSegment?: string;
}

interface FiltersContextValue extends ReportsFilters {
  setFilters: (next: Partial<ReportsFilters>) => void;
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function ReportsFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<ReportsFilters>({ timeRange: '30d' });

  const value = useMemo<FiltersContextValue>(() => ({
    ...filters,
    setFilters: (next: Partial<ReportsFilters>) => setFiltersState((prev) => ({ ...prev, ...next }))
  }), [filters]);

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
}

export function useReportsFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useReportsFilters must be used within ReportsFiltersProvider');
  return ctx;
}



