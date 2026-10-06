import {host,ROUTES_AREA,SIDEBAR_NAV_AREA} from '@hermes/plugin-sdk'
import {useEffect,useRef,useState} from 'react'
import {jsx,jsxs} from 'react/jsx-runtime'

const PEOPLE=[
 {id:'MAYA_OPERATOR',name:'Maya Operator',node:'OFFICE',home:[25,56],idle:[63,80]},
 {id:'OFFICE_TEAM_1',name:'Team 1',node:'OFFICE',home:[16,52],idle:[63,80]},
 {id:'OFFICE_TEAM_2',name:'Team 2',node:'OFFICE',home:[34,52],idle:[73,80]},
 {id:'OFFICE_TEAM_3',name:'Team 3',node:'OFFICE',home:[16,61],idle:[63,80]},
 {id:'VPS_OPERATOR',name:'VPS Operator',node:'VPS',home:[76,56],idle:[85,80]},
 {id:'VPS_TEAM_1',name:'VPS Team 1',node:'VPS',home:[66,52],idle:[63,80]},
 {id:'VPS_TEAM_2',name:'VPS Team 2',node:'VPS',home:[84,52],idle:[73,80]},
 {id:'VPS_TEAM_3',name:'VPS Team 3',node:'VPS',home:[66,61],idle:[85,80]},
 {id:'MAYA_SUPPORT',name:'Maya Support',node:'SUPPORT',home:[15,73],idle:[73,80]},
 {id:'FINANCE_ADMIN',name:'Finance/Admin',node:'ADMIN',home:[34,73],idle:[73,80]}
]
const INIT=Object.fromEntries(PEOPLE.map((p,i)=>[p.id,{status:i%4===0?'WORKING':i%4===1?'REVIEWING':i%4===2?'IDLE':'PASS',task:'Demo task'}]))
const CYCLE=['WORKING','REVIEWING','IDLE','PASS','BLOCKED','NEEDS_OWNER']

