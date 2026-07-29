-- ===========================================================================
-- FICHIER GÉNÉRÉ — NE PAS ÉDITER À LA MAIN.
-- Source : content/questions-seed.json    Régénérer : npm run seed:sql
--
-- Catalogue GLOBAL (org_id NULL) : hérité par toutes les organisations.
-- Idempotent : peut être rejoué sans créer de doublon.
-- 10 thèmes, 80 questions.
-- ===========================================================================

begin;

-- --- Thèmes ---------------------------------------------------------------
insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'epi', 'EPI', 'EPI', 'Équipements de protection individuelle : choix, port, entretien, limites', '🦺', 1)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'risque-chimique', 'Risque chimique', 'Chimique', 'Étiquetage CLP, fiches de données de sécurité, stockage, CMR', '⚗️', 2)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'incendie', 'Incendie & évacuation', 'Incendie', 'Triangle du feu, classes de feux, extincteurs, consignes d''évacuation', '🔥', 3)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'gestes-postures', 'Gestes, postures & TMS', 'Gestes & TMS', 'Manutention manuelle, troubles musculo-squelettiques, aides à la manutention', '🏋️', 4)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'risque-electrique', 'Risque électrique', 'Électrique', 'Habilitation, consignation, seuils de sécurité, conduite à tenir', '⚡', 5)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'travail-hauteur', 'Travail en hauteur', 'Hauteur', 'Protection collective, garde-corps, échelles, harnais, tirant d''air', '🪜', 6)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'circulation-engins', 'Circulation & engins', 'Engins', 'Autorisation de conduite, CACES, co-activité, angles morts, plan de circulation', '🚜', 7)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'machines', 'Machines & consignation', 'Machines', 'Protecteurs, arrêt d''urgence, consignation, vérifications périodiques', '⚙️', 8)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'premiers-secours', 'Premiers secours', 'Secours', 'Protéger-Alerter-Secourir, numéros d''urgence, brûlures, hémorragies, DAE', '🚑', 9)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into themes (org_id, key, label, short_label, description, icon, sort_order)
values (null, 'organisation-prevention', 'Organisation de la prévention & RPS', 'Organisation', 'DUERP, principes généraux de prévention, droit de retrait, risques psychosociaux', '📋', 10)
on conflict (key) where org_id is null do update set
  label = excluded.label,
  short_label = excluded.short_label,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- --- Questions ------------------------------------------------------------
-- Chaque bloc : upsert de la question (clé = énoncé + catalogue global),
-- puis remplacement complet de ses options.

-- [01/80] EPI — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'Qui paie les équipements de protection individuelle ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Qui paie les équipements de protection individuelle ?',
            'L''employeur met gratuitement à disposition les EPI appropriés et veille à leur utilisation effective. Cela couvre l''achat, mais aussi le remplacement, l''entretien et le nettoyage. Un EPI usé ou perdu doit être remplacé sans que le salarié n''ait à en supporter le coût.', null, 'Art. R4321-4 et R4323-95 du Code du travail', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''employeur met gratuitement à disposition les EPI appropriés et veille à leur utilisation effective. Cela couvre l''achat, mais aussi le remplacement, l''entretien et le nettoyage. Un EPI usé ou perdu doit être remplacé sans que le salarié n''ait à en supporter le coût.',
      expected_answer = null,
      source_ref = 'Art. R4321-4 et R4323-95 du Code du travail',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''employeur, gratuitement', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le salarié, qui se fait rembourser ensuite', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Moitié-moitié entre l''employeur et le salarié', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le comité social et économique sur son budget', false, 3);
end
$seed$;

-- [02/80] EPI — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'Dans la hiérarchie des mesures de prévention, où se situe l''EPI ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Dans la hiérarchie des mesures de prévention, où se situe l''EPI ?',
            'Les principes généraux de prévention imposent de donner la priorité aux mesures de protection collective et de n''utiliser les EPI qu''en complément, lorsque le risque ne peut être suffisamment réduit autrement. Un EPI ne supprime pas le danger : il protège la personne qui le porte, et seulement si elle le porte correctement.', null, 'Art. L4121-2 (7°) du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Les principes généraux de prévention imposent de donner la priorité aux mesures de protection collective et de n''utiliser les EPI qu''en complément, lorsque le risque ne peut être suffisamment réduit autrement. Un EPI ne supprime pas le danger : il protège la personne qui le porte, et seulement si elle le porte correctement.',
      expected_answer = null,
      source_ref = 'Art. L4121-2 (7°) du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'En dernier recours, quand la protection collective ne suffit pas', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'En premier, c''est la mesure la plus efficace', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Au même niveau que la protection collective, c''est au choix', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''EPI n''est pas une mesure de prévention', false, 3);
end
$seed$;

-- [03/80] EPI — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'Votre casque de chantier a reçu un choc important mais ne présente aucune fissure visible. Que faites-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Votre casque de chantier a reçu un choc important mais ne présente aucune fissure visible. Que faites-vous ?',
            'Un choc peut déformer la calotte ou fragiliser le harnais interne sans laisser de trace visible : le casque a absorbé l''énergie une fois, il ne le refera pas. Après tout choc significatif, il est mis au rebut. Les casques ont par ailleurs une durée de vie limitée indiquée par le fabricant, à compter de la mise en service et non de l''achat.', null, 'INRS — Casques de protection (ED 998)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Un choc peut déformer la calotte ou fragiliser le harnais interne sans laisser de trace visible : le casque a absorbé l''énergie une fois, il ne le refera pas. Après tout choc significatif, il est mis au rebut. Les casques ont par ailleurs une durée de vie limitée indiquée par le fabricant, à compter de la mise en service et non de l''achat.',
      expected_answer = null,
      source_ref = 'INRS — Casques de protection (ED 998)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous le mettez au rebut et en demandez un neuf', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous le gardez, puisqu''il n''est pas fissuré', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous le gardez mais en le signalant au chef d''équipe', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous vérifiez sa date de fabrication : s''il a moins de 2 ans, il est bon', false, 3);
end
$seed$;

-- [04/80] EPI — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'À partir de quel niveau de bruit l''employeur doit-il mettre des protections auditives à disposition des salariés ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'À partir de quel niveau de bruit l''employeur doit-il mettre des protections auditives à disposition des salariés ?',
            'Deux seuils à ne pas confondre. À 80 dB(A) sur 8 heures (valeur inférieure déclenchant l''action), l''employeur met les protections à disposition et propose une information et un examen audiométrique. À 85 dB(A) (valeur supérieure), le port devient obligatoire et un programme de réduction du bruit doit être engagé. La valeur limite d''exposition est de 87 dB(A), mesurée sous la protection.', null, 'Art. R4431-2 et R4434-7 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Deux seuils à ne pas confondre. À 80 dB(A) sur 8 heures (valeur inférieure déclenchant l''action), l''employeur met les protections à disposition et propose une information et un examen audiométrique. À 85 dB(A) (valeur supérieure), le port devient obligatoire et un programme de réduction du bruit doit être engagé. La valeur limite d''exposition est de 87 dB(A), mesurée sous la protection.',
      expected_answer = null,
      source_ref = 'Art. R4431-2 et R4434-7 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, '80 dB(A) sur 8 heures', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, '60 dB(A) sur 8 heures', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, '95 dB(A) sur 8 heures', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Dès que le bruit est jugé gênant par les salariés', false, 3);
end
$seed$;

-- [05/80] EPI — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un harnais antichute est un EPI de catégorie III. Quelle est la périodicité de sa vérification par une personne compétente ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Un harnais antichute est un EPI de catégorie III. Quelle est la périodicité de sa vérification par une personne compétente ?',
            'Les EPI contre les chutes de hauteur font l''objet d''une vérification générale périodique au moins annuelle par une personne qualifiée, tracée dans un registre. Cela ne remplace pas l''examen visuel que l''utilisateur doit faire avant chaque usage (sangles, coutures, boucles, mousquetons). Après une chute, le harnais est mis au rebut, même s''il paraît intact.', null, 'Art. R4323-99 du Code du travail et arrêté du 19 mars 1993', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Les EPI contre les chutes de hauteur font l''objet d''une vérification générale périodique au moins annuelle par une personne qualifiée, tracée dans un registre. Cela ne remplace pas l''examen visuel que l''utilisateur doit faire avant chaque usage (sangles, coutures, boucles, mousquetons). Après une chute, le harnais est mis au rebut, même s''il paraît intact.',
      expected_answer = null,
      source_ref = 'Art. R4323-99 du Code du travail et arrêté du 19 mars 1993',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Au moins tous les 12 mois', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les 5 ans', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement après une chute', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Aucune vérification n''est imposée, seul l''examen visuel avant usage compte', false, 3);
end
$seed$;

-- [06/80] EPI — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'Dans quelle situation le port de gants est-il justement DÉCONSEILLÉ, voire dangereux ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Dans quelle situation le port de gants est-il justement DÉCONSEILLÉ, voire dangereux ?',
            'Près d''une pièce en rotation, un gant peut être happé et entraîner la main dans la machine : le gant devient le danger. C''est un bon rappel qu''un EPI mal choisi peut créer un risque nouveau. Dans ces situations, on privilégie les protecteurs de la machine, les cheveux attachés, l''absence de bijoux et de vêtements flottants.', null, 'INRS — Les équipements de protection individuelle (ED 6077)', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Près d''une pièce en rotation, un gant peut être happé et entraîner la main dans la machine : le gant devient le danger. C''est un bon rappel qu''un EPI mal choisi peut créer un risque nouveau. Dans ces situations, on privilégie les protecteurs de la machine, les cheveux attachés, l''absence de bijoux et de vêtements flottants.',
      expected_answer = null,
      source_ref = 'INRS — Les équipements de protection individuelle (ED 6077)',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'À proximité de pièces en rotation (perceuse, tour, arbre de transmission)', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Lors de la manipulation de pièces coupantes', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Lors de la manipulation de produits chimiques', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Lors de travaux par temps froid', false, 3);
end
$seed$;

-- [07/80] EPI — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'Parmi ces éléments, lesquels doivent obligatoirement figurer sur un EPI ou sa notice ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Parmi ces éléments, lesquels doivent obligatoirement figurer sur un EPI ou sa notice ? (plusieurs réponses)',
            'Tout EPI mis sur le marché dans l''Union européenne porte le marquage CE et est accompagné d''une notice en français précisant l''usage, les limites d''emploi, l''entretien et la durée de vie. Le nom du porteur n''est pas une obligation réglementaire, mais l''attribution personnelle est vivement recommandée pour des raisons d''hygiène et de suivi (casques, harnais, protections auditives moulées).', null, 'Règlement (UE) 2016/425 relatif aux EPI', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Tout EPI mis sur le marché dans l''Union européenne porte le marquage CE et est accompagné d''une notice en français précisant l''usage, les limites d''emploi, l''entretien et la durée de vie. Le nom du porteur n''est pas une obligation réglementaire, mais l''attribution personnelle est vivement recommandée pour des raisons d''hygiène et de suivi (casques, harnais, protections auditives moulées).',
      expected_answer = null,
      source_ref = 'Règlement (UE) 2016/425 relatif aux EPI',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le marquage CE', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une notice d''utilisation en français', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le nom du salarié à qui il est attribué', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le prix d''achat de l''équipement', false, 3);
end
$seed$;

-- [08/80] EPI — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'epi';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un collègue vous dit : « Je ne porte pas mes lunettes de sécurité, elles s''embuent et je vois moins bien qu''à l''œil nu — c''est donc plus dangereux de les mettre. » Que lui répondez-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Un collègue vous dit : « Je ne porte pas mes lunettes de sécurité, elles s''embuent et je vois moins bien qu''à l''œil nu — c''est donc plus dangereux de les mettre. » Que lui répondez-vous ?',
            'Le vrai enseignement de cette question est que le taux de port d''un EPI est d''abord un indicateur de la qualité de son choix. Les EPI choisis sans consulter les utilisateurs sont ceux qu''on retrouve dans les tiroirs. Associer les salariés à l''essai et au choix des modèles est la mesure la plus efficace pour faire monter le port réel.', 'L''argument est à prendre au sérieux : un EPI inconfortable n''est pas porté, et un EPI non porté ne protège pas. Mais la réponse n''est pas de renoncer à la protection, c''est de traiter la cause. Attendu : (1) reconnaître que la gêne est un vrai problème de sécurité, pas un caprice ; (2) le signaler pour obtenir un modèle adapté — traitement antibuée, verres correcteurs de sécurité, modèle ventilé, écran facial ; (3) rappeler que l''employeur doit fournir un EPI adapté à la personne et à la tâche, et associer les utilisateurs au choix ; (4) rappeler qu''entre-temps le risque de projection ne disparaît pas, et qu''une lésion oculaire est très souvent irréversible.', 'INRS — Les équipements de protection individuelle (ED 6077)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'Le vrai enseignement de cette question est que le taux de port d''un EPI est d''abord un indicateur de la qualité de son choix. Les EPI choisis sans consulter les utilisateurs sont ceux qu''on retrouve dans les tiroirs. Associer les salariés à l''essai et au choix des modèles est la mesure la plus efficace pour faire monter le port réel.',
      expected_answer = 'L''argument est à prendre au sérieux : un EPI inconfortable n''est pas porté, et un EPI non porté ne protège pas. Mais la réponse n''est pas de renoncer à la protection, c''est de traiter la cause. Attendu : (1) reconnaître que la gêne est un vrai problème de sécurité, pas un caprice ; (2) le signaler pour obtenir un modèle adapté — traitement antibuée, verres correcteurs de sécurité, modèle ventilé, écran facial ; (3) rappeler que l''employeur doit fournir un EPI adapté à la personne et à la tâche, et associer les utilisateurs au choix ; (4) rappeler qu''entre-temps le risque de projection ne disparaît pas, et qu''une lésion oculaire est très souvent irréversible.',
      source_ref = 'INRS — Les équipements de protection individuelle (ED 6077)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [09/80] Risque chimique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que signifie l''abréviation « FDS » ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que signifie l''abréviation « FDS » ?',
            'La FDS est fournie gratuitement et en français par le fournisseur pour tout produit dangereux. Elle comporte 16 rubriques normalisées : composition, dangers, premiers secours, mesures de lutte contre l''incendie, manipulation et stockage, contrôle de l''exposition et protection individuelle, etc. C''est le document de référence pour évaluer le risque et rédiger une fiche de poste.', null, 'Art. R4624-4 du Code du travail et règlement REACH (CE) n°1907/2006, art. 31', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La FDS est fournie gratuitement et en français par le fournisseur pour tout produit dangereux. Elle comporte 16 rubriques normalisées : composition, dangers, premiers secours, mesures de lutte contre l''incendie, manipulation et stockage, contrôle de l''exposition et protection individuelle, etc. C''est le document de référence pour évaluer le risque et rédiger une fiche de poste.',
      expected_answer = null,
      source_ref = 'Art. R4624-4 du Code du travail et règlement REACH (CE) n°1907/2006, art. 31',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Fiche de Données de Sécurité', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Fiche de Danger Substantiel', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Formulaire de Déclaration de Stockage', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Fiche de Décontamination Standard', false, 3);
end
$seed$;

-- [10/80] Risque chimique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que signifie le pictogramme CLP représentant un buste humain avec une étoile blanche sur le thorax ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que signifie le pictogramme CLP représentant un buste humain avec une étoile blanche sur le thorax ?',
            'Ce pictogramme signale les dangers les plus graves à long terme, dont les effets CMR (Cancérogène, Mutagène, Reprotoxique). Il ne faut pas le confondre avec le point d''exclamation, qui signale des dangers moindres (irritation, toxicité aiguë de catégorie 4). Les produits CMR relèvent de règles renforcées : substitution obligatoire dès qu''elle est techniquement possible, mesures de captage, suivi individuel renforcé.', null, 'Règlement CLP (CE) n°1272/2008 — annexe V', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Ce pictogramme signale les dangers les plus graves à long terme, dont les effets CMR (Cancérogène, Mutagène, Reprotoxique). Il ne faut pas le confondre avec le point d''exclamation, qui signale des dangers moindres (irritation, toxicité aiguë de catégorie 4). Les produits CMR relèvent de règles renforcées : substitution obligatoire dès qu''elle est techniquement possible, mesures de captage, suivi individuel renforcé.',
      expected_answer = null,
      source_ref = 'Règlement CLP (CE) n°1272/2008 — annexe V',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Danger grave pour la santé : cancérogène, mutagène, toxique pour la reproduction, sensibilisant respiratoire', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Produit irritant pour la peau et les yeux', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Produit corrosif', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Produit dangereux pour le milieu aquatique', false, 3);
