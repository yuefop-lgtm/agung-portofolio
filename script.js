
"use strict";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "agungShinobiDashboardV1";
const LOGIN_USER = "kusuma";
const LOGIN_PASS = "agung";

const defaultData = {
  profile: { name: "Agung Kusuma Tri Atmaja", bio: "Pelajar yang terus berkembang" },
  theme: "purple",
  subjects: [],
  sports: [],
  docs: [],
  photos: [],
  attendance: []
};

let data = loadData();
let toastTimer;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object"
      ? { ...structuredClone(defaultData), ...saved,
          profile: { ...defaultData.profile, ...(saved.profile || {}) },
          subjects: Array.isArray(saved.subjects) ? saved.subjects : [],
          sports: Array.isArray(saved.sports) ? saved.sports : [],
          docs: Array.isArray(saved.docs) ? saved.docs : [],
          photos: Array.isArray(saved.photos) ? saved.photos : [],
          attendance: Array.isArray(saved.attendance) ? saved.attendance : [] }
      : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    notify("Penyimpanan browser penuh. Hapus beberapa foto atau dokumen.");
    return false;
  }
}

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function showScreen(screen) {
  ["intro", "login", "app"].forEach(id => $(id).classList.add("hidden"));
  $(screen).classList.remove("hidden");
}

function openLogin() {
  $("loginError").textContent = "";
  showScreen("login");
  $("username").focus();
}

function enterDashboard() {
  showScreen("app");
  renderAll();
}

$("enterBtn").addEventListener("click", openLogin);
$("skipIntro").addEventListener("click", openLogin);
$("backIntro").addEventListener("click", () => showScreen("intro"));

$("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const username = $("username").value.trim();
  const password = $("password").value;

  if (username === LOGIN_USER && password === LOGIN_PASS) {
    sessionStorage.setItem("agungLoggedIn", "yes");
    $("loginError").textContent = "";
    enterDashboard();
    notify("Chidori aktif! Selamat datang, Agung.");
  } else {
    $("loginError").textContent = "Username atau password salah. Coba kusuma / agung.";
  }
});

$("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("agungLoggedIn");
  $("password").value = "";
  showScreen("intro");
});

const pageTitles = {
  dashboard: "Dashboard Utama",
  profil: "Profil Saya",
  mapel: "Mata Pelajaran",
  olahraga: "Jadwal Olahraga",
  dokumen: "Dokumen Pribadi",
  foto: "Galeri Foto",
  absensi: "Absensi Harian",
  pengaturan: "Pengaturan"
};

function navigate(page) {
  if (!pageTitles[page]) return;

  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(el => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  $("page-" + page).classList.add("active");
  $("pageTitle").textContent = pageTitles[page];
  if (page === "dashboard") renderDashboard();
}

$("navigation").addEventListener("click", event => {
  const button = event.target.closest("[data-page]");
  if (button) navigate(button.dataset.page);
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-go]");
  if (button) navigate(button.dataset.go);
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "");
}

function renderDashboard() {
  $("welcomeName").textContent = data.profile.name;
  $("countMapel").textContent = data.subjects.length;
  $("countSport").textContent = data.sports.length;
  $("countDocs").textContent = data.docs.length;
  $("countPhotos").textContent = data.photos.length;

  const recent = data.sports.slice(-4).reverse();
  $("recentActivities").innerHTML = recent.length
    ? recent.map(s => `<div class="item-card">
        <h3>${escapeHTML(s.name)}</h3>
        <p>${escapeHTML(s.day)} · ${escapeHTML(s.time)}</p>
      </div>`).join("")
    : "Belum ada aktivitas. Tambahkan jadwal olahraga!";
}

function renderSubjects() {
  $("subjectList").innerHTML = data.subjects.map(s => `
    <article class="item-card">
      <h3>📚 ${escapeHTML(s.name)}</h3>
      <p>${escapeHTML(s.note || "Belum ada catatan materi.")}</p>
      <div class="item-actions">
        <button class="small-btn delete" data-delete="subjects" data-id="${safeId(s.id)}">Hapus</button>
      </div>
    </article>`).join("") || `<p class="muted">Belum ada pelajaran. Tambahkan lewat formulir di atas.</p>`;
}

