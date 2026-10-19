import '../globals.css';
import '../features.css';
import { pageMetadata } from '@/lib/seo';
export const metadata=pageMetadata('uk');
export default function Layout({children}:{children:React.ReactNode}){return <html lang="uk"><body>{children}</body></html>;}
