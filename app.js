(function(){'use strict';

/* =====================================================================
   AGARRAO · app personal de ahorro · todo local, cifrado
   ===================================================================== */
const APP_VER='1.1.0';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

/* ================= fechas reales ================= */
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESL=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const p2=n=>String(n).padStart(2,'0');
const nowD=()=>window.__NOW?new Date(window.__NOW):new Date();
const isoD=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
let T={};
function refreshT(){const d=nowD();T={y:d.getFullYear(),m:d.getMonth(),d:d.getDate(),dim:new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),iso:isoD(d),ym:isoD(d).slice(0,7),wd:d.getDay()}}
refreshT();
const ymIdx=ym=>{const [y,m]=ym.split('-').map(Number);return y*12+m-1};
const idxYm=i=>Math.floor(i/12)+'-'+p2(i%12+1);
const ymAdd=(ym,n)=>idxYm(ymIdx(ym)+n);
const ymName=ym=>MESL[+ym.slice(5,7)-1];
const ymNameCap=ym=>{const n=ymName(ym);return n.charAt(0).toUpperCase()+n.slice(1)};
const dim=ym=>{const [y,m]=ym.split('-').map(Number);return new Date(y,m,0).getDate()};
function stepOf(iso){if(!iso)return null;return ymIdx(iso.slice(0,7))-ymIdx(T.ym)+1}
function lab(k){if(k===0)return 'hoy';const i=ymIdx(T.ym)+k-1;return MES[i%12]+' '+String(Math.floor(i/12)).slice(2)}
function daysTo(iso){const a=new Date(T.iso+'T00:00:00'),b=new Date(iso+'T00:00:00');return Math.round((b-a)/864e5)}
function dmy(iso){if(!iso)return '—';const [y,m,d]=iso.split('-');return `${d}/${m}/${y}`}
const dm=iso=>{if(!iso)return '—';const [y,m,d]=iso.split('-');return `${d}/${m}/${y.slice(2)}`};
function dayLabel(iso){const d=daysTo(iso);if(d===0)return 'hoy';if(d===-1)return 'ayer';const [y,m,dd]=iso.split('-');return `${+dd} ${MES[+m-1]}${+y!==T.y?' '+y.slice(2):''}`}
function mondayOf(iso){const d=new Date(iso+'T00:00:00');const k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return isoD(d)}

/* ================= formato ================= */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grp=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function fmt(v,dec=2){if(v==null||isNaN(v))return '—';const s=v<0?'−':'';v=Math.abs(v);const f=v.toFixed(dec).split('.');return s+grp(f[0])+(dec?','+f[1]:'')}
const eur=(v,d=2)=>fmt(v,d)+' €';
const eur0=v=>fmt(Math.round(v||0),0)+' €';
const M=s=>`<span class="mny"><span class="v">${s}</span></span>`;
function bigNum(v){v=v||0;const s=v<0?'−':'';v=Math.abs(v);const f=v.toFixed(2).split('.');return `${s}${grp(f[0])}<span class="dec">,${f[1]} €</span>`}
const ico=id=>`<svg class="i"><use href="#i-${id}"/></svg>`;
const LG='<svg class="lg0"><use href="#logo"/></svg>';
const CHEV='<svg class="i chev"><use href="#i-chev"/></svg>';
const pick=a=>Array.isArray(a)?a[Math.floor(Math.random()*a.length)]:a;
const sum=(a,f)=>a.reduce((s,x)=>s+(f?f(x):x),0)||0;
const num=s=>{if(s==null)return null;const t=String(s).trim().replace(/\./g,'').replace(',','.');if(t==='')return null;const v=parseFloat(t);return isNaN(v)?null:v};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* ================= modelo de datos ================= */
const COLORS=['#FF8A3D','#F2E3CC','#A99DFF','#6FD3A8','#6DB8FF','#FFD45E','#E88DC9','#FF6B7D'];
const ICONS=[['cart','Carrito'],['cup','Taza'],['bag','Bolsa'],['ticket','Entrada'],['car','Coche'],['shirt','Camiseta'],['star','Estrella'],['dots','Puntos'],['people','Personas'],['gift','Regalo']];
const CATDEF=[
  {id:'super',n:'Súper',ic:'cart',c:'--c-super',mix:.36},
  {id:'fuera',n:'Comer fuera',ic:'cup',c:'--c-fuera',mix:.2},
  {id:'delivery',n:'A domicilio',ic:'bag',c:'--c-delivery',mix:.08},
  {id:'ocio',n:'Ocio',ic:'ticket',c:'--c-ocio',mix:.11},
  {id:'transp',n:'Transporte',ic:'car',c:'--c-transp',mix:.05},
  {id:'ropa',n:'Ropa',ic:'shirt',c:'--c-ropa',mix:.07},
  {id:'capr',n:'Caprichos',ic:'star',c:'--c-capr',mix:.06},
  {id:'otros',n:'Otros',ic:'dots',c:'--c-otros',mix:.04},
  {id:'comun',n:'Común asumido',ic:'people',c:'--c-comun',mix:.03}
];
const CATC=['--c-super','--c-fuera','--c-delivery','--c-ocio','--c-transp','--c-ropa','--c-capr','--c-otros'];
function blankData(){
  return {
    v:1,created:T.iso,
    profile:{name:''},
    settings:{discreetOnOpen:false,shake:false,net:true,autoLock:0},
    income:0,
    cats:CATDEF.map(c=>({id:c.id,n:c.n,ic:c.ic,c:c.c,lim:0})),
    movs:[],fixed:[],anuales:[],extras:[],accounts:[],invs:[],loans:[],pagos:[],
    piso:{entrada:null,gastos:null,fecha:''},
    hipo:{mode:'piso',precio:250000,fin:80,tipo:3,plazo:30,gastos:10,cuota:1000},
    hist:[],cuadres:[],
    dismissed:{},
    lastCloseYm:ymAdd(T.ym,-1),
    sync:{gh:null},
    lastFile:'',simOk:'',phrase:''
  };
}
/* migraciones: cada versión nueva del modelo añade aquí su paso */
function migrate(d){
  const b=blankData();
  for(const k in b)if(d[k]===undefined)d[k]=b[k];
  for(const k in b.settings)if(d.settings[k]===undefined)d.settings[k]=b.settings[k];
  if(!d.cats.some(c=>c.id==='otros'))d.cats.push({id:'otros',n:'Otros',ic:'dots',c:'--c-otros',lim:0});
  if(!d.cats.some(c=>c.id==='comun'))d.cats.push({id:'comun',n:'Común asumido',ic:'people',c:'--c-comun',lim:0});
  d.v=1;return d;
}

/* D = datos persistentes (cifrados) · U = estado de interfaz */
let D=null;
const U={tab:'hoy',editLim:false,horizon:'plan',sim:{varM:null,aport:null,ret:null},loanExtra:{},whatif:false,discreet:false,_anim:false,locked:true};

/* ================= cálculos ================= */
const accBy=id=>D.accounts.find(a=>a.id===id);
const catBy=id=>D.cats.find(c=>c.id===id)||D.cats.find(c=>c.id==='otros')||D.cats[0];
const counts=m=>!m.com||m.com==='yo';
const movsYm=ym=>D.movs.filter(m=>m.date.slice(0,7)===ym);
const curMovs=()=>movsYm(T.ym);
const spentByIn=(list,id)=>sum(list.filter(m=>counts(m)&&(m.com==='yo'?'comun':m.cat)===id),m=>m.a);
const spentBy=id=>spentByIn(curMovs(),id);
const spentIn=list=>sum(list.filter(counts),m=>m.a);
const spent=()=>spentIn(curMovs());
const budget=()=>sum(D.cats,c=>c.lim||0);
const comPend=()=>D.movs.filter(m=>m.com==='pend');
const fixedSum=()=>sum(D.fixed,f=>f.a||0);
const loanPay=()=>sum(D.loans.filter(l=>(l.pend||0)>0),l=>l.cuota||0);
const anualMes=()=>sum(D.anuales,a=>a.a||0)/12;
const aportSum=()=>U.sim.aport??sum(D.invs,i=>i.aport||0);
const cashNow=()=>sum(D.accounts,a=>a.bal||0);
const invNow=()=>sum(D.invs,i=>i.valor||0);
const debtNow=()=>sum(D.loans,l=>l.pend||0);
const pagadoNow=()=>sum(D.pagos.filter(p=>p.fecha&&p.fecha<=T.iso),p=>p.a||0);
const netNow=()=>cashNow()+invNow()-debtNow()+pagadoNow();
const pisoAccs=l=>l.some(a=>a.piso)?l.filter(a=>a.piso):l;
const pisoNow=()=>sum(pisoAccs(D.accounts),a=>a.bal||0)+pagadoNow();
const goalTotal=()=>(D.piso.entrada||0)+(D.piso.gastos||0);
function pace(){const b=budget(),ideal=b*T.d/T.dim,sp=spent(),r=ideal?sp/ideal:0;return {b,ideal,sp,r,st:!b?'justo':r<0.92?'bien':r<1.12?'justo':'pasado'}}
function taeNow(a){return a.promoFin&&daysTo(a.promoFin)>=0&&a.promoTae!=null?a.promoTae:a.tae}
function prevSame(){const ym=ymAdd(T.ym,-1);const lim=ymAdd(T.ym,-1)+'-'+p2(Math.min(T.d,dim(ym)));const l=movsYm(ym).filter(m=>m.date<=lim);return {has:D.movs.some(m=>m.date<T.ym+'-01'),v:spentIn(l)}}
const planMes=()=>(D.income||0)-fixedSum()-loanPay()-budget()-anualMes();
const goalStep=()=>{const p=D.piso.fecha;if(!p)return 24;const d=+p.split('-')[2];return Math.max(2,stepOf(p)-(d===1?1:0))};
function horizonStep(){const s=stepOf('2027-12-31');return s>=3?s:12}

/* ================= proyección ================= */
function retFor(i,sc){if(U.sim.ret!=null)return sc==='malo'?U.sim.ret-5:sc==='bueno'?U.sim.ret+4:U.sim.ret;const b=i.rBase??6;return sc==='malo'?(i.rMalo??b-5):sc==='bueno'?(i.rBueno??b+4):b}
function aportFor(i){const base=sum(D.invs,x=>x.aport||0);if(U.sim.aport==null)return i.aport||0;if(!base)return i===D.invs[0]?U.sim.aport:0;return U.sim.aport*(i.aport||0)/base}
function simulate(o){
  const steps=Math.max(1,o.steps),sc=o.sc||'base',varM=o.varM??U.sim.varM??budget();
  const acc=D.accounts.map(a=>({...a,bal:a.bal||0})),inv=D.invs.map(i=>({...i,valor:i.valor||0})),loans=D.loans.map(l=>({...l,pend:l.pend||0}));
  const dest=()=>acc.find(a=>a.destino)||acc[0]||null;
  let floating=0;
  const tax=D.settings.net?0.81:1;let pagado=pagadoNow();const ends={},intPaid={};
  const snap=()=>{const cash=sum(acc,a=>a.bal)+floating,iv=sum(inv,i=>i.valor),lp=sum(loans,l=>l.pend),pc=sum(pisoAccs(acc),a=>a.bal)+((dest()&&pisoAccs(acc).includes(dest()))||!acc.length?floating:0);return {cash,inv:iv,debt:lp,nw:cash+iv-lp+pagado,piso:pc+pagado}};
  const pts=[snap()];
  const baseIdx=ymIdx(T.ym);
  /* lo que queda del mes en curso: proporcional a los días que faltan */
  const restFrac=(T.dim-T.d+1)/T.dim;
  for(let k=1;k<=steps;k++){
    const mi=(baseIdx+k-1)%12,ymk=idxYm(baseIdx+k-1);const f=k===1?restFrac:1;
    acc.forEach(a=>{const ps=a.promoFin?stepOf(a.promoFin):null;const r=(ps!=null&&k<=ps&&a.promoTae!=null)?a.promoTae:(ps!=null&&a.promoDesp!=null?a.promoDesp:a.tae);const base=a.max?Math.min(a.bal,a.max):a.bal;a.bal+=Math.max(0,base)*(r||0)/100/12*tax*f});
    let pay=0;loans.forEach(l=>{if(l.pend>0){const done=k===1&&l.lastYm===T.ym;if(done)return;const it=l.pend*(l.tin||0)/100/12;intPaid[l.id]=(intPaid[l.id]||0)+it;const p=Math.min(l.cuota||0,l.pend+it);l.pend=l.pend+it-p;pay+=p;if(l.pend<0.01){l.pend=0;ends[l.id]=k}}});
    let ap=0;inv.forEach(i=>{const r=Math.pow(1+retFor(i,sc)/100,1/12)-1;const a=aportFor(i)*(k===1&&(i.dia||1)<T.d?0:1);i.valor=i.valor*(1+r*f)+a;ap+=a});
    let flow=((D.income||0)-fixedSum())*f-pay-ap;
    flow-=k===1?Math.max(0,varM-spent()):varM;
    D.anuales.forEach(x=>{if(+x.mes===mi)flow-=x.a||0});
    D.extras.forEach(x=>{if(x.fecha&&x.fecha.slice(0,7)===ymk&&(k>1||x.fecha>=T.iso))flow+=x.a||0});
    D.pagos.forEach(p=>{if(p.fecha&&p.fecha.slice(0,7)===ymk&&p.fecha>T.iso){flow-=p.a||0;pagado+=p.a||0}});
    if(k===1)flow+=sum(comPend(),m=>m.a);
    const d=dest();if(d)d.bal+=flow;else floating+=flow;
    pts.push(snap());
  }
  return {pts,ends,intPaid,varM};
}
function amort(l,extra=0){let p=Math.max(0,(l.pend||0)-extra),k=0,tot=0;const rows=[];if(!l.cuota)return {rows,tot,n:0};const start=l.lastYm===T.ym?1:0;while(p>0.01&&k<480){k++;const it=p*(l.tin||0)/1200;const c=Math.min(l.cuota,p+it);p=p+it-c;tot+=it;rows.push({k:k+start,c,it,cap:c-it,p:Math.max(0,p)});if(c<=it){break}}return {rows,tot,n:k+start}}

/* ================= histórico y cierre de mes ================= */
function closeMonth(ym){
  const l=movsYm(ym),mi=+ym.slice(5,7)-1;
  const cats={};D.cats.forEach(c=>{const v=spentByIn(l,c.id);if(v)cats[c.id]=+v.toFixed(2)});
  const ex=sum(D.extras.filter(e=>e.fecha&&e.fecha.slice(0,7)===ym),e=>e.a);
  const anu=D.anuales.filter(a=>+a.mes===mi);
  return {ym,ing:(D.income||0)+ex,fijos:fixedSum()+loanPay(),dia:+spentIn(l).toFixed(2),pres:budget(),anu:sum(anu,a=>a.a),nota:anu.map(a=>a.n).join(', '),inv:sum(D.invs,i=>i.aport||0),cats,...nwParts(),auto:true};
}
/* foto del patrimonio: total y desglose */
function nwParts(){return {nw:+netNow().toFixed(2),nwC:+cashNow().toFixed(2),nwI:+invNow().toFixed(2),nwD:+debtNow().toFixed(2),nwP:+pagadoNow().toFixed(2),piso:+pisoNow().toFixed(2)}}
/* serie de patrimonio: cierres de mes con dato + hoy */
function nwSeries(){return D.hist.filter(h=>h.nw!=null).map(h=>({ym:h.ym,nw:h.nw,c:h.nwC,i:h.nwI,d:h.nwD,src:h.manual?'mano':h.nwQ?'cuadre':'app'}))}
function runCloses(){
  let changed=false;
  if(!D.lastCloseYm)D.lastCloseYm=ymAdd(T.ym,-1);
  let guard=0;
  while(ymIdx(D.lastCloseYm)<ymIdx(T.ym)-1&&guard++<36){
    const next=ymAdd(D.lastCloseYm,1);
    if(!D.hist.some(h=>h.ym===next)&&ymIdx(next)>=ymIdx(D.created.slice(0,7))){const r=closeMonth(next);if(next!==ymAdd(T.ym,-1))Object.assign(r,{nw:null,nwC:null,nwI:null,nwD:null,nwP:null});D.hist.push(r);changed=true}
    D.lastCloseYm=next;changed=true;
  }
  D.hist.sort((a,b)=>a.ym<b.ym?-1:1);
  return changed;
}
function cuadreIn(ym){return D.cuadres.filter(c=>c.date.slice(0,7)===ym).sort((a,b)=>a.date<b.date?-1:1)[0]||null}
function bancosFor(ym){const a=cuadreIn(ym),b=cuadreIn(ymAdd(ym,1));if(!a||!b)return null;return (b.cash-a.cash)+(b.invAport-a.invAport)+(a.loans-b.loans)}
function mesRec(r,i){const gast=(r.fijos||0)+(r.dia||0)+(r.anu||0),ah=(r.ing||0)-gast,bancos=r.manual?null:bancosFor(r.ym);return {...r,i,gast,ah,tasa:r.ing?ah/r.ing:0,bancos,fuga:bancos==null?null:ah-bancos,hucha:ah-(r.inv||0)}}
function histRecs(){return D.hist.map(mesRec)}
function histStats(){const H=histRecs();if(!H.length)return {H,tot:0,media:0,tasa:0,best:null,worst:null,fuga:null};const tot=sum(H,h=>h.ah),ing=sum(H,h=>h.ing);const best=H.reduce((a,b)=>b.ah>a.ah?b:a),worst=H.reduce((a,b)=>b.ah<a.ah?b:a);const F=H.filter(h=>h.fuga!=null);return {H,tot,media:tot/H.length,tasa:ing?tot/ing:0,best,worst,fuga:F.length?sum(F,h=>Math.max(0,h.fuga))/F.length:null}}


/* =====================================================================
   BÓVEDA: IndexedDB + AES-GCM 256. La clave de datos (DEK) se guarda
   envuelta con: PIN (PBKDF2), frase (PBKDF2) y, si se activa, Face ID
   (passkey con extensión PRF). Nada sale del móvil sin cifrar.
   ===================================================================== */
const te=new TextEncoder(),td=new TextDecoder();
const ITER=600000;
function b64e(buf){const u=buf instanceof Uint8Array?buf:new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
function b64d(s){const b=atob(s.replace(/\s/g,'')),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
async function kdf(secret,salt,iter){const base=await crypto.subtle.importKey('raw',te.encode(secret),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:iter,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['wrapKey','unwrapKey'])}
async function kekFromBytes(bytes){const base=await crypto.subtle.importKey('raw',bytes,'HKDF',false,['deriveKey']);return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:new Uint8Array(32),info:te.encode('agarrao-prf-v1')},base,{name:'AES-GCM',length:256},false,['wrapKey','unwrapKey'])}
async function wrapWith(dek,kek){const iv=rnd(12);const ct=await crypto.subtle.wrapKey('raw',dek,kek,{name:'AES-GCM',iv});return {iv:b64e(iv),ct:b64e(ct)}}
async function unwrapWith(w,kek){return crypto.subtle.unwrapKey('raw',b64d(w.ct),kek,{name:'AES-GCM',iv:b64d(w.iv)},{name:'AES-GCM'},true,['encrypt','decrypt'])}
async function wrapSecret(dek,secret){const salt=rnd(16);const kek=await kdf(secret,salt,ITER);return {salt:b64e(salt),iter:ITER,...await wrapWith(dek,kek)}}
async function unwrapSecret(w,secret){const kek=await kdf(secret,b64d(w.salt),w.iter||ITER);return unwrapWith(w,kek)}
async function encJSON(obj,key){const iv=rnd(12);const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(JSON.stringify(obj)));return {iv:b64e(iv),ct:b64e(ct)}}
async function decJSON(e,key){const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(e.iv)},key,b64d(e.ct));return JSON.parse(td.decode(pt))}
async function sha(s){return b64e(await crypto.subtle.digest('SHA-256',te.encode(s)))}

/* ---------- IndexedDB ---------- */
let _db=null;
function idb(){if(_db)return Promise.resolve(_db);return new Promise((res,rej)=>{const r=indexedDB.open('agarrao',1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('kv'))db.createObjectStore('kv');if(!db.objectStoreNames.contains('snaps'))db.createObjectStore('snaps')};r.onsuccess=()=>{_db=r.result;res(_db)};r.onerror=()=>rej(r.error)})}
async function st(store,mode,fn){const db=await idb();return new Promise((res,rej)=>{const tx=db.transaction(store,mode);const s=tx.objectStore(store);let out;const r=fn(s);if(r)r.onsuccess=()=>{out=r.result};tx.oncomplete=()=>res(out);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)})}
const kvGet=k=>st('kv','readonly',s=>s.get(k));
const kvSet=(k,v)=>st('kv','readwrite',s=>s.put(v,k));
const kvDel=k=>st('kv','readwrite',s=>s.delete(k));
const snGet=k=>st('snaps','readonly',s=>s.get(k));
const snSet=(k,v)=>st('snaps','readwrite',s=>s.put(v,k));
const snDel=k=>st('snaps','readwrite',s=>s.delete(k));
const snKeys=()=>st('snaps','readonly',s=>s.getAllKeys());

/* ---------- frase de recuperación ---------- */
const WORDS='abanico abrigo aceite ajo alba aldea almendra alpaca altar ancla anillo anis arbol arco arena arroz asador azafran azucar azulejo bacalao balcon banco bandera barco barquillo barrio baston baul bigote bocata bodega bota botijo brasero brisa broche bufanda burro caballo cabra cacao cafe calamar calle camino campana canela cantina capote caracol carbon cartel casa cazuela cebolla cereza cerveza cesta chaleco charco chorizo chotis chulapo churro ciervo cine ciruela clavel coche cocido cofre cohete colmena cometa conejo copa corcho corral cuerda cuchara cueva delfin diente domingo duende dulce elefante encina ermita estrella farol feria flecha flor fogon fresa fruta fuente gallina gamba garbanzo gato gaviota gazpacho gigante girasol globo gorra granada grillo guante guitarra higo hoja hormiga horno huerta huevo isla jamon jarra jazmin jilguero jirafa lagarto lampara lana lapiz laurel lechuga leon libro limonada lince linterna lobo loro luna maleta manton manzana mapa marea martillo mazapan medalla melon membrillo mercado miel molino moneda montera morcilla mosca mostaza naranja nata navaja nido nieve noria nube nuez ocaso oliva olla organillo oro oso oveja paella pajaro paloma pandero papel paraguas parpusa pasodoble pastel patata pato pavo peine pepino pera perla perro piano pichi pimiento pino pinza pipa plato playa pluma polvoron portal posada puchero puente puerta pulpo queso quiosco rabano rama rana raton reloj retiro roble romero rosa rosquilla ruleta sal salmon sandia sardina seta silla sombrero sopa taberna tambor taza teja telar tienda tijera tinaja tomate torrija tortilla trapo trebol trigo trompeta tulipan turron uva vaca vecino vela ventana verbena vino violin yema yunque zapato zorro zumo'.split(' ');
function newPhrase(){const r=rnd(12);return [...r].map(b=>WORDS[b]).join(' ')}
const normPhrase=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
function phraseOk(s){const w=normPhrase(s).split(' ');return w.length===12&&w.every(x=>WORDS.includes(x))}

/* ---------- estado de la bóveda en memoria ---------- */
let DEK=null,VAULT=null;
async function vaultCreate(pin,phrase){
  DEK=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);
  VAULT={v:1,wraps:{pin:await wrapSecret(DEK,pin),phrase:await wrapSecret(DEK,normPhrase(phrase))},data:null,updated:Date.now()};
}
async function vaultLoad(){VAULT=await kvGet('vault');return VAULT}
async function vaultSave(){if(!DEK||!D||!VAULT)return;VAULT.data=await encJSON(D,DEK);VAULT.updated=Date.now();await kvSet('vault',VAULT)}
async function unlockPin(pin){const k=await unwrapSecret(VAULT.wraps.pin,pin);D=migrate(await decJSON(VAULT.data,k));DEK=k}
async function unlockPhrase(phrase){const k=await unwrapSecret(VAULT.wraps.phrase,normPhrase(phrase));D=migrate(await decJSON(VAULT.data,k));DEK=k}
async function setPin(pin){VAULT.wraps.pin=await wrapSecret(DEK,pin);await kvSet('vault',VAULT)}

/* ---------- Face ID (passkey + PRF) ---------- */
const prfSupported=()=>!!(window.PublicKeyCredential&&navigator.credentials&&navigator.credentials.create);
async function faceEnable(){
  const salt=rnd(32);
  const cred=await navigator.credentials.create({publicKey:{challenge:rnd(32),rp:{name:'Agarrao'},user:{id:rnd(16),name:'agarrao',displayName:'Agarrao'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'preferred',userVerification:'required'},timeout:60000,extensions:{prf:{eval:{first:salt}}}}});
  const ext=cred.getClientExtensionResults()||{};
  if(!ext.prf||ext.prf.enabled===false)throw new Error('prf-no');
  let out=ext.prf.results&&ext.prf.results.first;
  if(!out){out=await faceGet(cred.rawId,salt)}
  const kek=await kekFromBytes(new Uint8Array(out));
  VAULT.wraps.prf={cred:b64e(cred.rawId),salt:b64e(salt),...await wrapWith(DEK,kek)};
  await kvSet('vault',VAULT);
}
async function faceGet(rawId,salt){
  const a=await navigator.credentials.get({publicKey:{challenge:rnd(32),allowCredentials:[{type:'public-key',id:rawId}],userVerification:'required',timeout:60000,extensions:{prf:{eval:{first:salt}}}}});
  const ext=a.getClientExtensionResults()||{};
  if(!ext.prf||!ext.prf.results||!ext.prf.results.first)throw new Error('prf-no');
  return ext.prf.results.first;
}
async function unlockFace(){const w=VAULT.wraps.prf;const out=await faceGet(b64d(w.cred),b64d(w.salt));const k=await unwrapWith(w,await kekFromBytes(new Uint8Array(out)));D=migrate(await decJSON(VAULT.data,k));DEK=k}
async function faceDisable(){delete VAULT.wraps.prf;await kvSet('vault',VAULT)}

