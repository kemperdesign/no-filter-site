import './globals.css';
import { Alfa_Slab_One, Archivo, Big_Shoulders_Display, Special_Elite } from 'next/font/google';

const slab = Alfa_Slab_One({ weight: '400', subsets: ['latin'], variable: '--font-slab' });
const body = Archivo({ subsets: ['latin'], variable: '--font-body' });
const display = Big_Shoulders_Display({ weight: ['800', '900'], subsets: ['latin'], variable: '--font-display' });
const type = Special_Elite({ weight: '400', subsets: ['latin'], variable: '--font-type' });

export const metadata = {
  title: 'No Filter Music',
  description:
    'No Filter is a Jacksonville dance band playing classic rock and oldies. See upcoming shows, hear original tracks, and book the band.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${slab.variable} ${body.variable} ${display.variable} ${type.variable}`}>
      <body>{children}</body>
    </html>
  );
}
