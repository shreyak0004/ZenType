const SUPABASE_URL =
  "https://sklunixjizqeoobphkkc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_GHeo3TATa7Dh-ZDQBBtzeQ__dLdchwW";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
console.log("Supabase connected");
window.addEventListener(
  "load",
  async () => {
    const hash =
      window.location.hash;
    if(hash.includes(
      "type=recovery"
    )){
      showPage("reset");
      return;
    }
    checkUser();
});
async function signUp(){
  const username =
    document.getElementById("signup-username")
    .value
    .trim();

  const email =
    document.getElementById("signup-email")
    .value
    .trim();
  const password =
    document.getElementById("signup-password")
    .value;
  const msg =
    document.getElementById("auth-msg");
  if(!username || !email || !password){

    msg.textContent =
      "Please fill all fields";
    return;
  }
  msg.textContent = "Creating account...";
  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar: playerAvatar
        }
      }
    });
  if(error){
    msg.textContent = error.message;
    return;
  }
  const user = data.user;// || data.session?.user;
const { error: profileError } =
  await supabaseClient
    .from("profiles")
    .insert([{
      id: user.id,
      username: username,
      avatar: playerAvatar
    }]);
if(profileError){
  msg.textContent =
    profileError.message;
  return;
}
  msg.textContent =
    "Account created! Check your email.";
  console.log(data);
}
async function loginUser(){
  const email =
    document.getElementById("signup-email")
    .value
    .trim();
  const password =
    document.getElementById("signup-password")
    .value;
  const msg =
    document.getElementById("auth-msg");
  msg.textContent = "Logging in...";
  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
  if(error){
  console.log(error);
  msg.textContent =
    error.message;
  return;
}
///
  msg.textContent = "Login successful!";
  console.log(data);
  showPage("solo");
}
let currentRoom = "";
const RANDOM_NAMES = [
  "ShadowByte",
  "TurboTiger",
  "PixelRush",
  "CosmicFalcon",
  "NeonNinja",
  "StormRider",
  "QuantumFox",
  "BlazeRunner",
  "EchoStrike",
  "CyberWave"
];
const AVATARS = [
  "🦊",
  "🐼",
  "🐸",
  "🐯",
  "🐵",
  "🐺",
  "👾",
  "🤖",
  "🐨",
  "🦄"
];
let playerName =
  localStorage.getItem("zentype_name");

if(!playerName){

  playerName =
    RANDOM_NAMES[
      Math.floor(Math.random() * RANDOM_NAMES.length)
    ];

  localStorage.setItem(
    "zentype_name",
    playerName
  );
}
let playerAvatar =
  localStorage.getItem("zentype_avatar");

if(!playerAvatar){

  playerAvatar =
    AVATARS[
      Math.floor(Math.random() * AVATARS.length)
    ];

  localStorage.setItem(
    "zentype_avatar",
    playerAvatar
  );
}

const socket =io("YOUR_RENDER_URL");
socket.on("connect", () => {
  console.log("Connected to backend:", socket.id);
});
function createRoom() {

  socket.emit("create-room", {
    name: playerName,
    avatar: playerAvatar
  });

}
// ═══════════════════ THEME ═══════════════════
document.querySelectorAll('.tdot').forEach(d=>{
  d.addEventListener('click',()=>{
    document.documentElement.setAttribute('data-theme',d.dataset.t);
    document.querySelectorAll('.tdot').forEach(x=>x.classList.remove('active'));
    d.classList.add('active');
  });
});

// ═══════════════════ PAGES ═══════════════════
function showPage(p){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
  document.querySelectorAll('.ntab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ntab').forEach(t=>{if(t.textContent.toLowerCase().includes(p))t.classList.add('active');});
  if(p==='multi') initMultiplayer();
}