/* ---------- guardado (con instantáneas) ---------- */
let saveT=null,saving=Promise.resolve();
function save(){if(!D||!VAULT||!DEK)return;clearTimeout(saveT);saveT=setTimeout(flush,250);dirtyCloud()}
function flush(){clearTimeout(saveT);saving=saving.then(async()=>{if(!D||!VAULT||!DEK)return;try{await vaultSave();await snapAuto()}catch(e){console.error(e);toast('No se ha podido guardar. Prueba otra vez.')}});return saving}
async function snapAuto(){
  const keys=await snKeys();const dk='d-'+T.iso,wk='w-'+mondayOf(T.iso);
  if(!keys.includes(dk))await snSet(dk,{t:Date.now(),e:VAULT.data});
  if(!keys.includes(wk))await snSet(wk,{t:Date.now(),e:VAULT.data});
  const ds=keys.filter(k=>k.startsWith('d-')).sort().reverse(),ws=keys.filter(k=>k.startsWith('w-')).sort().reverse(),rs=keys.filter(k=>k.startsWith('r-')).sort().reverse();
  for(const k of ds.slice(7))await snDel(k);for(const k of ws.slice(4))await snDel(k);for(const k of rs.slice(3))await snDel(k);
}
async function snapBefore(why){await snSet('r-'+new Date().toISOString(),{t:Date.now(),e:await encJSON(D,DEK),why})}
async function snapList(){const keys=(await snKeys()).sort().reverse();const out=[];for(const k of keys){const v=await snGet(k);out.push({k,t:v.t,why:v.why})}return out}
async function snapRestore(k){const v=await snGet(k);const data=await decJSON(v.e,DEK);await snapBefore('Antes de restaurar');D=migrate(data);await flush()}

/* ---------- copia (formato común para nube y archivo) ---------- */
async function buildBackup(){return {app:'agarrao',fmt:1,created:new Date().toISOString(),ver:APP_VER,phrase:VAULT.wraps.phrase,data:await encJSON(D,DEK)}}
async function openBackup(bk,phrase){if(!bk||bk.app!=='agarrao')throw new Error('no-agarrao');const k=await unwrapSecret(bk.phrase,normPhrase(phrase));return {key:k,data:migrate(await decJSON(bk.data,k))}}

/* ---------- nube: repositorio privado de GitHub ---------- */
const GH_PATH='agarrao-copia.json';
let cloudT=null,cloudBusy=false,cloudDirty=false;
const ghOn=()=>!!(D&&D.sync&&D.sync.gh&&D.sync.gh.owner&&D.sync.gh.repo&&D.sync.gh.token);
async function gh(method,path,body,g){g=g||D.sync.gh;const r=await fetch(`https://api.github.com/repos/${encodeURIComponent(g.owner)}/${encodeURIComponent(g.repo)}${path}`,{method,cache:'no-store',headers:{Authorization:'Bearer '+g.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){}if(!r.ok){const err=new Error((j&&j.message)||('HTTP '+r.status));err.status=r.status;throw err}return j}
async function ghTest(g){const j=await gh('GET','',null,g);if(!j.private)throw new Error('El repositorio es público. Tiene que ser privado.');return j}
async function cloudMeta(){return (await kvGet('cloud'))||{}}
async function cloudSetMeta(m){await kvSet('cloud',{...(await cloudMeta()),...m})}
function dirtyCloud(){if(!ghOn())return;cloudDirty=true;clearTimeout(cloudT);cloudT=setTimeout(cloudPush,4000)}
async function cloudPush(force){
  if(!ghOn()||cloudBusy)return;if(!navigator.onLine&&!force){cloudSetMeta({pending:true});return}
  clearTimeout(cloudT);cloudBusy=true;cloudDirty=false;
  try{
    await saving;const bk=await buildBackup();const content=btoa(JSON.stringify(bk));
    let meta=await cloudMeta(),shaV=meta.sha;
    const put=s=>gh('PUT','/contents/'+GH_PATH,{message:'Copia '+new Date().toISOString(),content,...(s?{sha:s}:{})});
    let r;
    try{r=await put(shaV)}catch(e){if(e.status===409||e.status===422||e.status===404||(e.status===400)){let cur=null;try{cur=await gh('GET','/contents/'+GH_PATH)}catch(x){if(x.status!==404)throw x}r=await put(cur&&cur.sha)}else throw e}
    await cloudSetMeta({sha:r.content.sha,lastOk:Date.now(),err:'',pending:false});
  }catch(e){await cloudSetMeta({err:e.message||String(e),errAt:Date.now(),pending:true})}
  finally{cloudBusy=false;cloudTick();if(cloudDirty)dirtyCloud()}
}
async function cloudPull(ref){const j=await gh('GET','/contents/'+GH_PATH+(ref?'?ref='+encodeURIComponent(ref):''));let txt=atob(j.content.replace(/\n/g,''));return JSON.parse(txt)}
async function cloudVersions(){const j=await gh('GET','/commits?path='+encodeURIComponent(GH_PATH)+'&per_page=40');return j.map(c=>({sha:c.sha,date:c.commit.committer.date}))}
window.addEventListener('online',async()=>{if(D&&ghOn()&&(await cloudMeta()).pending)cloudPush()});

/* ---------- archivo (iCloud Drive / Archivos) ---------- */
async function shareFile(name,text,type){
  U.ext=Date.now();
  const blob=new Blob([text],{type});const file=new File([blob],name,{type});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return true}catch(e){if(e.name==='AbortError')return false}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);return true;
}
async function exportFile(){const bk=await buildBackup();const ok=await shareFile(`agarrao-copia-${T.iso}.json`,JSON.stringify(bk),'application/json');if(ok){D.lastFile=T.iso;save();toast('Copia cifrada lista. Guárdala en iCloud Drive.')}}
function ics(title,dateISO,desc){const d=dateISO.replace(/-/g,'');const n=new Date(dateISO+'T00:00:00');n.setDate(n.getDate()+1);const e=isoD(n).replace(/-/g,'');const stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Agarrao//ES','BEGIN:VEVENT','UID:'+uid()+'@agarrao','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+d,'DTEND;VALUE=DATE:'+e,'SUMMARY:'+title.replace(/[,;]/g,' '),'DESCRIPTION:'+(desc||'').replace(/[,;\n]/g,' '),'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:'+title.replace(/[,;]/g,' '),'END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n')}
async function addCal(title,date,desc){if(!date){toast('Falta la fecha.');return}await shareFile('agarrao-'+date+'.ics',ics(title,date,desc),'text/calendar');}

/* ---------- intentos de PIN ---------- */
async function failsGet(){return (await kvGet('fails'))||{n:0,until:0}}
async function failsAdd(){const f=await failsGet();f.n++;f.until=f.n>=10?Date.now()+5*60e3:f.n>=5?Date.now()+30e3:0;await kvSet('fails',f);return f}
async function failsReset(){await kvSet('fails',{n:0,until:0})}


/* ================= vacile (modo cuñado castizo) ================= */
const V={
  status:{
    bien:['Vas más agarrao que un chotis, chaval. Así se hace, que el piso no se paga con buenas intenciones.','Ni un euro mal gastado. Si sigues así te hago un monumento en la Plaza Mayor.'],
    justo:['Vas por la cuerda floja, majo. Un Glovo más y te veo a bocata de calamares hasta fin de mes.','Ni fu ni fa. Vas justito, como el metro en hora punta.'],
    pasado:['¿Tú te crees que esto es la Gran Vía en Navidad? Te estás puliendo el mes, figura.','A este ritmo la entrada del piso la pagas en cromos, chaval.']
  },
  add:{
    delivery:[n=>`${n} pedidos a domicilio este mes. El rider ya se sabe tu nombre, el de tu madre y tu talla de zapatos.`],
    fuera:[()=>'Otra caña con bravas. Con lo que dejas en bares, Mahou te debería mandar una cesta por Navidad.',()=>'Apuntado. El camarero ya te pone lo de siempre sin preguntar, ¿eh?'],
    capr:[()=>'Capricho apuntado. La vida son dos días y la hipoteca treinta años, campeón.'],
    super:[()=>'Súper apuntado. Mírale, comprando como un adulto. Hasta me emociono.'],
    transp:[()=>'Transporte apuntado. Que el metro no muerde, señorito.'],
    ocio:[()=>'Ocio apuntado. Disfrútalo, que con esa pasta tenías media butaca en el Real.'],
    ropa:[()=>'Ropa nueva. Vas a ser el más elegante de Malasaña. Y el más pelao también.'],
    otros:[()=>'Apuntado. Hacienda no lo sabrá, pero yo sí, y no se me olvida.']
  },
  comPend:'Común apuntado. Que no se te olvide cogértelo de la común, que tonto no eres… ¿o sí?',
  comYo:'Lo asumes tú. Qué espléndido. Un señor. Un señor con menos pelas.',
  over:c=>`¿Límite de ${c}? Eso era para cumplirlo, no para mirarlo. Te lo has pulido, figura.`,
  falta:f=>`Te faltan ${f}, chaval. O cortas el Glovo o el Glovo te corta el piso.`,
  llega:f=>`Llegas y te sobran ${f}. Míralo, el rey del Rastro. El del banco te va a invitar a un café. Pequeño.`,
  cuadre:'Cuadrado. Ni el Banco de España lleva las cuentas tan finas, chulapo.',
  loan:'Cada euro que amortizas es un euro que el banco no se toma en cañas a tu salud.',
  cogido:'Cobrado. Las cuentas claras y el chocolate espeso, como en San Ginés.'
};
const vadd=(cat,n)=>{const a=V.add[cat]||V.add.otros;return pick(a)(n)};

/* ================= utilidades de interfaz ================= */
function greet(){const h=nowD().getHours();return h>=6&&h<14?'Buenos días':h>=14&&h<21?'Buenas tardes':'Buenas noches'}
const nombre=()=>D.profile.name?', '+esc(D.profile.name):'';
function sheet(title,html){$('#sh-sub').innerHTML=`<div class="grab"></div><div class="sh-h"><h3>${title}</h3><button class="x" data-close aria-label="Cerrar">${ico('x')}</button></div>${html}`;open('#sh-sub')}
function navRow(arg,t,s,v){return `<button class="row" data-act="sh" data-arg="${arg}"><div class="rm"><div class="rt">${t}</div>${s?`<div class="rs">${s}</div>`:''}</div>${v!=null?`<div class="ra">${v}</div>`:''}${CHEV}</button>`}
function addRow(kind,label){return `<button class="add-row" data-new="${kind}">${ico('plus')}${label}</button>`}
function discBtn(){return U.discreet?`<button class="disc-tg on" data-act="disc"><span class="dt">Modo discreto ${ico('eyeoff')}</span><span class="ver">Ver importe</span></button>`:`<button class="disc-tg" data-act="disc" aria-label="Activar modo discreto">${ico('eye')}</button>`}

/* ================= avisos ================= */
async function cloudState(){const m=await cloudMeta();return m}
let CLOUD={};
function avisos(){
  const A=[];
  D.loans.forEach(l=>{if((l.pend||0)>0&&l.cuota&&T.d>=(l.dia||1)&&l.lastYm!==T.ym){const np=Math.max(0,l.pend+l.pend*(l.tin||0)/1200-l.cuota);A.push({t:`Cuota de ${esc(l.nombre)}`,s:'¿El pendiente queda en '+M(eur(np))+'?',act:['Actualizar','loan-ok',l.id]})}});
  const lastH=D.hist[D.hist.length-1];if(lastH&&!D.dismissed['parte-'+lastH.ym])A.push({t:`Parte de ${ymName(lastH.ym)} listo`,s:'El resumen del mes, por el Chulapo',act:['Leer','chat','parte'],dis:'parte-'+lastH.ym});
  const h=hormigas()[0];if(h&&!D.dismissed['horm-'+T.ym+'-'+h.k])A.push({t:`Gasto hormiga: ${esc(h.t.toLowerCase())}`,s:`${h.n} veces este mes · al año ≈ ${M(eur0(h.anual))}`,act:['Ver','chat','Gastos hormiga'],dis:'horm-'+T.ym+'-'+h.k});
  const cp=comPend();if(cp.length)A.push({t:M(eur(sum(cp,m=>m.a)))+' comunes por coger',s:cp.length+(cp.length>1?' gastos adelantados':' gasto adelantado')+' con tu tarjeta',act:['Cogido','com-ok','']});
  if(D.accounts.length&&!cuadreIn(T.ym))A.push({t:`Cuadre de ${ymName(T.ym)}`,s:'Pon los saldos que dicen tus bancos',act:['Cuadrar','cuadre','']});
  D.accounts.forEach(a=>{if(a.promoFin&&!D.dismissed['promo-'+a.id+a.promoFin]){const d=daysTo(a.promoFin);if(d>=0&&d<=45)A.push({t:`Promo: quedan ${d} días`,s:`${esc(a.alias)} · acaba el ${dmy(a.promoFin)}`,act:['Calendario','cal','promo:'+a.id],dis:'promo-'+a.id+a.promoFin})}
    if(a.venc&&!D.dismissed['venc-'+a.id+a.venc]){const d=daysTo(a.venc);if(d>=0&&d<=30)A.push({t:`Vence el depósito: ${d} días`,s:`${esc(a.alias)} · ${dmy(a.venc)}`,act:['Calendario','cal','venc:'+a.id],dis:'venc-'+a.id+a.venc})}});
  if(!ghOn()&&!D.dismissed.ghoff)A.push({t:'Copia en la nube sin configurar',s:'Sin ella, si pierdes el móvil pierdes los datos',act:['Configurar','cloud',''],dis:'ghoff'});
  if(ghOn()&&CLOUD.err)A.push({t:'La copia en la nube falla',s:esc(CLOUD.err).slice(0,80),act:['Ver','cloud','']});
  if(ghOn()&&!D.simOk)A.push({t:'Simulacro de copia pendiente',s:'Comprueba que la copia funciona de verdad',act:['Hacer','simul','']});
  if((!D.lastFile||daysTo(D.lastFile)<-35)&&!D.dismissed['file-'+T.ym])A.push({t:'Copia en iCloud Drive',s:D.lastFile?'La última es del '+dmy(D.lastFile):'Aún no has hecho ninguna',act:['Hacer','file',''],dis:'file-'+T.ym});
  return A;
}
function avRow(a,withX){return `<div class="row"><div class="rm"><div class="rt wrap">${a.t}</div><div class="rs">${a.s}</div></div><button class="lnk" data-act="${a.act[1]}" data-arg="${a.act[2]}">${a.act[0]}</button>${withX&&a.dis?`<button class="av-x" data-act="dis" data-arg="${a.dis}" aria-label="Ocultar">${ico('x')}</button>`:''}</div>`}
function openAvisos(){sheet('Pendiente',`<div class="grp">${avisos().map(a=>avRow(a,true)).join('')||'<div class="empty">Nada pendiente. Más tranquilo que un domingo en el Retiro.</div>'}</div>`)}

/* ================= HOY ================= */
function renderHoy(){
  const p=pace(),left=p.b-p.sp,days=T.dim-T.d+1;
  const chip={bien:['ok','Vas bien'],justo:['warn','Vas justo'],pasado:['over','Te estás pasando']}[p.st];
  const av=avisos(),g=goalTotal(),pn=pisoNow(),ps=prevSame(),mx=Math.max(p.sp,ps.v)||1;
  const cm=curMovs().slice().sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.ts||0)-(a.ts||0));
  const recent=D.movs.slice().sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.ts||0)-(a.ts||0)).slice(0,3);
  $('#v-hoy').innerHTML=`
  <div class="hello"><div class="lbl">${DIAS[T.wd].charAt(0).toUpperCase()+DIAS[T.wd].slice(1)}, ${T.d} de ${MESL[T.m]}</div><h2>${greet()}${nombre()}</h2></div>
  <div class="hero">
    <div class="hero-top"><div><div class="lbl">Te quedan este mes</div></div>${discBtn()}</div>
    <button class="big" id="hero-num" data-count="${left}" aria-label="Mostrar u ocultar importes">${M(bigNum(left))}</button>
    <div class="hero-sub">${p.b?`<span class="chip ${chip[0]}">${chip[1]}</span> ${M('<b>'+eur(Math.max(0,left)/days)+'</b>')} al día · ${days} días`:'<span class="chip mute">Sin presupuesto</span> Ponlo en Presupuesto → Editar límites'}</div>
    <button class="inner" data-act="sh" data-arg="movs"><div class="inner-h"><span>Tus gastos este mes</span>${CHEV}</div>
      <div class="cmp"><span class="trk2"><i style="width:${p.sp/mx*100}%"></i></span><b>${M(eur(p.sp))}</b></div>
      <div class="cmp prev"><span class="trk2"><i style="width:${ps.v/mx*100}%"></i></span><b>${ps.has?M(eur(ps.v)):'—'}</b></div>
      <span class="lbl">${ps.has?`Mes anterior, a día ${T.d}`:'Mes anterior: aún sin datos'}</span></button>
    <div class="hero-btns"><button class="pill-pri" data-act="add">Apuntar</button><button class="pill-sec" data-act="sh" data-arg="movs">Movimientos</button></div>
  </div>
  <button class="chulapo" data-act="chat"><svg class="lg0"><use href="#logo"/></svg><div class="q"><small>El Chulapo</small>${p.b?pick(V.status[p.st]):'Ponme un presupuesto, chaval, que sin él no te puedo vacilar a gusto.'}</div>${CHEV}</button>
  ${av.length?`<div class="sec"><h3>Pendiente</h3>${av.length>2?`<button class="link" data-act="avisos">Ver todo (${av.length})</button>`:''}</div>
  <div class="grp">${av.slice(0,2).map(a=>avRow(a,false)).join('')}</div>`:''}
  ${g?`<div class="sec"><h3>Hucha del piso</h3></div>
  <button class="grp piso-mini" data-act="go-piso"><div class="top"><span class="mid">${M(eur0(pn))}</span><span class="lbl">de ${M(eur0(g))} · ${Math.round(pn/g*100)} %</span></div><div class="bar thin"><i style="width:${Math.min(100,pn/g*100)}%;background:var(--red2)"></i></div></button>`:''}
  <div class="sec"><h3>Últimos gastos</h3>${D.movs.length?'<button class="link" data-act="sh" data-arg="movs">Ver todo</button>':''}</div>
  <div class="grp">${recent.map(movRow).join('')||'<div class="empty">Aún no has apuntado nada. Dale al + rojo o escríbele al Chulapo «12,50 cañas».</div>'}</div>
  <div class="cloud">${ico('cloud')}<span id="cloud-t"></span></div>`;
  void cm;cloudTick();
}
function movRow(m){
  const c=catBy(m.com==='yo'?'comun':m.cat);
  const tag=m.com==='pend'?'<span class="tg warn">Común · por coger</span>':m.com==='ok'?'<span class="tg">Común · cogido</span>':m.com==='yo'?'<span class="tg">Común · lo asumes tú</span>':'';
  return `<button class="row mv" data-mov="${m.id}"><span class="sq" style="--c:var(${c.c})">${ico(c.ic)}</span><div class="rm"><div class="rt">${esc(m.t)}</div><div class="rs">${esc(catBy(m.cat).n)} · ${dayLabel(m.date)}</div>${tag}</div><div class="ra ${m.com&&m.com!=='yo'?'':'neg'}" style="${m.com&&m.com!=='yo'?'color:var(--mut)':''}">${M('−'+eur(m.a))}</div></button>`;
}

/* ================= PRESUPUESTO ================= */
function renderPres(){
  const b=budget(),sp=spent(),cp=comPend(),st=histStats();
  const ahorro=planMes()-aportSum();
  $('#v-pres').innerHTML=`
  <div class="hello"><div class="lbl">Día ${T.d} de ${T.dim}</div><h2>${ymNameCap(T.ym)}</h2></div>
  <div class="grp" style="padding-block:16px;display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><span class="mid">${M(eur(sp))}</span><span class="lbl">gastado de ${M(eur0(b))}</span></div>
    <div class="bar"><i style="width:${b?Math.min(100,sp/b*100):0}%;background:var(--red2)"></i><span class="mk" style="left:${T.d/T.dim*100}%"></span></div>
  </div>
  <div class="sec"><h3>Categorías</h3><button class="link" id="btn-edit">${U.editLim?'Listo':'Editar límites'}</button></div>
  <div class="grp">
    ${D.cats.map(c=>{const s=spentBy(c.id),over=c.lim>0&&s>c.lim,pct=c.lim?Math.min(100,s/c.lim*100):(s?100:0);
      return U.editLim?`<div class="row"><span class="cdot" style="--c:var(${c.c})"></span><div class="rm"><div class="rt">${esc(c.n)}</div></div><input class="lim-in" id="lim-${c.id}" data-lim="${c.id}" inputmode="numeric" value="${c.lim||''}" placeholder="0" aria-label="Límite de ${esc(c.n)}"></div>`
      :`<button class="row" data-cat="${c.id}"><span class="cdot" style="--c:var(${c.c})"></span><div class="rm"><div class="rt">${esc(c.n)}</div><div class="bar thin" style="margin-top:7px"><i style="width:${pct}%;background:${over?'var(--over)':'var(--ink2)'};opacity:${over?1:.55}"></i></div></div><div class="ra">${M(fmt(s,0))}<small style="${over?'color:var(--over)':''}">de ${M(fmt(c.lim||0,0))} €</small></div></button>`}).join('')}
    ${U.editLim?'':addRow('cat','Añadir categoría')}
  </div>
  <div class="sec"><h3>El mes</h3></div>
  <div class="grp">
    ${navRow('ingresos','Ingresos','Nómina'+(D.extras.length?` y ${D.extras.length} extra`:''),M('+'+eur0(D.income||0)))}
    ${navRow('fijos','Gastos fijos',`${D.fixed.length+D.loans.filter(l=>(l.pend||0)>0).length} pagos al mes`,M('−'+eur0(fixedSum()+loanPay())))}
    ${navRow('anuales','Gastos anuales','Repartidos por meses',M('−'+eur0(anualMes())))}
    ${navRow('invs','Aportación a inversiones','',M('−'+eur0(aportSum())))}
    <div class="row"><div class="rm"><div class="rt" style="font-weight:650">Ahorro para el piso</div><div class="rs">Plan del mes, si cumples el presupuesto</div></div><div class="ra" style="color:var(--red2);font-size:17px">${M(eur0(ahorro))}</div></div>
  </div>
  <div class="grp" style="margin-top:12px">
    ${navRow('hist','Histórico',st.H.length?'Lo que has ahorrado mes a mes':'El primer cierre, el día 1',st.H.length?M((st.tot>=0?'+':'')+eur0(st.tot)):null)}
    ${navRow('comunes','Gastos comunes por coger',cp.length?cp.length+' pendientes':'Nada pendiente',M(eur(sum(cp,m=>m.a))))}
    ${navRow('movs','Movimientos',`${curMovs().length} este mes`,null)}
  </div>`;
}

