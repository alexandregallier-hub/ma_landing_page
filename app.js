// ===== GS BTP — APPLICATION PRINCIPALE =====

// --- Navigation ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const pageId = item.dataset.page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + pageId).classList.add('active');
    });
});

// --- Date courante ---
const now = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('current-date').textContent = now.toLocaleDateString('fr-FR', options);

// --- Toast ---
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- Helpers ---
function getChantierNom(id) {
    const c = CHANTIERS.find(ch => ch.id === id);
    return c ? c.nom : id;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMoney(n) {
    return n.toLocaleString('fr-FR') + ' €';
}

// ===== PHOTOS MODULE =====
function renderPhotos() {
    const timeline = document.getElementById('photo-timeline');
    const filter = document.getElementById('photo-chantier-filter').value;

    const filtered = filter === 'all' ? PHOTOS : PHOTOS.filter(p => p.chantier === filter);

    // Group by date
    const grouped = {};
    filtered.forEach(p => {
        if (!grouped[p.date]) grouped[p.date] = [];
        grouped[p.date].push(p);
    });

    let html = '';
    Object.keys(grouped).sort().reverse().forEach(date => {
        const photos = grouped[date];
        html += `<div class="photo-day-group">
            <h4>📅 ${formatDate(date)} — ${photos.length} photo(s)</h4>
            <div class="photo-grid">`;

        photos.forEach(p => {
            html += `<div class="photo-card">
                <div class="photo-placeholder">${p.icon}</div>
                <div class="photo-info">
                    <div class="photo-chantier">${getChantierNom(p.chantier)}</div>
                    <div class="photo-meta">${p.description}</div>
                    <div class="photo-meta">🕐 ${p.heure} · 📍 ${p.gps} · 👷 ${p.auteur}</div>
                    <span class="photo-tag ${p.critical ? 'critical' : ''}">${p.tag}</span>
                </div>
            </div>`;
        });

        html += `</div></div>`;
    });

    timeline.innerHTML = html;
}

document.getElementById('photo-chantier-filter').addEventListener('change', renderPhotos);

function simulatePhotoUpload() {
    showToast('📸 3 photos ajoutées — horodatage et géolocalisation automatiques');
}

// ===== POINTAGE MODULE =====
function renderPointage() {
    const tbody = document.getElementById('pointage-body');
    let html = '';

    EMPLOYES.forEach(e => {
        const total = e.heures.reduce((a, b) => a + b, 0);
        const typeLabel = e.type === 'Intérimaire'
            ? `<span class="badge orange">${e.agence}</span>`
            : `<span class="badge blue">Salarié</span>`;

        html += `<tr>
            <td><strong>${e.nom}</strong></td>
            <td>${typeLabel}</td>
            <td style="font-size:0.8rem;">${getChantierNom(e.chantier)}</td>
            ${e.heures.map(h => `<td>${h || '—'}</td>`).join('')}
            <td><strong>${total}h</strong></td>
            <td>${e.nuit ? e.nuit + 'h' : '—'}</td>
            <td>${e.paniers}</td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

function exportPointage() {
    showToast('📥 Export généré — fiches intérim prêtes pour Adecco, Manpower, Actual');
}

function exportAgency(agency) {
    const names = { adecco: 'Adecco Poitiers', manpower: 'Manpower Chasseneuil', actual: 'Actual Poitiers' };
    showToast(`📄 Fiche ${names[agency]} générée et prête à envoyer`);
}

// ===== MATERIEL MODULE =====
function renderMateriel() {
    // Alerts
    const alertsDiv = document.getElementById('materiel-alerts');
    const alertItems = MATERIEL.filter(m => m.ctExpire || m.statut === 'En panne');
    let alertHtml = '';

    alertItems.forEach(m => {
        if (m.ctExpire) {
            alertHtml += `<div class="materiel-alert-card critical">
                <strong>🔴 CT expiré — ${m.nom}</strong>
                <small>Immat: ${m.immat} — Expiré le ${formatDateShort(m.prochainCT)}</small>
            </div>`;
        }
        if (m.statut === 'En panne') {
            alertHtml += `<div class="materiel-alert-card warning">
                <strong>🟠 En panne — ${m.nom}</strong>
                <small>Dernière maintenance : ${formatDateShort(m.derniereMaint)}</small>
            </div>`;
        }
    });

    // CT bientôt
    const soon = MATERIEL.filter(m => {
        if (m.prochainCT === '—' || m.ctExpire) return false;
        const ct = new Date(m.prochainCT);
        const diff = (ct - now) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
    });

    soon.forEach(m => {
        const ct = new Date(m.prochainCT);
        const days = Math.ceil((ct - now) / (1000 * 60 * 60 * 24));
        alertHtml += `<div class="materiel-alert-card warning">
            <strong>🟠 CT dans ${days} jours — ${m.nom}</strong>
            <small>Échéance : ${formatDateShort(m.prochainCT)}</small>
        </div>`;
    });

    alertsDiv.innerHTML = alertHtml;

    // Table
    const tbody = document.getElementById('materiel-body');
    let html = '';

    MATERIEL.forEach(m => {
        let statutBadge;
        if (m.ctExpire) statutBadge = '<span class="badge red">CT expiré</span>';
        else if (m.statut === 'En panne') statutBadge = '<span class="badge orange">En panne</span>';
        else if (m.statut === 'Disponible') statutBadge = '<span class="badge gray">Disponible</span>';
        else statutBadge = '<span class="badge green">En service</span>';

        html += `<tr>
            <td><strong>${m.nom}</strong></td>
            <td>${m.immat}</td>
            <td style="font-size:0.8rem;">${getChantierNom(m.affectation)}</td>
            <td>${statutBadge}</td>
            <td>${m.prochainCT === '—' ? '—' : formatDateShort(m.prochainCT)}</td>
            <td>${formatDateShort(m.derniereMaint)}</td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

function formatDateShort(dateStr) {
    if (!dateStr || dateStr === '—') return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
}

// ===== DOCUMENTS MODULE =====
function generateDocs() {
    const select = document.getElementById('doc-chantier-select');
    if (!select.value) {
        showToast('⚠️ Sélectionnez un chantier');
        return;
    }

    const chantier = CHANTIERS.find(c => c.id === select.value);
    const result = document.getElementById('doc-result');
    const nameSpan = document.getElementById('doc-result-chantier');
    const docList = document.getElementById('doc-list');

    nameSpan.textContent = chantier.nom;

    let html = '';
    DOCS_TEMPLATES.forEach(doc => {
        html += `<div class="doc-item">
            <span class="doc-item-icon">${doc.icon}</span>
            <div>
                <div class="doc-item-name">${doc.nom}</div>
                <div class="doc-item-size">Généré automatiquement — ${doc.taille}</div>
            </div>
        </div>`;
    });

    docList.innerHTML = html;
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth' });

    showToast(`⚡ Dossier chantier "${chantier.nom}" généré en 2 secondes`);
}

// ===== RENTABILITE MODULE =====
function renderRentabilite() {
    const tbody = document.getElementById('renta-body');
    let html = '';

    RENTABILITE.forEach(r => {
        const chantier = CHANTIERS.find(c => c.id === r.chantierId);
        const totalCouts = r.mainOeuvre + r.interim + r.materiaux + r.location;
        const marge = r.montantHT - totalCouts;
        const pct = ((marge / r.montantHT) * 100).toFixed(1);
        const margeClass = pct >= 20 ? 'renta-positive' : (pct >= 10 ? '' : 'renta-negative');

        html += `<tr>
            <td><strong>${chantier.nom}</strong></td>
            <td>${chantier.client}</td>
            <td>${formatMoney(r.montantHT)}</td>
            <td>${formatMoney(r.mainOeuvre)}</td>
            <td>${formatMoney(r.interim)}</td>
            <td>${formatMoney(r.materiaux)}</td>
            <td>${formatMoney(r.location)}</td>
            <td><strong>${formatMoney(totalCouts)}</strong></td>
            <td class="${margeClass}"><strong>${formatMoney(marge)}</strong></td>
            <td class="${margeClass}"><strong>${pct}%</strong></td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

// ===== INIT =====
renderPhotos();
renderPointage();
renderMateriel();
renderRentabilite();
