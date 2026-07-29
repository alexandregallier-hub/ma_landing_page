# Roue de la prévention santé-sécurité au travail

Application d'animation de sessions de sensibilisation SST : une roue de 10 thèmes,
des questions à choix multiples ou à débattre, jusqu'à 4 équipes, un podium.
Conçue pour être **projetée au vidéoprojecteur** et pour **fonctionner sans internet
pendant la séance**.

---

## Mise en service — 6 étapes, environ 25 minutes

Vous n'avez rien à installer sur votre machine. Tout se fait dans le navigateur.

### 1. Créer le projet Supabase (la base de données)

1. Aller sur [supabase.com](https://supabase.com), se connecter avec GitHub
2. **New project**
3. Région : **eu-west-3 (Paris)** ou **eu-central-1 (Francfort)**
4. Choisir un mot de passe de base de données et **le conserver quelque part**

### 2. Récupérer les 3 clés

Dans Supabase → **Settings › API**, copier :

| À copier | Où le coller ensuite |
|---|---|
| `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ La clé `service_role` est **secrète** : elle contourne toutes les règles de
> sécurité. Ne jamais la préfixer par `NEXT_PUBLIC_`. Le script
> `npm run check:secrets` vérifie qu'elle n'a pas fuité.

### 3. Créer la structure et charger les questions

Dans Supabase → **SQL Editor**, exécuter dans cet ordre, en copiant-collant le
contenu de chaque fichier :

1. `supabase/migrations/0001_init.sql` — tables, index, sécurité
2. `supabase/seed.sql` — les 10 thèmes et 80 questions

### 4. Créer votre compte, puis l'amorçage

1. Supabase → **Authentication › Users › Add user**
   → votre e-mail, un mot de passe, et **cocher « Auto Confirm User »**
   (sans cette case, la connexion sera impossible)
2. Ouvrir `supabase/bootstrap.sql`, remplacer `vous@exemple.fr` par votre adresse,
   puis l'exécuter dans le **SQL Editor**

### 5. Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com), se connecter avec GitHub
2. **Add New › Project** → sélectionner ce dépôt
3. Si l'application n'est pas à la racine du dépôt, renseigner **Root Directory**
4. **Settings › Environment Variables** — ajouter :

   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY     = eyJ...        ← secrète
   NEXT_PUBLIC_APP_URL           = https://votre-projet.vercel.app
   CRON_SECRET                   = (une longue chaîne au hasard)
   ```

5. **Deploy**

### 6. Autoriser l'URL côté Supabase

Supabase → **Authentication › URL Configuration** : coller l'URL Vercel dans
`Site URL` **et** dans `Redirect URLs`.

**C'est terminé.** Envoyez le lien à vos animateurs, ils se connectent avec les
comptes que vous leur créez.

---

## Point de vigilance : la mise en veille de Supabase

Le plan gratuit Supabase met le projet **en pause après environ 7 jours
d'inactivité**. Avec un usage d'une session par mois, l'application serait morte
le matin de votre animation, devant le client.

C'est le risque n°1 de ce projet, et il est déjà traité : `vercel.json` déclare un
cron quotidien (`/api/cron/keepalive`) qui maintient le projet éveillé.
**Vérifiez après le premier déploiement** que Vercel → *Settings › Cron Jobs*
affiche bien la tâche. Si vous passez au plan Supabase Pro, elle devient inutile.

---

## Animer une session

1. Se connecter → choisir **avec équipes** (1 à 4) ou **sans équipe**
2. Nommer les équipes ; les couleurs sont imposées (voir plus bas pourquoi)
3. Renseigner l'entreprise cliente — c'est ce qui rendra les rapports exploitables
4. **Démarrer**, puis animer

### Raccourcis clavier

| Touche | Action |
|---|---|
| `Espace` | Lancer la roue |
| `1` `2` `3` `4` | Choisir une réponse |
| `Entrée` | Valider, puis passer à la suite |
| `Retour arrière` | **Annuler la dernière action** |
| `F` | Plein écran |
| `+` / `−` | Agrandir / réduire le texte (mémorisé) |
| `Page ↓` / `Page ↑` | Tourner / Annuler — compatible **télécommande de présentation** |

### Attribuer les réponses aux équipes

- **Clic sur une réponse** → toutes les équipes s'y placent (le cas le plus fréquent)
- **Clic sur le pion d'une équipe, puis clic sur une réponse** → cette équipe seule
  s'y place, et elle est « épinglée » : un clic ultérieur sur une autre réponse ne
  la déplacera plus
- **Valider** → 1 point par bonne réponse, 0 sinon

Le glisser-déposer a été volontairement écarté : sur 4 équipes × 20 questions, cela
représente jusqu'à 80 manipulations par séance, et un pion lâché dans le vide devant
vingt salariés casse le rythme. Le clic-clic n'a aucun mode d'échec.

### Questions à débattre

Certaines questions n'ont pas de QCM. L'énoncé s'affiche, vous écoutez les équipes,
puis vous tranchez **Correct / Partiel / Incorrect** pour chacune.

La réponse attendue est **masquée par défaut** : l'écran est projeté, l'afficher
révélerait la réponse à toute la salle. Un bouton permet de l'afficher si vous en
avez besoin, et elle apparaît automatiquement à la correction.

---

## Fonctionne sans internet

Une fois la session démarrée, **le réseau n'est plus nécessaire**. La banque de
questions est chargée d'un coup, l'état de la partie vit dans le navigateur, et le
podium est calculé entièrement en local.

- Le wifi du client tombe en pleine séance → un badge discret l'indique, la partie
  continue, les résultats remontent au retour du réseau
- L'onglet est fermé par erreur ou le PC se met en veille → au retour,
  « Reprendre la session en cours ? » restaure les scores et les questions posées
- En dernier recours, l'écran de résultats propose un **export JSON** et une
  version imprimable

---

## Mode démonstration

`/demo` — sans compte, sans base de données. Pour montrer le jeu à un prospect en
lui envoyant simplement un lien. Rien n'est enregistré.

---

## Marque blanche

### Depuis l'application (V3)

Un éditeur de charte permettra de saisir couleurs, logo et police, avec contrôle
automatique du contraste (l'interface refuse une combinaison illisible et propose
la correction).

### Dès aujourd'hui, avec Claude Code

1. Déposer le PDF de charte du client dans `brand-inbox/`
2. Demander : « applique cette charte pour le client Renault »
3. Les couleurs, la police et le logo sont extraits, un preset est écrit dans
   `src/lib/branding/presets/`, et Vercel redéploie

### Ce qui n'est PAS personnalisable, et pourquoi

Les **4 couleurs d'équipe** et le couple **vert « juste » / rouge « faux »** sont
verrouillés. Ce sont des éléments fonctionnels de lisibilité, pas de la décoration :
ouvertes à la personnalisation, une entreprise y mettrait quatre nuances de son bleu
corporate et le jeu deviendrait injouable au vidéoprojecteur.

C'est un argument de qualité à assumer devant le client, pas une limitation.

---

## Modifier les questions

En V1, la banque s'édite dans `content/questions-seed.json`, puis :

```bash
npm run seed:sql     # régénère supabase/seed.sql (avec contrôles d'intégrité)
```

et on rejoue `supabase/seed.sql` dans le SQL Editor — le script est **idempotent**,
on peut le relancer sans créer de doublon.

Le plus simple reste de demander à Claude Code : « ajoute 12 questions sur le risque
chimique, niveau opérateur, avec les références INRS ». Le CRUD dans l'application
arrive en V2, quand un autre administrateur devra éditer lui-même.

Chaque question porte obligatoirement un **commentaire pédagogique** et une
**référence** (INRS, article du Code du travail) : c'est ce qui rend le contenu
vérifiable rapidement et défendable en séance.

> **À faire avant votre première animation** : relire les 80 questions. Toute
> question dont vous n'êtes pas certain doit être désactivée (`is_active = false`)
> plutôt que posée devant des opérateurs.

---

## Développement

```bash
npm install
cp .env.example .env.local     # puis renseigner les 3 clés
npm run dev                    # http://localhost:3000
npm test                       # 71 tests (logique de roue, correction, contrastes)
npm run build
npm run check:secrets          # vérifie qu'aucun secret n'a fuité dans le bundle
```

Sans Supabase configuré, `/demo` fonctionne quand même : c'est le moyen le plus
rapide de vérifier le jeu.

### Recette au navigateur

`npm run recette` joue une partie complète dans un vrai navigateur, contre `/demo`
— donc **sans Supabase**. Elle vérifie notamment ce que les tests unitaires ne
peuvent pas voir : l'absence de débordement en 1024×768 comme en 1920×1080,
l'attribution des réponses par équipe, l'anti double-rotation (clic souris puis
`Espace`), l'annulation, la reprise de session après fermeture de l'onglet, et le
déroulé complet **hors ligne**.

```bash
npm i -D playwright              # optionnel, ~300 Mo, non installé par défaut
npm run dev -- -p 3100           # dans un autre terminal
npm run recette                  # captures d'écran dans .recette/
```

### Organisation du code

```
supabase/
  migrations/0001_init.sql   schéma, vues de reporting, sécurité (RLS)
  seed.sql                   GÉNÉRÉ — 10 thèmes, 80 questions
  bootstrap.sql              amorçage : organisation + votre compte admin
content/questions-seed.json  la banque de questions, source de vérité
src/lib/game/
  wheel.ts                   angle cible et tirage pondéré des thèmes (pures, testées)
  scoring.ts                 correction et classement (pures, testées)
  session-store.ts           état de la partie, persistance locale, file de synchro
  persistence.ts             IndexedDB, avec repli propre en mémoire
  sync.ts                    remontée différée, idempotente
  use-keyboard.ts            LE handler clavier unique
src/lib/branding/            contrat de marque blanche, contrastes, palette d'équipe
src/components/              Wheel, QuestionPanel, AnswerCard, Podium, TeamChip
```

### Deux principes à ne pas défaire

**La roue est un théâtre, pas un générateur d'aléa.** Le thème est tiré *avant*
l'animation, puis on calcule l'angle qui y mène. Conséquence : la roue ne peut pas
tomber sur un thème épuisé, ne répète pas deux fois le même thème d'affilée, et
équilibre la couverture des 10 risques sur la séance — ce qui est l'objectif
pédagogique réel.

**Aucune interface bloquante liée au réseau.** Jamais de modale, jamais de spinner
plein écran, jamais de bouton désactivé parce que la connexion est absente. Dans ce
contexte, c'est un défaut de conception.

---

## Feuille de route

- **V1 (livrée)** — jeu complet, connexion e-mail/mot de passe, mode démo, hors ligne
- **V2** — édition des questions dans l'application, invitations, connexion Google,
  onglet Rapports, fiches animateur imprimables
- **V3** — éditeur de charte, rapport PDF de synthèse pour la direction, PWA
  installable
