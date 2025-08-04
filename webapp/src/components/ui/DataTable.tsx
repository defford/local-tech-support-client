/**
 * Reusable data table component with pagination
 * Built with Mantine Table component
 */

import { Table, Pagination, Text, Group, Select, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PagedResponse, PagedResponseUtils } from '../../types';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
}

export interface DataTableProps<T> {
  data?: PagedResponse<T>;
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: Error | null;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  striped?: boolean;
  highlightOnHover?: boolean;
  emptyMessage?: string;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 per page' },
  { value: '20', label: '20 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' }
];

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  onPageChange,
  onPageSizeChange,
  onSort,
  striped = true,
  highlightOnHover = true,
  emptyMessage = 'No data available',
  className
}: DataTableProps<T>) {
  // Handle loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="lg" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size="1rem" />}
        title="Error loading data"
        color="red"
        variant="light"
      >
        {error.message || 'An unexpected error occurred'}
      </Alert>
    );
  }

  // Handle empty data
  if (!data || !PagedResponseUtils.hasContent(data)) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Text size="lg" c="dimmed">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    onPageChange?.(page - 1); // Convert to 0-based for API
  };

  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      onPageSizeChange?.(parseInt(value, 10));
    }
  };

  const renderCellContent = (item: T, column: DataTableColumn<T>) => {
    if (column.render) {
      return column.render(item);
    }
    
    // Default rendering - get nested property value
    const keys = column.key.split('.');
    let value = item;
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value?.toString() || '';
  };

  return (
    <div className={className}>
      {/* Table */}
      <Table
        striped={striped}
        highlightOnHover={highlightOnHover}
        withTableBorder
        withColumnBorders
      >
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th
                key={column.key}
                style={{ width: column.width }}
              >
                {column.header}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.content.map((item, index) => (
            <Table.Tr key={item.id || index}>
              {columns.map((column) => (
                <Table.Td key={`${item.id || index}-${column.key}`}>
                  {renderCellContent(item, column)}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <Group justify="space-between" mt="md">
          <Group>
            <Text size="sm" c="dimmed">
              {PagedResponseUtils.getPageRangeText(data)}
            </Text>
            {onPageSizeChange && (
              <Select
                data={PAGE_SIZE_OPTIONS}
                value={data.size.toString()}
                onChange={handlePageSizeChange}
                size="sm"
                w={120}
              />
            )}
          </Group>

          <Pagination
            total={data.totalPages}
            value={PagedResponseUtils.getCurrentPageNumber(data)}
            onChange={handlePageChange}
            size="sm"
          />
        </Group>
      )}
    </div>
  );
}

export default DataTable;