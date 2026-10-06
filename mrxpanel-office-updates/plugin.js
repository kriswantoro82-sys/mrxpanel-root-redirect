import {ROUTES_AREA,SIDEBAR_NAV_AREA} from '@hermes/plugin-sdk'
import {useEffect,useRef,useState} from 'react'
import {jsx,jsxs} from 'react/jsx-runtime'

const CSS=`
.m3d{height:100%;min-height:720px;background:#090d12;color:#fff;display:flex;flex-direction:column;font-family:Inter,system-ui}
.m3dh{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #29313c;background:#080c11}
.m3dcorp{font-size:9px;letter-spacing:.18em;color:#9297a0;font-weight:800}.m3dtitle{font-size:21px;font-weight:950}.m3dtitle b{color:#f1cc6c}
.m3dchip{font-size:8px;border:1px solid #345843;border-radius:999px;padding:6px 8px;color:#8ce3a9}
.m3dbody{flex:1;min-height:0;display:grid;grid-template-columns:minmax(760px,1fr) 320px}
.m3dstage{position:relative;min-height:0;background:#090d12;padding:12px}.m3dwrap{position:relative;width:100%;height:100%;min-height:640px;border-radius:16px;overflow:hidden;border:1px solid #323b47;background:linear-gradient(#1c2d38,#0e171d)}
.m3dcanvas{display:block;width:100%;height:100%;min-height:640px;touch-action:none;cursor:grab}.m3dcanvas:active{cursor:grabbing}
.m3dover{pointer-events:none;position:absolute;left:16px;top:16px;padding:10px 12px;border:1px solid rgba(241,204,108,.28);border-radius:10px;background:rgba(10,15,20,.72);backdrop-filter:blur(7px)}
.m3dover strong{font-size:12px;color:#f1cc6c}.m3dover small{display:block;margin-top:3px;font-size:8px;color:#aab3bd;line-height:1.45}
.m3dlegend{position:absolute;left:16px;bottom:16px;display:flex;gap:6px}.m3dpill{padding:5px 7px;border-radius:999px;background:rgba(10,15,20,.78);border:1px solid #33404b;font-size:7px;color:#c9d0d7}
.m3dside{overflow:auto;background:#10151d;border-left:1px solid #29313c}.m3dsideh{padding:14px;border-bottom:1px solid #29313c}.m3dsideh strong{font-size:13px}.m3dsideh small{display:block;color:#9297a0;font-size:8px;margin-top:3px}
.m3dcard{margin:10px;padding:12px;border:1px solid #2a323c;border-radius:10px;background:#171d26}.m3dcard h3{margin:0;font-size:11px}.m3dsub{font-size:8px;color:#9297a0;line-height:1.5;margin-top:4px}
.m3dstat{display:grid;grid-template-columns:90px 1fr;gap:6px 8px;margin-top:10px;font-size:8px}.m3dstat span:nth-child(odd){color:#7f8994}.m3dstat span:nth-child(even){color:#e0e4e8}
.m3dbtn{width:100%;margin-top:8px;padding:8px;border:1px solid #3a4652;border-radius:7px;background:#121920;color:#dce2e7;font-size:8px;font-weight:900;cursor:pointer}.m3dbtn.active{border-color:#d6a73a;background:linear-gradient(#f1cc6c,#d6a73a);color:#19140c}
.m3dgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.m3dnote{font-size:7px;color:#697581;line-height:1.5}
@media(max-width:1000px){.m3dbody{grid-template-columns:1fr}.m3dside{display:none}}
`

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))
const lerp=(a,b,t)=>a+(b-a)*t
const ease=t=>t*t*(3-2*t)
const V=(x=0,y=0,z=0)=>[x,y,z]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]]
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]}

