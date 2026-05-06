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
      acronis_sku_mapping: {
        Row: {
          acronis_name: string
          created_at: string
          description: string | null
          id: string
          is_billable: boolean
          sku_code: string
          unit_type: string
        }
        Insert: {
          acronis_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_billable?: boolean
          sku_code: string
          unit_type?: string
        }
        Update: {
          acronis_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_billable?: boolean
          sku_code?: string
          unit_type?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          category: string | null
          created_at: string
          event_name: string
          id: string
          label: string | null
          metadata: Json | null
          page_path: string | null
          session_id: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          event_name: string
          id?: string
          label?: string | null
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          event_name?: string
          id?: string
          label?: string | null
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      analytics_pageviews: {
        Row: {
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_hash: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          operation: string
          tenant_name: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          operation: string
          tenant_name?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          operation?: string
          tenant_name?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          assigned_to: string | null
          channel: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          deal_id: string | null
          department_id: string | null
          external_id: string | null
          id: string
          last_message_at: string | null
          lead_id: string | null
          phone: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          channel?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deal_id?: string | null
          department_id?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          phone?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          channel?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deal_id?: string | null
          department_id?: string | null
          external_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          phone?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "chat_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_departments: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          external_message_id: string | null
          id: string
          is_read: boolean
          sender_name: string | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          is_read?: boolean
          sender_name?: string | null
          sender_type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          is_read?: boolean
          sender_name?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_quick_replies: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_quick_replies_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "chat_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_rules: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          response_content: string
          response_type: string
          trigger_type: string
          trigger_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          response_content: string
          response_type?: string
          trigger_type?: string
          trigger_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          response_content?: string
          response_type?: string
          trigger_type?: string
          trigger_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      commercial_request_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          notes: string | null
          quantity: number
          request_id: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number
          request_id: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          request_id?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "commercial_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_request_notes: {
        Row: {
          author_id: string
          author_name: string | null
          content: string
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_request_notes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "commercial_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_request_tags: {
        Row: {
          created_at: string
          id: string
          request_id: string
          tag_color: string | null
          tag_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          tag_color?: string | null
          tag_name: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          tag_color?: string | null
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_request_tags_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "commercial_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_requests: {
        Row: {
          assigned_name: string | null
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          created_by: string
          customer_id: string | null
          customer_name: string
          id: string
          notes: string | null
          priority: string | null
          request_number: string
          stage_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_name?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          created_by: string
          customer_id?: string | null
          customer_name: string
          id?: string
          notes?: string | null
          priority?: string | null
          request_number: string
          stage_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_name?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string | null
          customer_name?: string
          id?: string
          notes?: string | null
          priority?: string | null
          request_number?: string
          stage_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_requests_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "kanban_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          api_key: string
          api_secret: string
          created_at: string
          datacenter_url: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          api_key: string
          api_secret: string
          created_at?: string
          datacenter_url: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          api_secret?: string
          created_at?: string
          datacenter_url?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          description: string
          id: string
          lead_id: string | null
          scheduled_at: string | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description: string
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          description?: string
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_appointments: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          deal_id: string | null
          description: string | null
          end_at: string
          id: string
          lead_id: string | null
          location: string | null
          start_at: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deal_id?: string | null
          description?: string | null
          end_at: string
          id?: string
          lead_id?: string | null
          location?: string | null
          start_at: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deal_id?: string | null
          description?: string | null
          end_at?: string
          id?: string
          lead_id?: string | null
          location?: string | null
          start_at?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_appointments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_items: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          item_name: string
          notes: string | null
          quantity: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_notes: {
        Row: {
          author_id: string
          author_name: string | null
          content: string
          created_at: string
          deal_id: string
          id: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          content: string
          created_at?: string
          deal_id: string
          id?: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          content?: string
          created_at?: string
          deal_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_tags: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          tag_color: string | null
          tag_name: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          tag_color?: string | null
          tag_name: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          tag_color?: string | null
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_tags_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          probability: number | null
          quote_id: string | null
          request_id: string | null
          stage_id: string | null
          status: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          probability?: number | null
          quote_id?: string | null
          request_id?: string | null
          stage_id?: string | null
          status?: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          probability?: number | null
          quote_id?: string | null
          request_id?: string | null
          stage_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "commercial_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          score: number | null
          source: string
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          position?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          exclude_auto_crm: boolean | null
          exclude_auto_email: boolean | null
          exclude_auto_invoice: boolean | null
          id: string
          monthly_revenue: number | null
          name: string
          nome_fantasia: string | null
          notes: string | null
          numero: string | null
          phone: string | null
          plan: string | null
          razao_social: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          exclude_auto_crm?: boolean | null
          exclude_auto_email?: boolean | null
          exclude_auto_invoice?: boolean | null
          id?: string
          monthly_revenue?: number | null
          name: string
          nome_fantasia?: string | null
          notes?: string | null
          numero?: string | null
          phone?: string | null
          plan?: string | null
          razao_social?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          exclude_auto_crm?: boolean | null
          exclude_auto_email?: boolean | null
          exclude_auto_invoice?: boolean | null
          id?: string
          monthly_revenue?: number | null
          name?: string
          nome_fantasia?: string | null
          notes?: string | null
          numero?: string | null
          phone?: string | null
          plan?: string | null
          razao_social?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_marketing_campaign_metrics: {
        Row: {
          bounce_rate: number | null
          campaign_id: string
          click_rate: number | null
          id: string
          open_rate: number | null
          total_bounced: number | null
          total_clicked: number | null
          total_complained: number | null
          total_delivered: number | null
          total_opened: number | null
          total_sent: number | null
          total_unsubscribed: number | null
          updated_at: string
        }
        Insert: {
          bounce_rate?: number | null
          campaign_id: string
          click_rate?: number | null
          id?: string
          open_rate?: number | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_complained?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
        }
        Update: {
          bounce_rate?: number | null
          campaign_id?: string
          click_rate?: number | null
          id?: string
          open_rate?: number | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_complained?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_marketing_campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "email_marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_marketing_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          list_id: string | null
          name: string
          provider: string | null
          provider_campaign_id: string | null
          reply_to: string | null
          scheduled_at: string | null
          sender_email: string | null
          sender_name: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          list_id?: string | null
          name: string
          provider?: string | null
          provider_campaign_id?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          list_id?: string | null
          name?: string
          provider?: string | null
          provider_campaign_id?: string | null
          reply_to?: string | null
          scheduled_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_marketing_campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_marketing_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_marketing_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_marketing_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_marketing_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          list_id: string
          metadata: Json | null
          name: string | null
          phone: string | null
          status: string
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          list_id: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          status?: string
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          list_id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          status?: string
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_marketing_contacts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_marketing_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      email_marketing_lists: {
        Row: {
          contact_count: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_marketing_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          html_content: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          text_content: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          text_content?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          text_content?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_commissions: {
        Row: {
          amount: number
          beneficiary: string
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          percentage: number | null
          reference_id: string | null
          reference_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          beneficiary: string
          created_at?: string
          date?: string
          description: string
          id?: string
          notes?: string | null
          percentage?: number | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          beneficiary?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          percentage?: number | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          customer_id: string | null
          date: string
          description: string
          due_date: string | null
          id: string
          notes: string | null
          payment_date: string | null
          recurrence: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category_id?: string | null
          created_at?: string
          customer_id?: string | null
          date?: string
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          recurrence?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          customer_id?: string | null
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          recurrence?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          quantity: number
          sku_id: string
          total_cost: number | null
          total_price: number | null
          unit_cost: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          quantity?: number
          sku_id: string
          total_cost?: number | null
          total_price?: number | null
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sku_id?: string
          total_cost?: number | null
          total_price?: number | null
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          margin: number | null
          period_end: string
          period_start: string
          status: string | null
          synced_at: string | null
          total_cost: number | null
          total_sale: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          margin?: number | null
          period_end: string
          period_start: string
          status?: string | null
          synced_at?: string | null
          total_cost?: number | null
          total_sale?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          margin?: number | null
          period_end?: string
          period_start?: string
          status?: string | null
          synced_at?: string | null
          total_cost?: number | null
          total_sale?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          position?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number
        }
        Relationships: []
      }
      lgpd_consent_records: {
        Row: {
          consent_type: string
          created_at: string
          details: Json | null
          granted: boolean
          id: string
          ip_address: string | null
          user_agent: string | null
          user_identifier: string
        }
        Insert: {
          consent_type?: string
          created_at?: string
          details?: Json | null
          granted?: boolean
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_identifier: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          details?: Json | null
          granted?: boolean
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_identifier?: string
        }
        Relationships: []
      }
      lgpd_data_mapping: {
        Row: {
          created_at: string
          created_by: string | null
          data_category: string
          data_subjects: string
          id: string
          is_sensitive: boolean
          legal_basis: string
          notes: string | null
          personal_data_types: string
          purpose: string
          retention_period: string
          storage_location: string
          third_parties: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_category: string
          data_subjects?: string
          id?: string
          is_sensitive?: boolean
          legal_basis: string
          notes?: string | null
          personal_data_types: string
          purpose: string
          retention_period?: string
          storage_location?: string
          third_parties?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_category?: string
          data_subjects?: string
          id?: string
          is_sensitive?: boolean
          legal_basis?: string
          notes?: string | null
          personal_data_types?: string
          purpose?: string
          retention_period?: string
          storage_location?: string
          third_parties?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lgpd_data_requests: {
        Row: {
          admin_response: string | null
          created_at: string
          description: string | null
          id: string
          protocol_number: string
          request_type: string
          requester_document: string | null
          requester_email: string
          requester_name: string
          responded_at: string | null
          responded_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description?: string | null
          id?: string
          protocol_number: string
          request_type?: string
          requester_document?: string | null
          requester_email: string
          requester_name: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string | null
          id?: string
          protocol_number?: string
          request_type?: string
          requester_document?: string | null
          requester_email?: string
          requester_name?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lgpd_incidents: {
        Row: {
          affected_count: number | null
          affected_data: string | null
          created_at: string
          description: string
          id: string
          notified_anpd: boolean
          notified_at: string | null
          reported_by: string | null
          resolution: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_count?: number | null
          affected_data?: string | null
          created_at?: string
          description: string
          id?: string
          notified_anpd?: boolean
          notified_at?: string | null
          reported_by?: string | null
          resolution?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_count?: number | null
          affected_data?: string | null
          created_at?: string
          description?: string
          id?: string
          notified_anpd?: boolean
          notified_at?: string | null
          reported_by?: string | null
          resolution?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ombudsman_reports: {
        Row: {
          admin_response: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          protocol_number: string
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          protocol_number: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          type?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          protocol_number?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_table_items: {
        Row: {
          category: string
          created_at: string
          currency: string
          id: string
          item_name: string
          price_table_id: string
          sku_code: string
          unit_value: number
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string
          id?: string
          item_name: string
          price_table_id: string
          sku_code?: string
          unit_value?: number
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          id?: string
          item_name?: string
          price_table_id?: string
          sku_code?: string
          unit_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_table_items_price_table_id_fkey"
            columns: ["price_table_id"]
            isOneToOne: false
            referencedRelation: "price_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      price_tables: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          total_value: number | null
          type: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          total_value?: number | null
          type?: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          total_value?: number | null
          type?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by_name: string | null
          created_by_user_id: string | null
          full_name: string | null
          id: string
          is_active: boolean
          job_title: string | null
          last_login_at: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by_name?: string | null
          created_by_user_id?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by_name?: string | null
          created_by_user_id?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          item_number: number
          markup_info: string | null
          quantity: number
          quote_id: string
          service_name: string
          total_price: number
          unit_price: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          item_number?: number
          markup_info?: string | null
          quantity?: number
          quote_id: string
          service_name: string
          total_price?: number
          unit_price?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          item_number?: number
          markup_info?: string | null
          quantity?: number
          quote_id?: string
          service_name?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          contact_department: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          customer_name: string
          id: string
          introduction_text: string | null
          notes: string | null
          payment_terms: string | null
          quote_number: string
          signed_by_name: string | null
          signed_by_title: string | null
          status: string
          total_value: number | null
          updated_at: string
          validity_days: number | null
        }
        Insert: {
          contact_department?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name: string
          id?: string
          introduction_text?: string | null
          notes?: string | null
          payment_terms?: string | null
          quote_number: string
          signed_by_name?: string | null
          signed_by_title?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          validity_days?: number | null
        }
        Update: {
          contact_department?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string
          id?: string
          introduction_text?: string | null
          notes?: string | null
          payment_terms?: string | null
          quote_number?: string
          signed_by_name?: string | null
          signed_by_title?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permission_presets: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string
          id: string
          module: string
          role_name: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          module: string
          role_name: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          module?: string
          role_name?: string
        }
        Relationships: []
      }
      skus: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          markup_percent: number | null
          name: string
          sale_price: number | null
          unit_cost: number | null
          unit_type: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          markup_percent?: number | null
          name: string
          sale_price?: number | null
          unit_cost?: number | null
          unit_type?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          markup_percent?: number | null
          name?: string
          sale_price?: number | null
          unit_cost?: number | null
          unit_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sms_marketing_campaign_metrics: {
        Row: {
          campaign_id: string
          delivery_rate: number | null
          id: string
          reply_rate: number | null
          total_delivered: number | null
          total_failed: number | null
          total_replied: number | null
          total_sent: number | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          delivery_rate?: number | null
          id?: string
          reply_rate?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_replied?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          delivery_rate?: number | null
          id?: string
          reply_rate?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_replied?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_marketing_campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "sms_marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_marketing_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          message: string
          name: string
          provider: string | null
          provider_campaign_id: string | null
          scheduled_at: string | null
          sender_number: string | null
          sent_at: string | null
          status: string
          target_tags: string[] | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          name: string
          provider?: string | null
          provider_campaign_id?: string | null
          scheduled_at?: string | null
          sender_number?: string | null
          sent_at?: string | null
          status?: string
          target_tags?: string[] | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          name?: string
          provider?: string | null
          provider_campaign_id?: string | null
          scheduled_at?: string | null
          sender_number?: string | null
          sent_at?: string | null
          status?: string
          target_tags?: string[] | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_marketing_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_marketing_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_marketing_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          name: string | null
          opted_in_at: string | null
          opted_out_at: string | null
          phone: string
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          opted_in_at?: string | null
          opted_out_at?: string | null
          phone: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          opted_in_at?: string | null
          opted_out_at?: string | null
          phone?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      sms_marketing_templates: {
        Row: {
          category: string | null
          char_count: number | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          char_count?: number | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          char_count?: number | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_schedule_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          notes: string | null
          operator_id: string
          operator_name: string
          reserved_by_email: string | null
          reserved_by_name: string | null
          slot_date: string
          start_time: string
          status: string
          trial_client_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          operator_id: string
          operator_name: string
          reserved_by_email?: string | null
          reserved_by_name?: string | null
          slot_date: string
          start_time: string
          status?: string
          trial_client_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          operator_id?: string
          operator_name?: string
          reserved_by_email?: string | null
          reserved_by_name?: string | null
          slot_date?: string
          start_time?: string
          status?: string
          trial_client_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_schedule_slots_trial_client_id_fkey"
            columns: ["trial_client_id"]
            isOneToOne: false
            referencedRelation: "trial_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      support_slot_reservations: {
        Row: {
          created_at: string
          id: string
          reserved_by_email: string
          reserved_by_name: string
          reserved_by_phone: string | null
          reserved_hour: string
          slot_id: string
          status: string
          trial_client_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reserved_by_email: string
          reserved_by_name: string
          reserved_by_phone?: string | null
          reserved_hour: string
          slot_id: string
          status?: string
          trial_client_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reserved_by_email?: string
          reserved_by_name?: string
          reserved_by_phone?: string | null
          reserved_hour?: string
          slot_id?: string
          status?: string
          trial_client_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_slot_reservations_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "support_schedule_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_slot_reservations_trial_client_id_fkey"
            columns: ["trial_client_id"]
            isOneToOne: false
            referencedRelation: "trial_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_usage: {
        Row: {
          connection_id: string | null
          created_at: string
          id: string
          quantity: number
          sku_code: string
          sku_name: string
          tenant_id: string
          total_cost: number
          total_price: number
          unit_cost: number
          unit_price: number
          updated_at: string
          usage_date: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          id?: string
          quantity?: number
          sku_code: string
          sku_name?: string
          tenant_id: string
          total_cost?: number
          total_price?: number
          unit_cost?: number
          unit_price?: number
          updated_at?: string
          usage_date?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          id?: string
          quantity?: number
          sku_code?: string
          sku_name?: string
          tenant_id?: string
          total_cost?: number
          total_price?: number
          unit_cost?: number
          unit_price?: number
          updated_at?: string
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_usage_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_usage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          connection_id: string | null
          created_at: string
          customer_id: string | null
          external_id: string | null
          id: string
          name: string
          notes: string | null
          sale_table_id: string | null
          status: string
          trial_end_date: string | null
          trial_notified: boolean | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          customer_id?: string | null
          external_id?: string | null
          id?: string
          name: string
          notes?: string | null
          sale_table_id?: string | null
          status?: string
          trial_end_date?: string | null
          trial_notified?: boolean | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          customer_id?: string | null
          external_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          sale_table_id?: string | null
          status?: string
          trial_end_date?: string | null
          trial_notified?: boolean | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_sale_table_id_fkey"
            columns: ["sale_table_id"]
            isOneToOne: false
            referencedRelation: "price_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          created_at: string
          created_by: string
          customer_id: string | null
          description: string | null
          id: string
          priority: string
          status: string
          subject: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by: string
          customer_id?: string | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_clients: {
        Row: {
          available_date: string | null
          available_time: string | null
          commercial_notes: string | null
          converted_at: string | null
          cpf_cnpj: string | null
          created_at: string
          customer_id: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string
          status: string
          support_option: string
          technical_notes: string | null
          tenant_id: string | null
          ticket_id: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          available_date?: string | null
          available_time?: string | null
          commercial_notes?: string | null
          converted_at?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          customer_id?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone: string
          status?: string
          support_option?: string
          technical_notes?: string | null
          tenant_id?: string | null
          ticket_id?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          available_date?: string | null
          available_time?: string | null
          commercial_notes?: string | null
          converted_at?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: string
          support_option?: string
          technical_notes?: string | null
          tenant_id?: string | null
          ticket_id?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_clients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_clients_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          created_at: string
          created_by: string | null
          evolution_instance_id: string | null
          id: string
          instance_name: string
          phone_number: string | null
          qr_code_data: string | null
          session_data: Json | null
          session_status: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          evolution_instance_id?: string | null
          id?: string
          instance_name: string
          phone_number?: string | null
          qr_code_data?: string | null
          session_data?: Json | null
          session_status?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          evolution_instance_id?: string | null
          id?: string
          instance_name?: string
          phone_number?: string | null
          qr_code_data?: string | null
          session_data?: Json | null
          session_status?: string | null
          status?: string
          updated_at?: string
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
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "viewer"
        | "client"
        | "operador"
        | "supervisor"
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
      app_role: [
        "admin",
        "manager",
        "viewer",
        "client",
        "operador",
        "supervisor",
      ],
    },
  },
} as const
