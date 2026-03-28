var CHANTIERS = [
    { id:'antenne-jaunay', nom:'Antenne relais — Jaunay-Marigny', client:'Free Mobile', type:'Génie civil télécom', avancement:75, statut:'En cours', montantHT:82000, dateDebut:'2026-02-10', dateFin:'2026-04-15', chef:'Quentin G.' },
    { id:'vrd-musichalles', nom:'VRD Lotissement Les Music\'halles', client:'Eiffage Immobilier', type:'VRD', avancement:45, statut:'En cours', montantHT:145000, dateDebut:'2026-01-20', dateFin:'2026-05-30', chef:'Quentin G.' },
    { id:'terrassement-leclerc', nom:'Terrassement Parking Leclerc', client:'Leclerc Chasseneuil', type:'Terrassement', avancement:90, statut:'Finitions', montantHT:67000, dateDebut:'2026-01-05', dateFin:'2026-03-31', chef:'Kévin M.' },
    { id:'fondations-dupont', nom:'Fondations Villa Dupont', client:'M. Dupont (particulier)', type:'Maçonnerie / Fondations', avancement:30, statut:'En cours', montantHT:28500, dateDebut:'2026-03-10', dateFin:'2026-04-25', chef:'Kévin M.' },
    { id:'reseaux-zac', nom:'Réseaux secs — ZAC République', client:'Eiffage Énergie', type:'Réseaux', avancement:15, statut:'Démarrage', montantHT:93200, dateDebut:'2026-03-24', dateFin:'2026-06-15', chef:'Quentin G.' },
    { id:'enrobes-gare', nom:'Enrobés Rue de la Gare', client:'Mairie Migné-Auxances', type:'Enrobés / Voirie', avancement:60, statut:'En cours', montantHT:41500, dateDebut:'2026-02-24', dateFin:'2026-04-10', chef:'Kévin M.' },
    { id:'massif-t42', nom:'Massif béton pylône T42', client:'Free Mobile', type:'Génie civil télécom', avancement:10, statut:'Démarrage', montantHT:30000, dateDebut:'2026-03-25', dateFin:'2026-04-30', chef:'Quentin G.' }
];

var PHOTOS = [
    { date:'2026-03-27', heure:'08:12', chantier:'antenne-jaunay', desc:'Ferraillage semelle S3', tag:'Ferraillage — preuve contractuelle', critical:true, icon:'🔩', auteur:'Quentin G.', gps:'46.6833, 0.3667' },
    { date:'2026-03-27', heure:'08:45', chantier:'antenne-jaunay', desc:'Vue d\'ensemble fouille', tag:'Terrassement', critical:false, icon:'🏗️', auteur:'Quentin G.', gps:'46.6833, 0.3667' },
    { date:'2026-03-27', heure:'10:30', chantier:'vrd-musichalles', desc:'Pose canalisation EU lot 3', tag:'Réseaux', critical:false, icon:'🔧', auteur:'Quentin G.', gps:'46.6612, 0.3615' },
    { date:'2026-03-27', heure:'14:15', chantier:'terrassement-leclerc', desc:'Compactage couche de forme', tag:'Terrassement', critical:false, icon:'🚜', auteur:'Kévin M.', gps:'46.6542, 0.3489' },
    { date:'2026-03-27', heure:'16:00', chantier:'antenne-jaunay', desc:'Ferraillage semelle S3 — terminé', tag:'Ferraillage — preuve contractuelle', critical:true, icon:'✅', auteur:'Quentin G.', gps:'46.6833, 0.3667' },
    { date:'2026-03-26', heure:'07:45', chantier:'enrobes-gare', desc:'Fraisage chaussée existante', tag:'Enrobés', critical:false, icon:'🛣️', auteur:'Kévin M.', gps:'46.6145, 0.3312' },
    { date:'2026-03-26', heure:'09:20', chantier:'vrd-musichalles', desc:'Tranchée réseau EP lot 2', tag:'Réseaux', critical:false, icon:'🔧', auteur:'Quentin G.', gps:'46.6612, 0.3615' },
    { date:'2026-03-26', heure:'11:00', chantier:'fondations-dupont', desc:'Implantation fondations', tag:'Implantation', critical:false, icon:'📐', auteur:'Kévin M.', gps:'46.5978, 0.3401' },
    { date:'2026-03-26', heure:'14:30', chantier:'antenne-jaunay', desc:'Coffrage massif M2', tag:'Coffrage', critical:false, icon:'🪵', auteur:'Quentin G.', gps:'46.6833, 0.3667' },
    { date:'2026-03-26', heure:'16:45', chantier:'terrassement-leclerc', desc:'Nivellement final zone B', tag:'Terrassement', critical:false, icon:'🚜', auteur:'Kévin M.', gps:'46.6542, 0.3489' },
    { date:'2026-03-25', heure:'08:00', chantier:'antenne-jaunay', desc:'Coulage béton semelle S2', tag:'Bétonnage', critical:false, icon:'🏗️', auteur:'Quentin G.', gps:'46.6833, 0.3667' },
    { date:'2026-03-25', heure:'09:30', chantier:'vrd-musichalles', desc:'Pose regards R12–R15', tag:'Réseaux', critical:false, icon:'🔧', auteur:'Quentin G.', gps:'46.6612, 0.3615' },
    { date:'2026-03-25', heure:'13:15', chantier:'enrobes-gare', desc:'Pose grave bitume couche base', tag:'Enrobés', critical:false, icon:'🛣️', auteur:'Kévin M.', gps:'46.6145, 0.3312' },
    { date:'2026-03-25', heure:'15:00', chantier:'reseaux-zac', desc:'Piquetage et balisage', tag:'Implantation', critical:false, icon:'📐', auteur:'Quentin G.', gps:'46.5812, 0.3456' }
];

