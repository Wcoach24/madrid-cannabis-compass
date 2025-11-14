-- Add timetable JSONB column to clubs table
ALTER TABLE public.clubs 
ADD COLUMN timetable JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN public.clubs.timetable IS 'Opening hours in JSON format: {
  "monday": {"open": "09:00", "close": "22:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
  ...
  "notes": {"en": "Special hours on holidays", "es": "Horario especial en festivos"}
}';

-- Create index for better query performance
CREATE INDEX idx_clubs_timetable ON public.clubs USING GIN (timetable);