/**
 * Synchronisation différée vers le serveur.
 *
 * Le jeu est local-first : le réseau n'est requis qu'AVANT la séance
 * (chargement de la banque) et APRÈS (remontée du récapitulatif). Pendant les
 * 45 minutes de jeu, zéro requête. Si le wifi du client est mort toute la
 * séance, tout remonte au prochain retour en ligne.
 */

import { dequeue, markAttempt, readOutbox, type OutboxEntry } from './persistence'

const FLUSH_INTERVAL_MS = 10_000

let flushing = false
let timer: ReturnType<typeof setInterval> | null = null
const listeners = new Set<(pending: number) => void>()

function notify(pending: number) {
  for (const listener of listeners) listener(pending)
}

export function onPendingChange(listener: (pending: number) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Vide la file d'attente. Sans effet si on est hors ligne ou si un flush est
 * déjà en cours. Ne lève jamais : un échec réseau laisse simplement l'entrée
 * dans la file pour la prochaine tentative.
 */
export async function flushOutbox(): Promise<void> {
  if (flushing) return
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return

  flushing = true
  try {
    const outbox = await readOutbox()
    for (const entry of outbox) {
      const ok = await send(entry)
      if (ok) {
        await dequeue(entry.clientEventId)
      } else {
        await markAttempt(entry.clientEventId)
        // On s'arrête au premier échec : inutile de marteler un réseau mort.
        break
      }
    }
    notify((await readOutbox()).length)
  } finally {
    flushing = false
  }
}

async function send(entry: OutboxEntry): Promise<boolean> {
  try {
    const response = await fetch('/api/sessions/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry.payload),
    })

    // 2xx : accepté. 4xx : le serveur refuse définitivement (payload invalide,
    // session inconnue) — insister ne servirait à rien et bloquerait la file.
    if (response.ok) return true
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      console.error('[sync] rejet définitif du serveur', response.status, await response.text().catch(() => ''))
      return true
    }
    return false
  } catch {
    // Réseau indisponible : on retentera.
    return false
  }
}

/**
 * Branche les déclencheurs de flush. À appeler une fois côté client.
 * @returns fonction de désabonnement
 */
export function startSyncLoop(): () => void {
  if (typeof window === 'undefined') return () => {}

  const attempt = () => {
    void flushOutbox()
  }

  window.addEventListener('online', attempt)
  document.addEventListener('visibilitychange', attempt)
  timer = setInterval(attempt, FLUSH_INTERVAL_MS)
  attempt()

  return () => {
    window.removeEventListener('online', attempt)
    document.removeEventListener('visibilitychange', attempt)
    if (timer) clearInterval(timer)
    timer = null
  }
}
