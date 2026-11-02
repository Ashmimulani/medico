// public/js/app.js - Core application controller, navigation, search, and accessibility handlers

let currentSection = 'homeSection';
let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initGlobalSearch();
  initAccessibilityControls();
  initVoiceSearchButton();

  // Load initial home page data
  loadFeaturedRemedies();
  loadFeaturedDoctors();

  // Listen to hash changes for deep linking
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
});

// Navigation & Section switching
function showSection(sectionId) {
  document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    currentSection = sectionId;
  }

  // Update nav highlight
  const navBtn = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Close mobile nav drawer
  const mainNav = document.getElementById('mainNav');
  if (mainNav) mainNav.classList.remove('mobile-active');

  // Trigger lazy loading per section
  if (sectionId === 'remediesSection') {
    loadRemedies();
  } else if (sectionId === 'symptomCheckerSection') {
    initSymptomChecker();
  } else if (sectionId === 'doctorsSection') {
    loadDoctors();
  } else if (sectionId === 'assessmentSection') {
    renderPrakritiQuiz();
  } else if (sectionId === 'educationSection') {
    loadEducationContent();
  } else if (sectionId === 'appointmentsSection') {
    loadMyAppointments();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  const sectionMap = {
    'home': 'homeSection',
    'symptom-checker': 'symptomCheckerSection',
    'remedies': 'remediesSection',
    'doctors': 'doctorsSection',
    'assessment': 'assessmentSection',
    'education': 'educationSection',
    'appointments': 'appointmentsSection'
  };

  if (sectionMap[hash]) {
    showSection(sectionMap[hash]);
  } else {
    showSection('homeSection');
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = link.getAttribute('data-section');
      if (sec) {
        window.location.hash = sec.replace('Section', '').toLowerCase();
        showSection(sec);
      }
    });
  });

  const mobileToggle = document.getElementById('mobileNavToggle');
  const mainNav = document.getElementById('mainNav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-active');
    });
  }
}

// Global Search with Autocomplete
function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchForm = document.getElementById('globalSearchForm');

  if (!searchInput || !searchDropdown) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(searchDebounceTimer);

    if (q.length < 2) {
      searchDropdown.classList.remove('active');
      searchDropdown.innerHTML = '';
      return;
    }

    searchDebounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success) {
          renderSearchResults(data.results, q);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 250);
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.remove('active');
    }
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        showSection('remediesSection');
        loadRemedies('', q);
        searchDropdown.classList.remove('active');
      }
    });
  }
}