/* ================= DINERO ================= */
function ringSvg(p,col){const r=26,c=2*Math.PI*r;return `<svg viewBox="0 0 62 62"><circle class="trk" cx="31" cy="31" r="${r}" stroke-width="6"/><circle class="arc" cx="31" cy="31" r="${r}" stroke-width="6" style="stroke:${col}" stroke-dasharray="${c*Math.max(0,Math.min(1,p))} ${c}"/></svg>`}
function sparkSvg(arr){if(!arr||arr.length<2)return '';const W=300,H=46,mn=Math.min(...arr)*.97,mx=Math.max(...arr)*1.01||1;const pts=arr.map((v,i)=>[i/(arr.length-1)*W,H-(v-mn)/((mx-mn)||1)*(H-4)-2]);const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path class="ar" d="${d} L${W} ${H} L0 ${H}Z"/><path class="ln" d="${d}" vector-effect="non-scaling-stroke"/></svg>`}
function simInvAt(ix,k){const i=D.invs[ix];let v=i.valor||0;const r=Math.pow(1+retFor(i,'base')/100,1/12)-1;for(let s=1;s<=k;s++)v=v*(1+r)+aportFor(i);return v}
function renderDinero(){
  const cash=cashNow(),iv=invNow(),db=debtNow(),nw=netNow(),tot=(cash+iv+db)||1;
  const promos=D.accounts.filter(a=>a.promoFin&&daysTo(a.promoFin)>=0);
  const lc=D.cuadres[D.cuadres.length-1];
  $('#v-dinero').innerHTML=`
  <div class="hello"><div class="lbl">Cuentas, inversiones y préstamos</div><h2>Mi dinero</h2></div>
  <div class="hero">
    <div class="hero-top"><span class="lbl">Patrimonio neto</span>${discBtn()}</div>
    <div class="big" data-count="${nw}">${M(bigNum(nw))}</div>
    ${nwHeroLine(nw)}
    <div class="split"><i style="width:${cash/tot*100}%;background:var(--ivory)"></i><i style="width:${iv/tot*100}%;background:var(--c-ocio)"></i><i style="width:${db/tot*100}%;background:var(--red)"></i></div>
    <div class="hero-btns"><button class="pill-pri" data-act="cuadre">Cuadrar</button><button class="pill-sec" data-act="sh" data-arg="cuentas">Cuentas</button></div>
  </div>
  <div class="grp" style="margin-top:12px">
    ${navRow('cuentas','<span class="cdot" style="--c:var(--ivory)"></span>Cuentas',D.accounts.length?`${D.accounts.length} cuenta${D.accounts.length>1?'s':''}${promos.length?` · ${promos.length} con promo`:''}`:'Añade la primera',M(eur0(cash)))}
    ${navRow('invs','<span class="cdot" style="--c:var(--c-ocio)"></span>Inversiones',D.invs.length?D.invs.map(i=>esc(i.producto)).join(', '):'Ninguna',M(eur0(iv)))}
    ${navRow('loans','<span class="cdot" style="--c:var(--red)"></span>Préstamos',D.loans.length?`${D.loans.length} · ${M(eur0(loanPay()))}/mes`:'Ninguno',M('−'+eur0(db)))}
  </div>
  <div class="grp" style="margin-top:12px">
    ${navRow('patri','Evolución del patrimonio',nwSeries().length?'Mes a mes, desde '+ymName(nwSeries()[0].ym)+' '+nwSeries()[0].ym.slice(0,4):'La primera foto se guarda el día 1',null)}
    <div class="row"><div class="rm"><div class="rt">Cuadre mensual</div><div class="rs">${lc?'Último: '+dmy(lc.date):'Aún no has cuadrado'} · cada día 1</div></div><button class="lnk" data-act="cuadre">Cuadrar</button></div>
  </div>`;
}
/* ================= patrimonio en el tiempo ================= */
const sgn=v=>(v>=0?'+':'')+eur0(v);
const dcol=v=>v>=0?'var(--ok)':'var(--over)';
function nwHeroLine(nw){const S=nwSeries(),l=S[S.length-1];if(!l)return '';const d=nw-l.nw;
  return `<button class="nw-line" data-act="sh" data-arg="patri"><b style="color:${dcol(d)}">${M(sgn(d))}</b> desde el cierre de ${ymName(l.ym)}${CHEV}</button>`}
function nwChart(P){
  const W=340,Ht=170,pl=40,pr=14,pt=14,pb=24,N=P.length-1;
  let mx=Math.max(...P.map(p=>p.nw)),mn=Math.min(0,...P.map(p=>p.nw));const span=(mx-mn)||1000;
  const step=span>200000?50000:span>80000?20000:span>30000?10000:span>10000?5000:span>4000?1000:500;
  mx=Math.ceil((mx+span*.06)/step)*step;mn=Math.floor(mn/step)*step;
  const x=i=>N?pl+(W-pl-pr)*i/N:pl+(W-pl-pr)/2,y=v=>pt+(Ht-pt-pb)*(mx-v)/((mx-mn)||1);
  let g='';for(let v=mn;v<=mx+1;v+=step)g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${pl-6}" y="${y(v)+3.5}" text-anchor="end">${v?(v/1000).toLocaleString('es-ES')+'K':'0'}</text>`;
  const d=P.map((p,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(p.nw).toFixed(1)).join(' ');
  if(N)g+=`<path d="${d} L${x(N).toFixed(1)} ${y(mn)} L${x(0).toFixed(1)} ${y(mn)}Z" style="fill:var(--ivory);opacity:.07"/>`;
  g+=`<path d="${d}" style="fill:none;stroke:var(--ivory);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round"/>`;
  const every=N>18?6:N>9?3:1;
  P.forEach((p,i)=>{const last=i===N;g+=`<circle cx="${x(i)}" cy="${y(p.nw)}" r="${last?4.5:3}" style="fill:${last?'var(--red2)':'var(--ivory)'}"/>`;
    if(last||i===0||(i%every===0&&N-i>=every/2+.5))g+=`<text class="ax" x="${x(i)}" y="${Ht-6}" text-anchor="${N&&i===0?'start':N&&last?'end':'middle'}">${p.hoy?'hoy':MES[+p.ym.slice(5,7)-1]+(p.ym.slice(5,7)==='01'||i===0?' '+p.ym.slice(2,4):'')}</text>`});
  return `<svg class="chart" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Evolución del patrimonio">${g}</svg>`}
function shPatri(){
  const S=nwSeries(),now=netNow(),l=S[S.length-1];
  setTimeout(()=>countUp($('#sh-sub')),60);
  const head=`<div class="grp" style="padding-block:16px;display:flex;flex-direction:column;gap:6px"><span class="lbl">Patrimonio hoy</span><span class="big" style="font-size:38px" data-count="${now}">${M(bigNum(now))}</span><span class="lbl">Cuentas ${M(eur0(cashNow()))} · inversiones ${M(eur0(invNow()))} · préstamos ${M('−'+eur0(debtNow()))}${pagadoNow()?` · pagado al piso ${M(eur0(pagadoNow()))}`:''}</span></div>`;
  if(!S.length){sheet('Patrimonio',`${head}<div class="empty">La primera foto se guarda sola el día 1 de ${ymName(ymAdd(T.ym,1))}, al cerrar ${ymName(T.ym)}. Si quieres ver la curva desde antes, mete meses anteriores a mano con su patrimonio.</div><div class="grp"><button class="add-row" data-act="hist-add">${ico('plus')}Añadir meses anteriores a mano</button></div>`);return}
  const P=S.slice(-24).concat([{ym:T.ym,nw:now,hoy:true}]);
  const y1=S.find(p=>p.ym===ymAdd(T.ym,-12)),f=S[0];
  const ref=y1||f,dRef=now-ref.nw,dMes=now-l.nw;
  const rows=S.map((p,i)=>({...p,dlt:i?p.nw-S[i-1].nw:null})).reverse();
  sheet('Patrimonio',`${head}
  <div class="grp" style="padding-block:12px">${nwChart(P)}</div>
  <div class="grp">
    <div class="row"><div class="rm"><div class="rt">Desde el cierre de ${ymName(l.ym)}</div></div><div class="ra" style="color:${dcol(dMes)}">${M(sgn(dMes))}</div></div>
    ${S.length>1||ref!==l?`<div class="row"><div class="rm"><div class="rt">${y1?'En un año':'Desde '+ymName(f.ym)+' '+f.ym.slice(0,4)}</div>${!y1&&S.length>1?`<div class="rs">${M(sgn(dRef/(ymIdx(T.ym)-ymIdx(f.ym))))} al mes de media</div>`:''}</div><div class="ra" style="color:${dcol(dRef)}">${M(sgn(dRef))}</div></div>`:''}
  </div>
  <div class="sec" style="margin-top:4px"><h3>Mes a mes</h3></div>
  <div class="grp">${rows.map(p=>`<div class="row"><div class="rm"><div class="rt">${ymNameCap(p.ym)} ${p.ym.slice(0,4)}${p.src==='mano'?' <span class="tg">a mano</span>':''}</div><div class="rs">${p.c!=null?`Cuentas ${M(eur0(p.c))} · inv. ${M(eur0(p.i))} · prést. ${M('−'+eur0(p.d))}`:'Solo el total'}${p.dlt!=null?` · <span style="color:${dcol(p.dlt)}">${M(sgn(p.dlt))}</span>`:''}</div></div><div class="ra">${M(eur0(p.nw))}</div></div>`).join('')}
    <button class="add-row" data-act="hist-add">${ico('plus')}Añadir meses anteriores a mano</button></div>
  <p class="quote">«${dMes>=0?`Desde el cierre de ${ymName(l.ym)} vas ${M(sgn(dMes))}. Así se hace un patrimonio, ladrillo a ladrillo, como la Almudena.`:`Desde el cierre de ${ymName(l.ym)} vas ${M(eur0(dMes))}. Si es la entrada del piso o un pago gordo, vale. Si son cañas, hablamos.`}»</p>
  <div class="lbl">El día 1 se guarda la foto del mes con los saldos que tenga la app. Si cuadras antes del día 10, la foto se corrige con lo que dicen tus bancos.</div>`)}
function shCuentas(){
  sheet('Cuentas',`<div class="grp">${D.accounts.map(a=>{const d=a.promoFin?daysTo(a.promoFin):-1;return `<button class="row" data-acc="${a.id}"><div class="bank" style="--k:${a.col}">${esc((a.bank||'?')[0]).toUpperCase()}</div><div class="rm"><div class="rt">${esc(a.alias)}</div><div class="rs">${esc(a.bank)} · ${taeNow(a)?fmt(taeNow(a))+' % TAE':'sin remunerar'}${d>=0?` · <span style="color:var(--warn)">promo ${d} días</span>`:''}${a.piso?' · piso':''}</div></div><div class="ra">${M(eur(a.bal))}</div>${CHEV}</button>`}).join('')}${addRow('acc','Añadir cuenta')}</div>
  ${D.accounts.filter(a=>a.promoFin&&daysTo(a.promoFin)>=0).map(a=>`<div class="grp" style="padding-block:14px"><div class="promo"><div class="ring">${ringSvg(daysTo(a.promoFin)/180,'var(--warn)')}<div class="t"><div><b>${daysTo(a.promoFin)}</b><small>días</small></div></div></div><div class="rm"><div class="rt wrap">Promo al ${fmt(a.promoTae)} % · ${esc(a.alias)}</div><div class="rs">Hasta ${dmy(a.promoFin)} · luego ${fmt(a.promoDesp??a.tae)} %</div><button class="cal" data-act="cal" data-arg="promo:${a.id}">${ico('cal')}Añadir al calendario</button></div></div></div>`).join('')}`);
}
function shInvs(){sheet('Inversiones',`<div class="grp">${D.invs.map(i=>{const g=(i.valor||0)-(i.aportado||0);return `<button class="row" data-inv="${i.id}"><div class="rm"><div class="rt">${esc(i.producto)}</div><div class="rs">${esc(i.broker)} · ${M(eur0(aportFor(i)))}/mes${i.aportado?` · <span style="color:${g>=0?'var(--ok)':'var(--over)'}">${g>=0?'+':''}${fmt(g/i.aportado*100,1)} %</span>`:''}</div></div><div class="ra">${M(eur(i.valor))}</div>${CHEV}</button>`}).join('')}${addRow('inv','Añadir inversión')}</div>`)}
function shLoans(){sheet('Préstamos',`<div class="grp">${D.loans.map(l=>{const a=amort(l);return `<button class="row" data-loan="${l.id}"><div class="rm"><div class="rt">${esc(l.nombre)}</div><div class="rs">${esc(l.entidad)} · ${M(eur0(l.cuota))}/mes · acaba ${a.n?lab(a.n):'—'}</div></div><div class="ra">${M(eur(l.pend))}</div>${CHEV}</button>`}).join('')}${addRow('loan','Añadir préstamo')}</div>`)}
function shIngresos(){sheet('Ingresos',`<div class="grp"><button class="row" data-inc="1"><div class="rm"><div class="rt">Nómina</div><div class="rs">Neta, cada mes</div></div><div class="ra pos">${M('+'+eur(D.income||0))}</div>${CHEV}</button>${D.extras.slice().sort((a,b)=>a.fecha<b.fecha?-1:1).map(e=>`<button class="row" data-ext="${e.id}"><div class="rm"><div class="rt">${esc(e.n)}</div><div class="rs">${e.fecha&&e.fecha<T.iso?'Cobrado':'Previsto'} ${dmy(e.fecha)}</div></div><div class="ra pos">${M('+'+eur0(e.a))}</div>${CHEV}</button>`).join('')}${addRow('ext','Añadir ingreso extra')}</div>`)}
function shFijos(){sheet('Gastos fijos',`<div class="grp">${D.fixed.map(f=>`<button class="row" data-fix="${f.id}"><div class="rm"><div class="rt">${esc(f.n)}</div><div class="rs">${f.sub?esc(f.sub)+' · ':''}día ${f.dia||'—'}</div></div><div class="ra">${M(eur0(f.a))}</div>${CHEV}</button>`).join('')}${D.loans.filter(l=>(l.pend||0)>0).map(l=>`<button class="row" data-loan="${l.id}"><div class="rm"><div class="rt">${esc(l.nombre)}</div><div class="rs">Cuota del préstamo · día ${l.dia||'—'}</div></div><div class="ra">${M(eur0(l.cuota))}</div>${CHEV}</button>`).join('')}${addRow('fix','Añadir gasto fijo')}</div>`)}
function shAnuales(){sheet('Gastos anuales',`<div class="lbl" style="margin-top:-4px">La app aparta ${M(eur0(anualMes()))} al mes para que no te pillen por sorpresa.</div><div class="grp">${D.anuales.map(a=>`<button class="row" data-anu="${a.id}"><div class="rm"><div class="rt">${esc(a.n)}</div><div class="rs">En ${MESL[a.mes]} · ${M(eur0(a.a/12))}/mes</div></div><div class="ra">${M(eur0(a.a))}</div>${CHEV}</button>`).join('')}${addRow('anu','Añadir gasto anual')}</div>`)}
function shComunes(){const cp=comPend();sheet('Gastos comunes',`<div class="grp">${cp.map(movRow).join('')||'<div class="empty">Nada pendiente. Todo lo común que has adelantado ya te lo has cogido de la común.</div>'}</div>${cp.length?'<button class="cta" data-act="com-ok">Ya me lo he cogido todo</button>':''}`)}
let movsYmView=null;
function movSearch(q){const T2=norm(q).split(' ').filter(Boolean);return D.movs.filter(m=>{const h=' '+norm(m.t+' '+catBy(m.cat).n+(m.com?' comun':''))+' ';return T2.every(t=>h.includes(t))}).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.ts||0)-(a.ts||0))}
function movSearchSum(l){const mine=l.filter(counts),tot=sum(mine,m=>m.a),first=l.length?l[l.length-1].date.slice(0,7):T.ym,nm=ymIdx(T.ym)-ymIdx(first)+1,cur=spentIn(l.filter(m=>m.date.slice(0,7)===T.ym));return {mine,tot,first,nm,media:tot/nm,cur,com:l.length-mine.length}}
function movsBody(ym){
  const q=(U.movQ||'').trim();
  if(q){const l=movSearch(q);if(!l.length)return `<div class="empty">Nada con «${esc(q)}». Prueba con otra palabra, o con la categoría.</div>`;
    const r=movSearchSum(l);
    return `<div class="grp" style="padding-block:14px;display:flex;flex-direction:column;gap:6px"><span class="lbl">${l.length} ${l.length>1?'gastos':'gasto'} con «${esc(q)}» desde ${ymName(r.first)} ${r.first.slice(0,4)}</span><span class="mid">${M(eur(r.tot))}</span><span class="lbl">${r.nm>1?`≈ ${M(eur0(r.media))}/mes · `:''}este mes ${M(eur(r.cur))}${r.com?` · sin contar ${r.com} común${r.com>1?'es':''} por coger o cogido${r.com>1?'s':''}`:''}</span></div>
    <div class="grp">${l.slice(0,150).map(movRow).join('')}</div>${l.length>150?`<div class="lbl">Enseño los 150 más recientes.</div>`:''}`}
  const l=movsYm(ym).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.ts||0)-(a.ts||0));
  return `<div class="lbl">${l.length} movimientos · ${M(eur(spentIn(l)))} en tu presupuesto</div>
  <div class="grp">${l.map(movRow).join('')||'<div class="empty">Sin movimientos este mes.</div>'}</div>`}
function shMovs(ym){
  ym=ym||movsYmView||T.ym;movsYmView=ym;
  const yms=[...new Set(D.movs.map(m=>m.date.slice(0,7)).concat([T.ym]))].sort().reverse();
  sheet('Movimientos',`<label class="srch">${ico('search')}<input id="mv-q" type="search" enterkeyhint="search" autocomplete="off" autocorrect="off" placeholder="Buscar: kebab, bizum, súper…" value="${esc(U.movQ||'')}" aria-label="Buscar gastos"></label>
  <div class="chips" id="mv-chips" style="margin-top:-2px"${(U.movQ||'').trim()?' hidden':''}>${yms.map(y=>`<button class="chip-q ${y===ym?'on':''}" data-movym="${y}">${ymNameCap(y)}${y.slice(0,4)!=String(T.y)?' '+y.slice(2,4):''}</button>`).join('')}</div>
  <div id="mv-res" style="display:flex;flex-direction:column;gap:inherit">${movsBody(ym)}</div>`)}
function movsQ(v){U.movQ=v;if(!$('#mv-res'))return;$('#mv-chips').hidden=!!v.trim();$('#mv-res').innerHTML=movsBody(movsYmView||T.ym)}
function shPagos(){sheet('Pagos a la promotora',`<div class="lbl" style="margin-top:-4px">Si compras sobre plano, mete aquí los pagos a cuenta: salen antes de la fecha y cuentan como parte de la entrada.</div><div class="grp">${D.pagos.slice().sort((a,b)=>a.fecha<b.fecha?-1:1).map(p=>`<button class="row" data-pago="${p.id}"><div class="rm"><div class="rt">${esc(p.n)}</div><div class="rs">${dmy(p.fecha)}</div></div><div class="ra">${M(eur0(p.a))}</div>${CHEV}</button>`).join('')}${addRow('pago','Añadir pago')}</div>`)}
function shHitos(){const G=goalStep(),b=simulate({steps:G});sheet('Hitos',`<div class="grp" style="padding-block:6px"><div class="tl">${hitos(b,G).map(h=>`<div class="tl-i" style="--k:var(${h.c})"><span class="d">${h.d}</span><span class="dot"></span><div class="tx"><b>${esc(h.t)}</b><small>${h.s}</small>${h.cal?`<br><button class="cal" data-act="cal" data-arg="${h.cal}">${ico('cal')}Añadir al calendario</button>`:''}</div></div>`).join('')||'<div class="empty">Sin hitos todavía. Mete promos, préstamos u objetivo y aparecerán aquí.</div>'}</div></div>`)}
const SH={hipoteca:()=>openHipoteca(),cuentas:shCuentas,invs:shInvs,loans:shLoans,ingresos:shIngresos,fijos:shFijos,anuales:shAnuales,comunes:shComunes,movs:()=>shMovs(T.ym),pagos:shPagos,hitos:shHitos,patri:shPatri,hist:()=>openHist(),cloud:()=>openCloud(),snaps:()=>openSnaps(),versions:()=>openVersions()};

/* ================= el Chulapo ================= */
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[¿?¡!.]/g,' ').replace(/\s+/g,' ').trim();
const KW={super:['mercadona','lidl','super','carrefour','alcampo','ahorramas','aldi','dia','compra','pan','fruteria','carniceria'],fuera:['cana','canas','bar','cafe','cafes','menu','comida','cena','restaurante','bravas','vermu','copa','copas','desayuno','bocata','tapas','comer fuera','cerveza','birra'],delivery:['glovo','uber eats','just eat','deliveroo','domicilio','pizza','pedido','delivery'],ocio:['cine','concierto','teatro','museo','entrada','partido','ocio','padel','netflix','juego'],transp:['cabify','taxi','uber','metro','bus','gasolina','parking','tren','renfe','transporte','bici','peaje'],ropa:['zara','ropa','camiseta','zapatillas','pantalon','chaqueta','sudadera','zapatos'],capr:['capricho','caprichos','amazon','regalo','libro','funda','gadget'],otros:['otros','limpieza','farmacia','peluqueria']};
function catFromText(t){const n=' '+norm(t)+' ';for(const id in KW){if(!D.cats.some(c=>c.id===id))continue;if(KW[id].some(k=>n.includes(' '+k+' ')||n.includes(' '+k+'s ')||n.includes(' '+k+'es ')))return id}const c=D.cats.find(c=>n.includes(norm(c.n)));return c?c.id:null}
function hormigas(){
  const l=curMovs().filter(m=>m.a<=8&&counts(m));const g={};
  l.forEach(m=>{const k=norm(m.t).split(' ')[0]||'x';(g[k]=g[k]||{k,t:m.t,n:0,tot:0,cat:m.cat}).n++;g[k].tot+=m.a});
  const out=Object.values(g).filter(x=>x.n>=3);
  const dl=curMovs().filter(m=>m.cat==='delivery'&&counts(m));if(dl.length>=3&&!out.some(o=>o.cat==='delivery'))out.push({k:'domicilio',t:'Pedidos a domicilio',n:dl.length,tot:sum(dl,m=>m.a),cat:'delivery'});
  return out.map(x=>({...x,anual:x.tot/T.d*365})).sort((a,b)=>b.anual-a.anual);
}
function frecuentes(){
  const from=isoD(new Date(nowD().getTime()-90*864e5));const g={};
  D.movs.filter(m=>!m.com&&m.date>=from).forEach(m=>{const k=m.t+'|'+m.cat+'|'+m.a;(g[k]=g[k]||{t:m.t,cat:m.cat,a:m.a,n:0}).n++});
  return Object.values(g).filter(x=>x.n>=2).sort((a,b)=>b.n-a.n).slice(0,5);
}
function addMov(t,cat,a,com,date){const m={id:uid(),date:date||T.iso,ts:Date.now(),t,cat,a:+a.toFixed(2)};if(com)m.com=com;const key=m.com==='yo'?'comun':cat,before=spentBy(key);D.movs.push(m);const after=spentBy(key),lim=catBy(key).lim||0;
  let msg;if(m.com==='pend')msg=V.comPend;else if(m.com==='yo')msg=V.comYo;else if(lim&&after>lim&&before<=lim)msg=V.over(catBy(cat).n.toLowerCase());else msg=vadd(cat,curMovs().filter(x=>x.cat===cat&&counts(x)).length);
  save();return {m,msg};}
const undoMov=m=>()=>{const i=D.movs.indexOf(m);if(i>=0)D.movs.splice(i,1);save()};

const CHIPS=['¿Cuánto me queda?','¿Cuánto he ahorrado?','¿Cómo va mi patrimonio?','¿Llego al piso?','Gastos hormiga','Parte del mes','¿Cuál fue mi peor mes?','¿Y si recorto 100 € al mes?','¿Cuánto llevo en súper?'];
let chatLog=[],chatTyping=false;
function openChat(q){
  if(!chatLog.length){
    const h=hormigas()[0],lastH=D.hist[D.hist.length-1];
    chatLog.push({who:'bot',h:`${greet()}${nombre()}. Aquí el Chulapo, a tu servicio y al de tu cartera, que buena falta le hace.`});
    const bits=[];if(lastH&&!D.dismissed['parte-'+lastH.ym])bits.push(`tienes el <b>parte de ${ymName(lastH.ym)}</b> listo`);if(h)bits.push(`te he pillado un <b>gasto hormiga</b>: ${h.n} de «${esc(h.t.toLowerCase())}» este mes, al año <b>${M(eur0(h.anual))}</b>`);
    chatLog.push({who:'bot',h:`${bits.length?'Te cuento lo gordo: '+bits.join(' y ')+'. ':''}Pregúntame lo que quieras o apúntame un gasto escribiéndolo, tipo «12,50 cañas».`});
  }
  drawChat();$('#chat-chips').innerHTML=CHIPS.map(c=>`<button class="chip-q" data-q="${esc(c)}">${c}</button>`).join('');
  open('#sh-chat');
  if(q)setTimeout(()=>ask(q),250);
}
function drawChat(){const L=$('#chat-log');L.innerHTML=chatLog.map(m=>`<div class="msg ${m.who}">${m.h}</div>`).join('')+(chatTyping?'<div class="msg bot typing"><i></i><i></i><i></i></div>':'');L.scrollTop=L.scrollHeight}
function ask(q){q=String(q||'').trim();if(!q)return;chatLog.push({who:'me',h:esc(q)});chatTyping=true;drawChat();
  setTimeout(()=>{chatTyping=false;let a;try{a=answer(q)}catch(e){console.error(e);a='Se me ha cruzado un cable, chaval. Pregúntamelo de otra forma.'}chatLog.push({who:'bot',h:a});drawChat();rr()},500)}
function parteHTML(h){
  const r=mesRec(h,0);const top=Object.entries(h.cats||{}).filter(([id])=>id!=='comun').sort((a,b)=>b[1]-a[1]).slice(0,3);
  return `<b>Parte de ${ymName(h.ym)}</b><br>Gastaste en el día a día <b>${M(eur(h.dia))}</b> de ${M(eur0(h.pres))}: ${h.pres&&h.dia>h.pres?`te pasaste ${M(eur(h.dia-h.pres))}, figura`:'por debajo, olé'}.<br>${top.length?'Lo que más: '+top.map(([c,v])=>`${esc(catBy(c).n)} ${M(eur0(v))}`).join(' · ')+'.<br>':''}Ahorraste <b>${M(eur0(r.ah))}</b> (el ${Math.round(r.tasa*100)} % de lo que entró)${h.inv?`: ${M(eur0(h.inv))} a inversiones y ${M(eur0(r.hucha))} al resto`:''}.<br>${r.fuga!=null?`Sin apuntar se te quedaron ${M(eur0(Math.max(0,r.fuga)))}.<br>`:''}Resumen castizo: ${r.ah<0?'suspenso. Este mes, ni un capricho.':h.pres&&h.dia>h.pres?'aprobado raspado. Menos bravas.':'notable alto. Así da gusto.'} <button class="lnk" data-act="sh" data-arg="hist">Ver histórico</button>`}
function srchAns(q){const l=movSearch(q);if(!l.length)return `No encuentro nada con «${esc(q)}», chaval. O no lo has apuntado, o lo llamaste de otra forma.`;const r=movSearchSum(l);
  return `Con «${esc(q)}» llevas <b>${l.length} ${l.length>1?'gastos':'gasto'}</b> desde ${ymName(r.first)}: <b>${M(eur(r.tot))}</b>${r.nm>1?`, unos ${M(eur0(r.media))} al mes`:''}. Este mes, ${M(eur(r.cur))}. ${r.media*12>300?`Al año son ${M(eur0(r.media*12))}. Tú sabrás, figura.`:'Nada grave, majo.'} <button class="lnk" data-act="buscar" data-arg="${esc(q)}">Ver los gastos</button>`}
