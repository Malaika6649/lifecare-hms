// Firebase Config (Aapka original config)
const firebaseConfig = {
    apiKey: "AIzaSyANCd9_8skLjVS_IaVgfbk24ZAlYeZpCR8",
    authDomain: "lifecare-hms-117d8.firebaseapp.com",
    projectId: "lifecare-hms-117d8",
    storageBucket: "lifecare-hms-117d8.firebasestorage.app",
    messagingSenderId: "489995234025",
    appId: "1:489995234025:web:c5a7d23f71b71aa2e51e78"
};

// Initialize Firebase only if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 1. Linked List Logic
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
        const countEl = document.getElementById('countP');
        
        if(countEl) countEl.innerText = this.size;
        
        if (!tbody) return; // Exit if element not found

        if (this.size === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-16 text-center text-slate-300 font-black italic">NO patient today</td></tr>`;
            if(visualizer) visualizer.innerHTML = `<div class="text-slate-300 text-xs italic">Queue is empty.</div>`;
            return;
        }

        let tableHtml = "";
        let visualHtml = "";
        let current = this.head;
        let index = 0;

        while (current) {
            tableHtml += `
                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td class="p-5 font-bold text-slate-700 text-sm">${current.name}</td>
                    <td class="p-5"><span class="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter">${current.disease}</span></td>
                    <td class="p-5 text-right"><button onclick="delPatient('${current.id}')" class="text-rose-200 hover:text-rose-500"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;

            const isHead = index === 0;
            visualHtml += `
                <div class="flex-shrink-0 px-4 py-2 rounded-xl border ${isHead ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border-slate-100 shadow-sm'}">
                    <div class="text-[7px] font-black">${isHead ? 'HEAD' : 'NODE'}</div>
                    <div class="font-bold text-[11px]">${current.name}</div>
                </div>
                <div class="flex-shrink-0 text-slate-300"><i class="fas fa-arrow-right text-[10px]"></i></div>`;

            current = current.next;
            index++;
        }
        
        tbody.innerHTML = tableHtml;
        if(visualizer) visualizer.innerHTML = visualHtml + `<div class="text-[10px] font-bold text-slate-400">NULL</div>`;
    }
}

const patientLL = new HospitalLinkedList();

// 2. Navigation & UI
window.showPage = (id) => {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById('page-' + id);
    if(target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-' + id);
    if(btn) btn.classList.add('active');
};

window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    if(sb) sb.classList.toggle('active');
};

// 3. Clock & Health Tip
function initDashboard() {
    setInterval(() => {
        const now = new Date();
        const clock = document.getElementById('liveClock');
        if(clock) clock.innerText = now.toLocaleTimeString();
    }, 1000);
}

// 4. Syncing
function syncPatients() {
    db.collection("patients").orderBy("time", "asc").onSnapshot(snap => {
        patientLL.clear();
        snap.forEach(doc => {
            const p = doc.data();
            patientLL.append(doc.id, p.name, p.disease);
        });
        patientLL.render();
    }, err => console.error("Firebase Error:", err));
}

// 5. Save/Delete
window.savePatient = async () => {
    const name = document.getElementById('pName').value;
    const disease = document.getElementById('pDisease').value;
    if(!name || !disease) return Swal.fire('Error', 'Please fill all fields', 'error');

    await db.collection("patients").add({ name, disease, time: new Date() });
    window.closeModal('patientModal');
    document.getElementById('pName').value = "";
    document.getElementById('pDisease').value = "";
};

window.delPatient = (id) => {
    db.collection("patients").doc(id).delete();
};

window.openModal = (id) => document.getElementById(id)?.classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id)?.classList.add('hidden');

// Initialize
initDashboard();
syncPatients();
