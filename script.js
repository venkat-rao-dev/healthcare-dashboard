const API_URL = 'https://fedskillstest.coalitiontechnologies.workers.dev';
const AUTH = 'Basic ' + btoa('coalition:skills-test');

let allPatients = [];
let bpChart = null;

async function init() {
    const res = await fetch(API_URL, { headers: { 'Authorization': AUTH } });
    allPatients = await res.json();
    
    renderSidebar(allPatients);
    
    // Auto-load Jessica Taylor
    const jessica = allPatients.find(p => p.name === 'Jessica Taylor');
    if (jessica) renderPatient(jessica);

    // Sidebar Click Logic
    document.getElementById('patient-list').addEventListener('click', (e) => {
        const card = e.target.closest('.patient-item');
        if (!card) return;
        
        document.querySelectorAll('.patient-item').forEach(i => i.classList.remove('active'));
        card.classList.add('active');
        
        const p = allPatients.find(item => item.name === card.dataset.name);
        renderPatient(p);
    });
}

function renderSidebar(list) {
    document.getElementById('patient-list').innerHTML = list.map(p => `
        <div class="patient-item ${p.name === 'Jessica Taylor' ? 'active' : ''}" data-name="${p.name}">
            <div style="display:flex; align-items:center; pointer-events:none;">
                <img src="${p.profile_picture}" class="avatar">
                <div><strong>${p.name}</strong><br><small>${p.gender}, ${p.age}</small></div>
            </div>
            <img src="assets/more_horiz.svg" style="width:18px;">
        </div>
    `).join('');
}

function renderPatient(p) {
    // Profile
    document.getElementById('profile-img').src = p.profile_picture;
    document.getElementById('profile-name').innerText = p.name;
    document.getElementById('dob').innerText = p.date_of_birth;
    document.getElementById('gender').innerText = p.gender;
    document.getElementById('phone').innerText = p.phone_number;
    document.getElementById('insurance').innerText = p.insurance_type;
    
    // Metrics
    const latest = p.diagnosis_history[0];
    document.getElementById('resp-val').innerText = latest.respiratory_rate.value + ' bpm';
    document.getElementById('temp-val').innerText = latest.temperature.value + '°F';
    document.getElementById('heart-val').innerText = latest.heart_rate.value + ' bpm';
    document.getElementById('sys-val').innerText = latest.blood_pressure.systolic.value;
    document.getElementById('dia-val').innerText = latest.blood_pressure.diastolic.value;

    // Table & Labs
    document.getElementById('diag-body').innerHTML = p.diagnostic_list.map(d => 
        `<tr><td>${d.name}</td><td>${d.description}</td><td>${d.status}</td></tr>`).join('');
    document.getElementById('lab-list').innerHTML = p.lab_results.map(l => 
        `<li class="lab-item"><span>${l}</span><img src="assets/download.svg" style="width:18px;"></li>`).join('');

    // Chart
    const history = p.diagnosis_history.slice(0, 6).reverse();
    if (bpChart) bpChart.destroy();
    const ctx = document.getElementById('bpChart').getContext('2d');
    bpChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.month.substring(0,3)),
            datasets: [
                { data: history.map(h => h.blood_pressure.systolic.value), borderColor: '#C26EB4', tension: 0.4 },
                { data: history.map(h => h.blood_pressure.diastolic.value), borderColor: '#7E6CAB', tension: 0.4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

init();
