import {
  SubscriptionPlan,
  Institution,
  Member,
  Loan,
  SavingsAccount,
  SharesAccount,
  Transaction,
  AccountCOA,
  AuditLog,
  SystemNotification,
  FinePenalty,
  PublicAdvertisement,
  PaymentProof,
  InstitutionProject
} from '../types';

export const initialSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'STARTER',
    priceMonthly: 50000,
    priceYearly: 500000,
    maxMembers: 500,
    maxUsers: 3,
    description: 'Kifurushi cha kuanzia kwa VICOBA na SACCOS ndogo.',
    features: [
      'Wanachama hadi 500',
      'Mtumiaji 1–3',
      'Moduli za msingi (Akiba, Mikopo, Hisa)',
      'Ripoti za kawaida',
      'SMS & Arifa'
    ]
  },
  {
    id: 'plan_standard',
    name: 'Standard (Kawaida)',
    priceMonthly: 120000,
    priceYearly: 1200000,
    maxMembers: 2500,
    maxUsers: 10,
    popular: true,
    description: 'Inafaa kwa SACCOS za kati zenye matawi na huduma za kibenki.',
    features: [
      'Wanachama hadi 2,500',
      'Watumiaji wengi',
      'Mobile App ya Wanachama',
      'Uasibu kamili (Chart of Accounts)',
      'Malipo ya Simu (M-Pesa, Airtel, GePG)',
      'Ripoti zote + Audit Logs'
    ]
  },
  {
    id: 'plan_professional',
    name: 'Professional (Bingwa)',
    priceMonthly: 250000,
    priceYearly: 2500000,
    maxMembers: 5000,
    maxUsers: 25,
    description: 'Bora kwa Vyama vya Ushirika na SACCOS zenye wanachama wengi na matawi.',
    features: [
      'Wanachama hadi 5,000',
      'Matawi mengi (Multi-branch)',
      'API Marketplace Access',
      'Dashibodi za Business Intelligence (BI)',
      'Automation Workflows',
      'Msaada wa Kiufundi 24/7'
    ]
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise (Taasisi Kubwa)',
    priceMonthly: 500000,
    priceYearly: 5000000,
    maxMembers: 10000,
    maxUsers: 100,
    description: 'Kwa SACCOS kubwa sana, AMCOS za kitaifa na Mtandao wa VICOBA.',
    features: [
      'Wanachama 5,000 hadi 10,000+',
      'Custom Branding (White-label & Domain)',
      'Dedicated Server Deployment',
      'SLA Maalumu',
      'Ushauri wa Kifedha na Mafunzo'
    ]
  }
];

export const initialInstitutions: Institution[] = [
  {
    id: 'tenant_mlimani',
    name: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    type: 'SACCOS',
    registrationNumber: 'DSR/SCC/2018/104',
    logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80',
    primaryColor: '#0d9488', // Emerald/Teal
    domain: 'intelleza.isaccos.tz',
    status: 'Active',
    planId: 'plan_professional',
    planName: 'Professional Plan',
    memberCount: 840,
    maxMembers: 5000,
    userCount: 8,
    joinedDate: '2023-01-15',
    phone: '+255 754 123 456',
    email: 'info@intellezasaccos.co.tz',
    region: 'Dar es Salaam',
    currency: 'TZS',
    bankName: 'PBZ (People\'s Bank of Zanzibar)',
    bankAccountNumber: '040011223344',
    bankAccountName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    adminUsername: 'admin_intelleza',
    adminPassword: 'Password123!'
  },
  {
    id: 'tenant_umoja',
    name: 'Umoja VICOBA Society',
    type: 'VICOBA',
    registrationNumber: 'VIC/ARU/2021/089',
    logo: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&auto=format&fit=crop&q=80',
    primaryColor: '#2563eb', // Blue
    domain: 'umoja.vicoba.tz',
    status: 'Active',
    planId: 'plan_professional',
    planName: 'Professional Plan',
    memberCount: 230,
    maxMembers: 5000,
    userCount: 3,
    joinedDate: '2023-06-20',
    phone: '+255 713 987 654',
    email: 'contact@umojavicoba.org',
    region: 'Arusha',
    currency: 'TZS',
    adminUsername: 'admin_umoja',
    adminPassword: 'Password123!'
  },
  {
    id: 'tenant_kilimo',
    name: 'Kilimo Kwanza AMCOS',
    type: 'AMCOS',
    registrationNumber: 'AMC/MBY/2019/332',
    logo: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&auto=format&fit=crop&q=80',
    primaryColor: '#16a34a', // Green
    domain: 'kilimokwanza.amcos.tz',
    status: 'Active',
    planId: 'plan_enterprise',
    planName: 'Enterprise Plan',
    memberCount: 1420,
    maxMembers: 10000,
    userCount: 12,
    joinedDate: '2022-11-05',
    phone: '+255 784 555 121',
    email: 'support@kilimokwanza.or.tz',
    region: 'Mbeya',
    currency: 'TZS',
    adminUsername: 'admin_kilimo',
    adminPassword: 'Password123!'
  }
];

