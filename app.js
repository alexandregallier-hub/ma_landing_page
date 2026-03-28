// ===== HELPERS =====
function ch(id) { return CHANTIERS.find(function(c){return c.id===id}) }
function chNom(id) { var c=ch(id); return c?c.nom:id }
function fmt(n) { return n.toLocaleString('fr-FR')+' €' }
function fdate(s) { if(!s)return '—'; var d=new Date(s); return d.toLocaleDateString('fr-FR') }
function fldate(s) { var d=new Date(s); return d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) }
var today = new Date().toLocaleDateString('fr-FR');

// ===== TOAST =====
function showToast(msg) {
    var t=document.getElementById('toast');
    t.textContent=msg; t.classList.add('show');
    setTimeout(function(){t.classList.remove('show')},3000);
}

// ===== MODAL =====
function openModal(title, html) {
    document.getElementById('modal-title').textContent=title;
    document.getElementById('modal-body').innerHTML=html;
    document.getElementById('modal').classList.add('show');
}
function closeModal() { document.getElementById('modal').classList.remove('show') }
function printModal() { window.print() }

// ===== NAVIGATION =====
document.querySelectorAll('.nav-item').forEach(function(item){
    item.addEventListener('click',function(){
        document.querySelectorAll('.nav-item').forEach(function(i){i.classList.remove('active')});
        item.classList.add('active');
        document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
        document.getElementById('page-'+item.dataset.page).classList.add('active');
    });
});

// ===== DATE =====
document.getElementById('current-date').textContent = new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

// ===== DASHBOARD =====
(function(){
    var html='<table class="table"><thead><tr><th>Chantier</th><th>Client</th><th>Avancement</th><th>Statut</th></tr></thead><tbody>';
    CHANTIERS.forEach(function(c){
        var badge = c.statut==='Finitions'?'blue': c.statut==='Démarrage'?'orange':'green';
        html+='<tr><td><strong>'+c.nom+'</strong></td><td>'+c.client+'</td>';
        html+='<td><div class="progress-bar"><div class="progress-fill" style="width:'+c.avancement+'%"></div></div></td>';
        html+='<td><span class="badge '+badge+'">'+c.statut+'</span></td></tr>';
    });
    html+='</tbody></table>';
    document.getElementById('dashboard-chantiers').innerHTML=html;
})();

// ===== PHOTOS =====
(function(){
    // Populate filter
    var sel=document.getElementById('photo-filter');
    CHANTIERS.forEach(function(c){ sel.innerHTML+='<option value="'+c.id+'">'+c.nom+'</option>' });
    sel.addEventListener('change', renderPhotos);
})();

function renderPhotos() {
    var f=document.getElementById('photo-filter').value;
    var list = f==='all'? PHOTOS : PHOTOS.filter(function(p){return p.chantier===f});
    var grouped={};
    list.forEach(function(p){ if(!grouped[p.date])grouped[p.date]=[]; grouped[p.date].push(p) });
    var html='';
    Object.keys(grouped).sort().reverse().forEach(function(date){
        var photos=grouped[date];
        html+='<div class="photo-day"><h4>📅 '+fldate(date)+' — '+photos.length+' photo(s)</h4><div class="photo-grid">';
        photos.forEach(function(p){
            html+='<div class="photo-card" onclick="openPhotoDetail(\''+p.date+'\',\''+p.heure+'\')">';
            html+='<div class="photo-placeholder">'+p.icon+'</div><div class="photo-info">';
            html+='<div class="photo-chantier">'+chNom(p.chantier)+'</div>';
            html+='<div class="photo-meta">'+p.desc+'</div>';
            html+='<div class="photo-meta">🕐 '+p.heure+' · 📍 '+p.gps+' · 👷 '+p.auteur+'</div>';
            html+='<span class="photo-tag'+(p.critical?' critical':'')+'">'+p.tag+'</span>';
            html+='</div></div>';
        });
        html+='</div></div>';
    });
    document.getElementById('photo-timeline').innerHTML=html;
}
renderPhotos();

function openPhotoDetail(date,heure) {
    var p=PHOTOS.find(function(x){return x.date===date&&x.heure===heure});
    if(!p) return;
    var c=ch(p.chantier);
    var html='<div style="text-align:center;font-size:6rem;padding:2rem;background:var(--primary-light);border-radius:var(--radius);margin-bottom:1rem">'+p.icon+'</div>';
    html+='<div class="doc-section"><h4>Informations photo</h4>';
    html+='<p><strong>Chantier :</strong> '+c.nom+'<br>';
    html+='<strong>Client :</strong> '+c.client+'<br>';
    html+='<strong>Description :</strong> '+p.desc+'<br>';
    html+='<strong>Date :</strong> '+fdate(p.date)+' à '+p.heure+'<br>';
    html+='<strong>GPS :</strong> '+p.gps+'<br>';
    html+='<strong>Prise par :</strong> '+p.auteur+'</p></div>';
    if(p.critical) html+='<div class="gain-banner" style="border-color:var(--danger);color:var(--danger);background:rgba(239,68,68,.1)">🔴 <strong>Photo contractuelle</strong> — Preuve horodatée exigée par '+c.client+' avant coulage béton.</div>';
    openModal(p.desc, html);
}

function simulatePhotoUpload() {
    var newPhoto = { date:'2026-03-28', heure: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), chantier:'massif-t42', desc:'Photo ajoutée — Implantation massif', tag:'Implantation', critical:false, icon:'📐', auteur:'Quentin G.', gps:'46.6789, 0.3512' };
    PHOTOS.unshift(newPhoto);
    renderPhotos();
    showToast('📸 Photo ajoutée avec horodatage et géolocalisation automatiques');
}

