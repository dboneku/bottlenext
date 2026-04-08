export function AGCLogo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Aligned Growth Shield"
    >
      <defs>
        <linearGradient id="agc-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D78C" />
          <stop offset="40%" stopColor="#C9973A" />
          <stop offset="100%" stopColor="#9B6E1A" />
        </linearGradient>
        <linearGradient id="agc-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1B1033" />
          <stop offset="100%" stopColor="#0D0820" />
        </linearGradient>
      </defs>

      {/* ── Shield body ───────────────────────────── */}
      {/* Outer shield silhouette — classic heraldic shape */}
      <path
        d="M50 106
           C50 106 10 90 10 52
           L10 22
           L50 14
           L90 22
           L90 52
           C90 90 50 106 50 106Z"
        fill="url(#agc-fill)"
        stroke="url(#agc-gold)"
        strokeWidth="2.5"
      />

      {/* Inner shield bevel line */}
      <path
        d="M50 97
           C50 97 18 83 18 52
           L18 28
           L50 21
           L82 28
           L82 52
           C82 83 50 97 50 97Z"
        fill="none"
        stroke="url(#agc-gold)"
        strokeWidth="0.8"
        opacity="0.45"
      />

      {/* ── Decorative scrollwork top ─────────────── */}
      {/* Left volute */}
      <path
        d="M30 14 C26 12 22 14 22 17 C22 20 28 21 32 17"
        stroke="url(#agc-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right volute */}
      <path
        d="M70 14 C74 12 78 14 78 17 C78 20 72 21 68 17"
        stroke="url(#agc-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Centre finial */}
      <circle cx="50" cy="10" r="2.5" fill="url(#agc-gold)" opacity="0.9" />
      <line x1="50" y1="12.5" x2="50" y2="17" stroke="url(#agc-gold)" strokeWidth="1.2" />

      {/* ── Monogram "AGC" ────────────────────────── */}
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fill="url(#agc-gold)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="bold"
        letterSpacing="-1"
      >
        AGC
      </text>

      {/* Bottom ornament rule */}
      <line x1="30" y1="74" x2="70" y2="74" stroke="url(#agc-gold)" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

// Generates an SVG data-URI suitable for use as a favicon
export function agcFaviconSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5D78C"/>
      <stop offset="100%" stop-color="#9B6E1A"/>
    </linearGradient>
  </defs>
  <path d="M50 106C50 106 10 90 10 52L10 22L50 14L90 22L90 52C90 90 50 106 50 106Z"
        fill="#1B1033" stroke="url(#g)" stroke-width="2.5"/>
  <text x="50" y="66" text-anchor="middle" fill="url(#g)"
        font-family="Georgia,serif" font-size="28" font-weight="bold" letter-spacing="-1">AGC</text>
</svg>`;
}
