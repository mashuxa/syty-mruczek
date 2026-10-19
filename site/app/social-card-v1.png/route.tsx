import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
export const runtime='nodejs';
export const dynamic='force-static';
export async function GET(){
 const image=await readFile(join(process.cwd(),'public/syty-kotek.png'));
 return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#fbf8ee',color:'#24483c',alignItems:'center',padding:'40px 48px',fontFamily:'sans-serif'}}><div style={{display:'flex',flexDirection:'column',width:600,paddingRight:10}}><div style={{fontSize:25,letterSpacing:3,marginBottom:28}}>SYTY KOTEK</div><div style={{fontSize:70,fontWeight:700,lineHeight:1.1}}>Domowe obiady z dostawą</div><div style={{fontSize:33,marginTop:30}}>Pruszków + do 5 km</div><div style={{fontSize:23,marginTop:20,color:'#647069'}}>Danie główne · zupa · przekąska</div></div><img src={`data:image/png;base64,${image.toString('base64')}`} width={520} height={520}/></div>,{width:1200,height:630,headers:{'Cache-Control':'public, max-age=31536000, immutable'}});
}
