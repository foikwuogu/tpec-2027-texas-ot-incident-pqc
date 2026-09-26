"""03 - Parse OE-417 annual sheets 2011+ into one tidy table and flag Texas / ERCOT.
Layouts differ by year: 2011-2014 (9 cols), 2015-2022 (Month + Alert Criteria), 2023 (Event Year + Event Month).
Optional extra years (2024+) are read from data/raw/oe417/extra/*.xls* if present.
Output: data/processed/oe417_events.csv"""
import pandas as pd, pathlib, re, glob
R = pathlib.Path(__file__).resolve().parents[1]
WB = R/"data/raw/oe417/DOE_Electric_Disturbance_Events.xlsx"
CANON = {"date event began":"date_began","time event began":"time_began","date of restoration":"date_restored","time of restoration":"time_restored",
         "area affected":"area_affected","nerc region":"nerc_region","alert criteria":"alert_criteria","event type":"event_type",
         "demand loss (mw)":"demand_loss_mw","number of customers affected":"customers_affected"}
def parse_sheet(df, year, src):
    hdr = next(i for i in range(10) if df.iloc[i].astype(str).str.contains("Date Event Began", case=False).any())
    cols = [re.sub(r"\s+"," ",str(c)).strip().lower().rstrip("0123456789") for c in df.iloc[hdr]]
    body = df.iloc[hdr+1:].copy(); body.columns = cols
    body = body.rename(columns=lambda c: CANON.get(c, c))
    body = body[[c for c in CANON.values() if c in body.columns]]
    body = body[pd.to_datetime(body["date_began"], errors="coerce").notna()]   # drop month-divider and footnote rows
    body["report_year"] = year; body["source"] = src
    return body
frames = []
x = pd.ExcelFile(WB)
for s in x.sheet_names:
    if 2011 <= int(s) <= 2022:   # 2023 sheet in the workbook covers Jan-Jun only; full 2023 comes from the ORNL export
        frames.append(parse_sheet(pd.read_excel(x, s, header=None), int(s), f"{WB.name}:{s}"))
o = pd.read_csv(R/"data/raw/oe417/ornl_oe417_annual_summaries_2023.csv", encoding="utf-8-sig")
o = o.rename(columns={"date_event_began":"date_began","time_event_began":"time_began","date_of_restoration":"date_restored",
    "time_of_restoration":"time_restored","number_of_customers_affected":"customers_affected"})
o = o[[c for c in CANON.values() if c in o.columns]]; o["report_year"] = 2023; o["source"] = "ornl_oe417_annual_summaries_2023.csv"
frames.append(o)
for f in sorted(glob.glob(str(R/"data/raw/oe417/extra/*.xls*"))):
    y = int(re.search(r"(20\d\d)", pathlib.Path(f).name).group(1))
    frames.append(parse_sheet(pd.read_excel(f, header=None), y, pathlib.Path(f).name))
d = pd.concat(frames, ignore_index=True)
d["date_began"] = pd.to_datetime(d["date_began"], errors="coerce")
area = d["area_affected"].fillna("").astype(str)
nerc = d["nerc_region"].fillna("").astype(str)
d["tx_area"] = area.str.contains(r"\bTexas\b|\bTX\b|ERCOT", case=False, regex=True)
d["tx_nerc"] = nerc.str.contains(r"\bTRE\b|\bERCOT\b|Texas", case=False, regex=True)
d["texas"] = d.tx_area | d.tx_nerc
d["event_type_raw"] = d["event_type"].fillna("").astype(str).str.strip()
d.to_csv(R/"data/processed/oe417_events.csv", index=False)
print(d.groupby("report_year").agg(n=("event_type","size"), tx=("texas","sum")).T.to_string())
