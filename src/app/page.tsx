'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useArticles } from './hooks/useArticles';
import { NewsCategory } from './lib/api';

// Placeholder component - this will be replaced with proper UI components matching Figma
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

  const [searchInput, setSearchInput] = useState('');
  
  // Handle search input with simple debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== undefined) {
        setQuery(searchInput);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput, setQuery]);
  
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
    <div className="container">
      <header>
        <h1>MyNews</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search news"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button>Search</button>
        </div>
        
        <nav>
          <ul className="category-nav">
            {Object.values(NewsCategory).map(category => (
              <li key={category}>
                <button 
                  onClick={() => setCategory(category as NewsCategory)}
                  className="category-button"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        {error && <div className="error-message">Error: {error.message}</div>}
        
        <div className="articles-grid">
          {articles.map(article => (
            <div key={article.id} className="article-card">
              {article.imageUrl && (
                <div className="article-image">
                  <img src={article.imageUrl} alt={article.title} />
                </div>
              )}
              <div className="article-content">
                <span className="article-category">{article.category.toUpperCase()}</span>
                <h2 className="article-title">{article.title}</h2>
                <p className="article-description">{article.description}</p>
                <div className="article-meta">
                  <span>{article.source}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
                  Read more
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {loading && <div className="loading">Loading more articles...</div>}
        
        {!hasMore && !loading && (
          <div className="no-more-results">No more articles to load</div>
        )}
      </main>

      <nav>
        <Link href="/signin">
          Sign In
        </Link>{' '}
        |{' '}
        <Link href="/signup">
          Sign Up
        </Link>
      </nav>
    </div>
  );
}