// --- 10 Professional Doctors Data ---
const doctorsData = [
    { name: "Dr. Ahmed Khan", role: "Senior Cardiologist", status: "Available", time: "09:00 AM - 02:00 PM", days: "Mon - Fri" },
    { name: "Dr. Sara Malik", role: "Pediatrician", status: "Busy", time: "11:00 AM - 05:00 PM", days: "Mon - Sat" },
    { name: "Dr. Zohaib Hassan", role: "Orthopedic Surgeon", status: "On Leave", time: "04:00 PM - 09:00 PM", days: "Tue - Sun" },
    { name: "Dr. Fatima Ali", role: "Gynecologist", status: "Available", time: "10:00 AM - 03:00 PM", days: "Mon - Fri" },
    { name: "Dr. Usman Sheikh", role: "Dermatologist", status: "Busy", time: "02:00 PM - 06:00 PM", days: "Wed - Sat" },
    { name: "Dr. Maria Khan", role: "Neurologist", status: "Available", time: "08:00 AM - 12:00 PM", days: "Mon - Thu" },
    { name: "Dr. Bilal Akram", role: "General Surgeon", status: "Available", time: "12:00 PM - 08:00 PM", days: "Daily" },
    { name: "Dr. Hina Javed", role: "Psychiatrist", status: "Available", time: "05:00 PM - 10:00 PM", days: "Fri - Sun" },
    { name: "Dr. Rizwan Shah", role: "ENT Specialist", status: "On Leave", time: "09:00 AM - 01:00 PM", days: "Mon - Wed" },
    { name: "Dr. Zainab Noor", role: "Ophthalmologist", status: "Available", time: "03:00 PM - 07:00 PM", days: "Tue - Sat" }
];

function loadStaff() {
    const grid = document.getElementById('doctorGrid');
    if(!grid) return;

    grid.innerHTML = doctorsData.map(d => {
        // Status Colors
        let statusBg = "bg-emerald-50 text-emerald-600"; // Available
        let dotColor = "bg-emerald-500";
        
        if(d.status === "Busy") {
            statusBg = "bg-amber-50 text-amber-600";
            dotColor = "bg-amber-500";
        } else if(d.status === "On Leave") {
            statusBg = "bg-rose-50 text-rose-600";
            dotColor = "bg-rose-500";
        }

        return `
            <div class="card p-6 border-t-4 ${d.status === 'Available' ? 'border-t-emerald-400' : 'border-t-slate-200'}">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl shadow-sm">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <span class="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusBg}">
                        <span class="w-2 h-2 rounded-full ${dotColor} animate-pulse"></span>
                        ${d.status}
                    </span>
                </div>
                
                <h3 class="font-bold text-slate-800 text-lg mb-1">${d.name}</h3>
                <p class="text-blue-600 text-xs font-bold uppercase tracking-tighter mb-4">${d.role}</p>
                
                <div class="space-y-3 pt-4 border-t border-slate-50">
                    <div class="flex items-center gap-3 text-slate-500 text-xs font-medium">
                        <i class="fas fa-clock text-blue-300"></i>
                        <span>${d.time}</span>
                    </div>
                    <div class="flex items-center gap-3 text-slate-500 text-xs font-medium">
                        <i class="fas fa-calendar-alt text-blue-300"></i>
                        <span>${d.days}</span>
                    </div>
                </div>
                
                <button onclick="bookApp('${d.name}')" 
                    class="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all duration-300">
                    Book Appointment
                </button>
            </div>
        `;
    }).join('');
}

// Global function for the Alert
window.bookApp = (name) => {
    Swal.fire({
        title: 'Confirm Appointment?',
        text: `Do you want to book an appointment with ${name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Book it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Requested!',
                'Your request has been sent to the doctor.',
                'success'
            )
        }
    });
};

// Start initialization
loadStaff();
