/**
 * Date and calculation utilities for LEXOPS COUNSEL OS
 * Supports TAT engine and deadline alert classification
 */

export function parseDate(dateStr?: string): Date | null {
  if (!dateStr || dateStr.trim() === '' || dateStr === 'No Date Set') return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateDisplay(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return 'No Date Set';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculates actual processing days elapsed from request date.
 * If execution date is present, freezes at elapsed days between request and execution.
 */
export function calculateTAT(requestDateStr: string, executionDateStr?: string): number {
  const start = parseDate(requestDateStr);
  if (!start) return 0;
  
  const end = executionDateStr ? parseDate(executionDateStr) : new Date();
  if (!end) return 0;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  return diffDays;
}

/**
 * Calculates days remaining from today until target date.
 * Returns negative if past deadline.
 */
export function getDaysRemaining(targetDateStr?: string): number | null {
  const target = parseDate(targetDateStr);
  if (!target) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days an invoice has been pending with Finance since submission.
 */
export function getDaysPendingWithFinance(dateSubmittedStr?: string): number {
  const submitted = parseDate(dateSubmittedStr);
  if (!submitted) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  submitted.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - submitted.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export type AlertBadgeType = 'expired' | 'warning' | 'normal' | 'no_date';

export function getDeadlineAlertStatus(dateStr?: string, warningThresholdDays = 30): {
  type: AlertBadgeType;
  daysRemaining: number | null;
  label: string;
} {
  const days = getDaysRemaining(dateStr);
  if (days === null) {
    return { type: 'no_date', daysRemaining: null, label: 'No Date Set' };
  }

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      type: 'expired',
      daysRemaining: days,
      label: overdueDays === 1 ? '1 Day Overdue' : `${overdueDays} Days Overdue`,
    };
  }

  if (days === 0) {
    return {
      type: 'expired',
      daysRemaining: 0,
      label: 'Due Today',
    };
  }

  if (days <= warningThresholdDays) {
    return {
      type: 'warning',
      daysRemaining: days,
      label: days === 1 ? '1 Day Left' : `${days} Days Left`,
    };
  }

  return {
    type: 'normal',
    daysRemaining: days,
    label: `${days} Days Left`,
  };
}

export function formatCurrency(amount: number, currency = 'MYR'): string {
  const formatted = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency} ${formatted}`;
}
