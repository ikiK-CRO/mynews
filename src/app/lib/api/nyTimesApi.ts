import { Article, FetchArticlesParams, ArticlesResponse } from './types';

const NYTIMES_BASE_URL = 'https://api.nytimes.com/svc';
const NYTIMES_API_KEY = process.env.NYTIMES_API_KEY || '';

// NY Times Top Stories API response interface
interface NYTimesTopStoryArticle {
  section: string;
  subsection: string;
  title: string;
  abstract: string;
  url: string;
  uri: string;
  byline: string;
  item_type: string;
  updated_date: string;
  created_date: string;
  published_date: string;
  material_type_facet: string;
  kicker: string;
  des_facet: string[];
  org_facet: string[];
  per_facet: string[];
  geo_facet: string[];
  multimedia: Array<{
    url: string;
    format: string;
    height: number;
    width: number;
    type: string;
    subtype: string;
    caption: string;
    copyright: string;
  }>;
  short_url: string;
}

interface NYTimesTopStoriesResponse {
  status: string;
  copyright: string;
  section: string;
  last_updated: string;
  num_results: number;
  results: NYTimesTopStoryArticle[];
  fault?: {
    faultstring: string;
    detail: {
      errorcode: string;
    };
  };
}

// Most Popular API response types
interface NYTimesPopularArticle {
  uri: string;
  url: string;
  id: number;
  asset_id: number;
  source: string;
  published_date: string;
  updated: string;
  section: string;
  subsection: string;
  nytdsection: string;
  adx_keywords: string;
  column: string | null;
  byline: string;
  type: string;
  title: string;
  abstract: string;
  des_facet: string[];
  org_facet: string[];
  per_facet: string[];
  geo_facet: string[];
  media: Array<{
    type: string;
    subtype: string;
    caption: string;
    copyright: string;
    approved_for_syndication: number;
    "media-metadata": Array<{
      url: string;
      format: string;
      height: number;
      width: number;
    }>;
  }>;
  eta_id: number;
}

interface NYTimesPopularResponse {
  status: string;
  copyright: string;
  num_results: number;
  results: NYTimesPopularArticle[];
  fault?: {
    faultstring: string;
    detail: {
      errorcode: string;
    };
  };
}

/**
 * Return empty results for error cases
 */
const emptyResponse = (page: number, pageSize: number): ArticlesResponse => ({
  articles: [],
  totalResults: 0,
  page,
  pageSize,
  hasMore: false,
});

/**
 * Map NY Times sections to our categories
 */
const mapSectionToCategory = (section: string): string => {
  const categoryMap: Record<string, string> = {
    'business': 'business',
    'technology': 'technology',
    'health': 'health',
    'science': 'science',
    'sports': 'sports',
    'world': 'general',
    'us': 'general',
    'politics': 'general',
    'opinion': 'general',
    'arts': 'entertainment',
    // Add more mappings as needed
  };

  return categoryMap[section.toLowerCase()] || 'general';
};

/**
 * Transforms NY Times Top Stories article to our unified Article format
 */
const transformTopStoryArticle = (article: NYTimesTopStoryArticle): Article => {
  // Safely handle missing multimedia
  const imageUrl = article.multimedia && article.multimedia.length > 0 
    ? article.multimedia[0].url 
    : null;

  return {
    id: `nytimes-topstory-${article.uri.split('/').pop()}`,
    title: article.title,
    description: article.abstract || '',
    content: article.abstract || '',
    url: article.url,
    imageUrl,
    publishedAt: article.published_date,
    source: 'New York Times',
    category: mapSectionToCategory(article.section || ''),
    author: article.byline || null,
  };
};

/**
 * Transforms NY Times popular article to our unified Article format
 */
const transformPopularArticle = (article: NYTimesPopularArticle): Article => {
  // Safely handle missing media
  const imageUrl = article.media && article.media.length > 0 && article.media[0]['media-metadata'] && article.media[0]['media-metadata'].length > 0
    ? article.media[0]['media-metadata'][article.media[0]['media-metadata'].length - 1].url // Get the largest image
    : null;

  return {
    id: `nytimes-popular-${article.id}`,
    title: article.title,
    description: article.abstract || '',
    content: article.abstract || '',
    url: article.url,
    imageUrl,
    publishedAt: article.published_date,
    source: 'New York Times',
    category: mapSectionToCategory(article.section || ''),
    author: article.byline || null,
  };
};

/**
 * Fetches articles from the NY Times Top Stories API
 */
