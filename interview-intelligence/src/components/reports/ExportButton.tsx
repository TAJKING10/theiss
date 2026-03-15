"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, FileSpreadsheet, Check, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ExportData {
  interviews: {
    candidateName: string;
    position: string;
    date: string;
    score: number;
    status: string;
    duration?: number | null;
  }[];
  summary?: {
    totalInterviews: number;
    averageScore: number;
    approvedCount: number;
    reviewCount: number;
    rejectedCount: number;
  };
}

interface ExportButtonProps {
  data: ExportData;
  filename?: string;
  className?: string;
}

export function ExportButton({
  data,
  filename = "interview-report",
  className = "",
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "csv" | null>(null);
  const [exportSuccess, setExportSuccess] = useState<"pdf" | "csv" | null>(null);

  const exportToCSV = async () => {
    setIsExporting("csv");

    try {
      // Build CSV content
      const headers = ["Candidate", "Position", "Date", "Score", "Status", "Duration (min)"];
      const rows = data.interviews.map((interview) => [
        interview.candidateName,
        interview.position,
        interview.date,
        interview.score.toString(),
        interview.status,
        interview.duration?.toString() || "",
      ]);

      // Add summary if available
      let csvContent = headers.join(",") + "\n";
      csvContent += rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

      if (data.summary) {
        csvContent += "\n\n";
        csvContent += "Summary\n";
        csvContent += `Total Interviews,${data.summary.totalInterviews}\n`;
        csvContent += `Average Score,${data.summary.averageScore}%\n`;
        csvContent += `Approved,${data.summary.approvedCount}\n`;
        csvContent += `Under Review,${data.summary.reviewCount}\n`;
        csvContent += `Rejected,${data.summary.rejectedCount}\n`;
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess("csv");
      setTimeout(() => setExportSuccess(null), 2000);
    } catch (error) {
      console.error("CSV export error:", error);
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting("pdf");

    try {
      // Create a printable HTML document
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Could not open print window");
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Interview Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #1a1a2e;
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 10px;
            }
            h2 {
              color: #1a1a2e;
              margin-top: 30px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 20px 0;
            }
            .summary-item {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
              color: #4f46e5;
            }
            .summary-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background: #f9fafb;
              font-weight: 600;
              color: #374151;
            }
            tr:hover {
              background: #f9fafb;
            }
            .score-high { color: #059669; }
            .score-mid { color: #d97706; }
            .score-low { color: #dc2626; }
            .status-approved { background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; }
            .status-review { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; }
            .status-rejected { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #9ca3af;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Interview Intelligence Report</h1>
          <p>Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

          ${data.summary ? `
          <h2>Summary</h2>
          <div class="summary">
            <div class="summary-item">
              <div class="summary-value">${data.summary.totalInterviews}</div>
              <div class="summary-label">Total Interviews</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.summary.averageScore}%</div>
              <div class="summary-label">Average Score</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.summary.approvedCount}</div>
              <div class="summary-label">Approved</div>
            </div>
          </div>
          ` : ""}

          <h2>Interview Results</h2>
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Date</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.interviews
                .map(
                  (interview) => `
                <tr>
                  <td>${interview.candidateName}</td>
                  <td>${interview.position}</td>
                  <td>${interview.date}</td>
                  <td class="${interview.score >= 80 ? "score-high" : interview.score >= 60 ? "score-mid" : "score-low"}">
                    ${interview.score}%
                  </td>
                  <td>
                    <span class="${
                      interview.status === "approved"
                        ? "status-approved"
                        : interview.status === "review"
                          ? "status-review"
                          : "status-rejected"
                    }">
                      ${interview.status === "approved" ? "Approved" : interview.status === "review" ? "Under Review" : "Rejected"}
                    </span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by Interview Intelligence Platform</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setExportSuccess("pdf");
      setTimeout(() => setExportSuccess(null), 2000);
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Button onClick={() => setIsOpen(!isOpen)} className="gap-2">
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-gray-900 border border-white/10 shadow-xl overflow-hidden z-50"
          >
            <button
              onClick={exportToPDF}
              disabled={isExporting !== null}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {isExporting === "pdf" ? (
                <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
              ) : exportSuccess === "pdf" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <FileText className="w-5 h-5 text-red-400" />
              )}
              <span>Export as PDF</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={isExporting !== null}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors disabled:opacity-50 border-t border-white/5"
            >
              {isExporting === "csv" ? (
                <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
              ) : exportSuccess === "csv" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
              )}
              <span>Export as CSV</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default ExportButton;
