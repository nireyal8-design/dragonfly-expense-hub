export type PaymentMethod = 'credit' | 'cash' | 'bank_transfer' | 'standing_order';

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  date: string;
  transaction_date?: string | null;
  category: string;
  payment_method?: PaymentMethod;
  is_recurring: boolean;
  recurring_day: number | null;
  recurring_frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | null;
  notes: string;
  is_active?: boolean;
}