// ═══════════════════ WORD BANKS ═══════════════════
const BANKS={
  easy:"the and for are but not you all can her was one our out had day has him his how man new now old see two way who boy did its let put say she too use about after also back been best big came case come does each even find first from gave give good great hand have here high home just keep kind know last left life like long look made make many most must name need next only open over part past people place real said same show side some such take than that their them then there this time under very well went were when will with work world would year your".split(" "),
  medium:"about achieve balance because believe between beyond bright build certain challenge change choice clarity constant create define different difficult dream every evolve failure focus follow future growth guide human imagine improve include journey knowledge learn manage matter measure might never notice observe overcome perfect possible practice purpose quality reason remain result return rhythm sentence simple skills solve something start strong study success system target through together toward travel truth until usually variety version vision without wonder working".split(" "),
  hard:"aberration accomplish acquisition ambiguous anecdote anticipate arbitrary beneficial bureaucratic catastrophic circumstance coincidence collaborate comprehensive consequence constitution contemporary controversial cultivate deficiency deliberate denominator dissatisfaction documentation eloquently emphasize entrepreneur environment equilibrium exaggeration extraordinary feasibility fundamental generalization hallucination hypothetically identification implication inconsistency infrastructure interpretation jurisdiction knowledgeable legitimately miscellaneous multiplication nevertheless oblivious optimization particularly philosophical predicament prerequisite prioritization questionnaire reconciliation sophisticated subsequently surveillance technological theoretical unprecedented vulnerability".split(" ")
};
const PARAGRAPHS=[
  "the quick brown fox jumps over the lazy dog and then runs back to find its friends waiting by the old oak tree near the river bank",
  "practice makes perfect and every great typist started somewhere small then built speed through daily dedication and focused effort over time",
  "technology has changed the way people communicate work and learn and those who can type fast have a clear advantage in the modern world"
];

// ═══════════════════ SOLO GAME ═══════════════════
let words=[],wIdx=0,cIdx=0,timerInt=null,timeLeft=30,totalDur=30,started=false;
let correct=0,wrong=0,totalTyped=0,wordsCorrect=0,difficulty='easy',history=[];

function clearCursor(){document.querySelectorAll('.cursor').forEach(e=>e.classList.remove('cursor'));}
function setCursor(wi,ci){clearCursor();const el=document.getElementById(`c${wi}_${ci}`);if(el)el.classList.add('cursor');}
function rnd(n){const b=BANKS[difficulty];return Array.from({length:n},()=>b[~~(Math.random()*b.length)]);}
const isMobile=()=>window.innerWidth<=600||('ontouchstart' in window);

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
  document.getElementById('stext').textContent=isMobile()?'Tap input to start…':'Click to start…';
  document.getElementById('typing-box').classList.remove('focused');
  words=rnd(120);renderWords();
  document.getElementById('hidden-input').value='';
  document.getElementById('mobile-input').value='';
}

function renderWords(){
  const c=document.getElementById('words');c.innerHTML='';
  words.forEach((w,wi)=>{
    const el=document.createElement('span');el.className='word';el.id='w'+wi;
    [...w].forEach((ch,ci)=>{
      const s=document.createElement('span');s.className='char pending';s.textContent=ch;s.id=`c${wi}_${ci}`;el.appendChild(s);
    });
    c.appendChild(el);
  });
  setCursor(0,0);
}

function handleBoxClick(){
  if(isMobile()) document.getElementById('mobile-input').focus();
  else document.getElementById('hidden-input').focus();
}
function scrollToTest(){document.getElementById('typing-box').scrollIntoView({behavior:'smooth'});setTimeout(handleBoxClick,400);}

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
  if(!history.length){body.innerHTML='<p class="no-hist">No tests yet.</p>';return;}
  body.innerHTML=`<table class="htable"><thead><tr><th>#</th><th>Time</th><th>WPM</th><th>Acc</th><th>Words</th><th>Dur</th><th>Level</th><th>Grade</th></tr></thead><tbody>${history.map((r,i)=>`<tr><td>${history.length-i}</td><td>${r.ts}</td><td><strong>${r.wpm}</strong></td><td>${r.acc}%</td><td>${r.wd}</td><td>${r.dur}s</td><td><span class="badge ${r.diff}">${r.diff}</span></td><td><strong>${getGrade(r.wpm,r.acc)}</strong></td></tr>`).join('')}</tbody></table>`;
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

