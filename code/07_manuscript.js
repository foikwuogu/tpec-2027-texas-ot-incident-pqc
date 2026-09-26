// 07 - Build the IEEE-format manuscript from report/stats.json. Every number below is read from stats; none is typed in.
// node code/07_manuscript.js [--final]
const fs = require("fs"), path = require("path");
const L = require("./lib_ieee");
const R = path.resolve(__dirname, ".."), S = JSON.parse(fs.readFileSync(path.join(R, "report/stats.json")));
const A = JSON.parse(fs.readFileSync(path.join(R, "AUTHORS.json")));
const DRAFT = !process.argv.includes("--final");
const n = (x) => Number(x).toLocaleString("en-US"), p0 = (x) => `${Math.round(x)}%`, p1 = (x) => `${Number(x).toFixed(1)}%`;
const NUMW = (k) => ["zero","one","two","three","four","five","six","seven","eight","nine","ten"][k] || String(k);
const pct = (a, b) => (100 * a / b);
const ph = S.phmsa, bs = ph.by_system, gt = bs.gas_transmission_gathering, hl = bs.hazardous_liquid, gd = bs.gas_distribution;
const oe = S.oe417, pq = S.pqc_baseline, ind = Object.fromEntries((pq.indicators || []).map((i) => [i.id, i.value_2026]));
const txTotal = ph.tx_total, txShare = pct(txTotal, ph.national_reports);

// ---- references: numbered in order of first citation ----
const REFS = {
  mosca: "M. Mosca, “Cybersecurity in an era with quantum computers: Will we be ready?” _IEEE Security & Privacy_, vol. 16, no. 5, pp. 38–41, 2018.",
  fips: "National Institute of Standards and Technology, _FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA)_, Gaithersburg, MD, USA, Aug. 2024.",
  ir8547: "D. Moody _et al._, “Transition to post-quantum cryptography standards,” NIST IR 8547 (initial public draft), Nov. 2024.",
  cisaot: "Cybersecurity and Infrastructure Security Agency, “Post-quantum considerations for operational technology,” Oct. 2024.",
  oe417form: "U.S. Department of Energy, _Form OE-417, Electric Emergency Incident and Disturbance Report, and Instructions_, OMB No. 1901-0288, expires May 31, 2027.",
  oe417sum: "U.S. Department of Energy, “Electric disturbance events (OE-417) annual summaries,” https://www.oe.netl.doe.gov/OE417_annual_summary.aspx.",
  ornl: "Oak Ridge National Laboratory, Open Energy Data Portal, “DOE OE-417 annual summaries” (2023), https://openenergyhub.ornl.gov/explore/dataset/oe-417-annual-summaries/, accessed Sep. 23, 2026.",
  phmsaff: "Pipeline and Hazardous Materials Safety Administration, “Distribution, transmission & gathering, LNG, and liquid accident and incident data,” https://www.phmsa.dot.gov/data-and-statistics/pipeline/distribution-transmission-gathering-lng-and-liquid-accident-and-incident-data, files dated Sep. 7, 2026.",
  cfr: "Code of Federal Regulations, Title 49, Parts 191 (§191.3, §191.9, §191.15) and 195 (§195.50, §195.54).",
  forms: "PHMSA, Forms F 7100.1 (rev. 9-2023), F 7100.2 (rev. 9-2023), and F 7000-1 (rev. 3-2021), incident/accident report data-field documentation.",
  cip008: "North American Electric Reliability Corporation, CIP-008-6, “Cyber security — incident reporting and response planning,” effective Jan. 1, 2021.",
  tsa: "Transportation Security Administration, Security Directive Pipeline-2021-01G, effective Jan. 16, 2026 (supersedes Pipeline-2021-01F); the 24-hour window for reporting cybersecurity incidents to CISA dates from Pipeline-2021-01B, see “Ratification of security directives,” _Federal Register_, Apr. 19, 2024.",
  circia: "Cyber Incident Reporting for Critical Infrastructure Act of 2022, 6 U.S.C. §681 _et seq._; CISA targeted its implementing rule for finalization in September 2026.",
  blount: "J. Blount, testimony before the U.S. Senate Committee on Homeland Security and Governmental Affairs, hearing on the Colonial Pipeline cyber attack, Jun. 8, 2021.",
  ong: "F. O. Ikwuogu, S. Abutu, and A. Orimogunje, “ONG-OT vulnerability prioritization dataset,” v1.1, Zenodo, 2026, doi: 10.5281/zenodo.22729882.",
  xwalk: "F. O. Ikwuogu, A. Orimogunje, E. O. Pinyi, and D. Mike-Ewewie, “PQC readiness crosswalk for energy OT protocols and identity systems,” v1.0, Zenodo, 2026, doi: 10.5281/zenodo.22730718.",
  baseline: "F. O. Ikwuogu, A. Orimogunje, E. O. Pinyi, and D. Mike-Ewewie, “PQC readiness of the energy OT stack: A 2026 baseline,” tech. rep. v1.0.0, Zenodo, 2026, doi: 10.5281/zenodo.22975133.",
  repo: "F. O. Ikwuogu _et al._, code and data for this paper, v1.0.0, https://github.com/foikwuogu/tpec-2027-texas-ot-incident-pqc, Zenodo, 2026, doi: 10.5281/zenodo.22982191.",
};
const order = []; const c = (...keys) => "[" + keys.map((k) => { if (!REFS[k]) throw new Error("no ref " + k); if (!order.includes(k)) order.push(k); return order.indexOf(k) + 1; }).join("], [") + "]";

