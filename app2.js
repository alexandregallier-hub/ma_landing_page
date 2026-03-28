// ===== MATERIEL =====
(function(){
    var alerts=document.getElementById('materiel-alerts');
    var ahtml='';
    MATERIEL.forEach(function(m){
        if(m.ctExpire) ahtml+='<div class="mat-alert critical"><strong>🔴 CT expiré — '+m.nom+'</strong><small>Immat: '+m.immat+' — Expiré le '+fdate(m.ct)+'</small></div>';
        if(m.statut==='En panne') ahtml+='<div class="mat-alert warning"><strong>🟠 En panne — '+m.nom+'</strong><small>Dernière maintenance : '+fdate(m.maint)+'</small></div>';
    });
    MATERIEL.forEach(function(m){
        if(!m.ct||m.ctExpire) return;
        var diff=(new Date(m.ct)-new Date())/(1000*60*60*24);
        if(diff>0&&diff<=30) ahtml+='<div class="mat-alert warning"><strong>🟠 CT dans '+Math.ceil(diff)+' jours — '+m.nom+'</strong><small>Échéance : '+fdate(m.ct)+'</small></div>';
    });
    alerts.innerHTML=ahtml;

    var tbody=document.getElementById('materiel-body');
    var html='';
    MATERIEL.forEach(function(m){
        var badge;
        if(m.ctExpire) badge='<span class="badge red">CT expiré</span>';
        else if(m.statut==='En panne') badge='<span class="badge orange">En panne</span>';
        else if(m.statut==='Disponible') badge='<span class="badge gray">Disponible</span>';
        else badge='<span class="badge green">En service</span>';
        html+='<tr><td><strong>'+m.nom+'</strong></td><td>'+m.immat+'</td>';
        html+='<td style="font-size:.8rem">'+chNom(m.affect)+'</td><td>'+badge+'</td>';
        html+='<td>'+(m.ct?fdate(m.ct):'—')+'</td><td>'+fdate(m.maint)+'</td></tr>';
    });
    tbody.innerHTML=html;
})();

// ===== DOCUMENTS — GENERATION =====
(function(){
    var sel=document.getElementById('doc-select');
    CHANTIERS.forEach(function(c){ sel.innerHTML+='<option value="'+c.id+'">'+c.nom+'</option>' });
    // Docs récents
    var html='<table class="table"><thead><tr><th>Document</th><th>Chantier</th><th>Généré le</th><th>Action</th></tr></thead><tbody>';
    DOCS_RECENTS.forEach(function(d){
        html+='<tr><td>'+d.icon+' '+d.nom+'</td><td>'+chNom(d.chantier)+'</td><td>'+d.date+'</td>';
        html+='<td><button class="btn btn-small" onclick="openDocPreview(\''+d.type+'\',\''+d.chantier+'\')">Voir</button></td></tr>';
    });
    html+='</tbody></table>';
    document.getElementById('docs-recents').innerHTML=html;
})();

function generateDocs(){
    var sel=document.getElementById('doc-select');
    if(!sel.value){showToast('⚠️ Sélectionnez un chantier');return}
    var c=ch(sel.value);
    var res=document.getElementById('doc-result');
    res.style.display='block';
    res.innerHTML='<div class="card"><h3>📁 Génération en cours...</h3><div class="spinner-wrap"><div class="spinner"></div> Pré-remplissage des documents avec les données du chantier...</div></div>';
    res.scrollIntoView({behavior:'smooth'});

    setTimeout(function(){
        var checks=document.querySelectorAll('#doc-checkboxes input:checked');
        var types=[];
        checks.forEach(function(cb){types.push(cb.dataset.doc)});
        if(types.length===0){res.innerHTML='<div class="card"><p>Aucun document sélectionné.</p></div>';return}

        var html='<div class="card"><h3>📁 Dossier généré — '+c.nom+'</h3><div class="doc-grid">';
        var icons={preparation:'📋',securite:'🦺',habilitations:'🪪',prevention:'⚠️',ppsps:'📘'};
        var noms={preparation:'Fiche de préparation chantier',securite:'Livret d\'accueil sécurité',habilitations:'Cartes d\'habilitation équipe',prevention:'Plan de prévention',ppsps:'PPSPS'};
        types.forEach(function(t){
            html+='<div class="doc-item" onclick="openDocPreview(\''+t+'\',\''+sel.value+'\')">';
            html+='<span class="doc-icon">'+(icons[t]||'📄')+'</span>';
            html+='<div><div class="doc-name">'+(noms[t]||t)+'</div><div class="doc-size">Généré automatiquement — cliquez pour ouvrir</div></div></div>';
        });
        html+='</div>';
        html+='<div class="gain-banner" style="margin-top:1rem">⏱️ <strong>Gain estimé :</strong> ~1h30 par chantier — documents pré-remplis avec les données chantier, équipe et client.</div></div>';
        res.innerHTML=html;
        showToast('⚡ '+types.length+' documents générés pour "'+c.nom+'"');
    }, 1500);
}

