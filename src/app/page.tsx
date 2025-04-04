'use client';

import { useEffect } from 'react';
import { useArticles } from './hooks/useArticles';
import { NewsCategory } from './lib/api';
import Layout from '@/components/layout/Layout';
import ArticleCard from '@/components/news/ArticleCard';

export default function Home() {
  const { 
    articles, 
    loading, 
    error, 
    hasMore, 
    loadMore,
    setCategory,
    setQuery
  } = useArticles({
    initialCategory: NewsCategory.GENERAL,
    pageSize: 10
  });

  // Listen for category and search changes from the Layout
  useEffect(() => {
    const handleCategoryChange = (e: CustomEvent<NewsCategory>) => {
      setCategory(e.detail);
    };
    
    const handleSearchQuery = (e: CustomEvent<string>) => {
      setQuery(e.detail);
    };
    
    window.addEventListener('category-change', handleCategoryChange as EventListener);
    window.addEventListener('search-query', handleSearchQuery as EventListener);
    
    return () => {
      window.removeEventListener('category-change', handleCategoryChange as EventListener);
      window.removeEventListener('search-query', handleSearchQuery as EventListener);
    };
  }, [setCategory, setQuery]);
  
  // Simple infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !loading
      ) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMore]);

  return (
    <Layout latestArticles={articles.slice(0, 5)}>
      <section className="news-section">
        <h2 className="section-heading">Latest News</h2>
        
        {error && <div className="error-message">Error: {error.message}</div>}
        
        <div className="articles-grid">
          {articles.map((article, index) => (
            <ArticleCard 
              key={article.id} 
              article={article}
              featured={index === 0}
              breaking={index === 1}
            />
          ))}
        </div>
        
        {loading && <div className="loading">Loading more articles...</div>}
        
        {!hasMore && !loading && articles.length > 0 && (
          <div className="no-more-results">No more articles to load</div>
        )}
      </section>
    </Layout>
  );
}