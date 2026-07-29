'use client'

import { useEffect } from 'react'
import { startSyncLoop } from '@/lib/game/sync'

/**
 * Démarre la boucle de synchronisation différée et restaure l'échelle de
 * police choisie par l'animateur.
 *
 * Ne rend rien : c'est volontairement un composant sans interface, monté une
 * seule fois dans le layout.
 */
export function SyncBoot() {
  useEffect(() => {
    const stop = startSyncLoop()

    const saved = window.localStorage.getItem('game-scale')
    if (saved) document.documentElement.style.setProperty('--game-scale', saved)

    return stop
  }, [])

  return null
}
