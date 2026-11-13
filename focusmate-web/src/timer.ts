export type Timer = { id: string; kind: 'focus'|'break'; status: 'idle'|'running'|'paused'|'completed'; durationMs: number; elapsedMs: number; startedAt: number|null; task: string; subject: string };
export type Pending = { sessionId: string; hiddenAt: number };
export const freshTimer = (minutes=25, kind: Timer['kind']='focus'): Timer => ({id:crypto.randomUUID(),kind,status:'idle',durationMs:minutes*60000,elapsedMs:0,startedAt:null,task:'',subject:'수학'});
export function elapsed(timer:Timer, now:number):number { return Math.min(timer.durationMs, Math.max(0,timer.elapsedMs+(timer.startedAt===null?0:Math.max(0,now-timer.startedAt)))); }
export function pause(timer:Timer, now:number):Timer { return {...timer,elapsedMs:elapsed(timer,now),startedAt:null,status:'paused'}; }
export function canPrompt(timer:Timer, pending:Pending|null, now:number, lastPrompt:number|null, enabled:boolean):boolean { return enabled && timer.kind==='focus' && timer.status==='running' && elapsed(timer,now)<timer.durationMs && pending!==null && pending.sessionId===timer.id && now-pending.hiddenAt>=5000 && (lastPrompt===null||now-lastPrompt>=60000); }
export function formatTime(ms:number):string { const seconds=Math.ceil(Math.max(0,ms)/1000); return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`; }
