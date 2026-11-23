import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Check, 
  X, 
  Share, 
  Sparkles, 
  Copy, 
  CheckCheck, 
  FolderDown, 
  FileCode2, 
  Monitor, 
  Apple, 
  Terminal,
  GraduationCap,
  Layers,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import logoImage from '../assets/images/sehr_altahmeel_logo_1789643095435.jpg';

export const InstallPwaModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'tablet' | 'android' | 'ios' | 'desktop' | 'files' | 'store_kit'>('tablet');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed app)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect device type to set default active tab
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/sm-t|gt-p|tablet|android.*nexus 7|android.*nexus 10/.test(userAgent) || (/android/.test(userAgent) && window.innerWidth >= 600)) {
      setActiveTab('tablet');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setActiveTab('ios');
    } else if (/android/.test(userAgent)) {
      setActiveTab('tablet');
    } else {
      setActiveTab('tablet');
    }

    // Listen for Chrome/Edge/Android native PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    const handleOpenModal = () => {
      setIsOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('open-pwa-install', handleOpenModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleOpenModal);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsOpen(false);
        }
      } catch (err) {
        console.error('PWA install error:', err);
        setIsOpen(true);
      }
      setDeferredPrompt(null);
    } else {
      setIsOpen(true);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href.split('?')[0];
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <>
      {/* Comprehensive Install Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-xl bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 text-white shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl -z-10" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/60 hover:bg-neutral-800 transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Header Card */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative shrink-0">
                <img 
                  src={logoImage || "/logo.png"} 
                  alt="سحر التحميل" 
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                  className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-amber-400/80 p-0.5 bg-neutral-950" 
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-neutral-900 shadow">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <span>تثبيت تطبيق سحر التحميل</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-amber-300/90 font-bold mt-0.5">
                  يعمل ويتثبت 100% على تابلت المدرسة (داخل المنظومة) وجميع الأجهزة!
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                  <span className="text-amber-400 font-bold">تابلت الوزارة</span> • <span>أندرويد</span> • <span>آيفون / آيباد</span> • <span>الكمبيوتر</span>
                </div>
              </div>
            </div>

            {/* Direct Browser Prompt (if ready) */}
            {deferredPrompt && (
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-red-950/60 to-amber-950/40 border border-amber-500/40">
                <p className="text-xs text-neutral-200 mb-2.5 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>متصفحك يدعم التثبيت المباشر الفوري بضغطة زر واحدة:</span>
                </p>
                <button
                  type="button"
                  id="direct-install-modal-btn"
                  onClick={handleNativeInstall}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-98 transition cursor-pointer"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>تثبيت التطبيق على جهازك الآن 📥</span>
                </button>
              </div>
            )}

            {/* Device Selector Tabs */}
            <div className="flex rounded-xl bg-neutral-950 p-1 mb-4 border border-neutral-800 flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('tablet')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'tablet' ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md' : 'text-amber-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>تابلت المدرسة (داخل المنظومة) 🎓</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'android' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>أندرويد</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ios' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>آيفون / آيباد</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'desktop' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>الكمبيوتر</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('files')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'files' ? 'bg-amber-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FolderDown className="w-3.5 h-3.5" />
                <span>ملفات التثبيت</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('store_kit')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'store_kit' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-cyan-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>حزمة المتاجر (سامسونج & شاومي) 📦</span>
              </button>
            </div>

            {/* Step-by-Step Instructions & Download Content */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs space-y-3.5">
              
              {/* School Tablet Guide */}
              {activeTab === 'tablet' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 leading-relaxed font-medium flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white mb-0.5">لماذا ينجح التثبيت والعمل داخل منظومة تابلت الثانوية والوزارة؟</strong>
                      التطبيق مبني بتقنية <span className="text-amber-300 font-bold">PWA المستقلة</span>؛ فهو لا يحتاج لمتجر Google Play المغلق، ولا يتطلب كسر حماية Knox، ولا يخرج التابلت من المنظومة، ويعمل كتطبيق كامل وسريع بدون شريط المتصفح!
                    </div>
                  </div>

                  <div className="font-bold text-white flex items-center gap-2 pt-1">
                    <BookOpen className="w-4 h-4 text-red-500" />
                    <span>طريقة التثبيت على تابلت المدرسة (اختر متصفحك):</span>
                  </div>

                  <div className="space-y-3">
                    {/* Method 1: Google Chrome */}
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="font-bold text-amber-300 mb-1.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">١</span>
                        <span>إذا كنت تستخدم متصفح Google Chrome:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-neutral-300 leading-relaxed mr-1">
                        <li>افتح هذا الرابط داخل متصفح <strong>Google Chrome</strong> على التابلت.</li>
                        <li>اضغط على زر القائمة (الثلاث نقاط <strong>⋮</strong>) بأعلى يمين أو يسار المتصفح.</li>
                        <li>اضغط على <strong>«تثبيت التطبيق» (Install App)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                        <li>اضغط على <strong>«تثبيت»</strong> وستظهر أيقونة التطبيق فوراً على شاشة التابلت بين تطبيقاتك.</li>
                      </ol>
                    </div>

                    {/* Method 2: Samsung Internet */}
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="font-bold text-amber-300 mb-1.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">٢</span>
                        <span>إذا كنت تستخدم متصفح سامسونج إنترنت (Samsung Internet):</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-neutral-300 leading-relaxed mr-1">
                        <li>اضغط على زر القائمة (<strong>☰</strong> الثلاث شرط) في أسفل أو جانب الشاشة.</li>
                        <li>اختر <strong>«إضافة الصفحة إلى» (Add page to)</strong>.</li>
                        <li>اختر <strong>«الشاشة الرئيسية» (Home screen)</strong> ثم اضغط <strong>«إضافة»</strong>.</li>
                      </ol>
                    </div>

                    {/* Pro Tip */}
                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span><strong>ميزة المذاكرة:</strong> يمكنك تشغيل التطبيق في وضع الشاشة المنقسمة (Split View) لمشاهدة وتنزيل الشروحات أثناء فتح الكتب والمذكرات!</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'android' && (
                <>
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>طريقة التثبيت على هواتف الأندرويد (Chrome / سامسونج):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed">
                    <li>تأكد من فتح الرابط داخل متصفح <strong>Google Chrome</strong>.</li>
                    <li>اضغط على زر القائمة (الثلاث نقاط <strong>⋮</strong>) بأعلى أو أسفل الشاشة.</li>
                    <li>اختر <strong>«تثبيت التطبيق» (Install App)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                    <li>اضغط على <strong>«تثبيت»</strong> وستظهر أيقونة التطبيق على شاشة هاتفك فوراً وتعمل كتطبيق مستقل.</li>
                  </ol>
                </>
              )}

              {activeTab === 'ios' && (
                <>
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <Apple className="w-4 h-4" />
                    <span>طريقة التثبيت على أجهزة iPhone و iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed">
                    <li>تأكد من فتح الرابط في متصفح <strong>Safari</strong> الأساسي.</li>
                    <li>اضغط على زر المشاركة بالأسفل <Share className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> (المربع الذي يخرج منه سهم).</li>
                    <li>مرر للأسفل واختر <strong>«إضافة إلى الصفحة الرئيسية» (Add to Home Screen)</strong>.</li>
                    <li>اضغط على <strong>«إضافة» (Add)</strong> بالأعلى لتجد التطبيق مثبتاً بين تطبيقاتك.</li>
                  </ol>
                </>
              )}

              {activeTab === 'desktop' && (
                <>
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <Laptop className="w-4 h-4" />
                    <span>التثبيت عبر المتصفح على الكمبيوتر (Windows / Mac):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed">
                    <li>في شريط العنوان بمتصفح Chrome أو Edge، اضغط على أيقونة التثبيت <Download className="w-3.5 h-3.5 inline mx-1 text-amber-400" /> بجانب النجمة.</li>
                    <li>أو اضغط على قائمة المتصفح (الثلاث نقاط ⋮) ثم اختر <strong>«تثبيت سحر التحميل» (Install)</strong>.</li>
                    <li>أو يمكنك تحميل ملف التثبيت المباشر بالأسفل لإنشاء اختصار لسطح المكتب بضغطة زر.</li>
                  </ol>
                  <div className="pt-2">
                    <a
                      href="/api/app-download/windows-bat"
                      download="YoutubeSpell-Setup.bat"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>تحميل مثبت الويندوز لسطح المكتب (.bat)</span>
                    </a>
                  </div>
                </>
              )}

              {activeTab === 'files' && (
                <div className="space-y-3">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <FolderDown className="w-4 h-4" />
                    <span>تحميل ملفات تثبيت وتشغيل التطبيق مباشرة (App Installers):</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    اختر ملف التثبيت المتوافق مع نظام تشغيل جهازك لتثبيته وتشغيله كنافذة تطبيق مستقلة:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Windows Setup .bat */}
                    <a
                      href="/api/app-download/windows-bat"
                      download="YoutubeSpell-Setup.bat"
                      className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-800/80 transition flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-[11px]">ويندوز (Setup .bat)</p>
                          <p className="text-[10px] text-neutral-400">مثبت واختصار لسطح المكتب</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition" />
                    </a>

                    {/* Windows URL Shortcut */}
                    <a
                      href="/api/app-download/windows-url"
                      download="سحر-التحميل.url"
                      className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-800/80 transition flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                          <FileCode2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-[11px]">ويندوز (اختصار .url)</p>
                          <p className="text-[10px] text-neutral-400">فتح مباشر بشعار التطبيق</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition" />
                    </a>

                    {/* Mac Command Launcher */}
                    <a
                      href="/api/app-download/mac-command"
                      download="YoutubeSpell-Mac.command"
                      className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-800/80 transition flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
                          <Apple className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-[11px]">أجهزة Mac (.command)</p>
                          <p className="text-[10px] text-neutral-400">مشغل لتطبيق ماك المستقل</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition" />
                    </a>

                    {/* Linux Desktop File */}
                    <a
                      href="/api/app-download/linux-desktop"
                      download="YoutubeSpell.desktop"
                      className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-800/80 transition flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-[11px]">لينكس (.desktop)</p>
                          <p className="text-[10px] text-neutral-400">مشغل تطبيقات Linux</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition" />
                    </a>
                  </div>
                </div>
              )}

              {/* Store Kit for Samsung Galaxy Store & Xiaomi GetApps */}
              {activeTab === 'store_kit' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 text-blue-200">
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>حزمة النشر الرسمية لمتجر سامسونج (Galaxy Store) ومتجر شاومي (GetApps)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-blue-200/90">
                      هنا تجد كافة الملفات والأيقونات والوصف وسياسة الخصوصية المطلوبة لرفع وتوثيق تطبيق <strong>«سحر التحميل»</strong> على حسابات المطورين في سامسونج وشاومي.
                    </p>
                  </div>

                  {/* Quick One-Click APK Generator via PWABuilder */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>توليد ملف APK / AAB للأندرويد جاهز للرفع:</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">مجاني وموقع</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      للحصول على ملف APK موقع وجاهز للمتاجر في ثوانٍ:
                    </p>
                    <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-amber-300 select-all break-all">
                      {window.location.href.split('?')[0]}
                    </div>
                    <a
                      href="https://www.pwabuilder.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs transition cursor-pointer shadow"
                    >
                      <Zap className="w-4 h-4" />
                      <span>فتح أداة PWABuilder وتحميل حزمة APK / AAB 🚀</span>
                    </a>
                  </div>

                  {/* Download Store Assets Grid */}
                  <div>
                    <p className="font-bold text-white text-xs mb-2">تحميل ملفات وأصول النشر (Store Assets):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* High-res Icon */}
                      <a
                        href="/logo.png"
                        download="app-icon-512x512.png"
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-800 transition flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <img src="/logo.png" alt="Icon" className="w-6 h-6 rounded-full object-cover border border-amber-400/50" />
                          <div className="text-right">
                            <p className="font-bold text-white text-[11px]">أيقونة التطبيق (512×512 HD)</p>
                            <p className="text-[10px] text-neutral-400">PNG عالي الدقة للمتجر</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition" />
                      </a>

                      {/* Promo Banner Graphic */}
                      <a
                        href="/store-banner.jpg"
                        download="store-feature-banner-1024x500.jpg"
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-800 transition flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-rose-600/20 text-rose-400 font-bold text-[10px]">16:9</div>
                          <div className="text-right">
                            <p className="font-bold text-white text-[11px]">بانر المتجر الترويجي (1024×500)</p>
                            <p className="text-[10px] text-neutral-400">Feature Graphic جذاب</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition" />
                      </a>

                      {/* Store Description TXT */}
                      <a
                        href="/api/app-download/store-listing-ar.txt"
                        download="بيانات-رفع-تطبيق-سحر-التحميل.txt"
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-800 transition flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-amber-600/20 text-amber-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-[11px]">الوصف والكلمات المفتاحية (.txt)</p>
                            <p className="text-[10px] text-neutral-400">بيانات المتجر بالعربي جاهزة</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition" />
                      </a>

                      {/* Android Manifest */}
                      <a
                        href="/api/app-download/android-manifest.xml"
                        download="AndroidManifest.xml"
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-800 transition flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400">
                            <FileCode2 className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-[11px]">ملف AndroidManifest.xml</p>
                            <p className="text-[10px] text-neutral-400">إعدادات الحزمة والأذونات</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition" />
                      </a>
                    </div>
                  </div>

                  {/* Privacy Policy & Dev Portals Links */}
                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-200 text-xs">رابط سياسة الخصوصية الإلزامي للمتاجر:</span>
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline text-[11px] font-bold"
                      >
                        معاينة الصفحة ↗
                      </a>
                    </div>
                    <div className="p-2 rounded bg-neutral-950 font-mono text-[11px] text-neutral-300 select-all break-all">
                      {window.location.origin}/privacy-policy
                    </div>

                    <div className="pt-2 border-t border-neutral-800 grid grid-cols-2 gap-2 text-center">
                      <a
                        href="https://seller.samsungapps.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[11px] transition"
                      >
                        بوابة سامسونج (Galaxy Store) ↗
                      </a>
                      <a
                        href="https://global.developer.mi.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[11px] transition"
                      >
                        بوابة شاومي (Xiaomi GetApps) ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* In-app Browser Notice & Quick Copy Link */}
            <div className="mt-4 p-3.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-300">
                <p className="font-bold text-neutral-100">إذا فتحت الموقع من داخل واتساب أو تليجرام:</p>
                <p className="text-neutral-400 mt-0.5">انسخ الرابط وافتحه في متصفح Chrome أو سامسونج إنترنت ليتم تثبيته كتطبيق مستقل.</p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>

            {/* Features summary bar */}
            <div className="mt-4 pt-3 border-t border-neutral-800 grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-400">
              <div className="p-2 rounded-xl bg-neutral-950/50">
                <span className="block font-bold text-neutral-200">🎓 داخل المنظومة</span>
                <span>يعمل بدون مشاكل</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950/50">
                <span className="block font-bold text-neutral-200">📱 أيقونة تطبيق</span>
                <span>على شاشة التابلت</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950/50">
                <span className="block font-bold text-neutral-200">⚡ تحميل فوري</span>
                <span>سريع وخفيف جداً</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
