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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          main_account: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          main_account: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          main_account?: string
          created_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          id: string
          profile_id: string
          group_id: string
          role: Database["public"]["Enums"]["group_role"]
          joined_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          group_id: string
          role?: Database["public"]["Enums"]["group_role"]
          joined_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          group_id?: string
          role?: Database["public"]["Enums"]["group_role"]
          joined_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          profile_id: string
          group_id: string
          status: Database["public"]["Enums"]["application_status"]
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          group_id: string
          status?: Database["public"]["Enums"]["application_status"]
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          group_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          created_at?: string
        }
        Relationships: []
      }
      group_notices: {
        Row: {
          id: string
          group_id: string
          profile_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          profile_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          profile_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      group_logs: {
        Row: {
          id: string
          group_id: string
          action: Database["public"]["Enums"]["log_action"]
          target_id: string
          target_name: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          action: Database["public"]["Enums"]["log_action"]
          target_id: string
          target_name: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          action?: Database["public"]["Enums"]["log_action"]
          target_id?: string
          target_name?: string
          actor_id?: string | null
          actor_name?: string | null
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
      group_role: "CREATOR" | "OFFICIAL" | "MEMBER"
      application_status: "PENDING" | "ACCEPTED" | "REJECTED"
      log_action: "APPLIED" | "ACCEPTED" | "REJECTED" | "REMOVED" | "LEFT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
