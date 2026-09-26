const defaultData = [{
    id: Date.now(),
    nama: "Budi Santoso",
    ttl: "Jakarta, 12 Mei 1995",
    hobi: "Bermain Game",
    usia: "29 Tahun",
    status: "Hidup",
    foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
}];

let base64Photo = "";
let modalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    modalInstance = new bootstrap.Modal(document.getElementById('dataModal'));

    if (!localStorage.getItem("udi_records")) {
        localStorage.setItem("udi_records", JSON.stringify(defaultData));
    }

    if (sessionStorage.getItem("isLoggedIn") === "true") {
        showDashboard();
    }

    document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("username").value;
        const p = document.getElementById("password").value;

        if (u === "admin" && p === "admin123") {
            sessionStorage.setItem("isLoggedIn", "true");
            showDashboard();
        } else {
            alert("Username atau Password salah!");
        }
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem("isLoggedIn");
        location.reload();
    });

    document.getElementById("dataForm").addEventListener("submit", handleSaveData);
});

function showDashboard() {
    document.getElementById("loginPage").classList.add("d-none");
    document.getElementById("app").classList.remove("d-none");
    renderTable();
}

function getData() {
    return JSON.parse(localStorage.getItem("udi_records")) || [];
}

function handleSaveData(e) {
    e.preventDefault();
    const editId = document.getElementById("editId").value;
    const records = getData();

    const newData = {
        id: editId ? Number(editId) : Date.now(),
        nama: document.getElementById("nama").value,
        ttl: document.getElementById("ttl").value,
        hobi: document.getElementById("Hobi").value,
        usia: document.getElementById("usia").value,
        status: document.getElementById("status").value,
        foto: base64Photo || "https://via.placeholder.com/150?text=No+Image"
    };

    if (editId) {
        const index = records.findIndex(r => r.id === Number(editId));
        if (index !== -1) records[index] = newData;
    } else {
        records.push(newData);
    }

    localStorage.setItem("udi_records", JSON.stringify(records));
    modalInstance.hide();
    renderTable();
}

function renderTable(filterList = null) {
    const list = filterList || getData();
    const tbody = document.getElementById("dataTable");
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 muted">Tidak ada data ditemukan.</td></tr>`;
    } else {
        list.forEach((item, index) => {
            let badgeClass = "bg-secondary";
            if (item.status === "Hidup") badgeClass = "bg-success";
            else if (item.status === "Meninggal") badgeClass = "bg-dark text-muted";
            else if (item.status === "Menyakiti Saya") badgeClass = "bg-danger";

            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <img src="${item.foto}" class="table-avatar" alt="Foto ${item.nama}">
                    </td>
                    <td class="fw-bold">${item.nama}</td>
                    <td>${item.ttl}</td>
                    <td>${item.hobi}</td>
                    <td>${item.usia}</td>
                    <td><span class="badge ${badgeClass}">${item.status}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-info me-1" onclick="editData(${item.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteData(${item.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    updateStats();
}

function updateStats() {
    const records = getData();
    document.getElementById("total").innerText = records.length;
    document.getElementById("hidup").innerText = records.filter(r => r.status === "Hidup").length;
    document.getElementById("meninggal").innerText = records.filter(r => r.status === "Meninggal").length;
    document.getElementById("menyakiti").innerText = records.filter(r => r.status === "Menyakiti Saya").length;
}

function openForm() {
    document.getElementById("dataForm").reset();
    document.getElementById("editId").value = "";
    document.getElementById("modalTitle").innerText = "Tambah Data Baru";
    document.getElementById("photoPreview").src = "https://via.placeholder.com/100?text=Foto";
    base64Photo = "";
    modalInstance.show();
}

function editData(id) {
    const item = getData().find(r => r.id === id);
    if (!item) return;

    document.getElementById("editId").value = item.id;
    document.getElementById("nama").value = item.nama;
    document.getElementById("ttl").value = item.ttl;
    document.getElementById("Hobi").value = item.hobi;
    document.getElementById("usia").value = item.usia;
    document.getElementById("status").value = item.status;
    document.getElementById("modalTitle").innerText = "Edit Data";

    base64Photo = item.foto;
    document.getElementById("photoPreview").src = item.foto;
    modalInstance.show();
}

function deleteData(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        const records = getData().filter(r => r.id !== id);
        localStorage.setItem("udi_records", JSON.stringify(records));
        renderTable();
    }
}

function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            base64Photo = e.target.result;
            document.getElementById("photoPreview").src = base64Photo;
        };
        reader.readAsDataURL(file);
    }
}

function filterData() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const records = getData();
    const filtered = records.filter(item =>
        item.nama.toLowerCase().includes(query) ||
        item.hobi.toLowerCase().includes(query) ||
        item.ttl.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
    );
    renderTable(filtered);
}