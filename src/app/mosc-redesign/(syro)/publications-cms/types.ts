export interface PublicationEntry {
  documentId: string;
  name: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  website: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface PublicationEntriesListResult {
  entries: PublicationEntry[];
}
