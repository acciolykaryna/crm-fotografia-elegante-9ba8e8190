DO $$
DECLARE
  new_user_id uuid;
  new_tenant_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'acciolykaryna@gmail.com') THEN
    new_user_id := gen_random_uuid();
    new_tenant_id := gen_random_uuid();

    -- Create a tenant for the user so they can bypass onboarding
    INSERT INTO public.tenants (id, name, created_at)
    VALUES (new_tenant_id, 'Fotografia Elegante', NOW())
    ON CONFLICT (id) DO NOTHING;

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
      '',    -- confirmation_token
      '',    -- recovery_token
      '',    -- email_change_token_new
      '',    -- email_change
      '',    -- email_change_token_current
      NULL,  -- phone
      '',    -- phone_change
      '',    -- phone_change_token
      ''     -- reauthentication_token
    );

    -- Insert into public.profiles (handles potential trigger auto-creation)
    INSERT INTO public.profiles (id, full_name, role, tenant_id)
    VALUES (new_user_id, 'Karyna Accioly', 'admin', new_tenant_id)
    ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, full_name = EXCLUDED.full_name;
  END IF;
END $$;
