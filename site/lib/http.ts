import { NextRequest } from 'next/server';
import { isIP } from 'node:net';
export function sameOrigin(req:NextRequest){
 const allowed=new Set([process.env.APP_ORIGIN,process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:undefined,process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:undefined].filter(Boolean));
 if(process.env.NODE_ENV==='development')allowed.add(new URL(req.url).origin);
 return allowed.has(req.headers.get('origin')??'');
}
export function trustedIp(req:NextRequest){
 const raw=process.env.VERCEL==='1'?req.headers.get('x-vercel-forwarded-for'):process.env.TRUST_PROXY==='1'?req.headers.get('x-forwarded-for'):undefined;
 const ip=raw?.split(',')[0].trim();return ip&&isIP(ip)?ip:undefined;
}
export function warsawDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
