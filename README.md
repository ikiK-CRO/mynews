# MyNews App

A full-stack application for reading the latest news stories as they happen around the world.

## Features

- News article aggregation from multiple sources (NewsAPI and NY Times)
- Category-based article browsing
- Search functionality
- Infinite scroll for latest news
- Responsive design matching Figma specs
- Dark mode support

## Prerequisites

- Node.js v18 or higher
- API keys for [NewsAPI](https://newsapi.org/) and [NY Times API](https://developer.nytimes.com/)

## Setup

1. Clone the repository

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   NEWSAPI_KEY=your_newsapi_key_here
   NYTIMES_API_KEY=your_nytimes_api_key_here
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app directory
  - `/api` - API routes
  - `/lib` - Utility functions, API clients
  - `/hooks` - React hooks
  - `/components` - React components

## Technologies Used

- Next.js 15 (App Router)
- React 19
- TypeScript
- SCSS/Sass for styling
- NewsAPI.org and NY Times API for news data

## Implementation Notes

- The app uses a unified API client that fetches from multiple news sources
- Articles are displayed in a responsive grid layout
- Category filtering and search functionality work across both news sources
- Infinite scroll is implemented for continuous loading of articles

## Planned Features

- User authentication
- Bookmarking favorite articles
- Personalized news feed
- Push notifications for breaking news

## License

MIT
