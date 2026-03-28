// ===== DONNÉES FICTIVES RÉALISTES GS BTP =====

const CHANTIERS = [
    {
        id: 'antenne-jaunay',
        nom: 'Antenne relais — Jaunay-Marigny',
        client: 'Free Mobile',
        type: 'Génie civil télécom',
        avancement: 75,
        statut: 'En cours',
        montantHT: 82000,
        dateDebut: '2026-02-10',
        dateFin: '2026-04-15',
        chefChantier: 'Quentin G.'
    },
    {
        id: 'vrd-musichalles',
        nom: 'VRD Lotissement Les Music\'halles',
        client: 'Eiffage Immobilier',
        type: 'VRD',
        avancement: 45,
        statut: 'En cours',
        montantHT: 145000,
        dateDebut: '2026-01-20',
        dateFin: '2026-05-30',
        chefChantier: 'Quentin G.'
    },
    {
        id: 'terrassement-leclerc',
        nom: 'Terrassement Parking Leclerc',
        client: 'Leclerc Chasseneuil',
        type: 'Terrassement',
        avancement: 90,
        statut: 'Finitions',
        montantHT: 67000,
        dateDebut: '2026-01-05',
        dateFin: '2026-03-31',
        chefChantier: 'Kévin M.'
    },
    {
        id: 'fondations-dupont',
        nom: 'Fondations Villa Dupont',
        client: 'M. Dupont (particulier)',
        type: 'Maçonnerie / Fondations',
        avancement: 30,
        statut: 'En cours',
        montantHT: 28500,
        dateDebut: '2026-03-10',
        dateFin: '2026-04-25',
        chefChantier: 'Kévin M.'
    },
    {
        id: 'reseaux-zac',
        nom: 'Réseaux secs — ZAC République',
        client: 'Eiffage Énergie',
        type: 'Réseaux',
        avancement: 15,
        statut: 'Démarrage',
        montantHT: 93200,
        dateDebut: '2026-03-24',
        dateFin: '2026-06-15',
        chefChantier: 'Quentin G.'
    },
    {
        id: 'enrobes-gare',
        nom: 'Enrobés Rue de la Gare',
        client: 'Mairie Migné-Auxances',
        type: 'Enrobés / Voirie',
        avancement: 60,
        statut: 'En cours',
        montantHT: 41500,
        dateDebut: '2026-02-24',
        dateFin: '2026-04-10',
        chefChantier: 'Kévin M.'
    },
    {
        id: 'massif-t42',
        nom: 'Massif béton pylône T42',
        client: 'Free Mobile',
        type: 'Génie civil télécom',
        avancement: 10,
        statut: 'Démarrage',
        montantHT: 30000,
        dateDebut: '2026-03-25',
        dateFin: '2026-04-30',
        chefChantier: 'Quentin G.'
    }
];

