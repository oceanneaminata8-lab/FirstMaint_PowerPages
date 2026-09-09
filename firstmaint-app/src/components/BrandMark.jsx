export function BrandMark({ variant = 'default', compact = false }) {
  return (
    <div className={`brand-mark brand-mark-${variant}${compact ? ' brand-mark-compact' : ''}`} aria-label="FirstMaint">
      <span className="brand-mark-symbol" aria-hidden="true">
        <span className="brand-mark-shield">
          <span className="brand-mark-letters">FM</span>
          <span className="brand-mark-leaf" />
          <span className="brand-mark-check" />
        </span>
      </span>
      <span className="brand-mark-copy">
        <strong>FirstMaint</strong>
        {!compact && <small>Maintenance management</small>}
      </span>
    </div>
  )
}
