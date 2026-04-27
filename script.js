// ============================================================
// LifeCare HMS — Full Build with User Auth + User Dashboard
// User accounts stored in localStorage (static-site friendly)
// Admin retains Firebase-synced shared data
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
let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch (e) { console.warn('Firebase init skipped', e); }

// ============================================================
// Utils
// ============================================================
function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function hashPwd(pwd) {
    // Simple hash (not cryptographically secure, but fine for demo static site)
    let h = 0;
    for (let i = 0; i < pwd.length; i++) h = ((h << 5) - h) + pwd.charCodeAt(i) | 0;
    return 'h' + Math.abs(h).toString(36) + '_' + pwd.length;
}
function uid() { return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ============================================================
// 1. USER ACCOUNTS (localStorage)
// ============================================================
function loadUsers() { return JSON.parse(localStorage.getItem('lifecare_users') || '[]'); }
function saveUsers(list) { localStorage.setItem('lifecare_users', JSON.stringify(list)); }
function getCurrentUser() { return JSON.parse(sessionStorage.getItem('lifecare_current_user') || 'null'); }
function setCurrentUser(u) { sessionStorage.setItem('lifecare_current_user', JSON.stringify(u)); }

// ============================================================
// 2. AUTH — tabs
// ============================================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

function getAuthState() {
    if (sessionStorage.getItem('lifecare_admin_auth') === 'yes') return 'admin';
    if (getCurrentUser()) return 'user';
    return null;
}

window.switchAuthTab = function (tab) {
    ['user', 'signup', 'admin'].forEach(t => {
        document.getElementById('tab-' + t).classList.toggle('active', t === tab);
        document.getElementById('form-' + t).classList.toggle('hidden', t !== tab);
    });
};

window.doUserSignup = function () {
    const name = document.getElementById('suName').value.trim();
    const email = document.getElementById('suEmail').value.trim().toLowerCase();
    const phone = document.getElementById('suPhone').value.trim();
    const pass = document.getElementById('suPass').value;

    if (!name || !email || !phone || !pass) {
        Swal.fire({ icon: 'warning', title: 'All fields required' }); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire({ icon: 'error', title: 'Invalid email' }); return;
    }
    if (pass.length < 6) {
        Swal.fire({ icon: 'error', title: 'Password too short', text: 'Use at least 6 characters' }); return;
    }

    const users = loadUsers();
    if (users.some(u => u.email === email)) {
        Swal.fire({ icon: 'error', title: 'Email already registered', text: 'Please sign in instead.' }); return;
    }
    const newUser = { id: uid(), name, email, phone, password: hashPwd(pass), joined: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone });

    Swal.fire({ icon: 'success', title: 'Welcome, ' + name + '!', timer: 1300, showConfirmButton: false });
    enterApp('user');
};

window.doUserLogin = function () {
    const email = document.getElementById('userLoginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('userLoginPass').value;
    if (!email || !pass) { Swal.fire({ icon: 'warning', title: 'Enter email & password' }); return; }

    const users = loadUsers();
    const found = users.find(u => u.email === email && u.password === hashPwd(pass));
    if (!found) { Swal.fire({ icon: 'error', title: 'Invalid credentials' }); return; }

    setCurrentUser({ id: found.id, name: found.name, email: found.email, phone: found.phone });
    Swal.fire({ icon: 'success', title: 'Welcome back!', timer: 1100, showConfirmButton: false });
    enterApp('user');
};

window.doAdminLogin = function () {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem('lifecare_admin_auth', 'yes');
        Swal.fire({ icon: 'success', title: 'Admin access granted', timer: 1100, showConfirmButton: false });
        enterApp('admin');
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
            sessionStorage.removeItem('lifecare_admin_auth');
            sessionStorage.removeItem('lifecare_current_user');
            location.reload();
        }
    });
};

// ============================================================
// 3. ENTER APP — role-based UI
// ============================================================
let currentRole = null;

