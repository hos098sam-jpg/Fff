/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { IntroSplash } from './components/IntroSplash';
import { InstallPwaModal } from './components/InstallPwaModal';
import { Header } from './components/Header';
import { SpellInput } from './components/SpellInput';
import { VideoResult } from './components/VideoResult';
import { SearchResults } from './components/SearchResults';
import { VideoModal } from './components/VideoModal';
import { RecentSearches } from './components/RecentSearches';
import { FeaturesGuide } from './components/FeaturesGuide';
import { AdminPanel } from './components/AdminPanel';
import { VpnModal } from './components/VpnModal';
import { VideoData, SearchResultItem, ExtractionHistoryItem, SiteConfig } from './types';
import { AlertCircle, Wand2, ArrowRight, Search, Sparkles, Megaphone, ShieldAlert, KeyRound, ShieldCheck, GraduationCap } from 'lucide-react';
import logoImage from './assets/images/sehr_altahmeel_logo_1789643095435.jpg';
import hossamBadgeImage from './assets/images/hossam_developer_badge_1789645934593.jpg';

const STORAGE_KEY = 'youtube_spell_history_v1';
const THEME_KEY = 'youtube_spell_theme_v1';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      return savedTheme !== null ? savedTheme === 'dark' : true;
    } catch {
      return true;
    }
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(() => {
    try {
      const saved = localStorage.getItem('youtube_spell_saved_config_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isVpnOpen, setIsVpnOpen] = useState<boolean>(false);

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [loadingVideoId, setLoadingVideoId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [history, setHistory] = useState<ExtractionHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch Public Site Config on initial mount & listen to live updates
  useEffect(() => {
    const handleConfigSync = (e: any) => {
      if (e.detail) {
        setSiteConfig((prev) => (prev ? { ...prev, ...e.detail } : e.detail));
      }
    };
    window.addEventListener('site-config-updated', handleConfigSync);

    const loadSiteConfig = async () => {
      try {
        const res = await fetch('/api/site-config');
        if (res.ok) {
          const cfg = await res.json();
          setSiteConfig(cfg);
          try {
            localStorage.setItem('youtube_spell_saved_config_v1', JSON.stringify(cfg));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load public site config:', err);
      }
    };

    loadSiteConfig();

    return () => {
      window.removeEventListener('site-config-updated', handleConfigSync);
    };
  }, []);

  // Listen to #admin hash or ?admin query in URL & Keyboard Shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminTrigger = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const path = window.location.pathname;

      if (hash === '#admin' || hash === '#/admin' || search.includes('admin=1') || search.includes('admin=true') || path.endsWith('/admin')) {
        setIsAdminOpen(true);
      }
    };

    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);
    window.addEventListener('popstate', checkAdminTrigger);

    // Keyboard shortcut: Ctrl + Shift + A or Cmd + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'ش')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleVpnOpenEvent = () => setIsVpnOpen(true);
    window.addEventListener('open-vpn-modal', handleVpnOpenEvent);

    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('popstate', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-vpn-modal', handleVpnOpenEvent);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch {}
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  // Main Search or Direct Extract handler
  const handleSearchOrExtract = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setErrorMessage(null);

    const isUrl = trimmed.startsWith('http://') || 
                  trimmed.startsWith('https://') || 
                  trimmed.includes('youtube.com') || 
                  trimmed.includes('youtu.be') || 
                  /^[a-zA-Z0-9_-]{11}$/.test(trimmed);

    if (isUrl) {
      // Direct Extract
      await handleExtractSingle(trimmed);
    } else {
      // YouTube Search
      await handlePerformSearch(trimmed);
    }
  };

  // Perform search on YouTube
  const handlePerformSearch = async (queryText: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentQuery(queryText);
    setVideoData(null); // Clear single video view to show search grid

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryText)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل البحث');
      }

      if (data.isDirectUrl && data.videoId) {
        // Was recognized as direct video ID
        await handleExtractSingle(`https://www.youtube.com/watch?v=${data.videoId}`);
        return;
      }

      if (!data.results || data.results.length === 0) {
        setSearchResults([]);
        setErrorMessage(`لم يتم العثور على نتائج بحث تطابق "${queryText}". يرجى تجربة كلمات بحث أخرى.`);
      } else {
        setSearchResults(data.results);

        // Smooth scroll to results
        setTimeout(() => {
          window.scrollTo({ top: 320, behavior: 'smooth' });
        }, 100);
      }

    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage(err?.message || 'تعذر الاتصال بخوادم البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract Single Video
  const handleExtractSingle = async (urlOrId: string, videoIdToHighlight?: string) => {
    setIsLoading(true);
    setIsLoadingVideo(true);
    if (videoIdToHighlight) setLoadingVideoId(videoIdToHighlight);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlOrId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء فحص الرابط');
      }

      setVideoData(data);

      // Save to recent history
      setHistory((prev) => {
        const newItem: ExtractionHistoryItem = {
          id: data.id,
          title: data.title,
          thumbnail: data.thumbnail,
          author: data.author?.name || '',
          duration: data.durationFormatted || '',
          timestamp: Date.now(),
          url: data.videoUrl || urlOrId,
        };
        const filtered = prev.filter((item) => item.id !== data.id);
        return [newItem, ...filtered].slice(0, 10);
      });

      // Smooth scroll down to video result
      setTimeout(() => {
        const el = document.getElementById('video-result-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);

    } catch (err: any) {
      console.error('Extract error:', err);
      setErrorMessage(err?.message || 'تعذر استخراج بيانات الفيديو. يرجى التأكد من صحة الرابط.');
    } finally {
      setIsLoading(false);
      setIsLoadingVideo(false);
      setLoadingVideoId('');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Maintenance Mode Interceptor (if enabled in admin)
  if (siteConfig?.maintenanceMode && !isAdminOpen) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 text-center font-sans" dir="rtl">
        <div className="max-w-md w-full p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white">الموقع قيد الصيانة والتحديث</h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {siteConfig.maintenanceMessage || 'الموقع يخضع لأعمال صيانة وتحديثات دورية لتحسين سرعة التنزيل. سنعود خلال دقائق!'}
          </p>

          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>تسجيل دخول الإدارة</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col justify-between selection:bg-red-600 selection:text-white font-sans ${
      isDarkMode ? 'bg-[#0a0a0f] text-neutral-100' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Dynamic Announcement Banner */}
      {siteConfig?.banner?.enabled && (
        <div
          className={`w-full py-2 px-4 text-center text-xs font-bold transition flex items-center justify-center gap-2 ${
            siteConfig.banner.type === 'warning'
              ? 'bg-amber-500 text-neutral-950'
              : siteConfig.banner.type === 'success'
              ? 'bg-emerald-600 text-white'
              : siteConfig.banner.type === 'promo'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-neutral-900 text-amber-300 border-b border-neutral-800'
          }`}
        >
          <Megaphone className="w-4 h-4 shrink-0" />
          {siteConfig.banner.link ? (
            <a href={siteConfig.banner.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {siteConfig.banner.text}
            </a>
          ) : (
            <span>{siteConfig.banner.text}</span>
          )}
        </div>
      )}

      {/* Intro Welcome Splash with Golden Name & Stars */}
      <IntroSplash />

      {/* PWA Install Floating Prompt and Instructions Modal */}
      <InstallPwaModal />
      
      {/* Top ambient lights */}
      <div className={`fixed top-0 left-1/4 w-96 h-96 ${isDarkMode ? 'bg-red-600/10' : 'bg-red-500/5'} rounded-full blur-3xl pointer-events-none -z-10`} />
      <div className={`fixed top-1/3 right-1/4 w-96 h-96 ${isDarkMode ? 'bg-amber-600/10' : 'bg-amber-500/5'} rounded-full blur-3xl pointer-events-none -z-10`} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto pb-16">
        
        {/* Header with Logo, Theme Switcher & Fullscreen Option */}
        <Header 
          isDarkMode={isDarkMode} 
          onToggleTheme={toggleTheme} 
          siteConfig={siteConfig}
          onOpenVpn={() => setIsVpnOpen(true)}
        />

        {/* Input Bar with Voice & Suggestions */}
        <SpellInput onSearchOrExtract={handleSearchOrExtract} isLoading={isLoading} />

        {/* Loading Indicator */}
        {isLoading && !videoData && (
          <div className={`w-full max-w-md mx-auto mt-10 p-6 rounded-2xl text-center animate-pulse shadow-xl ${
            isDarkMode ? 'bg-neutral-900/60 border border-neutral-800' : 'bg-white border border-slate-200'
          }`}>
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-spin">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              جاري سحر التحميل وتجهيز الرابط فائق السرعة... ✨
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
              يتم استرداد أفضل النتائج وروابط التحميل المباشرة بسرعة فائقة
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="w-full max-w-xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-200 flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-bold text-red-300 mb-1">تنبيه</div>
                <div className="text-xs text-red-300/90 leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          </div>
        )}

        {/* If Single Video Result is Active */}
        {videoData && !isLoading && (
          <div className="mt-4">
            {/* Back to search results button if we have previous search results */}
            {searchResults.length > 0 && (
              <div className="max-w-5xl mx-auto px-4 mb-4">
                <button
                  type="button"
                  id="back-to-search-btn"
                  onClick={() => setVideoData(null)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition font-bold text-xs md:text-sm shadow-md cursor-pointer ${
                    isDarkMode 
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 border border-neutral-800' 
                      : 'bg-white hover:bg-slate-100 text-amber-600 hover:text-amber-700 border border-slate-300'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لنتائج بحث "{currentQuery}" ({searchResults.length} فيديو)</span>
                </button>
              </div>
            )}

            <VideoResult
              data={videoData}
              onOpenPreview={() => setIsPreviewOpen(true)}
            />
          </div>
        )}

        {/* If Search Results List is Available and No Single Video is Selected */}
        {!videoData && searchResults.length > 0 && (
          <SearchResults
            query={currentQuery}
            results={searchResults}
            onSelectVideo={(id, url) => handleExtractSingle(url || id, id)}
            isLoadingVideo={isLoadingVideo}
            selectedVideoId={loadingVideoId}
          />
        )}

        {/* Recent Searches */}
        <RecentSearches
          history={history}
          onSelect={(url) => handleSearchOrExtract(url)}
          onClear={handleClearHistory}
        />

        {/* Explanatory Guide & Features */}
        <FeaturesGuide />

      </main>

      {/* Video Modal Preview */}
      {videoData && (
        <VideoModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          embedUrl={videoData.embedUrl}
          title={videoData.title}
        />
      )}

      {/* Footer with Author Copyright & Image */}
      <footer className={`w-full border-t py-8 text-center text-xs transition-colors duration-300 ${
        isDarkMode ? 'border-neutral-900 bg-neutral-950/90 text-neutral-400' : 'border-slate-200 bg-white/90 text-slate-600'
      }`}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center gap-4">
          {/* Author info */}
          <div 
            title="حسام أحمد مساعد"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-sm transition select-none ${
              isDarkMode 
                ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' 
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="relative group select-none">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-[2px] shadow-lg shadow-cyan-500/20 transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src={hossamBadgeImage}
                  alt="حسام أحمد مساعد - في عالم البرمجة"
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover bg-black"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-950 shadow-sm" title="متصل الآن" />
            </div>
            <div className="text-right">
              <div className="text-xs font-extrabold flex items-center gap-1.5">
                <span>تطوير وبرمجة:</span>
                <span className="text-amber-500 dark:text-amber-300 font-black">
                  {siteConfig?.authorName || 'حسام أحمد مساعد'}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 block">كل الحقوق محفوظة © {new Date().getFullYear()}</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Secret Private Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminPanel
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
              historyPushCleanUrl();
            }
          }}
          onConfigUpdated={(newCfg) => {
            setSiteConfig((prev) => (prev ? { ...prev, ...newCfg } : null));
          }}
        />
      )}

      {/* Internal VPN & Proxy Tunnel Modal */}
      <VpnModal
        isOpen={isVpnOpen}
        onClose={() => setIsVpnOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* PWA & School Tablet Install Modal */}
      <InstallPwaModal />

    </div>
  );
}

function historyPushCleanUrl() {
  try {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', cleanUrl);
  } catch {}
}

