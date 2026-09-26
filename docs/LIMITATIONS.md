# Limitations

1. **The narrative screen is a keyword filter.** Control-system and comms hits are candidates until the author adjudicates them (keyword_hits_review.csv). The cyber count is zero after tightening the patterns; three earlier matches were false positives.
2. **Cyber reporting is routed to confidential channels.** These are NERC CIP-008 (E-ISAC and CISA), the TSA security directives and CIRCIA. The paper measures only the public record.
3. **OE-417 coverage is 2011-2023.** The 2024-2026 annual files could not be downloaded from the build environment. For 2023 the ORNL full-year export replaces the Jan-Jun sheet in the DOE workbook.
4. **OE-417 geography is coarse.** A multi-state event counts as Texas whenever Texas or TRE/ERCOT is named.
5. **The event-type harmonisation is a judgment call** (config/oe417_event_map.json). One "suspected telecommunications attack" is kept out of the cyber category.
6. **The product layer is sector-wide, not Texas-specific.** It reuses the author's own Energy OT PQC Baseline 2026 (v1.0.0, doi:10.5281/zenodo.22975133).
7. **Reporting thresholds** in both systems exclude small events.
8. **Network restrictions.** The build environment could not reach phmsa.dot.gov, doe.gov or cisa.gov directly. The PHMSA files were fetched through a browser on the author's machine. The author downloaded the DOE workbook from the DOE OE-417 page; its origin was confirmed 2026-09-26.
