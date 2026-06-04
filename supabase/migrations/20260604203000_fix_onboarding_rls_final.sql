DO $$
BEGIN
  -- Tenants: Ensure authenticated users can INSERT records
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tenants;
  CREATE POLICY "Enable insert for authenticated users only" ON public.tenants
    FOR INSERT TO authenticated WITH CHECK (true);
    
  -- Fix for the RETURNING clause violating RLS on INSERT:
  -- Allow authenticated users to view tenants, so insert().select().single() works
  -- (Since the user does not have a tenant_id in their profile yet, they couldn't read the new tenant back)
  DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.tenants;
  CREATE POLICY "Enable read for authenticated users" ON public.tenants
    FOR SELECT TO authenticated USING (true);

  -- Profiles: Ensure users can update their own profile during onboarding
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

  -- Invitations: Allow authenticated admins to INSERT new invitations for their tenant
  DROP POLICY IF EXISTS "Admins can insert invitations" ON public.invitations;
  CREATE POLICY "Admins can insert invitations" ON public.invitations
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = public.get_user_tenant_id() AND public.get_user_role() = 'admin');

END $$;