// ---- front matter ----
const people = [A.authors[0], ...A.collaborators];
const front = [
  new L.Paragraph({ alignment: L.AlignmentType.CENTER, spacing: { after: 160 }, children: [new L.TextRun({ text: "Counting What Incident Reports Cannot See: Cyber, Control-System and Quantum-Readiness Signals in Public Data for Texas Grid and Pipeline OT", font: L.FONT, size: 44 })] }),
  L.AUTHORS(people.map((a) => [a.name, a.affiliation, a.email])),
  new L.Paragraph({ spacing: { after: 120 }, children: [] }),
];

// ---- body ----
const B = [];
B.push(L.ABS("Abstract—", `Public incident data are how researchers, regulators and the public see failures in energy infrastructure. This paper asks whether the two federal systems that cover Texas energy, DOE Form OE-417 for the grid and the PHMSA incident reports for pipelines, can see cyber and control-system causes, and sets that visibility against the cryptographic state of the operational technology (OT) those operators run. Across ${n(ph.national_reports)} PHMSA reports filed from ${ph.year_min} to ${ph.latest_incident_date.slice(0,4)}, none of the three form revisions offers a cyber cause, and no narrative describes a cyber event. In Texas (${n(txTotal)} onshore reports) SCADA was in place for ${p0(gt.tx_scada_in_place_pct)} of gas transmission incidents but detected ${p0(gt.tx_scada_detected_pct_of_in_place)} of those, and ${p0(hl.tx_scada_detected_pct_of_in_place)} of hazardous liquid incidents. Of ${n(oe.tx_events)} OE-417 events in Texas or ERCOT from ${oe.year_min} to ${oe.year_max}, ${oe.tx_cyber_any} were typed or flagged as cyber and none reported lost load; ${oe.tx_cyber_alert_noncyber_type} carried a cyber alert under a non-cyber event type. Meanwhile ${p1(pq.ytd_any_crypto_pct)} of 2026 energy OT advisories cite a cryptographic weakness and ${ind.I2 || "[I2]"} energy OT protocol families have a published post-quantum mechanism. A harvest-now-decrypt-later compromise produces neither an outage nor a release, so it would not appear in either system. It measures the gap and proposes four reporting changes to narrow it.`));
B.push(L.ABS("Index Terms—", "Operational technology, incident reporting, OE-417, PHMSA, SCADA, post-quantum cryptography, critical infrastructure, Texas."));

