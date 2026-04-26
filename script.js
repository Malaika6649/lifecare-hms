// ============================================================
// LifeCare HMS — Full Upgraded Build
// Bugs fixed + Auth + Cart + Print + Lab Reports + Dark Mode
// ============================================================

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

// ============================================================
// 1. DSA — Linked List for Patient Queue (with search)
// ============================================================
class PatientNode {
    constructor(id, name, disease, time) {
        this.id = id;
        this.name = name;
        this.disease = disease;
        this.time = time;
        this.next = null;
    }
}

class HospitalLinkedList {
    constructor() { this.head = null; this.tail = null; this.size = 0; }

    append(id, name, disease, time) {
        const node = new PatientNode(id, name, disease, time);
        if (!this.head) { this.head = node; this.tail = node; }
        else { this.tail.next = node; this.tail = node; }
        this.size++;
    }

    clear() { this.head = null; this.tail = null; this.size = 0; }

    // Linear search (DSA bonus)
    search(term) {
        const t = (term || "").toLowerCase().trim();
        const out = [];
        let cur = this.head;
        while (cur) {
            if (!t || cur.name.toLowerCase().includes(t) || cur.disease.toLowerCase().includes(t)) {
                out.push(cur);
            }
            cur = cur.next;
        }
        return out;
    }

    render() {
        const tbody = document.getElementById('patientTableBody');
        document.getElementById('countP').innerText = this.size;
        const term = (document.getElementById('patientSearch')?.value) || "";
        const matches = this.search(term);

        if (matches.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-16 text-center text-slate-300 font-black italic">${this.size === 0 ? 'No patients today' : 'No match found'}</td></tr>`;
            return;
        }

        tbody.innerHTML = matches.map(c => `
            <tr class="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-all">
                <td class="p-5 font-bold text-slate-700 dark:text-slate-200 text-sm">${escapeHtml(c.name)}</td>
                <td class="p-5"><span class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter">${escapeHtml(c.disease)}</span></td>
                <td class="p-5 text-right">
                    <button onclick="delPatient('${c.id}')" class="text-rose-300 hover:text-rose-500 transition-colors" data-testid="del-patient-${c.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `).join('');
    }
}
const patientLL = new HospitalLinkedList();

function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ============================================================
// 2. AUTH (simple session-based admin gate)
// ============================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

function checkAuth() {
    const loggedIn = sessionStorage.getItem('lifecare_auth') === 'yes';
    document.getElementById('loginGate').classList.toggle('hidden', loggedIn);
    return loggedIn;
}

window.doLogin = function () {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem('lifecare_auth', 'yes');
        document.getElementById('loginGate').classList.add('hidden');
        Swal.fire({ icon: 'success', title: 'Welcome back!', timer: 1200, showConfirmButton: false });
        bootstrap();
    } else {
        Swal.fire({ icon: 'error', title: 'Invalid', text: 'Use demo: admin / admin123' });
    }
};

window.doLogout = function () {
    Swal.fire({
        title: 'Sign out?', icon: 'question',
        showCancelButton: true, confirmButtonText: 'Sign out', confirmButtonColor: '#f43f5e'
    }).then(r => {
        if (r.isConfirmed) {
            sessionStorage.removeItem('lifecare_auth');
            location.reload();
        }
    });
};

// ============================================================
// 3. NAVIGATION
// ============================================================
window.showPage = function (id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('page-' + id)?.classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + id)?.classList.add('active');
    if (window.innerWidth < 1024) closeSidebar();
};

window.toggleSidebar = function () {
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebarBackdrop');
    sb.classList.toggle('active');
    bd.classList.toggle('hidden');
};
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarBackdrop').classList.add('hidden');
}

// ============================================================
// 4. DARK MODE
// ============================================================
function loadTheme() {
    const dark = localStorage.getItem('lifecare_dark') === '1';
    document.documentElement.classList.toggle('dark', dark);
    document.getElementById('darkIcon').className = dark ? 'fas fa-sun' : 'fas fa-moon';
}
window.toggleDark = function () {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('lifecare_dark', dark ? '1' : '0');
    document.getElementById('darkIcon').className = dark ? 'fas fa-sun' : 'fas fa-moon';
};

