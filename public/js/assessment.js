// public/js/assessment.js - Ayurvedic Prakriti (Dosha Constitution) Assessment Engine

const PRAKRITI_QUESTIONS = [
  {
    id: 'frame',
    question: '1. Physical Body Frame & Structure',
    hindi: '1. शारीरिक गठन और कद-काठी',
    options: [
      { dosha: 'vata', text: 'Slender, thin, light-boned, prominent joints, difficulty gaining weight', hindi: 'दुबला-पतला, हड्डियां उभरी हुई, वजन बढ़ाने में कठिनाई' },
      { dosha: 'pitta', text: 'Medium build, symmetrical, athletic, easily gains or loses weight', hindi: 'मध्यम गठन, सुडौल, आसानी से वजन नियंत्रित रहता है' },
      { dosha: 'kapha', text: 'Broad, sturdy, heavy-boned, strong musculature, tends to gain weight easily', hindi: 'चौड़ा और भारी शरीर, मजबूत हड्डियां, वजन आसानी से बढ़ता है' }
    ]
  },
  {
    id: 'skin',
    question: '2. Skin Quality & Complexion',
    hindi: '2. त्वचा की प्रकृति और रंगत',
    options: [
      { dosha: 'vata', text: 'Dry, rough, thin, easily chapped, cool to touch', hindi: 'रूखी, खुरदरी, पतली, जल्दी फटने वाली, ठंडी' },
      { dosha: 'pitta', text: 'Warm, reddish, prone to acne, freckles, or flushing', hindi: 'गर्म, लालिमा युक्त, मुंहासे या तिल की प्रवृत्ति' },
      { dosha: 'kapha', text: 'Thick, smooth, oily, moist, glowing, cool and soft', hindi: 'मोटी, मुलायम, चिकनी, चमकदार और ठंडी' }
    ]
  },
  {
    id: 'digestion',
    question: '3. Digestion & Appetite (Agni)',
    hindi: '3. भूख और पाचन शक्ति (जठराग्नि)',
    options: [
      { dosha: 'vata', text: 'Variable, irregular; sometimes hungry, sometimes forget to eat, prone to gas', hindi: 'अनियमित; कभी बहुत भूख, कभी भूल जाना, गैस और पेट फूलना' },
      { dosha: 'pitta', text: 'Strong, sharp; cannot tolerate skipping meals, prone to acidity/heartburn', hindi: 'तीव्र; समय पर खाना न मिलने पर चिड़चिड़ापन, एसिडिटी' },
      { dosha: 'kapha', text: 'Slow, steady; can easily skip a meal, feeling of heaviness after eating', hindi: 'मंद; खाना देर से पचना, खाने के बाद भारीपन' }
    ]
  },
  {
    id: 'sleep',
    question: '4. Sleep Patterns & Dreams',
    hindi: '4. नींद की आदतें और स्वप्न',
    options: [
      { dosha: 'vata', text: 'Light, interrupted, takes time to fall asleep, flying/active dreams', hindi: 'हल्की, बार-बार टूटने वाली, सोने में समय लगना, तेज सपने' },
      { dosha: 'pitta', text: 'Moderate (6-7 hrs), sound, wake up alert, intense or vivid dreams', hindi: 'मध्यम (6-7 घंटे), गहरी, उठने पर ताजगी, जीवंत सपने' },
      { dosha: 'kapha', text: 'Deep, heavy, prolonged (> 8 hrs), difficulty waking up in morning', hindi: 'गहरी, लंबी (8+ घंटे), सुबह उठने में भारीपन और आलस्य' }
    ]
  },
  {
    id: 'weather',
    question: '5. Weather Sensitivity & Temperature Preference',
    hindi: '5. मौसम के प्रति संवेदनशीलता',
    options: [
      { dosha: 'vata', text: 'Dislikes cold, dry, and windy climates; loves warmth and sunshine', hindi: 'ठंड और सूखी हवा बर्दाश्त नहीं होती; गर्म मौसम पसंद है' },
      { dosha: 'pitta', text: 'Dislikes heat, intense sunlight, and humidity; loves cool spaces', hindi: 'गर्मी और धूप बर्दाश्त नहीं होती; ठंडी जगहें पसंद हैं' },
      { dosha: 'kapha', text: 'Dislikes damp, cloudy, and chilly weather; enjoys dry warmth', hindi: 'सर्द और नम मौसम नापसंद; सूखा और गर्म वातावरण पसंद' }
    ]
  },
  {
    id: 'stress',
    question: '6. Emotional Response to Stress or Conflict',
    hindi: '6. तनाव या दबाव में मानसिक प्रतिक्रिया',
    options: [
      { dosha: 'vata', text: 'Anxiety, worry, racing thoughts, restlessness, overwhelm', hindi: 'चिंता, घबराहट, बहुत ज्यादा सोचना, बेचैनी' },
      { dosha: 'pitta', text: 'Irritability, impatience, anger, critical or argumentative demeanor', hindi: 'गुस्सा, चिड़चिड़ापन, धैर्य की कमी, आलोचनात्मक रवैया' },
      { dosha: 'kapha', text: 'Calm, complacent, withdraws, avoids conflict, slow to react', hindi: 'शांत, बात टालना, टकराव से बचना, धीमी प्रतिक्रिया' }
    ]
  },
  {
    id: 'memory',
    question: '7. Mental Pace, Learning & Memory',
    hindi: '7. सीखने की गति और स्मरण शक्ति',
    options: [
      { dosha: 'vata', text: 'Grasps new concepts very quickly, but forgets quickly', hindi: 'बहुत जल्दी समझ आना, लेकिन जल्दी भूल भी जाना' },
      { dosha: 'pitta', text: 'Sharp, analytical, precise memory, highly focused', hindi: 'तेज बुद्धि, तार्किक विश्लेषण, सटीक याददाश्त' },
      { dosha: 'kapha', text: 'Learns methodically at a slower pace, but retains memory for life', hindi: 'सीखने में समय लेना, लेकिन जीवन भर याद रखना' }
    ]
  },
  {
    id: 'stamina',
    question: '8. Physical Energy & Stamina',
    hindi: '8. शारीरिक ऊर्जा और सहनशक्ति',
    options: [
      { dosha: 'vata', text: 'Bursts of high energy followed by sudden fatigue and exhaustion', hindi: 'ऊर्जा का अचानक उछाल और फिर तुरंत थकान' },
      { dosha: 'pitta', text: 'Moderate, goal-driven, competitive, determined stamina', hindi: 'मध्यम, लक्ष्य-केंद्रित, प्रतिस्पर्धात्मक सहनशक्ति' },
      { dosha: 'kapha', text: 'Excellent natural endurance, slow to start, but can sustain for hours', hindi: 'उत्कृष्ट स्वाभाविक सहनशक्ति, लंबे समय तक काम करने की क्षमता' }
    ]
  }
];

