# Counting What Incident Reports Cannot See

**Cyber, control-system and quantum-readiness signals in public data for Texas grid and pipeline OT**

**Status:** v1.0.0, author-verified (2026-09-26). | Code and data DOI: [10.5281/zenodo.22982191](https://doi.org/10.5281/zenodo.22982191) | Preprint: TechRxiv (Nov 2026) | Venue: IEEE TPEC 2027

This 6-page IEEE conference paper asks whether the two federal incident systems that cover Texas energy can see cyber and control-system causes. The two systems are DOE Form OE-417 for the grid and the PHMSA incident reports for pipelines. The paper sets that visibility against the cryptographic and post-quantum readiness of energy OT products.

**Author:** Friday Ogochukwu Ikwuogu ([ORCID 0009-0009-2222-1318](https://orcid.org/0009-0009-2222-1318)), Independent Researcher, Odessa, Texas, USA (sole author).

## What is here
```
report/TPEC2027_Texas_OT_Incident_PQC_DRAFT.docx/.pdf   the manuscript (IEEE two-column)
report/stats.json            every number in the paper (the manuscript reads only from here)
report/figures/, tables/     figures 1-3, tables
data/raw/                    PHMSA flat files, OE-417 workbook + ORNL 2023 export; hashes in PROVENANCE.txt
data/processed/              tidy incident/event tables, keyword flags, keyword_hits_review.csv (for adjudication), qa_report.txt
config/                      keywords.json (narrative screen), oe417_event_map.json (event-type harmonisation)
code/01..07                  pipeline in run order
docs/                        BUILD_SPEC, CODEBOOK, LIMITATIONS, VERIFY_CHECKLIST, PUBLISH_GUIDE, EVIDENCE_LOG
```

## Reproduce
```
pip install -r requirements.txt && npm install
./run_all.sh            # draft build (stamped)
./run_all.sh --final    # final build, no draft stamps
```
To add OE-417 2024-2026, put the DOE annual Excel files in `data/raw/oe417/extra/`. Each filename must contain its year. Then re-run.

The PQC layer reads `../energy-ot-pqc-baseline-2026/report/stats.json`. Keep that project beside this one.

## Sources
- PHMSA incident flat files, Jan 2010 to present (phmsa.dot.gov; files dated 2026-09-07).
- DOE OE-417 annual summaries: DOE compiled workbook for 2011-2022, and the ORNL Open Energy Data Portal export for 2023.
- Energy OT PQC Baseline 2026, which draws on the ONG-OT dataset (doi:10.5281/zenodo.22729882) and the PQC crosswalk (doi:10.5281/zenodo.22730718).

## License and citation
Code is MIT. The manuscript, figures, docs and derived data are CC BY 4.0. See LICENSE and CITATION.cff.
