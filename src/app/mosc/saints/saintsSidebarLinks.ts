/**
 * Saints section sidebar navigation. Used by all saints subpages.
 * Matches legacy mosc.in/saints structure: 7 saints + overview.
 */
export const SAINTS_SIDEBAR_LINKS = [
  { href: '/mosc/saints', label: 'Saints Overview' },
  { href: '/mosc/saints/st-mary-mother-of-god', label: 'St. Mary Mother of God' },
  { href: '/mosc/saints/the-apostles', label: 'The Apostles' },
  { href: '/mosc/saints/early-church-father', label: 'Early Church Fathers' },
  { href: '/mosc/saints/st-baselios-yeldho-kothamangalam-bava', label: 'St. Baselios Yeldho (Kothamangalam Bava)' },
  { href: '/mosc/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios', label: 'St. Gregorios Of Parumala – Metropolitan Geevarghese Mar Gregorios' },
  { href: '/mosc/saints/st-geevarghese-mar-dionysius-vattasseril', label: 'St. Geevarghese Mar Dionysius Vattasseril' },
  { href: '/mosc/saints/other-saints-and-martyrs', label: 'Other Saints and Martyrs' },
] as const;