function answer(q){
  const n=norm(q),G=goalStep(),goal=goalTotal();
  let m;
  if((m=n.match(/(?:y )?si (?:recorto|ahorro|quito|gasto)\s*(\d+)(?: euros?| €)?(?: menos)?(?: al mes)?(?: (?:en|de) (.+))?/))||(m=n.match(/gasto (\d+)(?: euros?)? menos(?: (?:en|de) (.+))?/))){
    if(!goal)return 'Primero ponme el objetivo del piso (en Mi piso → Editar), que si no, no sé a dónde vas.';
    const N=+m[1],cid=m[2]?catFromText(m[2]):null;const base=simulate({steps:G}),alt=simulate({steps:G,varM:Math.max(0,budget()-N)});
    const a=alt.pts[G].piso,d=a-base.pts[G].piso;
    return `Si recortas <b>${N} € al mes</b>${cid?' en '+catBy(cid).n.toLowerCase():''}, el ${dmy(D.piso.fecha)} tendrías <b>${M(eur0(a))}</b> en la hucha: <b>${M(eur0(d))} más</b>. ${a>=goal?'Y llegas, figura.':`Aún te faltarían ${M(eur0(goal-a))}, pero oye, menos da una piedra.`}`;
  }
  const ql=q.toLowerCase().replace(/[¿?¡!]/g,' ').replace(/\s+/g,' ').trim();
  if((m=ql.match(/^(?:apúntame\s+|apuntame\s+|apunta\s+)?(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?\b|eur\b|e\b|pavos\b|pelas\b)?\s*(?:de |en )?(.*)$/))){
    const a=parseFloat(m[1].replace(',','.'));if(!(a>0))return 'Eso no es un importe, chaval.';
    let txt=m[2]||'';const com=/\bcom[uú]n\b/.test(txt)?'pend':null;txt=txt.replace(/\bcom[uú]n\b/,'').trim();
    const cid=catFromText(txt)||'otros';const t=txt?txt.charAt(0).toUpperCase()+txt.slice(1):catBy(cid).n;
    const {m:mv,msg}=addMov(t,cid,a,com);
    return `Apuntado: <b>${esc(t)}</b>, ${M(eur(a))} en <b>${esc(catBy(cid).n.toLowerCase())}</b>${com?' (común, por coger)':''}. ${msg} <button class="lnk" data-undo="${mv.id}">Deshacer</button>`;
  }
  if(/hormiga/.test(n)){const H=hormigas();if(!H.length)return 'Ni una hormiga este mes, chaval. Más limpio que la Puerta del Sol a las seis de la mañana.';
    return 'Mira lo que se te va sin darte cuenta:<br>'+H.map(h=>`· <b>${esc(h.t)}</b>: ${h.n} veces, ${M(eur(h.tot))} este mes → <b>${M(eur0(h.anual))} al año</b>`).join('<br>')+'<br>Con eso amueblas medio salón del piso nuevo. Tú verás, majo.'}
  const mesM=n.match(/(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
  if(mesM&&/(ahorre|ahorrado|gaste|gastado|parte|mes de)/.test(n)){const mi=MESL.indexOf(mesM[1]);const H=histRecs().filter(x=>+x.ym.slice(5,7)-1===mi);const h=H[H.length-1];if(!h)return `De ${mesM[1]} no tengo datos cerrados, chaval.`;if(/parte/.test(n))return parteHTML(D.hist[h.i]);return `En <b>${mesM[1]}</b> ahorraste <b>${M(eur0(h.ah))}</b> (el ${Math.round(h.tasa*100)} % de lo que entró) y gastaste ${M(eur0(h.gast))}. ${h.ah<0?'Tiraste de ahorros, figura.':h.fuga!=null&&h.fuga>50?`Y te dejaste ${M(eur0(h.fuga))} sin apuntar, que lo sepas.`:'Bien hecho.'}`}
  if(/peor mes/.test(n)){const st=histStats();if(!st.worst)return 'Aún no hay meses cerrados. El primero, el día 1.';return `Tu peor mes fue <b>${ymName(st.worst.ym)}</b>: ${M(eur0(st.worst.ah))}. ${esc(st.worst.nota||'')} Lo tengo grabado a fuego, chulapo.`}
  if(/mejor mes/.test(n)){const st=histStats();if(!st.best)return 'Aún no hay meses cerrados. El primero, el día 1.';return `Tu mejor mes fue <b>${ymName(st.best.ym)}</b>: ahorraste ${M(eur0(st.best.ah))}. Así me gusta.`}
  if(/parte|resumen|informe/.test(n)){const h=D.hist[D.hist.length-1];if(!h)return 'Todavía no hay parte: el primero sale cuando cierre este mes, el día 1.';D.dismissed['parte-'+h.ym]=1;save();return parteHTML(h)}
  if(/historico|cuanto (?:he )?ahorrad|media/.test(n)){const st=histStats();if(!st.H.length)return 'Aún no hay meses cerrados. El primero se cierra solo el día 1. <button class="lnk" data-act="sh" data-arg="hist">Ver histórico</button>';return `Desde ${ymName(st.H[0].ym)} llevas <b>${M(eur0(st.tot))}</b> ahorrados: ${M(eur0(st.media))} al mes de media, el ${Math.round(st.tasa*100)} % de lo que entra.${st.fuga!=null?` Y se te escapan unos ${M(eur0(st.fuga))} al mes sin apuntar.`:''} <button class="lnk" data-act="sh" data-arg="hist">Ver histórico</button>`}
  if(/patrimonio|cuanto tengo|que tengo en total/.test(n)){const S=nwSeries(),now=netNow(),l=S[S.length-1];return `Tu patrimonio hoy: <b>${M(eur0(now))}</b> (cuentas ${M(eur0(cashNow()))}, inversiones ${M(eur0(invNow()))}, préstamos ${M('−'+eur0(debtNow()))}). ${l?`Desde el cierre de ${ymName(l.ym)}: <b>${M(sgn(now-l.nw))}</b>. ${now>=l.nw?'Para arriba, como el Faro de Moncloa.':'Para abajo. ¿Qué ha pasado, majo?'}`:'La primera foto se guarda el día 1, y desde ahí te digo cómo evoluciona.'} <button class="lnk" data-act="sh" data-arg="patri">Ver evolución</button>`}
  if((m=n.match(/(?:busca|buscame|encuentra)\s+(.+)/))){const q=m[1].replace(/^(?:los |las |el |la |mis )?(?:gastos? (?:de|en) )?/,'').trim();return srchAns(q)}
  if((m=n.match(/(?:llevo|gastado|gaste|he gastado|me he gastado|me gaste) (?:en|de) (.+)/))){const q=m[1].replace(/ (?:este|al|en total|desde|hasta).*$/,'').trim(),cid=catFromText(q);const isCat=cid&&norm(catBy(cid).n)===q;if(!isCat&&(movSearch(q).length||!cid))return srchAns(q);if(cid){const c=catBy(cid),s=spentBy(cid);return `En <b>${esc(c.n.toLowerCase())}</b> llevas <b>${M(eur(s))}</b>${c.lim?' de '+M(eur0(c.lim)):''}. ${c.lim&&s>c.lim?'Te has pasado, campeón. Ese límite era para cumplirlo, no para mirarlo.':c.lim&&s>c.lim*T.d/T.dim?'Vas por encima del ritmo. Ojo, que el mes es largo.':'Vas bien. No te acostumbres.'}`}}
  if(/queda|presupuesto|puedo gastar/.test(n)){const p=pace(),left=p.b-p.sp,days=T.dim-T.d+1;if(!p.b)return 'No tienes presupuesto puesto. Ve a Presupuesto → Editar límites y ponte unos topes, chaval.';return `Te quedan <b>${M(eur(left))}</b> para ${days} días: <b>${M(eur(Math.max(0,left)/days))} al día</b>. ${pick(V.status[p.st])}`}
  if(/piso|entrada|llego/.test(n)){if(!goal)return 'Ponme el objetivo del piso (Mi piso → Editar) y te digo si llegas.';const b=simulate({steps:G});const e=b.pts[G].piso;return `Hoy tienes <b>${M(eur0(b.pts[0].piso))}</b> en la hucha. Con este plan, el ${dmy(D.piso.fecha)} tendrías <b>${M(eur0(e))}</b> de ${M(eur0(goal))}. ${(e>=goal?V.llega:V.falta)(M(eur0(Math.abs(goal-e))))}`}
  if(/hipoteca|cuota del piso/.test(n)){return `Para eso tengo el simulador: precio, financiación, tipo y plazo, y te digo la cuota. <button class="lnk" data-act="sh" data-arg="hipoteca">Abrir simulador</button>`}
  if(/prestamo|amortiz|cuota/.test(n)){const l=D.loans.find(x=>(x.pend||0)>0);if(!l)return 'No tienes préstamos vivos. Míralo, el señorito.';const a=amort(l);return `Del <b>${esc(l.nombre)}</b> te quedan <b>${M(eur(l.pend))}</b>. Lo acabas en <b>${lab(a.n)}</b> y aún le vas a regalar ${M(eur(a.tot))} de intereses al banco. Si amortizas 500 € hoy, te ahorras ${M(eur(a.tot-amort(l,500).tot))}. Piénsalo.`}
  if(/promo/.test(n)){const a=D.accounts.find(x=>x.promoFin&&daysTo(x.promoFin)>=0);return a?`La promo de <b>${esc(a.alias)}</b> acaba en <b>${daysTo(a.promoFin)} días</b>. Después baja al ${fmt(a.promoDesp??a.tae)} %. Cuando acabe, a buscar otro banco que te quiera.`:'No tienes promos vivas. Ni un banco te quiere ahora mismo, chaval.'}
  if(/cuanto (?:llevo|he gastado)|gastado/.test(n)){return `Llevas <b>${M(eur(spent()))}</b> este mes, sin contar lo común que te vas a coger. ${pick(V.status[pace().st])}`}
  if(/^(hola|buenas|que tal|ey|eh|buenos)/.test(n))return `${greet()}, chulapo. ¿Qué se te ofrece? ¿Apuntamos algo o te digo cuánto te queda?`;
  if(/gracias/.test(n))return 'De nada, hombre. Pero las gracias no se ingresan en la hucha.';
  if(/ayuda|que sabes|que puedes|como funciona/.test(n))return 'Sé hacer esto:<br>· Apuntar: «12,50 cañas», «46 mercadona común»<br>· «¿Cuánto me queda?» o «¿cuánto llevo en bares?»<br>· «¿Llego al piso?» o «¿y si recorto 100 €?»<br>· «Gastos hormiga», «parte», «¿cuánto ahorré en marzo?», «préstamo», «promo», «hipoteca»<br>· «¿Cuánto me he gastado en kebab?» o «busca bizum»<br>· «¿Cómo va mi patrimonio?»';
  return 'No te he pillado, chaval. Pregúntame cosas tipo «¿cuánto me queda?», «¿llego al piso?» o apúntame algo así: «12,50 cañas».';
}

/* ================= hipoteca ================= */
function hipoCalc(h){const i=(h.tipo||0)/1200,n=(h.plazo||30)*12;let precio=h.precio||0,prest,cuota;
  if(h.mode==='cuota'){cuota=h.cuota||0;prest=i?cuota*(1-Math.pow(1+i,-n))/i:cuota*n;precio=prest/((h.fin||80)/100)}
  else{prest=precio*(h.fin||0)/100;cuota=i?prest*i/(1-Math.pow(1+i,-n)):prest/n}
  const entrada=precio-prest,gastos=precio*(h.gastos||0)/100;return {precio,prest,cuota,entrada,gastos,total:entrada+gastos,intereses:cuota*n-prest}}
function hipoOut(){const h=D.hipo,r=hipoCalc(h);
  return `<div class="calc">${h.mode==='cuota'?`<div><span class="lbl">Piso máximo</span><b>${M(eur0(r.precio))}</b></div>`:`<div><span class="lbl">Cuota al mes</span><b>${M(eur0(r.cuota))}</b></div>`}<div><span class="lbl">Préstamo</span><b>${M(eur0(r.prest))}</b></div><div><span class="lbl">Entrada</span><b>${M(eur0(r.entrada))}</b></div><div><span class="lbl">Gastos de compra</span><b>${M(eur0(r.gastos))}</b></div><div><span class="lbl">Hay que poner</span><b style="color:var(--red2)">${M(eur0(r.total))}</b></div><div><span class="lbl">Intereses en total</span><b>${M(eur0(r.intereses))}</b></div></div>
  <p class="quote">«${goalTotal()?`Tu objetivo en la app son ${M(eur0(goalTotal()))}. `:''}${r.intereses>r.prest*.4?`Y al banco le vas a regalar ${M(eur0(r.intereses))} en intereses: ese señor se compra un chalé en la sierra a tu costa.`:`La cuota, ${M(eur0(r.cuota))} al mes. Ve despidiéndote del Glovo, chulapo.`}»</p>`}
function openHipoteca(){const h=D.hipo;const nf=(id,l,v,suf,w=120)=>`<label class="ff" for="${id}"><span>${l}</span><span class="inw"><input id="${id}" data-h="${id.slice(2)}" inputmode="decimal" value="${String(v??'').replace('.',',')}" style="width:${w}px;${suf.length>1?'padding-right:46px':''}"><i>${suf}</i></span></label>`;
  sheet('Simulador de hipoteca',`<div class="seg"><button data-hm="piso" class="${h.mode==='piso'?'on':''}">Con este piso</button><button data-hm="cuota" class="${h.mode==='cuota'?'on':''}">Con esta cuota</button></div>
  <div class="grp" id="hipo">${h.mode==='cuota'?nf('h-cuota','Cuota máxima al mes',h.cuota,'€'):nf('h-precio','Precio del piso',h.precio,'€',130)}${nf('h-fin','Financiación',h.fin,'%')}${nf('h-tipo','Tipo de interés',h.tipo,'%')}${nf('h-plazo','Plazo',h.plazo,'años')}${nf('h-gastos','Gastos de compra',h.gastos,'%')}</div>
  <div id="hipo-out">${hipoOut()}</div><div class="lbl">Pon las cifras que te den en el banco. La cuota es orientativa: tipo fijo y cuota constante (sistema francés).</div>`)}

/* ================= histórico ================= */
function histChart(H){
  const W=340,Ht=190,pl=34,pr=8,pt=18,pb=26,plan=planMes();
  let mx=Math.max(...H.map(h=>h.ah),plan,250),mn=Math.min(0,...H.map(h=>h.ah));const stp=mx-mn>3000?1000:mx-mn>1500?500:250;mx=Math.ceil(mx/stp)*stp;mn=Math.floor(mn/stp)*stp;
  const y=v=>pt+(Ht-pt-pb)*(mx-v)/((mx-mn)||1),bw=(W-pl-pr)/Math.max(H.length,4),x=i=>pl+bw*i+bw*.18,w=bw*.64;
  let g='';for(let v=mn;v<=mx;v+=stp)g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${pl-5}" y="${y(v)+3.5}" text-anchor="end">${v===0?'0':(v/1000).toLocaleString('es-ES')+'K'}</text>`;
  H.forEach((h,i)=>{const top=Math.min(y(h.ah),y(0)),hh=Math.max(2,Math.abs(y(h.ah)-y(0)));const neg=h.ah<0;
    g+=`<g data-mes="${h.i}" style="cursor:pointer"><rect class="hit" x="${pl+bw*i}" y="0" width="${bw}" height="${Ht}"/><rect class="b ${neg?'n':''}" x="${x(i)}" y="${top}" width="${w}" height="${hh}" rx="4" style="fill:${neg?'var(--over)':'var(--red2)'};animation-delay:${i*60}ms"/>
    <text class="bv" x="${x(i)+w/2}" y="${neg?top+hh+11:top-5}" text-anchor="middle">${fmt(Math.round(h.ah),0)}</text>
    <text class="ax" x="${x(i)+w/2}" y="${Ht-8}" text-anchor="middle">${MES[+h.ym.slice(5,7)-1]}</text></g>`});
  if(plan>0)g+=`<line class="gl" x1="${pl}" x2="${W-pr}" y1="${y(plan)}" y2="${y(plan)}"/>`;
  g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(0)}" y2="${y(0)}" style="stroke:var(--line2)"/>`;
  return `<svg class="chart hchart" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Ahorro de cada mes">${g}</svg>`;
}
function openHist(){
  const st=histStats(),H=st.H.slice(-12),p=pace(),prev=(D.income||0)-fixedSum()-loanPay()-Math.max(p.b,p.sp/T.d*T.dim);
  setTimeout(()=>countUp($('#sh-sub')),60);
  if(!st.H.length){sheet('Histórico',`<div class="empty">Aún no hay meses cerrados. ${ymNameCap(T.ym)} se cierra solo el día 1 de ${ymName(ymAdd(T.ym,1))} y aquí verás lo que ahorraste.</div><div class="grp"><div class="row"><div class="rm"><div class="rt">${ymNameCap(T.ym)}</div><div class="rs">En curso · previsto a este ritmo</div></div><div class="ra" style="color:var(--mut)">${M('≈ '+eur0(prev))}</div></div><button class="add-row" data-act="hist-add">${ico('plus')}Añadir meses anteriores a mano</button></div>`);return}
  sheet('Histórico',`<div class="grp" style="padding-block:16px;display:flex;flex-direction:column;gap:6px">
    <span class="lbl">Ahorrado desde ${ymName(st.H[0].ym)} ${st.H[0].ym.slice(0,4)}</span><span class="big" style="font-size:38px" data-count="${st.tot}">${M(bigNum(st.tot))}</span>
    <span class="lbl">Media ${M(eur0(st.media))}/mes · te guardas el ${Math.round(st.tasa*100)} % de lo que entra</span></div>
  <div class="grp" style="padding-block:12px">${histChart(H)}<div class="lgd" style="margin-top:6px"><span style="--k:var(--red2)">Ahorrado</span><span style="--k:var(--over)">Mes en negativo</span>${planMes()>0?`<span style="--k:var(--warn)">Plan: ${M(eur0(planMes()))}/mes</span>`:''}</div></div>
  <div class="grp">
    ${st.H.length>1?`<div class="row"><div class="rm"><div class="rt">Mejor mes</div></div><div class="ra pos">${ymName(st.best.ym)} · ${M((st.best.ah>=0?'+':'')+eur0(st.best.ah))}</div></div>
    <div class="row"><div class="rm"><div class="rt">Peor mes</div><div class="rs">${esc(st.worst.nota||'')}</div></div><div class="ra" style="color:var(--over)">${ymName(st.worst.ym)} · ${M(eur0(st.worst.ah))}</div></div>`:''}
    <div class="row"><div class="rm"><div class="rt">Se te escapa sin apuntar</div><div class="rs">${st.fuga==null?'Necesito dos cuadres seguidos (día 1) para calcularlo':'Diferencia media entre lo apuntado y tus bancos'}</div></div><div class="ra" style="color:var(--warn)">${st.fuga==null?'—':M(eur0(st.fuga))+'/mes'}</div></div>
  </div>
  <div class="sec" style="margin-top:4px"><h3>Mes a mes</h3></div>
  <div class="grp">
    <div class="row"><div class="rm"><div class="rt">${ymNameCap(T.ym)}</div><div class="rs">En curso · previsto a este ritmo</div></div><div class="ra" style="color:var(--mut)">${M('≈ '+eur0(prev))}</div></div>
    ${st.H.slice().reverse().map(h=>`<button class="row" data-mes="${h.i}"><div class="rm"><div class="rt">${ymNameCap(h.ym)} ${h.ym.slice(0,4)}${h.manual?' <span class="tg">a mano</span>':''}</div><div class="rs">Gastado ${M(eur0(h.gast))} · ${Math.round(h.tasa*100)} % ahorrado${h.fuga!=null&&h.fuga>50?` · <span style="color:var(--warn)">${M(eur0(h.fuga))} sin apuntar</span>`:''}</div></div><div class="ra" style="color:${h.ah<0?'var(--over)':'var(--ok)'}">${M((h.ah>=0?'+':'')+eur0(h.ah))}</div>${CHEV}</button>`).join('')}
    <button class="add-row" data-act="hist-add">${ico('plus')}Añadir meses anteriores a mano</button>
  </div>
  <p class="quote">«${st.tot>0?`Llevas ${M(eur0(st.tot))} ahorrados en ${st.H.length} ${st.H.length>1?'meses':'mes'}. No está mal, chulapo${st.worst&&st.worst.ah<st.media*.5?`, pero ${ymName(st.worst.ym)} te lo tengo apuntado`:''}.`:'Llevas más gastado que ahorrado. Esto no es ahorrar, es hacer turismo con la nómina.'}»</p>
  <div class="lbl">El día 1 de cada mes se cierra solo el mes anterior con lo que hayas apuntado.</div>`);
}
function openMes(i){
  const H=histRecs(),h=H[i];if(!h)return;const ant=H[i-1],plan=planMes();
  const cats=Object.entries(h.cats||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);
  sheet(`${ymNameCap(h.ym)} ${h.ym.slice(0,4)}`,`<button class="link" data-act="sh" data-arg="hist" style="align-self:flex-start;margin-top:-6px">‹ Histórico</button>
  <div class="grp">
    <div class="row"><div class="rm"><div class="rt">Ingresos</div></div><div class="ra pos">${M('+'+eur(h.ing))}</div></div>
    ${h.manual?`<div class="row"><div class="rm"><div class="rt">Gastos</div><div class="rs">Metido a mano</div></div><div class="ra">${M('−'+eur(h.dia))}</div></div>`:`
    <div class="row"><div class="rm"><div class="rt">Gastos fijos</div><div class="rs">Incluye cuotas de préstamos</div></div><div class="ra">${M('−'+eur(h.fijos))}</div></div>
    <div class="row"><div class="rm"><div class="rt">Día a día</div><div class="rs">Presupuesto ${M(eur0(h.pres))}${h.pres&&h.dia>h.pres?` · <span style="color:var(--over)">te pasaste ${M(eur0(h.dia-h.pres))}</span>`:''}</div></div><div class="ra">${M('−'+eur(h.dia))}</div></div>
    ${h.anu?`<div class="row"><div class="rm"><div class="rt">Gastos anuales</div><div class="rs">${esc(h.nota||'')}</div></div><div class="ra">${M('−'+eur(h.anu))}</div></div>`:''}`}
    <div class="row"><div class="rm"><div class="rt" style="font-weight:650">Ahorrado</div><div class="rs">${h.ah>0&&h.inv?`${M(eur0(h.inv))} a inversiones · ${M(eur0(h.hucha))} al resto`:h.ah<0?'Se tiró de ahorros':''}</div></div><div class="ra" style="font-size:17px;color:${h.ah<0?'var(--over)':'var(--red2)'}">${M(eur(h.ah))}</div></div>
  </div>
  <div class="grp">
    ${plan>0?`<div class="row"><div class="rm"><div class="rt">Contra el plan</div></div><div class="ra" style="color:${h.ah>=plan?'var(--ok)':'var(--over)'}">${M((h.ah>=plan?'+':'')+eur0(h.ah-plan))}</div></div>`:''}
    ${ant?`<div class="row"><div class="rm"><div class="rt">Contra ${ymName(ant.ym)}</div></div><div class="ra" style="color:${h.ah>=ant.ah?'var(--ok)':'var(--over)'}">${M((h.ah>=ant.ah?'+':'')+eur0(h.ah-ant.ah))}</div></div>`:''}
    <div class="row"><div class="rm"><div class="rt">Según tus bancos</div><div class="rs">${h.bancos==null?'Falta el cuadre del día 1 de este mes o del siguiente':'Lo que creció tu dinero de verdad (cuadre)'}</div></div><div class="ra">${h.bancos==null?'—':M(eur0(h.bancos))}</div></div>
    ${h.fuga!=null?`<div class="row"><div class="rm"><div class="rt">Sin apuntar</div></div><div class="ra" style="color:${h.fuga>50?'var(--warn)':'var(--ok)'}">${M(eur0(Math.max(0,h.fuga)))}</div></div>`:''}
    ${h.nw!=null?`<div class="row"><div class="rm"><div class="rt">Patrimonio al cierre</div><div class="rs">Hucha del piso ${M(eur0(h.piso))}</div></div><div class="ra">${M(eur0(h.nw))}</div></div>`:''}
  </div>
  ${cats.length?`<div class="sec" style="margin-top:4px"><h3>En qué se fue el día a día</h3></div>
  <div class="grp">${cats.map(([id,v])=>`<div class="row"><span class="cdot" style="--c:var(${catBy(id).c})"></span><div class="rm"><div class="rt">${esc(catBy(id).n)}</div></div><div class="ra">${M(eur0(v))}</div></div>`).join('')}</div>`:''}
  ${h.manual?`<button class="cta danger" data-act="hist-del" data-arg="${h.ym}">Borrar este mes</button>`:''}
  <p class="quote">«${h.ah<0?`En ${ymName(h.ym)} tiraste de ahorros. ${esc(h.nota||'')} Que no se convierta en costumbre, chaval.`:h.fuga!=null&&h.fuga>50?`Te dejaste ${M(eur0(h.fuga))} sin apuntar. ¿Qué fue, majo, las cañas de después del curro?`:plan>0&&h.ah>=plan?'Mes de libro. Así da gusto, chulapo.':'Ni fu ni fa. Se puede apretar más.'}»</p>`);
}

/* ================= PISO ================= */
function renderPiso(){
  if(!goalTotal()||!D.piso.fecha){$('#v-piso').innerHTML=`<div class="hello"><div class="lbl">Objetivo</div><h2>Mi piso</h2></div><div class="grp" style="padding-block:18px;display:flex;flex-direction:column;gap:12px"><div class="rt wrap" style="font-size:16px">Ponme el objetivo y te digo si llegas.</div><div class="lbl">La entrada (tu parte), los gastos de compra y la fecha.</div><button class="pill-pri" data-act="piso-edit">Poner objetivo</button></div><div class="grp" style="margin-top:12px">${navRow('hipoteca','Simulador de hipoteca','¿Qué cuota y qué piso te puedes permitir?',null)}${navRow('hist','Histórico','Ahorro y gasto mes a mes',null)}</div>`;return}
  const varM=U.sim.varM??budget(),ap=aportSum(),rb=U.sim.ret??(D.invs[0]?retFor(D.invs[0],'base'):6);
  $('#v-piso').innerHTML=`
  <div class="hello"><div class="lbl">Objetivo: ${dmy(D.piso.fecha)} · <button class="link" data-act="piso-edit" style="font-size:12.5px">Editar</button></div><h2>Mi piso</h2></div>
  <div id="piso-a" class="view"></div>
  <div class="grp" style="margin-top:4px">
    <button class="row" data-act="whatif"><div class="rm"><div class="rt">Probar escenarios</div><div class="rs">Gasto, aportación y rentabilidad</div></div><svg class="i chev" style="transform:rotate(${U.whatif?90:0}deg)"><use href="#i-chev"/></svg></button>
    <div ${U.whatif?'':'hidden'} style="padding-bottom:6px">
      <div class="sl"><div class="sl-h"><span>Gasto del día a día</span><b id="lb-var"></b></div><input type="range" id="sl-var" min="0" max="${Math.max(1500,Math.ceil(budget()*2/50)*50)}" step="10" value="${varM}" aria-label="Gasto del día a día al mes"></div>
      <div class="sl"><div class="sl-h"><span>Aportación a inversiones</span><b id="lb-ap"></b></div><input type="range" id="sl-ap" min="0" max="${Math.max(600,Math.ceil(ap*2/50)*50)}" step="25" value="${ap}" aria-label="Aportación mensual a inversiones"></div>
      <div class="sl"><div class="sl-h"><span>Rentabilidad de las inversiones</span><b id="lb-ret"></b></div><input type="range" id="sl-ret" min="0" max="12" step="0.5" value="${rb}" aria-label="Rentabilidad anual esperada"></div>
      <button class="link" id="sim-reset">Volver al plan</button>
    </div>
  </div>
  <div class="grp" style="margin-top:12px">
    ${navRow('hipoteca','Simulador de hipoteca','¿Qué cuota y qué piso te puedes permitir?',null)}
    ${navRow('pagos','Pagos a la promotora',D.pagos.length?D.pagos.length+' pagos':'Ninguno todavía',D.pagos.length?M(eur0(sum(D.pagos,p=>p.a))):null)}
    ${navRow('hitos','Hitos','Promos, préstamos, fin del plan…',null)}
    ${navRow('hist','Histórico','Ahorro y gasto mes a mes',null)}
  </div>`;
  updPiso();
}
function updPiso(){
  if(!$('#piso-a'))return;
  const G=goalStep(),HZ=horizonStep(),N=U.horizon==='plan'?Math.min(HZ,G):G;
  const base=simulate({steps:G}),malo=simulate({steps:G,sc:'malo'}),bueno=simulate({steps:G,sc:'bueno'});
  const endP=base.pts[G].piso,goal=goalTotal()||1,falta=goal-endP;
  const nowP=base.pts[0].piso,need=(goal-nowP)/G,avg=(endP-nowP)/G;
  if($('#lb-var')){$('#lb-var').textContent=eur0(base.varM)+'/mes';$('#lb-ap').textContent=eur0(aportSum())+'/mes';$('#lb-ret').textContent=fmt(U.sim.ret??(D.invs[0]?retFor(D.invs[0],'base'):6),1)+' %'}
  const hzLbl=HZ<G?`Hasta ${lab(HZ)}`:'Un año';
  $('#piso-a').innerHTML=`
  <div class="grp" style="padding-block:16px;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><span class="lbl">En la hucha hoy</span><span class="lbl">${Math.round(nowP/goal*100)} % de ${M(eur0(goal))}</span></div>
    <div class="big" style="font-size:40px" data-count="${nowP}">${M(bigNum(nowP))}</div>
    <div class="bar thin"><i style="width:${Math.min(100,nowP/goal*100)}%;background:var(--red2)"></i></div>
  </div>
  <div class="grp" style="padding-block:14px;display:flex;flex-direction:column;gap:10px">
    <div class="seg" id="hz-seg"><button data-hz="plan" class="${U.horizon==='plan'?'on':''}">${HZ<G?hzLbl:'Corto plazo'}</button><button data-hz="goal" class="${U.horizon==='goal'?'on':''}">Hasta la entrada</button></div>
    <div class="readout" id="readout"></div>
    <svg class="chart" id="chart" viewBox="0 0 340 210" role="img" aria-label="Proyección de la hucha del piso"></svg>
    <div class="lgd"><span style="--k:var(--red2)">Hucha del piso</span><span style="--k:var(--ivory)">Patrimonio</span>${U.horizon==='goal'?'<span style="--k:var(--warn)">Objetivo</span>':''}</div>
  </div>
  <p class="quote">«${falta>0?V.falta(eur0(falta)):V.llega(eur0(-falta))}»</p>
  <div class="grp">
    <div class="row"><div class="rm"><div class="rt">Necesitas ahorrar</div></div><div class="ra">${M(eur0(need))}/mes</div></div>
    <div class="row"><div class="rm"><div class="rt">Con este plan ahorras</div></div><div class="ra" style="color:${avg>=need?'var(--ok)':'var(--warn)'}">${M(eur0(avg))}/mes</div></div>
  </div>`;
  drawChart(base,malo,bueno,Math.max(1,N));
}
function hitos(b,G){
  const H=[];
  D.accounts.forEach(a=>{if(a.promoFin&&daysTo(a.promoFin)>=0)H.push({k:stepOf(a.promoFin)-.5,d:dm(a.promoFin),t:`Acaba la promo de ${a.alias}`,s:`Pasa del ${fmt(a.promoTae)} % al ${fmt(a.promoDesp??a.tae)} %`,c:'--warn',cal:'promo:'+a.id});
    if(a.venc&&daysTo(a.venc)>=0)H.push({k:stepOf(a.venc)-.5,d:dm(a.venc),t:`Vence ${a.alias}`,s:'Depósito a plazo',c:'--warn',cal:'venc:'+a.id})});
  D.loans.forEach(l=>{const e=b.ends[l.id];if(e)H.push({k:e,d:lab(e),t:`${l.nombre} liquidado`,s:`Liberas ${eur0(l.cuota)} al mes`,c:'--ok'})});
  D.pagos.forEach(p=>{if(p.fecha>=T.iso)H.push({k:stepOf(p.fecha),d:dm(p.fecha),t:p.n,s:`Pago a la promotora · ${eur0(p.a)}`,c:'--red2',cal:'pago:'+p.id})});
  D.extras.forEach(e=>{if(e.fecha>=T.iso)H.push({k:stepOf(e.fecha),d:dm(e.fecha),t:e.n,s:`Ingreso previsto · +${eur0(e.a)}`,c:'--c-capr'})});
  const HZ=stepOf('2027-12-31');if(HZ>=1&&HZ<=G)H.push({k:HZ,d:'31/12/27',t:'Fin del plan 2027',s:`Hucha ≈ ${eur0(b.pts[HZ].piso)} · patrimonio ≈ ${eur0(b.pts[HZ].nw)}`,c:'--ivory'});
  if(goalTotal()&&D.piso.fecha)H.push({k:G+.1,d:dm(D.piso.fecha),t:'Entrada del piso',s:`Hucha ≈ ${eur0(b.pts[G].piso)} de ${eur0(goalTotal())}`,c:'--red2',cal:'piso'});
  return H.filter(h=>h.k!=null&&h.k>=0&&h.k<=G+.1).sort((x,y)=>x.k-y.k);
}
function drawChart(B,L,H,N){
  const svg=$('#chart'),W=340,Ht=210,pl=36,pr=14,pt=14,pb=24;
  const b=B.pts.slice(0,N+1),lo=L.pts.slice(0,N+1),hi=H.pts.slice(0,N+1);
  const g29=U.horizon==='goal';
  let mx=Math.max(...hi.map(p=>p.nw),...b.map(p=>p.piso),g29?goalTotal():0,1000);
  const step=mx>200000?50000:mx>80000?20000:mx>30000?10000:mx>10000?5000:1000;mx=Math.ceil(mx*1.04/step)*step;
  let mn=Math.min(0,...lo.map(p=>p.nw),...b.map(p=>p.piso));mn=Math.floor(mn/step)*step;
  const x=i=>pl+(W-pl-pr)*i/N,y=v=>pt+(Ht-pt-pb)*(mx-v)/((mx-mn)||1);
  const line=(arr,f)=>arr.map((p,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(f(p)).toFixed(1)).join(' ');
  let g='';
  for(let v=mn;v<=mx;v+=step)g+=`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${pl-6}" y="${y(v)+3.5}" text-anchor="end">${v?(v/1000).toLocaleString('es-ES')+'K':'0'}</text>`;
  const bi=ymIdx(T.ym);const every=N>30?12:N>14?6:3;
  for(let i=0;i<=N;i++){const mo=(bi+i-1)%12;if(i===0||i===N||(i>1&&N-i>2&&mo%every===0))g+=`<text class="ax" x="${x(i)}" y="${Ht-6}" text-anchor="${i===0?'start':i===N?'end':'middle'}">${lab(i)}</text>`}
  const band=line(hi,p=>p.nw)+' '+lo.slice().reverse().map((p,j)=>'L'+x(N-j).toFixed(1)+' '+y(p.nw).toFixed(1)).join(' ')+'Z';
  const gl=g29&&goalTotal()?`<line class="gl" x1="${pl}" x2="${W-pr}" y1="${y(goalTotal())}" y2="${y(goalTotal())}"/><text class="glt" x="${pl+4}" y="${y(goalTotal())-5}">Objetivo ${fmt(goalTotal()/1000,0)}K</text>`:'';
  svg.classList.toggle('anim',!!U._anim);svg.innerHTML=`${g}<path class="band" d="${band}"/>${gl}<path class="lnw" pathLength="1" d="${line(b,p=>p.nw)}"/><path class="lpiso" pathLength="1" d="${line(b,p=>p.piso)}"/>
  <line class="cur" id="cur" x1="${x(N)}" x2="${x(N)}" y1="${pt}" y2="${Ht-pb}"/>
  <circle class="dnw" id="dn" r="4" cx="${x(N)}" cy="${y(b[N].nw)}"/><circle class="dpiso" id="dp" r="4.5" cx="${x(N)}" cy="${y(b[N].piso)}"/>
  <rect class="hit" id="hit" x="${pl}" y="0" width="${W-pl-pr}" height="${Ht}"/>`;
  const setI=i=>{$('#cur').setAttribute('x1',x(i));$('#cur').setAttribute('x2',x(i));$('#dn').setAttribute('cx',x(i));$('#dn').setAttribute('cy',y(b[i].nw));$('#dp').setAttribute('cx',x(i));$('#dp').setAttribute('cy',y(b[i].piso));
    $('#readout').innerHTML=`<span class="lbl">${i===0?'Hoy':'Fin de '+lab(i)} · hucha del piso</span><span class="mid" style="font-size:28px;color:var(--red2)">${M(eur0(b[i].piso))}</span><span class="lbl">Patrimonio <b class="num">${M(eur0(b[i].nw))}</b> · entre ${M(eur0(lo[i].nw))} y ${M(eur0(hi[i].nw))}</span>`};
  setI(N);
  const hit=$('#hit');const mv=ev=>{const r=svg.getBoundingClientRect();const px=(ev.clientX-r.left)/r.width*W;setI(Math.max(0,Math.min(N,Math.round((px-pl)/(W-pl-pr)*N))))};
  hit.addEventListener('pointermove',mv);hit.addEventListener('pointerdown',mv);hit.addEventListener('pointerleave',()=>setI(N));
}


/* ================= navegación ================= */
const R={hoy:renderHoy,pres:renderPres,dinero:renderDinero,piso:renderPiso};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(root){if(RM||!root)return;root.querySelectorAll('[data-count]').forEach(el=>{const to=+el.dataset.count,v=el.querySelector('.v');if(!v||isNaN(to))return;const t0=performance.now(),d=750;const stp=t=>{const k=Math.max(0,Math.min(1,(t-t0)/d)),e=1-Math.pow(1-k,3);v.innerHTML=bigNum(to*e);if(k<1)requestAnimationFrame(stp)};requestAnimationFrame(stp)})}
function syncBell(){if(!D)return;$('#btn-bell').classList.toggle('has',avisos().length>0)}
function go(t){if(!D)return;U.tab=t;U._anim=true;$$('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));['hoy','pres','dinero','piso'].forEach(v=>$('#v-'+v).hidden=v!==t);const v=$('#v-'+t);R[t]();U._anim=false;v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter');countUp(v);$('#views').scrollTop=0;syncBell()}
function rr(){if(!D)return;const sc=$('#views').scrollTop;const v=$('#v-'+U.tab);v.classList.remove('enter');R[U.tab]();$('#views').scrollTop=sc;syncBell()}
function touch(){save();const c=document.querySelector('.cloud svg');if(c){c.classList.remove('sync');void c.getBoundingClientRect();c.classList.add('sync')}}
const ago=t=>{const s=Math.round((Date.now()-t)/1000);return s<10?'ahora mismo':s<60?'hace '+s+' s':s<3600?'hace '+Math.round(s/60)+' min':s<86400?'hace '+Math.round(s/3600)+' h':'el '+dmy(isoD(new Date(t)))};
async function cloudTick(){
  try{CLOUD=await cloudMeta()}catch(e){CLOUD={}}
  const el=$('#cloud-t');if(el&&D){
    el.parentElement.classList.toggle('bad',!!(ghOn()&&CLOUD.err));
    el.textContent=!ghOn()?'Sin copia en la nube · configúrala en Ajustes':CLOUD.err?'La copia en la nube falla · mira Ajustes':CLOUD.pending||cloudDirty?'Copia cifrada pendiente de subir…':CLOUD.lastOk?'Copia cifrada en la nube · '+ago(CLOUD.lastOk):'Copia en la nube: aún sin subir'}
  syncBell();
}

/* ================= hojas y toast ================= */
let openSheet=null;
function open(id){const n=$(id);if(openSheet&&openSheet!==n){openSheet.classList.remove('on');openSheet.inert=true}openSheet=n;n.inert=false;n.classList.add('on');n.scrollTop=0;$('#scrim').classList.add('on')}
function close(){$('#btn-add').classList.remove('open');if(!openSheet)return;openSheet.classList.remove('on');openSheet.inert=true;openSheet=null;$('#scrim').classList.remove('on')}
let tT,undoFn=null;
function toast(msg,undo){$('#toast-t').textContent=msg;undoFn=undo||null;$('#toast-undo').hidden=!undo;$('#toast').classList.add('on');clearTimeout(tT);tT=setTimeout(()=>{$('#toast').classList.remove('on');undoFn=null},undo?5500:3600)}
function busy(on,txt){const b=$('#busy');b.querySelector('span').textContent=txt||'Un momento…';b.classList.toggle('on',!!on)}

/* ================= fichas ================= */
const accOpts=()=>[['','—'],...D.accounts.map(a=>[a.id,a.alias])];
const F={
  acc:[{g:'Básico'},{k:'alias',l:'Alias',t:'text',req:1,ph:'Ej.: Hucha piso'},{k:'bank',l:'Entidad',t:'text',req:1},{k:'col',l:'Color',t:'color'},{k:'tipo',l:'Tipo',t:'sel',o:['Corriente','Remunerada','Ahorro','Efectivo en broker','Depósito a plazo']},{k:'uso',l:'Para qué la usas',t:'text'},
    {g:'Saldo'},{k:'bal',l:'Saldo',t:'num',suf:'€',req:1},{k:'fecha',l:'Fecha del saldo',t:'date'},
    {g:'Remuneración'},{k:'tae',l:'TAE',t:'num',suf:'%',req:1},{k:'liq',l:'Pago de intereses',t:'sel',o:['Mensual','Trimestral','Anual','No paga']},{k:'max',l:'Saldo máx. remunerado',t:'num',suf:'€'},{k:'cond',l:'Comisiones y condiciones',t:'text'},
    {g:'Promo'},{k:'promoTae',l:'TAE de la promo',t:'num',suf:'%'},{k:'promoFin',l:'Fecha de fin',t:'date'},{k:'promoDesp',l:'TAE después',t:'num',suf:'%'},
    {g:'Depósito'},{k:'venc',l:'Vencimiento',t:'date'},
    {g:'En la app'},{k:'piso',l:'Cuenta para el piso',t:'tog'},{k:'destino',l:'Aquí va el ahorro del mes',t:'tog'}],
  loan:[{g:'Básico'},{k:'nombre',l:'Nombre',t:'text',req:1},{k:'entidad',l:'Entidad',t:'text',req:1},{k:'tipo',l:'Tipo',t:'sel',o:['Personal','Coche','Consumo','Estudios','Otro']},
    {g:'Importe'},{k:'capIni',l:'Capital inicial',t:'num',suf:'€'},{k:'firma',l:'Fecha de firma',t:'date'},{k:'pend',l:'Pendiente hoy',t:'num',suf:'€',req:1},
    {g:'Condiciones'},{k:'tin',l:'TIN',t:'num',suf:'%',req:1},{k:'tae',l:'TAE',t:'num',suf:'%'},{k:'cuota',l:'Cuota mensual',t:'num',suf:'€',req:1},{k:'dia',l:'Día de cargo',t:'int'},{k:'cuenta',l:'Se paga desde',t:'sel',o:accOpts},{k:'fin',l:'Fecha de fin (contrato)',t:'date'},{k:'comAmort',l:'Comisión por amortizar',t:'num',suf:'%'},
    {g:'Bonificaciones'},{k:'tinSin',l:'TIN sin bonificar',t:'num',suf:'%'},{k:'bonif',l:'Qué te piden',t:'text',ph:'Nómina, seguro…'},
    {g:'Notas'},{k:'notas',l:'Notas',t:'text'}],
  inv:[{g:'Producto'},{k:'producto',l:'Producto',t:'text',req:1},{k:'broker',l:'Broker',t:'text',req:1},{k:'isin',l:'ISIN',t:'text'},{k:'tipo',l:'Tipo',t:'sel',o:['ETF','Fondo','Acciones','Plan de pensiones','Otro']},
    {g:'Valor'},{k:'part',l:'Participaciones',t:'num'},{k:'valor',l:'Valor actual',t:'num',suf:'€',req:1},{k:'aportado',l:'Total aportado',t:'num',suf:'€'},
    {g:'Aportación periódica'},{k:'aport',l:'Importe al mes',t:'num',suf:'€'},{k:'dia',l:'Día',t:'int'},{k:'origen',l:'Desde la cuenta',t:'sel',o:accOpts},{k:'ter',l:'Comisión anual (TER)',t:'num',suf:'%'},
    {g:'Rentabilidad esperada (anual)'},{k:'rMalo',l:'Escenario malo',t:'num',suf:'%'},{k:'rBase',l:'Escenario base',t:'num',suf:'%',req:1},{k:'rBueno',l:'Escenario bueno',t:'num',suf:'%'}],
  fix:[{k:'n',l:'Concepto',t:'text',req:1},{k:'sub',l:'Detalle',t:'text'},{k:'a',l:'Importe al mes',t:'num',suf:'€',req:1},{k:'dia',l:'Día de cargo',t:'int'}],
  anu:[{k:'n',l:'Concepto',t:'text',req:1},{k:'a',l:'Importe al año',t:'num',suf:'€',req:1},{k:'mes',l:'Mes en que se paga',t:'sel',o:()=>MESL.map((m,i)=>[i,m])}],
  ext:[{k:'n',l:'Concepto',t:'text',req:1},{k:'a',l:'Importe',t:'num',suf:'€',req:1},{k:'fecha',l:'Fecha',t:'date',req:1}],
  cat:[{k:'n',l:'Nombre',t:'text',req:1},{k:'lim',l:'Límite al mes',t:'num',suf:'€',req:1},{k:'ic',l:'Icono',t:'sel',o:ICONS}],
  mov:[{k:'t',l:'Concepto',t:'text',req:1},{k:'a',l:'Importe',t:'num',suf:'€',req:1},{k:'cat',l:'Categoría',t:'sel',o:()=>D.cats.filter(c=>c.id!=='comun').map(c=>[c.id,c.n])},{k:'date',l:'Fecha',t:'date',req:1},{k:'com',l:'¿Es común?',t:'sel',o:[['','No, es mío'],['pend','Sí, me lo cojo de la común'],['ok','Sí, ya me lo he cogido'],['yo','Sí, lo asumo yo']]}],
  inc:[{k:'income',l:'Nómina neta al mes',t:'num',suf:'€',req:1}],
  pago:[{k:'n',l:'Concepto',t:'text',req:1,ph:'Ej.: Pago a cuenta 1'},{k:'a',l:'Importe',t:'num',suf:'€',req:1},{k:'fecha',l:'Fecha',t:'date',req:1}],
  piso:[{k:'entrada',l:'Entrada (tu parte)',t:'num',suf:'€',req:1},{k:'gastos',l:'Gastos de compra (tu parte)',t:'num',suf:'€'},{k:'fecha',l:'Fecha objetivo',t:'date',req:1}],
  name:[{k:'name',l:'Cómo te llamo',t:'text'}],
  hman:[{k:'ym',l:'Mes',t:'month',req:1},{k:'ing',l:'Ingresos del mes',t:'num',suf:'€',req:1},{k:'gast',l:'Gastos totales del mes',t:'num',suf:'€',req:1},{k:'inv',l:'De lo ahorrado, a inversiones',t:'num',suf:'€'},{k:'nw',l:'Patrimonio al cierre',t:'num',suf:'€',neg:1}]
};
const numIn=v=>v==null||v===''?'':String(v).replace('.',',');
function fieldHTML(f,o){
  if(f.g)return `<div class="fgroup">${f.g}</div>`;
  const id='f-'+f.k,v=o[f.k],L=`<span>${f.l}${f.req?' <em>*</em>':''}</span>`;
  if(f.t==='text')return `<label class="ff" for="${id}">${L}<input id="${id}" value="${esc(v??'')}" placeholder="${esc(f.ph||'')}" autocomplete="off"></label>`;
  if(f.t==='num'||f.t==='int')return `<label class="ff" for="${id}">${L}<span class="inw"><input id="${id}" inputmode="${f.t==='int'?'numeric':'decimal'}" value="${numIn(v)}" placeholder="—" style="width:130px"${f.neg?' data-neg="1"':''}>${f.suf?`<i>${f.suf}</i>`:''}</span></label>`;
  if(f.t==='date')return `<label class="ff" for="${id}">${L}<input id="${id}" type="date" value="${v||''}"></label>`;
  if(f.t==='month')return `<label class="ff" for="${id}">${L}<input id="${id}" type="month" value="${v||''}" max="${ymAdd(T.ym,-1)}"></label>`;
  if(f.t==='sel'){const opts=(typeof f.o==='function'?f.o():f.o).map(x=>Array.isArray(x)?x:[x,x]);return `<label class="ff" for="${id}">${L}<select id="${id}">${opts.map(([a,b])=>`<option value="${esc(a)}" ${String(v??'')===String(a)?'selected':''}>${esc(b)}</option>`).join('')}</select></label>`}
  if(f.t==='tog')return `<div class="ff"><span>${f.l}</span><button class="sw-row" style="width:auto" id="${id}" aria-pressed="${!!v}" data-tog aria-label="${f.l}"><span class="sw"></span></button></div>`;
  if(f.t==='color')return `<div class="ff"><span>${f.l}</span><div class="colors" id="${id}" data-val="${v||COLORS[0]}">${COLORS.map(c=>`<button type="button" style="--k:${c}" data-col="${c}" class="${c===(v||COLORS[0])?'on':''}" aria-label="Color ${c}"></button>`).join('')}</div></div>`;
  return '';
}
function readForm(fields,o){
  let bad=null;
  fields.forEach(f=>{if(f.g)return;const el=$('#f-'+f.k);if(!el)return;let v;
    if(f.t==='num'||f.t==='int'){v=num(el.value);if(f.t==='int'&&v!=null)v=Math.round(v)}
    else if(f.t==='tog')v=el.getAttribute('aria-pressed')==='true';
    else if(f.t==='color')v=el.dataset.val;
    else if(f.t==='sel'){v=el.value;if(f.k==='mes')v=+v}
    else v=el.value.trim();
    const empty=v==null||v==='';
    const wrap=el.closest('.ff');if(wrap)wrap.classList.toggle('err',!!(f.req&&empty));
    if(f.req&&empty&&!bad)bad=f.l;
    o[f.k]=v;
  });
  return bad;
}
function openForm({title,fields,obj,isNew,onSave,onDelete,top='',check}){
  const tmp={...obj};const back=openSheet&&openSheet.id==='sh-sub'?U.curSh:null;
  const after=()=>{if(back&&SH[back]){U.curSh=back;SH[back]()}else close()};
  $('#sh-form').innerHTML=`<div class="grab"></div><div class="sh-h"><h3>${esc(title)}</h3><button class="x" data-close aria-label="Cerrar">${ico('x')}</button></div>${top}
  <div class="card" style="padding-block:2px 6px">${fields.map(f=>fieldHTML(f,obj)).join('')}</div>
  ${fields.some(f=>f.req)?'<div class="lbl" style="margin-top:-4px">Lo marcado con <span style="color:var(--red2)">*</span> es obligatorio. El resto, cuando quieras.</div>':''}
  <button class="cta" id="form-save">${isNew?'Añadir':'Guardar'}</button>${onDelete?'<button class="cta danger" id="form-del">Borrar</button>':''}`;
  $('#form-save').onclick=()=>{const bad=readForm(fields,tmp);if(bad){toast('Falta: '+bad.toLowerCase()+'.');return}if(check){const e=check(tmp);if(e){toast(e);return}}onSave(tmp);after();touch();rr();toast(isNew?'Añadido.':'Guardado.')};
  if(onDelete){let armed=false;$('#form-del').onclick=e=>{if(!armed){armed=true;e.currentTarget.textContent='Toca otra vez para borrar';setTimeout(()=>{armed=false;const b=$('#form-del');if(b)b.textContent='Borrar'},3000);return}const undo=onDelete();after();touch();rr();toast('Borrado.',undo)}}
  open('#sh-form');
}
function listDel(arr,item){const i=arr.indexOf(item);if(i<0)return()=>{};arr.splice(i,1);return()=>{arr.splice(i,0,item);save()}}

function editAcc(a){const isNew=!a;a=a||{id:uid(),alias:'',bank:'',col:COLORS[D.accounts.length%COLORS.length],tipo:'Corriente',bal:null,fecha:T.iso,tae:0,liq:'Mensual',piso:!D.accounts.length,destino:!D.accounts.length};
  openForm({title:isNew?'Nueva cuenta':a.alias,fields:F.acc,obj:a,isNew,onSave:o=>{if(o.destino)D.accounts.forEach(x=>x.destino=false);Object.assign(a,o);if(isNew)D.accounts.push(a);if(!D.accounts.some(x=>x.destino)&&D.accounts[0])D.accounts[0].destino=true},onDelete:isNew?null:()=>listDel(D.accounts,a)})}
function editLoan(l){const isNew=!l;l=l||{id:uid(),nombre:'',entidad:'',tipo:'Personal',pend:null,tin:null,cuota:null,dia:1,cuenta:D.accounts[0]?.id||''};
  let top='';if(!isNew&&l.cuota){const a=amort(l);const months=l.firma?Math.max(0,(T.y-+l.firma.slice(0,4))*12+(T.m+1-+l.firma.slice(5,7))):null;const paidInt=(l.capIni&&months!=null)?Math.max(0,l.cuota*months-(l.capIni-l.pend)):null;
    top=`<div class="calc"><div><span class="lbl">Intereses pendientes</span><b>${M(eur(a.tot))}</b></div><div><span class="lbl">Intereses pagados</span><b>${paidInt!=null?M(eur(paidInt)):'—'}</b></div><div><span class="lbl">Fin real</span><b>${a.n?lab(a.n):'—'}</b></div><div><span class="lbl">Cuotas que quedan</span><b>${a.rows.length}</b></div></div>
    ${a.rows.length&&a.rows[a.rows.length-1].p>0.01?'<div class="lbl" style="color:var(--over)">Ojo: con esta cuota no se cubren ni los intereses. Revisa cuota y TIN.</div>':''}
    <div class="grp" style="padding-block:14px;display:flex;flex-direction:column;gap:10px"><div class="lbl">¿Y si amortizas algo extra hoy?</div><div class="pills">${[0,250,500,1000,2000].map(x=>`<button class="pill ${(U.loanExtra[l.id]||0)===x?'on':''}" data-extra="${x}" data-lid="${l.id}">${x?'+'+eur0(x):'Nada'}</button>`).join('')}</div><div id="loan-sim">${loanSim(l)}</div></div>
    <div class="card" style="padding:10px 12px;overflow-x:auto"><div class="lbl" style="margin-bottom:4px">Cuadro de amortización</div><table class="tbl"><thead><tr><th>Mes</th><th>Cuota</th><th>Interés</th><th>Capital</th><th>Pendiente</th></tr></thead><tbody>${a.rows.map(r=>`<tr><td>${lab(r.k)}</td><td>${M(fmt(r.c))}</td><td>${M(fmt(r.it))}</td><td>${M(fmt(r.cap))}</td><td>${M(fmt(r.p))}</td></tr>`).join('')}</tbody></table></div>`}
  openForm({title:isNew?'Nuevo préstamo':l.nombre,fields:F.loan,obj:l,isNew,top,onSave:o=>{Object.assign(l,o);if(isNew)D.loans.push(l)},onDelete:isNew?null:()=>listDel(D.loans,l)})}
function loanSim(l){const ex=U.loanExtra[l.id]||0,a0=amort(l),a1=amort(l,ex),com=ex*(l.comAmort||0)/100;return `<div class="kv"><div><span class="lbl">Acabas en</span><b>${a1.n?lab(a1.n):'ya'}</b></div><div><span class="lbl">Meses antes</span><b>${a0.n-a1.n}</b></div><div><span class="lbl">Ahorro neto</span><b>${M(eur(a0.tot-a1.tot-com))}</b></div></div>${ex&&l.comAmort?`<div class="rs" style="margin-top:6px">Ya descontada la comisión (${fmt(l.comAmort,1)} %: ${eur(com)}).</div>`:''}`}
function editInv(i){const isNew=!i;i=i||{id:uid(),producto:'',broker:'',tipo:'ETF',valor:null,aport:0,rBase:6,rMalo:1,rBueno:10};
  const ix=D.invs.indexOf(i);const top=isNew?'':`<div class="grp" style="padding-block:14px;display:flex;flex-direction:column;gap:12px"><div class="kv"><div><span class="lbl">A ${lab(horizonStep())}</span><b>${M(eur0(simInvAt(ix,horizonStep())))}</b></div><div><span class="lbl">${goalTotal()?'A la entrada':'En 2 años'}</span><b>${M(eur0(simInvAt(ix,goalStep())))}</b></div><div><span class="lbl">Malo/base/bueno</span><b>${fmt(retFor(i,'malo'),0)}/${fmt(retFor(i,'base'),0)}/${fmt(retFor(i,'bueno'),0)} %</b></div></div></div>`;
  openForm({title:isNew?'Nueva inversión':i.producto,fields:F.inv,obj:i,isNew,top,onSave:o=>{Object.assign(i,o);if(isNew)D.invs.push(i)},onDelete:isNew?null:()=>listDel(D.invs,i)})}
function editSimple(kind,arr,item,title,dflt){const isNew=!item;item=item||{id:uid(),...dflt};
  openForm({title:isNew?title:(item.n||title),fields:F[kind],obj:item,isNew,onSave:o=>{Object.assign(item,o);if(isNew)arr.push(item)},onDelete:isNew?null:()=>listDel(arr,item)})}
function editMov(m){openForm({title:'Gasto',fields:F.mov,obj:{...m,com:m.com||''},check:o=>o.date>T.iso?'La fecha no puede ser futura.':null,onSave:o=>{Object.assign(m,o);if(!o.com)delete m.com},onDelete:()=>listDel(D.movs,m)})}
function editCat(c){const isNew=!c;c=c||{id:uid(),n:'',lim:null,ic:'dots',c:CATC[D.cats.length%CATC.length]};
  openForm({title:isNew?'Nueva categoría':c.n,fields:F.cat,obj:c,isNew,onSave:o=>{Object.assign(c,o);if(isNew)D.cats.splice(D.cats.length-1,0,c)},onDelete:(isNew||c.id==='otros'||c.id==='comun')?null:()=>{const moved=D.movs.filter(m=>m.cat===c.id);moved.forEach(m=>m.cat='otros');const u=listDel(D.cats,c);return()=>{u();moved.forEach(m=>m.cat=c.id);save()}}})}
function editHistMan(){openForm({title:'Mes anterior a mano',fields:F.hman,obj:{ym:'',ing:null,gast:null,inv:null,nw:null},isNew:true,
  check:o=>!/^\d{4}-\d{2}$/.test(o.ym)?'Elige el mes.':o.ym>=T.ym?'Solo meses ya cerrados.':D.hist.some(h=>h.ym===o.ym)?'Ese mes ya está en el histórico.':null,
  onSave:o=>{D.hist.push({ym:o.ym,ing:o.ing,fijos:0,dia:o.gast,pres:0,anu:0,nota:'',inv:o.inv||0,cats:{},nw:o.nw??null,piso:null,manual:true});D.hist.sort((a,b)=>a.ym<b.ym?-1:1)}})}

/* ================= apuntar gasto ================= */
let amt='',selCat='fuera',com=false,comMode='pend';
function drawAmt(){const el=$('#amt');if(!amt){el.className='big zero';el.innerHTML='0<span class="dec">,00 €</span>'}else{const [i,d]=amt.split(',');el.className='big';el.innerHTML=`${grp(i||'0')}<span class="dec">${amt.includes(',')?','+(d||''):''} €</span>`}$('#add-save').disabled=!(parseFloat(amt.replace(',','.'))>0)}
function drawCats(){if(!D.cats.some(c=>c.id===selCat))selCat=(D.cats.find(c=>c.id!=='comun')||D.cats[0]).id;$('#add-cats').innerHTML=D.cats.filter(c=>c.id!=='comun').map(c=>`<button class="cat-b ${c.id===selCat?'on':''}" data-c="${c.id}" style="--c:var(${c.c})">${ico(c.ic)}<span>${esc(c.n)}</span></button>`).join('');const on=$('#add-cats .on');if(on)on.scrollIntoView({inline:'center',block:'nearest'})}
function drawCom(){$('#add-com').setAttribute('aria-pressed',com);$('#add-com-mode').hidden=!com;$$('#add-com-mode button').forEach(b=>b.classList.toggle('on',b.dataset.cm===comMode))}
function drawFavs(){const f=frecuentes();$('#add-favs').hidden=!f.length;$('#add-favs').innerHTML=f.map((x,i)=>`<button class="fav" data-fav="${i}"><span class="cdot" style="--c:var(${catBy(x.cat).c});margin:0"></span>${esc(x.t)} <b>${fmt(x.a)}</b></button>`).join('')}
function openAdd(){amt='';com=false;comMode='pend';$('#add-note').value='';const d=$('#add-date');d.value=T.iso;d.max=T.iso;drawAmt();drawCats();drawCom();drawFavs();open('#sh-add');$('#btn-add').classList.add('open')}
function saveAdd(){
  const v=parseFloat(amt.replace(',','.'));if(!(v>0))return;const c=catBy(selCat);
  let date=$('#add-date').value||T.iso;if(date>T.iso)date=T.iso;
  const {m,msg}=addMov($('#add-note').value.trim()||c.n,c.id,v,com?comMode:null,date);
  close();touch();rr();toast(msg,undoMov(m));
}

/* ================= calculadora compartida ================= */
let padIn=null,padS='',padInt=false,padFresh=false,padSuf='';
const PADKEYS=['1','2','3','4','5','6','7','8','9',',','0','del'];
function padify(root){(root||document).querySelectorAll('input[inputmode="decimal"],input[inputmode="numeric"]').forEach(i=>{if(i.closest('#sh-pad')||i.dataset.nopad!=null)return;i.readOnly=true;i.classList.add('padin')})}
function drawPad2(){const [i,d]=padS.split(',');$('#pad2-d').className='big'+(padS&&!padFresh?'':' zero');$('#pad2-d').innerHTML=`${grp(i||'0')}<span class="dec">${padS.includes(',')?','+(d||''):''}${padSuf?' '+padSuf:''}</span>`}
function padOpen(inp){padIn=inp;padInt=inp.getAttribute('inputmode')==='numeric';const ff=inp.closest('.ff');const sp=ff&&ff.querySelector(':scope>span');
  $('#pad2-t').textContent=((sp&&sp.textContent)||inp.getAttribute('aria-label')||'Importe').replace('*','').trim();
  const suf=inp.parentElement&&inp.parentElement.querySelector('i');padSuf=suf?suf.textContent:(inp.classList.contains('lim-in')?'€':'');
  padS=inp.value.replace(/\./g,'').replace(/\s/g,'');if(padS==='—'||padS==='0'||padS==='0,00')padS='';
  $('#pad2').querySelector('[data-k=","]').style.visibility=padInt?'hidden':'visible';
  $('#pad2-neg').hidden=!inp.dataset.neg;
  padFresh=!!padS;drawPad2();$('#sh-pad').inert=false;$('#sh-pad').classList.add('on');$('#scrim2').classList.add('on')}
function padClose(){$('#sh-pad').classList.remove('on');$('#sh-pad').inert=true;$('#scrim2').classList.remove('on');padIn=null}
function padKey(k){
  if(padFresh){padFresh=false;padS='';if(k==='del'){drawPad2();return}}
  if(k==='del')padS=padS.slice(0,-1);else if(k===','){if(!padInt&&!padS.includes(','))padS=(padS||'0')+','}
  else if(k==='neg'){padS=padS.startsWith('-')?padS.slice(1):'-'+padS}
  else{const d=padS.split(',')[1];if(d!==undefined&&d.length>=2)return;if(!padS.includes(',')&&padS.replace(/^-?0?/,'').length>=7)return;padS=(padS==='0'?'':padS)+k}drawPad2()}

/* ================= cuadre ================= */
function openCuadre(){
  if(!D.accounts.length&&!D.invs.length&&!D.loans.length){toast('Primero añade alguna cuenta en Dinero.');return}
  const rows=[...D.accounts.map(a=>[`cq-a-${a.id}`,a.alias,a.bal]),...D.invs.flatMap(i=>[[`cq-i-${i.id}`,i.producto+' · valor',i.valor],[`cq-ia-${i.id}`,i.producto+' · total aportado',i.aportado]]),...D.loans.map(l=>[`cq-l-${l.id}`,l.nombre+' · pendiente',l.pend])];
  sheet('Cuadre del mes',`<div class="lbl" style="margin-top:-4px">Abre la app de cada banco y pon lo que dice. Las proyecciones arrancan desde aquí y el histórico usa el cuadre del día 1 para pillar lo que no apuntas.</div>
  <div class="card" style="padding-block:2px">${rows.map(([id,l,v])=>`<label class="ff" for="${id}"><span>${esc(l)}</span><span class="inw"><input id="${id}" inputmode="decimal" data-neg="1" value="${numIn(v==null?'':(+v).toFixed(2))}" placeholder="—" style="width:130px"><i>€</i></span></label>`).join('')}</div>
  <button class="cta" id="cq-file">Guardar y copia en iCloud Drive</button>
  <button class="cta ghost" id="cq-save">Solo guardar</button>`);
  const doSave=()=>{const pv=id=>num($('#'+id).value);
    D.accounts.forEach(a=>{const v=pv('cq-a-'+a.id);if(v!=null){a.bal=v;a.fecha=T.iso}});
    D.invs.forEach(i=>{const v=pv('cq-i-'+i.id);if(v!=null)i.valor=v;const w=pv('cq-ia-'+i.id);if(w!=null)i.aportado=w});
    D.loans.forEach(l=>{const v=pv('cq-l-'+l.id);if(v!=null)l.pend=v});
    const c={date:T.iso,cash:+cashNow().toFixed(2),loans:+debtNow().toFixed(2),invAport:+sum(D.invs,i=>i.aportado||0).toFixed(2)};
    const hp=D.hist.find(h=>h.ym===ymAdd(T.ym,-1)&&!h.manual);if(hp&&T.d<=10)Object.assign(hp,nwParts(),{nwQ:true});
    D.cuadres=D.cuadres.filter(x=>x.date!==T.iso);D.cuadres.push(c);D.cuadres.sort((a,b)=>a.date<b.date?-1:1);if(D.cuadres.length>60)D.cuadres.splice(0,D.cuadres.length-60);
    close();touch();rr()};
  $('#cq-save').onclick=()=>{doSave();toast(V.cuadre)};
  $('#cq-file').onclick=async()=>{doSave();await flush();exportFile()};
}

/* ================= PIN en hojas (cambiar PIN, ver frase) ================= */
function pinPad(id){return `<div class="pinbox"><div class="dots" id="${id}-dots">${'<i></i>'.repeat(6)}</div><div class="lbl" id="${id}-msg">&nbsp;</div><div class="pad pinpad" id="${id}-pad">${['1','2','3','4','5','6','7','8','9','','0','del'].map(k=>k?`<button data-p="${k}" aria-label="${k==='del'?'Borrar':k}">${k==='del'?ico('back'):`<span class="num">${k}</span>`}</button>`:'<span></span>').join('')}</div></div>`}
function bindPin(id,onFull){let pin='';const dots=()=>$$(`#${id}-dots i`).forEach((d,i)=>d.classList.toggle('f',i<pin.length));
  const ctl={reset(msg){pin='';dots();if(msg!=null){$('#'+id+'-msg').textContent=msg;const d=$('#'+id+'-dots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake')}},msg(t){$('#'+id+'-msg').textContent=t},busy:false};
  $('#'+id+'-pad').onclick=e=>{const b=e.target.closest('[data-p]');if(!b||ctl.busy)return;const k=b.dataset.p;if(k==='del')pin=pin.slice(0,-1);else if(pin.length<6)pin+=k;dots();if(pin.length===6){const p=pin;setTimeout(()=>onFull(p,ctl),120)}};
  return ctl}
async function checkPin(p){try{await unwrapSecret(VAULT.wraps.pin,p);return true}catch(e){return false}}
function askPin(title,lead,then){
  sheet(title,`<div class="lbl" style="margin-top:-4px">${lead}</div>${pinPad('ap')}`);
  bindPin('ap',async(p,c)=>{c.busy=true;c.msg('Comprobando…');const f=await failsGet();if(f.until>Date.now()){c.busy=false;c.reset('Demasiados intentos. Espera un poco.');return}
    const ok=await checkPin(p);c.busy=false;if(!ok){await failsAdd();c.reset('PIN incorrecto');return}await failsReset();then(p)});
}
function changePin(){
  askPin('Cambiar PIN','Primero, tu PIN actual.',()=>{
    sheet('PIN nuevo',`<div class="lbl" style="margin-top:-4px">Elige 6 cifras. Nada de 123456 ni tu cumpleaños, figura.</div>${pinPad('np')}`);
    let first=null;bindPin('np',async(p,c)=>{if(!first){if(/^(\d)\1{5}$/.test(p)||'0123456789'.includes(p)||'9876543210'.includes(p)){c.reset('Demasiado fácil. Otro.');return}first=p;c.reset();c.msg('Repítelo');return}
      if(p!==first){first=null;c.reset('No coinciden. Empieza otra vez.');return}
      c.busy=true;c.msg('Cifrando…');await setPin(p);close();toast('PIN cambiado.')});
  });
}
function showPhrase(){askPin('Frase de recuperación','Pon tu PIN para verla.',()=>{
  const w=(D.phrase||'').split(' ');
  sheet('Frase de recuperación',`<div class="lbl" style="margin-top:-4px">Estas 12 palabras abren tus copias. Tenlas en la app Contraseñas y en ningún sitio más.</div><div class="phrase">${w.map((x,i)=>`<span><i>${i+1}</i>${esc(x)}</span>`).join('')}</div><button class="cta ghost" id="ph-copy">Copiar</button>`);
  $('#ph-copy').onclick=async()=>{try{await navigator.clipboard.writeText(D.phrase);toast('Copiada. Pégala en Contraseñas y luego copia otra cosa para borrarla del portapapeles.')}catch(e){toast('No se ha podido copiar.')}};
})}

/* ================= ajustes ================= */
function sw(id,on,label,sub){return `<button class="set-row" id="${id}" aria-pressed="${!!on}"><span class="rm"><span style="font-size:15px">${label}</span>${sub?`<div class="rs">${sub}</div>`:''}</span><span class="sw"></span></button>`}
function row(id,label,sub,val,cls=''){return `<button class="set-row" ${id?`id="${id}"`:''}><span class="rm"><span style="font-size:15px">${label}</span>${sub?`<div class="rs">${sub}</div>`:''}</span><span class="val ${cls}">${val||''}</span></button>`}
const AUTOL=[[0,'Al salir'],[60,'Al minuto'],[300,'A los 5 minutos']];
async function openSettings(){
  await cloudTick();
  const face=!!(VAULT&&VAULT.wraps.prf),cloudV=!ghOn()?['Sin configurar','warn']:CLOUD.err?['Falla','warn']:CLOUD.lastOk?['Al día · '+ago(CLOUD.lastOk),'ok']:['Pendiente','warn'];
  $('#sh-set').innerHTML=`<div class="grab"></div><div class="sh-h"><h3>Ajustes</h3><button class="x" data-close aria-label="Cerrar">${ico('x')}</button></div>
  <div class="h-lbl">Seguridad</div>
  <div class="card tight">${sw('s-face',face,'Desbloqueo con Face ID','Face ID abre el cifrado de los datos')}${row('s-pin','PIN','6 cifras, por si falla Face ID','Cambiar')}${row('s-phrase','Frase de recuperación','Para las copias y para un móvil nuevo','Ver')}${row('s-auto','Bloqueo automático','',(AUTOL.find(x=>x[0]===D.settings.autoLock)||AUTOL[0])[1])}${row('s-lock','Bloquear ahora','','')}</div>
  <div class="h-lbl">Privacidad</div>
  <div class="card tight">${sw('s-disc',U.discreet,'Modo discreto','También tocando la cifra grande de Hoy')}${sw('s-odisc',D.settings.discreetOnOpen,'Abrir siempre en modo discreto','')}${sw('s-shake',D.settings.shake,'Agitar para modo discreto','iOS te pedirá permiso de movimiento')}</div>
  <div class="h-lbl">Copias</div>
  <div class="card tight">${row('s-cloud','Copia cifrada en la nube','Repositorio privado de GitHub · sube cada cambio',cloudV[0],cloudV[1])}${row('s-vers','Versiones en la nube','Vuelve a cómo estaba todo cualquier día','')}${row('s-snap','Instantáneas en este iPhone','7 diarias, 4 semanales y antes de cada restauración','Ver')}${row('s-file','Archivo en iCloud Drive','Copia cifrada independiente',D.lastFile?dmy(D.lastFile):'Nunca',D.lastFile&&daysTo(D.lastFile)>=-35?'':'warn')}${row('s-imp','Importar un archivo de copia','Sustituye los datos (antes guarda una instantánea)','')}${row('s-sim','Simulacro de restauración','Comprueba que la copia y tu frase funcionan',D.simOk?'Hecho '+dmy(D.simOk):'Pendiente',D.simOk?'ok':'warn')}</div>
  <div class="h-lbl">Cálculos</div>
  <div class="card tight">${sw('s-net',D.settings.net,'Intereses en neto','Descuenta el 19 % de retención a los intereses de las cuentas')}</div>
  <div class="h-lbl">Tú</div>
  <div class="card tight">${row('s-name','Nombre',"Para el saludo",esc(D.profile.name||'—'))}${row('','Modo cuñado castizo','Fijo. Aquí se vacila fuerte.','')}</div>
  <div class="h-lbl">App</div>
  <div class="card tight">${row('s-upd','Versión '+APP_VER,'Buscar actualización','')}${row('s-help','Cómo funcionan las copias','','')}</div>
  <div class="h-lbl" style="color:var(--over)">Zona peligrosa</div>
  <div class="card danger-zone">
    <div class="rs" style="font-size:13px">Borra todos los datos de este iPhone, también las instantáneas. ${ghOn()?'Antes se sube una copia cifrada a la nube, por si acaso.':'<b style="color:var(--over)">No tienes copia en la nube: si no tienes un archivo de copia, lo pierdes todo.</b>'} Para confirmar, escribe <b style="color:var(--ink)">AGARRAO</b>.</div>
    <input class="note" id="s-reset-in" placeholder="Escribe AGARRAO" autocomplete="off" autocapitalize="characters">
    <button class="cta danger" id="s-reset" disabled>Borrar todo y empezar de cero</button>
  </div>`;
  open('#sh-set');
}
async function onSettings(e){
  const b=e.target.closest('button');if(!b||!b.id)return;const id=b.id;
  if(b.hasAttribute('aria-pressed')){const on=b.getAttribute('aria-pressed')!=='true';
    if(id==='s-face'){if(on){try{busy(true,'Configurando Face ID…');await faceEnable();b.setAttribute('aria-pressed','true');toast('Face ID activado.')}catch(err){console.warn(err);toast(err.message==='prf-no'?'Este iPhone no deja usar Face ID para cifrar en webapps. Seguirás con el PIN.':'No se ha activado Face ID.')}finally{busy(false)}}else{await faceDisable();b.setAttribute('aria-pressed','false');toast('Face ID desactivado. Se abre con el PIN.')}return}
    b.setAttribute('aria-pressed',on);
    if(id==='s-disc')setDisc(on);
    if(id==='s-odisc'){D.settings.discreetOnOpen=on;save()}
    if(id==='s-shake'){if(on){const ok=await shakePerm();if(!ok){b.setAttribute('aria-pressed','false');toast('Sin permiso de movimiento no puedo saber cuándo agitas.');return}}D.settings.shake=on;await kvSet('prefs',{shake:on});shakeBind();save()}
    if(id==='s-net'){D.settings.net=on;save();rr()}
    return}
  if(id==='s-lock'){close();lockNow();return}
  if(id==='s-phrase'){showPhrase();return}
  if(id==='s-pin'){changePin();return}
  if(id==='s-auto'){const i=AUTOL.findIndex(x=>x[0]===D.settings.autoLock);D.settings.autoLock=AUTOL[(i+1)%AUTOL.length][0];save();b.querySelector('.val').textContent=AUTOL.find(x=>x[0]===D.settings.autoLock)[1];return}
  if(id==='s-snap'){openSnaps();return}
  if(id==='s-file'){close();await flush();exportFile();return}
  if(id==='s-imp'){importFile();return}
  if(id==='s-vers'){openVersions();return}
  if(id==='s-cloud'){openCloud();return}
  if(id==='s-sim'){openSimul();return}
  if(id==='s-help'){openHelp();return}
  if(id==='s-name'){openForm({title:'Nombre',fields:F.name,obj:{name:D.profile.name},onSave:o=>{D.profile.name=o.name}});return}
  if(id==='s-upd'){checkUpdate(true);return}
  if(id==='s-reset'){wipeAll();return}
}
function setDisc(on){U.discreet=on;$('#app').classList.toggle('discreet',on);rr()}

/* ================= nube ================= */
function openCloud(){
  const g=D.sync.gh||{};
  sheet('Copia en la nube',`<div class="grp" style="padding-block:14px"><div class="rt wrap">${!ghOn()?'Sin configurar.':CLOUD.err?`<span style="color:var(--over)">Falla: ${esc(CLOUD.err)}</span>`:CLOUD.lastOk?`Al día. Última copia ${ago(CLOUD.lastOk)}.`:'Configurada. Aún no ha subido ninguna copia.'}</div><div class="rs" style="margin-top:4px">Cada cambio se sube cifrado, unos segundos después, a <b>${GH_PATH}</b>. Sin tu frase, ese archivo es ruido.</div></div>
  <div class="card" style="padding-block:2px">
    <label class="ff" for="gh-o"><span>Usuario de GitHub</span><input id="gh-o" value="${esc(g.owner||'')}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="usuario"></label>
    <label class="ff" for="gh-r"><span>Repositorio privado</span><input id="gh-r" value="${esc(g.repo||'')}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="agarrao-copias"></label>
    <label class="ff" for="gh-t"><span>Token</span><input id="gh-t" type="password" value="${esc(g.token||'')}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="github_pat_…"></label>
  </div>
  <button class="cta" id="gh-save">Probar y guardar</button>
  ${ghOn()?'<button class="cta ghost" id="gh-push">Subir copia ahora</button><button class="cta danger" id="gh-off">Desconectar</button>':''}
  ${ghGuide()}`);
  $('#gh-save').onclick=async()=>{const ng={owner:$('#gh-o').value.trim(),repo:$('#gh-r').value.trim(),token:$('#gh-t').value.trim()};if(!ng.owner||!ng.repo||!ng.token){toast('Faltan datos.');return}
    busy(true,'Probando la conexión…');try{await ghTest(ng);D.sync.gh=ng;await cloudSetMeta({sha:null,err:''});save();await flush();await cloudPush(true);await cloudTick();busy(false);if(CLOUD.err)toast('Conecta, pero no sube: '+CLOUD.err);else{toast('Conectado. Primera copia subida.');openCloud()}}
    catch(e){busy(false);toast(e.status===401?'El token no vale o ha caducado.':e.status===404?'No encuentro ese repositorio. ¿Le has dado acceso al token?':e.message)}};
  if($('#gh-push'))$('#gh-push').onclick=async()=>{busy(true,'Subiendo…');await flush();await cloudPush(true);await cloudTick();busy(false);toast(CLOUD.err?'Falla: '+CLOUD.err:'Copia subida.');openCloud()};
  if($('#gh-off'))$('#gh-off').onclick=async e=>{if(e.currentTarget.dataset.armed){D.sync.gh=null;await cloudSetMeta({sha:null,err:'',pending:false,lastOk:0});save();toast('Desconectado. La copia que hay en GitHub sigue allí.');openCloud();return}e.currentTarget.dataset.armed=1;e.currentTarget.textContent='Toca otra vez para desconectar'};
}
function ghGuide(){return `<details class="guide"><summary>Cómo se saca esto, paso a paso</summary><ol>
<li>En GitHub (con tu cuenta dedicada, la del 2FA) crea un repositorio nuevo <b>privado</b>, por ejemplo <b>agarrao-copias</b>. Vacío, sin nada más.</li>
<li>Ve a Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b> → Generate new token.</li>
<li>Nombre: «Agarrao». Caducidad: un año (cuando caduque, la app te avisa y pones uno nuevo).</li>
<li>Repository access: <b>Only select repositories</b> → solo agarrao-copias.</li>
<li>Permissions → Repository permissions → <b>Contents: Read and write</b>. Nada más (Metadata: Read sale solo).</li>
<li>Genera, copia el token y pégalo aquí. No lo guardes en ningún otro sitio: vive cifrado dentro de la app y viaja en tus copias.</li></ol></details>`}
async function openVersions(){
  if(!ghOn()){toast('Primero configura la copia en la nube.');return}
  sheet('Versiones en la nube','<div class="empty">Cargando versiones…</div>');
  let V2;try{V2=await cloudVersions()}catch(e){sheet('Versiones en la nube',`<div class="empty">No se han podido cargar: ${esc(e.message)}</div>`);return}
  const byDay={};V2.forEach(v=>{const d=v.date.slice(0,10);(byDay[d]=byDay[d]||[]).push(v)});
  sheet('Versiones en la nube',`<div class="lbl" style="margin-top:-4px">Cada cambio es una versión. Elige una y se restaura entera; antes se guarda una instantánea de lo que tienes ahora.</div>
  <div class="grp">${V2.map(v=>{const d=new Date(v.date);return `<button class="row" data-ver="${v.sha}"><div class="rm"><div class="rt">${dmy(isoD(d))} · ${p2(d.getHours())}:${p2(d.getMinutes())}</div></div><span class="lnk">Restaurar</span></button>`}).join('')||'<div class="empty">Aún no hay versiones.</div>'}</div>
  ${V2.length>=40?'<div class="lbl">Se muestran las 40 últimas. El historial completo está en GitHub.</div>':''}`);
}
async function restoreBackup(bk,label){
  let data;
  try{data=migrate(await decJSON(bk.data,DEK))}catch(e){try{data=(await openBackup(bk,D.phrase)).data}catch(x){data=null}}
  if(!data){const ph=await askPhrase('Esta copia es de otra frase','Pon la frase con la que se hizo esa copia.');if(!ph)return false;try{data=(await openBackup(bk,ph)).data}catch(e){toast('Esa frase no abre esta copia.');return false}}
  await flush();await snapBefore(label||'Antes de restaurar');
  const keep={sync:D.sync,phrase:D.phrase};D=data;D.sync=keep.sync;D.phrase=keep.phrase;
  runCloses();await flush();dirtyCloud();close();go(U.tab);return true;
}
function askPhrase(title,lead){return new Promise(res=>{
  sheet(title,`<div class="lbl" style="margin-top:-4px">${lead}</div><textarea class="note" id="ap-ph" rows="3" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="las doce palabras separadas por espacios"></textarea><button class="cta" id="ap-ok">Seguir</button>`);
  let done=false;const fin=v=>{if(done)return;done=true;mo.disconnect();res(v)};
  $('#ap-ok').onclick=()=>{const v=$('#ap-ph').value;if(!phraseOk(v)){toast('Tienen que ser las 12 palabras de la frase.');return}fin(normPhrase(v))};
  const sh=$('#sh-sub');const mo=new MutationObserver(()=>{if(!sh.classList.contains('on')||!$('#ap-ph'))fin(null)});mo.observe(sh,{attributes:true,childList:true});
})}
function pickFile(){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=async()=>{const f=i.files&&i.files[0];if(!f){res(null);return}try{res(JSON.parse(await f.text()))}catch(e){toast('Ese archivo no es una copia de Agarrao.');res(null)}};U.ext=Date.now();i.click()})}
async function importFile(){const bk=await pickFile();if(!bk)return;if(bk.app!=='agarrao'){toast('Ese archivo no es una copia de Agarrao.');return}busy(true,'Restaurando…');const ok=await restoreBackup(bk,'Antes de importar');busy(false);if(ok)toast('Copia importada. Lo de antes queda en Instantáneas.')}

/* ================= instantáneas ================= */
async function openSnaps(){
  const L=await snapList();
  const lbl=s=>{if(s.k.startsWith('d-'))return ['Diaria',dayLabel(s.k.slice(2))];if(s.k.startsWith('w-'))return ['Semanal','semana del '+dm(s.k.slice(2))];const d=new Date(s.t);return [s.why||'Manual',dmy(isoD(d))+' '+p2(d.getHours())+':'+p2(d.getMinutes())]};
  sheet('Instantáneas',`<div class="lbl" style="margin-top:-4px">Se guardan solas en este iPhone, cifradas. Sirven para deshacer un borrado o un error. Si pierdes el móvil, tira de la nube o del archivo.</div>
  <div class="grp">${L.map(s=>{const [a,b]=lbl(s);return `<button class="row" data-snap="${esc(s.k)}"><div class="rm"><div class="rt">${esc(a)}</div><div class="rs">${esc(b)}</div></div><span class="lnk">Restaurar</span></button>`}).join('')||'<div class="empty">Aún no hay instantáneas. La primera se guarda con el primer cambio del día.</div>'}</div>`);
}

/* ================= simulacro ================= */
function openSimul(){
  sheet('Simulacro de restauración',`<div class="lbl" style="margin-top:-4px">Hacemos como si hubieras perdido el iPhone: ${ghOn()?'subo una copia, la bajo de GitHub':'hago una copia'} y la abro con la frase que tengas guardada en Contraseñas. Si coincide al 100 % con lo que hay aquí, estás cubierto.</div>
  <textarea class="note" id="sim-ph" rows="3" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Pega aquí la frase desde la app Contraseñas"></textarea>
  <button class="cta" id="sim-go">Hacer simulacro</button><div id="sim-out"></div>`);
  $('#sim-go').onclick=async()=>{const ph=$('#sim-ph').value;const out=$('#sim-out');
    if(!phraseOk(ph)){out.innerHTML='<div class="lbl" style="color:var(--over)">Eso no son las 12 palabras de la frase.</div>';return}
    const steps=[];const log=(t,ok)=>{steps.push(`<div class="row"><div class="rm"><div class="rt wrap">${t}</div></div><div class="ra" style="color:${ok?'var(--ok)':'var(--over)'}">${ok?'✓':'✗'}</div></div>`);out.innerHTML=`<div class="grp">${steps.join('')}</div>`};
    busy(true,'Haciendo el simulacro…');
    try{
      await flush();let bk;
      if(ghOn()){while(cloudBusy)await new Promise(r=>setTimeout(r,300));await cloudPush(true);await cloudTick();if(CLOUD.err)throw new Error('No sube a la nube: '+CLOUD.err);log('Copia subida a GitHub',1);
        let tries=0;for(;;){bk=await cloudPull();const {data}=await openBackup(bk,ph).catch(()=>({data:null}));if(!data)throw new Error('La frase no abre la copia de la nube.');if(JSON.stringify(data)===JSON.stringify(D)||tries++>=2){log('Copia bajada de GitHub y abierta con tu frase',1);var res=data;break}await new Promise(r=>setTimeout(r,2000))}}
      else{bk=JSON.parse(JSON.stringify(await buildBackup()));const r=await openBackup(bk,ph).catch(()=>null);if(!r)throw new Error('La frase no abre la copia.');res=r.data;log('Copia hecha y abierta con tu frase',1)}
      const same=JSON.stringify(res)===JSON.stringify(D);log(same?'Coincide al 100 % con lo que hay en el iPhone':'No coincide con lo que hay en el iPhone',same);
      if(!same)throw new Error('mismatch');
      D.simOk=T.iso;save();busy(false);toast('Simulacro superado. Puedes perder el iPhone tranquilo (bueno, tranquilo no).');syncBell();
    }catch(e){busy(false);if(e.message!=='mismatch')log(esc(e.message),0);toast('El simulacro ha fallado. Mira el detalle.')}
  };
}

/* ================= ayuda copias ================= */
function openHelp(){sheet('Cómo funcionan las copias',`<div class="grp" style="padding-block:14px;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.5">
<p style="margin:0"><b>1. En el iPhone.</b> Todo se guarda cifrado. Cada día se guarda una instantánea (7 diarias y 4 semanales) y otra antes de cada restauración.</p>
<p style="margin:0"><b>2. En la nube.</b> Cada cambio sube cifrado a tu repositorio privado de GitHub. Cada subida es una versión: puedes volver a cualquiera.</p>
<p style="margin:0"><b>3. En iCloud Drive.</b> Un archivo cifrado que guardas tú al cuadrar. Si GitHub fallara, tiras de él.</p>
<p style="margin:0"><b>La llave de todo es la frase de 12 palabras</b>, en la app Contraseñas. Sin ella nadie abre las copias, tampoco tú. Con ella y una copia, recuperas todo en un iPhone nuevo: instalas, «Restaurar copia», frase y PIN nuevo.</p></div>`)}

/* ================= borrar todo ================= */
async function wipeAll(){
  busy(true,'Borrando…');
  try{await flush();if(ghOn()){await cloudPush(true)}}catch(e){}
  try{_db&&_db.close();_db=null;await new Promise(r=>{const q=indexedDB.deleteDatabase('agarrao');q.onsuccess=q.onerror=q.onblocked=()=>r()})}catch(e){}
  D=null;DEK=null;VAULT=null;location.reload();
}

/* ================= actualización ================= */
let swReg=null;
async function checkUpdate(manual){if(!swReg){if(manual)toast('Aquí no hay actualizaciones (abre la app instalada).');return}try{await swReg.update()}catch(e){}if(swReg.waiting)showUpd();else if(manual)toast('Tienes la última versión.')}
function showUpd(){const b=$('#upd');b.hidden=false}

/* ================= acciones ================= */
function calFor(arg){
  if(arg==='piso')return [`Entrada del piso`,D.piso.fecha,'Objetivo de Agarrao'];
  const [k,id]=String(arg).split(':');
  if(k==='promo'){const a=accBy(id);return a&&[`Acaba la promo de ${a.alias}`,a.promoFin,`${a.bank}: pasa del ${fmt(a.promoTae)} % al ${fmt(a.promoDesp??a.tae)} %`]}
  if(k==='venc'){const a=accBy(id);return a&&[`Vence ${a.alias}`,a.venc,`Depósito en ${a.bank}`]}
  if(k==='pago'){const p=D.pagos.find(x=>x.id===id);return p&&[p.n,p.fecha,`Pago a la promotora: ${eur0(p.a)}`]}
  return null;
}
function doAct(act,arg){
  if(!act)return;
  const fromSheet=openSheet&&openSheet.id==='sh-sub';
  if(['loan-ok','com-ok','dis','chat','file','cuadre'].includes(act)&&fromSheet&&act!=='cuadre')close();
  if(act==='avisos'){openAvisos();return}
  if(act==='disc'){setDisc(!U.discreet);return}
  if(act==='add'){openAdd();return}
  if(act==='hist-add'){editHistMan();return}
  if(act==='hist-del'){const i=D.hist.findIndex(h=>h.ym===arg&&h.manual);if(i>=0){const it=D.hist.splice(i,1)[0];touch();openHist();rr();toast('Mes borrado.',()=>{D.hist.push(it);D.hist.sort((a,b)=>a.ym<b.ym?-1:1);save()})}return}
  if(act==='chat'){if(arg==='parte'){openChat('Parte del mes');return}openChat(arg||'');return}
  if(act==='sh'){if(!SH[arg])return;if(arg==='movs')U.movQ='';U.curSh=arg;SH[arg]();return}
  if(act==='buscar'){U.movQ=arg||'';U.curSh='movs';shMovs(T.ym);return}
  if(act==='whatif'){U.whatif=!U.whatif;rr();return}
  if(act==='go-piso'){close();go('piso');return}
  if(act==='loan-ok'){const l=D.loans.find(x=>x.id===arg);if(!l)return;const old={pend:l.pend,lastYm:l.lastYm};l.pend=+Math.max(0,l.pend+l.pend*(l.tin||0)/1200-l.cuota).toFixed(2);l.lastYm=T.ym;touch();rr();toast(`Pendiente: ${eur(l.pend)}. ${V.loan}`,()=>{Object.assign(l,old);save()});return}
  if(act==='com-ok'){const cp=comPend();cp.forEach(m=>m.com='ok');touch();rr();if(fromSheet)close();toast(V.cogido,()=>{cp.forEach(m=>m.com='pend');save()});return}
  if(act==='cal'){const c=calFor(arg);if(!c||!c[1]){toast('Falta la fecha.');return}U.ext=Date.now();addCal(c[0],c[1],c[2]);return}
  if(act==='dis'){D.dismissed[arg]=1;save();rr();return}
  if(act==='cuadre'){openCuadre();return}
  if(act==='simul'){openSimul();return}
  if(act==='cloud'){openCloud();return}
  if(act==='file'){(async()=>{await flush();U.ext=Date.now();exportFile()})();return}
  if(act==='piso-edit'){openForm({title:'Objetivo del piso',fields:F.piso,obj:D.piso,check:o=>o.fecha<=T.iso?'La fecha tiene que ser futura.':null,onSave:o=>Object.assign(D.piso,o)});return}
}
/* ================= delegación ================= */
function onClick(e){
  const mm=e.target.closest('[data-mes]');if(mm){U.curSh='hist';openMes(+mm.dataset.mes);return}
  const t=e.target.closest('button');if(!t)return;
  if(t.id==='hero-num'){setDisc(!U.discreet);return}
  if(t.id==='btn-edit'){U.editLim=!U.editLim;rr();return}
  if(t.id==='sim-reset'){U.sim={varM:null,aport:null,ret:null};rr();return}
  const d=t.dataset;
  if(d.mov){const m=D.movs.find(m=>String(m.id)===d.mov);if(m)editMov(m);return}
  if(d.movym){U.curSh='movs';shMovs(d.movym);return}
  if(d.cat){editCat(D.cats.find(c=>c.id===d.cat));return}
  if(d.fix){editSimple('fix',D.fixed,D.fixed.find(f=>f.id===d.fix),'Gasto fijo');return}
  if(d.anu){editSimple('anu',D.anuales,D.anuales.find(f=>f.id===d.anu),'Gasto anual');return}
  if(d.ext){editSimple('ext',D.extras,D.extras.find(f=>f.id===d.ext),'Ingreso extra');return}
  if(d.pago){editSimple('pago',D.pagos,D.pagos.find(f=>f.id===d.pago),'Pago a la promotora');return}
  if(d.inc){openForm({title:'Nómina',fields:F.inc,obj:{income:D.income},onSave:x=>D.income=x.income});return}
  if(d.acc){editAcc(accBy(d.acc));return}
  if(d.loan){editLoan(D.loans.find(l=>l.id===d.loan));return}
  if(d.inv){editInv(D.invs.find(i=>i.id===d.inv));return}
  if(d.ver){(async()=>{if(!t.dataset.armed){t.dataset.armed=1;t.querySelector('.lnk').textContent='¿Seguro? Toca otra vez';return}busy(true,'Restaurando versión…');try{const bk=await cloudPull(d.ver);const ok=await restoreBackup(bk,'Antes de restaurar versión');busy(false);if(ok)toast('Versión restaurada. Lo de antes queda en Instantáneas.')}catch(err){busy(false);toast('No se ha podido: '+err.message)}})();return}
  if(d.snap){(async()=>{if(!t.dataset.armed){t.dataset.armed=1;t.querySelector('.lnk').textContent='¿Seguro? Toca otra vez';return}busy(true,'Restaurando…');try{await snapRestore(d.snap);runCloses();await flush();dirtyCloud();busy(false);close();go(U.tab);toast('Restaurado. Lo de antes queda como instantánea.')}catch(err){busy(false);toast('No se ha podido restaurar.')}})();return}
  if(d.hz){U.horizon=d.hz;rr();return}
  if(d.hm){D.hipo.mode=d.hm;save();openHipoteca();return}
  if(d.new){U.curSh=U.curSh||null;({cat:()=>editCat(),fix:()=>editSimple('fix',D.fixed,null,'Nuevo gasto fijo',{n:'',a:null,dia:1}),anu:()=>editSimple('anu',D.anuales,null,'Nuevo gasto anual',{n:'',a:null,mes:11}),ext:()=>editSimple('ext',D.extras,null,'Nuevo ingreso extra',{n:'',a:null,fecha:''}),pago:()=>editSimple('pago',D.pagos,null,'Nuevo pago a la promotora',{n:'',a:null,fecha:''}),acc:()=>editAcc(),loan:()=>editLoan(),inv:()=>editInv()})[d.new]();return}
  doAct(d.act,d.arg);
}

function bindUI(){
  $$('.sheet').forEach(s=>s.inert=true);
  $$('.tab').forEach(t=>t.addEventListener('click',()=>go(t.dataset.tab)));
  $('#scrim').addEventListener('click',close);
  document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close()});
  $('#toast-undo').addEventListener('click',()=>{if(undoFn){const f=undoFn;undoFn=null;f();touch();rr();toast('Deshecho. Aquí no ha pasado nada.')}});
  $('#sh-form').addEventListener('click',e=>{
    const tg=e.target.closest('[data-tog]');if(tg){tg.setAttribute('aria-pressed',tg.getAttribute('aria-pressed')!=='true');return}
    const x=e.target.closest('[data-extra]');if(x){U.loanExtra[x.dataset.lid]=+x.dataset.extra;x.parentElement.querySelectorAll('.pill').forEach(b=>b.classList.toggle('on',b===x));$('#loan-sim').innerHTML=loanSim(D.loans.find(l=>l.id===x.dataset.lid));return}
    const c=e.target.closest('[data-col]');if(c){const box=c.parentElement;box.dataset.val=c.dataset.col;box.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===c))}
  });
  $('#pad').innerHTML=PADKEYS.map(k=>`<button data-k="${k}" aria-label="${k==='del'?'Borrar':k}">${k==='del'?ico('back'):k}</button>`).join('');
  $('#pad').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;
    if(k==='del')amt=amt.slice(0,-1);else if(k===','){if(!amt.includes(','))amt=(amt||'0')+','}
    else{const d=amt.split(',')[1];if(d!==undefined&&d.length>=2)return;if(!amt.includes(',')&&amt.replace(/^0/,'').length>=5)return;amt=(amt==='0'?'':amt)+k}drawAmt()});
  $('#add-cats').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;selCat=b.dataset.c;drawCats()});
  $('#add-com').addEventListener('click',()=>{com=!com;drawCom()});
  $('#add-com-mode').addEventListener('click',e=>{const b=e.target.closest('[data-cm]');if(!b)return;comMode=b.dataset.cm;drawCom()});
  $('#add-favs').addEventListener('click',e=>{const b=e.target.closest('[data-fav]');if(!b)return;const f=frecuentes()[+b.dataset.fav];if(!f)return;const {m,msg}=addMov(f.t,f.cat,f.a);close();touch();rr();toast(msg,undoMov(m))});
  $('#btn-add').addEventListener('click',openAdd);
  $('#add-save').addEventListener('click',saveAdd);
  $('#pad2').innerHTML=PADKEYS.map(k=>`<button data-k="${k}" aria-label="${k==='del'?'Borrar':k}">${k==='del'?ico('back'):k}</button>`).join('');
  new MutationObserver(()=>padify($('#app'))).observe($('#app'),{childList:true,subtree:true});
  document.addEventListener('click',e=>{const i=e.target.closest('input.padin');if(i){e.preventDefault();padOpen(i)}},true);
  $('#pad2').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)padKey(b.dataset.k)});
  $('#pad2-neg').addEventListener('click',()=>padKey('neg'));
  $('#pad2-ok').addEventListener('click',()=>{if(padIn){padIn.value=padS;padIn.dispatchEvent(new Event('input',{bubbles:true}));padIn.dispatchEvent(new Event('change',{bubbles:true}))}padClose()});
  $('#pad2-x').addEventListener('click',padClose);$('#scrim2').addEventListener('click',padClose);
  $('#sh-pad').inert=true;
  $('#btn-set').addEventListener('click',openSettings);
  $('#sh-set').addEventListener('click',onSettings);
  $('#sh-set').addEventListener('input',e=>{if(e.target.id==='s-reset-in')$('#s-reset').disabled=e.target.value.trim().toUpperCase()!=='AGARRAO'});
  $('#views').addEventListener('click',onClick);$('#sh-sub').addEventListener('click',onClick);
  $('#sh-sub').addEventListener('input',e=>{if(e.target.id==='mv-q'){movsQ(e.target.value);return}const k=e.target.dataset&&e.target.dataset.h;if(!k)return;const v=num(e.target.value);if(v!=null){D.hipo[k]=v;save();$('#hipo-out').innerHTML=hipoOut()}});
  $('#chat-form').addEventListener('submit',e=>{e.preventDefault();const i=$('#chat-in');const q=i.value;i.value='';ask(q)});
  $('#sh-chat').addEventListener('click',e=>{const c=e.target.closest('[data-q]');if(c){ask(c.dataset.q);return}
    const u=e.target.closest('[data-undo]');if(u){const m=D.movs.find(x=>String(x.id)===u.dataset.undo);if(m){undoMov(m)();u.replaceWith(Object.assign(document.createElement('i'),{textContent:'(deshecho)'}));touch();rr()}return}
    const a=e.target.closest('[data-act]');if(a){close();doAct(a.dataset.act,a.dataset.arg)}});
  $('#btn-chat').addEventListener('click',()=>openChat());
  $('#btn-bell').addEventListener('click',()=>openAvisos());
  $('#views').addEventListener('change',e=>{const l=e.target.dataset&&e.target.dataset.lim;if(l){const c=D.cats.find(x=>x.id===l);c.lim=Math.max(0,Math.round(num(e.target.value)||0));touch();rr()}});
  $('#views').addEventListener('input',e=>{const id=e.target.id;if(id==='sl-var')U.sim.varM=+e.target.value;else if(id==='sl-ap')U.sim.aport=+e.target.value;else if(id==='sl-ret')U.sim.ret=+e.target.value;else return;U._anim=false;updPiso()});
  $('#upd-go').addEventListener('click',async()=>{await flush();if(swReg&&swReg.waiting)swReg.waiting.postMessage('skip');else location.reload()});
  setInterval(()=>{if(D)cloudTick()},20000);
}


