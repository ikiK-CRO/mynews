'use client';

import React, { useState } from 'react';
import { Article } from '@/app/lib/api';

// Helper function to ensure image URLs are properly formatted
const getFormattedImageUrl = (url: string | null): string => {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return `https://www.nytimes.com${url}`;
};

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  breaking?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  featured = false, 
  breaking = false 
}) => {
  const [imageError, setImageError] = useState(false);
  const placeholderImage = '/images/placeholder.jpg';
  const imageUrl = !imageError ? getFormattedImageUrl(article.imageUrl) : placeholderImage;

  return (
    <article className={`article-card ${featured ? 'featured' : ''} ${breaking ? 'breaking' : ''}`}>
      <div className="article-image">
        {/* Use regular img tag to avoid Next.js Image component issues */}
        <img 
          src={imageUrl}
          alt={article.title}
          onError={() => setImageError(true)}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      
      {breaking && (
        <div className="breaking-indicator">
          <span className="breaking-label">Breaking</span>
        </div>
      )}
      
      <div className="article-content">
        <span className={`article-category category-badge ${article.category}`}>
          {article.category}
        </span>
        
        <h2 className="article-title">
          {article.title}
        </h2>
        
        <p className="article-description">
          {article.description}
        </p>
        
        <div className="article-meta">
          <span className="article-source">{article.source}</span>
          <span className="article-date">{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
        
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
          Read more
        </a>
      </div>
    </article>
  );
};

export default ArticleCard; 