let userAnswers = {};

function renderPrakritiQuiz() {
  const container = document.getElementById('quizQuestionsContainer');
  const quizForm = document.getElementById('prakritiQuizForm');
  const resultCard = document.getElementById('prakritiResultCard');

  if (!container) return;
  quizForm.style.display = 'block';
  resultCard.style.display = 'none';

  container.innerHTML = PRAKRITI_QUESTIONS.map((q, idx) => {
    const qTitle = currentLanguage === 'hi' ? q.hindi : q.question;

    return `
      <div class="quiz-question-card">
        <h4 style="color: var(--color-primary); font-size: 1.15rem; margin-bottom: 14px;">${qTitle}</h4>
        <div class="quiz-options-list">
          ${q.options.map((opt, oIdx) => {
            const optText = currentLanguage === 'hi' ? opt.hindi : opt.text;
            const inputId = `q_${q.id}_${opt.dosha}`;

            return `
              <label class="quiz-option-item" for="${inputId}">
                <input type="radio" name="q_${q.id}" id="${inputId}" value="${opt.dosha}" required onchange="recordQuizAnswer('${q.id}', '${opt.dosha}')">
                <span>${optText}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function recordQuizAnswer(questionId, dosha) {
  userAnswers[questionId] = dosha;
  // Highlight card
  const input = document.getElementById(`q_${questionId}_${dosha}`);
  if (input) {
    const parentList = input.closest('.quiz-options-list');
    parentList.querySelectorAll('.quiz-option-item').forEach(el => el.classList.remove('selected'));
    input.closest('.quiz-option-item').classList.add('selected');
  }
}

async function submitPrakritiAssessment(event) {
  event.preventDefault();

  const totalQuestions = PRAKRITI_QUESTIONS.length;
  const answeredCount = Object.keys(userAnswers).length;

  if (answeredCount < totalQuestions) {
    alert(`Please answer all ${totalQuestions} questions to calculate your accurate constitutional balance.`);
    return;
  }

  let vataCount = 0;
  let pittaCount = 0;
  let kaphaCount = 0;

  Object.values(userAnswers).forEach(d => {
    if (d === 'vata') vataCount++;
    else if (d === 'pitta') pittaCount++;
    else if (d === 'kapha') kaphaCount++;
  });

  const vataPct = Math.round((vataCount / totalQuestions) * 100);
  const pittaPct = Math.round((pittaCount / totalQuestions) * 100);
  const kaphaPct = Math.round((kaphaCount / totalQuestions) * 100);

  // Determine dominant constitution
  let dominant = '';
  if (vataPct >= 45) dominant = 'Vata Predominant';
  else if (pittaPct >= 45) dominant = 'Pitta Predominant';
  else if (kaphaPct >= 45) dominant = 'Kapha Predominant';
  else if (vataPct >= 35 && pittaPct >= 35) dominant = 'Vata-Pitta Dual Constitution';
  else if (pittaPct >= 35 && kaphaPct >= 35) dominant = 'Pitta-Kapha Dual Constitution';
  else if (vataPct >= 35 && kaphaPct >= 35) dominant = 'Vata-Kapha Dual Constitution';
  else dominant = 'Tridoshic (Balanced)';

  const userNameInput = document.getElementById('quizUserName');
  const userName = userNameInput ? userNameInput.value.trim() || 'Health Seeker' : 'Health Seeker';

  // Recommendations mapping
  let dietPlan = '';
  let lifestylePlan = '';

  if (dominant.includes('Vata')) {
    dietPlan = 'Warm, unctuous (ghee/olive oil), nourishing soups, cooked whole grains, sweet root vegetables. Minimize raw salads, cold drinks, and dry beans.';
    lifestylePlan = 'Consistent daily rhythm, warm oil self-massage (Abhyanga with sesame oil), gentle grounding yoga, avoid late nights and over-scheduling.';
  } else if (dominant.includes('Pitta')) {
    dietPlan = 'Cooling, fresh foods, sweet juicy fruits, cucumbers, ghee, leafy greens, coconut water. Avoid excessively pungent chilies, vinegar, deep-fried food, and hard liquor.';
    lifestylePlan = 'Moderate paced activities, time in nature / near water bodies, cooling breathwork (Sheetali Pranayama), avoid heated competitive arguments.';
  } else {
    dietPlan = 'Light, warm, pungent and bitter foods, warm herbal teas (ginger, black pepper), lentils, roasted grains. Minimize heavy dairy, chilled sweets, and fried snacks.';
    lifestylePlan = 'Vigorous daily exercise (Vyayama), early rising before 6:00 AM, dry powder skin brushing (Udvartana), stimulating mental and physical pursuits.';
  }

  // Display results
  displayPrakritiResults({
    userName,
    vataPct,
    pittaPct,
    kaphaPct,
    dominant,
    dietPlan,
    lifestylePlan
  });

  // Save to database
  try {
    await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        vata_score: vataPct,
        pitta_score: pittaPct,
        kapha_score: kaphaPct,
        dominant_prakriti: dominant,
        dietary_recommendations: dietPlan,
        lifestyle_recommendations: lifestylePlan
      })
    });
  } catch (e) {
    console.warn('Could not save assessment to DB:', e);
  }
}

