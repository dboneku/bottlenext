export function AGCLogo({ size = 40, className = "" }) {
  return (
    <img 
      src="/logo.avif" 
      alt="Aligned Growth Shield" 
      width={size} 
      height={size} 
      className={className}
      style={{ display: 'block', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
    />
  );
}
