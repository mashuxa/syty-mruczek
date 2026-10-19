import 'server-only';
import { createHmac } from 'node:crypto';
export function privateHash(value:string){const key=process.env.RESTAURANT_RELAY_TOKEN;if(!key)throw Error('not_configured');return createHmac('sha256',key).update(value).digest('hex');}
export async function restaurantRequest(body:unknown){
 const base=process.env.RESTAURANT_FUNCTION_URL,token=process.env.RESTAURANT_RELAY_TOKEN;
 if(!base||!token)throw Error('not_configured');
 const url=new URL('/functions/v1/restaurant-app-v1',base);
 const response=await fetch(url,{method:'POST',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json','x-restaurant-token':token},body:JSON.stringify(body)});
 if(!response.ok)throw Error('service_unavailable');return response.json();
}
