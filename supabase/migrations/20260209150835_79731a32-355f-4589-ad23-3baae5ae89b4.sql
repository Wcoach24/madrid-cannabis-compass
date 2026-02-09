ALTER TABLE invitation_requests 
ADD COLUMN visitor_first_names text[] DEFAULT NULL,
ADD COLUMN visitor_last_names text[] DEFAULT NULL;