end
$seed$;

-- [11/80] Risque chimique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous devez utiliser un solvant sur votre poste. Le bidon d''origine est trop lourd. Que faites-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Vous devez utiliser un solvant sur votre poste. Le bidon d''origine est trop lourd. Que faites-vous ?',
            'Tout récipient de transvasement doit être adapté au produit (compatibilité chimique) et porter un étiquetage reprenant l''identité du produit et ses pictogrammes de danger. L''usage de contenants alimentaires est formellement à exclure : c''est une cause récurrente d''intoxications graves, en particulier chez les enfants lorsque le contenant sort de l''entreprise.', null, 'Art. R4412-6 du Code du travail — INRS ED 6041', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Tout récipient de transvasement doit être adapté au produit (compatibilité chimique) et porter un étiquetage reprenant l''identité du produit et ses pictogrammes de danger. L''usage de contenants alimentaires est formellement à exclure : c''est une cause récurrente d''intoxications graves, en particulier chez les enfants lorsque le contenant sort de l''entreprise.',
      expected_answer = null,
      source_ref = 'Art. R4412-6 du Code du travail — INRS ED 6041',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous transvasez dans un récipient prévu à cet effet et vous l''étiquetez immédiatement', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous transvasez dans une bouteille d''eau minérale vide, c''est plus pratique', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous transvasez sans étiqueter, vous êtes le seul à utiliser ce poste', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous utilisez le bidon d''origine quel que soit son poids', false, 3);
end
$seed$;

-- [12/80] Risque chimique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous préparez une dilution d''acide. Dans quel sens procédez-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Vous préparez une dilution d''acide. Dans quel sens procédez-vous ?',
            'La dilution d''un acide concentré est fortement exothermique. En versant l''acide dans un grand volume d''eau, la chaleur est diluée et absorbée. Dans l''autre sens, l''eau ajoutée à l''acide provoque un échauffement localisé pouvant aller jusqu''à l''ébullition et la projection d''acide au visage. Le moyen mnémotechnique classique : « l''acide dans l''eau, jamais l''inverse ».', null, 'INRS — Stockage et transfert des produits chimiques dangereux (ED 753)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La dilution d''un acide concentré est fortement exothermique. En versant l''acide dans un grand volume d''eau, la chaleur est diluée et absorbée. Dans l''autre sens, l''eau ajoutée à l''acide provoque un échauffement localisé pouvant aller jusqu''à l''ébullition et la projection d''acide au visage. Le moyen mnémotechnique classique : « l''acide dans l''eau, jamais l''inverse ».',
      expected_answer = null,
      source_ref = 'INRS — Stockage et transfert des produits chimiques dangereux (ED 753)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'On verse l''acide dans l''eau, lentement', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'On verse l''eau dans l''acide, lentement', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Peu importe, seule la quantité finale compte', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'On mélange les deux simultanément dans un troisième récipient', false, 3);
end
$seed$;

-- [13/80] Risque chimique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelle mesure de prévention est prioritaire face à un risque chimique ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quelle mesure de prévention est prioritaire face à un risque chimique ?',
            'La hiérarchie est toujours la même : supprimer, puis substituer, puis agir sur le procédé (travail en vase clos), puis capter à la source (aspiration localisée), puis ventiler, et seulement ensuite protéger la personne. La substitution est même une obligation explicite pour les agents CMR dès qu''elle est techniquement possible. Les EPI et l''affichage sont utiles, mais ils arrivent en dernier.', null, 'Art. R4412-15 et R4412-66 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La hiérarchie est toujours la même : supprimer, puis substituer, puis agir sur le procédé (travail en vase clos), puis capter à la source (aspiration localisée), puis ventiler, et seulement ensuite protéger la personne. La substitution est même une obligation explicite pour les agents CMR dès qu''elle est techniquement possible. Les EPI et l''affichage sont utiles, mais ils arrivent en dernier.',
      expected_answer = null,
      source_ref = 'Art. R4412-15 et R4412-66 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Supprimer ou remplacer le produit par un produit moins dangereux', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Fournir des gants et un masque adaptés', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Afficher les consignes de sécurité près du poste', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Former les salariés à la lecture des étiquettes', false, 3);
end
$seed$;

-- [14/80] Risque chimique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que désigne une « VLEP » ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que désigne une « VLEP » ?',
            'La Valeur Limite d''Exposition Professionnelle est la concentration dans l''air que l''on ne doit pas dépasser, exprimée soit sur 8 heures (VLEP-8h), soit sur 15 minutes (valeur limite court terme). Certaines VLEP sont réglementaires et contraignantes, d''autres sont indicatives. Attention à l''interprétation : rester sous la VLEP ne garantit pas l''absence d''effet, en particulier pour les agents CMR pour lesquels l''objectif reste le niveau le plus bas possible.', null, 'Art. R4412-149 et R4412-150 du Code du travail', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La Valeur Limite d''Exposition Professionnelle est la concentration dans l''air que l''on ne doit pas dépasser, exprimée soit sur 8 heures (VLEP-8h), soit sur 15 minutes (valeur limite court terme). Certaines VLEP sont réglementaires et contraignantes, d''autres sont indicatives. Attention à l''interprétation : rester sous la VLEP ne garantit pas l''absence d''effet, en particulier pour les agents CMR pour lesquels l''objectif reste le niveau le plus bas possible.',
      expected_answer = null,
      source_ref = 'Art. R4412-149 et R4412-150 du Code du travail',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La concentration maximale d''un polluant dans l''air d''un lieu de travail', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La quantité maximale d''un produit stockable dans un local', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La durée maximale d''exposition d''un salarié à un produit', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le volume minimal de ventilation d''un atelier', false, 3);
end
$seed$;

-- [15/80] Risque chimique — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelles règles s''appliquent au stockage des produits chimiques ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Quelles règles s''appliquent au stockage des produits chimiques ? (plusieurs réponses)',
            'Un stockage sûr repose sur la séparation des incompatibilités (acides / bases, comburants / combustibles, produits toxiques à part), une rétention capable de contenir une fuite, une ventilation adaptée et un accès contrôlé. Les charges lourdes se stockent au contraire à hauteur de hanche : bas pour éviter la chute d''objet et la manutention au-dessus des épaules, pas au sol pour éviter la flexion du dos.', null, 'INRS — Stockage des produits chimiques au laboratoire (ED 6015) et ED 753', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Un stockage sûr repose sur la séparation des incompatibilités (acides / bases, comburants / combustibles, produits toxiques à part), une rétention capable de contenir une fuite, une ventilation adaptée et un accès contrôlé. Les charges lourdes se stockent au contraire à hauteur de hanche : bas pour éviter la chute d''objet et la manutention au-dessus des épaules, pas au sol pour éviter la flexion du dos.',
      expected_answer = null,
      source_ref = 'INRS — Stockage des produits chimiques au laboratoire (ED 6015) et ED 753',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Séparer les produits chimiquement incompatibles', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Prévoir une rétention sous les contenants de liquides', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Ventiler le local de stockage', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Stocker les bidons lourds en hauteur pour libérer le sol', false, 3);
end
$seed$;

-- [16/80] Risque chimique — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-chimique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un produit porte la mention « Peut provoquer le cancer » et il n''existe pas de substitut sur le marché pour votre application. Quelles mesures mettez-vous en place ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Un produit porte la mention « Peut provoquer le cancer » et il n''existe pas de substitut sur le marché pour votre application. Quelles mesures mettez-vous en place ?',
            'Cette question fait travailler la logique complète de prévention plutôt qu''un réflexe « masque + gants ». Le point le plus souvent oublié en séance est le suivi individuel renforcé et la traçabilité de l''exposition, qui conditionnent le suivi médical du salarié parfois des décennies plus tard.', 'Attendu, dans cet ordre : (1) documenter et tracer la recherche de substitution, qui reste une obligation continue et doit être réexaminée régulièrement — l''absence de substitut aujourd''hui n''est pas définitive ; (2) réduire l''exposition au niveau le plus bas techniquement possible : travail en système clos, sinon captage à la source au plus près de l''émission, ventilation générale en complément ; (3) réduire le nombre de personnes exposées et les durées d''exposition, délimiter et signaler la zone ; (4) contrôler l''exposition par des mesures d''atmosphère et vérifier périodiquement les installations de captage ; (5) fournir les EPI adaptés, en dernière barrière ; (6) établir la notice de poste et former ; (7) tenir la liste des travailleurs exposés et assurer le suivi individuel renforcé avec le service de prévention et de santé au travail.', 'Art. R4412-59 à R4412-93 du Code du travail (agents CMR)', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'Cette question fait travailler la logique complète de prévention plutôt qu''un réflexe « masque + gants ». Le point le plus souvent oublié en séance est le suivi individuel renforcé et la traçabilité de l''exposition, qui conditionnent le suivi médical du salarié parfois des décennies plus tard.',
      expected_answer = 'Attendu, dans cet ordre : (1) documenter et tracer la recherche de substitution, qui reste une obligation continue et doit être réexaminée régulièrement — l''absence de substitut aujourd''hui n''est pas définitive ; (2) réduire l''exposition au niveau le plus bas techniquement possible : travail en système clos, sinon captage à la source au plus près de l''émission, ventilation générale en complément ; (3) réduire le nombre de personnes exposées et les durées d''exposition, délimiter et signaler la zone ; (4) contrôler l''exposition par des mesures d''atmosphère et vérifier périodiquement les installations de captage ; (5) fournir les EPI adaptés, en dernière barrière ; (6) établir la notice de poste et former ; (7) tenir la liste des travailleurs exposés et assurer le suivi individuel renforcé avec le service de prévention et de santé au travail.',
      source_ref = 'Art. R4412-59 à R4412-93 du Code du travail (agents CMR)',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [17/80] Incendie & évacuation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quels sont les trois éléments du « triangle du feu » ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quels sont les trois éléments du « triangle du feu » ?',
            'Il faut réunir simultanément un combustible (ce qui brûle), un comburant (le plus souvent l''oxygène de l''air) et une énergie d''activation (flamme, étincelle, surface chaude, friction). Toute la prévention et l''extinction consistent à supprimer un des trois côtés : c''est pourquoi étouffer un feu (supprimer le comburant) ou refroidir (supprimer l''énergie) fonctionne aussi bien que retirer le combustible.', null, 'INRS — Incendie sur le lieu de travail (ED 990)', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Il faut réunir simultanément un combustible (ce qui brûle), un comburant (le plus souvent l''oxygène de l''air) et une énergie d''activation (flamme, étincelle, surface chaude, friction). Toute la prévention et l''extinction consistent à supprimer un des trois côtés : c''est pourquoi étouffer un feu (supprimer le comburant) ou refroidir (supprimer l''énergie) fonctionne aussi bien que retirer le combustible.',
      expected_answer = null,
      source_ref = 'INRS — Incendie sur le lieu de travail (ED 990)',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un combustible, un comburant et une énergie d''activation', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'De la chaleur, de la fumée et des flammes', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un carburant, de l''oxygène et de l''eau', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une étincelle, un gaz et une pression', false, 3);
end
$seed$;

-- [18/80] Incendie & évacuation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un feu se déclare dans une armoire électrique sous tension. Quel extincteur utilisez-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Un feu se déclare dans une armoire électrique sous tension. Quel extincteur utilisez-vous ?',
            'Le CO₂ est un gaz inerte qui n''est pas conducteur et ne laisse aucun résidu : il est adapté aux feux d''origine électrique et préserve le matériel. Attention à deux limites : il refroidit très peu, donc le feu peut reprendre si la source d''énergie n''est pas coupée, et il consomme l''oxygène du local — à utiliser avec prudence dans un espace confiné. Le premier réflexe reste de couper l''alimentation quand c''est possible.', null, 'INRS — Les extincteurs d''incendie portatifs (ED 6259)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le CO₂ est un gaz inerte qui n''est pas conducteur et ne laisse aucun résidu : il est adapté aux feux d''origine électrique et préserve le matériel. Attention à deux limites : il refroidit très peu, donc le feu peut reprendre si la source d''énergie n''est pas coupée, et il consomme l''oxygène du local — à utiliser avec prudence dans un espace confiné. Le premier réflexe reste de couper l''alimentation quand c''est possible.',
      expected_answer = null,
      source_ref = 'INRS — Les extincteurs d''incendie portatifs (ED 6259)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un extincteur à CO₂ (dioxyde de carbone)', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un extincteur à eau pulvérisée sans additif', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un seau d''eau, c''est le plus rapide', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un extincteur à mousse', false, 3);
end
$seed$;

-- [19/80] Incendie & évacuation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'Une friteuse s''enflamme dans le local de restauration. Quel est le bon geste ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Une friteuse s''enflamme dans le local de restauration. Quel est le bon geste ?',
            'L''eau versée sur de l''huile en feu se vaporise instantanément et projette l''huile enflammée en une boule de feu : c''est l''un des accidents domestiques et professionnels les plus graves. Il s''agit d''un feu de classe F, qui s''éteint par étouffement (couvercle, couverture anti-feu) ou avec un extincteur spécifiquement classé F. Déplacer un récipient en feu est également à exclure.', null, 'Norme NF EN 2 — classes de feux ; INRS ED 6259', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''eau versée sur de l''huile en feu se vaporise instantanément et projette l''huile enflammée en une boule de feu : c''est l''un des accidents domestiques et professionnels les plus graves. Il s''agit d''un feu de classe F, qui s''éteint par étouffement (couvercle, couverture anti-feu) ou avec un extincteur spécifiquement classé F. Déplacer un récipient en feu est également à exclure.',
      expected_answer = null,
      source_ref = 'Norme NF EN 2 — classes de feux ; INRS ED 6259',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Couper l''énergie et étouffer le feu avec un couvercle ou une couverture anti-feu', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Jeter de l''eau pour refroidir l''huile', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Sortir la friteuse à l''extérieur du bâtiment', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Utiliser un extincteur à eau pulvérisée', false, 3);
end
$seed$;

-- [20/80] Incendie & évacuation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'À quelle fréquence les exercices d''évacuation doivent-ils avoir lieu dans un établissement ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'À quelle fréquence les exercices d''évacuation doivent-ils avoir lieu dans un établissement ?',
            'La consigne de sécurité incendie prévoit des essais et visites périodiques du matériel et des exercices d''évacuation au moins tous les six mois, avec une date consignée sur un registre. L''objectif n''est pas de cocher une case : c''est de vérifier que les issues sont réellement praticables, que le point de rassemblement fonctionne et que le comptage des personnes est possible.', null, 'Art. R4227-39 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La consigne de sécurité incendie prévoit des essais et visites périodiques du matériel et des exercices d''évacuation au moins tous les six mois, avec une date consignée sur un registre. L''objectif n''est pas de cocher une case : c''est de vérifier que les issues sont réellement praticables, que le point de rassemblement fonctionne et que le comptage des personnes est possible.',
      expected_answer = null,
      source_ref = 'Art. R4227-39 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Au moins tous les 6 mois', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Au moins une fois par an', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Au moins tous les 2 ans', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement à l''arrivée de nouveaux salariés', false, 3);
end
$seed$;

-- [21/80] Incendie & évacuation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'L''alarme d''évacuation retentit. Vous êtes en pleine tâche urgente. Que faites-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'L''alarme d''évacuation retentit. Vous êtes en pleine tâche urgente. Que faites-vous ?',
            'L''évacuation est immédiate et sans condition : dans un incendie, la fumée envahit les circulations en quelques dizaines de secondes et c''est elle qui tue, avant les flammes. On laisse ses affaires, on ferme les portes derrière soi sans les verrouiller, on n''utilise pas l''ascenseur, on rejoint le point de rassemblement et on s''y fait recenser — c''est ce comptage qui évite d''envoyer les secours chercher quelqu''un déjà sorti.', null, 'Art. R4227-28 et suivants du Code du travail', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''évacuation est immédiate et sans condition : dans un incendie, la fumée envahit les circulations en quelques dizaines de secondes et c''est elle qui tue, avant les flammes. On laisse ses affaires, on ferme les portes derrière soi sans les verrouiller, on n''utilise pas l''ascenseur, on rejoint le point de rassemblement et on s''y fait recenser — c''est ce comptage qui évite d''envoyer les secours chercher quelqu''un déjà sorti.',
      expected_answer = null,
      source_ref = 'Art. R4227-28 et suivants du Code du travail',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous évacuez immédiatement par l''issue la plus proche et rejoignez le point de rassemblement', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous terminez votre tâche puis vous évacuez', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous allez vérifier s''il y a vraiment un feu avant d''évacuer', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous attendez qu''un responsable vienne confirmer l''ordre', false, 3);
