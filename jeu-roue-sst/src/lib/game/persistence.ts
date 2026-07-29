/**
 * Persistance locale de la partie en cours.
 *
 * IndexedDB via idb-keyval, avec dégradation PROPRE en mémoire : en navigation
 * privée ou avec un stockage bloqué, IndexedDB peut être indisponible. Dans ce
 * cas la partie doit continuer normalement — on perd seulement la reprise après
 * fermeture de l'onglet. Jamais de crash, jamais de message bloquant.
 */

import { clear, del, get, keys, set } from 'idb-keyval'

const SESSION_PREFIX = 'session:'
const OUTBOX_KEY = 'outbox'

/** Basculé à false au premier échec : on n'insiste pas à chaque action. */
let storageAvailable = true
const memoryFallback = new Map<string, unknown>()

export function isPersistenceDegraded(): boolean {
  return !storageAvailable
}

async function safeGet<T>(key: string): Promise<T | undefined> {
  if (!storageAvailable) return memoryFallback.get(key) as T | undefined
  try {
    return await get<T>(key)
  } catch {
    storageAvailable = false
    return memoryFallback.get(key) as T | undefined
  }
}

async function safeSet(key: string, value: unknown): Promise<void> {
  memoryFallback.set(key, value)
  if (!storageAvailable) return
  try {
    await set(key, value)
  } catch {
    storageAvailable = false
  }
}

async function safeDel(key: string): Promise<void> {
  memoryFallback.delete(key)
  if (!storageAvailable) return
  try {
    await del(key)
  } catch {
    storageAvailable = false
  }
}

// --- Partie en cours --------------------------------------------------------

export async function saveSnapshot(clientSessionId: string, state: unknown): Promise<void> {
  await safeSet(SESSION_PREFIX + clientSessionId, state)
}

export async function loadSnapshot<T>(clientSessionId: string): Promise<T | undefined> {
  return safeGet<T>(SESSION_PREFIX + clientSessionId)
}

export async function dropSnapshot(clientSessionId: string): Promise<void> {
  await safeDel(SESSION_PREFIX + clientSessionId)
}

/**
 * Retrouve la partie non terminée la plus récente, pour proposer
 * « Reprendre la session en cours ? » au retour dans l'application.
 */
export async function findResumableSession<T extends { status?: string; startedAt?: string }>(): Promise<
  { clientSessionId: string; state: T } | null
> {
  if (!storageAvailable) {
    for (const [key, value] of memoryFallback) {
      if (key.startsWith(SESSION_PREFIX)) {
        return { clientSessionId: key.slice(SESSION_PREFIX.length), state: value as T }
      }
    }
    return null
  }

  try {
    const allKeys = await keys()
    const candidates: { clientSessionId: string; state: T }[] = []

    for (const key of allKeys) {
      if (typeof key !== 'string' || !key.startsWith(SESSION_PREFIX)) continue
      const state = await get<T>(key)
      if (!state) continue
      if (state.status === 'finished') continue
      candidates.push({ clientSessionId: key.slice(SESSION_PREFIX.length), state })
    }

    candidates.sort((a, b) => (b.state.startedAt ?? '').localeCompare(a.state.startedAt ?? ''))
    return candidates[0] ?? null
  } catch {
    storageAvailable = false
    return null
  }
}

// --- Outbox ----------------------------------------------------------------
//
// File append-only des synchronisations en attente. Chaque entrée porte un
// clientSessionId unique côté serveur : renvoyer deux fois le même
// récapitulatif est donc sans conséquence (INSERT ... ON CONFLICT DO NOTHING).

export interface OutboxEntry {
  clientEventId: string
  clientSessionId: string
  payload: unknown
  queuedAt: string
  attempts: number
}

export async function readOutbox(): Promise<OutboxEntry[]> {
  return (await safeGet<OutboxEntry[]>(OUTBOX_KEY)) ?? []
}

export async function enqueue(entry: OutboxEntry): Promise<void> {
  const outbox = await readOutbox()
  // Idempotence côté client aussi : ne pas empiler deux fois le même événement.
  if (outbox.some((e) => e.clientEventId === entry.clientEventId)) return
  await safeSet(OUTBOX_KEY, [...outbox, entry])
}

export async function dequeue(clientEventId: string): Promise<void> {
  const outbox = await readOutbox()
  await safeSet(
    OUTBOX_KEY,
    outbox.filter((e) => e.clientEventId !== clientEventId),
  )
}

export async function markAttempt(clientEventId: string): Promise<void> {
  const outbox = await readOutbox()
  await safeSet(
    OUTBOX_KEY,
    outbox.map((e) => (e.clientEventId === clientEventId ? { ...e, attempts: e.attempts + 1 } : e)),
  )
}

/** Uniquement pour le développement et les tests manuels. */
export async function wipeAll(): Promise<void> {
  memoryFallback.clear()
  if (!storageAvailable) return
  try {
    await clear()
  } catch {
    storageAvailable = false
  }
}
