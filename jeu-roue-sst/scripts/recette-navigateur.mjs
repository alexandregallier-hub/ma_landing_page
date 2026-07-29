/**
 * Recette automatisée du jeu, au navigateur, contre le mode démo (/demo) —
 * donc sans avoir besoin de Supabase.
 *
 * Couvre : le déroulé complet d'une partie au clavier, l'attribution des
 * réponses par équipe, le mode sans équipe, l'absence de débordement en
 * 1024×768 (résolution encore courante des vidéoprojecteurs de salle) comme en
 * 1920×1080, l'anti double-rotation, l'annulation, la reprise de session après
 * fermeture de l'onglet, et le déroulé complet HORS LIGNE.
 *
 * Prérequis :
 *   npm i -D playwright        (non installé par défaut : ~300 Mo)
 *   npm run dev -- -p 3100     (dans un autre terminal)
 *   node scripts/recette-navigateur.mjs
 *
 * Variables : RECETTE_URL (défaut http://localhost:3100), RECETTE_OUT (captures).
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.RECETTE_URL ?? 'http://localhost:3100'
const OUT = process.env.RECETTE_OUT ?? '.recette'
mkdirSync(OUT, { recursive: true })

// Chromium préinstallé sur certains environnements ; sinon Playwright résout seul.
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM ?? undefined

const problems = []
const notes = []
function check(ok, label) {
  if (ok) notes.push('  ✓ ' + label)
  else problems.push('  ✗ ' + label)
}


/** Attend la fin de la rotation de façon déterministe : le bouton « Valider »
 *  n'existe qu'en phase 'question'. Un sleep fixe serait fragile sous charge. */
async function waitForQuestion(page) {
  await page.getByRole('button', { name: /Valider les réponses/ }).waitFor({ timeout: 20000 })
  await page.waitForTimeout(120)
}

const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {})

