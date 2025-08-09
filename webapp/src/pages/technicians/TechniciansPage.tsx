/**
 * Technicians page with ShadCN UI components and real API integration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, UserCheck, UserX, UserMinus, Settings, ChevronUp, ChevronDown, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
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
import { useTechnicians, useDeleteTechnician } from '@/hooks/useTechnicians';
import { TechnicianForm } from '@/components/forms/TechnicianForm';
import { TechnicianStatus, Technician } from '@/types';
import { TechnicianUtils } from '@/types/Technician';
import { TechnicianErrorBoundary } from '@/components/ErrorBoundary';

export function TechniciansPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TechnicianStatus | 'ALL'>('ALL');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTechnician, setDeletingTechnician] = useState<Technician | null>(null);
  const [selectedTechnicians, setSelectedTechnicians] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  
  // Fetch technicians data with pagination
  const { data, isLoading, error, refetch } = useTechnicians({ 
    page: currentPage, 
    size: pageSize 
  });

  // Delete technician mutation
  const deleteTechnicianMutation = useDeleteTechnician();

  // Filter and sort technicians
  const filteredAndSortedTechnicians = (() => {
    let filtered = data?.content?.filter(technician => {
      if (!technician) return false;
      
      const fullName = TechnicianUtils.getFullName(technician);
      const matchesSearch = !searchQuery || 
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (technician.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || technician.status === statusFilter;
      
      const matchesSkills = !skillsFilter || 
        (technician.skills && technician.skills.some(skill => 
          skill.toLowerCase().includes(skillsFilter.toLowerCase())
        ));
      
      return matchesSearch && matchesStatus && matchesSkills;
    }) || [];

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortColumn) {
          case 'name':
            aValue = TechnicianUtils.getFullName(a);
            bValue = TechnicianUtils.getFullName(b);
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'workload':
            aValue = TechnicianUtils.getWorkloadLevel(a);
            bValue = TechnicianUtils.getWorkloadLevel(b);
            break;
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
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
      setSelectedTechnicians(new Set(filteredAndSortedTechnicians.map(t => t.id)));
    } else {
      setSelectedTechnicians(new Set());
    }
  };

  const handleSelectTechnician = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedTechnicians);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTechnicians(newSelected);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSkillsFilter('');
    setSortColumn(null);
    setSortDirection('asc');
  };

  const handleDeleteTechnician = async () => {
    if (!deletingTechnician) return;
    
    try {
      await deleteTechnicianMutation.mutateAsync(deletingTechnician.id);
      setIsDeleteModalOpen(false);
      setDeletingTechnician(null);
      refetch();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to delete technician:', error);
    }
  };

  const handleExportSelected = () => {
    const selectedTechniciansList = filteredAndSortedTechnicians.filter(t => 
      selectedTechnicians.has(t.id)
    );
    
    if (selectedTechniciansList.length === 0) return;

    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Skills'];
    const csvContent = [
      headers.join(','),
      ...selectedTechniciansList.map(technician => [
        technician.id,
        `"${TechnicianUtils.getFullName(technician)}"`,
        `"${technician.email || ''}"`,
        `"${technician.phone || ''}"`,
        technician.status,
        `"${(technician.skills || []).join(', ')}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `technicians_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkStatusUpdate = (newStatus: TechnicianStatus) => {
    // TODO: Implement bulk status update functionality
    console.log('Bulk status update to:', newStatus, 'for technicians:', Array.from(selectedTechnicians));
    // This would require a bulk update API endpoint
  };

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


  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return 'N/A';
    
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatSkills = (skills: string[] | null | undefined) => {
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
    <TechnicianErrorBoundary>
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

      {/* Edit Technician Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
            <DialogDescription>
              Update technician information and skills.
            </DialogDescription>
          </DialogHeader>
          {editingTechnician && (
            <TechnicianForm 
              technician={editingTechnician}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setEditingTechnician(null);
                refetch();
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingTechnician(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Technician</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this technician? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingTechnician && (
            <div className="py-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                  {TechnicianUtils.getFullName(deletingTechnician).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {TechnicianUtils.getFullName(deletingTechnician)}
                  </p>
                  <p className="text-sm text-muted-foreground">{deletingTechnician.email}</p>
                </div>
              </div>
              
              {deleteTechnicianMutation.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>
                    Failed to delete technician: {deleteTechnicianMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingTechnician(null);
                  }}
                  disabled={deleteTechnicianMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTechnician}
                  disabled={deleteTechnicianMutation.isPending}
                >
                  {deleteTechnicianMutation.isPending ? 'Deleting...' : 'Delete Technician'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Search & Filter</CardTitle>
          <CardDescription>Find and filter technicians quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
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

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Filter by skills..."
                  value={skillsFilter}
                  onChange={(e) => setSkillsFilter(e.target.value)}
                  className="bg-background/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
              
              {(searchQuery || statusFilter !== 'ALL' || skillsFilter || sortColumn) && (
                <Button variant="outline" onClick={clearFilters} className="shrink-0">
                  Clear Filters
                </Button>
              )}
            </div>

            {selectedTechnicians.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
                <span className="text-sm font-medium">
                  {selectedTechnicians.size} technician{selectedTechnicians.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportSelected}>
                    Export Selected
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate(TechnicianStatus.ACTIVE)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Mark as Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate(TechnicianStatus.ON_VACATION)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Mark as On Vacation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate(TechnicianStatus.SICK_LEAVE)}>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Mark as Sick Leave
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate(TechnicianStatus.TERMINATED)} className="text-destructive">
                        <UserX className="mr-2 h-4 w-4" />
                        Mark as Terminated
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedTechnicians(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Technicians {data && <span className="text-muted-foreground font-normal">({filteredAndSortedTechnicians.length})</span>}
          </CardTitle>
          <CardDescription className="text-base">
            {data ? `Showing ${filteredAndSortedTechnicians.length} of ${data.totalElements} technicians` : 'Loading technicians...'}
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
          ) : filteredAndSortedTechnicians.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No technicians found matching your criteria.</p>
              {(searchQuery || statusFilter !== 'ALL' || skillsFilter) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={
                          filteredAndSortedTechnicians.length > 0 && 
                          filteredAndSortedTechnicians.every(t => selectedTechnicians.has(t.id))
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">ID</TableHead>
                    <TableHead 
                      className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 select-none" 
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        {sortColumn === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 select-none" 
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Email & Phone
                        {sortColumn === 'email' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 select-none" 
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortColumn === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">Skills</TableHead>
                    <TableHead 
                      className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 select-none" 
                      onClick={() => handleSort('workload')}
                    >
                      <div className="flex items-center gap-2">
                        Workload
                        {sortColumn === 'workload' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTechnicians.map((technician, index) => {
                    if (!technician) return null;
                    const isSelected = selectedTechnicians.has(technician.id);
                    
                    return (
                    <TableRow 
                      key={technician.id} 
                      className={`border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer ${
                        index % 2 === 0 ? 'bg-background/50' : 'bg-card/30'
                      } ${isSelected ? 'bg-primary/5 border-primary/20' : ''}`}
                      onClick={() => navigate(`/technicians/${technician.id}`)}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectTechnician(technician.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        #{technician.id}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                            {TechnicianUtils.getFullName(technician).charAt(0).toUpperCase()}
                          </div>
                          {TechnicianUtils.getFullName(technician) || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-foreground">{technician.email || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {formatPhone(technician.phone)}
                          </div>
                        </div>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/technicians/${technician.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingTechnician(technician);
                              setIsEditModalOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Technician
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => {
                              setDeletingTechnician(technician);
                              setIsDeleteModalOpen(true);
                            }}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="border-t bg-card px-4 py-3 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= data.totalPages - 1}
                >
                  Next
                </Button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-medium text-foreground">
                      {currentPage * pageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-foreground">
                      {Math.min((currentPage + 1) * pageSize, data.totalElements)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">{data.totalElements}</span> results
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  
                  <span className="px-3 py-1 text-sm text-muted-foreground">
                    Page {currentPage + 1} of {data.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= data.totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      
      </div>
    </TechnicianErrorBoundary>
  );
}

export default TechniciansPage;