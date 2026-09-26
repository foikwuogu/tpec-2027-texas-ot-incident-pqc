# Codebook

## data/processed/phmsa_incidents.csv (one row per PHMSA report; key = system + REPORT_NUMBER)
| field | meaning |
|---|---|
| system | gas_transmission_gathering / hazardous_liquid / gas_distribution |
| REPORT_NUMBER, IYEAR, LOCAL_DATETIME | PHMSA report id, incident year, local time |
| CAUSE, CAUSE_DETAILS | PHMSA cause tree (form F 7100.1/7100.2 rev 9-2023; F 7000-1 rev 3-2021) |
| SCADA_IN_PLACE_IND / _DETECTION_IND / _CONF_IND | SCADA present / detected the incident / confirmed it (YES/NO) |
| CPM_IN_PLACE_IND / CPM_DETECTION_IND | computational pipeline monitoring present / detected (hazardous liquid only) |
| INTENTIONAL_SUBTYPE, INTENTIONAL_DETAILS | subtype under Other Outside Force Damage > Intentional Damage |
| state | onshore state (location state for gas distribution) |
| texas_onshore / texas_offshore | state = TX / offshore state = TX (offshore excluded from Texas counts) |

## data/processed/phmsa_keyword_flags.csv
Same rows as above, without the narrative. It adds kw_cyber, kw_control_system, kw_comms_software and kw_any (bool), plus the matched terms. Term lists and exclusions are in config/keywords.json.

## data/processed/keyword_hits_review.csv
One row for each Texas report with any keyword hit. It includes up to three context snippets, and the author fills in `author_ruling` (cyber | control_system_contributory | control_system_detection_only | not_relevant) and `author_note`.

## data/processed/oe417_events_classified.csv (one row per OE-417 event row)
| field | meaning |
|---|---|
| report_year, date_began, area_affected, nerc_region, alert_criteria, event_type_raw, demand_loss_mw, customers_affected | as published |
| event_category | harmonised category (config/oe417_event_map.json; ordered rules, cyber first) |
| tx_area / tx_nerc / texas | area names Texas or ERCOT / NERC region TRE or ERCOT / either |
| alert_cyber | alert criterion names a cyber event (2015 onward, when alert criteria were published) |
| alert_control_center_loss | alert criterion is loss of monitoring, control or communication at a control center |
| cyber_any | event_category = cyber OR alert_cyber |

## report/stats.json
Every number used in the manuscript, grouped as phmsa, oe417, pqc_baseline and figures.
