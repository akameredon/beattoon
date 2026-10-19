import './style.css';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const $ = id => document.getElementById(id);
const canvas = $('stage');
const ctx = canvas.getContext('2d');
const input = $('audioFile');
const audio = new Audio();
audio.preload = 'metadata';
let audioUrl = null, resultUrl = null, style = 'concert', audioContext, analyser, source, bins, busy = false;
const colors = {
  concert: ['#17142d','#38215c','#ff6f91','#ffd166'],
  dream: ['#151b39','#343c78','#a7f3d0','#d6b4ff'],
  street: ['#17182a','#314d65','#ff9f68','#f8df75'],
  sunrise: ['#351c45','#9a456a','#ffb36b','#fff0a6']
};
const timeLabel = s => Number.isFinite(s) ? String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0') : '00:00';
function level(){
  if(!analyser||!bins)return .12;
  analyser.getByteFrequencyData(bins);
  let sum=0; for(const v of bins)sum+=v;
  return Math.min(1,sum/(bins.length*150));
}
function character(x,y,scale,t,accent,n){
  ctx.save();ctx.translate(x,y+Math.sin(t*4+n)*8);ctx.scale(scale,scale);
  ctx.fillStyle='#08081277';ctx.beginPath();ctx.ellipse(0,84,37,8,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c87966';ctx.lineWidth=12;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-22,-5);ctx.lineTo(-40,15+Math.sin(t*3+n)*12);ctx.moveTo(22,-5);ctx.lineTo(40,-25+Math.cos(t*3+n)*12);ctx.stroke();
  ctx.strokeStyle='#29233f';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(-10,43);ctx.lineTo(-15,72);ctx.moveTo(10,43);ctx.lineTo(15,72);ctx.stroke();
  ctx.fillStyle='#f5b9a4';ctx.fillRect(-29,70,24,10);ctx.fillRect(5,70,24,10);
  ctx.fillStyle=n%2?'#f2c14e':'#5f55a8';ctx.beginPath();ctx.roundRect(-27,-16,54,64,15);ctx.fill();
  ctx.fillStyle=accent;ctx.beginPath();ctx.roundRect(-19,-9,38,45,10);ctx.fill();
  ctx.fillStyle='#d99179';ctx.fillRect(-8,-33,16,17);ctx.beginPath();ctx.ellipse(0,-50,25,29,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#302038';ctx.beginPath();ctx.arc(0,-59,26,Math.PI,Math.PI*2);ctx.lineTo(24,-42);ctx.lineTo(-24,-42);ctx.fill();
  ctx.fillStyle='#271b2d';ctx.beginPath();ctx.arc(-9,-49,2.4,0,Math.PI*2);ctx.arc(9,-49,2.4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#8d3f4e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-42,6,.2,Math.PI-.2);ctx.stroke();
  ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-57,27,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
  ctx.restore();
}
function draw(t=0,a=.12){
  const w=canvas.width,h=canvas.height,p=colors[style]||colors.concert;
  const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,p[0]);grad.addColorStop(1,p[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  for(let i=0;i<6;i++){
    const x=(i*191+Math.sin(t*.5+i)*60+100)%w,y=90+(i*91)%300+Math.cos(t+i)*20;
    const glow=ctx.createRadialGradient(x,y,2,x,y,85+a*70);glow.addColorStop(0,p[2]+'66');glow.addColorStop(1,p[2]+'00');ctx.fillStyle=glow;ctx.fillRect(x-90,y-90,180,180);
  }
  for(let i=0;i<44;i++){const x=(i*197+Math.sin(t+i)*20)%w,y=(i*83+t*(8+i%4*4))%h;ctx.globalAlpha=.25+(i%4)*.1;ctx.fillStyle=p[i%2+2];ctx.beginPath();ctx.arc(x,y,1.5+i%3+a*2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  if(style==='street'){
    for(let i=0;i<10;i++){const bh=100+(i*71)%170;ctx.fillStyle='#15172dcc';ctx.fillRect(i*105,h-bh,80,bh);for(let yy=h-bh+14;yy<h-12;yy+=23)for(let xx=i*105+10;xx<i*105+70;xx+=22){ctx.fillStyle=p[(i+Math.floor(yy/23))%2+2]+'aa';ctx.fillRect(xx,yy,8,10);}}
  }else if(style==='sunrise'){ctx.fillStyle='#ffd38c55';ctx.beginPath();ctx.arc(w*.75,h*.38,85+a*25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b193d';ctx.beginPath();ctx.moveTo(0,h*.82);ctx.quadraticCurveTo(w*.25,h*.63,w*.45,h*.84);ctx.quadraticCurveTo(w*.72,h*.6,w,h*.83);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();}
  else if(style==='dream'){for(let i=0;i<8;i++){ctx.strokeStyle=p[2]+'88';ctx.lineWidth=2;ctx.beginPath();ctx.arc((i*139+t*12)%w,(i*67+80)%h,20+i%3*10+a*20,0,Math.PI*2);ctx.stroke();}}
  else {for(let i=0;i<7;i++){ctx.globalAlpha=.08+a*.1;ctx.fillStyle=p[i%2+2];ctx.beginPath();ctx.moveTo(i*160-50,0);ctx.lineTo(i*160+35,0);ctx.lineTo(i*160+190,h);ctx.lineTo(i*160+110,h);ctx.closePath();ctx.fill();}ctx.globalAlpha=1;}
  const floor=ctx.createLinearGradient(0,h*.7,0,h);floor.addColorStop(0,'#11101b00');floor.addColorStop(1,'#090914dd');ctx.fillStyle=floor;ctx.fillRect(0,h*.65,w,h*.35);
  character(w*.5,h*.66,1.05,t,p[2],0);character(w*.28,h*.76,.7,t,p[3],1);character(w*.72,h*.76,.7,t,p[2],2);
  for(let i=0;i<32;i++){const bh=8+Math.abs(Math.sin(t*3+i*.52))*(14+a*80);ctx.fillStyle=i%2?p[2]:p[3];ctx.beginPath();ctx.roundRect(90+i*25,h-18-bh,12,bh,4);ctx.fill();}
  ctx.textAlign='center';ctx.font='700 15px system-ui';ctx.fillStyle='#ffffffbb';ctx.fillText('BEATTOON ORIGINAL',w/2,32);
}
function animate(){draw(audio.currentTime||0,level());if(audio.duration&&Number.isFinite(audio.duration))$('timelineFill').style.width=Math.min(100,audio.currentTime/audio.duration*100)+'%';requestAnimationFrame(animate);}
animate();
function setupAudio(){
  try{if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(!source){source=audioContext.createMediaElementSource(audio);analyser=audioContext.createAnalyser();analyser.fftSize=256;bins=new Uint8Array(analyser.frequencyBinCount);source.connect(analyser);analyser.connect(audioContext.destination);}}catch(e){console.warn(e);}
}
input.addEventListener('change',()=>{
  const file=input.files&&input.files[0];if(!file)return;
  if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(file);audio.src=audioUrl;audio.load();
  $('trackName').textContent=file.name;$('empty').hidden=true;$('generate').disabled=false;$('status').textContent='TRACK LOADED';setupAudio();
  audio.addEventListener('loadedmetadata',()=>{$('duration').textContent=timeLabel(audio.duration);},{once:true});
});
document.querySelectorAll('.style').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.style').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');style=btn.dataset.style;}));
const drop=$('dropzone');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag');});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('audio/')){const dt=new DataTransfer();dt.items.add(f);input.files=dt.files;input.dispatchEvent(new Event('change'));}});
function progress(p,msg){$('progressWrap').hidden=false;$('progressText').textContent=msg;$('progressPct').textContent=Math.round(p)+'%';$('progressBar').style.width=p+'%';}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
$('generate').addEventListener('click',async()=>{
 if(busy||!audioUrl)return;busy=true;$('generate').disabled=true;$('download').hidden=true;if(resultUrl)URL.revokeObjectURL(resultUrl);
 let recorder,stream,ffmpeg;
 try{
  setupAudio();if(audioContext&&audioContext.state==='suspended')await audioContext.resume();
  const duration=audio.duration;if(!Number.isFinite(duration)||duration<=0)throw Error('The browser could not read this audio duration. Try another file.');
  if(duration>300)throw Error('For this first version, please use a song under 5 minutes.');
  if(!window.MediaRecorder||!canvas.captureStream)throw Error('This browser cannot record canvas video. Try a recent desktop Chrome or Edge.');
  const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error('WebM recording is not supported in this browser.');
  progress(2,'Preparing cartoon scene…');$('status').textContent='RENDERING';audio.pause();audio.currentTime=0;
  stream=canvas.captureStream(30);const tracks=[...stream.getVideoTracks()];
  const dest=audioContext.createMediaStreamDestination();analyser.connect(dest);tracks.push(...dest.stream.getAudioTracks());
  stream=new MediaStream(tracks);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});const chunks=[];
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const done=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=()=>reject(Error('Browser video recording failed.'));});
  recorder.start(1000);await audio.play();
  while(audio.currentTime<duration&&!audio.ended){progress(5+audio.currentTime/duration*60,'Recording cartoon scenes · '+timeLabel(audio.currentTime)+' / '+timeLabel(duration));await wait(250);}
  audio.pause();recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());try{analyser.disconnect(dest);}catch{}
  const webm=new Blob(chunks,{type:mime});if(!webm.size)throw Error('The browser produced an empty video. Try a desktop browser.');
  progress(68,'Loading local MP4 encoder…');ffmpeg=new FFmpeg();ffmpeg.on('progress',({progress:p})=>progress(70+Math.max(0,Math.min(1,p))*27,'Converting to MP4 on this device…'));
  const base=new URL('/ffmpeg/',location.href);await ffmpeg.load({coreURL:new URL('ffmpeg-core.js',base).href,wasmURL:new URL('ffmpeg-core.wasm',base).href});
  await ffmpeg.writeFile('recording.webm',new Uint8Array(await webm.arrayBuffer()));await ffmpeg.writeFile('original-audio',new Uint8Array(await(await fetch(audioUrl)).arrayBuffer()));
  await ffmpeg.exec(['-i','recording.webm','-i','original-audio','-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','output.mp4']);
  const data=await ffmpeg.readFile('output.mp4');resultUrl=URL.createObjectURL(new Blob([data.buffer],{type:'video/mp4'}));$('download').href=resultUrl;$('download').hidden=false;$('status').textContent='VIDEO READY';progress(100,'Done — '+(data.length/1024/1024).toFixed(1)+' MB');
 }catch(e){console.error(e);$('status').textContent='NEEDS ATTENTION';progress(0,e.message||'Export failed. Try again.');$('progressPct').textContent='!';}
 finally{if(stream)stream.getTracks().forEach(t=>t.stop());if(recorder&&recorder.state!=='inactive'){try{recorder.stop();}catch{}}if(ffmpeg){try{ffmpeg.terminate();}catch{}}busy=false;$('generate').disabled=!audioUrl;}
});
window.addEventListener('beforeunload',()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);if(resultUrl)URL.revokeObjectURL(resultUrl);});