/* ================= agitar ================= */
let PREFS={},shakeOn=false,lastShake=0,shakeHits=[];
async function shakePerm(){if(typeof DeviceMotionEvent==='undefined')return false;if(typeof DeviceMotionEvent.requestPermission==='function'){try{return (await DeviceMotionEvent.requestPermission())==='granted'}catch(e){return false}}return true}
function onMotion(e){if(!D||!D.settings.shake||U.locked)return;const a=e.acceleration&&e.acceleration.x!=null?e.acceleration:null;if(!a)return;const g=Math.hypot(a.x||0,a.y||0,a.z||0);if(g<13)return;const now=Date.now();shakeHits=shakeHits.filter(t=>now-t<800);shakeHits.push(now);if(shakeHits.length>=3&&now-lastShake>1500){lastShake=now;shakeHits=[];setDisc(!U.discreet);if(navigator.vibrate)navigator.vibrate(25)}}
function shakeBind(){if(!shakeOn){window.addEventListener('devicemotion',onMotion);shakeOn=true}}

/* ================= bloqueo ================= */
function showLock(){
  U.locked=true;const el=$('#lock');const face=!!(VAULT&&VAULT.wraps.prf);
  el.innerHTML=`<svg class="lg"><use href="#logo"/></svg><div class="wm">Agarrao</div><div class="lbl" id="lk-st">Bloqueada</div>
  ${face?`<div class="faceid" id="lk-face"><button class="fi" id="lk-fi" aria-label="Desbloquear con Face ID">${ico('face')}</button><span>Toca para usar Face ID</span></div>`:''}
  <div id="lk-pin" ${face?'hidden':''}>${pinPad('lk')}</div>
  <div class="lk-links">${face?'<button class="link" id="lk-mode">Usar PIN</button>':''}<button class="link" id="lk-forgot">He olvidado el PIN</button></div>`;
  el.classList.remove('out');el.setAttribute('aria-hidden','false');
  let asked=false;el.onpointerdown=()=>{if(asked)return;asked=true;if(PREFS.shake&&typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function')DeviceMotionEvent.requestPermission().then(r=>{if(r==='granted')shakeBind()}).catch(()=>{});else if(PREFS.shake)shakeBind()};
  const ctl=bindPin('lk',async(p,c)=>{
    const f=await failsGet();if(f.until>Date.now()){c.reset(`Demasiados intentos. Espera ${Math.ceil((f.until-Date.now())/1000)} s.`);return}
    c.busy=true;c.msg('Abriendo…');
    try{await unlockPin(p);c.busy=false;await failsReset();afterUnlock()}
    catch(e){c.busy=false;const g=await failsAdd();c.reset(g.until>Date.now()?`PIN incorrecto. Espera ${Math.ceil((g.until-Date.now())/1000)} s.`:`PIN incorrecto${g.n>=3?` (${g.n} fallos)`:''}`)}
  });
  if(face){
    $('#lk-fi').onclick=async()=>{const fi=$('#lk-fi');fi.classList.add('scan');try{await unlockFace();fi.innerHTML=ico('check');await failsReset();setTimeout(afterUnlock,250)}catch(e){fi.classList.remove('scan');console.warn(e);$('#lk-st').textContent='Face ID no ha funcionado. Usa el PIN.';$('#lk-pin').hidden=false;$('#lk-face').hidden=true;$('#lk-mode').textContent='Usar Face ID'}};
    $('#lk-mode').onclick=()=>{const showPin=$('#lk-pin').hidden;$('#lk-pin').hidden=!showPin;$('#lk-face').hidden=showPin;$('#lk-mode').textContent=showPin?'Usar Face ID':'Usar PIN'};
  }
  $('#lk-forgot').onclick=forgotPin;void ctl;
}
function hideLock(){const el=$('#lock');el.classList.add('out');el.setAttribute('aria-hidden','true');el.innerHTML='';U.locked=false}
async function lockNow(){
  if(!D)return;try{await flush()}catch(e){}
  close();padClose();D=null;DEK=null;chatLog=[];U.sim={varM:null,aport:null,ret:null};U.editLim=false;U.whatif=false;
  ['hoy','pres','dinero','piso'].forEach(v=>$('#v-'+v).innerHTML='');$('#chat-log').innerHTML='';$('#onb').classList.add('out');
  showLock();
}
function afterUnlock(){
  refreshT();if(runCloses())save();
  hideLock();
  if(D.onb!=null){onboarding(D.onb);return}
  enterApp();
}
function enterApp(){
  $('#onb').classList.add('out');$('#onb').setAttribute('aria-hidden','true');$('#onb').innerHTML='';
  U.discreet=!!D.settings.discreetOnOpen;$('#app').classList.toggle('discreet',U.discreet);
  go('hoy');cloudTick();
  if(ghOn())cloudMeta().then(m=>{if(m.pending||!m.lastOk)cloudPush()});
  if(D.settings.shake)shakeBind();
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
}
function forgotPin(){
  const el=$('#lock');
  el.innerHTML=`<svg class="lg"><use href="#logo"/></svg><div class="wm">Agarrao</div>
  <div class="lbl" style="text-align:center;max-width:300px">Pon tu frase de recuperación (la de la app Contraseñas) y eliges un PIN nuevo.</div>
  <textarea class="note" id="fp-ph" rows="3" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="las doce palabras" style="max-width:340px"></textarea>
  <button class="cta" id="fp-go" style="width:100%;max-width:340px">Seguir</button><button class="link" id="fp-back">Volver</button>`;
  $('#fp-back').onclick=showLock;
  $('#fp-go').onclick=async()=>{const v=$('#fp-ph').value;if(!phraseOk(v)){toast('Tienen que ser las 12 palabras.');return}busy(true,'Abriendo…');
    try{await unlockPhrase(v)}catch(e){busy(false);toast('Esa frase no abre esta app.');return}busy(false);
    el.innerHTML=`<svg class="lg"><use href="#logo"/></svg><div class="wm">PIN nuevo</div>${pinPad('fn')}`;
    let first=null;bindPin('fn',async(p,c)=>{if(!first){first=p;c.reset();c.msg('Repítelo');return}if(p!==first){first=null;c.reset('No coinciden. Otra vez.');return}c.busy=true;c.msg('Cifrando…');await setPin(p);await failsReset();toast('PIN cambiado.');afterUnlock()});
  };
}

/* ================= primer inicio ================= */
function numF(id,l,suf='€',v=''){return `<label class="ff" for="${id}"><span>${l}</span><span class="inw"><input id="${id}" inputmode="decimal" placeholder="—" value="${numIn(v)}" style="width:130px"><i>${suf}</i></span></label>`}
function intF(id,l,v=''){return `<label class="ff" for="${id}"><span>${l}</span><input id="${id}" inputmode="numeric" placeholder="—" value="${v??''}" style="width:130px"></label>`}
function txtF(id,l,ph='',v=''){return `<label class="ff" for="${id}"><span>${l}</span><input id="${id}" placeholder="${esc(ph)}" value="${esc(v)}" autocomplete="off"></label>`}
function togF(id,l,on){return `<div class="ff"><span>${l}</span><button class="sw-row" style="width:auto" id="${id}" aria-pressed="${!!on}" data-otog aria-label="${l}"><span class="sw"></span></button></div>`}
const vNum=id=>num($('#'+id).value),vTxt=id=>$('#'+id).value.trim();
function miniList(arr,lbl,kind){return arr.length?`<div class="grp">${arr.map(x=>`<div class="row"><div class="rm"><div class="rt">${esc(lbl(x)[0])}</div><div class="rs">${lbl(x)[1]}</div></div><button class="av-x" data-odel="${kind}:${x.id}" aria-label="Quitar">${ico('x')}</button></div>`).join('')}</div>`:''}

let OB={};
function onboarding(start){
  const el=$('#onb');
  const steps=[
    {id:'hola',h:()=>`<div class="hero-onb"><svg><use href="#logo"/></svg><h2>Empezamos.</h2><p class="lead">En unos minutos lo dejas listo. Todo lo que metas se queda en este iPhone, cifrado. Casi todo se puede saltar y rellenar después.</p></div>
      <div class="card" style="padding-block:2px">${txtF('o-name','¿Cómo te llamo?','Tu nombre',D.profile.name)}</div>`,
      next:()=>{D.profile.name=vTxt('o-name');return true}},
    {id:'pin',h:()=>`<h2>Tu PIN</h2><p class="lead" id="o-pin-lead">${OB.pin?'PIN listo. Si quieres cambiarlo, vuelve a marcarlo.':'Seis cifras. Es lo que cifra los datos junto con Face ID. Nada de 123456, figura.'}</p>${pinPad('op')}`,
      init:()=>{let first=null;bindPin('op',(p,c)=>{if(!first){if(/^(\d)\1{5}$/.test(p)||'0123456789'.includes(p)||'9876543210'.includes(p)){c.reset('Demasiado fácil. Otro.');return}first=p;c.reset();c.msg('Repítelo');return}if(p!==first){first=null;c.reset('No coinciden. Empieza otra vez.');return}OB.pin=p;c.msg('PIN listo ✓');$('#o-next').disabled=false})},
      ready:()=>!!OB.pin},
    {id:'frase',h:()=>{OB.phrase=OB.phrase||newPhrase();return `<h2>Tu frase de recuperación</h2><p class="lead">Con ella recuperas todo en otro iPhone. Sin ella nadie puede abrir tus copias, tampoco tú. Guárdala en la app Contraseñas: Nueva contraseña → sitio «Agarrao», contraseña: la frase.</p>
      <div class="phrase">${OB.phrase.split(' ').map((w,i)=>`<span><i>${i+1}</i>${w}</span>`).join('')}</div>
      <button class="cta ghost" id="o-copy">Copiar la frase</button>
      <div class="card tight">${togF('o-saved','Ya la he guardado en Contraseñas',OB.saved)}</div>`},
      init:()=>{$('#o-copy').onclick=async()=>{try{await navigator.clipboard.writeText(OB.phrase);toast('Copiada. Pégala en Contraseñas.')}catch(e){toast('No se ha podido copiar. Apúntala a mano.')}}},
      ready:()=>!!OB.saved},
    {id:'check',h:()=>{if(!OB.q){const a=Math.floor(Math.random()*6),b=6+Math.floor(Math.random()*6);OB.q=[a,b]}return `<h2>Comprobación</h2><p class="lead">Para asegurarnos de que la tienes bien guardada: escribe estas dos palabras de la frase.</p>
      <div class="card" style="padding-block:2px">${txtF('o-w1','Palabra '+(OB.q[0]+1),'')}${txtF('o-w2','Palabra '+(OB.q[1]+1),'')}</div>`},
      init:()=>{['o-w1','o-w2'].forEach(i=>{const x=$('#'+i);x.autocapitalize='none';x.spellcheck=false})},
      next:async()=>{const w=OB.phrase.split(' ');if(normPhrase(vTxt('o-w1'))!==w[OB.q[0]]||normPhrase(vTxt('o-w2'))!==w[OB.q[1]]){toast('No coinciden. Mírala en Contraseñas.');return false}
        busy(true,'Cifrando… (tarda un pelín, es a propósito)');try{await vaultCreate(OB.pin,OB.phrase);D.phrase=OB.phrase;D.onb=4;await flush();await failsReset()}catch(e){busy(false);toast('Algo ha fallado al cifrar: '+e.message);return false}busy(false);OB.pin=null;return true},
      lockBack:true},
    {id:'face',h:()=>`<h2>Face ID</h2><p class="lead">Para abrir la app con la cara. El PIN sigue valiendo por si falla.</p>
      <div class="card tight">${row('o-face','Activar Face ID',VAULT&&VAULT.wraps.prf?'Activado ✓':'Recomendado','')}</div><p class="lead" style="font-size:13px;color:var(--mut)">Si tu iPhone no lo permite en webapps, te lo digo y seguimos con el PIN.</p>`,
      init:()=>{$('#o-face').onclick=async()=>{busy(true,'Face ID…');try{await faceEnable();busy(false);toast('Face ID activado.');draw()}catch(e){busy(false);console.warn(e);toast(e.message==='prf-no'?'Este iPhone no deja usar Face ID para cifrar aquí. Seguimos con el PIN.':'No se ha activado. Puedes hacerlo luego en Ajustes.')}}},
      skip:true,noBack:true},
    {id:'nube',h:()=>{const g=D.sync.gh||{};return `<h2>Copia en la nube</h2><p class="lead">Cada cambio se sube cifrado a un repositorio privado tuyo de GitHub. Es lo que te salva si pierdes el iPhone.</p>
      <div class="card" style="padding-block:2px">${txtF('o-gh-o','Usuario de GitHub','usuario',g.owner||'')}${txtF('o-gh-r','Repositorio privado','agarrao-copias',g.repo||'')}<label class="ff" for="o-gh-t"><span>Token</span><input id="o-gh-t" type="password" value="${esc(g.token||'')}" autocomplete="off" placeholder="github_pat_…"></label></div>
      <button class="cta ghost" id="o-gh-test">${ghOn()?'Conectado ✓ · Probar otra vez':'Probar conexión'}</button>${ghGuide()}`},
      init:()=>{['o-gh-o','o-gh-r','o-gh-t'].forEach(i=>{const x=$('#'+i);x.autocapitalize='none';x.spellcheck=false});
        $('#o-gh-test').onclick=async()=>{const g={owner:vTxt('o-gh-o'),repo:vTxt('o-gh-r'),token:vTxt('o-gh-t')};if(!g.owner||!g.repo||!g.token){toast('Faltan datos.');return}busy(true,'Probando…');try{await ghTest(g);D.sync.gh=g;save();busy(false);toast('Conectado. Al terminar sube la primera copia.');draw()}catch(e){busy(false);toast(e.status===401?'El token no vale o ha caducado.':e.status===404?'No encuentro ese repositorio. ¿Le has dado acceso al token?':e.message)}}},
      skip:true},
    {id:'nomina',h:()=>`<h2>Lo que entra</h2><p class="lead">Tu nómina neta al mes. Los extras (pagas, bonus…) se añaden luego en Presupuesto → Ingresos.</p><div class="card" style="padding-block:2px">${numF('o-nom','Nómina neta','€',D.income||'')}</div>`,
      next:()=>{const v=vNum('o-nom');if(v!=null)D.income=v;return true},skip:true},
    {id:'pres',h:()=>{const b=budget();return `<h2>Presupuesto del día a día</h2><p class="lead">Lo que te permites al mes en súper, bares, ocio, ropa… (sin fijos). Lo reparto entre categorías y luego lo ajustas a tu gusto en Presupuesto.</p>
      <div class="card" style="padding-block:2px">${numF('o-bud','Total al mes','€',b||'')}</div><div id="o-bud-prev"></div>`},
      init:()=>{const upd=()=>{const v=vNum('o-bud');$('#o-bud-prev').innerHTML=v?`<div class="grp">${splitBudget(v).map(([c,x])=>`<div class="row"><span class="cdot" style="--c:var(${c.c})"></span><div class="rm"><div class="rt">${esc(c.n)}</div></div><div class="ra">${eur0(x)}</div></div>`).join('')}</div>`:''};$('#o-bud').addEventListener('change',upd);upd()},
      next:()=>{const v=vNum('o-bud');if(v){splitBudget(v).forEach(([c,x])=>c.lim=x)}return true},skip:true},
    {id:'cuentas',h:()=>`<h2>Tus cuentas</h2><p class="lead">Alias, entidad, saldo y TAE. Marca las que son para el piso (si no marcas ninguna, cuento todas). El resto de la ficha, desde Dinero.</p>
      ${miniList(D.accounts,a=>[a.alias,`${esc(a.bank)} · ${eur(a.bal)}${a.tae?' · '+fmt(a.tae)+' %':''}${a.piso?' · piso':''}`],'acc')}
      <div class="card" style="padding-block:2px">${txtF('o-a1','Alias','Ej.: Nómina')}${txtF('o-a2','Entidad','')}${numF('o-a3','Saldo','€')}${numF('o-a4','TAE','%')}${togF('o-a5','Es para el piso',false)}</div>
      <button class="cta ghost" id="o-a-add">${ico('plus')} Añadir esta cuenta</button>`,
      init:()=>{$('#o-a-add').onclick=()=>{const a={id:uid(),alias:vTxt('o-a1'),bank:vTxt('o-a2'),bal:vNum('o-a3'),tae:vNum('o-a4')||0,col:COLORS[D.accounts.length%COLORS.length],tipo:'Corriente',fecha:T.iso,liq:'Mensual',piso:$('#o-a5').getAttribute('aria-pressed')==='true',destino:false};if(!a.alias||!a.bank||a.bal==null){toast('Pon alias, entidad y saldo.');return}D.accounts.push(a);fixDestino();save();draw()}},
      skip:true},
    {id:'fijos',h:()=>`<h2>Gastos fijos</h2><p class="lead">Lo que sale sí o sí cada mes: la transferencia a la común, el móvil, el gimnasio… Los préstamos van en el paso siguiente.</p>
      ${miniList(D.fixed,f=>[f.n,eur(f.a)+(f.dia?' · día '+f.dia:'')],'fix')}
      <div class="card" style="padding-block:2px">${txtF('o-f1','Concepto','Ej.: Transferencia a la común')}${numF('o-f2','Importe al mes','€')}${intF('o-f3','Día de cargo')}</div>
      <button class="cta ghost" id="o-f-add">${ico('plus')} Añadir este fijo</button>`,
      init:()=>{$('#o-f-add').onclick=()=>{const f={id:uid(),n:vTxt('o-f1'),a:vNum('o-f2'),dia:vNum('o-f3')};if(!f.n||f.a==null){toast('Pon concepto e importe.');return}D.fixed.push(f);save();draw()}},
      skip:true},
    {id:'deudas',h:()=>`<h2>Préstamos e inversiones</h2><p class="lead">Si tienes, lo básico. La ficha completa (TAE, comisiones, bonificaciones…) desde Dinero.</p>
      <div class="h-lbl">Préstamos</div>${miniList(D.loans,l=>[l.nombre,`${esc(l.entidad)} · pendiente ${eur(l.pend)} · ${eur(l.cuota)}/mes`],'loan')}
      <div class="card" style="padding-block:2px">${txtF('o-l1','Nombre','Ej.: Préstamo coche')}${txtF('o-l2','Entidad','')}${numF('o-l3','Pendiente hoy','€')}${numF('o-l4','TIN','%')}${numF('o-l5','Cuota al mes','€')}${intF('o-l6','Día de cargo')}</div>
      <button class="cta ghost" id="o-l-add">${ico('plus')} Añadir préstamo</button>
      <div class="h-lbl">Inversiones</div>${miniList(D.invs,i=>[i.producto,`${esc(i.broker)} · ${eur(i.valor)} · ${eur0(i.aport||0)}/mes`],'inv')}
      <div class="card" style="padding-block:2px">${txtF('o-i1','Producto','Ej.: MSCI World')}${txtF('o-i2','Broker','')}${numF('o-i3','Valor actual','€')}${numF('o-i4','Aportación al mes','€')}${numF('o-i5','Total aportado','€')}</div>
      <button class="cta ghost" id="o-i-add">${ico('plus')} Añadir inversión</button>`,
      init:()=>{$('#o-l-add').onclick=()=>{const l={id:uid(),nombre:vTxt('o-l1'),entidad:vTxt('o-l2'),tipo:'Personal',pend:vNum('o-l3'),tin:vNum('o-l4'),cuota:vNum('o-l5'),dia:vNum('o-l6')||1,cuenta:(D.accounts[0]||{}).id||''};if(!l.nombre||!l.entidad||l.pend==null||l.tin==null||l.cuota==null){toast('Pon nombre, entidad, pendiente, TIN y cuota.');return}D.loans.push(l);save();draw()};
        $('#o-i-add').onclick=()=>{const i={id:uid(),producto:vTxt('o-i1'),broker:vTxt('o-i2'),tipo:'ETF',valor:vNum('o-i3'),aport:vNum('o-i4')||0,aportado:vNum('o-i5'),dia:1,rBase:6,rMalo:1,rBueno:10};if(!i.producto||!i.broker||i.valor==null){toast('Pon producto, broker y valor.');return}D.invs.push(i);save();draw()}},
      skip:true},
    {id:'obj',h:()=>`<h2>El objetivo</h2><p class="lead">La entrada del piso: tu parte, los gastos de compra (notaría, impuestos…) y para cuándo.</p>
      <div class="card" style="padding-block:2px">${numF('o-p1','Entrada (tu parte)','€',D.piso.entrada??'')}${numF('o-p2','Gastos de compra','€',D.piso.gastos??'')}<label class="ff" for="o-p3"><span>Fecha</span><input id="o-p3" type="date" min="${T.iso}" value="${D.piso.fecha||''}"></label></div>`,
      next:()=>{const e=vNum('o-p1'),g=vNum('o-p2'),f=$('#o-p3').value;if(e!=null||f){if(e==null||!f){toast('Pon entrada y fecha (o salta el paso).');return false}if(f<=T.iso){toast('La fecha tiene que ser futura.');return false}D.piso={entrada:e,gastos:g,fecha:f}}return true},skip:true},
    {id:'fin',h:()=>`<div class="hero-onb"><svg><use href="#logo"/></svg><h2>Listo.<br>A ser más agarrao que un chotis.</h2><p class="lead" id="o-fin-t">${ghOn()?'Subiendo la primera copia cifrada…':'Sin copia en la nube todavía: configúrala cuanto antes en Ajustes.'}</p><p class="lead" style="font-size:14px;color:var(--mut)">Lo siguiente: el simulacro de restauración, en Ajustes. Es lo que te da la tranquilidad de verdad.</p></div>`,
      init:async()=>{D.onb=steps.length-1;save();if(ghOn()){await flush();await cloudPush(true);await cloudTick();const t=$('#o-fin-t');if(t)t.textContent=CLOUD.err?'La copia no ha subido: '+CLOUD.err+'. Revísalo en Ajustes.':'Primera copia cifrada subida ✓'}},
      next:()=>{delete D.onb;save();enterApp();return 'done'},noBack:true}
  ];
  let st=Math.max(0,Math.min(start||0,steps.length-1));
  if(VAULT&&st<4)st=4;
  async function draw(){
    const S=steps[st],last=st===steps.length-1;
    if(VAULT&&st>=4){D.onb=st;save()}
    el.innerHTML=`<div class="onb-top">${st&&!S.noBack&&!(steps[st-1]&&steps[st-1].lockBack)?`<button class="x" id="o-back" aria-label="Atrás">${ico('arrow')}</button>`:'<span style="width:32px"></span>'}<div class="onb-prog">${steps.map((_,i)=>`<i class="${i<=st?'f':''}"></i>`).join('')}</div><span style="width:32px"></span></div>
    <div class="body">${S.h()}</div>
    <div class="foot"><button class="cta" id="o-next">${st===0?'Empezar':last?'Entrar en Agarrao':'Siguiente'}</button>${S.skip?'<button class="cta ghost" id="o-skip">Saltar este paso</button>':''}</div>`;
    el.scrollTop=0;
    const nx=$('#o-next');if(S.ready&&!S.ready())nx.disabled=true;
    el.querySelectorAll('[data-otog]').forEach(b=>b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);if(b.id==='o-saved'){OB.saved=on;nx.disabled=!on}});
    el.querySelectorAll('[data-odel]').forEach(b=>b.onclick=()=>{const [k,id]=b.dataset.odel.split(':');const arr={acc:D.accounts,fix:D.fixed,loan:D.loans,inv:D.invs}[k];const i=arr.findIndex(x=>x.id===id);if(i>=0)arr.splice(i,1);if(k==='acc')fixDestino();save();draw()});
    nx.onclick=async()=>{nx.disabled=true;let ok=true;if(S.next)ok=await S.next();nx.disabled=false;if(ok==='done'||!ok)return;st++;draw()};
    const sk=$('#o-skip');if(sk)sk.onclick=()=>{st++;draw()};
    const bk=$('#o-back');if(bk)bk.onclick=()=>{st--;draw()};
    if(S.init)S.init();
  }
  el.classList.remove('out');el.setAttribute('aria-hidden','false');draw();
}
function fixDestino(){if(!D.accounts.length)return;const ps=D.accounts.filter(a=>a.piso);if(ps.length&&!ps.some(a=>a.destino)){D.accounts.forEach(a=>a.destino=false);ps[0].destino=true}else if(!D.accounts.some(a=>a.destino))D.accounts[0].destino=true}
function splitBudget(v){const cs=D.cats.map(c=>[c,(CATDEF.find(d=>d.id===c.id)||{mix:0}).mix]);const out=cs.map(([c,m])=>[c,Math.round(v*m/5)*5]);const diff=Math.round(v)-sum(out,x=>x[1]);const s=out.find(x=>x[0].id==='super')||out[0];if(s)s[1]=Math.max(0,s[1]+diff);return out}

