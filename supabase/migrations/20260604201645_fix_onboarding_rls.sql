DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed initial user acciolykaryna@gmail.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'acciolykaryna@gmail.com') THEN
    new_user_id := gen_random_uuid();
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Karyna Accioly"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;
END $$;

-- 1. Ensure tenants can be inserted by authenticated users
DROP POLICY IF EXISTS "Users can insert tenant" ON public.tenants;
CREATE POLICY "Users can insert tenant" ON public.tenants
  FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Ensure profiles can be updated by their owner
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Ensure profiles can be read by their owner or within same tenant
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR tenant_id = public.get_user_tenant_id());

-- 4. Ensure invitations can be inserted by tenant admin
DROP POLICY IF EXISTS "admin_all_invitations" ON public.invitations;
CREATE POLICY "admin_all_invitations" ON public.invitations
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id() AND public.get_user_role() = 'admin')
  WITH CHECK (tenant_id = public.get_user_tenant_id() AND public.get_user_role() = 'admin');
