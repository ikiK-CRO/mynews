'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsCategory } from '@/app/lib/api';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  activeCategory?: NewsCategory;
  onCategoryChange?: (category: NewsCategory) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onSearch,
  activeCategory,
  onCategoryChange
}) => {
  const [searchInput, setSearchInput] = useState('');
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
      onClose();
    }
  };
  
  const handleCategoryClick = (category: NewsCategory) => {
    if (onCategoryChange) {
      onCategoryChange(category);
      onClose();
    }
  };
  
  return (
    <>
      <div className={`menu-backdrop ${isOpen ? 'active' : ''}`} onClick={onClose} />
      
      <div className={`mobile-menu ${isOpen ? 'active' : ''}`}>
        <div className="menu-header">
          <Link href="/" className="brand" onClick={onClose}>
            MyNews
          </Link>
          
          <button className="close-menu" onClick={onClose} aria-label="Close menu">
            &times;
          </button>
        </div>
        
        <div className="menu-search">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search news"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>
        
        <div className="menu-body">
          <div className="menu-categories">
            {Object.entries({
              'general': { icon: '🏠', label: 'Home' },
              'technology': { icon: '💻', label: 'Technology' },
              'business': { icon: '💼', label: 'Business' },
              'health': { icon: '🏥', label: 'Health' },
              'science': { icon: '🔬', label: 'Science' },
              'sports': { icon: '⚽', label: 'Sports' },
              'entertainment': { icon: '🎬', label: 'Entertainment' }
            }).map(([category, { icon, label }]) => (
              <button
                key={category}
                className={`category-item ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category as NewsCategory)}
              >
                <span className="category-icon">{icon}</span>
                <span className="category-label">{label}</span>
              </button>
            ))}
          </div>
          
          <div className="menu-links">
            <Link href="/" className="menu-link" onClick={onClose}>
              Home
            </Link>
            <Link href="/featured" className="menu-link" onClick={onClose}>
              Featured
            </Link>
            <Link href="/latest" className="menu-link" onClick={onClose}>
              Latest
            </Link>
            <Link href="/saved" className="menu-link" onClick={onClose}>
              Saved Articles
            </Link>
            <Link href="/settings" className="menu-link" onClick={onClose}>
              Settings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu; 