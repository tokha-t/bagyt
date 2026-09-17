import {NextResponse} from 'next/server';
import {decodeProfile,encodeProfile,profileHash,summary} from '@/lib/profile';
import {Profile} from '@/lib/types';
export const runtime='nodejs';
const cache=new Map<string,{text:string;source:'template'|'ai'}>();
export async function POST(request:Request){
 let body:unknown;try{body=await request.json();}catch{return NextResponse.json({error:'Please supply a profile.'},{status:400});}
 if(!body||typeof body!=='object'||!('profile' in body)||!body.profile||typeof body.profile!=='object')return NextResponse.json({error:'Please supply a profile.'},{status:400});
 let p:Profile;try{p=decodeProfile(encodeProfile(body.profile as Profile));}catch{return NextResponse.json({error:'Please check your profile fields.'},{status:400});}
 const key=profileHash(p);const hit=cache.get(key);if(hit)return NextResponse.json(hit);
 const fallback={text:summary(p),source:'template' as const};
 // Optional AI is intentionally disabled until the factual-output acceptance gate is verified.
 cache.set(key,fallback);return NextResponse.json(fallback);
}
