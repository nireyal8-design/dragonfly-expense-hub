export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          created_at: string
          name: string
          amount: number
          date: string
          transaction_date: string
          category: string
          currency: string
          payment_method: string
          notes: string | null
          user_id: string
          is_recurring: boolean
          recurring_day: number | null
          recurring_frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          amount: number
          date: string
          transaction_date: string
          category: string
          currency?: string
          payment_method: string
          notes?: string | null
          user_id: string
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          amount?: number
          date?: string
          transaction_date?: string
          category?: string
          currency?: string
          payment_method?: string
          notes?: string | null
          user_id?: string
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | null
          is_active?: boolean
        }
      }
      credit_cardimport_data: {
        Row: {
          id: string
          created_at: string
          report_name: string
          report_date: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          report_name: string
          report_date: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          report_name?: string
          report_date?: string
          user_id?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
        }
      }
      monthly_budgets: {
        Row: {
          id: string
          created_at: string
          month: number
          year: number
          amount: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          month: number
          year: number
          amount: number
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          month?: number
          year?: number
          amount?: number
          user_id?: string
        }
      }
      recurring_expenses: {
        Row: {
          id: string
          created_at: string
          name: string
          amount: number
          category: string
          currency: string
          payment_method: string
          notes: string | null
          user_id: string
          day: number
          frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          amount: number
          category: string
          currency?: string
          payment_method: string
          notes?: string | null
          user_id: string
          day: number
          frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          amount?: number
          category?: string
          currency?: string
          payment_method?: string
          notes?: string | null
          user_id?: string
          day?: number
          frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