const CSS=`
.m8{height:100%;min-height:740px;background:#090d12;color:#fff;display:flex;flex-direction:column;font-family:Inter,system-ui}
.h{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #29313c}.corp{font-size:9px;letter-spacing:.18em;color:#9297a0;font-weight:800}.title{font-size:21px;font-weight:950}.title b{color:#f1cc6c}.chip{font-size:8px;border:1px solid #345843;border-radius:999px;padding:6px 8px;color:#8ce3a9}
.body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(850px,1fr) 330px}.stage{padding:12px;min-height:0}.scene{--rx:0deg;--ry:0deg;height:100%;min-height:650px;position:relative;overflow:hidden;border:1px solid #323b47;border-radius:17px;background:#638b98;perspective:1200px}.world{position:absolute;inset:0;transform:rotateX(var(--rx)) rotateY(var(--ry));transition:transform .18s ease}
.top{position:absolute;inset:0 0 auto;height:9%;background:linear-gradient(#f2e8d8,#d9cbb5);border-bottom:5px solid #8a633c}.brand{position:absolute;z-index:5;left:50%;top:1%;transform:translateX(-50%);text-align:center;color:#403529;font-size:8px;font-weight:900}.brand strong{display:block;font-size:12px}
.corr{position:absolute;background:rgba(20,45,53,.24);border:1px solid rgba(255,255,255,.07);z-index:2}.corr.h{left:5%;right:5%;top:40%;height:6%}.corr.v{left:45%;width:10%;top:10%;bottom:5%}.corr.entry{left:44%;width:12%;top:84%;bottom:0;background:rgba(20,45,53,.3)}
.room{position:absolute;border:2px solid #39454c;border-radius:8px;background:linear-gradient(#e9e1d3 0 18%,#587e8b 18%);box-shadow:0 8px 0 rgba(18,26,31,.38),0 12px 16px rgba(0,0,0,.15)}.room:after{content:"";position:absolute;left:0;right:0;top:18%;height:4px;background:#8a633c}.rl{position:absolute;top:5px;left:8px;font-size:8px;color:#42372d;font-weight:950;letter-spacing:.08em}
.exec{left:6%;top:12%;width:36%;height:25%;background:linear-gradient(#efe4cf 0 18%,#b99b76 18%)}.meet{left:58%;top:12%;width:36%;height:25%}.ops{left:6%;top:47%;width:37%;height:18%}.vps{left:57%;top:47%;width:37%;height:18%;background:linear-gradient(#dfe3e5 0 18%,#405965 18%)}.support{left:6%;top:68%;width:20%;height:14%}.finance{left:29%;top:68%;width:18%;height:14%;background:linear-gradient(#eee4d3 0 18%,#809686 18%)}.lounge{left:52%;top:68%;width:15%;height:14%;background:linear-gradient(#e6ded1 0 18%,#536a7e 18%)}.pantry{left:69%;top:68%;width:10%;height:14%;background:linear-gradient(#efe8db 0 18%,#c9b79c 18%)}.server{left:81%;top:68%;width:13%;height:19%;background:linear-gradient(#d0d7db 0 18%,#1b2933 18%)}.lobby{left:42%;top:86%;width:16%;height:11%;background:linear-gradient(#eee8dc 0 26%,#8ca0a5 26%)}.lobby:after{top:26%}
.door{position:absolute;z-index:8;width:26px;height:7px;background:#6a482d;border:1px solid #4f341f;border-radius:1px;box-shadow:0 2px rgba(0,0,0,.25)}.de{left:32%;top:36.7%}.dm{left:65%;top:36.7%}.do{left:33%;top:64.8%}.dv{left:64%;top:64.8%}.dl{left:48.5%;top:85%}
.desk{position:absolute;width:67px;height:33px;background:linear-gradient(#b8844b,#81562f);border:2px solid #68431f;border-radius:5px;box-shadow:0 6px 0 #51331a}.desk:before{content:"";position:absolute;left:27%;top:-16px;width:46%;height:27px;background:#101923;border:2px solid #34414e;border-radius:3px}.e1{left:11%;top:25%}.e2{left:29%;top:25%;width:58px}.mt{left:68%;top:25%;width:105px;height:42px;border-radius:50%;background:linear-gradient(#a87543,#744a28)}.mt:before{display:none}.o1{left:12%;top:54%}.o2{left:30%;top:54%}.o3{left:12%;top:62%}.o4{left:30%;top:62%}.v1{left:62%;top:54%}.v2{left:80%;top:54%}.v3{left:62%;top:62%}.v4{left:80%;top:62%}.s1{left:12%;top:75%;width:58px}.s2{left:33%;top:75%;width:58px}
.screen{position:absolute;left:17%;top:15%;width:78px;height:35px;background:#081018;border:3px solid #3b4650;border-radius:4px}.screen:after{content:"MAYA CORE / MASB5";position:absolute;inset:0;display:grid;place-items:center;color:#f1cc6c;font-size:6px;font-weight:900}.sofa{position:absolute;left:54%;top:75%;width:80px;height:35px;border-radius:9px;background:#405363;border:2px solid #27343f;box-shadow:0 6px 0 #22303a}.coffee{position:absolute;left:71%;top:75%;width:52px;height:35px;border-radius:7px;background:#e6ddcf;border:2px solid #887966}.coffee:after{content:"☕";position:absolute;inset:0;display:grid;place-items:center}.reception{position:absolute;left:46.5%;top:90%;width:62px;height:30px;border-radius:5px;background:#9a6c3c;border:2px solid #68431f;box-shadow:0 5px 0 #51331a}.reception:after{content:"RECEPTION";position:absolute;left:50%;top:8px;transform:translateX(-50%);font-size:6px;color:#fff;font-weight:900}
.rack{position:absolute;top:74%;width:14px;height:56px;background:#091017;border:1px solid #3b4955}.r1{left:82.3%}.r2{left:85%}.r3{left:87.7%}.r4{left:90.4%}.rack:after{content:"";position:absolute;left:20%;right:20%;top:12%;height:3px;background:#58a6ff;box-shadow:0 10px #54c987,0 20px #58a6ff,0 30px #54c987}
.person{position:absolute;width:62px;height:92px;transform:translate(-50%,-50%);transition:left .22s linear,top .22s linear;filter:drop-shadow(0 7px 5px rgba(0,0,0,.24))}.person.walk .avatar{animation:walk .22s infinite alternate}.person.work .arms{animation:type .2s infinite alternate}@keyframes walk{to{transform:translateY(-4px) rotate(.8deg)}}@keyframes type{to{transform:translateY(2px)}}.shadow{position:absolute;left:10px;top:61px;width:40px;height:12px;border-radius:50%;background:rgba(0,0,0,.28);filter:blur(1px)}.avatar{position:absolute;left:9px;top:8px;width:44px;height:60px}.head{position:absolute;left:10px;top:1px;width:23px;height:23px;border-radius:50%;background:var(--skin);box-shadow:inset -4px -4px rgba(0,0,0,.07)}.hair{position:absolute;z-index:2;left:7px;top:-3px;width:28px;height:12px;border-radius:15px 15px 7px 7px;background:var(--hair)}.bodyp{position:absolute;left:5px;top:22px;width:33px;height:29px;border-radius:10px 10px 6px 6px;background:var(--outfit);box-shadow:inset -4px -4px rgba(0,0,0,.06)}.legs{position:absolute;left:9px;top:49px;width:25px;height:11px;border-left:7px solid #27323d;border-right:7px solid #27323d}.arms:before,.arms:after{content:"";position:absolute;top:30px;width:7px;height:18px;background:var(--skin);border-radius:5px}.arms:before{left:3px}.arms:after{right:2px}.face{position:absolute;z-index:3;left:13px;top:10px;width:3px;height:3px;border-radius:50%;background:#222;box-shadow:8px 0 #222}.badge{position:absolute;left:50%;top:-7px;transform:translateX(-50%);font-size:7px;font-weight:950;border:1px solid currentColor;background:#10161d;border-radius:999px;padding:2px 5px;white-space:nowrap}.WORKING{color:#58a6ff}.REVIEWING{color:#b892ff}.IDLE{color:#b6bec7}.PASS{color:#54c987}.BLOCKED{color:#ffbf52}.NEEDS_OWNER{color:#ff7777}.tag{position:absolute;left:50%;top:68px;transform:translateX(-50%);min-width:82px;max-width:110px;padding:3px 5px;background:#f4ecde;color:#3b3329;border:1px solid #907c5d;border-radius:5px;font-size:8px;font-weight:950;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bubble{position:absolute;left:50%;top:87px;transform:translateX(-50%);font-size:7px;background:#111820;border:1px solid #34404d;border-radius:7px;padding:3px 6px;white-space:nowrap;color:#d9dee4}
.vip{position:absolute;width:64px;height:94px;transform:translate(-50%,-50%);z-index:150;filter:drop-shadow(0 7px 5px rgba(0,0,0,.24))}.vip .tag{top:69px}.vtitle{position:absolute;left:50%;top:88px;transform:translateX(-50%);font-size:6px;font-weight:900;white-space:nowrap;padding:2px 5px;background:#f3dfc0;color:#4a3c2c;border:1px solid #ac8f63;border-radius:5px}
.side{background:#10151d;overflow:auto}.sideh{padding:14px;border-bottom:1px solid #2a323c}.sideh strong{font-size:13px}.sideh small{display:block;color:#9297a0;font-size:8px;margin-top:3px}.card{margin:10px;padding:12px;border:1px solid #2a323c;border-radius:10px;background:#171d26}.card h3{margin:0;font-size:11px}.sub{font-size:8px;color:#9297a0;margin-top:3px}.stats{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.stat{padding:8px;border:1px solid #2f3945;border-radius:8px;background:#121820}.stat b{display:block;font-size:15px;color:#f0d273}.stat span{font-size:7px;color:#88939f}.log{font:7px ui-monospace,Consolas;line-height:1.55;color:#aab2bc}.btn{width:100%;margin-top:8px;padding:7px;border:1px solid #d6a73a;border-radius:7px;background:#151c24;color:#dce0e5;font-size:8px;font-weight:900}
`

