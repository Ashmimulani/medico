// public/js/education.js - Educational Articles & Myth vs Fact Explorer

let allArticles = [];

async function loadEducationContent() {
  loadArticles();
  loadMythsAndFacts();
}

async function loadArticles() {
  const container = document.getElementById('articlesGrid');
  if (!container) return;

  container.innerHTML = '<div style="padding: 30px; text-align: center;">Loading educational guides...</div>';

  try {
    const res = await fetch('/api/articles');
    const data = await res.json();
    if (!data.success) return;

    allArticles = data.data;
    container.innerHTML = data.data.map(a => {
      const displayTitle = currentLanguage === 'hi' && a.hindi_title ? a.hindi_title : a.title;

      return `
        <div class="article-card">
          <div class="article-card-header">${a.category} • ${a.read_time}</div>
          <h3>${displayTitle}</h3>
          <p>${a.summary}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: auto;">
            <button class="btn btn-sm btn-outline" onclick="openArticleModal('${a.id}')">
              📖 Read Full Guide
            </button>
            <span style="font-size: 0.75rem; color: var(--color-text-light);">${a.tags}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-emergency);">Error loading articles: ${err.message}</div>`;
  }
}

async function openArticleModal(articleId) {
  const modal = document.getElementById('articleDetailModal');
  const body = document.getElementById('articleModalBody');
  const title = document.getElementById('articleModalTitle');
  if (!modal || !body) return;

  body.innerHTML = '<div style="padding: 30px; text-align: center;">Loading full guide...</div>';
  modal.classList.add('active');

  try {
    const res = await fetch(`/api/articles/${articleId}`);
    const data = await res.json();
    if (!data.success) return;

    const a = data.data;
    const displayTitle = currentLanguage === 'hi' && a.hindi_title ? a.hindi_title : a.title;
    title.textContent = displayTitle;

    body.innerHTML = `
      <div class="audio-narration-bar">
        <button class="btn-narrate" onclick="readArticleAloud('${a.id}')">
          🔊 <span class="narrate-text">Listen to Guide (Read Aloud)</span>
        </button>
      </div>

      <div style="font-size: 0.85rem; color: var(--color-secondary); font-weight: 700; margin-bottom: 12px;">
        ${a.category} • ${a.read_time}
      </div>

      <div style="font-size: 1rem; line-height: 1.7; color: var(--color-text-main); white-space: pre-line; margin-bottom: 24px;">
        ${a.content}
      </div>

      <div style="background: #f0fdf4; border-left: 4px solid var(--color-success); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <h4 style="color: #166534; font-size: 0.95rem; margin-bottom: 4px;">🔬 Modern Scientific & Medical Perspective</h4>
        <p style="color: #14532d; font-size: 0.9rem;">${a.scientific_perspective}</p>
      </div>

      <div style="background: #fdfcf9; border-left: 4px solid var(--color-secondary); padding: 16px; border-radius: 8px;">
        <h4 style="color: #92400e; font-size: 0.95rem; margin-bottom: 4px;">📜 Traditional Classical Ayurvedic Reference</h4>
        <p style="color: #78350f; font-size: 0.9rem;">${a.traditional_perspective}</p>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="color: var(--color-emergency);">Error: ${err.message}</div>`;
  }
}

function closeArticleModal() {
  stopSpeaking();
  const modal = document.getElementById('articleDetailModal');
  if (modal) modal.classList.remove('active');
}

function readArticleAloud(articleId) {
  const modalBody = document.getElementById('articleModalBody');
  if (!modalBody) return;
  const text = modalBody.innerText.replace(/[\n\r]+/g, '. ');
  speakText(text.substring(0, 600), currentLanguage);
}

async function loadMythsAndFacts() {
  const container = document.getElementById('mythsGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/myths-facts');
    const data = await res.json();
    if (!data.success) return;

    container.innerHTML = data.data.map(m => {
      const mythText = currentLanguage === 'hi' && m.hindi_myth ? m.hindi_myth : m.myth;
      const factText = currentLanguage === 'hi' && m.hindi_fact ? m.hindi_fact : m.fact;

      return `
        <div class="myth-card">
          <div class="myth-box">
            <h4>❌ Common Myth</h4>
            <p>"${mythText}"</p>
          </div>
          <div class="fact-box">
            <h4>✅ Clinical & Evidence-Based Fact</h4>
            <p>${factText}</p>
            <div style="margin-top: 8px; font-size: 0.85rem; color: #15803d; border-top: 1px dashed #bbf7d0; padding-top: 6px;">
              <strong>Explanation:</strong> ${m.explanation}<br/>
              <em style="font-size: 0.775rem; color: #166534;">Source: ${m.clinical_reference}</em>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-emergency);">Error loading myths: ${err.message}</div>`;
  }
}