async function run(width, height, tag, { screenshots = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

  // --- Setup ---
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' })
  check(await page.getByText('Mode démonstration', { exact: true }).isVisible(), `[${tag}] page démo affichée`)

  await page.getByRole('button', { name: '4 équipes', exact: true }).click()
  const nameInputs = page.locator('input[aria-label^="Nom de l’équipe"]')
  const names = ['Les Casques', 'Zéro Risque', 'Vigilants', 'Prévention+']
  for (let i = 0; i < 4; i++) await nameInputs.nth(i).fill(names[i])
  await page.locator('#client').fill('Métallerie Dupont')
  await page.locator('#limite').fill('5')

  if (screenshots) await page.screenshot({ path: `${OUT}/01-setup-${tag}.png`, fullPage: true })

  await page.getByRole('button', { name: 'Démarrer la session' }).click()
  await page.waitForURL('**/jouer')
  await page.waitForTimeout(600)

  check(await page.getByText('Lancez la roue').isVisible(), `[${tag}] écran de jeu prêt`)
  for (const n of names) {
    check(await page.getByText(n, { exact: true }).first().isVisible(), `[${tag}] équipe « ${n} » visible`)
  }

  // --- Pas de scroll : le critère qui casse le plus souvent en séance ---
  const noScroll = async (label) => {
    const m = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      y: document.documentElement.scrollHeight - document.documentElement.clientHeight,
    }))
    check(m.x <= 1 && m.y <= 1, `[${tag}] aucun débordement ${label} (x=${m.x} y=${m.y})`)
  }
  await noScroll('avant la première question')

  if (screenshots) await page.screenshot({ path: `${OUT}/02-roue-${tag}.png` })

  // --- Une partie complète de 5 questions au clavier ---
  const themesSeen = []
  const statements = []

  for (let round = 1; round <= 5; round++) {
    await page.keyboard.press('Space')
    await waitForQuestion(page)

    const themeBadge = page.locator('main p.uppercase').first()
    const isDebate = await page.getByRole('button', { name: /Voir la réponse attendue/ }).isVisible().catch(() => false)

    if (round === 1) {
      check(await themeBadge.isVisible(), `[${tag}] thème affiché après la rotation`)
      if (screenshots) await page.screenshot({ path: `${OUT}/03-question-${tag}.png` })
    }

    themesSeen.push((await themeBadge.textContent().catch(() => '')) ?? '')
    const h2 = await page.locator('main h2').first().textContent().catch(() => '')
    statements.push(h2 ?? '')

    if (isDebate) {
      // L'attendu ne doit PAS être visible d'emblée : l'écran est projeté.
      if (round === 1) {
        check(!(await page.getByText(/^Attendu/).isVisible().catch(() => false)),
          `[${tag}] la réponse attendue n'est pas projetée avant que les équipes répondent`)
      }
      await page.getByRole('button', { name: /Voir la réponse attendue/ }).click()
      await page.waitForTimeout(150)
      if (round === 1) {
        check(await page.getByText('Réponse attendue', { exact: true }).isVisible(),
          `[${tag}] la réponse attendue s'affiche à la demande de l'animateur`)
      }
      // Question de débat : l'animateur tranche par équipe.
      const correctButtons = page.getByRole('button', { name: 'Correct', exact: true })
      const count = await correctButtons.count()
      check(count === 4, `[${tag}] question de débat : 4 boutons Correct (un par équipe), vu ${count}`)
      for (let i = 0; i < count; i++) await correctButtons.nth(i).click()
    } else {
      // Défaut : la touche 1 place TOUTES les équipes sur la réponse 1.
      await page.keyboard.press('Digit1')
      await page.waitForTimeout(150)

      if (round === 1) {
        // Un QCM à réponses MULTIPLES se comporte différemment, et c'est voulu :
        // cliquer une réponse AJOUTE l'option à la sélection de l'équipe au lieu
        // de la remplacer — une équipe peut donc figurer sur plusieurs cartes.
        const isMulti = await page.getByText('Plusieurs réponses attendues.').isVisible().catch(() => false)

        const chipsOnFirst = await page.locator('.answer').first().locator('.team-chip').count()
        check(chipsOnFirst === 4, `[${tag}] touche 1 → les 4 équipes se placent (vu ${chipsOnFirst})`)

        // Placement fin : clic sur un pion, puis clic sur une autre réponse.
        await page.locator('.answer').first().locator('.team-chip').first().click()
        await page.waitForTimeout(120)
        const selected = await page.locator('.team-chip[data-selected="true"]').count()
        check(selected === 1, `[${tag}] clic sur un pion → il est sélectionné (vu ${selected})`)

        await page.locator('.answer').nth(1).click()
        await page.waitForTimeout(150)
        const onFirst = await page.locator('.answer').first().locator('.team-chip').count()
        const onSecond = await page.locator('.answer').nth(1).locator('.team-chip').count()

        if (isMulti) {
          check(onFirst === 4 && onSecond === 1,
            `[${tag}] QCM multiple : l'équipe s'ajoute à la réponse 2 sans quitter la 1 (${onFirst} / ${onSecond})`)
          // Deux chips pour la même équipe épinglée → 2 éléments marqués.
          check(await page.locator('.team-chip[data-pinned="true"]').count() === 2,
            `[${tag}] QCM multiple : l'équipe déplacée est épinglée sur ses deux réponses`)
        } else {
          check(onFirst === 3 && onSecond === 1,
            `[${tag}] l'équipe a bien migré vers la réponse 2 (${onFirst} / ${onSecond})`)
          check(await page.locator('.team-chip[data-pinned="true"]').count() === 1,
            `[${tag}] l'équipe déplacée est épinglée`)
        }

        // Un clic sur une 3e réponse ne doit PAS déplacer l'équipe épinglée.
        await page.locator('.answer').nth(2).click()
        await page.waitForTimeout(150)
        const stillOnSecond = await page.locator('.answer').nth(1).locator('.team-chip').count()
        check(stillOnSecond === 1, `[${tag}] l'équipe épinglée reste en place (vu ${stillOnSecond})`)
      }
    }

    await page.keyboard.press('Enter') // valider
    await page.waitForTimeout(300)

    if (round === 1) {
      check(await page.getByText('À retenir').isVisible(), `[${tag}] commentaire pédagogique affiché`)
      await noScroll('avec la correction affichée')
      if (screenshots) await page.screenshot({ path: `${OUT}/04-correction-${tag}.png` })
    }

    await page.keyboard.press('Enter') // suivant / résultats
    await page.waitForTimeout(400)
  }

  // --- Podium ---
  check(await page.getByText('Fin de partie').isVisible(), `[${tag}] podium atteint après 5 questions`)
  check(await page.getByText('Résultats — Métallerie Dupont').isVisible(), `[${tag}] nom du client repris`)
  const medals = await page.getByText('🥇').count()
  check(medals >= 1, `[${tag}] médaille attribuée`)
  if (screenshots) await page.screenshot({ path: `${OUT}/05-podium-${tag}.png`, fullPage: true })

  // --- Aucune question ne doit revenir ---
  const unique = new Set(statements.filter(Boolean))
  check(unique.size === statements.filter(Boolean).length,
    `[${tag}] aucune question répétée (${unique.size}/${statements.filter(Boolean).length})`)

  // --- Jamais deux fois le même thème d'affilée ---
  let consecutive = false
  for (let i = 1; i < themesSeen.length; i++) if (themesSeen[i] && themesSeen[i] === themesSeen[i - 1]) consecutive = true
  check(!consecutive, `[${tag}] jamais deux fois le même thème d'affilée`)

  check(consoleErrors.length === 0, `[${tag}] aucune erreur console (${consoleErrors.length})`)
  if (consoleErrors.length) console.log('    erreurs :', consoleErrors.slice(0, 5))

  await context.close()
  return { themesSeen, statements }
}