// ============================================================
// 5. CLOCK & GREETINGS
// ============================================================
function startClock() {
    const tick = () => {
        const now = new Date();
        document.getElementById('liveClock').innerText = now.toLocaleTimeString() + " | " + now.toDateString();
        const hr = now.getHours();
        const greet = document.getElementById('greetingText');
        if (greet) {
            if (hr < 12) greet.innerText = "Good Morning, Doctor";
            else if (hr < 18) greet.innerText = "Good Afternoon, Doctor";
            else greet.innerText = "Good Evening, Doctor";
        }
    };
    tick();
    setInterval(tick, 1000);
}

function updateHealthTips() {
    const tips = [
        "Hydration is key — drink 8–10 glasses of water daily.",
        "Eggs at breakfast provide essential proteins for the day.",
        "A 15-minute brisk walk can lower blood sugar significantly.",
        "Sleep is the best medicine — target 8 hours every night.",
        "Green tea after meals can boost metabolism naturally.",
        "Smile often — it reduces stress and boosts immunity.",
        "Eat colorful vegetables to get diverse antioxidants."
    ];
    document.getElementById('healthTip').innerText = tips[Math.floor(Math.random() * tips.length)];
}

// ============================================================
// 6. DOCTORS (with specialty filter)
// ============================================================
const doctors = [
    { name: "Dr. Ahmed Khan", role: "Heart Specialist", category: "Cardio", status: "Available", time: "9am - 3pm", days: "Mon-Fri" },
    { name: "Dr. Sara Malik", role: "Child Specialist", category: "Pediatric", status: "Busy", time: "11am - 6pm", days: "Mon-Sat" },
    { name: "Dr. Zohaib Hassan", role: "Bone Surgeon", category: "Ortho", status: "Available", time: "5pm - 10pm", days: "Tue-Sun" },
    { name: "Dr. Fatima Ali", role: "Gynecologist", category: "Gyne", status: "On Leave", time: "10am - 4pm", days: "Wed-Fri" },
    { name: "Dr. Usman Sheikh", role: "Skin Specialist", category: "Derma", status: "Available", time: "2pm - 9pm", days: "Mon-Thu" },
    { name: "Dr. Maria Khan", role: "Brain Specialist", category: "Neuro", status: "Busy", time: "9am - 12pm", days: "Sat-Sun" }
];
let activeFilter = "All";

function loadFilters() {
    const cats = ["All", ...new Set(doctors.map(d => d.category))];
    document.getElementById('doctorFilters').innerHTML = cats.map(c =>
        `<button class="filter-chip ${c === activeFilter ? 'active' : ''}" onclick="setFilter('${c}')" data-testid="filter-${c}">${c}</button>`
    ).join('');
}
window.setFilter = function (c) { activeFilter = c; loadFilters(); loadStaff(); };

function loadStaff() {
    const grid = document.getElementById('doctorGrid');
    const list = activeFilter === "All" ? doctors : doctors.filter(d => d.category === activeFilter);
    grid.innerHTML = list.map(d => {
        const color = d.status === "Available" ? "emerald" : (d.status === "Busy" ? "amber" : "rose");
        return `
        <div class="card p-7 bg-white dark:bg-slate-800 border-t-8 border-t-${color}-400">
            <div class="flex justify-between items-start mb-5">
                <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center text-xl shadow-inner"><i class="fas fa-user-md"></i></div>
                <span class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-${color}-50 text-${color}-600 text-[10px] font-black uppercase">
                    <span class="w-2 h-2 rounded-full bg-${color}-500 animate-pulse"></span> ${d.status}
                </span>
            </div>
            <h4 class="text-xl font-black text-slate-800 dark:text-white">${d.name}</h4>
            <p class="text-blue-500 font-bold text-xs uppercase tracking-widest mt-1">${d.role}</p>
            <div class="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 space-y-3">
                <div class="flex items-center gap-3 text-slate-400 text-xs font-medium"><i class="fas fa-clock w-4"></i> ${d.time}</div>
                <div class="flex items-center gap-3 text-slate-400 text-xs font-medium"><i class="fas fa-calendar-alt w-4"></i> ${d.days}</div>
            </div>
            <button onclick="bookApp('${d.name}')" class="w-full mt-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all" data-testid="book-${d.name.replace(/\s/g,'-')}">Book Appointment</button>
        </div>`;
    }).join('') || `<p class="col-span-3 text-center text-slate-400 italic py-10">No doctor found</p>`;
}