B.push(L.SEC("I. Introduction"));
B.push(L.P(`Texas carries an outsized share of U.S. energy risk. In the PHMSA incident record since ${ph.year_min}, Texas accounts for ${p1(hl.tx_share_pct)} of hazardous liquid accidents and ${p1(gt.tx_share_pct)} of gas transmission and gathering incidents, and ERCOT runs the only major U.S. grid interconnection that lies almost entirely within one state. The public record of what goes wrong in these systems comes largely from two federal forms: DOE Form OE-417 for electric emergencies and disturbances ${c("oe417form", "oe417sum")}, and the PHMSA incident and accident reports for pipelines ${c("phmsaff", "cfr")}. Researchers use them to study reliability, regulators use them to target inspections, and the public uses them to judge risk.`));
B.push(L.P(`Both forms were designed to capture physical consequences: customers without power, barrels released, people hurt. Cyber threats to OT increasingly do not work that way. The clearest case is the harvest-now-decrypt-later (HNDL) threat to cryptography, in which an adversary records protected traffic today and decrypts it once a cryptographically relevant quantum computer exists ${c("mosca")}. NIST has finalised the first post-quantum cryptography (PQC) standards ${c("fips")} and proposed a transition timeline ${c("ir8547")}, and CISA has flagged OT as a hard case because devices stay in service for decades ${c("cisaot")}. An HNDL compromise causes no outage and no release. This paper asks whether the public incident record could register such a compromise—or any precursor to it—at all.`));
B.push(L.P("This paper makes three contributions:", { noIndent: false }));
B.push(L.BUL(`• A reproducible Texas-focused subset of both federal incident datasets, with a harmonised OE-417 event taxonomy and a screened narrative corpus, built only from public files ${c("repo")}.`));
B.push(L.BUL("• Measurements of what those datasets can see about cyber and control-system causes, including the SCADA detection gap, set against the cryptographic-weakness and PQC-readiness picture of energy OT products."));
B.push(L.BUL("• Four concrete reporting changes that would make the gap visible without new confidential disclosures."));

B.push(L.SEC("II. Reporting Regimes"));
B.push(L.SUB("A. The Two Public Systems"));
B.push(L.P(`OE-417 is mandatory for balancing authorities, reliability coordinators and many utilities. Its alert criteria include cyber events that could affect adequacy or reliability, and DOE publishes annual summaries with the date, area, NERC region, alert criterion, event type, lost load and customers affected ${c("oe417sum")}. PHMSA incident reports are required under 49 CFR Parts 191 and 195 when a release crosses a consequence threshold ${c("cfr")}. Each report carries a structured cause tree, a free-text narrative, and fields recording whether SCADA and computational pipeline monitoring (CPM) were in place and whether they detected the event ${c("forms")}.`));
B.push(L.SUB("B. The Confidential Channels"));
B.push(L.P(`Cyber incidents are reported elsewhere. NERC CIP-008-6 requires registered entities to report Reportable Cyber Security Incidents and attempts to the E-ISAC and CISA ${c("cip008")}. TSA security directives require covered pipeline owners to report cybersecurity incidents to CISA within 24 hours ${c("tsa")}, and CIRCIA will extend incident reporting across critical infrastructure once CISA\u2019s implementing rule takes effect ${c("circia")}. These channels are confidential by design. Their existence explains part of the silence measured below; it does not make that silence any less of a problem for anyone who relies on the public record.`));

