#!/usr/bin/env python3
"""Negative checks for OG design/hash binding. No production writes or network."""
import copy
import importlib.util
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("seo_og_draft_guard", ROOT / "qa/seo-og-draft-guard.py")
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
assert guard.CHOICE_SHA256 == {
    "A": "ea2c611f2c5302561cd93afe15d0679f66926015d4d31c71bdb1b1b68d7ce929",
    "B": "2f4faac685007209ff85228dd2a7a88647fa1a03a384b40f780ce74057035514",
}
def blocked(manifest, reason):
    try:
        guard.release(manifest)
    except AssertionError as e:
        assert reason in str(e), (reason, str(e))
        print("PASS_BLOCKED|" + reason)
    else:
        raise AssertionError("UNSAFE_RELEASE_ACCEPTED|" + reason)

base = {
    "owner_visual_choice": None,
    "owner_visual_approved": False,
    "approved_for_production": False,
    "asset_sha256": None
}
with tempfile.TemporaryDirectory(prefix="mrxpanel-og-hash-test-") as d:
    guard.ROOT=Path(d)
    blocked(base, "OWNER_VISUAL_CHOICE_REQUIRED")
    m=dict(base,owner_visual_choice="B",owner_visual_approved=False,approved_for_production=True,asset_sha256=guard.CHOICE_SHA256["B"])
    blocked(m, "OWNER_VISUAL_APPROVAL_REQUIRED")
    m["owner_visual_approved"]=True
    blocked(m, "APPROVED_PNG_NOT_COMMITTED")
    for choice in ("A","B"):
        m["owner_visual_choice"]=choice
        m["asset_sha256"]=guard.CHOICE_SHA256["B" if choice=="A" else "A"]
        blocked(m, "APPROVED_DESIGN_HASH_MISMATCH")
        m["asset_sha256"]="0"*64
        blocked(m, "APPROVED_DESIGN_HASH_MISMATCH")
    m["owner_visual_choice"]="A"
    m["asset_sha256"]=guard.CHOICE_SHA256["A"]
    asset=guard.ROOT/guard.IMAGE
    asset.parent.mkdir(parents=True)
    asset.write_bytes(b"not-the-approved-png")
    blocked(m, "ASSET_HASH_MISMATCH")
    asset.unlink()
print("OG_EXACT_CHOICE_SHA_BINDING_NEGATIVE_QA_PASS|DESIGN_SELECTION_UNCHANGED|NO_DEPLOY")