// ===== DOCUMENTS — TRAMES COMPLÈTES =====
function openDocPreview(type, chantierId) {
    var c=ch(chantierId);
    if(!c){showToast('Chantier non trouvé');return}
    var equipe=EMPLOYES.filter(function(e){return e.chantier===chantierId});
    var matos=MATERIEL.filter(function(m){return m.affect===chantierId});

    if(type==='preparation') return openPreparation(c, equipe, matos);
    if(type==='securite') return openSecurite(c, equipe);
    if(type==='habilitations') return openHabilitations(c, equipe);
    if(type==='prevention') return openPrevention(c, equipe, matos);
    if(type==='ppsps') return openPPSPS(c, equipe, matos);
}

function openPreparation(c, equipe, matos) {
    var h='<span class="doc-badge">GS BTP — FICHE DE PRÉPARATION CHANTIER</span>';
    h+='<div class="doc-section"><h4>1. Identification du chantier</h4>';
    h+='<p><strong>Intitulé :</strong> '+c.nom+'<br>';
    h+='<strong>Client / Donneur d\'ordre :</strong> '+c.client+'<br>';
    h+='<strong>Type de travaux :</strong> '+c.type+'<br>';
    h+='<strong>Adresse :</strong> Chasseneuil-du-Poitou / Migné-Auxances (86)<br>';
    h+='<strong>Date début :</strong> '+fdate(c.dateDebut)+' — <strong>Date fin prévue :</strong> '+fdate(c.dateFin)+'<br>';
    h+='<strong>Montant marché HT :</strong> '+fmt(c.montantHT)+'<br>';
    h+='<strong>Chef de chantier :</strong> '+c.chef+'</p></div>';

    h+='<div class="doc-section"><h4>2. Moyens humains</h4><table class="table"><thead><tr><th>Nom</th><th>Fonction</th><th>Statut</th></tr></thead><tbody>';
    equipe.forEach(function(e){
        h+='<tr><td>'+e.nom+'</td><td>'+(e.role||'Ouvrier')+'</td><td>'+e.type+(e.agence?' ('+e.agence+')':'')+'</td></tr>';
    });
    if(equipe.length===0) h+='<tr><td colspan="3" style="color:var(--text-muted)">Aucun personnel affecté pour l\'instant</td></tr>';
    h+='</tbody></table></div>';

    h+='<div class="doc-section"><h4>3. Matériel affecté</h4><table class="table"><thead><tr><th>Engin</th><th>Immatriculation</th><th>Statut</th></tr></thead><tbody>';
    matos.forEach(function(m){
        h+='<tr><td>'+m.nom+'</td><td>'+m.immat+'</td><td>'+m.statut+'</td></tr>';
    });
    if(matos.length===0) h+='<tr><td colspan="3" style="color:var(--text-muted)">Aucun matériel affecté</td></tr>';
    h+='</tbody></table></div>';

    h+='<div class="doc-section"><h4>4. Consignes particulières</h4><ul>';
    h+='<li>Vérifier DICT avant tout terrassement</li>';
    h+='<li>Port des EPI obligatoire sur toute la zone chantier</li>';
    h+='<li>Photos horodatées obligatoires à chaque étape clé (ferraillage, coffrage, coulage)</li>';
    h+='<li>Respect des horaires de travail : 7h30–12h / 13h–17h (sauf accord spécifique)</li>';
    h+='<li>Compte-rendu journalier au conducteur de travaux</li></ul></div>';

    h+='<div class="doc-section"><h4>5. Documents associés</h4><ul>';
    h+='<li>Plan d\'exécution (à récupérer auprès du client)</li>';
    h+='<li>Livret d\'accueil sécurité</li>';
    h+='<li>Cartes d\'habilitation du personnel</li>';
    h+='<li>Plan de prévention signé</li></ul></div>';

    h+='<div class="doc-stamp">Document généré le '+today+' — GS BTP / Leanopia<br>Signature chef de chantier : _________________ Signature conducteur travaux : _________________</div>';
    openModal('Fiche de préparation — '+c.nom, h);
}