function processInput(val,inputEl){
  if(timeLeft<=0)return;
  if(val.trim()===''&&!val.endsWith(' ')){return;}
  if(!started){started=true;startTimer();}
  const w=words[wIdx];
  if(val.endsWith(' ')){
    const typed=val.trim();
    if(!typed){inputEl.value='';return;}
    [...w].forEach((ch,i)=>{const c=document.getElementById(`c${wIdx}_${i}`);if(!c)return;c.className='char '+(i<typed.length&&typed[i]===ch?'correct':'wrong');});
    let wc=0;[...typed].forEach((ch,i)=>{if(i<w.length&&ch===w[i])wc++;});
    correct+=wc;wrong+=(w.length-wc);totalTyped+=w.length;wordsCorrect++;wIdx++;cIdx=0;
    if(wIdx>=words.length-10){
      const extra=rnd(40),base=words.length,container=document.getElementById('words');
      words=[...words,...extra];
      extra.forEach((wd,off)=>{const wi=base+off,el=document.createElement('span');el.className='word';el.id='w'+wi;[...wd].forEach((ch,ci)=>{const s=document.createElement('span');s.className='char pending';s.textContent=ch;s.id=`c${wi}_${ci}`;el.appendChild(s);});container.appendChild(el);});
    }
    setCursor(wIdx,0);
    const cw=document.getElementById('w'+wIdx);if(cw)cw.scrollIntoView({block:'nearest',behavior:'smooth'});
    inputEl.value='';updateStats();return;
  }
  const tc=[...val];
  for(let i=0;i<w.length;i++){const c=document.getElementById(`c${wIdx}_${i}`);if(c)c.className='char pending';}
  tc.forEach((ch,i)=>{if(i>=w.length)return;const c=document.getElementById(`c${wIdx}_${i}`);if(c)c.className='char '+(ch===w[i]?'correct':'wrong');});
  cIdx=tc.length;setCursor(wIdx,Math.min(cIdx,w.length-1));updateStats();
}

document.getElementById('hidden-input').addEventListener('input',e=>processInput(e.target.value,e.target));
document.getElementById('hidden-input').addEventListener('keydown',e=>{if(e.key==='Escape')initGame();});
document.getElementById('mobile-input').addEventListener('input',e=>processInput(e.target.value,e.target));
document.getElementById('mobile-input').addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Enter')initGame();});

document.getElementById('difficulty').querySelectorAll('.pill').forEach(p=>{
  p.addEventListener('click',()=>{
    document.getElementById('difficulty').querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');difficulty=p.dataset.val;initGame();
  });
});
document.getElementById('timer-select').addEventListener('change',initGame);

// ═══════════════════ MULTIPLAYER ═══════════════════
let raceInterval=null,raceTime=0,raceDur=60,raceWIdx=0,raceCIdx=0,raceStarted=false;
let raceWords=[],raceCorrect=0,raceTotalTyped=0,raceWordsCorrect=0;
let botIntervals=[];
let currentRaceMode='';

// const AVATARS=[
//   {name:'You',bg:'var(--a4)',fg:'var(--a)',initials:'YOU'},
//   {name:'Alex_K',bg:'#fce7f3',fg:'#be185d',initials:'AK'},
//   {name:'PriyaR',bg:'#dcfce7',fg:'#15803d',initials:'PR'},
//   {name:'TypeMaster',bg:'#fef3c7',fg:'#b45309',initials:'TM'},
// ];
const BOT_SPEEDS=[55,68,72]; // WPM targets for bots
const BOT_NAMES=['Alex_K','PriyaR','TypeMaster_99'];
const BOT_COLORS=[{bg:'#fce7f3',fg:'#be185d'},{bg:'#dcfce7',fg:'#15803d'},{bg:'#fef3c7',fg:'#b45309'}];
//
let lobbyPlayers = [];
let players=[];
let roomDiff='easy', roomDurSec=60;

