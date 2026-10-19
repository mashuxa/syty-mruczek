import { NextRequest,NextResponse } from 'next/server';
import { sameOrigin,trustedIp,warsawDay } from '@/lib/http';
import { privateHash,restaurantRequest } from '@/lib/restaurant-server';
export const runtime='nodejs';
const done=()=>new NextResponse(null,{status:204,headers:{'Cache-Control':'no-store'}});
const bots=/bot|crawler|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|preview|monitor|uptime|curl|wget|python|node\.js/i;
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return new NextResponse(null,{status:403});
 const ua=req.headers.get('user-agent')??'',ip=trustedIp(req);
 if(!ip||!ua||ua.length>512||bots.test(ua)||req.headers.get('purpose')==='prefetch'||req.headers.get('sec-purpose')?.includes('prefetch'))return done();
 if(!req.headers.get('content-type')?.includes('application/json'))return done();
 const text=await req.text();if(Buffer.byteLength(text)>1024)return done();
 let data;try{data=JSON.parse(text);}catch{return done();}
 if(!data||data.automated===true||!['/','/ru','/uk'].includes(data.path)||!['pl','ru','uk'].includes(data.locale))return done();
 try{const day=warsawDay();await restaurantRequest({action:'track_visit',visitorKey:privateHash(`visit:${day}:${ip}:${ua}`),networkKey:privateHash(`visit-network:${day}:${ip}`),day,path:data.path,locale:data.locale});}catch{/* Analytics never blocks the lunch request. */}
 return done();
}
