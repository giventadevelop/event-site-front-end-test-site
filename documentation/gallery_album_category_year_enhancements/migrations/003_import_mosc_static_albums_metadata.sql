-- =============================================
-- Import: MOSC static gallery album metadata (M4 — optional)
-- Source: src/app/mosc-redesign/(syro)/gallery/page.tsx (albums array)
-- Run after: 002_seed_gallery_category.sql
--
-- v1.0 scope: album metadata only (title, cover, year, category).
-- Media rows (event_media) are attached separately via admin UI or a future script.
--
-- Usage (psql):
--   \set tenant_id 'tenant_demo_002'
--   \i 003_import_mosc_static_albums_metadata.sql
-- =============================================

INSERT INTO public.gallery_album (
    tenant_id,
    title,
    description,
    cover_image_url,
    is_public,
    display_order,
    gallery_category_id,
    album_year,
    created_at,
    updated_at
)
SELECT
    :tenant_id,
    v.title,
    'static_slug=' || v.static_slug,
    v.cover_image_url,
    true,
    v.display_order,
    gc.id,
    v.album_year,
    now(),
    now()
FROM (
    VALUES
        ('russia-visit', 'Russia visit of H.H Baselios Marthoma Mathews III', '/images/mosc/gallery/russia-visit/cross-200x300.jpg', 2019, 'ecumenical-visits', 10),
        ('vatican-visit', 'VATICAN VISIT OF HIS HOLINESS', '/images/mosc/gallery/vatican-visit/00186_11092023-1024x683.jpg', 2023, 'ecumenical-visits', 20),
        ('enthronement-mathews-iii', 'ENTHRONEMENT CEREMONY OF HIS HOLINESS BASELIOS MARTHOMA MATHEWS III', '/images/mosc/gallery/enthronement-mathews-iii/C24-768x1105.jpg', 2021, 'major-events', 30),
        ('reception-mathews-iii', 'RECEPTION TO HIS HOLINESS BASELIOS MARTHOMA MATHEWS III', '/images/mosc/gallery/reception-mathews-iii/R15-2.jpg', 2021, 'receptions', 40),
        ('paulose-ii-with-kiril', 'H.H Baselios Marthoma Paulose II With Kiril Patriarch', '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0042-200x300.jpg', 2019, 'ecumenical-visits', 50),
        ('st-matrona-relics', 'His Holiness the Catholicos paying his respects at the relics of St. Matrona of Moscow', '/images/mosc/gallery/st-matrona-relics/IMG-20190916-WA0017.jpg', 2019, 'liturgical-events', 60),
        ('st-cyril-methodius', 'Official reception at the main Chapel of St. Cyril and Methodius Institute of Post-Graduate Studies', '/images/mosc/gallery/st-cyril-methodius/IMG-20190916-WA0018-1024x682.jpg', 2019, 'receptions', 70),
        ('metropolitan-hilarion', 'Metropolitan Hilarion receiving His Holiness to St. Cyril and Methodius Institute of Post-Graduate Studies', '/images/mosc/gallery/metropolitan-hilarion/IMG-20190916-WA0025.jpg', 2019, 'ecumenical-visits', 80),
        ('pokrovsky-monastery', 'The great shepherd of Malankara, prayerfully in Pokrovsky Monastery Chapel', '/images/mosc/gallery/pokrovsky-monastery/IMG-20190916-WA0088-200x300.jpg', 2019, 'liturgical-events', 90),
        ('mother-feofania', 'Mother Feofania and the little flowers of the Convent where St. Matrona is interred', '/images/mosc/gallery/mother-feofania/IMG-20190916-WA0036-300x200.jpg', 2019, 'special-events', 100),
        ('ceremonial-reception-russian-orthodox', 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church', '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0023-300x200.jpg', 2019, 'ecumenical-visits', 110),
        ('offering-incense-st-thomas', 'Offering incense at the Relics of St.Thomas (Devalokam Aramana)', '/images/mosc/gallery/offering-incense-st-thomas/IMG_9820-1-300x200.jpg', 2016, 'liturgical-events', 120),
        ('order-st-thomas-abune-mathias', 'Order of St.Thomas to His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church', '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2774-300x200.jpg', 2016, 'major-events', 130),
        ('visit-abune-mathias', 'Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church', '/images/mosc/gallery/visit-abune-mathias/MG_2509-300x184.jpg', 2016, 'ecumenical-visits', 140),
        ('reception-tikon-puthupally', 'Reception to H.B.Tikon at Puthupally Church', '/images/mosc/gallery/reception-tikon-puthupally/IMG_9166-150x150.jpg', 2015, 'receptions', 150),
        ('website-inauguration', 'Official Website Inauguration, Devalokam Aramana', '/images/mosc/gallery/website-inauguration/IMG_9248-300x169.jpg', 2015, 'special-events', 160),
        ('private-audience-tikon-devalokam', 'Private Audience with H.B.Tikon at Devalokam Aramana', '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9167-1024x575.jpg', 2015, 'private-audiences', 170),
        ('canberra-visit', 'H.H Visit to Canberra', '/images/mosc/gallery/canberra-visit/IMG_3553.jpg', 2015, 'church-visits', 180),
        ('dharma-dhamma-conference', '3rd International Dharma-Dhamma Conference', '/images/mosc/gallery/dharma-dhamma-conference/IMG_1234.jpg', 2015, 'conferences', 190),
        ('vienna-fraternity', 'The Fraternity at Vienna', '/images/mosc/gallery/vienna-fraternity/IMG_3898-1024x683.jpg', 2013, 'special-events', 200),
        ('armenian-genocide-canonization', 'Service of Canonization of the Victims of Armenian Genocide', '/images/mosc/gallery/armenian-genocide-canonization/IMG_3553-1024x683.jpg', 2015, 'special-events', 210),
        ('armenian-president', 'His Holiness with Armenian President', '/images/mosc/gallery/armenian-president/IMG_3660-300x200.jpg', 2015, 'special-events', 220),
        ('private-audience-karekin', 'Private Audience with Karekin I Supreme Patriarch and Catholicos of All Armenians', '/images/mosc/gallery/private-audience-karekin/IMG_3229-1024x683.jpg', 2015, 'private-audiences', 230),
        ('enthronement-coptic-pope', 'Enthronement ceremony of the new Coptic Pope', '/images/mosc/gallery/enthronement-coptic-pope/et.jpg', 2012, 'ecumenical-visits', 240),
        ('blessing-holy-myron', 'Blessing of Holy Myron', '/images/mosc/gallery/blessing-holy-myron/Picture-052-680x1024.jpg', 2015, 'liturgical-events', 250),
        ('private-audience-aram', 'Private audience with HH Aram', '/images/mosc/gallery/private-audience-aram/IMG_0902-150x150.jpg', 2015, 'private-audiences', 260),
        ('armenian-genocide-100th', '100th anniversary of the Armenian Genocide', '/images/mosc/gallery/armenian-genocide-100th/dharma-dhama-300x220.jpg', 2015, 'special-events', 270),
        ('ethiopian-visit', 'Ethiopian Visit of His Holiness', '/images/mosc/gallery/ethiopian-visit/IMG_3745.jpg', 2013, 'ecumenical-visits', 280),
        ('rome-visit', 'Vatican Visit of His Holiness', '/images/mosc/gallery/rome-visit/IMG_3909-1024x683.jpg', 2013, 'ecumenical-visits', 290)
) AS v(static_slug, title, cover_image_url, album_year, category_slug, display_order)
JOIN public.gallery_category gc
    ON gc.tenant_id = :tenant_id
   AND gc.slug = v.category_slug
WHERE NOT EXISTS (
    SELECT 1
    FROM public.gallery_album ga
    WHERE ga.tenant_id = :tenant_id
      AND ga.title = v.title
);
