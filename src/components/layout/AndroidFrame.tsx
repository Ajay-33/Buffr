import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  isPhoneFrame?: boolean;
  isEnabled?: boolean;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  isPhoneFrame,
  isEnabled,
  children,
}) => {
  const isFramed = isPhoneFrame ?? isEnabled ?? false;
  const [timeStr, setTimeStr] = useState('09:41');
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth <= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // On real mobile screens or when frame is disabled, always render 100% full-width edge-to-edge
  if (!isFramed || isMobileViewport) {
    return (
      <div id="buffr-full-width-container" className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div
      id="buffr-android-device-wrapper"
      className="min-h-screen bg-slate-900/80 p-2 sm:p-6 flex items-center justify-center overflow-x-hidden"
    >
      <div
        id="buffr-android-mockup-frame"
        className="w-full max-w-[430px] h-[92vh] max-h-[920px] bg-slate-950 border-[6px] border-slate-800/90 rounded-[44px] shadow-2xl shadow-black/90 flex flex-col relative overflow-hidden ring-1 ring-white/10"
      >
        {/* Status Bar */}
        <div className="w-full h-9 bg-slate-950 px-6 flex items-center justify-between text-xs text-slate-300 font-mono select-none z-40 border-b border-slate-900 shrink-0">
          <span className="font-bold text-[11px]">{timeStr}</span>

          {/* Camera punch hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800/80 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Device Screen Body */}
        <div className="flex-1 overflow-y-auto flex flex-col relative bg-slate-950">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="w-full h-4 bg-slate-950 flex items-center justify-center pb-1 z-40 shrink-0">
          <div className="w-32 h-1 rounded-full bg-slate-700/80" />
        </div>
      </div>
    </div>
  );
};