const PHOTOS = [
    // 27 mars 2026
    { date: '2026-03-27', heure: '08:12', chantier: 'antenne-jaunay', description: 'Ferraillage semelle S3', tag: 'Ferraillage — preuve contractuelle', critical: true, icon: '🔩', auteur: 'Quentin G.', gps: '46.6833, 0.3667' },
    { date: '2026-03-27', heure: '08:45', chantier: 'antenne-jaunay', description: 'Vue d\'ensemble fouille', tag: 'Terrassement', critical: false, icon: '🏗️', auteur: 'Quentin G.', gps: '46.6833, 0.3667' },
    { date: '2026-03-27', heure: '10:30', chantier: 'vrd-musichalles', description: 'Pose canalisation EU lot 3', tag: 'Réseaux', critical: false, icon: '🔧', auteur: 'Quentin G.', gps: '46.6612, 0.3615' },
    { date: '2026-03-27', heure: '14:15', chantier: 'terrassement-leclerc', description: 'Compactage couche de forme', tag: 'Terrassement', critical: false, icon: '🚜', auteur: 'Kévin M.', gps: '46.6542, 0.3489' },
    { date: '2026-03-27', heure: '16:00', chantier: 'antenne-jaunay', description: 'Ferraillage semelle S3 — terminé', tag: 'Ferraillage — preuve contractuelle', critical: true, icon: '✅', auteur: 'Quentin G.', gps: '46.6833, 0.3667' },

    // 26 mars 2026
    { date: '2026-03-26', heure: '07:45', chantier: 'enrobes-gare', description: 'Fraisage chaussée existante', tag: 'Enrobés', critical: false, icon: '🛣️', auteur: 'Kévin M.', gps: '46.6145, 0.3312' },
    { date: '2026-03-26', heure: '09:20', chantier: 'vrd-musichalles', description: 'Tranchée réseau EP lot 2', tag: 'Réseaux', critical: false, icon: '🔧', auteur: 'Quentin G.', gps: '46.6612, 0.3615' },
    { date: '2026-03-26', heure: '11:00', chantier: 'fondations-dupont', description: 'Implantation fondations', tag: 'Implantation', critical: false, icon: '📐', auteur: 'Kévin M.', gps: '46.5978, 0.3401' },
    { date: '2026-03-26', heure: '14:30', chantier: 'antenne-jaunay', description: 'Coffrage massif M2', tag: 'Coffrage', critical: false, icon: '🪵', auteur: 'Quentin G.', gps: '46.6833, 0.3667' },
    { date: '2026-03-26', heure: '16:45', chantier: 'terrassement-leclerc', description: 'Nivellement final zone B', tag: 'Terrassement', critical: false, icon: '🚜', auteur: 'Kévin M.', gps: '46.6542, 0.3489' },

    // 25 mars 2026
    { date: '2026-03-25', heure: '08:00', chantier: 'antenne-jaunay', description: 'Coulage béton semelle S2', tag: 'Bétonnage', critical: false, icon: '🏗️', auteur: 'Quentin G.', gps: '46.6833, 0.3667' },
    { date: '2026-03-25', heure: '09:30', chantier: 'vrd-musichalles', description: 'Pose regards R12–R15', tag: 'Réseaux', critical: false, icon: '🔧', auteur: 'Quentin G.', gps: '46.6612, 0.3615' },
    { date: '2026-03-25', heure: '13:15', chantier: 'enrobes-gare', description: 'Pose grave bitume couche base', tag: 'Enrobés', critical: false, icon: '🛣️', auteur: 'Kévin M.', gps: '46.6145, 0.3312' },
    { date: '2026-03-25', heure: '15:00', chantier: 'reseaux-zac', description: 'Piquetage et balisage', tag: 'Implantation', critical: false, icon: '📐', auteur: 'Quentin G.', gps: '46.5812, 0.3456' },
];

const EMPLOYES = [
    // Salariés GS BTP
    { nom: 'Quentin G.', type: 'Salarié', role: 'Chef de chantier', chantier: 'antenne-jaunay', heures: [8, 8, 8, 8, 8, 0], nuit: 0, paniers: 5, deplacement: true },
    { nom: 'Kévin M.', type: 'Salarié', role: 'Chef de chantier', chantier: 'terrassement-leclerc', heures: [8, 8, 8, 8, 8, 4], nuit: 0, paniers: 5, deplacement: false },
    { nom: 'Julien R.', type: 'Salarié', role: 'Maçon', chantier: 'antenne-jaunay', heures: [8, 8, 8, 8, 8, 0], nuit: 0, paniers: 5, deplacement: true },
    { nom: 'Adrien B.', type: 'Salarié', role: 'Conducteur engins', chantier: 'vrd-musichalles', heures: [8, 8, 8, 8, 8, 0], nuit: 0, paniers: 5, deplacement: false },

    // Intérimaires Adecco
    { nom: 'Mamadou D.', type: 'Intérimaire', agence: 'Adecco Poitiers', chantier: 'vrd-musichalles', heures: [8, 8, 8, 8, 8, 0], nuit: 0, paniers: 5, deplacement: false },
    { nom: 'Youssef K.', type: 'Intérimaire', agence: 'Adecco Poitiers', chantier: 'antenne-jaunay', heures: [8, 8, 8, 8, 0, 0], nuit: 8, paniers: 4, deplacement: true },
    { nom: 'Lucas P.', type: 'Intérimaire', agence: 'Adecco Poitiers', chantier: 'terrassement-leclerc', heures: [8, 8, 8, 8, 8, 4], nuit: 0, paniers: 5, deplacement: false },

    // Intérimaires Manpower
    { nom: 'Romain C.', type: 'Intérimaire', agence: 'Manpower Chasseneuil', chantier: 'enrobes-gare', heures: [8, 8, 8, 8, 8, 0], nuit: 0, paniers: 5, deplacement: false },
    { nom: 'Anthony L.', type: 'Intérimaire', agence: 'Manpower Chasseneuil', chantier: 'vrd-musichalles', heures: [8, 8, 8, 0, 8, 4], nuit: 0, paniers: 4, deplacement: true },

    // Intérimaire Actual
    { nom: 'Dylan M.', type: 'Intérimaire', agence: 'Actual Poitiers', chantier: 'fondations-dupont', heures: [8, 8, 8, 8, 6, 0], nuit: 0, paniers: 5, deplacement: false },
];

