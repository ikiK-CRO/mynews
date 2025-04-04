/**
 * Unified article type for both NewsAPI and NY Times
 */
export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: string;
  category: string;
  author: string | null;
}

/**
 * Parameters for fetching articles
 */
export interface FetchArticlesParams {
  category?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Response format for articles API
 */
export interface ArticlesResponse {
  articles: Article[];
  totalResults: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Supported news categories
 */
export enum NewsCategory {
  GENERAL = 'general',
  BUSINESS = 'business',
  HEALTH = 'health',
  SCIENCE = 'science',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
}

/**
 * News source identifier
 */
export enum NewsSource {
  NEWS_API = 'newsapi',
  NY_TIMES = 'nytimes',
}

/**
 * Filter options for articles
 */
export interface ArticleFilters {
  category?: NewsCategory;
  query?: string;
  source?: NewsSource;
}