// ---------------------------------------------------------------------------
console.log('\n=== Recette 1024×768 (projecteur de salle) ===')
const small = await run(1024, 768, '1024×768', { screenshots: true })

console.log('\n=== Recette 1920×1080 ===')
await run(1920, 1080, '1920×1080')

// ---------------------------------------------------------------------------
// Mode sans équipe
console.log('\n=== Mode sans équipe ===')
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Sans équipe' }).click()
  await page.locator('#limite').fill('2')
  check(!(await page.getByText('Équipes', { exact: true }).isVisible().catch(() => false)),
    '[solo] la section Équipes disparaît')

  await page.getByRole('button', { name: 'Démarrer la session' }).click()
  await page.waitForURL('**/jouer')
  await page.waitForTimeout(500)
  check(await page.getByText('Bonnes réponses').isVisible(), '[solo] compteur de bonnes réponses affiché')
  check((await page.locator('.team-chip').count()) === 0, '[solo] aucun pion d’équipe')

  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Space')
    await waitForQuestion(page)
    const isDebate = await page.getByRole('button', { name: /Voir la réponse attendue/ }).isVisible().catch(() => false)
    if (isDebate) await page.getByRole('button', { name: 'Correct', exact: true }).first().click()
    else await page.keyboard.press('Digit1')
    await page.waitForTimeout(150)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(400)
  }
  check(await page.getByText('Fin de partie').isVisible(), '[solo] podium atteint')
  await page.screenshot({ path: `${OUT}/06-solo-podium.png`, fullPage: true })
  check(errors.length === 0, `[solo] aucune erreur page (${errors.length})`)
  await context.close()
}

// ---------------------------------------------------------------------------
// Espace après un clic souris sur la roue → UNE seule rotation
console.log('\n=== Anti double-rotation (clic souris puis Espace) ===')
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' })
  await page.locator('#limite').fill('3')
  await page.getByRole('button', { name: 'Démarrer la session' }).click()
  await page.waitForURL('**/jouer')
  await page.waitForTimeout(500)

  await page.getByRole('button', { name: /Lancer la roue/ }).click()
  await page.waitForTimeout(300)
  await page.keyboard.press('Space') // doit être ignoré : phase 'spinning'
  await waitForQuestion(page)

  const questionCount = await page.locator('main h2').count()
  check(questionCount === 1, `[double] une seule question affichée (vu ${questionCount})`)
  check(await page.getByText('Question 0 / 3').isVisible(), '[double] compteur toujours à 0 avant validation')

  // Annulation
  await page.keyboard.press('Digit1')
  await page.waitForTimeout(150)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  check(await page.getByText('Question 1 / 3').isVisible(), '[undo] compteur à 1 après validation')
  await page.keyboard.press('Backspace')
  await page.waitForTimeout(300)
  check(await page.getByText('Question 0 / 3').isVisible(), '[undo] Retour arrière annule la validation')

  await context.close()
}

