export interface SaintEntry {
  documentId: string;
  name: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface SaintEntriesListResult {
  entries: SaintEntry[];
}