function renderSports() {
  $("sportList").innerHTML = data.sports.map(s => `
    <article class="item-card">
      <h3>⚡ ${escapeHTML(s.name)}</h3>
      <p>📅 ${escapeHTML(s.day)} · ⏰ ${escapeHTML(s.time)}</p>
      <div class="item-actions">
        <button class="small-btn delete" data-delete="sports" data-id="${safeId(s.id)}">Hapus</button>
      </div>
    </article>`).join("") || `<p class="muted">Belum ada jadwal olahraga.</p>`;
}

function renderDocs() {
  $("docList").innerHTML = data.docs.map(d => `
    <article class="item-card">
      <h3>▤ ${escapeHTML(d.name)}</h3>
      <p>${escapeHTML(d.fileName)} · ${Math.max(1, Math.round(d.size / 1024))} KB</p>

      <div class="item-actions">
        <button
          type="button"
          class="small-btn"
          data-preview="${safeId(d.id)}">
          👁️ Lihat Dokumen
        </button>

        <button
          type="button"
          class="small-btn delete"
          data-delete="docs"
          data-id="${safeId(d.id)}">
          🗑️ Hapus
        </button>
      </div>
    </article>
  `).join("") ||
  `<p class="muted">Belum ada dokumen tersimpan.</p>`;
}

function renderPhotos() {
  $("photoList").innerHTML = data.photos.map(p => `
    <article class="photo-card">
      <img src="${p.dataUrl}" alt="${escapeHTML(p.name)}" loading="lazy">
      <div><strong>${escapeHTML(p.name)}</strong>
        <button class="small-btn delete" data-delete="photos" data-id="${safeId(p.id)}">Hapus</button>
      </div>
    </article>`).join("") || `<p class="muted">Galeri masih kosong. Unggah foto pertamamu.</p>`;
}

function renderAttendance() {
  $("attendanceList").innerHTML = data.attendance.slice().reverse().map(a => `
    <article class="item-card">
      <h3>✓ ${escapeHTML(a.date)} · ${escapeHTML(a.status)}</h3>
      <p>${escapeHTML(a.note || "Tanpa catatan")}</p>
      <div class="item-actions">
        <button class="small-btn delete" data-delete="attendance" data-id="${safeId(a.id)}">Hapus</button>
      </div>
    </article>`).join("") || `<p class="muted">Belum ada catatan absensi.</p>`;
}

function renderAll() {
  document.body.classList.remove("theme-blue", "theme-red");
  if (data.theme === "blue") document.body.classList.add("theme-blue");
  if (data.theme === "red") document.body.classList.add("theme-red");

  $("profileName").value = data.profile.name;
  $("profileBio").value = data.profile.bio;
  $("attendanceDate").value ||= new Date().toLocaleDateString("en-CA");

  renderDashboard();
  renderSubjects();
  renderSports();
  renderDocs();
  renderPhotos();
  renderAttendance();
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

$("profileForm").addEventListener("submit", event => {
  event.preventDefault();
  data.profile.name = $("profileName").value.trim();
  data.profile.bio = $("profileBio").value.trim();
  if (saveData()) {
    renderDashboard();
    notify("Profil berhasil disimpan.");
  }
});

$("subjectForm").addEventListener("submit", event => {
  event.preventDefault();
  data.subjects.push({
    id: makeId(),
    name: $("subjectName").value.trim(),
    note: $("subjectNote").value.trim()
  });
  if (saveData()) {
    $("subjectForm").reset();
    renderSubjects();
    renderDashboard();
    notify("Pelajaran berhasil ditambahkan.");
  }
});

$("sportForm").addEventListener("submit", event => {
  event.preventDefault();
  data.sports.push({
    id: makeId(),
    name: $("sportName").value.trim(),
    day: $("sportDay").value,
    time: $("sportTime").value
  });
  if (saveData()) {
    $("sportName").value = "";
    renderSports();
    renderDashboard();
    notify("Jadwal olahraga tersimpan.");
  }
});

$("docForm").addEventListener("submit", async event => {
  event.preventDefault();
  const file = $("docFile").files[0];
  if (!file) return;

  if (file.size > 300 * 1024) {
    notify("Demo ini membatasi dokumen menjadi 300 KB per file.");
    return;
  }

  const dataUrl = await readFile(file);
  data.docs.push({
    id: makeId(),
    name: $("docName").value.trim(),
    fileName: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    dataUrl
  });

  if (saveData()) {
    $("docForm").reset();
    renderDocs();
    renderDashboard();
    notify("Dokumen berhasil disimpan di browser.");
  }
});

$("photoForm").addEventListener("submit", async event => {
  event.preventDefault();
  const file = $("photoFile").files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    notify("Pilih file gambar terlebih dahulu.");
    return;
  }
  if (file.size > 700 * 1024) {
    notify("Pilih foto maksimal 700 KB agar penyimpanan tidak penuh.");
    return;
  }

  data.photos.push({
    id: makeId(),
    name: $("photoName").value.trim() || file.name,
    dataUrl: await readFile(file)
  });

  if (saveData()) {
    $("photoForm").reset();
    renderPhotos();
    renderDashboard();
    notify("Foto berhasil ditambahkan.");
  }
});

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File tidak dapat dibaca."));
    reader.readAsDataURL(file);
  });
}

