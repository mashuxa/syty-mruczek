import { NextRequest,NextResponse } from 'next/server';
import { sameOrigin,trustedIp } from '@/lib/http';
import { privateHash,restaurantRequest } from '@/lib/restaurant-server';
import { newSession,sessionCookie,sessionSeconds,verifyPassword } from '@/lib/admin-auth';
export const runtime='nodejs';
const json=(error:string,status:number)=>NextResponse.json({error},{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return json('forbidden',403);
 if(!req.headers.get('content-type')?.includes('application/json'))return json('invalid_request',415);
 const text=await req.text();if(Buffer.byteLength(text)>1024)return json('invalid_request',413);
 let body;try{body=JSON.parse(text);}catch{return json('invalid_request',400);}
 if(!body||typeof body.password!=='string'||body.password.length>256)return json('invalid_request',400);
 try{
  const attempt=await restaurantRequest({action:'login_attempt',networkKey:privateHash('login:'+ (trustedIp(req)||'shared-network'))});
  if(!attempt.allowed)return json('rate_limited',429);
  if(!await verifyPassword(body.password))return json('invalid_credentials',401);
  const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set(sessionCookie,newSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/superuser',maxAge:sessionSeconds});
  return response;
 }catch{return json('temporarily_unavailable',503);}
}
