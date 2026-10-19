import '../globals.css';
import '../features.css';
import { pageMetadata } from '@/lib/seo';
export const metadata=pageMetadata('ru');
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>;}
