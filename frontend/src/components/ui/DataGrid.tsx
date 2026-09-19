'use client';

interface DataGridColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataGridProps {
  columns: DataGridColumn[];
  data: any[];
  title?: string;
  actions?: React.ReactNode;
  onRowClick?: (row: any) => void;
  showPagination?: boolean;
  totalItems?: number;
  pageSize?: number;
  showExport?: boolean;
  showFilter?: boolean;
}

export default function DataGrid({
  columns,
  data,
  title,
  actions,
  onRowClick,
  showPagination = true,
  totalItems,
  pageSize = 10,
  showExport = false,
  showFilter = false,
}: DataGridProps) {
  const total = totalItems || data.length;

  return (
    <div className="gov-card overflow-hidden flex flex-col">
      {/* Header */}
      {(title || actions || showFilter || showExport) && (
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
          {title && <h3 className="text-[18px] font-semibold text-[var(--color-gov-navy)]">{title}</h3>}
          <div className="flex items-center gap-2">
            {actions}
            {showFilter && (
              <button className="px-3 py-1.5 bg-white border border-[var(--color-outline-variant)] text-[var(--color-gov-navy)] text-xs font-medium hover:bg-[var(--color-surface-variant)] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">filter_list</span> Filter
              </button>
            )}
            {showExport && (
              <button className="px-3 py-1.5 bg-white border border-[var(--color-outline-variant)] text-[var(--color-gov-navy)] text-xs font-medium hover:bg-[var(--color-surface-variant)] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">download</span> Export CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="gov-table-header">
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`} style={col.width ? { width: col.width } : {}}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[13px] text-[var(--color-on-surface)]">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className={`gov-table-row border-b border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="p-3 border-t border-[var(--color-outline-variant)] flex justify-between items-center bg-white">
          <span className="text-xs text-[var(--color-on-surface-variant)]">
            Showing 1 to {Math.min(data.length, pageSize)} of {total} entries
          </span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]">
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--color-gov-navy)] bg-[var(--color-gov-navy)] text-white text-xs font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] text-xs">3</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
