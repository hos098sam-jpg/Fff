import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold border border-red-500/30">
            ⚠️
          </div>
          <h1 className="text-xl sm:text-2xl font-black mb-2 text-white">حدث خطأ أثناء تحميل الصفحة</h1>
          <p className="text-neutral-400 text-sm max-w-md mb-6">
            يرجى إعادة تحديث الصفحة أو تفريغ الذاكرة المؤقتة للمتصفح.
          </p>
          <button
            type="button"
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => caches.delete(name));
                });
              }
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            إعادة تحميل الصفحة الآن 🔄
          </button>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}

// Clear any legacy cached ad links from browser localStorage immediately on boot
try {
  const savedCfg = localStorage.getItem('youtube_spell_saved_config_v1');
  if (savedCfg) {
    const parsed = JSON.parse(savedCfg);
    parsed.directAdEnabled = false;
    parsed.directAdUrl = '';
    localStorage.setItem('youtube_spell_saved_config_v1', JSON.stringify(parsed));
  }
} catch {}

// Register Service Worker safely and update immediately
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=3').then((reg) => {
      try { reg.update(); } catch {}
    }).catch((err) => {
      console.log('SW registration skipped:', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
