/** Shared Strapi-style list pagination meta for directory entity lists. */
export type DirectoryListPagination = {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
};

export const EMPTY_DIRECTORY_PAGINATION: DirectoryListPagination = {
  page: 1,
  pageCount: 0,
  pageSize: 20,
  total: 0,
};

export const DIRECTORY_PAGE_SIZE = 20;
