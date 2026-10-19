import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-content';
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:'*',allow:process.env.VERCEL_ENV==='preview'?undefined:'/',disallow:process.env.VERCEL_ENV==='preview'?'/':['/api/','/superuser/','/superuser']}],sitemap:`${siteUrl}/sitemap.xml`};}
