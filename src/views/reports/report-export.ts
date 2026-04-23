export interface ReportSection {
    title: string;
    subtitle?: string;
    narrative: string[];
    tableHeaders: string[];
    tableRows: (string | number)[][];
    summary?: { label: string; value: string | number }[];
}

const escapeHtml = (text: string) =>
    text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const renderSectionHtml = (section: ReportSection, projectName: string, exportedAt: string) => {
    const narrativeBlocks = section.narrative.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
    const summaryRows = section.summary?.length
        ? `<div class="summary">${section.summary.map((s) => `<div class="summary-item"><span class="label">${escapeHtml(s.label)}</span><span class="value">${escapeHtml(String(s.value))}</span></div>`).join("")}</div>`
        : "";
    const tableBlock = section.tableRows.length
        ? `<table>
             <thead><tr>${section.tableHeaders.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
             <tbody>${section.tableRows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`).join("")}</tbody>
           </table>`
        : "";
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(section.title)} — ${escapeHtml(projectName)}</title>
    <style>
        @page { margin: 1.6cm; }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; line-height: 1.55; margin: 0; padding: 32px; background: #fff; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; }
        .brand { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #64748b; }
        h1 { font-size: 26px; margin: 8px 0 4px; }
        .meta { font-size: 12px; color: #64748b; }
        h2 { font-size: 18px; margin-top: 28px; margin-bottom: 8px; color: #0f172a; }
        p { font-size: 13px; color: #334155; margin: 0 0 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 16px 0; }
        .summary-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
        .summary-item .label { display: block; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #64748b; }
        .summary-item .value { display: block; font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th { text-align: left; background: #f1f5f9; padding: 8px 10px; color: #334155; border-bottom: 1px solid #cbd5e1; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #0f172a; }
        .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">Twindix Performance Indicator</div>
        <h1>${escapeHtml(section.title)}</h1>
        <div class="meta">${escapeHtml(projectName)}${section.subtitle ? ` · ${escapeHtml(section.subtitle)}` : ""} · Exported ${escapeHtml(exportedAt)}</div>
    </div>
    <h2>Summary</h2>
    ${narrativeBlocks}
    ${summaryRows}
    ${tableBlock ? `<h2>Detailed Data</h2>${tableBlock}` : ""}
    <div class="footer">
        <span>Twindix Performance Indicator</span>
        <span>Generated ${escapeHtml(exportedAt)}</span>
    </div>
</body>
</html>`;
};

export const downloadSectionAsPdf = (section: ReportSection, projectName: string) => {
    const now = new Date();
    const exportedAt = now.toLocaleString();
    const html = renderSectionHtml(section, projectName, exportedAt);
    const win = window.open("", "_blank", "width=860,height=1024");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
        try { win.print(); } catch { /* no-op */ }
    }, 350);
};

const toCsvCell = (value: string | number) => {
    const str = String(value ?? "");
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
};

export const downloadSectionAsExcel = (section: ReportSection, projectName: string) => {
    const now = new Date();
    const exportedAt = now.toLocaleString();
    const rows: string[] = [];
    rows.push(`Twindix Performance Indicator — ${section.title}`);
    rows.push(`Project: ${projectName}`);
    if (section.subtitle) rows.push(`Scope: ${section.subtitle}`);
    rows.push(`Exported: ${exportedAt}`);
    rows.push("");
    rows.push("Narrative");
    section.narrative.forEach((p) => rows.push(toCsvCell(p)));
    rows.push("");
    if (section.summary?.length) {
        rows.push("Key Metric,Value");
        section.summary.forEach((s) => rows.push(`${toCsvCell(s.label)},${toCsvCell(s.value)}`));
        rows.push("");
    }
    if (section.tableRows.length) {
        rows.push(section.tableHeaders.map(toCsvCell).join(","));
        section.tableRows.forEach((row) => rows.push(row.map(toCsvCell).join(",")));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const safeProject = projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const safeTitle = section.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeProject}-${safeTitle}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