export const initialMembers: Member[] = [
  {
    id: 'mb_001',
    tenantId: 'tenant_mlimani',
    memberNumber: 'MB-2024-0089',
    fullName: 'Juma Hamisi Kassim',
    phone: '+255 754 889 001',
    email: 'juma.kassim@gmail.com',
    idType: 'NIDA',
    idNumber: '19880512-11102-00001-24',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    occupation: 'Mfanyabiashara',
    joinedDate: '2024-01-10',
    status: 'Active',
    totalSavings: 4500000,
    totalShares: 1200000,
    totalLoansOutstanding: 3200000,
    branch: 'Makao Makuu - Mwenge',
    bankName: 'CRDB Bank',
    bankAccountNumber: '015022334455',
    bankAccountName: 'Juma Hamisi Kassim',
    username: 'juma_kassim',
    password: 'Password123!',
    nextOfKin: {
      fullName: 'Aisha Juma Kassim',
      relationship: 'Mke',
      phone: '+255 754 889 002',
      percentageShare: 100
    },
    guarantors: [
      {
        memberId: 'mb_002',
        memberName: 'Amina Salum Bakari',
        phone: '+255 712 334 556',
        guaranteedAmount: 1500000,
        status: 'Accepted'
      }
    ]
  },
  {
    id: 'mb_002',
    tenantId: 'tenant_mlimani',
    memberNumber: 'MB-2024-0045',
    fullName: 'Amina Salum Bakari',
    phone: '+255 712 334 556',
    email: 'amina.bakari@yahoo.com',
    idType: 'NIDA',
    idNumber: '19920814-14101-00003-12',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    occupation: 'Mwalimu',
    joinedDate: '2023-03-15',
    status: 'Active',
    totalSavings: 6800000,
    totalShares: 2000000,
    totalLoansOutstanding: 0,
    branch: 'Tawi la Ubungo',
    bankName: 'PBZ Bank',
    bankAccountNumber: '040088776655',
    bankAccountName: 'Amina Salum Bakari',
    username: 'amina_bakari',
    password: 'Password123!',
    nextOfKin: {
      fullName: 'Rashid Salum',
      relationship: 'Kaka',
      phone: '+255 712 334 557',
      percentageShare: 100
    }
  },
  {
    id: 'mb_003',
    tenantId: 'tenant_mlimani',
    memberNumber: 'MB-2024-0112',
    fullName: 'Emanuel Peter Mwangi',
    phone: '+255 784 991 223',
    email: 'mwangi.p@hotmail.com',
    idType: 'NIDA',
    idNumber: '19851120-22104-00009-88',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    occupation: 'Mkulima & Mjasiriamali',
    joinedDate: '2024-02-01',
    status: 'Active',
    totalSavings: 2100000,
    totalShares: 500000,
    totalLoansOutstanding: 1800000,
    branch: 'Tawi la Tegeta',
    bankName: 'NMB Bank',
    bankAccountNumber: '201011998877',
    bankAccountName: 'Emanuel Peter Mwangi',
    nextOfKin: {
      fullName: 'Grace Mwangi',
      relationship: 'Binti',
      phone: '+255 784 991 224',
      percentageShare: 100
    }
  }
];

