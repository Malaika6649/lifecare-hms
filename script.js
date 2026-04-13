let patients = JSON.parse(localStorage.getItem('hospitalData')) || [];
renderTable();

function showSection(sectionId) {
    // Hidden classes check
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('appointmentsSection').classList.add('hidden');
    document.getElementById('pharmacySection').classList.add('hidden');

    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.classList.remove('hidden');
    }
}

function toggleModal() {
    document.getElementById('modal').classList.toggle('hidden');
}

function savePatient() {
    const nameInput = document.getElementById('name');
    const diseaseInput = document.getElementById('disease');
    
    if (nameInput.value && diseaseInput.value) {
        patients.push({ 
            id: Date.now(), 
            name: nameInput.value, 
            disease: diseaseInput.value 
        });
        localStorage.setItem('hospitalData', JSON.stringify(patients));
        renderTable();
        toggleModal();
        nameInput.value = '';
        diseaseInput.value = '';
    } else {
        alert("Please fill all fields!");
    }
}

function renderTable() {
    const list = document.getElementById('patientList');
    if (!list) return;
    
    list.innerHTML = "";
    document.getElementById('totalPatients').innerText = patients.length;

    patients.forEach((p) => {
        list.innerHTML += `
            <tr class="border-b border-slate-50">
                <td class="p-6 font-bold text-slate-800">${p.name}</td>
                <td class="p-6"><span class="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-xs font-bold uppercase">${p.disease}</span></td>
                <td class="p-6"><button onclick="deletePatient(${p.id})" class="text-rose-500 font-bold hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Remove</button></td>
            </tr>`;
    });
}

function deletePatient(id) {
    if(confirm("Delete this patient?")) {
        patients = patients.filter(p => p.id !== id);
        localStorage.setItem('hospitalData', JSON.stringify(patients));
        renderTable();
    }
}

function searchPatient() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let rows = document.querySelectorAll('#patientList tr');
    rows.forEach(row => {
        let name = row.getElementsByTagName('td')[0].innerText.toLowerCase();
        row.style.display = name.includes(input) ? "" : "none";
    });
}

function buyMed(name, price) {
    document.getElementById('billItem').innerText = name;
    document.getElementById('billTotal').innerText = "Rs. " + price;
    document.getElementById('billModal').classList.remove('hidden');
}

function closeBill() {
    document.getElementById('billModal').classList.add('hidden');
}

function bookAppoint() {
    let date = document.getElementById('appDate').value;
    if(date) alert("Appointment booked for: " + date);
    else alert("Please select a date!");
}