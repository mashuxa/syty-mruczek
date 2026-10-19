import { NextRequest,NextResponse } from 'next/server';
import { authenticated } from '@/lib/admin-auth';
import { sameOrigin } from '@/lib/http';
import { restaurantRequest } from '@/lib/restaurant-server';
export const runtime='nodejs';
// Lives under /superuser so the admin session cookie (path=/superuser) is sent with the request.
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses=['new','contacted','qualified','closed','test'];
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return respond({error:'forbidden'},403);
 if(!await authenticated())return respond({error:'unauthorized'},401);
 if(!req.headers.get('content-type')?.includes('application/json'))return respond({error:'invalid_request'},415);
 const text=await req.text();if(Buffer.byteLength(text)>2048)return respond({error:'invalid_request'},413);
 let body;try{body=JSON.parse(text);}catch{return respond({error:'invalid_request'},400);}
 const ids=body?.ids;
 if(!Array.isArray(ids)||ids.length<1||ids.length>20||new Set(ids).size!==ids.length||!ids.every((id:unknown)=>typeof id==='string'&&uuid.test(id)))return respond({error:'invalid_request'},400);
 try{
  if(body.action==='delete')return respond(await restaurantRequest({action:'delete_leads',ids}));
  if(body.action==='status'&&statuses.includes(body.status))return respond(await restaurantRequest({action:'update_leads_status',ids,status:body.status}));
  return respond({error:'invalid_request'},400);
 }catch{return respond({error:'temporarily_unavailable'},503);}
}
