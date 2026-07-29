import { GameScreen } from '@/components/GameScreen'

export const metadata = { title: 'Partie en cours — Roue de la prévention SST' }

/**
 * L'écran de jeu est entièrement côté client : la partie vit dans le store local,
 * et AUCUNE requête serveur n'a lieu entre deux questions. Le cold start Vercel
 * (2 à 3 secondes après une période d'inactivité) se paierait sinon en plein
 * silence de salle.
 */
export default function PlayPage() {
  return <GameScreen />
}
