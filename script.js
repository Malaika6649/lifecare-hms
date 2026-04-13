let patients = JSON.parse(localStorage.getItem('hospitalData')) || [];

// Page load hote hi table dikhao
window.onload = function() {
    renderTable();
};

// 1. Sections change karne ka function
function showSection(sectionId) {
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('appointmentsSection').classList.add('hidden');
    document.getElementById('pharmacySection').classList.add('hidden');

    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.classList.remove('hidden');
    }
}

// 2. Add Patient wala Modal open/close
function toggleModal() {
    document.getElementById('modal').classList.toggle('hidden');
}

// 3. Naya Patient save karne ka function
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

// 4. Table aur Total Count dikhane ka function
function renderTable() {
    const list = document.getElementById('patientList');
    const totalCount = document.getElementById('totalPatients');
    
    if (!list) return;
    
    list.innerHTML = "";
    if (totalCount) totalCount.innerText = patients.length;

    patients.forEach((p) => {
        list.innerHTML += `
            <tr class="border-b border-slate-50">
                <td class="p-6 font-bold text-slate-800">${p.name}</td>
                <td class="p-6"><span class="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-xs font-bold uppercase">${p.disease}</span></td>
                <td class="p-6"><button onclick="deletePatient(${p.id})" class="text-rose-500 font-bold hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Remove</button></td>
            </tr>`;
    });
}

// 5. Patient delete karne ka function
function deletePatient(id) {
    if(confirm("Delete this patient?")) {
        patients = patients.filter(p => p.id !== id);
        localStorage.setItem('hospitalData', JSON.stringify(patients));
        renderTable();
    }
}

// 6. Search bar ka function
function searchPatient() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let rows = document.querySelectorAll('#patientList tr');
    rows.forEach(row => {
        let name = row.getElementsByTagName('td')[0].innerText.toLowerCase();
        row.style.display = name.includes(input) ? "" : "none";
    });
}

// 7. Pharmacy Bill dikhane ka function
function buyMed(name, price) {
    const billItem = document.getElementById('billItem');
    const billTotal = document.getElementById('billTotal');
    const billModal = document.getElementById('billModal');

    if (billItem && billTotal && billModal) {
        billItem.innerText = name;
        billTotal.innerText = "Rs. " + price;
        billModal.classList.remove('hidden');
    } else {
        alert("Bill: " + name + " - Rs. " + price);
    }
}

// 8. Bill modal band karne ka function
function closeBill() {
    const billModal = document.getElementById('billModal');
    if (billModal) {
        billModal.classList.add('hidden');
    }
}

// 9. Appointment booking ka function
function bookAppoint() {
    let date = document.getElementById('appDate').value;
    let doctor = document.getElementById('docSelect').value;
    if(date) {
        alert("Appointment confirmed with " + doctor + " on " + date);
    } else {
        alert("Please select a date!");
    }
}
