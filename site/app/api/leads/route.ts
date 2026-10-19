import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { validateLead } from '@/lib/lead-schema';

export const runtime = 'nodejs';
const response = (body: unknown, status = 200) => NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req: NextRequest) {
  const permitted = new Set([process.env.APP_ORIGIN, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined, process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined].filter(Boolean));
  if (process.env.NODE_ENV === 'development') permitted.add(new URL(req.url).origin);
  const origin = req.headers.get('origin');
  if (!origin || !permitted.has(origin)) return response({error:'origin_not_allowed'},403);
  if (!req.headers.get('content-type')?.includes('application/json')) return response({error:'invalid_content_type'},415);
  const raw = await req.text();
  if (Buffer.byteLength(raw,'utf8') > 8192) return response({error:'payload_too_large'},413);
  let input: unknown;
  try { input=JSON.parse(raw); } catch { return response({error:'invalid_json'},400); }
  const result=validateLead(input);
  if (!result.ok) return response({error:'invalid_request',field:result.field},400);
  const endpoint=process.env.RESTAURANT_FUNCTION_URL;
  const token=process.env.RESTAURANT_RELAY_TOKEN;
  if (!endpoint || !token || token.length < 32) return response({error:'not_configured'},503);
  const hash=(s:string)=>createHmac('sha256',token).update(s).digest('hex');
  // Only trust proxy IP headers on Vercel or an explicitly configured trusted proxy.
  const ip=process.env.VERCEL === '1'
    ? req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()
    : process.env.TRUST_PROXY === '1' ? req.headers.get('x-forwarded-for')?.split(',')[0].trim() : undefined;
  const contact=result.value.contact.includes('@') ? result.value.contact.toLowerCase() : result.value.contact.replace(/\D/g,'');
  try {
    const remote=await fetch(endpoint,{
      method:'POST',cache:'no-store',signal:AbortSignal.timeout(20000),
      headers:{'Content-Type':'application/json','x-restaurant-token':token},
      body:JSON.stringify({lead:result.value,networkKey:hash(ip || 'unverified-network'),contactKey:hash(contact)}),
    });
    const data=await remote.json();
    if (!remote.ok) {
      const status=remote.status===429?429:remote.status===409?409:503;
      return response({error:status===429?'rate_limited':status===409?'idempotency_conflict':'storage_unavailable'},status);
    }
    if (!data.ok || typeof data.id !== 'string') return response({error:'storage_unavailable'},503);
    return response({ok:true,id:data.id,notification:'placeholder'},201);
  } catch {
    return response({error:'storage_unavailable'},503);
  }
}