export const initialLoans: Loan[] = [
  {
    id: 'ln_1001',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_001',
    memberName: 'Juma Hamisi Kassim',
    memberNumber: 'MB-2024-0089',
    loanType: 'Biashara',
    amountRequested: 5000000,
    amountApproved: 5000000,
    interestRateAnnual: 12, // 12% per year
    durationMonths: 12,
    repaymentFrequency: 'Monthly',
    status: 'Active',
    appliedDate: '2024-03-01',
    approvedDate: '2024-03-03',
    disbursedDate: '2024-03-05',
    nextPaymentDueDate: '2026-08-05',
    monthlyInstallment: 444243,
    totalInterest: 330916,
    totalRepayable: 5330916,
    totalPaid: 2130000,
    remainingBalance: 3200916,
    purpose: 'Upanuzi wa duka la vifaa vya ujenzi Kariakoo',
    approvalSteps: [
      { step: 1, roleName: 'Afisa Mikopo (Loan Officer)', approverName: 'Hassan Mwinyi', status: 'Approved', comment: 'Dhamana na biashara imekaguliwa, ipo sawa.', date: '2024-03-02' },
      { step: 2, roleName: 'Kamati ya Mikopo (Credit Committee)', approverName: 'Kamati ISACCOS', status: 'Approved', comment: 'Mkutano umeridhia mkopo kutolewa.', date: '2024-03-03' },
      { step: 3, roleName: 'Meneja Mkuu (Board / GM)', approverName: 'Jane Lyimo', status: 'Approved', comment: 'Idhini ya mwisho imetolewa.', date: '2024-03-04' }
    ],
    repaymentSchedule: [
      { installmentNumber: 1, dueDate: '2024-04-05', principal: 394243, interest: 50000, totalInstallment: 444243, paidAmount: 444243, status: 'Paid' },
      { installmentNumber: 2, dueDate: '2024-05-05', principal: 398186, interest: 46057, totalInstallment: 444243, paidAmount: 444243, status: 'Paid' },
      { installmentNumber: 3, dueDate: '2024-06-05', principal: 402167, interest: 42076, totalInstallment: 444243, paidAmount: 444243, status: 'Paid' },
      { installmentNumber: 4, dueDate: '2024-07-05', principal: 406189, interest: 38054, totalInstallment: 444243, paidAmount: 444243, status: 'Paid' },
      { installmentNumber: 5, dueDate: '2026-08-05', principal: 410251, interest: 33992, totalInstallment: 444243, paidAmount: 0, status: 'Pending' },
      { installmentNumber: 6, dueDate: '2026-09-05', principal: 414353, interest: 29890, totalInstallment: 444243, paidAmount: 0, status: 'Pending' }
    ],
    guarantors: [
      { memberId: 'mb_002', memberName: 'Amina Salum Bakari', phone: '+255 712 334 556', guaranteedAmount: 2500000, status: 'Accepted' }
    ]
  },
  {
    id: 'ln_1002',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_003',
    memberName: 'Emanuel Peter Mwangi',
    memberNumber: 'MB-2024-0112',
    loanType: 'Elimu',
    amountRequested: 2000000,
    amountApproved: 2000000,
    interestRateAnnual: 10,
    durationMonths: 6,
    repaymentFrequency: 'Monthly',
    status: 'Active',
    appliedDate: '2024-05-10',
    approvedDate: '2024-05-12',
    disbursedDate: '2024-05-14',
    nextPaymentDueDate: '2026-08-14',
    monthlyInstallment: 343118,
    totalInterest: 58708,
    totalRepayable: 2058708,
    totalPaid: 686236,
    remainingBalance: 1372472,
    purpose: 'Ada ya chuo kikuu cha Dar es Salaam (UDSM)',
    approvalSteps: [
      { step: 1, roleName: 'Afisa Mikopo (Loan Officer)', approverName: 'Hassan Mwinyi', status: 'Approved', comment: 'Ada invoice ipo verified.', date: '2024-05-11' },
      { step: 2, roleName: 'Kamati ya Mikopo (Credit Committee)', approverName: 'Kamati ISACCOS', status: 'Approved', comment: 'Imeidhinishwa.', date: '2024-05-12' },
      { step: 3, roleName: 'Meneja Mkuu (Board / GM)', approverName: 'Jane Lyimo', status: 'Approved', comment: 'Kamilisha usambazaji.', date: '2024-05-13' }
    ],
    repaymentSchedule: [
      { installmentNumber: 1, dueDate: '2024-06-14', principal: 326451, interest: 16667, totalInstallment: 343118, paidAmount: 343118, status: 'Paid' },
      { installmentNumber: 2, dueDate: '2024-07-14', principal: 329172, interest: 13946, totalInstallment: 343118, paidAmount: 343118, status: 'Paid' },
      { installmentNumber: 3, dueDate: '2026-08-14', principal: 331915, interest: 11203, totalInstallment: 343118, paidAmount: 0, status: 'Pending' }
    ],
    guarantors: []
  }
];

