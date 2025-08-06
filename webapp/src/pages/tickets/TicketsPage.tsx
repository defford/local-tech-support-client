/**
 * Tickets page with ShadCN UI components and real API integration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Ticket as TicketIcon, AlertTriangle, Clock, UserX, Settings, ChevronUp, ChevronDown, MoreHorizontal, Edit, Trash2, Eye, User, Calendar, Tag, Check } from 'lucide-react';
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
import { useTickets, useDeleteTicket } from '@/hooks/useTickets';
import { TicketForm } from '@/components/forms/TicketForm';
import { TicketStatus, TicketPriority, ServiceType, Ticket } from '@/types';
import { TicketUtils } from '@/types/Ticket';

export function TicketsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL' | 'OVERDUE' | 'UNASSIGNED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  
  // Fetch tickets data with pagination
  const { data, isLoading, error, refetch } = useTickets({ 
    page: currentPage, 
    size: pageSize 
  });

  // Delete ticket mutation
  const deleteTicketMutation = useDeleteTicket();

  // Filter and sort tickets
  const filteredAndSortedTickets = (() => {
    let filtered = data?.content?.filter(ticket => {
      if (!ticket) return false;
      
      const matchesSearch = !searchQuery || 
        (ticket.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = (() => {
        switch (statusFilter) {
          case 'ALL':
            return true;
          case 'OVERDUE':
            return TicketUtils.isOverdue(ticket);
          case 'UNASSIGNED':
            return !TicketUtils.isAssigned(ticket);
          default:
            return ticket.status === statusFilter;
        }
      })();
      
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
      const matchesServiceType = serviceTypeFilter === 'ALL' || ticket.serviceType === serviceTypeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesServiceType;
    }) || [];

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (sortColumn) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'priority':
            const priorityOrder: Record<string, number> = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            aValue = priorityOrder[a.priority || 'LOW'] || 0;
            bValue = priorityOrder[b.priority || 'LOW'] || 0;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'client':
            aValue = a.clientName || '';
            bValue = b.clientName || '';
            break;
          case 'dueAt':
            aValue = a.dueAt ? new Date(a.dueAt) : new Date(0);
            bValue = b.dueAt ? new Date(b.dueAt) : new Date(0);
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
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
    open: data?.content?.filter(t => t && TicketUtils.isOpen(t)).length || 0,
    closed: data?.content?.filter(t => t && TicketUtils.isClosed(t)).length || 0,
    overdue: data?.content?.filter(t => t && TicketUtils.isOverdue(t)).length || 0,
    unassigned: data?.content?.filter(t => t && !TicketUtils.isAssigned(t)).length || 0,
    urgent: data?.content?.filter(t => t && t.priority === TicketPriority.URGENT).length || 0,
  };

  // Table helper functions
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
      setSelectedTickets(new Set(filteredAndSortedTickets.map(t => t.id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectTicket = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedTickets);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTickets(newSelected);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setServiceTypeFilter('ALL');
    setSortColumn(null);
    setSortDirection('asc');
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicket) return;
    
    try {
      await deleteTicketMutation.mutateAsync(deletingTicket.id);
      setIsDeleteModalOpen(false);
      setDeletingTicket(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  };

  const handleExportSelected = () => {
    const selectedTicketsList = filteredAndSortedTickets.filter(t => 
      selectedTickets.has(t.id)
    );
    
    if (selectedTicketsList.length === 0) return;

    // Create CSV content
    const headers = ['ID', 'Title', 'Description', 'Client', 'Priority', 'Status', 'Service Type', 'Due Date', 'Created'];
    const csvContent = [
      headers.join(','),
      ...selectedTicketsList.map(ticket => [
        ticket.id,
        `"${ticket.title}"`,
        `"${ticket.description.replace(/"/g, '""')}"`,
        `"${ticket.clientName || 'N/A'}"`,
        ticket.priority,
        ticket.status,
        ticket.serviceType,
        ticket.dueAt ? new Date(ticket.dueAt).toISOString().split('T')[0] : 'N/A',
        new Date(ticket.createdAt).toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadgeVariant = (priority: TicketPriority | undefined) => {
    if (!priority) return 'outline' as const;
    
    switch (priority) {
      case TicketPriority.URGENT:
        return 'destructive' as const;
      case TicketPriority.HIGH:
        return 'secondary' as const;
      case TicketPriority.MEDIUM:
        return 'outline' as const;
      case TicketPriority.LOW:
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getPriorityIcon = (priority: TicketPriority | undefined) => {
    if (!priority) return '⚪';
    
    switch (priority) {
      case TicketPriority.URGENT:
        return '🔴';
      case TicketPriority.HIGH:
        return '🟠';
      case TicketPriority.MEDIUM:
        return '🟡';
      case TicketPriority.LOW:
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getStatusIcon = (ticket: Ticket) => {
    if (TicketUtils.isOverdue(ticket)) return <AlertTriangle className="h-3 w-3" />;
    if (TicketUtils.isOpen(ticket)) return <Clock className="h-3 w-3" />;
    return <Check className="h-3 w-3" />;
  };

  const formatDueDate = (dueAt: string | undefined) => {
    if (!dueAt) return 'No due date';
    const date = new Date(dueAt);
    const now = new Date();
    const isOverdue = date < now;
    
    return (
      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
        {date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
        {isOverdue && ' (Overdue)'}
      </span>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground">Manage support tickets and requests</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load tickets: {error.message}. Please check your server connection.
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
            Tickets
          </h1>
          <p className="text-muted-foreground text-lg">Manage support tickets and client requests</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                Create a new support ticket for a client. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <TicketForm 
              onSuccess={() => {
                setIsCreateModalOpen(false);
                refetch();
              }}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
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
              <TicketIcon className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-background dark:from-green-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Open</p>
                <p className="text-2xl font-bold">{statistics.open}</p>
              </div>
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50/50 to-background dark:from-gray-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed</p>
                <p className="text-2xl font-bold">{statistics.closed}</p>
              </div>
              <Check className="h-5 w-5 text-gray-500" />
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

        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-background dark:from-yellow-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Unassigned</p>
                <p className="text-2xl font-bold">{statistics.unassigned}</p>
              </div>
              <UserX className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-background dark:from-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Urgent</p>
                <p className="text-2xl font-bold">{statistics.urgent}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
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
                  placeholder="Search tickets by title, description, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border/50"
                />
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[130px] bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Priority</SelectItem>
                    <SelectItem value={TicketPriority.URGENT}>🔴 Urgent</SelectItem>
                    <SelectItem value={TicketPriority.HIGH}>🟠 High</SelectItem>
                    <SelectItem value={TicketPriority.MEDIUM}>🟡 Medium</SelectItem>
                    <SelectItem value={TicketPriority.LOW}>🟢 Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger className="w-[140px] bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {Object.values(ServiceType).map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || serviceTypeFilter !== 'ALL') && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  Clear Filters
                </Button>
              )}
              
              {selectedTickets.size > 0 && (
                <>
                  <Button variant="outline" onClick={handleExportSelected} size="sm">
                    Export ({selectedTickets.size})
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Close Selected</DropdownMenuItem>
                      <DropdownMenuItem>Assign Technician</DropdownMenuItem>
                      <DropdownMenuItem>Change Priority</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Selected</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
          
          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || serviceTypeFilter !== 'ALL') && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAndSortedTickets.length} of {data?.content?.length || 0} tickets
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="rounded-md border border-border/50 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                  <TableHead className="w-12 text-center">
                    <Checkbox 
                      checked={selectedTickets.size === filteredAndSortedTickets.length && filteredAndSortedTickets.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16 font-semibold text-foreground">ID</TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      {sortColumn === 'title' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('client')}
                  >
                    <div className="flex items-center gap-2">
                      Client
                      {sortColumn === 'client' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority
                      {sortColumn === 'priority' && (
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
                  <TableHead className="font-semibold text-foreground">Service Type</TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('dueAt')}
                  >
                    <div className="flex items-center gap-2">
                      Due Date
                      {sortColumn === 'dueAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-16 text-center font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index} className="border-b border-border/30">
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      {data?.content?.length === 0 ? 'No tickets found. Create your first ticket!' : 'No tickets match your filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTickets.map((ticket, index) => {
                    if (!ticket) return null;
                    const isSelected = selectedTickets.has(ticket.id);
                    
                    return (
                    <TableRow 
                      key={ticket.id} 
                      className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                        index % 2 === 0 ? 'bg-background/50' : 'bg-card/30'
                      } ${isSelected ? 'bg-primary/5 border-primary/20' : ''}`}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        #{ticket.id}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground max-w-xs">
                        <div className="space-y-1">
                          <div className="truncate" title={ticket.title}>
                            {ticket.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate" title={ticket.description}>
                            {ticket.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{ticket.clientName || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{ticket.clientEmail || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="gap-1">
                          <span>{getPriorityIcon(ticket.priority)}</span>
                          {ticket.priority?.toLowerCase() || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket)}
                          <span className={`text-sm ${
                            TicketUtils.isOverdue(ticket) ? 'text-red-600 font-medium' : 
                            TicketUtils.isOpen(ticket) ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {TicketUtils.isOverdue(ticket) ? 'Overdue' :
                             TicketUtils.isOpen(ticket) ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {ticket.serviceType ? (ticket.serviceType.charAt(0) + ticket.serviceType.slice(1).toLowerCase()) : 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDueDate(ticket.dueAt)}
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
                            <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingTicket(ticket);
                              setIsEditModalOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setDeletingTicket(ticket);
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

      {/* Edit Ticket Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>
              Update ticket information and details.
            </DialogDescription>
          </DialogHeader>
          {editingTicket && (
            <TicketForm 
              ticket={editingTicket}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setEditingTicket(null);
                refetch();
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingTicket(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ticket "{deletingTicket?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTicket}
              disabled={deleteTicketMutation.isPending}
            >
              {deleteTicketMutation.isPending ? 'Deleting...' : 'Delete Ticket'}
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

export default TicketsPage;