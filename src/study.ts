export type StudyRecord = { id:string; task:string; subject:string; ms:number; at:number; result:string; difficulty?:string; plannedMs?:number; startedAt?:number; planItemId?:string; interrupted?:boolean };
export type Task = {id:string; subject:string; title:string; minutes:number; priority:number};
export type PlanItem = {id:string; taskId?:string; subject:string; title:string; kind:'focus'|'break'|'reflection'; minutes:number};
export type StudyPlan = {id:string; date:string; available:number; items:PlanItem[]; confirmed:boolean; basis:string};
export const SUBJECTS=['수학','영어','국어','과학','사회','기타'];
export const localDate=(at:number)=>new Date(at).toLocaleDateString('sv-SE');
export function recentRecords(records:StudyRecord[],now=Date.now()){return records.filter(r=>Number.isFinite(r.ms)&&r.ms>=0&&Number.isFinite(r.at)&&r.at<=now&&r.at>=now-90*86400000);}
export function recommendMinutes(records:StudyRecord[],preferred=25){
 const recent=[...records].sort((a,b)=>b.at-a.at).slice(0,5);
 if(recent.length<3)return {minutes:preferred,basis:'기록이 3회 미만이라 선택한 집중 시간을 기준으로 제안해요.'};
 if(recent.filter(r=>r.difficulty==='어려움').length>=2||recent.filter(r=>r.interrupted).length>=2)return {minutes:Math.min(preferred,15),basis:`최근 ${recent.length}회에서 어려움 또는 중단이 반복돼 15분 이하로 나눠 제안해요.`};
 return {minutes:preferred,basis:`최근 ${recent.length}회 기록을 참고하되, 선택한 집중 시간을 유지했어요.`};
}
export function generatePlan(tasks:Task[],available:number,focus:number,rest:number,basis:string):StudyPlan{
 if(!Number.isInteger(available)||available<10||available>480||!Number.isFinite(focus)||focus<5||focus>50||!Number.isFinite(rest)||rest<1||rest>15||tasks.length===0)throw Error('할 일과 가용 시간(10~480분)을 확인해 주세요.');
 const sorted=[...tasks].sort((a,b)=>b.priority-a.priority);const remaining=new Map(sorted.map(t=>[t.id,t.minutes]));
 const items:PlanItem[]=[];let budget=available-2;let previous=false;
 for(let round=0;round<100&&budget>=5;round++){
   const task=sorted.find(t=>(remaining.get(t.id)||0)>0);if(!task)break;
   const breakCost=previous?rest:0;if(budget-breakCost<5)break;
   const take=Math.min(focus,remaining.get(task.id)!,budget-breakCost);if(take<1)break;
   if(previous){items.push({id:crypto.randomUUID(),kind:'break',subject:'휴식',title:'눈과 몸 쉬어가기',minutes:rest});budget-=rest;}
   items.push({id:crypto.randomUUID(),taskId:task.id,kind:'focus',subject:task.subject,title:task.title,minutes:take});budget-=take;remaining.set(task.id,remaining.get(task.id)!-take);previous=true;
 }
 if(!items.length)throw Error('집중할 시간을 확보해 주세요.');
 items.push({id:crypto.randomUUID(),kind:'reflection',subject:'회고',title:'오늘의 공부 돌아보기',minutes:2});
 return {id:crypto.randomUUID(),date:localDate(Date.now()),available,items,confirmed:false,basis};
}
export function validatePlan(plan:StudyPlan){return plan.items.length>0&&plan.items.every(i=>Number.isInteger(i.minutes)&&i.minutes>=1&&i.minutes<=120)&&plan.items.reduce((s,i)=>s+i.minutes,0)<=plan.available;}
export function analyze(records:StudyRecord[],now=Date.now()){
 const recent=recentRecords(records,now);const days=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);const date=localDate(d.getTime());return {date,label:d.toLocaleDateString('ko-KR',{weekday:'short'}),minutes:Math.round(recent.filter(r=>localDate(r.at)===date).reduce((s,r)=>s+r.ms,0)/60000)};});
 const week=recent.filter(r=>days.some(d=>d.date===localDate(r.at)));
 const subjects=SUBJECTS.map(subject=>{const rs=week.filter(r=>r.subject===subject);return {subject,count:rs.length,minutes:Math.round(rs.reduce((s,r)=>s+r.ms,0)/60000)};}).filter(s=>s.count>0);
 const periods=[{name:'아침',start:6,end:12},{name:'오후',start:12,end:18},{name:'저녁',start:18,end:24},{name:'새벽',start:0,end:6}].map(p=>{const rs=week.filter(r=>{const h=new Date(r.startedAt??r.at-r.ms).getHours();return h>=p.start&&h<p.end;});return {...p,count:rs.length,completed:rs.filter(r=>r.result==='완료').length};});
 const best=periods.filter(p=>p.count>=3).sort((a,b)=>b.completed/b.count-a.completed/a.count)[0]??null;
 return {days,week,subjects,best,count:week.length,completed:week.filter(r=>r.result==='완료').length,avgMinutes:week.length?Math.round(week.reduce((s,r)=>s+r.ms,0)/week.length/60000):0,hardCount:week.filter(r=>r.difficulty==='어려움').length};
}
export function rewards(records:StudyRecord[]){
 const unique=[...new Map(records.map(r=>[r.id,r])).values()].sort((a,b)=>a.at-b.at);
 const completed=unique.filter(r=>r.result==='완료'&&r.ms>0);const days=new Set(unique.filter(r=>r.ms>0).map(r=>localDate(r.at)));
 const comeback=unique.some((r,i)=>r.ms>0&&unique.slice(0,i).some(p=>p.interrupted&&localDate(p.at)===localDate(r.at)));
 return [{id:'first',icon:'🌱',title:'첫 걸음',description:'첫 목표 완료',earned:completed.length>=1,progress:`${Math.min(1,completed.length)}/1`},{id:'three',icon:'🌿',title:'차곡차곡',description:'서로 다른 목표 세션 3회 완료',earned:completed.length>=3,progress:`${Math.min(3,completed.length)}/3`},{id:'days',icon:'🌼',title:'나의 리듬',description:'연속 여부와 관계없이 3일 기록',earned:days.size>=3,progress:`${Math.min(3,days.size)}/3`},{id:'return',icon:'☀️',title:'다시 시작',description:'중단한 날 새 집중 기록 남기기',earned:comeback,progress:comeback?'획득':'도전 중'}];
}
export function localCoach(records:StudyRecord[],topic:string,preferred=25){
 const stats=analyze(records);const recommendation=recommendMinutes(records,preferred);
 if(topic.includes('피곤'))return {message:'피곤할 때는 분량보다 회복이 먼저예요. 물을 마시고 5분 쉬어간 뒤, 10분만 시작해 보세요.',reason:stats.count?`최근 7일 ${stats.count}회 기록을 참고한 기본 안내예요. 피로 원인은 판단하지 않아요.`:'기록이 없어 일반적인 휴식 안내를 드려요.',focusMinutes:10};
 if(topic.includes('시작'))return {message:'지금 할 수 있는 가장 작은 한 가지를 골라 10분만 시작해 볼까요? 다 끝내지 않아도 괜찮아요.',reason:'시작 부담을 줄이는 기본 전략이에요. 공부량은 자동으로 늘리지 않아요.',focusMinutes:10};
 if(stats.count<3)return {message:'아직 패턴을 판단할 기록이 적어요. 작은 목표 하나로 시작하고, 끝나면 난이도를 남겨 주세요.',reason:`최근 7일 ${stats.count}회 기록이 있어요. 3회 이상 쌓이면 시간대와 난이도를 함께 살펴볼 수 있어요.`,focusMinutes:preferred};
 return {message:topic.includes('계획')?'우선순위가 높은 할 일부터, 휴식과 회고를 포함해 가능한 시간 안에 나눠 보세요.':recommendation.minutes<preferred?'다음 세션은 짧게 나누고, 한 번에 끝낼 분량을 줄여 볼까요?':'지금 선택한 집중 시간을 유지하며, 마친 뒤 분량이 적절했는지 돌아보세요.',reason:recommendation.basis,focusMinutes:recommendation.minutes};
}
export type CoachReply={message:string;reason:string;focusMinutes:number};
export function validReply(value:unknown):value is CoachReply {const v=value as CoachReply;return !!v&&typeof v.message==='string'&&v.message.length>0&&v.message.length<=800&&typeof v.reason==='string'&&v.reason.length<=400&&Number.isInteger(v.focusMinutes)&&v.focusMinutes>=5&&v.focusMinutes<=50;}