export const initialSavingsAccounts: SavingsAccount[] = [
  {
    id: 'sav_001',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_001',
    memberName: 'Juma Hamisi Kassim',
    mandatorySavings: 3000000,
    voluntarySavings: 1000000,
    fixedDeposit: 500000,
    totalSavings: 4500000,
    lastDepositDate: '2026-07-20'
  },
  {
    id: 'sav_002',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_002',
    memberName: 'Amina Salum Bakari',
    mandatorySavings: 4800000,
    voluntarySavings: 2000000,
    fixedDeposit: 0,
    totalSavings: 6800000,
    lastDepositDate: '2026-07-22'
  }
];

export const initialSharesAccounts: SharesAccount[] = [
  {
    id: 'shr_001',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_001',
    memberName: 'Juma Hamisi Kassim',
    shareUnits: 120,
    pricePerShare: 10000,
    totalSharesValue: 1200000,
    lastPurchaseDate: '2024-01-15'
  },
  {
    id: 'shr_002',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_002',
    memberName: 'Amina Salum Bakari',
    shareUnits: 200,
    pricePerShare: 10000,
    totalSharesValue: 2000000,
    lastPurchaseDate: '2023-04-10'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx_9001',
    referenceNumber: 'MP-20260722-99812',
    tenantId: 'tenant_mlimani',
    tenantName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    memberId: 'mb_001',
    memberName: 'Juma Hamisi Kassim',
    type: 'SavingsDeposit',
    amount: 150000,
    paymentChannel: 'M-Pesa',
    status: 'Completed',
    date: '2026-07-22 14:32',
    description: 'Akiba ya mwezi ya M-Pesa'
  },
  {
    id: 'tx_9002',
    referenceNumber: 'AIR-20260721-44102',
    tenantId: 'tenant_mlimani',
    tenantName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    memberId: 'mb_002',
    memberName: 'Amina Salum Bakari',
    type: 'LoanRepayment',
    amount: 444243,
    paymentChannel: 'Airtel Money',
    status: 'Completed',
    date: '2026-07-21 09:15',
    description: 'Marejesho ya Mkopo wa Biashara'
  },
  {
    id: 'tx_9003',
    referenceNumber: 'GEP-20260720-00129',
    tenantId: 'tenant_mlimani',
    tenantName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    memberId: 'mb_003',
    memberName: 'Emanuel Peter Mwangi',
    type: 'SharePurchase',
    amount: 100000,
    paymentChannel: 'GePG',
    status: 'Completed',
    date: '2026-07-20 16:05',
    description: 'Usongezo wa Hisa mpya 10'
  }
];

