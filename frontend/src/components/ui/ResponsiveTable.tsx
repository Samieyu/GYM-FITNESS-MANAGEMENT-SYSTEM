import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  mobileCardRender?: (item: T) => React.ReactNode;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  className,
  mobileCardRender,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-border-subtle bg-surface text-content-secondary text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('w-full', className))}>
      {/* Mobile Stacked Cards (<768px) */}
      <div className="block md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="p-4 rounded-xl border border-border-subtle bg-surface shadow-sm space-y-2 text-left"
          >
            {mobileCardRender
              ? mobileCardRender(item)
              : columns.map((col, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 border-b border-border-subtle/50 last:border-none text-xs"
                  >
                    <span className="font-semibold text-content-secondary uppercase tracking-wider text-[11px]">
                      {col.header}
                    </span>
                    <div className="text-content-primary font-medium text-right">
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? '')
                        : null}
                    </div>
                  </div>
                ))}
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Tabular Table (>=768px) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border-subtle bg-surface shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-elevated/70">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={twMerge(
                    clsx(
                      'px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-content-secondary',
                      col.className
                    )
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/60">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-surface-elevated/50 transition-colors"
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={twMerge(
                      clsx('px-5 py-3.5 text-content-primary font-medium', col.className)
                    )}
                  >
                    {col.cell
                      ? col.cell(item)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
