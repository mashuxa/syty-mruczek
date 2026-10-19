import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Syty Mruczek — domowe obiady do pracy | Pruszków',
  description: 'Zapytaj o domowe obiady dla swojej ekipy. Pruszków i do 5 km od miasta. Danie główne, zupa i przekąska — wybierz zestaw dla swojej grupy.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl"><body>{children}</body></html>;
}
