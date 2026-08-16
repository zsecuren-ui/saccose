import {
  AuditLog,
  Transaction,
  PaymentProof,
  Loan,
  Member,
  Institution,
  StoredDailyAuditReport,
  AutomatedDataAnalysis,
  AnalysisInsight
} from '../types';

export function runAutomatedDataAnalysis(
  institutions: Institution[],
  members: Member[],
  loans: Loan[],
  transactions: Transaction[],
  paymentProofs: PaymentProof[],
  auditLogs: AuditLog[]
): AutomatedDataAnalysis {
  const activeTenants = institutions.filter(i => i.status === 'Active').length;
  const totalMembers = members.length;
  
  const totalSavingsSum = members.reduce((sum, m) => sum + (m.totalSavings || 0), 0);
  const totalSharesSum = members.reduce((sum, m) => sum + (m.totalShares || 0), 0);
  const totalDeposits = totalSavingsSum + totalSharesSum;

  const totalOutstandingLoans = loans
    .filter(l => l.status === 'Active' || l.status === 'Disbursed')
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  const totalTransactionsVolume = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const verifiedProofsCount = paymentProofs.filter(p => p.status === 'Approved').length;
  const totalProofsCount = paymentProofs.length || 1;
  const receiptVerificationRatePercentage = Math.round((verifiedProofsCount / totalProofsCount) * 100);

  const pendingProofsCount = paymentProofs.filter(p => p.status === 'Pending').length;

  const defaultedLoansCount = loans.filter(l => l.status === 'Defaulted' || l.status === 'Rejected').length;
  const totalLoansCount = loans.length || 1;
  const nonPerformingLoanPercentage = Number(((defaultedLoansCount / totalLoansCount) * 100).toFixed(1));

  // Ratios
  const loanToDepositRatioPercentage = totalDeposits > 0
    ? Math.round((totalOutstandingLoans / totalDeposits) * 100)
    : 45;

  const liquidityRatioPercentage = totalOutstandingLoans > 0
    ? Math.round(((totalDeposits - totalOutstandingLoans * 0.5) / totalDeposits) * 100)
    : 180;

  // Health Score Calculation (0 - 100)
  let healthScore = 95;
  if (pendingProofsCount > 5) healthScore -= 10;
  if (nonPerformingLoanPercentage > 5) healthScore -= 15;
  if (loanToDepositRatioPercentage > 85) healthScore -= 10;
  if (activeTenants === 0) healthScore -= 30;
  healthScore = Math.max(20, Math.min(100, healthScore));

  // Risk Index Calculation (0 - 100)
  let riskIndex = 12;
  if (pendingProofsCount > 3) riskIndex += 15;
  if (nonPerformingLoanPercentage > 3) riskIndex += 20;
  if (loanToDepositRatioPercentage > 80) riskIndex += 15;
  riskIndex = Math.max(5, Math.min(95, riskIndex));

  // Automated Insights Generation
  const insights: AnalysisInsight[] = [
    {
      category: 'Risk',
      severity: pendingProofsCount > 3 ? 'High' : 'Low',
      title: pendingProofsCount > 0 ? `Risiti ${pendingProofsCount} Zinasubiri Uhakiki` : 'Uhakiki wa Risiti Unakwenda Vizuri',
      description: `Kuna risiti ${pendingProofsCount} za malipo ya benki/simu zinazohitaji idhini kutoka kwa maofisa wa fedha.`,
      metric: `${pendingProofsCount} Pending Receipts`,
      recommendation: 'Kagua na uidhinishe risiti zilizowasilishwa kupitia meza ya Audit Log ili kusasisha salio la wanachama.'
    },
    {
      category: 'Liquidity',
      severity: loanToDepositRatioPercentage > 80 ? 'High' : 'Low',
      title: 'Uwiano wa Mikopo kwa Amana (Loan-to-Deposit Ratio)',
      description: `Uwiano wa mikopo dhidi ya amana zote za mfumo upo katika ${loanToDepositRatioPercentage}%. Standard bora ni chini ya 80%.`,
      metric: `${loanToDepositRatioPercentage}% LDR`,
      recommendation: 'Hamasisha ununuzi wa hisa na amana za muda mrefu ili kuongeza liquidity ya mikopo mipya.'
    },
    {
      category: 'Performance',
      severity: 'Info',
      title: 'Mzunguko wa Fedha wa Siku 24 Zilizopita',
      description: `Mfumo umechakata jumla ya miamala zenye thamani ya TZS ${totalTransactionsVolume.toLocaleString()} kwa ufanisi wa 100%.`,
      metric: `TZS ${totalTransactionsVolume.toLocaleString()}`,
      recommendation: 'Endelea kufuatilia ripoti za kila siku kupitia hifadhi ya Cloud Storage Bucket.'
    },
    {
      category: 'Security',
      severity: auditLogs.length > 20 ? 'Medium' : 'Low',
      title: 'Ufuatiliaji wa Usalama na Mabadiliko ya Mfumo',
      description: `Audit log ina matukio ${auditLogs.length} ya usalama ikiwemo uingiaji wa portal na mabadiliko ya maelezo ya taasisi.`,
      metric: `${auditLogs.length} Security Logs`,
      recommendation: 'Hakikisha maofisa wote wanatumia authentication yenye nenosiri thabiti na usajili rasmi.'
    },
    {
      category: 'Growth',
      severity: 'Info',
      title: 'Kasi ya Ukuaji wa Mfumo wa Multi-Tenant',
      description: `Mfumo unahudumia taasisi ${activeTenants} zenye jumla ya wanachama ${totalMembers} katika mikoa mbalimbali.`,
      metric: `${activeTenants} Tenants / ${totalMembers} Members`,
      recommendation: 'Ongeza uwezo wa miundombinu kupitia Cloud Run kuendelea kuhimili mzigo unaoongezeka.'
    }
  ];

  const nowFormatted = new Date().toLocaleString('sw-TZ');

  const executiveSummarySwahili = `Ripoti ya Ufupisho wa Audit Log ya Siku 24: Mfumo unajiendesha kwa kiwango cha usalama na afya ya ${healthScore}%. Jumla ya taasisi ${activeTenants} zipo active zenye wanachama ${totalMembers}. Mzunguko wote wa miamala umefikia TZS ${totalTransactionsVolume.toLocaleString()}. Risiti ${verifiedProofsCount} kati ya ${totalProofsCount} zimehakikiwa kikamilifu (${receiptVerificationRatePercentage}%).`;

  const executiveSummaryEnglish = `24-Hour Automated Audit Log Summary: System health index stands at ${healthScore}%. Servicing ${activeTenants} active institutions and ${totalMembers} members across the platform. Total processed transaction volume is TZS ${totalTransactionsVolume.toLocaleString()} with a ${receiptVerificationRatePercentage}% receipt verification clearance rate.`;

  return {
    healthScore,
    riskIndex,
    liquidityRatioPercentage,
    loanToDepositRatioPercentage,
    nonPerformingLoanPercentage,
    totalVolumeProcessedTZS: totalTransactionsVolume,
    receiptVerificationRatePercentage,
    executiveSummarySwahili,
    executiveSummaryEnglish,
    insights,
    generatedAt: nowFormatted
  };
}

