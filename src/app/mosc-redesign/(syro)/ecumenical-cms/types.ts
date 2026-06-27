export interface EcumenicalArticle {
  documentId: string;
  name: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  order: number;
}

export interface EcumenicalArticlesListResult {
  articles: EcumenicalArticle[];
}
