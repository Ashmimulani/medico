// public/js/doctors.js - Ayurvedic Doctors Directory & Appointment Booking System

let allDoctors = [];
let selectedBookingDoctorId = null;

async function loadDoctors(specialtyFilter = '', cityFilter = '', modeFilter = '') {
  const grid = document.getElementById('doctorsGrid');
  if (!grid) return;

  grid.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-muted);">Loading certified doctors...</div>';

  try {
    let url = '/api/doctors?';
    if (specialtyFilter && specialtyFilter !== 'all') url += `specialization=${encodeURIComponent(specialtyFilter)}&`;
    if (cityFilter && cityFilter !== 'all') url += `city=${encodeURIComponent(cityFilter)}&`;
    if (modeFilter && modeFilter !== 'all') url += `mode=${encodeURIComponent(modeFilter)}&`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: #fff; border-radius: 12px; border: 1px solid var(--color-border);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🩺</div>
          <h3>No doctors found matching filters</h3>
          <p style="color: var(--color-text-muted);">Try relaxing the city or specialty filters.</p>
        </div>
      `;
      return;
    }

    allDoctors = data.data;
    renderDoctorsGrid(allDoctors);
  } catch (err) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--color-emergency);">Error loading doctors: ${err.message}</div>`;
  }
}

function renderDoctorsGrid(doctors) {
  const grid = document.getElementById('doctorsGrid');
  if (!grid) return;

  grid.innerHTML = doctors.map(d => {
    const avatarIcon = d.image_gender === 'female' ? '👩‍⚕️' : '👨‍⚕️';

    return `
      <div class="doctor-card" data-id="${d.id}">
        <div class="doctor-profile-top">
          <div class="doctor-avatar-circle">
            ${avatarIcon}
          </div>
          <div class="doctor-info-primary">
            <h3>${d.name} <span title="Ayush Verified Doctor" style="color: #0284c7; font-size: 0.95rem;">✔️</span></h3>
            <div class="doctor-qualification">${d.qualification}</div>
            <div class="doctor-reg-badge">Reg: ${d.registration_no} • ${d.experience_years} yrs exp</div>
          </div>
        </div>

        <div class="doctor-spec">
          🏥 ${d.specialization}
        </div>

        <div class="doctor-bio">
          ${d.bio}
        </div>

        <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 12px;">
          📍 <strong>${d.clinic_name}</strong>, ${d.city}, ${d.state}<br/>
          🗣️ Languages: ${d.languages}
        </div>

        <div class="doctor-meta-row">
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-light);">Consultation Fee</div>
            <div class="doctor-fee">₹${d.consultation_fee}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-light);">Rating</div>
            <div style="font-weight: 700; color: #b45309;">⭐ ${d.rating} (${d.total_reviews})</div>
          </div>
          <div>
            <span class="badge" style="background: var(--color-accent-subtle); color: var(--color-primary);">${d.available_modes}</span>
          </div>
        </div>

        <div style="margin-top: 14px;">
          <button class="btn btn-primary" style="width: 100%;" onclick="openBookingModalForDoctor('${d.id}')">
            📅 Book Appointment
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openBookingModalForDoctor(docId) {
  selectedBookingDoctorId = docId;
  const modal = document.getElementById('appointmentBookingModal');
  const docSelect = document.getElementById('bookingDoctorSelect');
  if (!modal) return;

  // Populate doctor select
  if (docSelect && allDoctors.length > 0) {
    docSelect.innerHTML = allDoctors.map(d => `
      <option value="${d.id}" ${d.id === docId ? 'selected' : ''}>
        ${d.name} (${d.specialization} - ₹${d.consultation_fee})
      </option>
    `).join('');
  }

  // Set min date to tomorrow
  const dateInput = document.getElementById('bookingDateInput');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  modal.classList.add('active');
}

function closeBookingModal() {
  const modal = document.getElementById('appointmentBookingModal');
  if (modal) modal.classList.remove('active');
}

async function handleAppointmentSubmit(event) {
  event.preventDefault();

  const doctor_id = document.getElementById('bookingDoctorSelect').value;
  const consultation_mode = document.getElementById('bookingModeSelect').value;
  const appointment_date = document.getElementById('bookingDateInput').value;
  const appointment_time = document.getElementById('bookingTimeSelect').value;
  const patient_name = document.getElementById('bookingPatientName').value.trim();
  const patient_age = document.getElementById('bookingPatientAge').value;
  const patient_gender = document.getElementById('bookingPatientGender').value;
  const patient_phone = document.getElementById('bookingPatientPhone').value.trim();
  const patient_email = document.getElementById('bookingPatientEmail').value.trim();
  const chief_complaint = document.getElementById('bookingComplaint').value.trim();

  const submitBtn = document.getElementById('submitBookingBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Securing Appointment...';

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor_id,
        consultation_mode,
        appointment_date,
        appointment_time,
        patient_name,
        patient_age,
        patient_gender,
        patient_phone,
        patient_email,
        chief_complaint
      })
    });

    const data = await res.json();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Book Appointment';

    if (!data.success) {
      alert(`Booking failed: ${data.error}`);
      return;
    }

    closeBookingModal();
    showBookingConfirmationModal(data.appointment);
    loadMyAppointments();
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Book Appointment';
    alert(`Network error: ${err.message}`);
  }
}

function showBookingConfirmationModal(appt) {
  const modal = document.getElementById('bookingSuccessModal');
  const detailsBox = document.getElementById('successModalDetails');
  if (!modal || !detailsBox) return;

  detailsBox.innerHTML = `
    <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: left; margin: 16px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #bbf7d0; padding-bottom: 10px; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; color: #166534; font-weight: 700;">APPOINTMENT ID</span>
        <span style="font-weight: 800; color: #15803d; font-size: 1.1rem;">${appt.id}</span>
      </div>
      <p style="margin-bottom: 6px;"><strong>Doctor:</strong> ${appt.doctor_name}</p>
      <p style="margin-bottom: 6px;"><strong>Patient:</strong> ${appt.patient_name}</p>
      <p style="margin-bottom: 6px;"><strong>Date & Time:</strong> ${appt.date} at ${appt.time}</p>
      <p style="margin-bottom: 6px;"><strong>Mode:</strong> ${appt.mode}</p>
      <p><strong>Status:</strong> <span class="badge badge-evidence-high">${appt.status}</span></p>
    </div>
    <p style="font-size: 0.85rem; color: var(--color-text-muted);">
      A confirmation SMS and clinic access link have been prepared for ${appt.patient_name}. Please be ready 10 minutes prior to your time slot.
    </p>
  `;

  modal.classList.add('active');
}

function closeSuccessModal() {
  const modal = document.getElementById('bookingSuccessModal');
  if (modal) modal.classList.remove('active');
}

// Load Appointments for "My Appointments" Tab
async function loadMyAppointments() {
  const container = document.getElementById('myAppointmentsList');
  if (!container) return;

  container.innerHTML = '<div style="padding: 24px; text-align: center;">Loading your appointments...</div>';

  try {
    const res = await fetch('/api/appointments');
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #ffffff; border-radius: 12px; border: 1px solid var(--color-border);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📅</div>
          <h3>No Appointments Scheduled Yet</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 16px;">You have not booked any consultations yet. Our certified Ayurvedic doctors are ready to assist you.</p>
          <button class="btn btn-primary" onclick="showSection('doctorsSection')">Browse Available Doctors</button>
        </div>
      `;
      return;
    }

    container.innerHTML = data.data.map(a => `
      <div class="card" style="margin-bottom: 16px; border-left: 5px solid var(--color-primary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-secondary);">${a.id}</span>
            <span class="badge badge-evidence-high">${a.status}</span>
          </div>
          <h4 style="font-size: 1.15rem; color: var(--color-primary);">${a.doctor_name}</h4>
          <p style="font-size: 0.9rem; color: var(--color-text-muted);">
            Patient: <strong>${a.patient_name}</strong> (${a.patient_age}y, ${a.patient_gender}) • Mode: <strong>${a.consultation_mode}</strong>
          </p>
          <p style="font-size: 0.85rem; color: var(--color-text-light); margin-top: 2px;">
            Date: <strong>${a.appointment_date}</strong> • Slot: <strong>${a.appointment_time}</strong> • Reason: <em>${a.chief_complaint}</em>
          </p>
        </div>
        <div>
          <button class="btn btn-sm btn-outline" style="border-color: #ef4444; color: #ef4444;" onclick="cancelAppointment('${a.id}')">
            Cancel
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-emergency);">Error loading appointments: ${err.message}</div>`;
  }
}

async function cancelAppointment(id) {
  if (!confirm(`Are you sure you want to cancel appointment ${id}?`)) return;

  try {
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert('Appointment cancelled successfully.');
      loadMyAppointments();
    } else {
      alert(`Could not cancel: ${data.error}`);
    }
  } catch (err) {
    alert(`Network error: ${err.message}`);
  }
}

