import { Timestamp } from 'firebase/firestore';

/**
 * User types
 */
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Currency types
 */
export type Currency = 'USD' | 'DOP';

/**
 * Account types
 */
export type AccountType = 'credit' | 'debit' | 'loan' | 'service' | 'rent';

export interface Account {
  id: string;
  userId: string;
  bank: string;
  name: string;
  type: AccountType;
  isMultiCurrency: boolean;
  currencyPrimary: Currency;
  balancePrimary: number;
  currencySecondary?: Currency;
  balanceSecondary?: number;
  exchangeRate?: number; // Manual exchange rate for multi-currency accounts
  cutDay?: number; // Day of month for statement cut (1-31)
  dueDaysOffset?: number; // Days from cut to due date
  limitPrimary?: number; // Credit limit in primary currency
  limitSecondary?: number; // Credit limit in secondary currency
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Transaction types
 */
export type TransactionType = 'charge' | 'payment' | 'fee' | 'interest';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  date: Timestamp;
  description: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  categoryId?: string;
  note?: string;
  receiptPath?: string; // Path to receipt image in Firebase Storage
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Statement types
 */
export interface Statement {
  id: string;
  userId: string;
  accountId: string;
  cutDate: Timestamp;
  dueDate: Timestamp;
  closingBalanceDOP?: number;
  closingBalanceUSD?: number;
  minimumPaymentDOP?: number;
  minimumPaymentUSD?: number;
  statementPdfPath?: string;
  isPaid: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Recurring payment types
 */
export interface RecurringPayment {
  id: string;
  userId: string;
  name: string;
  day: number; // Day of month (1-31)
  amount: number;
  currency: Currency;
  categoryId?: string;
  bank?: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Budget types
 */
export interface Budget {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM
  totalPlannedDOP: number;
  totalPlannedUSD: number;
  totalActualDOP: number;
  totalActualUSD: number;
  categoryBudgets: Record<
    string,
    {
      planned: number;
      actual: number;
      currency: Currency;
    }
  >;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Calendar event types
 */
export type CalendarEventType = 'cut' | 'due' | 'recurring';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  date: Timestamp;
  type: CalendarEventType;
  accountId?: string;
  recurringPaymentId?: string;
  amountDOP?: number;
  amountUSD?: number;
  isPaid: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Category types
 */
export interface Category {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Form types for creating/editing
 */
export interface AccountFormData {
  bank: string;
  name: string;
  type: AccountType;
  isMultiCurrency: boolean;
  currencyPrimary: Currency;
  balancePrimary: number;
  currencySecondary?: Currency;
  balanceSecondary?: number;
  exchangeRate?: number;
  cutDay?: number;
  dueDaysOffset?: number;
  limitPrimary?: number;
  limitSecondary?: number;
  notes?: string;
}

export interface TransactionFormData {
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  categoryId?: string;
  note?: string;
  receiptFile?: File;
}

export interface RecurringPaymentFormData {
  name: string;
  day: number;
  amount: number;
  currency: Currency;
  categoryId?: string;
  bank?: string;
  active: boolean;
}

/**
 * Filter types
 */
export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  currency?: Currency;
  startDate?: Date;
  endDate?: Date;
}

export interface CalendarFilters {
  month: number;
  year: number;
  accountId?: string;
  type?: AccountType;
  currency?: Currency | 'global';
}
