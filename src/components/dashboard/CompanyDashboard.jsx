import { useState } from 'react';
import { MODULES } from '../../data/modules';
import { OnePagePlan } from './OnePagePlan';

const SECTION_CONFIGS = {
  // ... (unchanged)
  mission: [
    { key: 'purpose', label: 'Purpose', sublabel: 'Why We Exist', color: '#C41F3B' },
    { key: 'promise', label: 'Promise', sublabel: 'What We Do', color: '#C9973A' },
    { key: 'people', label: 'People', sublabel: 'Who We Serve', color: '#7B3FA0' },
    { key: 'approach', label: 'Approach', sublabel: 'How We Do It', color: '#3B82F6' },
    { key: 'impact', label: 'Impact', sublabel: 'What Changes', color: '#10B981' },
  ],
  vision: [
    { key: 'future_state', label: 'Future State', sublabel: '3-5 Year Picture', color: '#C9973A' },
    { key: 'big_goal', label: 'Big Goal', sublabel: 'Audacious Target', color: '#C41F3B' },
    { key: 'market_position', label: 'Market Position', sublabel: 'How You Stand Out', color: '#7B3FA0' },
    { key: 'team_culture', label: 'Team & Culture', sublabel: 'Future Organization', color: '#3B82F6' },
    { key: 'why_it_matters', label: 'Why It Matters', sublabel: 'The Deeper Reason', color: '#10B981' },
  ],
  strategy: [
    { key: 'strategic_anchors', label: 'Strategic Anchors', sublabel: 'What Must Be True', color: '#7B3FA0' },
    { key: 'priorities', label: 'Priorities', sublabel: '12-Month Focus', color: '#C9973A' },
    { key: 'advantage', label: 'Advantage', sublabel: 'Why You Win', color: '#10B981' },
  ],
  accountability: [
    { key: 'core_functions', label: 'Structure', sublabel: 'Business Functions', color: '#3B82F6' },
    { key: 'key_outcomes', label: 'Roles', sublabel: 'Key Outcomes', color: '#C41F3B' },
    { key: 'metrics', label: 'Metrics', sublabel: 'Success Indicators', color: '#C9973A' },
  ],
  framework: [
    { key: 'scoreboard', label: 'Scoreboard', sublabel: 'The Main Numbers', color: '#10B981' },
    { key: 'meeting_rhythm', label: 'Rhythm', sublabel: 'Team Cadence', color: '#7B3FA0' },
    { key: 'commitments', label: 'Execution', sublabel: 'How Work Moves', color: '#3B82F6' },
  ],
};

function ModuleSection({ moduleId, moduleData, onRedo }) {
// ... (unchanged inside ModuleSection)
  const mod = MODULES.find(m => m.id === moduleId);
  if (!mod || !moduleData?.data) return null;
  const fields = SECTION_CONFIGS[moduleId] || [];

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg, ${mod.color} 0%, ${mod.color}88 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#FDEECB',
            boxShadow: `0 0 12px ${mod.glow}`,
          }}>{mod.icon}</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>{mod.subtitle}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{mod.title}</div>
          </div>
        </div>
        <button onClick={() => onRedo(moduleId)} style={{
          fontSize: 12, padding: '6px 12px',
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)',
        }}>Edit</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14,
      }}>
        {fields.map(({ key, label, sublabel, color }) => {
          const value = moduleData.data[key];
          if (!value) return null;
          return (
            <div key={key} className="dash-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <div style={{ width: 3, height: 28, borderRadius: 4, background: color, boxShadow: `0 0 8px ${color}88`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>{sublabel}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink)', opacity: 0.82, margin: 0 }}>
                {value}
              </p>
            </div>
          );
        })}
      </div>
      <div className="gold-rule" style={{ marginTop: 32 }} />
    </div>
  );
}

export function CompanyDashboard({ data, completedIds, onRedo, onClose }) {
  const [showOpsp, setShowOpsp] = useState(false);
  const completedModules = MODULES.filter(m => completedIds.includes(m.id));

  if (showOpsp) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <button onClick={() => setShowOpsp(false)} style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          fontSize: 13, padding: '10px 18px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)',
          cursor: 'pointer', fontFamily: 'var(--font)',
        }} className="no-print">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Dashboard
        </button>
        <OnePagePlan data={data} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
            Executive Dashboard
          </p>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
            Company Operating System
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowOpsp(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, padding: '10px 18px',
            background: 'var(--panel)', border: '1px solid rgba(201,151,58,0.3)',
            borderRadius: 10, color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font)',
            boxShadow: '0 4px 12px rgba(201,151,58,0.1)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect width="12" height="8" x="6" y="14"/>
            </svg>
            Print One-Page Plan
          </button>
          
          <button onClick={onClose} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, padding: '10px 18px',
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Modules
          </button>
        </div>
      </div>

      <div className="gold-rule" style={{ marginBottom: 40 }} />

      {/* Completed module sections */}
      {completedModules.map(mod => (
        <ModuleSection
          key={mod.id}
          moduleId={mod.id}
          moduleData={data.modules[mod.id]}
          onRedo={onRedo}
        />
      ))}

      {/* Next step teaser */}
      <div style={{
        marginTop: 16,
        padding: '22px 28px',
        background: 'rgba(201,151,58,0.05)',
        border: '1px solid rgba(201,151,58,0.15)',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', margin: '0 0 4px' }}>✦ Your Operating System Grows With You</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Return to the module hub to continue building your Leadership OS.</p>
        </div>
        <button onClick={onClose} style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, rgba(201,151,58,0.15) 0%, rgba(201,151,58,0.05) 100%)',
          border: '1px solid rgba(201,151,58,0.25)',
          borderRadius: 10, color: 'var(--accent)',
          fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Continue Building →
        </button>
      </div>
    </div>
  );
}
