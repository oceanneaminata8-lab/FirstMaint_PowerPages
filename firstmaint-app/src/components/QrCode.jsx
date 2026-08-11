import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// QR code imprimable pour un actif (US-01, point d'attention 1.6). Encode le
// code inventaire — la "lecture" ailleurs dans l'app (tickets, création d'OT)
// reste une saisie manuelle du code, faute de caméra disponible ici.
export function QrCode({ valeur, taille = 120 }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    let annule = false
    if (!valeur) { setDataUrl(null); return }
    QRCode.toDataURL(valeur, { width: taille, margin: 1 })
      .then((url) => { if (!annule) setDataUrl(url) })
      .catch(() => { if (!annule) setDataUrl(null) })
    return () => { annule = true }
  }, [valeur, taille])

  if (!valeur) return null

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {dataUrl && <img src={dataUrl} alt={`QR code ${valeur}`} width={taille} height={taille} />}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)' }}>{valeur}</span>
    </div>
  )
}
