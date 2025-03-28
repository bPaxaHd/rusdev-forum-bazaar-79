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
      admin_login_attempts: {
        Row: {
          attempts: number
          id: string
          ip_address: string
          is_resolved: boolean
          timestamp: string | null
        }
        Insert: {
          attempts?: number
          id?: string
          ip_address: string
          is_resolved?: boolean
          timestamp?: string | null
        }
        Update: {
          attempts?: number
          id?: string
          ip_address?: string
          is_resolved?: boolean
          timestamp?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number | null
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          company_name: string
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          location: string
          logo_url: string | null
          requirements: string[] | null
          salary: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          location: string
          logo_url?: string | null
          requirements?: string[] | null
          salary?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          location?: string
          logo_url?: string | null
          requirements?: string[] | null
          salary?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          experience_years: number | null
          github_url: string | null
          id: string
          is_banned: boolean | null
          is_frozen: boolean | null
          is_muted: boolean | null
          location: string | null
          skills: string[] | null
          specialty: string | null
          subscription_type: string | null
          twitter_url: string | null
          updated_at: string
          user_tag: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          experience_years?: number | null
          github_url?: string | null
          id: string
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_muted?: boolean | null
          location?: string | null
          skills?: string[] | null
          specialty?: string | null
          subscription_type?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_tag?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          experience_years?: number | null
          github_url?: string | null
          id?: string
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_muted?: boolean | null
          location?: string | null
          skills?: string[] | null
          specialty?: string | null
          subscription_type?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_tag?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_admin: boolean | null
          read: boolean | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          read?: boolean | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          read?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      topic_likes: {
        Row: {
          created_at: string | null
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_likes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          likes: number | null
          title: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          title: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_subscription_type_to_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      add_user_tag_to_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admins_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_comment_likes_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_topic_likes_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
