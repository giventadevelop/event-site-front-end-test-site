export interface TheologicalSeminaryEntry {
  documentId: string;
  name: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  website: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  location: string | null;
  established: string | null;
  order: number;
}

export interface TheologicalSeminaryEntriesListResult {
  entries: TheologicalSeminaryEntry[];
}
