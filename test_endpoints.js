// test_endpoints.js - Automated integration test suite for AyurCare platform
const http = require('http');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = res.headers['content-type'] && res.headers['content-type'].includes('application/json')
            ? JSON.parse(data)
            : data;
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting AyurCare Platform Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ [FAIL] ${name}:`, e.message);
      failed++;
    }
  }

  // 1. Static HTML
  await test('GET / serves index.html with 200 OK', async () => {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
    if (res.status !== 200 || !res.body.includes('AyurCare')) {
      throw new Error(`Status ${res.status}, body does not contain AyurCare`);
    }
  });

  // 2. CSS & JS assets
  await test('GET /css/styles.css serves valid stylesheet', async () => {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/css/styles.css', method: 'GET' });
    if (res.status !== 200 || !res.body.includes('--color-primary')) {
      throw new Error(`Status ${res.status}`);
    }
  });

  // 3. Remedies API
  await test('GET /api/remedies returns remedies list', async () => {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/api/remedies', method: 'GET' });
    if (res.status !== 200 || !res.body.success || res.body.data.length === 0) {
      throw new Error(`Failed to fetch remedies: ${JSON.stringify(res.body)}`);
    }
  });

  // 4. Single Remedy Monograph
  await test('GET /api/remedies/turmeric-haldi returns full monograph', async () => {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/api/remedies/turmeric-haldi', method: 'GET' });
    if (res.status !== 200 || !res.body.data || res.body.data.sanskrit_name !== 'Haridra') {
      throw new Error(`Unexpected response: ${JSON.stringify(res.body)}`);
    }
  });

  // 5. Herb-Drug Interaction Check
  await test('POST /api/check-interaction detects Turmeric + Warfarin interaction', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/check-interaction',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { herb: 'turmeric', drug: 'warfarin' });

    if (res.status !== 200 || !res.body.found || res.body.interactions.length === 0) {
      throw new Error(`Interaction not detected: ${JSON.stringify(res.body)}`);
    }
  });

  // 6. Doctors API
  await test('GET /api/doctors returns qualified doctors', async () => {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/api/doctors', method: 'GET' });
    if (res.status !== 200 || !res.body.success || res.body.data.length === 0) {
      throw new Error(`Failed to fetch doctors: ${JSON.stringify(res.body)}`);
    }
  });

  // 7. Appointment Booking & SQLite persistence
  let bookedApptId = null;
  await test('POST /api/appointments creates new booking in SQLite', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/appointments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      doctor_id: 'dr-ananya-sharma',
      patient_name: 'Aarav Patel',
      patient_age: 42,
      patient_gender: 'Male',
      patient_phone: '9876543210',
      patient_email: 'aarav@example.com',
      appointment_date: '2026-11-10',
      appointment_time: '10:00 AM - 10:30 AM',
      consultation_mode: 'Online Video',
      chief_complaint: 'Chronic acid reflux and indigestion'
    });

    if (res.status !== 201 || !res.body.success || !res.body.appointment.id) {
      throw new Error(`Booking failed: ${JSON.stringify(res.body)}`);
    }
    bookedApptId = res.body.appointment.id;
  });

  // 8. Retrieve Appointment
  await test('GET /api/appointments returns confirmed appointment', async () => {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/api/appointments?phone=9876543210', method: 'GET' });
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Appointment not found in SQLite: ${JSON.stringify(res.body)}`);
    }
  });

  // 9. Symptom Checker: Emergency Red Flag Trigger
  await test('POST /api/symptom-evaluate triggers EMERGENCY_RED when red flag present', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/symptom-evaluate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      symptom_id: 'cough-and-cold',
      duration_days: 3,
      severity: 'emergency',
      has_red_flags: true,
      red_flags_checked: ['chest_pain']
    });

    if (res.status !== 200 || !res.body.is_emergency || res.body.triage_level !== 'EMERGENCY_RED') {
      throw new Error(`Emergency triage failed: ${JSON.stringify(res.body)}`);
    }
  });

  // 10. Symptom Checker: Mild Self-Care & Ayurvedic Guidance
  await test('POST /api/symptom-evaluate provides safe Ayurvedic guidance for mild cough', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/symptom-evaluate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      symptom_id: 'cough-and-cold',
      duration_days: 2,
      severity: 'mild',
      has_red_flags: false
    });

    if (res.status !== 200 || res.body.is_emergency || !res.body.recommended_remedies || res.body.recommended_remedies.length === 0) {
      throw new Error(`Guidance generation failed: ${JSON.stringify(res.body)}`);
    }
  });

  // 11. Prakriti Assessment Persistence
  await test('POST /api/assessments stores Prakriti constitution test', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/assessments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      user_name: 'Pooja Sharma',
      vata_score: 25,
      pitta_score: 55,
      kapha_score: 20,
      dominant_prakriti: 'Pitta Predominant',
      dietary_recommendations: 'Cooling, fresh foods',
      lifestyle_recommendations: 'Moderate pace, avoid excessive heat'
    });

    if (res.status !== 201 || !res.body.id) {
      throw new Error(`Assessment failed: ${JSON.stringify(res.body)}`);
    }
  });

  // 12. Universal Global Search
  await test('GET /api/search?q=cough returns multi-entity results', async () => {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/api/search?q=cough', method: 'GET' });
    if (res.status !== 200 || !res.body.results || res.body.results.symptoms.length === 0) {
      throw new Error(`Search failed: ${JSON.stringify(res.body)}`);
    }
  });

  // 13. Articles & Myths
  await test('GET /api/articles and GET /api/myths-facts return educational data', async () => {
    const [resArt, resMyths] = await Promise.all([
      request({ hostname: 'localhost', port: 3000, path: '/api/articles', method: 'GET' }),
      request({ hostname: 'localhost', port: 3000, path: '/api/myths-facts', method: 'GET' })
    ]);
    if (resArt.status !== 200 || resArt.body.data.length === 0 || resMyths.status !== 200 || resMyths.body.data.length === 0) {
      throw new Error(`Educational load failed`);
    }
  });

  console.log(`\n=======================================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`=======================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

// If run directly, execute tests against running server
if (require.main === module) {
  runTests();
}

module.exports = { runTests };

