# Build spec: TPEC 2027 paper (TechRxiv preprint, Nov 2026)

```
WORKING TITLE:  Counting What Incident Reports Cannot See: Cyber, Control-System and Quantum-Readiness Signals
                in Public Data for Texas Grid and Pipeline OT
ARCHETYPE:      analysis paper (8) on a small linked dataset (1). 6-page IEEE conference paper (TPEC format).
QUESTION:       Do the two federal incident-reporting systems for Texas energy (DOE OE-417 for the grid, PHMSA for
                pipelines) register cyber or control-system causes, and how does that compare with the cryptographic
                weakness and PQC-readiness picture of the OT products those operators run?
  RQ1  How many OE-417 events in Texas / ERCOT (2011-2026 YTD) carry a cyber event type, versus physical attack,
       vandalism, weather, and other types?
  RQ2  How many PHMSA incidents in Texas (2010-2026 YTD; gas transmission and gathering, hazardous liquid, gas
       distribution) have a cause code that could capture a cyber or control-system factor? In how many did a
       SCADA system exist and detect the event? How many narratives mention a control-system or cyber term that the
       cause code does not record? (keyword screen only; full adjudication is the January incident-code paper)
  RQ3  In the same period, what does the energy OT advisory record show? Share of advisories citing cryptographic
       weaknesses; PQC indicators I1-I9. Reused from the 2026 baseline, not recomputed.
  CLAIM The reporting systems are built to catch outages and releases, so a quiet cryptographic compromise
        (harvest-now-decrypt-later) would leave no record in either. The paper sizes that gap and proposes fields that close it.
SOURCES:        PHMSA incident flat files, Jan 2010 to present (3 ZIPs; phmsa.dot.gov), downloaded by author 2026-09-23;
                DOE OE-417 annual summaries 2011-2026 (Excel; oe.netl.doe.gov), downloaded by author 2026-09-23;
                Energy OT PQC Baseline 2026 stats.json (ONG-OT dataset v1.1, doi:10.5281/zenodo.22729882;
                PQC crosswalk v1.0, doi:10.5281/zenodo.22730718).
UNIT:           OE-417 event row; PHMSA incident report; CISA advisory (reused).
SCOPE:          Texas. OE-417 rows whose Area Affected names Texas, or whose NERC region is TRE/ERCOT (both flags kept).
                PHMSA rows with ONSHORE_STATE_ABBREVIATION = TX (offshore Texas waters reported separately).
                Advisory side is sector-wide, because advisories do not say where products are deployed. The paper says so.
MEASURES:       event/incident counts by type/cause and year; cyber share; SCADA-in-place and SCADA-detected rates;
                narrative keyword hit rate by cause; the reused crypto-weakness share and I1-I9.
OUTPUTS:        manuscript (IEEE conference .docx + PDF, 6 pages max), 3-4 figures, tables, stats.json,
                data/processed/ tidy files, keyword-hit list for the author's review, TechRxiv submission kit.
VENUES:         TechRxiv preprint (Nov 2026) -> TPEC 2027 (EasyChair; 2027 deadline not yet posted; the last two cycles
                closed in Nov). TechRxiv allows later IEEE submission.
VERIFY POINTS:  Texas filter rules; the OE-417 event-type harmonisation (the labels change across years); the keyword list and every
                narrative hit; the claim wording on HNDL; the reused baseline numbers (baseline v1.0.0, doi:10.5281/zenodo.22975133); all prose.
AUTHORS:        Ikwuogu (corresponding); Orimogunje; Pinyi; Mike-Ewewie (standard block; no project-specific set).
LICENSE:        code MIT; manuscript/figures CC BY 4.0 (TechRxiv default is CC BY); derived data CC0/US public domain source.
```
