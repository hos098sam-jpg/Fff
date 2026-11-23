import React, { useState, useEffect } from 'react';
import { X, Play, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
  title: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, embedUrl, title }) => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStreamUrl(null);
      setLoading(true);
      setError(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    // Extract videoId from embedUrl or youtube url
    const match = embedUrl.match(/(?:embed\/|v=|\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';

    if (!videoId) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchStream = async () => {
      try {
        const res = await fetch(`/api/resolve-direct?videoId=${videoId}&format=720&title=${encodeURIComponent(title)}&ext=mp4`);
        if (!res.ok) throw new Error('Failed to resolve stream');
        const data = await res.json();
        if (!isMounted) return;

        if (data.directUrl || data.downloadUrl) {
          setStreamUrl(data.directUrl || data.downloadUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStream();

    return () => {
      isMounted = false;
    };
  }, [isOpen, embedUrl, title]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2 truncate pl-4">
            <Play className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500" />
            <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container 16:9 */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-300">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs">جاري تجهيز مشغل الفيديو عبر البروكسي المدرسي...</p>
            </div>
          ) : streamUrl && !error ? (
            <video
              src={streamUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
              onError={() => setError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-300 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-xs text-neutral-300">تعذر تحميل المشغل المباشر، جاري التبديل للمشغل الاحتياطي...</p>
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/60 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            متوافق مع تابلت وشبكة المدرسة (مشغل آمن ومحمي)
          </span>
          <span>سحر التحميل © 2026</span>
        </div>
      </div>
    </div>
  );
};
