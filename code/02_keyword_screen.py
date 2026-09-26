"""02 - Screen PHMSA narratives for cyber, control-system and comms/software terms (config/keywords.json).
Output: data/processed/phmsa_keyword_flags.csv (one row per report, all states)
        data/processed/keyword_hits_review.csv (Texas hits with context, for the author to adjudicate)"""
import pandas as pd, re, json, pathlib
R = pathlib.Path(__file__).resolve().parents[1]
K = json.load(open(R/"config/keywords.json"))
d = pd.read_csv(R/"data/processed/phmsa_incidents.csv", dtype=str, low_memory=False)
excl = re.compile("|".join(K["exclude_context"]), re.I)
def screen(text):
    t = excl.sub(" ", text or "")
    out = {}
    for grp in ("cyber","control_system","comms_software"):
        rx = re.compile(r"\b(" + "|".join(K[grp]) + r")\b", re.I)
        out[grp] = [m.group(0) for m in rx.finditer(t)]
    return out
res = d["NARRATIVE"].fillna("").map(screen)
for g in ("cyber","control_system","comms_software"):
    d[f"kw_{g}"] = res.map(lambda r: len(r[g])>0)
    d[f"kw_{g}_terms"] = res.map(lambda r: ";".join(sorted({w.lower() for w in r[g]})))
d["kw_any"] = d[["kw_cyber","kw_control_system","kw_comms_software"]].any(axis=1)
d.drop(columns=["NARRATIVE"]).to_csv(R/"data/processed/phmsa_keyword_flags.csv", index=False)
tx = d[(d.texas_onshore=="True") & d.kw_any].copy()
def ctx(row):
    n = row.NARRATIVE or ""; terms = [t for g in ("cyber","control_system","comms_software") for t in row[f"kw_{g}_terms"].split(";") if t]
    snips = []
    for t in terms[:3]:
        m = re.search(re.escape(t), n, re.I)
        if m: snips.append("..." + n[max(0,m.start()-160):m.end()+160].replace("\n"," ") + "...")
    return " || ".join(snips)
tx["context"] = tx.apply(ctx, axis=1)
tx["author_ruling"] = ""   # one of: cyber | control_system_contributory | control_system_detection_only | not_relevant
tx["author_note"] = ""
cols = ["system","REPORT_NUMBER","IYEAR","CAUSE","CAUSE_DETAILS","kw_cyber_terms","kw_control_system_terms","kw_comms_software_terms","context","author_ruling","author_note"]
tx[cols].sort_values(["system","IYEAR"]).to_csv(R/"data/processed/keyword_hits_review.csv", index=False)
print("TX hits:", len(tx)); print(tx.groupby("system")[["kw_cyber","kw_control_system","kw_comms_software"]].sum())
print(tx[tx.kw_cyber][["system","REPORT_NUMBER","kw_cyber_terms","context"]].to_string()[:4000])