$("attendanceForm").addEventListener("submit", event => {
  event.preventDefault();
  const date = $("attendanceDate").value;
  const existing = data.attendance.find(a => a.date === date);

  if (existing) {
    existing.status = $("attendanceStatus").value;
    existing.note = $("attendanceNote").value.trim();
  } else {
    data.attendance.push({
      id: makeId(),
      date,
      status: $("attendanceStatus").value,
      note: $("attendanceNote").value.trim()
    });
  }

  if (saveData()) {
    $("attendanceNote").value = "";
    renderAttendance();
    notify("Absensi berhasil disimpan.");
  }
});

document.addEventListener("click", event => {
  const closeButton = event.target.closest("[data-close-preview]");
  const modal = $("documentModal");
  if (closeButton || event.target === modal) {
    modal.classList.add("hidden");
    return;
  }

  const button = event.target.closest("[data-preview]");
  if (!button) return;

  const doc = data.docs.find(
    item => item.id === button.dataset.preview
  );

  if (!doc) {
    notify("Dokumen tidak ditemukan.");
    return;
  }

  $("previewTitle").textContent = doc.name;
  $("previewContent").replaceChildren();

  if (
    doc.type === "application/pdf" ||
    doc.type.startsWith("image/")
  ) {
    const element = doc.type.startsWith("image/")
      ? document.createElement("img")
      : document.createElement("iframe");

    element.src = doc.dataUrl;
    element.className = doc.type.startsWith("image/")
      ? "document-image"
      : "document-frame";

    element.alt = doc.name;
    element.title = doc.name;

    $("previewContent").appendChild(element);
  } else {
    $("previewContent").textContent =
      "Pratinjau langsung tersedia untuk PDF dan gambar. File Word perlu fitur konversi terlebih dahulu.";
  }

  modal.classList.remove("hidden");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    $("documentModal").classList.add("hidden");
  }
});

document.addEventListener("click", event => {
  const del = event.target.closest("[data-delete]");
  if (del) {
    const collection = del.dataset.delete;
    const id = del.dataset.id;
    if (!["subjects", "sports", "docs", "photos", "attendance"].includes(collection)) return;
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    data[collection] = data[collection].filter(item => item.id !== id);
    if (saveData()) {
      renderAll();
      notify("Data berhasil dihapus.");
    }
  }

  const download = event.target.closest("[data-download]");
  if (download) {
    const doc = data.docs.find(item => item.id === download.dataset.download);
    if (!doc) return;

    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.fileName;
    a.click();
  }
});

document.querySelectorAll("[data-theme]").forEach(button => {
  button.addEventListener("click", () => {
    data.theme = button.dataset.theme;
    if (saveData()) {
      renderAll();
      notify("Tema berhasil diganti.");
    }
  });
});

$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "agung-dashboard-backup.json";
  a.click();
  URL.revokeObjectURL(url);
});

$("resetBtn").addEventListener("click", () => {
  if (!confirm("Semua data dashboard lokal akan dihapus. Lanjutkan?")) return;
  data = structuredClone(defaultData);
  saveData();
  renderAll();
  notify("Data lokal berhasil direset.");
});

function updateClock() {
  $("clock").textContent = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  }).format(new Date());
}

function createParticles() {
  const container = $("particles");
  for (let i = 0; i < 45; i++) {
    const particle = document.createElement("i");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 7 + "s";
    particle.style.animationDuration = (4 + Math.random() * 7) + "s";
    container.appendChild(particle);
  }
}

createParticles();
updateClock();
setInterval(updateClock, 30000);

if (sessionStorage.getItem("agungLoggedIn") === "yes") {
  enterDashboard();
} else {
  showScreen("intro");
}