window.bookApp = (doc) => {
    Swal.fire({
        title: 'Confirm Booking?',
        text: `Consultation with ${doc} will be scheduled.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Confirm'
    }).then(r => {
        if (r.isConfirmed) {
            db.collection("appointments").add({ doctor: doc, time: new Date() }).catch(()=>{});
            Swal.fire('Booked!', 'Our team will call you shortly.', 'success');
        }
    });
};

// ============================================================
// 7. PHARMACY (deterministic prices via seeded hash)
// ============================================================
const meds = [];
const medNames = ["Panadol", "Arinac", "Augmentin", "Risek", "Brufen", "Disprin", "Flagyl", "Softin", "Caldoc", "Surbex"];

function seedHash(str) {
    let h = 0; for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
}
for (let i = 1; i <= 100; i++) {
    const name = medNames[i % 10] + " " + (i * 5) + "mg";
    const price = 30 + (seedHash(name) % 470);
    meds.push({ name, price });
}

window.filterMeds = () => {
    const term = document.getElementById('searchMed').value.toLowerCase();
    const grid = document.getElementById('medicineGrid');
    const list = meds.filter(m => m.name.toLowerCase().includes(term));
    grid.innerHTML = list.map(m => `
        <div class="card p-5 text-center bg-white dark:bg-slate-800 hover:border-blue-300">
            <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3"><i class="fas fa-capsules"></i></div>
            <p class="font-black text-[12px] text-slate-700 dark:text-slate-200 leading-tight">${m.name}</p>
            <p class="text-[10px] text-emerald-500 font-black mt-2 uppercase tracking-widest">Rs. ${m.price}</p>
            <button onclick="addToCart('${m.name.replace(/'/g,"\\'")}', ${m.price})" class="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all" data-testid="add-${m.name.replace(/\s/g,'-')}">+ Add</button>
        </div>
    `).join('') || `<p class="col-span-5 text-center text-slate-400 italic py-10">No medicines found</p>`;
};

// ============================================================
// 8. CART (localStorage persistence + Print Bill)
// ============================================================
function loadCart() {
    return JSON.parse(localStorage.getItem('lifecare_cart') || '[]');
}
function saveCart(c) {
    localStorage.setItem('lifecare_cart', JSON.stringify(c));
    renderCart();
}
window.addToCart = (name, price) => {
    const cart = loadCart();
    const ex = cart.find(i => i.name === name);
    if (ex) ex.qty++;
    else cart.push({ name, price, qty: 1 });
    saveCart(cart);
    Swal.fire({ icon: 'success', title: 'Added!', text: name, timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
};
window.removeCart = (name) => {
    saveCart(loadCart().filter(i => i.name !== name));
};
window.changeQty = (name, delta) => {
    const cart = loadCart();
    const it = cart.find(i => i.name === name);
    if (!it) return;
    it.qty = Math.max(1, it.qty + delta);
    saveCart(cart);
};

function renderCart() {
    const cart = loadCart();
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const badge = document.getElementById('cartBadge');
    const count = cart.reduce((s, i) => s + i.qty, 0);
    badge.innerText = count;
    badge.classList.toggle('hidden', count === 0);
    document.getElementById('cartTotal').innerText = total;
    const wrap = document.getElementById('cartItems');
    if (cart.length === 0) {
        wrap.innerHTML = `<div class="text-center py-20 text-slate-300 italic"><i class="fas fa-shopping-bag text-5xl mb-4 block"></i>Cart is empty</div>`;
        return;
    }
    wrap.innerHTML = cart.map(i => `
        <div class="cart-item">
            <div class="flex-1">
                <p class="font-black text-sm text-slate-800 dark:text-white">${escapeHtml(i.name)}</p>
                <p class="text-[10px] text-emerald-500 font-bold mt-0.5">Rs. ${i.price} × ${i.qty}</p>
            </div>
            <div class="flex items-center gap-1">
                <button onclick="changeQty('${i.name.replace(/'/g,"\\'")}', -1)" class="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-xs font-black hover:bg-rose-50 hover:text-rose-500">−</button>
                <span class="w-6 text-center text-xs font-black">${i.qty}</span>
                <button onclick="changeQty('${i.name.replace(/'/g,"\\'")}', 1)" class="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-xs font-black hover:bg-emerald-50 hover:text-emerald-500">+</button>
                <button onclick="removeCart('${i.name.replace(/'/g,"\\'")}')" class="ml-2 text-rose-300 hover:text-rose-500 text-sm" data-testid="remove-${i.name.replace(/\s/g,'-')}"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `).join('');
}

