import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- 1. HEALTHY TIPS FUNCTION ---
function updateTips() {
    const hr = new Date().getHours();
    let msg = "", lbl = "";
    if(hr >= 5 && hr < 12) { lbl = "Morning ☀️"; msg = "Start your day with a glass of water and light exercise!"; }
    else if(hr >= 12 && hr < 17) { lbl = "Afternoon 🌤️"; msg = "Stay hydrated and take a 5-minute stretch break."; }
    else { lbl = "Evening 🌙"; msg = "Eat a light dinner and aim for 8 hours of sleep."; }
    
    if(document.getElementById('healthyTip')) {
        document.getElementById('healthyTip').innerText = msg;
        if(document.getElementById('tipLabel')) document.getElementById('tipLabel').innerText = lbl;
    }
}

// --- 2. LOGIN & AUTH (Admin vs User) ---
window.handleLogin = () => {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    if (email === "admin@test.com" && pass === "123") {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        alert("Success! Unlocking Admin Dashboard...");
        location.reload();
    } else if (email !== "" && pass !== "") {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'user');
        alert("Welcome to LifeCare Patient Portal!");
        location.reload();
    } else {
        alert("Please enter valid credentials.");
    }
};

window.handleLogout = () => {
    localStorage.clear();
    location.reload();
};

// --- 3. REAL-TIME DATA SYNC (All Modules) ---
function startSync() {
    const role = localStorage.getItem('userRole');

    // A. Patient Queue
    onSnapshot(query(collection(db, "patients"), orderBy("time", "asc")), (snap) => {
        const list = document.getElementById('patientList');
        const countP = document.getElementById('countP');
        if(countP) countP.innerText = snap.size;
        if(list) {
            list.innerHTML = "";
            snap.forEach(d => {
                const p = d.data();
                const delBtn = (role === 'admin') ? `<button onclick="window.deleteItem('patients', '${d.id}')" class="text-rose-400 font-bold ml-4">Delete</button>` : '';
                list.innerHTML += `<tr class="border-b hover:bg-slate-50 transition-all">
                    <td class="p-8 font-bold">${p.name}</td>
                    <td class="p-8"><span class="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">${p.disease}</span></td>
                    <td class="p-8 text-right">${delBtn}</td>
                </tr>`;
            });
        }
    });

    // B. Staff List
    onSnapshot(collection(db, "staff"), (snap) => {
        const staffList = document.getElementById('staffList');
        const countS = document.getElementById('countS');
        if(countS) countS.innerText = snap.size;
        if(staffList) {
            staffList.innerHTML = "";
            snap.forEach(d => {
                const s = d.data();
                const delBtn = (role === 'admin') ? `<button onclick="window.deleteItem('staff', '${d.id}')" class="text-rose-400 ml-2">✕</button>` : '';
                staffList.innerHTML += `<div class="glass-card p-8 rounded-[3rem] flex justify-between items-center group">
                    <div><h4 class="font-bold text-lg">${s.name}</h4><p class="text-emerald-500 text-[10px] font-black uppercase mt-1 tracking-widest">${s.role}</p></div>
                    ${delBtn}
                </div>`;
            });
        }
    });

    // C. Billing Sync
    onSnapshot(query(collection(db, "bills"), orderBy("createdAt", "desc")), (snap) => {
        const billHistory = document.getElementById('billHistory');
        if(billHistory) {
            billHistory.innerHTML = "";
            snap.forEach(d => {
                const b = d.data();
                billHistory.innerHTML += `<div class="flex justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div><p class="font-bold">${b.name}</p><p class="text-xs text-slate-400">${b.date}</p></div>
                    <p class="font-black text-emerald-600">Rs. ${b.amount}</p>
                </div>`;
            });
        }
    });
}

// --- 4. NEW ACTIONS (Add/Delete/Purchase) ---

// Save Patient Record
window.savePatient = async () => {
    const n = document.getElementById('name').value, d = document.getElementById('disease').value;
    if(n && d) {
        await addDoc(collection(db, "patients"), { name: n, disease: d, time: new Date() });
        document.getElementById('modal').classList.add('hidden');
        showNotification("Patient Record Added!");
    }
};

// Generate Bill
window.addBill = async () => {
    const n = document.getElementById('billName').value, a = document.getElementById('billAmt').value;
    if(n && a) {
        await addDoc(collection(db, "bills"), {
            name: n, 
            amount: a, 
            date: new Date().toLocaleTimeString(),
            createdAt: new Date()
        });
        document.getElementById('billName').value = "";
        document.getElementById('billAmt').value = "";
        showNotification("Invoice Generated!");
    }
};

// Global Delete Function
window.deleteItem = async (col, id) => {
    if(confirm("Are you sure you want to delete this?")) {
        await deleteDoc(doc(db, col, id));
        showNotification("Item Removed.");
    }
};

// Pharmacy Purchase Notification
window.buyMed = (med, price) => {
    showNotification(`Success: ${med} purchased for Rs. ${price}`);
};

function showNotification(m) {
    const container = document.getElementById('notification-container');
    if(!container) return;
    const n = document.createElement('div');
    n.className = "bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl font-bold animate-bounce";
    n.innerText = m;
    container.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

// --- 5. INITIALIZATION ---
function init() {
    if(localStorage.getItem('isLoggedIn') === 'true') {
        if(document.getElementById('authSection')) document.getElementById('authSection').classList.add('hidden');
        if(document.getElementById('mainDashboard')) document.getElementById('mainDashboard').classList.remove('hidden');
        
        // Admin permissions check
        const role = localStorage.getItem('userRole');
        if(role !== 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
            const title = document.getElementById('roleTitle');
            if(title) title.innerText = "Patient View Portal";
        }

        updateTips();
        startSync();
    }
}

init();
