import dayjs from 'dayjs';
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Timestamp } from 'firebase/firestore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale('es');

/**
 * Date utilities using Day.js
 */

/**
 * Convert Firebase Timestamp to Date
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Convert Date to Firebase Timestamp
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | Timestamp, format = 'DD/MM/YYYY'): string {
  const d = date instanceof Timestamp ? timestampToDate(date) : date;
  return dayjs(d).format(format);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? timestampToDate(date) : date;
  return dayjs(d).format('DD/MM/YYYY HH:mm');
}

/**
 * Get month/year string (YYYY-MM)
 */
export function getMonthYear(date: Date): string {
  return dayjs(date).format('YYYY-MM');
}

/**
 * Parse month/year string to Date
 */
export function parseMonthYear(monthYear: string): Date {
  return dayjs(monthYear, 'YYYY-MM').toDate();
}

/**
 * Calculate due date from cut day and offset
 */
export function calculateDueDate(cutDay: number, dueDaysOffset: number, month: number, year: number): Date {
  const cutDate = dayjs().year(year).month(month).date(cutDay);
  return cutDate.add(dueDaysOffset, 'day').toDate();
}

/**
 * Get all cut and due dates for a month
 */
export function getMonthDates(
  month: number,
  year: number,
  cutDay: number,
  dueDaysOffset: number
): { cutDate: Date; dueDate: Date } {
  const cutDate = dayjs().year(year).month(month).date(cutDay).toDate();
  const dueDate = calculateDueDate(cutDay, dueDaysOffset, month, year);
  return { cutDate, dueDate };
}

/**
 * Check if date is today
 */
export function isToday(date: Date | Timestamp): boolean {
  const d = date instanceof Timestamp ? timestampToDate(date) : date;
  return dayjs(d).isSame(dayjs(), 'day');
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | Timestamp): boolean {
  const d = date instanceof Timestamp ? timestampToDate(date) : date;
  return dayjs(d).isBefore(dayjs(), 'day');
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | Timestamp): boolean {
  const d = date instanceof Timestamp ? timestampToDate(date) : date;
  return dayjs(d).isAfter(dayjs(), 'day');
}

/**
 * Get start and end of month
 */
export function getMonthRange(month: number, year: number): { start: Date; end: Date } {
  const start = dayjs().year(year).month(month).startOf('month').toDate();
  const end = dayjs().year(year).month(month).endOf('month').toDate();
  return { start, end };
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = dayjs();
  return {
    month: now.month(),
    year: now.year(),
  };
}

/**
 * Format relative time (e.g., "hace 2 días")
 */
export function formatRelative(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? timestampToDate(date) : date;
  const now = dayjs();
  const target = dayjs(d);
  const diffDays = now.diff(target, 'day');

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays === -1) return 'Mañana';
  if (diffDays > 0) return `Hace ${diffDays} días`;
  return `En ${Math.abs(diffDays)} días`;
}
