/**
 * Types for Directory Portal (Strapi-backed) used by the MOSC directory home page.
 * API reference: documentation/parish_directory_portal/directory_api_reference.md
 */

/** Normalized section card for directory home (from Strapi directory-home.sectionCards). */
export interface DirectorySectionCard {
  title: string;
  description: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

/** Normalized directory home data returned by getDirectoryHomeData(). */
export interface DirectoryHomeData {
  introText: string | null;
  sectionCards: DirectorySectionCard[];
}
