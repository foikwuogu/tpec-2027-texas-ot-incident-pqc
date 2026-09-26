"""06 - Figures for an IEEE two-column paper (3.5 in single-column width, 300 dpi). Reads report/stats.json and tables only.
Palette: reference categorical slots 1-2 (blue #2a78d6, orange #eb6834) + gray; every bar is direct-labeled (print/grayscale safe)."""
import json, pathlib, pandas as pd, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
R = pathlib.Path(__file__).resolve().parents[1]; F = R/"report/figures"; F.mkdir(parents=True, exist_ok=True)
S = json.load(open(R/"report/stats.json")); DRAFT = "--final" not in __import__("sys").argv
BLUE, ORANGE, GRAY, INK, INK2, GRID = "#2a78d6", "#eb6834", "#b9b8b3", "#0b0b0b", "#52514e", "#e6e5e1"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":7,"axes.edgecolor":INK2,"axes.labelcolor":INK2,"xtick.color":INK2,"ytick.color":INK2,
                     "axes.spines.top":False,"axes.spines.right":False,"axes.linewidth":0.6,"savefig.dpi":300})
def stamp(fig):
    if DRAFT: fig.text(0.995,0.995,"DRAFT",ha="right",va="top",fontsize=6,color="#c0392b",alpha=0.8)

# Fig 1 - SCADA / CPM in place vs detected, Texas pipeline incidents
bs = S["phmsa"]["by_system"]
rows = [("Gas transmission\n& gathering", bs["gas_transmission_gathering"]["tx_scada_in_place_pct"], bs["gas_transmission_gathering"]["tx_scada_detected_pct_of_in_place"], bs["gas_transmission_gathering"]["tx"]),
        ("Hazardous liquid", bs["hazardous_liquid"]["tx_scada_in_place_pct"], bs["hazardous_liquid"]["tx_scada_detected_pct_of_in_place"], bs["hazardous_liquid"]["tx"]),
        ("Gas distribution", bs["gas_distribution"]["tx_scada_in_place_pct"], bs["gas_distribution"]["tx_scada_detected_pct_of_in_place"], bs["gas_distribution"]["tx"])]
fig, ax = plt.subplots(figsize=(3.5, 2.0)); h = 0.34
for i, (lab, inp, det, n) in enumerate(rows):
    y = len(rows)-1-i
    ax.barh(y+h/2+0.01, inp, h, color=BLUE); ax.barh(y-h/2-0.01, det, h, color=ORANGE)
    ax.text(inp+1.5, y+h/2, f"{inp:.0f}%", va="center", color=INK, fontsize=6.5); ax.text(det+1.5, y-h/2, f"{det:.0f}%", va="center", color=INK, fontsize=6.5)
ax.set_yticks(range(len(rows))); ax.set_yticklabels([f"{r[0]}\n(n={r[3]:,})" for r in rows][::-1])
ax.set_xlim(0, 100); ax.set_xlabel("Percent of Texas onshore incidents, 2010-2026")
ax.xaxis.grid(True, color=GRID, lw=0.5); ax.set_axisbelow(True); ax.tick_params(axis="y", length=0)
ax.legend(handles=[plt.Rectangle((0,0),1,1,color=BLUE), plt.Rectangle((0,0),1,1,color=ORANGE)],
          labels=["SCADA in place", "SCADA detected the event (of in place)"], frameon=False, fontsize=6, loc="lower right", bbox_to_anchor=(1.0, 1.0), ncol=1)
stamp(fig); fig.tight_layout(); fig.savefig(F/"fig1_scada_detection_gap.png"); plt.close(fig)

# Fig 2 - OE-417 Texas events by category, cyber highlighted
lab = {"weather_natural_disaster":"Weather / natural disaster","physical_attack_vandalism":"Physical attack / vandalism","system_operations_equipment":"System operations / equipment",
       "suspicious_activity":"Suspicious activity","transmission_distribution_islanding":"Transmission / distribution / islanding","supply_adequacy_load_shed":"Supply adequacy / load shed",
       "fuel_supply":"Fuel supply","cyber":"Cyber event","other_unknown":"Other / unknown"}
c = pd.Series(S["oe417"]["categories_tx"]).sort_values()
fig, ax = plt.subplots(figsize=(3.5, 2.1))
ax.barh(range(len(c)), c.values, 0.62, color=[ORANGE if k=="cyber" else GRAY for k in c.index])
for i, v in enumerate(c.values): ax.text(v+2, i, f"{v}", va="center", fontsize=6.5, color=INK)
ax.set_yticks(range(len(c))); ax.set_yticklabels([lab[k] for k in c.index]); ax.tick_params(axis="y", length=0)
ax.set_xlabel("Number of events")
ax.xaxis.grid(True, color=GRID, lw=0.5); ax.set_axisbelow(True); ax.set_xlim(0, c.max()*1.12)
stamp(fig); fig.tight_layout(); fig.savefig(F/"fig2_oe417_texas_categories.png"); plt.close(fig)

# Fig 3 - small multiples: advisories citing crypto weaknesses vs OE-417 cyber reports, by year (one axis each)
b = json.load(open(R.parent/"energy-ot-pqc-baseline-2026/report/stats.json"))
tr = pd.DataFrame(b["trend"]).set_index("year")
oe = pd.read_csv(R/"data/processed/oe417_events_classified.csv", low_memory=False)
cy = oe[oe.cyber_any].groupby("report_year").size().reindex(range(S["oe417"]["year_min"], S["oe417"]["year_max"]+1), fill_value=0)
yrs = [y for y in cy.index if y in tr.index]
fig, (a1, a2) = plt.subplots(2, 1, figsize=(3.5, 2.6), sharex=True)
a1.bar(yrs, tr.loc[yrs, "any_crypto"], 0.7, color=BLUE); a1.set_ylabel("Advisories", fontsize=6.5)
a1.set_title("Energy OT advisories citing a crypto weakness", fontsize=6.8, loc="left", color=INK)
a2.bar(yrs, cy.loc[yrs], 0.7, color=ORANGE); a2.set_ylabel("Reports", fontsize=6.5)
a2.set_title("OE-417 reports typed or flagged as cyber (all US)", fontsize=6.8, loc="left", color=INK)
for a, s in ((a1, tr.loc[yrs,"any_crypto"]), (a2, cy.loc[yrs])):
    a.yaxis.grid(True, color=GRID, lw=0.5); a.set_axisbelow(True)
    for x, v in zip(yrs, s): a.text(x, v+0.4, f"{int(v)}", ha="center", va="bottom", fontsize=5.5, color=INK2)
    a.set_ylim(0, max(s)*1.25)
a2.set_xticks(yrs); a2.set_xticklabels([str(y)[2:] and f"'{str(y)[2:]}" for y in yrs])
stamp(fig); fig.tight_layout(); fig.savefig(F/"fig3_advisory_vs_incident_signal.png"); plt.close(fig)
S.setdefault("figures", {})["fig3_years"] = f"{yrs[0]}-{yrs[-1]}"
S["figures"]["fig3_advisory_crypto_total"] = int(tr.loc[yrs,"any_crypto"].sum()); S["figures"]["fig3_oe417_cyber_total"] = int(cy.loc[yrs].sum())
json.dump(S, open(R/"report/stats.json","w"), indent=2, default=str); print("figures written", S["figures"])
