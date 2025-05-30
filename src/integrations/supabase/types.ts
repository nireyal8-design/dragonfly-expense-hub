export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          amount: number
          category: string | null
          currency: string | null
          date: string
          id: string
          name: string
          user_id: string
          is_recurring: boolean
          recurring_day: number | null
          recurring_frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | null
          payment_method: string | null
          notes: string | null
          is_active?: boolean
        }
        Insert: {
          amount: number
          category?: string | null
          currency?: string | null
          date?: string
          id?: string
          name: string
          user_id: string
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | null
          payment_method?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          amount?: number
          category?: string | null
          currency?: string | null
          date?: string
          id?: string
          name?: string
          user_id?: string
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | null
          payment_method?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          created_at: string
          name: string
          target_amount: number
          allocation_percentage: number
          deadline: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          target_amount: number
          allocation_percentage: number
          deadline?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          target_amount?: number
          allocation_percentage?: number
          deadline?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          budget: number
          created_at: string
          email: string
          first_name: string
          id: number
          last_name: string
          password: string
        }
        Insert: {
          budget?: number
          created_at?: string
          email: string
          first_name: string
          id?: number
          last_name: string
          password: string
        }
        Update: {
          budget?: number
          created_at?: string
          email?: string
          first_name?: string
          id?: number
          last_name?: string
          password?: string
        }
        Relationships: []
      }
      monthly_budgets: {
        Row: {
          id: string
          user_id: string
          year: number
          month: number
          budget: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          month: number
          budget: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          month?: number
          budget?: number
          created_at?: string
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          category: string | null
          currency: string | null
          recurring_day: number
          recurring_frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          category?: string | null
          currency?: string | null
          recurring_day: number
          recurring_frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          category?: string | null
          currency?: string | null
          recurring_day?: number
          recurring_frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
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