const MATERIEL = [
    { nom: 'Pelle Volvo EC220E', immat: 'AA-220-BB', affectation: 'antenne-jaunay', statut: 'En service', prochainCT: '2026-03-15', derniereMaint: '2026-02-01', ctExpire: true },
    { nom: 'Mini-pelle Kubota KX057', immat: 'CC-057-DD', affectation: 'fondations-dupont', statut: 'En service', prochainCT: '2026-07-20', derniereMaint: '2026-01-15', ctExpire: false },
    { nom: 'Camion benne Renault K430', immat: 'EE-430-FF', affectation: 'vrd-musichalles', statut: 'En service', prochainCT: '2026-04-12', derniereMaint: '2026-03-01', ctExpire: false },
    { nom: 'Compacteur Bomag BW120', immat: 'GG-120-HH', affectation: 'terrassement-leclerc', statut: 'En service', prochainCT: '2026-09-05', derniereMaint: '2026-02-20', ctExpire: false },
    { nom: 'Chargeuse Caterpillar 926M', immat: 'II-926-JJ', affectation: 'vrd-musichalles', statut: 'En service', prochainCT: '2026-06-18', derniereMaint: '2026-03-10', ctExpire: false },
    { nom: 'Groupe électrogène 50kVA', immat: 'S/N: GE-2024-087', affectation: 'reseaux-zac', statut: 'En service', prochainCT: '—', derniereMaint: '2026-01-10', ctExpire: false },
    { nom: 'Camion grue Iveco Trakker', immat: 'KK-380-LL', affectation: 'antenne-jaunay', statut: 'En service', prochainCT: '2026-08-22', derniereMaint: '2026-02-28', ctExpire: false },
    { nom: 'Fourgon Renault Master', immat: 'MM-300-NN', affectation: 'enrobes-gare', statut: 'En service', prochainCT: '2026-05-30', derniereMaint: '2026-03-15', ctExpire: false },
    { nom: 'Plaque vibrante Wacker 400', immat: 'S/N: WN-2023-142', affectation: 'fondations-dupont', statut: 'En panne', prochainCT: '—', derniereMaint: '2025-12-05', ctExpire: false },
    { nom: 'Bétonnière tractée 350L', immat: 'S/N: BT-2022-063', affectation: 'massif-t42', statut: 'Disponible', prochainCT: '—', derniereMaint: '2026-03-20', ctExpire: false },
];

const RENTABILITE = [
    {
        chantierId: 'antenne-jaunay',
        montantHT: 82000,
        mainOeuvre: 18200,
        interim: 8400,
        materiaux: 12800,
        location: 4500,
    },
    {
        chantierId: 'vrd-musichalles',
        montantHT: 145000,
        mainOeuvre: 32000,
        interim: 18500,
        materiaux: 38200,
        location: 12000,
    },
    {
        chantierId: 'terrassement-leclerc',
        montantHT: 67000,
        mainOeuvre: 14500,
        interim: 7200,
        materiaux: 9800,
        location: 8500,
    },
    {
        chantierId: 'fondations-dupont',
        montantHT: 28500,
        mainOeuvre: 6200,
        interim: 3800,
        materiaux: 5400,
        location: 2100,
    },
    {
        chantierId: 'reseaux-zac',
        montantHT: 93200,
        mainOeuvre: 8500,
        interim: 4200,
        materiaux: 6800,
        location: 3500,
    },
    {
        chantierId: 'enrobes-gare',
        montantHT: 41500,
        mainOeuvre: 9800,
        interim: 4500,
        materiaux: 11200,
        location: 3200,
    },
    {
        chantierId: 'massif-t42',
        montantHT: 30000,
        mainOeuvre: 2800,
        interim: 1200,
        materiaux: 3500,
        location: 1800,
    },
];

const DOCS_TEMPLATES = [
    { icon: '📋', nom: 'Fiche de préparation chantier', taille: '245 Ko' },
    { icon: '🦺', nom: 'Livret d\'accueil sécurité', taille: '1,2 Mo' },
    { icon: '🪪', nom: 'Cartes d\'habilitation équipe', taille: '380 Ko' },
    { icon: '⚠️', nom: 'Plan de prévention', taille: '520 Ko' },
];
