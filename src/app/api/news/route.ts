import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchArticles, 
  fetchArticlesBySource, 
  NewsCategory, 
  NewsSource,
  ArticlesResponse
} from '@/app/lib/api';

/**
 * GET handler for news articles
 * Query parameters:
 * - category: Filter by category
 * - query: Search term
 * - page: Page number (default: 1)
 * - pageSize: Articles per page (default: 10)
 * - source: Specific news source (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get('category');
    const queryParam = searchParams.get('query');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const sourceParam = searchParams.get('source');

    // Validate and process parameters
    const category = categoryParam && Object.values(NewsCategory).includes(categoryParam as NewsCategory)
      ? categoryParam
      : undefined;

    const query = queryParam || '';
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    let response: ArticlesResponse;

    // Handle request based on source parameter
    if (sourceParam) {
      const source = sourceParam as NewsSource;
      
      if (!Object.values(NewsSource).includes(source)) {
        return NextResponse.json(
          { error: `Invalid source. Must be one of: ${Object.values(NewsSource).join(', ')}` },
          { status: 400 }
        );
      }

      response = await fetchArticlesBySource(source, {
        category: category as string,
        query,
        page,
        pageSize
      });
    } else {
      // Fetch from all sources
      response = await fetchArticles({
        category: category as string,
        query,
        page,
        pageSize
      });
    }

    // Add cache headers for better performance
    const headers = new Headers();
    headers.append('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    return NextResponse.json(response, { 
      status: 200,
      headers
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch articles', 
        articles: [],
        totalResults: 0,
        page: 1,
        pageSize: 10,
        hasMore: false 
      },
      { status: 500 }
    );
  }
}
