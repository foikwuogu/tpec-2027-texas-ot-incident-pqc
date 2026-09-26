"""01 - Load the three PHMSA incident flat files (Jan 2010 - present), keep analysis columns, flag Texas.
Input : data/raw/phmsa/*.txt (tab-delimited, cp1252), hashes in data/raw/PROVENANCE.txt
Output: data/processed/phmsa_incidents.csv (all states, one row per report)"""
import pandas as pd, pathlib
R = pathlib.Path(__file__).resolve().parents[1]
RAW, OUT = R/"data/raw/phmsa", R/"data/processed"
FILES = {
 "gas_transmission_gathering": ("incident_gas_transmission_gathering_jan2010_present.txt", "ONSHORE_STATE_ABBREVIATION"),
 "hazardous_liquid":           ("accident_hazardous_liquid_jan2010_present.txt",          "ONSHORE_STATE_ABBREVIATION"),
 "gas_distribution":           ("incident_gas_distribution_jan2010_present.txt",          "LOCATION_STATE_ABBREVIATION"),
}
KEEP = ["REPORT_NUMBER","IYEAR","LOCAL_DATETIME","OPERATOR_ID","NAME","ON_OFF_SHORE","OFFSHORE_STATE_ABBREVIATION","CAUSE","CAUSE_DETAILS",
        "SCADA_IN_PLACE_IND","SCADA_OPERATING_IND","SCADA_FUNCTIONAL_IND","SCADA_DETECTION_IND","SCADA_CONF_IND",
        "CPM_IN_PLACE_IND","CPM_DETECTION_IND","INVEST_NO_CONTROL_ROOM_IND","INVEST_NO_CONTROLLER_IND","INVEST_INCORRECT_CONTROL_IND",
        "INTENTIONAL_SUBTYPE","INTENTIONAL_DETAILS","SIGNIFICANT","SERIOUS","NARRATIVE"]
frames = []
for system, (fn, statecol) in FILES.items():
    d = pd.read_csv(RAW/fn, sep="\t", encoding="cp1252", dtype=str, low_memory=False)
    assert d.REPORT_NUMBER.is_unique, fn
    x = d.reindex(columns=KEEP).copy()
    x.insert(0, "system", system)
    x["state"] = d[statecol]
    x["texas_onshore"] = x["state"].eq("TX")
    x["texas_offshore"] = x["OFFSHORE_STATE_ABBREVIATION"].eq("TX")
    x["source_file"] = fn
    frames.append(x)
    print(f"{system:28s} rows={len(d):5d} TX_onshore={x.texas_onshore.sum():5d} TX_offshore={x.texas_offshore.sum():3d}")
all_ = pd.concat(frames, ignore_index=True)
all_["IYEAR"] = pd.to_numeric(all_["IYEAR"], errors="coerce").astype("Int64")
OUT.mkdir(parents=True, exist_ok=True)
all_.to_csv(OUT/"phmsa_incidents.csv", index=False)
print("wrote", len(all_), "rows")
