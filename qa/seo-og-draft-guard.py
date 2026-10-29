#!/usr/bin/env python3
"""MRXPANEL PR19 OG review gate. Local reads only. Passing is not merge permission."""
import argparse,hashlib,json,struct,sys
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
IMAGE='assets/mrxpanel-og-1200x630.png'
URL='https://mrxpanel.com/'+IMAGE
HASHES={
'index.html':'d986d572ad86e8308d40609d35d62bcd53378902',
'panduan-reseller/index.html':'c8061705826e5ea4853c587294830f161bc032b8',
'cara-menggunakan-panel-smm/index.html':'6cb6e810f6219e50f23d77615d028e314aa4957f',
'memilih-provider-smm/index.html':'039d0f23b06d8624211e3a4c1215931290d0a1d0',
'apa-itu-panel-smm/index.html':'792e2aa6332d2374cd2cfa7fdcf80ea24beaf13d',
'api-panel-smm-reseller/index.html':'570b605ba2f131a435f97dfb85a97dc5b58c40ad',
'kalkulator-harga-jual-reseller-smm/index.html':'dba22845423b6e62036213bbee1fdd29081c4a3d',
}
OG={
'og:image':URL,
'og:image:secure_url':URL,
'og:image:type':'image/png',
'og:image:width':'1200',
'og:image:height':'630',
'og:image:alt':'MRXPANEL — Panel SMM Indonesia untuk Reseller dan Bisnis',
'twitter:image':URL,
'twitter:card':'summary_large_image',
}
class Tags(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.meta={};self.canonicals=[];self.h1=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':
   key=a.get('property') or a.get('name')
   if key:self.meta.setdefault(key,[]).append(a.get('content'))
  if tag=='link' and a.get('rel')=='canonical':self.canonicals.append(a.get('href'))
  if tag=='h1':self.h1=True
def verify():
 m=json.loads((ROOT/'review/og-pr19-hold.json').read_text(encoding='utf-8'))
 assert m['source_pr19_content_commit']=='ce5395266f285c5c4ef705742eeb93dc53001db6'
 assert m['image_path']==IMAGE
 for path,original in HASHES.items():
  html=(ROOT/path).read_text(encoding='utf-8')
  tags=Tags();tags.feed(html)
  canonical='https://mrxpanel.com/'+('' if path=='index.html' else path[:-len('index.html')])
  assert tags.canonicals==[canonical],(path,'canonical')
  assert tags.meta.get('og:url')==[canonical],(path,'og:url')
  assert tags.meta.get('robots')==['index,follow'],(path,'robots')
  assert tags.h1,(path,'h1')
  for key,value in OG.items():assert tags.meta.get(key)==[value],(path,key)
  inserted=[]
  for key in ('og:image','og:image:secure_url','og:image:type','og:image:width','og:image:height','og:image:alt','twitter:image'):
   attr='name' if key.startswith('twitter:') else 'property'
   inserted.append(f'<meta {attr}="{key}" content="{OG[key]}">')
  if path!='index.html':inserted.append('<meta name="twitter:card" content="summary_large_image">')
  anchor=f'<meta property="og:url" content="{canonical}">'
  full=anchor+'\n'+'\n'.join(inserted)
  assert html.count(full)==1,(path,'unexpected OG insertion')
  before=html.replace(full,anchor,1).encode('utf-8')
  hashval=hashlib.sha1(('blob %d\0'%len(before)).encode()+before).hexdigest()
  assert hashval==original,(path,'original PR19 content replaced',hashval)
  print('OG_PR19_PAGE_OK|'+path)
 return m
def release(m):
 assert m['owner_visual_choice'] in ('A','B'),'OWNER_VISUAL_CHOICE_REQUIRED'
 assert m['owner_visual_approved'] is True,'OWNER_VISUAL_APPROVAL_REQUIRED'
 assert m['approved_for_production'] is True,'PRODUCTION_APPROVAL_REQUIRED'
 assert isinstance(m['asset_sha256'],str) and len(m['asset_sha256'])==64,'ASSET_SHA256_REQUIRED'
 p=ROOT/IMAGE;assert p.is_file(),'APPROVED_PNG_NOT_COMMITTED'
 b=p.read_bytes()
 assert hashlib.sha256(b).hexdigest()==m['asset_sha256'],'ASSET_HASH_MISMATCH'
 assert b[:8]==b'\x89PNG\r\n\x1a\n','NOT_PNG'
 assert struct.unpack('>II',b[16:24])==(1200,630),'WRONG_PNG_SIZE'
 print('OG_TECH_RELEASE_CHECK_PASS|OWNER_RELEASE_CONSENT_SEPARATE')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--mode',choices=('review','release'),required=True)
 try:
  m=verify()
  if p.parse_args().mode=='review':
   assert m['owner_visual_choice'] is None,'DRAFT_MUST_HAVE_NO_VISUAL_CHOICE'
   assert m['asset_sha256'] is None,'DRAFT_MUST_HAVE_NO_PNG_SHA'
   assert m['owner_visual_approved'] is False,'DRAFT_VISUAL_NOT_APPROVED'
   assert m['approved_for_production'] is False,'DRAFT_PRODUCTION_NOT_APPROVED'
   assert not (ROOT/IMAGE).exists(),'DRAFT_MUST_NOT_CONTAIN_IMAGE'
   print('OG_PR19_DRAFT_PASS=7/7|RELEASE=HOLD|DESIGN_UNSELECTED|PNG_MISSING')
  else:release(m)
 except (AssertionError,OSError,ValueError,KeyError,UnicodeError) as exc:
  print('OG_PR19_GATE_FAIL|'+str(exc)[:240],file=sys.stderr);sys.exit(2)