window.toggleCart = () => document.getElementById('cartDrawer').classList.toggle('open');

window.checkoutCart = () => {
    const cart = loadCart();
    if (cart.length === 0) { Swal.fire({ icon: 'info', title: 'Cart is empty' }); return; }
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const billNo = "LC-" + Date.now().toString().slice(-6);

    const html = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px;">
            <h1 style="color:#2563eb; margin:0; font-size:32px; letter-spacing:-1px;">LifeCare Pharma</h1>
            <p style="color:#64748b; margin:4px 0 30px; font-size:12px;">123 Health Avenue, Islamabad • 0800-911-22</p>
            <hr style="border:none; border-top:2px dashed #cbd5e1; margin:20px 0;">
            <p style="font-size:12px; color:#64748b;">Bill #: <strong style="color:#1e293b;">${billNo}</strong> &nbsp; • &nbsp; Date: <strong style="color:#1e293b;">${new Date().toLocaleString()}</strong></p>
            <table style="width:100%; border-collapse: collapse; margin-top:20px; font-size:13px;">
                <thead>
                    <tr style="background:#f8fafc;"><th style="padding:10px; text-align:left;">Medicine</th><th style="padding:10px; text-align:center;">Qty</th><th style="padding:10px; text-align:right;">Price</th><th style="padding:10px; text-align:right;">Total</th></tr>
                </thead>
                <tbody>
                    ${cart.map(i => `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px;">${escapeHtml(i.name)}</td><td style="padding:10px; text-align:center;">${i.qty}</td><td style="padding:10px; text-align:right;">Rs. ${i.price}</td><td style="padding:10px; text-align:right;"><strong>Rs. ${i.price*i.qty}</strong></td></tr>`).join('')}
                </tbody>
            </table>
            <div style="margin-top:20px; padding:16px 20px; background:#10b981; color:white; border-radius:16px; display:flex; justify-content:space-between; font-weight:900; font-size:18px;">
                <span>GRAND TOTAL</span><span>Rs. ${total}</span>
            </div>
            <p style="margin-top:30px; text-align:center; color:#94a3b8; font-size:11px; font-style:italic;">Thank you for choosing LifeCare. Get well soon! ❤️</p>
        </div>
    `;
    document.getElementById('printArea').innerHTML = html;

    // store bill count
    db.collection("bills").add({ billNo, total, items: cart, time: new Date() }).catch(()=>{});

    Swal.fire({
        title: 'Bill Generated', html: `Bill <b>${billNo}</b><br>Total: <b>Rs. ${total}</b>`,
        icon: 'success', confirmButtonText: 'Print Now', confirmButtonColor: '#2563eb',
        showCancelButton: true, cancelButtonText: 'Close'
    }).then(r => {
        if (r.isConfirmed) window.print();
        localStorage.removeItem('lifecare_cart');
        renderCart();
        toggleCart();
    });
};

// ============================================================
// 9. LAB REPORTS
// ============================================================
function syncLabs() {
    db.collection("labs").orderBy("time", "desc").onSnapshot(snap => {
        const grid = document.getElementById('labGrid');
        document.getElementById('countL').innerText = snap.size;
        if (snap.empty) {
            grid.innerHTML = `<p class="col-span-3 text-center text-slate-400 italic py-10">No lab reports yet</p>`;
            return;
        }
        grid.innerHTML = snap.docs.map(d => {
            const r = d.data();
            const color = r.status === "Completed" ? "emerald" : (r.status === "Pending" ? "amber" : "blue");
            return `
            <div class="card p-6 bg-white dark:bg-slate-800">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-11 h-11 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center"><i class="fas fa-flask"></i></div>
                    <span class="px-3 py-1.5 rounded-full bg-${color}-50 text-${color}-600 text-[10px] font-black uppercase">${r.status}</span>
                </div>
                <h4 class="font-black text-slate-800 dark:text-white text-lg">${escapeHtml(r.test)}</h4>
                <p class="text-blue-500 text-xs font-bold uppercase tracking-widest mt-1">${escapeHtml(r.patient)}</p>
                <p class="text-slate-400 text-xs mt-3 line-clamp-2">${escapeHtml(r.notes || '—')}</p>
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                    <span class="text-[10px] text-slate-400 font-bold">${r.time?.toDate ? r.time.toDate().toLocaleDateString() : ''}</span>
                    <button onclick="delLab('${d.id}')" class="text-rose-300 hover:text-rose-500 text-sm" data-testid="del-lab-${d.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>`;
        }).join('');
    });
}

