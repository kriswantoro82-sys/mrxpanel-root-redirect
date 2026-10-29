#!/usr/bin/env python3
"""Two-stage OG approval QA, using deterministic synthetic PNG bytes locally.

Production OG digests A/B are asserted unchanged. Fake PNG digests here are mocked
only in temporary-test scope; no image is staged in repository or deployed.
"""
import hashlib
import importlib.util
import struct
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('og_guard',ROOT/'qa/seo-og-draft-guard.py')
guard=importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
assert guard.CHOICE_SHA256=={
 'A':'ea2c611f2c5302561cd93afe15d0679f66926015d4d31c71bdb1b1b68d7ce929',
 'B':'2f4faac685007209ff85228dd2a7a88647fa1a03a384b40f780ce74057035514',
}
def rejects(fn,expected):
 try:fn()
 except AssertionError as e:
  assert expected in str(e),(expected,str(e))
  print('EXPECTED_REJECTION|'+expected)
 else:raise AssertionError('UNSAFE_STATE_ACCEPTED|'+expected)

with tempfile.TemporaryDirectory(prefix='og-stage-test-') as tmp:
 original_root,original_choices=guard.ROOT,guard.CHOICE_SHA256
 guard.ROOT=Path(tmp)
 img=guard.ROOT/guard.IMAGE
 plain={
  'owner_visual_choice':None,
  'owner_visual_approved':False,
  'approved_for_production':False,
  'asset_sha256':None,
 }
 guard.review(dict(plain))
 rejects(lambda:guard.release(dict(plain)),'OWNER_VISUAL_CHOICE_REQUIRED')
 sampleA=b'\x89PNG\r\n\x1a\n'+b'\x00\x00\x00\rIHDR'+struct.pack('>II',1200,630)+b'fictional-review-A'
 sampleB=b'\x89PNG\r\n\x1a\n'+b'\x00\x00\x00\rIHDR'+struct.pack('>II',1200,630)+b'fictional-review-B'
 samples={'A':sampleA,'B':sampleB}
 mock_sha={k:hashlib.sha256(v).hexdigest() for k,v in samples.items()}
 guard.CHOICE_SHA256=mock_sha
 img.parent.mkdir(parents=True,exist_ok=True)
 for choice in ('A','B'):
  img.write_bytes(samples[choice])
  stage={
   'owner_visual_choice':choice,
   'owner_visual_approved':True,
   'approved_for_production':False,
   'asset_sha256':mock_sha[choice],
  }
  guard.review(stage)
  rejects(lambda:guard.release(stage),'PRODUCTION_APPROVAL_REQUIRED')
  rejects(lambda:guard.review(dict(stage,approved_for_production=True)),'DRAFT_PRODUCTION_NOT_APPROVED')
  rejects(lambda:guard.review(dict(stage,asset_sha256=mock_sha['B' if choice=='A' else 'A'])),'APPROVED_DESIGN_HASH_MISMATCH')
  rejects(lambda:guard.review(dict(stage,owner_visual_approved=False)),'OWNER_VISUAL_APPROVAL_REQUIRED')
  img.write_bytes(samples['B' if choice=='A' else 'A'])
  rejects(lambda:guard.review(stage),'ASSET_HASH_MISMATCH')
 img.unlink()
 rejects(lambda:guard.review(dict(plain,owner_visual_choice='A')),'OWNER_VISUAL_APPROVAL_REQUIRED')
 guard.ROOT,guard.CHOICE_SHA256=original_root,original_choices
print('OG_DRAFT_VISUAL_APPROVAL_AND_SEPARATE_PRODUCTION_GATE_QA_PASS')
