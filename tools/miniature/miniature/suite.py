"""Run every case in testset.json through the pipeline and summarise.

    .venv/bin/python -m miniature.suite            # all cases
    .venv/bin/python -m miniature.suite iloma      # some cases

Each case runs as its own process (the same command a person would run), so
a crash or a failed gate in one doesn't stop the rest. Results go to
work/suite.json and a table on stdout.
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / "testset.json"


def run(case: dict) -> dict:
    command = [sys.executable, "-m", "miniature", case["photo"], "--name", case["name"]]
    if case.get("extra"):
        command += ["--extra", *case["extra"]]
    if case.get("shape"):
        command += ["--shape", case["shape"]]
    if case.get("unseen"):
        command += ["--unseen", case["unseen"]]
    if case.get("back"):
        command += ["--back", case["back"]]
    for key in ("depth", "seal"):
        if key in case:
            command += [f"--{key}", str(case[key])]
    start = time.time()
    done = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    report_path = ROOT / "work" / case["name"] / "report.json"
    result = {"name": case["name"], "seconds": round(time.time() - start), "exit": done.returncode}
    if report_path.exists() and report_path.stat().st_mtime >= start:
        report = json.loads(report_path.read_text())
        result.update(qa=report["qa"], bytes=report["web"]["bytes"]["model"], material=report["web"].get("material"))
    else:
        result["error"] = done.stderr.strip().splitlines()[-1] if done.stderr.strip() else "no report"
    return result


def main() -> None:
    cases = json.loads(CASES.read_text())
    wanted = set(sys.argv[1:])
    results = [run(c) for c in cases if not wanted or c["name"] in wanted]
    (ROOT / "work" / "suite.json").write_text(json.dumps(results, indent=2))

    print(f"{'case':<18}{'gate':<6}{'iou':>7}{'px err':>8}{'text':>7}{'rough':>8}{'lit':>11}{'KB':>6}{'s':>5}")
    for r in results:
        if "qa" not in r:
            print(f"{r['name']:<18}{'ERROR':<6}  {r['error'][:60]}")
            continue
        q = r["qa"]
        print(
            f"{r['name']:<18}{'pass' if q['passed'] else 'FAIL':<6}{q['silhouette_iou']:>7.3f}{q['pixel_error']:>8.2f}"
            f"{q['text_recall']:>7.2f}{q['shading_roughness']:>8.4f}{q['lit_error_default_material']:>6.1f}→{q['lit_error']:<4.1f}{r['bytes'] // 1024:>6}{r['seconds']:>5}"
        )


if __name__ == "__main__":
    main()
