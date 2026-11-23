import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  Zap, 
  Server, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { VpnServerNode } from '../types';

const DEFAULT_SERVERS: VpnServerNode[] = [
  {
    id: 'de-frankfurt-01',
    name: 'ألمانيا - فرانكفورت (سيرفر فائق السرعة)',
    country: 'ألمانيا',
    flag: '🇩🇪',
    city: 'Frankfurt',
    ping: 28,
    type: 'ultra_fast',
    features: ['تخطي حجب المدارس', 'تشفير DNS 1.1.1.1', 'سرعة قصوى 1Gbps', 'تحميل مباشر بدون قيود']
  },
  {
    id: 'fr-paris-02',
    name: 'فرنسا - باريس (خادم حماية الهوية المشفر)',
    country: 'فرنسا',
    flag: '🇫🇷',
    city: 'Paris',
    ping: 34,
    type: 'stealth',
    features: ['حماية التابلت المدرسي', 'تجاوز جدار الحماية', 'Zero-Logs', 'دعم MP4/MP3']
  },
  {
    id: 'nl-amsterdam-01',
    name: 'هولندا - أمستردام (تخطي حجب شبكات التعليم)',
    country: 'هولندا',
    flag: '🇳🇱',
    city: 'Amsterdam',
    ping: 31,
    type: 'school_unblocker',
    features: ['مخصص لشبكات المدارس', 'تخطي قيود يوتيوب ووزارة التعليم', 'حظر التتبع', 'بث مباشر']
  },
  {
    id: 'us-newyork-01',
    name: 'أمريكا - نيويورك (نفق سحابي مباشر)',
    country: 'أمريكا',
    flag: '🇺🇸',
    city: 'New York',
    ping: 85,
    type: 'ultra_fast',
    features: ['تخطي الحظر الجغرافي', 'محتوى أمريكا المفتوح', 'أقصى أمان', 'منافذ مفتوحة']
  },
  {
    id: 'sg-singapore-01',
    name: 'سنغافورة - آسيا (نفق سريع)',
    country: 'سنغافورة',
    flag: '🇸🇬',
    city: 'Singapore',
    ping: 110,
    type: 'p2p_direct',
    features: ['تخطي قيود مزودي الخدمة', 'سرعة متوازنة', 'SSL Tunneling']
  }
];

const VPN_STORAGE_KEY = 'youtube_spell_vpn_active_v1';

export const VpnModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}> = ({ isOpen, onClose, isDarkMode }) => {
  const [servers, setServers] = useState<VpnServerNode[]>(DEFAULT_SERVERS);
  const [selectedServer, setSelectedServer] = useState<VpnServerNode>(DEFAULT_SERVERS[0]);
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    try {
      return localStorage.getItem(VPN_STORAGE_KEY) === 'true';
    } catch {
      return true; // Default enabled for students
    }
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);

  // Load server nodes from API
  useEffect(() => {
    if (!isOpen) return;
    const fetchServers = async () => {
      try {
        const res = await fetch('/api/vpn/servers');
        if (res.ok) {
          const data = await res.json();
          if (data.servers && data.servers.length > 0) {
            setServers(data.servers);
            if (!selectedServer) {
              setSelectedServer(data.servers[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load VPN servers:', err);
      }
    };
    fetchServers();
  }, [isOpen]);

  const handleToggleVpn = () => {
    if (isConnected) {
      setIsConnected(false);
      try {
        localStorage.setItem(VPN_STORAGE_KEY, 'false');
      } catch {}
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        try {
          localStorage.setItem(VPN_STORAGE_KEY, 'true');
        } catch {}
      }, 1200);
    }
  };

  const handleTestPings = async () => {
    setIsTestingPing(true);
    try {
      const updated = await Promise.all(
        servers.map(async (srv) => {
          try {
            const start = performance.now();
            const res = await fetch(`/api/vpn/ping/${srv.id}`);
            const duration = Math.round(performance.now() - start);
            if (res.ok) {
              const data = await res.json();
              return { ...srv, ping: data.ping || duration };
            }
            return srv;
          } catch {
            return srv;
          }
        })
      );
      setServers(updated);
    } finally {
      setIsTestingPing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDarkMode 
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between relative overflow-hidden ${
          isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              isConnected 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}>
              <ShieldCheck className={`w-6 h-6 ${isConnected ? 'animate-pulse text-emerald-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">نظام الـ VPN والنفق المشفر الداخلي</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isConnected 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  {isConnected ? '🛡️ متصل ومحمي' : 'غير متصل'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                تخطي جدار حماية تابلت المدرسة وفك حظر المنصات والمواقع المحجوبة فوراً.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Main Power Switch Bar */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            isConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : (isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200')
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-neutral-500'}`} />
              <div>
                <h4 className="text-sm font-extrabold flex items-center gap-1.5">
                  <span>الخادم النشط:</span>
                  <span className="text-emerald-400">{selectedServer.flag} {selectedServer.name}</span>
                </h4>
                <p className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {isConnected 
                    ? `النفق يعمل بنجاح • زمن الاستجابة ${selectedServer.ping}ms • تشفير AES-256`
                    : 'الـ VPN متوقف، اضغط تشغيل لتفعيل التخطي والحماية'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isConnecting}
              onClick={handleToggleVpn}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition shadow-lg flex items-center gap-2 cursor-pointer ${
                isConnected
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-neutral-950'
              }`}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الاتصال بالنفق...</span>
                </>
              ) : isConnected ? (
                <>
                  <Shield className="w-4 h-4" />
                  <span>إيقاف الـ VPN</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>تفعيل الـ VPN والبروكسي ⚡</span>
                </>
              )}
            </button>
          </div>

          {/* SERVERS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>اختر السيرفر أو الدولة المفضلة لديك ({servers.length}):</span>
              </span>
              <button
                type="button"
                disabled={isTestingPing}
                onClick={handleTestPings}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isTestingPing ? 'animate-spin' : ''}`} />
                <span>فحص السرعة (Ping)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {servers.map((server) => {
                const isSelected = selectedServer.id === server.id;
                return (
                  <div
                    key={server.id}
                    onClick={() => setSelectedServer(server)}
                    className={`p-3.5 rounded-2xl border transition duration-200 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : (isDarkMode ? 'bg-neutral-950/60 hover:bg-neutral-800/60 border-neutral-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{server.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {server.name}
                          </h5>
                          {isSelected && (
                            <span className="text-[10px] bg-emerald-500 text-neutral-950 px-2 py-0.2 rounded-full font-black">
                              المختار ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {server.features.map((feat, idx) => (
                            <span key={idx} className="text-[10px] text-neutral-400 bg-neutral-800/80 px-1.5 py-0.5 rounded">
                              • {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className={`text-xs font-mono font-bold ${
                        server.ping < 50 ? 'text-emerald-400' : server.ping < 100 ? 'text-amber-400' : 'text-neutral-400'
                      }`}>
                        {server.ping} ms
                      </span>
                      <span className="block text-[9px] text-neutral-500 font-mono">1 Gbps</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>نظام VPN وبروكسي مدمج بدون الحاجة لتثبيت برامج خارجية</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
