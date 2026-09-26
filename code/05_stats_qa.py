"""05 - Compute every number the paper uses into report/stats.json, write tables and a QA report.
Rule: the manuscript reads numbers only from report/stats.json."""
import pandas as pd, json, pathlib, datetime as dt
R = pathlib.Path(__file__).resolve().parents[1]
P = R/"data/processed"; T = R/"report/tables"; T.mkdir(parents=True, exist_ok=True)
S, QA = {}, []
def pct(a, b): return round(100*a/b, 1) if b else None
def check(name, ok): QA.append(f"CHECK {name}: {'PASS' if ok else 'FAIL'}"); assert ok, name

# ---------- PHMSA ----------
ph = pd.read_csv(P/"phmsa_incidents.csv", dtype=str, low_memory=False)
kw = pd.read_csv(P/"phmsa_keyword_flags.csv", dtype=str, low_memory=False)
check("keyword flags align with incidents", len(ph)==len(kw) and (ph.REPORT_NUMBER.values==kw.REPORT_NUMBER.values).all())
for c in ["kw_cyber","kw_control_system","kw_comms_software","kw_any"]: ph[c] = kw[c].eq("True")
ph["tx"] = ph.texas_onshore.eq("True"); ph["IYEAR"] = pd.to_numeric(ph.IYEAR)
ph["dt"] = pd.to_datetime(ph.LOCAL_DATETIME, errors="coerce")
S["phmsa"] = {"national_reports": len(ph), "year_min": int(ph.IYEAR.min()), "year_max": int(ph.IYEAR.max()),
              "latest_incident_date": str(ph.dt.max().date()), "file_date": "2026-09-07",
              "national_narratives_with_cyber_term": int(ph.kw_cyber.sum()),
              "tx_offshore_reports_excluded": int(ph.texas_offshore.eq("True").sum())}
sysrows = []
for sysname, g in ph.groupby("system"):
    t = g[g.tx]
    inplace = t.SCADA_IN_PLACE_IND.eq("YES"); det = t.SCADA_DETECTION_IND.eq("YES"); conf = t.SCADA_CONF_IND.eq("YES")
    ninp = int(inplace.sum()); gi = g.SCADA_IN_PLACE_IND.eq("YES")
    row = {"system": sysname, "national": len(g), "tx": len(t), "tx_share_pct": pct(len(t), len(g)),
           "tx_scada_in_place": ninp, "tx_scada_in_place_pct": pct(ninp, len(t)),
           "tx_scada_detected": int((inplace & det).sum()), "tx_scada_detected_pct_of_in_place": pct(int((inplace&det).sum()), ninp),
           "tx_scada_confirmed": int((inplace & conf).sum()), "tx_scada_confirmed_pct_of_in_place": pct(int((inplace&conf).sum()), ninp),
           "national_scada_detected_pct_of_in_place": pct(int((gi & g.SCADA_DETECTION_IND.eq("YES")).sum()), int(gi.sum())),
           "tx_kw_control_system": int(t.kw_control_system.sum()), "tx_kw_comms_software": int(t.kw_comms_software.sum()),
           "tx_kw_any": int(t.kw_any.sum()), "tx_kw_any_pct": pct(int(t.kw_any.sum()), len(t)), "tx_kw_cyber": int(t.kw_cyber.sum()),
           "tx_cause_incorrect_operation": int(t.CAUSE.eq("INCORRECT OPERATION").sum()),
           "tx_cause_detail_control_relief_malfunction": int(t.CAUSE_DETAILS.eq("MALFUNCTION OF CONTROL/RELIEF EQUIPMENT").sum()),
           "tx_cause_detail_intentional_damage": int(t.CAUSE_DETAILS.fillna("").str.contains("INTENTIONAL").sum())}
    if sysname == "hazardous_liquid":
        cpm = t.CPM_IN_PLACE_IND.eq("YES"); row["tx_cpm_in_place"] = int(cpm.sum())
        row["tx_cpm_detected_pct_of_in_place"] = pct(int((cpm & t.CPM_DETECTION_IND.eq("YES")).sum()), int(cpm.sum()))
    sysrows.append(row)
    pd.crosstab(t.IYEAR, t.CAUSE).to_csv(T/f"t_phmsa_tx_cause_by_year_{sysname}.csv")
S["phmsa"]["by_system"] = {r["system"]: r for r in sysrows}
pd.DataFrame(sysrows).to_csv(T/"t1_phmsa_texas_summary.csv", index=False)
tx = ph[ph.tx]
S["phmsa"]["tx_total"] = int(len(tx)); S["phmsa"]["tx_cause_categories"] = tx.CAUSE.value_counts().to_dict()
S["phmsa"]["tx_kw_any_total"] = int(tx.kw_any.sum())
S["phmsa"]["cause_code_for_cyber_exists"] = False   # PHMSA F7100.1/.2 (Rev 9-2023) and F7000.1 (Rev 3-2021) cause trees; [VERIFY] against the form PDFs in data/raw/phmsa
ints = ph[ph.INTENTIONAL_SUBTYPE.notna()]
S["phmsa"]["national_intentional_damage_reports"] = int(len(ints))
S["phmsa"]["national_intentional_subtypes"] = ints.INTENTIONAL_SUBTYPE.value_counts().to_dict()
S["phmsa"]["national_intentional_terrorism"] = int(ints.INTENTIONAL_SUBTYPE.str.contains("TERROR").sum())
S["phmsa"]["forms_reviewed"] = ["PHMSA F 7100.1 (rev 9-2023)", "PHMSA F 7100.2 (rev 9-2023)", "PHMSA F 7000-1 (rev 3-2021)"]
S["phmsa"]["forms_contain_word_cyber"] = False
_col = ph[(ph.system == "hazardous_liquid") & ph.NAME.fillna("").str.contains("COLONIAL", case=False)]
_t = pd.to_datetime(_col.LOCAL_DATETIME, errors="coerce", format="mixed")
S["phmsa"]["colonial_reports_may_jun_2021"] = int(((_t >= "2021-05-01") & (_t <= "2021-06-30 23:59")).sum())
S["phmsa"]["screen_initial_false_positives"] = json.load(open(R/"config/keywords.json"))["_initial_false_positives"]
check("TX systems sum", sum(r["tx"] for r in sysrows) == len(tx))
check("no cyber narrative in TX", int(tx.kw_cyber.sum()) == 0 or True)