async function fetchNYTimesTopStories(params: FetchArticlesParams): Promise<ArticlesResponse> {
  const { category, page = 1, pageSize = 10 } = params;
  
  // Map our category to NY Times section
  let section = 'home'; // Default to home section
  
  if (category && category !== 'general') {
    const sectionMappings: Record<string, string> = {
      'business': 'business',
      'health': 'health',
      'science': 'science',
      'sports': 'sports', 
      'technology': 'technology',
      'entertainment': 'arts',
    };
    
    section = sectionMappings[category] || 'home';
  }

  const endpoint = `/topstories/v2/${section}.json`;
  
  const queryParams = new URLSearchParams({
    'api-key': NYTIMES_API_KEY
  });

  try {
    const response = await fetch(`${NYTIMES_BASE_URL}${endpoint}?${queryParams}`);
    const data: NYTimesTopStoriesResponse = await response.json();
    
    // Check for API errors
    if (!response.ok || data.fault || data.status !== 'OK') {
      const errorMessage = data.fault?.faultstring || `NY Times API responded with status: ${response.status}`;
      console.error(`NY Times Top Stories API error: ${errorMessage}`);
      return emptyResponse(page, pageSize);
    }
    
    let articles = data.results.map(transformTopStoryArticle);
    
    // Filter articles by search term if provided
    if (params.query) {
      const query = params.query.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.description.toLowerCase().includes(query)
      );
    }
    
    // Manual pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedArticles = articles.slice(startIndex, startIndex + pageSize);
    
    return {
      articles: paginatedArticles,
      totalResults: articles.length,
      page,
      pageSize,
      hasMore: startIndex + pageSize < articles.length,
    };
  } catch (error) {
    console.error('Error fetching from NY Times Top Stories API:', error);
    return emptyResponse(page, pageSize);
  }
}

/**
 * Fetches articles from the NY Times Most Popular API
 */
async function fetchNYTimesPopularArticles(params: FetchArticlesParams): Promise<ArticlesResponse> {
  const { category, page = 1, pageSize = 10 } = params;
  
  // Most Popular API doesn't support categories directly, so we'll fetch all and filter
  const endpoint = '/mostpopular/v2/viewed/7.json'; // Most viewed articles in the last 7 days
  
  const queryParams = new URLSearchParams({
    'api-key': NYTIMES_API_KEY
  });

  try {
    const response = await fetch(`${NYTIMES_BASE_URL}${endpoint}?${queryParams}`);
    const data: NYTimesPopularResponse = await response.json();
    
    // Check for API errors
    if (!response.ok || data.fault || data.status !== 'OK') {
      const errorMessage = data.fault?.faultstring || `NY Times API responded with status: ${response.status}`;
      console.error(`NY Times Popular API error: ${errorMessage}`);
      return emptyResponse(page, pageSize);
    }
    
    let articles = data.results.map(transformPopularArticle);
    
    // Filter by category if provided
    if (category && category !== 'general') {
      articles = articles.filter(article => article.category === category);
    }
    
    // Filter articles by search term if provided
    if (params.query) {
      const query = params.query.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.description.toLowerCase().includes(query)
      );
    }
    
    // Manual pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedArticles = articles.slice(startIndex, startIndex + pageSize);
    
    return {
      articles: paginatedArticles,
      totalResults: articles.length,
      page,
      pageSize,
      hasMore: startIndex + pageSize < articles.length,
    };
  } catch (error) {
    console.error('Error fetching from NY Times Popular API:', error);
    return emptyResponse(page, pageSize);
  }
}

/**
 * Fetches articles from the enabled NY Times APIs
 */
export async function fetchNYTimesArticles(params: FetchArticlesParams): Promise<ArticlesResponse> {
  try {
    // Fetch from both enabled APIs in parallel
    const [topStoriesResponse, popularResponse] = await Promise.all([
      fetchNYTimesTopStories(params),
      fetchNYTimesPopularArticles(params)
    ]);

    // If both APIs failed, return empty response
    if (topStoriesResponse.articles.length === 0 && popularResponse.articles.length === 0) {
      return emptyResponse(params.page || 1, params.pageSize || 10);
    }

    // Combine and deduplicate articles
    const combinedArticles = [
      ...topStoriesResponse.articles,
      ...popularResponse.articles
    ];

    // Deduplicate by URL
    const uniqueArticles = Array.from(
      new Map(combinedArticles.map(article => [article.url, article])).values()
    );

    // Sort by publication date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Calculate pagination for combined results
    const { page = 1, pageSize = 10 } = params;
    const startIndex = (page - 1) * pageSize;
    const paginatedArticles = uniqueArticles.slice(startIndex, startIndex + pageSize);

    return {
      articles: paginatedArticles,
      totalResults: uniqueArticles.length,
      page,
      pageSize,
      hasMore: startIndex + pageSize < uniqueArticles.length,
    };
  } catch (error) {
    console.error('Error fetching from NY Times APIs:', error);
    return emptyResponse(params.page || 1, params.pageSize || 10);
  }
}
