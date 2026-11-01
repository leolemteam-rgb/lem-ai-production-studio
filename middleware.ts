import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
 cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}
 });
 const {data:{user}}=await client.auth.getUser();
 const path=request.nextUrl.pathname;
 if(!user && (path.startsWith('/dashboard')||path.startsWith('/api/sermons')))return NextResponse.redirect(new URL('/login',request.url));
 return response;
}
export const config={matcher:['/dashboard/:path*','/api/sermons/:path*']};
