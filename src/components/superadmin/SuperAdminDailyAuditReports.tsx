import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoredDailyAuditReport, AnalysisInsight } from '../../types';
import {
  Clock,
  Database,
  Download,
  FileText,
  RefreshCw,
  Trash2,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Zap,
  HardDrive
} from 'lucide-react';

export const SuperAdminDailyAuditReports: React.FC = () => {
  const {
    storedAuditReports,
    generateDailyAuditReportNow,
    deleteStoredAuditReport,
    lastCronRunTimestamp,
    formatTZS,
    institutions
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<StoredDailyAuditReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualTrigger = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport = generateDailyAuditReportNow();
      setIsGenerating(false);
      showToast(`Report ${newReport.reportCode} successfully generated and saved to Cloud Storage!`);
    }, 800);
  };

  const handleDownloadJSON = (report: StoredDailyAuditReport) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${report.reportCode}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Downloaded JSON for ${report.reportCode}`);
  };

  const handleDownloadCSV = (report: StoredDailyAuditReport) => {
    const headers = [
      'Report ID',
      'Report Code',
      'Generated At',
      'Bucket Path',
      'Health Score (%)',
      'Risk Index (%)',
      'Active Tenants',
      'Total Members',
      'Total Transactions',
      'Total Volume (TZS)',
      'Non-Performing Loan (%)',
      'Liquidity Ratio (%)'
    ];

    const data = [
      [
        report.id,
        report.reportCode,
        report.generatedAt,
        report.bucketPath,
        report.automatedAnalysis.healthScore,
        report.automatedAnalysis.riskIndex,
        report.activeTenantsCount,
        report.totalMembersCount,
        report.totalTransactionsCount,
        report.totalVolumeTZS,
        report.automatedAnalysis.nonPerformingLoanPercentage,
        report.automatedAnalysis.liquidityRatioPercentage
      ]
    ];

    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.reportCode}_summary.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Downloaded CSV for ${report.reportCode}`);
  };

  // Calculate next run time (24h after last run)
  const nextRunTime = new Date(lastCronRunTimestamp + 24 * 60 * 60 * 1000).toLocaleString('sw-TZ');

  const getInsightBadge = (category: AnalysisInsight['category'], severity: AnalysisInsight['severity']) => {
    if (severity === 'High') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900';
    }
    if (severity === 'Medium') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
    if (category === 'Liquidity' || category === 'Performance') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/50 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-black tracking-tight">24-Hour Automated Audit Storage & Data Analytics Engine</h2>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
              Mfumo huu unazalisha ripoti kamili ya Audit Log kila masaa 24, unafanya uchambuzi wa takwimu kwa algorithm ya AI Data Analysis, na kuhifadhi ripoti kwenye Cloud Storage Bucket kwa ukaguzi wa SuperAdmin.
            </p>
          </div>

          <button
            onClick={handleManualTrigger}
            disabled={isGenerating}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Inazalisha Ripoti...' : 'Trigger 24H Audit Run Now'}</span>
          </button>
        </div>

        {/* Cron Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Ratiba ya Cron: <strong>Kila Masaa 24 (Interval Check)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mzunguko Unaofuata: <strong>{nextRunTime}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Storage Bucket: <strong className="font-mono text-[10px] text-indigo-300">gs://zanzibar-saccos-audit-bucket/daily-summaries/</strong></span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Jumla ya Ripoti zilizohifadhiwa</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{storedAuditReports.length}</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 block">Automated Daily Archives</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Afya ya Mfumo (Latest Health Score)</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {storedAuditReports[0]?.automatedAnalysis.healthScore || 100}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Platform Stability Rating</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Kiwango cha Hatari (Latest Risk Index)</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {storedAuditReports[0]?.automatedAnalysis.riskIndex || 0}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Audit Anomaly Index</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Hali ya Storage Bucket</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Cloud Synced
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">GCP Bucket Persistent Storage</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Daily Audit Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Orodha ya Ripoti za Kila Masaa 24 Zilizohifadhiwa (Cloud Storage Bucket)</h3>
            <p className="text-[11px] text-slate-500">Chagua ripoti yoyote kutazama uchambuzi wa kiotomatiki (Automated Data Analysis)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="p-3">Report Code</th>
                <th className="p-3">Tarehe Na Muda</th>
                <th className="p-3">Bucket Storage Path</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">Risk Index</th>
                <th className="p-3">Pending Receipts</th>
                <th className="p-3">Ukubwa wa Faili</th>
                <th className="p-3 text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {storedAuditReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Hakuna ripoti yoyote iliyohifadhiwa. Bofya <strong>"Trigger 24H Audit Run Now"</strong> kuzalisha ripoti ya kwanza.
                  </td>
                </tr>
              ) : (
                storedAuditReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {report.reportCode}
                    </td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                      {report.generatedAt}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={report.bucketPath}>
                      {report.bucketPath}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]">
                        {report.automatedAnalysis.healthScore}/100
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                        report.automatedAnalysis.riskIndex > 30
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {report.automatedAnalysis.riskIndex}%
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                      {report.pendingReceiptsCount}
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[10px]">
                      {report.fileSizeBytes.toLocaleString()} Bytes
                    </td>
                    <td className="p-3 text-right space-x-1.5 flex items-center justify-end">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg transition-colors text-[10px] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Kagua Analysis</span>
                      </button>
                      <button
                        onClick={() => handleDownloadCSV(report)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-emerald-600 dark:text-emerald-400"
                        title="Pakua CSV Summary"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadJSON(report)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-indigo-600 dark:text-indigo-400"
                        title="Pakua JSON Raw File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Je, una uhakika unataka kufuta ripoti #${report.reportCode}?`)) {
                            deleteStoredAuditReport(report.id);
                            showToast(`Imefuta ripoti #${report.reportCode}`);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400"
                        title="Futa Ripoti Hii"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-4xl w-full space-y-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Uchambuzi wa Kiotomatiki wa Ripoti {selectedReport.reportCode}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ilihifadhiwa: <strong>{selectedReport.generatedAt}</strong> • Storage Path: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedReport.bucketPath}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCSV(selectedReport)}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 text-[11px]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* AI Health Score & Risk Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md space-y-2">
                <span className="text-[11px] font-medium opacity-90 block">Overall Platform Health Score</span>
                <div className="text-3xl font-black">{selectedReport.automatedAnalysis.healthScore} / 100</div>
                <p className="text-[10px] opacity-80">Stabilization & Compliance Rating</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-md space-y-2">
                <span className="text-[11px] font-medium opacity-90 block">Audit Risk Index</span>
                <div className="text-3xl font-black">{selectedReport.automatedAnalysis.riskIndex} %</div>
                <p className="text-[10px] opacity-80">Calculated Anomaly Probability</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white shadow-md space-y-2">
                <span className="text-[11px] font-medium opacity-90 block">Audited System Scope</span>
                <div className="text-3xl font-black">{selectedReport.activeTenantsCount} <span className="text-xs font-normal">Tenants</span></div>
                <p className="text-[10px] opacity-80">{selectedReport.totalMembersCount} Members • {selectedReport.totalTransactionsCount} Transactions</p>
              </div>
            </div>

            {/* Executive Summaries */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Ufupisho wa Kiongozi (Executive AI Summaries)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[10px]">SWAHILI EXECUTIVE SUMMARY</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedReport.automatedAnalysis.executiveSummarySwahili}</p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[10px]">ENGLISH EXECUTIVE SUMMARY</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedReport.automatedAnalysis.executiveSummaryEnglish}</p>
                </div>
              </div>
            </div>

            {/* Financial Metrics Summary */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Uchambuzi wa Takwimu za Kifedha (System-wide Financial Metrics)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Jumla ya Miamala (Volume)</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block text-xs mt-0.5">
                    {formatTZS(selectedReport.totalVolumeTZS)}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">NPL Ratio (Kucheleweshwa)</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 block text-xs mt-0.5">
                    {selectedReport.automatedAnalysis.nonPerformingLoanPercentage}%
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Loan-to-Deposit Ratio</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block text-xs mt-0.5">
                    {selectedReport.automatedAnalysis.loanToDepositRatioPercentage}%
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Receipt Clearance Rate</span>
                  <span className="font-extrabold text-teal-600 dark:text-teal-400 block text-xs mt-0.5">
                    {selectedReport.automatedAnalysis.receiptVerificationRatePercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Automated Insights & Recommendations */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Uchambuzi wa AI Na Mapendekezo (Automated Insights & Recommendations)</span>
              </h4>

              <div className="space-y-2">
                {selectedReport.automatedAnalysis.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${getInsightBadge(insight.category, insight.severity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">{insight.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-white/50 dark:bg-slate-900/50">
                        {insight.category} • Severity: {insight.severity}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">{insight.description}</p>
                    <div className="pt-1 text-[10px] font-bold border-t border-current/20 flex items-center gap-1">
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      <span>Hatua Inayopendekezwa: {insight.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution Breakdown Table */}
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Mchanganuo wa Taasisi Katika Mfumo (Institutions Overview)
              </h4>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                      <th className="p-3">Jina la Taasisi</th>
                      <th className="p-3">Aina</th>
                      <th className="p-3">Wanachama</th>
                      <th className="p-3">Hali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                    {institutions.map(inst => (
                      <tr key={inst.id} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{inst.name}</td>
                        <td className="p-3">{inst.type}</td>
                        <td className="p-3">{inst.memberCount} Wanachama</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inst.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Funga
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
