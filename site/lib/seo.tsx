import type { Metadata } from 'next';
import type { Locale } from './lead-schema';
import { localePaths, seoContent, siteUrl } from './site-content';
const languages=Object.fromEntries(Object.entries(localePaths).map(([l,p])=>[l,`${siteUrl}${p}`]));
export function pageMetadata(locale:Locale):Metadata{
 const text=seoContent[locale],url=`${siteUrl}${localePaths[locale]}`;
 const preview=process.env.VERCEL_ENV==='preview';
 const image={url:`${siteUrl}/social-card-v1.png`,width:1200,height:630,alt:'Syty Kotek — domowe obiady, Pruszków. Rudy kot z łyżką.'};
 return {metadataBase:new URL(siteUrl),title:text.title,description:text.description,applicationName:'Syty Kotek',alternates:{canonical:url,languages:{...languages,'x-default':`${siteUrl}/`}},robots:{index:!preview,follow:!preview},openGraph:{type:'website',url,siteName:'Syty Kotek',title:text.title,description:text.description,locale:{pl:'pl_PL',ru:'ru_PL',uk:'uk_PL'}[locale],images:[image]},twitter:{card:'summary_large_image',title:text.title,description:text.description,images:[image.url]},icons:{icon:{url:'/favicon.svg',type:'image/svg+xml'},apple:'/apple-icon'}};
}
export function BusinessSchema({locale}:{locale:Locale}){
 const data={'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':`${siteUrl}/#organization`,name:'Syty Kotek',url:siteUrl,logo:`${siteUrl}/syty-kotek.png`},{'@type':'Service',name:seoContent[locale].title,description:seoContent[locale].description,url:`${siteUrl}${localePaths[locale]}`,provider:{'@id':`${siteUrl}/#organization`},areaServed:{'@type':'Place',name:'Pruszków oraz do 5 km od granic miasta'},availableLanguage:['pl','ru','uk']}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>;
}