function Mmul(a,b){
 const r=new Array(16).fill(0)
 for(let row=0;row<4;row++)for(let col=0;col<4;col++)for(let k=0;k<4;k++)r[row*4+col]+=a[row*4+k]*b[k*4+col]
 return r
}
const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
const T=(x,y,z)=>[1,0,0,x,0,1,0,y,0,0,1,z,0,0,0,1]
const S=(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]
const RX=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1]}
const RY=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,s,0,0,1,0,0,-s,0,c,0,0,0,0,1]}
function TP(m,p){return[m[0]*p[0]+m[1]*p[1]+m[2]*p[2]+m[3],m[4]*p[0]+m[5]*p[1]+m[6]*p[2]+m[7],m[8]*p[0]+m[9]*p[1]+m[10]*p[2]+m[11]]}
function lookAt(eye,target){
 const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x)
 return[x[0],x[1],x[2],-dot(x,eye),y[0],y[1],y[2],-dot(y,eye),z[0],z[1],z[2],-dot(z,eye),0,0,0,1]
}
function hex(c){
 const n=parseInt(c.replace('#',''),16);return[(n>>16)&255,(n>>8)&255,n&255]
}
function shade(c,f){
 const [r,g,b]=hex(c),k=clamp(f,.25,1.35)
 return`rgb(${clamp(Math.round(r*k),0,255)},${clamp(Math.round(g*k),0,255)},${clamp(Math.round(b*k),0,255)})`
}
function box(w,h,d){
 const x=w/2,y=h/2,z=d/2
 return{v:[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]],f:[[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]]}
}
function cyl(r,h,n=10){
 const v=[],f=[]
 for(let i=0;i<n;i++){const a=i*Math.PI*2/n;v.push([Math.cos(a)*r,-h/2,Math.sin(a)*r],[Math.cos(a)*r,h/2,Math.sin(a)*r])}
 for(let i=0;i<n;i++){const j=(i+1)%n;f.push([i*2,j*2,j*2+1,i*2+1])}
 f.push([...Array(n)].map((_,i)=>i*2).reverse(),[...Array(n)].map((_,i)=>i*2+1))
 return{v,f}
}
function sphere(rx,ry,rz,lat=7,lon=12){
 const v=[],f=[]
 for(let a=0;a<=lat;a++){const p=a*Math.PI/lat;for(let b=0;b<lon;b++){const t=b*Math.PI*2/lon;v.push([Math.sin(p)*Math.cos(t)*rx,Math.cos(p)*ry,Math.sin(p)*Math.sin(t)*rz])}}
 for(let a=0;a<lat;a++)for(let b=0;b<lon;b++){const n=(b+1)%lon,i=a*lon+b,j=a*lon+n,k=(a+1)*lon+n,l=(a+1)*lon+b;f.push([i,j,k,l])}
 return{v,f}
}
const MESH={torso:box(.72,.82,.34),pelvis:box(.56,.25,.32),limb:cyl(.105,.56,10),fore:cyl(.09,.50,10),head:sphere(.27,.30,.27),hair:sphere(.285,.16,.285),hand:sphere(.11,.12,.11),shoe:box(.22,.13,.38)}

