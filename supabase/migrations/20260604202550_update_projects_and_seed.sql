-- Add new columns to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'Família';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS total_value NUMERIC NOT NULL DEFAULT 0;

-- Seed user and data
DO $$
DECLARE
  new_user_id uuid;
  new_tenant_id uuid;
  client_1_id uuid;
  client_2_id uuid;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'acciolykaryna@gmail.com') THEN
    new_user_id := gen_random_uuid();
    new_tenant_id := gen_random_uuid();
    client_1_id := gen_random_uuid();
    client_2_id := gen_random_uuid();
    
    -- Create tenant first
    INSERT INTO public.tenants (id, name) VALUES (new_tenant_id, 'Estúdio Karyna') ON CONFLICT DO NOTHING;

    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'acciolykaryna@gmail.com',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Karyna Accioly"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    -- Update or Insert profile
    INSERT INTO public.profiles (id, tenant_id, role, full_name)
    VALUES (new_user_id, new_tenant_id, 'admin', 'Karyna Accioly')
    ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, role = EXCLUDED.role, full_name = EXCLUDED.full_name;

    -- Seed clients
    INSERT INTO public.clients (id, tenant_id, name, email, phone) VALUES 
      (client_1_id, new_tenant_id, 'Maria Clara (Cliente Teste)', 'maria@example.com', '11999999999'),
      (client_2_id, new_tenant_id, 'João Paulo (Cliente Teste)', 'joao@example.com', '11988888888')
    ON CONFLICT DO NOTHING;
    
    -- Seed a project
    INSERT INTO public.projects (id, tenant_id, client_id, photographer_id, title, status, date, type, total_value) 
    VALUES (
      gen_random_uuid(), 
      new_tenant_id, 
      client_1_id,
      new_user_id,
      'Ensaio Gestante Maria',
      'Contratado',
      NOW() + interval '5 days',
      'Gestante',
      2500
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;
