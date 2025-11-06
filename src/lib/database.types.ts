export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          name: string;
          location: string;
          manager_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          manager_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          manager_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          date: string;
          shop_id: string;
          amount: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          shop_id: string;
          amount?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          shop_id?: string;
          amount?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          category: string;
          amount: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          category: string;
          amount?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          category?: string;
          amount?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      store_values: {
        Row: {
          id: string;
          shop_id: string;
          goods_value: number;
          cash_value: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          goods_value?: number;
          cash_value?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          goods_value?: number;
          cash_value?: number;
          updated_at?: string;
        };
      };
    };
  };
}

export type Shop = Database['public']['Tables']['shops']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type StoreValue = Database['public']['Tables']['store_values']['Row'];
