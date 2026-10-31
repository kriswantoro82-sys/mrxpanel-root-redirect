#!/usr/bin/env python3
"""CI-only synthetic OG A/B staging test. Never commits, pushes, or deploys."""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = Path("review/og-seven-on-pr25-20261031/REVIEW_ONLY_RELEASE_GATE.json")
ASSET = Path("assets/mrxpanel-og-1200x630.png")
GENERATOR = Path("review/og-seven-on-pr25-20261031/generate-review-A-B.py")


def run(command, cwd, require_success=True, expected_failure=None):
    p = subprocess.run(command, cwd=cwd, text=True, stdout=subprocess.PIPE,
                       stderr=subprocess.STDOUT, check=False)
    if require_success and p.returncode != 0:
        raise AssertionError(f"Unexpected failure {command}: {p.stdout}")
    if not require_success and expected_failure is not None and (
            p.returncode == 0 or expected_failure not in p.stdout):
        raise AssertionError(f"Expected failure {expected_failure}: {p.stdout}")
    return p.stdout


def test_gate(cwd, mode, expected_failure=None):
    out = run(["node", "qa/og-seven-pr27-gate.cjs", "--mode=" + mode],
              cwd, require_success=expected_failure is None,
              expected_failure=expected_failure)
    if expected_failure is None and "PRODUCTION_RELEASE=HOLD" not in out:
        raise AssertionError("Passing staging/review gate did not report HOLD")
    return out


def main():
    with tempfile.TemporaryDirectory(prefix="mrx-og7-ci-") as tmp:
        sandbox = Path(tmp) / "isolated-worktree"
        run(["git", "worktree", "add", "--detach", str(sandbox), "HEAD"], ROOT)
        try:
            manifest_file = sandbox / MANIFEST
            asset_file = sandbox / ASSET
            original = json.loads(manifest_file.read_text(encoding="utf-8"))
            # Reset ONLY this disposable GitHub Actions worktree to pre-approval state.
            baseline = dict(original)
            baseline.update(owner_visual_approved=False, production_authorized=False,
                            release_blocked=True, asset_included=False, asset_live=False)
            baseline.pop("selected_candidate", None)
            asset_file.unlink(missing_ok=True)
            manifest_file.write_text(json.dumps(baseline, indent=2) + "\n", encoding="utf-8")
            test_gate(sandbox, "review")
            assets_dir = Path(tmp) / "ab-review-images"
            run([sys.executable, str(sandbox / GENERATOR), str(assets_dir)], sandbox)
            sources = {"A": assets_dir / "A_original-M.png",
                       "B": assets_dir / "B_circular-MRX.png"}
            checks = 1
            for label in ("A", "B"):
                staged = dict(baseline)
                staged.update(owner_visual_approved=True, selected_candidate=label,
                              asset_included=True)
                manifest_file.write_text(json.dumps(staged, indent=2) + "\n", encoding="utf-8")
                asset_file.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(sources[label], asset_file)
                test_gate(sandbox, "approved-artwork-review")
                checks += 1
                test_gate(sandbox, "release", "RELEASE_HOLD_OWNER_APPROVAL_MISSING")
                checks += 1

                # Wrong-but-valid image, wrong dimensions, and missing image must fail closed.
                other = "B" if label == "A" else "A"
                shutil.copyfile(sources[other], asset_file)
                test_gate(sandbox, "approved-artwork-review", "PNG_HASH_NOT_APPROVED")
                checks += 1
                from PIL import Image
                Image.new("RGB", (1199, 630), (0, 0, 0)).save(asset_file)
                test_gate(sandbox, "approved-artwork-review", "PNG_DIMENSIONS")
                checks += 1
                asset_file.unlink()
                test_gate(sandbox, "approved-artwork-review", "ARTWORK_PNG_MISSING")
                checks += 1
                shutil.copyfile(sources[label], asset_file)

                # Staging never accepts production authorization or a claim of a live asset.
                staged["production_authorized"] = True
                manifest_file.write_text(json.dumps(staged, indent=2) + "\n", encoding="utf-8")
                test_gate(sandbox, "approved-artwork-review", "STAGED_REVIEW_FLAG_MISMATCH")
                checks += 1
                staged["production_authorized"] = False
                staged["asset_live"] = True
                manifest_file.write_text(json.dumps(staged, indent=2) + "\n", encoding="utf-8")
                test_gate(sandbox, "approved-artwork-review", "STAGED_REVIEW_FLAG_MISMATCH")
                checks += 1
                staged["asset_live"] = False
                manifest_file.write_text(json.dumps(staged, indent=2) + "\n", encoding="utf-8")
                test_gate(sandbox, "approved-artwork-review")
                checks += 1
                print(f"STAGED_ARTWORK_SYNTHETIC_PASS={label}|NO_RELEASE=TRUE")
            print(f"OG7_SYNTHETIC_GATE_TESTS_PASS={checks}/{checks}|PRODUCTION_MUTATION=NONE")
        finally:
            run(["git", "worktree", "remove", "--force", str(sandbox)],
                ROOT, require_success=False)


if __name__ == "__main__":
    main()
