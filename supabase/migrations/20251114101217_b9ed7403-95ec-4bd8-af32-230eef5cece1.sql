-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy: Only admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Only admins can update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create invitation_requests table
CREATE TABLE public.invitation_requests (
    id BIGSERIAL PRIMARY KEY,
    club_slug TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    visit_date DATE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    visitor_count INTEGER NOT NULL,
    visitor_names TEXT[] NOT NULL,
    legal_age_confirmed BOOLEAN NOT NULL,
    legal_knowledge_confirmed BOOLEAN NOT NULL,
    gdpr_consent BOOLEAN NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    qr_code_url TEXT,
    rejection_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    CONSTRAINT valid_visitor_count CHECK (visitor_count > 0 AND visitor_count <= 10),
    CONSTRAINT valid_phone CHECK (phone ~* '^\+?[0-9]{9,15}$'),
    CONSTRAINT valid_language CHECK (language IN ('en', 'es'))
);

-- Use a trigger for future visit date validation (not CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_future_visit_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visit_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Visit date must be in the future';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_future_visit_date
BEFORE INSERT OR UPDATE ON public.invitation_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_future_visit_date();

-- Enable RLS on invitation_requests
ALTER TABLE public.invitation_requests ENABLE ROW LEVEL SECURITY;

-- RLS policy: Public can insert invitation requests
CREATE POLICY "Public can insert invitation requests"
ON public.invitation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS policy: Admins can view all invitation requests
CREATE POLICY "Admins can view all invitation requests"
ON public.invitation_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Admins can update invitation requests
CREATE POLICY "Admins can update invitation requests"
ON public.invitation_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX invitation_requests_status_idx ON public.invitation_requests(status);
CREATE INDEX invitation_requests_club_slug_idx ON public.invitation_requests(club_slug);
CREATE INDEX invitation_requests_visit_date_idx ON public.invitation_requests(visit_date);
CREATE INDEX invitation_requests_email_idx ON public.invitation_requests(email);
CREATE INDEX invitation_requests_created_at_idx ON public.invitation_requests(created_at);

-- Create invitation_audit_log table
CREATE TABLE public.invitation_audit_log (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT REFERENCES public.invitation_requests(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    admin_id UUID REFERENCES auth.users(id),
    admin_email TEXT,
    ip_address INET,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT valid_action CHECK (action IN ('created', 'approved', 'rejected', 'resent_email', 'expired', 'updated'))
);

-- Enable RLS on audit log
ALTER TABLE public.invitation_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy: Admins can view audit log
CREATE POLICY "Admins can view audit log"
ON public.invitation_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Admins can insert audit log entries
CREATE POLICY "Admins can insert audit log"
ON public.invitation_audit_log
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create indexes for audit log
CREATE INDEX invitation_audit_log_request_id_idx ON public.invitation_audit_log(request_id);
CREATE INDEX invitation_audit_log_timestamp_idx ON public.invitation_audit_log(timestamp);

-- Create trigger to update updated_at column
CREATE TRIGGER update_invitation_requests_updated_at
BEFORE UPDATE ON public.invitation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();