/* ================= bienvenida y restaurar ================= */
function welcome(){
  const el=$('#onb');
  el.innerHTML=`<div class="body" style="justify-content:center"><div class="hero-onb"><svg><use href="#logo"/></svg><h2>Agarrao</h2><p class="lead">Más que un chotis. Tu dinero, en este iPhone y cifrado.</p></div></div>
  <div class="foot"><button class="cta" id="w-new">Empezar de cero</button><button class="cta ghost" id="w-rest">Restaurar una copia</button></div>`;
  el.classList.remove('out');el.setAttribute('aria-hidden','false');
  $('#w-new').onclick=()=>{D=blankData();OB={};onboarding(0)};
  $('#w-rest').onclick=restoreFlow;
}
function restoreFlow(){
  const el=$('#onb');const R2={};
  const top=back=>`<div class="onb-top"><button class="x" id="r-back" aria-label="Atrás">${ico('arrow')}</button><div class="onb-prog"></div><span style="width:32px"></span></div>`;
  const s1=()=>{el.innerHTML=`${top()}<div class="body"><h2>Restaurar una copia</h2><p class="lead">De tu repositorio privado de GitHub o de un archivo de copia (iCloud Drive).</p>
    <div class="card" style="padding-block:2px">${txtF('r-o','Usuario de GitHub','usuario')}${txtF('r-r','Repositorio privado','agarrao-copias')}<label class="ff" for="r-t"><span>Token</span><input id="r-t" type="password" autocomplete="off" placeholder="github_pat_…"></label></div>
    <button class="cta" id="r-gh">Buscar la copia en GitHub</button><div class="lbl" style="text-align:center">o</div><button class="cta ghost" id="r-file">Elegir archivo de copia</button></div>`;
    ['r-o','r-r','r-t'].forEach(i=>{const x=$('#'+i);x.autocapitalize='none';x.spellcheck=false});
    $('#r-back').onclick=welcome;
    $('#r-gh').onclick=async()=>{const g={owner:vTxt('r-o'),repo:vTxt('r-r'),token:vTxt('r-t')};if(!g.owner||!g.repo||!g.token){toast('Faltan datos.');return}busy(true,'Buscando…');
      try{await ghTest(g);D={sync:{gh:g}};R2.bk=await cloudPull();D=null;R2.g=g;busy(false);s2()}catch(e){D=null;busy(false);toast(e.status===404?'No hay copia en ese repositorio (o el token no tiene acceso).':e.status===401?'El token no vale.':e.message)}};
    $('#r-file').onclick=async()=>{const bk=await pickFile();if(!bk)return;if(bk.app!=='agarrao'){toast('Ese archivo no es una copia de Agarrao.');return}R2.bk=bk;s2()}};
  const s2=()=>{el.innerHTML=`${top()}<div class="body"><h2>Tu frase</h2><p class="lead">Copia del ${dmy(R2.bk.created.slice(0,10))}. Pon la frase de 12 palabras que tienes en Contraseñas.</p>
    <textarea class="note" id="r-ph" rows="3" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="las doce palabras"></textarea></div><div class="foot"><button class="cta" id="r-go">Abrir la copia</button></div>`;
    $('#r-back').onclick=s1;
    $('#r-go').onclick=async()=>{const v=$('#r-ph').value;if(!phraseOk(v)){toast('Tienen que ser las 12 palabras.');return}busy(true,'Abriendo…');try{const r=await openBackup(R2.bk,v);R2.key=r.key;R2.data=r.data;R2.ph=normPhrase(v);busy(false);s3()}catch(e){busy(false);toast('Esa frase no abre esta copia.')}}};
  const s3=()=>{el.innerHTML=`${top()}<div class="body"><h2>PIN nuevo</h2><p class="lead">Copia abierta ✓. Elige el PIN para este iPhone.</p>${pinPad('rp')}</div>`;
    $('#r-back').onclick=s2;
    let first=null;bindPin('rp',async(p,c)=>{if(!first){first=p;c.reset();c.msg('Repítelo');return}if(p!==first){first=null;c.reset('No coinciden. Otra vez.');return}
      c.busy=true;c.msg('Cifrando…');busy(true,'Guardando en este iPhone…');
      try{DEK=R2.key;VAULT={v:1,wraps:{pin:await wrapSecret(DEK,p),phrase:R2.bk.phrase},data:null,updated:Date.now()};D=R2.data;D.phrase=R2.ph;if(R2.g&&!ghOn())D.sync.gh=R2.g;delete D.onb;refreshT();runCloses();await flush();await failsReset();busy(false);s4()}
      catch(e){busy(false);c.busy=false;c.reset('Algo ha fallado: '+e.message)}})};
  const s4=()=>{el.innerHTML=`<div class="body"><div class="hero-onb"><svg><use href="#logo"/></svg><h2>Todo de vuelta.</h2><p class="lead">${D.movs.length} gastos, ${D.accounts.length} cuentas y ${D.hist.length} meses de histórico. ¿Activamos Face ID?</p></div></div>
    <div class="foot"><button class="cta" id="r-face">Activar Face ID</button><button class="cta ghost" id="r-in">Ahora no, entrar</button></div>`;
    $('#r-face').onclick=async()=>{busy(true,'Face ID…');try{await faceEnable();toast('Face ID activado.')}catch(e){toast(e.message==='prf-no'?'Este iPhone no lo permite aquí. Seguimos con el PIN.':'No se ha activado. Puedes hacerlo en Ajustes.')}busy(false);enterApp()};
    $('#r-in').onclick=enterApp};
  s1();
}

