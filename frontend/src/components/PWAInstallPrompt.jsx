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
      <div className="panel-card border border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 my-3 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[var(--text-main)] tracking-wide">
                Install Smart Growth Tracker
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-100 text-teal-800 border border-teal-200 font-semibold">
                Smartphone App
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Add to your home screen for quick offline tracking & full-screen native mobile display.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 btn-primary text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Install on Device</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded-lg transition cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIOSTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="panel-card rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm">
                <Share className="w-4 h-4" />
                <span>Install on Apple iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIOSTip(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--text-secondary)] space-y-2.5">
              <p className="font-medium text-[var(--text-main)]">To install on your iPhone or iPad home screen:</p>
              <ol className="list-decimal list-inside space-y-2 text-[var(--text-secondary)]">
                <li>
                  Tap the <strong className="text-[var(--text-main)]">Share button [↑]</strong> in the bottom Safari toolbar.
                </li>
                <li>
                  Scroll down and tap <strong className="text-[var(--text-main)]">"Add to Home Screen" [+]</strong>.
                </li>
                <li>
                  Tap <strong className="text-[var(--primary)] font-bold">Add</strong> in the top-right corner.
                </li>
              </ol>
            </div>

            <button
              onClick={() => setShowIOSTip(false)}
              className="w-full py-2 btn-primary text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
