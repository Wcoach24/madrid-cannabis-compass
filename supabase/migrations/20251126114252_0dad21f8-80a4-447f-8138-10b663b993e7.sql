-- Remove the dangerous public INSERT policy
DROP POLICY "Allow public inserts to articles" ON articles;

-- Create admin-only INSERT policy
CREATE POLICY "Admins can insert articles" 
ON articles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));