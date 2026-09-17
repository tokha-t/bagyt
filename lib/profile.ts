import { Profile, Field, GradeBand, Lang, LangLevel, BudgetBand, Region, StartYear } from './types';
export const DEFAULT_PROFILE: Profile = {grade:11,field:'undecided'};
export const FIELDS: Field[] = ['it','medicine','engineering','business','law','design','education','science','humanities','media','agriculture','undecided'];
export const BUDGETS: BudgetBand[] = ['grant-only','under-1m','1-3m','3-6m','over-6m'];
export const REGIONS: Region[] = ['my-city','kazakhstan','central-asia','turkiye','europe','asia','any'];
export const LABELS: Record<string,string> = {it:'IT & computing',medicine:'Medicine',engineering:'Engineering',business:'Business',law:'Law',design:'Design',education:'Education',science:'Science',humanities:'Humanities',media:'Media',agriculture:'Agriculture',undecided:'Still exploring','grant-only':'Grant only','under-1m':'Up to ₸1m','1-3m':'₸1–3m','3-6m':'₸3–6m','over-6m':'Over ₸6m','my-city':'My city',kazakhstan:'Kazakhstan','central-asia':'Central Asia',turkiye:'Türkiye',europe:'Europe',asia:'Asia',any:'Anywhere',kk:'Kazakh',ru:'Russian',en:'English',academic:'Academic fit',financial:'Budget fit',language:'Language',field:'Your interests',geography:'Location',timing:'Preparation time'};
const bands:Record<string,GradeBand>={e:'excellent',g:'good',a:'average',u:'undisclosed'};
const levels:Record<string,LangLevel>={f:'fluent',w:'working',b:'basic'};
export function decodeProfile(qs:string|URLSearchParams):Profile {
 try {
 const q=new URLSearchParams(qs);const p:Profile={...DEFAULT_PROFILE};
 const g=q.get('g'); if(g==='grad')p.grade='graduated';else if(g&&['9','10','11'].includes(g))p.grade=Number(g) as 9|10|11;
 const f=q.get('f');if(FIELDS.includes(f as Field))p.field=f as Field;
 const gb=q.get('gb');if(gb&&bands[gb])p.gradeBand=bands[gb];
 const u=q.get('unt');if(u&&/^\d+$/.test(u)&&+u>=50&&+u<=140)p.unt=+u;
 const langs:Partial<Record<Lang,LangLevel>>={};for(const item of (q.get('l')??'').split(',')){const [l,v]=item.split(':');if(['kk','ru','en'].includes(l)&&levels[v])langs[l as Lang]=levels[v];}if(Object.keys(langs).length)p.languages=langs;
 const ec=q.get('ec');if(ec==='none'||ec==='planned')p.englishCert={kind:ec};else if(ec){const [k,v]=ec.split(':');const n=Number(v);if(k==='ielts'&&n>=4&&n<=9&&n*2%1===0)p.englishCert={kind:k,band:n};if(k==='toefl'&&v&&n>=0&&n<=120&&Number.isInteger(n))p.englishCert={kind:k,score:n};}
 const b=q.get('b');if(BUDGETS.includes(b as BudgetBand))p.budget=b as BudgetBand;
 const r=(q.get('r')??'').split(',').filter(x=>REGIONS.includes(x as Region)) as Region[];if(r.length)p.regions=[...new Set(r)];
 const y=Number(q.get('y'));if([2027,2028,2029].includes(y))p.startYear=y as StartYear;
 return p;
 }catch{return {...DEFAULT_PROFILE};}
}
export function encodeProfile(p:Profile):string {
 const q=new URLSearchParams();q.set('g',p.grade==='graduated'?'grad':String(p.grade));q.set('f',p.field);
 if(p.gradeBand)q.set('gb',p.gradeBand[0]);if(p.unt!==undefined)q.set('unt',String(p.unt));
 if(p.languages){const l=(['kk','ru','en'] as Lang[]).flatMap(k=>p.languages?.[k]?[`${k}:${p.languages[k]?.[0]}`]:[]).join(',');if(l)q.set('l',l);}
 const ec=p.englishCert;if(ec)q.set('ec',ec.kind==='ielts'?`ielts:${ec.band}`:ec.kind==='toefl'?`toefl:${ec.score}`:ec.kind);
 if(p.budget)q.set('b',p.budget);if(p.regions?.length)q.set('r',[...p.regions].sort().join(','));if(p.startYear)q.set('y',String(p.startYear));return q.toString();
}
export function profileHash(p:Profile):string{return encodeProfile(p);}
export function summary(p:Profile):string {return `You are ${p.grade==='graduated'?'a graduate':`in grade ${p.grade}`} and exploring ${LABELS[p.field]}. ${p.unt!==undefined?`Your UNT score is ${p.unt}.`:'An UNT score would sharpen your academic comparison.'} ${p.budget?`Your budget is ${LABELS[p.budget]}.`:'Add a budget to make cost trade-offs clearer.'} Compare your options, then work through your preparation plan.`;}
