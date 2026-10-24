#!/usr/bin/env python3
"""Fail-closed MRXPANEL OG metadata and binary release gate. Offline only."""
import argparse, hashlib, json, struct, sys
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
ROUTES={
 "index.html":("https://mrxpanel.com/","dc1c02829a85f5ba74616279173cf262fc0396e3"),
 "panduan-reseller/index.html":("https://mrxpanel.com/panduan-reseller/","da3cf3bff16101796a95163887caa1d7fe16601c"),
 "cara-menggunakan-panel-smm/index.html":("https://mrxpanel.com/cara-menggunakan-panel-smm/","9f28a00d57e892f2a8b2031ac55e454774ee8e85"),
 "memilih-provider-smm/index.html":("https://mrxpanel.com/memilih-provider-smm/","9efde6bda834290f68d741892099f6082eb9ff12"),
 "apa-itu-panel-smm/index.html":("https://mrxpanel.com/apa-itu-panel-smm/","1cbba117f04bd38685e810f46affad2a646d168f"),
 "api-panel-smm-reseller/index.html":("https://mrxpanel.com/api-panel-smm-reseller/","ffc0aaf78677d0c84c399041ef017fb74d371378"),
 "kalkulator-harga-jual-reseller-smm/index.html":("https://mrxpanel.com/kalkulator-harga-jual-reseller-smm/","cb335271d40f08c305633da7cb4b1660f82cd663"),
}
IMAGE_URL="https://mrxpanel.com/assets/mrxpanel-og-1200x630.png"
ASSET=ROOT/"assets/mrxpanel-og-1200x630.png"
MANIFEST=ROOT/"review/og-seven-page-release-20261025/release-status.json"
class Meta(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.values={};self.canonicals=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="meta":
   key=a.get("name") or a.get("property")
   if key:self.values.setdefault(key,[]).append(a.get("content"))
  if tag=="link" and a.get("rel")=="canonical":self.canonicals.append(a.get("href"))
def sole(meta,k):
 v=meta.values.get(k,[])
 assert len(v)==1,(k,"missing or duplicate")
 return v[0]
def verify():
 for path,(canonical,hash_expected) in ROUTES.items():
  b=(ROOT/path).read_bytes()
  git_sha=hashlib.sha1(("blob %d\0"%len(b)).encode()+b).hexdigest()
  assert git_sha==hash_expected,(path,"reviewed HTML changed",git_sha)
  m=Meta();m.feed(b.decode("utf-8-sig"))
  assert m.canonicals==[canonical],path
  required={"og:url":canonical,"og:image":IMAGE_URL,"og:image:secure_url":IMAGE_URL,
  "og:image:type":"image/png","og:image:width":"1200","og:image:height":"630",
  "og:image:alt":"MRXPANEL — Panel SMM Indonesia untuk Reseller dan Bisnis",
  "twitter:image":IMAGE_URL,"twitter:card":"summary_large_image","robots":"index,follow"}
  for k,v in required.items():assert sole(m,k)==v,(path,k)
  print("OG_META_REVIEW_PASS|"+path)
 status=json.loads(MANIFEST.read_text(encoding="utf-8"))
 assert status["source_commit"]=="11ef2f5309019eda0954f550e23521dcd08dc887"
 assert status["asset_sha256"]=="ea2c611f2c5302561cd93afe15d0679f66926015d4d31c71bdb1b1b68d7ce929"
 return status
def gate(status):
 assert status["approved_for_production"] is True,"OWNER_VISUAL_APPROVAL_REQUIRED"
 assert status["approval_status"]=="approved","APPROVAL_GATE_NOT_SATISFIED"
 assert ASSET.is_file(),"PNG_BINARY_NOT_COMMITTED"
 binary=ASSET.read_bytes()
 assert hashlib.sha256(binary).hexdigest()==status["asset_sha256"],"PNG_SHA256_MISMATCH"
 assert binary[:8]==b"\x89PNG\r\n\x1a\n","NOT_PNG"
 assert len(binary)>=24 and struct.unpack(">II",binary[16:24])==(1200,630),"WRONG_PNG_DIMENSIONS"
 print("MRXPANEL_OG_RELEASE_ASSET_GATE_PASS=7/7|MERGE_NOT_AUTHORIZED_AUTOMATICALLY")
if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("--mode",choices=("review","release"),required=True)
 a=p.parse_args()
 try:
  s=verify()
  if a.mode=="release":gate(s)
  else:
   assert s["approved_for_production"] is False and s["approval_status"]=="pending_owner_review"
   assert not ASSET.exists(),"REVIEW_ONLY_MUST_NOT_INCLUDE_UNAPPROVED_ASSET"
   print("MRXPANEL_OG_DRAFT_METADATA_QA_PASS=7/7|RELEASE_GATE=HOLD|PNG_COMMITTED=NO")
 except (AssertionError,KeyError,ValueError,OSError,UnicodeError) as exc:
  print("MRXPANEL_OG_GATE_FAIL|"+str(exc)[:180],file=sys.stderr)
  sys.exit(2)
