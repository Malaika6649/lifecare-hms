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

        document.getElementById('tipLabel').innerText = lbl;

    }

}



// --- 2. LOGIN FUNCTION (Fixed & Attached) ---

window.handleLogin = () => {

    const email = document.getElementById('loginEmail').value.trim();

    const pass = document.getElementById('loginPass').value.trim();



    if (email === "admin@test.com" && pass === "123") {

        localStorage.setItem('isLoggedIn', 'true');

        alert("Success! Unlocking Dashboard...");

        location.reload(); // Page ko refresh karega naya view dikhane ke liye

    } else {

        alert("Invalid Password! Try: 123");

    }

};



window.handleLogout = () => {

    localStorage.removeItem('isLoggedIn');

    location.reload();

};



// --- 3. REAL-TIME DATA SYNC (Patients & Staff) ---

function startSync() {

    // Patient Queue (FIFO)

    onSnapshot(query(collection(db, "patients"), orderBy("time", "asc")), (snap) => {

        const list = document.getElementById('patientList');

        const totalP = document.getElementById('totalPatients');

        if(totalP) totalP.innerText = snap.size;

        if(list) {

            list.innerHTML = "";

            snap.forEach(d => {

                const p = d.data();

                list.innerHTML += `<tr class="border-b hover:bg-slate-50">

                    <td class="p-4 font-bold">${p.name}</td>

                    <td class="p-4"><span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">${p.disease}</span></td>

                </tr>`;

            });

        }

    });



    // Staff List

    onSnapshot(collection(db, "staff"), (snap) => {

        const staffList = document.getElementById('staffList');

        const countS = document.getElementById('countS');

        if(countS) countS.innerText = snap.size;

        if(staffList) {

            staffList.innerHTML = "";

            snap.forEach(d => {

                const s = d.data();

                staffList.innerHTML += `<div class="p-4 bg-white border rounded-2xl shadow-sm flex justify-between items-center">

                    <div><p class="font-bold">${s.name}</p><p class="text-xs text-slate-500">${s.role}</p></div>

                </div>`;

            });

        }

    });

}



// --- 4. RUN ON LOAD ---

function init() {

    if(localStorage.getItem('isLoggedIn') === 'true') {

        // UI Sections Toggle

        if(document.getElementById('authSection')) document.getElementById('authSection').classList.add('hidden');

        if(document.getElementById('mainDashboard')) document.getElementById('mainDashboard').classList.remove('hidden');

        

        updateTips();

        startSync();

    }

}



// For module scripts, we call init directly

init();
