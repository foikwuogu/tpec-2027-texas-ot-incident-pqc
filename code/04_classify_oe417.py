"""04 - Harmonise OE-417 event types (config/oe417_event_map.json) and flag control-centre and cyber alert criteria.
Output: data/processed/oe417_events_classified.csv; data/processed/oe417_type_map_applied.csv (raw label -> category, for review)"""
import pandas as pd, json, re, pathlib
R = pathlib.Path(__file__).resolve().parents[1]
M = json.load(open(R/"config/oe417_event_map.json"))
d = pd.read_csv(R/"data/processed/oe417_events.csv", low_memory=False)
def cat(label):
    s = str(label).lower().strip(" -")
    for name, rx in M["rules"]:
        if re.search(rx, s): return name
d["event_category"] = d["event_type_raw"].map(cat)
ac = d["alert_criteria"].fillna("").astype(str)
d["alert_control_center_loss"] = ac.str.contains(M["control_center_alert_regex"], case=False, regex=True)
d["alert_cyber"] = ac.str.contains(M["cyber_alert_regex"], case=False, regex=True)
d["cyber_any"] = d.event_category.eq("cyber") | d.alert_cyber
d.to_csv(R/"data/processed/oe417_events_classified.csv", index=False)
d.groupby(["event_type_raw","event_category"]).size().rename("n").reset_index().sort_values("n", ascending=False)\
 .to_csv(R/"data/processed/oe417_type_map_applied.csv", index=False)
print(pd.crosstab(d.event_category, d.texas, margins=True).to_string())
print("cyber_any:", d.cyber_any.sum(), "TX:", (d.cyber_any & d.texas).sum(), "| ctrl-centre loss:", d.alert_control_center_loss.sum(), "TX:", (d.alert_control_center_loss & d.texas).sum())
