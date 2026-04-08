import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { AGCLogo } from '../shared/AGCLogo';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}/>
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }}/>
  </svg>
);

export function AuthWall({ onAuthSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(null); // 'google' | 'email' | 'reset' | null

  const clearError = () => setError('');

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    setLoading('google');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onAuthSuccess(result.user, result.user.displayName || '');
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(null);
    }
  };

  // ── Email/Password ────────────────────────────────────────────────────────
  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading('email');
    try {
      let result;
      if (mode === 'signup') {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess(result.user, name || result.user.displayName || '');
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(null);
    }
  };

  // ── Password Reset ────────────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { setError('Enter your email first.'); return; }
    setLoading('reset');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', width: '100%' }}>
      <div className="auth-wall anim-fade-up">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--ruby) 0%, var(--accent-dim) 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
            boxShadow: '0 0 30px rgba(201,151,58,0.3), 0 0 60px rgba(155,26,48,0.2)',
            border: '1px solid rgba(201,151,58,0.2)',
            fontSize: 22,
          }}>
            {mode === 'reset' ? '🔑' : '◎'}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {mode === 'signup' ? 'Save Your Mission' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h2>

          <div className="gold-rule" style={{ margin: '12px auto', maxWidth: 100 }} />

          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 300, margin: '0 auto' }}>
            {mode === 'signup'
              ? 'Create your free account to save your answers and unlock your full Leadership Dashboard.'
              : mode === 'login'
              ? 'Sign in to access your Leadership Operating System.'
              : 'Enter your email and we\'ll send a reset link.'}
          </p>
        </div>

        {/* Google Button */}
        {mode !== 'reset' && (
          <>
            <button onClick={handleGoogle} disabled={!!loading} style={{
              width: '100%', padding: '13px',
              background: 'var(--panel-alt)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              color: 'var(--ink)',
              fontSize: 14, fontWeight: 600, fontFamily: 'var(--font)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--border-glow)'; }}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {loading === 'google' ? <Spinner /> : <GoogleIcon />}
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}

        {/* Email form */}
        <form onSubmit={mode === 'reset' ? handleReset : handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Your Name</label>
              <input type="text" className="auth-input" placeholder="Travis Brown"
                value={name} onChange={e => { setName(e.target.value); clearError(); }} />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" required className="auth-input" placeholder="you@company.com"
              value={email} onChange={e => { setEmail(e.target.value); clearError(); }} />
          </div>

          {mode !== 'reset' && (
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" required className="auth-input"
                placeholder={mode === 'signup' ? 'Create a password (6+ chars)' : 'Your password'}
                minLength={6}
                value={password} onChange={e => { setPassword(e.target.value); clearError(); }} />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(196,31,59,0.1)', border: '1px solid rgba(196,31,59,0.25)',
              fontSize: 13, color: '#F87171',
            }}>{error}</div>
          )}

          {/* Password reset success */}
          {resetSent && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              fontSize: 13, color: '#34D399',
            }}>Password reset email sent! Check your inbox.</div>
          )}

          <button type="submit" className="gold-btn" disabled={!!loading || (mode === 'signup' && !email)} style={{ marginTop: 4 }}>
            {loading === 'email' || loading === 'reset' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Spinner /> {mode === 'reset' ? 'Sending…' : mode === 'signup' ? 'Creating Account…' : 'Signing In…'}
              </span>
            ) : (
              mode === 'reset' ? 'Send Reset Link'
              : mode === 'signup' ? 'Create Free Account'
              : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle & forgot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, textAlign: 'center' }}>
          {mode !== 'reset' && (
            <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); clearError(); }} style={ghostBtnStyle}>
              {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          )}
          {mode === 'login' && (
            <button onClick={() => { setMode('reset'); clearError(); }} style={{ ...ghostBtnStyle, fontSize: 12 }}>
              Forgot password?
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => { setMode('login'); clearError(); setResetSent(false); }} style={ghostBtnStyle}>
              ← Back to Sign In
            </button>
          )}
        </div>

        {mode === 'signup' && (
          <div style={{
            marginTop: 20, padding: '12px 16px',
            background: 'rgba(201,151,58,0.05)',
            border: '1px solid rgba(201,151,58,0.12)',
            borderRadius: 10, textAlign: 'center',
          }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
              ✦ Free forever — no credit card required<br/>
              Premium leadership features coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'var(--muted)', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.1em',
};

const ghostBtnStyle = {
  background: 'none', border: 'none',
  color: 'var(--muted)', fontSize: 13,
  cursor: 'pointer', fontFamily: 'var(--font)',
  textDecoration: 'underline', textDecorationColor: 'var(--border)',
  padding: 0,
};

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with that email already exists. Try signing in instead.';
    case 'auth/invalid-email': return 'That doesn\'t look like a valid email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/user-not-found': return 'No account found with that email.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again in a few minutes.';
    case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    default: return 'Something went wrong. Please try again.';
  }
}
