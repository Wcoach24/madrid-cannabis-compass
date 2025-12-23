CREATE OR REPLACE FUNCTION public.validate_future_visit_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only validate visit_date on INSERT
  -- Or on UPDATE when visit_date is being changed to a new value
  IF TG_OP = 'INSERT' THEN
    IF NEW.visit_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Visit date must be in the future';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only check if visit_date is being modified
    IF NEW.visit_date IS DISTINCT FROM OLD.visit_date THEN
      IF NEW.visit_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Visit date must be in the future';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;