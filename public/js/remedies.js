// public/js/remedies.js - Remedies catalog, clinical detail modal & Herb-Drug interaction checker

let allRemedies = [];
let selectedRemedy = null;

async function loadRemedies(filterCategory = '', searchQuery = '') {
  const grid = document.getElementById('remediesGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-muted);">Loading remedies database...</div>';

  try {
    let url = '/api/remedies?';
    if (filterCategory && filterCategory !== 'all') url += `category=${encodeURIComponent(filterCategory)}&`;
    if (searchQuery) url += `q=${encodeURIComponent(searchQuery)}&`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: #fff; border-radius: 12px; border: 1px solid var(--color-border);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <h3>No matching remedies found</h3>
          <p style="color: var(--color-text-muted);">Try a different search term or clear filters to view all remedies.</p>
        </div>
      `;
      return;
    }

    allRemedies = data.data;
    renderRemediesGrid(allRemedies);
  } catch (err) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--color-emergency);">Error loading remedies: ${err.message}</div>`;
  }
}

function renderRemediesGrid(remedies) {
  const grid = document.getElementById('remediesGrid');
  if (!grid) return;

  grid.innerHTML = remedies.map(r => {
    let badgeClass = 'badge-evidence-prelim';
    if (r.evidence_level.toLowerCase().includes('high')) badgeClass = 'badge-evidence-high';
    else if (r.evidence_level.toLowerCase().includes('moderate')) badgeClass = 'badge-evidence-mod';

    const displayName = currentLanguage === 'hi' && r.hindi_name ? r.hindi_name : (currentLanguage === 'mr' && r.marathi_name ? r.marathi_name : r.name);

    return `
      <div class="remedy-card" data-id="${r.id}">
        <div class="remedy-card-header">
          <div>
            <span class="badge ${badgeClass}">${r.evidence_level}</span>
            <div style="margin-top: 6px;">
              <h3>${displayName}</h3>
              <div class="remedy-sanskrit">${r.sanskrit_name} (${r.botanical_name})</div>
            </div>
          </div>
          <span class="remedy-avatar">${r.image_emoji || '🌿'}</span>
        </div>

        <div class="remedy-uses">
          <strong>Common uses:</strong> ${r.common_uses}
        </div>

        <div style="font-size: 0.8rem; color: var(--color-primary); background: var(--color-accent-subtle); padding: 6px 10px; border-radius: 6px; margin-bottom: 12px;">
          ⚖️ <strong>Dosha Karma:</strong> ${r.dosha_effect}
        </div>

        <div class="remedy-card-footer">
          <button class="btn btn-sm btn-outline" onclick="openRemedyModal('${r.id}')">
            📖 View Full Profile
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="listenToRemedy('${r.id}')" title="Listen aloud">
            🔊 Listen
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function openRemedyModal(remedyId) {
  const modal = document.getElementById('remedyDetailModal');
  const body = document.getElementById('remedyModalBody');
  const title = document.getElementById('remedyModalTitle');
  if (!modal || !body) return;

  body.innerHTML = '<div style="padding: 30px; text-align: center;">Loading remedy monograph...</div>';
  modal.classList.add('active');

  try {
    const res = await fetch(`/api/remedies/${remedyId}`);
    const data = await res.json();
    if (!data.success) {
      body.innerHTML = '<div style="color: var(--color-emergency);">Remedy details not found.</div>';
      return;
    }

    const r = data.data;
    selectedRemedy = r;
    const displayName = currentLanguage === 'hi' && r.hindi_name ? r.hindi_name : (currentLanguage === 'mr' && r.marathi_name ? r.marathi_name : r.name);
    title.textContent = `${displayName} (${r.sanskrit_name})`;

    body.innerHTML = `
      <div class="audio-narration-bar">
        <button class="btn-narrate" onclick="readSelectedRemedyAloud()">
          🔊 <span class="narrate-text">Read Summary Aloud</span>
        </button>
        <span style="font-size: 0.775rem; color: var(--color-text-light);">• Voice reader for ease of access</span>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;">
        <span class="badge badge-evidence-high">${r.evidence_level}</span>
        <span class="badge badge-dosha">${r.dosha_effect}</span>
        <span class="badge" style="background: #f1f5f9; color: var(--color-text-muted);">${r.category}</span>
      </div>

      <div class="monograph-section">
        <h4>🌿 Botanical & Classical Identity</h4>
        <p><strong>Botanical Name:</strong> <em>${r.botanical_name}</em> | <strong>Classical Sanskrit Name:</strong> ${r.sanskrit_name}</p>
        <p><strong>Common Indications:</strong> ${r.common_uses}</p>
      </div>

      <div class="monograph-section">
        <h4>💡 Why It Is Suggested in Ayurveda</h4>
        <p>${r.why_suggested}</p>
        <p style="margin-top: 6px;"><strong>Potential Benefits:</strong> ${r.potential_benefits}</p>
      </div>

      <div class="monograph-section" style="background: #f0fdf4; padding: 14px; border-radius: 8px; border-left: 4px solid var(--color-success);">
        <h4 style="color: #166534;">🔬 Scientific Evidence & Modern Understanding</h4>
        <p style="color: #14532d;">${r.scientific_evidence}</p>
        <div style="margin-top: 8px; font-size: 0.85rem; color: #166534;">
          <strong>⚠️ Scientific Limitations:</strong> ${r.scientific_limitations}
        </div>
      </div>

      <div class="monograph-section">
        <h4>🍵 Safe Usage, Preparation & Dosage</h4>
        <p>${r.safe_usage}</p>
      </div>

      <div class="monograph-section caution-highlight">
        <h4 style="color: #c2410c;">⚠️ Safety, Contraindications & Who Should Avoid</h4>
        <p><strong>Who Should Avoid:</strong> ${r.who_should_avoid}</p>
        <p style="margin-top: 6px;"><strong>Possible Side Effects:</strong> ${r.possible_side_effects}</p>
        <p style="margin-top: 6px;"><strong>Prescription Drug Interactions:</strong> ${r.herb_interactions}</p>
      </div>

      <div class="monograph-section" style="background: #fef2f2; padding: 14px; border-radius: 8px; border-left: 4px solid var(--color-emergency);">
        <h4 style="color: var(--color-emergency);">🚨 When to Consult a Doctor Immediately</h4>
        <p style="color: #991b1b;">${r.when_to_consult_doctor}</p>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="color: var(--color-emergency);">Failed to load monograph: ${err.message}</div>`;
  }
}

function closeRemedyModal() {
  stopSpeaking();
  const modal = document.getElementById('remedyDetailModal');
  if (modal) modal.classList.remove('active');
}

function readSelectedRemedyAloud() {
  if (!selectedRemedy) return;
  const text = `${selectedRemedy.name}. Classical Sanskrit name: ${selectedRemedy.sanskrit_name}. Why it is suggested: ${selectedRemedy.why_suggested}. Safe usage: ${selectedRemedy.safe_usage}. Precautions: ${selectedRemedy.who_should_avoid}. When to consult a doctor: ${selectedRemedy.when_to_consult_doctor}`;
  speakText(text, currentLanguage);
}

function listenToRemedy(remedyId) {
  const r = allRemedies.find(item => item.id === remedyId);
  if (!r) return;
  const text = `${r.name}. Commonly used for: ${r.common_uses}. Safe usage: ${r.safe_usage}. Cautions: ${r.who_should_avoid}`;
  speakText(text, currentLanguage);
}

// Herb-Drug Interaction Checker Form Handler
async function checkHerbDrugInteraction() {
  const herbInput = document.getElementById('interactionHerbInput');
  const drugInput = document.getElementById('interactionDrugInput');
  const resultBox = document.getElementById('interactionResultBox');
  if (!herbInput || !drugInput || !resultBox) return;

  const herb = herbInput.value.trim();
  const drug = drugInput.value.trim();

  if (!herb || !drug) {
    alert('Please enter or select both an Ayurvedic herb and a modern medicine.');
    return;
  }

  resultBox.style.display = 'block';
  resultBox.innerHTML = '<div style="padding: 16px; text-align: center;">Analyzing pharmacological interaction database...</div>';

  try {
    const res = await fetch('/api/check-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ herb, drug })
    });
    const data = await res.json();

    if (data.found && data.interactions.length > 0) {
      resultBox.innerHTML = `
        <div style="background: #fff1f2; border: 2px solid #f43f5e; border-radius: 10px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; color: #be123c; font-weight: 800; font-size: 1.1rem; margin-bottom: 8px;">
            ⚠️ CAUTION: Clinical Herb-Drug Interaction Detected
          </div>
          ${data.interactions.map(item => `
            <div style="margin-top: 10px; border-top: 1px solid #fecdd3; padding-top: 10px;">
              <p><strong>Herb:</strong> ${item.herb_name} | <strong>Medicine Class:</strong> ${item.drug_class}</p>
              <p><strong>Examples:</strong> ${item.drug_examples}</p>
              <p style="color: #9f1239; margin-top: 4px;"><strong>Severity Level:</strong> <span class="badge badge-danger">${item.severity}</span></p>
              <p style="margin-top: 4px;"><strong>Biological Mechanism:</strong> ${item.interaction_mechanism}</p>
              <div style="background: #ffffff; padding: 10px; border-radius: 6px; margin-top: 8px; border: 1px solid #fda4af;">
                <strong>🩺 Clinical Recommendation:</strong> ${item.clinical_recommendation}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 10px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 800; font-size: 1.05rem; margin-bottom: 6px;">
            ✅ No High-Risk Documented Interaction in Current Database
          </div>
          <p style="color: #166534; font-size: 0.9rem;">
            No direct severe conflict recorded between <strong>${herb}</strong> and <strong>${drug}</strong>. However, individual metabolism varies. Always maintain a gap of at least 2 hours between herbal remedies and allopathic tablets, and keep your doctor informed.
          </p>
        </div>
      `;
    }
  } catch (err) {
    resultBox.innerHTML = `<div style="color: var(--color-emergency);">Error checking interaction: ${err.message}</div>`;
  }
}

