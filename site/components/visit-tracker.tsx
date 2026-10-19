'use client';
import { useEffect,useRef } from 'react';
import type { Locale } from '@/lib/lead-schema';
import { localePaths } from '@/lib/site-content';
export default function VisitTracker({locale}:{locale:Locale}){
 const sent=useRef(false);
 useEffect(()=>{const track=()=>{if(sent.current||document.visibilityState!=='visible'||navigator.webdriver)return;sent.current=true;void fetch('/api/visits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:localePaths[locale],locale,automated:false}),keepalive:true}).catch(()=>{});};track();document.addEventListener('visibilitychange',track);return()=>document.removeEventListener('visibilitychange',track);},[locale]);
 return null;
}
