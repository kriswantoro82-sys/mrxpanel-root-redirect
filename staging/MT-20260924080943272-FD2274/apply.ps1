Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$ScriptId='MRX-TICKET-V1-OFFICE-PALETTE-FAQ-R2-20260924-M1'
$TaskKey='MT-20260924080943272-FD2274'
$Canonical='C:\MRXPANEL_MIGRATION_CONTROL\TICKET-SUPPORT-V1-MEMBER-BRAND-20260924-M1-CE6745\member-candidate'
$Work='C:\MRXPANEL_MIGRATION_CONTROL\TICKET-SUPPORT-V1-OFFICE-PALETTE-FAQ-R2-20260924-FD2274'
$Candidate=Join-Path $Work 'member-candidate'
$Wrangler='C:\Users\user\AppData\Local\npm-cache\_npx\38f3295754dfa028\node_modules\.bin\wrangler.cmd'

function Sha([string]$p){ (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash }
function Text([string]$p){ [IO.File]::ReadAllText($p,[Text.Encoding]::UTF8) }
function AssertHash([string]$label,[string]$path,[string]$expected){
  if(!(Test-Path -LiteralPath $path)){ throw ($label+'_MISSING') }
  $h=Sha $path
  Write-Output ($label+'_SHA='+$h)
  if($h -ne $expected){ throw ($label+'_HASH_MISMATCH') }
}
function SafeLines([string]$prefix,$lines){
  foreach($line in $lines){
    $s=[string]$line
    if($s -match '(?i)(authorization|bearer|service[_ -]?role|api[_ -]?key|secret|token)'){ continue }
    if($s.Length -gt 900){ $s=$s.Substring(0,900) }
    Write-Output ($prefix+$s)
  }
}
function FetchSha([string]$name,[string]$url,[string]$expected,[string]$dir){
  $p=Join-Path $dir $name
  $stamp=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  Invoke-WebRequest -Uri ($url+'?fd2274='+$stamp) -Headers @{'Cache-Control'='no-cache';'Pragma'='no-cache'} -UseBasicParsing -OutFile $p -TimeoutSec 30
  $h=Sha $p
  Write-Output ('PRELIVE_HASH='+$name+'|SHA='+$h)
  if($h -ne $expected){ throw ('PRELIVE_HASH_MISMATCH_'+$name) }
}

Write-Output ('COPY_START|ScriptId='+$ScriptId)
Write-Output ('TASK_KEY='+$TaskKey)
Write-Output 'MODE=OFFICE_LOCAL_FILE_STAGING_UI_ONLY'
Write-Output 'DATABASE_MUTATION=False'
Write-Output 'BACKEND_MUTATION=False'
Write-Output 'RLS_MUTATION=False'
Write-Output 'EDGE_FUNCTION_MUTATION=False'
Write-Output 'ADMIN_MUTATION=False'
Write-Output 'FINANCE_MUTATION=False'
Write-Output 'ORDER_MUTATION=False'
Write-Output 'PROVIDER_MUTATION=False'
Write-Output 'ROUTING_MUTATION=False'
Write-Output 'DOMAIN_MUTATION=False'
Write-Output 'AUTOMATIC_RETRY=False'
Write-Output 'MAX_ATTEMPTS=1'

if($env:COMPUTERNAME -ne 'PTMRXPANELMEDIA'){ throw 'UNEXPECTED_HOST' }
if(!(Test-Path -LiteralPath $Canonical)){ throw 'CANONICAL_MEMBER_SOURCE_MISSING' }
if(!(Test-Path -LiteralPath $Wrangler)){ throw 'WRANGLER_NOT_FOUND' }
if(Test-Path -LiteralPath $Work){ throw 'WORK_PATH_ALREADY_EXISTS_NEVER_RERUN' }

# Phase 1: READ_ONLY reconciliation immediately before any product mutation.
AssertHash 'CANONICAL_INDEX' (Join-Path $Canonical 'index.html') '91BCF39A146D027C532DFEB5DE34D4BB2D5E697209E705A7824E33AA28E865AA'
AssertHash 'CANONICAL_CORE_APP' (Join-Path $Canonical 'assets\index-Cz0wRJHq-va-fixed-v1.js') 'D0D17031297FC52C4FBE65815EA7BE0140C7D850916998CE789D72C7866862AE'
AssertHash 'CANONICAL_CORE_CSS' (Join-Path $Canonical 'assets\index-DHTBarIp.css') '2DAAC2F9694337B1BC0BB22AA3A4984F22610FBED661FFC1D427BE77BAF2751E'
AssertHash 'CANONICAL_TICKET_JS' (Join-Path $Canonical 'ticket-support-v1-member.js') 'F37C8B014D49D44D9098A6CE362FB9A1B08071A743E7CA8C72BD26D0EB1D0784'
AssertHash 'CANONICAL_TICKET_CSS' (Join-Path $Canonical 'ticket-support-v1.css') 'B564E3399726B69615E95FA20AD21BD11DAFF460476C74FCD8FE5E87D9B0770A'

$tmp=Join-Path $env:TEMP ('mrx-ticket-fd2274-pre-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force|Out-Null
try{
  FetchSha 'INDEX' 'https://member.mrxpanel.com/' '91BCF39A146D027C532DFEB5DE34D4BB2D5E697209E705A7824E33AA28E865AA' $tmp
  FetchSha 'CORE_APP' 'https://member.mrxpanel.com/assets/index-Cz0wRJHq-va-fixed-v1.js' 'D0D17031297FC52C4FBE65815EA7BE0140C7D850916998CE789D72C7866862AE' $tmp
  FetchSha 'CORE_CSS' 'https://member.mrxpanel.com/assets/index-DHTBarIp.css' '2DAAC2F9694337B1BC0BB22AA3A4984F22610FBED661FFC1D427BE77BAF2751E' $tmp
  FetchSha 'TICKET_JS' 'https://member.mrxpanel.com/ticket-support-v1-member.js' 'F37C8B014D49D44D9098A6CE362FB9A1B08071A743E7CA8C72BD26D0EB1D0784' $tmp
  FetchSha 'TICKET_CSS' 'https://member.mrxpanel.com/ticket-support-v1.css' 'B564E3399726B69615E95FA20AD21BD11DAFF460476C74FCD8FE5E87D9B0770A' $tmp
} finally {
  if(Test-Path $tmp){ Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}
Write-Output 'READ_ONLY_RECON=PASS'

# Phase 2: local candidate mutation only.
New-Item -ItemType Directory -Path $Work -Force|Out-Null
Copy-Item -LiteralPath $Canonical -Destination $Candidate -Recurse -Force
$jsPath=Join-Path $Candidate 'ticket-support-v1-member.js'
$cssPath=Join-Path $Candidate 'ticket-support-v1.css'
$jsBefore=Text $jsPath
$cssBefore=Text $cssPath
$rpcBefore=[regex]::Matches($jsBefore,'support_ticket_v1_[a-z0-9_]+')|ForEach-Object{$_.Value}|Sort-Object -Unique
$innerBefore=([regex]::Matches($jsBefore,'\.innerHTML')).Count

$faqJs=@'

/* MRXPANEL Ticket Support FAQ R2 — presentation only, no RPC changes */
(()=>{
  'use strict';
  const FAQ_ID='mrxTicketSupportV1Faq';
  const FAQ_SEARCH_ID='mrxTicketSupportV1FaqSearch';
  const FAQS=[
    ['Pesanan lama diproses','Status Processing berarti pesanan masih dikerjakan. Periksa estimasi layanan dan tunggu sampai batas estimasi wajar. Jika sudah jauh melewati estimasi, buat tiket dan sertakan ID pesanan agar tim dapat memeriksa.'],
    ['Arti status Pending, Processing, Completed, Partial, Canceled','Pending: pesanan menunggu proses. Processing: sedang dikerjakan. Completed: sistem mencatat selesai. Partial: hanya sebagian kuantitas yang selesai dan penyesuaian mengikuti hasil sistem. Canceled: pesanan dibatalkan. Bila status tidak sesuai kondisi nyata, buat tiket untuk pemeriksaan.'],
    ['Refill','Refill hanya berlaku untuk layanan yang memang memiliki jaminan refill dan masih berada dalam periode yang berlaku. Sertakan ID pesanan dan jelaskan jumlah penurunan. Tim akan memeriksa kelayakannya terlebih dahulu.'],
    ['Salah link atau target','Pastikan link atau target benar sebelum membuat pesanan. Jika pesanan sudah dikirim ke sistem, perubahan tidak selalu dapat dilakukan. Buat tiket secepatnya; keputusan berikutnya memerlukan pemeriksaan admin.'],
    ['Deposit belum masuk','Pastikan transaksi pembayaran sudah berhasil dan beri waktu untuk proses verifikasi. Jika saldo belum bertambah setelah transaksi berhasil, buat tiket dengan waktu transaksi dan referensi pembayaran yang aman untuk dibagikan.'],
    ['Saldo akun','Saldo berubah setelah deposit, penggunaan layanan, atau penyesuaian resmi. Jika ada selisih yang tidak dipahami, buat tiket. Pemeriksaan saldo dan transaksi sensitif dilakukan oleh admin atau owner.'],
    ['Refund atau cancel','Refund atau cancel tidak otomatis dijanjikan. Kelayakannya bergantung pada status pesanan, hasil provider, dan kondisi transaksi. Kasus ini selalu memerlukan pemeriksaan admin atau owner sebelum tindakan apa pun.'],
    ['Estimasi pengerjaan','Estimasi adalah perkiraan, bukan jaminan waktu selesai. Kecepatan dapat berubah karena antrean dan kondisi layanan. Buat tiket jika pesanan melewati estimasi secara tidak wajar atau statusnya tidak bergerak.'],
    ['Kapan perlu membuat tiket?','Buat tiket jika masalah tidak terjawab di ringkasan ini: pesanan melewati estimasi, status tidak sesuai, refill yang memenuhi syarat, deposit atau saldo tidak sinkron, atau ada masalah akun yang memerlukan pemeriksaan. Sertakan ID pesanan bila terkait pesanan.'],
    ['Kapan admin atau owner diperlukan?','Admin atau owner diperlukan untuk kasus sensitif seperti refund, cancel, selisih saldo, deposit bermasalah, pemeriksaan provider manual, atau keputusan yang dapat mengubah transaksi. Maya Support tidak melakukan tindakan finansial atau order sensitif secara otomatis.']
  ];
  const textOf=(el)=>(el?.innerText||el?.textContent||'').trim();

  const findCreateButton=(shell)=>[...shell.querySelectorAll('button,a,[role="button"]')]
    .find((el)=>!el.closest('#'+FAQ_ID) && /Buat\s*Tiket/i.test(textOf(el)));

  const makeFaq=()=>{
    const section=document.createElement('section');
    section.id=FAQ_ID;
    section.className='mrx-ticket-v1-faq';
    section.setAttribute('aria-label','Ringkasan Tanya Jawab');

    const head=document.createElement('div');
    head.className='mrx-ticket-v1-faq-head';
    const copy=document.createElement('div');
    const kicker=document.createElement('span');
    kicker.className='mrx-ticket-v1-faq-kicker';
    kicker.textContent='PUSAT BANTUAN';
    const title=document.createElement('h3');
    title.textContent='Ringkasan Tanya Jawab';
    const intro=document.createElement('p');
    intro.textContent='Cari jawaban singkat sebelum membuat tiket.';
    copy.append(kicker,title,intro);
    head.appendChild(copy);

    const searchWrap=document.createElement('label');
    searchWrap.className='mrx-ticket-v1-faq-search';
    const searchLabel=document.createElement('span');
    searchLabel.textContent='Cari topik';
    const search=document.createElement('input');
    search.id=FAQ_SEARCH_ID;
    search.type='search';
    search.placeholder='Contoh: refund, processing, deposit';
    search.autocomplete='off';
    searchWrap.append(searchLabel,search);

    const list=document.createElement('div');
    list.className='mrx-ticket-v1-faq-list';
    FAQS.forEach(([question,answer])=>{
      const details=document.createElement('details');
      details.className='mrx-ticket-v1-faq-item';
      details.dataset.search=(question+' '+answer).toLowerCase();
      const summary=document.createElement('summary');
      summary.textContent=question;
      const body=document.createElement('p');
      body.textContent=answer;
      details.append(summary,body);
      list.appendChild(details);
    });

    const empty=document.createElement('p');
    empty.className='mrx-ticket-v1-faq-empty';
    empty.textContent='Topik tidak ditemukan. Kamu tetap bisa membuat tiket.';
    empty.hidden=true;

    const actions=document.createElement('div');
    actions.className='mrx-ticket-v1-faq-actions';
    const hint=document.createElement('span');
    hint.textContent='Masalah belum selesai?';
    const cta=document.createElement('button');
    cta.type='button';
    cta.className='mrx-ticket-v1-faq-cta';
    cta.textContent='Buat Tiket';
    cta.addEventListener('click',()=>{
      const shell=document.getElementById('mrxTicketSupportV1Member');
      const native=shell&&findCreateButton(shell);
      if(native instanceof HTMLElement) native.click();
    });
    actions.append(hint,cta);

    search.addEventListener('input',()=>{
      const q=search.value.trim().toLowerCase();
      let visible=0;
      list.querySelectorAll('.mrx-ticket-v1-faq-item').forEach((item)=>{
        const show=!q || (item.dataset.search||'').includes(q);
        item.hidden=!show;
        if(show) visible++;
      });
      empty.hidden=visible!==0;
    });

    section.append(head,searchWrap,list,empty,actions);
    return section;
  };

  const mountFaq=()=>{
    const shell=document.getElementById('mrxTicketSupportV1Member');
    if(!shell || shell.classList.contains('mrx-ticket-v1-hidden')) return;
    if(shell.querySelector('#'+FAQ_ID)) return;
    const toolbar=shell.querySelector('.mrx-ticket-v1-toolbar');
    if(!toolbar || !toolbar.parentElement) return;
    const section=makeFaq();
    toolbar.insertAdjacentElement('afterend',section);
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',mountFaq,{once:true});
  }else{
    mountFaq();
  }
  const observer=new MutationObserver(()=>mountFaq());
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
'@

$paletteCss=@'

/* MRXPANEL Office Palette + FAQ R2 — exact charcoal/gold/neutral presentation */
:root{
  --mrx-ticket-charcoal:#111318;
  --mrx-ticket-charcoal-2:#171A20;
  --mrx-ticket-gold:#F1CC6C;
  --mrx-ticket-gold-strong:#D6A73A;
  --mrx-ticket-white:#FFFFFF;
  --mrx-ticket-muted:#9297A0;
  --mrx-ticket-muted-light:#AEB4BF;
  --mrx-ticket-line:#2A2F38;
  --mrx-ticket-soft:#F5F5F5;
}
.mrx-ticket-v1-quick-launcher{
  border-color:#D6A73A!important;
  background:linear-gradient(135deg,#F1CC6C,#D6A73A)!important;
  color:#111318!important;
  box-shadow:0 14px 34px rgba(17,19,24,.28)!important;
}
.mrx-ticket-v1-quick-launcher:hover{box-shadow:0 18px 42px rgba(17,19,24,.34)!important}
.mrx-ticket-v1-quick-launcher:focus-visible{outline:3px solid #D6A73A!important;outline-offset:3px}
.mrx-ticket-v1-quick-icon{background:#111318!important;color:#F1CC6C!important}
.mrx-ticket-v1-quick-copy small{color:#171A20!important}
.mrx-ticket-v1-shell{color:#111318!important}
.mrx-ticket-v1-backdrop{background:rgba(17,19,24,.76)!important}
.mrx-ticket-v1-panel.mrx-ticket-v1-member-panel{background:#F5F5F5!important;border-color:#AEB4BF!important;color:#111318!important;box-shadow:0 22px 60px rgba(17,19,24,.24)!important}
.mrx-ticket-v1-header{background:linear-gradient(135deg,#111318,#171A20)!important;color:#FFFFFF!important;border-bottom-color:#2A2F38!important}
.mrx-ticket-v1-eyebrow,.mrx-ticket-v1-kicker{color:#F1CC6C!important}
.mrx-ticket-v1-icon-button{border-color:#9297A0!important;background:#2A2F38!important;color:#FFFFFF!important}
.mrx-ticket-v1-icon-button:hover,.mrx-ticket-v1-icon-button:focus-visible{border-color:#F1CC6C!important;box-shadow:0 0 0 3px rgba(214,167,58,.2)!important}
.mrx-ticket-v1-member-grid{background:#F5F5F5!important}
.mrx-ticket-v1-sidebar{border-color:#AEB4BF!important}
.mrx-ticket-v1-toolbar strong,.mrx-ticket-v1-toolbar h2,.mrx-ticket-v1-toolbar h3{color:#111318!important}
.mrx-ticket-v1-primary,.mrx-ticket-v1-faq-cta{
  border:1px solid #D6A73A!important;
  background:linear-gradient(135deg,#F1CC6C,#D6A73A)!important;
  color:#111318!important;
  box-shadow:0 6px 16px rgba(214,167,58,.22)!important;
}
.mrx-ticket-v1-primary:focus-visible,.mrx-ticket-v1-faq-cta:focus-visible{outline:3px solid rgba(214,167,58,.25)!important;outline-offset:2px}
.mrx-ticket-v1-secondary{border-color:#AEB4BF!important;background:#FFFFFF!important;color:#171A20!important}
.mrx-ticket-v1-ticket-card{background:#FFFFFF!important;border-color:#AEB4BF!important;color:#111318!important;box-shadow:0 5px 16px rgba(17,19,24,.06)!important}
.mrx-ticket-v1-ticket-card:hover,.mrx-ticket-v1-ticket-card:focus-within{border-color:#D6A73A!important;box-shadow:0 9px 22px rgba(17,19,24,.1)!important}
.mrx-ticket-v1-main{background:#F5F5F5!important}
.mrx-ticket-v1-empty,.mrx-ticket-v1-detail-head,.mrx-ticket-v1-reply,.mrx-ticket-v1-status:not(:empty){background:#FFFFFF!important;border-color:#AEB4BF!important;color:#171A20!important}
.mrx-ticket-v1-thread{background:#F5F5F5!important;border-color:#AEB4BF!important}
.mrx-ticket-v1-message{background:#FFFFFF!important;border-color:#AEB4BF!important;color:#111318!important;box-shadow:0 4px 12px rgba(17,19,24,.05)!important}
.mrx-ticket-v1-compose{background:rgba(17,19,24,.62)!important}
.mrx-ticket-v1-compose-card{background:#F5F5F5!important;border-color:#AEB4BF!important;box-shadow:0 22px 60px rgba(17,19,24,.24)!important}
.mrx-ticket-v1-compose-card input,.mrx-ticket-v1-compose-card textarea,.mrx-ticket-v1-compose-card select,.mrx-ticket-v1-reply textarea{
  border-color:#AEB4BF!important;background:#FFFFFF!important;color:#111318!important
}
.mrx-ticket-v1-compose-card input:focus,.mrx-ticket-v1-compose-card textarea:focus,.mrx-ticket-v1-compose-card select:focus,.mrx-ticket-v1-reply textarea:focus{
  border-color:#D6A73A!important;box-shadow:0 0 0 3px rgba(214,167,58,.2)!important
}
.mrx-ticket-v1-status{color:#9297A0!important}

/* FAQ */
.mrx-ticket-v1-faq{
  margin:0 12px 10px;
  padding:14px;
  border:1px solid #AEB4BF;
  border-radius:18px;
  background:#FFFFFF;
  color:#111318;
  box-shadow:0 5px 16px rgba(17,19,24,.05);
}
.mrx-ticket-v1-faq-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
.mrx-ticket-v1-faq-kicker{display:block;color:#D6A73A;font-size:10px;font-weight:900;letter-spacing:.1em;margin-bottom:3px}
.mrx-ticket-v1-faq h3{margin:0;color:#111318;font-size:15px;line-height:1.25}
.mrx-ticket-v1-faq-head p{margin:4px 0 0;color:#9297A0;font-size:12px}
.mrx-ticket-v1-faq-search{display:grid;gap:5px;margin:8px 0 10px;color:#171A20;font-size:11px;font-weight:800}
.mrx-ticket-v1-faq-search input{
  width:100%;box-sizing:border-box;border:1px solid #AEB4BF;border-radius:12px;background:#F5F5F5;color:#111318;padding:9px 10px;font:inherit;outline:none
}
.mrx-ticket-v1-faq-search input:focus{border-color:#D6A73A;box-shadow:0 0 0 3px rgba(214,167,58,.18)}
.mrx-ticket-v1-faq-list{display:grid;gap:7px}
.mrx-ticket-v1-faq-item{border:1px solid #AEB4BF;border-radius:13px;background:#FFFFFF;overflow:hidden}
.mrx-ticket-v1-faq-item[hidden]{display:none}
.mrx-ticket-v1-faq-item summary{
  list-style:none;cursor:pointer;padding:9px 11px;color:#171A20;font-size:12px;font-weight:800;position:relative;padding-right:30px
}
.mrx-ticket-v1-faq-item summary::-webkit-details-marker{display:none}
.mrx-ticket-v1-faq-item summary::after{content:'+';position:absolute;right:11px;top:8px;color:#D6A73A;font-size:16px;font-weight:900}
.mrx-ticket-v1-faq-item[open] summary{background:#F5F5F5;color:#111318}
.mrx-ticket-v1-faq-item[open] summary::after{content:'−'}
.mrx-ticket-v1-faq-item p{margin:0;padding:0 11px 10px;color:#9297A0;font-size:11.5px;line-height:1.5}
.mrx-ticket-v1-faq-empty{margin:8px 0 0;padding:9px 10px;border-radius:12px;background:#F5F5F5;color:#9297A0;font-size:11px}
.mrx-ticket-v1-faq-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid #AEB4BF}
.mrx-ticket-v1-faq-actions span{color:#9297A0;font-size:11px}
.mrx-ticket-v1-faq-cta{min-height:34px;padding:7px 11px;border-radius:11px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}
@media(max-width:720px){
  .mrx-ticket-v1-faq{margin:0 10px 9px;padding:12px;border-radius:16px}
  .mrx-ticket-v1-faq-head{display:block}
  .mrx-ticket-v1-faq-list{max-height:250px;overflow:auto;padding-right:2px}
  .mrx-ticket-v1-faq-actions{align-items:flex-start;flex-direction:column}
  .mrx-ticket-v1-faq-cta{width:100%}
}
'@

# Remove prior dominant navy/indigo helper colors from the existing ticket CSS,
# while preserving restrained semantic status colors.
$cssPatched=$cssBefore
$replacements=@(
  @('#111827','#111318'),
  @('#312e81','#171A20'), @('#312E81','#171A20'),
  @('#818cf8','#D6A73A'), @('#818CF8','#D6A73A'),
  @('#6366f1','#D6A73A'), @('#6366F1','#D6A73A'),
  @('#ffe39a','#F1CC6C'), @('#FFE39A','#F1CC6C'),
  @('#eabf4f','#D6A73A'), @('#EABF4F','#D6A73A'),
  @('#f4f6f9','#F5F5F5'), @('#F4F6F9','#F5F5F5'),
  @('#eef2f7','#F5F5F5'), @('#EEF2F7','#F5F5F5'),
  @('#0f172a','#111318'), @('#0F172A','#111318'),
  @('#334155','#171A20'),
  @('#475569','#9297A0'),
  @('#64748b','#9297A0'), @('#64748B','#9297A0'),
  @('#c7d2fe','#F1CC6C'), @('#C7D2FE','#F1CC6C'),
  @('#e2e8f0','#AEB4BF'), @('#E2E8F0','#AEB4BF'),
  @('#cbd5e1','#AEB4BF'), @('#CBD5E1','#AEB4BF'),
  @('#e5e7eb','#AEB4BF'), @('#E5E7EB','#AEB4BF')
)
foreach($pair in $replacements){ $cssPatched=$cssPatched.Replace([string]$pair[0],[string]$pair[1]) }
$cssPatched=$cssPatched.Replace('rgba(99,102,241,.4)','rgba(214,167,58,.4)')
$cssPatched=$cssPatched.Replace('rgba(99,102,241,.12)','rgba(214,167,58,.18)')
$cssPatched=$cssPatched.Replace('rgba(15,23,42','rgba(17,19,24')

$utf8=[Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText($jsPath,($jsBefore+$faqJs),$utf8)
[IO.File]::WriteAllText($cssPath,($cssPatched+$paletteCss),$utf8)

$jsAfter=Text $jsPath
$cssAfter=Text $cssPath

# Candidate contract/security guards.
$nodeOut=& node --check $jsPath 2>&1
$nodeExit=$LASTEXITCODE
SafeLines 'NODE=' $nodeOut
Write-Output ('NODE_SYNTAX_EXIT='+$nodeExit)
if($nodeExit -ne 0){ throw 'NODE_SYNTAX_FAILED' }

$rpcAfter=[regex]::Matches($jsAfter,'support_ticket_v1_[a-z0-9_]+')|ForEach-Object{$_.Value}|Sort-Object -Unique
$expectedRpc='support_ticket_v1_add_message,support_ticket_v1_close,support_ticket_v1_create,support_ticket_v1_list,support_ticket_v1_messages,support_ticket_v1_read,support_ticket_v1_reopen'
if(($rpcBefore -join ',') -ne ($rpcAfter -join ',')){ throw 'RPC_SET_CHANGED' }
if(($rpcAfter -join ',') -ne $expectedRpc){ throw 'RPC_SET_NOT_EXACT' }
if(([regex]::Matches($jsAfter,'\.innerHTML')).Count -ne $innerBefore){ throw 'DYNAMIC_RENDERING_SURFACE_CHANGED' }
if(!$jsAfter.Contains('textContent')){ throw 'TEXTCONTENT_GUARD_MISSING' }
if(!$jsAfter.Contains('mrxTicketSupportV1Faq') -or !$jsAfter.Contains('Ringkasan Tanya Jawab') -or !$jsAfter.Contains('Refund atau cancel')){ throw 'FAQ_CANDIDATE_MISSING' }
if(!$cssAfter.Contains('#111318') -or !$cssAfter.Contains('#171A20') -or !$cssAfter.Contains('#F1CC6C') -or !$cssAfter.Contains('#D6A73A')){ throw 'PALETTE_TOKENS_MISSING' }
if($cssAfter.Contains('#312e81') -or $cssAfter.Contains('#312E81') -or $cssAfter.Contains('#818cf8') -or $cssAfter.Contains('#818CF8')){ throw 'INDIGO_DOMINANT_TOKEN_REMAINS' }
if([regex]::IsMatch(($jsAfter+$cssAfter),'(?i)(SUPABASE_SERVICE_ROLE_KEY|service[_-]?role[_-]?key)')){ throw 'SERVICE_ROLE_EXPOSURE' }
if([regex]::IsMatch(($jsAfter+$cssAfter),'(?i)(internal[_-]?cost|provider[_-]?cost|cost_basis_secret)')){ throw 'INTERNAL_COST_EXPOSURE' }
if([regex]::IsMatch(($jsAfter+$cssAfter),'(?i)(provider[_-]?routing|routing[_-]?secret|provider[_-]?api[_-]?key)')){ throw 'PROVIDER_ROUTING_EXPOSURE' }
if([regex]::IsMatch($jsAfter,'(?i)(wallet_adjust|balance_adjust|refund_order|refund_wallet|order_create|provider_submit|debit_wallet|credit_wallet|manage-mrxpanel-order-action)')){ throw 'FINANCE_ORDER_MUTATION_SURFACE' }

AssertHash 'CANDIDATE_INDEX' (Join-Path $Candidate 'index.html') '91BCF39A146D027C532DFEB5DE34D4BB2D5E697209E705A7824E33AA28E865AA'
AssertHash 'CANDIDATE_CORE_APP' (Join-Path $Candidate 'assets\index-Cz0wRJHq-va-fixed-v1.js') 'D0D17031297FC52C4FBE65815EA7BE0140C7D850916998CE789D72C7866862AE'
AssertHash 'CANDIDATE_CORE_CSS' (Join-Path $Candidate 'assets\index-DHTBarIp.css') '2DAAC2F9694337B1BC0BB22AA3A4984F22610FBED661FFC1D427BE77BAF2751E'
$afterJs=Sha $jsPath
$afterCss=Sha $cssPath
Write-Output ('WORK_PATH='+$Work)
Write-Output ('BEFORE_TICKET_JS_SHA=F37C8B014D49D44D9098A6CE362FB9A1B08071A743E7CA8C72BD26D0EB1D0784')
Write-Output ('BEFORE_TICKET_CSS_SHA=B564E3399726B69615E95FA20AD21BD11DAFF460476C74FCD8FE5E87D9B0770A')
Write-Output ('AFTER_TICKET_JS_SHA='+$afterJs)
Write-Output ('AFTER_TICKET_CSS_SHA='+$afterCss)
Write-Output ('RPC_SET='+($rpcAfter -join ','))
Write-Output 'FAQ_GUARD=PASS'
Write-Output 'PALETTE_GUARD=PASS'
Write-Output 'CORE_HASH_GUARD=PASS'
Write-Output 'CANDIDATE_GUARD=PASS'

# Phase 3: one and only one external product mutation: Member Pages deploy.
$deployOut=& $Wrangler pages deploy $Candidate --project-name mrxpanel-member-staging --branch main 2>&1
$deployExit=$LASTEXITCODE
Write-Output ('MEMBER_WRANGLER_EXIT='+$deployExit)
SafeLines 'MEMBER_WRANGLER=' $deployOut
if($deployExit -ne 0){ throw 'MEMBER_PALETTE_FAQ_DEPLOY_FAILED' }

$proof=Join-Path $Work 'DEPLOY-PROOF.txt'
@(
  'TaskKey='+$TaskKey,
  'ScriptId='+$ScriptId,
  'WorkPath='+$Work,
  'IndexSHA=91BCF39A146D027C532DFEB5DE34D4BB2D5E697209E705A7824E33AA28E865AA',
  'CoreAppSHA=D0D17031297FC52C4FBE65815EA7BE0140C7D850916998CE789D72C7866862AE',
  'CoreCssSHA=2DAAC2F9694337B1BC0BB22AA3A4984F22610FBED661FFC1D427BE77BAF2751E',
  'TicketJsBefore=F37C8B014D49D44D9098A6CE362FB9A1B08071A743E7CA8C72BD26D0EB1D0784',
  'TicketCssBefore=B564E3399726B69615E95FA20AD21BD11DAFF460476C74FCD8FE5E87D9B0770A',
  'TicketJsAfter='+$afterJs,
  'TicketCssAfter='+$afterCss,
  'DeployExit='+$deployExit,
  'ExternalDeployCount=1'
) | Set-Content -LiteralPath $proof -Encoding UTF8

Write-Output 'EXTERNAL_DEPLOY_COUNT=1'
Write-Output 'MEMBER_PALETTE_FAQ_DEPLOY=PASS'
Write-Output ('DEPLOY_PROOF_PATH='+$proof)
Write-Output ('COPY_END|ScriptId='+$ScriptId)
