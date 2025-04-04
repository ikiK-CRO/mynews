import { useState, useEffect, useCallback } from 'react';
import type { 
  Article, 
  NewsCategory, 
  NewsSource 
} from '@/app/lib/api';

interface UseArticlesOptions {
  initialCategory?: NewsCategory;
  initialSource?: NewsSource;
  initialQuery?: string;
  pageSize?: number;
}

interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  setCategory: (category?: NewsCategory) => void;
  setQuery: (query: string) => void;
  setSource: (source?: NewsSource) => void;
  resetFilters: () => void;
  totalResults: number;
}

/**
 * Hook for fetching articles with pagination and filtering
 */
export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const { 
    initialCategory, 
    initialSource, 
    initialQuery = '', 
    pageSize = 10 
  } = options;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  
  // Filters
  const [category, setCategory] = useState<NewsCategory | undefined>(initialCategory);
  const [source, setSource] = useState<NewsSource | undefined>(initialSource);
  const [query, setQuery] = useState(initialQuery);

  /**
   * Reset pagination when filters change
   */
  const resetPagination = useCallback(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setCategory(initialCategory);
    setSource(initialSource);
    setQuery(initialQuery);
    resetPagination();
  }, [initialCategory, initialSource, initialQuery, resetPagination]);

  /**
   * Fetch articles based on current filters and pagination
   */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (category) {
        params.append('category', category);
      }
      
      if (query) {
        params.append('query', query);
      }
      
      if (source) {
        params.append('source', source);
      }
      
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      // Fetch articles from API
      const response = await fetch(`/api/news?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      
      // Update state with new articles
      setArticles(prevArticles => {
        // If it's the first page, replace articles, otherwise append
        return page === 1 ? data.articles : [...prevArticles, ...data.articles];
      });
      
      setHasMore(data.hasMore);
      setTotalResults(data.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [category, query, source, page, pageSize]);

  /**
   * Load more articles (increment page)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  // Update filters with debounce for search
  const handleSetQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    resetPagination();
  }, [resetPagination]);

  const handleSetCategory = useCallback((newCategory?: NewsCategory) => {
    setCategory(newCategory);
    resetPagination();
  }, [resetPagination]);

  const handleSetSource = useCallback((newSource?: NewsSource) => {
    setSource(newSource);
    resetPagination();
  }, [resetPagination]);

  // Fetch articles when dependencies change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    hasMore,
    loadMore,
    setCategory: handleSetCategory,
    setQuery: handleSetQuery,
    setSource: handleSetSource,
    resetFilters,
    totalResults,
  };
}
