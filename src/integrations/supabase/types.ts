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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      article_shares: {
        Row: {
          article_id: string
          created_at: string
          id: string
          ip_address: string | null
          platform: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          platform: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          platform?: string
          user_id?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          ai_keywords: string[] | null
          ai_summary: string | null
          author: string
          author_id: string | null
          canonical_url: string | null
          category_id: string
          comments_count: number | null
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          language: string | null
          likes_count: number | null
          meta_description: string | null
          meta_title: string | null
          original_article_id: string | null
          published: boolean | null
          published_at: string | null
          reading_time: number | null
          seo_keywords: string[] | null
          seo_score: number | null
          shares_count: number | null
          slug: string
          summary: string | null
          tags: string[] | null
          title: string
          translations_available: boolean | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          ai_keywords?: string[] | null
          ai_summary?: string | null
          author?: string
          author_id?: string | null
          canonical_url?: string | null
          category_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          language?: string | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          original_article_id?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          seo_keywords?: string[] | null
          seo_score?: number | null
          shares_count?: number | null
          slug: string
          summary?: string | null
          tags?: string[] | null
          title: string
          translations_available?: boolean | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          ai_keywords?: string[] | null
          ai_summary?: string | null
          author?: string
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          language?: string | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          original_article_id?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          seo_keywords?: string[] | null
          seo_score?: number | null
          shares_count?: number | null
          slug?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          translations_available?: boolean | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_original_article_id_fkey"
            columns: ["original_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string
          author_email: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_approved: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          author_email?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          author_email?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_trending_scores: {
        Row: {
          article_id: string
          engagement_score: number
          freshness_score: number
          id: string
          score_date: string
          trending_score: number
        }
        Insert: {
          article_id: string
          engagement_score?: number
          freshness_score?: number
          id?: string
          score_date?: string
          trending_score?: number
        }
        Update: {
          article_id?: string
          engagement_score?: number
          freshness_score?: number
          id?: string
          score_date?: string
          trending_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_trending_scores_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_papers: {
        Row: {
          created_at: string
          download_count: number | null
          exam_name: string
          file_size: number | null
          file_url: string
          id: string
          subject: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          year: number
        }
        Insert: {
          created_at?: string
          download_count?: number | null
          exam_name: string
          file_size?: number | null
          file_url: string
          id?: string
          subject?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          year: number
        }
        Update: {
          created_at?: string
          download_count?: number | null
          exam_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_papers_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          author_bio: string | null
          author_image_url: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          author_bio?: string | null
          author_image_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          job_title?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          author_bio?: string | null
          author_image_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          ip_address: string | null
          last_updated: string
          preferred_categories: string[] | null
          preferred_tags: string[] | null
          reading_frequency: Json | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          last_updated?: string
          preferred_categories?: string[] | null
          preferred_tags?: string[] | null
          reading_frequency?: Json | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          last_updated?: string
          preferred_categories?: string[] | null
          preferred_tags?: string[] | null
          reading_frequency?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_reading_history: {
        Row: {
          article_id: string
          id: string
          ip_address: string | null
          read_at: string
          read_percentage: number | null
          reading_duration: number | null
          user_id: string | null
        }
        Insert: {
          article_id: string
          id?: string
          ip_address?: string | null
          read_at?: string
          read_percentage?: number | null
          reading_duration?: number | null
          user_id?: string | null
        }
        Update: {
          article_id?: string
          id?: string
          ip_address?: string | null
          read_at?: string
          read_percentage?: number | null
          reading_duration?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reading_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_seo_score: {
        Args: {
          article_content: string
          article_keywords: string[]
          article_meta_description: string
          article_meta_title: string
          article_title: string
        }
        Returns: number
      }
      get_author_profile: {
        Args: { author_uuid: string }
        Returns: {
          author_bio: string
          author_image_url: string
          avatar_url: string
          full_name: string
          id: string
          job_title: string
          username: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_public_comments: {
        Args: { article_uuid: string }
        Returns: {
          article_id: string
          author_name: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }[]
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
    Enums: {},
  },
} as const
