// --- INITIAL DATA ---
let patients = JSON.parse(localStorage.getItem('hospitalData')) || [];
let staff = JSON.parse(localStorage.getItem('hospitalStaff')) || [];

// --- HEALTH TIPS DATA (Stricly English) ---
const tipsData = {
    morning: { 
        text: "Morning: Start your day with a glass of warm water and a healthy breakfast.", 
        emoji: "☀️", 
        color: "from-orange-400 to-yellow-500", 
        label: "Morning Health Tip" 
    },
    afternoon: { 
        text: "Afternoon: Stay hydrated! Drink plenty of water and add salad to your lunch.", 
        emoji: "🌤️", 
        color: "from-cyan-500 to-blue-600", 
        label: "Afternoon Health Tip" 
    },
    evening: { 
        text: "Evening: Have a light dinner and take a 15-minute walk before going to bed.", 
        emoji: "🌙", 
        color: "from-indigo-800 to-slate-900", 
        label: "Evening Health Tip" 
    }
};

// --- NOTIFICATION SYSTEM ---
function showNotification(msg, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-slate-900' : 'bg-rose-600';
    const icon = type === 'success' ? '✨' : '⚠️';

    toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border-l-4 border-cyan-400 min-w-[280px] transition-all duration-500`;
    toast.innerHTML = `<span>${icon}</span> ${msg}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// --- NAVIGATION (Fixed Buttons) ---
function showSection(sectionId) {
    const sections = ['dashboardSection', 'appointmentsSection', 'pharmacySection', 'staffSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.classList.remove('hidden');
    }
    
    if(sectionId === 'staff') renderStaff();
}

// --- HEALTH TIPS LOGIC ---
function updateHealthTips() {
    const hour = new Date().getHours();
    let selectedTip;
    const card = document.getElementById('tipCard');

    // Logic for 3 times a day
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

// Reminder Notification
function setupTipReminders() {
    const tip = updateHealthTips();
    showNotification(tip.text); // Showing English tip in notification
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
        showNotification("Patient Record Saved Successfully!");
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
                <td class="p-6 text-right">
                    <button onclick="deletePatient(${p.id})" class="text-rose-500 font-bold hover:bg-rose-50 px-4 py-2 rounded-xl">Delete</button>
                </td>
            </tr>`;
    });
}

function deletePatient(id) {
    patients = patients.filter(p => p.id !== id);
    localStorage.setItem('hospitalData', JSON.stringify(patients));
    renderTable();
    showNotification("Record Deleted!", "error");
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

// --- PHARMACY & BILLING ---
function buyMed(name, price) {
    document.getElementById('billItem').innerText = name;
    document.getElementById('billTotal').innerText = "Rs. " + price;
    document.getElementById('billModal').classList.remove('hidden');
    showNotification("Item added to cart");
}

function closeBill() {
    document.getElementById('billModal').classList.add('hidden');
}

function bookAppoint() {
    showNotification("Appointment Confirmed!");
}

// --- STARTUP ---
window.onload = () => {
    renderTable();
    updateHealthTips();
    // Show notification tip after 3 seconds
    setTimeout(setupTipReminders, 3000);
};
