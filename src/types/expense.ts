export type PaymentMethod = 'credit' | 'cash' | 'bank_transfer' | 'standing_order';

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  payment_method: PaymentMethod;
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
  recurring_day?: number;
  notes?: string;
  is_active?: boolean;
  has_reminder?: boolean;
  reminder_days_before?: number;
  reminder_notification?: boolean;
  reminder_email?: boolean;
}
