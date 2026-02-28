"use client";

import { useState } from "react";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30d");

  const metrics = [
    { label: "Total Interviews", value: "156", change: "+12%", positive: true, icon: "📹" },
    { label: "Avg. AI Score", value: "87%", change: "+5%", positive: true, icon: "🎯" },
    { label: "Bias Flags", value: "3", change: "-40%", positive: true, icon: "⚠️" },
    { label: "Time to Hire", value: "12d", change: "-18%", positive: true, icon: "⏱️" },
  ];

  const departmentData = [
    { name: "Engineering", interviews: 45, avgScore: 89, hired: 12 },
    { name: "Product", interviews: 28, avgScore: 85, hired: 8 },
    { name: "Design", interviews: 22, avgScore: 91, hired: 6 },
    { name: "Marketing", interviews: 18, avgScore: 83, hired: 5 },
    { name: "Sales", interviews: 25, avgScore: 86, hired: 7 },
  ];

  const recentReports = [
    { id: 1, name: "Q4 Hiring Analysis", date: "2024-01-15", type: "Quarterly", status: "ready" },
    { id: 2, name: "Engineering Team Report", date: "2024-01-14", type: "Department", status: "ready" },
    { id: 3, name: "Bias Detection Summary", date: "2024-01-12", type: "Analysis", status: "ready" },
    { id: 4, name: "Interview Efficiency", date: "2024-01-10", type: "Performance", status: "generating" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-white/50">Comprehensive insights into your hiring process.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{metric.icon}</span>
              <span className={`text-sm font-medium ${metric.positive ? "text-green-400" : "text-red-400"}`}>
                {metric.change}
              </span>
            </div>
            <p className="text-white/50 text-sm mb-1">{metric.label}</p>
            <p className="text-3xl font-bold">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Interview Trends Chart */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
          <h3 className="font-semibold text-lg mb-6">Interview Trends</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 45, 78, 52, 90, 68, 85, 72, 95, 80, 88, 75].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${value}%` }}
                />
                <span className="text-xs text-white/30">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
          <h3 className="font-semibold text-lg mb-6">AI Score Distribution</h3>
          <div className="space-y-4">
            {[
              { range: "90-100", count: 45, color: "bg-green-500" },
              { range: "80-89", count: 62, color: "bg-blue-500" },
              { range: "70-79", count: 35, color: "bg-yellow-500" },
              { range: "60-69", count: 12, color: "bg-orange-500" },
              { range: "Below 60", count: 2, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.range} className="flex items-center gap-4">
                <span className="w-20 text-sm text-white/50">{item.range}</span>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-lg transition-all`}
                    style={{ width: `${(item.count / 62) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-white/70">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden mb-8">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-semibold text-lg">Department Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-sm font-medium text-white/50 p-4">Department</th>
                <th className="text-left text-sm font-medium text-white/50 p-4">Interviews</th>
                <th className="text-left text-sm font-medium text-white/50 p-4">Avg. Score</th>
                <th className="text-left text-sm font-medium text-white/50 p-4">Hired</th>
                <th className="text-left text-sm font-medium text-white/50 p-4">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept) => (
                <tr key={dept.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium">{dept.name}</td>
                  <td className="p-4 text-white/70">{dept.interviews}</td>
                  <td className="p-4">
                    <span className={`font-medium ${dept.avgScore >= 88 ? "text-green-400" : "text-blue-400"}`}>
                      {dept.avgScore}%
                    </span>
                  </td>
                  <td className="p-4 text-white/70">{dept.hired}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${(dept.hired / dept.interviews) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-white/50">
                        {Math.round((dept.hired / dept.interviews) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Recent Reports</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {recentReports.map((report) => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-white/50">{report.type} • {report.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  report.status === "ready"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}>
                  {report.status === "ready" ? "Ready" : "Generating..."}
                </span>
                {report.status === "ready" && (
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
