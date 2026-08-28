import { useState } from 'react'

// Fil de discussion sur un ticket — l'espace où le site demandeur peut
// échanger avec la DMG (la banque). `estReponseBanque` distingue visuellement
// les messages des deux côtés.
export function DiscussionTicket({ commentaires, chargement, onEnvoyer }) {
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function envoyer(e) {
    e.preventDefault()
    if (!message.trim()) return
    setEnvoi(true)
    try {
      await onEnvoyer(message.trim())
      setMessage('')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="discussion-ticket">
      {chargement ? (
        <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>Chargement de la discussion…</p>
      ) : commentaires.length === 0 ? (
        <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>Aucun message pour l'instant.</p>
      ) : (
        <div className="discussion-fil">
          {commentaires.map((c) => (
            <div key={c.id} className={`discussion-message ${c.estReponseBanque ? 'reponse-banque' : 'message-site'}`}>
              <div className="discussion-message-header">
                <strong>{c.estReponseBanque ? `${c.auteur} — DMG Afriland` : c.auteur}</strong>
                <span>{c.date ? new Date(c.date).toLocaleString('fr-FR') : ''}</span>
              </div>
              <p>{c.message}</p>
            </div>
          ))}
        </div>
      )}

      <form className="discussion-form" onSubmit={envoyer}>
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrire un message à la DMG…"
        />
        <button type="submit" className="btn" disabled={envoi || !message.trim()}>
          {envoi ? 'Envoi…' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}