function openSecurite(c, equipe) {
    var h='<span class="doc-badge">GS BTP — LIVRET D\'ACCUEIL SÉCURITÉ</span>';
    h+='<div class="doc-section"><h4>Bienvenue sur le chantier</h4>';
    h+='<p style="font-size:1rem"><strong>'+c.nom+'</strong><br>Client : '+c.client+'<br>Lieu : Chasseneuil-du-Poitou / Migné-Auxances (86)</p></div>';

    h+='<div class="doc-section"><h4>1. Équipements de Protection Individuelle (EPI) obligatoires</h4><ul>';
    h+='<li>🪖 <strong>Casque de chantier</strong> — obligatoire sur toute la zone</li>';
    h+='<li>🦺 <strong>Gilet haute visibilité</strong> — porté en permanence</li>';
    h+='<li>👢 <strong>Chaussures de sécurité</strong> — norme S3 minimum</li>';
    h+='<li>🧤 <strong>Gants de protection</strong> — adaptés à la tâche</li>';
    h+='<li>👂 <strong>Protections auditives</strong> — en zone bruyante (> 85 dB)</li>';
    h+='<li>🥽 <strong>Lunettes de protection</strong> — pour découpe, soudure, percement</li></ul></div>';

    h+='<div class="doc-section"><h4>2. Règles de circulation sur le chantier</h4><ul>';
    h+='<li>Respecter les zones de circulation piétons balisées</li>';
    h+='<li>Ne jamais stationner dans le rayon d\'action des engins</li>';
    h+='<li>Contact visuel obligatoire avec le conducteur d\'engin avant de passer</li>';
    h+='<li>Vitesse limitée à 20 km/h sur le chantier</li></ul></div>';

    h+='<div class="doc-section"><h4>3. Interdictions formelles</h4><ul>';
    h+='<li>❌ Consommation d\'alcool ou de substances illicites</li>';
    h+='<li>❌ Utilisation du téléphone en zone de travail active</li>';
    h+='<li>❌ Accès aux fouilles non blindées</li>';
    h+='<li>❌ Travail en hauteur sans protection antichute</li></ul></div>';

    h+='<div class="doc-section"><h4>4. Conduite à tenir en cas d\'accident</h4><ul>';
    h+='<li>1. <strong>Protéger</strong> la zone (baliser, couper les engins)</li>';
    h+='<li>2. <strong>Alerter</strong> le chef de chantier : '+c.chef+'</li>';
    h+='<li>3. <strong>Secourir</strong> (SST formés sur le chantier)</li></ul></div>';

    h+='<div class="doc-section"><h4>5. Numéros d\'urgence</h4>';
    h+='<table class="table"><tbody>';
    h+='<tr><td><strong>SAMU</strong></td><td>15</td></tr>';
    h+='<tr><td><strong>Pompiers</strong></td><td>18</td></tr>';
    h+='<tr><td><strong>Urgences européennes</strong></td><td>112</td></tr>';
    h+='<tr><td><strong>Dirigeant GS BTP (Adrien Guyot)</strong></td><td>+33 7 81 22 10 44</td></tr>';
    h+='<tr><td><strong>Chef de chantier</strong></td><td>'+c.chef+'</td></tr>';
    h+='</tbody></table></div>';

    h+='<div class="doc-section"><h4>6. Personnel présent sur le chantier</h4><table class="table"><thead><tr><th>Nom</th><th>Fonction</th><th>Entreprise</th></tr></thead><tbody>';
    equipe.forEach(function(e){
        h+='<tr><td>'+e.nom+'</td><td>'+(e.role||'Ouvrier')+'</td><td>'+(e.agence||'GS BTP')+'</td></tr>';
    });
    h+='</tbody></table></div>';

    h+='<div class="doc-stamp">J\'ai pris connaissance du présent livret d\'accueil sécurité.<br><br>';
    h+='Nom : _________________________ Signature : _________________________<br>';
    h+='Date : '+today+'<br><br>GS BTP / Leanopia</div>';
    openModal('Livret accueil sécurité — '+c.nom, h);
}

