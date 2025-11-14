-- Add sample opening hours data to existing clubs for testing

-- Update Vallehermoso Club (open every day, typical hours)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "10:00", "close": "22:00", "closed": false},
  "tuesday": {"open": "10:00", "close": "22:00", "closed": false},
  "wednesday": {"open": "10:00", "close": "22:00", "closed": false},
  "thursday": {"open": "10:00", "close": "22:00", "closed": false},
  "friday": {"open": "10:00", "close": "23:00", "closed": false},
  "saturday": {"open": "11:00", "close": "23:00", "closed": false},
  "sunday": {"open": "11:00", "close": "21:00", "closed": false},
  "notes": {"en": "Extended hours on weekends", "es": "Horario extendido los fines de semana"}
}'::jsonb
WHERE slug = 'vallehermoso-club-social-madrid';

-- Update La Latina (closed Mondays)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "00:00", "close": "00:00", "closed": true},
  "tuesday": {"open": "12:00", "close": "22:00", "closed": false},
  "wednesday": {"open": "12:00", "close": "22:00", "closed": false},
  "thursday": {"open": "12:00", "close": "22:00", "closed": false},
  "friday": {"open": "12:00", "close": "00:00", "closed": false},
  "saturday": {"open": "12:00", "close": "00:00", "closed": false},
  "sunday": {"open": "12:00", "close": "22:00", "closed": false},
  "notes": {"en": "Closed on Mondays", "es": "Cerrado los lunes"}
}'::jsonb
WHERE slug = 'la-latina-social-club';

-- Update Chamberí Green House (early opening)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "09:00", "close": "21:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "21:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "21:00", "closed": false},
  "thursday": {"open": "09:00", "close": "21:00", "closed": false},
  "friday": {"open": "09:00", "close": "22:00", "closed": false},
  "saturday": {"open": "10:00", "close": "22:00", "closed": false},
  "sunday": {"open": "10:00", "close": "20:00", "closed": false}
}'::jsonb
WHERE slug = 'chamberi-green-house';

-- Update Retiro Botánico (closed Sundays)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "11:00", "close": "21:00", "closed": false},
  "tuesday": {"open": "11:00", "close": "21:00", "closed": false},
  "wednesday": {"open": "11:00", "close": "21:00", "closed": false},
  "thursday": {"open": "11:00", "close": "21:00", "closed": false},
  "friday": {"open": "11:00", "close": "23:00", "closed": false},
  "saturday": {"open": "11:00", "close": "23:00", "closed": false},
  "sunday": {"open": "00:00", "close": "00:00", "closed": true},
  "notes": {"en": "Closed on Sundays for maintenance", "es": "Cerrado los domingos por mantenimiento"}
}'::jsonb
WHERE slug = 'retiro-botanico-club';

-- Update Malasaña (late night hours)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "14:00", "close": "02:00", "closed": false},
  "tuesday": {"open": "14:00", "close": "02:00", "closed": false},
  "wednesday": {"open": "14:00", "close": "02:00", "closed": false},
  "thursday": {"open": "14:00", "close": "03:00", "closed": false},
  "friday": {"open": "14:00", "close": "03:00", "closed": false},
  "saturday": {"open": "14:00", "close": "03:00", "closed": false},
  "sunday": {"open": "14:00", "close": "00:00", "closed": false},
  "notes": {"en": "Late night hours on weekends", "es": "Horario nocturno los fines de semana"}
}'::jsonb
WHERE slug = 'malasana-private-club';

-- Update Norte Verde (closed Mon-Tue)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "00:00", "close": "00:00", "closed": true},
  "tuesday": {"open": "00:00", "close": "00:00", "closed": true},
  "wednesday": {"open": "13:00", "close": "22:00", "closed": false},
  "thursday": {"open": "13:00", "close": "22:00", "closed": false},
  "friday": {"open": "13:00", "close": "23:00", "closed": false},
  "saturday": {"open": "12:00", "close": "23:00", "closed": false},
  "sunday": {"open": "12:00", "close": "21:00", "closed": false},
  "notes": {"en": "Closed Mondays and Tuesdays", "es": "Cerrado lunes y martes"}
}'::jsonb
WHERE slug = 'norte-verde-association';

-- Update Lavapiés (standard hours)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "11:00", "close": "22:00", "closed": false},
  "tuesday": {"open": "11:00", "close": "22:00", "closed": false},
  "wednesday": {"open": "11:00", "close": "22:00", "closed": false},
  "thursday": {"open": "11:00", "close": "22:00", "closed": false},
  "friday": {"open": "11:00", "close": "23:00", "closed": false},
  "saturday": {"open": "11:00", "close": "23:00", "closed": false},
  "sunday": {"open": "12:00", "close": "21:00", "closed": false}
}'::jsonb
WHERE slug = 'lavapies-social-collective';

-- Update Chamberí Wellness (wellness hours)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "10:00", "close": "20:00", "closed": false},
  "tuesday": {"open": "10:00", "close": "20:00", "closed": false},
  "wednesday": {"open": "10:00", "close": "20:00", "closed": false},
  "thursday": {"open": "10:00", "close": "20:00", "closed": false},
  "friday": {"open": "10:00", "close": "21:00", "closed": false},
  "saturday": {"open": "11:00", "close": "21:00", "closed": false},
  "sunday": {"open": "11:00", "close": "19:00", "closed": false},
  "notes": {"en": "Wellness-focused hours", "es": "Horario enfocado en bienestar"}
}'::jsonb
WHERE slug = 'chamberi-wellness-association';

-- Update Atocha (afternoon/evening only)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "15:00", "close": "23:00", "closed": false},
  "tuesday": {"open": "15:00", "close": "23:00", "closed": false},
  "wednesday": {"open": "15:00", "close": "23:00", "closed": false},
  "thursday": {"open": "15:00", "close": "00:00", "closed": false},
  "friday": {"open": "15:00", "close": "00:00", "closed": false},
  "saturday": {"open": "15:00", "close": "00:00", "closed": false},
  "sunday": {"open": "15:00", "close": "22:00", "closed": false},
  "notes": {"en": "Afternoon and evening service only", "es": "Solo servicio de tarde y noche"}
}'::jsonb
WHERE slug = 'atocha-leaf-society';

-- Update Gran Vía (central location, long hours)
UPDATE clubs 
SET timetable = '{
  "monday": {"open": "09:00", "close": "23:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "23:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "23:00", "closed": false},
  "thursday": {"open": "09:00", "close": "23:00", "closed": false},
  "friday": {"open": "09:00", "close": "01:00", "closed": false},
  "saturday": {"open": "10:00", "close": "01:00", "closed": false},
  "sunday": {"open": "10:00", "close": "22:00", "closed": false},
  "notes": {"en": "Central location with extended hours", "es": "Ubicación céntrica con horario extendido"}
}'::jsonb
WHERE slug = 'gran-via-green-circle';