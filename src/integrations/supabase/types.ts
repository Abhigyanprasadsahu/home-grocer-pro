export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      grocery_items: {
        Row: {
          best_price: number | null
          best_store: string | null
          category: string
          created_at: string | null
          estimated_price: number | null
          id: string
          is_purchased: boolean | null
          list_id: string
          name: string
          notes: string | null
          quantity: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_price?: number | null
          best_store?: string | null
          category: string
          created_at?: string | null
          estimated_price?: number | null
          id?: string
          is_purchased?: boolean | null
          list_id: string
          name: string
          notes?: string | null
          quantity?: number
          unit?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_price?: number | null
          best_store?: string | null
          category?: string
          created_at?: string | null
          estimated_price?: number | null
          id?: string
          is_purchased?: boolean | null
          list_id?: string
          name?: string
          notes?: string | null
          quantity?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "grocery_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          ai_generated: boolean | null
          created_at: string | null
          estimated_savings: number | null
          household_id: string
          id: string
          month: number
          name: string
          nutrition_score: number | null
          status: string | null
          total_cost: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string | null
          estimated_savings?: number | null
          household_id: string
          id?: string
          month: number
          name: string
          nutrition_score?: number | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string | null
          estimated_savings?: number | null
          household_id?: string
          id?: string
          month?: number
          name?: string
          nutrition_score?: number | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "grocery_lists_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          adults: number
          children: number
          created_at: string | null
          diet_preferences:
            | Database["public"]["Enums"]["diet_preference"][]
            | null
          elderly: number
          family_size: number
          id: string
          monthly_budget: number | null
          name: string
          preferred_stores: string[] | null
          special_requirements: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adults?: number
          children?: number
          created_at?: string | null
          diet_preferences?:
            | Database["public"]["Enums"]["diet_preference"][]
            | null
          elderly?: number
          family_size?: number
          id?: string
          monthly_budget?: number | null
          name?: string
          preferred_stores?: string[] | null
          special_requirements?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adults?: number
          children?: number
          created_at?: string | null
          diet_preferences?:
            | Database["public"]["Enums"]["diet_preference"][]
            | null
          elderly?: number
          family_size?: number
          id?: string
          monthly_budget?: number | null
          name?: string
          preferred_stores?: string[] | null
          special_requirements?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          unit?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      store_prices: {
        Row: {
          base_price: number
          created_at: string | null
          current_price: number
          discount_percent: number | null
          id: string
          is_available: boolean | null
          last_updated: string | null
          product_id: string
          stock_level: number | null
          store_id: string
        }
        Insert: {
          base_price: number
          created_at?: string | null
          current_price: number
          discount_percent?: number | null
          id?: string
          is_available?: boolean | null
          last_updated?: string | null
          product_id: string
          stock_level?: number | null
          store_id: string
        }
        Update: {
          base_price?: number
          created_at?: string | null
          current_price?: number
          discount_percent?: number | null
          id?: string
          is_available?: boolean | null
          last_updated?: string | null
          product_id?: string
          stock_level?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_prices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          color: string | null
          created_at: string | null
          delivery_fee: number | null
          id: string
          logo_url: string | null
          min_order: number | null
          name: string
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          id?: string
          logo_url?: string | null
          min_order?: number | null
          name: string
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          id?: string
          logo_url?: string | null
          min_order?: number | null
          name?: string
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      simulate_price_update: { Args: never; Returns: undefined }
    }
    Enums: {
      diet_preference:
        | "vegetarian"
        | "non_vegetarian"
        | "vegan"
        | "eggetarian"
        | "high_protein"
        | "low_carb"
        | "diabetic_friendly"
        | "keto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      diet_preference: [
        "vegetarian",
        "non_vegetarian",
        "vegan",
        "eggetarian",
        "high_protein",
        "low_carb",
        "diabetic_friendly",
        "keto",
      ],
    },
  },
} as const
