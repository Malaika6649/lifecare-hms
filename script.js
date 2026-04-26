// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyANCd9_8skLjVS_IaVgfbk24ZAlYeZpCR8",
    authDomain: "lifecare-hms-117d8.firebaseapp.com",
    projectId: "lifecare-hms-117d8",
    storageBucket: "lifecare-hms-117d8.firebasestorage.app",
    messagingSenderId: "489995234025",
    appId: "1:489995234025:web:c5a7d23f71b71aa2e51e78"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================================
// 1. DATA STRUCTURES (DSA) - LINKED LIST
// ==========================================
class PatientNode {
    constructor(id, name, disease) {
        this.id = id;
        this.name = name;
        this.disease = disease;
        this.next = null; // Pointer to the next node
    }
}

class HospitalLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // Node add karna (Insertion at Tail)
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

    // List ko empty karna naye snapshot ke liye
    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // UI Render karna (Traversal)
    render() {
        const tbody = document.getElementById('patientTableBody');
        const visualizer = document.getElementById('linkedListVisualizer');
        document.getElementById('countP').innerText = this.size;
        
        if (this.size === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-16 text-center text-slate-300 font-black italic">NO patient today</td></tr>`;
            if(visualizer) visualizer.innerHTML = `<div class="text-slate-300 text-xs italic">Queue is empty. Head points to NULL.</div>`;
            return;
        }

        let tableHtml = "";
        let visualHtml = "";
        let current = this.head; // Start from Head
        let index = 0;

        while (current) {
            // 1. Table Row Generation
            tableHtml += `
                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td class="p-5 font-bold text-slate-700 text-sm">${current.name}</td>
                    <td class="p-5"><span class="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter">${current.disease}</span></td>
                    <td class="p-5 text-right"><button onclick="delPatient('${current.id}')" class="text-rose-200 hover:text-rose-500 transition-colors"><i class="fas fa-trash-alt"></i></button></td>
                </tr>
            `;

            // 2. Visual Node Generation (DSA Visualization)
            const isHead = index === 0;
            visualHtml += `
                <div class="flex-shrink-0 px-5 py-3 rounded-2xl border transition-all duration-500 ${isHead ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-100' : 'bg-white text-slate-700 border-slate-100'}">
                    <div class="text-[8px] uppercase font-black ${isHead ? 'text-blue-200' : 'text-slate-400'}">${isHead ? 'HEAD NODE' : 'NODE'}</div>
                    <div class="font-bold text-xs truncate max-w-[100px]">${current.name}</div>
                </div>
                <div class="flex-shrink-0 flex flex-col items-center gap-1">
                    <i class="fas fa-arrow-right ${current.next ? 'text-blue-300' : 'text-slate-200'} text-xs"></i>
                    <span class="text-[7px] font-bold ${current.next ? 'text-slate-300' : 'text-slate-400'}">${current.next ? 'NEXT' : 'NULL'}</span>
                </div>
            `;

            current = current.next; // Move to next node
            index++;
        }
        
        tbody.innerHTML = tableHtml;
        if(visualizer) visualizer.innerHTML = visualHtml;
    }
}

const patientLL = new HospitalLinkedList();

// 2. App Core Functions
window.showPage = function(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('page-' + id).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + id).classList.add('active');
    if(window.innerWidth < 1024) toggleSidebar();
};

window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

// 3. Greetings & Real-time Clock
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

// 4. Health Tips
function updateHealthTips() {
    const tips = [
        "Hydration is key! Drink 8-10 glasses of water.",
        "Eggs for breakfast provide essential proteins.",
        "A 15-minute brisk walk can lower blood sugar.",
        "Sleep is the best medicine. Target 8 hours tonight.",
        "Green tea after meals can boost metabolism."
    ];
    const tipEl = document.getElementById('healthTip');
    if(tipEl) tipEl.innerText = tips[Math.floor(Math.random()*tips.length)];
}

// 5. Doctor Management
const doctors = [
    { name: "Dr. Ahmed Khan", role: "Heart Specialist", status: "Available", time: "9am - 3pm", days: "Mon-Fri" },
    { name: "Dr. Sara Malik", role: "Child Specialist", status: "Busy", time: "11am - 6pm", days: "Mon-Sat" },
    { name: "Dr. Zohaib Hassan", role: "Bone Surgeon", status: "Available", time: "5pm - 10pm", days: "Tue-Sun" },
    { name: "Dr. Fatima Ali", role: "Gynecologist", status: "On Leave", time: "10am - 4pm", days: "Wed-Fri" },
    { name: "Dr. Usman Sheikh", role: "Skin Specialist", status: "Available", time: "2pm - 9pm", days: "Mon-Thu" },
    { name: "Dr. Maria Khan", role: "Brain Specialist", status: "Busy", time: "9am - 12pm", days: "Sat-Sun" }
];

