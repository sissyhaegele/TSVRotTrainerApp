import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({ size = 'medium', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6', 
    large: 'w-8 h-8',
  };

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <Loader2 className={cn('animate-spin text-tsv-blue-600', sizeClasses[size])} />
    </div>
  );
}

export default LoadingSpinner;

// Confirm Dialog Component
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {message}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={cn(
                  'btn',
                  isDestructive ? 'btn-danger' : 'btn-primary'
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Wird ausgeführt...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alert Component
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type, title, children, className }: AlertProps) {
  const typeClasses = {
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-danger',
    info: 'alert-info',
  };

  return (
    <div className={cn('alert', typeClasses[type], className)}>
      {title && <h4 className="font-medium mb-1">{title}</h4>}
      <div>{children}</div>
    </div>
  );
}

// Badge Component
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ 
  variant = 'default', 
  size = 'medium', 
  children, 
  className 
}: BadgeProps) {
  const variantClasses = {
    default: 'status-gray',
    success: 'status-success',
    warning: 'status-warning',
    danger: 'status-danger', 
    info: 'status-info',
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-2.5 py-1',
  };

  return (
    <span className={cn(
      'status-badge',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <button onClick={action.onClick} className="btn btn-primary">
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}

// Card Component
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function Card({ title, subtitle, children, className, actions }: CardProps) {
  return (
    <div className={cn('card', className)}>
      {(title || subtitle || actions) && (
        <div className="card-header flex justify-between items-start">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className 
}: StatsCardProps) {
  return (
    <div className={cn('card', className)}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-tsv-blue-600" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className={cn(
                'ml-2 text-sm',
                trend.isPositive ? 'text-tsv-green-600' : 'text-tsv-red-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div className={cn('flex space-x-2', className)}>
      {children}
    </div>
  );
}

// Table Component
interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('table', className)}>
        <thead className="table-header">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="table-header-cell">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {children}
        </tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr 
      className={cn('table-row', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn('table-cell', className)}>
      {children}
    </td>
  );
}

// Export all components
export { 
  LoadingSpinner, 
  ConfirmDialog, 
  Alert, 
  Badge, 
  EmptyState, 
  Card, 
  StatsCard,
  ButtonGroup,
  Table,
  TableRow,
  TableCell
};
