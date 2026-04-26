// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyANCd9_8skLjVS_IaVgfbk24ZAlYeZpCR8",
    authDomain: "lifecare-hms-117d8.firebaseapp.com",
    projectId: "lifecare-hms-117d8",
    storageBucket: "lifecare-hms-117d8.firebasestorage.app",
    messagingSenderId: "489995234025",
    appId: "1:489995234025:web:c5a7d23f71b71aa2e51e78"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ==========================================
// 1. LINKED LIST DATA STRUCTURE
// ==========================================
class PatientNode {
    constructor(id, name, disease) {
        this.id = id;
        this.name = name;
        this.disease = disease;
        this.next = null;
    }
}

class HospitalLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    append(id, name, disease) {
        const newNode = new PatientNode(id, name, disease);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    render() {
        const tbody = document.getElementById('patientTableBody');
        const visualizer = document.getElementById('linkedListVisualizer');
        const countP = document.getElementById('countP');
        
        if(countP) countP.innerText = this.size;
        
        if (!tbody) return;

        if (this.size === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-16 text-center text-slate-300 font-black italic">NO patient today</td></tr>`;
            if(visualizer) visualizer.innerHTML = `<div class="text-slate-300 text-xs italic">Queue is empty. Head points to NULL.</div>`;
            return;
        }

        let tableHtml = "";
        let visualHtml = "";
        let current = this.head;
        let index = 0;

        while (current) {
            // Table Rows
            tableHtml += `
                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td class="p-5 font-bold text-slate-700 text-sm">${current.name}</td>
                    <td class="p-5"><span class="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter">${current.disease}</span></td>
                    <td class="p-5 text-right"><button onclick="delPatient('${current.id}')" class="text-rose-200 hover:text-rose-500 transition-colors"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;

            // DSA Visual Nodes
            const isHead = index === 0;
            visualHtml += `
                <div class="flex-shrink-0 px-5 py-3 rounded-2xl border transition-all duration-500 ${isHead ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-100' : 'bg-white text-slate-700 border-slate-100'}">
                    <div class="text-[8px] uppercase font-black ${isHead ? 'text-blue-200' : 'text-slate-400'}">${isHead ? 'HEAD NODE' : 'NODE'}</div>
                    <div class="font-bold text-xs truncate max-w-[100px]">${current.name}</div>
                </div>
                <div class="flex-shrink-0 flex flex-col items-center gap-1">
                    <i class="fas fa-arrow-right ${current.next ? 'text-blue-300' : 'text-slate-200'} text-xs"></i>
                    <span class="text-[7px] font-bold ${current.next ? 'text-slate-300' : 'text-slate-400'}">${current.next ? 'NEXT' : 'NULL'}</span>
                </div>`;

            current = current.next;
            index++;
        }
        
        tbody.innerHTML = tableHtml;
        if(visualizer) visualizer.innerHTML = visualHtml;
    }
}

const patientLL = new HospitalLinkedList();

// ==========================================
// 2. CORE UI FUNCTIONS (RESTORED)
// ==========================================
window.showPage = function(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    const targetPage = document.getElementById('page-' + id);
    if(targetPage) targetPage.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const targetBtn = document.getElementById('btn-' + id);
    if(targetBtn) targetBtn.classList.add('active');

    if(window.innerWidth < 1024) toggleSidebar();
};

window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.toggle('active');
};

// ==========================================
// 3. CLOCK & GREETINGS (RESTORED)
// ==========================================
function startClock() {
    setInterval(() => {
        const now = new Date();
        const clockEl = document.getElementById('liveClock');
        if(clockEl) clockEl.innerText = now.toLocaleTimeString() + " | " + now.toDateString();
        
        const hr = now.getHours();
        const greet = document.getElementById('greetingText');
        if(greet) {
            if(hr < 12) greet.innerText = "Good Morning, Gentleman & Beautiful People";
            else if(hr < 18) greet.innerText = "Good Afternoon, Professionals";
            else greet.innerText = "Good Evening, Sir/Madam";
        }
    }, 1000);
}

// ==========================================
// 4. OTHER FEATURES (PHARMACY, DOCTORS, TIPS)
// ==========================================
function updateHealthTips() {
    const tips = ["Hydration is key!", "Eggs for breakfast!", "15-min walk!", "Target 8h sleep!", "Green tea!"];
    const tipEl = document.getElementById('healthTip');
    if(tipEl) tipEl.innerText = tips[Math.floor(Math.random()*tips.length)];
}

const doctors = [
    { name: "Dr. Ahmed Khan", role: "Heart Specialist", status: "Available", time: "9am - 3pm", days: "Mon-Fri" },
    { name: "Dr. Sara Malik", role: "Child Specialist", status: "Busy", time: "11am - 6pm", days: "Mon-Sat" }
];

function loadStaff() {
    const grid = document.getElementById('doctorGrid');
    if(!grid) return;
    grid.innerHTML = doctors.map(d => `
        <div class="card p-8 bg-white border-t-8 border-t-blue-400">
            <h4 class="text-xl font-bold">${d.name}</h4>
            <p class="text-blue-500 text-xs font-black uppercase">${d.role}</p>
            <button class="w-full mt-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold">BOOK NOW</button>
        </div>
    `).join('');
}

// ==========================================
// 5. FIREBASE & CRUD
// ==========================================
function syncPatients() {
    db.collection("patients").orderBy("time", "asc").onSnapshot(snap => {
        patientLL.clear();
        snap.forEach(doc => {
            const p = doc.data();
            patientLL.append(doc.id, p.name, p.disease);
        });
        patientLL.render();
    });
}

window.savePatient = async () => {
    const n = document.getElementById('pName').value;
    const d = document.getElementById('pDisease').value;
    if(n && d) {
        await db.collection("patients").add({ name: n, disease: d, time: new Date() });
        window.closeModal('patientModal');
        Swal.fire('Success', 'Patient added!', 'success');
        document.getElementById('pName').value = ""; 
        document.getElementById('pDisease').value = "";
    }
};

window.delPatient = (id) => {
    Swal.fire({ title: 'Complete?', icon: 'warning', showCancelButton: true }).then(async r => {
        if(r.isConfirmed) { await db.collection("patients").doc(id).delete(); }
    });
};

window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');

// Initialization
startClock();
updateHealthTips();
loadStaff();
syncPatients();