function targetFor(p,run,reviewIdx,ownerIdx){
 if(run.status==='WORKING'||run.status==='PASS')return p.home
 if(run.status==='REVIEWING')return reviewIdx%2===0?[50,33]:[60,33]
 if(run.status==='NEEDS_OWNER')return ownerIdx%2===0?[34,31]:[38,31]
 if(run.status==='BLOCKED')return p.node==='VPS'?[58,64]:[43,64]
 return p.idle
}
function bubble(s){return s==='WORKING'?'working':s==='REVIEWING'?'reviewing':s==='NEEDS_OWNER'?'need Kris':s==='PASS'?'done ✓':s==='BLOCKED'?'waiting':'idle'}
function smoothStep(cur,target,amount=.16){return [cur[0]+(target[0]-cur[0])*amount,cur[1]+(target[1]-cur[1])*amount]}

function Person({p,run,pos,onClick}){
 const moving=Math.abs(pos[0]-(p.home?.[0]||pos[0]))>.5||['REVIEWING','NEEDS_OWNER','BLOCKED','IDLE'].includes(run.status)
 return jsxs('div',{className:`person ${moving?'walk':''} ${run.status==='WORKING'?'work':''}`,style:{left:`${pos[0]}%`,top:`${pos[1]}%`,'--skin':'#c98a67','--hair':'#2f231f','--outfit':p.node==='VPS'?'#397866':p.node==='SUPPORT'?'#9d5073':p.node==='ADMIN'?'#c59b3e':'#456fae',zIndex:String(100+Math.round(pos[1]))},onClick,children:[
  jsx('div',{className:'shadow'}),jsx('div',{className:`badge ${run.status}`,children:run.status.replace('_',' ')}),
  jsxs('div',{className:'avatar',children:[jsx('div',{className:'hair'}),jsx('div',{className:'head'}),jsx('div',{className:'face'}),jsx('div',{className:'bodyp'}),jsx('div',{className:'arms'}),jsx('div',{className:'legs'})]}),
  jsx('div',{className:'tag',children:p.name}),jsx('div',{className:'bubble',children:bubble(run.status)})
 ]})
}
function VIP({name,title,x,y,outfit}){
 return jsxs('div',{className:'vip',style:{left:`${x}%`,top:`${y}%`,'--skin':'#c98a67','--hair':'#2f231f','--outfit':outfit},children:[
  jsx('div',{className:'shadow'}),jsxs('div',{className:'avatar',children:[jsx('div',{className:'hair'}),jsx('div',{className:'head'}),jsx('div',{className:'face'}),jsx('div',{className:'bodyp'}),jsx('div',{className:'arms'}),jsx('div',{className:'legs'})]}),
  jsx('div',{className:'tag',children:name}),jsx('div',{className:'vtitle',children:title})
 ]})
}

