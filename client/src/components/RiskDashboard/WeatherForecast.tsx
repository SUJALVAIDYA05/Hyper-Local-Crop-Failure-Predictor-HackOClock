import { motion } from 'framer-motion';
import type { WeatherForecastDay } from '../../types';

// ============================================================
// WeatherForecast — horizontal scrollable 7-day strip of
// temperature + precipitation cards that complements the
// ForecastChart and WeatherSummary per FRONTEND_ARCHITECTURE.md.
// ============================================================

interface WeatherForecastProps {
  data: WeatherForecastDay[];
}

function pickWeatherIcon(precip: number, tempMax: number): { icon: string; label: string; color: string } {
  if (precip >= 10) return { icon: '⛈️', label: 'Heavy rain', color: '#818cf8' };
  if (precip >= 2) return { icon: '🌧️', label: 'Rain', color: '#38bdf8' };
  if (precip >= 0.2) return { icon: '🌦️', label: 'Light rain', color: '#7dd3fc' };
  if (tempMax >= 36) return { icon: '🥵', label: 'Very hot', color: '#ef4444' };
  if (tempMax >= 32) return { icon: '☀️', label: 'Sunny', color: '#facc15' };
  if (tempMax >= 25) return { icon: '🌤️', label: 'Mild', color: '#4ade80' };
  return { icon: '🌥️', label: 'Cloudy', color: '#94a3b8' };
}

export default function WeatherForecast({ data }: WeatherForecastProps) {
  if (!data || data.length === 0) return null;

  const maxPrecip = Math.max(1, ...data.map((d) => d.precipitation));

  return (
    <div
      className="no-scrollbar"
      style={{
        display: 'flex',
        gap: '0.625rem',
        overflowX: 'auto',
        padding: '0.25rem 0.25rem 0.5rem',
        scrollSnapType: 'x mandatory',
      }}
    >
      {data.slice(0, 7).map((d, i) => {
        const date = new Date(d.date);
        const isToday = i === 0;
        const weekday = date.toLocaleDateString('en-IN', { weekday: 'short' });
        const day = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        const weather = pickWeatherIcon(d.precipitation, d.temperature.max);
        const rainPct = Math.round((d.precipitation / maxPrecip) * 100);

        return (
          <motion.div
            key={d.date}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.35 }}
            style={{
              flex: '0 0 96px',
              scrollSnapAlign: 'start',
              padding: '0.875rem 0.625rem',
              borderRadius: '0.875rem',
              background: isToday
                ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.04))'
                : 'rgba(255,255,255,0.03)',
              border: isToday
                ? '1px solid rgba(34,197,94,0.35)'
                : '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <div
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '0.68rem',
                color: isToday ? '#4ade80' : 'rgba(255,255,255,0.45)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {isToday ? 'Today' : weekday}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{day}</div>
            <div style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-label={weather.label} title={weather.label}>
              {weather.icon}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.25rem',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>
                {Math.round(d.temperature.max)}°
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                {Math.round(d.temperature.min)}°
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '3px',
                borderRadius: '99px',
                background: 'rgba(56,189,248,0.12)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.max(4, rainPct)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
                  borderRadius: '99px',
                }}
              />
            </div>
            <div style={{ fontSize: '0.66rem', color: '#7dd3fc', fontWeight: 600 }}>
              {d.precipitation.toFixed(1)} mm
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
