/**
 * Administration landing cards + header submenu — same hrefs as each card’s “Read more”.
 */
export type AdministrationCard = {
  shortTitle: string;
  title: string;
  excerpt: string;
  href: string;
  /** Hub card thumbnail (280×168 frame); omit for logo-only cards */
  image?: string;
  imageAlt?: string;
};

export const ADMINISTRATION_PAGE_CARDS: AdministrationCard[] = [
  {
    shortTitle: 'Constitution',
    title: 'The Constitution of the Malankara Orthodox Church',
    excerpt:
      'The church had no written constitution until 1934, but was governed by consensus, traditions and precedence. It was the vision of Mor Dionysius, Vattasseril to have a clearly defined uniform...',
    href: '/mosc-redesign/administration/administration',
  },
  {
    shortTitle: 'Canon Law',
    title: 'The Canon Law of the Malankara Orthodox Church',
    excerpt:
      'The Canon Law accepted and followed by the Orthodox church of Malankara was collected and codified by Mar Gregorios Bar Hebraeus, Catholicos of Edessa (AD. 1226-1286) in the thirteenth century....',
    href: '/mosc-redesign/administration/he-canon-law-of-the-malankara-orthodox-church',
    image: '/images/administration/canon-law.jpg',
    imageAlt: 'The Canon Law of the Malankara Orthodox Church',
  },
  {
    shortTitle: 'Holy Episcopal Synod',
    title: 'The Holy Episcopal Synod',
    excerpt:
      'The Episcopal Synod with the Catholicos as its president is the apex body of all bishops. The authority of the synod is final and binding. It has exclusive rights and...',
    href: '/mosc-redesign/administration/the-holy-episcopal-synod',
    image: '/images/administration/holy-episcopal-synod.jpg',
    imageAlt: 'The Holy Episcopal Synod',
  },
  {
    shortTitle: 'Malankara Association',
    title: 'Malankara Association',
    excerpt:
      'It was in the Mulamthuruthy synod summoned by the patriarch peter III in 1876 that resolved to have an elected body called the Malankara Syria Christian Association to manage and...',
    href: '/mosc-redesign/administration/malankara-association',
    image: '/images/administration/malankara-association.jpg',
    imageAlt: 'Malankara Association',
  },
  {
    shortTitle: 'Managing Committee',
    title: 'The Managing Committee',
    excerpt:
      'In the Mulamthuruthy synod which formulated the Malankara association had laid down the provision for the managing committee, a smaller body to look into the financial and other administrative matters....',
    href: '/mosc-redesign/administration/the-managing-committee',
    image: '/images/administration/managing-committee.jpg',
    imageAlt: 'The Managing Committee',
  },
  {
    shortTitle: 'Working Committee',
    title: 'The Working Committee',
    excerpt:
      'It is a small body of members nominated by the Malankara Metropolitan. This body prepares the agenda for the Managing Committee and helps the Malankara Metropolitan in his administrative functions....',
    href: '/mosc-redesign/administration/the-working-committee',
    image: '/images/administration/working-committee.jpg',
    imageAlt: 'The Working Committee',
  },
  {
    shortTitle: 'Diocesan General Body',
    title: 'The Diocesan General Body',
    excerpt:
      'Every diocese will have a Diocesan Assembly. The Diocesan bishop presides over the meetings. All matters related to the Diocese is discussed and decided in the General body assembly including...',
    href: '/mosc-redesign/administration/the-diocesan-general-body',
    image: '/images/administration/diocesan-general-body.jpg',
    imageAlt: 'The Diocesan General Body',
  },
  {
    shortTitle: 'Parish Managing Committee',
    title: 'The Parish Managing Committee',
    excerpt:
      'The members of the Parish Managing Committee excluding the priests will be elected by the Parish Assembly and their term of office will be one year. Every Parish Managing Committee...',
    href: '/mosc-redesign/administration/the-parish-managing-committee',
    image: '/images/administration/parish-managing-committee.jpg',
    imageAlt: 'The Parish Managing Committee',
  },
  {
    shortTitle: 'Parish General Body',
    title: 'The Parish General Body',
    excerpt:
      'Every parish is within the frame work of the church constitution. It is neither outside the umbrella of the constitution nor an independent entity. Each Parish has a general body....',
    href: '/mosc-redesign/administration/the-parish-general-body',
    image: '/images/administration/parish-general-body.jpg',
    imageAlt: 'The Parish General Body',
  },
];
