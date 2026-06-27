/**
 * Sitemap links for /mosc-redesign — paths verified against app router pages.
 */
export type SitemapLink = {
  name: string;
  href: string;
  external?: boolean;
};

export type SitemapSection = {
  title: string;
  description: string;
  links: SitemapLink[];
};

const BASE = '/mosc-redesign';

export const MOSC_REDESIGN_SITEMAP: SitemapSection[] = [
  {
    title: 'Main Navigation',
    description: 'Primary sections of the Malankara Orthodox Syrian Church website.',
    links: [
      { name: 'Home', href: BASE },
      { name: 'The Catholicate', href: `${BASE}/catholicate` },
      { name: 'Administration', href: `${BASE}/administration` },
      { name: 'The Church', href: `${BASE}/the-church` },
      { name: 'Holy Synod', href: `${BASE}/holy-synod` },
      { name: 'Ecumenical', href: `${BASE}/ecumenical` },
      { name: 'Dioceses', href: `${BASE}/dioceses` },
      { name: 'Saints', href: `${BASE}/saints` },
      { name: 'Search Directory', href: `${BASE}/directory` },
    ],
  },
  {
    title: 'Community & Resources',
    description: 'News, publications, media, and church services.',
    links: [
      { name: 'Catholicate News', href: `${BASE}/news` },
      { name: 'Publications', href: `${BASE}/publications` },
      { name: 'Speeches & Messages', href: `${BASE}/speeches` },
      { name: 'Photo Gallery — Reception to H.H. Mathews III', href: `${BASE}/photo-gallery/reception-to-his-holiness-baselios-marthoma-mathews-iii` },
      { name: 'Gallery', href: `${BASE}/gallery` },
      { name: 'Downloads', href: `${BASE}/downloads` },
      { name: 'Lectionary', href: `${BASE}/lectionary` },
      { name: 'Liturgical Calendar', href: `${BASE}/liturgical-calendar` },
      { name: 'MOSC Calendar', href: `${BASE}/mosc-calendar` },
      { name: 'Pilgrim Centres', href: `${BASE}/pilgrim-centres` },
    ],
  },
  {
    title: 'Faith & Teaching',
    description: 'Doctrine, history, liturgy, and spirituality.',
    links: [
      { name: 'The Malankara Orthodox Syrian Church', href: `${BASE}/the-church/the-malankara-orthodox-syrian-church` },
      { name: 'What Do We Believe?', href: `${BASE}/the-church/what-do-we-believe` },
      { name: 'The Creed', href: `${BASE}/the-church/the-creed` },
      { name: 'Theology', href: `${BASE}/the-church/theology` },
      { name: 'Spirituality', href: `${BASE}/the-church/spirituality` },
      { name: 'Syrian Heritage', href: `${BASE}/the-church/syrian-heritage` },
      { name: 'Church History', href: `${BASE}/the-church/church-history` },
      { name: 'The Holy Myron', href: `${BASE}/the-church/the-holy-myron` },
      { name: 'Liturgy & Worship', href: `${BASE}/the-church/liturgy-worship` },
      { name: 'Holy Qurbana', href: `${BASE}/the-church/liturgy/holy-qurbana` },
      { name: 'Church Calendar', href: `${BASE}/the-church/church-calendar` },
    ],
  },
  {
    title: 'Saints & Holy Figures',
    description: 'Saints, apostles, and fathers of the church.',
    links: [
      { name: 'Saints Overview', href: `${BASE}/saints` },
      { name: 'St. Mary, Mother of God', href: `${BASE}/saints/st-mary-mother-of-god` },
      { name: 'The Apostles', href: `${BASE}/saints/the-apostles` },
      { name: 'Early Church Fathers', href: `${BASE}/saints/early-church-father` },
      { name: 'St. Baselios Yeldho (Kothamangalam Bava)', href: `${BASE}/saints/st-baselios-yeldho-kothamangalam-bava` },
      { name: 'St. Gregorios of Parumala', href: `${BASE}/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios` },
      { name: 'St. Geevarghese Mar Dionysius Vattasseril', href: `${BASE}/saints/st-geevarghese-mar-dionysius-vattasseril` },
      { name: 'Other Saints and Martyrs', href: `${BASE}/saints/other-saints-and-martyrs` },
    ],
  },
  {
    title: 'Directory',
    description: 'Parishes, priests, dioceses, and church bodies.',
    links: [
      { name: 'Directory Home', href: `${BASE}/directory` },
      { name: 'Holy Synod of Bishops', href: `${BASE}/directory/bishops` },
      { name: 'Dioceses', href: `${BASE}/directory/dioceses` },
      { name: 'Parishes', href: `${BASE}/directory/parishes` },
      { name: 'Priests', href: `${BASE}/directory/priests` },
      { name: 'Institutions', href: `${BASE}/directory/institutions` },
      { name: 'Church Dignitaries', href: `${BASE}/directory/church-dignitaries` },
      { name: 'Working Committee', href: `${BASE}/directory/working-committee` },
      { name: 'Managing Committee', href: `${BASE}/directory/managing-committee` },
      { name: 'Spiritual Organisations', href: `${BASE}/directory/spiritual-organisations` },
      { name: 'Pilgrim Centres', href: `${BASE}/directory/pilgrim-centres` },
      { name: 'Seminaries', href: `${BASE}/directory/seminaries` },
    ],
  },
  {
    title: 'Administration',
    description: 'Governance, constitution, and church bodies.',
    links: [
      { name: 'Administration Overview', href: `${BASE}/administration` },
      { name: 'Church Constitution', href: `${BASE}/administration/administration` },
      { name: 'Canon Law', href: `${BASE}/administration/he-canon-law-of-the-malankara-orthodox-church` },
      { name: 'The Holy Episcopal Synod', href: `${BASE}/administration/the-holy-episcopal-synod` },
      { name: 'Malankara Association', href: `${BASE}/administration/malankara-association` },
      { name: 'Managing Committee', href: `${BASE}/administration/the-managing-committee` },
      { name: 'Working Committee', href: `${BASE}/administration/the-working-committee` },
      { name: 'Diocesan General Body', href: `${BASE}/administration/the-diocesan-general-body` },
      { name: 'Parish Managing Committee', href: `${BASE}/administration/the-parish-managing-committee` },
      { name: 'Parish General Body', href: `${BASE}/administration/the-parish-general-body` },
    ],
  },
  {
    title: 'Organisations & Education',
    description: 'Spiritual organisations, training, and seminaries.',
    links: [
      { name: 'Spiritual Organisations', href: `${BASE}/spiritual-organizations-cms` },
      { name: 'Institutions', href: `${BASE}/institutions` },
      { name: 'Training Programmes', href: `${BASE}/training` },
      { name: 'St. Basil Bible School', href: `${BASE}/training/st-basil-bible-school` },
      { name: 'Sruti School of Liturgical Music', href: `${BASE}/training/sruti-school-of-liturgical-music` },
      { name: 'Divyabodhanam', href: `${BASE}/training/divyabodhanam` },
      { name: 'Theological Seminaries', href: `${BASE}/theological-seminaries` },
      { name: 'Orthodox Theological Seminary', href: `${BASE}/theological-seminaries/the-orthodox-theological-seminary` },
      { name: 'St. Thomas Orthodox Theological Seminary, Nagpur', href: `${BASE}/theological-seminaries/st-thomas-orthodox-theological-seminary-nagpur` },
    ],
  },
  {
    title: 'Contact & External',
    description: 'Get in touch and related external services.',
    links: [
      { name: 'Contact Information', href: `${BASE}/contact-info` },
      { name: 'Contact Form / E-Mail', href: `${BASE}/contact-form-email` },
      { name: 'Malankara Orthodox Calendar (external)', href: 'http://calendar.mosc.in/', external: true },
      { name: 'Official MOSC Site (external)', href: 'https://mosc.in/', external: true },
    ],
  },
];
