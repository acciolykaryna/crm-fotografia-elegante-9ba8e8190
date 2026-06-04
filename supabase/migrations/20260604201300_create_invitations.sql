CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_invitations" ON public.invitations;
CREATE POLICY "admin_all_invitations" ON public.invitations
    FOR ALL
    TO authenticated
    USING (
      tenant_id = public.get_user_tenant_id() 
      AND public.get_user_role() = 'admin'
    )
    WITH CHECK (
      tenant_id = public.get_user_tenant_id() 
      AND public.get_user_role() = 'admin'
    );