end
$seed$;

-- [22/80] Incendie & évacuation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'Dans un feu de bâtiment, quelle est la principale cause de décès ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Dans un feu de bâtiment, quelle est la principale cause de décès ?',
            'Les fumées sont chaudes, opaques et toxiques : le monoxyde de carbone et l''acide cyanhydrique provoquent une perte de connaissance en quelques inspirations. Elles désorientent aussi complètement, même dans un local que l''on connaît par cœur. C''est pour cela que l''on évacue au plus bas si l''on doit traverser une fumée, que l''on ferme les portes pour la cantonner, et que le désenfumage est un équipement de sécurité à part entière.', null, 'INRS — Incendie et lieu de travail (ED 990)', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Les fumées sont chaudes, opaques et toxiques : le monoxyde de carbone et l''acide cyanhydrique provoquent une perte de connaissance en quelques inspirations. Elles désorientent aussi complètement, même dans un local que l''on connaît par cœur. C''est pour cela que l''on évacue au plus bas si l''on doit traverser une fumée, que l''on ferme les portes pour la cantonner, et que le désenfumage est un équipement de sécurité à part entière.',
      expected_answer = null,
      source_ref = 'INRS — Incendie et lieu de travail (ED 990)',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les fumées et les gaz toxiques inhalés', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les brûlures directes par les flammes', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''effondrement des structures', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La panique et les bousculades', false, 3);
end
$seed$;

-- [23/80] Incendie & évacuation — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelles situations constituent une infraction aux règles de sécurité incendie ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Quelles situations constituent une infraction aux règles de sécurité incendie ? (plusieurs réponses)',
            'Les trois premières sont des classiques du terrain, et les trois annulent des dispositifs qui ont coûté cher à installer. Une porte coupe-feu calée ouverte ne coupe plus rien : elle laisse la fumée envahir les circulations. Les dégagements doivent rester libres en permanence et les moyens d''extinction accessibles sans obstacle. Le plan d''évacuation affiché est au contraire une obligation.', null, 'Art. R4227-4 à R4227-14 et R4227-36 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Les trois premières sont des classiques du terrain, et les trois annulent des dispositifs qui ont coûté cher à installer. Une porte coupe-feu calée ouverte ne coupe plus rien : elle laisse la fumée envahir les circulations. Les dégagements doivent rester libres en permanence et les moyens d''extinction accessibles sans obstacle. Le plan d''évacuation affiché est au contraire une obligation.',
      expected_answer = null,
      source_ref = 'Art. R4227-4 à R4227-14 et R4227-36 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une issue de secours obstruée par des palettes', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une porte coupe-feu maintenue ouverte par une cale', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un extincteur inaccessible derrière une armoire', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un plan d''évacuation affiché à chaque étage', false, 3);
end
$seed$;

-- [24/80] Incendie & évacuation — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'incendie';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous découvrez un début d''incendie dans un local de stockage. Décrivez votre conduite à tenir, dans l''ordre.';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Vous découvrez un début d''incendie dans un local de stockage. Décrivez votre conduite à tenir, dans l''ordre.',
            'L''erreur la plus fréquente en séance est d''attaquer le feu en premier et d''alerter ensuite. Un extincteur donne quelques dizaines de secondes d''action utile : si l''alarme n''a pas été donnée pendant ce temps, on a perdu les minutes qui comptent. L''autre point à faire émerger : deux personnes valent mieux qu''une, dont une qui surveille la sortie.', 'Attendu : (1) donner l''alarme — déclencheur manuel ou alerte des personnes présentes — avant toute tentative d''extinction ; (2) faire évacuer les personnes menacées ; (3) alerter les secours (18 ou 112) en donnant lieu précis, nature du sinistre, présence de victimes et de produits dangereux ; (4) n''attaquer le feu avec un extincteur que si le feu est naissant, qu''on est formé, qu''on dispose de l''extincteur adapté, qu''on a une issue de repli dans le dos et qu''on n''est pas seul ; (5) couper les énergies si c''est accessible sans risque ; (6) fermer les portes en sortant pour cantonner la fumée ; (7) rejoindre le point de rassemblement et rendre compte. Point clé attendu : on n''engage jamais une attaque au détriment de l''alarme et de l''évacuation, et on renonce dès que la fumée gêne la respiration ou la vue.', 'INRS — Consignes de sécurité incendie (ED 929)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'L''erreur la plus fréquente en séance est d''attaquer le feu en premier et d''alerter ensuite. Un extincteur donne quelques dizaines de secondes d''action utile : si l''alarme n''a pas été donnée pendant ce temps, on a perdu les minutes qui comptent. L''autre point à faire émerger : deux personnes valent mieux qu''une, dont une qui surveille la sortie.',
      expected_answer = 'Attendu : (1) donner l''alarme — déclencheur manuel ou alerte des personnes présentes — avant toute tentative d''extinction ; (2) faire évacuer les personnes menacées ; (3) alerter les secours (18 ou 112) en donnant lieu précis, nature du sinistre, présence de victimes et de produits dangereux ; (4) n''attaquer le feu avec un extincteur que si le feu est naissant, qu''on est formé, qu''on dispose de l''extincteur adapté, qu''on a une issue de repli dans le dos et qu''on n''est pas seul ; (5) couper les énergies si c''est accessible sans risque ; (6) fermer les portes en sortant pour cantonner la fumée ; (7) rejoindre le point de rassemblement et rendre compte. Point clé attendu : on n''engage jamais une attaque au détriment de l''alarme et de l''évacuation, et on renonce dès que la fumée gêne la respiration ou la vue.',
      source_ref = 'INRS — Consignes de sécurité incendie (ED 929)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [25/80] Gestes, postures & TMS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que désigne l''abréviation « TMS » ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que désigne l''abréviation « TMS » ?',
            'Les TMS regroupent les atteintes des muscles, tendons, nerfs et articulations : lombalgies, syndrome du canal carpien, tendinopathie de l''épaule, épicondylite. Ils représentent la très grande majorité des maladies professionnelles reconnues en France. Leur particularité est de s''installer progressivement : quand la douleur apparaît, l''atteinte est souvent déjà ancienne.', null, 'INRS — Troubles musculo-squelettiques (dossier TMS) ; tableaux 57, 69, 79, 97, 98 des MP', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Les TMS regroupent les atteintes des muscles, tendons, nerfs et articulations : lombalgies, syndrome du canal carpien, tendinopathie de l''épaule, épicondylite. Ils représentent la très grande majorité des maladies professionnelles reconnues en France. Leur particularité est de s''installer progressivement : quand la douleur apparaît, l''atteinte est souvent déjà ancienne.',
      expected_answer = null,
      source_ref = 'INRS — Troubles musculo-squelettiques (dossier TMS) ; tableaux 57, 69, 79, 97, 98 des MP',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Troubles musculo-squelettiques', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Traumatismes musculaires sévères', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Techniques de manutention sécurisée', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tableau de maladies suivies', false, 3);
end
$seed$;

-- [26/80] Gestes, postures & TMS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous devez soulever une charge lourde posée au sol. Quel est le bon geste ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Vous devez soulever une charge lourde posée au sol. Quel est le bon geste ?',
            'Le principe est de faire travailler les jambes et non le dos, et de réduire le bras de levier en gardant la charge près du corps : à 60 cm du tronc, une charge de 10 kg génère une contrainte lombaire plusieurs fois supérieure à la même charge collée au corps. On oriente les pieds vers la destination avant de soulever, car la torsion du tronc sous charge est le geste le plus délétère pour les disques intervertébraux.', null, 'INRS — Méthode de prévention des TMS ; norme NF X35-109', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le principe est de faire travailler les jambes et non le dos, et de réduire le bras de levier en gardant la charge près du corps : à 60 cm du tronc, une charge de 10 kg génère une contrainte lombaire plusieurs fois supérieure à la même charge collée au corps. On oriente les pieds vers la destination avant de soulever, car la torsion du tronc sous charge est le geste le plus délétère pour les disques intervertébraux.',
      expected_answer = null,
      source_ref = 'INRS — Méthode de prévention des TMS ; norme NF X35-109',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Fléchir les genoux, garder le dos droit et la charge près du corps', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Garder les jambes tendues et se pencher en arrondissant le dos', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Fléchir les genoux et tenir la charge à bout de bras', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Soulever en pivotant le buste pour gagner du temps', false, 3);
end
$seed$;

-- [27/80] Gestes, postures & TMS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'Le Code du travail fixe-t-il une limite au port manuel de charges ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Le Code du travail fixe-t-il une limite au port manuel de charges ?',
            'Le plafond réglementaire est de 55 kg, franchissable seulement après avis d''aptitude du médecin du travail et sans jamais dépasser 105 kg. Attention au piège : ce plafond est une limite absolue, pas un objectif. Les valeurs de référence en ergonomie sont bien plus basses — l''ordre de 25 kg comme maximum acceptable pour un homme et 15 kg pour une femme dans des conditions favorables — et l''obligation première reste d''éviter le recours à la manutention manuelle par des aides mécaniques.', null, 'Art. R4541-9 du Code du travail ; norme NF X35-109', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le plafond réglementaire est de 55 kg, franchissable seulement après avis d''aptitude du médecin du travail et sans jamais dépasser 105 kg. Attention au piège : ce plafond est une limite absolue, pas un objectif. Les valeurs de référence en ergonomie sont bien plus basses — l''ordre de 25 kg comme maximum acceptable pour un homme et 15 kg pour une femme dans des conditions favorables — et l''obligation première reste d''éviter le recours à la manutention manuelle par des aides mécaniques.',
      expected_answer = null,
      source_ref = 'Art. R4541-9 du Code du travail ; norme NF X35-109',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui : 55 kg, et au-delà seulement avec avis d''aptitude du médecin du travail, sans dépasser 105 kg', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Non, aucune limite n''est fixée réglementairement', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui : 25 kg pour tous les salariés, sans exception', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui : 15 kg au-delà de 50 ans', false, 3);
end
$seed$;

-- [28/80] Gestes, postures & TMS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelle est la première mesure à rechercher face à un risque lié à la manutention manuelle ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quelle est la première mesure à rechercher face à un risque lié à la manutention manuelle ?',
            'L''employeur doit d''abord éviter le recours à la manutention manuelle, par l''organisation ou par des équipements mécaniques : table élévatrice, transpalette, manipulateur, convoyeur, diable. La formation aux gestes est utile mais ne compense pas un poste mal conçu — c''est même une erreur classique de miser dessus seule, car elle déplace la responsabilité sur le salarié sans réduire la contrainte. La ceinture lombaire n''a pas démontré d''efficacité préventive.', null, 'Art. R4541-2 et R4541-3 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''employeur doit d''abord éviter le recours à la manutention manuelle, par l''organisation ou par des équipements mécaniques : table élévatrice, transpalette, manipulateur, convoyeur, diable. La formation aux gestes est utile mais ne compense pas un poste mal conçu — c''est même une erreur classique de miser dessus seule, car elle déplace la responsabilité sur le salarié sans réduire la contrainte. La ceinture lombaire n''a pas démontré d''efficacité préventive.',
      expected_answer = null,
      source_ref = 'Art. R4541-2 et R4541-3 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Éviter la manutention manuelle, par exemple avec une aide mécanique', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Former les salariés aux bons gestes et postures', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Fournir une ceinture de maintien lombaire', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Limiter le temps de travail sur le poste concerné', false, 3);
end
$seed$;

-- [29/80] Gestes, postures & TMS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'À quelle hauteur idéale se situe une charge que l''on doit manipuler fréquemment ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'À quelle hauteur idéale se situe une charge que l''on doit manipuler fréquemment ?',
            'La zone de confort se situe entre les hanches et les épaules, bras près du corps : c''est là que l''effort et les contraintes articulaires sont minimaux. Sous les genoux, on impose une flexion du tronc ; au-dessus des épaules, on sollicite fortement la coiffe des rotateurs et l''on perd le contrôle de la charge. Réorganiser le stockage selon la fréquence de prise — le plus manipulé à mi-hauteur — est souvent la mesure la moins chère et la plus efficace.', null, 'INRS — Aide-mémoire ED 6161 ; norme NF X35-109', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La zone de confort se situe entre les hanches et les épaules, bras près du corps : c''est là que l''effort et les contraintes articulaires sont minimaux. Sous les genoux, on impose une flexion du tronc ; au-dessus des épaules, on sollicite fortement la coiffe des rotateurs et l''on perd le contrôle de la charge. Réorganiser le stockage selon la fréquence de prise — le plus manipulé à mi-hauteur — est souvent la mesure la moins chère et la plus efficace.',
      expected_answer = null,
      source_ref = 'INRS — Aide-mémoire ED 6161 ; norme NF X35-109',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Entre les hanches et les épaules', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Au niveau du sol, pour éviter les chutes d''objets', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Au-dessus des épaules, pour dégager l''espace de travail', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La hauteur n''a pas d''importance si le poids est faible', false, 3);
end
$seed$;

-- [30/80] Gestes, postures & TMS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'Parmi ces facteurs, lequel n''est PAS un facteur de risque reconnu de TMS ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Parmi ces facteurs, lequel n''est PAS un facteur de risque reconnu de TMS ?',
            'Attention : c''est la première proposition qui n''est pas un facteur de risque en soi. Ce qui compte n''est pas la position debout ou assise, mais son maintien prolongé sans possibilité de varier : l''alternance est protectrice, la fixité est délétère. Les trois autres sont des facteurs établis, et le dernier surprend souvent en séance — les facteurs organisationnels et psychosociaux (contrainte de temps, faible autonomie, manque de reconnaissance) sont bien documentés comme aggravants des TMS.', null, 'INRS — Facteurs de risque de TMS (dossier TMS)', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Attention : c''est la première proposition qui n''est pas un facteur de risque en soi. Ce qui compte n''est pas la position debout ou assise, mais son maintien prolongé sans possibilité de varier : l''alternance est protectrice, la fixité est délétère. Les trois autres sont des facteurs établis, et le dernier surprend souvent en séance — les facteurs organisationnels et psychosociaux (contrainte de temps, faible autonomie, manque de reconnaissance) sont bien documentés comme aggravants des TMS.',
      expected_answer = null,
      source_ref = 'INRS — Facteurs de risque de TMS (dossier TMS)',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le fait de travailler debout plutôt qu''assis', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La répétitivité des gestes', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les vibrations transmises aux membres supérieurs', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le manque de marge de manœuvre dans le travail', false, 3);
end
$seed$;

-- [31/80] Gestes, postures & TMS — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous devez déplacer une charge encombrante. Quels réflexes adoptez-vous avant de la soulever ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Vous devez déplacer une charge encombrante. Quels réflexes adoptez-vous avant de la soulever ? (plusieurs réponses)',
            'La préparation compte autant que le geste : tester le poids, assurer la prise, dégager le trajet, prévoir où déposer, et savoir renoncer pour appeler un collègue ou un moyen mécanique. Le mouvement brusque ou « à l''élan » est au contraire un facteur majeur de lombalgie aiguë : la charge doit être levée progressivement, sans à-coup, sans torsion, en soufflant.', null, 'INRS — ED 6161 Manutention manuelle', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'La préparation compte autant que le geste : tester le poids, assurer la prise, dégager le trajet, prévoir où déposer, et savoir renoncer pour appeler un collègue ou un moyen mécanique. Le mouvement brusque ou « à l''élan » est au contraire un facteur majeur de lombalgie aiguë : la charge doit être levée progressivement, sans à-coup, sans torsion, en soufflant.',
      expected_answer = null,
      source_ref = 'INRS — ED 6161 Manutention manuelle',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tester le poids et vérifier la prise', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Repérer le trajet et vérifier qu''il est dégagé', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Demander de l''aide si la charge est trop lourde ou encombrante', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Prendre son élan pour utiliser la dynamique du mouvement', false, 3);
end
$seed$;

