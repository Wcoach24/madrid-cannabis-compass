-- Add RLS policies for admin club management

-- Allow admins to insert new clubs
CREATE POLICY "Admins can insert clubs"
ON public.clubs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any club
CREATE POLICY "Admins can update clubs"
ON public.clubs
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete clubs
CREATE POLICY "Admins can delete clubs"
ON public.clubs
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view ALL clubs (including inactive)
CREATE POLICY "Admins can view all clubs"
ON public.clubs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));