import { MODULES, getUnlockStatus } from '../../data/modules';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

function ModuleCard({ module, status, moduleData, onStart, index }) {
  const isComplete = status === 'complete';
  const isUnlocked = status === 'unlocked';
  const isLocked = status === 'locked';
  const isComingSoon = status === 'coming_soon';

  const handleClick = () => {
    if (isUnlocked || isComplete) onStart(module.id);
  };

  const canClick = isUnlocked || isComplete;

  // Show a 2-key preview of answers if complete
  const previewKeys = module.summaryKeys || [];
  const preview = isComplete && moduleData?.data
    ? previewKeys.map(k => moduleData.data[k]).filter(Boolean).join(' · ')
    : null;

  return (
    <div
      onClick={canClick ? handleClick : undefined}
      style={{
        position: 'relative',
        background: isComplete
          ? `linear-gradient(135deg, var(--panel) 0%, rgba(${module.color.replace('#','')},0.05) 100%)`
          : 'var(--panel)',
        border: `1px solid ${isComplete ? module.color + '44' : isUnlocked ? 'var(--border-glow)' : 'var(--border)'}`,
        borderRadius: 18,
        padding: '28px 28px 24px',
        cursor: canClick ? 'pointer' : 'default',
        opacity: isLocked ? 0.45 : 1,
        transition: 'all 0.25s',
        overflow: 'hidden',
        animation: `fadeUp 0.5s ease-out ${index * 0.07}s both`,
      }}
      onMouseEnter={e => {
        if (canClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 30px ${module.glow}`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top shimmer line on complete */}
      {isComplete && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${module.color}, transparent)`,
        }} />
      )}

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -30, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${module.glow} 0%, transparent 70%)`,
        opacity: isComplete ? 1 : isUnlocked ? 0.5 : 0.2,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        {/* Row: Icon + status badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          {/* Icon */}
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: isComplete
              ? `linear-gradient(135deg, ${module.color} 0%, ${module.color}88 100%)`
              : isUnlocked
              ? `linear-gradient(135deg, ${module.color}33 0%, transparent 100%)`
              : 'var(--panel-alt)',
            border: `1px solid ${isComplete ? module.color + '66' : isUnlocked ? module.color + '33' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: isComplete ? `0 0 16px ${module.glow}` : 'none',
          }}>
            <span style={{ color: isComplete ? '#FDEECB' : isUnlocked ? module.color : 'var(--muted)' }}>
              {module.icon}
            </span>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px',
            borderRadius: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: isComplete
              ? `${module.color}22`
              : isUnlocked
              ? 'rgba(201,151,58,0.12)'
              : isComingSoon
              ? 'rgba(100,100,100,0.12)'
              : 'rgba(100,100,100,0.08)',
            color: isComplete
              ? module.color
              : isUnlocked
              ? 'var(--accent)'
              : 'var(--muted)',
            border: `1px solid ${isComplete ? module.color + '33' : isUnlocked ? 'rgba(201,151,58,0.2)' : 'var(--border)'}`,
          }}>
            {isComplete && <><CheckIcon /> Complete</>}
            {isUnlocked && <>Start</>}
            {isLocked && <><LockIcon /> &nbsp;Locked</>}
            {isComingSoon && <>Coming Soon</>}
          </div>
        </div>

        {/* Text */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
          {module.subtitle}
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          {module.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
          {module.description}
        </p>

        {/* Preview of answers if complete */}
        {preview && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10, border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            "{preview.length > 120 ? preview.slice(0, 120) + '…' : preview}"
          </div>
        )}

        {/* CTA arrow */}
        {(isUnlocked || isComplete) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 18,
            fontSize: 13, fontWeight: 700,
            color: isComplete ? module.color : 'var(--accent)',
          }}>
            {isComplete ? 'Review & Edit' : 'Begin Session'}
            <ArrowIcon />
          </div>
        )}
      </div>
    </div>
  );
}

export function HomeScreen({ data, completedIds, isLoggedIn, onStartModule, onViewDashboard, onLogout }) {
  const unlockStatus = getUnlockStatus(completedIds);
  const completedCount = completedIds.length;
  const totalActive = MODULES.filter(m => !m.comingSoon).length;
  const progressPct = Math.round((completedCount / totalActive) * 100);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Hero / Progress header */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>
          Leadership Operating System
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 10px', lineHeight: 1.1 }}>
              Your Operating<br/>
              <span className="gold-gradient">System</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>
              {completedCount === 0
                ? 'Start with your Mission — the foundation of everything.'
                : `${completedCount} of ${totalActive} foundation modules complete.`}
            </p>
          </div>

          {completedCount > 0 && (
            <button
              onClick={onViewDashboard}
              style={{
                padding: '12px 22px',
                background: 'linear-gradient(135deg, rgba(201,151,58,0.15) 0%, rgba(201,151,58,0.05) 100%)',
                border: '1px solid rgba(201,151,58,0.3)',
                borderRadius: 12, color: 'var(--accent)',
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201,151,58,0.22) 0%, rgba(201,151,58,0.1) 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201,151,58,0.15) 0%, rgba(201,151,58,0.05) 100%)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              View Dashboard
            </button>
          )}
        </div>

        {/* Overall progress bar */}
        {completedCount > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Foundation Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{progressPct}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 9999 }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, var(--ruby), var(--accent))',
                borderRadius: 9999,
                transition: 'width 0.8s ease',
                boxShadow: '0 0 10px rgba(201,151,58,0.4)',
              }} />
            </div>
          </div>
        )}
      </div>

      <div className="gold-rule" style={{ marginBottom: 40 }} />

      {/* Module grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 18,
      }}>
        {MODULES.map((mod, idx) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            status={unlockStatus[mod.id]}
            moduleData={data.modules[mod.id]}
            onStart={onStartModule}
            index={idx}
          />
        ))}
      </div>

      {/* Bottom note */}
      <div style={{
        marginTop: 40, textAlign: 'center',
        fontSize: 12, color: 'var(--muted)',
        padding: '20px 0',
        borderTop: '1px solid var(--border)',
      }}>
        ✦ Complete each module to unlock the next step in your Leadership Operating System
      </div>
    </div>
  );
}
