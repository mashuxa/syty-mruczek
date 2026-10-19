import postgres from 'postgres';
import { RELAY_TOKEN_SHA256 } from '../restaurant-leads-v1/relay-config.ts';
const sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{max:1,prepare:false,idle_timeout:10,connect_timeout:10});
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const hash=async(s:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const hex=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const token=req.headers.get('x-restaurant-token')??'';
 if(token.length>256||await hash(token)!==RELAY_TOKEN_SHA256)return json({error:'unauthorized'},401);
 const text=await req.text();if(new TextEncoder().encode(text).length>2048)return json({error:'invalid_request'},413);
 let body;try{body=JSON.parse(text);}catch{return json({error:'invalid_request'},400);}
 if(!body||typeof body!=='object')return json({error:'invalid_request'},400);
 try{
  if(body.action==='login_attempt'&&hex(body.networkKey)){
   const rows=await sql`select restaurant.consume_admin_login(${body.networkKey}) as allowed`;return json({allowed:rows[0].allowed});
  }
  if(body.action==='track_visit'&&hex(body.visitorKey)&&hex(body.networkKey)&&/^\d{4}-\d{2}-\d{2}$/.test(body.day??'')&&['/','/ru','/uk'].includes(body.path)&&['pl','ru','uk'].includes(body.locale)){
   await sql`select restaurant.record_visit(${body.visitorKey},${body.day}::date,${body.path},${body.locale},${body.networkKey})`;return json({ok:true});
  }
  if(body.action==='list_leads'&&Number.isSafeInteger(body.page)&&body.page>=1&&body.page<=100000&&/^\d{4}-\d{2}-\d{2}$/.test(body.day??'')){
   const offset=(body.page-1)*20;
   const leads=await sql`select id,place,meal_type,people,contact,contact_name,notes,locale,status,created_at from restaurant.leads order by created_at desc,id desc limit 20 offset ${offset}`;
   const count=await sql`select count(*) as total from restaurant.leads`;
   const visits=await sql`select count(*) filter(where visit_day=${body.day}::date) as today,count(*) filter(where visit_day between ${body.day}::date-6 and ${body.day}::date) as week from restaurant.visits`;
   return json({leads,total:Number(count[0].total),visitsToday:Number(visits[0].today),visitsWeek:Number(visits[0].week)});
  }
  return json({error:'invalid_request'},400);
 }catch(error){console.error('Restaurant app request failed',error instanceof Error?error.name:'unknown');return json({error:'unavailable'},503);}
});
