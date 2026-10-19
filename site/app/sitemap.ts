import type { MetadataRoute } from 'next';
import { siteUrl,localePaths } from '@/lib/site-content';
export default function sitemap():MetadataRoute.Sitemap{const languages=Object.fromEntries(Object.entries(localePaths).map(([l,p])=>[l,`${siteUrl}${p}`]));return Object.values(localePaths).map(path=>({url:`${siteUrl}${path}`,alternates:{languages}}));}
