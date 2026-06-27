export interface InstitutionHubCategory {
  slug: string;
  title: string;
  fallbackDescription: string;
  fallbackImage: string;
  order: number;
}

/** Hub category cards — mirrors static /mosc-redesign/institutions hub metadata. */
export const INSTITUTION_HUB_CATEGORIES: InstitutionHubCategory[] = [
  {
    slug: 'major-centres',
    title: 'Major Centres',
    fallbackDescription:
      'DEVALOKAM CATHOLICATE PALACE - Devalokam Aramana is the official residence of the Catholicos of the East and Malankara Metropolitan. The administrative headquarters of the Church also functions within the same...',
    fallbackImage: '/images/institutions/ca.jpg',
    order: 0,
  },
  {
    slug: 'monasteries',
    title: 'Monasteries',
    fallbackDescription:
      "Mount Tabore Dayara, Pathanapuram - 689 695 Ph: 0475 2352231 2352475, Bethlehem Asram, Chengamanad, Kottarakara Ph: 0474 2402543, St. George Dayara, Othera, Tiruvalla Ph: 0469 2656808, St. Paul's Asram, Puthuppady,...",
    fallbackImage: '/images/institutions/mon.jpg',
    order: 1,
  },
  {
    slug: 'convents',
    title: 'Convents',
    fallbackDescription:
      'Bethany Convent, Ranni - Perunad - 689 711 Ph: 04735 240224 (Boarding 240583), Mount Tabore Convent, Pathanapuram Ph: 0475 2353483, 255447, St. Mary Magdalene Convent, Adupputty, Kunnamkulam Ph: 04885 222960...',
    fallbackImage: '/images/institutions/conv.jpg',
    order: 2,
  },
  {
    slug: 'orphanages',
    title: 'Orphanages',
    fallbackDescription:
      'Prathyasa, Prasanthi, Pretheesha, Meempara (Head Office) Ph: 0484 2760286, Baselios Marthoma Didymus I Balika Bhavan, Pothukal, Nilambur Ph: 04931 241282, Zachariah Mar Dionysius Memorial Bala Bhavan, Thengali. Ph: 0469 2615014...',
    fallbackImage: '/images/institutions/orp.jpg',
    order: 3,
  },
  {
    slug: 'hospitals',
    title: 'Hospitals',
    fallbackDescription:
      "St. Gregorios Mission Hospital, Parumala Ph: 0479 2312266 2312465 2312466, St. Mary's Hospital, Eraviperoor - 689 542 Ph: 0469 2664447, Malankara Medical Mission Hospital, Kolencherry - 682...",
    fallbackImage: '/images/institutions/parumala.jpg',
    order: 4,
  },
  {
    slug: 'medical-college',
    title: 'Medical College',
    fallbackDescription:
      'Malankara Medical Mission Hospital, Kolencherry - 682 311 - Hospital 04843055 555, Enquiry IP 04843055 211, Enquiry OP 04843055 621, Administration 04843055 411, Medical College 04843055 527, Nursing College 04843055...',
    fallbackImage: '/images/institutions/med.jpg',
    order: 5,
  },
  {
    slug: 'engineering-colleges',
    title: 'Engineering Colleges',
    fallbackDescription:
      'Mar Baselios Christian College of Engineering & Technology, Kuttikkanam, Peermade, Kerala - a self-financing institution for professional Education, affiliated...',
    fallbackImage: '/images/institutions/mbc.jpg',
    order: 6,
  },
  {
    slug: 'moc-colleges',
    title: 'MOC Colleges',
    fallbackDescription:
      "Catholicate College, Pathanamthitta Ph: 0468 2222223 2325253, Baselius College, Kottayam - 686 001 Ph: 0481 2563918 2565958, St. Mary's College, S. Battery - 673 592 Ph: 04936 220246, St. Gregorios...",
    fallbackImage: '/images/institutions/moc.jpg',
    order: 7,
  },
  {
    slug: 'schools',
    title: 'Schools',
    fallbackDescription:
      'Catholicate and M D Schools - Manager: H.G. Dr. Gabriel Mar Gregorios Metropolitan. HIGHER SECONDARY SCHOOLS: M.D. Seminary Higher Secondary School, Kottayam. Ph: 0481 - 2563949, M.G.M Higher Secondary School, Thiruvalla....',
    fallbackImage: '/images/institutions/raj.jpg',
    order: 8,
  },
];

export function getInstitutionHubCategory(slug: string): InstitutionHubCategory | undefined {
  return INSTITUTION_HUB_CATEGORIES.find((category) => category.slug === slug);
}

export function institutionBelongsToCategory(institutionSlug: string, categorySlug: string): boolean {
  return institutionSlug === categorySlug || institutionSlug.startsWith(`${categorySlug}-`);
}
