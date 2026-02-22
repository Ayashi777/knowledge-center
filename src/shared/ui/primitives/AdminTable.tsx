import React from 'react';
import { cn } from '@shared/lib/utils/cn';

interface AdminTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  minWidthClassName?: string;
  wrapperClassName?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  className,
  minWidthClassName,
  wrapperClassName,
  children,
  ...props
}) => (
  <div className={cn('overflow-x-auto', wrapperClassName)}>
    <table
      className={cn('w-full border-collapse text-left', minWidthClassName, className)}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const AdminTableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => <thead className={cn('bg-muted/30', className)} {...props} />;

export const AdminTableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => (
  <th
    className={cn('p-3 text-[10px] font-black uppercase tracking-widest text-muted-fg', className)}
    {...props}
  />
);

export const AdminTableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => <tbody className={cn('divide-y divide-border', className)} {...props} />;

export const AdminTableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  ...props
}) => <tr className={cn('transition-colors hover:bg-muted/20', className)} {...props} />;

export const AdminTableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => <td className={cn('p-3', className)} {...props} />;