function openHabilitations(c, equipe) {
    var h='<span class="doc-badge">GS BTP — CARTES D\'HABILITATION</span>';
    h+='<div class="doc-section"><h4>Chantier : '+c.nom+'</h4><p>'+equipe.length+' carte(s) générée(s) pour le personnel affecté.</p></div>';

    if(equipe.length===0){
        h+='<p style="color:var(--text-muted)">Aucun personnel affecté à ce chantier.</p>';
    } else {
        equipe.forEach(function(e){
            h+='<div class="doc-field">';
            h+='<p><strong style="font-size:1rem;color:var(--accent)">'+e.nom+'</strong><br>';
            h+='Fonction : '+(e.role||'Ouvrier')+'<br>';
            h+='Entreprise : '+(e.agence||'GS BTP — SARL')+'<br>';
            h+='Chantier : '+c.nom+'<br><br>';
            h+='<strong>Habilitations :</strong><br>';
            h+='✅ AIPR Concepteur — Validité : 12 mois<br>';
            h+='✅ H0B0 — Habilitation électrique<br>';
            if(e.role==='Conducteur engins') h+='✅ CACES R482 Cat. A/B1/C1 — Validité : 10 ans<br>';
            if(e.role==='Chef de chantier') h+='✅ SST (Sauveteur Secouriste du Travail) — Validité : 24 mois<br>';
            h+='<br><strong>Visite médicale :</strong> À jour<br>';
            h+='<strong>Accueil sécurité :</strong> Réalisé le '+today+'</p>';
            h+='</div>';
        });
    }

    h+='<div class="doc-stamp">Cartes générées le '+today+' — GS BTP / Leanopia<br>Responsable : Adrien Guyot — Gérant</div>';
    openModal('Cartes d\'habilitation — '+c.nom, h);
}