// ===== POINTAGE =====
function renderPointage() {
    var tbody=document.getElementById('pointage-body');
    var totalH=0, totalNuit=0, totalPaniers=0, totalWE=0, totalJour=0;
    var html='';
    EMPLOYES.forEach(function(e,i){
        var tot=e.heures.reduce(function(a,b){return a+b},0);
        var we=e.heures[5]||0;
        totalH+=tot; totalNuit+=e.nuit; totalPaniers+=e.paniers; totalWE+=we; totalJour+=(tot-we);
        var lbl = e.type==='Intérimaire'?'<span class="badge orange">'+e.agence+'</span>':'<span class="badge blue">Salarié</span>';
        html+='<tr><td><strong>'+e.nom+'</strong></td><td>'+lbl+'</td>';
        html+='<td style="font-size:.8rem">'+chNom(e.chantier)+'</td>';
        for(var j=0;j<6;j++){
            html+='<td><input type="number" min="0" max="12" value="'+e.heures[j]+'" onchange="updateHeure('+i+','+j+',this.value)"></td>';
        }
        html+='<td><strong>'+tot+'h</strong></td>';
        html+='<td>'+(e.nuit?e.nuit+'h':'—')+'</td>';
        html+='<td>'+e.paniers+'</td></tr>';
    });
    tbody.innerHTML=html;
    // Totaux
    var depl = EMPLOYES.filter(function(e){return e.deplacement}).length;
    document.getElementById('pointage-totaux').innerHTML=
        '<div class="summary-item"><span class="summary-value">'+totalH+'h</span><span class="summary-label">Total semaine</span></div>'+
        '<div class="summary-item"><span class="summary-value">'+totalJour+'h</span><span class="summary-label">Heures jour</span></div>'+
        '<div class="summary-item"><span class="summary-value">'+totalNuit+'h</span><span class="summary-label">Heures nuit</span></div>'+
        '<div class="summary-item"><span class="summary-value">'+totalWE+'h</span><span class="summary-label">Heures WE/sam</span></div>'+
        '<div class="summary-item"><span class="summary-value">'+totalPaniers+'</span><span class="summary-label">Paniers repas</span></div>'+
        '<div class="summary-item"><span class="summary-value">'+(depl*248)+'€</span><span class="summary-label">Indem. déplacement</span></div>';
    // Export grid
    var agences={};
    EMPLOYES.forEach(function(e){ if(e.agence){ if(!agences[e.agence])agences[e.agence]={count:0,h:0}; agences[e.agence].count++; agences[e.agence].h+=e.heures.reduce(function(a,b){return a+b},0)} });
    var ehtml='';
    Object.keys(agences).forEach(function(ag){
        ehtml+='<div class="export-item"><div class="export-agency">'+ag+'</div>';
        ehtml+='<div class="export-detail">'+agences[ag].count+' intérimaires — '+agences[ag].h+'h</div>';
        ehtml+='<button class="btn btn-small" onclick="exportAgency(\''+ag+'\')">Générer fiche</button></div>';
    });
    document.getElementById('export-grid').innerHTML=ehtml;
}

function updateHeure(empIdx, jourIdx, val) {
    EMPLOYES[empIdx].heures[jourIdx] = parseInt(val)||0;
    renderPointage();
}

function exportPointage() {
    showToast('📥 Export généré — fiches intérim prêtes pour envoi');
}

function exportAgency(ag) {
    var emps = EMPLOYES.filter(function(e){return e.agence===ag});
    var html='<span class="doc-badge">FICHE HEURES INTÉRIM — EXPORT AUTOMATIQUE</span>';
    html+='<div class="doc-section"><h4>'+ag+'</h4>';
    html+='<p><strong>Entreprise :</strong> GS BTP — SARL<br><strong>Semaine :</strong> 13 (24–28 mars 2026)<br><strong>Contact :</strong> Nathanaëlle G. — contact@gsbtp.fr</p></div>';
    html+='<div class="doc-section"><h4>Détail des heures</h4><table class="table"><thead><tr><th>Intérimaire</th><th>Chantier</th><th>Lun</th><th>Mar</th><th>Mer</th><th>Jeu</th><th>Ven</th><th>Sam</th><th>Total</th><th>Nuit</th><th>Paniers</th></tr></thead><tbody>';
    var totalGlobal=0;
    emps.forEach(function(e){
        var t=e.heures.reduce(function(a,b){return a+b},0); totalGlobal+=t;
        html+='<tr><td><strong>'+e.nom+'</strong></td><td style="font-size:.8rem">'+chNom(e.chantier)+'</td>';
        e.heures.forEach(function(h){html+='<td>'+h+'</td>'});
        html+='<td><strong>'+t+'h</strong></td><td>'+(e.nuit?e.nuit+'h':'—')+'</td><td>'+e.paniers+'</td></tr>';
    });
    html+='</tbody></table></div>';
    html+='<div class="doc-section"><h4>Récapitulatif</h4><p><strong>Total heures :</strong> '+totalGlobal+'h<br><strong>Nombre d\'intérimaires :</strong> '+emps.length+'</p></div>';
    html+='<div class="doc-stamp">📄 Fiche générée le '+today+' — GS BTP / Leanopia</div>';
    openModal('Fiche heures — '+ag, html);
    showToast('📄 Fiche '+ag+' générée');
}

renderPointage();
