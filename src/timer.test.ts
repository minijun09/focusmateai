import {test} from 'node:test';
import assert from 'node:assert/strict';
import {elapsed,pause,canPrompt,formatTime,type Timer} from './timer.ts';
const timer:Timer={id:'a',kind:'focus',status:'running',durationMs:60000,elapsedMs:10000,startedAt:1000,task:'오답',subject:'수학'};
test('일시정지 이후 시간 제외 및 최대 시간 제한',()=>{const p=pause(timer,6000);assert.equal(elapsed(p,30000),15000);assert.equal(elapsed(timer,100000),60000);});
test('5초 이상 이탈 후 같은 활성 집중 세션에서만 안내',()=>{const pending={sessionId:'a',hiddenAt:2000};assert.equal(canPrompt(timer,pending,6999,null,true),false);assert.equal(canPrompt(timer,pending,7000,null,true),true);assert.equal(canPrompt(timer,{...pending,sessionId:'b'},7000,null,true),false);});
test('휴식·정지·비활성·종료·반복 안내 제외',()=>{const p={sessionId:'a',hiddenAt:1000};assert.equal(canPrompt({...timer,kind:'break'},p,9000,null,true),false);assert.equal(canPrompt({...timer,status:'paused'},p,9000,null,true),false);assert.equal(canPrompt(timer,p,9000,null,false),false);assert.equal(canPrompt(timer,p,9000,8000,true),false);assert.equal(canPrompt(timer,p,100000,null,true),false);});
test('남은 초는 올림하고 음수 시간은 0으로 표시',()=>{assert.equal(formatTime(59999),'01:00');assert.equal(formatTime(-1),'00:00');});
