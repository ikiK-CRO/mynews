import { fetchNewsApiArticles } from './newsApi';
import { fetchNYTimesArticles } from './nyTimesApi';
import { 
  Article, 
  ArticlesResponse, 
  FetchArticlesParams,
  NewsCategory,
  NewsSource,
  ArticleFilters 
} from './types';

/**
 * Create an empty response for error cases
 */
const emptyResponse = (params: FetchArticlesParams): ArticlesResponse => ({
  articles: [],
  totalResults: 0,
  page: params.page || 1,
  pageSize: params.pageSize || 10,
  hasMore: false,
});

/**
 * Fetches articles from both news sources and combines results
 */
export async function fetchArticles(params: FetchArticlesParams): Promise<ArticlesResponse> {
  try {
    // Fetch from both sources in parallel with Promise.allSettled to handle partial failures
    const [newsApiResult, nyTimesResult] = await Promise.allSettled([
      fetchNewsApiArticles(params),
      fetchNYTimesArticles(params)
    ]);

    // Extract data from successful results
    const newsApiResponse = newsApiResult.status === 'fulfilled' ? newsApiResult.value : { 
      articles: [], 
      totalResults: 0, 
      page: params.page || 1, 
      pageSize: params.pageSize || 10,
      hasMore: false 
    };
    
    const nyTimesResponse = nyTimesResult.status === 'fulfilled' ? nyTimesResult.value : { 
      articles: [], 
      totalResults: 0, 
      page: params.page || 1, 
      pageSize: params.pageSize || 10,
      hasMore: false 
    };

    // Log if any API failed
    if (newsApiResult.status === 'rejected') {
      console.error('NewsAPI fetch failed:', newsApiResult.reason);
    }
    
    if (nyTimesResult.status === 'rejected') {
      console.error('NY Times API fetch failed:', nyTimesResult.reason);
    }

    // Return empty response if both APIs failed
    if (newsApiResponse.articles.length === 0 && nyTimesResponse.articles.length === 0) {
      return emptyResponse(params);
    }

    // Combine articles from both sources
    const articles = [...newsApiResponse.articles, ...nyTimesResponse.articles]
      // Sort by publication date (newest first)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const totalResults = newsApiResponse.totalResults + nyTimesResponse.totalResults;
    
    return {
      articles,
      totalResults,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      hasMore: newsApiResponse.hasMore || nyTimesResponse.hasMore,
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return emptyResponse(params);
  }
}

/**
 * Fetches articles from a specific news source
 */
export async function fetchArticlesBySource(
  source: NewsSource, 
  params: FetchArticlesParams
): Promise<ArticlesResponse> {
  try {
    if (source === NewsSource.NEWS_API) {
      return fetchNewsApiArticles(params);
    } else {
      return fetchNYTimesArticles(params);
    }
  } catch (error) {
    console.error(`Error fetching articles from ${source}:`, error);
    return emptyResponse(params);
  }
}

/**
 * Search articles based on query and optional filters
 */
export async function searchArticles(
  query: string, 
  filters?: ArticleFilters
): Promise<ArticlesResponse> {
  const params: FetchArticlesParams = {
    query,
    category: filters?.category,
    page: 1,
    pageSize: 20,
  };

  try {
    if (filters?.source) {
      return fetchArticlesBySource(filters.source, params);
    }

    return fetchArticles(params);
  } catch (error) {
    console.error('Error searching articles:', error);
    return emptyResponse(params);
  }
}

// Re-export types
export type { Article, ArticlesResponse, FetchArticlesParams, ArticleFilters };
export { NewsCategory, NewsSource };