function addPart(out,mesh,color,m){out.push({mesh,color,m})}
function human(out,time,pose){
 const root=T(pose.x,pose.y,pose.z),base=Mmul(root,RY(pose.yaw||0))
 const walk=pose.kind==='walk',sit=pose.kind==='sit'
 const ph=Math.sin(time*8.4),bob=walk?Math.abs(Math.sin(time*8.4))*.035:Math.sin(time*2.2)*.012
 const pelvis=Mmul(base,T(0,.92+bob,0))
 addPart(out,MESH.pelvis,'#263646',pelvis)
 const lean=sit?.06:(walk?.035:0)
 const torso=Mmul(Mmul(pelvis,T(0,.48,0)),RX(lean))
 addPart(out,MESH.torso,'#365f91',torso)
 const neck=Mmul(torso,T(0,.55,0));addPart(out,cyl(.10,.14,10),'#c98a67',neck)
 const head=Mmul(torso,T(0,.83,0));addPart(out,MESH.head,'#c98a67',head)
 const hair=Mmul(head,T(0,.19,.01));addPart(out,MESH.hair,'#2f211c',hair)
 addPart(out,sphere(.035,.035,.018,5,8),'#1c2024',Mmul(head,T(-.085,.035,-.255)))
 addPart(out,sphere(.035,.035,.018,5,8),'#1c2024',Mmul(head,T(.085,.035,-.255)))

 const armL=walk?-ph*.60:(sit?-.75:-.08),armR=walk?ph*.60:(sit?-.75:.08)
 for(const side of [-1,1]){
  const a=side<0?armL:armR
  const shoulder=Mmul(torso,T(side*.47,.28,0))
  const up=Mmul(Mmul(shoulder,RX(a)),T(0,-.28,0));addPart(out,MESH.limb,'#365f91',up)
  const elbow=Mmul(Mmul(shoulder,RX(a)),T(0,-.56,0))
  const bend=sit?-.82:(walk?.12:0)
  const fore=Mmul(Mmul(elbow,RX(bend)),T(0,-.25,0));addPart(out,MESH.fore,'#c98a67',fore)
  const hand=Mmul(Mmul(elbow,RX(bend)),T(0,-.51,0));addPart(out,MESH.hand,'#c98a67',hand)
 }

 const thighL=sit?1.30:ph*.72,thighR=sit?1.30:-ph*.72
 for(const side of [-1,1]){
  const a=side<0?thighL:thighR
  const hip=Mmul(pelvis,T(side*.18,-.12,0))
  const upper=Mmul(Mmul(hip,RX(a)),T(0,-.28,0));addPart(out,MESH.limb,'#27323d',upper)
  const knee=Mmul(Mmul(hip,RX(a)),T(0,-.56,0))
  const kb=sit?-1.30:(walk?Math.max(0,-(side<0?ph:-ph))*.72:0)
  const lower=Mmul(Mmul(knee,RX(kb)),T(0,-.25,0));addPart(out,MESH.fore,'#27323d',lower)
  const foot=Mmul(Mmul(knee,RX(kb)),T(0,-.53,-.08));addPart(out,MESH.shoe,'#171d23',foot)
 }
}

function furniture(out){
 const add=(mesh,color,m)=>addPart(out,mesh,color,m)
 add(box(8,.12,6),'#718f86',T(0,-.08,0))
 add(box(8,3.2,.12),'#d8ccb8',T(0,1.55,-3))
 add(box(.12,3.2,6),'#aeb8b1',T(-4,1.55,0))
 add(box(2.35,.14,.86),'#9b6939',T(1.45,.92,-1.25))
 add(box(.15,.86,.15),'#6f4728',T(.48,.44,-1.55));add(box(.15,.86,.15),'#6f4728',T(2.42,.44,-1.55))
 add(box(.15,.86,.15),'#6f4728',T(.48,.44,-.95));add(box(.15,.86,.15),'#6f4728',T(2.42,.44,-.95))
 add(box(.9,.55,.08),'#131b22',T(1.45,1.35,-1.50));add(box(.12,.28,.12),'#232e37',T(1.45,1.03,-1.47))
 add(box(.62,.10,.58),'#33424e',T(1.45,.54,.05));add(box(.62,.78,.10),'#33424e',T(1.45,.94,.30))
 add(box(1.2,.07,.18),'#efe5d7',T(1.45,.99,-.88))
 add(box(1.55,.88,.10),'#253745',T(-1.65,1.60,-2.91))
 add(box(1.38,.70,.04),'#0b1219',T(-1.65,1.60,-2.84))
}

