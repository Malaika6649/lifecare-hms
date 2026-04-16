<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // --- Firebase Config ---
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

    // --- 1. AUTHENTICATION LOGIC (Global accessible) ---
    window.handleLogin = () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        const savedEmail = localStorage.getItem('storedEmail');
        const savedPass = localStorage.getItem('storedPass');

        if((email === savedEmail && pass === savedPass) || (email === "admin@test.com" && pass === "123")) {
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('mainDashboard').classList.remove('hidden');
            localStorage.setItem('isLoggedIn', 'true');
            
            initCloudSync(); // Start loading data from Cloud
            updateHealthTips();
            window.showNotification("Welcome back to LifeCare Cloud!");
        } else {
            window.showNotification("Invalid Email or Password!", "error");
        }
    };

    window.handleSignup = () => {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;

        if(name && email && pass) {
            localStorage.setItem('storedName', name);
            localStorage.setItem('storedEmail', email);
            localStorage.setItem('storedPass', pass);
            window.showNotification("Account Created! Please Sign In.");
            window.toggleAuth(false);
        } else {
            window.showNotification("Please fill all fields!", "error");
        }
    };

    // --- 2. CLOUD DATA MANAGEMENT (Patients & Staff) ---
    
    // Save Patient to Cloud
    window.savePatient = async () => {
        const name = document.getElementById('name').value;
        const disease = document.getElementById('disease').value;
        if (name && disease) {
            try {
                await addDoc(collection(db, "patients"), { 
                    name, 
                    disease, 
                    createdAt: new Date() 
                });
                window.toggleModal('modal');
                document.getElementById('name').value = '';
                document.getElementById('disease').value = '';
                window.showNotification("Patient Saved to Cloud!");
            } catch (e) { console.error("Error:", e); }
        }
    };

    // Save Staff to Cloud
    window.saveStaff = async () => {
        const name = document.getElementById('staffName').value;
        const role = document.getElementById('staffRole').value;
        if (name && role) {
            try {
                await addDoc(collection(db, "staff"), { name, role });
                window.toggleStaffModal();
                document.getElementById('staffName').value = '';
                document.getElementById('staffRole').value = '';
                window.showNotification("Staff Registered!");
            } catch (e) { console.error("Error:", e); }
        }
    };

    // Delete from Cloud
    window.deleteData = async (colName, id) => {
        if(confirm("Are you sure you want to delete this from Cloud?")) {
            await deleteDoc(doc(db, colName, id));
            window.showNotification("Record Deleted!", "error");
        }
    };

    // --- 3. REAL-TIME SYNC (The Magic) ---
    function initCloudSync() {
        // Sync Patients
        onSnapshot(query(collection(db, "patients"), orderBy("createdAt", "desc")), (snapshot) => {
            const list = document.getElementById('patientList');
            if(!list) return;
            list.innerHTML = "";
            document.getElementById('totalPatients').innerText = snapshot.size;
            
            snapshot.forEach((docSnap) => {
                const p = docSnap.data();
                list.innerHTML += `
                <tr class="border-b border-slate-50">
                    <td class="p-6 font-bold text-slate-800">${p.name}</td>
                    <td class="p-6"><span class="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-xs font-bold uppercase">${p.disease}</span></td>
                    <td class="p-6 text-right">
                        <button onclick="deleteData('patients', '${docSnap.id}')" class="text-rose-500 font-bold hover:bg-rose-50 px-4 py-2 rounded-xl">Delete</button>
                    </td>
                </tr>`;
            });
        });

        // Sync Staff
        onSnapshot(collection(db, "staff"), (snapshot) => {
            const container = document.getElementById('staffList');
            if(!container) return;
            container.innerHTML = "";
            snapshot.forEach((docSnap) => {
                const s = docSnap.data();
                container.innerHTML += `
                <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                    <div><h4 class="font-bold text-slate-900">${s.name}</h4><p class="text-indigo-500 text-sm font-bold">${s.role}</p></div>
                    <button onclick="deleteData('staff', '${docSnap.id}')" class="text-rose-500 font-bold hover:bg-rose-50 p-2 rounded-lg">Remove</button>
                </div>`;
            });
        });
    }

    // --- 4. UTILS & UI ---
    window.showNotification = (msg, type = 'success') => {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-slate-900' : 'bg-rose-600';
        toast.className = `${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border-l-4 border-cyan-400 min-w-[280px] mb-2`;
        toast.innerHTML = `<span>${type === 'success' ? '✨' : '⚠️'}</span> ${msg}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    window.toggleAuth = (isSignup) => {
        document.getElementById('loginFields').classList.toggle('hidden', isSignup);
        document.getElementById('signupFields').classList.toggle('hidden', !isSignup);
    };

    window.toggleModal = () => document.getElementById('modal').classList.toggle('hidden');
    window.toggleStaffModal = () => document.getElementById('staffModal').classList.toggle('hidden');

    window.showSection = (sectionId) => {
        const sections = ['dashboardSection', 'appointmentsSection', 'pharmacySection', 'staffSection'];
        sections.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        document.getElementById(sectionId + 'Section')?.classList.remove('hidden');
    };

    function updateHealthTips() {
        const hour = new Date().getHours();
        const tips = {
            morning: "Morning: Drink warm water and exercise! ☀️",
            afternoon: "Afternoon: Stay hydrated and eat fresh fruits! 🌤️",
            evening: "Evening: Take a light walk before sleep! 🌙"
        };
        const text = (hour >= 5 && hour < 12) ? tips.morning : (hour >= 12 && hour < 17) ? tips.afternoon : tips.evening;
        document.getElementById('healthyTip').innerText = text;
    }

    // Auto-login check
    if(localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('mainDashboard').classList.remove('hidden');
        initCloudSync();
        updateHealthTips();
    }

</script>
