import 'server-only';
import { createHmac,scrypt,timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
const derive=promisify(scrypt);
export const sessionCookie='restaurant_admin';
export const sessionSeconds=12*60*60;
function signingKey(){const key=process.env.RESTAURANT_RELAY_TOKEN,hash=process.env.RESTAURANT_ADMIN_PASSWORD_HASH;if(!key||!hash)throw Error('not_configured');return createHmac('sha256',key).update('admin-session-v1:'+hash).digest();}
function signature(time:string){return createHmac('sha256',signingKey()).update(time).digest('base64url');}
export function newSession(){const time=Math.floor(Date.now()/1000).toString();return `${time}.${signature(time)}`;}
export function validSession(value:string|undefined){
 if(!value||value.length>200)return false;
 const [time,mac,...extra]=value.split('.');if(extra.length||!/^\d{10}$/.test(time)||!mac)return false;
 const age=Math.floor(Date.now()/1000)-Number(time);if(age<0||age>sessionSeconds)return false;
 try{const actual=Buffer.from(mac,'base64url'),expected=Buffer.from(signature(time),'base64url');return actual.length===expected.length&&timingSafeEqual(actual,expected);}catch{return false;}
}
export async function authenticated(){return validSession((await cookies()).get(sessionCookie)?.value);}
export async function verifyPassword(password:string){
 const encoded=process.env.RESTAURANT_ADMIN_PASSWORD_HASH;if(!encoded)throw Error('not_configured');
 const [kind,salt,hash]=encoded.split(':');if(kind!=='scrypt'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{64}$/.test(hash))throw Error('not_configured');
 const expected=Buffer.from(hash,'hex'),actual=await derive(password,salt,32) as Buffer;
 return timingSafeEqual(actual,expected);
}
