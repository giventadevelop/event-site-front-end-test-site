import type { Metadata } from 'next';
import { Anek_Malayalam, DM_Sans } from 'next/font/google';
/**
 * Same scroll / sticky foundation as /mosc (syro-malabar.css + .syro-layout):
 * html:has(.syro-layout) + body flex column so `position: sticky` works on mobile
 * and the home page (global html/body overflow-x alone can break sticky).
 */
import '@/styles/syro-malabar.css';
import '@/styles/mosc-redesign-shell.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const anekMalayalam = Anek_Malayalam({
  subsets: ['latin', 'malayalam'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-anek-malayalam',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Malankara Orthodox Syrian Church',
    default: 'Malankara Orthodox Syrian Church',
  },
  description:
    'Malankara Orthodox Syrian Church — redesigned experience. Subpages use the Syro site shell.',
};

export default function MoscRedesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} ${anekMalayalam.variable} ${dmSans.className} syro-layout min-h-screen bg-parchment font-dm-sans text-warmGray-dark antialiased`}
    >
      {children}
    </div>
  );
}
