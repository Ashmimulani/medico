// server.js - Production-grade HTTP server and REST API for Ayurvedic Healthcare Website
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { db, initDatabase } = require('./database');

// Ensure DB is initialized
initDatabase();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.connection.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        if (!body) return resolve({});
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

const requestHandler = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  try {
    // ==========================================
    // API ROUTES
    // ==========================================

    // --- REMEDIES API ---
    if (pathname === '/api/remedies' && method === 'GET') {
      const q = (query.q || '').trim().toLowerCase();
      const category = (query.category || '').trim();
      const dosha = (query.dosha || '').trim();

      let sql = 'SELECT * FROM remedies WHERE 1=1';
      const params = [];

      if (q) {
        sql += ` AND (LOWER(name) LIKE ? OR LOWER(sanskrit_name) LIKE ? OR LOWER(botanical_name) LIKE ? OR LOWER(common_uses) LIKE ? OR LOWER(hindi_name) LIKE ?)`;
        const wild = `%${q}%`;
        params.push(wild, wild, wild, wild, wild);
      }
      if (category) {
        sql += ` AND category = ?`;
        params.push(category);
      }
      if (dosha) {
        sql += ` AND dosha_effect LIKE ?`;
        params.push(`%${dosha}%`);
      }

      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      return sendJson(res, 200, { success: true, count: rows.length, data: rows });
    }

    if (pathname.startsWith('/api/remedies/') && method === 'GET') {
      const id = pathname.replace('/api/remedies/', '');
      const stmt = db.prepare('SELECT * FROM remedies WHERE id = ?');
      const remedy = stmt.get(id);
      if (!remedy) {
        return sendJson(res, 404, { success: false, error: 'Remedy not found' });
      }
      return sendJson(res, 200, { success: true, data: remedy });
    }

    // --- HERB-DRUG INTERACTIONS ---
    if (pathname === '/api/interactions' && method === 'GET') {
      const herb = (query.herb || '').trim().toLowerCase();
      let sql = 'SELECT * FROM herb_drug_interactions';
      const params = [];
      if (herb) {
        sql += ' WHERE LOWER(herb_name) LIKE ?';
        params.push(`%${herb}%`);
      }
      const rows = db.prepare(sql).all(...params);
      return sendJson(res, 200, { success: true, data: rows });
    }

    if (pathname === '/api/check-interaction' && method === 'POST') {
      const body = await parseBody(req);
      const herbQuery = (body.herb || '').trim().toLowerCase();
      const drugQuery = (body.drug || '').trim().toLowerCase();

      if (!herbQuery || !drugQuery) {
        return sendJson(res, 400, { success: false, error: 'Both herb and drug are required' });
      }

      const stmt = db.prepare(`
        SELECT * FROM herb_drug_interactions
        WHERE LOWER(herb_name) LIKE ? AND (LOWER(drug_class) LIKE ? OR LOWER(drug_examples) LIKE ?)
      `);
      const results = stmt.all(`%${herbQuery}%`, `%${drugQuery}%`, `%${drugQuery}%`);

      if (results.length > 0) {
        return sendJson(res, 200, {
          success: true,
          found: true,
          interactions: results,
          warning: 'Potential herb-drug interaction detected. Do not modify prescriptions without physician consultation.'
        });
      } else {
        return sendJson(res, 200, {
          success: true,
          found: false,
          message: 'No high-risk documented interaction found in our clinical database for this pair. However, always inform your prescribing doctor of any herbal supplements taken.'
        });
      }
    }

    // --- DOCTORS API ---
    if (pathname === '/api/doctors' && method === 'GET') {
      const spec = (query.specialization || '').trim();
      const city = (query.city || '').trim();
      const mode = (query.mode || '').trim();

      let sql = 'SELECT * FROM doctors WHERE 1=1';
      const params = [];

      if (spec) {
        sql += ' AND specialization LIKE ?';
        params.push(`%${spec}%`);
      }
      if (city) {
        sql += ' AND city = ?';
        params.push(city);
      }
      if (mode) {
        sql += ' AND available_modes LIKE ?';
        params.push(`%${mode}%`);
      }

      const rows = db.prepare(sql).all(...params);
      return sendJson(res, 200, { success: true, count: rows.length, data: rows });
    }

    if (pathname.startsWith('/api/doctors/') && method === 'GET') {
      const id = pathname.replace('/api/doctors/', '');
      const doc = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
      if (!doc) {
        return sendJson(res, 404, { success: false, error: 'Doctor not found' });
      }
      return sendJson(res, 200, { success: true, data: doc });
    }

    // --- APPOINTMENTS API ---
    if (pathname === '/api/appointments' && method === 'POST') {
      const body = await parseBody(req);
      const {
        doctor_id,
        patient_name,
        patient_age,
        patient_gender,
        patient_phone,
        patient_email,
        appointment_date,
        appointment_time,
        consultation_mode,
        chief_complaint
      } = body;

      // Validation
      if (!doctor_id || !patient_name || !patient_phone || !appointment_date || !appointment_time) {
        return sendJson(res, 400, { success: false, error: 'Missing required appointment fields.' });
      }

      // Verify doctor exists
      const doc = db.prepare('SELECT name FROM doctors WHERE id = ?').get(doctor_id);
      if (!doc) {
        return sendJson(res, 404, { success: false, error: 'Selected doctor does not exist.' });
      }

      const appointmentId = 'AYUR-' + Math.floor(100000 + Math.random() * 900000);

      const insertStmt = db.prepare(`
        INSERT INTO appointments (
          id, doctor_id, doctor_name, patient_name, patient_age,
          patient_gender, patient_phone, patient_email, appointment_date,
          appointment_time, consultation_mode, chief_complaint, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
      `);

      insertStmt.run(
        appointmentId, doctor_id, doc.name, patient_name,
        Number(patient_age) || 30, patient_gender || 'Not Specified',
        patient_phone, patient_email || 'Not provided',
        appointment_date, appointment_time,
        consultation_mode || 'Online Video', chief_complaint || 'General Consultation'
      );

      return sendJson(res, 201, {
        success: true,
        message: 'Appointment scheduled successfully!',
        appointment: {
          id: appointmentId,
          doctor_name: doc.name,
          patient_name,
          date: appointment_date,
          time: appointment_time,
          mode: consultation_mode || 'Online Video',
          status: 'Confirmed'
        }
      });
    }

    if (pathname === '/api/appointments' && method === 'GET') {
      const phone = (query.phone || '').trim();
      let rows;
      if (phone) {
        rows = db.prepare('SELECT * FROM appointments WHERE patient_phone = ? ORDER BY created_at DESC').all(phone);
      } else {
        rows = db.prepare('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 50').all();
      }
      return sendJson(res, 200, { success: true, count: rows.length, data: rows });
    }

    if (pathname.startsWith('/api/appointments/') && method === 'DELETE') {
      const id = pathname.replace('/api/appointments/', '');
      const resDel = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
      return sendJson(res, 200, { success: true, message: 'Appointment cancelled successfully.' });
    }

    // --- SYMPTOM EVALUATION ENGINE ---
    if (pathname === '/api/symptoms' && method === 'GET') {
      const rows = db.prepare('SELECT * FROM symptoms_data').all();
      return sendJson(res, 200, { success: true, data: rows });
    }

    if (pathname === '/api/symptom-evaluate' && method === 'POST') {
      const body = await parseBody(req);
      const {
        symptom_id,
        duration_days,
        severity, // 'mild', 'moderate', 'severe'
        has_red_flags, // boolean or array of flags checked
        red_flag_details,
        patient_age
      } = body;

      // 1. Critical Red Flag Triage
      if (has_red_flags || severity === 'emergency' || (severity === 'severe' && duration_days > 5)) {
        return sendJson(res, 200, {
          success: true,
          triage_level: 'EMERGENCY_RED',
          is_emergency: true,
          alert_title: '🚨 IMMEDIATE MEDICAL ATTENTION REQUIRED',
          emergency_hotlines: ['108 (National Ambulance)', '112 (All-in-One Emergency)', '1075 (National Health Helpline)'],
          message: 'Your reported symptoms indicate potential red-flag medical warning signs that require urgent hospital evaluation. Do NOT wait for home remedies or online consultations. Please proceed immediately to your nearest emergency department or call 108.',
          action_items: [
            'Call 108 or have an escort take you immediately to the nearest hospital casualty/emergency room.',
            'Do not attempt strenuous activity or delay clinical care.',
            'Keep your previous medical records, current prescriptions, and ID ready for the emergency physician.'
          ]
        });
      }

      // 2. Fetch specific symptom profile
      const symptomProfile = db.prepare('SELECT * FROM symptoms_data WHERE id = ?').get(symptom_id);
      if (!symptomProfile) {
        return sendJson(res, 404, { success: false, error: 'Symptom not recognized' });
      }

      // Fetch matched remedies
      const remedyIds = (symptomProfile.recommended_remedy_ids || '').split(',').map(s => s.trim());
      const remedies = [];
      for (const rId of remedyIds) {
        const rem = db.prepare('SELECT id, name, sanskrit_name, category, why_suggested, potential_benefits, scientific_evidence, evidence_level, safe_usage, possible_side_effects, who_should_avoid, when_to_consult_doctor FROM remedies WHERE id = ?').get(rId);
        if (rem) remedies.push(rem);
      }

      // Recommend doctors specializing in this symptom area
      let doctorsSql = 'SELECT id, name, qualification, specialization, clinic_name, city, consultation_fee, rating, available_modes FROM doctors LIMIT 3';
      if (symptom_id === 'digestive-acidity-bloating') {
        doctorsSql = `SELECT * FROM doctors WHERE specialization LIKE '%Digestive%' OR specialization LIKE '%Internal%' LIMIT 3`;
      } else if (symptom_id === 'joint-pain-stiffness') {
        doctorsSql = `SELECT * FROM doctors WHERE specialization LIKE '%Panchakarma%' OR specialization LIKE '%Joint%' LIMIT 3`;
      } else if (symptom_id === 'stress-anxiety-insomnia') {
        doctorsSql = `SELECT * FROM doctors WHERE specialization LIKE '%Stress%' OR specialization LIKE '%Mental%' LIMIT 3`;
      }
      const relevantDoctors = db.prepare(doctorsSql).all();

      return sendJson(res, 200, {
        success: true,
        triage_level: severity === 'severe' ? 'HIGH_PRIORITY_DOCTOR' : (severity === 'moderate' ? 'MODERATE_SELF_CARE_MONITOR' : 'MILD_WELLNESS'),
        is_emergency: false,
        disclaimer: 'Ayurvedic health information provided for educational and wellness guidance only. It is not an official medical diagnosis or replacement for a consultation with a registered healthcare practitioner.',
        symptom_name: symptomProfile.name,
        ayurvedic_perspective: {
          dosha_imbalance: symptomProfile.ayurvedic_dosha,
          system_affected: symptomProfile.body_system
        },
        diet_lifestyle_guidelines: symptomProfile.diet_lifestyle_tips,
        when_to_see_doctor: symptomProfile.when_to_seek_urgent_care,
        recommended_remedies: remedies,
        recommended_doctors: relevantDoctors,
        suggest_consultation: severity === 'moderate' || severity === 'severe' || duration_days > 4
      });
    }

    // --- ASSESSMENTS API (Prakriti / Dosha Quiz) ---
    if (pathname === '/api/assessments' && method === 'POST') {
      const body = await parseBody(req);
      const { user_name, vata_score, pitta_score, kapha_score, dominant_prakriti, dietary_recommendations, lifestyle_recommendations } = body;

      const assessmentId = 'PRAK-' + Math.floor(100000 + Math.random() * 900000);
      const stmt = db.prepare(`
        INSERT INTO assessments (
          id, user_name, vata_score, pitta_score, kapha_score,
          dominant_prakriti, dietary_recommendations, lifestyle_recommendations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        assessmentId,
        user_name || 'Anonymous User',
        Number(vata_score) || 0,
        Number(pitta_score) || 0,
        Number(kapha_score) || 0,
        dominant_prakriti || 'Vata-Pitta',
        dietary_recommendations || 'Balanced wholesome diet',
        lifestyle_recommendations || 'Consistent daily routine'
      );

      return sendJson(res, 201, {
        success: true,
        id: assessmentId,
        message: 'Assessment completed and saved.'
      });
    }

    if (pathname === '/api/assessments' && method === 'GET') {
      const rows = db.prepare('SELECT * FROM assessments ORDER BY created_at DESC LIMIT 20').all();
      return sendJson(res, 200, { success: true, data: rows });
    }

    // --- ARTICLES & MYTHS/FACTS API ---
    if (pathname === '/api/articles' && method === 'GET') {
      const rows = db.prepare('SELECT id, title, hindi_title, category, summary, read_time, tags FROM articles').all();
      return sendJson(res, 200, { success: true, data: rows });
    }

    if (pathname.startsWith('/api/articles/') && method === 'GET') {
      const id = pathname.replace('/api/articles/', '');
      const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
      if (!row) {
        return sendJson(res, 404, { success: false, error: 'Article not found' });
      }
      return sendJson(res, 200, { success: true, data: row });
    }

    if (pathname === '/api/myths-facts' && method === 'GET') {
      const rows = db.prepare('SELECT * FROM myths_facts').all();
      return sendJson(res, 200, { success: true, data: rows });
    }

    // --- GLOBAL SEARCH API ---
    if (pathname === '/api/search' && method === 'GET') {
      const q = (query.q || '').trim().toLowerCase();
      if (!q) {
        return sendJson(res, 200, { success: true, results: { remedies: [], symptoms: [], doctors: [], articles: [] } });
      }

      const wild = `%${q}%`;
      const remedies = db.prepare(`SELECT id, name, hindi_name, category, common_uses FROM remedies WHERE LOWER(name) LIKE ? OR LOWER(sanskrit_name) LIKE ? OR LOWER(common_uses) LIKE ? OR LOWER(hindi_name) LIKE ? LIMIT 6`).all(wild, wild, wild, wild);
      const symptoms = db.prepare(`SELECT id, name, hindi_name, body_system, description FROM symptoms_data WHERE LOWER(name) LIKE ? OR LOWER(hindi_name) LIKE ? OR LOWER(description) LIKE ? LIMIT 4`).all(wild, wild, wild);
      const doctors = db.prepare(`SELECT id, name, qualification, specialization, city, consultation_fee FROM doctors WHERE LOWER(name) LIKE ? OR LOWER(specialization) LIKE ? OR LOWER(city) LIKE ? LIMIT 4`).all(wild, wild, wild);
      const articles = db.prepare(`SELECT id, title, hindi_title, category, summary FROM articles WHERE LOWER(title) LIKE ? OR LOWER(hindi_title) LIKE ? OR LOWER(summary) LIKE ? LIMIT 4`).all(wild, wild, wild);

      return sendJson(res, 200, {
        success: true,
        query: q,
        results: {
          remedies,
          symptoms,
          doctors,
          articles,
          total: remedies.length + symptoms.length + doctors.length + articles.length
        }
      });
    }

    // ==========================================
    // STATIC FILE SERVING
    // ==========================================
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('403 Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html for SPA-style client routing if not an API route
        if (!pathname.startsWith('/api/')) {
          const indexFile = path.join(PUBLIC_DIR, 'index.html');
          fs.readFile(indexFile, (iErr, content) => {
            if (iErr) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              return res.end('404 Not Found');
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(content);
          });
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          return res.end('500 Internal Server Error');
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(content);
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    sendJson(res, 500, { success: false, error: 'Internal Server Error', details: error.message });
  }
};

const PORTS = [8080, 3000];
if (process.env.PORT && !PORTS.includes(Number(process.env.PORT))) {
  PORTS.unshift(Number(process.env.PORT));
}

console.log(`=======================================================`);
console.log(`🌿 AyurCare Healthcare Platform Server Launching...`);
console.log(`🩺 SQLite Database: Active with full clinical seeds`);

PORTS.forEach(port => {
  const s = http.createServer(requestHandler);
  s.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Live on: http://localhost:${port}`);
  });
  s.on('error', (err) => {
    console.warn(`Could not bind to port ${port}: ${err.message}`);
  });
});
console.log(`=======================================================`);

