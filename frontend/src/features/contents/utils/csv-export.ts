import type { ContentListItemData } from "../types";
import type { TranslateFn } from "@/i18n/types";

type LabelMap = Record<string, string>;

/**
 * Generate a CSV string from content list data.
 * Uses the translation function to produce localized headers.
 * statusLabelMap and platformLabelMap provide human-readable labels for enums.
 */
export function generateContentsCsv(
  contents: ContentListItemData[],
  t: TranslateFn,
  statusLabelMap: LabelMap,
  platformLabelMap: LabelMap,
): string {
  const headers = [
    t("contents.csv.title"),
    t("contents.csv.company"),
    t("contents.csv.platform"),
    t("contents.csv.status"),
    t("contents.csv.designer"),
    t("contents.csv.editor"),
    t("contents.csv.date"),
  ];

  const rows = contents.map((c) => [
    escapeCsvField(c.title),
    escapeCsvField(c.companyName),
    c.platform ? (platformLabelMap[c.platform] ?? c.platform) : "",
    statusLabelMap[c.status] ?? c.status,
    c.assignedDesigner
      ? `${c.assignedDesigner.firstName} ${c.assignedDesigner.lastName}`.trim()
      : "",
    c.assignedEditor
      ? `${c.assignedEditor.firstName} ${c.assignedEditor.lastName}`.trim()
      : "",
    c.dateAt ? new Date(c.dateAt).toISOString().split("T")[0] : "",
  ]);

  const csvLines = [headers.join(","), ...rows.map((r) => r.join(","))];
  return csvLines.join("\n");
}

/**
 * Trigger a browser download for the given CSV content.
 */
export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
