import { NextRequest,NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/http';
import { sessionCookie } from '@/lib/admin-auth';
export async function POST(req:NextRequest){if(!sameOrigin(req))return new NextResponse(null,{status:403});const response=NextResponse.redirect(new URL('/superuser/login',req.url),303);response.cookies.set(sessionCookie,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/superuser',maxAge:0});return response;}
