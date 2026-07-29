-- ===========================================================================
-- AMORÇAGE — à exécuter UNE FOIS, après 0001_init.sql et seed.sql.
--
-- Prérequis : avoir créé votre compte utilisateur dans
--   Supabase > Authentication > Users > Add user
--   (cochez « Auto Confirm User », sinon vous ne pourrez pas vous connecter)
--
-- Puis remplacez l'adresse ci-dessous par la vôtre et exécutez tout le script
-- dans Supabase > SQL Editor.
-- ===========================================================================

do $bootstrap$
declare
  -- ⬇️⬇️⬇️  REMPLACEZ CETTE ADRESSE PAR LA VÔTRE  ⬇️⬇️⬇️
  v_email       citext := 'vous@exemple.fr';
  v_org_name    text   := 'Mon organisme de formation';
  v_org_slug    citext := 'mon-organisme';
  -- ⬆️⬆️⬆️ ------------------------------------------ ⬆️⬆️⬆️

  v_user_id uuid;
  v_org_id  uuid;
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    raise exception
      'Aucun utilisateur avec l''adresse « % ». Créez-le d''abord dans '
      'Supabase > Authentication > Users > Add user (cochez Auto Confirm User).',
      v_email;
  end if;

  -- Le trigger on_auth_user_created a normalement déjà créé le profil ;
  -- ce filet couvre le cas d'un utilisateur créé avant la migration.
  insert into profiles (id, email, is_platform_admin)
  values (v_user_id, v_email, true)
  on conflict (id) do update set is_platform_admin = true;

  insert into organizations (name, slug)
  values (v_org_name, v_org_slug)
  on conflict (slug) do update set name = excluded.name
  returning id into v_org_id;

  insert into memberships (user_id, org_id, role)
  values (v_user_id, v_org_id, 'admin')
  on conflict (user_id, org_id) do update set role = 'admin';

  -- Charte par défaut : tokens vides = l'application utilise DEFAULT_TOKENS
  -- (src/lib/branding/defaults.ts). Un client pourra en ajouter d'autres.
  insert into brand_profiles (org_id, name, is_default, tokens, created_by)
  values (v_org_id, 'Charte maison', true, '{}'::jsonb, v_user_id)
  on conflict (org_id, name) do nothing;

  raise notice 'Amorçage terminé. Organisation « % » (%), admin plateforme : %.',
    v_org_name, v_org_id, v_email;
end
$bootstrap$;

-- Vérification : doit renvoyer une ligne avec role = admin et is_platform_admin = true
select p.email, p.is_platform_admin, o.name as organisation, m.role
from profiles p
join memberships m on m.user_id = p.id
join organizations o on o.id = m.org_id;
