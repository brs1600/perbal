const $=s=>document.querySelector(s),content=$('#game-content');let current='battleship';
const meta={battleship:['STRATÉGIA · 1 JÁTÉKOS','Torpedó','Három hajó rejtőzik a 6×6-os tengeren.'],tic:['LOGIKA · 2 JÁTÉKOS','Amőba','Rakj ki három azonos jelet egy sorba, oszlopba vagy átlóba!'],memory:['MEMÓRIA · 1 JÁTÉKOS','Memória','Találd meg mind a 20 azonos szimbólumpárt!'],breakout:['ÜGYESSÉG · 1 JÁTÉKOS','Falbontó','Törd össze az összes téglát, és ne hagyd leesni a labdát!'],snake:['ÜGYESSÉG · 1 JÁTÉKOS','Kígyó','Gyűjtsd össze a pontokat, és vigyázz, ne ütközz!']};
function statusMarkup(t=''){return `<p class="status" id="status">${t}</p>`}function setStatus(t){const e=$('#status');if(e)e.innerHTML=t}
function selectGame(g){current=g;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.game===g));$('#game-kicker').textContent=meta[g][0];$('#game-title').textContent=meta[g][1];$('#game-description').textContent=meta[g][2];render()}document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>selectGame(b.dataset.game));$('#reset-game').onclick=()=>render();function render(){({battleship:renderBattleship,tic:renderTic,memory:renderMemory,breakout:renderBreakout,snake:renderSnake})[current]()}
// Torpedó: három összefüggő, több mezős hajó (3, 2, 2).
function renderBattleship(){const n=6,ships=new Set(),fleet=[3,2,2];function place(len){for(let a=0;a<500;a++){let h=Math.random()<.5,x=Math.floor(Math.random()*(n-(h?len:1)+1)),y=Math.floor(Math.random()*(n-(h?1:len)+1)),cells=Array.from({length:len},(_,k)=>(y+(h?0:k))*n+x+(h?k:0)),near=[];cells.forEach(v=>{let cx=v%n,cy=Math.floor(v/n);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let xx=cx+dx,yy=cy+dy;if(xx>=0&&xx<n&&yy>=0&&yy<n)near.push(yy*n+xx)}});if(near.every(v=>!ships.has(v))){cells.forEach(v=>ships.add(v));return true}}return false}do{ships.clear()}while(!fleet.every(place));let hits=0,shots=0;content.innerHTML=statusMarkup('Három hajó: egy 3 mezős és két 2 mezős. Találd el mind a 7 hajómezőt!')+`<div class="battleship-layout"><div class="board" id="battle-board" style="grid-template-columns:repeat(6,48px)"></div><div class="legend"><b>JELMAGYARÁZAT</b><br>✳ Találat<br>· Üres víz<br><br><b id="battle-score">0 / 7 találat</b><br>3 hajó · 7 mező</div></div>`;let board=$('#battle-board');for(let i=0;i<36;i++){let b=document.createElement('button');b.className='cell';b.setAttribute('aria-label',`Sor ${Math.floor(i/6)+1}, oszlop ${i%6+1}`);b.onclick=()=>{if(b.disabled)return;shots++;if(ships.has(i)){hits++;b.textContent='✳';b.classList.add('hit')}else{b.textContent='·';b.classList.add('miss')}b.disabled=true;$('#battle-score').textContent=`${hits} / 7 találat`;setStatus(hits===7?'<strong>Győzelem!</strong> Megtaláltad mindhárom hajót.':`Találatok: <strong>${hits}/7</strong> · Lövések: ${shots}`)};board.append(b)}}
function renderTic(){
 let cells=Array(9).fill(''),turn='X',over=false,mode='two';
 content.innerHTML=statusMarkup('X játékos következik.')+
 `<div class="tic-options"><button class="action-btn active" id="tic-two">2 JÁTÉKOS</button><button class="action-btn" id="tic-ai">GÉP ELLEN</button></div><div class="board tic-board" id="tic-board"></div><div class="scoreline" id="tic-score">JÁTÉKOS 1: X　·　JÁTÉKOS 2: O</div>`;
 const board=$('#tic-board'),wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 function winner(a){return wins.find(line=>a[line[0]]&&a[line[0]]===a[line[1]]&&a[line[1]]===a[line[2]])}
 function finishIfNeeded(){let win=winner(cells);if(win){over=true;setStatus(`<strong>${cells[win[0]]} nyert!</strong>`);win.forEach(j=>board.children[j].style.background='#dce8dc');board.querySelectorAll('button').forEach(x=>x.disabled=true);return true}if(cells.every(Boolean)){over=true;setStatus('Döntetlen! Indíts új kört.');return true}return false}
 function minimax(a,isMax,depth=0){let w=winner(a);if(w)return a[w[0]]==='O'?10-depth:depth-10;if(a.every(Boolean))return 0;let best=isMax?-Infinity:Infinity;for(let i=0;i<9;i++)if(!a[i]){a[i]=isMax?'O':'X';let score=minimax(a,!isMax,depth+1);a[i]='';best=isMax?Math.max(best,score):Math.min(best,score)}return best}
 function aiMove(){if(over)return;let best=-Infinity,choice=-1;for(let i=0;i<9;i++)if(!cells[i]){cells[i]='O';let score=minimax(cells,false);cells[i]='';if(score>best){best=score;choice=i}}if(choice>=0){play(choice,'O');}}
 function play(i,mark){if(over||cells[i])return;cells[i]=mark;let b=board.children[i];b.textContent=mark;b.style.color=mark==='X'?'#f3bd4f':'#e87945';if(finishIfNeeded())return;turn=mark==='X'?'O':'X';setStatus(mode==='ai'&&turn==='O'?'A gép gondolkodik…':`${turn} következik.`)}
 function humanMove(i){if(over||cells[i]||(mode==='ai'&&turn==='O'))return;play(i,turn);if(mode==='ai'&&!over&&turn==='O')setTimeout(aiMove,280)}
 function newRound(){cells=Array(9).fill('');turn='X';over=false;board.innerHTML='';cells.forEach((_,i)=>{let b=document.createElement('button');b.className='cell';b.onclick=()=>humanMove(i);board.append(b)});setStatus('X játékos következik.');}
 function setMode(next){mode=next;$('#tic-two').classList.toggle('active',mode==='two');$('#tic-ai').classList.toggle('active',mode==='ai');$('#tic-score').textContent=mode==='ai'?'TE: X　·　GÉP: O':'JÁTÉKOS 1: X　·　JÁTÉKOS 2: O';newRound()}
 $('#tic-two').onclick=()=>setMode('two');$('#tic-ai').onclick=()=>setMode('ai');newRound();
}
function renderMemory(){let icons=['🍋','🚀','🐙','🎸','🍀','🦊','🌙','⚽','🍓','🎨','🐳','🌵','🧩','🎧','🦋','🍉','🪐','🦉','🎲','🌻'],deck=[...icons,...icons].sort(()=>Math.random()-.5),first=null,lock=false,moves=0,pairs=0;content.innerHTML=statusMarkup('Fordíts fel két kártyát, és keresd a párokat! 20 pár vár rád.')+`<div class="memory-board" id="memory-board"></div><div class="scoreline">LÉPÉS: <strong id="moves">0</strong>　·　PÁR: <strong id="pairs">0 / 20</strong></div>`;let board=$('#memory-board');deck.forEach(emoji=>{let b=document.createElement('button');b.className='memory-card';b.textContent='?';b.setAttribute('aria-label','Lefordított kártya');b.onclick=()=>{if(lock||b.classList.contains('open')||b.classList.contains('done'))return;b.textContent=emoji;b.classList.add('open');if(!first){first={b,emoji};return}moves++;$('#moves').textContent=moves;if(first.emoji===emoji){b.classList.replace('open','done');first.b.classList.replace('open','done');first=null;pairs++;$('#pairs').textContent=`${pairs} / 20`;if(pairs===20)setStatus(`<strong>Szép munka!</strong> Mind a 20 pár megvan ${moves} lépésből.`)}else{lock=true;let prev=first.b;first=null;setTimeout(()=>{b.textContent=prev.textContent='?';b.classList.remove('open');prev.classList.remove('open');lock=false},750)}};board.append(b)})}
// Falbontó / Breakout.
function renderBreakout(){
 content.innerHTML=statusMarkup('Kattints a játéktérre vagy az indítógombra a kezdéshez. Mozgasd az ütőt a nyilakkal vagy az egérrel!')+`<div class="arcade-wrap"><canvas class="arcade-canvas" id="breakout" width="600" height="420" aria-label="Falbontó játéktér — kattints az indításhoz"></canvas><div class="scoreline">PONT: <strong id="bs">0</strong>　·　ÉLET: <strong id="bl">3 / 3</strong></div><button class="action-btn" id="bstart">▶ INDÍTÁS / ÚJRAKEZDÉS</button><div class="help">← → nyilak vagy egér · Érintőképernyőn húzd az ütőt</div></div>`;
 const c=$('#breakout'),ctx=c.getContext('2d');
 const paddle={x:250,y:390,w:100,h:10};
 const colors=['#f3bd4f','#e87945','#d75a43','#8fb58b'];
 let ball,bricks=[],score=0,lives=3,timer=null,running=false;
 function makeBall(){return {x:300,y:350,dx:3,dy:-3.4,r:7}}
 function updateLives(){ $('#bl').textContent=`${lives} / 3`; }
 function reset(){
  clearInterval(timer);timer=null;bricks=[];
  for(let r=0;r<4;r++)for(let col=0;col<9;col++)bricks.push({x:25+col*62,y:45+r*25,w:54,h:14,alive:true,color:colors[r]});
  paddle.x=250;ball=makeBall();score=0;lives=3;running=false;
  $('#bs').textContent='0';updateLives();draw();
  setStatus('Kattints a játéktérre vagy az indítógombra a kezdéshez.');
 }
 function draw(){
  ctx.fillStyle='#171a17';ctx.fillRect(0,0,c.width,c.height);
  bricks.forEach(b=>{if(b.alive){ctx.fillStyle=b.color;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,4);ctx.fill()}});
  ctx.fillStyle='#f4efdf';ctx.beginPath();ctx.roundRect(paddle.x,paddle.y,paddle.w,paddle.h,5);ctx.fill();
  if(ball){ctx.fillStyle='#d8f06a';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill()}
  if(!running){ctx.fillStyle='#171a17cc';ctx.fillRect(0,0,c.width,c.height);ctx.textAlign='center';ctx.fillStyle='#f3bd4f';ctx.font='bold 27px sans-serif';ctx.fillText('KATTINTS A KEZDÉSHEZ',300,205);ctx.fillStyle='#f4efdf';ctx.font='14px sans-serif';ctx.fillText('vagy nyomd meg az INDÍTÁS gombot',300,232)}
 }
 function start(){if(running)return;reset();running=true;draw();setStatus('Játékban vagy — hajrá! Három életed van.');timer=setInterval(tick,16)}
 function end(message){clearInterval(timer);timer=null;running=false;draw();setStatus(`<strong>${message}</strong> Pontszám: ${score}. Kattints a játéktérre az újrakezdéshez.`)}
 function loseLife(){
  lives--;updateLives();
  if(lives<=0){end('Elfogytak az életeid!');return}
  // A labda minden elvesztett élet után újra megjelenik; a pontszám és a téglák megmaradnak.
  ball=makeBall();paddle.x=250;draw();
  setStatus(`Elvesztettél egy életet — még <strong>${lives}</strong> életed van! Folytasd!`);
 }
 function tick(){
  ball.x+=ball.dx;ball.y+=ball.dy;
  if(ball.x-ball.r<0){ball.x=ball.r;ball.dx=Math.abs(ball.dx)}
  if(ball.x+ball.r>c.width){ball.x=c.width-ball.r;ball.dx=-Math.abs(ball.dx)}
  if(ball.y-ball.r<0){ball.y=ball.r;ball.dy=Math.abs(ball.dy)}
  if(ball.dy>0&&ball.y+ball.r>=paddle.y&&ball.y-ball.r<=paddle.y+paddle.h&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.w){
   ball.y=paddle.y-ball.r;ball.dy=-Math.abs(ball.dy);ball.dx=((ball.x-paddle.x-paddle.w/2)/(paddle.w/2))*4;
  }
  for(const b of bricks){if(b.alive&&ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){b.alive=false;ball.dy*=-1;score+=10;$('#bs').textContent=score;break}}
  if(bricks.every(b=>!b.alive)){end('Minden téglát összetörtél — győzelem!');return}
  if(ball.y-ball.r>c.height){loseLife();if(!running)return}
  draw();
 }
 function move(x){paddle.x=Math.max(0,Math.min(c.width-paddle.w,x-paddle.w/2));if(!running)draw()}
 document.onkeydown=e=>{if(current!=='breakout')return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(paddle.x+paddle.w/2+(e.key==='ArrowLeft'?-28:28))}};
 c.onmousemove=e=>{const r=c.getBoundingClientRect();move((e.clientX-r.left)/r.width*c.width)};
 c.ontouchmove=e=>{e.preventDefault();const r=c.getBoundingClientRect();move((e.touches[0].clientX-r.left)/r.width*c.width)};
 c.onclick=()=>{if(!running)start()};$('#bstart').onclick=start;reset();
}
// Kígyó.
function renderSnake(){
 content.innerHTML=statusMarkup('A játék billentyűre indul. Bármelyik billentyűvel elindíthatod; a nyilak vagy a WASD irányítanak.')+
 `<div class="arcade-wrap"><canvas class="arcade-canvas snake-canvas" id="snake" width="400" height="400"></canvas>
 <div class="scoreline">PONTSZÁM: <strong id="ss">0</strong></div>
 <div class="help" id="snake-help">NYOMJ MEG BÁRMILYEN BILLENTYŰT A KEZDÉSHEZ</div>
 <div class="mobile-controls"><span></span><button data-d="up">↑</button><span></span><button data-d="left">←</button><button data-d="down">↓</button><button data-d="right">→</button></div>
 <div class="help">NYILAK / WASD · ÜTKÖZÉS UTÁN BÁRMELYIK BILLENTYŰVEL ÚJRAINDÍTHATÓ</div></div>`;
 let c=$('#snake'),ctx=c.getContext('2d'),snake,food,dir,next,score,timer=null,running=false;
 const directions={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
 const map={ArrowUp:directions.up,w:directions.up,W:directions.up,ArrowDown:directions.down,s:directions.down,S:directions.down,ArrowLeft:directions.left,a:directions.left,A:directions.left,ArrowRight:directions.right,d:directions.right,D:directions.right};
 function draw(){
   ctx.fillStyle='#171a17';ctx.fillRect(0,0,400,400);ctx.strokeStyle='#ffffff0b';ctx.lineWidth=1;
   for(let i=20;i<400;i+=20){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,400);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(400,i);ctx.stroke()}
   if(food){ctx.fillStyle='#e87945';ctx.beginPath();ctx.arc(food.x*20+10,food.y*20+10,7,0,Math.PI*2);ctx.fill()}
   if(snake)snake.forEach((p,i)=>{ctx.fillStyle=i?'#8fb58b':'#d8f06a';ctx.beginPath();ctx.roundRect(p.x*20+2,p.y*20+2,16,16,4);ctx.fill()});
 }
 function placeFood(){food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)};while(snake.some(p=>p.x===food.x&&p.y===food.y))food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)}}
 function resetState(){clearInterval(timer);timer=null;running=false;snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};next=dir;score=0;placeFood();$('#ss').textContent='0';$('#snake-help').textContent='NYOMJ MEG BÁRMILYEN BILLENTYŰT A KEZDÉSHEZ';setStatus('A kígyó még áll. Nyomj meg bármilyen billentyűt a kezdéshez.');draw()}
 function change(d){if(d.x!==-dir.x||d.y!==-dir.y)next=d}
 function start(firstDirection){resetState();running=true;if(firstDirection){dir=firstDirection;next=firstDirection}$('#snake-help').textContent='JÁTÉKBAN — SOK SIKERT!';setStatus('Játékban vagy — gyűjtsd a pontokat!');timer=setInterval(tick,125)}
 function tick(){dir=next;let h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.y<0||h.x>=20||h.y>=20||snake.some(p=>p.x===h.x&&p.y===h.y)){clearInterval(timer);timer=null;running=false;$('#snake-help').textContent='JÁTÉK VÉGE — NYOMJ MEG BÁRMILYEN BILLENTYŰT AZ ÚJRAKEZDÉSHEZ';setStatus(`<strong>Játék vége!</strong> Pontszámod: ${score}. Bármelyik billentyűvel újraindíthatod.`);return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score++;$('#ss').textContent=score;placeFood()}else snake.pop();draw()}
 document.onkeydown=e=>{if(current!=='snake')return; if(!running){if(e.repeat)return; if(map[e.key])e.preventDefault(); start(map[e.key]); return;} if(map[e.key]){e.preventDefault();change(map[e.key])}};
 document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const d=directions[b.dataset.d];if(!running){start(d)}else change(d)});
 resetState();
}
render();
