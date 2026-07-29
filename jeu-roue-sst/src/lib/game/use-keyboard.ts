'use client'

import { useEffect } from 'react'

export interface KeyboardHandlers {
  /** ESPACE, ENTRÉE (hors question), PageDown */
  onSpin: () => void
  /** 1 à 4 */
  onAnswer: (index: number) => void
  /** ENTRÉE pendant une question */
  onValidate: () => void
  /** ENTRÉE après validation */
  onNext: () => void
  /** Backspace / PageUp */
  onUndo: () => void
  /** ÉCHAP */
  onEscape: () => void
  /** F */
  onFullscreen: () => void
  /** + / − */
  onScale: (delta: number) => void
  phase: 'idle' | 'spinning' | 'question' | 'reveal' | 'finished'
}

/**
 * UN SEUL handler clavier global. Les composants n'écoutent rien : deux
 * chemins d'entrée finiraient par diverger, et un double déclenchement en
 * séance est immédiatement visible.
 *
 * Pièges traités ici, tous rencontrés en vrai :
 *   - ESPACE fait défiler la page sous le projecteur → preventDefault ;
 *   - ESPACE tapé dans un champ de saisie ne doit PAS lancer la roue → on
 *     ignore l'événement si la cible est un input, textarea, select ou
 *     contenteditable (sinon l'admin devient inutilisable) ;
 *   - un bouton resté focusé après un clic souris est réactivé par ESPACE →
 *     blur() côté composant, plus la garde d'état ci-dessous ;
 *   - `code` et non `key` : identique sur macOS et Windows, et insensible à la
 *     disposition du clavier (AZERTY, QWERTY, QWERTZ).
 *
 * PageDown / PageUp sont mappés volontairement : ils correspondent aux
 * télécommandes de présentation, donc l'animateur peut piloter debout, loin du
 * PC. C'est un détail terrain qui vaut plus que bien des fonctionnalités.
 */
export function useKeyboard(handlers: KeyboardHandlers) {
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      )
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return
      // On ne marche pas sur les raccourcis système (Cmd+R, Ctrl+T…).
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const { phase } = handlers

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          if (phase === 'idle') handlers.onSpin()
          break

        case 'PageDown':
          event.preventDefault()
          if (phase === 'idle') handlers.onSpin()
          else if (phase === 'question') handlers.onValidate()
          else if (phase === 'reveal') handlers.onNext()
          break

        case 'Enter':
        case 'NumpadEnter':
          event.preventDefault()
          if (phase === 'idle') handlers.onSpin()
          else if (phase === 'question') handlers.onValidate()
          else if (phase === 'reveal') handlers.onNext()
          break

        case 'Digit1':
        case 'Numpad1':
          if (phase === 'question') { event.preventDefault(); handlers.onAnswer(0) }
          break
        case 'Digit2':
        case 'Numpad2':
          if (phase === 'question') { event.preventDefault(); handlers.onAnswer(1) }
          break
        case 'Digit3':
        case 'Numpad3':
          if (phase === 'question') { event.preventDefault(); handlers.onAnswer(2) }
          break
        case 'Digit4':
        case 'Numpad4':
          if (phase === 'question') { event.preventDefault(); handlers.onAnswer(3) }
          break

        case 'Backspace':
        case 'PageUp':
          event.preventDefault()
          handlers.onUndo()
          break

        case 'Escape':
          handlers.onEscape()
          break

        case 'KeyF':
          event.preventDefault()
          handlers.onFullscreen()
          break

        case 'Equal':
        case 'NumpadAdd':
          event.preventDefault()
          handlers.onScale(0.1)
          break

        case 'Minus':
        case 'NumpadSubtract':
          event.preventDefault()
          handlers.onScale(-0.1)
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}

/** Échelle de police persistée : un Mac en écran dupliqué tombe à la
 *  résolution du projecteur et la mise en page saute. */
export function applyScale(delta: number): number {
  const current = Number(window.localStorage.getItem('game-scale') ?? '1')
  const next = Math.min(1.6, Math.max(0.7, Math.round((current + delta) * 10) / 10))
  window.localStorage.setItem('game-scale', String(next))
  document.documentElement.style.setProperty('--game-scale', String(next))
  return next
}

export function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen()
  } else {
    void document.documentElement.requestFullscreen().catch(() => {
      // Refusé par le navigateur (pas de geste utilisateur) : sans conséquence.
    })
  }
}
