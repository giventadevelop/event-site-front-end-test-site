export interface SpiritualOrganisationEntry {
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  website: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface SpiritualOrganisationsListResult {
  entries: SpiritualOrganisationEntry[];
}