function Office(){
 const ref=useRef(null)
 const [runtime,setRuntime]=useState(INIT)
 const [positions,setPositions]=useState(Object.fromEntries(PEOPLE.map(p=>[p.id,p.home])))
 const [demo,setDemo]=useState(true)
 const [selected,setSelected]=useState('MAYA_OPERATOR')
 const [events,setEvents]=useState([{at:Date.now(),text:'V0.8 started'}])

 useEffect(()=>{
  const id=setInterval(()=>{
   setPositions(prev=>{
    const reviews=PEOPLE.filter(p=>runtime[p.id]?.status==='REVIEWING')
    const owners=PEOPLE.filter(p=>runtime[p.id]?.status==='NEEDS_OWNER')
    const next={...prev}
    for(const p of PEOPLE){
      const run=runtime[p.id]||{status:'IDLE'}
      const t=targetFor(p,run,Math.max(0,reviews.findIndex(x=>x.id===p.id)),Math.max(0,owners.findIndex(x=>x.id===p.id)))
      next[p.id]=smoothStep(prev[p.id]||p.home,t,.18)
    }
    return next
   })
  },120)
  return()=>clearInterval(id)
 },[runtime])

 useEffect(()=>{
  if(!demo)return
  let t=0
  const id=setInterval(()=>{
   t++;const p=PEOPLE[(t*3+1)%PEOPLE.length],s=CYCLE[t%CYCLE.length]
   setRuntime(r=>({...r,[p.id]:{...(r[p.id]||{}),status:s}}))
   setEvents(e=>[{at:Date.now(),text:`${p.id} → ${s}`},...e].slice(0,14))
  },5000)
  return()=>clearInterval(id)
 },[demo])

 function move(e){const el=ref.current;if(!el)return;const r=el.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--ry',`${nx*2.2}deg`);el.style.setProperty('--rx',`${-ny*1.5}deg`)}
 function leave(){const el=ref.current;if(el){el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg')}}

 const reviews=PEOPLE.filter(p=>runtime[p.id]?.status==='REVIEWING')
 const owners=PEOPLE.filter(p=>runtime[p.id]?.status==='NEEDS_OWNER')
 const working=Object.values(runtime).filter(x=>x.status==='WORKING').length
 const attention=Object.values(runtime).filter(x=>['BLOCKED','NEEDS_OWNER'].includes(x.status)).length
 const selectedRun=runtime[selected]||{}

 return jsxs('div',{className:'m8',children:[
  jsx('style',{children:CSS}),
  jsxs('div',{className:'h',children:[jsxs('div',{children:[jsx('div',{className:'corp',children:'PT MRXPANEL MEDIA GROUP'}),jsxs('div',{className:'title',children:['MRXPANEL ',jsx('b',{children:'OFFICE'})]})]}),jsx('div',{className:'chip',children:'V0.8 • OFFICE MOTION'})]}),
  jsxs('div',{className:'body',children:[
   jsx('main',{className:'stage',children:jsxs('div',{ref,className:'scene',onMouseMove:move,onMouseLeave:leave,children:[
    jsxs('div',{className:'world',children:[
     jsx('div',{className:'top'}),jsxs('div',{className:'brand',children:[jsx('strong',{children:'PT MRXPANEL MEDIA GROUP'}),'MRXPANEL OFFICE']}),
     jsx('div',{className:'corr h'}),jsx('div',{className:'corr v'}),jsx('div',{className:'corr entry'}),
     jsxs('div',{className:'room exec',children:[jsx('div',{className:'rl',children:'RUANG PIMPINAN • KRIS + MAYA'})]}),
     jsxs('div',{className:'room meet',children:[jsx('div',{className:'rl',children:'RUANG MEETING / REVIEW'})]}),
     jsxs('div',{className:'room ops',children:[jsx('div',{className:'rl',children:'RUANG OPERASIONAL'})]}),
     jsxs('div',{className:'room vps',children:[jsx('div',{className:'rl',children:'VPS / TECH OPS'})]}),
     jsxs('div',{className:'room support',children:[jsx('div',{className:'rl',children:'SUPPORT'})]}),
     jsxs('div',{className:'room finance',children:[jsx('div',{className:'rl',children:'FINANCE / ADMIN'})]}),
     jsxs('div',{className:'room lounge',children:[jsx('div',{className:'rl',children:'LOUNGE'})]}),
     jsxs('div',{className:'room pantry',children:[jsx('div',{className:'rl',children:'PANTRY'})]}),
     jsxs('div',{className:'room server',children:[jsx('div',{className:'rl',children:'SERVER'})]}),
     jsxs('div',{className:'room lobby',children:[jsx('div',{className:'rl',children:'LOBBY / RECEPTION'})]}),
     jsx('div',{className:'door de'}),jsx('div',{className:'door dm'}),jsx('div',{className:'door do'}),jsx('div',{className:'door dv'}),jsx('div',{className:'door dl'}),
     jsx('div',{className:'screen'}),jsx('div',{className:'desk e1'}),jsx('div',{className:'desk e2'}),jsx('div',{className:'desk mt'}),
     jsx('div',{className:'desk o1'}),jsx('div',{className:'desk o2'}),jsx('div',{className:'desk o3'}),jsx('div',{className:'desk o4'}),
     jsx('div',{className:'desk v1'}),jsx('div',{className:'desk v2'}),jsx('div',{className:'desk v3'}),jsx('div',{className:'desk v4'}),
     jsx('div',{className:'desk s1'}),jsx('div',{className:'desk s2'}),jsx('div',{className:'sofa'}),jsx('div',{className:'coffee'}),jsx('div',{className:'reception'}),
     jsx('div',{className:'rack r1'}),jsx('div',{className:'rack r2'}),jsx('div',{className:'rack r3'}),jsx('div',{className:'rack r4'}),
     jsx(VIP,{name:'Kris',title:'Pimpinan',x:17,y:27,outfit:'#202b3a'}),jsx(VIP,{name:'Maya',title:'AI Executive Partner',x:34,y:27,outfit:'#c59b3e'}),
     ...PEOPLE.map(p=>jsx(Person,{p,run:runtime[p.id]||{status:'IDLE'},pos:positions[p.id]||p.home,onClick:()=>setSelected(p.id),key:p.id}))
    ]})
   ]})}),
   jsxs('aside',{className:'side',children:[
    jsxs('div',{className:'sideh',children:[jsx('strong',{children:'Office Control'}),jsx('small',{children:'Smooth motion + lobby + real-room flow'})]}),
    jsxs('section',{className:'card',children:[jsx('h3',{children:'Office Overview'}),jsxs('div',{className:'stats',children:[
     jsxs('div',{className:'stat',children:[jsx('b',{children:String(working)}),jsx('span',{children:'Working'})]}),
     jsxs('div',{className:'stat',children:[jsx('b',{children:String(reviews.length)}),jsx('span',{children:'Meeting'})]}),
     jsxs('div',{className:'stat',children:[jsx('b',{children:String(attention)}),jsx('span',{children:'Need attention'})]}),
     jsxs('div',{className:'stat',children:[jsx('b',{children:String(owners.length)}),jsx('span',{children:'Executive queue'})]})
    ]})]}),
    jsxs('section',{className:'card',children:[jsx('h3',{children:selected}),jsx('div',{className:'sub',children:`Status: ${selectedRun.status||'-'}`}),jsx('div',{className:'log',children:`Task: ${selectedRun.task||'Demo task'}`})]}),
    jsxs('section',{className:'card',children:[jsx('h3',{children:'Executive Room'}),jsx('div',{className:'sub',children:'Kris + Maya tetap di ruang pimpinan. NEEDS_OWNER bergerak ke executive queue.'}),jsx('button',{className:'btn',onClick:()=>setDemo(v=>!v),children:demo?'PAUSE SIMULATION':'RESUME SIMULATION'})]}),
    jsxs('section',{className:'card',children:[jsx('h3',{children:'Live Events'}),...events.map((e,i)=>jsx('div',{className:'log',children:`${new Date(e.at).toLocaleTimeString()} ${e.text}`,key:i}))]})
   ]})
  ]})
 ]})
}

export default{
 id:'mrxpanel-office',name:'MRXPANEL OFFICE',defaultEnabled:true,
 register(ctx){ctx.register({id:'route',area:ROUTES_AREA,title:'MRXPANEL OFFICE',data:{path:'/mrxpanel-office'},render:()=>jsx(Office,{})});ctx.register({id:'sidebar',area:SIDEBAR_NAV_AREA,title:'MRXPANEL OFFICE',data:{path:'/mrxpanel-office',label:'MRXPANEL OFFICE',codicon:'organization'}})}
}
