import './globals.css';
import { Alfa_Slab_One, Archivo } from 'next/font/google';

const slab = Alfa_Slab_One({ weight: '400', subsets: ['latin'], variable: '--font-slab' });
const body = Archivo({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'No Filter Music',
  description:
    'No Filter is a Jacksonville dance band playing classic rock, oldies and country. See upcoming shows, hear original tracks, and book the band.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${slab.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
