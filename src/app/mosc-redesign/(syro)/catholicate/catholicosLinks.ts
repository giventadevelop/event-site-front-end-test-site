/**
 * Shared list of Catholicoi for Syro catholicate subpages sidebar.
 * Used to render "Catholicate History" links after "Back to The Catholicate".
 */
export interface CatholicosLinkItem {
  name: string;
  period: string;
  description: string;
  href: string;
}

export const SYRO_CATHOLICOS_LINKS: CatholicosLinkItem[] = [
  { name: 'H.H. Baselios Paulos I', period: '1912–1913', description: 'The First Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese I', period: '1925–1928', description: 'The Second Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Geevarghese II', period: '1929–1964', description: 'The Third Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Augen I', period: '1964–1975', description: 'The Fourth Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews I', period: '1975–1991', description: 'The Fifth Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Mathews II', period: '1991–2005', description: 'The Sixth Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Didymos I', period: '2005–2010', description: 'The Seventh Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara' },
  { name: 'H.H. Baselios Marthoma Paulose II', period: '2010–2021', description: 'The Eighth Catholicos of the East in Malankara', href: '/mosc-redesign/catholicate/h-h-baselios-marthoma-paulose-ii' },
  {
    name: 'H.H. Baselios Marthoma Mathews III',
    period: '2021–present',
    description: 'The Ninth Catholicos of the East in Malankara (current Catholicos)',
    href: '/mosc-redesign/holy-synod/his-holiness-baselios-marthoma-mathews-iii',
  },
];

/** Full sidebar list: Introduction, then all Catholicoi. Use for consistent right sidebar on all catholicate subpages. */
export const SYRO_CATHOLICATE_SIDEBAR_LINKS: (CatholicosLinkItem & { period?: string; description?: string })[] = [
  { name: 'The Catholicate — Introduction', href: '/mosc-redesign/catholicate-intro', period: '', description: '' },
  ...SYRO_CATHOLICOS_LINKS,
];