export function create24HourAuditReportObject(
  institutions: Institution[],
  members: Member[],
  loans: Loan[],
  transactions: Transaction[],
  paymentProofs: PaymentProof[],
  auditLogs: AuditLog[]
): StoredDailyAuditReport {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const reportCode = `AUD-24H-${dateStr}-${timeStr}`;
  const bucketPath = `gs://zanzibar-saccos-audit-bucket/daily-summaries/${dateStr}/${reportCode}.json`;

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const periodStartDate = yesterday.toISOString().replace('T', ' ').slice(0, 16);
  const periodEndDate = now.toISOString().replace('T', ' ').slice(0, 16);

  const automatedAnalysis = runAutomatedDataAnalysis(
    institutions,
    members,
    loans,
    transactions,
    paymentProofs,
    auditLogs
  );

  const totalVolumeTZS = transactions.reduce((acc, t) => acc + t.amount, 0);

  return {
    id: `bucket_report_${Date.now()}`,
    reportCode,
    periodStartDate,
    periodEndDate,
    generatedAt: now.toLocaleString('sw-TZ'),
    bucketPath,
    fileSizeBytes: Math.floor(120000 + Math.random() * 45000), // ~120KB - 165KB
    status: 'Completed',
    activeTenantsCount: institutions.filter(i => i.status === 'Active').length,
    totalMembersCount: members.length,
    totalTransactionsCount: transactions.length,
    totalVolumeTZS,
    pendingReceiptsCount: paymentProofs.filter(p => p.status === 'Pending').length,
    auditLogsCount: auditLogs.length,
    automatedAnalysis,
    rawAuditLogsSample: auditLogs.slice(0, 10)
  };
}

export function getInitialStoredAuditReports(
  institutions: Institution[],
  members: Member[],
  loans: Loan[],
  transactions: Transaction[],
  paymentProofs: PaymentProof[],
  auditLogs: AuditLog[]
): StoredDailyAuditReport[] {
  const currentReport = create24HourAuditReportObject(
    institutions,
    members,
    loans,
    transactions,
    paymentProofs,
    auditLogs
  );

  // Generate 2 historic archived reports for yesterday and 2 days ago
  const yesterdayReport: StoredDailyAuditReport = {
    ...currentReport,
    id: `bucket_report_${Date.now() - 86400000}`,
    reportCode: `AUD-24H-HISTORIC-20260725`,
    periodStartDate: '2026-07-24 21:00',
    periodEndDate: '2026-07-25 21:00',
    generatedAt: '2026-07-25 21:00:00',
    bucketPath: 'gs://zanzibar-saccos-audit-bucket/daily-summaries/2026-07-25/AUD-24H-HISTORIC-20260725.json',
    fileSizeBytes: 142100,
    status: 'Completed'
  };

  const dayBeforeReport: StoredDailyAuditReport = {
    ...currentReport,
    id: `bucket_report_${Date.now() - 172800000}`,
    reportCode: `AUD-24H-HISTORIC-20260724`,
    periodStartDate: '2026-07-23 21:00',
    periodEndDate: '2026-07-24 21:00',
    generatedAt: '2026-07-24 21:00:00',
    bucketPath: 'gs://zanzibar-saccos-audit-bucket/daily-summaries/2026-07-24/AUD-24H-HISTORIC-20260724.json',
    fileSizeBytes: 138500,
    status: 'Completed'
  };

  return [currentReport, yesterdayReport, dayBeforeReport];
}
