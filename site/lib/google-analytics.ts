'use client';
import type { Locale,MealType } from './lead-schema';
export const measurementId='G-TF93RXBLCE';
export const analyticsConsentKey='syty-kotek-analytics-consent-v1';
export type AnalyticsChoice='granted'|'denied';
declare global {interface Window {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;sytyAnalyticsStarted?:boolean;sytyAnalyticsAllowed?:boolean;}}
const disabledKey=`ga-disable-${measurementId}`;
export function readAnalyticsChoice():AnalyticsChoice|null{
 try{const stored=JSON.parse(localStorage.getItem(analyticsConsentKey)||'null');return stored&&['granted','denied'].includes(stored.choice)&&Date.now()-stored.time<180*24*60*60*1000&&stored.time<=Date.now()?stored.choice:null;}catch{return null;}
}
function pageLocation(){return location.origin+location.pathname;}
function pageReferrer(){try{const url=new URL(document.referrer);return ['http:','https:'].includes(url.protocol)?url.origin+url.pathname:'';}catch{return '';}}
export function allowAnalytics(){
 if(location.hostname!=='sytykotek.pl'||!['/','/ru','/uk'].includes(location.pathname))return;
 window.sytyAnalyticsAllowed=true;(window as unknown as Record<string,unknown>)[disabledKey]=false;
 if(window.sytyAnalyticsStarted)return;
 window.sytyAnalyticsStarted=true;window.dataLayer=window.dataLayer||[];
 window.gtag=function(...args:unknown[]){window.dataLayer!.push(arguments);};
 window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('js',new Date());
 window.gtag('config',measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:180*24*60*60,cookie_update:false,page_location:pageLocation(),page_referrer:pageReferrer()});
 window.gtag('event','page_view',{send_to:measurementId,page_location:pageLocation(),page_referrer:pageReferrer(),page_title:document.title});
 const script=document.createElement('script');script.id='syty-google-analytics';script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;document.head.appendChild(script);
}
export function denyAnalytics(){
 window.sytyAnalyticsAllowed=false;(window as unknown as Record<string,unknown>)[disabledKey]=true;
 const names=document.cookie.split(';').map(v=>v.trim().split('=')[0]).filter(name=>/^_ga(?:_|$)/.test(name));
 for(const name of names)for(const domain of ['',`; domain=${location.hostname}`,`; domain=.${location.hostname}`])document.cookie=`${name}=; Max-Age=0; path=/${domain}; SameSite=Lax; Secure`;
}
export function saveAnalyticsChoice(choice:AnalyticsChoice){try{localStorage.setItem(analyticsConsentKey,JSON.stringify({choice,time:Date.now()}));}catch{}if(choice==='granted')allowAnalytics();else denyAnalytics();}
export function trackLead({locale,mealType,people}:{locale:Locale;mealType:MealType;people:number}){
 if(!window.sytyAnalyticsAllowed||!window.gtag)return;
 try{window.gtag('event','generate_lead',{send_to:measurementId,language:locale,meal_type:mealType,group_size:people,page_location:pageLocation()});}catch{/* Analytics must never change the saved request result. */}
}
