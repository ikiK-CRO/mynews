'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NewsSource, Article } from '../lib/api';

interface ApiResult {
  articles: Article[];
  totalResults: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  error?: string;
}

export default function TestPage() {
  const [newsApiResults, setNewsApiResults] = useState<ApiResult | null>(null);
  const [nyTimesResults, setNyTimesResults] = useState<ApiResult | null>(null);
  const [combinedResults, setCombinedResults] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState({
    newsApi: false,
    nyTimes: false,
    combined: false
  });
  const [error, setError] = useState<{
    newsApi: string | null;
    nyTimes: string | null;
    combined: string | null;
  }>({
    newsApi: null,
    nyTimes: null,
    combined: null
  });

  const testNewsApi = async () => {
    setLoading(prev => ({ ...prev, newsApi: true }));
    setError(prev => ({ ...prev, newsApi: null }));
    
    try {
      const response = await fetch(`/api/news?source=${NewsSource.NEWS_API}`);
      const data = await response.json();
      setNewsApiResults(data);
    } catch (err) {
      console.error('Error testing NewsAPI:', err);
      setError(prev => ({ ...prev, newsApi: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(prev => ({ ...prev, newsApi: false }));
    }
  };

  const testNyTimes = async () => {
    setLoading(prev => ({ ...prev, nyTimes: true }));
    setError(prev => ({ ...prev, nyTimes: null }));
    
    try {
      const response = await fetch(`/api/news?source=${NewsSource.NY_TIMES}`);
      const data = await response.json();
      setNyTimesResults(data);
    } catch (err) {
      console.error('Error testing NY Times API:', err);
      setError(prev => ({ ...prev, nyTimes: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(prev => ({ ...prev, nyTimes: false }));
    }
  };

  const testCombined = async () => {
    setLoading(prev => ({ ...prev, combined: true }));
    setError(prev => ({ ...prev, combined: null }));
    
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setCombinedResults(data);
    } catch (err) {
      console.error('Error testing combined API:', err);
      setError(prev => ({ ...prev, combined: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(prev => ({ ...prev, combined: false }));
    }
  };

  const formatResults = (results: ApiResult | null) => {
    if (!results) return null;
    
    return (
      <div className="results">
        <p>Total results: {results.totalResults}</p>
        <p>Articles fetched: {results.articles?.length || 0}</p>
        <p>Has more: {results.hasMore ? 'Yes' : 'No'}</p>
        
        {results.articles?.length > 0 && (
          <div>
            <h3>First article:</h3>
            <pre className="json-box">
              {JSON.stringify(results.articles[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>API Test Page</h1>
      <p>
        <Link href="/">Back to Home</Link>
      </p>
      
      <div className="test-section">
        <h2>Test NewsAPI</h2>
        <button 
          onClick={testNewsApi} 
          disabled={loading.newsApi}
        >
          {loading.newsApi ? 'Loading...' : 'Run Test'}
        </button>
        {error.newsApi && <p className="error">Error: {error.newsApi}</p>}
        {formatResults(newsApiResults)}
      </div>

      <div className="test-section">
        <h2>Test NY Times API</h2>
        <button 
          onClick={testNyTimes} 
          disabled={loading.nyTimes}
        >
          {loading.nyTimes ? 'Loading...' : 'Run Test'}
        </button>
        {error.nyTimes && <p className="error">Error: {error.nyTimes}</p>}
        {formatResults(nyTimesResults)}
      </div>

      <div className="test-section">
        <h2>Test Combined APIs</h2>
        <button 
          onClick={testCombined} 
          disabled={loading.combined}
        >
          {loading.combined ? 'Loading...' : 'Run Test'}
        </button>
        {error.combined && <p className="error">Error: {error.combined}</p>}
        {formatResults(combinedResults)}
      </div>

      <style jsx>{`
        .test-section {
          margin-bottom: 2rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }
        
        .json-box {
          background-color: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 1rem;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 1rem;
          font-size: 0.8rem;
        }
        
        .error {
          color: var(--accent-color);
          font-weight: bold;
        }
        
        button {
          padding: 0.5rem 1rem;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 0;
        }
        
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
