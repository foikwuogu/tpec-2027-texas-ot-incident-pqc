#!/usr/bin/env bash
# Rebuild everything from data/raw. Pass --final after author verification to drop DRAFT stamps.
set -euo pipefail; cd "$(dirname "$0")"
python code/01_ingest_phmsa.py
python code/02_keyword_screen.py
python code/03_ingest_oe417.py
python code/04_classify_oe417.py
python code/05_stats_qa.py
python code/06_figures.py "$@"
node code/07_manuscript.js "$@"
