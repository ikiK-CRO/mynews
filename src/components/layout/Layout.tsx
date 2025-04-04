'use client';

import React, { ReactNode, useState } from 'react';
import { NewsCategory, Article } from '@/app/lib/api';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  latestArticles?: Article[];
  withSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  latestArticles = [],
  withSidebar = true
}) => {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(NewsCategory.GENERAL);
  
  // Custom event handlers for category change and search
  const handleCategoryChange = (category: NewsCategory) => {
    setActiveCategory(category);
    // Dispatch custom event that page components can listen to
    window.dispatchEvent(new CustomEvent('category-change', { detail: category }));
  };
  
  const handleSearch = (query: string) => {
    // Dispatch custom event that page components can listen to
    window.dispatchEvent(new CustomEvent('search-query', { detail: query }));
  };
  
  return (
    <>
      <Header 
        onSearch={handleSearch}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <main className="container">
        {withSidebar ? (
          <div className="main-content-with-sidebar">
            <div className="news-main">
              {children}
            </div>
            <Sidebar 
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              latestArticles={latestArticles}
            />
          </div>
        ) : (
          children
        )}
      </main>
    </>
  );
};

export default Layout; 