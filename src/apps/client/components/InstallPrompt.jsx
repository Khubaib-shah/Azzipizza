import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const DISMISS_KEY = "azzipizza-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (navigator.standalone) return; // iOS

    // Don't show if recently dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < DISMISS_DURATION_MS) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      if (localStorage.getItem("showInstallPromptAfterOrder") === "true") {
        if (deferredPrompt) {
          setTimeout(() => {
            setShowPrompt(true);
            localStorage.removeItem("showInstallPromptAfterOrder");
          }, 1500);
        }
      }
    }
  }, [location.pathname, deferredPrompt]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setInstalling(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
    setDeferredPrompt(null);
  }, []);

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            className="install-prompt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleDismiss}
          />

          {/* Prompt Card */}
          <motion.div
            className="install-prompt-card"
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              className="install-prompt-close"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Icon */}
            <div className="install-prompt-icon-wrap">
              <div className="install-prompt-icon-glow" />
              <img
                src="/favicon/android-chrome-192x192.png"
                alt="Azzie Pizza"
                className="install-prompt-icon"
              />
            </div>

            {/* Text */}
            <h3 className="install-prompt-title">Get Azzie Pizza App</h3>
            <p className="install-prompt-desc">
              Install our app for lightning-fast ordering, offline access &amp;
              a home-screen shortcut. No app store needed!
            </p>

            {/* Features */}
            <div className="install-prompt-features">
              <div className="install-prompt-feature">
                <svg className="install-prompt-feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>Faster ordering</span>
              </div>
              <div className="install-prompt-feature">
                <svg className="install-prompt-feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                <span>Home screen</span>
              </div>
              <div className="install-prompt-feature">
                <svg className="install-prompt-feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span>Notifications</span>
              </div>
            </div>

            {/* Actions */}
            <div className="install-prompt-actions">
              <button
                className="install-prompt-btn-install"
                onClick={handleInstall}
                disabled={installing}
              >
                {installing ? (
                  <span className="install-prompt-spinner" />
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="install-prompt-btn-icon"
                    >
                      <path
                        d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Install App
                  </>
                )}
              </button>
              <button
                className="install-prompt-btn-dismiss"
                onClick={handleDismiss}
              >
                Not now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
