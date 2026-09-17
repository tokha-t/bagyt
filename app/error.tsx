"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="content panel"><h1>Let’s try that again.</h1><p>This page could not be shown. Your profile remains in the address bar.</p><button onClick={reset}>Try again</button><a className="button" href="/">Go home</a></main>;}
