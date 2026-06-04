// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          client_id: string
          created_at: string
          due_date: string | null
          id: string
          status: string
          tenant_id: string
          type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          status: string
          tenant_id?: string
          type: string
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'alerts_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alerts_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          birthday: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          tenant_id: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tenant_id?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clients_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      invitations: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          role?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          role?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invitations_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      message_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          tenant_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tenant_id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'message_templates_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          project_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          project_id: string
          status: string
          tenant_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          project_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string | null
          tenant_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          tenant_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          created_at: string
          date: string | null
          id: string
          photographer_id: string | null
          status: string
          tenant_id: string
          title: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string | null
          id?: string
          photographer_id?: string | null
          status: string
          tenant_id?: string
          title: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string | null
          id?: string
          photographer_id?: string | null
          status?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_photographer_id_fkey'
            columns: ['photographer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      }
      tenants: {
        Row: {
          branding: Json | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          branding?: Json | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          branding?: Json | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: never; Returns: string }
      get_user_tenant_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: alerts
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (not null, default: get_user_tenant_id())
//   client_id: uuid (not null)
//   type: text (not null)
//   status: text (not null)
//   due_date: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (not null, default: get_user_tenant_id())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   birthday: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: invitations
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (not null)
//   email: text (not null)
//   role: text (not null, default: 'member')
//   status: text (not null, default: 'pending')
//   created_at: timestamp with time zone (not null, default: now())
// Table: message_templates
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (not null, default: get_user_tenant_id())
//   title: text (not null)
//   content: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: payments
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (not null, default: get_user_tenant_id())
//   project_id: uuid (not null)
//   amount: numeric (not null)
//   status: text (not null)
//   due_date: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   tenant_id: uuid (nullable)
//   role: text (nullable)
//   full_name: text (nullable)
//   avatar_url: text (nullable)
// Table: projects
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (not null, default: get_user_tenant_id())
//   client_id: uuid (not null)
//   photographer_id: uuid (nullable)
//   title: text (not null)
//   status: text (not null)
//   date: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: tenants
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   branding: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: alerts
//   FOREIGN KEY alerts_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY alerts_pkey: PRIMARY KEY (id)
//   CHECK alerts_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'done'::text])))
//   FOREIGN KEY alerts_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clients_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: invitations
//   PRIMARY KEY invitations_pkey: PRIMARY KEY (id)
//   FOREIGN KEY invitations_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: message_templates
//   PRIMARY KEY message_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY message_templates_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: payments
//   PRIMARY KEY payments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY payments_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
//   FOREIGN KEY payments_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_role_check: CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text])))
//   FOREIGN KEY profiles_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
// Table: projects
//   FOREIGN KEY projects_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY projects_photographer_id_fkey: FOREIGN KEY (photographer_id) REFERENCES profiles(id) ON DELETE SET NULL
//   PRIMARY KEY projects_pkey: PRIMARY KEY (id)
//   FOREIGN KEY projects_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: tenants
//   PRIMARY KEY tenants_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: alerts
//   Policy "tenant_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_user_tenant_id())
//     WITH CHECK: (tenant_id = get_user_tenant_id())
// Table: clients
//   Policy "tenant_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_user_tenant_id())
//     WITH CHECK: (tenant_id = get_user_tenant_id())
// Table: invitations
//   Policy "admin_all_invitations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((tenant_id = get_user_tenant_id()) AND (get_user_role() = 'admin'::text))
//     WITH CHECK: ((tenant_id = get_user_tenant_id()) AND (get_user_role() = 'admin'::text))
// Table: message_templates
//   Policy "tenant_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_user_tenant_id())
//     WITH CHECK: (tenant_id = get_user_tenant_id())
// Table: payments
//   Policy "tenant_isolation" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_user_tenant_id())
//     WITH CHECK: (tenant_id = get_user_tenant_id())
// Table: profiles
//   Policy "Users can update their own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//   Policy "Users can view profiles in their tenant" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((tenant_id = get_user_tenant_id()) OR (id = auth.uid()))
// Table: projects
//   Policy "tenant_isolation_projects" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((tenant_id = get_user_tenant_id()) AND ((get_user_role() = 'admin'::text) OR (photographer_id = auth.uid())))
//     WITH CHECK: ((tenant_id = get_user_tenant_id()) AND ((get_user_role() = 'admin'::text) OR (photographer_id = auth.uid())))
// Table: tenants
//   Policy "Users can insert tenant" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Users can update their own tenant" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = get_user_tenant_id())
//   Policy "Users can view their own tenant" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = get_user_tenant_id())

// --- DATABASE FUNCTIONS ---
// FUNCTION get_user_role()
//   CREATE OR REPLACE FUNCTION public.get_user_role()
//    RETURNS text
//    LANGUAGE plpgsql
//    STABLE SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
//   END;
//   $function$
//
// FUNCTION get_user_tenant_id()
//   CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
//    RETURNS uuid
//    LANGUAGE plpgsql
//    STABLE SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid());
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, full_name, role)
//     VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'admin')
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//
