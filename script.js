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

// 1. App Core Functions
window.showPage = function(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('page-' + id).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + id).classList.add('active');
    if(window.innerWidth < 1024) toggleSidebar();
};

window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

// 2. Greetings & Real-time Clock
function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('liveClock').innerText = now.toLocaleTimeString() + " | " + now.toDateString();
        
        const hr = now.getHours();
        const greet = document.getElementById('greetingText');
        if(hr < 12) greet.innerText = "Good Morning, Gentleman & Beautiful People";
        else if(hr < 18) greet.innerText = "Good Afternoon, Professionals";
        else greet.innerText = "Good Evening, Sir/Madam";
    }, 1000);
}

// 3. Health Tips (3 times a day change logic)
function updateHealthTips() {
    const tips = [
        "Hydration is key! Drink 8-10 glasses of water.",
        "Eggs for breakfast provide essential proteins.",
        "A 15-minute brisk walk can lower blood sugar.",
        "Sleep is the best medicine. Target 8 hours tonight.",
        "Green tea after meals can boost metabolism."
    ];
    // Random tip each refresh or every few hours
    document.getElementById('healthTip').innerText = tips[Math.floor(Math.random()*tips.length)];
}

// 4. Doctor Management
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

// 5. Pharmacy (100 Meds)
const meds = [];
const medNames = ["Panadol", "Arinac", "Augmentin", "Risek", "Brufen", "Disprin", "Flagyl", "Softin", "Caldoc", "Surbex"];
for(let i=1; i<=100; i++) {
    meds.push({ name: medNames[i%10] + " " + (i*5) + "mg", price: Math.floor(Math.random()*500) + 30 });
}

window.filterMeds = () => {
    const term = document.getElementById('searchMed').value.toLowerCase();
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

// 6. Firebase Sync (Live Queue)
function syncPatients() {
    db.collection("patients").orderBy("time", "desc").onSnapshot(snap => {
        const tbody = document.getElementById('patientTableBody');
        document.getElementById('countP').innerText = snap.size;
        
        if(snap.empty) {
            tbody.innerHTML = `<tr><td class="p-16 text-center text-slate-300 font-black italic">NO patient today</td></tr>`;
            return;
        }

        tbody.innerHTML = snap.docs.map(doc => {
            const p = doc.data();
            return `
                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td class="p-5 font-bold text-slate-700 text-sm">${p.name}</td>
                    <td class="p-5"><span class="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter">${p.disease}</span></td>
                    <td class="p-5 text-right"><button onclick="delPatient('${doc.id}')" class="text-rose-200 hover:text-rose-500 transition-colors"><i class="fas fa-trash-alt"></i></button></td>
                </tr>
            `;
        }).join('');
    });
}

window.savePatient = async () => {
    const n = document.getElementById('pName').value, d = document.getElementById('pDisease').value;
    if(n && d) {
        await db.collection("patients").add({ name: n, disease: d, time: new Date() });
        closeModal('patientModal');
        Swal.fire('Admitted', 'Patient added to live queue.', 'success');
        document.getElementById('pName').value = ""; document.getElementById('pDisease').value = "";
    }
};

window.delPatient = (id) => {
    Swal.fire({ title: 'Delete Patient?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(async r => {
        if(r.isConfirmed) { await db.collection("patients").doc(id).delete(); Swal.fire('Removed', 'Record deleted.', 'success'); }
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
