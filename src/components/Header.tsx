import React, { useState } from 'react';
import { Zap, ShieldCheck, Wand2, Sun, Moon, GraduationCap, Sparkles, Star, Heart, Flame, ShieldAlert } from 'lucide-react';
import logoImage from '../assets/images/sehr_altahmeel_logo_1789643095435.jpg';
import hossamBadgeImage from '../assets/images/hossam_developer_badge_1789645934593.jpg';
import { SiteConfig } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  siteConfig?: SiteConfig | null;
  onOpenVpn?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme, siteConfig, onOpenVpn }) => {
  // Purge any stale legacy logo stored in browser localStorage
  React.useEffect(() => {
    try {
      localStorage.removeItem('youtube_spell_custom_logo_data');
      localStorage.removeItem('youtube_spell_saved_config_v1');
    } catch {}
  }, []);

  const [imgSrc, setImgSrc] = useState<string>(logoImage);
  const [isVpnEnabled, setIsVpnEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('youtube_spell_vpn_active_v1') !== 'false';
    } catch {
      return true;
    }
  });

  // Also listen for live site-config-updated event
  React.useEffect(() => {
    const handleSync = (e: any) => {
      const newLogo = e.detail?.customLogoDataUrl;
      if (newLogo && newLogo.startsWith('data:image')) {
        setImgSrc(newLogo);
      }
    };
    window.addEventListener('site-config-updated', handleSync);
    return () => window.removeEventListener('site-config-updated', handleSync);
  }, []);

  const handleOpenInstall = () => {
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
  };

  const handleVpnClick = () => {
    if (onOpenVpn) {
      onOpenVpn();
    } else {
      window.dispatchEvent(new CustomEvent('open-vpn-modal'));
    }
  };


  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="w-3.5 h-3.5" />;
      case 'shield': return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />;
      case 'star': return <Star className="w-3.5 h-3.5 text-amber-400" />;
      case 'heart': return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'flame': return <Flame className="w-3.5 h-3.5 text-red-500" />;
      case 'sparkles': return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
      default: return <Wand2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />;
    }
  };

  return (
    <header className="relative w-full text-center pt-5 pb-4 px-4">
      {/* Background ambient glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 ${isDarkMode ? 'bg-red-600/20' : 'bg-red-500/10'} blur-3xl rounded-full pointer-events-none -z-10`} />

      {/* Top Controls: Theme Switcher & Install & Author Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto mb-4 px-2 flex-wrap gap-2">
        {/* Author badge */}
        <div className="flex items-center gap-2">
          <div 
            title="تطوير وبرمجة: حسام أحمد مساعد"
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 dark:bg-neutral-900/80 light:bg-white border border-neutral-800 dark:border-neutral-800 shadow-sm cursor-default"
          >
            <img
              src={hossamBadgeImage}
              alt="حسام أحمد مساعد"
              className="w-5 h-5 rounded-full object-cover border border-cyan-400/60 bg-black"
            />
            <span className="text-[11px] font-bold text-neutral-300 dark:text-neutral-300">
              {siteConfig?.authorName || 'حسام أحمد مساعد'}
            </span>
          </div>
        </div>

        {/* Action buttons: VPN, Install App & Theme Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Internal VPN & Proxy Tunnel Button */}
          <button
            type="button"
            id="header-vpn-btn"
            onClick={handleVpnClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-md cursor-pointer border ${
              isVpnEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
            }`}
            title="الـ VPN والنفق المشفر لتخطي حظر المدارس"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isVpnEnabled ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
            <span>نظام VPN داخلي</span>
            <span className={`w-2 h-2 rounded-full ${isVpnEnabled ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
              isDarkMode 
                ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-neutral-700' 
                : 'bg-white hover:bg-slate-100 text-amber-600 border border-slate-300 shadow-md'
            }`}
            title="تبديل الوضع (الفاتح / الداكن)"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span>الوضع الفاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>الوضع الداكن</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Badges bar */}
      <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
        {siteConfig?.badges && siteConfig.badges.length > 0 ? (
          siteConfig.badges.filter(b => b.enabled).map((badge, idx) => (
            <span
              key={badge.id || idx}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${
                idx === 0
                  ? (isDarkMode ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-300')
                  : idx === 1
                  ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-300')
                  : (isDarkMode ? 'bg-neutral-900 text-neutral-300 border border-neutral-700/60' : 'bg-slate-100 text-slate-700 border border-slate-300')
              }`}
            >
              {getBadgeIcon(badge.icon)}
              <span>{badge.text}</span>
            </span>
          ))
        ) : (
          <>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' 
                : 'bg-amber-50 text-amber-700 border border-amber-300'
            }`}>
              <Wand2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              البحث الذكي & التحميل السريع
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isDarkMode 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
            }`}>
              <Zap className="w-3.5 h-3.5" />
              نتائج فورية وفائقة السرعة
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isDarkMode 
                ? 'bg-neutral-900 text-neutral-300 border border-neutral-700/60' 
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              بدون إعلانات
            </span>
          </>
        )}
      </div>

      {/* Logo & Main Title */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition duration-500 animate-pulse" />
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 shadow-2xl">
            <img
              src={imgSrc}
              alt="شعار سحر التحميل"
              onError={() => {
                if (imgSrc !== logoImage) {
                  setImgSrc(logoImage);
                } else if (imgSrc !== '/logo.png') {
                  setImgSrc('/logo.png');
                }
              }}
              className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover shadow-2xl bg-neutral-950 transform group-hover:scale-105 transition duration-300 border-2 border-amber-300/40"
            />
          </div>
        </div>

        {/* Big Majestic Title */}
        <h1 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-2 drop-shadow-sm text-center">
          <span>{siteConfig?.siteTitle || 'سحر التحميل - استخراج وتحميل الفيديوهات'}</span>
          <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-amber-400 animate-pulse shrink-0" />
        </h1>
      </div>

      {/* Subtitle */}
      <p className={`mt-2 text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed ${
        isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
      }`}>
        {siteConfig?.siteSubtitle || (
          <>
            <span className="font-bold text-amber-400">الصق الرابط .. وسيب السحر علينا!</span> ابحث عن أي فيديو، أنشودة، أو بودكاست بالكلام، أو الصق الرابط لتحميله مباشرة بجميع الجودات (<span className="text-amber-500 dark:text-amber-300 font-bold">1080p, 720p, MP3</span>).
          </>
        )}
      </p>
    </header>
  );
};

