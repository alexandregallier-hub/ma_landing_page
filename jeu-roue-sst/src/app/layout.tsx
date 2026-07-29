import type { Metadata, Viewport } from 'next'
import './globals.css'
import { loadActiveBrand } from '@/lib/branding/load'
import { tokensToCss } from '@/lib/branding/to-css'
import { SyncBoot } from '@/components/SyncBoot'

export const metadata: Metadata = {
  title: 'Roue de la prévention SST',
  description: 'Jeu d’animation de sessions de sensibilisation santé-sécurité au travail',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // L'écran de jeu est projeté : pas de zoom accidentel au trackpad.
  maximumScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await loadActiveBrand()

  return (
    <html lang="fr">
      <head>
        {/*
          Injection des tokens de charte côté SERVEUR.
          Conséquences : aucun flash de charte au chargement, aucune hydratation
          à payer, et aucun rebuild ni redéploiement pour changer de charte.
        */}
        <style
          id="brand-tokens"
          // eslint-disable-next-line react/no-danger -- valeurs filtrées par tokensToCss()
          dangerouslySetInnerHTML={{ __html: tokensToCss(brand.tokens) }}
        />
      </head>
      <body>
        <SyncBoot />
        {children}
      </body>
    </html>
  )
}
