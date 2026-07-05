-- Post-import cleanup for event_details text fields (run after pg_restore, before app use).
-- Aligns with DB constraints: description <= 900, directions_to_venue <= 600, caption <= 255.

-- Find offenders
SELECT id, title,
       char_length(description) AS description_len,
       char_length(directions_to_venue) AS directions_len,
       char_length(caption) AS caption_len
FROM event_details
WHERE (description IS NOT NULL AND char_length(description) > 900)
   OR (directions_to_venue IS NOT NULL AND char_length(directions_to_venue) > 600)
   OR (caption IS NOT NULL AND char_length(caption) > 255)
ORDER BY description_len DESC NULLS LAST;

-- Fix all
UPDATE event_details
SET description = LEFT(description, 900),
    updated_at = NOW()
WHERE description IS NOT NULL AND char_length(description) > 900;

UPDATE event_details
SET directions_to_venue = LEFT(directions_to_venue, 600),
    updated_at = NOW()
WHERE directions_to_venue IS NOT NULL AND char_length(directions_to_venue) > 600;

UPDATE event_details
SET caption = LEFT(caption, 255),
    updated_at = NOW()
WHERE caption IS NOT NULL AND char_length(caption) > 255;
