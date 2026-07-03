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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          body: string
          created_at: string
          id: string
        }
        Insert: {
          application_id: string
          author_id: string
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          cover_letter: string | null
          freelancer_id: string
          id: string
          job_id: string
          match: number
          recruiter_id: string | null
          stage: Database["public"]["Enums"]["application_stage"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          freelancer_id: string
          id?: string
          job_id: string
          match?: number
          recruiter_id?: string | null
          stage?: Database["public"]["Enums"]["application_stage"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          freelancer_id?: string
          id?: string
          job_id?: string
          match?: number
          recruiter_id?: string | null
          stage?: Database["public"]["Enums"]["application_stage"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          name: string
          plan: Database["public"]["Enums"]["company_plan"]
          size: string | null
          spend: number
          status: Database["public"]["Enums"]["company_status"]
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          plan?: Database["public"]["Enums"]["company_plan"]
          size?: string | null
          spend?: number
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["company_plan"]
          size?: string | null
          spend?: number
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          freelancer_id: string
          id: string
          job_id: string | null
          role: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
          value: number
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          freelancer_id: string
          id?: string
          job_id?: string | null
          role: string
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
          value?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          freelancer_id?: string
          id?: string
          job_id?: string | null
          role?: string
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_onboarding: {
        Row: {
          completion: number
          created_at: string
          data: Json
          id: string
          recruiter_assessment: Json
          recruiter_notes: string | null
          talent_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completion?: number
          created_at?: string
          data?: Json
          id?: string
          recruiter_assessment?: Json
          recruiter_notes?: string | null
          talent_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completion?: number
          created_at?: string
          data?: Json
          id?: string
          recruiter_assessment?: Json
          recruiter_notes?: string | null
          talent_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      freelancer_profiles: {
        Row: {
          availability: string | null
          available_from: string | null
          avatar_color: string
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          email_verified: boolean
          employment_status: string | null
          expected_daily_rate: number | null
          expected_hourly_rate: number | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          mobile: string | null
          mobile_verified: boolean
          notice_period: string | null
          photo_url: string | null
          portfolio_url: string | null
          primary_role: string | null
          rate: number | null
          rating: number
          register_as: string | null
          resume_url: string | null
          skills: string[]
          status: Database["public"]["Enums"]["freelancer_status"]
          title: string | null
          total_experience: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          available_from?: string | null
          avatar_color?: string
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email_verified?: boolean
          employment_status?: string | null
          expected_daily_rate?: number | null
          expected_hourly_rate?: number | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          mobile?: string | null
          mobile_verified?: boolean
          notice_period?: string | null
          photo_url?: string | null
          portfolio_url?: string | null
          primary_role?: string | null
          rate?: number | null
          rating?: number
          register_as?: string | null
          resume_url?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["freelancer_status"]
          title?: string | null
          total_experience?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          available_from?: string | null
          avatar_color?: string
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email_verified?: boolean
          employment_status?: string | null
          expected_daily_rate?: number | null
          expected_hourly_rate?: number | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          mobile?: string | null
          mobile_verified?: boolean
          notice_period?: string | null
          photo_url?: string | null
          portfolio_url?: string | null
          primary_role?: string | null
          rate?: number | null
          rating?: number
          register_as?: string | null
          resume_url?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["freelancer_status"]
          title?: string | null
          total_experience?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          budget: number | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          posted_by: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          type: Database["public"]["Enums"]["job_type"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          posted_by?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          type?: Database["public"]["Enums"]["job_type"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          posted_by?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          type?: Database["public"]["Enums"]["job_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          direction: Database["public"]["Enums"]["payment_direction"]
          id: string
          invoice: string
          paid_on: string
          party: string
          party_company_id: string | null
          party_user_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          direction: Database["public"]["Enums"]["payment_direction"]
          id?: string
          invoice: string
          paid_on?: string
          party: string
          party_company_id?: string | null
          party_user_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["payment_direction"]
          id?: string
          invoice?: string
          paid_on?: string
          party?: string
          party_company_id?: string | null
          party_user_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_party_company_id_fkey"
            columns: ["party_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          headline: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          headline?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          contract_id: string
          created_at: string
          freelancer_id: string
          hours: number
          id: string
          notes: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          week_start: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          freelancer_id: string
          hours?: number
          id?: string
          notes?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          week_start: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          freelancer_id?: string
          hours?: number
          id?: string
          notes?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "recruiter" | "freelancer" | "company"
      application_stage:
        | "applied"
        | "screening"
        | "interview"
        | "offer"
        | "hired"
        | "rejected"
      company_plan: "Starter" | "Growth" | "Enterprise"
      company_status: "active" | "trial" | "churned"
      contract_status: "active" | "completed" | "draft"
      freelancer_status: "active" | "pending" | "suspended"
      job_status: "open" | "filled" | "closed"
      job_type: "Full-time" | "Part-time" | "Contract"
      payment_direction: "in" | "out"
      payment_status: "paid" | "pending" | "failed"
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
      app_role: ["admin", "recruiter", "freelancer", "company"],
      application_stage: [
        "applied",
        "screening",
        "interview",
        "offer",
        "hired",
        "rejected",
      ],
      company_plan: ["Starter", "Growth", "Enterprise"],
      company_status: ["active", "trial", "churned"],
      contract_status: ["active", "completed", "draft"],
      freelancer_status: ["active", "pending", "suspended"],
      job_status: ["open", "filled", "closed"],
      job_type: ["Full-time", "Part-time", "Contract"],
      payment_direction: ["in", "out"],
      payment_status: ["paid", "pending", "failed"],
    },
  },
} as const
