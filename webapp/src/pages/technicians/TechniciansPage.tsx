/**
 * Technicians page with ShadCN UI components and real API integration
 */

import { useState } from 'react';
import { Plus, Search, Users, UserCheck, UserX, UserMinus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useTechnicians } from '@/hooks/useTechnicians';
import { TechnicianForm } from '@/components/forms/TechnicianForm';
import { TechnicianStatus, Technician } from '@/types';
import { TechnicianUtils } from '@/types/Technician';

export function TechniciansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TechnicianStatus | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Fetch technicians data with pagination
  const { data, isLoading, error, refetch } = useTechnicians({ 
    page: 0, 
    size: 50 
  });

  // Filter technicians based on search and status
  const filteredTechnicians = data?.content?.filter(technician => {
    const fullName = TechnicianUtils.getFullName(technician);
    const matchesSearch = !searchQuery || 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || technician.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeVariant = (status: TechnicianStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'default' as const;
      case 'ON_VACATION':
        return 'secondary' as const;
      case 'SICK_LEAVE':
        return 'secondary' as const;
      case 'TERMINATED':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusIcon = (status: TechnicianStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <UserCheck className="h-3 w-3" />;
      case 'ON_VACATION':
        return <Settings className="h-3 w-3" />;
      case 'SICK_LEAVE':
        return <UserMinus className="h-3 w-3" />;
      case 'TERMINATED':
        return <UserX className="h-3 w-3" />;
      default:
        return null;
    }
  };


  const formatPhone = (phone: string) => {
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return null;
    
    // Show first 2 skills, then "+N more" if there are more
    const visibleSkills = skills.slice(0, 2);
    const remainingCount = skills.length - 2;
    
    return (
      <div className="flex flex-wrap gap-1">
        {visibleSkills.map((skill, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  };

  const getWorkloadIndicator = (technician: Technician) => {
    const workloadLevel = TechnicianUtils.getWorkloadLevel(technician);
    const colors = {
      LOW: 'text-green-600 dark:text-green-400',
      MEDIUM: 'text-yellow-600 dark:text-yellow-400',
      HIGH: 'text-red-600 dark:text-red-400'
    };
    
    return (
      <span className={`text-xs font-medium ${colors[workloadLevel]}`}>
        {workloadLevel}
      </span>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
            <p className="text-muted-foreground">Manage technician accounts and information</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load technicians: {error.message}. Please check your server connection.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex justify-between items-start pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Technicians
          </h1>
          <p className="text-muted-foreground text-lg">Manage technician accounts and skills</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Technician
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Technician</DialogTitle>
              <DialogDescription>
                Add a new technician to the system. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <TechnicianForm 
              onSuccess={() => {
                setIsCreateModalOpen(false);
                refetch();
              }}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Search & Filter</CardTitle>
          <CardDescription>Find and filter technicians quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search technicians by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: TechnicianStatus | 'ALL') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3 w-3" />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="ON_VACATION">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    On Vacation
                  </div>
                </SelectItem>
                <SelectItem value="SICK_LEAVE">
                  <div className="flex items-center gap-2">
                    <UserMinus className="h-3 w-3" />
                    Sick Leave
                  </div>
                </SelectItem>
                <SelectItem value="TERMINATED">
                  <div className="flex items-center gap-2">
                    <UserX className="h-3 w-3" />
                    Terminated
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Technicians {data && <span className="text-muted-foreground font-normal">({filteredTechnicians.length})</span>}
          </CardTitle>
          <CardDescription className="text-base">
            {data ? `Showing ${filteredTechnicians.length} of ${data.totalElements} technicians` : 'Loading technicians...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No technicians found matching your criteria.</p>
              {searchQuery || statusFilter !== 'ALL' ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold text-foreground">ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Name</TableHead>
                    <TableHead className="font-semibold text-foreground">Email</TableHead>
                    <TableHead className="font-semibold text-foreground">Phone</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Skills</TableHead>
                    <TableHead className="font-semibold text-foreground">Workload</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTechnicians.map((technician, index) => (
                    <TableRow 
                      key={technician.id} 
                      className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                        index % 2 === 0 ? 'bg-background/50' : 'bg-card/30'
                      }`}
                    >
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        #{technician.id}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {TechnicianUtils.getFullName(technician)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {technician.email}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {formatPhone(technician.phone)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(technician.status)} className="gap-1">
                          {getStatusIcon(technician.status)}
                          {technician.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatSkills(technician.skills)}
                      </TableCell>
                      <TableCell>
                        {getWorkloadIndicator(technician)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {data && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden shadow-sm border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Technicians</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.totalElements}</div>
              <p className="text-xs text-muted-foreground mt-1">All registered technicians</p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/20 to-primary/40" />
          </Card>
          
          <Card className="relative overflow-hidden shadow-sm border-border/50 bg-gradient-to-br from-card to-emerald-50/20 dark:to-emerald-950/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {data.content.filter(t => t.status === 'ACTIVE').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently working</p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400/40 to-emerald-500/60" />
          </Card>
          
          <Card className="relative overflow-hidden shadow-sm border-border/50 bg-gradient-to-br from-card to-blue-50/20 dark:to-blue-950/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">On Vacation</CardTitle>
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {data.content.filter(t => t.status === 'ON_VACATION').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently on vacation</p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400/40 to-blue-500/60" />
          </Card>
          
          <Card className="relative overflow-hidden shadow-sm border-border/50 bg-gradient-to-br from-card to-amber-50/20 dark:to-amber-950/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sick Leave</CardTitle>
              <UserMinus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {data.content.filter(t => t.status === 'SICK_LEAVE').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">On sick leave</p>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400/40 to-amber-500/60" />
          </Card>
        </div>
      )}
    </div>
  );
}

export default TechniciansPage;