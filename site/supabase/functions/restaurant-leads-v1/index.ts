import postgres from 'postgres';
import { validateLead } from '../../../lib/lead-schema.ts';
import { RELAY_TOKEN_SHA256 } from './relay-config.ts';

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, {
  max: 1, prepare: false, idle_timeout: 10, connect_timeout: 10,
});
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store' },
});
async function sha256(s: string) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' },405);
  const token = req.headers.get('x-restaurant-token') || '';
  if (token.length > 256 || await sha256(token) !== RELAY_TOKEN_SHA256) return json({ error: 'unauthorized' },401);
  if (!req.headers.get('content-type')?.includes('application/json')) return json({ error: 'invalid_content_type' },415);
  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > 8192) return json({ error:'payload_too_large' },413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error:'invalid_json' },400); }
  const parsed = validateLead(body.lead);
  if (!parsed.ok || !/^[a-f0-9]{64}$/.test(body.networkKey ?? '') || !/^[a-f0-9]{64}$/.test(body.contactKey ?? '')) return json({error:'invalid_request'},400);
  const lead = parsed.value;
  try {
    const digest = await sha256(JSON.stringify(lead));
    const result = await sql`select restaurant.submit_lead(
      ${lead.requestId}::uuid, ${lead.place}, ${lead.mealType}, ${lead.people},
      ${lead.contact}, ${lead.name}, ${lead.notes}, ${lead.locale},
      ${digest}, ${body.networkKey}, ${body.contactKey}
    ) as result`;
    return json({ ok:true, id:result[0].result.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('rate_limited')) return json({ error:'rate_limited' },429);
    if (message.includes('idempotency_conflict')) return json({ error:'idempotency_conflict' },409);
    console.error('Restaurant lead insert failed', error instanceof Error ? error.name : 'unknown');
    return json({ error:'storage_unavailable' },503);
  }
});