B.push(L.SEC("III. Data and Methods"));
B.push(L.P(`**PHMSA.** The analysis uses the three incident flat files for January 2010 to present (gas transmission and gathering, hazardous liquid, gas distribution; files dated ${ph.file_date}; latest incident ${ph.latest_incident_date}) ${c("phmsaff")}. Each file holds one row per report. A report is Texas when its onshore location state is TX; ${ph.tx_offshore_reports_excluded} offshore reports in Texas waters are excluded. The cause tree of each form revision ${c("forms")} was checked for any cyber category.`));
B.push(L.P(`**Narrative screen.** All ${n(ph.national_reports)} narratives were screened using three term lists: cyber (e.g., _cyberattack_, _malware_, _ransomware_, _unauthorized access_), control-system (_SCADA_, _RTU_, _PLC_, _HMI_, _control room_) and communications or software (_loss of communication_, _firmware_, _programming_). An exclusion list removes non-cyber senses such as _water intrusion_ and _pressure controller_. ${["Zero","One","Two","Three","Four","Five"][ph.screen_initial_false_positives]} early matches were false positives (an answering service named “Cybertel,” a street named Hackett Road, and “remote access” meaning rugged terrain); those patterns were tightened and the screen re-run. A match identifies a candidate for review, not a confirmed finding; every Texas match is listed for adjudication in the released data.`));
B.push(L.P(`**OE-417.** DOE annual sheets for ${oe.year_min}–2022 come from the DOE compiled workbook; the workbook’s 2023 sheet covers January–June only, so 2023 comes from the full-year ORNL export of the same summaries ${c("ornl")}. Event-type labels varied across years—${oe.raw_event_type_labels} distinct raw labels—and were mapped to ${NUMW(oe.n_categories)} categories using ordered rules, with cyber matched first. An event is Texas when its area names Texas or its NERC region is TRE/ERCOT. An event is cyber-flagged when its type or its alert criterion names a cyber event.`));
B.push(L.P(`**Product side.** Cryptographic weakness and PQC-readiness indicators are reused, not recomputed, from the author’s 2026 baseline ${c("baseline")}, which draws on CISA ICS advisories via the ONG-OT dataset ${c("ong")} and a PQC protocol crosswalk ${c("xwalk")}. Advisories do not say where products are deployed, so this layer is sector-wide, not Texas-specific.`));
B.push(L.P(`Every number in this paper is written by the pipeline to a single statistics file and read from it when the manuscript is built, so text and data cannot drift apart ${c("repo")}.`));

B.push(L.SEC("IV. Results"));
B.push(L.SUB("A. Pipelines: No Place to Put a Cyber Cause"));
B.push(L.P(`None of the three PHMSA form revisions contains the word “cyber.” The only route for a malicious cause is _Other Outside Force Damage → Intentional Damage_, whose subtypes are vandalism, terrorism, theft of commodity, theft of equipment and other. Nationally ${ph.national_intentional_damage_reports} reports since ${ph.year_min} used that route, ${ph.national_intentional_terrorism} of them as terrorism; every one describes physical tampering, theft or arson. The narrative screen found no cyber description in any of the ${n(ph.national_reports)} reports.`));
B.push(L.P(`What the forms do capture is how incidents are detected, and there the record points to a control-system gap (Table I, Fig. 1). SCADA was in place for ${p0(gt.tx_scada_in_place_pct)} of Texas gas transmission and gathering incidents, yet detected the event in ${p0(gt.tx_scada_detected_pct_of_in_place)} of those. For hazardous liquid the figures are ${p0(hl.tx_scada_in_place_pct)} and ${p0(hl.tx_scada_detected_pct_of_in_place)}, and CPM leak detection, where installed, detected ${p1(hl.tx_cpm_detected_pct_of_in_place)} of accidents. Texas detection rates are close to national ones (${p0(gt.national_scada_detected_pct_of_in_place)} and ${p0(hl.national_scada_detected_pct_of_in_place)}). Most releases are discovered by people, not by the control systems meant to monitor the line.`));
B.push(...L.TABLE("Table I. Texas PHMSA reports, 2010–" + ph.latest_incident_date.slice(0,4),
  ["Measure", "Gas T&G", "Haz. liquid", "Gas dist."],
  [["Texas onshore reports", n(gt.tx), n(hl.tx), n(gd.tx)],
   ["Texas share of U.S. reports", p1(gt.tx_share_pct), p1(hl.tx_share_pct), p1(gd.tx_share_pct)],
   ["SCADA in place", p1(gt.tx_scada_in_place_pct), p1(hl.tx_scada_in_place_pct), p1(gd.tx_scada_in_place_pct)],
   ["SCADA detected (of in place)", p1(gt.tx_scada_detected_pct_of_in_place), p1(hl.tx_scada_detected_pct_of_in_place), p1(gd.tx_scada_detected_pct_of_in_place)],
   ["Control/relief equipment malfunction", n(gt.tx_cause_detail_control_relief_malfunction), n(hl.tx_cause_detail_control_relief_malfunction), n(gd.tx_cause_detail_control_relief_malfunction)],
   ["Incorrect operation (cause)", n(gt.tx_cause_incorrect_operation), n(hl.tx_cause_incorrect_operation), n(gd.tx_cause_incorrect_operation)],
   ["Narrative: control-system or comms term", n(gt.tx_kw_any), n(hl.tx_kw_any), n(gd.tx_kw_any)],
   ["Narrative: cyber term", n(gt.tx_kw_cyber), n(hl.tx_kw_cyber), n(gd.tx_kw_cyber)]],
  [2240, 920, 960, 920], "Source: PHMSA flat files. Narrative hits are candidates pending adjudication."));
