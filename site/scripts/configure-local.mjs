// Generates local relay authentication without printing or committing the secret.
import { randomBytes, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
let old='';try{old=await readFile('.env.local','utf8');}catch{}
const token=(!process.argv.includes('--rotate') && old.match(/^RESTAURANT_RELAY_TOKEN=(.+)$/m)?.[1]) || randomBytes(32).toString('hex');
const hash=createHash('sha256').update(token).digest('hex');
await writeFile('.env.local',`RESTAURANT_FUNCTION_URL=https://cfwocsqltypzuuxlofdu.supabase.co/functions/v1/restaurant-leads-v1\nRESTAURANT_RELAY_TOKEN=${token}\nAPP_ORIGIN=http://127.0.0.1:3000\nLEAD_NOTIFICATION_EMAIL=\n`);
await writeFile('supabase/functions/restaurant-leads-v1/relay-config.ts',`// Only a one-way hash is committed; the random token stays in server environment variables.\nexport const RELAY_TOKEN_SHA256 = '${hash}';\n`);
console.log('Local server configuration ready; relay secret was not printed.');
