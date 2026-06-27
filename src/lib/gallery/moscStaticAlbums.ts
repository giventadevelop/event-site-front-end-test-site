/** Static MOSC gallery albums — fallback when API returns no public albums. */
export interface MoscStaticGalleryAlbum {
  id: string;
  title: string;
  date: string;
  albumYear: number;
  photoCount: number;
  category: string;
  imageUrl: string;
}

export const MOSC_STATIC_GALLERY_ALBUMS: MoscStaticGalleryAlbum[] = [
  { id: 'russia-visit', title: 'Russia visit of H.H Baselios Marthoma Mathews III', date: '2019', albumYear: 2019, photoCount: 60, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/russia-visit/cross-200x300.jpg' },
  { id: 'vatican-visit', title: 'VATICAN VISIT OF HIS HOLINESS', date: '2023', albumYear: 2023, photoCount: 42, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/vatican-visit/00186_11092023-1024x683.jpg' },
  { id: 'enthronement-mathews-iii', title: 'ENTHRONEMENT CEREMONY OF HIS HOLINESS BASELIOS MARTHOMA MATHEWS III', date: '2021', albumYear: 2021, photoCount: 48, category: 'Major Events', imageUrl: '/images/mosc/gallery/enthronement-mathews-iii/C24-768x1105.jpg' },
  { id: 'reception-mathews-iii', title: 'RECEPTION TO HIS HOLINESS BASELIOS MARTHOMA MATHEWS III', date: '2021', albumYear: 2021, photoCount: 36, category: 'Receptions', imageUrl: '/images/mosc/gallery/reception-mathews-iii/R15-2.jpg' },
  { id: 'paulose-ii-with-kiril', title: 'H.H Baselios Marthoma Paulose II With Kiril Patriarch', date: '2019', albumYear: 2019, photoCount: 19, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/paulose-ii-with-kiril/IMG-20190916-WA0042-200x300.jpg' },
  { id: 'st-matrona-relics', title: 'His Holiness the Catholicos paying his respects at the relics of St. Matrona of Moscow', date: '2019', albumYear: 2019, photoCount: 1, category: 'Liturgical Events', imageUrl: '/images/mosc/gallery/st-matrona-relics/IMG-20190916-WA0017.jpg' },
  { id: 'st-cyril-methodius', title: 'Official reception at the main Chapel of St. Cyril and Methodius Institute of Post-Graduate Studies', date: '2019', albumYear: 2019, photoCount: 3, category: 'Receptions', imageUrl: '/images/mosc/gallery/st-cyril-methodius/IMG-20190916-WA0018-1024x682.jpg' },
  { id: 'metropolitan-hilarion', title: 'Metropolitan Hilarion receiving His Holiness to St. Cyril and Methodius Institute of Post-Graduate Studies', date: '2019', albumYear: 2019, photoCount: 2, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/metropolitan-hilarion/IMG-20190916-WA0025.jpg' },
  { id: 'pokrovsky-monastery', title: 'The great shepherd of Malankara, prayerfully in Pokrovsky Monastery Chapel', date: '2019', albumYear: 2019, photoCount: 2, category: 'Liturgical Events', imageUrl: '/images/mosc/gallery/pokrovsky-monastery/IMG-20190916-WA0088-200x300.jpg' },
  { id: 'mother-feofania', title: 'Mother Feofania and the little flowers of the Convent where St. Matrona is interred', date: '2019', albumYear: 2019, photoCount: 1, category: 'Special Events', imageUrl: '/images/mosc/gallery/mother-feofania/IMG-20190916-WA0036-300x200.jpg' },
  { id: 'ceremonial-reception-russian-orthodox', title: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church', date: '2019', albumYear: 2019, photoCount: 9, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/ceremonial-reception-russian-orthodox/IMG-20190916-WA0023-300x200.jpg' },
  { id: 'offering-incense-st-thomas', title: 'Offering incense at the Relics of St.Thomas (Devalokam Aramana)', date: '2016', albumYear: 2016, photoCount: 2, category: 'Liturgical Events', imageUrl: '/images/mosc/gallery/offering-incense-st-thomas/IMG_9820-1-300x200.jpg' },
  { id: 'order-st-thomas-abune-mathias', title: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church', date: '2016', albumYear: 2016, photoCount: 7, category: 'Major Events', imageUrl: '/images/mosc/gallery/order-st-thomas-abune-mathias/MG_2774-300x200.jpg' },
  { id: 'visit-abune-mathias', title: 'Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church', date: '2016', albumYear: 2016, photoCount: 3, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/visit-abune-mathias/MG_2509-300x184.jpg' },
  { id: 'reception-tikon-puthupally', title: 'Reception to H.B.Tikon at Puthupally Church', date: '2015', albumYear: 2015, photoCount: 11, category: 'Receptions', imageUrl: '/images/mosc/gallery/reception-tikon-puthupally/IMG_9166-150x150.jpg' },
  { id: 'website-inauguration', title: 'Official Website Inauguration, Devalokam Aramana', date: 'November 25, 2015', albumYear: 2015, photoCount: 7, category: 'Special Events', imageUrl: '/images/mosc/gallery/website-inauguration/IMG_9248-300x169.jpg' },
  { id: 'private-audience-tikon-devalokam', title: 'Private Audience with H.B.Tikon at Devalokam Aramana', date: 'November 25, 2015', albumYear: 2015, photoCount: 9, category: 'Private Audiences', imageUrl: '/images/mosc/gallery/private-audience-tikon-devalokam/IMG_9167-1024x575.jpg' },
  { id: 'canberra-visit', title: 'H.H Visit to Canberra', date: 'November 17, 2015', albumYear: 2015, photoCount: 5, category: 'Church Visits', imageUrl: '/images/mosc/gallery/canberra-visit/IMG_3553.jpg' },
  { id: 'dharma-dhamma-conference', title: '3rd International Dharma-Dhamma Conference', date: 'October 24-26, 2015, Indore', albumYear: 2015, photoCount: 5, category: 'Conferences', imageUrl: '/images/mosc/gallery/dharma-dhamma-conference/IMG_1234.jpg' },
  { id: 'vienna-fraternity', title: 'The Fraternity at Vienna', date: 'September 3, 2013', albumYear: 2013, photoCount: 5, category: 'Special Events', imageUrl: '/images/mosc/gallery/vienna-fraternity/IMG_3898-1024x683.jpg' },
  { id: 'armenian-genocide-canonization', title: 'Service of Canonization of the Victims of Armenian Genocide', date: 'April 23, 2015', albumYear: 2015, photoCount: 5, category: 'Special Events', imageUrl: '/images/mosc/gallery/armenian-genocide-canonization/IMG_3553-1024x683.jpg' },
  { id: 'armenian-president', title: 'His Holiness with Armenian President', date: 'April 23, 2015', albumYear: 2015, photoCount: 1, category: 'Special Events', imageUrl: '/images/mosc/gallery/armenian-president/IMG_3660-300x200.jpg' },
  { id: 'private-audience-karekin', title: 'Private Audience with Karekin I Supreme Patriarch and Catholicos of All Armenians', date: '2015', albumYear: 2015, photoCount: 4, category: 'Private Audiences', imageUrl: '/images/mosc/gallery/private-audience-karekin/IMG_3229-1024x683.jpg' },
  { id: 'enthronement-coptic-pope', title: 'Enthronement ceremony of the new Coptic Pope', date: '2012', albumYear: 2012, photoCount: 3, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/enthronement-coptic-pope/et.jpg' },
  { id: 'blessing-holy-myron', title: 'Blessing of Holy Myron', date: 'July 19, 2015, Beirut', albumYear: 2015, photoCount: 5, category: 'Liturgical Events', imageUrl: '/images/mosc/gallery/blessing-holy-myron/Picture-052-680x1024.jpg' },
  { id: 'private-audience-aram', title: 'Private audience with HH Aram', date: 'July 17, 2015', albumYear: 2015, photoCount: 5, category: 'Private Audiences', imageUrl: '/images/mosc/gallery/private-audience-aram/IMG_0902-150x150.jpg' },
  { id: 'armenian-genocide-100th', title: '100th anniversary of the Armenian Genocide', date: 'July 18, 2015, Beirut', albumYear: 2015, photoCount: 5, category: 'Special Events', imageUrl: '/images/mosc/gallery/armenian-genocide-100th/dharma-dhama-300x220.jpg' },
  { id: 'ethiopian-visit', title: 'Ethiopian Visit of His Holiness', date: 'February 28, 2013', albumYear: 2013, photoCount: 5, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/ethiopian-visit/IMG_3745.jpg' },
  { id: 'rome-visit', title: 'Vatican Visit of His Holiness', date: 'September 5, 2013', albumYear: 2013, photoCount: 5, category: 'Ecumenical Visits', imageUrl: '/images/mosc/gallery/rome-visit/IMG_3909-1024x683.jpg' },
];