function openPrevention(c, equipe, matos) {
    var h='<span class="doc-badge">GS BTP — PLAN DE PRÉVENTION</span>';
    h+='<div class="doc-section"><h4>1. Parties concernées</h4>';
    h+='<p><strong>Entreprise utilisatrice (EU) :</strong> '+c.client+'<br>';
    h+='<strong>Entreprise extérieure (EE) :</strong> GS BTP — SARL au capital de 141 250 €<br>';
    h+='<strong>SIREN :</strong> 925 398 968 — RCS Poitiers<br>';
    h+='<strong>Siège :</strong> 8 Avenue des Temps Modernes, 86360 Chasseneuil-du-Poitou<br>';
    h+='<strong>Gérant :</strong> Adrien Guyot<br>';
    h+='<strong>Chef de chantier :</strong> '+c.chef+'</p></div>';

    h+='<div class="doc-section"><h4>2. Description de l\'intervention</h4>';
    h+='<p><strong>Nature des travaux :</strong> '+c.type+'<br>';
    h+='<strong>Lieu :</strong> Chasseneuil-du-Poitou / Migné-Auxances (86)<br>';
    h+='<strong>Période :</strong> du '+fdate(c.dateDebut)+' au '+fdate(c.dateFin)+'<br>';
    h+='<strong>Effectif prévu :</strong> '+equipe.length+' personne(s)<br>';
    h+='<strong>Engins prévus :</strong> '+matos.length+' engin(s)</p></div>';

    h+='<div class="doc-section"><h4>3. Analyse des risques</h4>';
    h+='<table class="table"><thead><tr><th>Risque</th><th>Niveau</th><th>Mesure de prévention</th></tr></thead><tbody>';
    h+='<tr><td>Ensevelissement (fouilles)</td><td><span class="badge red">Élevé</span></td><td>Blindage systématique > 1,30m, talutage</td></tr>';
    h+='<tr><td>Chute de hauteur</td><td><span class="badge orange">Moyen</span></td><td>Garde-corps, harnais si > 3m</td></tr>';
    h+='<tr><td>Heurt par engin</td><td><span class="badge red">Élevé</span></td><td>Balisage zones, contact visuel, gilet HV</td></tr>';
    h+='<tr><td>Risque électrique (réseaux)</td><td><span class="badge orange">Moyen</span></td><td>DICT obligatoire, détection réseaux</td></tr>';
    h+='<tr><td>Bruit</td><td><span class="badge orange">Moyen</span></td><td>Protections auditives si > 85 dB</td></tr>';
    h+='<tr><td>Manutention mécanique</td><td><span class="badge orange">Moyen</span></td><td>CACES à jour, vérification élingues</td></tr>';
    h+='<tr><td>Circulation routière</td><td><span class="badge orange">Moyen</span></td><td>Signalisation temporaire, alternat</td></tr>';
    h+='</tbody></table></div>';

    h+='<div class="doc-section"><h4>4. Mesures de prévention communes</h4><ul>';
    h+='<li>Briefing sécurité quotidien par le chef de chantier</li>';
    h+='<li>Balisage et signalisation de toutes les zones de travail</li>';
    h+='<li>DICT réalisée avant tout terrassement</li>';
    h+='<li>Trousse de secours sur le chantier + SST désigné</li>';
    h+='<li>Vérification journalière des engins avant mise en route</li>';
    h+='<li>Interdiction de travail isolé</li></ul></div>';

    h+='<div class="doc-section"><h4>5. Moyens de secours</h4><ul>';
    h+='<li>Trousse de premiers secours sur chantier</li>';
    h+='<li>Extincteur ABC sur chaque engin</li>';
    h+='<li>Point de rassemblement identifié et communiqué</li>';
    h+='<li>SST : '+c.chef+'</li></ul></div>';

    h+='<div class="doc-stamp">Plan de prévention établi le '+today+'<br><br>';
    h+='Pour l\'EU ('+c.client+') : _________________________ <br><br>';
    h+='Pour l\'EE (GS BTP) : _________________________<br><br>';
    h+='GS BTP / Leanopia</div>';
    openModal('Plan de prévention — '+c.nom, h);
}

