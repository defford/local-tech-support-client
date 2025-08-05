/**
 * Data table component using ShadCN UI Table components
 */

import { useState } from 'react';
import { IconChevronLeft, IconChevronRight, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  loadingMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  onRowClick,
  pagination,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...'
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;
    
    const columnKey = typeof column.key === 'string' ? column.key : String(column.key);
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderCellContent = (item: T, column: DataTableColumn<T>) => {
    if (column.accessor) {
      return column.accessor(item);
    }
    
    const value = item[column.key];
    return value?.toString() || '';
  };

  if (loading) {
    return (
      <div className="rounded-md border bg-card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border bg-card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-destructive">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border bg-card">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`${
                  column.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''
                }`}
                style={column.width ? { width: column.width } : undefined}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortColumn === column.key && (
                    <div className="flex flex-col">
                      {sortDirection === 'asc' ? (
                        <IconChevronUp className="h-3 w-3" />
                      ) : (
                        <IconChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={onRowClick ? 'cursor-pointer' : ''}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {renderCellContent(item, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div className="border-t bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                  {(pagination.page - 1) * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-foreground">
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">{pagination.total}</span> results
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="px-3 py-1 text-sm text-muted-foreground">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;