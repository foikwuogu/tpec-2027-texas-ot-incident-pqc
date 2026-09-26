// IEEE conference layout helpers (docx-js): US Letter, Times New Roman 10 pt, two columns after the title block.
// Holds no numbers; the manuscript script passes strings built from report/stats.json.
const fs = require("fs"), path = require("path");
const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun,
        Header, Footer, PageNumber, SectionType, ShadingType, ExternalHyperlink } = require("docx");
const FONT = "Times New Roman", COL_W = 5040; // 3.5 in column
function runs(text, base = {}) {            // inline markup: **bold**, _italic_, ^sup^
  const out = []; const re = /(\*\*[^*]+\*\*|(?<![\w\/.])_[^_\s][^_]*_(?![\w\/])|\^[^^]+\^)/g; let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), font: FONT, ...base }));
    const t = m[0];
    if (t.startsWith("**")) out.push(new TextRun({ text: t.slice(2, -2), bold: true, font: FONT, ...base }));
    else if (t.startsWith("^")) out.push(new TextRun({ text: t.slice(1, -1), superScript: true, font: FONT, ...base }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, font: FONT, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), font: FONT, ...base }));
  return out;
}
const P = (t, o = {}) => new Paragraph({ children: runs(t, o.run || {}), alignment: o.align || AlignmentType.BOTH,
  indent: o.noIndent ? undefined : { firstLine: 202 }, spacing: { after: 0, line: 240 } });
const SEC = (t) => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 20, smallCaps: true })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 80 }, keepNext: true });
const SUB = (t) => new Paragraph({ children: [new TextRun({ text: t, font: FONT, size: 20, italics: true })], spacing: { before: 80, after: 40 }, keepNext: true });
const ABS = (label, t) => new Paragraph({ children: [new TextRun({ text: label, font: FONT, size: 18, bold: true, italics: true }), ...runs(t, { size: 18, bold: true })],
  alignment: AlignmentType.BOTH, indent: { firstLine: 202 }, spacing: { after: 80, line: 228 } });
const BUL = (t) => new Paragraph({ children: runs(t), alignment: AlignmentType.BOTH, indent: { left: 288, hanging: 158 }, spacing: { after: 20, line: 240 },
  bullet: undefined, ...{} });
function pngSize(f) { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }
function FIG(file, caption, wIn = 3.4) {
  const { w, h } = pngSize(file); const W = Math.round(wIn * 96), H = Math.round(W * h / w);
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 40 }, keepNext: true,
            children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: W, height: H },
              altText: { title: path.basename(file), description: caption, name: path.basename(file) } })] }),
          new Paragraph({ children: runs(caption, { size: 16 }), alignment: AlignmentType.BOTH, spacing: { after: 120, line: 200 } })];
}
function TABLE(title, header, rows, widths, note) {
  const total = widths.reduce((a, b) => a + b, 0);
  const line = { style: BorderStyle.SINGLE, size: 4, color: "000000" }, none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const cell = (t, i, head, last) => new TableCell({ width: { size: widths[i], type: WidthType.DXA },
    borders: { top: head ? line : none, bottom: head || last ? line : none, left: none, right: none },
    margins: { top: 20, bottom: 20, left: 60, right: 60 },
    children: [new Paragraph({ alignment: i > 0 && /^[\s\d.,%+\-–()\/]+$/.test(String(t)) ? AlignmentType.RIGHT : AlignmentType.LEFT,
      children: runs(String(t), { size: 16, bold: head }) })] });
  return [new Paragraph({ children: [new TextRun({ text: title, font: FONT, size: 16, smallCaps: true })], alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true }),
    new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, alignment: AlignmentType.CENTER,
      rows: [new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, i, true, false)) }),
        ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, ri === rows.length - 1)) }))] }),
    new Paragraph({ children: runs(note || "", { size: 14 }), spacing: { before: 40, after: 120 }, alignment: AlignmentType.BOTH })];
}
const REF = (n, t) => new Paragraph({ children: runs(`[${n}]  ${t}`, { size: 16 }), indent: { left: 360, hanging: 360 }, alignment: AlignmentType.LEFT, spacing: { after: 30, line: 200 } });
function AUTHORS(authors) {
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, n = authors.length, W = Math.floor(10440 / n);
  return new Table({ width: { size: W * n, type: WidthType.DXA }, columnWidths: Array(n).fill(W), alignment: AlignmentType.CENTER,
    rows: [new TableRow({ children: authors.map((a) => new TableCell({ width: { size: W, type: WidthType.DXA },
      borders: { top: none, bottom: none, left: none, right: none }, margins: { left: 60, right: 60 },
      children: a.map((line, i) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 220 },
        children: [new TextRun({ text: line, font: FONT, size: i === 0 ? 20 : 18, italics: i > 0 && i < a.length - 1 })] })) })) })] });
}
function build({ outFile, front, body, draft, running }) {
  const hdr = new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: draft ? "DRAFT — not for citation or distribution — author verification pending" : running, font: FONT, size: 14, color: draft ? "A61C1C" : "555555" })] })] });
  const ftr = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] });
  const page = { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1440, left: 900, right: 900, header: 500, footer: 600 } };
  const doc = new Document({ title: running, styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [{ properties: { page }, headers: { default: hdr }, footers: { default: ftr }, children: front },
               { properties: { page, type: SectionType.CONTINUOUS, column: { count: 2, space: 360, equalWidth: true } }, headers: { default: hdr }, footers: { default: ftr }, children: body }] });
  return Packer.toBuffer(doc).then((b) => { fs.writeFileSync(outFile, b); return outFile; });
}
module.exports = { P, SEC, SUB, ABS, BUL, FIG, TABLE, REF, AUTHORS, build, runs, Paragraph, TextRun, AlignmentType, FONT };
