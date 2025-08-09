import { useReportsFilters, TimeRange } from './FiltersContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function FiltersBar() {
  const { timeRange, priority, serviceType, clientSegment, setFilters } = useReportsFilters();
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="min-w-[160px]">
        <Select value={timeRange} onValueChange={(v) => setFilters({ timeRange: v as TimeRange })}>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <Select value={priority || 'ALL'} onValueChange={(v) => setFilters({ priority: v === 'ALL' ? undefined : v })}>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <Select value={serviceType || 'ALL'} onValueChange={(v) => setFilters({ serviceType: v === 'ALL' ? undefined : v })}>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Service Types</SelectItem>
            <SelectItem value="HARDWARE">Hardware</SelectItem>
            <SelectItem value="SOFTWARE">Software</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[180px]">
        <Select value={clientSegment || 'ALL'} onValueChange={(v) => setFilters({ clientSegment: v === 'ALL' ? undefined : v })}>
          <SelectTrigger className="bg-background/50 border-border/50">
            <SelectValue placeholder="Client Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Clients</SelectItem>
            <SelectItem value="SMB">SMB</SelectItem>
            <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default FiltersBar;