function renderScene(canvas,cam,time,modeRef,phaseCb){
 const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight)
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h)
 const grad=c.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#223844');grad.addColorStop(1,'#0d171d');c.fillStyle=grad;c.fillRect(0,0,w,h)

 let mode=modeRef.current,t=time%18,kind='idle',z=2.25,y=0,yaw=0
 if(mode==='sit'){kind='sit';z=.35}
 else if(mode==='walk'){kind='walk';z=1.3+Math.sin(time*.55)*1.55;yaw=Math.cos(time*.55)>0?Math.PI:0}
 else{
   if(t<2){kind='idle';z=2.3}
   else if(t<7){kind='walk';z=lerp(2.3,.35,ease((t-2)/5))}
   else if(t<11){kind='sit';z=.35}
   else if(t<12.5){kind='idle';z=.35}
   else if(t<17.5){kind='walk';z=lerp(.35,2.3,ease((t-12.5)/5));yaw=Math.PI}
   else{kind='idle';z=2.3;yaw=Math.PI}
 }
 phaseCb(kind)

 const objects=[];furniture(objects);human(objects,time,{x:0,y:0,z,yaw,kind})
 const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw),cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch)
 const eye=[cam.dist*sy*cp,2.0+cam.dist*sp,cam.dist*cy*cp],view=lookAt(eye,[0,1.15,-.25])
 const light=norm([-1,1.8,1.2]),faces=[]
 for(const o of objects){
  const world=o.mesh.v.map(p=>TP(o.m,p)),vv=world.map(p=>TP(view,p))
  for(const fi of o.mesh.f){
    const wp=fi.map(i=>world[i]),vp=fi.map(i=>vv[i])
    const dep=vp.map(p=>-p[2]);if(dep.some(d=>d<=.15))continue
    const n=norm(cross(sub(wp[1],wp[0]),sub(wp[2],wp[0]))),illum=.48+.58*Math.max(0,dot(n,light))
    const pts=vp.map(p=>{const d=-p[2],f=Math.min(w,h)*1.05;return[w/2+p[0]*f/d,h*.53-p[1]*f/d]})
    faces.push({pts,depth:dep.reduce((a,b)=>a+b,0)/dep.length,color:shade(o.color,illum)})
  }
 }
 faces.sort((a,b)=>b.depth-a.depth)
 c.lineJoin='round'
 for(const f of faces){c.beginPath();c.moveTo(f.pts[0][0],f.pts[0][1]);for(let i=1;i<f.pts.length;i++)c.lineTo(f.pts[i][0],f.pts[i][1]);c.closePath();c.fillStyle=f.color;c.fill();c.strokeStyle='rgba(0,0,0,.10)';c.lineWidth=.65;c.stroke()}
}

