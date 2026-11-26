import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  Clock,
  Flame,
  Globe,
  Headset,
  Mail,
  MessageCircle,
  PhoneCall,
  Send,
  ShieldAlert,
  WifiOff,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { CUSTOMER_SUPPORT_META, EMERGENCY_CONTACTS } from '../../data/emergency';
import { useTripStore } from '../../store/useTripStore';

interface ChatMessage {
  id: string;
  sender: 'support' | 'user';
  text: string;
}

const CONTACT_STYLES = {
  police: {
    icon: ShieldAlert,
    bg: 'bg-blue-900 hover:bg-blue-950 text-white border-blue-300/30',
  },
  ambulance: {
    icon: Ambulance,
    bg: 'bg-red-700 hover:bg-red-800 text-white border-red-200/30',
  },
  fire: {
    icon: Flame,
    bg: 'bg-orange-700 hover:bg-orange-800 text-white border-orange-200/30',
  },
  wingoSupport: {
    icon: Headset,
    bg: 'bg-maroon hover:bg-maroon-deep text-ivory border-gold/40',
  },
} as const;

export const SosEmergencySheet: React.FC = () => {
  const { t } = useTranslation('sos');
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const trips = useTripStore((s) => s.trips);
  const activeBookingId = trips[0]?.bookingId ?? 'WNG-MDU-2048';

  const [open, setOpen] = useState(false);
  const [chatView, setChatView] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const isPlanStickyBarVisible = location.pathname === '/plan';
  const isWelcomeHiddenNav = location.pathname === '/';

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(18);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setChatView(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleOpen = () => {
    triggerHaptic();
    setChatView(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setChatView(false);
  };

  const handleOpenChat = () => {
    triggerHaptic();
    setMessages([{ id: 'welcome', sender: 'support', text: t('chat.welcomeMsg') }]);
    setChatView(true);
  };

  const handleSendChat = (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;
    triggerHaptic();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: content,
    };
    const replyMsg: ChatMessage = {
      id: `s-${Date.now() + 1}`,
      sender: 'support',
      text: t('chat.mockReply', { topic: content, bookingId: activeBookingId }),
    };
    setMessages((prev) => [...prev, userMsg, replyMsg]);
    if (!textToSend) setChatInput('');
  };

  const handleReportBookingIssue = () => {
    triggerHaptic();
    handleClose();
    navigate('/trips?issue=1');
  };

  // Position cleanly above bottom nav and sticky itinerary bar so it's never occluded
  const fabPositionClass = isPlanStickyBarVisible
    ? 'bottom-[142px] right-4'
    : isWelcomeHiddenNav
      ? 'bottom-5 right-4'
      : 'bottom-[78px] right-4';

  return (
    <>
      {/* Persistent High-Contrast Floating SOS Button */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t('fabAriaLabel')}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="sos-fab"
        className={`fixed z-40 flex min-h-[52px] min-w-[52px] items-center justify-center gap-1.5 rounded-full border-2 border-white bg-red-700 px-4 py-3 text-sm font-extrabold tracking-wide text-white shadow-[0_10px_25px_rgba(185,28,28,0.45)] transition hover:bg-red-800 active:scale-95 ${fabPositionClass}`}
      >
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{t('fabLabel')}</span>
      </button>

      {/* Emergency & Support Bottom Sheet */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-sheet-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={handleClose}
              className="fixed inset-0 bg-night/70 backdrop-blur-sm"
            />

            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-red-500/30 bg-ivory p-5 text-ink shadow-2xl sm:rounded-3xl dark:bg-night-card dark:text-ivory"
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {chatView ? (
                    <button
                      type="button"
                      onClick={() => setChatView(false)}
                      aria-label={t('chat.backToSos')}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 text-maroon dark:text-gold-light"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
                      <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2
                      id="sos-sheet-title"
                      className="font-display text-xl font-bold leading-snug text-red-800 break-words dark:text-red-300"
                    >
                      {chatView ? t('chat.title') : t('sheetTitle')}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-badge dark:text-emerald-300">
                      <WifiOff className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {t('offlineBadge')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={t('chat.backToSos')}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 text-ink/80 transition hover:bg-maroon/10 dark:text-ivory/80"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!chatView ? (
                <div className="space-y-4">
                  {/* Mandatory Disclaimer */}
                  <div
                    role="note"
                    className="flex items-start gap-2.5 rounded-2xl border border-red-600/35 bg-red-50 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-red-900 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-300" aria-hidden="true" />
                    <span>{t('disclaimer')}</span>
                  </div>

                  {/* Exactly Four One-Tap Call Buttons */}
                  <div className="space-y-2.5" aria-label={t('sheetTitle')}>
                    {EMERGENCY_CONTACTS.map((contact) => {
                      const style = CONTACT_STYLES[contact.id];
                      const Icon = style.icon;
                      return (
                        <div key={contact.id} className="space-y-1">
                          <a
                            href={contact.telHref}
                            onClick={triggerHaptic}
                            aria-label={`${t(`contacts.${contact.id}.label`)} ${contact.displayNumber} — ${t('tapToCall')}`}
                            className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm transition active:scale-[0.98] ${style.bg}`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                              <span className="text-sm font-bold leading-snug break-words">
                                {t(`contacts.${contact.id}.label`)}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="font-mono text-base font-extrabold tracking-tight">
                                {contact.displayNumber}
                              </span>
                              <PhoneCall className="h-4 w-4 opacity-90" aria-hidden="true" />
                            </div>
                          </a>
                          <p className="px-1 text-xs leading-relaxed text-muted break-words dark:text-ivory/75">
                            {t(`contacts.${contact.id}.hint`)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Customer Support Card */}
                  <section className="space-y-3 rounded-3xl border border-gold/30 bg-white/80 p-4 dark:border-night-border dark:bg-night/70">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-maroon dark:text-gold-light">
                        {t('supportCardTitle')}
                      </h3>
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:text-amber-300">
                        {t('verifyLabel')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                        <div>
                          <span className="font-semibold">{t('supportHoursLabel')}: </span>
                          <span className="text-ink/85 dark:text-ivory/80">
                            {t(CUSTOMER_SUPPORT_META.supportHoursPlaceholderKey)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                        <div>
                          <span className="font-semibold">{t('languagesLabel')}: </span>
                          <span className="text-ink/85 dark:text-ivory/80">
                            {CUSTOMER_SUPPORT_META.languagesSupportedList.join(' · ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                        <div>
                          <span className="font-semibold">{t('emailLabel')}: </span>
                          <a
                            href={`mailto:${CUSTOMER_SUPPORT_META.email}`}
                            className="font-medium text-maroon underline decoration-gold underline-offset-2 dark:text-gold-light"
                          >
                            {CUSTOMER_SUPPORT_META.email}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleOpenChat}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-maroon px-3.5 py-2 text-xs font-semibold text-ivory transition hover:brightness-110 active:scale-95 dark:bg-gold dark:text-night"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{t('chatButton')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReportBookingIssue}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-maroon/35 bg-ivory px-3.5 py-2 text-center text-xs font-semibold text-maroon transition hover:bg-maroon/5 active:scale-95 dark:border-gold/35 dark:bg-night-card dark:text-gold-light"
                      >
                        <span>{t('reportIssueButton')}</span>
                      </button>
                    </div>
                  </section>
                </div>
              ) : (
                /* Mock Customer Support Chat View */
                <div className="space-y-3">
                  <div className="max-h-60 space-y-2.5 overflow-y-auto rounded-2xl border border-gold/25 bg-white/75 p-3 dark:border-night-border dark:bg-night/60">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-maroon text-ivory dark:bg-gold dark:text-night'
                              : 'border border-gold/25 bg-ivory text-ink dark:border-night-border dark:bg-night-card dark:text-ivory'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="mb-1.5 text-[11px] font-semibold text-muted dark:text-ivory/70">
                      {t('chat.quickTopicsLabel')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(['topicDriver', 'topicTemple', 'topicFare'] as const).map((topicKey) => {
                        const label = t(`chat.${topicKey}`);
                        return (
                          <button
                            key={topicKey}
                            type="button"
                            onClick={() => handleSendChat(label)}
                            className="min-h-[36px] rounded-full border border-gold/35 bg-white/80 px-3 py-1 text-xs font-medium text-maroon transition hover:border-maroon dark:bg-night dark:text-gold-light"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t('chat.inputPlaceholder')}
                      aria-label={t('chat.inputPlaceholder')}
                      className="min-h-[44px] flex-1 rounded-2xl border border-gold/30 bg-white/90 px-3.5 text-xs text-ink placeholder:text-muted dark:border-night-border dark:bg-night dark:text-ivory"
                    />
                    <button
                      type="submit"
                      aria-label={t('chat.send')}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-2xl bg-maroon px-4 text-xs font-semibold text-ivory dark:bg-gold dark:text-night"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t('chat.send')}</span>
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
