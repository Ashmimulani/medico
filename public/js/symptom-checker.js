// public/js/symptom-checker.js - Multi-step interactive Ayurvedic & Medical Triage Wizard

let currentWizardStep = 1;
let selectedSymptomId = null;
let checkerState = {
  symptom_id: null,
  duration_days: 2,
  severity: 'mild',
  has_red_flags: false,
  red_flags_checked: [],
  patient_age: 30
};

const RED_FLAGS_LIST = [
  { id: 'chest_pain', label: 'Crushing or radiating chest pain / pressure' },
  { id: 'shortness_breath', label: 'Severe difficulty breathing or rapid wheezing' },
  { id: 'blood', label: 'Coughing up blood or vomiting blood / black stools' },
  { id: 'high_fever', label: 'High fever (> 102°F) lasting more than 48-72 hours' },
  { id: 'neuro', label: 'Sudden weakness, facial drooping, confusion or speech difficulty' },
  { id: 'severe_pain', label: 'Acute unendurable abdominal pain with rigidity' }
];

async function initSymptomChecker() {
  currentWizardStep = 1;
  updateWizardUI();
  loadSymptomOptions();
  renderRedFlagsChecklist();
}

async function loadSymptomOptions() {
  const container = document.getElementById('symptomCardsGrid');
  if (!container) return;

  container.innerHTML = '<div style="padding: 20px; text-align: center;">Loading symptom options...</div>';

  try {
    const res = await fetch('/api/symptoms');
    const data = await res.json();
    if (!data.success) return;

    container.innerHTML = data.data.map(s => {
      const displayName = currentLanguage === 'hi' && s.hindi_name ? s.hindi_name : s.name;
      let icon = '🩺';
      if (s.id.includes('cough')) icon = '🫁';
      else if (s.id.includes('digestive')) icon = '🥣';
      else if (s.id.includes('joint')) icon = '🦴';
      else if (s.id.includes('stress')) icon = '🧠';
      else if (s.id.includes('fatigue')) icon = '⚡';

      return `
        <div class="symptom-select-card" onclick="selectSymptomCard('${s.id}')" id="symp-card-${s.id}">
          <span class="symptom-icon">${icon}</span>
          <div>
            <h4>${displayName}</h4>
            <p>${s.body_system}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-emergency);">Error loading symptoms: ${err.message}</div>`;
  }
}

function selectSymptomCard(id) {
  selectedSymptomId = id;
  checkerState.symptom_id = id;

  document.querySelectorAll('.symptom-select-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`symp-card-${id}`);
  if (card) card.classList.add('selected');

  const nextBtn = document.getElementById('step1NextBtn');
  if (nextBtn) nextBtn.disabled = false;
}

function renderRedFlagsChecklist() {
  const container = document.getElementById('redFlagsChecklist');
  if (!container) return;

  container.innerHTML = RED_FLAGS_LIST.map(f => `
    <label class="flag-check-item">
      <input type="checkbox" value="${f.id}" onchange="toggleRedFlag('${f.id}', this.checked)">
      <span>${f.label}</span>
    </label>
  `).join('');
}

function toggleRedFlag(id, checked) {
  if (checked) {
    if (!checkerState.red_flags_checked.includes(id)) {
      checkerState.red_flags_checked.push(id);
    }
  } else {
    checkerState.red_flags_checked = checkerState.red_flags_checked.filter(item => item !== id);
  }
  checkerState.has_red_flags = checkerState.red_flags_checked.length > 0;
}

function goToWizardStep(step) {
  currentWizardStep = step;
  updateWizardUI();
  window.scrollTo({ top: document.getElementById('symptomCheckerSection').offsetTop - 80, behavior: 'smooth' });
}

function updateWizardUI() {
  // Update step indicators
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`stepInd${i}`);
    const pane = document.getElementById(`wizardPane${i}`);
    if (ind) {
      ind.classList.remove('active', 'completed');
      if (i < currentWizardStep) ind.classList.add('completed');
      if (i === currentWizardStep) ind.classList.add('active');
    }
    if (pane) {
      pane.classList.remove('active');
      if (i === currentWizardStep) pane.classList.add('active');
    }
  }
}

async function submitSymptomEvaluation() {
  const durationInput = document.getElementById('symptomDurationSelect');
  const severityInput = document.querySelector('input[name="severityRadio"]:checked');
  const ageInput = document.getElementById('symptomAgeInput');
  const resultsContainer = document.getElementById('symptomResultsContent');

  if (durationInput) checkerState.duration_days = parseInt(durationInput.value, 10);
  if (severityInput) checkerState.severity = severityInput.value;
  if (ageInput) checkerState.patient_age = parseInt(ageInput.value, 10) || 30;

  goToWizardStep(4);
  resultsContainer.innerHTML = '<div style="padding: 40px; text-align: center;">Analyzing symptoms against Ayurvedic Tridosha and Medical Safety rules...</div>';

  try {
    const res = await fetch('/api/symptom-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkerState)
    });
    const result = await res.json();

    if (!result.success) {
      resultsContainer.innerHTML = `<div style="color: var(--color-emergency);">Evaluation error: ${result.error}</div>`;
      return;
    }

    renderTriageResults(result);
  } catch (err) {
    resultsContainer.innerHTML = `<div style="color: var(--color-emergency);">Server communication error: ${err.message}</div>`;
  }
}

