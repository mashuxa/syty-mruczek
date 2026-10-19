// Generates local relay authentication without printing or committing the secret.
import { randomBytes, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
let old='';try{old=await readFile('.env.local','utf8');}catch{}
const token=(!process.argv.includes('--rotate') && old.match(/^RESTAURANT_RELAY_TOKEN=(.+)$/m)?.[1]) || randomBytes(32).toString('hex');
const hash=createHash('sha256').update(token).digest('hex');
const values=new Map(old.split(/\r?\n/).filter(line=>line.includes('=')).map(line=>[line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1)]));
values.set('RESTAURANT_FUNCTION_URL','https://cfwocsqltypzuuxlofdu.supabase.co/functions/v1/restaurant-leads-v1');
values.set('RESTAURANT_RELAY_TOKEN',token);
if(!values.has('APP_ORIGIN'))values.set('APP_ORIGIN','http://127.0.0.1:3000');
if(!values.has('LEAD_NOTIFICATION_EMAIL'))values.set('LEAD_NOTIFICATION_EMAIL','');
await writeFile('.env.local',[...values].map(([key,value])=>`${key}=${value}`).join('\n')+'\n');
await writeFile('supabase/functions/restaurant-leads-v1/relay-config.ts',`// Only a one-way hash is committed; the random token stays in server environment variables.\nexport const RELAY_TOKEN_SHA256 = '${hash}';\n`);
console.log('Local server configuration ready; relay secret was not printed.');
