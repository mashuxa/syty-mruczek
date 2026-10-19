import '../globals.css';
import '../features.css';
import { pageMetadata } from '@/lib/seo';
export const metadata=pageMetadata('pl');
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pl"><body>{children}</body></html>;}
