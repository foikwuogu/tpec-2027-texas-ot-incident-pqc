# Verification checklist (authors complete before posting to TechRxiv)

Nothing is posted until every box is ticked and the author says so in their own words.

## Reproduce
- [x] `./run_all.sh` runs clean and every CHECK in data/processed/qa_report.txt is PASS
- [x] SHA-256 values in data/raw/PROVENANCE.txt match the files in data/raw
- [x] Origin of `DOE_Electric_Disturbance_Events.xlsx`: confirmed by the author 2026-09-26 as downloaded from the DOE OE-417 annual summaries page; cross-checked against new_oe417.csv (see PROVENANCE.txt)
- [x] OE-417 2024-2026: not added; the paper states the series ends in 2023

## PHMSA spot checks (open each report in the flat file or the PHMSA data mart and confirm cause and SCADA fields)
- [x] hazardous_liquid 20100207 (2010): cause EXCAVATION DAMAGE; SCADA in place YES, detected NO
- [x] hazardous_liquid 20160266 (2016): cause CORROSION FAILURE; SCADA in place YES, detected NO
- [x] hazardous_liquid 20160228 (2016): cause EQUIPMENT FAILURE; SCADA in place YES, detected NO
- [x] hazardous_liquid 20180001 (2017): cause EQUIPMENT FAILURE; SCADA in place YES, detected NO
- [x] hazardous_liquid 20260004 (2025): cause CORROSION FAILURE; SCADA in place YES, detected NO
- [x] hazardous_liquid 20230187 (2023): cause MATERIAL FAILURE OF PIPE OR WELD; SCADA in place YES, detected YES
- [x] Open the three form PDFs in data/raw/phmsa and confirm there is no cyber cause (the paper states this in Section IV-A)

## OE-417 Texas cyber-flagged events (confirm each on the DOE annual summary for that year)
- [x] 2012-01-17 | Austin, Texas | TRE | type: Suspected Cyber Attack | alert: nan
- [x] 2017-02-17 | Missouri: Arkansas: Oklahoma: Texas: | SPP | type: System Operations | alert: Cyber event that could potentially impact electric power system adequacy or reliability
- [x] 2020-02-11 | Texas: Sterling County; | TRE | type: System Operations | alert: Cyber event that could potentially impact electric power system adequacy or reliability.
- [x] 2020-11-20 | Texas: Kentucky: Arizona: New Mexico: Oregon: Washington: | TRE | type: System Operations | alert: Cyber event that causes interruptions of electrical system operations.
- [x] 2021-02-16 | New Jersey: Pennsylvania: Texas: California: Illinois: Colorado: | RF | type: Cyber Event | alert: Cyber event that could potentially impact electric power system adequacy or reliability.
- [x] 2021-02-19 | Texas: | TRE | type: Cyber Event | alert: Cyber event that causes interruptions of electrical system operations.
- [x] 2021-06-15 | Texas: | TRE | type: Cyber Event | alert: Cyber event that could potentially impact electric power system adequacy or reliability.
- [x] 2022-01-18 | Texas: Harris County; | TRE | type: Cyber Event | alert: Cyber Security Incident that was an attempt to compromise a High or Medium Impact Bulk Ele
- [x] 2022-03-06 | Texas: Cameron County; | TRE | type: Cyber Event | alert: Cyber event that could potentially impact electric power system adequacy or reliability
- [x] 2022-10-14 | Texas: Bee County; | RE  | type: Cyber Event | alert: Reportable Cyber Security Incident
- [x] 2023-02-21 | Texas: Cameron County; | TRE | type: Cyber Event | alert: Cyber event that could potentially impact electric power system adequacy or reliability

## Judgment calls
- [x] Texas filter rules: PHMSA onshore state = TX, offshore excluded; OE-417 area names Texas or NERC region is TRE/ERCOT
- [x] config/oe417_event_map.json. Rule order, and keeping the one 'suspected telecommunications attack' out of cyber
- [x] config/keywords.json. Term lists and exclusions
- [x] **Adjudicate data/processed/keyword_hits_review.csv** (338 Texas rows). Author confirmed 2026-09-26: reported as candidates only
- [x] Reused baseline numbers: Energy OT PQC Baseline 2026 verified and released v1.0.0 (doi:10.5281/zenodo.22975133); values unchanged from the draft

## [VERIFY] tags in the manuscript (the publish gate will refuse to pass until each one is resolved)
- [x] Ref: OE-417 form — OMB No. 1901-0288
- [x] Ref: TSA Security Directive — Pipeline-2021-01G (eff. 2026-01-16); 24-hour CISA window per 01B (Fed. Reg. 2024-04-19)
- [x] Ref: CIRCIA — worded as 'targeted for finalization in September 2026'; re-check on posting day
- [x] Ref: PQC crosswalk v1.0 — Ikwuogu, Orimogunje, Pinyi, Mike-Ewewie (from the v1.0.0 CITATION.cff)
- [x] Ref: baseline report DOI — baseline 10.5281/zenodo.22975133; repo 10.5281/zenodo.22982191 (reserved)
- [x] Discussion: whether any PHMSA report — none for May-June 2021 (computed from the flat file); the Mar-2021 NOPSO and 30-day report concern the Aug-2020 Huntersville release
- [x] Methods: note on adding 2024-2026 — note removed; series ends 2023
- [x] Acknowledgment: AI-use disclosure — author wording, with 'Human' corrected to 'AI assistance (Claude, Anthropic)' and 'authors' plural

## Authors, prose, release
- [x] Single-author paper (author decision 2026-09-26); no co-author sign-off needed
- [x] Every sentence rewritten or approved in your own voice (author edits applied 2026-09-26), especially the Abstract, Discussion and recommendations R1-R4
- [x] `./run_all.sh --final`, then `python scripts/publish_gate.py .` passes
- [ ] After posting, add a row to docs/EVIDENCE_LOG.csv (date, TechRxiv DOI, status)
