import {Suspense} from 'react';
import Journey from '@/app/journey';
export default function Page(){return <Suspense fallback={<main className="content skeleton"><p>Preparing your direction…</p></main>}><Journey today="2026-09-18"/></Suspense>;}