function showMpPanel(id){
      if(id === "create"){
        createRoom();
            }
  document.querySelectorAll('.mp-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('mp-mode-select').style.display='grid';
  document.getElementById('race-view').classList.remove('active');
  document.getElementById('race-finish').style.display='none';

  if(id){
    document.getElementById('mp-mode-select').style.display='none';
    document.getElementById('panel-'+id).classList.add('active');
    if(id==='random') startMatchmaking();
    if(id==='spectate') startSpectator();
  }
}

function copyCode(){
  const code=document.getElementById('room-code').textContent;
  navigator.clipboard.writeText(code).catch(()=>{});
  const btn=event.target;btn.textContent='✓ Copied!';setTimeout(()=>btn.textContent='📋 Copy Code',2000);
}

function joinRoom(){

  const code = document
    .getElementById('join-code')
    .value
    .trim()
    .toUpperCase();

  const result = document.getElementById('join-result');

  result.style.display = 'block';

  if(code.length < 6){

    result.innerHTML = `
      <div style="background:#fee2e2;color:#dc2626;border-radius:10px;padding:10px 14px;font-size:.82rem">
        Invalid code. Please enter a valid room code.
      </div>
    `;

    return;
  }

  result.innerHTML = `
    <div style="background:var(--a4);color:var(--a);border-radius:10px;padding:10px 14px;font-size:.82rem">
      Joining room <strong>${code}</strong>...
    </div>
  `;

  // SEND TO BACKEND
socket.emit("join-room", {
  roomCode: code,
  name: playerName,
  avatar: playerAvatar
});

}

// pill selects for room settings
document.querySelectorAll('#room-diff .pill').forEach(p=>{p.addEventListener('click',()=>{document.querySelectorAll('#room-diff .pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');roomDiff=p.dataset.val;});});
document.querySelectorAll('#room-dur .pill').forEach(p=>{p.addEventListener('click',()=>{document.querySelectorAll('#room-dur .pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');roomDurSec=+p.dataset.val;});});

// Matchmaking
let mmInt=null;
function startMatchmaking(){
  clearInterval(mmInt);
  document.getElementById('mm-searching-view').style.display='block';
  document.getElementById('mm-found-view').style.display='none';
  let secs=0;
  mmInt=setInterval(()=>{
    secs++;
    const texts=['Searching for players…','Finding a match…','Almost there…'];
    document.getElementById('mm-text').textContent=texts[Math.min(secs>>1,2)];
    if(secs>=4){
      clearInterval(mmInt);
      const opp=BOT_NAMES[~~(Math.random()*BOT_NAMES.length)];
      document.getElementById('mm-opponent').textContent=opp;
      document.getElementById('mm-opp-name').textContent=opp;
      document.getElementById('mm-searching-view').style.display='none';
      document.getElementById('mm-found-view').style.display='block';
    }
  },900);
}
function cancelMatch(){clearInterval(mmInt);showMpPanel(null);}

// Countdown
function startCountdown(mode,extra){
  currentRaceMode=mode;
  const overlay=document.getElementById('countdown-overlay');
  const num=document.getElementById('countdown-num');
  const lbl=document.getElementById('countdown-label');
  overlay.classList.add('show');
  let c=3;
  num.textContent=c;lbl.textContent='Get ready…';
  const ci=setInterval(()=>{
    c--;
    if(c>0){num.textContent=c;num.style.animation='none';setTimeout(()=>num.style.animation='',10);}
    else if(c===0){num.textContent='GO!';lbl.textContent='Type as fast as you can!';}
    else{clearInterval(ci);overlay.classList.remove('show');beginRace(mode);}
  },1000);
}

function genRoomCode(){return 'ZT'+Math.random().toString(36).substr(2,1).toUpperCase()+Math.random().toString(36).substr(2,1).toUpperCase()+'-'+Math.floor(Math.random()*9000+1000);}

function beginRace(mode){
  showMpPanel(null);
  document.getElementById('mp-mode-select').style.display='none';
  document.getElementById('race-view').classList.add('active');
  document.getElementById('race-finish').style.display='none';

  // Setup race words
  const diff=mode==='create'?roomDiff:'easy';
  raceDur=mode==='create'?roomDurSec:60;
  raceWords=PARAGRAPHS[~~(Math.random()*PARAGRAPHS.length)].split(' ');
  raceWIdx=0;raceCIdx=0;raceStarted=false;raceCorrect=0;raceTotalTyped=0;raceWordsCorrect=0;
  raceTime=raceDur;

  // Build players
  // const bots=mode==='spectate'?3:mode==='create'?2:1;
  // players=[
  //   {name:'You',pct:0,wpm:0,isYou:true,bg:'var(--a4)',fg:'var(--a)',done:false},
  //   ...Array.from({length:bots},(_,i)=>({name:BOT_NAMES[i],pct:0,wpm:0,bg:BOT_COLORS[i].bg,fg:BOT_COLORS[i].fg,speed:BOT_SPEEDS[i]+(~~(Math.random()*10)-5),done:false}))
  // ];
  players = lobbyPlayers.map((p) => {

  return {
    id: p.id,
    name: p.id === socket.id
      ? "You"
      : p.name,
    avatar: p.avatar,
    pct: 0,
    wpm: 0,
    isYou: p.id === socket.id,
    done: false
  };
});

  document.getElementById('race-mode-label').textContent =
  mode === 'create'
    ? `Private Room · ${genRoomCode()}`
    : `Random Match`;
  renderRaceWords();
  renderRaceBars();

  const inp=document.getElementById('race-input');
  inp.value='';inp.disabled=false;inp.placeholder='Start typing…';inp.focus();

  // Race timer
  clearInterval(raceInterval);
  botIntervals.forEach(clearInterval);botIntervals=[];
  let elapsed=0;

  raceInterval=setInterval(()=>{
    elapsed++;raceTime--;
    const mins=~~(raceTime/60),secs=raceTime%60;
    document.getElementById('race-timer').textContent=`${mins}:${secs.toString().padStart(2,'0')}`;

    // simulate bots
    players.forEach((p,i)=>{
      if(p.isYou||p.done)return;
      const wpmNow=p.speed+(Math.random()*8-4);
      p.wpm=~~wpmNow;
      p.pct=Math.min(100,p.pct+(wpmNow/60/raceWords.length*100*(1+Math.random()*.2)));
      if(p.pct>=100){p.pct=100;p.done=true;}
    });

    // update your wpm
    const you=players[0];
    const elapsedMin=elapsed/60;
    you.wpm=Math.round(raceWordsCorrect/Math.max(elapsedMin,.0167));
    you.pct=Math.min(100,raceWordsCorrect/raceWords.length*100);
    document.getElementById('race-your-wpm').textContent='Your WPM: '+you.wpm;

    renderRaceBars();
    if(raceTime<=0||players.every(p=>p.done)){clearInterval(raceInterval);finishRace();}
  },1000);

  raceStarted=true;
}

function renderRaceWords(){
  const c=document.getElementById('race-words');c.innerHTML='';
  raceWords.forEach((w,wi)=>{
    const el=document.createElement('span');el.className='word';el.style.display='inline-flex';
    [...w].forEach((ch,ci)=>{
      const s=document.createElement('span');
      s.className='char pending';s.style.transition='color .04s';s.textContent=ch;s.id=`r${wi}_${ci}`;
      if(wi===0&&ci===0)s.classList.add('cursor');
      el.appendChild(s);
    });
    c.appendChild(el);
    if(wi<raceWords.length-1){const sp=document.createElement('span');sp.textContent=' ';c.appendChild(sp);}
  });
}

function renderRaceBars(){
  const sorted=[...players].sort((a,b)=>b.pct-a.pct);
  const barColors=['#6c47ff','#be185d','#15803d','#b45309'];
  document.getElementById('race-player-bars').innerHTML=players.map((p,i)=>{
    const pos=sorted.findIndex(x=>x.name===p.name)+1;
    const posLabel=pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':'#'+pos;
    return`<div class="rp-row">
      <div class="rp-avatar" style="background:${p.bg};color:${p.fg};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;flex-shrink:0">${p.avatar || "👾"}</div>
      <div class="rp-name" style="min-width:80px;font-size:.8rem;font-weight:600">${p.name}${p.isYou?' (You)':''}</div>
      <div class="rp-bar-wrap" style="flex:1;height:8px;background:var(--border);border-radius:8px;overflow:hidden">
        <div class="rp-bar-fill" style="height:100%;width:${p.pct}%;background:${barColors[i]||'var(--a)'};border-radius:8px;transition:width .4s ease"></div>
      </div>
      <div class="rp-wpm" style="min-width:50px;text-align:right;font-size:.78rem;font-weight:700;color:var(--a)">${p.wpm} WPM</div>
      <div style="min-width:24px;text-align:center;font-size:.82rem">${posLabel}</div>
    </div>`;
  }).join('');
}

// Race typing
document.getElementById('race-input').addEventListener('input',e=>{
  if(!raceStarted||raceTime<=0)return;
  const val=e.target.value,w=raceWords[raceWIdx];
  if(!w)return;
  if(val.endsWith(' ')){
    const typed=val.trim();if(!typed){e.target.value='';return;}
    [...w].forEach((ch,i)=>{const c=document.getElementById(`r${raceWIdx}_${i}`);if(c)c.className='char '+(i<typed.length&&typed[i]===ch?'correct':'wrong');c&&(c.style.transition='color .04s');});
    raceWIdx++;raceCIdx=0;
    if(raceWIdx>=raceWords.length){players[0].done=true;players[0].pct=100;clearInterval(raceInterval);finishRace();return;}
    // set cursor
    document.querySelectorAll('.cursor').forEach(x=>x.classList.remove('cursor'));
    const nc=document.getElementById(`r${raceWIdx}_0`);if(nc)nc.classList.add('cursor');
    const cw=document.getElementById(`r${raceWIdx}_0`);if(cw)cw.closest('.word')?.scrollIntoView({block:'nearest',behavior:'smooth'});
    raceWordsCorrect++;e.target.value='';return;
  }
  const tc=[...val];
  for(let i=0;i<w.length;i++){const c=document.getElementById(`r${raceWIdx}_${i}`);if(c){c.className='char pending';c.style.color='';}}
  tc.forEach((ch,i)=>{if(i>=w.length)return;const c=document.getElementById(`r${raceWIdx}_${i}`);if(c){c.style.color=ch===w[i]?'var(--ok)':'var(--err)';}});
  document.querySelectorAll('.cursor').forEach(x=>x.classList.remove('cursor'));
  const cur=document.getElementById(`r${raceWIdx}_${Math.min(tc.length,w.length-1)}`);if(cur)cur.classList.add('cursor');
///////////////
const progress =
  (raceWordsCorrect / raceWords.length) * 100;
const currentWPM =
  players[0].wpm;
socket.emit("typing-progress", {
  room: currentRoom,
  progress: progress,
  wpm: currentWPM
});
});
function finishRace(){
  document.getElementById('race-view').classList.remove('active');
  document.getElementById('race-finish').style.display='block';
  const inp=document.getElementById('race-input');inp.disabled=true;
  const sorted=[...players].sort((a,b)=>b.pct===a.pct?b.wpm-a.wpm:b.pct-a.pct);
  const youPos=sorted.findIndex(p=>p.isYou)+1;
  document.getElementById('fin-title').textContent=youPos===1?'You Won! 🏆':youPos===2?'2nd Place! 🥈':'Race Complete!';
  document.getElementById('fin-sub').textContent=`You finished ${['1st','2nd','3rd','4th'][youPos-1]} out of ${players.length} players`;
  // Podium
  const podColors=['#FFD700','#C0C0C0','#CD7F32'];
  const podHeights=[80,60,44];
  const top3=sorted.slice(0,Math.min(3,players.length));
  document.getElementById('fin-podium').innerHTML=top3.map((p,i)=>`
    <div class="pod-col">
      <div style="font-size:1.1rem">${i===0?'🥇':i===1?'🥈':'🥉'}</div>
      <div class="pod-bar" style="height:${podHeights[i]}px;background:${podColors[i]};color:#000">${p.name.slice(0,2)}</div>
      <div class="pod-name" style="font-size:.75rem;font-weight:600">${p.name}${p.isYou?' (You)':''}</div>
      <div class="pod-wpm" style="font-size:.7rem;color:var(--muted)">${p.wpm} WPM</div>
    </div>`).join('');
  const you=players[0];
  document.getElementById('fin-stats').innerHTML=`
    <div class="fin-stat"><small>Your WPM</small><div class="fv">${you.wpm}</div></div>
    <div class="fin-stat"><small>Position</small><div class="fv">#${youPos}</div></div>
    <div class="fin-stat"><small>Words</small><div class="fv">${raceWordsCorrect}</div></div>`;
}
function leaveRace(){clearInterval(raceInterval);showMpPanel(null);document.getElementById('mp-mode-select').style.display='grid';}
function replayRace(){beginRace(currentRaceMode);}
// Spectator
let specInt=null;
const SPEC_PLAYERS=[
  {name:'SpeedDemon',wpm:82,pct:0,bg:'#ede9ff',fg:'#6c47ff'},
  {name:'NightOwl_99',wpm:67,pct:5,bg:'#fce7f3',fg:'#be185d'},
  {name:'TypeLord',wpm:71,pct:3,bg:'#dcfce7',fg:'#15803d'},
  {name:'KeyMaster',wpm:59,pct:1,bg:'#fef3c7',fg:'#b45309'},
];
let specElapsed=42;
function startSpectator(){
  clearInterval(specInt);
  const specWords=PARAGRAPHS[0].split(' ');
  // render text
  const textEl=document.getElementById('spec-text');
  textEl.innerHTML=specWords.map((w,i)=>`<span class="spec-word" id="sw${i}">${[...w].map((c,j)=>`<span id="sc${i}_${j}">${c}</span>`).join('')}</span>`).join(' ');
  function renderSpec(){
    const sorted=[...SPEC_PLAYERS].sort((a,b)=>b.pct-a.pct);
    document.getElementById('spec-players').innerHTML=SPEC_PLAYERS.map((p,i)=>`
      <div class="rp-row">
        <div style="width:28px;height:28px;border-radius:50%;background:${p.bg};color:${p.fg};display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;flex-shrink:0">${p.name.slice(0,2).toUpperCase()}</div>
        <div style="min-width:90px;font-size:.8rem;font-weight:600">${p.name}</div>
        <div style="flex:1;height:7px;background:var(--border);border-radius:7px;overflow:hidden"><div style="height:100%;width:${p.pct}%;background:${p.fg};border-radius:7px;transition:width .4s"></div></div>
        <div style="min-width:44px;text-align:right;font-size:.78rem;font-weight:700;color:var(--a)">${p.wpm}</div>
      </div>`).join('');
    document.getElementById('spec-lb').innerHTML=sorted.map((p,i)=>`
      <div class="lb-row">
        <div class="lb-pos" style="color:${i===0?'gold':i===1?'silver':i===2?'#cd7f32':'var(--muted)'}">${['🥇','🥈','🥉','4'][i]}</div>
        <div class="lb-name">${p.name}</div>
        <div class="lb-wpm">${p.wpm}</div>
      </div>`).join('');
    document.getElementById('spec-stats').innerHTML=`
      <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Leader WPM</span><strong>${sorted[0].wpm}</strong></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Avg WPM</span><strong>${~~(SPEC_PLAYERS.reduce((a,p)=>a+p.wpm,0)/SPEC_PLAYERS.length)}</strong></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Leader progress</span><strong>${~~sorted[0].pct}%</strong></div>`;
    const mins=~~(specElapsed/60),secs=specElapsed%60;
    document.getElementById('spec-timer-display').textContent=`Time: ${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  }
  specInt=setInterval(()=>{
    specElapsed++;
    SPEC_PLAYERS.forEach(p=>{p.pct=Math.min(100,p.pct+(p.wpm/60/specWords.length*100*(1+Math.random()*.15)));p.wpm+=~~(Math.random()*3)-1;p.wpm=Math.max(30,p.wpm);});
    renderSpec();
  },1000);
  renderSpec();
}
function initMultiplayer(){
  document.getElementById('room-code').textContent=genRoomCode();
  const n=Math.floor(Math.random()*50)+220;
  document.getElementById('online-count').textContent=n;
  showMpPanel(null);
  clearInterval(specInt);
}
renderHistory();
initGame();
socket.on("room-created", (roomCode) => {
    currentRoom = roomCode;
  console.log("Room created:", roomCode);
  document.getElementById("room-code").textContent = roomCode;
});
socket.on("player-joined", (data) => {
    currentRoom = data.room;
    lobbyPlayers = data.players;
    document.getElementById("lobby-room-code")
  .textContent = data.room;
    showMpPanel("lobby");
renderLobby(data.players);
  const result = document.getElementById('join-result');
  const playerNames = data.players
    .map(p => p.name)
    .join(", ");
  result.innerHTML = `
    <div style="background:#dcfce7;color:#15803d;border-radius:10px;padding:10px 14px;font-size:.82rem">
      ✓ Joined Room ${data.room}
      <br>
      Players (${data.players.length}):
      ${playerNames}
    </div>
  `;
  console.log("Joined room:", data.room);
});
socket.on("room-not-found", () => {
  const result = document.getElementById('join-result');
  result.innerHTML = `
    <div style="background:#fee2e2;color:#dc2626;border-radius:10px;padding:10px 14px;font-size:.82rem">
      Room not found
    </div>
  `;
});
socket.on("update-progress", (data) => {
  console.log("Other player:", data);
});
socket.on("race-started", () => {
  startCountdown("create");
});
function renderLobby(players){
  const container =
    document.getElementById("lobby-player-list");
  if(!container) return;
  let html = "";
  // REAL PLAYERS
  players.forEach((p, index) => {
    html += `
      <div class="player-card">
        <div>
          ${p.id === socket.id ? "You" : p.name}
          ${index === 0 ? "(Host)" : ""}
        </div>
        <div>
          ${index === 0 ? "👑 Host" : "✅ Ready"}
        </div>
      </div>
    `;
  });
  ////race start
  // EMPTY SLOTS
  const emptySlots = 4 - players.length;
  for(let i = 0; i < emptySlots; i++){
    html += `
      <div class="player-card empty">
        <div>
          Waiting for player...
        </div>
        <div>⏳</div>
      </div>
    `;
  }
  container.innerHTML = html;
}
function startRaceFromLobby(){
  socket.emit("start-race", currentRoom);
}
/////////////////profile
async function saveProfile(){
  const username =
    document.getElementById(
      "profile-username"
    ).value;
  const avatar =
    document.getElementById(
      "profile-avatar-select"
    ).value;
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();
  console.log(user);
  const { error } =
    await supabaseClient
      .from("profiles")
      .upsert({
  id: user.id,
  username,
  avatar
});
  if(error){
    alert(error.message);
    return;
  }
  localStorage.setItem(
    "zentype_name",
    username
  );
  localStorage.setItem(
    "zentype_avatar",
    avatar
  );
  playerName = username;
  playerAvatar = avatar;
  document.getElementById(
    "profile-avatar"
  ).textContent = avatar;
  alert("Profile updated!");
}
//////logout////
async function logoutUser(){
  await supabaseClient.auth.signOut();
  localStorage.removeItem(
    "zentype_name"
  );
  localStorage.removeItem(
    "zentype_avatar"
  );
  showPage("auth");
}

//
async function checkUser(){
  const {
    data: { session }
  } = await supabaseClient
      .auth
      .getSession();
  if(session){
    showPage("solo");
  } else {
    showPage("auth");
  }
}
async function resetPassword(){
  const email =
    document.getElementById(
      "signup-email"
    ).value;
  if(!email){
    alert("Enter your email first");
    return;
  }
  const { error } =
    await supabaseClient.auth
      .resetPasswordForEmail(email, {
        redirectTo:
          window.location.origin
      });
  if(error){
    alert(error.message);
    return;
  }
  alert(
    "Password reset email sent!"
  );
}
async function updatePassword(){
  const password =
    document.getElementById(
      "new-password"
    ).value;
  if(!password){
    alert("Enter new password");
    return;
  }
  const { error } =
    await supabaseClient.auth
      .updateUser({
        password: password
      });
  if(error){
    alert(error.message);
    return;
  }
  alert(
    "Password updated successfully!"
  );
  showPage("auth");
}