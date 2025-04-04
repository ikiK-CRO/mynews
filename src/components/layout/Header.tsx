'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NewsCategory } from '@/app/lib/api';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  onSearch?: (query: string) => void;
  activeCategory?: NewsCategory;
  onCategoryChange?: (category: NewsCategory) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  activeCategory, 
  onCategoryChange 
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
    }
  };
  
  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="brand">
              MyNews
            </Link>
            
            <nav className="navigation">
              <Link href="/">Home</Link>
              <Link href="/featured">Featured</Link>
              <Link href="/latest">Latest</Link>
            </nav>
            
            <button 
              className="menu-toggle" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <form className="search-container" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search news"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          
          <nav>
            <ul className="category-nav">
              {Object.values(NewsCategory).map(category => (
                <li key={category}>
                  <button 
                    onClick={() => onCategoryChange?.(category as NewsCategory)}
                    className={`category-button ${activeCategory === category ? 'active' : ''}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        onSearch={onSearch}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />
    </>
  );
};

export default Header; 