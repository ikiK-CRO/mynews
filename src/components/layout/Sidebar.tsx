'use client';

import React from 'react';
import Link from 'next/link';
import { NewsCategory, Article } from '@/app/lib/api';

interface SidebarProps {
  activeCategory?: NewsCategory;
  onCategoryChange?: (category: NewsCategory) => void;
  latestArticles?: Article[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  onCategoryChange,
  latestArticles = []
}) => {
  const categoryIcons: Record<string, string> = {
    'general': '🏠',
    'technology': '💻',
    'business': '💼',
    'health': '🏥',
    'science': '🔬',
    'sports': '⚽',
    'entertainment': '🎬'
  };
  
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Categories</h3>
        <div className="sidebar-categories">
          {Object.values(NewsCategory).map(category => (
            <button
              key={category}
              className={`category-item ${activeCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange?.(category as NewsCategory)}
            >
              <span className="category-name">
                {categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {latestArticles.length > 0 && (
        <div className="sidebar-section">
          <h3 className="sidebar-heading">Latest News</h3>
          <div className="latest-news-list">
            {latestArticles.slice(0, 5).map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="latest-news-item"
              >
                <div className="news-time">
                  {new Date(article.publishedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <h4 className="news-title">{article.title}</h4>
              </a>
            ))}
          </div>
          <Link href="/latest" className="see-all-link">
            See all news
          </Link>
        </div>
      )}
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Quick Links</h3>
        <nav className="sidebar-menu">
          <Link href="/" className="menu-item">
            <div className="menu-icon">🏠</div>
            <span className="menu-text">Home</span>
          </Link>
          <Link href="/featured" className="menu-item">
            <div className="menu-icon">⭐</div>
            <span className="menu-text">Featured</span>
          </Link>
          <Link href="/saved" className="menu-item">
            <div className="menu-icon">❤️</div>
            <span className="menu-text">Saved Articles</span>
          </Link>
          <Link href="/settings" className="menu-item">
            <div className="menu-icon">⚙️</div>
            <span className="menu-text">Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 