import { Article, FetchArticlesParams, ArticlesResponse } from './types';

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';
const NEWSAPI_KEY = process.env.NEWSAPI_KEY || '';

interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
  code?: string;
  message?: string;
}

/**
 * Transforms NewsAPI article to our unified Article format
 */
const transformArticle = (article: NewsApiArticle, category: string): Article => {
  return {
    id: `newsapi-${Buffer.from(article.url).toString('base64')}`,
    title: article.title,
    description: article.description || '',
    content: article.content || '',
    url: article.url,
    imageUrl: article.urlToImage,
    publishedAt: article.publishedAt,
    source: article.source.name,
    category,
    author: article.author,
  };
};

/**
 * Fetches articles from NewsAPI
 */
export async function fetchNewsApiArticles(params: FetchArticlesParams): Promise<ArticlesResponse> {
  const { category = 'general', query = '', page = 1, pageSize = 10 } = params;
  
  let endpoint = '/top-headlines';
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (category) {
    queryParams.append('category', category);
  }

  if (query) {
    if (endpoint === '/top-headlines') {
      queryParams.append('q', query);
    } else {
      endpoint = '/everything';
      queryParams.append('q', query);
    }
  }

  // If no category or query is provided, use country parameter for headlines
  if (endpoint === '/top-headlines' && !query) {
    queryParams.append('country', 'us');
  }

  try {
    // Using the X-Api-Key header for authentication (recommended by NewsAPI)
    const response = await fetch(`${NEWSAPI_BASE_URL}${endpoint}?${queryParams}`, {
      headers: {
        'X-Api-Key': NEWSAPI_KEY
      }
    });
    
    const data: NewsApiResponse = await response.json();
    
    // Check for error responses
    if (response.status !== 200 || data.status !== 'ok') {
      const errorMessage = data.message || `NewsAPI responded with status: ${response.status}`;
      console.error(`NewsAPI error: ${errorMessage}`);
      
      // Return empty results on error rather than failing completely
      return {
        articles: [],
        totalResults: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }
    
    const articles = data.articles.map(article => transformArticle(article, category));
    
    return {
      articles,
      totalResults: data.totalResults,
      page,
      pageSize,
      hasMore: page * pageSize < data.totalResults,
    };
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    // Return empty results on error rather than failing completely
    return {
      articles: [],
      totalResults: 0,
      page,
      pageSize,
      hasMore: false,
    };
  }
}
