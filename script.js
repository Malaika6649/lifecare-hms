// --- INITIAL DATA ---
let patients = JSON.parse(localStorage.getItem('hospitalData')) || [];
let staff = JSON.parse(localStorage.getItem('hospitalStaff')) || [];

// --- HEALTH TIPS DATA (In English) ---
const tipsData = {
    morning: { 
        text: "Start your day with a glass of warm water and a healthy breakfast.", 
        emoji: "☀️", color: "from-orange-400 to-yellow-500", label: "Morning Tip" 
    },
    afternoon: { 
        text: "Stay hydrated! Drink plenty of water and include greens in your lunch.", 
        emoji: "🌤️", color: "from-cyan-500 to-blue-600", label: "Afternoon Tip" 
    },
    evening: { 
        text: "Eat a light dinner at least 2 hours before sleep and take a short walk.", 
        emoji: "🌙", color: "from-indigo-800 to-slate-900", label: "Evening Tip" 
    }
};

// --- NOTIFICATION SYSTEM ---
function showNotification(msg, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-slate-900' : 'bg-rose-600';
    const icon = type === 'success' ? '✨' : '⚠️';

    toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border-l-4 border-cyan-400 min-w-[250px] transition-all duration-500`;
    toast.innerHTML = `<span>${icon}</span> ${msg}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// --- NAVIGATION ---
function showSection(sectionId) {
    const sections = ['dashboardSection', 'appointmentsSection', 'pharmacySection', 'staffSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const target = document.getElementById(sectionId + 'Section');
    if (target) target.classList.remove('hidden');
    
    if(sectionId === 'staff') renderStaff();
}

// --- HEALTH TIPS LOGIC ---
function updateHealthTips() {
    const hour = new Date().getHours();
    let selectedTip;
    const card = document.getElementById('tipCard');

    if (hour >= 5 && hour < 12) selectedTip = tipsData.morning;
    else if (hour >= 12 && hour < 17) selectedTip = tipsData.afternoon;
    else selectedTip = tipsData.evening;

    if (card) {
        document.getElementById('healthyTip').innerText = selectedTip.text;
        document.getElementById('tipTime').innerText = selectedTip.label;
        document.getElementById('tipEmoji').innerText = selectedTip.emoji;
        card.className = `bg-gradient-to-r ${selectedTip.color} p-8 rounded-[2rem] shadow-xl text-white mb-8 relative overflow-hidden group`;
    }
    return selectedTip;
}

function setupTipReminders() {
    const tip = updateHealthTips();
    showNotification(`💡 Health Tip: ${tip.text}`);
}

// --- PATIENT MANAGEMENT ---
function toggleModal() {
    document.getElementById('modal').classList.toggle('hidden');
}

function savePatient() {
    const name = document.getElementById('name').value;
    const disease = document.getElementById('disease').value;
    if (name && disease) {
        patients.push({ id: Date.now(), name, disease });
        localStorage.setItem('hospitalData', JSON.stringify(patients));
        renderTable();
        toggleModal();
        showNotification("Patient Record Saved!");
        document.getElementById('name').value = '';
        document.getElementById('disease').value = '';
    }
}

function renderTable() {
    const list = document.getElementById('patientList');
    const totalCount = document.getElementById('totalPatients');
    if (!list) return;
    list.innerHTML = "";
    if (totalCount) totalCount.innerText = patients.length;

    patients.forEach((p) => {
        list.innerHTML += `
            <tr class="border-b border-slate-50">
                <td class="p-6 font-bold text-slate-800">${p.name}</td>
                <td class="p-6"><span class="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-xs font-bold uppercase">${p.disease}</span></td>
                <td class="p-6 text-right"><button onclick="deletePatient(${p.id})" class="text-rose-500 font-bold hover:bg-rose-50 px-4 py-2 rounded-xl">Remove</button></td>
            </tr>`;
    });
}

function deletePatient(id) {
    patients = patients.filter(p => p.id !== id);
    localStorage.setItem('hospitalData', JSON.stringify(patients));
    renderTable();
    showNotification("Patient Removed!", "error");
}

// --- STAFF MANAGEMENT ---
function toggleStaffModal() {
    document.getElementById('staffModal').classList.toggle('hidden');
}

function saveStaff() {
    const name = document.getElementById('staffName').value;
    const role = document.getElementById('staffRole').value;
    if (name) {
        staff.push({ id: Date.now(), name, role });
        localStorage.setItem('hospitalStaff', JSON.stringify(staff));
        renderStaff();
        toggleStaffModal();
        showNotification("Staff Member Added!");
        document.getElementById('staffName').value = '';
    }
}

function renderStaff() {
    const container = document.getElementById('staffList');
    if (!container) return;
    container.innerHTML = staff.map(s => `
        <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <h4 class="font-bold text-slate-900">${s.name}</h4>
                <p class="text-indigo-500 text-sm font-bold">${s.role}</p>
            </div>
            <button onclick="deleteStaff(${s.id})" class="text-rose-500 font-bold hover:bg-rose-50 p-2 rounded-lg">Remove</button>
        </div>
    `).join('');
}

function deleteStaff(id) {
    staff = staff.filter(s => s.id !== id);
    localStorage.setItem('hospitalStaff', JSON.stringify(staff));
    renderStaff();
    showNotification("Member Removed!", "error");
}

// --- PHARMACY & APPOINTMENTS ---
function buyMed(name, price) {
    const billItem = document.getElementById('billItem');
    const billTotal = document.getElementById('billTotal');
    const billModal = document.getElementById('billModal');
    if (billItem && billTotal) {
        billItem.innerText = name;
        billTotal.innerText = "Rs. " + price;
        billModal.classList.remove('hidden');
        showNotification("Added to bill!");
    }
}

function closeBill() {
    document.getElementById('billModal').classList.add('hidden');
}

function bookAppoint() {
    showNotification("Appointment Booked Successfully!");
}

// --- INITIALIZE ---
window.onload = () => {
    renderTable();
    updateHealthTips();
    setTimeout(setupTipReminders, 3000);
};