function enterApp(role) {
    currentRole = role;
    document.getElementById('loginGate').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    document.getElementById('userNav').classList.toggle('hidden', role !== 'user');
    document.getElementById('adminNav').classList.toggle('hidden', role !== 'admin');

    const roleLabel = document.getElementById('userRoleLabel');
    const avatar = document.getElementById('userAvatar');
    if (role === 'user') {
        const u = getCurrentUser();
        roleLabel.innerText = (u?.name || 'USER').toUpperCase().slice(0, 12);
        avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'User')}&background=10b981&color=fff`;
    } else {
        roleLabel.innerText = 'ADMIN';
        avatar.src = 'https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff';
    }

    showPage('home');
    bootstrap();
}

// ============================================================
// 4. NAVIGATION
// ============================================================
window.showPage = function (id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('page-' + id)?.classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const prefix = currentRole === 'admin' ? 'abtn-' : 'btn-';
    document.getElementById(prefix + id)?.classList.add('active');
    if (window.innerWidth < 1024) closeSidebar();

    // Lazy-render per page
    if (id === 'userDash') renderUserDash();
    if (id === 'myApp') renderMyAppointments();
    if (id === 'userLabs') renderUserLabs();
    if (id === 'profile') renderProfile();
    if (id === 'users') renderUsersTable();
};

window.toggleSidebar = function () {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarBackdrop').classList.toggle('hidden');
};
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarBackdrop').classList.add('hidden');
}

// ============================================================
// 5. DARK MODE
// ============================================================
function loadTheme() {
    const dark = localStorage.getItem('lifecare_dark') === '1';
    document.documentElement.classList.toggle('dark', dark);
    const ic = document.getElementById('darkIcon');
    if (ic) ic.className = dark ? 'fas fa-sun' : 'fas fa-moon';
}
window.toggleDark = function () {
    const dark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('lifecare_dark', dark ? '1' : '0');
    document.getElementById('darkIcon').className = dark ? 'fas fa-sun' : 'fas fa-moon';
};

// ============================================================
// 6. CLOCK + GREET
// ============================================================
function startClock() {
    const tick = () => {
        const now = new Date();
        const cl = document.getElementById('liveClock');
        if (cl) cl.innerText = now.toLocaleTimeString() + " | " + now.toDateString();
        const greet = document.getElementById('greetingText');
        if (greet) {
            const hr = now.getHours();
            const salutation = hr < 12 ? "Good Morning" : (hr < 18 ? "Good Afternoon" : "Good Evening");
            const u = getCurrentUser();
            const who = currentRole === 'admin' ? 'Admin' : (u ? u.name.split(' ')[0] : 'Guest');
            greet.innerText = `${salutation}, ${who}`;
        }
    };
    tick();
    setInterval(tick, 1000);
}

const HEALTH_TIPS = [
    "Hydration is key — drink 8–10 glasses of water daily.",
    "Eggs at breakfast provide essential proteins for the day.",
    "A 15-minute brisk walk can lower blood sugar significantly.",
    "Sleep is the best medicine — target 8 hours every night.",
    "Green tea after meals can boost metabolism naturally.",
    "Smile often — it reduces stress and boosts immunity.",
    "Eat colorful vegetables to get diverse antioxidants."
];
function updateHealthTips() {
    const pick = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
    const a = document.getElementById('healthTip'); if (a) a.innerText = pick;
    const b = document.getElementById('userHealthTip'); if (b) b.innerText = pick;
}

// ============================================================
// 7. DOCTORS
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
    const el = document.getElementById('doctorFilters');
    if (!el) return;
    const cats = ["All", ...new Set(doctors.map(d => d.category))];
    el.innerHTML = cats.map(c =>
        `<button class="filter-chip ${c === activeFilter ? 'active' : ''}" onclick="setFilter('${c}')" data-testid="filter-${c}">${c}</button>`
    ).join('');
}
window.setFilter = function (c) { activeFilter = c; loadFilters(); loadStaff(); };

function loadStaff() {
    const grid = document.getElementById('doctorGrid');
    if (!grid) return;
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
            <button onclick="openBooking('${d.name}')" class="w-full mt-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all" data-testid="book-${d.name.replace(/\s/g,'-')}">Book Appointment</button>
        </div>`;
    }).join('') || `<p class="col-span-3 text-center text-slate-400 italic py-10">No doctor found</p>`;
}

