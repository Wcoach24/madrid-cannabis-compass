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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_bio: string | null
          author_name: string
          body_markdown: string
          canonical_url: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: number
          is_featured: boolean | null
          language: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_bio?: string | null
          author_name: string
          body_markdown: string
          canonical_url?: string | null
          category: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: number
          is_featured?: boolean | null
          language: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_bio?: string | null
          author_name?: string
          body_markdown?: string
          canonical_url?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: number
          is_featured?: boolean | null
          language?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string
          description: string
          district: string
          email: string | null
          gallery_image_urls: string[] | null
          google_place_id: string | null
          id: number
          instagram_url: string | null
          is_featured: boolean | null
          is_tourist_friendly: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          main_image_url: string | null
          name: string
          postal_code: string | null
          rating_ambience: number | null
          rating_editorial: number | null
          rating_location: number | null
          rating_safety: number | null
          seo_description: string | null
          seo_title: string | null
          short_name: string | null
          slug: string
          status: string
          summary: string | null
          timetable: Json | null
          updated_at: string
          website_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address: string
          city?: string
          country?: string
          created_at?: string
          description: string
          district: string
          email?: string | null
          gallery_image_urls?: string[] | null
          google_place_id?: string | null
          id?: number
          instagram_url?: string | null
          is_featured?: boolean | null
          is_tourist_friendly?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          main_image_url?: string | null
          name: string
          postal_code?: string | null
          rating_ambience?: number | null
          rating_editorial?: number | null
          rating_location?: number | null
          rating_safety?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_name?: string | null
          slug: string
          status?: string
          summary?: string | null
          timetable?: Json | null
          updated_at?: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string
          description?: string
          district?: string
          email?: string | null
          gallery_image_urls?: string[] | null
          google_place_id?: string | null
          id?: number
          instagram_url?: string | null
          is_featured?: boolean | null
          is_tourist_friendly?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          main_image_url?: string | null
          name?: string
          postal_code?: string | null
          rating_ambience?: number | null
          rating_editorial?: number | null
          rating_location?: number | null
          rating_safety?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_name?: string | null
          slug?: string
          status?: string
          summary?: string | null
          timetable?: Json | null
          updated_at?: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer_markdown: string
          category: string | null
          created_at: string
          id: number
          language: string
          priority: number | null
          question: string
          slug: string
          updated_at: string
        }
        Insert: {
          answer_markdown: string
          category?: string | null
          created_at?: string
          id?: number
          language: string
          priority?: number | null
          question: string
          slug: string
          updated_at?: string
        }
        Update: {
          answer_markdown?: string
          category?: string | null
          created_at?: string
          id?: number
          language?: string
          priority?: number | null
          question?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitation_audit_log: {
        Row: {
          action: string
          admin_email: string | null
          admin_id: string | null
          id: number
          ip_address: unknown
          metadata: Json | null
          request_id: number | null
          timestamp: string | null
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_id?: string | null
          id?: number
          ip_address?: unknown
          metadata?: Json | null
          request_id?: number | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_id?: string | null
          id?: number
          ip_address?: unknown
          metadata?: Json | null
          request_id?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_audit_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "invitation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_requests: {
        Row: {
          actual_attendee_count: number | null
          attendance_marked_at: string | null
          attendance_marked_by: string | null
          attended: boolean | null
          auto_reminder_sent_at: string | null
          club_slug: string
          created_at: string | null
          email: string
          email_sent_at: string | null
          expires_at: string | null
          gdpr_consent: boolean
          id: number
          invitation_code: string | null
          ip_address: unknown
          language: string
          legal_age_confirmed: boolean
          legal_knowledge_confirmed: boolean
          notes: string | null
          phone: string
          qr_code_url: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          visit_date: string
          visitor_count: number
          visitor_names: string[]
        }
        Insert: {
          actual_attendee_count?: number | null
          attendance_marked_at?: string | null
          attendance_marked_by?: string | null
          attended?: boolean | null
          auto_reminder_sent_at?: string | null
          club_slug: string
          created_at?: string | null
          email: string
          email_sent_at?: string | null
          expires_at?: string | null
          gdpr_consent: boolean
          id?: number
          invitation_code?: string | null
          ip_address?: unknown
          language?: string
          legal_age_confirmed: boolean
          legal_knowledge_confirmed: boolean
          notes?: string | null
          phone: string
          qr_code_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          visit_date: string
          visitor_count: number
          visitor_names: string[]
        }
        Update: {
          actual_attendee_count?: number | null
          attendance_marked_at?: string | null
          attendance_marked_by?: string | null
          attended?: boolean | null
          auto_reminder_sent_at?: string | null
          club_slug?: string
          created_at?: string | null
          email?: string
          email_sent_at?: string | null
          expires_at?: string | null
          gdpr_consent?: boolean
          id?: number
          invitation_code?: string | null
          ip_address?: unknown
          language?: string
          legal_age_confirmed?: boolean
          legal_knowledge_confirmed?: boolean
          notes?: string | null
          phone?: string
          qr_code_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          visit_date?: string
          visitor_count?: number
          visitor_names?: string[]
        }
        Relationships: []
      }
      submissions: {
        Row: {
          club_id: number | null
          club_name: string | null
          created_at: string
          email: string
          id: number
          message: string
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          club_id?: number | null
          club_name?: string | null
          created_at?: string
          email: string
          id?: number
          message: string
          name: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          club_id?: number | null
          club_name?: string | null
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role_to_user: {
        Args: { user_email: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "viewer"
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
      app_role: ["admin", "moderator", "viewer"],
    },
  },
} as const