export const initialCOA: AccountCOA[] = [
  { code: '1010', name: 'Petty Cash', category: 'Asset', balance: 1250000 },
  { code: '1020', name: 'NMB Bank Account', category: 'Asset', balance: 145000000 },
  { code: '1030', name: 'CRDB Bank Account', category: 'Asset', balance: 210000000 },
  { code: '1050', name: 'M-Pesa Paybill float', category: 'Asset', balance: 34500000 },
  { code: '1200', name: 'Loans Outstanding Portfolio', category: 'Asset', balance: 485000000 },
  { code: '2010', name: 'Member Mandatory Savings', category: 'Liability', balance: 520000000 },
  { code: '2020', name: 'Member Voluntary Savings', category: 'Liability', balance: 180000000 },
  { code: '3010', name: 'Member Share Capital', category: 'Equity', balance: 150000000 },
  { code: '4010', name: 'Interest Income from Loans', category: 'Revenue', balance: 58000000 },
  { code: '4020', name: 'Loan Processing Fees', category: 'Revenue', balance: 12400000 },
  { code: '5010', name: 'Office Staff Salaries & Expenses', category: 'Expense', balance: 22000000 },
  { code: '5020', name: 'Software SaaS License Fees', category: 'Expense', balance: 2500000 }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_01',
    timestamp: '2026-07-25 08:12:00',
    user: 'Super Admin System',
    role: 'superadmin',
    tenantName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    action: 'Subscription Renewed',
    details: 'Professional Plan auto-renewed for 12 months.',
    ipAddress: '197.250.22.10'
  },
  {
    id: 'log_02',
    timestamp: '2026-07-24 16:45:10',
    user: 'Hassan Mwinyi',
    role: 'tenantadmin',
    tenantName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    action: 'Loan Disbursed',
    details: 'Disbursed TZS 5,000,000 for Loan #LN_1001 to Member Juma Kassim.',
    ipAddress: '197.250.18.44'
  }
];

export const initialNotifications: SystemNotification[] = [
  {
    id: 'notif_01',
    tenantId: 'tenant_mlimani',
    title: 'Maombi ya Mkopo Mpya',
    message: 'Mwanachama Juma Hamisi ameomba mkopo mpya wa Dharura wa TZS 1,500,000 unaosubiri uhakiki.',
    date: '2026-07-25 14:40',
    read: false,
    type: 'info',
    targetRole: 'tenantadmin',
    category: 'loan',
    linkTab: 'loans',
    amount: 1500000
  },
  {
    id: 'notif_02',
    tenantId: 'tenant_mlimani',
    title: 'Risiti ya Malipo Inasubiri Uhakiki',
    message: 'Kithibitisho cha malipo ya TZS 150,000 via PBZ Bank (PBZ-2026-990182) kimepokelewa.',
    date: '2026-07-25 14:30',
    read: false,
    type: 'warning',
    targetRole: 'tenantadmin',
    category: 'payment',
    linkTab: 'receipts',
    amount: 150000
  },
  {
    id: 'notif_03',
    tenantId: 'tenant_mlimani',
    title: 'Usajili Mpya wa Mwanachama',
    message: 'Mwanachama Amina Salum Bakari amesajiliwa kikamilifu katika Tawi la Mwanakwerekwe.',
    date: '2026-07-24 09:15',
    read: false,
    type: 'success',
    targetRole: 'tenantadmin',
    category: 'member',
    linkTab: 'members'
  },
  {
    id: 'notif_04',
    tenantId: 'tenant_mlimani',
    title: 'Fainali / Penalti Imetolewa',
    message: 'Penalti ya TZS 10,000 imewekwa kwa mwanachama kwa kuchelewa kikao.',
    date: '2026-07-23 16:00',
    read: true,
    type: 'alert',
    targetRole: 'tenantadmin',
    category: 'fine',
    linkTab: 'fines',
    amount: 10000
  },
  {
    id: 'notif_05',
    tenantId: 'tenant_mlimani',
    title: 'Ripoti ya Kila Siku ya Ukaguzi (24H Audit)',
    message: 'Mfumo umezalisha ripoti kamili ya ukaguzi wa miamala na tathmini ya kibenki.',
    date: '2026-07-24 00:00',
    read: true,
    type: 'info',
    targetRole: 'tenantadmin',
    category: 'audit',
    linkTab: 'accounting'
  },
  {
    id: 'notif_06',
    tenantId: 'tenant_mlimani',
    title: 'Taarifa ya Malipo M-Pesa',
    message: 'Akiba ya TZS 150,000 imepokelewa kupitia M-Pesa Namba MP-20260722-99812.',
    date: '2026-07-22 11:20',
    read: true,
    type: 'success',
    targetRole: 'member',
    category: 'payment',
    linkTab: 'savings'
  }
];

