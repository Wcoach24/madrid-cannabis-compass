-- Allow public inserts to articles table for content generation
-- This enables the generate-articles admin page to work
-- In production, you should add authentication and restrict this to admin users only

CREATE POLICY "Allow public inserts to articles"
ON public.articles
FOR INSERT
TO public
WITH CHECK (true);

-- Note: For production security, you should:
-- 1. Add authentication to the /generate-articles page
-- 2. Update this policy to: WITH CHECK (auth.uid() = '<admin_user_id>')
-- 3. Or create a service role approach for admin operations