function openPPSPS(c, equipe, matos) {
    var h='<span class="doc-badge">GS BTP — PPSPS (Plan Particulier de Sécurité et de Protection de la Santé)</span>';
    h+='<div class="doc-section"><h4>1. Renseignements administratifs</h4>';
    h+='<p><strong>Entreprise :</strong> GS BTP — SARL<br>';
    h+='<strong>SIREN :</strong> 925 398 968<br>';
    h+='<strong>Gérant :</strong> Adrien Guyot<br>';
    h+='<strong>Adresse :</strong> 8 Avenue des Temps Modernes, 86360 Chasseneuil-du-Poitou<br>';
    h+='<strong>Tél :</strong> +33 7 81 22 10 44<br>';
    h+='<strong>Effectif entreprise :</strong> ~10 personnes</p></div>';

    h+='<div class="doc-section"><h4>2. Description du chantier</h4>';
    h+='<p><strong>Opération :</strong> '+c.nom+'<br>';
    h+='<strong>Maître d\'ouvrage :</strong> '+c.client+'<br>';
    h+='<strong>Nature :</strong> '+c.type+'<br>';
    h+='<strong>Durée :</strong> '+fdate(c.dateDebut)+' au '+fdate(c.dateFin)+'<br>';
    h+='<strong>Montant :</strong> '+fmt(c.montantHT)+' HT</p></div>';

    h+='<div class="doc-section"><h4>3. Organisation des secours</h4>';
    h+='<p>Identique au Plan de Prévention. SST désigné : '+c.chef+'<br>';
    h+='Point d\'eau le plus proche identifié. Accès pompiers dégagé en permanence.</p></div>';

    h+='<div class="doc-section"><h4>4. Mesures spécifiques au chantier</h4><ul>';
    h+='<li>Installation de chantier : base vie avec sanitaires et vestiaires</li>';
    h+='<li>Stockage matériaux : zone dédiée et balisée</li>';
    h+='<li>Gestion des déchets : tri sélectif (bois, ferraille, gravats, DIB)</li>';
    h+='<li>Protection du voisinage : palissades, arrosage anti-poussière</li>';
    h+='<li>Horaires : 7h30–17h00 du lundi au vendredi</li></ul></div>';

    h+='<div class="doc-section"><h4>5. Matériel utilisé</h4><table class="table"><thead><tr><th>Engin</th><th>Vérification</th></tr></thead><tbody>';
    matos.forEach(function(m){
        h+='<tr><td>'+m.nom+' ('+m.immat+')</td><td>'+(m.ctExpire?'<span class="badge red">CT à renouveler</span>':'<span class="badge green">OK</span>')+'</td></tr>';
    });
    h+='</tbody></table></div>';

    h+='<div class="doc-stamp">PPSPS établi le '+today+' — GS BTP<br>';
    h+='Diffusion : Maître d\'ouvrage, Coordonnateur SPS, Inspection du travail<br><br>';
    h+='Signature : _________________________</div>';
    openModal('PPSPS — '+c.nom, h);
}

// ===== RENTABILITE =====
(function(){
    var totalCA=0, totalCouts=0;
    RENTABILITE.forEach(function(r){ var c=ch(r.id); totalCA+=c.montantHT; totalCouts+=(r.mo+r.interim+r.mater+r.loc) });
    var totalMarge=totalCA-totalCouts;
    var pct=((totalMarge/totalCA)*100).toFixed(1);
    document.getElementById('renta-kpis').innerHTML=
        '<div class="kpi-card"><div class="kpi-value">'+fmt(totalCA)+'</div><div class="kpi-label">CA en cours</div></div>'+
        '<div class="kpi-card"><div class="kpi-value">'+fmt(totalCouts)+'</div><div class="kpi-label">Coûts engagés</div></div>'+
        '<div class="kpi-card"><div class="kpi-value">'+fmt(totalMarge)+'</div><div class="kpi-label">Marge brute</div></div>'+
        '<div class="kpi-card"><div class="kpi-value">'+pct+'%</div><div class="kpi-label">Taux de marge</div><div class="kpi-trend up">Objectif : 22%</div></div>';

    var tbody=document.getElementById('renta-body');
    var html='';
    RENTABILITE.forEach(function(r){
        var c=ch(r.id);
        var tot=r.mo+r.interim+r.mater+r.loc;
        var marge=c.montantHT-tot;
        var p=((marge/c.montantHT)*100).toFixed(1);
        var cls=p>=20?'renta-pos':(p>=10?'':'renta-neg');
        html+='<tr style="cursor:pointer" onclick="openRentaDetail(\''+r.id+'\')">';
        html+='<td><strong>'+c.nom+'</strong></td><td>'+c.client+'</td>';
        html+='<td>'+fmt(c.montantHT)+'</td><td>'+fmt(r.mo)+'</td><td>'+fmt(r.interim)+'</td>';
        html+='<td>'+fmt(r.mater)+'</td><td>'+fmt(r.loc)+'</td><td><strong>'+fmt(tot)+'</strong></td>';
        html+='<td class="'+cls+'"><strong>'+fmt(marge)+'</strong></td>';
        html+='<td class="'+cls+'"><strong>'+p+'%</strong></td></tr>';
    });
    tbody.innerHTML=html;
})();

