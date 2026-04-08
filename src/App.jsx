import { useState, useEffect, useCallback } from 'react';
import { useCompanyData } from './hooks/useCompanyData';
import { getModule } from './data/modules';
import { HomeScreen } from './components/home/HomeScreen';
import { GuidedChat } from './components/chat/GuidedChat';
import { AuthWall } from './components/auth/AuthWall';
import { CompanyDashboard } from './components/dashboard/CompanyDashboard';
import { AGCLogo } from './components/shared/AGCLogo';

// Map screen names to URL paths
const SCREEN_PATHS = {
  home: '/',
  auth: '/sign-in',
  dashboard: '/dashboard',
};

const pathToScreen = (path) => {
  if (path.startsWith('/module/')) return 'module';
  if (path === '/dashboard') return 'dashboard';
  if (path === '/sign-in') return 'auth';
  return 'home';
};

export default function App() {
  const {
    user,
    modules,
    isLoggedIn,
    isReady,
    loading,
    completedIds,
    completeModule,
    syncProfile,
    logout,
  } = useCompanyData();

  const initialPath = window.location.pathname;
  const initialModuleId = initialPath.startsWith('/module/') ? initialPath.split('/module/')[1] : null;

  const [screen, setScreenState] = useState(() => pathToScreen(initialPath));
  const [activeModuleId, setActiveModuleId] = useState(initialModuleId);
  const [pendingModuleId, setPendingModuleId] = useState(null);
  const [pendingAnswers, setPendingAnswers] = useState(null);

  // History-aware screen setter
  const setScreen = useCallback((newScreen, moduleId = null) => {
    const path = moduleId
      ? `/module/${moduleId}`
      : (SCREEN_PATHS[newScreen] ?? '/');
    window.history.pushState({ screen: newScreen, moduleId }, '', path);
    setScreenState(newScreen);
    if (moduleId !== undefined) setActiveModuleId(moduleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Browser back/forward
  useEffect(() => {
    const onPop = (e) => {
      const state = e.state;
      if (state) {
        setScreenState(state.screen ?? 'home');
        setActiveModuleId(state.moduleId ?? null);
      } else {
        setScreenState('home');
        setActiveModuleId(null);
      }
    };
    window.addEventListener('popstate', onPop);
    window.history.replaceState(
      { screen: pathToScreen(window.location.pathname), moduleId: initialModuleId },
      '',
      window.location.pathname
    );
    return () => window.removeEventListener('popstate', onPop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // After login, migrate pending data then go home
  useEffect(() => {
    if (isLoggedIn && pendingModuleId && pendingAnswers) {
      completeModule(pendingModuleId, pendingAnswers);
      setPendingModuleId(null);
      setPendingAnswers(null);
      setScreen('home', null);
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--ruby) 0%, var(--accent-dim) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#FDEECB',
            boxShadow: '0 0 30px rgba(201,151,58,0.3)',
            animation: 'pulse-dot 1.5s ease-in-out infinite',
          }}>AG</div>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</p>
        </div>
      </div>
    );
  }

  const activeModule = activeModuleId ? getModule(activeModuleId) : null;

  const handleStartModule = (moduleId) => {
    setScreen('module', moduleId);
  };

  const handleChatComplete = (answers) => {
    if (isLoggedIn) {
      completeModule(activeModuleId, answers);
      setScreen('home', null);
    } else {
      // Hold answers — will be persisted after auth
      setPendingModuleId(activeModuleId);
      setPendingAnswers(answers);
      setScreen('auth', null);
    }
  };

  // Called by AuthWall after successful Firebase sign-in
  const handleAuthSuccess = async (firebaseUser, name) => {
    await syncProfile(firebaseUser, name);
    // Pending data is handled by the useEffect above that watches isLoggedIn
    setScreen('home', null);
  };

  const handleRedo = (moduleId) => {
    setScreen('module', moduleId);
  };

  // Build data object that legacy components expect
  const data = { user, modules };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(155,26,48,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(201,151,58,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 32px',
        background: 'rgba(13,6,8,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <button onClick={() => setScreen('home', null)}
          style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <AGCLogo size={36} />
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Business <span className="gold-gradient">Architect</span>
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {completedIds.length > 0 && screen !== 'dashboard' && (
            <button onClick={() => setScreen('dashboard', null)} style={{
              fontSize: 13, padding: '7px 14px',
              background: 'rgba(201,151,58,0.08)',
              border: '1px solid rgba(201,151,58,0.2)',
              borderRadius: 8, color: 'var(--accent)',
              cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font)',
            }}>Dashboard</button>
          )}

          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user?.photoURL && (
                <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)' }} />
              )}
              {!user?.photoURL && (
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--panel-alt)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                }}>
                  {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                </div>
              )}
              <button onClick={logout} style={{
                fontSize: 13, padding: '7px 14px',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--muted)',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Log Out</button>
            </div>
          ) : (
            <button onClick={() => setScreen('auth', null)} style={{
              fontSize: 13, padding: '7px 14px',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--muted)',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>Sign In</button>
          )}
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ position: 'relative', zIndex: 1, flex: 1, padding: '40px 24px 80px' }}>
        {screen === 'home' && (
          <HomeScreen
            data={data}
            completedIds={completedIds}
            isLoggedIn={isLoggedIn}
            onStartModule={handleStartModule}
            onViewDashboard={() => setScreen('dashboard', null)}
            onLogout={logout}
          />
        )}

        {screen === 'module' && activeModule && (
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <button onClick={() => setScreen('home', null)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, padding: '7px 14px',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                All Modules
              </button>
              <span style={{ fontSize: 13, color: 'var(--border-glow)' }}>›</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{activeModule.title}</span>
            </div>
            <GuidedChat
              key={activeModuleId}
              module={activeModule}
              onComplete={handleChatComplete}
            />
          </div>
        )}

        {screen === 'auth' && (
          <AuthWall onAuthSuccess={handleAuthSuccess} />
        )}

        {screen === 'dashboard' && (
          <CompanyDashboard
            data={data}
            completedIds={completedIds}
            onRedo={handleRedo}
            onClose={() => setScreen('home', null)}
          />
        )}
      </main>
    </div>
  );
}
