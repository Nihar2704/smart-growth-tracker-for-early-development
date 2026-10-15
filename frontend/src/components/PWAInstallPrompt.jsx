import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, Check, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome / Android / Edge PWA install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  // Do not show if already installed or dismissed by user
  if (isInstalled || isDismissed) return null;

  // Show if prompt is available OR if on iOS Safari (not in standalone)
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      {/* Floating / Embedded Install Banner */}
      <div className="bg-white border border-teal-200/90 rounded-2xl p-4 sm:p-4.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3.5 my-3 animate-in fade-in slide-in-from-top-3 duration-200">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[var(--primary)] shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[var(--text-main)] tracking-tight">
                Install Smart Growth Tracker
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-50 text-[var(--primary)] border border-teal-200 font-bold uppercase tracking-wider">
                App Available
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add to your home screen for instant access, offline mode & native full-screen mobile display.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.2 btn-primary text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.4]" />
            <span>Install on Device</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Modal / Drawer */}
      {showIOSTip && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[var(--border-color)]">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2 sm:hidden" />
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm">
                <Share className="w-4 h-4" />
                <span>Install on Apple iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIOSTip(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5">
              <p className="font-semibold text-slate-900">To add to your iPhone or iPad home screen:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                <li>
                  Tap the <strong className="text-slate-900">Share button [↑]</strong> in the bottom Safari navigation bar.
                </li>
                <li>
                  Scroll down the menu and tap <strong className="text-slate-900">"Add to Home Screen" [+]</strong>.
                </li>
                <li>
                  Tap <strong className="text-[var(--primary)] font-bold">Add</strong> in the top-right corner to finish.
                </li>
              </ol>
            </div>

            <button
              onClick={() => setShowIOSTip(false)}
              className="w-full py-2.5 btn-primary text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
