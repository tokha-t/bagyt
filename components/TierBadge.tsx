import {Tier} from '@/lib/types';
export default function TierBadge({tier}:{tier:Tier}){return <span className={`tier ${tier}`}>● {({strong:'Strong fit',realistic:'Realistic fit',stretch:'Stretch',notyet:'Not yet'})[tier]}</span>;}
