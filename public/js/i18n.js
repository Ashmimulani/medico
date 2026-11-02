// public/js/i18n.js - Multi-language localization dictionary for AyurCare
// Supports English, Hindi (हिन्दी), and Marathi (मराठी)

const translations = {
  en: {
    // Top Bar & Emergency
    emergency_strip: "🚨 Emergency Medical Alert: For severe or life-threatening conditions (chest pain, severe breathing difficulty, sudden collapse), call emergency services immediately.",
    emergency_dial: "Call 108 / 112",
    lang_select: "Language",
    text_size: "Text Size:",
    contrast: "Contrast:",
    read_aloud: "Read Page Aloud",
    stop_read: "Stop Reading",

    // Navigation
    nav_home: "Home",
    nav_symptom: "Symptom Checker",
    nav_remedies: "Ayurvedic Remedies",
    nav_doctors: "Consult Doctor",
    nav_assessment: "Prakriti Quiz",
    nav_education: "AyurGyan & Myths",
    nav_appointments: "My Appointments",
    book_now: "Book Consultation",

    // Hero Section
    hero_tag: "Vedic Wisdom • Clinical Evidence • Trusted Care",
    hero_title: "Reliable Ayurvedic Healthcare & Wellness For All",
    hero_subtitle: "Bridging classical Ayurvedic knowledge with modern medical awareness. Simple, safe, and accessible healthcare guidance for every Indian citizen.",
    search_placeholder: "Search health problems, symptoms, herbs, or remedies...",
    search_btn: "Search",
    popular_searches: "Quick topics:",

    // Emergency Callout
    emergency_heading: "Experiencing an Acute Emergency?",
    emergency_desc: "Ayurvedic home remedies are not intended for sudden severe emergencies. Do not delay hospital care.",
    call_108: "Call 108 (Ambulance)",
    call_112: "Call 112 (National Emergency)",

    // Core Features Cards
    feat_symptom_title: "Smart Symptom Checker",
    feat_symptom_desc: "Evaluate your symptoms, check for red flags, understand your Dosha imbalance, and get safe next steps.",
    feat_remedies_title: "Evidence-Based Remedies",
    feat_remedies_desc: "Explore traditional herbs with scientific evidence ratings, safety limitations, drug interactions, and precautions.",
    feat_doctors_title: "Certified Ayurvedic Doctors",
    feat_doctors_desc: "Connect with verified BAMS and MD Ayurvedic physicians for online video or in-clinic consultations across India.",
    feat_assessment_title: "Prakriti Health Assessment",
    feat_assessment_desc: "Discover your unique constitutional balance (Vata, Pitta, Kapha) and receive personalized daily diet advice.",

    // Daily Dinacharya
    dinacharya_title: "Daily Ayurvedic Circadian Wisdom (Dinacharya)",
    dinacharya_tip: "According to Ayurveda, eating your heaviest meal between 12 PM - 2 PM aligns with the peak of your digestive fire (Jatharagni), maximizing nutrient absorption and preventing metabolic toxins (Ama).",

    // General Disclaimers
    medical_disclaimer: "Medical Safety Disclaimer: Information on this platform is for educational and wellness guidance only. It does not replace clinical diagnosis, laboratory tests, or doctor consultations. Never stop or modify prescription medicines without consulting your physician."
  },

  hi: {
    // Top Bar & Emergency
    emergency_strip: "🚨 आपातकालीन सूचना: गंभीर स्थिति (सीने में दर्द, सांस लेने में अत्यधिक कठिनाई, बेहोशी) में तुरंत आपातकालीन 108 या 112 पर कॉल करें।",
    emergency_dial: "कॉल करें 108 / 112",
    lang_select: "भाषा",
    text_size: "अक्षर आकार:",
    contrast: "कंट्रास्ट:",
    read_aloud: "आवाज़ में सुनें",
    stop_read: "सुनना बंद करें",

    // Navigation
    nav_home: "मुखपृष्ठ",
    nav_symptom: "लक्षण जांच",
    nav_remedies: "आयुर्वेदिक उपचार",
    nav_doctors: "डॉक्टर परामर्श",
    nav_assessment: "प्रकृति परीक्षण",
    nav_education: "ज्ञान व तथ्य",
    nav_appointments: "मेरी नियुक्तियां",
    book_now: "परामर्श बुक करें",

    // Hero Section
    hero_tag: "वैदिक ज्ञान • वैज्ञानिक प्रमाण • सुरक्षित स्वास्थ्य",
    hero_title: "विश्वसनीय आयुर्वेदिक स्वास्थ्य एवं संपूर्ण कल्याण",
    hero_subtitle: "प्राचीन आयुर्वेद के ज्ञान और आधुनिक चिकित्सा विज्ञान का उत्तम संगम। भारत के प्रत्येक नागरिक के लिए सरल, सुलभ और सुरक्षित स्वास्थ्य मार्गदर्शन।",
    search_placeholder: "बीमारी, लक्षण, जड़ी-बूटी या घरेलू नुस्खे खोजें...",
    search_btn: "खोजें",
    popular_searches: "प्रमुख विषय:",

    // Emergency Callout
    emergency_heading: "क्या आप गंभीर आपातकाल में हैं?",
    emergency_desc: "अचानक आई गंभीर बीमारी में घरेलू नुस्खे न आजमाएं। तुरंत नजदीकी अस्पताल पहुंचे।",
    call_108: "108 पर कॉल करें (एम्बुलेंस)",
    call_112: "112 पर कॉल करें (आपातकाल)",

    // Core Features Cards
    feat_symptom_title: "स्मार्ट लक्षण जांच",
    feat_symptom_desc: "अपने लक्षणों की जांच करें, खतरे के संकेत पहचानें, दोष असंतुलन समझें और सुरक्षित कदम उठाएं।",
    feat_remedies_title: "प्रमाणित आयुर्वेदिक नुस्खे",
    feat_remedies_desc: "जड़ी-बूटियों के फायदे, वैज्ञानिक प्रमाण, दुष्प्रभाव और दवाओं के साथ परस्पर क्रिया की जानकारी पाएं।",
    feat_doctors_title: "सत्यापित योग्य वैद्य (डॉक्टर)",
    feat_doctors_desc: "भारत भर के अनुभवी BAMS व MD आयुर्वेदिक डॉक्टरों से ऑनलाइन वीडियो या क्लिनिक में परामर्श लें।",
    feat_assessment_title: "प्रकृति स्वास्थ्य परीक्षण",
    feat_assessment_desc: "अपनी शारीरिक प्रकृति (वात, पित्त, कफ) जानें और अपने अनुसार अनुकूल खान-पान व दिनचर्या अपनाएं।",

    // Daily Dinacharya
    dinacharya_title: "दैनिक दिनचर्या मार्गदर्शन",
    dinacharya_tip: "दोपहर 12 से 2 बजे के बीच शरीर की पाचक अग्नि (जठराग्नि) सबसे तीव्र होती है। इस समय लिया गया मुख्य भोजन सरलता से पचता है और विषैले तत्व (आम) नहीं बनने देता।",

    // General Disclaimers
    medical_disclaimer: "चिकित्सा सुरक्षा अस्वीकरण: इस मंच पर दी गई जानकारी केवल शैक्षणिक और सामान्य कल्याण मार्गदर्शन के लिए है। यह किसी रोग के चिकित्सकीय निदान या डॉक्टर के परामर्श का विकल्प नहीं है।"
  },

  mr: {
    // Top Bar & Emergency
    emergency_strip: "🚨 आपत्कालीन वैद्यकीय सूचना: छातीत दुखणे, श्वास घेण्यास त्रास किंवा बेशुद्ध पडणे यांसारख्या गंभीर स्थितीत त्वरित 108 किंवा 112 वर संपर्क साधा.",
    emergency_dial: "कॉल करा 108 / 112",
    lang_select: "भाषा",
    text_size: "फॉन्ट आकार:",
    contrast: "कॉन्ट्रास्ट:",
    read_aloud: "ऐका (ध्वनी)",
    stop_read: "थांबवा",

    // Navigation
    nav_home: "मुख्यपृष्ठ",
    nav_symptom: "लक्षण तपासणी",
    nav_remedies: "आयुर्वेदिक उपाय",
    nav_doctors: "डॉक्टर सल्ला",
    nav_assessment: "प्रकृती चाचणी",
    nav_education: "ज्ञान व तथ्ये",
    nav_appointments: "माझ्या अपॉइंटमेंट्स",
    book_now: "अपॉइंटमेंट बुक करा",

    // Hero Section
    hero_tag: "वैदिक ज्ञान • वैज्ञानिक पुरावे • विश्वासार्ह आरोग्य",
    hero_title: "सर्वांसाठी विश्वासार्ह आयुर्वेदिक आरोग्य आणि निरोगी जीवन",
    hero_subtitle: "पारंपारिक आयुर्वेदिक ज्ञान आणि आधुनिक वैद्यकीय जागृतीचा संगम. सर्वसामान्य नागरिकांसाठी सोपे, सुरक्षित आणि समजण्याजोगे मार्गदर्शन.",
    search_placeholder: "आरोग्य समस्या, लक्षणे किंवा औषधी वनस्पती शोधा...",
    search_btn: "शोधा",
    popular_searches: "महत्वाचे विषय:",

    // Emergency Callout
    emergency_heading: "गंभीर आपत्कालीन परिस्थिती आहे का?",
    emergency_desc: "तीव्र आजारात घरगुती उपायांवर अवलंबून न राहता तात्काळ रुग्णालयात जा.",
    call_108: "108 वर कॉल करा (रुग्णवाहिका)",
    call_112: "112 वर कॉल करा (आपत्कालीन सेवा)",

    // Core Features Cards
    feat_symptom_title: "लक्षण तपासणी यंत्रणा",
    feat_symptom_desc: "आपल्या लक्षणांची नोंद करा, धोक्याचे संकेत तपासा आणि सुरक्षित उपाय जाणून घ्या.",
    feat_remedies_title: "पुराव्यावर आधारित उपाय",
    feat_remedies_desc: "औषधी वनस्पतींचे गुणधर्म, वैज्ञानिक पुरावे, दुष्परिणाम आणि सावधगिरीची माहिती घ्या.",
    feat_doctors_title: "प्रमाणित आयुर्वेदिक डॉक्टर",
    feat_doctors_desc: "अनुभवी BAMS आणि MD डॉक्टरांकडून ऑनलाइन व्हिडिओ किंवा क्लिनिकमध्ये सल्ला घ्या.",
    feat_assessment_title: "प्रकृती परीक्षण",
    feat_assessment_desc: "आपली शारीरिक प्रकृती (वात, पित्त, कफ) ओळखा आणि त्यानुसार योग्य आहार व जीवनशैली निवडा.",

    // Daily Dinacharya
    dinacharya_title: "आयुर्वेदिक दिनचर्या मार्गदर्शन",
    dinacharya_tip: "दुपारी 12 ते 2 च्या दरम्यान पचनशक्ती सर्वात जास्त कार्यक्षम असते, म्हणून या वेळी पौष्टिक भोजन घेणे आरोग्यासाठी अत्यंत लाभदायक ठरते.",

    // General Disclaimers
    medical_disclaimer: "वैद्यकीय सुरक्षा अस्वीकरण: ही माहिती केवळ शैक्षणिक आणि सामान्य आरोग्य मार्गदर्शनासाठी आहे. हे डॉक्टरांच्या प्रत्यक्ष सल्ल्याचा पर्याय नाही."
  }
};

let currentLanguage = 'en';

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLanguage = lang;
  localStorage.setItem('ayur_lang', lang);
  updateDOMTranslations();
}

function t(key) {
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  return key;
}

function updateDOMTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      el.textContent = translations[currentLanguage][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      el.setAttribute('placeholder', translations[currentLanguage][key]);
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang = currentLanguage;
}

// Auto-load saved language or default to en
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('ayur_lang') || 'en';
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = saved;
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  }
  setLanguage(saved);
});

