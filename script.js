// --- ORIGINAL DATA ---
let patients = JSON.parse(localStorage.getItem('hospitalData')) || [];
let staff = JSON.parse(localStorage.getItem('hospitalStaff')) || []; // Naya: Staff data

// Page load hote hi sab initialize karo
window.onload = function() {
    renderTable();
    renderStaff();       // Naya: Staff list dikhao
    updateHealthTips();  // Naya: Tip card update karo
    setTimeout(setupTipReminders, 5000); // Naya: 5 sec baad pehla reminder
};

// --- NEW: Healthy Tips Data (3 Times a Day) ---
const tipsData = {
    morning: { 
        text: "Subha ka nashta lazmi karein aur 1 glass neem garam pani piyen.", 
        emoji: "☀️", color: "from-orange-400 to-yellow-500", label: "Morning Tip" 
    },
    afternoon: { 
        text: "Dopahar ke khane mein salad ka istemal karein aur thori der rest karein.", 
        emoji: "🌤️", color: "from-cyan-500 to-blue-600", label: "Afternoon Tip" 
    },
    evening: { 
        text: "Raat ka khana sone se 2 ghante pehle khayein aur thori walk karein.", 
        emoji: "🌙", color: "from-indigo-800 to-slate-900", label: "Evening Tip" 
    }
};

// --- Notification Function (Aapka original function) ---
function showNotification(msg, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-slate-900' : 'bg-rose-600';
    const icon = type === 'success' ? '✨' : '🗑️';

    toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold animate-slide flex items-center gap-3 border-l-4 border-cyan-400 min-w-[200px]`;
    toast.innerHTML = `<span>${icon}</span> ${msg}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 1. Sections change karne ka function (Updated for Staff)
function showSection(sectionId) {
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('appointmentsSection').classList.add('hidden');
    document.getElementById('pharmacySection').classList.add('hidden');
    document.getElementById('staffSection').classList.add('hidden'); // Staff add kiya

    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.classList.remove('hidden');
    }
    if(sectionId === 'staff') renderStaff();
}

// 2. Add Patient wala Modal open/close
function toggleModal() {
    document.getElementById('modal').classList.toggle('hidden');
}

// 3. Naya Patient save karne ka function
function savePatient() {
    const nameInput = document.getElementById('name');
    const diseaseInput = document.getElementById('disease');
    
    if (nameInput.value && diseaseInput.value) {
        patients.push({ 
            id: Date.now(), 
            name: nameInput.value, 
            disease: diseaseInput.value 
        });
        localStorage.setItem('hospitalData', JSON.stringify(patients));
        renderTable();
        toggleModal();
        showNotification("Patient Record Saved!");
        nameInput.value = '';
        diseaseInput.value = '';
    } else {
        alert("Please fill all fields!");
    }
}

// 4. Table aur Total Count dikhane ka function
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
                <td class="p-6 text-right"><button onclick="deletePatient(${p.id})" class="text-rose-500 font-bold hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Remove</button></td>
            </tr>`;
    });
}

// 5. Patient delete karne ka function
function deletePatient(id) {
    if(confirm("Delete this patient?")) {
        patients = patients.filter(p => p.id !== id);
        localStorage.setItem('hospitalData', JSON.stringify(patients));
        renderTable();
        showNotification("Patient Removed!", "error");
    }
}

// --- NEW: Staff & Healthy Tips Functions ---

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
    showNotification(`💡 Health Reminder: ${tip.text}`);
}

// --- Baki Ke Original Functions ---

function searchPatient() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let rows = document.querySelectorAll('#patientList tr');
    rows.forEach(row => {
        let name = row.getElementsByTagName('td')[0].innerText.toLowerCase();
        row.style.display = name.includes(input) ? "" : "none";
    });
}

function buyMed(name, price) {
    const billItem = document.getElementById('billItem');
    const billTotal = document.getElementById('billTotal');
    const billModal = document.getElementById('billModal');

    if (billItem && billTotal && billModal) {
        billItem.innerText = name;
        billTotal.innerText = "Rs. " + price;
        billModal.classList.remove('hidden');
        showNotification("Item added to bill!");
    }
}

function closeBill() {
    const billModal = document.getElementById('billModal');
    if (billModal) billModal.classList.add('hidden');
}

function bookAppoint() {
    let date = document.getElementById('appDate').value;
    let doctor = document.getElementById('docSelect').value;
    if(date) {
        showNotification("Appointment Booked!");
    } else {
        alert("Please select a date!");
    }
}
