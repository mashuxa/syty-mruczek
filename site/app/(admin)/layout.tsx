import type { Metadata } from 'next';
import '../globals.css';
import '../features.css';
export const metadata:Metadata={title:'Заявки — Syty Kotek',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>;}