function loadStaff() {
    const grid = document.getElementById('doctorGrid');
    if(!grid) return;
    grid.innerHTML = doctors.map(d => {
        let color = d.status === "Available" ? "emerald" : (d.status === "Busy" ? "amber" : "rose");
        return `
            <div class="card p-8 bg-white border-t-8 border-t-${color}-400">
                <div class="flex justify-between items-start mb-6">
                    <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner"><i class="fas fa-user-md"></i></div>
                    <span class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-${color}-50 text-${color}-600 text-[10px] font-black uppercase">
                        <span class="w-2 h-2 rounded-full bg-${color}-500 animate-pulse"></span> ${d.status}
                    </span>
                </div>
                <h4 class="text-xl font-bold text-slate-800">${d.name}</h4>
                <p class="text-blue-500 font-bold text-xs uppercase tracking-widest mt-1">${d.role}</p>
                <div class="mt-6 pt-6 border-t border-slate-50 space-y-3">
                    <div class="flex items-center gap-3 text-slate-400 text-xs font-medium"><i class="fas fa-clock w-4"></i> ${d.time}</div>
                    <div class="flex items-center gap-3 text-slate-400 text-xs font-medium"><i class="fas fa-calendar-alt w-4"></i> ${d.days}</div>
                </div>
                <button onclick="bookApp('${d.name}')" class="w-full mt-8 py-4 rounded-2xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Book Appointment</button>
            </div>
        `;
    }).join('');
}

window.bookApp = (doc) => {
    Swal.fire({
        title: 'Confirm Booking?',
        text: `Consult with ${doc} will be scheduled.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#f1f5f9',
        confirmButtonText: 'Confirm'
    }).then(r => { if(r.isConfirmed) Swal.fire('Successful!', 'Our team will call you back.', 'success'); });
};

// 6. Pharmacy (100 Meds)
const meds = [];
const medNames = ["Panadol", "Arinac", "Augmentin", "Risek", "Brufen", "Disprin", "Flagyl", "Softin", "Caldoc", "Surbex"];
for(let i=1; i<=100; i++) {
    meds.push({ name: medNames[i%10] + " " + (i*5) + "mg", price: Math.floor(Math.random()*500) + 30 });
}

window.filterMeds = () => {
    const searchEl = document.getElementById('searchMed');
    if(!searchEl) return;
    const term = searchEl.value.toLowerCase();
    const grid = document.getElementById('medicineGrid');
    grid.innerHTML = meds.filter(m => m.name.toLowerCase().includes(term)).map(m => `
        <div class="card p-5 text-center bg-white cursor-pointer hover:border-blue-400" onclick="buyMed('${m.name}', ${m.price})">
            <div class="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3"><i class="fas fa-capsules"></i></div>
            <p class="font-bold text-[11px] text-slate-700 leading-tight">${m.name}</p>
            <p class="text-[9px] text-emerald-500 font-black mt-2 uppercase tracking-widest">Rs. ${m.price}</p>
        </div>
    `).join('');
};

window.buyMed = (n, p) => {
    Swal.fire({
        title: 'Generate Bill?',
        text: `Add ${n} (Rs.${p}) to your records?`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Save & Print'
    }).then(r => { if(r.isConfirmed) Swal.fire('Bill Saved', 'Medicine record updated.', 'success'); });
};

// 7. Firebase Sync with DSA (Linked List Integration)
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
    const n = document.getElementById('pName').value, d = document.getElementById('pDisease').value;
    if(n && d) {
        await db.collection("patients").add({ name: n, disease: d, time: new Date() });
        closeModal('patientModal');
        Swal.fire('Admitted', 'Patient added via Linked List logic.', 'success');
        document.getElementById('pName').value = ""; document.getElementById('pDisease').value = "";
    }
};

window.delPatient = (id) => {
    Swal.fire({ title: 'Checkup Complete?', text: 'Removing patient from queue.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(async r => {
        if(r.isConfirmed) { await db.collection("patients").doc(id).delete(); Swal.fire('Removed', 'Linked List node updated.', 'success'); }
    });
};

// Start
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');

startClock();
updateHealthTips();
loadStaff();
filterMeds();
syncPatients();
