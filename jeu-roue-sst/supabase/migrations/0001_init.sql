-- ===========================================================================
-- Jeu de la roue de la prévention santé-sécurité au travail
-- Migration initiale : schéma complet, vues de reporting, RLS.
--
-- À exécuter dans Supabase > SQL Editor (copier-coller), ou via la CLI :
--   supabase db push
--
-- Conventions :
--   - PK uuid default gen_random_uuid()
--   - toutes les dates en timestamptz (JAMAIS timestamp : sinon les sessions
--     de fin de journée basculent la veille dans les rapports d'hiver)
--   - on ne supprime jamais une question : is_active = false (soft delete),
--     sinon les rapports passés sont faussés rétroactivement
-- ===========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Types énumérés
-- ---------------------------------------------------------------------------

-- 'admin' gère la banque de questions et le branding ; 'animator' anime seulement.
-- Le super-admin de la plateforme n'est PAS dans cet enum : il n'appartient pas
-- à une organisation, il les voit toutes (profiles.is_platform_admin).
create type org_role as enum ('admin', 'animator');

-- 'debate' = question sans QCM : l'animateur écoute la réponse orale de l'équipe
-- et tranche lui-même. Personne ne tape une réponse au clavier devant une salle.
create type question_kind as enum ('mcq_single', 'mcq_multi', 'debate');

create type session_mode as enum ('teams', 'solo');

create type session_status as enum ('setup', 'running', 'finished', 'aborted');

-- 'partial' est l'intérêt pédagogique des questions de type débat : un booléen
-- is_correct aurait interdit la nuance.
create type answer_verdict as enum ('correct', 'partial', 'incorrect', 'skipped');

-- ---------------------------------------------------------------------------
-- Identité et accès
-- ---------------------------------------------------------------------------

create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        citext not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table organizations is
  'Un tenant = un cabinet de formation, pas une entreprise cliente. Une entreprise '
  'cliente est une charte graphique (brand_profiles) + un attribut de session.';

-- Miroir applicatif de auth.users : on ne modifie jamais auth.users directement.
create table profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              citext not null,
  full_name          text,
  avatar_url         text,
  is_platform_admin  boolean not null default false,
  last_seen_at       timestamptz,
  created_at         timestamptz not null default now()
);

comment on column profiles.is_platform_admin is
  'Super-admin de la plateforme (le propriétaire du produit). Voit toutes les organisations.';

create table memberships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  org_id      uuid not null references organizations (id) on delete cascade,
  role        org_role not null default 'animator',
  created_at  timestamptz not null default now(),
  unique (user_id, org_id)
);

create index memberships_org_role_idx on memberships (org_id, role);
create index memberships_user_idx on memberships (user_id);

