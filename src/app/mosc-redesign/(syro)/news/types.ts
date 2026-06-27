/**
 * Types for News Portal (Strapi-backed) used by the MOSC news homepage and article detail.
 */

import type { BlocksContent } from '@strapi/blocks-react-renderer';

export interface NewsArticle {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  excerpt?: string;
  /** Rich text blocks from Strapi (description field). When set, render with BlocksRenderer. */
  description?: BlocksContent;
  body?: string;
  publishedAt?: string;
  views?: number;
  coverUrl?: string;
  coverAlt?: string;
  categorySlug?: string;
  categoryName?: string;
  authorName?: string;
}

export interface FlashNews {
  message: string;
  active: boolean;
}

/** Single item for the flash news carousel/ticker (from Strapi flash-news-item). */
export interface FlashNewsItemUI {
  id: number;
  content: string;
  /** Internal path (/syro/news/slug) or external URL; omit for text-only. */
  link?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface SidebarPromoBlock {
  blockType?: string;
  embedCode?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string | null;
}

export interface AdSlot {
  id: number;
  position?: string;
  embedHtml?: string | null;
  mediaUrl?: string | null;
  linkUrl?: string | null;
}

export interface NewsHomePageData {
  flash: FlashNews | null;
  /** Scrolling flash news items (carousel); from Strapi flash-news-items. */
  flashNewsItems: FlashNewsItemUI[];
  featured: NewsArticle[];
  mainNews: NewsArticle[];
  pressRelease: NewsArticle[];
  mostRead: NewsArticle[];
  sidebarPromo: SidebarPromoBlock | null;
  /** Sidebar ad slots (position=sidebar) */
  adSlots: AdSlot[];
  /** Top banner ad slots (position=top) */
  topAdSlots: AdSlot[];
  /** Between-sections ad slots (position=between_sections) */
  betweenSectionsAdSlots: AdSlot[];
}
