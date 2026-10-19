import { readFile,writeFile } from 'node:fs/promises';
import { randomBytes,scryptSync } from 'node:crypto';
let password='';for await(const chunk of process.stdin)password+=chunk;
password=password.trim();if(!password||password.length>256)throw Error('Invalid password input');
const salt=randomBytes(16).toString('hex');
const encoded=`scrypt:${salt}:${scryptSync(password,salt,32).toString('hex')}`;
let source=await readFile('.env.local','utf8');source=source.replace(/^RESTAURANT_ADMIN_PASSWORD_HASH=.*\r?\n?/m,'');
await writeFile('.env.local',source.trimEnd()+`\nRESTAURANT_ADMIN_PASSWORD_HASH=${encoded}\n`);
console.log('Admin password hash configured. Password and hash were not printed.');