export const initialFines: FinePenalty[] = [
  {
    id: 'fine_1',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_001',
    memberName: 'Amina Salum Bakari',
    reason: 'Kuchelewa Kikao cha Mwezi Cha Kawaida',
    amount: 10000,
    issuedDate: '2026-07-01',
    dueDate: '2026-07-30',
    status: 'Pending',
    notes: 'Kuchelewa kwa dakika 45 bila udhuru'
  },
  {
    id: 'fine_2',
    tenantId: 'tenant_mlimani',
    memberId: 'mb_002',
    memberName: 'Juma Hassan Omar',
    reason: 'Kuchelewa Marejesho ya Mkopo wa Biashara',
    amount: 25000,
    issuedDate: '2026-06-15',
    dueDate: '2026-06-25',
    status: 'Paid',
    paidDate: '2026-06-22',
    notes: 'Penalti ya siku 5 za kuchelewa'
  }
];

export const initialPublicAds: PublicAdvertisement[] = [
  {
    id: 'ad-1',
    title: 'Fursa ya Mikopo ya Ushirika wa Uchumi wa Buluu (Blue Economy)',
    businessName: 'Wizara ya Uchumi wa Buluu na Uvuvi Zanzibar & SACCOS Union',
    category: 'Mikopo na Ruzuku',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    summary: 'Ruzuku na mikopo yenye riba nafuu ya 5% kwa vikundi vya VICOBA vya wakulima wa mwani, uvuvi na usindikaji wa samaki.',
    description: 'Wizara ya Uchumi wa Buluu kwa kushirikiana na Taasisi za Fedha Zanzibar inatangaza fursa ya mtaji wa jumla ya TZS 800,000,000 kwa ajili ya kuwezesha Vikundi vya VICOBA na SACCOS za Wavuvi na Wakulima wa Mwani. Vikundi vilivyosajiliwa rasmi vinaombwa kuwasilisha maombi kupitia portal hii.',
    badge: 'Mfuko wa Serikali',
    location: 'Unguja na Pemba (Shehia Zote)',
    date: '2026-07-24',
    deadline: '2026-08-15',
    contact: '+255 777 123 456',
    linkUrl: 'https://zanzibar.go.tz',
    active: true
  },
  {
    id: 'ad-2',
    title: 'Tangazo la Vifaa vya Solar & Umeme wa Jua kwa VICOBA',
    businessName: 'Zanzibar Green Energy Solutions Ltd',
    category: 'Biashara & Vifaa',
    mediaType: 'video',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    summary: 'Pata mitambo ya umeme wa jua kwa mkopo nafuu wa kikundi bila amana ya ziada.',
    description: 'Zanzibar Green Energy inatangaza ofa ya vifaa vya umeme wa jua (Solar Kits) kwa ajili ya maduka na nyumba za wajasiriamali wa VICOBA. Malipo hufanyika kidogo kidogo kupitia M-Pesa au PBZ.',
    badge: 'Ofa ya Wiki',
    location: 'Stone Town & Chake Chake Pemba',
    date: '2026-07-20',
    deadline: '2026-08-30',
    contact: '+255 778 333 222',
    linkUrl: 'https://greenenergy.co.tz',
    active: true
  },
  {
    id: 'ad-3',
    title: 'Semina ya Uhasibu na Mfumo wa Kidigitali Stone Town',
    businessName: 'Chama cha VICOBA Zanzibar (ZAVICOBA)',
    category: 'Mafunzo & Semina',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    summary: 'Mafunzo ya siku 3 ya utunzaji wa vitabu vya fedha, hisa, na usimamizi wa mikopo kwa Wenyeviti na Makatibu.',
    description: 'Semina hii kabambe itahusisha wataalamu wa uhasibu na mifumo ya kompyuta kutoka Intelleza Software na Wizara ya Ushirika Zanzibar. Wajumbe watapata mafunzo ya vitendo ya jinsi ya kutumia Mfumo wa SaaS kuendesha VICOBA bila makosa.',
    badge: 'Mafunzo ya Bure',
    location: 'Ukumbi wa Bwawani, Stone Town Zanzibar',
    date: '2026-07-18',
    deadline: '2026-08-05',
    contact: '+255 778 987 654',
    active: true
  },
  {
    id: 'ad-4',
    title: 'Bima ya Afya na Maisha kwa Wanachama wa SACCOS na VICOBA',
    businessName: 'Zanzibar Insurance Corporation (ZIC)',
    category: 'Bima & Fedha',
    mediaType: 'video',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    summary: 'Kinga familia yako na biashara yako kupitia Bima ya Kikundi na ZIC.',
    description: 'ZIC kwa kushirikiana na Taasisi za Ushirika inazindua kifurushi cha Bima ya Afya kwa familia za wajasiriamali wadogo. Gharama ni nafuu sana kwa mwezi kupitia mfumo wetu wa digitali.',
    badge: 'Kinga ya Jamii',
    location: 'Zanzibar Nzima',
    date: '2026-07-15',
    contact: '+255 776 555 444',
    active: true
  }
];

