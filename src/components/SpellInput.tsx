import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Clipboard, 
  X, 
  Search, 
  Link2, 
  Check, 
  Mic, 
  Flame, 
  BookOpen,
  GraduationCap,
  Languages,
  Zap,
  Calculator
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpellInputProps {
  onSearchOrExtract: (input: string) => Promise<void>;
  isLoading: boolean;
}

const QUICK_TOPICS = [
  { title: 'محمد صلاح عربي', query: 'محمد صلاح عربي', icon: BookOpen },
  { title: 'انجلشاوي', query: 'انجلشاوي', icon: Languages },
  { title: 'عبد المعبود فيزياء', query: 'عبد المعبود فيزياء', icon: Zap },
  { title: 'لطفي زهران', query: 'لطفي زهران', icon: Calculator },
  { title: 'جمعه السيد', query: 'جمعه السيد', icon: GraduationCap },
  { title: 'الجوهري', query: 'الجوهري', icon: Sparkles },
];

export const SpellInput: React.FC<SpellInputProps> = ({ onSearchOrExtract, isLoading }) => {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsSuggestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch YouTube auto-complete suggestions debounce
  useEffect(() => {
    if (!query.trim() || query.startsWith('http') || query.includes('youtu.be') || query.includes('youtube.com')) {
      setSuggestions([]);
      setIsSuggestOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSuggestions(data);
            setIsSuggestOpen(true);
          } else {
            setSuggestions([]);
          }
        }
      } catch {
        // Ignore
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم خاصية البحث الصوتي المباشر.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          setIsListening(false);
          onSearchOrExtract(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setQuery(text.trim());
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const target = (customQuery !== undefined ? customQuery : query).trim();
    if (!target || isLoading) return;

    setIsSuggestOpen(false);

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6']
      });
    } catch {
      // Ignore
    }

    await onSearchOrExtract(target);
  };

  const handleSelectSuggestion = (s: string) => {
    setQuery(s);
    setIsSuggestOpen(false);
    handleSubmit(undefined, s);
  };

  const isUrl = query.trim().startsWith('http') || query.includes('youtu.be') || query.includes('youtube.com');

  return (
    <div ref={wrapperRef} className="w-full max-w-3xl mx-auto px-4 relative z-30">
      <form onSubmit={(e) => handleSubmit(e)} className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 group-focus-within:opacity-100" />

        <div className="relative flex flex-col sm:flex-row items-center bg-neutral-900/95 backdrop-blur-2xl rounded-2xl p-2.5 border border-neutral-700 shadow-2xl">
          
          {/* Main Input Field */}
          <div className="relative flex items-center w-full flex-1 px-3 py-1.5">
            {isUrl ? (
              <Link2 className="w-5 h-5 text-amber-400 shrink-0 ml-2.5" />
            ) : (
              <Search className="w-5 h-5 text-red-500 shrink-0 ml-2.5 animate-pulse" />
            )}

            <input
              id="spell-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0 && !isUrl) setIsSuggestOpen(true);
              }}
              placeholder="ابحث بالكلام أو الصق الرابط هنا..."
              className="w-full bg-transparent text-white placeholder-neutral-400 text-sm md:text-base outline-none font-medium text-right dir-rtl"
              disabled={isLoading}
              autoComplete="off"
            />

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 mr-2 shrink-0">
              {query && (
                <button
                  type="button"
                  id="clear-query-btn"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                    setIsSuggestOpen(false);
                  }}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                  title="مسح"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice search button */}
              <button
                type="button"
                id="voice-search-btn"
                onClick={toggleVoiceSearch}
                className={`p-2 rounded-xl transition flex items-center justify-center ${
                  isListening 
                    ? 'bg-red-600 text-white animate-bounce ring-2 ring-red-400' 
                    : 'text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700'
                }`}
                title={isListening ? 'جاري الاستماع...' : 'بحث صوتي'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Paste button */}
              <button
                type="button"
                id="paste-query-btn"
                onClick={handlePaste}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl border border-neutral-700/80 transition active:scale-95"
                title="لصق من الحافظة"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copied ? 'تم اللصق' : 'لصق'}</span>
              </button>
            </div>
          </div>

          {/* Search / Cast Spell Button */}
          <button
            type="submit"
            id="cast-spell-btn"
            disabled={isLoading || !query.trim()}
            className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:from-red-700 text-white font-black text-sm md:text-base rounded-xl shadow-lg shadow-red-600/30 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري البحث والفك...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>{isUrl ? 'تحميل مباشر ✨' : 'بحث ذكي 🔍'}</span>
              </>
            )}
          </button>
        </div>

        {/* Live Auto-Suggestions Dropdown */}
        {isSuggestOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
            <div className="px-4 py-2 border-b border-neutral-800/80 text-[11px] font-bold text-neutral-400 flex items-center justify-between">
              <span>اقتراحات البحث المباشرة:</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`suggestion-item-${idx}`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-4 py-2.5 text-right flex items-center justify-between hover:bg-neutral-800/80 text-neutral-200 hover:text-white transition group border-b border-neutral-800/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-400 transition shrink-0" />
                    <span className="text-xs md:text-sm font-medium">{suggestion}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition">
                    بحث الآن ↵
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Quick Search Chips */}
      <div className="mt-3 flex items-center justify-center flex-wrap gap-2 text-xs">
        <span className="text-neutral-400 font-semibold flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>الأكثر طلباً:</span>
        </span>
        {QUICK_TOPICS.map((topic, idx) => {
          const Icon = topic.icon;
          return (
            <button
              key={idx}
              type="button"
              id={`quick-topic-btn-${idx}`}
              onClick={() => {
                setQuery(topic.query);
                handleSubmit(undefined, topic.query);
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full border border-neutral-800 hover:border-red-500/40 transition active:scale-95 disabled:opacity-50 font-medium shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-red-400" />
              <span>{topic.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
