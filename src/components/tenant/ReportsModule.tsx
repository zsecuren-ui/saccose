import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { downloadCSV, printFormattedReport } from '../../lib/exportUtils';
import {
  FileText,
  Download,
  Printer,
  Filter,
  Search,
  CheckCircle2,
  Users,
  CreditCard,
  PiggyBank,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldAlert,
  Calendar,
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ReportDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  frequency: 'Kila Siku' | 'Mwezi' | 'Robo Mwaka' | 'Mwaka';
}

export const ReportsModule: React.FC = () => {
  const { currentInstitution, members, loans, transactions, fines, formatTZS } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('wanachama');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string>('RPT-MEM-01');
  const [dateFrom, setDateFrom] = useState<string>('2026-01-01');
  const [dateTo, setDateTo] = useState<string>('2026-12-31');
  const [selectedBranch, setSelectedBranch] = useState<string>('Matawi Yote');
  const [notification, setNotification] = useState<string | null>(null);

  // 8 Main Categories with 100+ Total SACCOS Reports defined
  const reportCategories = [
    {
      id: 'wanachama',
      title: 'Ripoti za Wanachama',
      icon: <Users className="w-4 h-4" />,
      count: 14,
      reports: [
        { id: 'RPT-MEM-01', code: 'MEM-01', title: 'Orodha Kuu ya Wanachama na Hali Zao', description: 'Taarifa za kina za usajili, namba ya uanachama, simu na hali (Active/Suspended)', frequency: 'Mwezi' },
        { id: 'RPT-MEM-02', code: 'MEM-02', title: 'Wanachama Wapya Waliojiunga Kipindi Hiki', description: 'Wanachama wapya, ada zilizolipwa na tawi walilosajiliwa', frequency: 'Mwezi' },
        { id: 'RPT-MEM-03', code: 'MEM-03', title: 'Taarifa za Wadhamini & Warithi (Next of Kin)', description: 'Orodha ya warithi waliotajwa na asilimia zao za urithi za hisa/akiba', frequency: 'Mwaka' },
        { id: 'RPT-MEM-04', code: 'MEM-04', title: 'Mchanganuo wa Wanachama kwa Matawi', description: 'Idadi na uwiano wa wanachama kwa kila tawi la SACCOS/VICOBA', frequency: 'Mwezi' },
        { id: 'RPT-MEM-05', code: 'MEM-05', title: 'Demographics & Gender Balance', description: 'Mchanganuo wa jinsia, umri na shughuli za kiuchumi za wanachama', frequency: 'Robo Mwaka' },
        { id: 'RPT-MEM-06', code: 'MEM-06', title: 'Net Asset Position ya Kila Mwanachama', description: 'Amana, Hisa minus Mikopo inayodaiwa kwa kila mwanachama', frequency: 'Mwezi' },
        { id: 'RPT-MEM-07', code: 'MEM-07', title: 'Wanachama Waliojiondoa au Kufukuzwa', description: 'Kumbukumbu za wanachama walioacha uanachama na malipo yao ya mwisho', frequency: 'Robo Mwaka' },
        { id: 'RPT-MEM-08', code: 'MEM-08', title: 'Wanachama Waliosimamishwa Uanachama', description: 'Orodha ya waliowekewa vikwazo au kusimamishwa na Bodi kwa nidhamu', frequency: 'Mwezi' },
        { id: 'RPT-MEM-09', code: 'MEM-09', title: 'Ripoti ya Vitambulisho na Uhakiki wa NIDA', description: 'Status ya uhakiki wa NIDA/Voter ID kwa kila mwanachama', frequency: 'Mwaka' },
        { id: 'RPT-MEM-10', code: 'MEM-10', title: 'Attendance ya Mkutano Mkuu (AGM Register)', description: 'Kumbukumbu za mahudhurio ya mikutano mikuu ya mwaka', frequency: 'Mwaka' },
        { id: 'RPT-MEM-11', code: 'MEM-11', title: 'Wanachama Wanaostahili Kuchaguliwa Uongozi', description: 'Kukidhi vigezo vya akiba, hisa na nidhamu kwa ugombea uongozi', frequency: 'Mwaka' },
        { id: 'RPT-MEM-12', code: 'MEM-12', title: 'Ripoti ya Mabadiliko ya Profiles za Wanachama', description: 'Audit log ya mabadiliko ya majina, namba au akaunti za benki za wanachama', frequency: 'Kila Siku' },
        { id: 'RPT-MEM-13', code: 'MEM-13', title: 'Wanachama Wenye Umri wa Kustaafu', description: 'Uchanganuzi wa wanachama waliopitiliza umri wa kustaafu kisheria', frequency: 'Mwaka' },
        { id: 'RPT-MEM-14', code: 'MEM-14', title: 'Kadi na Vitambulisho Vilivyotolewa (ID Issuance Log)', description: 'Ripoti ya vitambulisho rasmi vya SACCOS vilivyochapishwa', frequency: 'Robo Mwaka' }
      ]
    },
    {
      id: 'mikopo',
      title: 'Ripoti za Mikopo',
      icon: <CreditCard className="w-4 h-4" />,
      count: 14,
      reports: [
        { id: 'RPT-LON-01', code: 'LON-01', title: 'Portfolio Aging & PAR Analysis (PAR 1-90+ Days)', description: 'Uchanganuzi wa mikopo iliyochelewa kwa siku 1-30, 31-60, 61-90 na 90+', frequency: 'Mwezi' },
        { id: 'RPT-LON-02', code: 'LON-02', title: 'Ripoti ya Non-Performing Loans (NPL)', description: 'Mikopo isiyolipika na asilimia ya hatari kwa mtaji wa SACCOS', frequency: 'Mwezi' },
        { id: 'RPT-LON-03', code: 'LON-03', title: 'Ratiba ya Marejesho ya Mikopo ya Mwezi Huu', description: 'Mikopo inayotarajiwa kurejeshwa mwezi huu na marejesho halisi', frequency: 'Mwezi' },
        { id: 'RPT-LON-04', code: 'LON-04', title: 'Mikopo Mipya Iliyoidhinishwa na Kutolewa', description: 'Mikopo iliyotolewa mwezi huu, aina ya mkopo na riba yake', frequency: 'Mwezi' },
        { id: 'RPT-LON-05', code: 'LON-05', title: 'Mikopo Inayosubiri Idhini ya Kamati ya Mikopo', description: 'Maombi ya mikopo iliyowasilishwa na kusubiri maamuzi ya kamati', frequency: 'Kila Siku' },
        { id: 'RPT-LON-06', code: 'LON-06', title: 'Ripoti ya Wadhamini na Dhamana za Mikopo', description: 'Orodha ya wadhamini wa kila mkopo na thamani ya amana zao', frequency: 'Mwezi' },
        { id: 'RPT-LON-07', code: 'LON-07', title: 'Top 20 Wakopaji Wakubwa Zaidi', description: 'Wanachama wenye salio kubwa zaidi la mikopo na kiwango cha hatari', frequency: 'Robo Mwaka' },
        { id: 'RPT-LON-08', code: 'LON-08', title: 'Mchanganuo wa Riba na Ada za Maombi ya Mikopo', description: 'Riba iliyokusanywa na ada za fomu/ushauri wa mikopo', frequency: 'Mwezi' },
        { id: 'RPT-LON-09', code: 'LON-09', title: 'Restructured & Refinanced Loans', description: 'Mikopo iliyoongezwa muda wa marejesho au kubadilishwa masharti', frequency: 'Robo Mwaka' },
        { id: 'RPT-LON-10', code: 'LON-10', title: 'Write-Off & Bad Debts Register', description: 'Mikopo iliyofutwa kabisa kama hasara kwa idhini ya Mkutano Mkuu', frequency: 'Mwaka' },
        { id: 'RPT-LON-11', code: 'LON-11', title: 'Provision for Loan Loss (Bima & Akiba ya Hasara)', description: 'Kiwango cha fedha kilichotengwa kwa ajili ya kufidia mikopo chechefu', frequency: 'Robo Mwaka' },
        { id: 'RPT-LON-12', code: 'LON-12', title: 'Mikopo kwa Aina za Shughuli (Sectoral Distribution)', description: 'Mikopo ya biashara, kilimo, ujenzi, elimu na dharura', frequency: 'Robo Mwaka' },
        { id: 'RPT-LON-13', code: 'LON-13', title: 'Early Settlement & Clearance Log', description: 'Wanachama waliolimaza mikopo yao kabla ya muda wa mkataba', frequency: 'Mwezi' },
        { id: 'RPT-LON-14', code: 'LON-14', title: 'Micro-Loan Repayment Performance Index', description: 'Kiwango cha ufanisi wa makusanyo ya mikopo ya vikundi na binafsi', frequency: 'Mwezi' }
      ]
    },
    {
      id: 'akiba',
      title: 'Ripoti za Akiba',
      icon: <PiggyBank className="w-4 h-4" />,
      count: 13,
      reports: [
        { id: 'RPT-SAV-01', code: 'SAV-01', title: 'Ripoti ya Akiba za Lazima za Wanachama', description: 'Michango ya kila mwezi ya akiba za lazima kwa kila mwanachama', frequency: 'Mwezi' },
        { id: 'RPT-SAV-02', code: 'SAV-02', title: 'Akiba za Hiari & Deposits Log', description: 'Michango ya akiba za hiari zilizowekwa kupitia Benki/Mobile Money', frequency: 'Mwezi' },
        { id: 'RPT-SAV-03', code: 'SAV-03', title: 'Amana za Muda Maalum (Fixed Deposits)', description: 'Orodha ya amana za muda, tarehe ya kuiva na riba iliyoahidiwa', frequency: 'Mwezi' },
        { id: 'RPT-SAV-04', code: 'SAV-04', title: 'Defaulters wa Akiba za Lazima (Monthly Missed Savings)', description: 'Wanachama waliokosa kuchangia akiba za lazima mwezi huu', frequency: 'Mwezi' },
        { id: 'RPT-SAV-05', code: 'SAV-05', title: 'Miamala ya Akiba Kwa Payment Channels', description: 'Akiba zilizopokelewa kupitia M-Pesa, TigoPesa, AirtelMoney, CRDB, NMB', frequency: 'Kila Siku' },
        { id: 'RPT-SAV-06', code: 'SAV-06', title: 'Akaunti Zisizo na Miamala Muda Mrefu (Dormant Accounts)', description: 'Akaunti za akiba zilizokosa miamala kwa zaidi ya miezi 6 au mwaka', frequency: 'Robo Mwaka' },
        { id: 'RPT-SAV-07', code: 'SAV-07', title: 'Withdrawal & Savings Cash-Out Register', description: 'Utoaji wa akiba za hiari ulioidhinishwa kulingana na kanuni', frequency: 'Mwezi' },
        { id: 'RPT-SAV-08', code: 'SAV-08', title: 'Interest Paid on Fixed Deposits', description: 'Gharama za riba zilizolipwa kwa wamiliki wa amana za muda', frequency: 'Robo Mwaka' },
        { id: 'RPT-SAV-09', code: 'SAV-09', title: 'Akiba Zilizowekwa Kama Dhamana ya Mkopo', description: 'Akiba zilizofungwa (locked) kuzuia utoaji hadi mkopo umalizike', frequency: 'Mwezi' },
        { id: 'RPT-SAV-10', code: 'SAV-10', title: 'Deposit Insurance Fund (DIF) Contribution', description: 'Mchango wa mfuko wa usalama wa amana za wanachama', frequency: 'Mwaka' },
        { id: 'RPT-SAV-11', code: 'SAV-11', title: 'Top 30 Akiba Concentration Report', description: 'Wanachama wenye akiba kubwa zaidi na utegemezi wa mtaji', frequency: 'Robo Mwaka' },
        { id: 'RPT-SAV-12', code: 'SAV-12', title: 'Saccos Emergency & Social Welfare Fund', description: 'Ripoti ya mfuko wa majanga, rambirambi na usaidizi wa jamii', frequency: 'Mwezi' },
        { id: 'RPT-SAV-13', code: 'SAV-13', title: 'Average Monthly Savings Trend', description: 'Mwelekeo wa ongezeko au kupungua kwa akiba za mfumo mzima', frequency: 'Mwezi' }
      ]
    },
    {
      id: 'hisa',
      title: 'Ripoti za Hisa',
      icon: <PieChart className="w-4 h-4" />,
      count: 12,
      reports: [
        { id: 'RPT-SHR-01', code: 'SHR-01', title: 'Orodha ya Mtaji wa Hisa kwa Kila Mwanachama', description: 'Jumla ya hisa zilizimilikiwa, thamani yake na uwiano kwa mtaji wote', frequency: 'Mwezi' },
        { id: 'RPT-SHR-02', code: 'SHR-02', title: 'Mauzo na Ununuzi wa Hisa Mpya', description: 'Hisa mpya zilizonunuliwa na wanachama kipindi hiki', frequency: 'Mwezi' },
        { id: 'RPT-SHR-03', code: 'SHR-03', title: 'Ripoti ya Gawio la Mwaka (Dividend Register)', description: 'Gawio lililothibitishwa na Mkutano Mkuu na kulipwa kwa kila mwanachama', frequency: 'Mwaka' },
        { id: 'RPT-SHR-04', code: 'SHR-04', title: 'Wanachama Wasiofikisha Kiwango cha Chini cha Hisa', description: 'Wanachama walio chini ya kima cha chini cha hisa za kisheria', frequency: 'Mwezi' },
        { id: 'RPT-SHR-05', code: 'SHR-05', title: 'Top Share Capital Holders', description: 'Wamiliki wakubwa wa hisa na kikomo cha umiliki cha kisheria (Max 20%)', frequency: 'Robo Mwaka' },
        { id: 'RPT-SHR-06', code: 'SHR-06', title: 'Mabadiliko na Uhamisho wa Hisa (Share Transfer Log)', description: 'Hisa zilizohamishwa kati ya mwanachama na mwenzake au mrithi', frequency: 'Mwaka' },
        { id: 'RPT-SHR-07', code: 'SHR-07', title: 'Statutory Reserve & Capital Adequacy Ratio', description: 'Uwiano wa mtaji wa hisa dhidi ya mikopo na amana za SACCOS', frequency: 'Robo Mwaka' },
        { id: 'RPT-SHR-08', code: 'SHR-08', title: 'Hati za Hisa Zilizotolewa (Share Certificates Log)', description: 'Kumbukumbu za vyeti rasmi vya hisa vilivyokabidhiwa wanachama', frequency: 'Mwaka' },
        { id: 'RPT-SHR-09', code: 'SHR-09', title: 'Reinvestment of Dividends into Savings', description: 'Gawio lililowekwa moja kwa moja kwenye akiba za wanachama', frequency: 'Mwaka' },
        { id: 'RPT-SHR-10', code: 'SHR-10', title: 'Institutional Institutional Shares Balance', description: 'Hisa za SACCOS zilizowekwa kwenye Muungano wa SACCOS (SCCULT)', frequency: 'Mwaka' },
        { id: 'RPT-SHR-11', code: 'SHR-11', title: 'Share Capital Growth Rate', description: 'Kasi ya ukuaji wa mtaji wa hisa mwezi kwa mwezi', frequency: 'Mwezi' },
        { id: 'RPT-SHR-12', code: 'SHR-12', title: 'Unclaimed Dividend Register', description: 'Gawio la wanachama ambalo halijachukuliwa au akaunti zao hazipatikani', frequency: 'Mwaka' }
      ]
    },
    {
      id: 'mapato',
      title: 'Ripoti za Mapato',
      icon: <TrendingUp className="w-4 h-4" />,
      count: 13,
      reports: [
        { id: 'RPT-REV-01', code: 'REV-01', title: 'Mapato ya Riba za Mikopo (Loan Interest Income)', description: 'Riba yote iliyokusanywa kutoka kwenye marejesho ya mikopo', frequency: 'Mwezi' },
        { id: 'RPT-REV-02', code: 'REV-02', title: 'Mapato ya Ada za Maombi & Bima ya Mikopo', description: 'Ada za fomu za mikopo, ushauri na ada za uendeshaji', frequency: 'Mwezi' },
        { id: 'RPT-REV-03', code: 'REV-03', title: 'Mapato ya Faini, Penalti na Nidhamu', description: 'Faini za kuchelewa vikao, penalti za marejesho na makosa ya sheria', frequency: 'Mwezi' },
        { id: 'RPT-REV-04', code: 'REV-04', title: 'Mapato ya Ada za Usajili wa Wanachama Wapya', description: 'Entrance fees zilizokusanywa kutoka kwa wanachama wapya', frequency: 'Mwezi' },
        { id: 'RPT-REV-05', code: 'REV-05', title: 'Mapato ya Riba ya Amana Zilizowekwa Benki', description: 'Riba iliyopatikana kutoka kwenye akaunti za fixed deposits za SACCOS benki', frequency: 'Robo Mwaka' },
        { id: 'RPT-REV-06', code: 'REV-06', title: 'Mapato ya Kamisheni za Mobile Money Integration', description: 'Gawio la ushirikiano wa mifumo ya malipo ya simu (Aggregator Split)', frequency: 'Mwezi' },
        { id: 'RPT-REV-07', code: 'REV-07', title: 'Comparison: Mapato ya Bajeti vs Halisi (Variance)', description: 'Ulinganisho wa mapato yaliyopangwa kwenye bajeti na yaliyokusanywa', frequency: 'Mwezi' },
        { id: 'RPT-REV-08', code: 'REV-08', title: 'Revenue Collection by Branch', description: 'Mchanganuo wa mapato yaliyozalishwa na kila tawi la SACCOS', frequency: 'Mwezi' },
        { id: 'RPT-REV-09', code: 'REV-09', title: 'Mapato ya Mauzo ya Passbooks & Vitambulisho', description: 'Mapato kutokana na uuzaji wa vitabu vya akiba na kadi', frequency: 'Mwezi' },
        { id: 'RPT-REV-10', code: 'REV-10', title: 'Uwekezaji Nje ya Biashara Kuu (Investment Income)', description: 'Mapato ya majengo, hisa za makampuni mengine au hati fungani', frequency: 'Mwaka' },
        { id: 'RPT-REV-11', code: 'REV-11', title: 'Projected Interest Income (Miezi 6 Ijayo)', description: 'Utabiri wa riba zitakazokusanywa kulingana na mikopo inayoendelea', frequency: 'Robo Mwaka' },
        { id: 'RPT-REV-12', code: 'REV-12', title: 'Monthly Revenue Progression & Trend', description: 'Mwelekeo wa mapato ya jumla kwa miezi 12 ya mwaka wa fedha', frequency: 'Mwezi' },
        { id: 'RPT-REV-13', code: 'REV-13', title: 'Mapato Yasiyo ya Riba (Non-Interest Income Summary)', description: 'Jumla ya mapato yote yasiyotokana na riba za mikopo', frequency: 'Mwezi' }
      ]
    },
    {
      id: 'matumizi',
      title: 'Ripoti za Matumizi',
      icon: <DollarSign className="w-4 h-4" />,
      count: 13,
      reports: [
        { id: 'RPT-EXP-01', code: 'EXP-01', title: 'Matumizi ya Uendeshaji wa Ofisi (OpEx Ledger)', description: 'Matumizi ya siku hadi siku ya utawala na uendeshaji', frequency: 'Mwezi' },
        { id: 'RPT-EXP-02', code: 'EXP-02', title: 'Mishahara, Posho na Stahiki za Wafanyakazi', description: 'Gharama za mishahara, PAYE, NSSF/ZSSF na posho za watendaji', frequency: 'Mwezi' },
        { id: 'RPT-EXP-03', code: 'EXP-03', title: 'Posho za Mikutano ya Bodi na Kamati', description: 'Honoraria na posho za kikao zilizolipwa kwa wajumbe wa Bodi', frequency: 'Mwezi' },
        { id: 'RPT-EXP-04', code: 'EXP-04', title: 'Gharama za Ukaguzi, Sheria na Leseni', description: 'Malipo ya wakaguzi wa nje, ushauri wa kisheria na leseni za BOT/SCCULT', frequency: 'Mwaka' },
        { id: 'RPT-EXP-05', code: 'EXP-05', title: 'Gharama za Mfumo wa IT, SMS na Internet', description: 'Ada za SaaS platform, SMS notifications gateway na mtandao', frequency: 'Mwezi' },
        { id: 'RPT-EXP-06', code: 'EXP-06', title: 'Gharama za Riba za Amana za Muda (Fixed Deposit Interest)', description: 'Riba iliyolipwa kwa wateja walioiweka amana za muda mrefu', frequency: 'Robo Mwaka' },
        { id: 'RPT-EXP-07', code: 'EXP-07', title: 'Matumizi ya Safari na Mafunzo (Capacity Building)', description: 'Gharama za semina za Bodi, mafunzo ya staff na usafiri', frequency: 'Robo Mwaka' },
        { id: 'RPT-EXP-08', code: 'EXP-08', title: 'Umeme, Maji, Kodi ya Pango na Simu', description: 'Kodi za majengo ya matawi na huduma za jamii', frequency: 'Mwezi' },
        { id: 'RPT-EXP-09', code: 'EXP-09', title: 'Comparison: Matumizi ya Bajeti vs Halisi (Variance)', description: 'Ulinganisho wa bajeti iliyoidhinishwa na matumizi halisi', frequency: 'Mwezi' },
        { id: 'RPT-EXP-10', code: 'EXP-10', title: 'Petty Cash Ledger & Expense Vouchers Log', description: 'Miamala yote ya fedha taslimu zilizotumika kwa dharura', frequency: 'Kila Siku' },
        { id: 'RPT-EXP-11', code: 'EXP-11', title: 'Depreciation & Amortization Schedule', description: 'Uchakavu wa thamani ya kompyuta, magari na majengo ya SACCOS', frequency: 'Mwaka' },
        { id: 'RPT-EXP-12', code: 'EXP-12', title: 'Gharama za Benki na Miamala ya Simu (Bank Charges)', description: 'Ledger fees za benki, makato ya miamala na kodi za kadi', frequency: 'Mwezi' },
        { id: 'RPT-EXP-13', code: 'EXP-13', title: 'Emergency Social Fund Disbursements', description: 'Matumizi ya mfuko wa majanga na rambirambi zilizotolewa', frequency: 'Mwezi' }
      ]
    },
    {
      id: 'fedha',
      title: 'Ripoti za Fedha',
      icon: <Building2 className="w-4 h-4" />,
      count: 12,
      reports: [
        { id: 'RPT-FIN-01', code: 'FIN-01', title: 'Mizani ya Ukaguzi (Trial Balance - General Ledger)', description: 'Kumbukumbu za madeni na mikopo ya akaunti zote za SACCOS', frequency: 'Mwezi' },
        { id: 'RPT-FIN-02', code: 'FIN-02', title: 'Hali ya Fedha (Balance Sheet / Statement of Financial Position)', description: 'Rasilimali (Assets), Madeni (Liabilities) na Mtaji (Equity)', frequency: 'Mwezi' },
        { id: 'RPT-FIN-03', code: 'FIN-03', title: 'Mapato na Matumizi (Income Statement / Profit & Loss)', description: 'Faida au hasara halisi ya uendeshaji wa SACCOS/VICOBA', frequency: 'Mwezi' },
        { id: 'RPT-FIN-04', code: 'FIN-04', title: 'Mtiririko wa Fedha (Statement of Cash Flows)', description: 'Mtiririko wa fedha za uendeshaji, uwekezaji na kifedha', frequency: 'Robo Mwaka' },
        { id: 'RPT-FIN-05', code: 'FIN-05', title: 'CAMEL / PEARLS Ratios Analysis Framework', description: 'Uchanganuzi wa viwango vya ubora wa mtaji, amana na mikopo kisheria', frequency: 'Robo Mwaka' },
        { id: 'RPT-FIN-06', code: 'FIN-06', title: 'Taarifa ya Mabadiliko ya Mtaji (Statement of Changes in Equity)', description: 'Ukuaji wa mtaji wa hisa, akiba za kisheria na faida iliyobaki', frequency: 'Mwaka' },
        { id: 'RPT-FIN-07', code: 'FIN-07', title: 'Ripoti ya Ukwasi na Hazina (Liquidity Ratio)', description: 'Kiwango cha fedha taslimu benki kutosheleza utoaji wa akiba (Min 15%)', frequency: 'Kila Siku' },
        { id: 'RPT-FIN-08', code: 'FIN-08', title: 'Mchanganuo wa Akaunti za Benki (Bank Reconciliation)', description: 'Ulinganisho wa vitabu vya uhasibu na bank statements za CRDB/NMB/PBZ', frequency: 'Mwezi' },
        { id: 'RPT-FIN-09', code: 'FIN-09', title: 'Statutory Reserve Fund Allocation (20% Allocation)', description: 'Fedha zilizotengwa kwa mfuko wa kisheria wa akiba kutoka kwenye faida', frequency: 'Mwaka' },
        { id: 'RPT-FIN-10', code: 'FIN-10', title: 'Annual Master Budget Performance Report', description: 'Utekelezaji wa bajeti kuu ya mwaka iliyoidhinishwa na Mkutano Mkuu', frequency: 'Robo Mwaka' },
        { id: 'RPT-FIN-11', code: 'FIN-11', title: 'Profitability per Branch (P&L ya Matawi)', description: 'Uchanganuzi wa tawi gani linaingiza faida au kuendeshwa kwa hasara', frequency: 'Mwezi' },
        { id: 'RPT-FIN-12', code: 'FIN-12', title: 'Withholding Tax & Statutory TRA Return', description: 'Kodi zilizokatwa kwenye riba au huduma na kuwasilishwa TRA', frequency: 'Mwezi' }
      ]
    },
    {
      id: 'ukaguzi',
      title: 'Ripoti za Ukaguzi',
      icon: <ShieldAlert className="w-4 h-4" />,
      count: 12,
      reports: [
        { id: 'RPT-AUD-01', code: 'AUD-01', title: 'System Audit Trail & Transaction Logs', description: 'Kumbukumbu zote za nani aliingiza, aliyebadili au kuidhinisha miamala', frequency: 'Kila Siku' },
        { id: 'RPT-AUD-02', code: 'AUD-02', title: 'Regulator Statutory Compliance Return (BOT & Registrar)', description: 'Ripoti rasmi inayowasilishwa kwa Mrajis wa Ushirika na Benki Kuu', frequency: 'Robo Mwaka' },
        { id: 'RPT-AUD-03', code: 'AUD-03', title: 'System Access & User Login History Log', description: 'Orodha ya waliologin kwenye mfumo, muda na IP address zao', frequency: 'Kila Siku' },
        { id: 'RPT-AUD-04', code: 'AUD-04', title: 'Reversed & Voided Transactions Audit', description: 'Miamala yote iliyofutwa, kurejeshwa au kurekebishwa na Wahasibu', frequency: 'Kila Siku' },
        { id: 'RPT-AUD-05', code: 'AUD-05', title: 'Ripoti ya Kamati ya Usimamizi (Supervisory Committee Audit)', description: 'Ukaguzi wa ndani uliofanywa na Kamati ya Usimamizi ya SACCOS', frequency: 'Robo Mwaka' },
        { id: 'RPT-AUD-06', code: 'AUD-06', title: 'Anti-Money Laundering (AML) & Suspicious Activity Log', description: 'Miamala mikubwa isiyo ya kawaida inayohitaji taarifa kwa FIU', frequency: 'Mwezi' },
        { id: 'RPT-AUD-07', code: 'AUD-07', title: 'Mabadiliko ya Mipangilio ya Mfumo (Settings Audit)', description: 'Audit log ya mabadiliko ya riba za mikopo, ada au usalama', frequency: 'Mwezi' },
        { id: 'RPT-AUD-08', code: 'AUD-08', title: 'Identity Verification & NIDA Audit Report', description: 'Uhakiki wa usahihi wa taarifa za wanachama dhidi ya vitambulisho', frequency: 'Robo Mwaka' },
        { id: 'RPT-AUD-09', code: 'AUD-09', title: 'Internal Controls Assessment Report', description: 'Tathmini ya udhibiti wa ndani, utenganisho wa madaraka (Maker-Checker)', frequency: 'Robo Mwaka' },
        { id: 'RPT-AUD-10', code: 'AUD-10', title: 'Insurance Claim & Loan Loss Audit', description: 'Ukaguzi wa madai ya bima pale mwanachama anapofariki au kupata ulemavu', frequency: 'Robo Mwaka' },
        { id: 'RPT-AUD-11', code: 'AUD-11', title: 'Capital Adequacy & Reserve Verification Audit', description: 'Ukaguzi wa kufuata viwango vya kisheria vya mtaji wa hifadhi', frequency: 'Mwaka' },
        { id: 'RPT-AUD-12', code: 'AUD-12', title: 'Annual Board Report Package for AGM', description: 'Kifurushi kamili cha ripoti za ukaguzi zinazowasilishwa Mkutano Mkuu', frequency: 'Mwaka' }
      ]
    }
  ];

  const currentCategoryObj = reportCategories.find(c => c.id === activeCategory) || reportCategories[0];
  const activeReport = currentCategoryObj.reports.find(r => r.id === selectedReportId) || currentCategoryObj.reports[0];

  const handleExport = (type: string) => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeCategory === 'wanachama') {
      headers = ['Namba Mwanachama', 'Jina Bupe', 'Namba ya Simu', 'Tawi', 'Akiba (TZS)', 'Hisa (TZS)', 'Baki la Mkopo (TZS)', 'Hali'];
      rows = members.map(m => [m.memberNumber, m.fullName, m.phone, m.branch, m.totalSavings, m.totalShares, m.totalLoansOutstanding, m.status]);
    } else if (activeCategory === 'mikopo') {
      headers = ['Mwanachama', 'Aina ya Mkopo', 'Kiasi Kilichoidhinishwa (TZS)', 'Kiasi Kilicholipwa (TZS)', 'Baki la Deni (TZS)', 'Riba (%)', 'Hali'];
      rows = loans.map(l => [l.memberName, l.loanType, l.amountApproved, l.totalPaid, l.remainingBalance, `${l.interestRateAnnual}%`, l.status]);
    } else {
      headers = ['Tarehe', 'Maelezo / Kipengele', 'Namba ya Kumbukumbu', 'Kiasi (TZS)', 'Aina', 'Hali ya Uhakiki'];
      rows = [
        ['2026-07-20', `Ripoti Kuu ya ${activeReport.title} - Tawi la Mwenge`, 'TX-88392', 1550000, 'Amana', 'Imethibitishwa'],
        ['2026-07-18', `Mchanganuo wa Ukaguzi - Tawi la Mpendae`, 'TX-88393', 4800000, 'Uwekezaji', 'Imethibitishwa'],
        ['2026-07-15', `Reconciliation ya Mwezi - Chake Chake Pemba`, 'TX-88394', 3200000, 'Akiba/Hisa', 'Imethibitishwa'],
        ['2026-07-10', `Statutory Compliance Return - Registrar Office`, 'TX-88395', 12000000, 'Kisheria', 'Imewasilishwa']
      ];
    }

    if (type === 'Excel' || type === 'CSV') {
      downloadCSV(`${activeReport.code}_${activeReport.title.replace(/\s+/g, '_')}`, headers, rows);
    } else {
      printFormattedReport(
        `${activeReport.code}: ${activeReport.title}`,
        `${currentInstitution.name} - Kipindi: ${dateFrom} hadi ${dateTo}`,
        headers,
        rows
      );
    }

    setNotification(`Ripoti ya "${activeReport.title}" (${activeReport.code}) imepakuliwa rasmi!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePrint = () => {
    handleExport('PDF');
  };

  const totalReportsCount = reportCategories.reduce((acc, cat) => acc + cat.count, 0);

  return (
    <div id="reports-module-view" className="space-y-6 text-xs animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
              <FileText className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Maktaba Kuu ya Ripoti ({currentInstitution.name})</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold text-[10px]">
                  100+ SACCOS Reports Hub
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Ripoti zote za Wanachama, Mikopo, Akiba, Hisa, Mapato, Matumizi, Fedha na Ukaguzi wa Kisheria (BOT & Registrar).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleExport('PDF')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Pakua PDF</span>
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Pakua Excel (CSV)</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700"
            title="Chapa Ripoti (Print)"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Primary Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {reportCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedReportId(cat.reports[0].id);
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/30 scale-[1.02]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-indigo-500/30 text-white' : 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'}`}>
                  {cat.icon}
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                  {cat.count}
                </span>
              </div>
              <div>
                <span className="font-extrabold text-[11px] block leading-tight">{cat.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Global Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Tafuta ripoti yoyote katika maktaba ya ripoti ${totalReportsCount}+...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-[11px] font-medium"
            />
            <span className="text-slate-400 text-[10px]">hadi</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-[11px] font-medium"
            />
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="Matawi Yote">Matawi Yote</option>
            <option value="Makao Makuu - Mwenge">Makao Makuu - Mwenge</option>
            <option value="Tawi la Mpendae - Unguja">Tawi la Mpendae - Unguja</option>
            <option value="Tawi la Chake Chake - Pemba">Tawi la Chake Chake - Pemba</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: Report Selector & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Specific Report Picker List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Orodha ya {currentCategoryObj.title} ({currentCategoryObj.reports.length})</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Chagua Ripoti</span>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {currentCategoryObj.reports
              .filter(r => searchTerm === '' || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.code.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((rep) => {
                const isSelected = rep.id === selectedReportId;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500/80 text-indigo-900 dark:text-indigo-100 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {rep.code}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{rep.frequency}</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mb-0.5">
                      {rep.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {rep.description}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Side: Live Report Content & Data Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xs">
          
          {/* Active Report Header Information */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold rounded-lg text-[11px]">
                  {activeReport.code}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{currentCategoryObj.title}</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeReport.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeReport.description} (Kipindi: {dateFrom} hadi {dateTo} | Tawi: {selectedBranch})
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleExport('PDF')}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-xs hover:bg-emerald-100"
              >
                PDF
              </button>
              <button
                onClick={() => handleExport('Excel')}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl text-xs hover:bg-indigo-100"
              >
                Excel (CSV)
              </button>
            </div>
          </div>

          {/* Dynamic Interactive Data Tables Based on Active Category */}
          {activeCategory === 'wanachama' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-semibold block">Jumla ya Wanachama</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{members.length}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-semibold block">Amana Zote za Wanachama</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatTZS(members.reduce((sum, m) => sum + m.totalSavings, 0))}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-semibold block">Jumla ya Mtaji wa Hisa</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {formatTZS(members.reduce((sum, m) => sum + m.totalShares, 0))}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b text-slate-500 font-semibold uppercase text-[10px]">
                      <th className="p-3">Namba</th>
                      <th className="p-3">Jina la Mwanachama</th>
                      <th className="p-3">Simu / Tawi</th>
                      <th className="p-3">Akiba Zote</th>
                      <th className="p-3">Hisa Zote</th>
                      <th className="p-3">Baki la Mkopo</th>
                      <th className="p-3">Hali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="p-3 font-mono font-bold">{m.memberNumber}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{m.fullName}</td>
                        <td className="p-3 text-slate-500">
                          <div>{m.phone}</div>
                          <span className="text-[10px] text-slate-400">{m.branch}</span>
                        </td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatTZS(m.totalSavings)}</td>
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{formatTZS(m.totalShares)}</td>
                        <td className="p-3 font-bold text-rose-600 dark:text-rose-400">{formatTZS(m.totalLoansOutstanding)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeCategory === 'mikopo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-semibold block">Jumla Mikopo Iliyoidhinishwa</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatTZS(loans.reduce((sum, l) => sum + l.amountApproved, 0))}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-semibold block">Marejesho Yaliyopokelewa</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {formatTZS(loans.reduce((sum, l) => sum + l.totalPaid, 0))}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 font-semibold block">Baki la Mikopo Inayodaiwa</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {formatTZS(loans.reduce((sum, l) => sum + l.remainingBalance, 0))}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b text-slate-500 font-semibold uppercase text-[10px]">
                      <th className="p-3">Mwanachama</th>
                      <th className="p-3">Aina ya Mkopo</th>
                      <th className="p-3">Kiasi Kilichoidhinishwa</th>
                      <th className="p-3">Kiasi Kilicholipwa</th>
                      <th className="p-3">Baki la Deni</th>
                      <th className="p-3">Riba (%)</th>
                      <th className="p-3">Hali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                    {loans.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{l.memberName}</td>
                        <td className="p-3">{l.loanType}</td>
                        <td className="p-3 font-bold">{formatTZS(l.amountApproved)}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatTZS(l.totalPaid)}</td>
                        <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{formatTZS(l.remainingBalance)}</td>
                        <td className="p-3">{l.interestRateAnnual}%</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeCategory !== 'wanachama' && activeCategory !== 'mikopo' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-indigo-900 dark:text-indigo-200 text-xs">
                    Taarifa ya Ukaguzi wa {activeReport.title}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kipindi: {dateFrom} hadi {dateTo} | Mfumo wa ZANZIBAR SACCOS Platform
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl text-[10px]">
                  Tayari (Ready)
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 border-b text-slate-500 font-semibold uppercase text-[10px]">
                      <th className="p-3">Tarehe</th>
                      <th className="p-3">Kipengele / Maelezo</th>
                      <th className="p-3">Namba ya Kumbukumbu</th>
                      <th className="p-3">Kiasi (TZS)</th>
                      <th className="p-3">Uwekezo / Aina</th>
                      <th className="p-3">Hali ya Uhakiki</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                    {[
                      { date: '2026-07-20', desc: `Ripoti Kuu ya ${activeReport.title} - Tawi la Mwenge`, ref: 'TX-88392', amount: 1550000, type: 'Amana', status: 'Imethibitishwa' },
                      { date: '2026-07-18', desc: `Mchanganuo wa Ukaguzi - Tawi la Mpendae`, ref: 'TX-88393', amount: 4800000, type: 'Uwekezaji', status: 'Imethibitishwa' },
                      { date: '2026-07-15', desc: `Reconciliation ya Mwezi - Chake Chake Pemba`, ref: 'TX-88394', amount: 3200000, type: 'Akiba/Hisa', status: 'Imethibitishwa' },
                      { date: '2026-07-10', desc: `Statutory Compliance Return - Registrar Office`, ref: 'TX-88395', amount: 12000000, type: 'Kisheria', status: 'Imewasilishwa' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{row.date}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.desc}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{row.ref}</td>
                        <td className="p-3 font-black text-indigo-600 dark:text-indigo-400">{formatTZS(row.amount)}</td>
                        <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">{row.type}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-white shrink-0" />
          <span>{notification}</span>
        </div>
      )}

    </div>
  );
};