export const initialPaymentProofs: PaymentProof[] = [
  {
    id: 'proof_101',
    tenantId: 'tenant_mlimani',
    tenantName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    memberId: 'mb_001',
    memberName: 'Juma Hamisi Kassim',
    memberNumber: 'MB-001',
    paymentType: 'SavingsDeposit',
    amount: 150000,
    paymentChannel: 'PBZ Bank',
    receiptNumber: 'PBZ-2026-990182',
    receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    notes: 'Kithibitisho cha malipo ya benki ya PBZ tawi la Mwanakwerekwe.',
    submittedDate: '2026-07-25 14:30',
    status: 'Pending'
  },
  {
    id: 'proof_102',
    tenantId: 'tenant_mlimani',
    tenantName: 'Intelleza SACCOS SYSTEM (ISACCOS)',
    memberId: 'mb_002',
    memberName: 'Amina Salum Bakari',
    memberNumber: 'MB-002',
    paymentType: 'LoanRepayment',
    amount: 250000,
    paymentChannel: 'M-Pesa',
    receiptNumber: 'MP-88310928',
    receiptImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    notes: 'Sms ya Vodacom M-Pesa.',
    submittedDate: '2026-07-24 10:15',
    status: 'Approved',
    verifiedBy: 'Hassan Mwinyi (Loan Officer)',
    verifiedDate: '2026-07-24 11:00'
  }
];

