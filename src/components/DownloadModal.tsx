import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Film, 
  Music, 
  AlertCircle,
  HardDriveDownload,
  ArrowDownToLine,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoData, VideoFormat } from '../types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: VideoData;
  format: VideoFormat | null;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  videoData,
  format,
}) => {
  const [status, setStatus] = useState<'resolving' | 'ready' | 'downloading' | 'error'>('resolving');
  const [progressPercent, setProgressPercent] = useState<number>(15);
  const [statusMessage, setStatusMessage] = useState<string>('جاري سحر التحميل وتجهيز الرابط فائق السرعة...');
  const [directDownloadUrl, setDirectDownloadUrl] = useState<string | null>(null);
  const [rawStreamUrl, setRawStreamUrl] = useState<string | null>(null);
  const [cachedBlobUrl, setCachedBlobUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [downloadStarted, setDownloadStarted] = useState(false);

  // Trigger browser save dialog from a verified URL or external CDN attachment URL
  const triggerDirectBrowserSave = (targetUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = targetUrl;
    a.setAttribute('download', fileName);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 1500);
  };

  // Fetch binary media stream inside authenticated JS context and verify it is NOT an HTML cookie page
  const fetchVerifiedMediaBlob = async (
    primaryUrl: string,
    fallbackRawUrl: string | null,
    isAudio: boolean,
    videoId: string,
    title: string,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    const candidateUrls = [
      primaryUrl,
      `/api/download-direct?videoId=${encodeURIComponent(videoId)}&format=${isAudio ? 'mp3' : '360'}&title=${encodeURIComponent(title)}&ext=${isAudio ? 'mp3' : 'mp4'}`,
    ];
    if (fallbackRawUrl && fallbackRawUrl.startsWith('http')) {
      candidateUrls.push(fallbackRawUrl);
    }

    for (const targetUrl of candidateUrls) {
      try {
        const res = await fetch(targetUrl, {
          credentials: targetUrl.startsWith('/') ? 'include' : 'omit',
        });

        if (!res.ok) continue;

        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        // Never allow an HTML page (like the Cloud Run Safari cookie warning) to be saved as a video/audio file!
        if (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('text/plain')) {
          continue;
        }

        const totalLength = parseInt(res.headers.get('content-length') || '0', 10);
        if (!res.body) {
          const blob = await res.blob();
          if (blob.size < 1000) continue;
          const finalBlob = new Blob([blob], { type: isAudio ? 'audio/mpeg' : 'video/mp4' });
          return URL.createObjectURL(finalBlob);
        }

        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedLength += value.length;
            if (onProgress) {
              if (totalLength > 0) {
                const pct = Math.min(99, Math.round((receivedLength / totalLength) * 100));
                onProgress(Math.max(25, pct));
              } else {
                onProgress(Math.min(95, 40 + Math.floor(receivedLength / (100 * 1024)) * 3));
              }
            }
          }
        }

        if (receivedLength < 1000) {
          continue;
        }

        // Verify first bytes are not Cloud Run HTML auth page
        const firstChunkStr = new TextDecoder().decode(chunks[0].slice(0, 128)).trim().toLowerCase();
        if (firstChunkStr.startsWith('<!doctype') || firstChunkStr.startsWith('<html') || firstChunkStr.includes('action required to load your app') || firstChunkStr.includes('authenticate in new window')) {
          throw new Error('يرجى الضغط على زر (Authenticate in new window) أعلى الشاشة لتأكيد هوية المتصفح وتفعيل التحميل.');
        }

        const mimeType = isAudio ? 'audio/mpeg' : 'video/mp4';
        const finalBlob = new Blob(chunks as any[], { type: mimeType });
        return URL.createObjectURL(finalBlob);
      } catch (err: any) {
        if (err?.message?.includes('Authenticate in new window')) {
          throw err;
        }
        console.warn('Candidate stream fetch failed:', err);
      }
    }

    throw new Error('يرجى الضغط على زر (Authenticate in new window) أعلى الشاشة لتأكيد الأمان ثم حاول التحميل مرة أخرى.');
  };

  useEffect(() => {
    if (!isOpen || !format) {
      setStatus('resolving');
      setProgressPercent(15);
      setDirectDownloadUrl(null);
      setRawStreamUrl(null);
      if (cachedBlobUrl) {
        try { URL.revokeObjectURL(cachedBlobUrl); } catch {}
        setCachedBlobUrl(null);
      }
      setErrorMessage(null);
      setSecondsElapsed(0);
      setDownloadStarted(false);
      return;
    }

    let isMounted = true;
    setStatus('resolving');
    setProgressPercent(20);
    setSecondsElapsed(0);
    setDownloadStarted(false);
    setStatusMessage('جاري الاتصال بخوادم التحميل السريع وفك التشفير...');

    // Timer counter
    const timerInterval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    // Progress animation while resolving
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 88) return prev + Math.floor(Math.random() * 5) + 2;
        return prev;
      });
    }, 650);

    const resolveAndStartDownload = async () => {
      try {
        const isAudio = format.ext === 'mp3' || !format.hasVideo;
        const qualityKey = isAudio ? 'mp3' : (format.quality.replace(/\D/g, '') || '720');
        const cleanTitle = videoData.title.replace(/[^\w\s\u0600-\u06FF]/gi, '_').trim() || 'video';
        const fileExt = isAudio ? 'mp3' : 'mp4';
        const fileName = `${cleanTitle}_${format.quality}.${fileExt}`;

        // Call backend resolver
        const res = await fetch(
          `/api/resolve-direct?videoId=${videoData.id}&format=${qualityKey}&title=${encodeURIComponent(videoData.title)}&ext=${fileExt}`,
          { credentials: 'include' }
        );

        if (!isMounted) return;

        if (!res.ok) {
          throw new Error('تعذر توليد رابط التحميل، يرجى تجربة جودة أخرى');
        }

        const data = await res.json();
        const resolvedUrl = data.directUrl || data.downloadUrl;
        const rawUrl: string | null = data.rawUrl || format.directUrl || null;

        if (!resolvedUrl) {
          throw new Error('لم يتم استلام رابط تنزيل صالح');
        }

        clearInterval(progressInterval);
        setDirectDownloadUrl(resolvedUrl);
        setRawStreamUrl(rawUrl);

        // If rawUrl is a direct external CDN attachment URL (savenow.to / lbserver.xyz),
        // trigger native browser download immediately (0 RAM buffering, immune to Cloud Run cookie warnings!)
        const isDirectAttachmentCdn = rawUrl && (rawUrl.includes('savenow.to/') || rawUrl.includes('lbserver.xyz/'));

        if (isDirectAttachmentCdn && rawUrl) {
          setProgressPercent(100);
          setStatus('ready');
          setStatusMessage('✨ تم تجهيز الملف بنجاح! بدأ التنزيل المباشر في متصفحك...');
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#00adb5', '#38bdf8', '#10b981', '#fbbf24'],
            });
          } catch {}

          setTimeout(() => {
            if (!isMounted) return;
            triggerDirectBrowserSave(rawUrl, fileName);
            setDownloadStarted(true);
          }, 150);
          return;
        }

        setProgressPercent(100);
        setStatus('ready');
        setStatusMessage('✨ تم تجهيز الملف بنجاح! بدأ التنزيل المباشر في متصفحك (يدعم الفيديوهات الطويلة أي كان حجمها)...');

        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#00adb5', '#38bdf8', '#10b981', '#fbbf24'],
          });
        } catch {}

        setTimeout(() => {
          if (!isMounted) return;
          triggerDirectBrowserSave(rawUrl || resolvedUrl, fileName);
          setDownloadStarted(true);
        }, 150);

      } catch (err: any) {
        if (!isMounted) return;
        console.error('Download resolve error:', err);
        clearInterval(progressInterval);
        setStatus('error');
        setErrorMessage(err?.message || 'حدث خطأ أثناء فك التشفير. يرجى المحاولة مرة أخرى أو اختيار جودة أخرى.');
      }
    };

    resolveAndStartDownload();

    return () => {
      isMounted = false;
      clearInterval(timerInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, format, videoData]);

  if (!isOpen || !format) return null;

  const handleManualDownload = async () => {
    const isAudio = format.ext === 'mp3' || !format.hasVideo;
    const fileExt = isAudio ? 'mp3' : 'mp4';
    const cleanTitle = videoData.title.replace(/[^\w\s\u0600-\u06FF]/gi, '_').trim() || 'video';
    const fileName = `${cleanTitle}_${format.quality}.${fileExt}`;

    setDownloadStarted(true);
    if (cachedBlobUrl) {
      triggerDirectBrowserSave(cachedBlobUrl, fileName);
      return;
    }

    if (rawStreamUrl && (rawStreamUrl.includes('savenow.to/') || rawStreamUrl.includes('lbserver.xyz/'))) {
      triggerDirectBrowserSave(rawStreamUrl, fileName);
      return;
    }

    if (directDownloadUrl) {
      try {
        const blobUrl = await fetchVerifiedMediaBlob(directDownloadUrl, rawStreamUrl, isAudio, videoData.id, videoData.title);
        setCachedBlobUrl(blobUrl);
        triggerDirectBrowserSave(blobUrl, fileName);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCopyLink = () => {
    if (!directDownloadUrl) return;
    navigator.clipboard.writeText(directDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isAudio = format.ext === 'mp3' || !format.hasVideo;
  const displaySize = format.size ? (format.size.includes('MB') ? format.size : `${format.size} MB`) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl overflow-hidden text-right font-sans"
        dir="rtl"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            {isAudio ? <Music className="w-5 h-5" /> : <Film className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>تحميل مباشر للجهاز</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500 text-black">
                {format.quality}
              </span>
              {displaySize && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm">
                  {displaySize}
                </span>
              )}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isAudio ? 'ملف صوتي MP3 نقي' : `فيديو MP4 مدمج بالصوت (${format.fps || 30} FPS)`}
            </p>
          </div>
        </div>

        {/* Video Card Snippet */}
        <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 flex items-center gap-3 mb-4">
          <img 
            src={videoData.thumbnail} 
            alt={videoData.title}
            className="w-20 h-12 object-cover rounded-lg shrink-0 border border-neutral-800"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-neutral-200 line-clamp-1 leading-snug">
              {videoData.title}
            </h4>
            <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{videoData.author?.name}</span>
              <span>•</span>
              <span>{videoData.durationFormatted}</span>
              {displaySize && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    💾 الحجم: {displaySize}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero Brand Artwork shown immediately when Download is clicked */}
        <div className="relative mx-auto mb-4 w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 group bg-black flex items-center justify-center">
          <img
            src="/assets/aistudio/Meta_AI_863290537_1432435892335217_1107315422315628161_n_20261023_215002_64baee5f.webp"
            alt="سحر التحميل - الصق الرابط وسيب السحر علينا"
            className="w-full h-full object-contain object-center transform group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/30 rounded-2xl pointer-events-none" />
          {status === 'resolving' && (
            <div className="absolute bottom-2 inset-x-2 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-500/40 flex items-center justify-center gap-1.5 text-amber-300 text-[11px] font-extrabold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>الصق الرابط.. وسيب السحر علينا ✨</span>
            </div>
          )}
          {status === 'ready' && (
            <div className="absolute bottom-2 inset-x-2 px-2.5 py-1 rounded-xl bg-emerald-950/90 backdrop-blur-md border border-emerald-400/50 flex items-center justify-center gap-1.5 text-emerald-300 text-[11px] font-extrabold shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>اكتمل سحر التحميل بنجاح!</span>
            </div>
          )}
        </div>

        {/* Status: Resolving */}
        {status === 'resolving' && (
          <div className="space-y-3 py-1 text-center">
            <div>
              <div className="text-sm font-bold text-white mb-1 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <span>{statusMessage}</span>
              </div>
              <div className="text-xs text-neutral-400">
                جاري استخراج الرابط المباشر بأعلى سرعة ({secondsElapsed} ثانية)
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-neutral-950 rounded-full h-3 overflow-hidden border border-amber-500/30 p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Status: Ready */}
        {status === 'ready' && directDownloadUrl && (
          <div className="space-y-3 py-1 text-center animate-in fade-in slide-in-from-bottom-2">
            <div>
              <div className="text-sm font-bold text-emerald-300 mb-0.5">
                🎉 تم تجهيز رابط التحميل بنجاح!
              </div>
              <div className="text-xs text-neutral-300">
                يبدأ التحميل تلقائياً الآن إلى مجلد التنزيلات (Downloads) في جهازك.
              </div>
            </div>

            {/* Big Shiny Download Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                id="modal-direct-download-btn"
                onClick={handleManualDownload}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition duration-150 transform active:scale-98 animate-pulse cursor-pointer"
              >
                <ArrowDownToLine className="w-5 h-5 stroke-[2.5]" />
                <span>اضغط هنا لبدء التنزيل فوراً ({format.quality})</span>
              </button>
              <p className="text-[11px] text-neutral-400 mt-2">
                * اضغط الزر الأخضر أعلاه إذا لم يبدأ التنزيل تلقائياً في متصفحك
              </p>
            </div>

            {/* Copy Link Option */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-400">رابط الملف المباشر:</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط المباشر</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status: Error */}
        {status === 'error' && (
          <div className="space-y-4 py-2 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <div className="text-sm font-bold text-red-300 mb-1">
                تعذر توليد الرابط المباشر
              </div>
              <p className="text-xs text-red-400/90 leading-relaxed max-w-sm mx-auto">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition"
              >
                اختيار جودة أخرى
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
