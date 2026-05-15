// ── Theme switcher ──
const tdots=document.querySelectorAll('.tdot');
tdots.forEach(d=>{
  d.addEventListener('click',()=>{
    document.documentElement.setAttribute('data-theme',d.dataset.t);
    tdots.forEach(x=>x.classList.remove('active'));
    d.classList.add('active');
  });
});

// ── Word banks ──
const BANKS={
  easy:"the and for are but not you all can her was one our out had day has him his how man new now old see two way who boy did its let put say she too use about after also back been best big came case come does each even find first from gave give good great hand have here high home just keep kind know last left life like long look made make many most must name need next only open over part past people place real said same show side some such take than that their them then there this time under very well went were when will with work world would year your".split(" "),
  medium:"about achieve balance because believe between beyond bright build certain challenge change choice clarity constant create define different difficult dream every evolve failure focus follow future growth guide human imagine improve include journey knowledge learn manage matter measure might never notice observe overcome perfect possible practice purpose quality reason remain result return rhythm sentence simple skills solve something start strong study success system target through together toward travel truth until usually variety version vision without wonder working".split(" "),
  hard:"aberration accomplish acquisition ambiguous anecdote anticipate arbitrary beneficial bureaucratic catastrophic circumstance coincidence collaborate comprehensive consequence constitution contemporary controversial cultivate deficiency deliberate denominator dissatisfaction documentation eloquently emphasize entrepreneur environment equilibrium exaggeration extraordinary feasibility fundamental generalization hallucination hypothetically identification implication inconsistency infrastructure interpretation jurisdiction knowledgeable legitimately miscellaneous multiplication nevertheless oblivious optimization particularly philosophical predicament prerequisite prioritization questionnaire reconciliation sophisticated subsequently surveillance technological theoretical unprecedented vulnerability".split(" ")
};

let words=[],wIdx=0,cIdx=0,timerInt=null,timeLeft=30,totalDur=30,started=false;
let correct=0,wrong=0,totalTyped=0,wordsCorrect=0,difficulty='easy',history=[];

function clearCursor(){document.querySelectorAll('.cursor').forEach(el=>el.classList.remove('cursor'));}
function setCursor(wi,ci){clearCursor();const el=document.getElementById(`c${wi}_${ci}`);if(el)el.classList.add('cursor');}
function rnd(n){const b=BANKS[difficulty];return Array.from({length:n},()=>b[Math.floor(Math.random()*b.length)]);}

function initGame(){
  clearInterval(timerInt);
  totalDur=+document.getElementById('timer-select').value;
  timeLeft=totalDur;started=false;correct=0;wrong=0;totalTyped=0;wordsCorrect=0;wIdx=0;cIdx=0;
  document.getElementById('timer-val').textContent=timeLeft;
  document.getElementById('wpm-val').textContent='0';
  document.getElementById('acc-val').textContent='100%';
  document.getElementById('words-done').textContent='0';
  document.getElementById('progress').style.width='0%';
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('sdot').className='sdot';
  document.getElementById('stext').textContent='Click to start typing…';
  document.getElementById('typing-box').classList.remove('focused');
  words=rnd(120);renderWords();
  document.getElementById('hidden-input').value='';
  focusInput();
}

function renderWords(){
  const c=document.getElementById('words');c.innerHTML='';
  words.forEach((w,wi)=>{
    const el=document.createElement('span');el.className='word';
    [...w].forEach((ch,ci)=>{
      const s=document.createElement('span');
      s.className='char pending';s.textContent=ch;s.id=`c${wi}_${ci}`;
      el.appendChild(s);
    });
    c.appendChild(el);
  });
  setCursor(0,0);
}

function focusInput(){document.getElementById('hidden-input').focus();}
function scrollToTest(){document.getElementById('typing-box').scrollIntoView({behavior:'smooth'});focusInput();}

function calcWPM(){return Math.round(wordsCorrect/Math.max((totalDur-timeLeft)/60,.0167));}
function calcAcc(){return totalTyped>0?Math.round((correct/totalTyped)*100):100;}
function updateStats(){
  document.getElementById('wpm-val').textContent=calcWPM();
  document.getElementById('acc-val').textContent=calcAcc()+'%';
  document.getElementById('words-done').textContent=wordsCorrect;
}
function getGrade(w,a){const s=w*(a/100);return s>=80?'S':s>=60?'A':s>=45?'B':s>=30?'C':s>=15?'D':'F';}

