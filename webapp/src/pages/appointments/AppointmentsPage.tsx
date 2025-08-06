/**
 * Appointments page with comprehensive management features
 * Includes statistics, filtering, calendar views, and bulk operations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Calendar, CalendarDays, Clock, CheckCircle, XCircle, 
  AlertTriangle, User, MoreHorizontal, Edit, Trash2, Eye, Play, 
  CheckCheck, X, Settings, ChevronUp, ChevronDown, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  useAppointments, 
  useDeleteAppointment, 
  useConfirmAppointment, 
  useStartAppointment, 
  useCompleteAppointment, 
  useCancelAppointment,
  useBulkAppointmentOperations
} from '@/hooks/useAppointments';
import { useTechnicians } from '@/hooks/useTechnicians';
import { AppointmentForm } from '@/components/forms/AppointmentForm';
import { Appointment, AppointmentStatus } from '@/types';
import { AppointmentUtils } from '@/types/Appointment';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL' | 'UPCOMING' | 'OVERDUE'>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<number | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointments, setSelectedAppointments] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>('scheduledStartTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  
  // Fetch data
  const { data, isLoading, error, refetch } = useAppointments({ 
    page: currentPage, 
    size: pageSize 
  });
  const { data: techniciansData } = useTechnicians();
  
  // Mutations
  const deleteAppointmentMutation = useDeleteAppointment();
  const confirmAppointmentMutation = useConfirmAppointment();
  const startAppointmentMutation = useStartAppointment();
  const completeAppointmentMutation = useCompleteAppointment();
  const cancelAppointmentMutation = useCancelAppointment();
  const { bulkCancel, bulkDelete } = useBulkAppointmentOperations();

  // Filter and sort appointments
  const filteredAndSortedAppointments = (() => {
    let filtered = data?.content?.filter(appointment => {
      if (!appointment) return false;
      
      // Search filter
      const matchesSearch = !searchQuery || 
        (appointment.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appointment.ticket?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appointment.technician?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = (() => {
        switch (statusFilter) {
          case 'ALL':
            return true;
          case 'UPCOMING':
            return AppointmentUtils.isUpcoming(appointment);
          case 'OVERDUE':
            return new Date() > new Date(appointment.scheduledStartTime) && 
                   appointment.status === AppointmentStatus.PENDING;
          default:
            return appointment.status === statusFilter;
        }
      })();
      
      // Technician filter
      const matchesTechnician = technicianFilter === 'ALL' || appointment.technicianId === technicianFilter;
      
      // Date filter
      const matchesDate = (() => {
        const appointmentDate = new Date(appointment.scheduledStartTime);
        const now = new Date();
        
        switch (dateFilter) {
          case 'ALL':
            return true;
          case 'TODAY':
            return appointmentDate.toDateString() === now.toDateString();
          case 'THIS_WEEK':
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
          case 'THIS_MONTH':
            return appointmentDate.getMonth() === now.getMonth() && 
                   appointmentDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesTechnician && matchesDate;
    }) || [];

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (sortColumn) {
          case 'scheduledStartTime':
            aValue = new Date(a.scheduledStartTime);
            bValue = new Date(b.scheduledStartTime);
            break;
          case 'status':
            const statusOrder = { PENDING: 1, CONFIRMED: 2, IN_PROGRESS: 3, COMPLETED: 4, CANCELLED: 5, NO_SHOW: 6 };
            aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
            bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
            break;
          case 'technician':
            aValue = a.technician?.name || '';
            bValue = b.technician?.name || '';
            break;
          case 'ticket':
            aValue = a.ticket?.title || '';
            bValue = b.ticket?.title || '';
            break;
          case 'duration':
            aValue = AppointmentUtils.getDuration(a);
            bValue = AppointmentUtils.getDuration(b);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  })();

  // Statistics calculations
  const statistics = {
    total: data?.content?.length || 0,
    pending: data?.content?.filter(a => a && a.status === AppointmentStatus.PENDING).length || 0,
    confirmed: data?.content?.filter(a => a && a.status === AppointmentStatus.CONFIRMED).length || 0,
    inProgress: data?.content?.filter(a => a && a.status === AppointmentStatus.IN_PROGRESS).length || 0,
    completed: data?.content?.filter(a => a && a.status === AppointmentStatus.COMPLETED).length || 0,
    overdue: data?.content?.filter(a => a && new Date() > new Date(a.scheduledStartTime) && a.status === AppointmentStatus.PENDING).length || 0,
  };

  // Helper functions
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppointments(new Set(filteredAndSortedAppointments.map(a => a.id)));
    } else {
      setSelectedAppointments(new Set());
    }
  };

  const handleSelectAppointment = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedAppointments);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedAppointments(newSelected);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setTechnicianFilter('ALL');
    setDateFilter('ALL');
    setSortColumn('scheduledStartTime');
    setSortDirection('asc');
  };

  const handleDeleteAppointment = async () => {
    if (!deletingAppointment) return;
    
    try {
      await deleteAppointmentMutation.mutateAsync(deletingAppointment.id);
      setIsDeleteModalOpen(false);
      setDeletingAppointment(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleStatusChange = async (appointment: Appointment, action: 'confirm' | 'start' | 'complete' | 'cancel') => {
    try {
      switch (action) {
        case 'confirm':
          await confirmAppointmentMutation.mutateAsync(appointment.id);
          break;
        case 'start':
          await startAppointmentMutation.mutateAsync(appointment.id);
          break;
        case 'complete':
          await completeAppointmentMutation.mutateAsync({ id: appointment.id });
          break;
        case 'cancel':
          await cancelAppointmentMutation.mutateAsync({ id: appointment.id });
          break;
      }
      refetch();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedAppointments.size === 0) return;
    
    try {
      await bulkCancel.mutateAsync({ 
        ids: Array.from(selectedAppointments),
        reason: 'Bulk cancellation'
      });
      setSelectedAppointments(new Set());
      refetch();
    } catch (error) {
      console.error('Failed to bulk cancel appointments:', error);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case AppointmentStatus.CONFIRMED:
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Confirmed</Badge>;
      case AppointmentStatus.IN_PROGRESS:
        return <Badge variant="default" className="gap-1"><Play className="h-3 w-3" />In Progress</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600"><CheckCheck className="h-3 w-3" />Completed</Badge>;
      case AppointmentStatus.CANCELLED:
        return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Cancelled</Badge>;
      case AppointmentStatus.NO_SHOW:
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />No Show</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isPast = date < now;
    
    return (
      <div className={`text-sm ${isPast && !isToday ? 'text-red-600' : ''}`}>
        <div className="font-medium">
          {isToday ? 'Today' : date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          {date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">Manage and schedule appointments</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load appointments: {error.message}. Please check your server connection.
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
            Appointments
          </h1>
          <p className="text-muted-foreground text-lg">Schedule and manage technician appointments</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            size="sm"
            disabled
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Create a new appointment between a technician and client ticket.
                </DialogDescription>
              </DialogHeader>
              <AppointmentForm 
                onSuccess={() => {
                  setIsCreateModalOpen(false);
                  refetch();
                }}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-background dark:from-blue-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-background dark:from-yellow-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-2xl font-bold">{statistics.pending}</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-background dark:from-green-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Confirmed</p>
                <p className="text-2xl font-bold">{statistics.confirmed}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-background dark:from-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">In Progress</p>
                <p className="text-2xl font-bold">{statistics.inProgress}</p>
              </div>
              <Play className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-background dark:from-emerald-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed</p>
                <p className="text-2xl font-bold">{statistics.completed}</p>
              </div>
              <CheckCheck className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-background dark:from-red-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</p>
                <p className="text-2xl font-bold">{statistics.overdue}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="border-0 shadow-md bg-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 min-w-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border/50"
                />
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                  <SelectTrigger className="w-[140px] bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={technicianFilter.toString()} onValueChange={(value) => setTechnicianFilter(value === 'ALL' ? 'ALL' : parseInt(value))}>
                  <SelectTrigger className="w-[150px] bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Technicians</SelectItem>
                    {techniciansData?.content?.map(technician => (
                      <SelectItem key={technician.id} value={technician.id.toString()}>
                        {technician.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
                  <SelectTrigger className="w-[120px] bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Dates</SelectItem>
                    <SelectItem value="TODAY">Today</SelectItem>
                    <SelectItem value="THIS_WEEK">This Week</SelectItem>
                    <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              {(searchQuery || statusFilter !== 'ALL' || technicianFilter !== 'ALL' || dateFilter !== 'ALL') && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              
              {selectedAppointments.size > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Bulk Actions ({selectedAppointments.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleBulkCancel}>
                      Cancel Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => bulkDelete.mutate(Array.from(selectedAppointments))}
                      className="text-destructive"
                    >
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {(searchQuery || statusFilter !== 'ALL' || technicianFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAndSortedAppointments.length} of {data?.content?.length || 0} appointments
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="rounded-md border border-border/50 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                  <TableHead className="w-12 text-center">
                    <Checkbox 
                      checked={selectedAppointments.size === filteredAndSortedAppointments.length && filteredAndSortedAppointments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16 font-semibold text-foreground">ID</TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('scheduledStartTime')}
                  >
                    <div className="flex items-center gap-2">
                      Date & Time
                      {sortColumn === 'scheduledStartTime' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('technician')}
                  >
                    <div className="flex items-center gap-2">
                      Technician
                      {sortColumn === 'technician' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('ticket')}
                  >
                    <div className="flex items-center gap-2">
                      Ticket
                      {sortColumn === 'ticket' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortColumn === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center gap-2">
                      Duration
                      {sortColumn === 'duration' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-16 text-center font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index} className="border-b border-border/30">
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      {data?.content?.length === 0 ? 'No appointments found. Schedule your first appointment!' : 'No appointments match your filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedAppointments.map((appointment, index) => {
                    if (!appointment) return null;
                    const isSelected = selectedAppointments.has(appointment.id);
                    const isOverdue = new Date() > new Date(appointment.scheduledStartTime) && appointment.status === AppointmentStatus.PENDING;
                    
                    return (
                      <TableRow 
                        key={appointment.id} 
                        className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                          index % 2 === 0 ? 'bg-background/50' : 'bg-card/30'
                        } ${isSelected ? 'bg-primary/5 border-primary/20' : ''} ${isOverdue ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectAppointment(appointment.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          #{appointment.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            <div>
                              {formatDateTime(appointment.scheduledStartTime)}
                              <div className="text-xs text-muted-foreground">
                                to {new Date(appointment.scheduledEndTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">
                                {appointment.technician?.name || 'Unknown'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {appointment.technician?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium truncate max-w-xs">
                              #{appointment.ticket?.id} - {appointment.ticket?.title || 'Unknown Ticket'}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {appointment.ticket?.priority?.toLowerCase() || 'unknown'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {AppointmentUtils.getDuration(appointment)} min
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/appointments/${appointment.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              
                              {AppointmentUtils.canReschedule(appointment) && (
                                <DropdownMenuItem onClick={() => {
                                  setEditingAppointment(appointment);
                                  setIsEditModalOpen(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Reschedule
                                </DropdownMenuItem>
                              )}
                              
                              {appointment.status === AppointmentStatus.PENDING && (
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment, 'confirm')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirm
                                </DropdownMenuItem>
                              )}
                              
                              {appointment.status === AppointmentStatus.CONFIRMED && (
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment, 'start')}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start
                                </DropdownMenuItem>
                              )}
                              
                              {appointment.status === AppointmentStatus.IN_PROGRESS && (
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment, 'complete')}>
                                  <CheckCheck className="mr-2 h-4 w-4" />
                                  Complete
                                </DropdownMenuItem>
                              )}
                              
                              {AppointmentUtils.canCancel(appointment) && (
                                <DropdownMenuItem onClick={() => handleStatusChange(appointment, 'cancel')}>
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  setDeletingAppointment(appointment);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Appointment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment timing and details.
            </DialogDescription>
          </DialogHeader>
          {editingAppointment && (
            <AppointmentForm 
              appointment={editingAppointment}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setEditingAppointment(null);
                refetch();
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingAppointment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAppointment}
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? 'Deleting...' : 'Delete Appointment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(data.totalPages - 1, currentPage + 1))}
            disabled={currentPage >= data.totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;