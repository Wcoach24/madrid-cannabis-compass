-- Add RLS policies for admin access to articles table

-- Admins can view all articles (including drafts)
CREATE POLICY "Admins can view all articles"
ON public.articles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update articles
CREATE POLICY "Admins can update articles"
ON public.articles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete articles
CREATE POLICY "Admins can delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));