B.push(...L.FIG(path.join(R, "report/figures/fig1_scada_detection_gap.png"), `Fig. 1. SCADA presence and detection in Texas onshore pipeline incidents, ${ph.year_min}–${ph.latest_incident_date.slice(0,4)}. Detection is shown as a share of incidents where SCADA was in place.`));
B.push(L.P(`${n(ph.tx_kw_any_total)} Texas narratives (${p1(pct(ph.tx_kw_any_total, txTotal))}) mention a control-system or communications term. Most describe the control room shutting a line after field staff called it in; a smaller set describe lost communications, PLC programming or logic changes near the failure. The cause codes have no field for that second group: a programming error that leads to an overpressure is filed as equipment failure or incorrect operation.`));

B.push(L.SUB("B. Grid: Cyber Is Reported, Rarely and Without Consequence"));
B.push(L.P(`From ${oe.year_min} to ${oe.year_max} OE-417 recorded ${n(oe.national_events)} events, ${n(oe.tx_events)} (${p1(oe.tx_share_pct)}) in Texas or ERCOT. Weather dominates (Fig. 2). ${oe.tx_cyber_any} Texas events (${p1(oe.tx_cyber_any_pct)}) were typed or flagged as cyber, between ${oe.tx_cyber_years}; ${oe.tx_cyber_with_reported_loss} reported any lost load or customers. Nationally, ${oe.national_cyber_any} events were cyber-flagged and ${oe.cyber_with_customer_loss} reported customers affected.`));
B.push(...L.FIG(path.join(R, "report/figures/fig2_oe417_texas_categories.png"), `Fig. 2. OE-417 events in Texas or ERCOT by harmonised category, ${oe.year_min}–${oe.year_max} (n = ${n(oe.tx_events)}).`));
B.push(L.P(`The coding shows inconsistencies. ${oe.national_cyber_alert_noncyber_type} events nationally, ${oe.tx_cyber_alert_noncyber_type} of them in Texas, carry a cyber alert criterion under a non-cyber event type, most often _System Operations_. An analyst filtering on event type alone would miss them. A further ${oe.tx_control_center_loss} Texas events report a loss of monitoring or control at a control center, which is the grid analogue of the SCADA fields above; the form does not ask why.`));

B.push(L.SUB("C. Products: The Weakness Is Visible Upstream"));
B.push(L.P(`The product record differs sharply from the incident record. In ${pq.ytd_label.replace("-", "–")} 2026, ${pq.ytd_any_crypto} of ${pq.ytd_advisories} energy OT advisories (${p1(pq.ytd_any_crypto_pct)}) cited a cryptographic weakness, against ${p1(pq.hist_any_crypto_pct)} across ${pq.hist_years} ${c("baseline")}. ${ind.I1 || "[I1]"} energy OT protocol families rely on quantum-vulnerable public-key cryptography in their security standard, ${ind.I2 || "[I2]"} have a published PQC mechanism, and ${ind.I3 || "[I3]"} catalogued OT cryptographic components are broken by Shor’s algorithm ${c("xwalk", "baseline")}. Fig. 3 sets the yearly count of crypto-weakness advisories beside the yearly count of cyber-flagged OE-417 reports (${S.figures.fig3_advisory_crypto_total} against ${S.figures.fig3_oe417_cyber_total} over ${S.figures.fig3_years}). The two are not the same unit and are not meant to be compared as rates; the point is that one channel sees the weakness and the other has no field that could see its exploitation.`));
B.push(...L.FIG(path.join(R, "report/figures/fig3_advisory_vs_incident_signal.png"), `Fig. 3. Energy OT advisories citing a cryptographic weakness (top; CISA ICS advisories via [${order.indexOf("ong") + 1}]) and OE-417 reports typed or flagged as cyber (bottom; all U.S.), ${S.figures.fig3_years}. Separate axes; different units.`));