var EMPLOYES = [
    { nom:'Quentin G.', type:'Salarié', role:'Chef de chantier', chantier:'antenne-jaunay', heures:[8,8,8,8,8,0], nuit:0, paniers:5, deplacement:true },
    { nom:'Kévin M.', type:'Salarié', role:'Chef de chantier', chantier:'terrassement-leclerc', heures:[8,8,8,8,8,4], nuit:0, paniers:5, deplacement:false },
    { nom:'Julien R.', type:'Salarié', role:'Maçon', chantier:'antenne-jaunay', heures:[8,8,8,8,8,0], nuit:0, paniers:5, deplacement:true },
    { nom:'Adrien B.', type:'Salarié', role:'Conducteur engins', chantier:'vrd-musichalles', heures:[8,8,8,8,8,0], nuit:0, paniers:5, deplacement:false },
    { nom:'Mamadou D.', type:'Intérimaire', agence:'Adecco Poitiers', chantier:'vrd-musichalles', heures:[8,8,8,8,8,0], nuit:0, paniers:5, deplacement:false },
    { nom:'Youssef K.', type:'Intérimaire', agence:'Adecco Poitiers', chantier:'antenne-jaunay', heures:[8,8,8,8,0,0], nuit:8, paniers:4, deplacement:true },
    { nom:'Lucas P.', type:'Intérimaire', agence:'Adecco Poitiers', chantier:'terrassement-leclerc', heures:[8,8,8,8,8,4], nuit:0, paniers:5, deplacement:false },
    { nom:'Romain C.', type:'Intérimaire', agence:'Manpower Chasseneuil', chantier:'enrobes-gare', heures:[8,8,8,8,8,0], nuit:0, paniers:5, deplacement:false },
    { nom:'Anthony L.', type:'Intérimaire', agence:'Manpower Chasseneuil', chantier:'vrd-musichalles', heures:[8,8,8,0,8,4], nuit:0, paniers:4, deplacement:true },
    { nom:'Dylan M.', type:'Intérimaire', agence:'Actual Poitiers', chantier:'fondations-dupont', heures:[8,8,8,8,6,0], nuit:0, paniers:5, deplacement:false }
];

var MATERIEL = [
    { nom:'Pelle Volvo EC220E', immat:'AA-220-BB', affect:'antenne-jaunay', statut:'En service', ct:'2026-03-15', maint:'2026-02-01', ctExpire:true },
    { nom:'Mini-pelle Kubota KX057', immat:'CC-057-DD', affect:'fondations-dupont', statut:'En service', ct:'2026-07-20', maint:'2026-01-15', ctExpire:false },
    { nom:'Camion benne Renault K430', immat:'EE-430-FF', affect:'vrd-musichalles', statut:'En service', ct:'2026-04-12', maint:'2026-03-01', ctExpire:false },
    { nom:'Compacteur Bomag BW120', immat:'GG-120-HH', affect:'terrassement-leclerc', statut:'En service', ct:'2026-09-05', maint:'2026-02-20', ctExpire:false },
    { nom:'Chargeuse Cat 926M', immat:'II-926-JJ', affect:'vrd-musichalles', statut:'En service', ct:'2026-06-18', maint:'2026-03-10', ctExpire:false },
    { nom:'Groupe électrogène 50kVA', immat:'GE-2024-087', affect:'reseaux-zac', statut:'En service', ct:null, maint:'2026-01-10', ctExpire:false },
    { nom:'Camion grue Iveco', immat:'KK-380-LL', affect:'antenne-jaunay', statut:'En service', ct:'2026-08-22', maint:'2026-02-28', ctExpire:false },
    { nom:'Fourgon Renault Master', immat:'MM-300-NN', affect:'enrobes-gare', statut:'En service', ct:'2026-05-30', maint:'2026-03-15', ctExpire:false },
    { nom:'Plaque vibrante Wacker', immat:'WN-2023-142', affect:'fondations-dupont', statut:'En panne', ct:null, maint:'2025-12-05', ctExpire:false },
    { nom:'Bétonnière tractée 350L', immat:'BT-2022-063', affect:'massif-t42', statut:'Disponible', ct:null, maint:'2026-03-20', ctExpire:false }
];

var RENTABILITE = [
    { id:'antenne-jaunay', mo:18200, interim:8400, mater:12800, loc:4500 },
    { id:'vrd-musichalles', mo:32000, interim:18500, mater:38200, loc:12000 },
    { id:'terrassement-leclerc', mo:14500, interim:7200, mater:9800, loc:8500 },
    { id:'fondations-dupont', mo:6200, interim:3800, mater:5400, loc:2100 },
    { id:'reseaux-zac', mo:8500, interim:4200, mater:6800, loc:3500 },
    { id:'enrobes-gare', mo:9800, interim:4500, mater:11200, loc:3200 },
    { id:'massif-t42', mo:2800, interim:1200, mater:3500, loc:1800 }
];

var DOCS_RECENTS = [
    { icon:'📋', nom:'Fiche de préparation', chantier:'antenne-jaunay', date:'22/03/2026', type:'preparation' },
    { icon:'🦺', nom:'Livret accueil sécurité', chantier:'antenne-jaunay', date:'22/03/2026', type:'securite' },
    { icon:'📋', nom:'Fiche de préparation', chantier:'vrd-musichalles', date:'15/03/2026', type:'preparation' },
    { icon:'🦺', nom:'Livret accueil sécurité', chantier:'vrd-musichalles', date:'15/03/2026', type:'securite' },
    { icon:'🪪', nom:'Cartes habilitation', chantier:'vrd-musichalles', date:'15/03/2026', type:'habilitations' }
];