function True3D(){
 const canvasRef=useRef(null),modeRef=useRef('auto'),camRef=useRef({yaw:.62,pitch:.34,dist:9.5}),dragRef=useRef(null)
 const [mode,setMode]=useState('auto'),[phase,setPhase]=useState('idle')
 function choose(m){modeRef.current=m;setMode(m)}

 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return
  let raf=0,start=performance.now(),lastPhase=''
  const phaseCb=p=>{if(p!==lastPhase){lastPhase=p;setPhase(p)}}
  const loop=now=>{renderScene(canvas,camRef.current,(now-start)/1000,modeRef,phaseCb);raf=requestAnimationFrame(loop)}
  raf=requestAnimationFrame(loop)
  const down=e=>{dragRef.current={x:e.clientX,y:e.clientY,yaw:camRef.current.yaw,pitch:camRef.current.pitch};canvas.setPointerCapture?.(e.pointerId)}
  const move=e=>{const d=dragRef.current;if(!d)return;camRef.current.yaw=d.yaw-(e.clientX-d.x)*.008;camRef.current.pitch=clamp(d.pitch+(e.clientY-d.y)*.006,.10,.78)}
  const up=()=>{dragRef.current=null}
  const wheel=e=>{e.preventDefault();camRef.current.dist=clamp(camRef.current.dist+Math.sign(e.deltaY)*.55,6.5,14)}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false})
  return()=>{cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel)}
 },[])

 return jsxs('div',{className:'m3d',children:[
  jsx('style',{children:CSS}),
  jsxs('header',{className:'m3dh',children:[
   jsxs('div',{children:[jsx('div',{className:'m3dcorp',children:'PT MRXPANEL MEDIA GROUP'}),jsxs('div',{className:'m3dtitle',children:['MRXPANEL ',jsx('b',{children:'OFFICE'})]})]}),
   jsx('div',{className:'m3dchip',children:'V1.0 • TRUE 3D FOUNDATION'})
  ]}),
  jsxs('div',{className:'m3dbody',children:[
   jsx('main',{className:'m3dstage',children:jsxs('div',{className:'m3dwrap',children:[
    jsx('canvas',{ref:canvasRef,className:'m3dcanvas'}),
    jsxs('div',{className:'m3dover',children:[jsx('strong',{children:'TRUE 3D CHARACTER LAB'}),jsx('small',{children:'Procedural humanoid • articulated skeleton • 3D furniture • perspective camera'})]}),
    jsxs('div',{className:'m3dlegend',children:[jsx('div',{className:'m3dpill',children:'Drag = orbit camera'}),jsx('div',{className:'m3dpill',children:'Wheel = zoom'}),jsx('div',{className:'m3dpill',children:`Animation: ${phase.toUpperCase()}`})]})
   ]})}),
   jsxs('aside',{className:'m3dside',children:[
    jsxs('div',{className:'m3dsideh',children:[jsx('strong',{children:'3D Foundation Control'}),jsx('small',{children:'Bukan sprite / gambar bergerak — karakter dibentuk dari geometri 3D dan joint animation.'})]}),
    jsxs('section',{className:'m3dcard',children:[
      jsx('h3',{children:'Proof Character'}),
      jsxs('div',{className:'m3dstat',children:[
       jsx('span',{children:'Model'}),jsx('span',{children:'Procedural humanoid 3D'}),
       jsx('span',{children:'Skeleton'}),jsx('span',{children:'Head / torso / arms / legs'}),
       jsx('span',{children:'Current pose'}),jsx('span',{children:phase}),
       jsx('span',{children:'Renderer'}),jsx('span',{children:'MRXPANEL lightweight 3D'}),
       jsx('span',{children:'MASB bridge'}),jsx('span',{children:'OFF — visual proof first'})
      ]})
    ]}),
    jsxs('section',{className:'m3dcard',children:[
      jsx('h3',{children:'Animation Test'}),
      jsx('div',{className:'m3dsub',children:'AUTO: jalan ke meja → duduk → berdiri → berjalan kembali. Tombol lain mengunci pose untuk diperiksa.'}),
      jsxs('div',{className:'m3dgrid',children:[
       jsx('button',{className:`m3dbtn ${mode==='auto'?'active':''}`,onClick:()=>choose('auto'),children:'AUTO'}),
       jsx('button',{className:`m3dbtn ${mode==='walk'?'active':''}`,onClick:()=>choose('walk'),children:'WALK'}),
       jsx('button',{className:`m3dbtn ${mode==='sit'?'active':''}`,onClick:()=>choose('sit'),children:'SIT'}),
       jsx('button',{className:`m3dbtn ${mode==='idle'?'active':''}`,onClick:()=>choose('idle'),children:'IDLE'})
      ]})
    ]}),
    jsxs('section',{className:'m3dcard',children:[
      jsx('h3',{children:'V1.0 Scope'}),
      jsx('div',{className:'m3dsub',children:'Ini sengaja satu ruang + satu manusia 3D dahulu. Kalau gerak dan rasa karakternya sudah tepat, engine yang sama dipakai untuk Kris, Maya, semua Team, pintu, seluruh kantor, dan akhirnya state MASB nyata.'})
    ]}),
    jsx('div',{className:'m3dnote',style:{padding:'0 12px 14px'},children:'Karakter ini model generik MRXPANEL Staff. Belum merupakan wajah/fisik Kris atau karakter final Maya.'})
   ]})
  ]})
 ]})
}

export default{
 id:'mrxpanel-office',name:'MRXPANEL OFFICE',defaultEnabled:true,
 register(ctx){
  ctx.register({id:'route',area:ROUTES_AREA,title:'MRXPANEL OFFICE',data:{path:'/mrxpanel-office'},render:()=>jsx(True3D,{})})
  ctx.register({id:'sidebar',area:SIDEBAR_NAV_AREA,title:'MRXPANEL OFFICE',data:{path:'/mrxpanel-office',label:'MRXPANEL OFFICE',codicon:'organization'}})
 }
}
