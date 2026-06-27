-- Optional SQL backfill for MOSC static albums (manifest-derived values).
-- Prefer Node script: npm run gallery:backfill-event-dates
-- Replace :tenant_id with your tenant (e.g. tenant_demo_002).

-- dharma-dhamma-conference — October 24-26, 2015, Indore
UPDATE public.gallery_album
SET event_date_start = DATE '2015-10-24',
    event_date_end = DATE '2015-10-26',
    event_location = 'Indore',
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=dharma-dhamma-conference%';

-- website-inauguration — November 25, 2015
UPDATE public.gallery_album
SET event_date_start = DATE '2015-11-25',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=website-inauguration%';

-- private-audience-tikon-devalokam — November 25, 2015
UPDATE public.gallery_album
SET event_date_start = DATE '2015-11-25',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=private-audience-tikon-devalokam%';

-- canberra-visit — November 17, 2015
UPDATE public.gallery_album
SET event_date_start = DATE '2015-11-17',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=canberra-visit%';

-- blessing-holy-myron — July 19, 2015, Beirut
UPDATE public.gallery_album
SET event_date_start = DATE '2015-07-19',
    event_date_end = NULL,
    event_location = 'Beirut',
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=blessing-holy-myron%';

-- armenian-genocide-100th — July 18, 2015, Beirut
UPDATE public.gallery_album
SET event_date_start = DATE '2015-07-18',
    event_date_end = NULL,
    event_location = 'Beirut',
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=armenian-genocide-100th%';

-- private-audience-aram — July 17, 2015
UPDATE public.gallery_album
SET event_date_start = DATE '2015-07-17',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=private-audience-aram%';

-- vienna-fraternity — September 3, 2013
UPDATE public.gallery_album
SET event_date_start = DATE '2013-09-03',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2013,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=vienna-fraternity%';

-- ethiopian-visit — February 28, 2013
UPDATE public.gallery_album
SET event_date_start = DATE '2013-02-28',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2013,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=ethiopian-visit%';

-- rome-visit — September 5, 2013
UPDATE public.gallery_album
SET event_date_start = DATE '2013-09-05',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2013,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=rome-visit%';

-- armenian-genocide-canonization — April 23, 2015
UPDATE public.gallery_album
SET event_date_start = DATE '2015-04-23',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=armenian-genocide-canonization%';

-- armenian-president — April 23, 2015
UPDATE public.gallery_album
SET event_date_start = DATE '2015-04-23',
    event_date_end = NULL,
    event_location = NULL,
    album_year = 2015,
    updated_at = now()
WHERE tenant_id = :tenant_id
  AND description LIKE '%static_slug=armenian-president%';

-- Year-only albums: leave event_date_* null; album_year already set by prior backfill.
-- (russia-visit, vatican-visit, etc. — no UPDATE needed if album_year present)
