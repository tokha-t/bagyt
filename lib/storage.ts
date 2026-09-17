const KEY='bagyt:completed:v1';
export function readCompleted():Set<string>{try{const value:unknown=JSON.parse(localStorage.getItem(KEY)??'[]');return new Set(Array.isArray(value)?value.filter((v):v is string=>typeof v==='string'):[]);}catch{return new Set();}}
export function writeCompleted(ids:Set<string>):void{try{localStorage.setItem(KEY,JSON.stringify([...ids]));}catch{/* Ephemeral progress remains usable. */}}
