/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.nytimes.com',
      'static01.nyt.com',
      'nyt.com',
      'i.nytimes.com',
      'static.nytimes.com',
      'images.unsplash.com',
      's3.amazonaws.com',
      'source.unsplash.com',
      'media.istockphoto.com',
      'ichef.bbci.co.uk',
      'cdn.pixabay.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig; 