export const initialProjects: InstitutionProject[] = [
  {
    id: 'proj_001',
    tenantId: 'tenant_mlimani',
    name: 'Shamba la Mpunga & Ngano Kilombero',
    category: 'Kilimo',
    status: 'Inayojiendesha',
    startDate: '2025-01-15',
    initialCapital: 15000000,
    currentValuation: 22500000,
    location: 'Kilombero, Morogoro',
    managerName: 'Kassim Juma (Mkurugenzi wa Miradi)',
    description: 'Mradi wa kilimo cha umwagiliaji wa hekta 15 za mpunga na ngano kwa ajili ya mauzo ya jumla na mbegu bora.',
    createdDate: '2025-01-15',
    financialLogs: [
      {
        id: 'plog_101',
        projectId: 'proj_001',
        type: 'Income',
        category: 'Mauzo ya Mpunga',
        amount: 12500000,
        date: '2026-06-20',
        description: 'Mauzo ya magunia 250 ya mpunga kwa viwanda vya kukoboa.'
      },
      {
        id: 'plog_102',
        projectId: 'proj_001',
        type: 'Expense',
        category: 'Mbolea & Vibarua',
        amount: 3800000,
        date: '2026-03-10',
        description: 'Gharama za ununuzi wa mbolea ya UREA & DAP pamoja na malipo ya vibarua vya kuvuna.'
      },
      {
        id: 'plog_103',
        projectId: 'proj_001',
        type: 'Income',
        category: 'Mauzo ya Ngano',
        amount: 6200000,
        date: '2026-07-05',
        description: 'Mauzo ya zao la ngano msimu wa kwanza.'
      },
      {
        id: 'plog_104',
        projectId: 'proj_001',
        type: 'Expense',
        category: 'Usafirishaji & Hifadhi',
        amount: 1200000,
        date: '2026-07-10',
        description: 'Kukodi maroli ya kusafirisha mazao hadi ghala kuu.'
      }
    ]
  },
  {
    id: 'proj_002',
    tenantId: 'tenant_mlimani',
    name: 'Jengo la Biashara & Offisi (Mlimani Commercial Plaza)',
    category: 'Majengo & Nyumba',
    status: 'Inayojiendesha',
    startDate: '2024-06-01',
    initialCapital: 45000000,
    currentValuation: 58000000,
    location: 'Mwenge, Dar es Salaam',
    managerName: 'Amina Bakari (Manager wa Majengo)',
    description: 'Jengo la ghorofa 2 la maduka na ofisi zinazopangishwa kutoa mapato endelevu ya kila mwezi kwa SACCOS.',
    createdDate: '2024-06-01',
    financialLogs: [
      {
        id: 'plog_201',
        projectId: 'proj_002',
        type: 'Income',
        category: 'Kodi za Wapangaji',
        amount: 14400000,
        date: '2026-06-30',
        description: 'Kusanya kodi ya miezi 6 kutoka kwa wapangaji 8 wa maduka na ofisi.'
      },
      {
        id: 'plog_202',
        projectId: 'proj_002',
        type: 'Expense',
        category: 'Ukarabati & Ulinzi',
        amount: 1800000,
        date: '2026-05-15',
        description: 'Uchoraji wa rangi, matengenezo ya mfumo wa maji na mkataba wa Kampuni ya Ulinzi.'
      },
      {
        id: 'plog_203',
        projectId: 'proj_002',
        type: 'Expense',
        category: 'Luku & Maji',
        amount: 650000,
        date: '2026-07-01',
        description: 'Malipo ya Umeme wa maeneo ya wote na maji ya Dawasa.'
      }
    ]
  },
  {
    id: 'proj_003',
    tenantId: 'tenant_mlimani',
    name: 'Basi la Usafirishaji Coaster (Morogoro - Dodoma)',
    category: 'Usafirishaji',
    status: 'Inayojiendesha',
    startDate: '2025-08-10',
    initialCapital: 32000000,
    currentValuation: 36500000,
    location: 'Kituo Kikuu cha Mabasi Dodoma',
    managerName: 'Kipanya Omari (Msimamizi wa Magari)',
    description: 'Coaster ya abiria 30 inayofanya safari za kila siku kati ya Morogoro na Dodoma kutoa marejesho ya kila siku.',
    createdDate: '2025-08-10',
    financialLogs: [
      {
        id: 'plog_301',
        projectId: 'proj_003',
        type: 'Income',
        category: 'Hesabu za Kila Siku',
        amount: 11800000,
        date: '2026-07-20',
        description: 'Mapato ya safari za mwezi wa 6 na mwanzo wa mwezi wa 7.'
      },
      {
        id: 'plog_302',
        projectId: 'proj_003',
        type: 'Expense',
        category: 'Servicing & Tairi',
        amount: 2400000,
        date: '2026-06-05',
        description: 'Kununua tairi mpya 4 na kufanya matengenezo makubwa ya injini.'
      }
    ]
  },
  {
    id: 'proj_004',
    tenantId: 'tenant_vicoba',
    name: 'Ufugaji wa Kuku wa Mayai & Kanga',
    category: 'Ufugaji',
    status: 'Inayojiendesha',
    startDate: '2025-11-01',
    initialCapital: 8000000,
    currentValuation: 12800000,
    location: 'Kibaha, Pwani',
    managerName: 'Maimuna Hassan (Mwenyekiti wa VICOBA)',
    description: 'Banda la kuku 1,200 wa mayai linalozalisha trey 35 za mayai kila siku kwa ajili ya masoko ya Dar na Pwani.',
    createdDate: '2025-11-01',
    financialLogs: [
      {
        id: 'plog_401',
        projectId: 'proj_004',
        type: 'Income',
        category: 'Mauzo ya Mayai',
        amount: 6800000,
        date: '2026-07-15',
        description: 'Mauzo ya trey za mayai kwa wateja wa jumla.'
      },
      {
        id: 'plog_402',
        projectId: 'proj_004',
        type: 'Expense',
        category: 'Chakula cha Kuku & Dawa',
        amount: 2100000,
        date: '2026-06-25',
        description: 'Ununuzi wa mifuko 50 ya Layers Mash & chanjo za daktari wa mifugo.'
      }
    ]
  }
];