function renderSearchResults(results, query) {
  const dropdown = document.getElementById('searchDropdown');
  if (!dropdown) return;

  if (results.total === 0) {
    dropdown.innerHTML = `
      <div style="padding: 16px; text-align: center; color: var(--color-text-muted);">
        No direct matches found for "<strong>${query}</strong>". Try another keyword or browse our sections.
      </div>
    `;
    dropdown.classList.add('active');
    return;
  }

  let html = '';

  // 1. Symptoms
  if (results.symptoms && results.symptoms.length > 0) {
    html += `<div class="search-result-group-title">🩺 Health Symptoms & Conditions</div>`;
    results.symptoms.forEach(s => {
      html += `
        <div class="search-result-item" onclick="selectSearchSymptom('${s.id}')">
          <div>
            <div class="item-title">${s.name} ${s.hindi_name ? `(${s.hindi_name})` : ''}</div>
            <div class="item-subtitle">${s.body_system}</div>
          </div>
          <span class="badge" style="background: #f1f5f9;">Check Triage</span>
        </div>
      `;
    });
  }

  // 2. Remedies & Herbs
  if (results.remedies && results.remedies.length > 0) {
    html += `<div class="search-result-group-title">🌿 Ayurvedic Remedies & Herbs</div>`;
    results.remedies.forEach(r => {
      html += `
        <div class="search-result-item" onclick="selectSearchRemedy('${r.id}')">
          <div>
            <div class="item-title">${r.name} ${r.hindi_name ? `(${r.hindi_name})` : ''}</div>
            <div class="item-subtitle">${r.category} • ${r.common_uses.substring(0, 60)}...</div>
          </div>
          <span class="badge badge-evidence-high">View</span>
        </div>
      `;
    });
  }

  // 3. Doctors
  if (results.doctors && results.doctors.length > 0) {
    html += `<div class="search-result-group-title">👨‍⚕️ Ayurvedic Doctors</div>`;
    results.doctors.forEach(d => {
      html += `
        <div class="search-result-item" onclick="selectSearchDoctor('${d.id}')">
          <div>
            <div class="item-title">${d.name} (${d.qualification})</div>
            <div class="item-subtitle">${d.specialization} • ${d.city}</div>
          </div>
          <span class="badge" style="background: var(--color-secondary-light); color: var(--color-secondary);">Book</span>
        </div>
      `;
    });
  }

  // 4. Articles
  if (results.articles && results.articles.length > 0) {
    html += `<div class="search-result-group-title">📖 Health Guides & AyurGyan</div>`;
    results.articles.forEach(a => {
      html += `
        <div class="search-result-item" onclick="selectSearchArticle('${a.id}')">
          <div>
            <div class="item-title">${a.title}</div>
            <div class="item-subtitle">${a.category}</div>
          </div>
          <span class="badge" style="background: #f1f5f9;">Read</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = html;
  dropdown.classList.add('active');
}

function selectSearchRemedy(id) {
  document.getElementById('searchDropdown').classList.remove('active');
  showSection('remediesSection');
  openRemedyModal(id);
}

function selectSearchSymptom(id) {
  document.getElementById('searchDropdown').classList.remove('active');
  showSection('symptomCheckerSection');
  selectSymptomCard(id);
  goToWizardStep(2);
}

function selectSearchDoctor(id) {
  document.getElementById('searchDropdown').classList.remove('active');
  showSection('doctorsSection');
  openBookingModalForDoctor(id);
}

function selectSearchArticle(id) {
  document.getElementById('searchDropdown').classList.remove('active');
  showSection('educationSection');
  openArticleModal(id);
}

// Voice Search Setup
function initVoiceSearchButton() {
  const voiceBtn = document.getElementById('searchVoiceBtn');
  const searchInput = document.getElementById('globalSearchInput');
  if (!voiceBtn || !searchInput) return;

  voiceBtn.addEventListener('click', () => {
    startVoiceInput(
      (transcript) => {
        searchInput.value = transcript;
        // Trigger input event
        searchInput.dispatchEvent(new Event('input'));
      },
      (isListening) => {
        if (isListening) {
          voiceBtn.classList.add('listening');
          voiceBtn.setAttribute('title', 'Listening... Speak your symptom or herb now');
        } else {
          voiceBtn.classList.remove('listening');
          voiceBtn.setAttribute('title', 'Voice Search');
        }
      }
    );
  });
}

// Accessibility Toolbar Handlers
function initAccessibilityControls() {
  const btnFontNormal = document.getElementById('btnFontNormal');
  const btnFontLarge = document.getElementById('btnFontLarge');
  const btnFontXLarge = document.getElementById('btnFontXLarge');
  const btnHighContrast = document.getElementById('btnHighContrast');
  const btnGlobalReadAloud = document.getElementById('btnGlobalReadAloud');

  if (btnFontNormal) {
    btnFontNormal.addEventListener('click', () => {
      document.documentElement.classList.remove('font-large', 'font-xlarge');
      updateA11yBtnActive(btnFontNormal);
    });
  }

  if (btnFontLarge) {
    btnFontLarge.addEventListener('click', () => {
      document.documentElement.classList.remove('font-xlarge');
      document.documentElement.classList.add('font-large');
      updateA11yBtnActive(btnFontLarge);
    });
  }

  if (btnFontXLarge) {
    btnFontXLarge.addEventListener('click', () => {
      document.documentElement.classList.remove('font-large');
      document.documentElement.classList.add('font-xlarge');
      updateA11yBtnActive(btnFontXLarge);
    });
  }

  if (btnHighContrast) {
    btnHighContrast.addEventListener('click', () => {
      document.documentElement.classList.toggle('high-contrast');
      btnHighContrast.classList.toggle('active');
    });
  }

  if (btnGlobalReadAloud) {
    btnGlobalReadAloud.addEventListener('click', () => {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        const activeSection = document.querySelector('.section-view.active');
        if (activeSection) {
          const text = activeSection.innerText.replace(/[\n\r]+/g, '. ').substring(0, 500);
          speakText(text, currentLanguage);
        }
      }
    });
  }
}

function updateA11yBtnActive(activeBtn) {
  document.querySelectorAll('.font-size-group .a11y-btn').forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
}

// Load Home Featured Remedies
async function loadFeaturedRemedies() {
  const container = document.getElementById('featuredRemediesGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/remedies?limit=3');
    const data = await res.json();
    if (!data.success) return;

    container.innerHTML = data.data.slice(0, 3).map(r => `
      <div class="card" style="border-top: 4px solid var(--color-primary);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span class="badge badge-evidence-high">${r.evidence_level}</span>
            <h4 style="font-size: 1.15rem; color: var(--color-primary); margin-top: 4px;">${r.name}</h4>
            <div style="font-size: 0.8rem; color: var(--color-secondary); font-style: italic;">${r.sanskrit_name}</div>
          </div>
          <span style="font-size: 2rem;">${r.image_emoji || '🌿'}</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 14px;">${r.common_uses.substring(0, 95)}...</p>
        <button class="btn btn-sm btn-outline" onclick="selectSearchRemedy('${r.id}')">View Full Monograph</button>
      </div>
    `).join('');
  } catch (err) {
    console.warn('Error loading featured remedies:', err);
  }
}

// Load Home Featured Doctors
async function loadFeaturedDoctors() {
  const container = document.getElementById('featuredDoctorsGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/doctors?limit=3');
    const data = await res.json();
    if (!data.success) return;

    container.innerHTML = data.data.slice(0, 3).map(d => `
      <div class="card">
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-accent-subtle); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
            ${d.image_gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
          </div>
          <div>
            <h4 style="font-size: 1.05rem; color: var(--color-primary);">${d.name}</h4>
            <div style="font-size: 0.775rem; color: var(--color-secondary);">${d.qualification}</div>
          </div>
        </div>
        <p style="font-size: 0.825rem; color: var(--color-text-muted); margin-bottom: 12px;">${d.specialization}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 10px;">
          <span style="font-weight: 700; color: var(--color-primary);">₹${d.consultation_fee}</span>
          <button class="btn btn-sm btn-secondary" onclick="openBookingModalForDoctor('${d.id}')">Book Consultation</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.warn('Error loading featured doctors:', err);
  }
}

