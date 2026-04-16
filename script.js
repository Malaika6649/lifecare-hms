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

// --- LOGIN FUNCTION (Isay Window par attach karna zaroori hai) ---
window.handleLogin = () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    // Hardcoded check for project testing
    if ((email === "admin@test.com" && pass === "123") || 
        (email === localStorage.getItem('storedEmail') && pass === localStorage.getItem('storedPass'))) {
        
        localStorage.setItem('isLoggedIn', 'true');
        alert("Login Successful! Processing Queue...");
        location.reload(); 
    } else {
        alert("Invalid Login Details!");
    }
};

window.handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    location.reload();
};

// --- REAL-TIME DATA SYNC ---
function startSync() {
    // Patient Queue (FIFO - Data Structure)
    onSnapshot(query(collection(db, "patients"), orderBy("time", "asc")), (snap) => {
        const list = document.getElementById('patientList');
        if(list) {
            list.innerHTML = "";
            snap.forEach(d => {
                const p = d.data();
                list.innerHTML += `<tr class="border-b">
                    <td class="p-4">${p.name}</td>
                    <td class="p-4 text-emerald-600">${p.disease}</td>
                </tr>`;
            });
        }
    });
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('isLoggedIn') === 'true') {
        if(document.getElementById('authSection')) document.getElementById('authSection').classList.add('hidden');
        if(document.getElementById('mainDashboard')) document.getElementById('mainDashboard').classList.remove('hidden');
        startSync();
    }
});
