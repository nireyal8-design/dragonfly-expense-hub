export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          category: string;
          currency: string;
          date: string;
          transaction_date: string;
          is_recurring: boolean;
          recurring_day: number;
          recurring_frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
          payment_method: string;
          notes: string | null;
          created_at: string;
          has_reminder: boolean;
          reminder_days_before: number;
          reminder_notification: boolean;
          reminder_email: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          category?: string;
          currency?: string;
          date?: string;
          transaction_date?: string;
          is_recurring?: boolean;
          recurring_day?: number;
          recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
          payment_method?: string;
          notes?: string | null;
          created_at?: string;
          has_reminder?: boolean;
          reminder_days_before?: number;
          reminder_notification?: boolean;
          reminder_email?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          category?: string;
          currency?: string;
          date?: string;
          transaction_date?: string;
          is_recurring?: boolean;
          recurring_day?: number;
          recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
          payment_method?: string;
          notes?: string | null;
          created_at?: string;
          has_reminder?: boolean;
          reminder_days_before?: number;
          reminder_notification?: boolean;
          reminder_email?: boolean;
        };
      };
      goals: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          target_amount: number;
          allocation_percentage: number;
          deadline: string | null;
          notes: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          target_amount: number;
          allocation_percentage: number;
          deadline?: string | null;
          notes?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          target_amount?: number;
          allocation_percentage?: number;
          deadline?: string | null;
          notes?: string | null;
          user_id?: string;
        };
      };
      credit_cardimport_data: {
        Row: {
          id: string;
          user_id: string;
          report_name: string;
          report_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_name: string;
          report_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_name?: string;
          report_date?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          full_name: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          email: string;
          full_name?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          full_name?: string | null;
        };
      };
      monthly_budgets: {
        Row: {
          id: string;
          created_at: string;
          month: number;
          year: number;
          amount: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          month: number;
          year: number;
          amount: number;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          month?: number;
          year?: number;
          amount?: number;
          user_id?: string;
        };
      };
      recurring_expenses: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          amount: number;
          category: string;
          currency: string;
          payment_method: string;
          notes: string | null;
          user_id: string;
          day: number;
          frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          amount: number;
          category: string;
          currency?: string;
          payment_method: string;
          notes?: string | null;
          user_id: string;
          day: number;
          frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          amount?: number;
          category?: string;
          currency?: string;
          payment_method?: string;
          notes?: string | null;
          user_id?: string;
          day?: number;
          frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
          is_active?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}; 