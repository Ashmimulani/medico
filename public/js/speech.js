// public/js/speech.js - Assistive Web Speech API (TTS & STT Voice Input)

let speechSynth = window.speechSynthesis;
let speechUtterance = null;
let isSpeaking = false;
let speechRecognizer = null;

// Initialize Speech Recognition if supported
function initVoiceSearch(onResultCallback, onStateChangeCallback) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported in this browser.');
    return null;
  }

  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;

  // Language mapping
  const langMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN'
  };
  speechRecognizer.lang = langMap[currentLanguage] || 'en-IN';

  speechRecognizer.onstart = () => {
    if (onStateChangeCallback) onStateChangeCallback(true);
  };

  speechRecognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResultCallback) onResultCallback(transcript);
  };

  speechRecognizer.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onStateChangeCallback) onStateChangeCallback(false);
  };

  speechRecognizer.onend = () => {
    if (onStateChangeCallback) onStateChangeCallback(false);
  };

  return speechRecognizer;
}

function startVoiceInput(onResult, onStatus) {
  if (!speechRecognizer) {
    initVoiceSearch(onResult, onStatus);
  }
  if (!speechRecognizer) {
    alert('Voice input is not supported in this browser. Please type your search query.');
    return;
  }

  try {
    const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
    speechRecognizer.lang = langMap[currentLanguage] || 'en-IN';
    speechRecognizer.start();
  } catch (err) {
    console.error('Failed to start voice input:', err);
  }
}

// Text-to-Speech: Read Aloud
function speakText(text, lang = 'en', onDone = null) {
  if (!('speechSynthesis' in window)) {
    alert('Audio narration is not supported in your browser.');
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  if (!text || text.trim() === '') return;

  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.rate = 0.95; // Slightly slower for clarity
  speechUtterance.pitch = 1.0;

  // Match voice if available
  const voices = speechSynth.getVoices();
  const langCode = lang === 'hi' ? 'hi' : (lang === 'mr' ? 'mr' : 'en');
  const matchedVoice = voices.find(v => v.lang.startsWith(langCode));
  if (matchedVoice) {
    speechUtterance.voice = matchedVoice;
  }

  speechUtterance.onstart = () => {
    isSpeaking = true;
    updateNarrationUI(true);
  };

  speechUtterance.onend = () => {
    isSpeaking = false;
    updateNarrationUI(false);
    if (onDone) onDone();
  };

  speechUtterance.onerror = (e) => {
    console.warn('Speech synthesis issue:', e);
    isSpeaking = false;
    updateNarrationUI(false);
  };

  speechSynth.speak(speechUtterance);
}

function stopSpeaking() {
  if (speechSynth && speechSynth.speaking) {
    speechSynth.cancel();
  }
  isSpeaking = false;
  updateNarrationUI(false);
}

function updateNarrationUI(active) {
  const narrationBtns = document.querySelectorAll('.btn-narrate, #btnGlobalReadAloud');
  narrationBtns.forEach(btn => {
    if (active) {
      btn.classList.add('playing');
      const textSpan = btn.querySelector('.narrate-text');
      if (textSpan) textSpan.textContent = t('stop_read');
    } else {
      btn.classList.remove('playing');
      const textSpan = btn.querySelector('.narrate-text');
      if (textSpan) textSpan.textContent = t('read_aloud');
    }
  });
}

