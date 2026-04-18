import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyANCd9_8skLjVS_IaVgfbk24ZAlYeZpCR8",
    authDomain: "lifecare-hms-117d8.firebaseapp.com",
    projectId: "lifecare-hms-117d8",
    storageBucket: "lifecare-hms-117d8.firebasestorage.app",
    messagingSenderId: "489995234025",
    appId: "1:489995234025:web:c5a7d23f71b71aa2e51e78"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 1. Real-time Greetings & Clock ---
function setupHeader() {
    const hr = new Date().getHours();
    const greet = document.getElementById('greetingText');
    if (hr < 12) greet.innerText = "Good Morning, Gentleman & Beautiful People";
    else if (hr < 18) greet.innerText = "Good Afternoon, Professionals";
    else greet.innerText = "Good Evening, Sir/Madam";

    setInterval(() => {
        document.getElementById('liveClock').innerText = new Date().toLocaleTimeString() + " | " + new Date().toDateString();
    }, 1000);
}

// --- 2. Dynamic Health Tips ---
const tips = [
    "Drink 8 glasses of water today for kidney health.",
    "A 15-minute walk can boost your heart health significantly.",
    "Avoid sugar in your green tea to manage portion control.",
    "Healthy breakfast with eggs gives you long-lasting energy.",
    "Early to bed and early to rise makes you healthy and wise."
];
document.getElementById('healthTip').innerText = tips[Math.floor(Math.random() * tips.length)];

// --- 3. Online Pharmacy (100+ Medicines Logic) ---
const medicines = [];
const medNames = ["Panadol", "Augmentin", "Arinac", "Brufen", "Disprin", "Caldoc", "Surbex-Z", "Flagyl", "Entamizole", "Risek"];
// Auto-generate 100 meds for demo
for(let i=1; i<=100; i++) {
    medicines.push({
        id: i,
        name: medNames[i % medNames.length] + " " + (i*10) + "mg",
        price: Math.floor(Math.random() * 500) + 50
    });
}

function loadPharmacy() {
    const grid = document.getElementById('medicineGrid');
    grid.innerHTML = medicines.map(m => `
        <div class="card p-5 text-center hover:border-blue-500 cursor-pointer transition-all group">
            <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <i class="fas fa-capsules"></i>
            </div>
            <h4 class="font-bold text-sm">${m.name}</h4>
            <p class="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Rs. ${m.price}</p>
            <button onclick="addToCart('${m.name}', ${m.price})" class="mt-4 text-[10px] bg-slate-100 px-4 py-2 rounded-lg font-bold hover:bg-emerald-500 hover:text-white">Add to Bill</button>
        </div>
    `).join('');
}

// --- 4. Firebase Sync (Patients) ---
function syncData() {
    onSnapshot(query(collection(db, "patients"), orderBy("time", "desc")), (snap) => {
        const tbody = document.getElementById('patientTableBody');
        document.getElementById('countP').innerText = snap.size;
        
        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-10 text-center text-slate-400 font-bold">NO Patient Today ☕</td></tr>`;
            return;
        }

        tbody.innerHTML = snap.docs.map(doc => {
            const p = doc.data();
            return `
                <tr class="hover:bg-slate-50/50 border-b border-slate-50 last:border-none">
                    <td class="p-5 font-bold text-slate-700">${p.name}</td>
                    <td class="p-5"><span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">${p.disease}</span></td>
                    <td class="p-5 text-right">
                        <button onclick="deletePatient('${doc.id}')" class="text-rose-300 hover:text-rose-500"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    });
}

// --- 5. Global Functions (Delete, Save, Modal) ---
window.deletePatient = (id) => {
    Swal.fire({
        title: 'Delete Record?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#f43f5e',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDoc(doc(db, "patients", id));
            Swal.fire('Deleted!', 'Record has been removed.', 'success');
        }
    });
};

window.savePatient = async () => {
    const n = document.getElementById('pName').value;
    const d = document.getElementById('pDisease').value;
    if(n && d) {
        await addDoc(collection(db, "patients"), { name: n, disease: d, time: new Date() });
        closeModal('patientModal');
        Swal.fire('Success', 'Patient Registered', 'success');
        document.getElementById('pName').value = ""; document.getElementById('pDisease').value = "";
    }
};

window.showPage = (id) => {
    document.querySelectorAll('.page-section').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + id).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + id).classList.add('active');
};

window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');
window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

// --- Start ---
setupHeader();
syncData();
loadPharmacy();