// ---------------------------------------------------------------------------
// Reprise de session après fermeture de l'onglet
console.log('\n=== Reprise de session ===')
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  let page = await context.newPage()
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' })
  await page.locator('#client').fill('Test Reprise')
  await page.locator('#limite').fill('6')
  await page.getByRole('button', { name: 'Démarrer la session' }).click()
  await page.waitForURL('**/jouer')
  await page.waitForTimeout(500)

  // Deux questions jouées
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Space')
    await waitForQuestion(page)
    const isDebate = await page.getByRole('button', { name: /Voir la réponse attendue/ }).isVisible().catch(() => false)
    if (isDebate) {
      const b = page.getByRole('button', { name: 'Correct', exact: true })
      for (let k = 0; k < (await b.count()); k++) await b.nth(k).click()
    } else await page.keyboard.press('Digit1')
    await page.waitForTimeout(150)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(400)
  }
  const scoreBefore = await page.locator('.team-chip').first().textContent()

  // On ferme l'onglet et on rouvre : IndexedDB survit dans le même contexte.
  await page.close()
  page = await context.newPage()
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  check(await page.getByText('Reprendre la session en cours ?').isVisible(),
    '[reprise] proposition de reprise affichée')
  check(await page.getByText(/2 question\(s\)\s+déjà posée/).isVisible().catch(() => false),
    '[reprise] nombre de questions déjà posées indiqué')
  await page.screenshot({ path: `${OUT}/07-reprise.png`, fullPage: true })

  await page.getByRole('button', { name: 'Reprendre', exact: true }).click()
  await page.waitForURL('**/jouer')
  await page.waitForTimeout(500)
  check(await page.getByText('Question 2 / 6').isVisible(), '[reprise] progression restaurée')
  const scoreAfter = await page.locator('.team-chip').first().textContent()
  check(scoreBefore === scoreAfter, `[reprise] scores intacts (${scoreBefore} → ${scoreAfter})`)

  await context.close()
}

// ---------------------------------------------------------------------------
// Hors ligne en pleine partie
console.log('\n=== Coupure réseau en pleine partie ===')
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' })
  await page.locator('#limite').fill('2')
  await page.getByRole('button', { name: 'Démarrer la session' }).click()
  await page.waitForURL('**/jouer')
  await page.waitForTimeout(500)

  await context.setOffline(true)
  await page.waitForTimeout(400)
  check(await page.getByText(/Hors ligne — la partie continue/).isVisible(),
    '[offline] badge hors ligne affiché')
  check(!(await page.locator('[role="dialog"]').isVisible().catch(() => false)),
    '[offline] aucune modale bloquante')

  // La partie doit se dérouler entièrement hors ligne, jusqu'au podium.
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Space')
    await waitForQuestion(page)
    const isDebate = await page.getByRole('button', { name: /Voir la réponse attendue/ }).isVisible().catch(() => false)
    if (isDebate) {
      const b = page.getByRole('button', { name: 'Correct', exact: true })
      for (let k = 0; k < (await b.count()); k++) await b.nth(k).click()
    } else await page.keyboard.press('Digit1')
    await page.waitForTimeout(150)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
  }
  check(await page.getByText('Fin de partie').isVisible(), '[offline] podium atteint hors ligne')
  await page.screenshot({ path: `${OUT}/08-offline-podium.png`, fullPage: true })
  check(errors.length === 0, `[offline] aucune erreur page (${errors.length})`)
  if (errors.length) console.log('    ', errors.slice(0, 3))

  await context.setOffline(false)
  await context.close()
}

await browser.close()

// ---------------------------------------------------------------------------
console.log('\n--- Détail ---')
for (const n of notes) console.log(n)
if (problems.length) {
  console.log('\n✗ ÉCHECS :')
  for (const p of problems) console.log(p)
  console.log(`\n${notes.length} succès, ${problems.length} échec(s)\n`)
  process.exit(1)
}
console.log(`\n✓ ${notes.length} vérifications passées, 0 échec\n`)
