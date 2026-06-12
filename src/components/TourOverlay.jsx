import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Trophy } from 'lucide-react';

const PAD = 10;

export default function TourOverlay({ steps, currentStep, onNext, onSkip }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const step = steps[currentStep];
    if (!step.targetId) {
      setRect(null);
      return;
    }

    const compute = () => {
      const el = document.getElementById(step.targetId);
      if (!el) { setRect(null); return; }
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
      }, 280);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [currentStep, steps]);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const cardTop = (() => {
    if (!rect) return undefined;
    const cardH = 210;
    const gap = 18;
    if (rect.bottom + gap + cardH <= vh - 85) return rect.bottom + gap;
    if (rect.top - gap - cardH >= 70) return rect.top - gap - cardH;
    return Math.max(70, Math.round((vh - cardH) / 2));
  })();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9990 }} aria-modal role="dialog">
      {/* Spotlight overlay — 4 rects around the hole */}
      {rect ? (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PAD), background: 'rgba(0,0,0,0.80)' }} />
          <div style={{ position: 'absolute', top: rect.bottom + PAD, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.80)' }} />
          <div style={{ position: 'absolute', top: rect.top - PAD, left: 0, width: Math.max(0, rect.left - PAD), height: rect.height + PAD * 2, background: 'rgba(0,0,0,0.80)' }} />
          <div style={{ position: 'absolute', top: rect.top - PAD, left: rect.right + PAD, right: 0, height: rect.height + PAD * 2, background: 'rgba(0,0,0,0.80)' }} />
          {/* Orange highlight ring */}
          <div style={{
            position: 'absolute',
            top: rect.top - PAD - 2,
            left: rect.left - PAD - 2,
            width: rect.width + (PAD + 2) * 2,
            height: rect.height + (PAD + 2) * 2,
            border: '2px solid #FF7A00',
            borderRadius: 12,
            pointerEvents: 'none',
            boxShadow: '0 0 0 1px rgba(255,122,0,0.25), 0 0 20px rgba(255,122,0,0.15)',
          }} />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.80)' }} />
      )}

      {/* Instruction card */}
      <div
        style={{
          position: 'fixed',
          top: cardTop,
          bottom: cardTop === undefined ? 96 : undefined,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          zIndex: 9991,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{ width: '100%', maxWidth: 360, pointerEvents: 'all' }}
          >
            <div className="bg-[#1A1A1A] border border-[#FF7A00]/25 rounded-2xl p-5 shadow-2xl">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-[15px] font-bold text-white leading-snug">{step.title}</h3>
                <button
                  onClick={onSkip}
                  className="text-neutral-500 hover:text-neutral-300 shrink-0 mt-0.5 transition-colors"
                  aria-label="Pular tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <p className="text-[13px] text-neutral-300 leading-relaxed mb-4">{step.text}</p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === currentStep ? 16 : 6,
                        height: 6,
                        background: i === currentStep ? '#FF7A00' : '#333',
                      }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={onSkip}
                      className="text-[12px] text-neutral-500 hover:text-neutral-300 font-semibold transition-colors"
                    >
                      Pular
                    </button>
                  )}
                  <button
                    onClick={onNext}
                    className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#FF8C1A] active:scale-95 text-black font-bold text-[12px] px-4 py-2 rounded-lg transition-all"
                  >
                    {isLast ? (
                      <><Trophy className="w-3.5 h-3.5" /> Começar!</>
                    ) : (
                      <>Próximo <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