-- [32/80] Gestes, postures & TMS — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'gestes-postures';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un salarié se plaint depuis des semaines de douleurs à l''épaule sur un poste répétitif, mais ne veut pas le déclarer par peur d''être déclaré inapte. Comment agissez-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Un salarié se plaint depuis des semaines de douleurs à l''épaule sur un poste répétitif, mais ne veut pas le déclarer par peur d''être déclaré inapte. Comment agissez-vous ?',
            'La crainte de l''inaptitude est un frein très réel au signalement précoce, et c''est ce qui transforme une gêne réversible en maladie professionnelle indemnisable. Le message à faire passer est double : le médecin du travail est un allié du maintien dans l''emploi, et un signalement individuel doit déclencher une action sur le poste, pas seulement un suivi de la personne.', 'Attendu : (1) prendre la plainte au sérieux — une douleur persistante sur un poste répétitif est un signal d''alerte, et plus on intervient tôt plus la lésion est réversible ; (2) l''orienter vers le service de prévention et de santé au travail, en rappelant que le médecin du travail est soumis au secret médical et que son rôle est de maintenir dans l''emploi, non d''exclure ; (3) expliquer que la visite peut se faire à la demande du salarié, sans passer par l''employeur ; (4) traiter le poste sans attendre : analyser l''activité réelle, réduire la répétitivité et les efforts, revoir les hauteurs et les prises, introduire des rotations et des pauses ; (5) rechercher si d''autres salariés du même poste présentent des signes — une plainte isolée révèle souvent un problème collectif ; (6) mettre à jour le DUERP.', 'Art. R4624-34 du Code du travail (visite à la demande du salarié)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'La crainte de l''inaptitude est un frein très réel au signalement précoce, et c''est ce qui transforme une gêne réversible en maladie professionnelle indemnisable. Le message à faire passer est double : le médecin du travail est un allié du maintien dans l''emploi, et un signalement individuel doit déclencher une action sur le poste, pas seulement un suivi de la personne.',
      expected_answer = 'Attendu : (1) prendre la plainte au sérieux — une douleur persistante sur un poste répétitif est un signal d''alerte, et plus on intervient tôt plus la lésion est réversible ; (2) l''orienter vers le service de prévention et de santé au travail, en rappelant que le médecin du travail est soumis au secret médical et que son rôle est de maintenir dans l''emploi, non d''exclure ; (3) expliquer que la visite peut se faire à la demande du salarié, sans passer par l''employeur ; (4) traiter le poste sans attendre : analyser l''activité réelle, réduire la répétitivité et les efforts, revoir les hauteurs et les prises, introduire des rotations et des pauses ; (5) rechercher si d''autres salariés du même poste présentent des signes — une plainte isolée révèle souvent un problème collectif ; (6) mettre à jour le DUERP.',
      source_ref = 'Art. R4624-34 du Code du travail (visite à la demande du salarié)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [33/80] Risque électrique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Qui délivre l''habilitation électrique ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Qui délivre l''habilitation électrique ?',
            'C''est une confusion très fréquente : l''organisme de formation délivre une attestation de compétence, mais l''habilitation est un acte de l''employeur, écrit, nominatif, précisant le domaine de tension et la nature des opérations autorisées. L''employeur reste responsable de sa pertinence : il doit vérifier l''aptitude médicale, la connaissance des installations et renouveler la formation périodiquement, tous les trois ans en pratique courante.', null, 'Art. R4544-9 et R4544-10 du Code du travail ; norme NF C18-510', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'C''est une confusion très fréquente : l''organisme de formation délivre une attestation de compétence, mais l''habilitation est un acte de l''employeur, écrit, nominatif, précisant le domaine de tension et la nature des opérations autorisées. L''employeur reste responsable de sa pertinence : il doit vérifier l''aptitude médicale, la connaissance des installations et renouveler la formation périodiquement, tous les trois ans en pratique courante.',
      expected_answer = null,
      source_ref = 'Art. R4544-9 et R4544-10 du Code du travail ; norme NF C18-510',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''employeur, après s''être assuré que le salarié a été formé', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''organisme de formation, à la fin du stage', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le service de prévention et de santé au travail', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le fournisseur d''électricité', false, 3);
end
$seed$;

-- [34/80] Risque électrique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelles sont les étapes d''une consignation électrique, dans l''ordre ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quelles sont les étapes d''une consignation électrique, dans l''ordre ?',
            'L''ordre importe : on sépare l''ouvrage de toute source de tension, on condamne l''organe de séparation en position d''ouverture (cadenas et pancarte, pour qu''un tiers ne puisse pas réenclencher), on identifie l''ouvrage pour être certain de travailler sur le bon départ, puis on vérifie l''absence de tension au plus près du lieu de travail, suivie si nécessaire d''une mise à la terre et en court-circuit. La VAT se fait juste avant l''intervention, et l''appareil de mesure est testé avant et après.', null, 'Norme NF C18-510 ; art. R4544-5 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''ordre importe : on sépare l''ouvrage de toute source de tension, on condamne l''organe de séparation en position d''ouverture (cadenas et pancarte, pour qu''un tiers ne puisse pas réenclencher), on identifie l''ouvrage pour être certain de travailler sur le bon départ, puis on vérifie l''absence de tension au plus près du lieu de travail, suivie si nécessaire d''une mise à la terre et en court-circuit. La VAT se fait juste avant l''intervention, et l''appareil de mesure est testé avant et après.',
      expected_answer = null,
      source_ref = 'Norme NF C18-510 ; art. R4544-5 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Séparation, condamnation, identification, vérification d''absence de tension', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Identification, séparation, vérification d''absence de tension, condamnation', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vérification d''absence de tension, séparation, condamnation, identification', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Condamnation, séparation, identification, mise à la terre', false, 3);
end
$seed$;

-- [35/80] Risque électrique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un collègue est en contact avec un conducteur sous tension et ne peut plus se dégager. Quel est votre premier geste ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Un collègue est en contact avec un conducteur sous tension et ne peut plus se dégager. Quel est votre premier geste ?',
            'Tant que le courant passe, toucher la victime fait de vous une seconde victime : on coupe d''abord, au disjoncteur ou à l''interrupteur le plus proche. Si la coupure est impossible, on écarte la victime ou le conducteur avec un objet isolant et sec, en se plaçant soi-même sur un support isolant. Ce n''est qu''après la mise en sécurité que l''on alerte et que l''on porte secours : l''électrisation provoque fréquemment un arrêt cardiaque, le défibrillateur est donc à demander d''emblée.', null, 'INRS — Risque électrique, conduite à tenir (ED 6344)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Tant que le courant passe, toucher la victime fait de vous une seconde victime : on coupe d''abord, au disjoncteur ou à l''interrupteur le plus proche. Si la coupure est impossible, on écarte la victime ou le conducteur avec un objet isolant et sec, en se plaçant soi-même sur un support isolant. Ce n''est qu''après la mise en sécurité que l''on alerte et que l''on porte secours : l''électrisation provoque fréquemment un arrêt cardiaque, le défibrillateur est donc à demander d''emblée.',
      expected_answer = null,
      source_ref = 'INRS — Risque électrique, conduite à tenir (ED 6344)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Couper l''alimentation électrique', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le tirer par le bras pour l''éloigner du conducteur', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Commencer immédiatement un massage cardiaque', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Lui jeter de l''eau pour rompre le contact', false, 3);
end
$seed$;

-- [36/80] Risque électrique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'En courant alternatif, à partir de quelle tension de contact considère-t-on qu''il y a un danger pour l''organisme en milieu sec ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'En courant alternatif, à partir de quelle tension de contact considère-t-on qu''il y a un danger pour l''organisme en milieu sec ?',
            'La tension limite conventionnelle de sécurité est de 50 V en alternatif en milieu sec, et elle chute à 25 V en milieu humide, voire 12 V en milieu immergé : c''est l''humidité qui fait s''effondrer la résistance du corps. Retenir aussi que c''est l''intensité qui tue, pas la tension : à partir d''environ 30 mA traversant le thorax, la fibrillation ventriculaire devient possible — d''où les dispositifs différentiels 30 mA sur les circuits de prises.', null, 'Norme NF C15-100 ; INRS ED 6344', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La tension limite conventionnelle de sécurité est de 50 V en alternatif en milieu sec, et elle chute à 25 V en milieu humide, voire 12 V en milieu immergé : c''est l''humidité qui fait s''effondrer la résistance du corps. Retenir aussi que c''est l''intensité qui tue, pas la tension : à partir d''environ 30 mA traversant le thorax, la fibrillation ventriculaire devient possible — d''où les dispositifs différentiels 30 mA sur les circuits de prises.',
      expected_answer = null,
      source_ref = 'Norme NF C15-100 ; INRS ED 6344',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, '50 volts', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, '12 volts', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, '230 volts', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, '400 volts', false, 3);
end
$seed$;

-- [37/80] Risque électrique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelle est la différence entre électrisation et électrocution ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quelle est la différence entre électrisation et électrocution ?',
            'L''électrisation désigne le passage du courant dans le corps quelles qu''en soient les conséquences ; l''électrocution en est l''issue mortelle. La distinction a un intérêt pratique en séance : les électrisations sont bien plus nombreuses que les électrocutions et sont souvent banalisées (« j''ai juste pris une châtaigne »), alors qu''elles justifient toujours un examen médical — des troubles du rythme cardiaque peuvent apparaître à retardement, et des brûlures internes ne se voient pas.', null, 'INRS — Dossier risque électrique', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''électrisation désigne le passage du courant dans le corps quelles qu''en soient les conséquences ; l''électrocution en est l''issue mortelle. La distinction a un intérêt pratique en séance : les électrisations sont bien plus nombreuses que les électrocutions et sont souvent banalisées (« j''ai juste pris une châtaigne »), alors qu''elles justifient toujours un examen médical — des troubles du rythme cardiaque peuvent apparaître à retardement, et des brûlures internes ne se voient pas.',
      expected_answer = null,
      source_ref = 'INRS — Dossier risque électrique',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''électrocution est une électrisation qui entraîne la mort', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''électrocution concerne la haute tension, l''électrisation la basse tension', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''électrisation est un contact direct, l''électrocution un contact indirect', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les deux termes sont synonymes', false, 3);
end
$seed$;

-- [38/80] Risque électrique — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'À quelle fréquence les installations électriques d''un lieu de travail doivent-elles être vérifiées ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'À quelle fréquence les installations électriques d''un lieu de travail doivent-elles être vérifiées ?',
            'La vérification périodique est annuelle, réalisée par une personne ou un organisme compétent, et consignée dans un registre avec les suites données aux observations. C''est ce dernier point qui pose problème en pratique : un rapport de vérification dont les remarques ne sont pas levées est un élément à charge, pas une preuve de conformité.', null, 'Art. R4226-16 du Code du travail ; arrêté du 26 décembre 2011', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La vérification périodique est annuelle, réalisée par une personne ou un organisme compétent, et consignée dans un registre avec les suites données aux observations. C''est ce dernier point qui pose problème en pratique : un rapport de vérification dont les remarques ne sont pas levées est un élément à charge, pas une preuve de conformité.',
      expected_answer = null,
      source_ref = 'Art. R4226-16 du Code du travail ; arrêté du 26 décembre 2011',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les ans', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les 5 ans', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les 10 ans', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement à la mise en service', false, 3);
end
$seed$;

-- [39/80] Risque électrique — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quels signes doivent vous alerter sur une installation ou un appareil électrique ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Quels signes doivent vous alerter sur une installation ou un appareil électrique ? (plusieurs réponses)',
            'Les quatre sont des signaux d''alerte à faire remonter sans délai, et le quatrième est le plus souvent négligé : un différentiel qui déclenche fait exactement son travail, il signale un défaut d''isolement. Le réflexe consistant à le réarmer en boucle — ou pire, à le neutraliser — supprime la protection des personnes. Un appareil suspect est mis hors service et étiqueté, pas laissé sur le poste.', null, 'INRS — ED 6344 Risque électrique', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Les quatre sont des signaux d''alerte à faire remonter sans délai, et le quatrième est le plus souvent négligé : un différentiel qui déclenche fait exactement son travail, il signale un défaut d''isolement. Le réflexe consistant à le réarmer en boucle — ou pire, à le neutraliser — supprime la protection des personnes. Un appareil suspect est mis hors service et étiqueté, pas laissé sur le poste.',
      expected_answer = null,
      source_ref = 'INRS — ED 6344 Risque électrique',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une odeur de brûlé ou de plastique chaud', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un échauffement anormal d''une prise ou d''un câble', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un câble dont la gaine est entaillée', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un disjoncteur différentiel qui se déclenche régulièrement', true, 3);
end
$seed$;

-- [40/80] Risque électrique — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'risque-electrique';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous devez remplacer un néon dans un atelier. Faut-il une habilitation électrique, et laquelle ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Vous devez remplacer un néon dans un atelier. Faut-il une habilitation électrique, et laquelle ?',
            'Cette question a l''intérêt de montrer que le geste banal cache deux risques et non un seul : l''électrique et la chute de hauteur, cette dernière étant statistiquement la plus fréquente sur ce type d''intervention. Elle permet aussi de faire dire que « couper l''interrupteur » n''est pas une consignation.', 'Attendu : le remplacement d''une lampe est une opération d''ordre non électrique réalisée hors tension sur un matériel dont les parties actives sont protégées ; elle relève typiquement d''une habilitation B0 (exécutant non électricien) lorsqu''elle a lieu dans un local d''accès réservé aux électriciens ou à proximité de pièces nues sous tension. Le raisonnement attendu est surtout : (1) on ne raisonne pas par la simplicité apparente du geste mais par l''environnement et la présence de pièces nues sous tension ; (2) on coupe et on condamne le circuit d''éclairage avant l''intervention, l''interrupteur seul ne garantit pas l''absence de tension au niveau de la douille ; (3) si l''opération implique d''ouvrir un appareillage, de déconnecter ou de raccorder, on change de catégorie et il faut une habilitation d''ordre électrique (BS ou BR selon le cas) ; (4) s''ajoutent le risque de chute de hauteur — donc le moyen d''accès adapté — et la manipulation d''un tube contenant du mercure.', 'Norme NF C18-510 ; art. R4544-9 du Code du travail', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'Cette question a l''intérêt de montrer que le geste banal cache deux risques et non un seul : l''électrique et la chute de hauteur, cette dernière étant statistiquement la plus fréquente sur ce type d''intervention. Elle permet aussi de faire dire que « couper l''interrupteur » n''est pas une consignation.',
      expected_answer = 'Attendu : le remplacement d''une lampe est une opération d''ordre non électrique réalisée hors tension sur un matériel dont les parties actives sont protégées ; elle relève typiquement d''une habilitation B0 (exécutant non électricien) lorsqu''elle a lieu dans un local d''accès réservé aux électriciens ou à proximité de pièces nues sous tension. Le raisonnement attendu est surtout : (1) on ne raisonne pas par la simplicité apparente du geste mais par l''environnement et la présence de pièces nues sous tension ; (2) on coupe et on condamne le circuit d''éclairage avant l''intervention, l''interrupteur seul ne garantit pas l''absence de tension au niveau de la douille ; (3) si l''opération implique d''ouvrir un appareillage, de déconnecter ou de raccorder, on change de catégorie et il faut une habilitation d''ordre électrique (BS ou BR selon le cas) ; (4) s''ajoutent le risque de chute de hauteur — donc le moyen d''accès adapté — et la manipulation d''un tube contenant du mercure.',
      source_ref = 'Norme NF C18-510 ; art. R4544-9 du Code du travail',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [41/80] Travail en hauteur — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'À partir de quelle hauteur la réglementation française impose-t-elle des mesures de protection contre les chutes ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'À partir de quelle hauteur la réglementation française impose-t-elle des mesures de protection contre les chutes ?',
            'Contrairement à une idée très répandue, le Code du travail ne fixe aucun seuil déclenchant. L''employeur doit évaluer le risque de chute quelle que soit la hauteur et prendre les mesures adaptées : des chutes mortelles sont régulièrement constatées de moins de trois mètres, et une chute d''un mètre dans un escalier ou sur une arête peut être grave. Le seuil de 3 mètres que l''on entend souvent provient d''anciens textes du bâtiment, abrogés.', null, 'Art. R4323-58 et suivants du Code du travail ; INRS ED 130', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Contrairement à une idée très répandue, le Code du travail ne fixe aucun seuil déclenchant. L''employeur doit évaluer le risque de chute quelle que soit la hauteur et prendre les mesures adaptées : des chutes mortelles sont régulièrement constatées de moins de trois mètres, et une chute d''un mètre dans un escalier ou sur une arête peut être grave. Le seuil de 3 mètres que l''on entend souvent provient d''anciens textes du bâtiment, abrogés.',
      expected_answer = null,
      source_ref = 'Art. R4323-58 et suivants du Code du travail ; INRS ED 130',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Il n''existe pas de hauteur minimale : le risque s''apprécie dès qu''il y a une différence de niveau', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'À partir de 3 mètres', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'À partir de 2 mètres', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'À partir de 1,50 mètre', false, 3);
end
$seed$;

