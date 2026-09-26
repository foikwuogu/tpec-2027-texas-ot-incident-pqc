#!/usr/bin/env python3
"""Scan the built manuscript (.docx) for DRAFT / [VERIFY] / placeholder text that publish_gate.py cannot see inside binaries.
Usage: python scripts/check_manuscript.py report/<file>.docx   -> exit 0 clean, 1 blocked"""
import re, sys, zipfile
xml = zipfile.ZipFile(sys.argv[1]).read("word/document.xml").decode("utf8")
xml += "".join(zipfile.ZipFile(sys.argv[1]).read(n).decode("utf8") for n in zipfile.ZipFile(sys.argv[1]).namelist() if n.startswith("word/header"))
text = re.sub(r"<[^>]+>", "", xml)
hits = [(m.group(0), text[max(0, m.start()-60):m.end()+60]) for m in re.finditer(r"DRAFT|\[VERIFY[^\]]*\]|\[I\d\]|\[(DOI|insert|date)[^\]]*\]", text)]
for h, ctx in hits: print("BLOCKED", h, "|", ctx.replace("\n", " "))
print(f"{len(hits)} blocker(s) in manuscript." if hits else "Manuscript clean."); sys.exit(1 if hits else 0)
