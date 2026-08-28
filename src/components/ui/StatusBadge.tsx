'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  icon?: string;
}

export default function StatusBadge({ status, variant = 'neutral', size = 'sm', icon }: StatusBadgeProps) {
  const variants = {
    success: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[rgba(0,102,51,0.2)]',
    warning: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[rgba(144,77,0,0.2)]',
    error: 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] border-[rgba(186,26,26,0.2)]',
    info: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[rgba(13,71,161,0.2)]',
    neutral: 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-[12px]',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider border ${variants[variant]} ${sizes[size]}`}>
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {status}
    </span>
  );
}

// Auto-detect variant from common status strings
export function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const s = status.toLowerCase();
  if (['verified', 'completed', 'approved', 'resolved', 'active', 'possession taken', 'compensation paid', 'disbursed'].includes(s)) return 'success';
  if (['pending', 'pending review', 'in progress', 'in-progress', 'processing', 'under review', 'under acquisition', 'draft', 'scheduling', 'hearing scheduled', 'stage i', 'stage ii'].includes(s)) return 'warning';
  if (['failed', 'rejected', 'disputed', 'court stay', 'escalated', 'high impact', 'dismissed', 'overdue', 'bypass recommended'].includes(s)) return 'error';
  if (['identified', 'surveyed', 'notified', 'review required', 'ready for review'].includes(s)) return 'info';
  return 'neutral';
}
