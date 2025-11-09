const HOURS = [
  "08.30 09.20","09.30 10.20","10.30 11.20","11.30 12.20",
  "12.30 13.20","13.30 14.20","14.30 15.20","15.30 16.20",
  "16.30 17.20","17.30 18.20", "18.30 19.20"
];
const DAYS = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

const STATE_KEY = "dersProgramim_state_v3";
const LEGACY_KEY = "dersProgramim_v2";
const lessonjson = "/jsons/courses.json";

let selected = null;  // {td, coord}

// ---------- State helpers ----------
function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return { version: 3, updatedAt: 0, cells: {} };
    const st = JSON.parse(raw);
    if (!st || typeof st !== "object") throw 0;
    if (!st.cells) st.cells = {};
    return st;
  } catch {
    return { version: 3, updatedAt: 0, cells: {} };
  }
}

function saveState(mutator) {
  const st = loadState();
  mutator(st);
  st.updatedAt = Date.now();
  localStorage.setItem(STATE_KEY, JSON.stringify(st));
}

function migrateIfNeeded() {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;
  try {
    const v2 = JSON.parse(legacy) || {};
    const st = loadState();
    const hourIndex = Object.create(null);
    HOURS.forEach((h, i) => hourIndex[h] = i);
    const dayIndex = Object.create(null);
    DAYS.forEach((d, i) => dayIndex[d] = i);

    Object.entries(v2).forEach(([k, html]) => {
      const sep = k.indexOf("_");
      if (sep === -1) return;
      const day = k.slice(0, sep);
      const hour = k.slice(sep + 1);
      const r = hourIndex[hour];
      const c = dayIndex[day];
      if (r != null && c != null) {
        const coord = `${r}|${c}`;
        st.cells[coord] = { html: html || "" };
      }
    });

    st.updatedAt = Date.now();
    localStorage.setItem(STATE_KEY, JSON.stringify(st));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    localStorage.removeItem(LEGACY_KEY);
  }
}

// ---------- UI build ----------
document.addEventListener("DOMContentLoaded", async () => {
  migrateIfNeeded();

  const tbody = document.querySelector("#program tbody");
  for (let r = 0; r < HOURS.length; r++) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = HOURS[r];
    tr.appendChild(th);

    for (let c = 0; c < DAYS.length; c++) {
      const td = document.createElement("td");
      const coord = `${r}|${c}`;
      td.dataset.coord = coord;
      td.addEventListener("click", () => openModal(td, coord));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  await loadCourses();
  $(".select2").select2({ placeholder: "Ders seçin...", width: "resolve" });

  applyStateToTable();

  window.addEventListener("storage", (e) => {
    if (e.key === STATE_KEY) applyStateToTable();
  });
});

function applyStateToTable() {
  const st = loadState();
  document.querySelectorAll("#program td[data-coord]").forEach(td => {
    const coord = td.dataset.coord;
    const cell = st.cells[coord];
    td.innerHTML = cell && cell.html ? cell.html : "";
  });
}

// ---------- Courses ----------
async function loadCourses() {
  const select = document.getElementById("dersSelect");
  try {
    const courses = await fetch(lessonjson, { cache: "no-store" }).then(r => r.json());
    select.innerHTML = "";
    for (const c of courses) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    }
  } catch {
    console.error("Ders listesi yüklenemedi.");
  }
}

// ---------- Modal ----------
function openModal(td, coord) {
  selected = { td, coord };
  const st = loadState();
  const cell = st.cells[coord];
  if (cell && cell.html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = cell.html;
    const b = tmp.querySelector("b");
    const ders = b ? b.textContent.trim() : "";
    const text = tmp.textContent.replace(ders, "").trim();
    // new pattern: "{ders} - {section}: {room}"
    const [afterDash = "", room = ""] = text.split(":").map(s => s.trim());
    const section = afterDash.replace(/^-\s*/, "");
    $("#dersSelect").val(ders).trigger("change");
    document.getElementById("section").value = section || "";
    document.getElementById("classroom").value = room || "";
  } else {
    $("#dersSelect").val(null).trigger("change");
    document.getElementById("section").value = "";
    document.getElementById("classroom").value = "";
  }
  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

document.getElementById("saveBtn").addEventListener("click", () => {
  if (!selected) return;
  const ders = $("#dersSelect").val();
  const section = document.getElementById("section").value.trim();
  const room = document.getElementById("classroom").value.trim();
  if (!ders) return;

  // New format
  const html = `<b>${ders}</b>${section ? " - " + section : ""}${room ? " : " + room : ""}`;

  selected.td.innerHTML = html;
  saveState(st => {
    st.cells[selected.coord] = { html };
  });
  closeModal();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (!selected) return;
  selected.td.innerHTML = "";
  saveState(st => { delete st.cells[selected.coord]; });
  closeModal();
});

// ---------- Extra actions ----------
function clearAll() {
  if (confirm("Tüm tabloyu temizlemek istiyor musun?")) {
    localStorage.removeItem(STATE_KEY);
    location.reload();
  }
}
function downloadPDF() {
  const el = document.getElementById("program");
  const body = document.body;

  // Detect current theme and icon
  const currentTheme = body.getAttribute("data-color") || "dark";
  const currentIcon = localStorage.getItem("icon") || "/darkicon.png";

  // Temporarily switch to light theme
  applyTheme("light", "/lighticon.png");

  // Give the DOM a moment to repaint before PDF capture
  setTimeout(() => {
    html2pdf()
      .set({
        filename: "ders_programim.pdf",
        pagebreak: { mode: "avoid-all" },
        margin: 10,
        html2canvas: { scale: 2 }
      })
      .from(el)
      .save()
      .then(() => {
        // Restore original theme and icon
        applyTheme(currentTheme, currentIcon);
      })
      .catch(() => {
        // In case of an error, always revert
        applyTheme(currentTheme, currentIcon);
      });
  }, 300);
}

// ---------- Export & Import ----------
function exportSchedule() {
  try {
    const data = localStorage.getItem(STATE_KEY);
    if (!data) {
      alert("Kaydedilmiş program bulunamadı.");
      return;
    }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ders_programim.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export error:", err);
    alert("Program dışa aktarılırken hata oluştu.");
  }
}

function importSchedule() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.style.display = "none";

  input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json || !json.cells) {
        alert("Geçersiz dosya formatı!");
        return;
      }

      localStorage.setItem(STATE_KEY, JSON.stringify(json));
      alert("Program başarıyla içe aktarıldı!");
      location.reload();
    } catch (err) {
      console.error("Import error:", err);
      alert("Dosya okunamadı veya geçersiz.");
    }
  });

  document.body.appendChild(input);
  input.click();
  input.remove();
}

window.clearAll = clearAll;
window.downloadPDF = downloadPDF;
