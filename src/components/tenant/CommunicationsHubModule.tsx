import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Mail,
  Bell,
  MessageCircle,
  Send,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  Smartphone,
  PhoneCall,
  Settings,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface ChannelStatus {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push' | 'whatsapp';
  provider: string;
  status: 'Connected' | 'Configuring' | 'Disabled';
  deliveredToday: number;
  iconColor: string;
  bgColor: string;
}

interface OutgoingLog {
  id: string;
  recipient: string;
  channel: 'SMS' | 'Email' | 'Push' | 'WhatsApp';
  templateName: string;
  messageSnippet: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Failed';
}

export const CommunicationsHubModule: React.FC = () => {
  const { currentInstitution, members, addAnnouncement, announcements, userAuth } = useApp();

  const [announcementText, setAnnouncementText] = useState('');
  const [announcementStatus, setAnnouncementStatus] = useState<string | null>(null);
  const [isPublishingAnnouncement, setIsPublishingAnnouncement] = useState(false);

  const [channels, setChannels] = useState<ChannelStatus[]>([
    {
      id: 'sms',
      name: 'SMS Gateway (Infobip / Beem / NextSMS)',
      type: 'sms',
      provider: 'Beem Africa / NextSMS',
      status: 'Connected',
      deliveredToday: 1420,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40'
    },
    {
      id: 'email',
      name: 'Email SMTP / Transactional (SendGrid / Mailgun)',
      type: 'email',
      provider: 'SendGrid API',
      status: 'Connected',
      deliveredToday: 380,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40'
    },
    {
      id: 'push',
      name: 'Push Notifications (Firebase Cloud Messaging)',
      type: 'push',
      provider: 'FCM (Firebase App)',
      status: 'Connected',
      deliveredToday: 890,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API (Meta Cloud API)',
      type: 'whatsapp',
      provider: 'Meta WhatsApp Business API',
      status: 'Connected',
      deliveredToday: 512,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40'
    }
  ]);

  const [outgoingLogs, setOutgoingLogs] = useState<OutgoingLog[]>([
    {
      id: 'log_wsp_101',
      recipient: 'Juma Hamisi Kassim (+255 754 123 456)',
      channel: 'WhatsApp',
      templateName: 'Akiba Deposit Receipt',
      messageSnippet: 'Ndugu Juma, malipo yako ya TZS 150,000 kupitia M-Pesa yamepokelewa. Salio jipya la Akiba ni TZS 4,500,000.',
      timestamp: '2026-07-25 11:20',
      status: 'Delivered'
    },
    {
      id: 'log_sms_102',
      recipient: 'Amina Salum Bakari (+255 655 987 654)',
      channel: 'SMS',
      templateName: 'Loan Repayment Reminder',
      messageSnippet: 'Ndugu Amina, kumbukumbu ya marejesho ya mkopo TZS 444,243 inatakiwa tarehe 28/07/2026. Asante.',
      timestamp: '2026-07-25 10:15',
      status: 'Delivered'
    },
    {
      id: 'log_eml_103',
      recipient: 'Emanuel Peter Mwangi (mwangipeter@gmail.com)',
      channel: 'Email',
      templateName: 'Monthly Financial Statement',
      messageSnippet: 'Taarifa yako ya mwezi ya Akiba, Hisa na Mkopo katika Intelleza SACCOS SYSTEM (ISACCOS) imeambatishwa.',
      timestamp: '2026-07-25 09:00',
      status: 'Delivered'
    },
    {
      id: 'log_psh_104',
      recipient: 'All Active App Members (840 Members)',
      channel: 'Push',
      templateName: 'Mkutano Mkuu wa Mwaka Notification',
      messageSnippet: 'Mkutano Mkuu wa Mwaka wa ISACCOS utafanyika tarehe 15 Agosti 2026. Bofya hapa kutazama ajenda.',
      timestamp: '2026-07-24 16:30',
      status: 'Delivered'
    }
  ]);

  // Test Message Form
  const [selectedChannel, setSelectedChannel] = useState<'SMS' | 'Email' | 'Push' | 'WhatsApp'>('WhatsApp');
  const [targetPhoneOrEmail, setTargetPhoneOrEmail] = useState<string>('+255 754 123 456');
  const [messageBody, setMessageBody] = useState<string>(
    'Habari! Hii ni arifa ya majaribio kutoka Intelleza SACCOS SYSTEM (ISACCOS). Salio lako la Akiba ni TZS 4,500,000.'
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim() || !targetPhoneOrEmail.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      const newLog: OutgoingLog = {
        id: `log_custom_${Date.now()}`,
        recipient: targetPhoneOrEmail,
        channel: selectedChannel,
        templateName: 'Custom Dispatch',
        messageSnippet: messageBody,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'Delivered'
      };

      setOutgoingLogs([newLog, ...outgoingLogs]);
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    }, 1000);
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) {
      setAnnouncementStatus('Andika tangazo kabla ya kutuma.');
      return;
    }

    setIsPublishingAnnouncement(true);
    setAnnouncementStatus(null);

    const res = await addAnnouncement(announcementText.trim());

    setIsPublishingAnnouncement(false);
    setAnnouncementStatus(res.message || (res.success ? 'Tangazo limetumwa kwa Supabase.' : 'Imeshindwa kutuma tangazo.'));

    if (res.success) {
      setAnnouncementText('');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black">Mfumo wa Mawasiliano (Communications Hub)</h2>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            Mawasiliano ya kiwango cha juu kupitia <strong>SMS, Email, Push Notifications na WhatsApp Business API</strong> kwa ajili ya arifa za papo hapo, marejesho na stakabadhi.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>Omni-Channel Messaging Ready</span>
        </div>
      </div>

      {/* 4 Active Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((ch) => (
          <div key={ch.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border flex flex-col justify-between space-y-3 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-xl ${ch.bgColor} ${ch.iconColor}`}>
                  {ch.type === 'sms' && <MessageSquare className="w-5 h-5" />}
                  {ch.type === 'email' && <Mail className="w-5 h-5" />}
                  {ch.type === 'push' && <Bell className="w-5 h-5" />}
                  {ch.type === 'whatsapp' && <MessageCircle className="w-5 h-5" />}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {ch.status}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-3">{ch.name}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Provider: {ch.provider}</p>
            </div>

            <div className="pt-2 border-t flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Zilizotumwa Leo:</span>
              <span className="font-bold text-emerald-600 font-mono text-xs">{ch.deliveredToday.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Bell className="w-4 h-4 text-emerald-600" />
            Publish Announcement to Supabase
          </h3>
          <span className="text-[10px] text-slate-500">
            Logged in as: {userAuth?.fullName || 'Guest'}
          </span>
        </div>

        <form onSubmit={handlePublishAnnouncement} className="space-y-3">
          <textarea
            rows={4}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Andika tangazo la habari, tukio, kanuni au taarifa ya taasisi..."
            className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isPublishingAnnouncement}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {isPublishingAnnouncement ? 'Inatuma...' : 'Publish Announcement'}
            </button>

            <span className="text-[10px] text-slate-500">
              {announcements.length} items loaded
            </span>
          </div>

          {announcementStatus && (
            <div className={`p-3 rounded-xl border text-xs font-bold ${announcementStatus.toLowerCase().includes('mashaka') || announcementStatus.toLowerCase().includes('error') || announcementStatus.toLowerCase().includes('ingia') ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
              {announcementStatus}
            </div>
          )}
        </form>
      </div>

      {/* Dispatcher Simulator & Message Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Dispatch Tool */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Send className="w-4 h-4 text-emerald-600" />
              Tuma Arifa au Jaribio (Test Dispatcher)
            </h3>
          </div>

          <form onSubmit={handleSendTestMessage} className="space-y-4">
            <div>
              <label className="font-semibold block mb-1">Chagua Njia ya Kutuma (Channel)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'SMS', label: 'SMS', icon: <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> },
                  { id: 'WhatsApp', label: 'WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> },
                  { id: 'Email', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-amber-600" /> },
                  { id: 'Push', label: 'Push App', icon: <Bell className="w-3.5 h-3.5 text-purple-600" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedChannel(item.id as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedChannel === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Mpokeaji (Namba ya Simu / Email)</label>
              <input
                type="text"
                value={targetPhoneOrEmail}
                onChange={(e) => setTargetPhoneOrEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Ujumbe (Message Text)</label>
              <textarea
                rows={4}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Inatuma ujumbe...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Tuma Ujumbe Sasa ({selectedChannel})
                </>
              )}
            </button>

            {sendSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Ujumbe umetumwa kikamilifu kupitia {selectedChannel}!
              </div>
            )}
          </form>
        </div>

        {/* Logs Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              Kumbukumbu za Arifa Zilizotumwa (Outgoing Dispatch History)
            </h3>
            <span className="text-slate-500 text-[11px]">Real-time Dispatch Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-[11px]">
                  <th className="p-2.5">Kituo (Channel)</th>
                  <th className="p-2.5">Mpokeaji</th>
                  <th className="p-2.5">Aina ya Arifa</th>
                  <th className="p-2.5">Muhtasari wa Ujumbe</th>
                  <th className="p-2.5">Muda</th>
                  <th className="p-2.5">Hali (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {outgoingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        log.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                        log.channel === 'SMS' ? 'bg-blue-100 text-blue-800' :
                        log.channel === 'Email' ? 'bg-amber-100 text-amber-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900 dark:text-white max-w-[160px] truncate">
                      {log.recipient}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300 font-medium">
                      {log.templateName}
                    </td>
                    <td className="p-2.5 text-slate-500 max-w-[220px] truncate" title={log.messageSnippet}>
                      {log.messageSnippet}
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-500">
                      {log.timestamp}
                    </td>
                    <td className="p-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
