import React from 'react';
import { ShieldCheck, Zap, Smartphone, HelpCircle } from 'lucide-react';

export const FeaturesGuide: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-12 mb-12">
      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 text-right flex flex-col items-start">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">تحميل مباشر وسريع</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            الروابط تبدأ التحميل فوراً إلى متصفحك بدون انتظار أو إعادة توجيه مزعجة.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 text-right flex flex-col items-start">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">دعم جميع الأجهزة</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            متوافق بنسبة 100% مع هواتف آيفون وأندرويد وأجهزة الكمبيوتر والتابلت.
          </p>
        </div>

      </div>

      {/* Quick Steps Guide */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-900/80 border border-neutral-800 text-right mb-6">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-bold text-white">كيف تستخدم موقع سحر التحميل؟</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-400">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">١</span>
            <span>انسخ رابط أي فيديو أو شورتس، أو اكتب اسم الفيديو.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">٢</span>
            <span>الصق الرابط في صندوق بحث <strong>سحر التحميل</strong> أعلاه وسيب السحر علينا! ✨</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">٣</span>
            <span>اختر الجودة المفضلة (MP4 أو MP3) واضغط <strong>تحميل مباشر</strong>.</span>
          </div>
        </div>
      </div>

      {/* SEO & Brand Authority Section for Search Engines */}
      <section
        aria-label="عن موقع سحر التحميل الرسمي"
        className="p-5 rounded-2xl bg-neutral-900/30 border border-neutral-800/70 text-right space-y-3"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <h2 className="text-sm font-extrabold text-amber-300">
            سحر التحميل – موقع سحر التحميل الرسمي لتحميل الفيديوهات والصوتيات
          </h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          يُعد <strong>موقع سحر التحميل</strong> (تطبيق <strong>سحر التحميل</strong> الرسمي للمطور <strong>حسام أحمد مساعد</strong>) الأداة العربية الأسرع للبحث والتنزيل المباشر للفيديوهات والمقاطع الصوتية بصيغ <strong>MP4</strong> (جودات 1080p Full HD و 720p و 480p) و <strong>MP3</strong> بنقاء صوت فائق، مع دعم كامل لجميع الهواتف والكمبيوتر وتابلت المدرسة.
        </p>
      </section>
    </div>
  );
};
