// database.js - SQLite database setup and comprehensive clinical & Ayurvedic seed data
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'ayurveda.db');
const db = new DatabaseSync(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  console.log('Initializing Ayurvedic Healthcare Database...');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS remedies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sanskrit_name TEXT,
      botanical_name TEXT,
      category TEXT NOT NULL,
      common_uses TEXT NOT NULL,
      why_suggested TEXT NOT NULL,
      potential_benefits TEXT NOT NULL,
      scientific_evidence TEXT NOT NULL,
      evidence_level TEXT NOT NULL,
      scientific_limitations TEXT NOT NULL,
      possible_side_effects TEXT NOT NULL,
      who_should_avoid TEXT NOT NULL,
      safe_usage TEXT NOT NULL,
      when_to_consult_doctor TEXT NOT NULL,
      herb_interactions TEXT NOT NULL,
      dosha_effect TEXT NOT NULL,
      hindi_name TEXT,
      marathi_name TEXT,
      image_emoji TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS herb_drug_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      herb_name TEXT NOT NULL,
      drug_class TEXT NOT NULL,
      drug_examples TEXT NOT NULL,
      severity TEXT NOT NULL, -- Mild, Moderate, Severe
      interaction_mechanism TEXT NOT NULL,
      clinical_recommendation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      qualification TEXT NOT NULL,
      registration_no TEXT NOT NULL,
      specialization TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      clinic_name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      languages TEXT NOT NULL,
      consultation_fee INTEGER NOT NULL,
      rating REAL NOT NULL,
      total_reviews INTEGER NOT NULL,
      available_modes TEXT NOT NULL, -- 'Online, In-Clinic'
      bio TEXT NOT NULL,
      image_gender TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_age INTEGER NOT NULL,
      patient_gender TEXT NOT NULL,
      patient_phone TEXT NOT NULL,
      patient_email TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      consultation_mode TEXT NOT NULL,
      chief_complaint TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(doctor_id) REFERENCES doctors(id)
    );

    CREATE TABLE IF NOT EXISTS symptoms_data (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      hindi_name TEXT,
      body_system TEXT NOT NULL,
      description TEXT NOT NULL,
      red_flags TEXT NOT NULL,
      ayurvedic_dosha TEXT NOT NULL,
      recommended_remedy_ids TEXT,
      diet_lifestyle_tips TEXT NOT NULL,
      when_to_seek_urgent_care TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      hindi_title TEXT,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      read_time TEXT NOT NULL,
      scientific_perspective TEXT NOT NULL,
      traditional_perspective TEXT NOT NULL,
      tags TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS myths_facts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      myth TEXT NOT NULL,
      hindi_myth TEXT,
      fact TEXT NOT NULL,
      hindi_fact TEXT,
      explanation TEXT NOT NULL,
      clinical_reference TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_name TEXT,
      vata_score INTEGER NOT NULL,
      pitta_score INTEGER NOT NULL,
      kapha_score INTEGER NOT NULL,
      dominant_prakriti TEXT NOT NULL,
      dietary_recommendations TEXT NOT NULL,
      lifestyle_recommendations TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  // Check if remedies already populated
  const check = db.prepare('SELECT COUNT(*) as count FROM remedies').get();
  if (check.count > 0) {
    console.log('Database already seeded with ' + check.count + ' remedies.');
    return;
  }

  console.log('Seeding remedies, doctors, symptoms, articles, and interactions...');

  // 1. SEED REMEDIES
  const insertRemedy = db.prepare(`
    INSERT INTO remedies (
      id, name, sanskrit_name, botanical_name, category, common_uses,
      why_suggested, potential_benefits, scientific_evidence, evidence_level,
      scientific_limitations, possible_side_effects, who_should_avoid,
      safe_usage, when_to_consult_doctor, herb_interactions, dosha_effect,
      hindi_name, marathi_name, image_emoji
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const remediesData = [
    {
      id: 'turmeric-haldi',
      name: 'Turmeric (Haldi)',
      sanskrit_name: 'Haridra',
      botanical_name: 'Curcuma longa',
      category: 'Anti-inflammatory & Digestive Spice',
      common_uses: 'Dry/productive cough, joint stiffness, sore throat, minor wound healing, sluggish digestion',
      why_suggested: 'Suggested for its natural warming qualities (Ushna Virya) and active polyphenol curcumin that aids immune function and modulates inflammatory pathways.',
      potential_benefits: 'Supports respiratory tract comfort, relieves mild throat irritation, reduces joint ache in osteoarthritis, improves skin glow and digestion.',
      scientific_evidence: 'Curcumin possesses proven antioxidant and anti-inflammatory activity via NF-kB inhibition. Systematic reviews in the Journal of Medicinal Food show moderate efficacy for joint discomfort and seasonal allergy relief.',
      evidence_level: 'Moderate Clinical Evidence',
      scientific_limitations: 'Curcumin has poor oral bioavailability when consumed alone; requires black pepper (piperine) or healthy fats for meaningful systemic absorption. High therapeutic clinical trials used standardized extracts, not standard culinary powder.',
      possible_side_effects: 'Stomach upset, acid reflux, nausea, loose stools in large doses (> 2-3g pure extract daily).',
      who_should_avoid: 'People with bile duct obstruction, active gallstones, bleeding disorders, those scheduled for surgery within 2 weeks, and pregnant women in large medicinal doses.',
      safe_usage: 'Mix 1/2 teaspoon (approx. 1.5 - 2g) pure turmeric powder with warm boiled milk or plant milk and a pinch of black pepper at bedtime. Can also be gargled with warm water and rock salt for sore throat.',
      when_to_consult_doctor: 'If cough persists longer than 7-10 days, accompanied by fever over 101°F, blood in sputum, chest pain, or difficulty breathing.',
      herb_interactions: 'Increases risk of bleeding with blood thinners (Warfarin, Heparin, Aspirin, Clopidogrel). May enhance blood sugar lowering effects of antidiabetic drugs (Metformin, Glimepiride).',
      dosha_effect: 'Pacifies Kapha and Vata; can mildly aggravate Pitta in excessive amounts.',
      hindi_name: 'हल्दी (Haldi)',
      marathi_name: 'हळद (Halad)',
      image_emoji: '🌿'
    },
    {
      id: 'ashwagandha',
      name: 'Ashwagandha (Indian Ginseng)',
      sanskrit_name: 'Ashwagandha (Varahkarni)',
      botanical_name: 'Withania somnifera',
      category: 'Adaptogen & Rejuvenator (Rasayana)',
      common_uses: 'Chronic stress, generalized fatigue, mild anxiety, insomnia, physical debility, post-illness weakness',
      why_suggested: 'Revered in Ayurveda as a supreme Balya (strength-giver) and Medhya Rasayana (nervine tonic) that nourishes depleted body tissues (Ojas & Majja Dhatu).',
      potential_benefits: 'Helps balance cortisol (the stress hormone), promotes deeper restorative sleep, supports endurance and muscular recovery, enhances cognitive clarity.',
      scientific_evidence: 'Multiple randomized double-blind placebo-controlled trials (Indian Journal of Psychological Medicine, 2012; Medicine 2019) demonstrated significant reduction in serum cortisol and perceived stress scores in chronically stressed adults.',
      evidence_level: 'High Clinical Evidence (for mild stress & sleep)',
      scientific_limitations: 'Most trials evaluated standardized root extracts (KSM-66 or Sensoril) over 8 to 12 weeks. Long-term safety beyond 6 months is not well-established in randomized human cohorts.',
      possible_side_effects: 'Drowsiness, mild gastrointestinal upset, diarrhea, rare cases of idiosyncratic liver enzyme elevation reported in excessive unregulated supplements.',
      who_should_avoid: 'Pregnant women (can stimulate uterine contractions), nursing mothers, individuals with autoimmune conditions (Hashimoto thyroiditis, Lupus) without specialist oversight, and prior to general anesthesia.',
      safe_usage: 'Root powder (Churna): 1/2 to 1 teaspoon (2 to 3 grams) once daily with warm milk or water after dinner. Standardized extract: 300-600mg daily. Do not exceed recommended dosage.',
      when_to_consult_doctor: 'If experiencing severe depression, suicidal ideation, persistent insomnia lasting more than 3 weeks, unexplained weight loss, or severe palpitations.',
      herb_interactions: 'Potentiates sedatives, benzodiazepines, and sleep aids. Can increase thyroid hormone levels, requiring caution in those on Levothyroxine. May lower blood glucose.',
      dosha_effect: 'Strongly calms Vata and Kapha. May increase Pitta if taken in very high doses due to Ushna (heating) virya.',
      hindi_name: 'अश्वगंधा (Ashwagandha)',
      marathi_name: 'अश्वगंधा (Ashwagandha)',
      image_emoji: '🌱'
    },
    {
      id: 'tulsi-holy-basil',
      name: 'Tulsi (Holy Basil)',
      sanskrit_name: 'Surasa / Tulasi',
      botanical_name: 'Ocimum sanctum / Ocimum tenuiflorum',
      category: 'Respiratory & Immunomodulatory Herb',
      common_uses: 'Seasonal flu, cold, sore throat, allergic rhinitis, stress, mild respiratory congestion',
      why_suggested: 'Classified in Ayurveda as a prime Svasahara (alleviating respiratory discomfort) and Deepana-Pachana herb that dispels cold Kapha accumulation.',
      potential_benefits: 'Relieves nasal congestion, acts as a gentle expectorant, provides antioxidant support, soothes throat irritation, supports daily adaptogenic resilience.',
      scientific_evidence: 'Laboratory and preliminary human studies (Journal of Ayurveda and Integrative Medicine, 2014) report antimicrobial, antiviral, and mild bronchodilatory properties attributed to eugenol and rosmarinic acid.',
      evidence_level: 'Moderate Preliminary Evidence',
      scientific_limitations: 'Many therapeutic claims are derived from animal and in-vitro models. Large-scale human clinical trials on acute respiratory infections remain limited.',
      possible_side_effects: 'Generally very well tolerated. Mild heartburn or nausea if consumed in extreme excess on an empty stomach.',
      who_should_avoid: 'Individuals trying to conceive or pregnant (animal studies noted mild antifertility effects in high doses). Avoid before surgeries due to mild anti-platelet activity.',
      safe_usage: 'Boil 5-7 fresh, washed Tulsi leaves or 1/2 teaspoon dried leaf powder in 1.5 cups of water for 5 minutes. Strain and sip warm twice daily. Add 1 crushed black peppercorn and 1/2 teaspoon honey once warm.',
      when_to_consult_doctor: 'If breathing becomes labored or wheezing occurs, fever stays above 101°F for over 3 days, or you develop severe chest heaviness.',
      herb_interactions: 'May slow blood clotting; use caution when taken concurrently with blood-thinners like Aspirin, Clopidogrel, or Warfarin.',
      dosha_effect: 'Balances Vata and Kapha; slightly increases Pitta due to pungent taste (Katu) and warm potency.',
      hindi_name: 'तुलसी (Tulsi)',
      marathi_name: 'तुळस (Tulas)',
      image_emoji: '🍃'
    },
    {
      id: 'triphala',
      name: 'Triphala (Three Sacred Fruits)',
      sanskrit_name: 'Triphala (Amalaki, Haritaki, Bibhitaki)',
      botanical_name: 'Phyllanthus emblica, Terminalia chebula, Terminalia bellirica',
      category: 'Digestive & Bowel Tonic (Anulomana)',
      common_uses: 'Occasional constipation, irregular bowel movements, indigestion, gas, bloating, gentle detoxification',
      why_suggested: 'Classical formulation balancing all three doshas (Tridoshahara). It tones colon musculature without inducing chronic dependence unlike harsh chemical laxatives.',
      potential_benefits: 'Promotes regular healthy bowel evacuation, acts as a prebiotic fostering gut microbiome diversity, provides abundant Vitamin C and polyphenols.',
      scientific_evidence: 'Clinical trials (The Journal of Alternative and Complementary Medicine, 2017) confirm mild laxative, pro-kinetic, and antioxidant properties. Acts by osmotic softening and stimulating peristalsis.',
      evidence_level: 'High Evidence for Mild Functional Constipation',
      scientific_limitations: 'Not suitable for acute bowel obstruction, severe impaction, or inflammatory bowel disease flare-ups. Clinical data mainly focus on short-to-medium term use.',
      possible_side_effects: 'Abdominal cramps, loose watery stools, dehydration if taken in excess or with insufficient fluid intake.',
      who_should_avoid: 'Pregnant women (Haritaki has mild downward clearing downward Apana vayu effect that could induce uterine cramping), nursing mothers, people with active diarrhea or dysentery.',
      safe_usage: 'Take 1/2 to 1 teaspoon (3 to 5g) of Triphala Churna with warm water at bedtime, at least 1 hour after dinner. For sensitive stomachs, start with 1/4 teaspoon.',
      when_to_consult_doctor: 'If you have blood in stool, severe abdominal cramping, unexplained weight loss, or constipation persisting longer than 2 weeks.',
      herb_interactions: 'May interfere with absorption of certain oral medications if taken simultaneously. Space at least 2 hours apart from prescription drugs.',
      dosha_effect: 'Tridoshic (Balances Vata, Pitta, and Kapha equally).',
      hindi_name: 'त्रिफला (Triphala)',
      marathi_name: 'त्रिफळा (Triphala)',
      image_emoji: '🥣'
    },
    {
      id: 'ginger-shunthi',
      name: 'Dry & Fresh Ginger (Shunthi / Adrak)',
      sanskrit_name: 'Shunthi / Ardraka',
      botanical_name: 'Zingiber officinale',
      category: 'Digestive Fire Booster (Deepana-Pachana)',
      common_uses: 'Indigestion, nausea, morning sickness, motion sickness, cold hands/feet, loss of appetite, bloating',
      why_suggested: 'One of the most praised herbs in Ayurveda ("Vishwa Bheshaja" - Universal Medicine). Rekindles Agni (digestive fire) and burns Ama (metabolic toxins).',
      potential_benefits: 'Relieves gastric distension, alleviates nausea and vomiting, speeds gastric emptying, improves salivary and digestive enzyme secretion.',
      scientific_evidence: 'Systematic reviews and meta-analyses (Integrative Medicine Insights, 2016) strongly substantiate ginger for nausea in pregnancy, post-chemotherapy, and mild dysmenorrhea.',
      evidence_level: 'Very High Evidence (for Nausea & Gastro-kinetics)',
      scientific_limitations: 'Excessive consumption can irritate esophageal lining and trigger acid reflux in susceptible individuals with GERD.',
      possible_side_effects: 'Heartburn, oral irritation, mild diarrhea, burping.',
      who_should_avoid: 'Active gastric or duodenal ulcers, severe acid reflux/GERD, gallstones, and patients with active bleeding tendencies.',
      safe_usage: 'Fresh ginger: A thin coin-sized slice with a pinch of rock salt and drop of lemon before meals. Dried ginger (Shunthi): 1/4 to 1/2 teaspoon boiled in warm water after meals.',
      when_to_consult_doctor: 'If nausea is severe, accompanied by persistent vomiting causing dehydration, severe localized abdominal pain, or jaundice.',
      herb_interactions: 'High medicinal doses may potentiate antithrombotic medications (Warfarin, Clopidogrel) and increase hypoglycemic effect of diabetes treatments.',
      dosha_effect: 'Fresh ginger reduces Vata and Kapha, may elevate Pitta. Dry ginger is less heating and milder on Pitta.',
      hindi_name: 'अदरक / सोंठ (Adrak / Sonth)',
      marathi_name: 'आले / सुंठ (Aale / Sunth)',
      image_emoji: '🫚'
    },
    {
      id: 'giloy-guduchi',
      name: 'Giloy / Guduchi (Amrita)',
      sanskrit_name: 'Guduchi (Amrita)',
      botanical_name: 'Tinospora cordifolia',
      category: 'Immune Modulator & Pyretic Relief',
      common_uses: 'Recurrent seasonal viral fevers, fatigue, chronic allergies, high uric acid (gout), liver protection',
      why_suggested: 'Called "Amrita" (nectar of immortality) in Ayurveda. It digests Ama without overheating the body, uniquely possessing both bitter taste (Tikta) and warming yet rejuvenating properties.',
      potential_benefits: 'Strengthens host defense response, purifies blood (Rakta Shodhaka), reduces low-grade lingering fever (Jwaraghna), supports healthy liver metabolism.',
      scientific_evidence: 'Indian Council of Medical Research (ICMR) and international studies show macrophage stimulation and mild antipyretic/antihistaminic effects in controlled settings.',
      evidence_level: 'Moderate Evidence for Immunostimulation',
      scientific_limitations: 'High doses from unregulated sources or misidentified Tinospora species (such as Tinospora crispa) have been linked to drug-induced liver injury. Must only be taken from certified suppliers under guidance.',
      possible_side_effects: 'Constipation in high doses, mild drop in blood sugar, very rare hepatotoxicity when contaminated or misused.',
      who_should_avoid: 'Individuals with preexisting chronic liver disease (without hepatologist/Ayush clearance), pregnant and lactating women, autoimmune disorders.',
      safe_usage: 'Decoction (Kwatha): 10-15ml freshly prepared or 1-2 tablets of standardized Giloy extract daily for no more than 4-6 weeks continuously.',
      when_to_consult_doctor: 'High-grade fever (> 102°F), fever lasting more than 48 hours, rash, yellowish discoloration of eyes/skin (jaundice), or extreme lethargy.',
      herb_interactions: 'Can lower blood sugar; monitor glucose closely if taking insulin or oral hypoglycemics. May stimulate the immune system, reducing immunosuppressant drug efficacy.',
      dosha_effect: 'Tridosha shamaka - especially calms Pitta and Kapha.',
      hindi_name: 'गिलोय (Giloy)',
      marathi_name: 'गुळवेल (Gulvel)',
      image_emoji: '🌿'
    },
    {
      id: 'brahmi',
      name: 'Brahmi (Water Hyssop)',
      sanskrit_name: 'Brahmi',
      botanical_name: 'Bacopa monnieri',
      category: 'Brain & Nervous System Tonic (Medhya Rasayana)',
      common_uses: 'Mental fatigue, lack of focus, memory support, work-related stress, restlessness, mild ADHD symptoms',
      why_suggested: 'Classical Medhya herb that fosters Pitta-Vata balance in the brain (Prana Vayu and Sadhaka Pitta), enhancing memory acquisition (Dhi), retention (Dhriti), and recall (Smriti).',
      potential_benefits: 'Enhances cognitive processing speed, reduces neuro-inflammation, provides neuroprotection through bacosides, soothes mental anxiety.',
      scientific_evidence: 'Systematic reviews (Neuropsychopharmacology, 2012) show significant improvements in word recall and attention tasks after 8 to 12 weeks of sustained supplementation.',
      evidence_level: 'High Clinical Evidence (Cognitive retention)',
      scientific_limitations: 'Effects are cumulative and require 6 to 12 weeks of daily intake; not a fast-acting stimulant like caffeine.',
      possible_side_effects: 'Nausea, increased intestinal motility, dry mouth, mild abdominal cramps when taken on an empty stomach.',
      who_should_avoid: 'Bradycardia (slow heart rate), gastrointestinal tract blockages, active peptic ulcer, hyperthyroidism.',
      safe_usage: 'Take with ghee or milk after food to enhance absorption of lipid-soluble bacosides. Powder: 1 to 2g daily. Standardized bacoside extract: 300mg/day.',
      when_to_consult_doctor: 'Severe memory loss interfering with daily living, sudden cognitive confusion, severe clinical depression or panic disorders.',
      herb_interactions: 'May increase acetylcholine levels; caution with anticholinergic drugs, Alzheimer treatments (donepezil), and thyroid medications.',
      dosha_effect: 'Balances all three doshas, particularly Pitta and Vata.',
      hindi_name: 'ब्राह्मी (Brahmi)',
      marathi_name: 'ब्राह्मी (Brahmi)',
      image_emoji: '🧠'
    },
    {
      id: 'licorice-yashtimadhu',
      name: 'Licorice Root (Yashtimadhu / Mulethi)',
      sanskrit_name: 'Yashtimadhu',
      botanical_name: 'Glycyrrhiza glabra',
      category: 'Throat & Mucosal Protectant',
      common_uses: 'Dry throat, hoarseness of voice, sore throat, acid peptic disorders, gastritis, dry irritated cough',
      why_suggested: 'Sweet (Madhura Rasa) and cooling (Sheeta Virya), Yashtimadhu coats inflamed mucous membranes, soothing irritated tissues in the respiratory and gastric tracts.',
      potential_benefits: 'Provides immediate soothing relief to irritated vocal cords and pharynx, inhibits ulcer formation, aids respiratory expectoration.',
      scientific_evidence: 'Deglycyrrhizinated licorice (DGL) and licorice compounds show verified demulcent and mucosal healing properties in clinical and observational studies.',
      evidence_level: 'Moderate Clinical Evidence',
      scientific_limitations: 'Whole licorice contains glycyrrhizin, which when taken in high doses or for extended periods (> 4 weeks) causes pseudoaldosteronism: potassium depletion, fluid retention, and dangerous blood pressure spikes.',
      possible_side_effects: 'Hypokalemia, high blood pressure, fluid retention, headache with long-term unmonitored use.',
      who_should_avoid: 'People with hypertension (high blood pressure), congestive heart failure, severe kidney disease, liver cirrhosis, and during pregnancy.',
      safe_usage: 'For sore throat: Chew a small piece of natural mulethi root stick, or mix 1/4 teaspoon powder with 1/2 teaspoon honey for gargle or slow swallowing. Do not use continuously for more than 2-3 weeks.',
      when_to_consult_doctor: 'Inability to swallow liquids, voice loss exceeding 10 days, severe burning pain radiating to chest/back, or persistent vomiting.',
      herb_interactions: 'Interacts dangerously with antihypertensive medications (weakens their effect), potassium-wasting diuretics (Furosemide, Hydrochlorothiazide), Corticosteroids, and Digoxin.',
      dosha_effect: 'Pacifies Vata and Pitta; in excess may elevate Kapha due to unctuous and heavy nature.',
      hindi_name: 'मुलेठी (Mulethi)',
      marathi_name: 'ज्येष्ठमध (Jyeshthamadh)',
      image_emoji: '🪵'
    }
  ];

  for (const r of remediesData) {
    insertRemedy.run(
      r.id, r.name, r.sanskrit_name, r.botanical_name, r.category, r.common_uses,
      r.why_suggested, r.potential_benefits, r.scientific_evidence, r.evidence_level,
      r.scientific_limitations, r.possible_side_effects, r.who_should_avoid,
      r.safe_usage, r.when_to_consult_doctor, r.herb_interactions, r.dosha_effect,
      r.hindi_name, r.marathi_name, r.image_emoji
    );
  }

  // 2. SEED HERB-DRUG INTERACTIONS
  const insertInteraction = db.prepare(`
    INSERT INTO herb_drug_interactions (herb_name, drug_class, drug_examples, severity, interaction_mechanism, clinical_recommendation)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const interactionsData = [
    {
      herb_name: 'Turmeric (Curcumin)',
      drug_class: 'Anticoagulants / Antiplatelets (Blood Thinners)',
      drug_examples: 'Warfarin, Aspirin, Clopidogrel, Enoxaparin, Rivaroxaban',
      severity: 'Moderate to High',
      interaction_mechanism: 'Curcumin inhibits platelet aggregation and may prolong bleeding time and international normalized ratio (INR).',
      clinical_recommendation: 'Avoid concentrated therapeutic curcumin extracts while taking blood thinners. Moderate dietary culinary turmeric in curry is generally safe. Inform your cardiologist.'
    },
    {
      herb_name: 'Turmeric (Curcumin)',
      drug_class: 'Antidiabetic Drugs (Hypoglycemics)',
      drug_examples: 'Metformin, Glimepiride, Gliclazide, Insulin',
      severity: 'Moderate',
      interaction_mechanism: 'Curcumin enhances insulin sensitivity and lowers blood glucose, potentially causing unexpected hypoglycemia.',
      clinical_recommendation: 'Monitor blood glucose levels frequently when initiating turmeric supplements. Dose titration of prescription medication may be required.'
    },
    {
      herb_name: 'Ashwagandha',
      drug_class: 'Sedatives / Anxiolytics (CNS Depressants)',
      drug_examples: 'Clonazepam, Lorazepam, Zolpidem, Alprazolam',
      severity: 'Moderate',
      interaction_mechanism: 'Ashwagandha possesses GABA-mimetic properties that can augment the sedative and hypnotic effects of central nervous system depressants.',
      clinical_recommendation: 'Do not combine without prescribing doctor approval; may cause extreme daytime drowsiness and impaired motor coordination.'
    },
    {
      herb_name: 'Ashwagandha',
      drug_class: 'Thyroid Hormone Replacements',
      drug_examples: 'Levothyroxine (Eltroxin, Thyronorm)',
      severity: 'Moderate',
      interaction_mechanism: 'Ashwagandha stimulates endogenous T3 and T4 synthesis, which can push patients on thyroid medication into mild hyperthyroidism.',
      clinical_recommendation: 'Check TSH, free T3, and free T4 levels within 4 weeks if starting Ashwagandha while on thyroid supplementation.'
    },
    {
      herb_name: 'Licorice (Mulethi / Yashtimadhu)',
      drug_class: 'Antihypertensives (Blood Pressure Medicines)',
      drug_examples: 'Amlodipine, Telmisartan, Losartan, Enalapril, Atenolol',
      severity: 'High',
      interaction_mechanism: 'Glycyrrhizin inhibits 11-beta-hydroxysteroid dehydrogenase, leading to sodium and water retention and potassium wasting, directly opposing blood pressure medications.',
      clinical_recommendation: 'Contraindicated in patients with diagnosed hypertension. Use DGL (deglycyrrhizinated licorice) instead if gastro-protective properties are needed.'
    },
    {
      herb_name: 'Licorice (Mulethi / Yashtimadhu)',
      drug_class: 'Diuretics (Water Pills)',
      drug_examples: 'Furosemide (Lasix), Hydrochlorothiazide, Torsemide',
      severity: 'Severe',
      interaction_mechanism: 'Both diuretics and licorice deplete systemic potassium; combination can trigger severe hypokalemia and fatal cardiac arrhythmias.',
      clinical_recommendation: 'Never take whole licorice root preparations concurrently with potassium-wasting diuretics.'
    },
    {
      herb_name: 'Giloy (Guduchi)',
      drug_class: 'Immunosuppressive Drugs',
      drug_examples: 'Prednisone, Methotrexate, Azathioprine, Tacrolimus, Cyclosporine',
      severity: 'Moderate',
      interaction_mechanism: 'Giloy stimulates immune cell proliferation (macrophages, T-cells), counteracting the intended pharmacological suppression.',
      clinical_recommendation: 'Patients with organ transplants or active autoimmune diseases under immunosuppressant therapy should strictly avoid Giloy.'
    },
    {
      herb_name: 'Triphala',
      drug_class: 'Oral Medications (Broad spectrum)',
      drug_examples: 'Oral antibiotics, Antiepileptics, Oral Contraceptives',
      severity: 'Mild to Moderate',
      interaction_mechanism: 'Tannins in Triphala can bind to oral drugs in the stomach, and its pro-kinetic effect can accelerate intestinal transit, decreasing drug absorption.',
      clinical_recommendation: 'Separate intake of Triphala and any essential pharmaceutical drug by a minimum window of 2 to 3 hours.'
    }
  ];

  for (const item of interactionsData) {
    insertInteraction.run(item.herb_name, item.drug_class, item.drug_examples, item.severity, item.interaction_mechanism, item.clinical_recommendation);
  }

  // 3. SEED DOCTORS
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (
      id, name, qualification, registration_no, specialization,
      experience_years, clinic_name, city, state, languages,
      consultation_fee, rating, total_reviews, available_modes, bio, image_gender
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const doctorsData = [
    {
      id: 'dr-ananya-sharma',
      name: 'Dr. Ananya Sharma',
      qualification: 'BAMS, MD (Kayachikitsa - Internal Medicine)',
      registration_no: 'AYUSH-DEL-89421',
      specialization: 'Internal Medicine & Chronic Digestive Disorders',
      experience_years: 14,
      clinic_name: 'Shree Dhanwantari Ayurvedic Healing Centre',
      city: 'New Delhi',
      state: 'Delhi',
      languages: 'Hindi, English, Punjabi',
      consultation_fee: 600,
      rating: 4.9,
      total_reviews: 320,
      available_modes: 'Online Video, In-Clinic',
      bio: 'Former Senior Resident at All India Institute of Ayurveda (AIIA). Specializes in integrative management of IBS, GERD, fatty liver, and metabolic disorders using traditional pulse diagnosis (Nadi Pariksha) and research-backed phytotherapy.',
      image_gender: 'female'
    },
    {
      id: 'dr-rajesh-kulkarni',
      name: 'Dr. Rajesh Kulkarni',
      qualification: 'BAMS, MD (Panchakarma), PhD (Ayur)',
      registration_no: 'MCIM-MAH-44120',
      specialization: 'Panchakarma & Musculoskeletal Disorders',
      experience_years: 21,
      clinic_name: 'Kulkarni Panchakarma & Joint Care Hospital',
      city: 'Pune',
      state: 'Maharashtra',
      languages: 'Marathi, Hindi, English',
      consultation_fee: 800,
      rating: 4.9,
      total_reviews: 480,
      available_modes: 'Online Video, In-Clinic',
      bio: 'Renowned Ayurvedic physician and researcher specializing in osteo-arthritis, sciatica, spondylitis, and systemic detox therapies. Emphasizes evidence-based rehabilitation protocols and dietary modifications.',
      image_gender: 'male'
    },
    {
      id: 'dr-meenakshi-sundaram',
      name: 'Dr. Meenakshi Sundaram',
      qualification: 'BAMS, MD (Dravyaguna - Pharmacology)',
      registration_no: 'TN-AYUSH-19842',
      specialization: 'Herbal Medicine, Women’s Health & Hormonal Balance',
      experience_years: 11,
      clinic_name: 'Amrita Ayurvedic Care & Research Clinic',
      city: 'Chennai',
      state: 'Tamil Nadu',
      languages: 'Tamil, English, Hindi',
      consultation_fee: 550,
      rating: 4.8,
      total_reviews: 215,
      available_modes: 'Online Video',
      bio: 'Expert in herbal pharmacology and hormonal wellness. Focuses on PCOS, menstrual irregularities, thyroid harmony, and perimenopausal support through gentle herbal decoctions and Dinacharya routines.',
      image_gender: 'female'
    },
    {
      id: 'dr-vikram-singh',
      name: 'Dr. Vikram Singh Rathore',
      qualification: 'BAMS, MS (Shalya Tantra - Ayurvedic Surgery & Proctology)',
      registration_no: 'RAJ-AY-55210',
      specialization: 'Anorectal Diseases & Lifestyle Disorders',
      experience_years: 16,
      clinic_name: 'Rathore Ayur-Ksharsutra Specialist Hospital',
      city: 'Jaipur',
      state: 'Rajasthan',
      languages: 'Hindi, Rajasthani, English',
      consultation_fee: 700,
      rating: 4.7,
      total_reviews: 190,
      available_modes: 'Online Video, In-Clinic',
      bio: 'Pioneer in non-surgical and Ksharsutra treatments for piles, fissures, and chronic lifestyle metabolic ailments. Author of multiple peer-reviewed clinical monographs on gut wellness.',
      image_gender: 'male'
    },
    {
      id: 'dr-priya-nair',
      name: 'Dr. Priya Nair',
      qualification: 'BAMS, PGD (Ayurvedic Nutrition & Mental Health)',
      registration_no: 'KERALA-AY-31092',
      specialization: 'Stress Management, Sleep Disorders & Skin Health',
      experience_years: 9,
      clinic_name: 'Kerala Traditional Ayur-Wellness Sanatorium',
      city: 'Kochi',
      state: 'Kerala',
      languages: 'Malayalam, English, Hindi',
      consultation_fee: 500,
      rating: 4.9,
      total_reviews: 260,
      available_modes: 'Online Video, In-Clinic',
      bio: 'Trained in classical Kerala Panchakarma and Ayurvedic psychosomatic medicine (Sattvavajaya Chikitsa). Helps patients with chronic fatigue, insomnia, anxiety, and eczema through holistic balance.',
      image_gender: 'female'
    }
  ];

  for (const d of doctorsData) {
    insertDoctor.run(
      d.id, d.name, d.qualification, d.registration_no, d.specialization,
      d.experience_years, d.clinic_name, d.city, d.state, d.languages,
      d.consultation_fee, d.rating, d.total_reviews, d.available_modes, d.bio, d.image_gender
    );
  }

  // 4. SEED SYMPTOMS DATA
  const insertSymptom = db.prepare(`
    INSERT INTO symptoms_data (
      id, name, hindi_name, body_system, description, red_flags,
      ayurvedic_dosha, recommended_remedy_ids, diet_lifestyle_tips, when_to_seek_urgent_care
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const symptomsData = [
    {
      id: 'cough-and-cold',
      name: 'Cough, Cold & Sore Throat',
      hindi_name: 'खांसी, जुकाम और गले में खराश',
      body_system: 'Respiratory System (Pranavaha Srotas)',
      description: 'Common seasonal infection, dry hacking cough, mucosal irritation, or runny nose.',
      red_flags: 'Coughing up blood (hemoptysis), difficulty breathing or wheezing, chest pain, blue lips/fingertips, fever exceeding 102°F lasting over 48 hours.',
      ayurvedic_dosha: 'Kapha-Vata imbalance causing obstruction in chest and throat passages (Pranavaha Srotorodha).',
      recommended_remedy_ids: 'turmeric-haldi,tulsi-holy-basil,licorice-yashtimadhu',
      diet_lifestyle_tips: 'Drink warm water exclusively; avoid cold water, ice cream, curd, and heavy oily food. Practice warm saline gargling with turmeric twice daily. Keep chest warm.',
      when_to_seek_urgent_care: 'Immediate medical triage is required if breathing is difficult, you feel dizzy, or sputum contains dark blood.'
    },
    {
      id: 'digestive-acidity-bloating',
      name: 'Acidity, Gas & Bloating',
      hindi_name: 'एसिडिटी, गैस और पेट फूलना',
      body_system: 'Gastrointestinal System (Annavaha Srotas)',
      description: 'Heartburn, sour belching, epigastric burning, abdominal distension, post-meal heaviness.',
      red_flags: 'Severe crushing chest pain mimicking heart attack, vomiting blood or coffee-ground material, black tarry stools, sudden severe abdominal rigidity.',
      ayurvedic_dosha: 'Pitta-Vata imbalance with weak digestive fire (Mandaagni) leading to toxic ferment (Ama).',
      recommended_remedy_ids: 'ginger-shunthi,triphala',
      diet_lifestyle_tips: 'Eat at fixed times. Avoid spicy chili, deep-fried snacks, and carbonated beverages. Sip cumin-coriander-fennel (CCF) water throughout the day. Do not lie down immediately after eating.',
      when_to_seek_urgent_care: 'If burning sensation radiates to left arm or jaw (cardiac warning), or if abdominal pain is acute, constant, and accompanied by fever.'
    },
    {
      id: 'joint-pain-stiffness',
      name: 'Joint Pain & Morning Stiffness',
      hindi_name: 'जोड़ों का दर्द और अकड़न',
      body_system: 'Musculoskeletal System (Asthivaha & Sandhivaha Srotas)',
      description: 'Pain, cracking, or reduced mobility in knees, shoulders, or small joints.',
      red_flags: 'Joint that is hot, visibly swollen, bright red, accompanied by high fever (septic arthritis warning), inability to bear weight after a fall or trauma.',
      ayurvedic_dosha: 'Sandhigata Vata (dryness and degeneration) or Amavata (toxic accumulation causing inflammatory stiffness).',
      recommended_remedy_ids: 'turmeric-haldi,ashwagandha',
      diet_lifestyle_tips: 'Gentle warm sesame oil (Mahanarayan Taila) application. Avoid cold, dry, processed foods and refrigerated drinks. Consume warm, moist, soupy foods. Gentle mobility stretches.',
      when_to_seek_urgent_care: 'Sudden joint redness, intense heat, fever, or deformity after an injury.'
    },
    {
      id: 'stress-anxiety-insomnia',
      name: 'Stress, Mental Fatigue & Poor Sleep',
      hindi_name: 'तनाव, चिंता और अनिद्रा (नींद न आना)',
      body_system: 'Nervous & Mind System (Manovaha Srotas)',
      description: 'Racing thoughts at night, difficulty falling asleep, restlessness, irritability, and exhaustion.',
      red_flags: 'Severe persistent depression, thoughts of self-harm or suicide, severe panic attacks with hyperventilation, hallucinations or cognitive disorientation.',
      ayurvedic_dosha: 'Prana Vata aggravation disturbing the seat of mind (Hridaya & Shiras) and depleting Ojas.',
      recommended_remedy_ids: 'ashwagandha,brahmi',
      diet_lifestyle_tips: 'Practice Pada-abhyanga (massaging warm sesame oil or ghee onto soles of feet before bed). Digital curfew: no screens 1 hour before sleep. Warm nutmeg-infused milk at night.',
      when_to_seek_urgent_care: 'Crisis situation involving suicidal thoughts: Call tele-MANAS national helpline (14416) or emergency 112.'
    },
    {
      id: 'fatigue-low-immunity',
      name: 'Chronic Fatigue & Recurrent Infections',
      hindi_name: 'लगातार थकान और बार-बार बीमार पड़ना',
      body_system: 'Immune & Vital Energy (Rasavaha Srotas / Ojas)',
      description: 'Waking up unrefreshed, catching frequent seasonal colds, generalized weakness, lack of vitality.',
      red_flags: 'Unexplained significant weight loss, night sweats, palpable painless swollen lymph nodes, chronic low-grade fever lasting over 3 weeks.',
      ayurvedic_dosha: 'Depletion of Dhatus (tissues) and diminished Ojas (core immunity) due to unmanaged Ama.',
      recommended_remedy_ids: 'giloy-guduchi,ashwagandha,triphala',
      diet_lifestyle_tips: 'Nutritious diet with soaked almonds, dates, freshly cooked kitchari, and seasonal vegetables. Avoid stale leftover food and cold fast food. Ensure 7-8 hours restful sleep.',
      when_to_seek_urgent_care: 'Unexplained rapid weight loss, chronic fever, severe pallor, or shortness of breath on mild exertion.'
    }
  ];

  for (const s of symptomsData) {
    insertSymptom.run(
      s.id, s.name, s.hindi_name, s.body_system, s.description,
      s.red_flags, s.ayurvedic_dosha, s.recommended_remedy_ids,
      s.diet_lifestyle_tips, s.when_to_seek_urgent_care
    );
  }

  // 5. SEED ARTICLES
  const insertArticle = db.prepare(`
    INSERT INTO articles (
      id, title, hindi_title, category, summary, content,
      read_time, scientific_perspective, traditional_perspective, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const articlesData = [
    {
      id: 'understanding-tridosha',
      title: 'Demystifying the Three Doshas: Vata, Pitta, and Kapha',
      hindi_title: 'त्रिदोष को समझें: वात, पित्त और कफ का सरल परिचय',
      category: 'Ayurvedic Fundamentals',
      summary: 'Learn what the biological energies (Doshas) represent in human physiology, how to recognize an imbalance, and how they govern our mind and body.',
      content: `In Ayurveda, human biology is understood through three primary functional principles called Tridosha: Vata (Movement & Nervous system), Pitta (Transformation, Metabolism & Digestion), and Kapha (Structure, Lubrication & Immunity).

1. VATA (Ether + Air): Governs circulation, respiration, neural transmission, and elimination. When balanced, it brings creativity, agility, and enthusiasm. When aggravated by stress, cold dry weather, or irregular sleep, it manifests as anxiety, insomnia, dry skin, constipation, and joint stiffness.

2. PITTA (Fire + Water): Governs cellular metabolism, enzymatic digestion, body temperature, and intelligence. When balanced, it yields sharp intellect, good appetite, and warm radiance. When aggravated by fiery foods, alcohol, or unresolved anger, it triggers acidity, skin inflammation, burning sensations, and ulcers.

3. KAPHA (Water + Earth): Governs physical stability, joint lubrication, mucosal protection, and tissue cohesion. When balanced, it gives physical endurance, calm patience, and strong immunity. When aggravated by excessive sleep, cold dairy, and sedentariness, it results in lethargy, congestion, weight gain, and slow metabolism.

Understanding your unique constitutional baseline (Prakriti) empowers you to make mindful daily dietary and lifestyle choices to prevent illness before it manifests.`,
      read_time: '5 min read',
      scientific_perspective: 'Modern genomic research (e.g., Ayurgenomics studies published in Scientific Reports / Nature) shows distinct correlation between Ayurvedic Prakriti phenotypes and specific genetic markers, metabolic profiles, and inflammatory response tendencies.',
      traditional_perspective: 'Derived from Charaka Samhita Sutrasthana Chapter 1: The harmonious equilibrium of Dosha, Dhatu, and Mala constitutes health (Swastha), while their disequilibrium constitutes disease.',
      tags: 'Fundamentals, Dosha, Wellness, Prakriti'
    },
    {
      id: 'dinacharya-daily-routine',
      title: 'Dinacharya: The Ancient Science of Daily Circadian Rhythm',
      hindi_title: 'दिनचर्या: स्वस्थ जीवन के लिए दैनिक समय सारणी',
      category: 'Lifestyle & Prevention',
      summary: 'Discover how synchronizing your wake, meal, work, and sleep cycles with nature’s biological clock optimizes hormonal health and digestive vitality.',
      content: `Ayurveda discovered circadian rhythms thousands of years before modern chronobiology won the 2017 Nobel Prize. Dinacharya represents the daily regimen designed to keep the biological clock tuned.

- 06:00 AM - 10:00 AM (Kapha Period): Earth and water dominate. Best time for exercise (Vyayama), warm bath, and clearing respiratory passages.
- 10:00 AM - 02:00 PM (Pitta Period): The sun reaches its peak; your digestive fire (Jatharagni) is at its strongest. Eat your primary, most nourishing meal of the day here.
- 02:00 PM - 06:00 PM (Vata Period): Time of lightness and mental agility. Ideal for creative, intellectual work and light hydration.
- 06:00 PM - 10:00 PM (Kapha Period): Sunset brings settling heavy energy. Eat a light dinner before 07:30 PM. Wind down screens. As Kapha peaks around 10:00 PM, natural sleepiness arrives.
- 10:00 PM - 02:00 AM (Pitta Period): Time for cellular repair, liver detoxification, and mental processing during deep sleep. If awake past 10 PM, a "second wind" of hunger and restlessness occurs.
- 02:00 AM - 06:00 AM (Vata Period): Movement and lightness awaken. Waking before or around sunrise (Brahma Muhurta) brings mental clarity.`,
      read_time: '6 min read',
      scientific_perspective: 'Aligning meals and light exposure with circadian clocks modulates Melatonin, Cortisol, and insulin sensitivity, reducing the incidence of metabolic syndrome and cardiovascular risk.',
      traditional_perspective: 'Ashtanga Hridaya emphasizes: One who desires a long, healthy life must observe the daily routine (Dinacharya) diligently to maintain systemic homeostasis.',
      tags: 'Circadian Rhythm, Sleep, Digestion, Prevention'
    },
    {
      id: 'herb-safety-guide',
      title: 'Herbal Safety & Modern Medicine: Why "Natural" Does Not Mean "Harmless"',
      hindi_title: 'जड़ी-बूटी सुरक्षा: "प्राकृतिक" का अर्थ "हानिरहित" नहीं होता',
      category: 'Medical Safety & Integration',
      summary: 'A critical guide on active phytochemicals, drug-herb interactions, heavy metal testing, and how to safely combine traditional herbs with allopathic prescriptions.',
      content: `One of the most dangerous myths in modern healthcare is that herbal supplements are automatically safe because they come from plants.

Real plants contain hundreds of active pharmacological substances. When concentrated into extracts or consumed in excess, they exert real biochemical effects on liver enzymes (CYP450 pathways), kidney excretion, and cardiovascular receptors.

CRITICAL RULES FOR SAFE USAGE:
1. Never stop or modify life-sustaining prescription medications (like insulin, antihypertensives, or anti-epileptic drugs) on your own.
2. Beware of heavy metal contamination: Always select products certified with AYUSH Standard Mark, GMP (Good Manufacturing Practice), and third-party laboratory heavy metal testing for Lead, Mercury, Arsenic, and Cadmium.
3. Disclose all herbs to your treating doctor: Always tell your allopathic physician and surgeon what herbal formulations you take. Many herbs (Garlic, Guggulu, Turmeric, Ginkgo) must be halted 2 weeks before surgery to prevent excess bleeding.
4. Pregnant and nursing women require extreme caution: Many traditional herbs cross the placenta or stimulate uterine contractions. Never self-prescribe during pregnancy.
5. Respect dosage guidelines: In Ayurveda, "Matra" (precise dosage) is paramount. More is not better; excessive dosage can turn nectar into toxin.`,
      read_time: '7 min read',
      scientific_perspective: 'Pharmacovigilance in herbal medicine is essential. Regulatory bodies like the Ministry of Ayush and WHO emphasize standardized testing to prevent herb-induced liver injury (HILI) and nephrotoxicity.',
      traditional_perspective: 'Charaka Samhita states: "Even acute poison can act as excellent medicine when administered properly by a knowledgeable physician; while the best medicine becomes poison if mismanaged or abused."',
      tags: 'Safety, Pharmacology, Drug Interactions, Quality'
    }
  ];

  for (const a of articlesData) {
    insertArticle.run(
      a.id, a.title, a.hindi_title, a.category, a.summary, a.content,
      a.read_time, a.scientific_perspective, a.traditional_perspective, a.tags
    );
  }

  // 6. SEED MYTHS VS FACTS
  const insertMyth = db.prepare(`
    INSERT INTO myths_facts (myth, hindi_myth, fact, hindi_fact, explanation, clinical_reference)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const mythsData = [
    {
      myth: 'Ayurvedic medicines have zero side effects because they are 100% natural.',
      hindi_myth: 'आयुर्वेदिक दवाओं का कोई साइड इफेक्ट नहीं होता क्योंकि वे पूरी तरह प्राकृतिक हैं।',
      fact: 'Ayurvedic herbs contain active pharmacological compounds that can cause adverse reactions if overdosed, taken incorrectly, or taken with conflicting drugs.',
      hindi_fact: 'आयुर्वेदिक जड़ी-बूटियों में सक्रिय औषधीय यौगिक होते हैं। गलत मात्रा या गलत तरीके से लेने पर इनके भी दुष्प्रभाव हो सकते हैं।',
      explanation: 'Nature produces both healing substances and potent toxins. Even harmless herbs like Licorice can spike blood pressure, and improper Giloy use has been linked to liver stress. Proper diagnosis by a qualified BAMS/MD Vaidya is essential.',
      clinical_reference: 'World Health Organization (WHO) Guidelines on Safety Monitoring of Herbal Medicines.'
    },
    {
      myth: 'You should immediately stop all modern blood pressure and diabetes medicines when starting Ayurveda.',
      hindi_myth: 'आयुर्वेद शुरू करते ही ब्लड प्रेशर और शुगर की एलोपैथिक दवाएं तुरंत बंद कर देनी चाहिए।',
      fact: 'Abruptly stopping prescribed chronic medications can cause fatal rebound hypertension, diabetic ketoacidosis, or stroke.',
      hindi_fact: 'डॉक्टर की सलाह के बिना अचानक एलोपैथिक दवाएं बंद करने से अचानक बीपी या शुगर का खतरनाक उछाल आ सकता है।',
      explanation: 'Ayurveda works in synergy with modern care for long-term lifestyle reversal. Any reduction in allopathic medicine must be gradual, monitored with diagnostic lab tests, and guided by your treating physician.',
      clinical_reference: 'Indian Council of Medical Research (ICMR) Integrative Healthcare Consensus.'
    },
    {
      myth: 'All Ayurvedic treatments take years to show any results.',
      hindi_myth: 'आयुर्वेदिक इलाज का असर दिखने में कई साल लग जाते हैं।',
      fact: 'Acute ailments (mild indigestion, throat irritation, nasal congestion) often respond within hours to days with appropriate herbs and diet; chronic systemic conditions take 4 to 12 weeks.',
      hindi_fact: 'खांसी, अपच और गले की खराश जैसी समस्याओं में कुछ घंटों से लेकर दिनों में राहत मिलती है, जबकि पुरानी बीमारियों में कुछ हफ्ते लगते हैं।',
      explanation: 'Ayurveda aims for root-cause resolution rather than temporary symptomatic suppression. While chronic autoimmune or metabolic issues require patience, acute home remedies act swiftly.',
      clinical_reference: 'Journal of Ayurveda and Integrative Medicine (JAIM).'
    },
    {
      myth: 'More dosage of an Ayurvedic herb means faster and better healing.',
      hindi_myth: 'आयुर्वेदिक दवा जितनी ज्यादा मात्रा में खाएंगे, उतनी जल्दी आराम मिलेगा।',
      fact: 'Overdosing herbs can overload the liver, irritate the gut lining, and aggravate other doshas.',
      hindi_fact: 'ज्यादा मात्रा में जड़ी-बूटी लेने से लिवर और पाचन तंत्र पर भारी दबाव पड़ सकता है और अन्य समस्याएं हो सकती हैं।',
      explanation: 'Ayurvedic pharmacology specifies exact therapeutic windows based on the patient’s digestive fire (Agni), age, and tissue strength (Bala). Excessive consumption is counter-productive.',
      clinical_reference: 'Charaka Samhita, Sutrasthana Ch. 26.'
    }
  ];

  for (const m of mythsData) {
    insertMyth.run(m.myth, m.hindi_myth, m.fact, m.hindi_fact, m.explanation, m.clinical_reference);
  }

  console.log('Database initialization & seeding completed successfully!');
}

module.exports = {
  db,
  initDatabase
};

if (require.main === module) {
  initDatabase();
}