/* ================= instalación ================= */
const standalone=()=>navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;
function installScreen(){return new Promise(res=>{
  const el=$('#inst');el.classList.remove('out');el.setAttribute('aria-hidden','false');
  el.innerHTML=`<div class="body" style="justify-content:center;gap:18px"><div class="hero-onb" style="padding-top:0"><svg><use href="#logo"/></svg><h2>Instálala primero</h2></div>
  <ol class="inst-steps"><li>Toca el botón <b>Compartir</b> de Safari (el cuadrado con la flecha).</li><li>Elige <b>Añadir a pantalla de inicio</b> → Añadir.</li><li>Cierra Safari y abre <b>Agarrao</b> desde su icono.</li></ol>
  <p class="lead" style="font-size:14px;color:var(--mut)">Importante: en una pestaña de Safari, iOS puede borrar los datos de la web si pasas unos días sin abrirla, y la app instalada guarda los suyos aparte. Mete tus datos solo en la app instalada.</p></div>
  <div class="foot"><button class="cta ghost" id="inst-go">Seguir en el navegador (solo para probar)</button></div>`;
  $('#inst-go').onclick=()=>{el.classList.add('out');el.setAttribute('aria-hidden','true');res()};
})}

/* ================= ciclo de vida ================= */
let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){hiddenAt=Date.now();if(D)flush();return}
  if(!D)return;
  const away=(Date.now()-hiddenAt)/1000,ext=!!U.ext&&hiddenAt>=U.ext&&hiddenAt-U.ext<5000;U.ext=0;
  const lim=Math.max(D.settings.autoLock||0,ext?180:8);
  if(VAULT&&VAULT.data&&D.onb==null&&away>lim){lockNow();return}
  const old=T.iso;refreshT();if(T.iso!==old){if(runCloses())save();rr()}
});
window.addEventListener('pagehide',()=>{if(D)flush()});
setInterval(()=>{if(!D||U.locked)return;const old=T.iso;refreshT();if(T.iso!==old){if(runCloses())save();rr()}},60000);

/* ================= arranque ================= */
async function boot(){
  bindUI();
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')&&!window.__NOSW){
    navigator.serviceWorker.register('sw.js').then(reg=>{swReg=reg;if(reg.waiting&&navigator.serviceWorker.controller)showUpd();
      reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpd()})})}).catch(e=>console.warn(e));
    let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
  }
  if(!standalone()&&!/[?&]web\b/.test(location.search))await installScreen();
  try{PREFS=(await kvGet('prefs'))||{}}catch(e){PREFS={}}
  let v=null;try{v=await vaultLoad()}catch(e){console.error(e);toast('No puedo abrir el almacenamiento de este iPhone.');return}
  if(v&&v.data)showLock();else welcome();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

})();