-- [42/80] Travail en hauteur — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'Entre un garde-corps et un harnais antichute, que faut-il privilégier ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Entre un garde-corps et un harnais antichute, que faut-il privilégier ?',
            'Le garde-corps protège tout le monde en permanence, sans action ni compétence de la part des personnes présentes, et il empêche la chute au lieu de l''arrêter. Le harnais, lui, ne fonctionne que s''il est correctement ajusté, relié à un point d''ancrage résistant, avec un tirant d''air suffisant, et il laisse la personne suspendue — donc à secourir en urgence. Le harnais n''intervient que lorsque la protection collective est techniquement impossible.', null, 'Art. R4323-58 et R4323-61 du Code du travail', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le garde-corps protège tout le monde en permanence, sans action ni compétence de la part des personnes présentes, et il empêche la chute au lieu de l''arrêter. Le harnais, lui, ne fonctionne que s''il est correctement ajusté, relié à un point d''ancrage résistant, avec un tirant d''air suffisant, et il laisse la personne suspendue — donc à secourir en urgence. Le harnais n''intervient que lorsque la protection collective est techniquement impossible.',
      expected_answer = null,
      source_ref = 'Art. R4323-58 et R4323-61 du Code du travail',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le garde-corps, car c''est une protection collective', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le harnais, car il suit la personne partout', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les deux se valent, c''est au salarié de choisir', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le harnais, car il est moins coûteux à installer', false, 3);
end
$seed$;

-- [43/80] Travail en hauteur — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelles sont les caractéristiques réglementaires d''un garde-corps ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quelles sont les caractéristiques réglementaires d''un garde-corps ?',
            'Trois éléments, trois fonctions : la lisse haute entre 1 m et 1,10 m retient le corps, la lisse intermédiaire (ou un remplissage) empêche le passage à travers, et la plinthe de 10 à 15 cm empêche le pied de glisser sous la lisse et surtout empêche les objets de tomber sur les personnes en dessous. C''est la plinthe que l''on oublie le plus souvent, alors que la chute d''objet est un risque majeur en co-activité.', null, 'Art. R4323-59 du Code du travail', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Trois éléments, trois fonctions : la lisse haute entre 1 m et 1,10 m retient le corps, la lisse intermédiaire (ou un remplissage) empêche le passage à travers, et la plinthe de 10 à 15 cm empêche le pied de glisser sous la lisse et surtout empêche les objets de tomber sur les personnes en dessous. C''est la plinthe que l''on oublie le plus souvent, alors que la chute d''objet est un risque majeur en co-activité.',
      expected_answer = null,
      source_ref = 'Art. R4323-59 du Code du travail',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Lisse haute entre 1 m et 1,10 m, lisse intermédiaire vers 45 cm, plinthe de 10 à 15 cm', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une seule lisse à 90 cm suffit', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Lisse haute à 80 cm et plinthe de 5 cm', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Aucune dimension n''est imposée, seule la résistance compte', false, 3);
end
$seed$;

-- [44/80] Travail en hauteur — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'Peut-on utiliser une échelle comme poste de travail ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Peut-on utiliser une échelle comme poste de travail ?',
            'L''échelle est un moyen d''accès, pas un poste de travail. Son usage comme poste est possible seulement par exception : impossibilité technique de recourir à un équipement assurant la protection collective, et travaux de courte durée présentant un risque faible. Dans tous les cas, elle doit reposer sur un support stable, être fixée ou calée, et l''utilisateur garde toujours une main disponible et trois points d''appui — ce qui exclut de porter une charge ou d''utiliser un outil à deux mains.', null, 'Art. R4323-63 et R4323-81 à R4323-88 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''échelle est un moyen d''accès, pas un poste de travail. Son usage comme poste est possible seulement par exception : impossibilité technique de recourir à un équipement assurant la protection collective, et travaux de courte durée présentant un risque faible. Dans tous les cas, elle doit reposer sur un support stable, être fixée ou calée, et l''utilisateur garde toujours une main disponible et trois points d''appui — ce qui exclut de porter une charge ou d''utiliser un outil à deux mains.',
      expected_answer = null,
      source_ref = 'Art. R4323-63 et R4323-81 à R4323-88 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Non, sauf impossibilité technique d''utiliser un équipement plus sûr, et pour des travaux de courte durée à faible risque', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui, sans restriction, si l''échelle est en bon état', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui, à condition d''être deux, dont un qui tient l''échelle', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Non, l''échelle est totalement interdite en entreprise', false, 3);
end
$seed$;

-- [45/80] Travail en hauteur — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que désigne le « tirant d''air » dans un système d''arrêt de chute ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que désigne le « tirant d''air » dans un système d''arrêt de chute ?',
            'Le tirant d''air additionne la longueur de la longe, le déploiement de l''absorbeur d''énergie, la taille de l''utilisateur, l''effet de glissement du harnais et une marge de sécurité — soit couramment 6 à 7 mètres avec une longe classique. En dessous, la personne touche le sol ou un obstacle avant que le système n''ait pu freiner : le harnais donne alors un sentiment de sécurité sans protéger. À faible hauteur, on utilise un antichute à rappel automatique ou, mieux encore, un système de retenue qui empêche d''atteindre le vide.', null, 'INRS — Les équipements de protection individuelle contre les chutes de hauteur (ED 6110)', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le tirant d''air additionne la longueur de la longe, le déploiement de l''absorbeur d''énergie, la taille de l''utilisateur, l''effet de glissement du harnais et une marge de sécurité — soit couramment 6 à 7 mètres avec une longe classique. En dessous, la personne touche le sol ou un obstacle avant que le système n''ait pu freiner : le harnais donne alors un sentiment de sécurité sans protéger. À faible hauteur, on utilise un antichute à rappel automatique ou, mieux encore, un système de retenue qui empêche d''atteindre le vide.',
      expected_answer = null,
      source_ref = 'INRS — Les équipements de protection individuelle contre les chutes de hauteur (ED 6110)',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La hauteur libre nécessaire sous l''utilisateur pour que le système arrête la chute avant l''impact', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La ventilation minimale requise dans un espace confiné', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La distance horizontale maximale au point d''ancrage', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le débit d''air de l''appareil respiratoire isolant', false, 3);
end
$seed$;

-- [46/80] Travail en hauteur — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'Pourquoi un salarié équipé d''un harnais ne doit-il jamais travailler seul en hauteur ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Pourquoi un salarié équipé d''un harnais ne doit-il jamais travailler seul en hauteur ?',
            'Après une chute, la personne reste suspendue et immobile : la compression des sangles au niveau des cuisses entrave le retour veineux et peut provoquer un malaise grave, parfois en moins de trente minutes. C''est le syndrome du harnais. Le travail en hauteur avec système d''arrêt de chute suppose donc qu''une seconde personne puisse donner l''alerte, et surtout qu''un moyen de dépose ait été prévu et testé avant l''intervention — pas improvisé le jour de l''accident.', null, 'INRS — ED 6110 ; art. R4543-1 et suivants (travail isolé)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Après une chute, la personne reste suspendue et immobile : la compression des sangles au niveau des cuisses entrave le retour veineux et peut provoquer un malaise grave, parfois en moins de trente minutes. C''est le syndrome du harnais. Le travail en hauteur avec système d''arrêt de chute suppose donc qu''une seconde personne puisse donner l''alerte, et surtout qu''un moyen de dépose ait été prévu et testé avant l''intervention — pas improvisé le jour de l''accident.',
      expected_answer = null,
      source_ref = 'INRS — ED 6110 ; art. R4543-1 et suivants (travail isolé)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Parce qu''une personne suspendue doit être secourue très rapidement', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Parce qu''il faut être deux pour ajuster un harnais', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Parce que le point d''ancrage doit être surveillé en permanence', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Parce que la réglementation impose deux harnais par point d''ancrage', false, 3);
end
$seed$;

-- [47/80] Travail en hauteur — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous devez intervenir sur une toiture. Quels risques devez-vous évaluer en plus de la chute par le bord ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Vous devez intervenir sur une toiture. Quels risques devez-vous évaluer en plus de la chute par le bord ? (plusieurs réponses)',
            'Les quatre sont réels, et la chute à travers un matériau fragile est l''un des accidents mortels les plus fréquents en toiture : la surface paraît porteuse et cède d''un coup. Elle impose des dispositifs spécifiques — passerelles de circulation, filets ou platelage sous la zone, protection des lumières de toit. À cela s''ajoutent les conditions météo, qui doivent conduire à interrompre le travail, et le balisage au sol contre la chute d''objets.', null, 'Art. R4323-60 et R4534-85 et suivants du Code du travail ; INRS ED 130', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Les quatre sont réels, et la chute à travers un matériau fragile est l''un des accidents mortels les plus fréquents en toiture : la surface paraît porteuse et cède d''un coup. Elle impose des dispositifs spécifiques — passerelles de circulation, filets ou platelage sous la zone, protection des lumières de toit. À cela s''ajoutent les conditions météo, qui doivent conduire à interrompre le travail, et le balisage au sol contre la chute d''objets.',
      expected_answer = null,
      source_ref = 'Art. R4323-60 et R4534-85 et suivants du Code du travail ; INRS ED 130',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La chute à travers un matériau fragile (plaque de fibrociment, verrière, tôle rouillée)', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La chute d''objets sur les personnes situées en dessous', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La présence de lignes électriques aériennes', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le vent, la pluie ou le gel rendant la surface glissante', true, 3);
end
$seed$;

-- [48/80] Travail en hauteur — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'travail-hauteur';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un intervenant doit accéder à une vanne située à 4 mètres, deux fois par jour, tous les jours. On vous propose d''acheter des harnais. Que proposez-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Un intervenant doit accéder à une vanne située à 4 mètres, deux fois par jour, tous les jours. On vous propose d''acheter des harnais. Que proposez-vous ?',
            'C''est le cas d''école du réflexe « on achète des EPI » appliqué à un besoin permanent. La question à poser en séance est celle de la fréquence : un accès occasionnel et exceptionnel peut relever d''un système d''arrêt de chute, un accès quotidien relève d''un aménagement définitif. Le tirant d''air insuffisant à 4 mètres est l''argument technique qui clôt souvent la discussion.', 'Attendu : refuser l''entrée par l''EPI et remonter d''un cran dans la hiérarchie. (1) Interroger d''abord le besoin : la vanne peut-elle être déportée, motorisée, commandée à distance, ou l''installation modifiée pour supprimer l''accès en hauteur ? C''est la seule solution qui supprime le risque. (2) Si l''accès reste nécessaire, et parce qu''il est répétitif et quotidien, il faut un accès permanent et sûr : passerelle ou plateforme fixe avec garde-corps, escalier ou échelle à crinoline selon la configuration. (3) Le harnais serait une réponse inadaptée à un besoin permanent : il suppose un ancrage, un tirant d''air suffisant — douteux à 4 mètres — une formation, des vérifications annuelles, un second intervenant et un plan de sauvetage, deux fois par jour. (4) Le coût d''une plateforme est à comparer au coût complet de la solution harnais sur plusieurs années, et non à son seul prix d''achat.', 'Art. L4121-2 et R4323-58 du Code du travail ; INRS ED 130', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'C''est le cas d''école du réflexe « on achète des EPI » appliqué à un besoin permanent. La question à poser en séance est celle de la fréquence : un accès occasionnel et exceptionnel peut relever d''un système d''arrêt de chute, un accès quotidien relève d''un aménagement définitif. Le tirant d''air insuffisant à 4 mètres est l''argument technique qui clôt souvent la discussion.',
      expected_answer = 'Attendu : refuser l''entrée par l''EPI et remonter d''un cran dans la hiérarchie. (1) Interroger d''abord le besoin : la vanne peut-elle être déportée, motorisée, commandée à distance, ou l''installation modifiée pour supprimer l''accès en hauteur ? C''est la seule solution qui supprime le risque. (2) Si l''accès reste nécessaire, et parce qu''il est répétitif et quotidien, il faut un accès permanent et sûr : passerelle ou plateforme fixe avec garde-corps, escalier ou échelle à crinoline selon la configuration. (3) Le harnais serait une réponse inadaptée à un besoin permanent : il suppose un ancrage, un tirant d''air suffisant — douteux à 4 mètres — une formation, des vérifications annuelles, un second intervenant et un plan de sauvetage, deux fois par jour. (4) Le coût d''une plateforme est à comparer au coût complet de la solution harnais sur plusieurs années, et non à son seul prix d''achat.',
      source_ref = 'Art. L4121-2 et R4323-58 du Code du travail ; INRS ED 130',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [49/80] Circulation & engins — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'Le CACES suffit-il pour conduire un chariot élévateur en entreprise ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Le CACES suffit-il pour conduire un chariot élévateur en entreprise ?',
            'Le CACES est une recommandation de la Caisse nationale d''assurance maladie : c''est un excellent moyen de prouver le contrôle des connaissances, mais ce n''est pas l''obligation. Ce que la réglementation exige, c''est une autorisation de conduite écrite, délivrée par l''employeur, qui repose sur trois conditions cumulatives : l''aptitude médicale, le contrôle des connaissances et savoir-faire, et la connaissance des lieux et des instructions propres au site.', null, 'Art. R4323-55 à R4323-57 du Code du travail ; recommandation CNAM R489', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le CACES est une recommandation de la Caisse nationale d''assurance maladie : c''est un excellent moyen de prouver le contrôle des connaissances, mais ce n''est pas l''obligation. Ce que la réglementation exige, c''est une autorisation de conduite écrite, délivrée par l''employeur, qui repose sur trois conditions cumulatives : l''aptitude médicale, le contrôle des connaissances et savoir-faire, et la connaissance des lieux et des instructions propres au site.',
      expected_answer = null,
      source_ref = 'Art. R4323-55 à R4323-57 du Code du travail ; recommandation CNAM R489',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Non : l''obligation légale est l''autorisation de conduite délivrée par l''employeur', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui, le CACES est le document réglementaire de référence', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui, à condition qu''il ait moins de 5 ans', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Non, il faut un permis délivré par la préfecture', false, 3);
end
$seed$;

-- [50/80] Circulation & engins — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un collègue vous demande de le soulever sur les fourches de votre chariot pour atteindre une étagère. Que faites-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Un collègue vous demande de le soulever sur les fourches de votre chariot pour atteindre une étagère. Que faites-vous ?',
            'L''élévation de personnes n''est autorisée qu''avec un équipement conçu pour cela : nacelle ou plateforme de travail spécifiquement adaptée au chariot, fixée, avec garde-corps, et selon des conditions strictes. Sur les fourches ou sur une palette, rien ne retient la personne, et l''engin n''est ni conçu ni vérifié pour cet usage. C''est un scénario d''accident mortel régulièrement constaté, souvent lors d''une opération « juste une minute ».', null, 'Art. R4323-32 et R4323-36 du Code du travail', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''élévation de personnes n''est autorisée qu''avec un équipement conçu pour cela : nacelle ou plateforme de travail spécifiquement adaptée au chariot, fixée, avec garde-corps, et selon des conditions strictes. Sur les fourches ou sur une palette, rien ne retient la personne, et l''engin n''est ni conçu ni vérifié pour cet usage. C''est un scénario d''accident mortel régulièrement constaté, souvent lors d''une opération « juste une minute ».',
      expected_answer = null,
      source_ref = 'Art. R4323-32 et R4323-36 du Code du travail',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous refusez : c''est interdit et c''est une cause classique d''accident mortel', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous acceptez s''il se tient bien à la charge', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous acceptez si vous montez lentement et à faible hauteur', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous acceptez à condition qu''il porte un casque', false, 3);
end
$seed$;

-- [51/80] Circulation & engins — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelle est la mesure la plus efficace pour prévenir les collisions entre piétons et engins ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quelle est la mesure la plus efficace pour prévenir les collisions entre piétons et engins ?',
            'Les trois dernières mesures sont utiles mais reposent sur la vigilance et n''empêchent pas la rencontre. La séparation physique — allées piétonnes matérialisées et protégées, portes distinctes, quais isolés, sens unique de circulation — supprime la possibilité même de la collision. C''est l''application directe du principe qui consiste à combattre le risque à la source plutôt qu''à demander aux personnes de faire attention.', null, 'Art. R4323-51 et R4224-3 du Code du travail ; INRS ED 975', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Les trois dernières mesures sont utiles mais reposent sur la vigilance et n''empêchent pas la rencontre. La séparation physique — allées piétonnes matérialisées et protégées, portes distinctes, quais isolés, sens unique de circulation — supprime la possibilité même de la collision. C''est l''application directe du principe qui consiste à combattre le risque à la source plutôt qu''à demander aux personnes de faire attention.',
      expected_answer = null,
      source_ref = 'Art. R4323-51 et R4224-3 du Code du travail ; INRS ED 975',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Séparer physiquement les flux piétons et les flux d''engins', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Imposer le port du gilet haute visibilité à tous les piétons', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Limiter la vitesse des engins à 10 km/h', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Installer des avertisseurs de recul sur tous les engins', false, 3);