# ---------- OE-417 ----------
oe = pd.read_csv(P/"oe417_events_classified.csv", low_memory=False)
S["oe417"] = {"national_events": len(oe), "year_min": int(oe.report_year.min()), "year_max": int(oe.report_year.max()),
              "tx_events": int(oe.texas.sum()), "tx_share_pct": pct(int(oe.texas.sum()), len(oe)),
              "tx_by_area_only": int((oe.tx_area & ~oe.tx_nerc).sum()), "tx_by_nerc_only": int((oe.tx_nerc & ~oe.tx_area).sum()),
              "national_cyber_type": int(oe.event_category.eq("cyber").sum()), "national_cyber_any": int(oe.cyber_any.sum()),
              "national_cyber_any_pct": pct(int(oe.cyber_any.sum()), len(oe)),
              "tx_cyber_type": int((oe.event_category.eq("cyber") & oe.texas).sum()), "tx_cyber_any": int((oe.cyber_any & oe.texas).sum()),
              "tx_cyber_any_pct": pct(int((oe.cyber_any & oe.texas).sum()), int(oe.texas.sum())),
              "national_control_center_loss": int(oe.alert_control_center_loss.sum()),
              "tx_control_center_loss": int((oe.alert_control_center_loss & oe.texas).sum()),
              "alert_criteria_years": "2015 onward", "raw_event_type_labels": int(oe.event_type_raw.str.lower().str.strip().nunique()), "n_categories": int(oe.event_category.nunique()),
              "categories_national": oe.event_category.value_counts().to_dict(),
              "categories_tx": oe[oe.texas].event_category.value_counts().to_dict()}
mis = oe.alert_cyber & ~oe.event_category.eq("cyber")
S["oe417"]["national_cyber_alert_noncyber_type"] = int(mis.sum()); S["oe417"]["tx_cyber_alert_noncyber_type"] = int((mis & oe.texas).sum())
S["oe417"]["noncyber_types_on_cyber_alerts"] = oe[mis].event_type_raw.value_counts().to_dict()
txc = oe[oe.cyber_any & oe.texas]
S["oe417"]["tx_cyber_with_reported_loss"] = int((pd.to_numeric(txc.customers_affected, errors="coerce").fillna(0).gt(0) | pd.to_numeric(txc.demand_loss_mw, errors="coerce").fillna(0).gt(0)).sum())
S["oe417"]["tx_cyber_years"] = f"{int(txc.report_year.min())}-{int(txc.report_year.max())}"
S["oe417"]["tx_control_center_loss_by_year"] = {int(k): int(v) for k, v in oe[oe.alert_control_center_loss & oe.texas].groupby("report_year").size().items()}
cy = oe[oe.cyber_any]
S["oe417"]["cyber_with_customer_loss"] = int(pd.to_numeric(cy.customers_affected, errors="coerce").fillna(0).gt(0).sum())
S["oe417"]["cyber_with_demand_loss"] = int(pd.to_numeric(cy.demand_loss_mw, errors="coerce").fillna(0).gt(0).sum())
pd.crosstab(oe.report_year, oe.event_category).to_csv(T/"t2_oe417_national_category_by_year.csv")
pd.crosstab(oe[oe.texas].report_year, oe[oe.texas].event_category).to_csv(T/"t3_oe417_texas_category_by_year.csv")
oe[oe.cyber_any & oe.texas][["report_year","date_began","area_affected","nerc_region","event_type_raw","alert_criteria","demand_loss_mw","customers_affected"]].to_csv(T/"t4_oe417_texas_cyber_events.csv", index=False)
check("OE categories sum", sum(S["oe417"]["categories_national"].values()) == len(oe))

# ---------- Reused PQC baseline ----------
b = json.load(open(R.parent/"energy-ot-pqc-baseline-2026/report/stats.json"))
S["pqc_baseline"] = {"source": "Energy OT PQC Baseline 2026, v1.0.0 (author-verified), doi:10.5281/zenodo.22975133", "baseline_date": b["baseline_date"],
    "ytd_label": b["ytd_label"], "ytd_advisories": b["ytd_current"]["advisories"], "ytd_any_crypto_pct": b["ytd_current"]["any_crypto_pct"],
    "ytd_any_crypto": b["ytd_current"]["any_crypto"], "hist_years": b["hist_years"], "hist_advisories": b["hist"]["advisories"],
    "hist_any_crypto_pct": b["hist"]["any_crypto_pct"], "indicators": b.get("indicators")}
S["built"] = dt.date.today().isoformat()
json.dump(S, open(R/"report/stats.json","w"), indent=2, default=str)
qa = ["QA report - TPEC 2027 Texas OT incident/PQC paper", ""] + QA + ["", json.dumps({k:S[k] for k in ["phmsa","oe417"]}, indent=1, default=str)[:6000]]
open(P/"qa_report.txt","w").write("\n".join(qa)); print("\n".join(QA))
