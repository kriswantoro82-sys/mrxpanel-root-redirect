#!/usr/bin/env node
"use strict";
/*
 * PR27 only: validate OG7 staged metadata against immutable PR25 HEAD.
 * Review PASS never means production approval.
 * No network calls, no file writes, no customer data, no deployment.
 */
const fs=require("node:fs"),cp=require("node:child_process"),crypto=require("node:crypto");
const assert=require("node:assert/strict");
const mode=process.argv[2]||"--mode=review";
const review=mode==="--mode=review", staged=mode==="--mode=approved-artwork-review", release=mode==="--mode=release";
if(!review&&!staged&&!release)throw Error("MODE_MUST_BE_REVIEW_STAGED_OR_RELEASE");
const manifestPath="review/og-seven-on-pr25-20261031/REVIEW_ONLY_RELEASE_GATE.json";
const m=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const base="462b3c7e8d09864b307fc69096c51d1df2a0edaa";
const pngPath="assets/mrxpanel-og-1200x630.png";
const url="https://mrxpanel.com/"+pngPath;
const paths=[
 "index.html","panduan-reseller/index.html","cara-menggunakan-panel-smm/index.html",
 "memilih-provider-smm/index.html","apa-itu-panel-smm/index.html",
 "api-panel-smm-reseller/index.html","kalkulator-harga-jual-reseller-smm/index.html"
];
const kinds=["og:image","og:image:secure_url","og:image:type","og:image:width",
 "og:image:height","og:image:alt","twitter:image","twitter:card"];
const fail=(message)=>{throw Error("OG7_GATE_FAIL:"+message)};
const attr=(tag,name)=>{
 const mat=tag.match(new RegExp("\\b"+name+"\\s*=\\s*([\"'])(.*?)\\1","i"));
 return mat?mat[2]:null;
};
const head=x=>x.match(/^[\s\S]*?<\/head>/i)?.[0]||fail("MISSING_HTML_HEAD");
const body=x=>x.slice(head(x).length);
const tags=x=>[...head(x).matchAll(/<meta\b[^>]*>/gi)].map(x=>x[0]);
const key=t=>attr(t,"property")||attr(t,"name");
const namedTag=(x,name)=>tags(x).filter(t=>key(t)===name);
const textBetween=(x,name)=>[...x.matchAll(new RegExp("<"+name+"\\b[^>]*>[\\s\\S]*?<\\/"+name+">","gi"))].map(x=>x[0]);
const keyHead=x=>{
 const h=head(x),stable=tags(x).filter(t=>!kinds.includes(key(t)));
 return {
   title:textBetween(h,"title"),
   description:stable.filter(t=>key(t)==="description"),
   robots:stable.filter(t=>key(t)==="robots"),
   canonical:[...h.matchAll(/<link\b[^>]*>/gi)].map(x=>x[0]).filter(t=>attr(t,"rel")==="canonical"),
   jsonld:[...h.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)].map(x=>x[0]),
   h1:textBetween(x,"h1")
 };
};
assert.equal(m.kind,"MRXPANEL_OG7_ON_PR25_REVIEW_ONLY");
assert.equal(m.base_commit,base);
assert.equal(m.base_pr,25);
assert.equal(m.image_path,pngPath);
if(m.production_authorized===true&&m.owner_visual_approved!==true)fail("PROD_FLAG_WITHOUT_VISUAL_APPROVAL");
for(const path of paths){
 const normalizeEol=s=>s.replace(/\r\n/g,"\n");
 const live=normalizeEol(fs.readFileSync(path,"utf8"));
 const baseline=normalizeEol(cp.execFileSync("git",["show",base+":"+path],{encoding:"utf8",maxBuffer:2*1024*1024}));
 if(body(live)!==body(baseline))fail("BODY_MODIFIED:"+path);
 if(JSON.stringify(keyHead(live))!==JSON.stringify(keyHead(baseline)))fail("CANONICAL_TITLE_JSONLD_H1_CHANGED:"+path);
 for(const k of kinds){
  const a=namedTag(live,k);if(a.length!==1)fail("META_NOT_UNIQUE:"+k+":"+path+":"+a.length);
  const v=attr(a[0],"content");if(!v)fail("EMPTY_META:"+k+":"+path);
  if(["og:image","og:image:secure_url","twitter:image"].includes(k)&&v!==url)fail("URL_MISMATCH:"+k+":"+path);
  if(k==="og:image:type"&&v!=="image/png")fail("WRONG_MIME_META:"+path);
  if(k==="og:image:width"&&v!=="1200")fail("WRONG_WIDTH_META:"+path);
  if(k==="og:image:height"&&v!=="630")fail("WRONG_HEIGHT_META:"+path);
  if(k==="twitter:card"&&v!=="summary_large_image")fail("WRONG_TWITTER_CARD:"+path);
 }
}
if(review){
 if(m.owner_visual_approved!==false||m.production_authorized!==false
   ||m.release_blocked!==true||m.asset_included!==false||m.asset_live!==false)
   fail("REVIEW_MUST_HAVE_UNAPPROVED_RELEASE_HOLD_FLAGS");
 if(fs.existsSync(pngPath))fail("REVIEW_PNG_UNEXPECTEDLY_PRESENT");
 console.log("OG7_REVIEW_PASS=7/7");
 console.log("PR25_ORIGINAL_HTML_BODY_AND_SEO_METADATA_PRESERVED=7/7");
 console.log("PNG_REFERENCE_IS_NOT_PUBLISHED_OR_APPROVED");
 console.log("OG7_PRODUCTION_RELEASE=HOLD");
 process.exit(0);
}
// A staged, owner-approved image is still NOT a production release.
// Validate both images and metadata BEFORE any deployment authorization is granted.
if(staged){
 if(m.owner_visual_approved!==true||m.production_authorized!==false
   ||m.release_blocked!==true||m.asset_included!==true||m.asset_live!==false)
   fail("STAGED_REVIEW_FLAG_MISMATCH");
}else{
 if(m.owner_visual_approved!==true||m.production_authorized!==true
   ||m.release_blocked!==false||m.asset_included!==true||m.asset_live!==false)
   fail("RELEASE_HOLD_OWNER_APPROVAL_MISSING");
}
if(!["A","B"].includes(m.selected_candidate))fail("ARTWORK_CHOICE_MISSING");
const selected=m["candidate_"+m.selected_candidate+"_sha256"];
if(!/^[0-9a-f]{64}$/.test(selected))fail("ARTWORK_HASH_MISSING");
if(!fs.existsSync(pngPath))fail("ARTWORK_PNG_MISSING");
const bytes=fs.readFileSync(pngPath);
if(bytes.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")fail("BAD_PNG_HEADER");
if(bytes.readUInt32BE(16)!==1200||bytes.readUInt32BE(20)!==630)fail("PNG_DIMENSIONS");
if(crypto.createHash("sha256").update(bytes).digest("hex")!==selected)fail("PNG_HASH_NOT_APPROVED");
if(staged){
 console.log("OG7_STAGED_ARTWORK_REVIEW_PASS=7/7|CANDIDATE="+m.selected_candidate);
 console.log("OWNER_ARTWORK_APPROVED_BUT_PRODUCTION_AUTHORIZED=FALSE");
 console.log("OG7_PRODUCTION_RELEASE=HOLD");
 process.exit(0);
}
console.log("OG7_RELEASE_ARTIFACT_GATE=PASS");