end
$seed$;

-- [52/80] Circulation & engins — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'À quelle fréquence un chariot élévateur doit-il faire l''objet d''une vérification générale périodique ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'À quelle fréquence un chariot élévateur doit-il faire l''objet d''une vérification générale périodique ?',
            'Les appareils de levage servant au déplacement de charges, dont les chariots élévateurs, sont vérifiés tous les six mois. La périodicité passe à douze mois pour certains appareils sans élévation de personnes ni de charges dans des conditions précises, mais le réflexe à retenir pour un chariot est semestriel. Cela n''exclut pas le contrôle quotidien par le conducteur avant la prise de poste — niveaux, pneumatiques, fuites, avertisseur, freins, état des fourches.', null, 'Arrêté du 1er mars 2004 relatif aux vérifications des appareils de levage', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Les appareils de levage servant au déplacement de charges, dont les chariots élévateurs, sont vérifiés tous les six mois. La périodicité passe à douze mois pour certains appareils sans élévation de personnes ni de charges dans des conditions précises, mais le réflexe à retenir pour un chariot est semestriel. Cela n''exclut pas le contrôle quotidien par le conducteur avant la prise de poste — niveaux, pneumatiques, fuites, avertisseur, freins, état des fourches.',
      expected_answer = null,
      source_ref = 'Arrêté du 1er mars 2004 relatif aux vérifications des appareils de levage',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les 6 mois', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les 12 mois', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les 3 mois', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Tous les 2 ans', false, 3);
end
$seed$;

-- [53/80] Circulation & engins — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'Vous devez traverser une zone où manœuvre une pelle mécanique. Quelle est la bonne conduite ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Vous devez traverser une zone où manœuvre une pelle mécanique. Quelle est la bonne conduite ?',
            'Le conducteur d''un engin a des angles morts importants, il est concentré sur sa tâche et il n''entend rien dans une cabine fermée : un signal sonore ne garantit pas qu''il vous a vu. La règle est de rester hors de la zone d''évolution, d''établir un contact visuel et d''obtenir un signe explicite du conducteur avant d''approcher. Passer derrière un engin ou sous une charge suspendue est à exclure absolument.', null, 'INRS — Circulation d''engins sur les chantiers (ED 6083)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le conducteur d''un engin a des angles morts importants, il est concentré sur sa tâche et il n''entend rien dans une cabine fermée : un signal sonore ne garantit pas qu''il vous a vu. La règle est de rester hors de la zone d''évolution, d''établir un contact visuel et d''obtenir un signe explicite du conducteur avant d''approcher. Passer derrière un engin ou sous une charge suspendue est à exclure absolument.',
      expected_answer = null,
      source_ref = 'INRS — Circulation d''engins sur les chantiers (ED 6083)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Rester hors de la zone d''évolution et n''approcher qu''après un contact visuel confirmé avec le conducteur', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Passer rapidement derrière l''engin pendant qu''il travaille devant', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Klaxonner ou crier pour signaler votre présence, puis passer', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Passer sous la flèche, c''est le chemin le plus court', false, 3);
end
$seed$;

-- [54/80] Circulation & engins — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que se passe-t-il si l''on soulève une charge conforme au poids maximal du chariot, mais au-delà du centre de gravité prévu ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que se passe-t-il si l''on soulève une charge conforme au poids maximal du chariot, mais au-delà du centre de gravité prévu ?',
            'La capacité d''un chariot est toujours donnée pour une distance déterminée entre le talon des fourches et le centre de gravité de la charge — couramment 500 mm. Une charge plus profonde ou déportée éloigne son centre de gravité, augmente le moment de renversement et fait chuter la capacité réelle, parfois de moitié. La hauteur d''élévation et l''inclinaison du mât jouent dans le même sens. C''est pour cela que la plaque de charge doit être lisible dans la cabine et effectivement consultée.', null, 'Recommandation CNAM R489 ; INRS ED 6301', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La capacité d''un chariot est toujours donnée pour une distance déterminée entre le talon des fourches et le centre de gravité de la charge — couramment 500 mm. Une charge plus profonde ou déportée éloigne son centre de gravité, augmente le moment de renversement et fait chuter la capacité réelle, parfois de moitié. La hauteur d''élévation et l''inclinaison du mât jouent dans le même sens. C''est pour cela que la plaque de charge doit être lisible dans la cabine et effectivement consultée.',
      expected_answer = null,
      source_ref = 'Recommandation CNAM R489 ; INRS ED 6301',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La capacité réelle diminue et le chariot peut basculer vers l''avant', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Rien, seul le poids total compte', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le chariot cale mais ne risque pas de basculer', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le limiteur de charge empêche systématiquement le levage', false, 3);
end
$seed$;

-- [55/80] Circulation & engins — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quels éléments doit comporter un plan de circulation sur un site ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Quels éléments doit comporter un plan de circulation sur un site ? (plusieurs réponses)',
            'Les quatre sont attendus. Le point le plus rentable en pratique est la limitation des marches arrière : la manœuvre en recul concentre une part importante des accidents avec engins, car c''est là que les angles morts sont les plus larges. Organiser la circulation en boucle, avec des aires de retournement, supprime le besoin de reculer bien plus efficacement qu''un avertisseur sonore ou une caméra.', null, 'Art. R4323-51 du Code du travail ; INRS ED 975', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Les quatre sont attendus. Le point le plus rentable en pratique est la limitation des marches arrière : la manœuvre en recul concentre une part importante des accidents avec engins, car c''est là que les angles morts sont les plus larges. Organiser la circulation en boucle, avec des aires de retournement, supprime le besoin de reculer bien plus efficacement qu''un avertisseur sonore ou une caméra.',
      expected_answer = null,
      source_ref = 'Art. R4323-51 du Code du travail ; INRS ED 975',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Des allées piétonnes matérialisées et distinctes des voies d''engins', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un sens de circulation défini, limitant les marches arrière', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Des zones de manœuvre et de stationnement identifiées', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une vitesse maximale affichée', true, 3);
end
$seed$;

-- [56/80] Circulation & engins — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'circulation-engins';

  select id into v_question_id from questions
  where org_id is null and statement = 'Une entreprise extérieure vient livrer et décharger sur votre site avec son propre chariot. De qui relève la sécurité de cette opération ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Une entreprise extérieure vient livrer et décharger sur votre site avec son propre chariot. De qui relève la sécurité de cette opération ?',
            'Le protocole de sécurité chargement/déchargement est un document peu connu alors qu''il est obligatoire et qu''il couvre une opération extrêmement fréquente. Il permet de faire comprendre que « c''est le livreur, ce n''est pas nous » n''est pas une réponse recevable : accueillir une entreprise extérieure crée une obligation de coordination.', 'Attendu : la responsabilité est partagée et doit être organisée à l''avance, pas arbitrée après l''accident. (1) L''entreprise utilisatrice, qui accueille, doit communiquer les consignes du site, le plan de circulation, les zones interdites, les risques propres au lieu ; (2) l''entreprise extérieure reste responsable de son personnel, de son matériel, de l''autorisation de conduite de son cariste et des vérifications de son engin ; (3) la co-activité impose une coordination formalisée : un protocole de sécurité pour les opérations de chargement et déchargement, qui est le document dédié à ce cas précis et doit être établi avant l''opération ; (4) pour des interventions plus larges, c''est une inspection commune préalable et un plan de prévention, obligatoire notamment au-delà de 400 heures par an ou en cas de travaux dangereux ; (5) le point pratique le plus souvent oublié : désigner qui commande la manœuvre et interdire la présence du chauffeur dans la zone d''évolution pendant le déchargement.', 'Art. R4515-1 et suivants (protocole de sécurité) et R4511-1 et suivants (plan de prévention) du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'Le protocole de sécurité chargement/déchargement est un document peu connu alors qu''il est obligatoire et qu''il couvre une opération extrêmement fréquente. Il permet de faire comprendre que « c''est le livreur, ce n''est pas nous » n''est pas une réponse recevable : accueillir une entreprise extérieure crée une obligation de coordination.',
      expected_answer = 'Attendu : la responsabilité est partagée et doit être organisée à l''avance, pas arbitrée après l''accident. (1) L''entreprise utilisatrice, qui accueille, doit communiquer les consignes du site, le plan de circulation, les zones interdites, les risques propres au lieu ; (2) l''entreprise extérieure reste responsable de son personnel, de son matériel, de l''autorisation de conduite de son cariste et des vérifications de son engin ; (3) la co-activité impose une coordination formalisée : un protocole de sécurité pour les opérations de chargement et déchargement, qui est le document dédié à ce cas précis et doit être établi avant l''opération ; (4) pour des interventions plus larges, c''est une inspection commune préalable et un plan de prévention, obligatoire notamment au-delà de 400 heures par an ou en cas de travaux dangereux ; (5) le point pratique le plus souvent oublié : désigner qui commande la manœuvre et interdire la présence du chauffeur dans la zone d''évolution pendant le déchargement.',
      source_ref = 'Art. R4515-1 et suivants (protocole de sécurité) et R4511-1 et suivants (plan de prévention) du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [57/80] Machines & consignation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Un protecteur gêne votre travail sur une machine. Que faites-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Un protecteur gêne votre travail sur une machine. Que faites-vous ?',
            'Neutraliser un protecteur est interdit et engage la responsabilité du salarié comme celle de l''employeur qui le tolère. Mais l''essentiel est ailleurs : un protecteur régulièrement contourné est presque toujours un protecteur mal conçu pour l''activité réelle. Le signalement doit donc déclencher une reconception — protecteur mobile asservi, ouverture adaptée, alimentation repensée — et non une consigne de vigilance.', null, 'Art. L4122-1 et R4323-2 du Code du travail', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Neutraliser un protecteur est interdit et engage la responsabilité du salarié comme celle de l''employeur qui le tolère. Mais l''essentiel est ailleurs : un protecteur régulièrement contourné est presque toujours un protecteur mal conçu pour l''activité réelle. Le signalement doit donc déclencher une reconception — protecteur mobile asservi, ouverture adaptée, alimentation repensée — et non une consigne de vigilance.',
      expected_answer = null,
      source_ref = 'Art. L4122-1 et R4323-2 du Code du travail',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous arrêtez la machine, signalez le problème et attendez une solution', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous le retirez le temps de l''opération et le remettez après', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous le neutralisez avec un aimant ou un adhésif', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous continuez en redoublant de vigilance', false, 3);
end
$seed$;

-- [58/80] Machines & consignation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Avant toute intervention de maintenance sur une machine, quelle est la mesure fondamentale ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Avant toute intervention de maintenance sur une machine, quelle est la mesure fondamentale ?',
            'L''arrêt d''urgence et le mode maintenance ne sont pas des consignations : ils ne garantissent pas contre un redémarrage, une remise en énergie par un tiers, ni contre les énergies résiduelles — inertie d''un volant, pression d''un accumulateur hydraulique, air comprimé, condensateurs chargés, charge suspendue, pièces chaudes. La consignation ajoute la condamnation physique par cadenas individuel et la vérification effective de l''absence d''énergie.', null, 'Art. R4323-13 et R4323-14 du Code du travail ; INRS ED 6109', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''arrêt d''urgence et le mode maintenance ne sont pas des consignations : ils ne garantissent pas contre un redémarrage, une remise en énergie par un tiers, ni contre les énergies résiduelles — inertie d''un volant, pression d''un accumulateur hydraulique, air comprimé, condensateurs chargés, charge suspendue, pièces chaudes. La consignation ajoute la condamnation physique par cadenas individuel et la vérification effective de l''absence d''énergie.',
      expected_answer = null,
      source_ref = 'Art. R4323-13 et R4323-14 du Code du travail ; INRS ED 6109',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Consigner la machine : couper, condamner, identifier, vérifier, dissiper les énergies résiduelles', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Appuyer sur l''arrêt d''urgence', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Mettre la machine en mode « maintenance » sur le pupitre', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Prévenir verbalement les collègues de l''atelier', false, 3);
end
$seed$;

-- [59/80] Machines & consignation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quel est le rôle exact d''un arrêt d''urgence ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quel est le rôle exact d''un arrêt d''urgence ?',
            'L''arrêt d''urgence est une fonction de secours : il stoppe le mouvement dangereux et interdit le redémarrage automatique, la remise en service exigeant une action volontaire de réarmement. Il ne remplace ni les protecteurs, ni la consignation. À vérifier en séance : son accessibilité — souvent encombrée — et le fait que les opérateurs sachent où il se trouve sans avoir à le chercher.', null, 'Art. R4324-4 du Code du travail ; norme NF EN ISO 13850', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''arrêt d''urgence est une fonction de secours : il stoppe le mouvement dangereux et interdit le redémarrage automatique, la remise en service exigeant une action volontaire de réarmement. Il ne remplace ni les protecteurs, ni la consignation. À vérifier en séance : son accessibilité — souvent encombrée — et le fait que les opérateurs sachent où il se trouve sans avoir à le chercher.',
      expected_answer = null,
      source_ref = 'Art. R4324-4 du Code du travail ; norme NF EN ISO 13850',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Arrêter le mouvement dangereux le plus rapidement possible, sans créer de risque nouveau', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Consigner la machine pour permettre une intervention', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Couper l''alimentation générale de l''atelier', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Signaler une anomalie au service maintenance', false, 3);
end
$seed$;

-- [60/80] Machines & consignation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que doit obligatoirement accompagner une machine neuve mise sur le marché en France ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que doit obligatoirement accompagner une machine neuve mise sur le marché en France ?',
            'Le marquage CE, la déclaration de conformité et la notice d''instructions rédigée en français forment un ensemble indissociable. La notice est un document de prévention à part entière : elle définit les usages prévus, les usages à exclure, les modes de réglage et de maintenance, les protecteurs à utiliser et les vérifications. Une machine d''occasion ou modifiée pose la question de qui assume la conformité — celui qui la remet sur le marché ou celui qui la transforme.', null, 'Art. R4313-1 et suivants du Code du travail ; directive Machines 2006/42/CE', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le marquage CE, la déclaration de conformité et la notice d''instructions rédigée en français forment un ensemble indissociable. La notice est un document de prévention à part entière : elle définit les usages prévus, les usages à exclure, les modes de réglage et de maintenance, les protecteurs à utiliser et les vérifications. Une machine d''occasion ou modifiée pose la question de qui assume la conformité — celui qui la remet sur le marché ou celui qui la transforme.',
      expected_answer = null,
      source_ref = 'Art. R4313-1 et suivants du Code du travail ; directive Machines 2006/42/CE',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le marquage CE, une déclaration de conformité et une notice d''instructions en français', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement le marquage CE', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un certificat délivré par l''inspection du travail', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une attestation d''assurance du fabricant', false, 3);
end
$seed$;

-- [61/80] Machines & consignation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Qu''est-ce qu''un protecteur « asservi » ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Qu''est-ce qu''un protecteur « asservi » ?',
            'Le protecteur mobile asservi est relié au système de commande : l''ouvrir arrête le mouvement, et le mouvement ne peut reprendre qu''après refermeture. Avec dispositif d''interverrouillage, il reste même bloqué fermé tant que le mouvement n''est pas complètement arrêté — indispensable lorsqu''il y a de l''inertie. C''est la solution à privilégier pour les accès fréquents, là où un protecteur fixé par vis serait démonté une fois pour ne jamais être remonté.', null, 'Art. R4324-1 à R4324-3 du Code du travail ; norme NF EN ISO 14119', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le protecteur mobile asservi est relié au système de commande : l''ouvrir arrête le mouvement, et le mouvement ne peut reprendre qu''après refermeture. Avec dispositif d''interverrouillage, il reste même bloqué fermé tant que le mouvement n''est pas complètement arrêté — indispensable lorsqu''il y a de l''inertie. C''est la solution à privilégier pour les accès fréquents, là où un protecteur fixé par vis serait démonté une fois pour ne jamais être remonté.',
      expected_answer = null,
      source_ref = 'Art. R4324-1 à R4324-3 du Code du travail ; norme NF EN ISO 14119',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un protecteur dont l''ouverture provoque l''arrêt du mouvement dangereux', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un protecteur fixé par des vis nécessitant un outil pour être retiré', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un protecteur transparent permettant de voir l''usinage', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un protecteur réglable manuellement selon la pièce usinée', false, 3);
end
$seed$;

