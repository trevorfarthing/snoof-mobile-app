export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          logged_by: string | null;
          metadata: Json | null;
          notes: string | null;
          occurred_at: string;
          pet_id: string;
          type: Database["public"]["Enums"]["activity_type"];
        };
        Insert: {
          created_at?: string;
          household_id: string;
          id?: string;
          logged_by?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          occurred_at?: string;
          pet_id: string;
          type: Database["public"]["Enums"]["activity_type"];
        };
        Update: {
          created_at?: string;
          household_id?: string;
          id?: string;
          logged_by?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          occurred_at?: string;
          pet_id?: string;
          type?: Database["public"]["Enums"]["activity_type"];
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_logged_by_fkey";
            columns: ["logged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          created_at: string;
          description: string | null;
          file_size_bytes: number | null;
          id: string;
          metadata: Json | null;
          mime_type: string | null;
          pet_id: string;
          related_visit_id: string | null;
          storage_path: string;
          title: string;
          type: Database["public"]["Enums"]["document_type"];
          uploaded_by: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          file_size_bytes?: number | null;
          id?: string;
          metadata?: Json | null;
          mime_type?: string | null;
          pet_id: string;
          related_visit_id?: string | null;
          storage_path: string;
          title: string;
          type?: Database["public"]["Enums"]["document_type"];
          uploaded_by?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          file_size_bytes?: number | null;
          id?: string;
          metadata?: Json | null;
          mime_type?: string | null;
          pet_id?: string;
          related_visit_id?: string | null;
          storage_path?: string;
          title?: string;
          type?: Database["public"]["Enums"]["document_type"];
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_related_visit_id_fkey";
            columns: ["related_visit_id"];
            isOneToOne: false;
            referencedRelation: "vet_visits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feedings: {
        Row: {
          activity_log_id: string;
          amount: number | null;
          amount_unit: string | null;
          created_at: string;
          food_name: string | null;
          food_type: string | null;
          id: string;
          meal_label: string | null;
          pet_id: string;
        };
        Insert: {
          activity_log_id: string;
          amount?: number | null;
          amount_unit?: string | null;
          created_at?: string;
          food_name?: string | null;
          food_type?: string | null;
          id?: string;
          meal_label?: string | null;
          pet_id: string;
        };
        Update: {
          activity_log_id?: string;
          amount?: number | null;
          amount_unit?: string | null;
          created_at?: string;
          food_name?: string | null;
          food_type?: string | null;
          id?: string;
          meal_label?: string | null;
          pet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedings_activity_log_id_fkey";
            columns: ["activity_log_id"];
            isOneToOne: true;
            referencedRelation: "activity_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedings_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      household_invites: {
        Row: {
          created_at: string;
          expires_at: string;
          household_id: string;
          id: string;
          invited_by: string;
          invited_email: string;
          responded_at: string | null;
          role: Database["public"]["Enums"]["household_role"];
          status: Database["public"]["Enums"]["invite_status"];
          token: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string;
          household_id: string;
          id?: string;
          invited_by: string;
          invited_email: string;
          responded_at?: string | null;
          role?: Database["public"]["Enums"]["household_role"];
          status?: Database["public"]["Enums"]["invite_status"];
          token?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          household_id?: string;
          id?: string;
          invited_by?: string;
          invited_email?: string;
          responded_at?: string | null;
          role?: Database["public"]["Enums"]["household_role"];
          status?: Database["public"]["Enums"]["invite_status"];
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "household_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      household_members: {
        Row: {
          household_id: string;
          id: string;
          is_active: boolean;
          joined_at: string;
          role: Database["public"]["Enums"]["household_role"];
          user_id: string;
        };
        Insert: {
          household_id: string;
          id?: string;
          is_active?: boolean;
          joined_at?: string;
          role?: Database["public"]["Enums"]["household_role"];
          user_id: string;
        };
        Update: {
          household_id?: string;
          id?: string;
          is_active?: boolean;
          joined_at?: string;
          role?: Database["public"]["Enums"]["household_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "household_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      households: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          name?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medication_logs: {
        Row: {
          administered_at: string;
          administered_by: string | null;
          created_at: string;
          id: string;
          medication_id: string;
          notes: string | null;
          pet_id: string;
          skip_reason: string | null;
          skipped: boolean | null;
        };
        Insert: {
          administered_at?: string;
          administered_by?: string | null;
          created_at?: string;
          id?: string;
          medication_id: string;
          notes?: string | null;
          pet_id: string;
          skip_reason?: string | null;
          skipped?: boolean | null;
        };
        Update: {
          administered_at?: string;
          administered_by?: string | null;
          created_at?: string;
          id?: string;
          medication_id?: string;
          notes?: string | null;
          pet_id?: string;
          skip_reason?: string | null;
          skipped?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "medication_logs_administered_by_fkey";
            columns: ["administered_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medication_logs_medication_id_fkey";
            columns: ["medication_id"];
            isOneToOne: false;
            referencedRelation: "active_medications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medication_logs_medication_id_fkey";
            columns: ["medication_id"];
            isOneToOne: false;
            referencedRelation: "medications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medication_logs_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      medications: {
        Row: {
          created_at: string;
          created_by: string | null;
          dosage: string | null;
          end_date: string | null;
          frequency: Database["public"]["Enums"]["medication_frequency"];
          frequency_custom: string | null;
          id: string;
          instructions: string | null;
          is_preventative: boolean | null;
          metadata: Json | null;
          name: string;
          pet_id: string;
          prescribed_by: string | null;
          refill_date: string | null;
          remaining_count: number | null;
          start_date: string | null;
          status: Database["public"]["Enums"]["medication_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          dosage?: string | null;
          end_date?: string | null;
          frequency?: Database["public"]["Enums"]["medication_frequency"];
          frequency_custom?: string | null;
          id?: string;
          instructions?: string | null;
          is_preventative?: boolean | null;
          metadata?: Json | null;
          name: string;
          pet_id: string;
          prescribed_by?: string | null;
          refill_date?: string | null;
          remaining_count?: number | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["medication_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          dosage?: string | null;
          end_date?: string | null;
          frequency?: Database["public"]["Enums"]["medication_frequency"];
          frequency_custom?: string | null;
          id?: string;
          instructions?: string | null;
          is_preventative?: boolean | null;
          metadata?: Json | null;
          name?: string;
          pet_id?: string;
          prescribed_by?: string | null;
          refill_date?: string | null;
          remaining_count?: number | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["medication_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medications_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medications_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      pets: {
        Row: {
          avatar_url: string | null;
          breed: string | null;
          breed_secondary: string | null;
          color: string | null;
          created_at: string;
          date_of_birth: string | null;
          deactivated_at: string | null;
          deactivated_reason: string | null;
          household_id: string;
          id: string;
          insurance_policy_number: string | null;
          insurance_provider: string | null;
          is_active: boolean;
          is_dob_estimated: boolean | null;
          license_number: string | null;
          metadata: Json | null;
          microchip_number: string | null;
          name: string;
          sex: Database["public"]["Enums"]["pet_sex"] | null;
          sort_order: number | null;
          spay_neuter: Database["public"]["Enums"]["spay_neuter_status"] | null;
          species: Database["public"]["Enums"]["pet_species"];
          updated_at: string;
          weight_lbs: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          breed?: string | null;
          breed_secondary?: string | null;
          color?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          deactivated_at?: string | null;
          deactivated_reason?: string | null;
          household_id: string;
          id?: string;
          insurance_policy_number?: string | null;
          insurance_provider?: string | null;
          is_active?: boolean;
          is_dob_estimated?: boolean | null;
          license_number?: string | null;
          metadata?: Json | null;
          microchip_number?: string | null;
          name: string;
          sex?: Database["public"]["Enums"]["pet_sex"] | null;
          sort_order?: number | null;
          spay_neuter?:
            | Database["public"]["Enums"]["spay_neuter_status"]
            | null;
          species?: Database["public"]["Enums"]["pet_species"];
          updated_at?: string;
          weight_lbs?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          breed?: string | null;
          breed_secondary?: string | null;
          color?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          deactivated_at?: string | null;
          deactivated_reason?: string | null;
          household_id?: string;
          id?: string;
          insurance_policy_number?: string | null;
          insurance_provider?: string | null;
          is_active?: boolean;
          is_dob_estimated?: boolean | null;
          license_number?: string | null;
          metadata?: Json | null;
          microchip_number?: string | null;
          name?: string;
          sex?: Database["public"]["Enums"]["pet_sex"] | null;
          sort_order?: number | null;
          spay_neuter?:
            | Database["public"]["Enums"]["spay_neuter_status"]
            | null;
          species?: Database["public"]["Enums"]["pet_species"];
          updated_at?: string;
          weight_lbs?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "pets_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      potty_logs: {
        Row: {
          activity_log_id: string;
          consistency: Database["public"]["Enums"]["potty_consistency"] | null;
          created_at: string;
          id: string;
          is_accident: boolean | null;
          location: string | null;
          pet_id: string;
          potty_type: Database["public"]["Enums"]["potty_type"];
        };
        Insert: {
          activity_log_id: string;
          consistency?: Database["public"]["Enums"]["potty_consistency"] | null;
          created_at?: string;
          id?: string;
          is_accident?: boolean | null;
          location?: string | null;
          pet_id: string;
          potty_type?: Database["public"]["Enums"]["potty_type"];
        };
        Update: {
          activity_log_id?: string;
          consistency?: Database["public"]["Enums"]["potty_consistency"] | null;
          created_at?: string;
          id?: string;
          is_accident?: boolean | null;
          location?: string | null;
          pet_id?: string;
          potty_type?: Database["public"]["Enums"]["potty_type"];
        };
        Relationships: [
          {
            foreignKeyName: "potty_logs_activity_log_id_fkey";
            columns: ["activity_log_id"];
            isOneToOne: true;
            referencedRelation: "activity_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "potty_logs_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          metadata: Json | null;
          phone: string | null;
          push_token: string | null;
          timezone: string | null;
          updated_at: string;
          username: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          metadata?: Json | null;
          phone?: string | null;
          push_token?: string | null;
          timezone?: string | null;
          updated_at?: string;
          username?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          metadata?: Json | null;
          phone?: string | null;
          push_token?: string | null;
          timezone?: string | null;
          updated_at?: string;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      vaccinations: {
        Row: {
          administering_vet: string | null;
          created_at: string;
          date_given: string;
          document_id: string | null;
          id: string;
          lot_number: string | null;
          name: string;
          next_due_date: string | null;
          notes: string | null;
          pet_id: string;
          status: Database["public"]["Enums"]["vaccination_status"];
          updated_at: string;
        };
        Insert: {
          administering_vet?: string | null;
          created_at?: string;
          date_given: string;
          document_id?: string | null;
          id?: string;
          lot_number?: string | null;
          name: string;
          next_due_date?: string | null;
          notes?: string | null;
          pet_id: string;
          status?: Database["public"]["Enums"]["vaccination_status"];
          updated_at?: string;
        };
        Update: {
          administering_vet?: string | null;
          created_at?: string;
          date_given?: string;
          document_id?: string | null;
          id?: string;
          lot_number?: string | null;
          name?: string;
          next_due_date?: string | null;
          notes?: string | null;
          pet_id?: string;
          status?: Database["public"]["Enums"]["vaccination_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vaccinations_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      vet_visits: {
        Row: {
          clinic_name: string | null;
          cost: number | null;
          created_at: string;
          created_by: string | null;
          diagnosis: string | null;
          follow_up_date: string | null;
          id: string;
          metadata: Json | null;
          notes: string | null;
          pet_id: string;
          reason: string;
          treatment: string | null;
          updated_at: string;
          vet_name: string | null;
          visit_date: string;
        };
        Insert: {
          clinic_name?: string | null;
          cost?: number | null;
          created_at?: string;
          created_by?: string | null;
          diagnosis?: string | null;
          follow_up_date?: string | null;
          id?: string;
          metadata?: Json | null;
          notes?: string | null;
          pet_id: string;
          reason: string;
          treatment?: string | null;
          updated_at?: string;
          vet_name?: string | null;
          visit_date: string;
        };
        Update: {
          clinic_name?: string | null;
          cost?: number | null;
          created_at?: string;
          created_by?: string | null;
          diagnosis?: string | null;
          follow_up_date?: string | null;
          id?: string;
          metadata?: Json | null;
          notes?: string | null;
          pet_id?: string;
          reason?: string;
          treatment?: string | null;
          updated_at?: string;
          vet_name?: string | null;
          visit_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vet_visits_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vet_visits_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      walks: {
        Row: {
          activity_log_id: string;
          avg_pace: number | null;
          calories_est: number | null;
          created_at: string;
          distance_meters: number | null;
          duration_sec: number | null;
          ended_at: string | null;
          id: string;
          metadata: Json | null;
          pet_id: string;
          route: unknown;
          started_at: string;
        };
        Insert: {
          activity_log_id: string;
          avg_pace?: number | null;
          calories_est?: number | null;
          created_at?: string;
          distance_meters?: number | null;
          duration_sec?: number | null;
          ended_at?: string | null;
          id?: string;
          metadata?: Json | null;
          pet_id: string;
          route?: unknown;
          started_at: string;
        };
        Update: {
          activity_log_id?: string;
          avg_pace?: number | null;
          calories_est?: number | null;
          created_at?: string;
          distance_meters?: number | null;
          duration_sec?: number | null;
          ended_at?: string | null;
          id?: string;
          metadata?: Json | null;
          pet_id?: string;
          route?: unknown;
          started_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "walks_activity_log_id_fkey";
            columns: ["activity_log_id"];
            isOneToOne: true;
            referencedRelation: "activity_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "walks_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
      weight_logs: {
        Row: {
          created_at: string;
          id: string;
          logged_by: string | null;
          measured_at: string;
          notes: string | null;
          pet_id: string;
          weight_lbs: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          logged_by?: string | null;
          measured_at?: string;
          notes?: string | null;
          pet_id: string;
          weight_lbs: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          logged_by?: string | null;
          measured_at?: string;
          notes?: string | null;
          pet_id?: string;
          weight_lbs?: number;
        };
        Relationships: [
          {
            foreignKeyName: "weight_logs_logged_by_fkey";
            columns: ["logged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weight_logs_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      active_medications: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          dosage: string | null;
          end_date: string | null;
          frequency: Database["public"]["Enums"]["medication_frequency"] | null;
          frequency_custom: string | null;
          id: string | null;
          instructions: string | null;
          is_preventative: boolean | null;
          last_administered: string | null;
          metadata: Json | null;
          name: string | null;
          pet_id: string | null;
          pet_name: string | null;
          prescribed_by: string | null;
          refill_date: string | null;
          remaining_count: number | null;
          start_date: string | null;
          status: Database["public"]["Enums"]["medication_status"] | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "medications_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medications_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      can_access_pet: { Args: { p_id: string }; Returns: boolean };
      get_user_household_ids: { Args: never; Returns: string[] };
      is_household_admin: { Args: { h_id: string }; Returns: boolean };
    };
    Enums: {
      activity_type:
        | "walk"
        | "feeding"
        | "potty"
        | "medication"
        | "water"
        | "sleep"
        | "training"
        | "grooming"
        | "vet_visit"
        | "play"
        | "other";
      document_type:
        | "vet_record"
        | "lab_result"
        | "xray"
        | "vaccination_cert"
        | "insurance"
        | "adoption"
        | "registration"
        | "other";
      household_role: "owner" | "admin" | "member";
      invite_status: "pending" | "accepted" | "declined" | "expired";
      medication_frequency:
        | "once_daily"
        | "twice_daily"
        | "three_times_daily"
        | "every_other_day"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "as_needed"
        | "custom";
      medication_status: "active" | "completed" | "discontinued" | "paused";
      pet_sex: "male" | "female" | "unknown";
      pet_species: "dog" | "cat" | "other";
      potty_consistency:
        | "normal"
        | "soft"
        | "hard"
        | "liquid"
        | "bloody"
        | "mucus";
      potty_type: "pee" | "poo" | "both";
      spay_neuter_status: "spayed" | "neutered" | "intact" | "unknown";
      vaccination_status: "current" | "due_soon" | "overdue" | "not_applicable";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "walk",
        "feeding",
        "potty",
        "medication",
        "water",
        "sleep",
        "training",
        "grooming",
        "vet_visit",
        "play",
        "other",
      ],
      document_type: [
        "vet_record",
        "lab_result",
        "xray",
        "vaccination_cert",
        "insurance",
        "adoption",
        "registration",
        "other",
      ],
      household_role: ["owner", "admin", "member"],
      invite_status: ["pending", "accepted", "declined", "expired"],
      medication_frequency: [
        "once_daily",
        "twice_daily",
        "three_times_daily",
        "every_other_day",
        "weekly",
        "biweekly",
        "monthly",
        "as_needed",
        "custom",
      ],
      medication_status: ["active", "completed", "discontinued", "paused"],
      pet_sex: ["male", "female", "unknown"],
      pet_species: ["dog", "cat", "other"],
      potty_consistency: [
        "normal",
        "soft",
        "hard",
        "liquid",
        "bloody",
        "mucus",
      ],
      potty_type: ["pee", "poo", "both"],
      spay_neuter_status: ["spayed", "neutered", "intact", "unknown"],
      vaccination_status: ["current", "due_soon", "overdue", "not_applicable"],
    },
  },
} as const;