function openRentaDetail(id) {
    var c=ch(id);
    var r=RENTABILITE.find(function(x){return x.id===id});
    var tot=r.mo+r.interim+r.mater+r.loc;
    var marge=c.montantHT-tot;
    var pct=((marge/c.montantHT)*100).toFixed(1);
    var equipe=EMPLOYES.filter(function(e){return e.chantier===id});
    var matos=MATERIEL.filter(function(m){return m.affect===id});

    var h='<div class="doc-section"><h4>Informations chantier</h4>';
    h+='<p><strong>Client :</strong> '+c.client+'<br><strong>Type :</strong> '+c.type+'<br>';
    h+='<strong>Période :</strong> '+fdate(c.dateDebut)+' — '+fdate(c.dateFin)+'<br>';
    h+='<strong>Avancement :</strong> '+c.avancement+'%</p></div>';

    h+='<div class="doc-section"><h4>Décomposition des coûts</h4>';
    h+='<table class="table"><tbody>';
    h+='<tr><td>Main d\'œuvre (salariés)</td><td style="text-align:right"><strong>'+fmt(r.mo)+'</strong></td><td style="text-align:right;color:var(--text-muted)">'+((r.mo/tot)*100).toFixed(0)+'%</td></tr>';
    h+='<tr><td>Intérim</td><td style="text-align:right"><strong>'+fmt(r.interim)+'</strong></td><td style="text-align:right;color:var(--text-muted)">'+((r.interim/tot)*100).toFixed(0)+'%</td></tr>';
    h+='<tr><td>Matériaux / Fournitures</td><td style="text-align:right"><strong>'+fmt(r.mater)+'</strong></td><td style="text-align:right;color:var(--text-muted)">'+((r.mater/tot)*100).toFixed(0)+'%</td></tr>';
    h+='<tr><td>Location matériel</td><td style="text-align:right"><strong>'+fmt(r.loc)+'</strong></td><td style="text-align:right;color:var(--text-muted)">'+((r.loc/tot)*100).toFixed(0)+'%</td></tr>';
    h+='<tr style="border-top:2px solid var(--accent)"><td><strong>Total coûts</strong></td><td style="text-align:right"><strong>'+fmt(tot)+'</strong></td><td></td></tr>';
    h+='</tbody></table></div>';

    h+='<div class="doc-section"><h4>Résultat</h4>';
    var cls=pct>=20?'renta-pos':'renta-neg';
    h+='<p><strong>Montant marché :</strong> '+fmt(c.montantHT)+'<br>';
    h+='<strong>Total coûts :</strong> '+fmt(tot)+'<br>';
    h+='<strong class="'+cls+'" style="font-size:1.2rem">Marge : '+fmt(marge)+' ('+pct+'%)</strong></p></div>';

    h+='<div class="doc-section"><h4>Équipe ('+equipe.length+')</h4><ul>';
    equipe.forEach(function(e){h+='<li>'+e.nom+' — '+(e.role||e.type)+'</li>'});
    if(equipe.length===0) h+='<li style="color:var(--text-muted)">Aucun personnel affecté</li>';
    h+='</ul></div>';

    h+='<div class="doc-section"><h4>Matériel ('+matos.length+')</h4><ul>';
    matos.forEach(function(m){h+='<li>'+m.nom+' — '+m.statut+'</li>'});
    if(matos.length===0) h+='<li style="color:var(--text-muted)">Aucun matériel affecté</li>';
    h+='</ul></div>';

    openModal('Rentabilité — '+c.nom, h);
}