B.push(L.SEC("V. Discussion"));
B.push(L.P(`Taken together, the three layers show that an HNDL campaign against Texas energy OT would be invisible in the public record by design. It exploits weaknesses that advisories already document, it causes no release, so PHMSA never receives a report, and it causes no outage, so OE-417 never does either. Even disruptive cyber events leave a thin trail: the 2021 Colonial Pipeline ransomware attack hit business IT and led the operator to shut the pipeline as a precaution ${c("blount")}, which is precisely the kind of event that has no natural place in a release-based reporting form: the PHMSA data contain ${S.phmsa.colonial_reports_may_jun_2021 === 0 ? "no Colonial report for any incident in May or June 2021" : `${S.phmsa.colonial_reports_may_jun_2021} Colonial report(s) for incidents in May\u2013June 2021`}. The SCADA detection gap adds a second blind spot: if control systems detect fewer than half of the physical failures they supervise, a manipulated control system could fail without being noticed.`));
B.push(L.P("None of this requires public release of confidential incident details. Four changes are proposed:"));
B.push(L.BUL("• **R1 (PHMSA cause tree).** Add _cyber or control-system compromise_ as an Intentional Damage subtype, and a yes/no/unknown field for a control-system contributing factor, so programming or communications failures are no longer folded into equipment-failure categories."));
B.push(L.BUL("• **R2 (OE-417 consistency).** Validate event type against alert criterion at submission, so a cyber alert cannot be filed under System Operations without a flag."));
B.push(L.BUL("• **R3 (aggregate release).** Publish annual counts, by sector and state, of reports received under CIP-008, the TSA directives and CIRCIA, with no operator detail."));
B.push(L.BUL("• **R4 (readiness, not incidents).** Because HNDL leaves no incident, measure exposure instead: add a short cryptographic-inventory question (has the operator inventoried quantum-vulnerable cryptography in OT, yes/no/in progress) to existing annual reports."));

B.push(L.SEC("VI. Limitations"));
B.push(L.P(`The narrative screen is a keyword filter; the counts of control-system mentions are candidates until adjudicated, which the follow-up study does in full. OE-417 geography is coarse, and events spanning several states count as Texas when Texas is named. The OE-417 series ends in ${oe.year_max} here. The product layer is sector-wide and draws on the author’s own earlier releases. Reporting thresholds exclude small events in both systems, so the absence of evidence is constrained by what each form was designed to capture.`));

B.push(L.SEC("VII. Conclusion"));
B.push(L.P(`Across ${n(ph.national_reports)} pipeline reports and ${n(oe.national_events)} grid events, the public record of Texas energy failures has almost nothing to say about cyber causes and nothing at all to say about cryptographic exposure, while the product record shows that exposure plainly. The gap is structural, cheap to narrow, and worth narrowing before quantum-capable adversaries make the weaknesses exploitable at scale. Data, code and the adjudication list are released with this paper ${c("repo")}.`));

B.push(L.SEC("Acknowledgment"));
const SOLO = people.length === 1;
B.push(L.P(`${SOLO ? "The author" : "The authors"} used AI assistance (Claude, Anthropic) to draft preliminary suggestions and to support preparation of analysis code, figures, and initial text. ${SOLO ? "The author" : "The authors"} reviewed and approved every analytic decision, verified all numerical results, and ${SOLO ? "takes" : "take"} full responsibility for the final content.`, { noIndent: true }));

B.push(L.SEC("References"));
order.forEach((k, i) => B.push(L.REF(i + 1, REFS[k])));
const unused = Object.keys(REFS).filter((k) => !order.includes(k)); if (unused.length) console.warn("unused refs:", unused);

const out = path.join(R, "report", DRAFT ? "TPEC2027_Texas_OT_Incident_PQC_DRAFT.docx" : "TPEC2027_Texas_OT_Incident_PQC.docx");
L.build({ outFile: out, front, body: B, draft: DRAFT, running: (people.length === 1 ? "Ikwuogu" : "Ikwuogu et al.") + " — Cyber and quantum-readiness signals in Texas energy OT incident data" }).then((f) => console.log("wrote", f));