function renderTriageResults(data) {
  const container = document.getElementById('symptomResultsContent');
  if (!container) return;

  // 1. EMERGENCY RESULT
  if (data.is_emergency) {
    container.innerHTML = `
      <div class="triage-result-banner emergency">
        <div style="font-size: 2.5rem; line-height: 1;">🚨</div>
        <div>
          <h3 style="font-size: 1.35rem; color: #991b1b; margin-bottom: 6px;">${data.alert_title}</h3>
          <p style="font-size: 1rem; line-height: 1.5; color: #7f1d1d;">${data.message}</p>
        </div>
      </div>

      <div style="background: #ffffff; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h4 style="color: #b91c1c; font-size: 1.1rem; margin-bottom: 12px;">Immediate Emergency Action Steps:</h4>
        <ul style="padding-left: 20px; color: #7f1d1d; line-height: 1.8; margin-bottom: 20px;">
          ${data.action_items.map(a => `<li><strong>${a}</strong></li>`).join('')}
        </ul>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="tel:108" class="btn btn-secondary" style="background: var(--color-emergency); font-size: 1.05rem;">
            📞 Call Ambulance (108)
          </a>
          <a href="tel:112" class="btn btn-outline" style="border-color: var(--color-emergency); color: var(--color-emergency); font-size: 1.05rem;">
            📞 National Emergency (112)
          </a>
        </div>
      </div>

      <div class="medical-disclaimer-card" style="border-left-color: var(--color-emergency);">
        <div class="disclaimer-icon">⚠️</div>
        <p><strong>Strict Warning:</strong> Never use Ayurvedic home remedies or self-medication during acute medical crises such as suspected heart attacks, severe respiratory failure, or stroke.</p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <button class="btn btn-outline" onclick="restartSymptomChecker()">🔄 Start New Assessment</button>
      </div>
    `;
    return;
  }

  // 2. NON-EMERGENCY GUIDANCE
  let bannerClass = 'wellness';
  let bannerIcon = '🌿';
  let bannerTitle = 'Mild Discomfort - Self-Care & Lifestyle Guidance';
  if (data.triage_level === 'HIGH_PRIORITY_DOCTOR') {
    bannerClass = 'doctor';
    bannerIcon = '🩺';
    bannerTitle = 'Doctor Consultation Strongly Advised';
  }

  container.innerHTML = `
    <div class="triage-result-banner ${bannerClass}">
      <div style="font-size: 2.2rem; line-height: 1;">${bannerIcon}</div>
      <div>
        <h3 style="font-size: 1.25rem; margin-bottom: 4px;">${bannerTitle}</h3>
        <p style="font-size: 0.95rem; line-height: 1.45;">Assessment for: <strong>${data.symptom_name}</strong></p>
      </div>
    </div>

    <div class="audio-narration-bar">
      <button class="btn-narrate" onclick="readTriageSummaryAloud()">
        🔊 <span class="narrate-text">Listen to this Guidance</span>
      </button>
      <span style="font-size: 0.775rem; color: var(--color-text-light);">• Audio readout</span>
    </div>

    <!-- Ayurvedic Dosha Analysis -->
    <div class="card" style="margin-bottom: 20px; background: #fdfcf9;">
      <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        ⚖️ Ayurvedic Dosha & Body Channel Analysis
      </h4>
      <p style="font-size: 0.95rem; color: var(--color-text-main); margin-bottom: 6px;">
        <strong>Identified Pattern:</strong> ${data.ayurvedic_perspective.dosha_imbalance}
      </p>
      <p style="font-size: 0.875rem; color: var(--color-text-muted);">
        <strong>Affected Channel (Srotas):</strong> ${data.ayurvedic_perspective.system_affected}
      </p>
    </div>

    <!-- Diet & Lifestyle (Pathya / Apathya) -->
    <div class="card" style="margin-bottom: 20px;">
      <h4 style="color: var(--color-secondary); font-size: 1.1rem; margin-bottom: 8px;">
        🥗 Diet & Routine Guidelines (Pathya / Apathya)
      </h4>
      <p style="font-size: 0.925rem; color: var(--color-text-main); line-height: 1.6;">
        ${data.diet_lifestyle_guidelines}
      </p>
    </div>

    <!-- Recommended Remedies with Evidence & Safety -->
    <div style="margin-bottom: 24px;">
      <h4 style="color: var(--color-primary); font-size: 1.15rem; margin-bottom: 12px;">
        🌿 Safe Ayurvedic Herbs & Home Measures (Evidence Evaluated)
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        ${data.recommended_remedies.map(r => `
          <div class="card" style="border-top: 4px solid var(--color-accent);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h5 style="font-size: 1.1rem; color: var(--color-primary);">${r.name}</h5>
              <span class="badge badge-evidence-high">${r.evidence_level}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 10px;">${r.why_suggested}</p>
            <div style="background: var(--color-accent-subtle); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 8px;">
              <strong>Safe Method:</strong> ${r.safe_usage}
            </div>
            <div style="font-size: 0.8rem; color: var(--color-warning);">
              <strong>Avoid if:</strong> ${r.who_should_avoid}
            </div>
            <div style="margin-top: 12px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
              <button class="btn btn-sm btn-outline" onclick="openRemedyModal('${r.id}')">View Full Monograph</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- When to Consult Doctor Box -->
    <div class="card" style="background: #fffbeb; border: 1px solid #fde68a; margin-bottom: 24px;">
      <h4 style="color: #92400e; font-size: 1.05rem; margin-bottom: 6px;">
        👨‍⚕️ When You Must Consult a Doctor
      </h4>
      <p style="color: #78350f; font-size: 0.925rem; line-height: 1.5;">
        ${data.when_to_see_doctor}
      </p>
    </div>

    <!-- Recommended Specialists -->
    ${data.recommended_doctors && data.recommended_doctors.length > 0 ? `
      <div class="card" style="background: #ffffff; border: 2px solid var(--color-accent); margin-bottom: 24px;">
        <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 12px;">
          🩺 Consult a Qualified Ayurvedic Vaidya for this Symptom
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px;">
          ${data.recommended_doctors.map(d => `
            <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 12px;">
              <strong style="color: var(--color-primary);">${d.name}</strong>
              <div style="font-size: 0.775rem; color: var(--color-secondary);">${d.qualification}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted); margin: 4px 0;">${d.specialization}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span style="font-weight: 700; color: var(--color-primary);">₹${d.consultation_fee}</span>
                <button class="btn btn-sm btn-secondary" onclick="openBookingModalForDoctor('${d.id}')">Book Consultation</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div class="medical-disclaimer-card">
      <div class="disclaimer-icon">ℹ️</div>
      <p>${data.disclaimer}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 24px;">
      <button class="btn btn-outline" onclick="restartSymptomChecker()">🔄 Retake Symptom Checker</button>
      <button class="btn btn-primary" onclick="showSection('doctorsSection')">View All Doctors</button>
    </div>
  `;
}

function readTriageSummaryAloud() {
  const container = document.getElementById('symptomResultsContent');
  if (!container) return;
  const text = container.innerText.replace(/[\n\r]+/g, '. ');
  speakText(text.substring(0, 450), currentLanguage);
}

function restartSymptomChecker() {
  selectedSymptomId = null;
  checkerState = {
    symptom_id: null,
    duration_days: 2,
    severity: 'mild',
    has_red_flags: false,
    red_flags_checked: [],
    patient_age: 30
  };
  document.querySelectorAll('.symptom-select-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('#redFlagsChecklist input').forEach(cb => cb.checked = false);
  const nextBtn = document.getElementById('step1NextBtn');
  if (nextBtn) nextBtn.disabled = true;
  goToWizardStep(1);
}