create table invitations (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations (id) on delete cascade,
  -- NULL = lien générique réutilisable (pratique pour inviter 3 animateurs d'un coup)
  email        citext,
  role         org_role not null default 'animator',
  token        text not null unique,
  max_uses     smallint not null default 1 check (max_uses > 0),
  uses         smallint not null default 0 check (uses >= 0),
  expires_at   timestamptz not null,
  created_by   uuid references profiles (id) on delete set null,
  accepted_at  timestamptz,
  accepted_by  uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index invitations_org_email_idx on invitations (org_id, email);

-- ---------------------------------------------------------------------------
-- Contenu pédagogique
--
-- Modèle « global + surcharges » :
--   org_id IS NULL  -> catalogue global, hérité par toutes les organisations
--   org_id = X      -> contenu propre à l'organisation X
-- Trois primitives : hériter / forker (source_question_id) / masquer (question_hidden).
-- ---------------------------------------------------------------------------

create table themes (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid references organizations (id) on delete cascade,
  key          citext not null,
  label        text not null,
  -- Libellé court affiché DANS le secteur de la roue. « Organisation de la
  -- prévention & RPS » est illisible sur un secteur de 36° ; « Organisation »
  -- passe. Sans cette colonne on tronque à l'affichage, et le résultat est
  -- incompréhensible en projection.
  short_label  text,
  description  text,
  icon         text,
  sort_order   smallint not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Deux index partiels plutôt qu'un unique(org_id, key) : en Postgres, NULL n'est
-- jamais égal à NULL, donc un unique classique n'empêcherait pas deux thèmes
-- globaux avec la même clé.
create unique index themes_org_key_uidx on themes (org_id, key) where org_id is not null;
create unique index themes_global_key_uidx on themes (key) where org_id is null;

create table questions (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid references organizations (id) on delete cascade,
  theme_id            uuid not null references themes (id) on delete restrict,
  kind                question_kind not null default 'mcq_single',
  statement           text not null,
  -- Obligatoire : c'est ce commentaire qui apporte la valeur aux participants.
  explanation         text not null,
  -- Réponse attendue, affichée à l'animateur seul (questions de type 'debate').
  expected_answer     text,
  -- Référence réglementaire ('INRS ED 6273', 'Art. R4321-4'). Sert à la fois la
  -- crédibilité en séance et la vérifiabilité du contenu.
  source_ref          text,
  difficulty          smallint check (difficulty between 1 and 3),
  source_question_id  uuid references questions (id) on delete set null,
  is_active           boolean not null default true,
  reviewed_by         uuid references profiles (id) on delete set null,
  reviewed_at         timestamptz,
  created_by          uuid references profiles (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  search              tsvector generated always as (
                        to_tsvector('french', statement || ' ' || coalesce(explanation, ''))
                      ) stored,
  -- Une question de type débat n'a pas d'options : elle doit porter son attendu.
  constraint questions_debate_has_expected
    check (kind <> 'debate' or expected_answer is not null)
);

create index questions_org_theme_idx on questions (org_id, theme_id, is_active);
create index questions_theme_active_idx on questions (theme_id) where is_active;
create index questions_source_idx on questions (source_question_id);
create index questions_search_idx on questions using gin (search);

create table question_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions (id) on delete cascade,
  label        text not null,
  is_correct   boolean not null default false,
  sort_order   smallint not null,
  unique (question_id, sort_order)
);

create index question_options_question_idx on question_options (question_id);

-- « Cette question ne s'applique pas chez nous » : retirer une question globale
-- sans avoir à la dupliquer.
create table question_hidden (
  org_id       uuid not null references organizations (id) on delete cascade,
  question_id  uuid not null references questions (id) on delete cascade,
  hidden_by    uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  primary key (org_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Marque blanche
--
-- N chartes par organisation (une par entreprise cliente), et non 1-1 avec
-- l'organisation : c'est ce qui permet de rejouer le jeu à la charte du client
-- via un simple <select> au setup de session.
-- ---------------------------------------------------------------------------

create table brand_profiles (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations (id) on delete cascade,
  name            text not null,
  is_default      boolean not null default false,
  tokens          jsonb not null default '{}'::jsonb,
  logo_path       text,
  logo_dark_path  text,
  font_family     text,
  font_url        text,
  created_by      uuid references profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (org_id, name)
);

create unique index brand_profiles_one_default_uidx
  on brand_profiles (org_id) where is_default;

-- ---------------------------------------------------------------------------
-- Jeu et traces
-- ---------------------------------------------------------------------------

create table game_sessions (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations (id) on delete cascade,
  facilitator_id     uuid references profiles (id) on delete set null,
  brand_profile_id   uuid references brand_profiles (id) on delete set null,
  title              text,
  client_name        text,
  location           text,
  audience_size      smallint check (audience_size >= 0),
  mode               session_mode not null default 'teams',
  team_count         smallint not null default 0 check (team_count between 0 and 4),
  question_limit     smallint not null default 20 check (question_limit between 1 and 200),
  status             session_status not null default 'setup',
  started_at         timestamptz,
  ended_at           timestamptz,
  -- Généré par le navigateur AVANT tout accès réseau. C'est ce qui rend la
  -- synchro différée idempotente : un double envoi devient inoffensif.
  client_session_id  uuid not null unique,
  created_at         timestamptz not null default now(),
  constraint game_sessions_teams_have_count
    check (mode <> 'teams' or team_count between 1 and 4)
);

create index game_sessions_org_started_idx on game_sessions (org_id, started_at desc);
create index game_sessions_facilitator_idx on game_sessions (facilitator_id);

create table teams (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references game_sessions (id) on delete cascade,
  name        text not null,
  -- Clé symbolique, jamais un hex : la palette est un contrat de l'application
  -- (lisibilité au vidéoprojecteur), pas une donnée saisie.
  color_key   text not null check (color_key in ('bleu', 'orange', 'vert', 'violet')),
  sort_order  smallint not null,
  score       integer not null default 0,
  unique (session_id, sort_order),
  unique (session_id, color_key)
);

create index teams_session_idx on teams (session_id);

create table session_rounds (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references game_sessions (id) on delete cascade,
  round_no           smallint not null check (round_no > 0),
  theme_id           uuid references themes (id) on delete set null,
  question_id        uuid references questions (id) on delete set null,
  -- CRUCIAL : énoncé + options + bonnes réponses figés au moment où la question
  -- est posée. Sans ce snapshot, éditer une question fausserait rétroactivement
  -- tous les rapports déjà produits.
  question_snapshot  jsonb not null,
  asked_at           timestamptz,
  validated_at       timestamptz,
  unique (session_id, round_no)
);

create index session_rounds_session_idx on session_rounds (session_id);
create index session_rounds_question_idx on session_rounds (question_id);
create index session_rounds_theme_idx on session_rounds (theme_id);

create table round_answers (
  id                   uuid primary key default gen_random_uuid(),
  round_id             uuid not null references session_rounds (id) on delete cascade,
  -- NULL = mode sans équipe (solo)
  team_id              uuid references teams (id) on delete cascade,
  selected_option_ids  uuid[] not null default '{}',
  open_answer          text,
  verdict              answer_verdict not null default 'skipped',
  points               smallint not null default 0 check (points >= 0)
);

-- Une réponse par équipe et par tour ; une seule réponse par tour en mode solo.
create unique index round_answers_team_uidx
  on round_answers (round_id, team_id) where team_id is not null;
create unique index round_answers_solo_uidx
  on round_answers (round_id) where team_id is null;
create index round_answers_team_idx on round_answers (team_id);

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references organizations (id) on delete cascade,
  actor_id    uuid references profiles (id) on delete set null,
  action      text not null,
  entity      text,
  entity_id   uuid,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_org_created_idx on audit_log (org_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at automatique
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger questions_touch_updated_at
  before update on questions
  for each row execute function public.touch_updated_at();

create trigger brand_profiles_touch_updated_at
  before update on brand_profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Création automatique du profil à l'inscription
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers RLS
--
-- ⚠️  PIÈGE : ces fonctions doivent être `stable security definer`. Si une
-- policy sur `memberships` interrogeait `memberships` directement, RLS
-- récurserait à l'infini et TOUTES les requêtes échoueraient avec un message
-- obscur. C'est l'erreur n°1 des débuts sur Supabase.
-- ---------------------------------------------------------------------------

create or replace function public.current_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from memberships where user_id = auth.uid()
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_platform_admin from profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.has_org_role(target_org uuid, needed org_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin() or exists (
    select 1 from memberships
    where user_id = auth.uid()
      and org_id = target_org
      and (role = needed or role = 'admin')
  )
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- V1 : une seule organisation, 2-3 utilisateurs. Les policies restent
-- volontairement simples — « lecture par les membres, écriture par les admins ».
-- Le durcissement multi-organisation viendra quand il y aura plusieurs orgs.
-- ---------------------------------------------------------------------------

alter table organizations   enable row level security;
alter table profiles        enable row level security;
alter table memberships     enable row level security;
alter table invitations     enable row level security;
alter table themes          enable row level security;
alter table questions       enable row level security;
alter table question_options enable row level security;
alter table question_hidden enable row level security;
alter table brand_profiles  enable row level security;
alter table game_sessions   enable row level security;
alter table teams           enable row level security;
alter table session_rounds  enable row level security;
alter table round_answers   enable row level security;
alter table audit_log       enable row level security;

-- organizations : on voit les siennes
create policy organizations_select on organizations for select
  using (id in (select public.current_org_ids()) or public.is_platform_admin());

-- profiles : on se voit soi-même, et on voit les membres de ses organisations
create policy profiles_select_self on profiles for select
  using (id = auth.uid() or public.is_platform_admin());
create policy profiles_update_self on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- memberships : lecture de ses propres appartenances
create policy memberships_select on memberships for select
  using (user_id = auth.uid() or public.is_platform_admin());

-- invitations : réservées aux admins de l'organisation
create policy invitations_admin_all on invitations for all
  using (public.has_org_role(org_id, 'admin'))
  with check (public.has_org_role(org_id, 'admin'));

-- themes : le catalogue global est lisible par tous les utilisateurs connectés ;
-- les thèmes locaux par les membres de l'organisation. Écriture : admins.
create policy themes_select on themes for select
  using (
    org_id is null
    or org_id in (select public.current_org_ids())
    or public.is_platform_admin()
  );
create policy themes_write_global on themes for all
  using (org_id is null and public.is_platform_admin())
  with check (org_id is null and public.is_platform_admin());
create policy themes_write_org on themes for all
  using (org_id is not null and public.has_org_role(org_id, 'admin'))
  with check (org_id is not null and public.has_org_role(org_id, 'admin'));

-- questions : même logique que les thèmes
create policy questions_select on questions for select
  using (
    org_id is null
    or org_id in (select public.current_org_ids())
    or public.is_platform_admin()
  );
create policy questions_write_global on questions for all
  using (org_id is null and public.is_platform_admin())
  with check (org_id is null and public.is_platform_admin());
create policy questions_write_org on questions for all
  using (org_id is not null and public.has_org_role(org_id, 'admin'))
  with check (org_id is not null and public.has_org_role(org_id, 'admin'));

-- question_options : suit la visibilité de sa question
create policy question_options_select on question_options for select
  using (
    exists (
      select 1 from questions q
      where q.id = question_options.question_id
        and (
          q.org_id is null
          or q.org_id in (select public.current_org_ids())
          or public.is_platform_admin()
        )
    )
  );
create policy question_options_write on question_options for all
  using (
    exists (
      select 1 from questions q
      where q.id = question_options.question_id
        and (
          (q.org_id is null and public.is_platform_admin())
          or (q.org_id is not null and public.has_org_role(q.org_id, 'admin'))
        )
    )
  )
  with check (
    exists (
      select 1 from questions q
      where q.id = question_options.question_id
        and (
          (q.org_id is null and public.is_platform_admin())
          or (q.org_id is not null and public.has_org_role(q.org_id, 'admin'))
        )
    )
  );

create policy question_hidden_select on question_hidden for select
  using (org_id in (select public.current_org_ids()) or public.is_platform_admin());
create policy question_hidden_write on question_hidden for all
  using (public.has_org_role(org_id, 'admin'))
  with check (public.has_org_role(org_id, 'admin'));

-- brand_profiles : lecture par les membres (l'animateur doit pouvoir choisir la
-- charte au setup), écriture par les admins
create policy brand_profiles_select on brand_profiles for select
  using (org_id in (select public.current_org_ids()) or public.is_platform_admin());
create policy brand_profiles_write on brand_profiles for all
  using (public.has_org_role(org_id, 'admin'))
  with check (public.has_org_role(org_id, 'admin'));

-- game_sessions : tout membre peut créer et lire les sessions de son organisation
create policy game_sessions_select on game_sessions for select
  using (org_id in (select public.current_org_ids()) or public.is_platform_admin());
create policy game_sessions_insert on game_sessions for insert
  with check (org_id in (select public.current_org_ids()));
create policy game_sessions_update on game_sessions for update
  using (org_id in (select public.current_org_ids()))
  with check (org_id in (select public.current_org_ids()));

-- teams / session_rounds / round_answers : visibilité héritée de la session
create policy teams_all on teams for all
  using (
    exists (
      select 1 from game_sessions s
      where s.id = teams.session_id
        and (s.org_id in (select public.current_org_ids()) or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from game_sessions s
      where s.id = teams.session_id
        and s.org_id in (select public.current_org_ids())
    )
  );

create policy session_rounds_all on session_rounds for all
  using (
    exists (
      select 1 from game_sessions s
      where s.id = session_rounds.session_id
        and (s.org_id in (select public.current_org_ids()) or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from game_sessions s
      where s.id = session_rounds.session_id
        and s.org_id in (select public.current_org_ids())
    )
  );

create policy round_answers_all on round_answers for all
  using (
    exists (
      select 1 from session_rounds r
      join game_sessions s on s.id = r.session_id
      where r.id = round_answers.round_id
        and (s.org_id in (select public.current_org_ids()) or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from session_rounds r
      join game_sessions s on s.id = r.session_id
      where r.id = round_answers.round_id
        and s.org_id in (select public.current_org_ids())
    )
  );

create policy audit_log_select on audit_log for select
  using (org_id in (select public.current_org_ids()) or public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Vues de lecture
--
-- Volumes minuscules (quelques milliers de lignes/an) : des vues simples
-- suffisent, pas besoin de vues matérialisées à rafraîchir.
-- ---------------------------------------------------------------------------

-- Banque effective d'une organisation : questions locales, plus les globales
-- qui ne sont ni masquées ni déjà forkées localement.
create or replace function public.effective_questions(target_org uuid)
returns setof questions
language sql
stable
as $$
  select q.* from questions q
  where q.is_active
    and q.org_id = target_org
  union all
  select g.* from questions g
  where g.is_active
    and g.org_id is null
    and not exists (
      select 1 from question_hidden h
      where h.org_id = target_org and h.question_id = g.id
    )
    and not exists (
      select 1 from questions f
      where f.org_id = target_org
        and f.is_active
        and f.source_question_id = g.id
    )
$$;

-- Performance par thème, alimentée par les snapshots (donc stable même si une
-- question est éditée ou désactivée après coup).
-- security_invoker = true : sans ça, une vue s'exécute avec les droits de son
-- propriétaire et CONTOURNE silencieusement RLS. Piège classique et sérieux.
create or replace view v_theme_performance with (security_invoker = true) as
select
  s.org_id,
  s.client_name,
  t.id                                              as theme_id,
  t.label                                           as theme_label,
  count(distinct s.id)                              as sessions_count,
  count(distinct r.id)                              as questions_asked,
  count(a.id)                                       as answers_count,
  count(a.id) filter (where a.verdict = 'correct')   as correct_count,
  count(a.id) filter (where a.verdict = 'partial')   as partial_count,
  count(a.id) filter (where a.verdict = 'incorrect') as incorrect_count,
  round(
    100.0 * count(a.id) filter (where a.verdict = 'correct')
    / nullif(count(a.id) filter (where a.verdict <> 'skipped'), 0),
    1
  )                                                  as success_rate
from session_rounds r
join game_sessions s on s.id = r.session_id
left join themes t on t.id = r.theme_id
left join round_answers a on a.round_id = r.id
where s.status = 'finished'
group by s.org_id, s.client_name, t.id, t.label;

create or replace view v_session_summary with (security_invoker = true) as
select
  s.id                       as session_id,
  s.org_id,
  s.title,
  s.client_name,
  s.location,
  s.mode,
  s.team_count,
  s.audience_size,
  s.started_at,
  s.ended_at,
  s.status,
  p.full_name                as facilitator_name,
  p.email                    as facilitator_email,
  count(distinct r.id)       as rounds_count,
  count(distinct r.theme_id) as themes_covered,
  extract(epoch from (s.ended_at - s.started_at)) / 60 as duration_minutes
from game_sessions s
left join profiles p on p.id = s.facilitator_id
left join session_rounds r on r.session_id = s.id
group by s.id, p.full_name, p.email;

grant select on v_theme_performance, v_session_summary to authenticated;
