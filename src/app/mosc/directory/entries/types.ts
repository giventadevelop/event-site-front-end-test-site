/**
 * Directory entries: institutions, church-dignitaries, working-committee,
 * managing-committee, spiritual-organisations, pilgrim-centres, seminaries.
 * API reference: documentation/parish_directory_portal/directory_api_reference.md §8
 */

export type DirectoryEntryType =
  | 'institutions'
  | 'church-dignitaries'
  | 'working-committee'
  | 'managing-committee'
  | 'spiritual-organisations'
  | 'pilgrim-centres'
  | 'seminaries';

export interface DirectoryEntry {
  documentId: string;
  name: string;
  slug: string;
  directoryType: DirectoryEntryType;
  description: string | null;
  address: string | null;
  email: string | null;
  phones: string | null;
  website: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface StrapiPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

export interface DirectoryEntriesListResult {
  entries: DirectoryEntry[];
  pagination: StrapiPagination;
}

export const DIRECTORY_ENTRY_TYPE_LABELS: Record<DirectoryEntryType, string> = {
  'institutions': 'Institutions',
  'church-dignitaries': 'Church Dignitaries',
  'working-committee': 'Working Committee',
  'managing-committee': 'The Managing Committee',
  'spiritual-organisations': 'Spiritual Organisations',
  'pilgrim-centres': 'Pilgrim Centres',
  'seminaries': 'Seminaries',
};