function displayPrakritiResults(data) {
  const quizForm = document.getElementById('prakritiQuizForm');
  const resultCard = document.getElementById('prakritiResultCard');
  if (!quizForm || !resultCard) return;

  quizForm.style.display = 'none';
  resultCard.style.display = 'block';

  resultCard.innerHTML = `
    <div class="prakriti-result-box">
      <div style="font-size: 2.8rem; line-height: 1; margin-bottom: 12px;">🌿</div>
      <span class="badge badge-dosha" style="font-size: 0.85rem; padding: 6px 14px;">YOUR CONSTITUTIONAL PROFILE</span>
      <h3 style="font-size: 1.85rem; color: var(--color-primary); margin: 8px 0 4px;">${data.dominant}</h3>
      <p style="color: var(--color-text-muted); font-size: 0.95rem;">Assessed for: <strong>${data.userName}</strong></p>

      <!-- Visual Breakdown Bar -->
      <div class="dosha-breakdown-bar">
        <div class="dosha-bar-vata" style="width: ${data.vataPct}%;" title="Vata: ${data.vataPct}%">Vata ${data.vataPct}%</div>
        <div class="dosha-bar-pitta" style="width: ${data.pittaPct}%;" title="Pitta: ${data.pittaPct}%">Pitta ${data.pittaPct}%</div>
        <div class="dosha-bar-kapha" style="width: ${data.kaphaPct}%;" title="Kapha: ${data.kaphaPct}%">Kapha ${data.kaphaPct}%</div>
      </div>

      <div style="display: flex; justify-content: space-around; margin-bottom: 24px; font-size: 0.9rem;">
        <div>🔵 <strong>Vata (Air & Space):</strong> ${data.vataPct}%</div>
        <div>🔴 <strong>Pitta (Fire & Water):</strong> ${data.pittaPct}%</div>
        <div>🟢 <strong>Kapha (Water & Earth):</strong> ${data.kaphaPct}%</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; text-align: left; margin-bottom: 24px;">
        <div class="card" style="border-top: 4px solid var(--color-secondary);">
          <h4 style="color: var(--color-secondary); font-size: 1.05rem; margin-bottom: 6px;">🥗 Personalized Diet Guidelines (Pathya)</h4>
          <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.55;">${data.dietPlan}</p>
        </div>
        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <h4 style="color: var(--color-primary); font-size: 1.05rem; margin-bottom: 6px;">⏰ Daily Routine & Lifestyle (Dinacharya)</h4>
          <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.55;">${data.lifestylePlan}</p>
        </div>
      </div>

      <div class="medical-disclaimer-card" style="text-align: left;">
        <div class="disclaimer-icon">ℹ️</div>
        <p><strong>Educational Disclaimer:</strong> Prakriti reflects constitutional baseline tendencies in Ayurveda. It is not an indicator of pathological disease or clinical disorder. For diagnosis of medical conditions, consult a registered practitioner.</p>
      </div>

      <div style="display: flex; justify-content: center; gap: 14px; margin-top: 24px;">
        <button class="btn btn-outline" onclick="resetPrakritiQuiz()">🔄 Retake Quiz</button>
        <button class="btn btn-primary" onclick="showSection('remediesSection')">Explore Suitable Herbs</button>
      </div>
    </div>
  `;

  window.scrollTo({ top: resultCard.offsetTop - 80, behavior: 'smooth' });
}

function resetPrakritiQuiz() {
  userAnswers = {};
  renderPrakritiQuiz();
}

