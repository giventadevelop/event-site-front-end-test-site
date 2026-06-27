export interface KalpanaEdition {
  documentId: string;
  title: string;
  slug: string;
  year: string;
  externalLink: string | null;
  available: boolean;
  cardImageUrl: string | null;
  cardImageAlt: string | null;
  order: number;
}

export interface KalpanaDocument {
  documentId: string;
  title: string;
  slug: string;
  pdfUrl: string | null;
  sourceUrl: string | null;
  kalpanaNumber: string | null;
  order: number;
}

export interface KalpanaPageContent {
  heroImageUrl: string;
  heroImageAlt: string | null;
  introParagraph1: string;
  introParagraph2: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutFeatures: string[];
}

export interface KalpanaCmsData {
  page: KalpanaPageContent;
  editions: KalpanaEdition[];
}
