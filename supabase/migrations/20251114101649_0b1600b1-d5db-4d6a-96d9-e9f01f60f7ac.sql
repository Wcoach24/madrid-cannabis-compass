-- Fix search_path for validate_future_visit_date function
CREATE OR REPLACE FUNCTION public.validate_future_visit_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.visit_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Visit date must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;