-- [62/80] Machines & consignation — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Qui peut réaliser la vérification périodique d''un équipement de travail ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Qui peut réaliser la vérification périodique d''un équipement de travail ?',
            'La vérification peut être interne à condition que la personne dispose de la compétence, de l''expérience, de l''indépendance de jugement et des moyens de mesure nécessaires. Le point qui compte autant que la vérification elle-même est la traçabilité : les résultats sont consignés dans un registre de sécurité tenu à disposition, et surtout les observations doivent être suivies d''effet. Un registre à jour dont les réserves ne sont jamais levées ne protège personne.', null, 'Art. R4323-24 et R4323-25 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'La vérification peut être interne à condition que la personne dispose de la compétence, de l''expérience, de l''indépendance de jugement et des moyens de mesure nécessaires. Le point qui compte autant que la vérification elle-même est la traçabilité : les résultats sont consignés dans un registre de sécurité tenu à disposition, et surtout les observations doivent être suivies d''effet. Un registre à jour dont les réserves ne sont jamais levées ne protège personne.',
      expected_answer = null,
      source_ref = 'Art. R4323-24 et R4323-25 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Une personne qualifiée, appartenant ou non à l''entreprise, avec la compétence et les moyens nécessaires', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Obligatoirement un organisme accrédité extérieur', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'N''importe quel salarié utilisant régulièrement la machine', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement le fabricant de la machine', false, 3);
end
$seed$;

-- [63/80] Machines & consignation — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quelles précautions prendre avant de travailler sur une machine tournante ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Quelles précautions prendre avant de travailler sur une machine tournante ? (plusieurs réponses)',
            'Tout ce qui peut être happé doit disparaître : bijoux, cheveux, vêtements amples, cordons, badge à enrouleur. Les gants font partie de cette liste près d''une pièce en rotation : happés, ils entraînent la main. C''est un des rares cas où un EPI est contre-indiqué, et cela mérite d''être dit explicitement en séance car le réflexe « gants = sécurité » est très ancré.', null, 'INRS — Prévention des risques liés aux machines (ED 807)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Tout ce qui peut être happé doit disparaître : bijoux, cheveux, vêtements amples, cordons, badge à enrouleur. Les gants font partie de cette liste près d''une pièce en rotation : happés, ils entraînent la main. C''est un des rares cas où un EPI est contre-indiqué, et cela mérite d''être dit explicitement en séance car le réflexe « gants = sécurité » est très ancré.',
      expected_answer = null,
      source_ref = 'INRS — Prévention des risques liés aux machines (ED 807)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Retirer bagues, montre, bracelets et chaînes', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Attacher les cheveux longs', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Éviter les vêtements flottants et les manches ouvertes', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Porter des gants pour mieux tenir la pièce', false, 3);
end
$seed$;

-- [64/80] Machines & consignation — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'machines';

  select id into v_question_id from questions
  where org_id is null and statement = 'Sur une ligne de production, les opérateurs ont pris l''habitude de dégager un bourrage sans consigner, parce que l''arrêt complet fait perdre vingt minutes de redémarrage. Comment traitez-vous cette situation ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Sur une ligne de production, les opérateurs ont pris l''habitude de dégager un bourrage sans consigner, parce que l''arrêt complet fait perdre vingt minutes de redémarrage. Comment traitez-vous cette situation ?',
            'C''est le cœur du sujet machines : l''écart entre travail prescrit et travail réel. Un contournement systématique et connu de tous n''est pas un problème de discipline, c''est un signal de conception. La question à poser en séance est simple et souvent révélatrice : « depuis combien de temps tout le monde le sait ? »', 'Attendu : traiter la cause organisationnelle et non seulement le comportement. (1) Reconnaître la logique du contournement : le mode opératoire officiel est incompatible avec l''objectif de production, donc les opérateurs arbitrent en faveur de la production — sanctionner sans changer le système reproduira le contournement en le rendant invisible ; (2) analyser la fréquence et la cause des bourrages : c''est souvent là que se trouve la vraie solution, car supprimer le bourrage supprime l''intervention ; (3) concevoir un accès sûr et rapide : protecteur mobile asservi avec interverrouillage, trappe de dégagement, outil de débourrage déporté, mode « dégagement » à vitesse réduite et validation par action maintenue ; (4) revoir le temps de redémarrage, qui est le véritable levier de la déviation ; (5) formaliser un mode opératoire réellement praticable, avec consignation par cadenas individuel pour les interventions qui le nécessitent ; (6) tracer dans le DUERP, informer l''encadrement de proximité, et vérifier ensuite sur le terrain que la nouvelle solution est effectivement utilisée.', 'Art. R4323-13 et R4323-17 du Code du travail ; INRS ED 6109 Consignation', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'C''est le cœur du sujet machines : l''écart entre travail prescrit et travail réel. Un contournement systématique et connu de tous n''est pas un problème de discipline, c''est un signal de conception. La question à poser en séance est simple et souvent révélatrice : « depuis combien de temps tout le monde le sait ? »',
      expected_answer = 'Attendu : traiter la cause organisationnelle et non seulement le comportement. (1) Reconnaître la logique du contournement : le mode opératoire officiel est incompatible avec l''objectif de production, donc les opérateurs arbitrent en faveur de la production — sanctionner sans changer le système reproduira le contournement en le rendant invisible ; (2) analyser la fréquence et la cause des bourrages : c''est souvent là que se trouve la vraie solution, car supprimer le bourrage supprime l''intervention ; (3) concevoir un accès sûr et rapide : protecteur mobile asservi avec interverrouillage, trappe de dégagement, outil de débourrage déporté, mode « dégagement » à vitesse réduite et validation par action maintenue ; (4) revoir le temps de redémarrage, qui est le véritable levier de la déviation ; (5) formaliser un mode opératoire réellement praticable, avec consignation par cadenas individuel pour les interventions qui le nécessitent ; (6) tracer dans le DUERP, informer l''encadrement de proximité, et vérifier ensuite sur le terrain que la nouvelle solution est effectivement utilisée.',
      source_ref = 'Art. R4323-13 et R4323-17 du Code du travail ; INRS ED 6109 Consignation',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [65/80] Premiers secours — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quel est l''ordre des trois actions de base du secourisme du travail ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quel est l''ordre des trois actions de base du secourisme du travail ?',
            'On protège d''abord : supprimer le danger ou soustraire la victime, faute de quoi le sauveteur devient la deuxième victime — c''est un scénario réel et fréquent en électrique, en atmosphère confinée et sur la route. On alerte ensuite, ou on fait alerter, pour déclencher les secours au plus tôt. On secourt enfin, dans la limite de sa formation. Un cas fait exception à l''ordre : devant un arrêt cardiaque, l''alerte et la demande de défibrillateur ne se retardent pas.', null, 'INRS — Sauvetage secourisme du travail, dispositif SST', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'On protège d''abord : supprimer le danger ou soustraire la victime, faute de quoi le sauveteur devient la deuxième victime — c''est un scénario réel et fréquent en électrique, en atmosphère confinée et sur la route. On alerte ensuite, ou on fait alerter, pour déclencher les secours au plus tôt. On secourt enfin, dans la limite de sa formation. Un cas fait exception à l''ordre : devant un arrêt cardiaque, l''alerte et la demande de défibrillateur ne se retardent pas.',
      expected_answer = null,
      source_ref = 'INRS — Sauvetage secourisme du travail, dispositif SST',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Protéger, Alerter, Secourir', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Alerter, Protéger, Secourir', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Secourir, Alerter, Protéger', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Protéger, Secourir, Alerter', false, 3);
end
$seed$;

-- [66/80] Premiers secours — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quel numéro appelez-vous pour une urgence médicale en France ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quel numéro appelez-vous pour une urgence médicale en France ?',
            'Le 15 correspond au SAMU pour une urgence médicale, le 18 aux sapeurs-pompiers pour un incendie ou un accident, le 17 à la police et le 112 est le numéro d''urgence européen accessible partout dans l''Union. Le 114 permet d''alerter par SMS ou visio pour les personnes sourdes ou malentendantes. En pratique, tous ces numéros se réorientent entre eux : mieux vaut appeler que d''hésiter, et rester joignable après l''appel.', null, 'Service-public.fr — Numéros d''urgence', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le 15 correspond au SAMU pour une urgence médicale, le 18 aux sapeurs-pompiers pour un incendie ou un accident, le 17 à la police et le 112 est le numéro d''urgence européen accessible partout dans l''Union. Le 114 permet d''alerter par SMS ou visio pour les personnes sourdes ou malentendantes. En pratique, tous ces numéros se réorientent entre eux : mieux vaut appeler que d''hésiter, et rester joignable après l''appel.',
      expected_answer = null,
      source_ref = 'Service-public.fr — Numéros d''urgence',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le 15, ou le 112 depuis un mobile', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le 17', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le 18 uniquement', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le 115', false, 3);
end
$seed$;

-- [67/80] Premiers secours — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que faites-vous devant une brûlure thermique récente sur l''avant-bras ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que faites-vous devant une brûlure thermique récente sur l''avant-bras ?',
            'Le refroidissement précoce et prolongé limite l''extension de la brûlure en profondeur. Le repère classique est la règle des trois « 15 » : eau à environ 15 °C, à 15 cm de la peau, pendant 15 minutes. La glace est à exclure — elle aggrave la lésion et le risque d''hypothermie sur les grandes surfaces. On ne perce pas les cloques, on n''applique ni corps gras ni pommade avant avis médical, et on retire bagues et bracelets avant l''œdème.', null, 'INRS — Conduite à tenir en cas de brûlure ; référentiel national SST', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le refroidissement précoce et prolongé limite l''extension de la brûlure en profondeur. Le repère classique est la règle des trois « 15 » : eau à environ 15 °C, à 15 cm de la peau, pendant 15 minutes. La glace est à exclure — elle aggrave la lésion et le risque d''hypothermie sur les grandes surfaces. On ne perce pas les cloques, on n''applique ni corps gras ni pommade avant avis médical, et on retire bagues et bracelets avant l''œdème.',
      expected_answer = null,
      source_ref = 'INRS — Conduite à tenir en cas de brûlure ; référentiel national SST',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous refroidissez à l''eau tempérée qui ruisselle, pendant au moins 15 minutes', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous appliquez de la glace directement sur la brûlure', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous appliquez une pommade puis un pansement serré', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous percez les cloques pour éviter l''infection', false, 3);
end
$seed$;

-- [68/80] Premiers secours — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Une victime est inconsciente et ne respire pas. Que faites-vous ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Une victime est inconsciente et ne respire pas. Que faites-vous ?',
            'Inconscience plus absence de respiration signent l''arrêt cardiaque : chaque minute sans réanimation fait chuter les chances de survie d''environ 10 %. On alerte, on demande le défibrillateur automatisé externe et on comprime sans attendre — au centre du thorax, 5 à 6 cm de profondeur, à une fréquence de 100 à 120 par minute. La position latérale de sécurité est réservée à la victime inconsciente qui respire.', null, 'Référentiel national de compétences de sécurité civile — PSC1 ; INRS SST', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Inconscience plus absence de respiration signent l''arrêt cardiaque : chaque minute sans réanimation fait chuter les chances de survie d''environ 10 %. On alerte, on demande le défibrillateur automatisé externe et on comprime sans attendre — au centre du thorax, 5 à 6 cm de profondeur, à une fréquence de 100 à 120 par minute. La position latérale de sécurité est réservée à la victime inconsciente qui respire.',
      expected_answer = null,
      source_ref = 'Référentiel national de compétences de sécurité civile — PSC1 ; INRS SST',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous faites alerter, demandez un défibrillateur et commencez les compressions thoraciques', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous la mettez en position latérale de sécurité et attendez les secours', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous lui donnez à boire pour la faire réagir', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Vous attendez l''arrivée du SST de l''atelier avant d''agir', false, 3);
end
$seed$;

-- [69/80] Premiers secours — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Qui peut utiliser un défibrillateur automatisé externe (DAE) ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Qui peut utiliser un défibrillateur automatisé externe (DAE) ?',
            'Depuis 2007, toute personne peut utiliser un DAE. L''appareil analyse le rythme cardiaque et ne délivre un choc que s''il est indiqué : il est conçu pour ne pas pouvoir nuire. Le vrai risque n''est pas de mal s''en servir, c''est de ne pas s''en servir par peur de mal faire. Deux repères pratiques : on suit les instructions vocales, et on ne touche pas la victime pendant l''analyse et le choc.', null, 'Décret n°2007-705 du 4 mai 2007 relatif à l''utilisation des défibrillateurs', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Depuis 2007, toute personne peut utiliser un DAE. L''appareil analyse le rythme cardiaque et ne délivre un choc que s''il est indiqué : il est conçu pour ne pas pouvoir nuire. Le vrai risque n''est pas de mal s''en servir, c''est de ne pas s''en servir par peur de mal faire. Deux repères pratiques : on suit les instructions vocales, et on ne touche pas la victime pendant l''analyse et le choc.',
      expected_answer = null,
      source_ref = 'Décret n°2007-705 du 4 mai 2007 relatif à l''utilisation des défibrillateurs',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Toute personne, même sans formation', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement un secouriste formé et à jour de son recyclage', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement un professionnel de santé', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement le SST désigné de l''établissement', false, 3);
end
$seed$;

-- [70/80] Premiers secours — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Dans quel cas déplace-t-on une victime d''accident ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Dans quel cas déplace-t-on une victime d''accident ?',
            'On ne déplace pas une victime, en raison notamment du risque d''aggravation d''une lésion du rachis, sauf si elle est exposée à un danger vital immédiat qu''on ne peut pas supprimer autrement : incendie, risque d''explosion, atmosphère toxique, engin en mouvement. Dans ce cas, on effectue un dégagement d''urgence, le plus court possible et dans l''axe. Sinon on protège la zone, on couvre la victime, on la rassure et on attend les secours.', null, 'Référentiel national de compétences de sécurité civile — dégagements d''urgence', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'On ne déplace pas une victime, en raison notamment du risque d''aggravation d''une lésion du rachis, sauf si elle est exposée à un danger vital immédiat qu''on ne peut pas supprimer autrement : incendie, risque d''explosion, atmosphère toxique, engin en mouvement. Dans ce cas, on effectue un dégagement d''urgence, le plus court possible et dans l''axe. Sinon on protège la zone, on couvre la victime, on la rassure et on attend les secours.',
      expected_answer = null,
      source_ref = 'Référentiel national de compétences de sécurité civile — dégagements d''urgence',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement si elle est exposée à un danger immédiat qu''on ne peut pas supprimer', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Systématiquement, pour l''installer plus confortablement', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Dès qu''elle demande à être déplacée', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Jamais, en aucune circonstance', false, 3);
end
$seed$;

-- [71/80] Premiers secours — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que devez-vous transmettre lors d''un appel aux secours ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Que devez-vous transmettre lors d''un appel aux secours ? (plusieurs réponses)',
            'Les quatre sont attendus, et deux points font souvent la différence sur le temps d''arrivée. D''abord l''accès réel : code de portail, numéro de bâtiment, quai, étage, personne qui attendra les secours à l''entrée — un site industriel est un labyrinthe pour une équipe extérieure. Ensuite, on ne raccroche pas le premier : le médecin régulateur guide les gestes, et il peut rappeler.', null, 'INRS — Sauvetage secourisme du travail (dispositif SST)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Les quatre sont attendus, et deux points font souvent la différence sur le temps d''arrivée. D''abord l''accès réel : code de portail, numéro de bâtiment, quai, étage, personne qui attendra les secours à l''entrée — un site industriel est un labyrinthe pour une équipe extérieure. Ensuite, on ne raccroche pas le premier : le médecin régulateur guide les gestes, et il peut rappeler.',
      expected_answer = null,
      source_ref = 'INRS — Sauvetage secourisme du travail (dispositif SST)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le lieu précis de l''accident et les moyens d''y accéder', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'La nature de l''accident et le nombre de victimes', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''état apparent des victimes et les gestes déjà effectués', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Un numéro de téléphone où vous restez joignable', true, 3);
end
$seed$;

