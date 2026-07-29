#!/usr/bin/env node
/**
 * Transforme content/questions-seed.json en supabase/seed.sql.
 *
 *   npm run seed:sql
 *
 * Le SQL produit est idempotent : on peut le rejouer autant de fois qu'on veut.
 * Les thèmes sont identifiés par leur `key`, les questions par leur énoncé —
 * rejouer le script met donc à jour le contenu existant au lieu de le dupliquer.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'content/questions-seed.json')
const out = resolve(root, 'supabase/seed.sql')

/** Échappe une chaîne pour un littéral SQL. */
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const n = (v) => (v === null || v === undefined ? 'null' : String(Number(v)))

const data = JSON.parse(readFileSync(src, 'utf8'))

// --- Contrôles d'intégrité : mieux vaut échouer ici qu'en séance ------------
const themeKeys = new Set(data.themes.map((t) => t.key))
const errors = []

for (const t of data.themes) {
  if (!t.key || !t.label) errors.push(`Thème incomplet : ${JSON.stringify(t)}`)
  // Le libellé court est affiché dans un secteur de 36° : au-delà de 14
  // caractères il devient illisible en projection.
  if (!t.short_label) errors.push(`Thème « ${t.key} » : short_label manquant`)
  else if (t.short_label.length > 14)
    errors.push(`Thème « ${t.key} » : short_label trop long (${t.short_label.length} > 14 caractères)`)
}

data.questions.forEach((question, i) => {
  const at = `question #${i + 1} « ${String(question.statement).slice(0, 60)}… »`
  if (!themeKeys.has(question.theme)) errors.push(`${at} : thème inconnu « ${question.theme} »`)
  if (!question.statement) errors.push(`${at} : énoncé manquant`)
  if (!question.explanation) errors.push(`${at} : commentaire pédagogique manquant`)
  if (!question.source_ref) errors.push(`${at} : source_ref manquante`)

  const correct = (question.options ?? []).filter((o) => o.correct).length
  if (question.kind === 'mcq_single') {
    if ((question.options ?? []).length < 2) errors.push(`${at} : moins de 2 options`)
    if (correct !== 1) errors.push(`${at} : ${correct} bonne(s) réponse(s), attendu exactement 1`)
  } else if (question.kind === 'mcq_multi') {
    if (correct < 2) errors.push(`${at} : ${correct} bonne(s) réponse(s), attendu au moins 2`)
  } else if (question.kind === 'debate') {
    if (!question.expected_answer) errors.push(`${at} : réponse attendue manquante`)
    if ((question.options ?? []).length > 0) errors.push(`${at} : une question de débat ne porte pas d'options`)
  } else {
    errors.push(`${at} : kind inconnu « ${question.kind} »`)
  }
})

if (errors.length) {
  console.error(`\n✗ ${errors.length} erreur(s) dans content/questions-seed.json :\n`)
  for (const e of errors) console.error('  - ' + e)
  console.error('')
  process.exit(1)
}

// --- Génération -------------------------------------------------------------
const lines = []
const w = (s = '') => lines.push(s)

w('-- ===========================================================================')
w('-- FICHIER GÉNÉRÉ — NE PAS ÉDITER À LA MAIN.')
w('-- Source : content/questions-seed.json    Régénérer : npm run seed:sql')
w('--')
w('-- Catalogue GLOBAL (org_id NULL) : hérité par toutes les organisations.')
w('-- Idempotent : peut être rejoué sans créer de doublon.')
w(`-- ${data.themes.length} thèmes, ${data.questions.length} questions.`)
w('-- ===========================================================================')
w()
w('begin;')
w()

w('-- --- Thèmes ---------------------------------------------------------------')
for (const t of data.themes) {
  w(`insert into themes (org_id, key, label, short_label, description, icon, sort_order)`)
  w(`values (null, ${q(t.key)}, ${q(t.label)}, ${q(t.short_label)}, ${q(t.description)}, ${q(t.icon)}, ${n(t.sort_order)})`)
  w(`on conflict (key) where org_id is null do update set`)
  w(`  label = excluded.label,`)
  w(`  short_label = excluded.short_label,`)
  w(`  description = excluded.description,`)
  w(`  icon = excluded.icon,`)
  w(`  sort_order = excluded.sort_order;`)
  w()
}

w('-- --- Questions ------------------------------------------------------------')
w('-- Chaque bloc : upsert de la question (clé = énoncé + catalogue global),')
w('-- puis remplacement complet de ses options.')
w()

data.questions.forEach((question, i) => {
  const theme = data.themes.find((t) => t.key === question.theme)
  w(`-- [${String(i + 1).padStart(2, '0')}/${data.questions.length}] ${theme.label} — ${question.kind}`)
  w('do $seed$')
  w('declare')
  w('  v_theme_id uuid;')
  w('  v_question_id uuid;')
  w('begin')
  w(`  select id into v_theme_id from themes where org_id is null and key = ${q(question.theme)};`)
  w()
  w('  select id into v_question_id from questions')
  w(`  where org_id is null and statement = ${q(question.statement)};`)
  w()
  w('  if v_question_id is null then')
  w('    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)')
  w(`    values (null, v_theme_id, ${q(question.kind)}::question_kind, ${q(question.statement)},`)
  w(`            ${q(question.explanation)}, ${q(question.expected_answer)}, ${q(question.source_ref)}, ${n(question.difficulty)})`)
  w('    returning id into v_question_id;')
  w('  else')
  w('    update questions set')
  w('      theme_id = v_theme_id,')
  w(`      kind = ${q(question.kind)}::question_kind,`)
  w(`      explanation = ${q(question.explanation)},`)
  w(`      expected_answer = ${q(question.expected_answer)},`)
  w(`      source_ref = ${q(question.source_ref)},`)
  w(`      difficulty = ${n(question.difficulty)},`)
  w('      is_active = true')
  w('    where id = v_question_id;')
  w('  end if;')
  w()
  w('  delete from question_options where question_id = v_question_id;')

  ;(question.options ?? []).forEach((opt, j) => {
    w('  insert into question_options (question_id, label, is_correct, sort_order)')
    w(`  values (v_question_id, ${q(opt.label)}, ${opt.correct ? 'true' : 'false'}, ${j});`)
  })

  w('end')
  w('$seed$;')
  w()
})

w('commit;')
w()

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, lines.join('\n'), 'utf8')

const counts = data.questions.reduce((acc, x) => ({ ...acc, [x.kind]: (acc[x.kind] ?? 0) + 1 }), {})
console.log(`✓ supabase/seed.sql généré`)
console.log(`  ${data.themes.length} thèmes, ${data.questions.length} questions`)
console.log(`  ${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')}`)
