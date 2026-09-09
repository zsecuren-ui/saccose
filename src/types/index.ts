export type Language = 'sw' | 'en';

export type UserRole = 'public' | 'superadmin' | 'tenantadmin' | 'member' | 'auth' | 'docs';

export type ThemeColor = 'emerald' | 'indigo' | 'sapphire' | 'sunset' | 'ruby';

export type InstitutionType = 'SACCOS' | 'VICOBA' | 'AMCOS' | 'MICROFINANCE';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxMembers: number;
  maxUsers: number;
  features: string[];
  description: string;
  popular?: boolean;
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  registrationNumber: string;
  logo: string;
  primaryColor: string;
  domain: string;
  status: 'Active' | 'Suspended' | 'Pending';
  planId: string;
  planName: string;
  memberCount: number;
  maxMembers: number;
  userCount: number;
  joinedDate: string;
  phone: string;
  email: string;
  region: string;
  currency: string;
  bannerUrl?: string;
  description?: string;
  address?: string;
  motto?: string;
  website?: string;
  foundedYear?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  adminUsername?: string;
  adminPassword?: string;
  customPriceMonthly?: number;
  monthlyCapitalTarget?: number;
  loanInterestRates?: Record<string, number>;
  defaultInterestRateAnnual?: number;
}

export interface NextOfKin {
  fullName: string;
  relationship: string;
  phone: string;
  percentageShare: number;
}

export interface Guarantor {
  memberId: string;
  memberName: string;
  phone: string;
  guaranteedAmount: number;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface Member {
  id: string;
  tenantId: string;
  memberNumber: string;
  fullName: string;
  phone: string;
  email: string;
  idType: 'NIDA' | 'Voter ID' | 'Passport' | 'Driver License';
  idNumber: string;
  photoUrl: string;
  occupation: string;
  joinedDate: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Closed';
  totalSavings: number;
  totalShares: number;
  totalLoansOutstanding: number;
  branch: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  nextOfKin: NextOfKin;
  guarantors?: Guarantor[];
  userId?: string;
  username?: string;
  password?: string;
  registeredById?: string;
  registeredByName?: string;
}

export interface UserAuthSession {
  role: UserRole;
  username: string;
  fullName: string;
  institutionId?: string;
  memberId?: string;
  isAuthenticated: boolean;
}

export interface LoanApprovalStep {
  step: number;
  roleName: string; // e.g., 'Loan Officer', 'Credit Committee', 'Board Board'
  approverName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comment?: string;
  date?: string;
}

export interface RepaymentScheduleItem {
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalInstallment: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface Loan {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  loanType: string;
  customLoanTypeName?: string;
  amountRequested: number;
  amountApproved: number;
  interestRateAnnual: number;
  durationMonths: number;
  repaymentFrequency: 'Monthly' | 'Weekly' | 'Bi-Weekly';
  status: 'Applied' | 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected' | 'Active' | 'Completed' | 'Defaulted';
  appliedDate: string;
  approvedDate?: string;
  disbursedDate?: string;
  nextPaymentDueDate?: string;
  monthlyInstallment: number;
  totalInterest: number;
  totalRepayable: number;
  totalPaid: number;
  remainingBalance: number;
  approvalSteps: LoanApprovalStep[];
  repaymentSchedule: RepaymentScheduleItem[];
  guarantors: Guarantor[];
  purpose: string;
}

export interface SavingsAccount {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  mandatorySavings: number;
  voluntarySavings: number;
  fixedDeposit: number;
  totalSavings: number;
  lastDepositDate: string;
}

export interface SharesAccount {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  shareUnits: number;
  pricePerShare: number;
  totalSharesValue: number;
  lastPurchaseDate: string;
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  tenantId: string;
  tenantName: string;
  memberId?: string;
  memberName?: string;
  type: 'SavingsDeposit' | 'LoanRepayment' | 'SharePurchase' | 'Withdrawal' | 'SubscriptionPayment' | 'DividendPayout' | 'LoanDisbursement';
  amount: number;
  paymentChannel: 'M-Pesa' | 'Airtel Money' | 'Mixx by Yas' | 'HaloPesa' | 'GePG' | 'Bank Transfer' | 'Cash' | 'Visa/Mastercard';
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  description: string;
  receiptUrl?: string;
}

export interface AccountCOA {
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  tenantName: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface FinePenalty {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  reason: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Waived';
  paidDate?: string;
  notes?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  targetRole: UserRole;
  tenantId?: string;
  category?: 'loan' | 'payment' | 'member' | 'accounting' | 'fine' | 'audit' | 'general';
  linkTab?: string;
  entityId?: string;
  amount?: number;
}

export interface PublicAdvertisement {
  id: string;
  title: string;
  businessName: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  summary: string;
  description: string;
  badge?: string;
  location: string;
  date: string;
  deadline?: string;
  contact: string;
  linkUrl?: string;
  active: boolean;
}

export interface PaymentProof {
  id: string;
  tenantId: string;
  tenantName: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  paymentType: 'SavingsDeposit' | 'LoanRepayment' | 'SharePurchase' | 'FinePayment';
  amount: number;
  paymentChannel: string;
  receiptNumber: string;
  receiptImage?: string;
  notes?: string;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
}

export interface AnalysisInsight {
  category: 'Risk' | 'Liquidity' | 'Performance' | 'Security' | 'Growth';
  severity: 'High' | 'Medium' | 'Low' | 'Info';
  title: string;
  description: string;
  metric?: string;
  recommendation: string;
}

export interface AutomatedDataAnalysis {
  healthScore: number;
  riskIndex: number;
  liquidityRatioPercentage: number;
  loanToDepositRatioPercentage: number;
  nonPerformingLoanPercentage: number;
  totalVolumeProcessedTZS: number;
  receiptVerificationRatePercentage: number;
  executiveSummarySwahili: string;
  executiveSummaryEnglish: string;
  insights: AnalysisInsight[];
  generatedAt: string;
}

export interface StoredDailyAuditReport {
  id: string;
  reportCode: string;
  periodStartDate: string;
  periodEndDate: string;
  generatedAt: string;
  bucketPath: string;
  fileSizeBytes: number;
  status: 'Completed' | 'Processing' | 'Failed';
  activeTenantsCount: number;
  totalMembersCount: number;
  totalTransactionsCount: number;
  totalVolumeTZS: number;
  pendingReceiptsCount: number;
  auditLogsCount: number;
  automatedAnalysis: AutomatedDataAnalysis;
  rawAuditLogsSample: AuditLog[];
}

export type ProjectCategory = 'Kilimo' | 'Ufugaji' | 'Majengo & Nyumba' | 'Biashara & Bidhaa' | 'Usafirishaji' | 'Uwekezaji wa Hisa' | 'Nyingine';
export type ProjectStatus = 'Inayojiendesha' | 'Inayopangwa' | 'Inayorekebishwa' | 'Imekamilika' | 'Imesitishwa';
export type FinancialLogType = 'Income' | 'Expense' | 'CapitalAdd' | 'CapitalWithdraw';

export interface ProjectFinancialLog {
  id: string;
  projectId: string;
  type: FinancialLogType;
  category: string;
  amount: number;
  date: string;
  description: string;
  recordedBy?: string;
}

export interface InstitutionProject {
  id: string;
  tenantId: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: string;
  initialCapital: number;
  currentValuation: number;
  location?: string;
  managerName?: string;
  description: string;
  financialLogs: ProjectFinancialLog[];
  createdDate: string;
  monthlyCapitalTarget?: number;
}

