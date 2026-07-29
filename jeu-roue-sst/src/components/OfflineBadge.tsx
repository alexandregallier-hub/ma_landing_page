'use client'

import { useEffect, useState } from 'react'
import { isPersistenceDegraded } from '@/lib/game/persistence'

/**
 * Signalisation réseau NON BLOQUANTE.
 *
 * Règle absolue de ce projet : jamais de modale, jamais de spinner plein écran,
 * jamais de bouton désactivé à cause du réseau. Toute interface bloquante liée
 * à la connexion est un défaut de conception dans ce contexte — la partie doit
 * pouvoir se dérouler entièrement hors ligne, et le message doit rassurer plutôt
 * qu'alarmer.
 */
export function OfflineBadge({ pendingSync }: { pendingSync: number }) {
  const [offline, setOffline] = useState(false)
  const [degraded, setDegraded] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    setDegraded(isPersistenceDegraded())

    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline && !degraded) return null

  return (
    <div className="no-print pointer-events-none fixed bottom-3 left-3 z-40 space-y-1.5">
      {offline && (
        <p
          className="rounded-full px-3 py-1.5 text-sm font-semibold shadow"
          style={{ background: 'var(--brand-accent)', color: '#fff' }}
          role="status"
        >
          Hors ligne — la partie continue
          {pendingSync > 0 && ', synchronisation plus tard'}
        </p>
      )}
      {degraded && (
        <p
          className="rounded-full px-3 py-1.5 text-sm font-semibold shadow"
          style={{ background: 'var(--brand-text-muted)', color: '#fff' }}
          role="status"
        >
          Stockage local indisponible — ne fermez pas cet onglet
        </p>
      )}
    </div>
  )
}
