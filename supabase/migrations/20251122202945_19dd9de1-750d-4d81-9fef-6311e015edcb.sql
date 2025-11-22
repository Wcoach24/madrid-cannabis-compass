-- Create helper function to assign admin role to a user by email
-- This allows manual role assignment after user signup via Auth page

CREATE OR REPLACE FUNCTION public.assign_admin_role_to_user(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role (do nothing if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin role assigned to user: %', user_email;
END;
$$;

COMMENT ON FUNCTION public.assign_admin_role_to_user IS 'Helper function to assign admin role to a user by email. Usage: SELECT assign_admin_role_to_user(''admin@weedmadrid.com'');';