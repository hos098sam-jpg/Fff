import React, { useState, useEffect } from 'react';

interface IntroSplashProps {
  onFinish?: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish }) => {
  const [stage, setStage] = useState<'entering' | 'visible' | 'fading' | 'gone'>('entering');

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setStage('visible');
    }, 50);

    const fadeTimer = setTimeout(() => {
      setStage('fading');
    }, 3000);

    const finishTimer = setTimeout(() => {
      setStage('gone');
      if (onFinish) onFinish();
    }, 3700);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (stage === 'gone') return null;

  const handleSkip = () => {
    setStage('fading');
    setTimeout(() => {
      setStage('gone');
      if (onFinish) onFinish();
    }, 500);
  };

  return (
    <div
      id="intro-splash-screen"
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] w-screen h-screen bg-black flex items-center justify-center p-6 cursor-pointer select-none overflow-hidden transition-all duration-700 ease-out ${
        stage === 'fading'
          ? 'opacity-0 scale-105 pointer-events-none'
          : stage === 'visible'
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95'
      }`}
    >
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 aspect-square rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.35)] bg-black flex items-center justify-center">
        <img
          src="https://drive.google.com/thumbnail?id=1Q9CkV_21sfrLWD2V86_fodfA-zd7jUn3&sz=w1200"
          alt="سحر التحميل"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.triedLh3) {
              target.dataset.triedLh3 = '1';
              target.src = 'https://lh3.googleusercontent.com/d/1Q9CkV_21sfrLWD2V86_fodfA-zd7jUn3=w1200';
            } else if (!target.dataset.triedUc) {
              target.dataset.triedUc = '1';
              target.src = 'https://drive.google.com/uc?export=view&id=1Q9CkV_21sfrLWD2V86_fodfA-zd7jUn3';
            } else {
              target.src = '/assets/aistudio/Meta_AI_863290537_1432435892335217_1107315422315628161_n_20261023_215002_64baee5f.webp';
            }
          }}
          className="w-full h-full object-contain object-center"
        />
      </div>
    </div>
  );
};