window.saveLab = async () => {
    const patient = document.getElementById('lPatient').value.trim();
    const test = document.getElementById('lTest').value.trim();
    const status = document.getElementById('lStatus').value;
    const notes = document.getElementById('lNotes').value.trim();
    if (!patient || !test) { Swal.fire({ icon: 'warning', title: 'Patient & Test required' }); return; }
    await db.collection("labs").add({ patient, test, status, notes, time: new Date() });
    document.getElementById('lPatient').value = "";
    document.getElementById('lTest').value = "";
    document.getElementById('lNotes').value = "";
    closeModal('labModal');
    Swal.fire({ icon: 'success', title: 'Lab report saved', timer: 1100, showConfirmButton: false });
};

window.delLab = (id) => {
    Swal.fire({ title: 'Delete report?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(async r => {
        if (r.isConfirmed) { await db.collection("labs").doc(id).delete(); Swal.fire('Removed', '', 'success'); }
    });
};

// ============================================================
// 10. PATIENTS (Firebase + Linked List)
// ============================================================
function syncPatients() {
    db.collection("patients").orderBy("time", "asc").onSnapshot(snap => {
        patientLL.clear();
        snap.forEach(doc => { const p = doc.data(); patientLL.append(doc.id, p.name, p.disease, p.time); });
        patientLL.render();
    });
}
function syncBills() {
    db.collection("bills").onSnapshot(snap => {
        const c = document.getElementById('countB'); if (c) c.innerText = snap.size;
    });
}

window.savePatient = async () => {
    const n = document.getElementById('pName').value.trim();
    const d = document.getElementById('pDisease').value.trim();
    if (!n || !d) { Swal.fire({ icon: 'warning', title: 'Name & Diagnosis required' }); return; }
    await db.collection("patients").add({ name: n, disease: d, time: new Date() });
    document.getElementById('pName').value = ""; document.getElementById('pDisease').value = "";
    closeModal('patientModal');
    Swal.fire({ icon: 'success', title: 'Admitted', text: 'Patient added to queue.', timer: 1100, showConfirmButton: false });
};

window.delPatient = (id) => {
    Swal.fire({ title: 'Checkup Complete?', text: 'Remove patient from queue.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(async r => {
        if (r.isConfirmed) { await db.collection("patients").doc(id).delete(); Swal.fire('Removed', '', 'success'); }
    });
};

// ============================================================
// 11. CONTACT FORM
// ============================================================
window.sendContact = async () => {
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const msg = document.getElementById('cMsg').value.trim();
    if (!name || !msg) { Swal.fire({ icon: 'warning', title: 'Name & Message required' }); return; }
    try {
        await db.collection("messages").add({ name, email, message: msg, time: new Date() });
        document.getElementById('cName').value = "";
        document.getElementById('cEmail').value = "";
        document.getElementById('cMsg').value = "";
        Swal.fire({ icon: 'success', title: 'Sent!', text: 'We will contact you soon.' });
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Failed', text: e.message });
    }
};

// ============================================================
// 12. MODALS
// ============================================================
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');

// ============================================================
// 13. BOOTSTRAP
// ============================================================
function bootstrap() {
    startClock();
    updateHealthTips();
    loadFilters();
    loadStaff();
    filterMeds();
    renderCart();
    syncPatients();
    syncLabs();
    syncBills();
}

// ============================================================
// INIT
// ============================================================
loadTheme();
if (checkAuth()) {
    bootstrap();
} else {
    document.getElementById('loginGate').classList.remove('hidden');
}

// Allow Enter key on login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('loginGate').classList.contains('hidden')) {
        doLogin();
    }
});
