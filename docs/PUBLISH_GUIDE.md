# Publish guide: TechRxiv preprint (Nov 2026), then IEEE TPEC 2027

Nothing here was submitted automatically. TechRxiv and EasyChair both need you to submit personally, because submitting is an attestation. Finish docs/VERIFY_CHECKLIST.md first.

## 0. Build the final files (5 min)
1. `./run_all.sh --final`. This writes `report/TPEC2027_Texas_OT_Incident_PQC.docx`.
2. Open the .docx in Word and export a PDF with **File > Save As > PDF**. Embed fonts, and use US Letter.
3. Both checks must pass:
   - `python scripts/publish_gate.py . --allow-draft-in code/ scripts/ data/raw/phmsa/ data/processed/phmsa_incidents.csv docs/VERIFY_CHECKLIST.md docs/PUBLISH_GUIDE.md`. The allowances cover code and scripts that mention DRAFT mode, the checklist and this guide (which name the tags), and raw PHMSA narratives, which contain the word "draft".
   - `python scripts/check_manuscript.py report/TPEC2027_Texas_OT_Incident_PQC.docx`

## 1. Code and data (optional but recommended before TechRxiv)
TechRxiv does not host datasets or code, so link them instead.
- **GitHub:** create `foikwuogu/tpec-2027-texas-ot-incident-pqc`, push, and tag `v0.1.0`. `scripts/publish_github.py` can do this if you supply a `GITHUB_TOKEN` with repo scope.
- **Zenodo:** archive the release to get a DOI for the code and data, either through the GitHub-Zenodo integration or with `scripts/zenodo_deposit.py`. Put that DOI into reference [9] of the manuscript before you post.

## 2. TechRxiv (about 15 min; screening up to 4 business days)
1. Go to https://www.techrxiv.org and sign in or create an account (name and email).
2. Choose **Submit**, then upload the PDF.
3. Enter the metadata:
   - **Title:** Counting What Incident Reports Cannot See: Cyber, Control-System and Quantum-Readiness Signals in Public Data for Texas Grid and Pipeline OT
   - **Author:** Friday Ogochukwu Ikwuogu (ORCID 0009-0009-2222-1318), Friday.ikwuogu@gmail.com, Independent Researcher, Odessa, Texas, USA (sole author)
   - **Subject category:** Power and energy, or the closest energy/cybersecurity category offered. A second category, if allowed, is Computing and Processing / Security.
   - **Keywords:** operational technology; incident reporting; OE-417; PHMSA; SCADA; post-quantum cryptography; critical infrastructure; Texas
   - **Description:** paste the abstract from the final PDF.
   - **Funding:** none (confirm).
   - **Related content:** the GitHub URL and Zenodo DOI from step 1.
   - **License:** CC BY 4.0, which matches this repository.
4. Submit (single-author paper; no co-author notification needed).
5. When the posted email arrives, record the TechRxiv DOI in docs/EVIDENCE_LOG.csv and save a PDF of the landing page.

## 3. TPEC 2027 (EasyChair; the deadline is not posted yet, and the last two cycles closed in November)
1. Watch https://tpec.engr.tamu.edu/call-for-papers.html. The limit is 6 pages including references, US Letter, all fonts embedded, no Type 3 fonts.
2. Re-flow the manuscript into the official TPEC Word or LaTeX template from the Submissions page. Our layout approximates it but is not the template.
3. Submit through EasyChair. If the form asks about prior posting, disclose the TechRxiv preprint.
4. **IEEE preprint rules:** posting to TechRxiv before submission is allowed. Once the paper is submitted and copyright is transferred to IEEE, update the TechRxiv version with the IEEE copyright notice. After publication, TechRxiv links the preprint to the IEEE DOI.
5. Accepted papers must be presented in person to appear in IEEE Xplore, and the final PDF must pass IEEE PDF eXpress.