// ============================================================
// 8. BOOKING FLOW (user)
// ============================================================
let bookingDoc = null;
window.openBooking = (docName) => {
    if (currentRole !== 'user') {
        Swal.fire({ icon: 'info', title: 'Sign in required', text: 'Please login as a patient to book.' });
        return;
    }
    bookingDoc = docName;
    document.getElementById('bookDocName').innerText = docName;
    document.getElementById('bkDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('bkTime').value = '10:00';
    document.getElementById('bkReason').value = '';
    openModal('bookModal');
};

window.confirmBooking = () => {
    const date = document.getElementById('bkDate').value;
    const time = document.getElementById('bkTime').value;
    const reason = document.getElementById('bkReason').value.trim();
    if (!date || !time) { Swal.fire({ icon: 'warning', title: 'Pick date & time' }); return; }

    const u = getCurrentUser();
    const list = JSON.parse(localStorage.getItem('lifecare_appointments') || '[]');
    const appt = {
        id: 'a_' + Date.now().toString(36),
        userId: u.id, userName: u.name, userEmail: u.email,
        doctor: bookingDoc, date, time, reason: reason || '-',
        status: 'Scheduled', createdAt: new Date().toISOString()
    };
    list.push(appt);
    localStorage.setItem('lifecare_appointments', JSON.stringify(list));

    if (db) db.collection("appointments").add(appt).catch(() => {});

    closeModal('bookModal');
    Swal.fire({ icon: 'success', title: 'Appointment Confirmed!', text: `${bookingDoc} on ${date} at ${time}`, confirmButtonColor: '#10b981' });
};

function renderMyAppointments() {
    const u = getCurrentUser();
    if (!u) return;
    const grid = document.getElementById('myAppGrid');
    const list = JSON.parse(localStorage.getItem('lifecare_appointments') || '[]')
        .filter(a => a.userId === u.id)
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

    if (list.length === 0) {
        grid.innerHTML = `<div class="col-span-3 card p-12 bg-white dark:bg-slate-800 text-center">
            <i class="fas fa-calendar-xmark text-5xl text-slate-300 mb-4 block"></i>
            <p class="text-slate-400 italic">No appointments yet. Browse doctors to book one.</p>
        </div>`;
        return;
    }
    grid.innerHTML = list.map(a => `
        <div class="card p-6 bg-white dark:bg-slate-800">
            <div class="flex justify-between items-start mb-4">
                <div class="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><i class="fas fa-stethoscope"></i></div>
                <span class="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">${a.status}</span>
            </div>
            <h4 class="font-black text-slate-800 dark:text-white text-lg">${escapeHtml(a.doctor)}</h4>
            <p class="text-slate-400 text-xs mt-1">${escapeHtml(a.reason)}</p>
            <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <i class="fas fa-calendar-day text-blue-500 mr-1"></i> ${a.date}
                    <span class="mx-2 text-slate-300">•</span>
                    <i class="fas fa-clock text-emerald-500 mr-1"></i> ${a.time}
                </div>
                <button onclick="cancelAppt('${a.id}')" class="text-rose-400 hover:text-rose-600 text-sm" data-testid="cancel-${a.id}" title="Cancel"><i class="fas fa-times-circle"></i></button>
            </div>
        </div>
    `).join('');
}

window.cancelAppt = (id) => {
    Swal.fire({ title: 'Cancel appointment?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(r => {
        if (r.isConfirmed) {
            const list = JSON.parse(localStorage.getItem('lifecare_appointments') || '[]').filter(a => a.id !== id);
            localStorage.setItem('lifecare_appointments', JSON.stringify(list));
            renderMyAppointments();
            renderUserDash();
            Swal.fire('Cancelled', '', 'success');
        }
    });
};

// ============================================================
// 9. PHARMACY
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
    const input = document.getElementById('searchMed');
    if (!input) return;
    const term = input.value.toLowerCase();
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
// 10. CART
// ============================================================
function loadCart() { return JSON.parse(localStorage.getItem('lifecare_cart') || '[]'); }
function saveCart(c) { localStorage.setItem('lifecare_cart', JSON.stringify(c)); renderCart(); }
window.addToCart = (name, price) => {
    const cart = loadCart();
    const ex = cart.find(i => i.name === name);
    if (ex) ex.qty++; else cart.push({ name, price, qty: 1 });
    saveCart(cart);
    Swal.fire({ icon: 'success', title: 'Added!', text: name, timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
};
window.removeCart = (name) => { saveCart(loadCart().filter(i => i.name !== name)); };
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
    if (badge) {
        badge.innerText = count;
        badge.classList.toggle('hidden', count === 0);
    }
    const tot = document.getElementById('cartTotal');
    if (tot) tot.innerText = total;
    const wrap = document.getElementById('cartItems');
    if (!wrap) return;
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
            <p style="margin-top:30px; text-align:center; color:#94a3b8; font-size:11px; font-style:italic;">Thank you for choosing LifeCare. Get well soon!</p>
        </div>
    `;
    document.getElementById('printArea').innerHTML = html;
    if (db) db.collection("bills").add({ billNo, total, items: cart, time: new Date() }).catch(() => {});

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
// 11. ADMIN: PATIENTS LINKED-LIST + Firebase
// ============================================================
class PatientNode {
    constructor(id, name, disease, time) { this.id = id; this.name = name; this.disease = disease; this.time = time; this.next = null; }
}
class HospitalLinkedList {
    constructor() { this.head = null; this.tail = null; this.size = 0; }
    append(id, name, disease, time) {
        const node = new PatientNode(id, name, disease, time);
        if (!this.head) { this.head = node; this.tail = node; } else { this.tail.next = node; this.tail = node; }
        this.size++;
    }
    clear() { this.head = null; this.tail = null; this.size = 0; }
    search(term) {
        const t = (term || "").toLowerCase().trim();
        const out = []; let cur = this.head;
        while (cur) {
            if (!t || cur.name.toLowerCase().includes(t) || cur.disease.toLowerCase().includes(t)) out.push(cur);
            cur = cur.next;
        }
        return out;
    }
    render() {
        const tbody = document.getElementById('patientTableBody');
        if (!tbody) return;
        const c = document.getElementById('countP'); if (c) c.innerText = this.size;
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

function syncPatients() {
    if (!db) return;
    db.collection("patients").orderBy("time", "asc").onSnapshot(snap => {
        patientLL.clear();
        snap.forEach(doc => { const p = doc.data(); patientLL.append(doc.id, p.name, p.disease, p.time); });
        patientLL.render();
    });
}
function syncBills() {
    if (!db) return;
    db.collection("bills").onSnapshot(snap => {
        const c = document.getElementById('countB'); if (c) c.innerText = snap.size;
    });
}

window.savePatient = async () => {
    const n = document.getElementById('pName').value.trim();
    const d = document.getElementById('pDisease').value.trim();
    if (!n || !d) { Swal.fire({ icon: 'warning', title: 'Name & Diagnosis required' }); return; }
    if (db) await db.collection("patients").add({ name: n, disease: d, time: new Date() });
    document.getElementById('pName').value = ""; document.getElementById('pDisease').value = "";
    closeModal('patientModal');
    Swal.fire({ icon: 'success', title: 'Admitted', text: 'Patient added to queue.', timer: 1100, showConfirmButton: false });
};
window.delPatient = (id) => {
    Swal.fire({ title: 'Checkup Complete?', text: 'Remove patient from queue.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(async r => {
        if (r.isConfirmed && db) { await db.collection("patients").doc(id).delete(); Swal.fire('Removed', '', 'success'); }
    });
};

// ============================================================
// 12. LAB REPORTS (admin writes, user views own by email match)
// ============================================================
let LAB_CACHE = [];

function syncLabs() {
    if (!db) return;
    db.collection("labs").orderBy("time", "desc").onSnapshot(snap => {
        LAB_CACHE = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const grid = document.getElementById('labGrid');
        const c = document.getElementById('countL'); if (c) c.innerText = snap.size;
        if (grid) {
            if (snap.empty) {
                grid.innerHTML = `<p class="col-span-3 text-center text-slate-400 italic py-10">No lab reports yet</p>`;
            } else {
                grid.innerHTML = LAB_CACHE.map(r => labCardHtml(r, true)).join('');
            }
        }
        renderUserLabs();
        renderUserDash();
    });
}

function labCardHtml(r, admin) {
    const color = r.status === "Completed" ? "emerald" : (r.status === "Pending" ? "amber" : "blue");
    const dateStr = r.time?.toDate ? r.time.toDate().toLocaleDateString() : (typeof r.time === 'string' ? new Date(r.time).toLocaleDateString() : '');
    return `
        <div class="card p-6 bg-white dark:bg-slate-800">
            <div class="flex justify-between items-start mb-4">
                <div class="w-11 h-11 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center"><i class="fas fa-flask"></i></div>
                <span class="px-3 py-1.5 rounded-full bg-${color}-50 text-${color}-600 text-[10px] font-black uppercase">${escapeHtml(r.status)}</span>
            </div>
            <h4 class="font-black text-slate-800 dark:text-white text-lg">${escapeHtml(r.test)}</h4>
            <p class="text-blue-500 text-xs font-bold uppercase tracking-widest mt-1">${escapeHtml(r.patient)}</p>
            <p class="text-slate-400 text-xs mt-3 line-clamp-2">${escapeHtml(r.notes || '—')}</p>
            <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                <span class="text-[10px] text-slate-400 font-bold">${dateStr}</span>
                ${admin ? `<button onclick="delLab('${r.id}')" class="text-rose-300 hover:text-rose-500 text-sm" data-testid="del-lab-${r.id}"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div>
        </div>`;
}

function renderUserLabs() {
    const grid = document.getElementById('userLabGrid');
    if (!grid) return;
    const u = getCurrentUser();
    if (!u) return;
    const mine = LAB_CACHE.filter(r => (r.patient || '').toLowerCase().includes(u.email.toLowerCase()) || (r.patient || '').toLowerCase() === u.name.toLowerCase());
    if (mine.length === 0) {
        grid.innerHTML = `<div class="col-span-3 card p-12 bg-white dark:bg-slate-800 text-center">
            <i class="fas fa-flask text-5xl text-slate-300 mb-4 block"></i>
            <p class="text-slate-400 italic">No lab reports for your account yet.<br><span class="text-[10px]">Ask the lab to add reports using your email: <b>${escapeHtml(u.email)}</b></span></p>
        </div>`;
        return;
    }
    grid.innerHTML = mine.map(r => labCardHtml(r, false)).join('');
}

window.saveLab = async () => {
    const patient = document.getElementById('lPatient').value.trim();
    const test = document.getElementById('lTest').value.trim();
    const status = document.getElementById('lStatus').value;
    const notes = document.getElementById('lNotes').value.trim();
    if (!patient || !test) { Swal.fire({ icon: 'warning', title: 'Patient & Test required' }); return; }
    if (db) await db.collection("labs").add({ patient, test, status, notes, time: new Date() });
    document.getElementById('lPatient').value = "";
    document.getElementById('lTest').value = "";
    document.getElementById('lNotes').value = "";
    closeModal('labModal');
    Swal.fire({ icon: 'success', title: 'Lab report saved', timer: 1100, showConfirmButton: false });
};
window.delLab = (id) => {
    Swal.fire({ title: 'Delete report?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(async r => {
        if (r.isConfirmed && db) { await db.collection("labs").doc(id).delete(); Swal.fire('Removed', '', 'success'); }
    });
};

// ============================================================
// 13. USER DASHBOARD + PROFILE
// ============================================================
function renderUserDash() {
    const u = getCurrentUser();
    if (!u) return;
    const n = document.getElementById('userDashName');
    const e = document.getElementById('userDashEmail');
    if (n) n.innerText = 'Hello, ' + u.name;
    if (e) e.innerText = u.email;

    const appts = JSON.parse(localStorage.getItem('lifecare_appointments') || '[]').filter(a => a.userId === u.id);
    const mine = LAB_CACHE.filter(r => (r.patient || '').toLowerCase().includes(u.email.toLowerCase()) || (r.patient || '').toLowerCase() === u.name.toLowerCase());
    const cart = loadCart();

    const a = document.getElementById('uCountApp'); if (a) a.innerText = appts.length;
    const l = document.getElementById('uCountLab'); if (l) l.innerText = mine.length;
    const c = document.getElementById('uCountCart'); if (c) c.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

function renderProfile() {
    const u = getCurrentUser();
    if (!u) return;
    document.getElementById('profileName').innerText = u.name;
    document.getElementById('profileEmailTop').innerText = u.email;
    document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=10b981&color=fff&size=200`;
    document.getElementById('pfName').value = u.name;
    document.getElementById('pfEmail').value = u.email;
    document.getElementById('pfPhone').value = u.phone || '';
    document.getElementById('pfPass').value = '';
}

window.saveProfile = function () {
    const cur = getCurrentUser();
    if (!cur) return;
    const name = document.getElementById('pfName').value.trim();
    const phone = document.getElementById('pfPhone').value.trim();
    const pass = document.getElementById('pfPass').value;
    if (!name) { Swal.fire({ icon: 'warning', title: 'Name required' }); return; }
    if (pass && pass.length < 6) { Swal.fire({ icon: 'error', title: 'Password too short' }); return; }

    const users = loadUsers();
    const u = users.find(x => x.id === cur.id);
    if (!u) return;
    u.name = name; u.phone = phone;
    if (pass) u.password = hashPwd(pass);
    saveUsers(users);
    setCurrentUser({ id: u.id, name: u.name, email: u.email, phone: u.phone });
    Swal.fire({ icon: 'success', title: 'Profile updated', timer: 1100, showConfirmButton: false });
    renderProfile();
    // refresh greeting + avatar
    document.getElementById('userRoleLabel').innerText = u.name.toUpperCase().slice(0, 12);
    document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=10b981&color=fff`;
};

// ============================================================
// 14. ADMIN: REGISTERED USERS
// ============================================================
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    const users = loadUsers();
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-16 text-center text-slate-300 font-black italic">No registered users yet</td></tr>`;
        return;
    }
    tbody.innerHTML = users.map(u => `
        <tr class="border-b border-slate-50 dark:border-slate-700">
            <td class="p-4 font-bold text-slate-700 dark:text-slate-200 text-sm">${escapeHtml(u.name)}</td>
            <td class="p-4 text-xs text-slate-500">${escapeHtml(u.email)}</td>
            <td class="p-4 text-xs text-slate-500">${escapeHtml(u.phone || '-')}</td>
            <td class="p-4 text-xs text-slate-400">${new Date(u.joined).toLocaleDateString()}</td>
            <td class="p-4 text-right">
                <button onclick="delUser('${u.id}')" class="text-rose-300 hover:text-rose-500" data-testid="del-user-${u.id}"><i class="fas fa-user-xmark"></i></button>
            </td>
        </tr>
    `).join('');
}
window.delUser = (id) => {
    Swal.fire({ title: 'Delete user?', text: 'This also removes their local appointments.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e' }).then(r => {
        if (r.isConfirmed) {
            saveUsers(loadUsers().filter(u => u.id !== id));
            const appts = JSON.parse(localStorage.getItem('lifecare_appointments') || '[]').filter(a => a.userId !== id);
            localStorage.setItem('lifecare_appointments', JSON.stringify(appts));
            renderUsersTable();
            Swal.fire('Removed', '', 'success');
        }
    });
};

// ============================================================
// 15. CONTACT
// ============================================================
window.sendContact = async () => {
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const msg = document.getElementById('cMsg').value.trim();
    if (!name || !msg) { Swal.fire({ icon: 'warning', title: 'Name & Message required' }); return; }
    try {
        if (db) await db.collection("messages").add({ name, email, message: msg, time: new Date() });
        document.getElementById('cName').value = "";
        document.getElementById('cEmail').value = "";
        document.getElementById('cMsg').value = "";
        Swal.fire({ icon: 'success', title: 'Sent!', text: 'We will contact you soon.' });
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Failed', text: e.message });
    }
};

// ============================================================
// 16. MODALS
// ============================================================
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');

// ============================================================
// 17. BOOTSTRAP
// ============================================================
function bootstrap() {
    startClock();
    updateHealthTips();
    loadFilters();
    loadStaff();
    filterMeds();
    renderCart();
    if (currentRole === 'admin') {
        syncPatients();
        syncBills();
    }
    syncLabs();
}

// ============================================================
// INIT
// ============================================================
loadTheme();
switchAuthTab('user');
const state = getAuthState();
if (state) {
    enterApp(state);
} else {
    document.getElementById('loginGate').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('loginGate').classList.contains('hidden')) {
        const active = document.querySelector('.auth-tab.active')?.id || '';
        if (active === 'tab-user') doUserLogin();
        else if (active === 'tab-signup') doUserSignup();
        else if (active === 'tab-admin') doAdminLogin();
    }
});
