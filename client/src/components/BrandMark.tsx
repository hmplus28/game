/**
 * Arena After Dark design reminder: the four-way faceted mark is the recurring
 * premium visual motif; amber signals focus while player colors stay secondary.
 */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup" aria-label="Ludo Arena">
      <img className="brand-mark" src="/manus-storage/ludo-arena-logo_577ea7f6.png" alt="نشان Ludo Arena" />
      {!compact && (
        <span className="brand-wordmark" dir="ltr">
          Ludo <strong>Arena</strong>
        </span>
      )}
    </div>
  );
}
