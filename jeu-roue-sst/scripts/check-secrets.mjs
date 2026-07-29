#!/usr/bin/env node
/**
 * Garde-fou : vérifie qu'aucun secret n'a fuité côté client.
 *
 *   npm run check:secrets      (après un `npm run build`)
 *
 * Le piège visé est classique et grave : préfixer la clé service_role par
 * NEXT_PUBLIC_, ou l'importer depuis un composant client. Elle contourne TOUTES
 * les règles RLS — exposée dans le bundle, n'importe quel visiteur peut lire et
 * écrire toute la base.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const problems = []

// --- 1. Aucune variable NEXT_PUBLIC_ ne doit ressembler à un secret ---------
const forbiddenPublicNames = /^NEXT_PUBLIC_.*(SERVICE_ROLE|SECRET|PRIVATE_KEY|PASSWORD)/i

for (const file of ['.env.local', '.env', '.env.production', '.env.example']) {
  const path = join(root, file)
  if (!existsSync(path)) continue
  for (const [i, line] of readFileSync(path, 'utf8').split('\n').entries()) {
    const name = line.split('=')[0]?.trim()
    if (name && forbiddenPublicNames.test(name)) {
      problems.push(`${file}:${i + 1} — « ${name} » expose un secret au navigateur`)
    }
  }
}

// --- 2. Le code source ne doit jamais lire un secret depuis un fichier client
function walk(dir, visit) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, visit)
    else visit(path)
  }
}

const SERVER_ONLY = ['src/lib/supabase/server.ts', 'src/app/api/', 'scripts/']

walk(join(root, 'src'), (path) => {
  if (!/\.(ts|tsx|js|jsx|mjs)$/.test(path)) return
  const relative = path.slice(root.length + 1)
  const content = readFileSync(path, 'utf8')

  if (!content.includes('SUPABASE_SERVICE_ROLE_KEY')) return

  const isServerOnly = SERVER_ONLY.some((allowed) => relative.startsWith(allowed))
  const isClientComponent = /^\s*['"]use client['"]/m.test(content)

  if (isClientComponent) {
    problems.push(`${relative} — un composant client lit SUPABASE_SERVICE_ROLE_KEY`)
  } else if (!isServerOnly) {
    problems.push(`${relative} — lit SUPABASE_SERVICE_ROLE_KEY hors des emplacements serveur autorisés`)
  }
})

// --- 3. Le bundle client construit ne doit contenir aucune clé service_role --
// Un JWT Supabase de rôle service contient "service_role" dans son payload
// base64. On cherche donc la chaîne en clair ET encodée.
const encodedNeedle = Buffer.from('"role":"service_role"').toString('base64').replace(/=+$/, '')
const staticDir = join(root, '.next', 'static')
let bundleScanned = 0

walk(staticDir, (path) => {
  if (!path.endsWith('.js')) return
  bundleScanned++
  const content = readFileSync(path, 'utf8')
  const relative = path.slice(root.length + 1)
  if (content.includes('service_role')) {
    problems.push(`${relative} — le bundle client contient « service_role »`)
  }
  if (encodedNeedle.length > 12 && content.includes(encodedNeedle)) {
    problems.push(`${relative} — le bundle client contient un JWT de rôle service`)
  }
})

// --- Verdict ---------------------------------------------------------------
if (problems.length > 0) {
  console.error('\n✗ Fuite de secret potentielle :\n')
  for (const problem of problems) console.error('  - ' + problem)
  console.error('')
  process.exit(1)
}

console.log(
  bundleScanned > 0
    ? `✓ Aucun secret détecté (${bundleScanned} fichiers de bundle analysés)`
    : '✓ Aucun secret détecté dans les sources (lancez `npm run build` pour analyser aussi le bundle)',
)
