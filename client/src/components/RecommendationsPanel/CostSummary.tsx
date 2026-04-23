import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Language, RecommendationItem } from '../../types';

// ============================================================
// CostSummary — per FRONTEND_ARCHITECTURE.md §1
// Aggregates estimated costs across recommendations and
// shows a per-type breakdown so farmers can budget actions.
// ============================================================

interface CostSummaryProps {
  recommendations: RecommendationItem[];
  language: Language;
}

const LABELS: Record<Language, { title: string; total: string; hint: string; free: string }> = {
  en: {
    title: 'Cost Summary',
    total: 'Estimated total',
    hint: 'Indicative cost for one acre',
    free: 'Labor only — no material cost',
  },
  hi: {
    title: 'लागत सारांश',
    total: 'अनुमानित कुल',
    hint: 'एक एकड़ के लिए अनुमानित लागत',
    free: 'केवल श्रम — कोई सामग्री लागत नहीं',
  },
  kn: {
    title: 'ವೆಚ್ಚ ಸಾರಾಂಶ',
    total: 'ಅಂದಾಜು ಒಟ್ಟು',
    hint: 'ಒಂದು ಎಕರೆಗೆ ಅಂದಾಜು ವೆಚ್ಚ',
    free: 'ಕೇವಲ ಕೂಲಿ — ಯಾವುದೇ ಸಾಮಗ್ರಿ ವೆಚ್ಚವಿಲ್ಲ',
  },
};

const TYPE_CONFIG: Record<
  RecommendationItem['type'],
  { icon: string; color: string; label: string }
> = {
  irrigation:   { icon: '💧', color: '#38bdf8', label: 'Irrigation' },
  fertilizer:   { icon: '🌱', color: '#22c55e', label: 'Fertilizer' },
  pest_control: { icon: '🐛', color: '#a78bfa', label: 'Pest Control' },
  nutrient:     { icon: '⚗️', color: '#facc15', label: 'Nutrients' },
  general:      { icon: '📋', color: '#94a3b8', label: 'General' },
};

export default function CostSummary({ recommendations, language }: CostSummaryProps) {
  const { total, breakdown, currency } = useMemo(() => {
    let total = 0;
    const breakdown = new Map<RecommendationItem['type'], number>();
    let currency = 'INR/acre';
    for (const rec of recommendations) {
      const cost = rec.estimatedCost ?? 0;
      if (cost > 0) {
        total += cost;
        breakdown.set(rec.type, (breakdown.get(rec.type) ?? 0) + cost);
        if (rec.estimatedCostUnit) currency = rec.estimatedCostUnit;
      }
    }
    return { total, breakdown, currency };
  }, [recommendations]);

  const labels = LABELS[language];

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass"
      style={{
        padding: '1.25rem',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, rgba(250,204,21,0.06), rgba(34,197,94,0.04))',
        border: '1px solid rgba(250,204,21,0.18)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: breakdown.size > 0 ? '0.875rem' : 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: '0.3rem',
            }}
          >
            💰 {labels.title.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {labels.hint}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.08em',
            }}
          >
            {labels.total.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1.65rem',
              color: total > 0 ? '#fde047' : '#4ade80',
              lineHeight: 1,
              marginTop: '0.2rem',
            }}
          >
            {total > 0 ? `₹${total.toLocaleString('en-IN')}` : '₹0'}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '0.2rem',
            }}
          >
            {total > 0 ? currency : labels.free}
          </div>
        </div>
      </div>

      {breakdown.size > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            paddingTop: '0.875rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {Array.from(breakdown.entries()).map(([type, amount]) => {
            const cfg = TYPE_CONFIG[type];
            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
            return (
              <div
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.3rem 0.625rem',
                  borderRadius: '0.5rem',
                  background: `${cfg.color}12`,
                  border: `1px solid ${cfg.color}30`,
                }}
              >
                <span style={{ fontSize: '0.8rem' }}>{cfg.icon}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: cfg.color,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  ₹{amount.toLocaleString('en-IN')}
                </span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    color: 'rgba(255,255,255,0.35)',
                  }}
                >
                  · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
