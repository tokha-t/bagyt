import {Provenance} from '@/lib/types';
export default function SourceBadge({provenance:p}:{provenance:Provenance}){return p.status==='verified'?<a className="source verified" href={p.sourceUrl} target="_blank" rel="noopener noreferrer">Verified ↗ <span>checked {p.checkedOn}</span></a>:<span className={`source ${p.status}`}>{p.status==='demo'?'Demo':`Expected · ${p.basis}`}</span>;}