-- [72/80] Premiers secours — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'premiers-secours';

  select id into v_question_id from questions
  where org_id is null and statement = 'Combien de sauveteurs secouristes du travail faut-il dans un atelier, et pourquoi cette obligation existe-t-elle ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Combien de sauveteurs secouristes du travail faut-il dans un atelier, et pourquoi cette obligation existe-t-elle ?',
            'L''objectif de cette question est de faire sortir du « combien faut-il ? » réglementaire pour arriver au « notre organisation tient-elle un mardi à 3 heures du matin ? ». C''est le test qui révèle le plus souvent une faille : SST unique, trousse de secours introuvable ou périmée, ou zone sans couverture réseau pour appeler.', 'Attendu : (1) la règle de base est qu''un membre du personnel doit avoir reçu la formation nécessaire pour donner les premiers secours en cas d''urgence dans chaque atelier où sont effectués des travaux dangereux, et sur les chantiers occupant vingt personnes au moins pendant plus de quinze jours lorsque les travaux exposent à des risques particuliers ; (2) le raisonnement attendu va au-delà du minimum : il faut tenir compte de l''effectif, de l''organisation du travail, des horaires — équipes de nuit, week-ends, astreintes — de l''étendue et de la configuration des locaux, de la présence de travailleurs isolés et du délai réel d''arrivée des secours ; (3) un seul SST par site est une couverture illusoire dès qu''il y a des absences, des congés ou plusieurs équipes ; (4) l''organisation des secours se définit avec le service de prévention et de santé au travail et se matérialise par des consignes affichées, du matériel de premiers secours accessible et adapté, et un moyen d''alerte fonctionnel partout, y compris dans les zones sans réseau ; (5) la formation doit être maintenue à jour par des recyclages.', 'Art. R4224-15 et R4224-16 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'L''objectif de cette question est de faire sortir du « combien faut-il ? » réglementaire pour arriver au « notre organisation tient-elle un mardi à 3 heures du matin ? ». C''est le test qui révèle le plus souvent une faille : SST unique, trousse de secours introuvable ou périmée, ou zone sans couverture réseau pour appeler.',
      expected_answer = 'Attendu : (1) la règle de base est qu''un membre du personnel doit avoir reçu la formation nécessaire pour donner les premiers secours en cas d''urgence dans chaque atelier où sont effectués des travaux dangereux, et sur les chantiers occupant vingt personnes au moins pendant plus de quinze jours lorsque les travaux exposent à des risques particuliers ; (2) le raisonnement attendu va au-delà du minimum : il faut tenir compte de l''effectif, de l''organisation du travail, des horaires — équipes de nuit, week-ends, astreintes — de l''étendue et de la configuration des locaux, de la présence de travailleurs isolés et du délai réel d''arrivée des secours ; (3) un seul SST par site est une couverture illusoire dès qu''il y a des absences, des congés ou plusieurs équipes ; (4) l''organisation des secours se définit avec le service de prévention et de santé au travail et se matérialise par des consignes affichées, du matériel de premiers secours accessible et adapté, et un moyen d''alerte fonctionnel partout, y compris dans les zones sans réseau ; (5) la formation doit être maintenue à jour par des recyclages.',
      source_ref = 'Art. R4224-15 et R4224-16 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

-- [73/80] Organisation de la prévention & RPS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'À partir de quel effectif le document unique d''évaluation des risques professionnels (DUERP) est-il obligatoire ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'À partir de quel effectif le document unique d''évaluation des risques professionnels (DUERP) est-il obligatoire ?',
            'Le DUERP est obligatoire dès l''embauche du premier salarié, sans seuil. L''effectif joue en revanche sur les modalités : dans les entreprises d''au moins onze salariés, la mise à jour est au minimum annuelle, et à partir de cinquante salariés le document doit déboucher sur un programme annuel de prévention avec actions, moyens et calendrier. Le DUERP doit aussi être conservé dans ses versions successives pendant quarante ans, afin de retracer les expositions.', null, 'Art. R4121-1 et R4121-2 du Code du travail ; loi n°2021-1018 du 2 août 2021', 1)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le DUERP est obligatoire dès l''embauche du premier salarié, sans seuil. L''effectif joue en revanche sur les modalités : dans les entreprises d''au moins onze salariés, la mise à jour est au minimum annuelle, et à partir de cinquante salariés le document doit déboucher sur un programme annuel de prévention avec actions, moyens et calendrier. Le DUERP doit aussi être conservé dans ses versions successives pendant quarante ans, afin de retracer les expositions.',
      expected_answer = null,
      source_ref = 'Art. R4121-1 et R4121-2 du Code du travail ; loi n°2021-1018 du 2 août 2021',
      difficulty = 1,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Dès le premier salarié', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'À partir de 11 salariés', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'À partir de 20 salariés', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'À partir de 50 salariés', false, 3);
end
$seed$;

-- [74/80] Organisation de la prévention & RPS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'Quel est le premier des neuf principes généraux de prévention ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Quel est le premier des neuf principes généraux de prévention ?',
            'L''ordre est une hiérarchie d''efficacité, pas une liste. On commence par éviter : supprimer le risque à la conception, renoncer à une opération, substituer un produit, automatiser une manutention. Évaluer ne vient qu''en deuxième position, pour ce qui n''a pas pu être évité. La formation et les EPI arrivent en fin de liste : ce sont les mesures les plus dépendantes du comportement humain, donc les plus fragiles.', null, 'Art. L4121-2 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''ordre est une hiérarchie d''efficacité, pas une liste. On commence par éviter : supprimer le risque à la conception, renoncer à une opération, substituer un produit, automatiser une manutention. Évaluer ne vient qu''en deuxième position, pour ce qui n''a pas pu être évité. La formation et les EPI arrivent en fin de liste : ce sont les mesures les plus dépendantes du comportement humain, donc les plus fragiles.',
      expected_answer = null,
      source_ref = 'Art. L4121-2 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Éviter les risques', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Évaluer les risques qui ne peuvent pas être évités', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Former et informer les travailleurs', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Donner la priorité aux protections collectives', false, 3);
end
$seed$;

-- [75/80] Organisation de la prévention & RPS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'Dans quelles conditions un salarié peut-il exercer son droit de retrait ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Dans quelles conditions un salarié peut-il exercer son droit de retrait ?',
            'Trois conditions : un motif raisonnable, un danger grave, et un danger imminent. Le salarié alerte l''employeur et se retire, sans avoir besoin d''autorisation ; aucune sanction ni retenue de salaire ne peut en découler si le droit est exercé de bonne foi. Deux limites à connaître : le retrait ne doit pas créer un danger pour autrui, et il porte sur la situation dangereuse — il n''autorise pas à quitter l''entreprise.', null, 'Art. L4131-1 à L4131-3 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Trois conditions : un motif raisonnable, un danger grave, et un danger imminent. Le salarié alerte l''employeur et se retire, sans avoir besoin d''autorisation ; aucune sanction ni retenue de salaire ne peut en découler si le droit est exercé de bonne foi. Deux limites à connaître : le retrait ne doit pas créer un danger pour autrui, et il porte sur la situation dangereuse — il n''autorise pas à quitter l''entreprise.',
      expected_answer = null,
      source_ref = 'Art. L4131-1 à L4131-3 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'S''il a un motif raisonnable de penser que la situation présente un danger grave et imminent pour sa vie ou sa santé', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Dès qu''il estime ses conditions de travail dégradées', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement après autorisation écrite de son supérieur', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Uniquement si un membre du CSE le constate avec lui', false, 3);
end
$seed$;

-- [76/80] Organisation de la prévention & RPS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'La sécurité au travail est-elle uniquement la responsabilité de l''employeur ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'La sécurité au travail est-elle uniquement la responsabilité de l''employeur ?',
            'L''employeur porte une obligation générale de sécurité, de nature très exigeante, et c''est lui qui dispose des moyens d''organisation. Mais le salarié a lui aussi une obligation : prendre soin de sa santé et de sa sécurité ainsi que de celles des autres personnes concernées, conformément aux instructions et à sa formation. Cette obligation ne dégage jamais l''employeur de la sienne — les deux se cumulent, elles ne se partagent pas.', null, 'Art. L4121-1 et L4122-1 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'L''employeur porte une obligation générale de sécurité, de nature très exigeante, et c''est lui qui dispose des moyens d''organisation. Mais le salarié a lui aussi une obligation : prendre soin de sa santé et de sa sécurité ainsi que de celles des autres personnes concernées, conformément aux instructions et à sa formation. Cette obligation ne dégage jamais l''employeur de la sienne — les deux se cumulent, elles ne se partagent pas.',
      expected_answer = null,
      source_ref = 'Art. L4121-1 et L4122-1 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Non : le salarié doit aussi prendre soin de sa sécurité et de celle des autres, selon ses moyens et sa formation', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui, le salarié n''a aucune obligation en la matière', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Oui, sauf pour les salariés encadrants', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Non, la responsabilité est strictement partagée à parts égales', false, 3);
end
$seed$;

-- [77/80] Organisation de la prévention & RPS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que désignent les « RPS » ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Que désignent les « RPS » ?',
            'Les RPS désignent les risques pour la santé physique et mentale liés aux conditions d''emploi et d''organisation : intensité et temps de travail, exigences émotionnelles, faible autonomie, rapports sociaux dégradés, conflits de valeurs, insécurité de la situation de travail. Point important : ce sont des risques professionnels comme les autres, qui doivent figurer dans le DUERP, et qui s''analysent à partir de l''organisation du travail plutôt que de la fragilité supposée des personnes.', null, 'INRS — Risques psychosociaux ; rapport Gollac (2011)', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Les RPS désignent les risques pour la santé physique et mentale liés aux conditions d''emploi et d''organisation : intensité et temps de travail, exigences émotionnelles, faible autonomie, rapports sociaux dégradés, conflits de valeurs, insécurité de la situation de travail. Point important : ce sont des risques professionnels comme les autres, qui doivent figurer dans le DUERP, et qui s''analysent à partir de l''organisation du travail plutôt que de la fragilité supposée des personnes.',
      expected_answer = null,
      source_ref = 'INRS — Risques psychosociaux ; rapport Gollac (2011)',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les risques psychosociaux : stress, violences internes ou externes, épuisement', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les référentiels de prévention sectoriels', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les registres de plan de sécurité', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les risques physiques et sonores', false, 3);
end
$seed$;

-- [78/80] Organisation de la prévention & RPS — mcq_single
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'Dans quel délai un salarié doit-il informer son employeur d''un accident du travail ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_single'::question_kind, 'Dans quel délai un salarié doit-il informer son employeur d''un accident du travail ?',
            'Le salarié informe ou fait informer l''employeur dans les 24 heures ; l''employeur déclare ensuite l''accident à la caisse primaire d''assurance maladie dans les 48 heures et remet la feuille d''accident permettant la prise en charge sans avance de frais. À retenir surtout : un accident bénin doit être tracé — registre des accidents bénins ou déclaration — car c''est l''absence de trace initiale qui bloque la reconnaissance lorsqu''une séquelle apparaît des mois plus tard.', null, 'Art. R441-2 et R441-3 du Code de la sécurité sociale', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_single'::question_kind,
      explanation = 'Le salarié informe ou fait informer l''employeur dans les 24 heures ; l''employeur déclare ensuite l''accident à la caisse primaire d''assurance maladie dans les 48 heures et remet la feuille d''accident permettant la prise en charge sans avance de frais. À retenir surtout : un accident bénin doit être tracé — registre des accidents bénins ou déclaration — car c''est l''absence de trace initiale qui bloque la reconnaissance lorsqu''une séquelle apparaît des mois plus tard.',
      expected_answer = null,
      source_ref = 'Art. R441-2 et R441-3 du Code de la sécurité sociale',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Dans les 24 heures, sauf cas de force majeure', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Dans les 48 heures', false, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Dans les 8 jours', false, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Aucun délai n''est fixé', false, 3);
end
$seed$;

-- [79/80] Organisation de la prévention & RPS — mcq_multi
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'Que doit contenir le DUERP ? (plusieurs réponses)';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'mcq_multi'::question_kind, 'Que doit contenir le DUERP ? (plusieurs réponses)',
            'Le DUERP identifie les risques par unité de travail, les classe pour permettre de hiérarchiser l''action, et débouche sur des actions de prévention avec un suivi. Il ne contient aucune donnée médicale nominative : celles-ci relèvent du secret médical et du seul service de prévention et de santé au travail. Le DUERP est tenu à disposition des salariés, du CSE, du médecin du travail et de l''inspection du travail.', null, 'Art. R4121-1 et R4121-4 du Code du travail', 2)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'mcq_multi'::question_kind,
      explanation = 'Le DUERP identifie les risques par unité de travail, les classe pour permettre de hiérarchiser l''action, et débouche sur des actions de prévention avec un suivi. Il ne contient aucune donnée médicale nominative : celles-ci relèvent du secret médical et du seul service de prévention et de santé au travail. Le DUERP est tenu à disposition des salariés, du CSE, du médecin du travail et de l''inspection du travail.',
      expected_answer = null,
      source_ref = 'Art. R4121-1 et R4121-4 du Code du travail',
      difficulty = 2,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'L''inventaire des risques par unité de travail', true, 0);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le classement des risques évalués', true, 1);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Les actions de prévention retenues et leur suivi', true, 2);
  insert into question_options (question_id, label, is_correct, sort_order)
  values (v_question_id, 'Le dossier médical de chaque salarié', false, 3);
end
$seed$;

-- [80/80] Organisation de la prévention & RPS — debate
do $seed$
declare
  v_theme_id uuid;
  v_question_id uuid;
begin
  select id into v_theme_id from themes where org_id is null and key = 'organisation-prevention';

  select id into v_question_id from questions
  where org_id is null and statement = 'Votre entreprise n''a eu aucun accident du travail depuis deux ans. Peut-on en conclure que la prévention est efficace ?';

  if v_question_id is null then
    insert into questions (org_id, theme_id, kind, statement, explanation, expected_answer, source_ref, difficulty)
    values (null, v_theme_id, 'debate'::question_kind, 'Votre entreprise n''a eu aucun accident du travail depuis deux ans. Peut-on en conclure que la prévention est efficace ?',
            'C''est la question la plus utile à poser à une direction, et elle prépare directement la lecture du rapport de synthèse remis en fin de journée. Le point qui fait généralement réagir est le paradoxe de la prime à l''absence d''accident : elle achète du silence, pas de la sécurité, et elle prive l''entreprise de ses signaux faibles.', 'Attendu : non, et savoir dire pourquoi. (1) Le nombre d''accidents est un indicateur de résultat, tardif, et très sensible aux petits effectifs : sur un site de trente personnes, deux ans sans accident peut relever du hasard statistique ; (2) l''absence d''accident déclaré n''est pas l''absence d''accident — la sous-déclaration augmente précisément là où l''absence d''accident devient un objectif affiché ou primé, ce qui rend l''indicateur trompeur au moment où il compte le plus ; (3) les indicateurs de fréquence et de gravité ne disent rien des maladies professionnelles à latence longue : TMS, surdité, cancers professionnels se déclarent des années plus tard ; (4) il faut donc regarder aussi des indicateurs avancés : remontées de presqu''accidents et de situations dangereuses, taux de traitement de ces remontées, avancement du programme annuel de prévention, mise à jour réelle du DUERP, taux de port effectif des EPI, résultats des vérifications périodiques et levée des réserves, absentéisme et turnover ; (5) conclusion attendue : on ne pilote pas la prévention avec le seul compteur d''accidents, on la pilote avec ce qui se passe avant l''accident.', 'INRS — Indicateurs en santé et sécurité au travail ; art. L4121-3 du Code du travail', 3)
    returning id into v_question_id;
  else
    update questions set
      theme_id = v_theme_id,
      kind = 'debate'::question_kind,
      explanation = 'C''est la question la plus utile à poser à une direction, et elle prépare directement la lecture du rapport de synthèse remis en fin de journée. Le point qui fait généralement réagir est le paradoxe de la prime à l''absence d''accident : elle achète du silence, pas de la sécurité, et elle prive l''entreprise de ses signaux faibles.',
      expected_answer = 'Attendu : non, et savoir dire pourquoi. (1) Le nombre d''accidents est un indicateur de résultat, tardif, et très sensible aux petits effectifs : sur un site de trente personnes, deux ans sans accident peut relever du hasard statistique ; (2) l''absence d''accident déclaré n''est pas l''absence d''accident — la sous-déclaration augmente précisément là où l''absence d''accident devient un objectif affiché ou primé, ce qui rend l''indicateur trompeur au moment où il compte le plus ; (3) les indicateurs de fréquence et de gravité ne disent rien des maladies professionnelles à latence longue : TMS, surdité, cancers professionnels se déclarent des années plus tard ; (4) il faut donc regarder aussi des indicateurs avancés : remontées de presqu''accidents et de situations dangereuses, taux de traitement de ces remontées, avancement du programme annuel de prévention, mise à jour réelle du DUERP, taux de port effectif des EPI, résultats des vérifications périodiques et levée des réserves, absentéisme et turnover ; (5) conclusion attendue : on ne pilote pas la prévention avec le seul compteur d''accidents, on la pilote avec ce qui se passe avant l''accident.',
      source_ref = 'INRS — Indicateurs en santé et sécurité au travail ; art. L4121-3 du Code du travail',
      difficulty = 3,
      is_active = true
    where id = v_question_id;
  end if;

  delete from question_options where question_id = v_question_id;
end
$seed$;

commit;
