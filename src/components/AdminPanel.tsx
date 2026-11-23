import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Sliders,
  Type,
  Image as ImageIcon,
  Server,
  DollarSign,
  Lock,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  Eye,
  LogOut,
  Upload,
  Sparkles,
  ExternalLink,
  Activity,
  Layers,
  Wand2,
  FolderSync,
  Smartphone
} from 'lucide-react';
import { SiteConfig, ProxyTestResult } from '../types';
import { DeviceVaultPanel } from './DeviceVaultPanel';

interface AdminPanelProps {
  onClose: () => void;
  onConfigUpdated?: (newConfig: Partial<SiteConfig>) => void;
}

const ADMIN_TOKEN_KEY = 'youtube_spell_admin_token';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onConfigUpdated }) => {
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'vault' | 'proxies' | 'ads' | 'security'>('general');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Proxy tester state
  const [proxyResults, setProxyResults] = useState<ProxyTestResult[]>([]);
  const [isTestingProxies, setIsTestingProxies] = useState(false);
  const [newInvidiousUrl, setNewInvidiousUrl] = useState('');
  const [newPipedUrl, setNewPipedUrl] = useState('');

  // Security pin change state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Fetch full config when authenticated
  const fetchAdminConfig = async (authToken: string) => {
    setIsLoadingConfig(true);
    try {
      const res = await fetch('/api/admin/config', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      } else if (res.status === 401) {
        setToken('');
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
    } catch (err) {
      console.error('Failed to load admin config:', err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminConfig(token);
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        setToken(data.token);
        try {
          localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        } catch {}
      } else {
        setLoginError(data.error || 'رمز الدخول غير صحيح!');
      }
    } catch (err) {
      setLoginError('تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken('');
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {}
  };

  // Save changes
  const handleSave = async () => {
    if (!config || !token) return;

    setIsSaving(true);
    setSaveMessage(null);

    // Save immediately to local storage as fallback
    try {
      localStorage.setItem('youtube_spell_saved_config_v1', JSON.stringify(config));
      if (config.customLogoDataUrl) {
        localStorage.setItem('youtube_spell_custom_logo_data', config.customLogoDataUrl);
      }
      if (config.customAuthorDataUrl) {
        localStorage.setItem('youtube_spell_custom_author_data', config.customAuthorDataUrl);
      }
      window.dispatchEvent(new CustomEvent('site-config-updated', { detail: config }));
    } catch {}

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveMessage({ text: 'تم حفظ وتثبيت كافة التعديلات بنجاح ودائماً!', type: 'success' });
        if (onConfigUpdated) {
          onConfigUpdated(config);
        }
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage({ text: data.error || 'فشل حفظ الإعدادات على الخادم', type: 'error' });
      }
    } catch (err) {
      setSaveMessage({ text: 'تم الحفظ محلياً في جهازك بنجاح!', type: 'success' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Image File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'author') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 12 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsSaving(true);

      // Instantly persist in localStorage and update UI without waiting
      try {
        if (type === 'logo') {
          localStorage.setItem('youtube_spell_custom_logo_data', base64);
        } else {
          localStorage.setItem('youtube_spell_custom_author_data', base64);
        }
        
        setConfig((prev) => {
          if (!prev) return null;
          const updated = {
            ...prev,
            [type === 'logo' ? 'logoUrl' : 'authorImageUrl']: base64,
            [type === 'logo' ? 'customLogoDataUrl' : 'customAuthorDataUrl']: base64,
          };
          try {
            localStorage.setItem('youtube_spell_saved_config_v1', JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('site-config-updated', { detail: updated }));
          } catch {}
          return updated;
        });

        if (onConfigUpdated) {
          onConfigUpdated({
            [type === 'logo' ? 'logoUrl' : 'authorImageUrl']: base64,
            [type === 'logo' ? 'customLogoDataUrl' : 'customAuthorDataUrl']: base64,
          });
        }
      } catch {}

      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageBase64: base64, type }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSaveMessage({ text: data.message || 'تم حفظ وتثبيت الصورة بنجاح!', type: 'success' });
        } else {
          setSaveMessage({ text: data.error || 'تم حفظ الصورة محلياً بنجاح!', type: 'success' });
        }
      } catch (err) {
        setSaveMessage({ text: 'تم حفظ الصورة على جهازك بنجاح!', type: 'success' });
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Test Proxies
  const handleTestProxies = async () => {
    if (!config || !token) return;

    setIsTestingProxies(true);
    setProxyResults([]);

    try {
      const res = await fetch('/api/admin/test-proxies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instances: config.invidiousInstances,
          type: 'invidious',
        }),
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.results)) {
        setProxyResults(data.results);
      }
    } catch (err) {
      console.error('Failed to test proxies:', err);
    } finally {
      setIsTestingProxies(false);
    }
  };

  // Auto sort proxies by latency
  const handleSortProxiesBySpeed = () => {
    if (!config || proxyResults.length === 0) return;

    const working = proxyResults.filter((p) => p.status === 'online' || p.status === 'slow');
    working.sort((a, b) => a.latencyMs - b.latencyMs);

    const sortedUrls = [
      ...working.map((w) => w.url),
      ...config.invidiousInstances.filter((u) => !working.some((w) => w.url === u)),
    ];

    setConfig({
      ...config,
      invidiousInstances: sortedUrls,
    });

    setSaveMessage({ text: 'تمت إعادة ترتيب الخوادم حسب الأسرع بنجاح! لا تنسَ الضغط على "حفظ التعديلات".', type: 'success' });
  };

  // Reset to default config
  const handleResetDefaults = async () => {
    if (!confirm('هل أنت متأكد من استعادة كافة الإعدادات والبروكسيات الافتراضية؟')) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/reset-config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setSaveMessage({ text: 'تمت استعادة الإعدادات الافتراضية بنجاح!', type: 'success' });
        if (onConfigUpdated) onConfigUpdated(data.config);
      }
    } catch (err) {
      setSaveMessage({ text: 'فشلت الاستعادة', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      alert('الرمز السري يجب أن يكون 4 أرقام على الأقل');
      return;
    }
    if (newPin !== confirmPin) {
      alert('الرمزان غير متطابقين!');
      return;
    }

    if (!config) return;

    const updatedConfig = {
      ...config,
      adminPin: newPin,
    };

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });

      if (res.ok) {
        setSaveMessage({ text: `تم تغيير رمز الدخول السري بنجاح إلى: ${newPin}`, type: 'success' });
        setNewPin('');
        setConfirmPin('');
      }
    } catch (err) {
      setSaveMessage({ text: 'فشل تغيير الرمز', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Export Config JSON
  const handleExportJson = () => {
    if (!config) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `youtube_spell_config_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // If not logged in, show Secret PIN Login Screen
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-neutral-100 font-sans" dir="rtl">
        <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-6 relative">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 shadow-lg shadow-amber-500/20 mb-3 text-neutral-950">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">لوحة الإدارة السرية</h2>
            <p className="text-xs text-neutral-400 mt-1">خاصة بالمطور حسام أحمد مساعد لإدارة وضبط الموقع</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 relative">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>أدخل رمز الدخول السري (PIN):</span>
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="الرمز الافتراضي: 2027"
                autoFocus
                className="w-full px-4 py-3 bg-neutral-950/80 border border-neutral-700 rounded-xl text-center text-xl tracking-widest font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-neutral-950 font-black rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول والإدارة</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              العودة إلى الموقع الرئيسي
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If loading config
  if (isLoadingConfig || !config) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white font-sans" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-bold text-neutral-300">جاري تحميل إعدادات الموقع ولوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 text-neutral-100 font-sans overflow-hidden" dir="rtl">
      {/* Top Bar */}
      <header className="w-full bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-400 flex items-center justify-center text-neutral-950 font-black shadow-md">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>لوحة التحكم وإدارة الموقع</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                حسام أحمد مساعد
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400">تعديل فوري للصور، النصوص، البروكسيات، والإعلانات</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg hover:shadow-emerald-600/30 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ وتطبيق التعديلات</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition cursor-pointer"
          >
            إغلاق وعرض الموقع
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveMessage && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 transition-all duration-300 border ${
            saveMessage.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500'
              : 'bg-red-950/95 text-red-200 border-red-500'
          }`}
        >
          {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-neutral-900/60 border-b md:border-b-0 md:border-l border-neutral-800 p-3 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'general'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
            }`}
          >
            <Type className="w-4 h-4 shrink-0" />
            <span>النصوص والشاشة الرئيسية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>الصور والشعار والأيقونات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <FolderSync className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-extrabold">مزامنة وسائط البيت (Bridge)</span>
            <span className="mr-auto px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[9px] text-emerald-400 font-bold border border-emerald-500/30">
              جديد
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proxies')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'proxies'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" />
            <span>البروكسيات وخوادم التحميل</span>
            <span className="mr-auto px-1.5 py-0.2 rounded bg-neutral-800 text-[10px] text-amber-400 font-mono">
              {config.invidiousInstances.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ads'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>الإعلانات والأرباح (PopCash)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>الأمان والنسخ الاحتياطي والصيانة</span>
          </button>
        </aside>

        {/* Tab Content Container */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
          
          {/* ============================================================ */}
          {/* TAB 1: General & Texts */}
          {/* ============================================================ */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>عناوين الصفحة الرئيسية</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    العنوان الرئيسي للموقع (Header H1):
                  </label>
                  <input
                    type="text"
                    value={config.siteTitle}
                    onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">يظهر بأعلى الصفحة الرئيسية وفي نتائج محركات البحث.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    الوصف الفرعي تحت الشعار (Subtitle):
                  </label>
                  <textarea
                    rows={3}
                    value={config.siteSubtitle}
                    onChange={(e) => setConfig({ ...config, siteSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-medium text-neutral-200 focus:border-amber-400 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">اسم المطور والمالك:</label>
                    <input
                      type="text"
                      value={config.authorName}
                      onChange={(e) => setConfig({ ...config, authorName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">اختصار الشعار (Badge Code):</label>
                    <input
                      type="text"
                      value={config.authorBadge}
                      onChange={(e) => setConfig({ ...config, authorBadge: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-bold text-white focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>شريط الإعلان العاجل (Top Announcement Bar)</span>
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.banner?.enabled || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner: { ...config.banner, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {config.banner?.enabled && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">نص الإعلان أو التنبيه:</label>
                      <input
                        type="text"
                        value={config.banner.text}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            banner: { ...config.banner, text: e.target.value },
                          })
                        }
                        placeholder="مثال: تم تحديث خوادم التحميل بأعلى سرعة وجودة..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1">نوع الشريط:</label>
                        <select
                          value={config.banner.type}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              banner: { ...config.banner, type: e.target.value as any },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                        >
                          <option value="info">أزرق / معلومة (Info)</option>
                          <option value="success">أخضر / نجاح وتحديث (Success)</option>
                          <option value="warning">أصفر / تنبيه (Warning)</option>
                          <option value="promo">بنفسجي / عروض وترويج (Promo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1">رابط اختياري عند الضغط:</label>
                        <input
                          type="text"
                          value={config.banner.link || ''}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              banner: { ...config.banner, link: e.target.value },
                            })
                          }
                          placeholder="https://..."
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Badges */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>شارات المميزات أعلى الصفحة (Feature Badges)</span>
                </h3>

                <div className="space-y-3">
                  {config.badges?.map((badge, idx) => (
                    <div key={badge.id || idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <input
                        type="checkbox"
                        checked={badge.enabled}
                        onChange={(e) => {
                          const updated = [...config.badges];
                          updated[idx] = { ...updated[idx], enabled: e.target.checked };
                          setConfig({ ...config, badges: updated });
                        }}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={badge.text}
                        onChange={(e) => {
                          const updated = [...config.badges];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setConfig({ ...config, badges: updated });
                        }}
                        className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: Appearance & Images */}
          {/* ============================================================ */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Logo */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>لوجو وشعار الموقع الرسمي</span>
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Logo Preview */}
                  <div className="relative group">
                    <div className="w-36 h-36 rounded-full overflow-hidden bg-neutral-950 border-2 border-amber-500/40 p-1 shadow-xl">
                      <img
                        src={config.logoUrl || '/logo.png'}
                        alt="Logo Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-3 text-center sm:text-right">
                    <p className="text-xs text-neutral-300 font-bold">رفع وتغيير صورة اللوجو:</p>
                    <p className="text-[11px] text-neutral-400">
                      يمكنك رفع صورة من هاتفك أو حاسوبك (PNG, JPG, WebP) لتظهر في الصفحة الرئيسية، والفوتر، والأيقونة.
                    </p>

                    <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 font-black rounded-xl text-xs cursor-pointer shadow-md transition">
                        <Upload className="w-4 h-4" />
                        <span>اختيار صورة من الجهاز</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setConfig({ ...config, logoUrl: '/logo.png' });
                          setSaveMessage({ text: 'تمت إعادة تعيين الشعار للأصلي. اضغط حفظ لتأكيد ذلك.', type: 'success' });
                        }}
                        className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        استعادة الشعار الأصلي
                      </button>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">أو أدخل رابط صورة مباشر (URL):</label>
                      <input
                        type="text"
                        value={config.logoUrl}
                        onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-200 font-mono focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Author Picture */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>صورة المطور (حسام أحمد مساعد)</span>
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Author Preview */}
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-950 border-2 border-amber-500/40 p-0.5 shadow-xl shrink-0">
                    <img
                      src={config.authorImageUrl || '/author.jpg'}
                      alt="Author Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/author.jpg';
                      }}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-right">
                    <p className="text-xs text-neutral-300 font-bold">تغيير الصورة الشخصية للمطور:</p>
                    <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs cursor-pointer border border-neutral-700 transition">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>رفع صورة المطور</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'author')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: Multi-Device Bridge & Media Vault */}
          {/* ============================================================ */}
          {activeTab === 'vault' && (
            <div className="animate-fade-in">
              <DeviceVaultPanel token={token} />
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: Proxies & Download Engines */}
          {/* ============================================================ */}
          {activeTab === 'proxies' && (
            <div className="space-y-6 animate-fade-in">
              {/* Proxy Tester & Auto-Optimizer Bar */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>فحص واختبار سرعة خوادم البروكسي (Ping & Latency)</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      افحص سرعة استجابة كافة الخوادم في ثوانٍ ورتّبها تلقائياً للأسرع لضمان أقصى سرعة تنزيل.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestProxies}
                      disabled={isTestingProxies}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Activity className={`w-4 h-4 ${isTestingProxies ? 'animate-spin' : ''}`} />
                      <span>{isTestingProxies ? 'جاري الفحص المباشر...' : 'بدء فحص البروكسيات'}</span>
                    </button>

                    {proxyResults.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSortProxiesBySpeed}
                        className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>ترتيب حسب الأسرع</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Proxy Results Preview */}
                {proxyResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                    {proxyResults.map((res, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                          res.status === 'online'
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                            : res.status === 'slow'
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                            : 'bg-red-950/30 border-red-500/40 text-red-300'
                        }`}
                      >
                        <span className="truncate max-w-[180px]">{res.url.replace(/^https?:\/\//, '')}</span>
                        <span className="font-bold shrink-0">
                          {res.status === 'offline' ? 'غير متوفر' : `${res.latencyMs}ms`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invidious Proxies List */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-400" />
                    <span>خوادم Invidious المعتمدة ({config.invidiousInstances?.length || 0})</span>
                  </h3>
                </div>

                {/* Add new proxy */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newInvidiousUrl}
                    onChange={(e) => setNewInvidiousUrl(e.target.value)}
                    placeholder="https://invidious.example.com"
                    className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newInvidiousUrl.trim()) return;
                      const clean = newInvidiousUrl.trim().replace(/\/$/, '');
                      if (!config.invidiousInstances.includes(clean)) {
                        setConfig({
                          ...config,
                          invidiousInstances: [clean, ...config.invidiousInstances],
                        });
                        setNewInvidiousUrl('');
                        setSaveMessage({ text: 'تمت إضافة البروكسي للقائمة. اضغط حفظ لتثبيته.', type: 'success' });
                      }
                    }}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>إضافة بروكسي</span>
                  </button>
                </div>

                {/* List */}
                <div className="space-y-2">
                  {config.invidiousInstances?.map((instance, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-2.5 flex-1 overflow-hidden font-mono text-xs text-neutral-200">
                        <span className="w-5 text-center text-neutral-500 font-bold">{idx + 1}</span>
                        <span className="truncate">{instance}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.invidiousInstances.filter((_, i) => i !== idx);
                          setConfig({ ...config, invidiousInstances: updated });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        title="حذف البروكسي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Piped Proxies List */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span>خوادم Piped المساعدة ({config.pipedInstances?.length || 0})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPipedUrl}
                    onChange={(e) => setNewPipedUrl(e.target.value)}
                    placeholder="https://pipedapi.example.com"
                    className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPipedUrl.trim()) return;
                      const clean = newPipedUrl.trim().replace(/\/$/, '');
                      if (!config.pipedInstances.includes(clean)) {
                        setConfig({
                          ...config,
                          pipedInstances: [clean, ...config.pipedInstances],
                        });
                        setNewPipedUrl('');
                        setSaveMessage({ text: 'تمت إضافة خادم Piped للقائمة.', type: 'success' });
                      }
                    }}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-cyan-400" />
                    <span>إضافة</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {config.pipedInstances?.map((instance, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-2.5 flex-1 overflow-hidden font-mono text-xs text-neutral-200">
                        <span className="w-5 text-center text-neutral-500 font-bold">{idx + 1}</span>
                        <span className="truncate">{instance}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.pipedInstances.filter((_, i) => i !== idx);
                          setConfig({ ...config, pipedInstances: updated });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: Ads & Monetization */}
          {/* ============================================================ */}
          {activeTab === 'ads' && (
            <div className="space-y-6 animate-fade-in">
              {/* Overview of Connected Ad Networks */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>مواقع وشبكات الإعلانات المربوطة بالموقع حالياً</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    الرابط المباشر عند التحميل (Direct Link)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Network 1: Direct Link */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-amber-400">1. إعلان زر التحميل المباشر (Direct Link)</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        Boolean(config.directAdEnabled) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {Boolean(config.directAdEnabled) ? 'مفعّل الآن' : 'متوقف'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      تم إيقاف فتح أي نوافذ إعلانية خارجية عند ضغط الزائر على زر تحميل الفيديو أو الصوت لبدء التنزيل المباشر فوراً.
                    </p>
                    <div className="pt-1 space-y-1 text-[11px] font-mono text-neutral-300 break-all">
                      <div>• الرابط المربوط: <span className="text-emerald-400 font-bold">{config.directAdUrl || 'لا يوجد رابط إعلاني'}</span></div>
                    </div>
                  </div>

                  {/* Network 2: Internal Banner */}
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-cyan-400">2. شريط الإعلانات الداخلي (Internal Banner)</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        config.banner?.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {config.banner?.enabled ? 'مفعّل' : 'غير مفعّل'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      شريط إعلاني وترويجي خاص بك أعلى الموقع (من تبويب الإعدادات العامة) لوضع روابطك أو قنواتك بدون أي شركات وسيطة.
                    </p>
                    <div className="pt-1 text-[11px] text-neutral-400">
                      • <strong className="text-neutral-200">ملاحظة:</strong> تم حذف كافة ملفات وأكواد شبكات الإعلانات القديمة بالكامل.
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Link Settings Control */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>إعدادات الرابط الإعلاني المباشر (Direct Ad Link)</span>
                  </h3>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(config.directAdEnabled)}
                      onChange={(e) => setConfig({ ...config, directAdEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">الرابط الإعلاني عند الضغط على زر التحميل:</label>
                  <input
                    type="text"
                    value={config.directAdUrl || ''}
                    onChange={(e) => setConfig({ ...config, directAdUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  يمكنك تفعيل أو إيقاف فتح الرابط الإعلاني عند الضغط على أزرار التحميل أو تحديث الرابط في أي وقت، ثم الضغط على حفظ التعديلات.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: Security, Backup & Maintenance */}
          {/* ============================================================ */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              {/* Maintenance Mode */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>وضع الصيانة المؤقت (Maintenance Mode)</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      عند التفعيل، سيرى الزوار شاشة صيانة أنيقة توضح أن الموقع قيد التحديث وسيعود قريباً.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.maintenanceMode}
                      onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                {config.maintenanceMode && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">رسالة الصيانة المعروضة للزوار:</label>
                    <textarea
                      rows={2}
                      value={config.maintenanceMessage}
                      onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-200 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Change Secret PIN */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>تغيير رمز PIN السري للوحة التحكم</span>
                </h3>

                <form onSubmit={handleChangePin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">الرمز الجديد:</label>
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="4 أرقام أو أكثر"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">تأكيد الرمز الجديد:</label>
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="أعد كتابة الرمز"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!newPin || !confirmPin || isSaving}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-xl text-xs transition disabled:opacity-40 cursor-pointer"
                    >
                      تغيير الرمز السري
                    </button>
                  </div>
                </form>
              </div>

              {/* Backup & Factory Reset */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>النسخ الاحتياطي واستعادة الضبط</span>
                </h3>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer border border-neutral-700"
                  >
                    <DownloadIcon className="w-4 h-4 text-amber-400" />
                    <span>تحميل نسخة احتياطية (Export Backup JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer mr-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>استعادة ضبط المصنع (Factory Reset)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
