import { Article, FetchArticlesParams, ArticlesResponse } from './types';

const NYTIMES_BASE_URL = 'https://api.nytimes.com/svc';
const NYTIMES_API_KEY = process.env.NYTIMES_API_KEY || '';

// NY Times article interfaces
interface NYTimesDoc {
  abstract: string;
  web_url: string;
  snippet: string;
  lead_paragraph: string;
  print_section?: string;
  print_page?: string;
  source: string;
  multimedia: Array<{
    url: string;
    format: string;
    height: number;
    width: number;
    type: string;
    subtype: string;
    caption: string;
    credit: string;
  }>;
  headline: {
    main: string;
    kicker: string | null;
    content_kicker: string | null;
    print_headline: string | null;
    name: string | null;
    seo: string | null;
    sub: string | null;
  };
  byline: {
    original: string | null;
    person: Array<{
      firstname: string;
      middlename: string | null;
      lastname: string;
      qualifier: string | null;
      title: string | null;
      role: string | null;
      organization: string | null;
      rank: number;
    }>;
    organization: string | null;
  };
  pub_date: string;
  document_type: string;
  news_desk: string;
  section_name: string;
  subsection_name: string;
  type_of_material: string;
  _id: string;
  word_count: number;
  uri: string;
}

interface NYTimesSearchResponse {
  status: string;
  copyright: string;
  response: {
    docs: NYTimesDoc[];
    meta: {
      hits: number;
      offset: number;
      time: number;
    };
  };
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
    'Business': 'business',
    'Health': 'health',
    'Science': 'science',
    'Sports': 'sports',
    'Technology': 'technology',
    // Add more mappings as needed
  };

  return categoryMap[section] || 'general';
};

/**
 * Transforms NY Times search article to our unified Article format
 */
const transformSearchArticle = (article: NYTimesDoc): Article => {
  // Safely handle missing multimedia
  const imageUrl = article.multimedia && article.multimedia.length > 0 
    ? `https://www.nytimes.com/${article.multimedia[0].url}`
    : null;

  return {
    id: `nytimes-search-${article._id}`,
    title: article.headline.main,
    description: article.abstract || article.snippet || '',
    content: article.lead_paragraph || '',
    url: article.web_url,
    imageUrl,
    publishedAt: article.pub_date,
    source: 'New York Times',
    category: mapSectionToCategory(article.section_name || ''),
    author: article.byline?.original || null,
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
 * Fetches articles from the NY Times Article Search API
 */
async function fetchNYTimesSearchArticles(params: FetchArticlesParams): Promise<ArticlesResponse> {
  const { category, query = '', page = 1, pageSize = 10 } = params;
  
  const queryParams = new URLSearchParams({
    'api-key': NYTIMES_API_KEY,
    page: (page - 1).toString(), // NY Times is 0-indexed
  });

  const endpoint = '/search/v2/articlesearch.json';
  
  if (query) {
    queryParams.append('q', query);
  }

  if (category && category !== 'general') {
    // Map our category to NY Times section
    const sectionMappings: Record<string, string> = {
      'business': 'Business',
      'health': 'Health',
      'science': 'Science',
      'sports': 'Sports', 
      'technology': 'Technology',
    };

    const section = sectionMappings[category];
    if (section) {
      queryParams.append('fq', `section_name:"${section}"`);
    }
  }

  try {
    const response = await fetch(`${NYTIMES_BASE_URL}${endpoint}?${queryParams}`);
    const data: NYTimesSearchResponse = await response.json();
    
    // Check for API errors
    if (!response.ok || data.fault || data.status !== 'OK') {
      const errorMessage = data.fault?.faultstring || `NY Times API responded with status: ${response.status}`;
      console.error(`NY Times Search API error: ${errorMessage}`);
      return emptyResponse(page, pageSize);
    }
    
    const articles = data.response.docs.map(transformSearchArticle);
    const totalResults = data.response.meta.hits;
    
    return {
      articles,
      totalResults,
      page,
      pageSize,
      hasMore: page * pageSize < totalResults,
    };
  } catch (error) {
    console.error('Error fetching from NY Times Search API:', error);
    return emptyResponse(page, pageSize);
  }
}

/**
 * Fetches articles from the NY Times Most Popular API
 */
async function fetchNYTimesPopularArticles(params: FetchArticlesParams): Promise<ArticlesResponse> {
  const { category, page = 1, pageSize = 10 } = params;
  
  // Most Popular API doesn't support pagination directly, so we'll fetch all and paginate manually
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
 * Fetches articles from the NY Times API combining search and popular articles
 */
export async function fetchNYTimesArticles(params: FetchArticlesParams): Promise<ArticlesResponse> {
  try {
    // Use search API if query is provided, otherwise use most popular for better results
    if (params.query) {
      return fetchNYTimesSearchArticles(params);
    }

    // Fetch from both APIs in parallel
    const [searchResponse, popularResponse] = await Promise.all([
      fetchNYTimesSearchArticles(params),
      fetchNYTimesPopularArticles(params)
    ]);

    // If both APIs failed, return empty response
    if (searchResponse.articles.length === 0 && popularResponse.articles.length === 0) {
      return emptyResponse(params.page || 1, params.pageSize || 10);
    }

    // Combine and deduplicate articles
    const combinedArticles = [
      ...searchResponse.articles,
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
