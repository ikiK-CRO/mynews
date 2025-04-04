import localFont from 'next/font/local';

export const inter = localFont({
  src: [
    {
      path: '../../fonts/inter/InterVariable.woff2',
      style: 'normal',
    },
    {
      path: '../../fonts/inter/InterVariable-Italic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
});