function addHistory(wpm,acc,dur,wd){
  history.unshift({wpm,acc,dur,wd,diff:difficulty,ts:new Date().toLocaleTimeString()});
  if(history.length>8)history.pop();
  renderHistory();
}
function renderHistory(){
  document.getElementById('hist-count').textContent=history.length+' test'+(history.length!==1?'s':'');
  const body=document.getElementById('history-body');
  if(!history.length){body.innerHTML='<p class="no-hist">No tests yet — complete a test to see your history.</p>';return;}
  body.innerHTML=`<table class="htable">
    <thead><tr><th>#</th><th>Time</th><th>WPM</th><th>Accuracy</th><th>Words</th><th>Duration</th><th>Level</th><th>Grade</th></tr></thead>
    <tbody>${history.map((r,i)=>`<tr>
      <td>${history.length-i}</td><td>${r.ts}</td>
      <td><strong>${r.wpm}</strong></td><td>${r.acc}%</td>
      <td>${r.wd}</td><td>${r.dur}s</td>
      <td><span class="badge ${r.diff}">${r.diff}</span></td>
      <td><strong>${getGrade(r.wpm,r.acc)}</strong></td>
    </tr>`).join('')}</tbody></table>`;
}

function showResult(){
  clearInterval(timerInt);updateStats();
  const wpm=calcWPM(),acc=calcAcc();
  document.getElementById('r-wpm').textContent=wpm;
  document.getElementById('r-acc').textContent=acc+'%';
  document.getElementById('r-time').textContent=totalDur+'s';
  document.getElementById('r-words').textContent=wordsCorrect;
  document.getElementById('r-grade').textContent='Grade: '+getGrade(wpm,acc);
  addHistory(wpm,acc,totalDur,wordsCorrect);
  document.getElementById('overlay').classList.add('show');
}

function startTimer(){
  document.getElementById('sdot').className='sdot active';
  document.getElementById('stext').textContent='Test in progress…';
  document.getElementById('typing-box').classList.add('focused');
  timerInt=setInterval(()=>{
    timeLeft--;
    document.getElementById('timer-val').textContent=timeLeft;
    document.getElementById('progress').style.width=((totalDur-timeLeft)/totalDur*100)+'%';
    updateStats();
    if(timeLeft<=0)showResult();
  },1000);
}

document.getElementById('hidden-input').addEventListener('input',e=>{
  if(timeLeft<=0)return;
  const val=e.target.value,w=words[wIdx];

  // ignore bare space with nothing typed
  if(val.trim()===''){ e.target.value=''; return; }

  if(!started){started=true;startTimer();}

  if(val.endsWith(' ')){
    const typed=val.trim();
    if(!typed){ e.target.value=''; return; } // space only — skip
    // score each char of the word
    [...w].forEach((ch,i)=>{
      const c=document.getElementById(`c${wIdx}_${i}`);
      if(!c)return;
      if(i<typed.length) c.className='char '+(typed[i]===ch?'correct':'wrong');
      else c.className='char wrong'; // untyped chars
    });
    // count correct chars typed
    let wCorrect=0;
    [...typed].forEach((ch,i)=>{ if(i<w.length&&ch===w[i])wCorrect++; });
    correct+=wCorrect; wrong+=(w.length-wCorrect); totalTyped+=w.length;
    wordsCorrect++;
    wIdx++;cIdx=0;
    // extend word list if running low
    if(wIdx>=words.length-10){
      words=[...words,...rnd(40)];
      // append new word elements without full re-render
      const container=document.getElementById('words');
      const start=words.length-40;
      words.slice(start).forEach((wd,offset)=>{
        const wi=start+offset;
        const el=document.createElement('span');el.className='word';el.id='w'+wi;
        [...wd].forEach((ch,ci)=>{
          const s=document.createElement('span');
          s.className='char pending';s.textContent=ch;s.id=`c${wi}_${ci}`;
          el.appendChild(s);
        });
        container.appendChild(el);
      });
    }
    setCursor(wIdx,0);
    // scroll current word into view
    const curWord=document.getElementById('w'+wIdx);
    if(curWord) curWord.scrollIntoView({block:'nearest',behavior:'smooth'});
    e.target.value='';updateStats();return;
  }

  const tc=[...val];
  for(let i=0;i<w.length;i++){const c=document.getElementById(`c${wIdx}_${i}`);if(c)c.className='char pending';}
  tc.forEach((ch,i)=>{if(i>=w.length)return;const c=document.getElementById(`c${wIdx}_${i}`);if(c)c.className='char '+(ch===w[i]?'correct':'wrong');});
  cIdx=tc.length;
  setCursor(wIdx,Math.min(cIdx,w.length-1));
  updateStats();
});

document.getElementById('hidden-input').addEventListener('keydown',e=>{if(e.key==='Escape')initGame();});
document.getElementById('difficulty').querySelectorAll('.pill').forEach(p=>{
  p.addEventListener('click',()=>{
    document.getElementById('difficulty').querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');difficulty=p.dataset.val;initGame();
  });
});
document.getElementById('timer-select').addEventListener('change',initGame);

renderHistory();
initGame();
