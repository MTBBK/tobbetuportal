(function () {
  if (window.__CLASSES_LOADED__) return;
  window.__CLASSES_LOADED__ = true;

  const select = document.getElementById("departmentSelect");
  const searchBox = document.getElementById("searchBox");
  const container = document.getElementById("lessonList");
  const CACHE_PREFIX = "dersListesiCache_";
  let currentLessons = [];

  // Hide search box until a department is selected
  searchBox.style.display = "none";

  const proxies = [
    (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    (url) => `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ];

  // Initialize Select2 inside this script
  $(document).ready(function () {
    $('#departmentSelect').select2({
      placeholder: "Bölüm Seçiniz",
      width: '100%'
    });

    // react to selection changes
    $('#departmentSelect').on("change", function () {
      const dep = this.value;
      searchBox.value = "";
      if (!dep) {
        container.innerHTML = "<p>Lütfen bir bölüm seçin.</p>";
        searchBox.style.display = "none";
        currentLessons = [];
        return;
      }
      searchBox.style.display = "block";
      localStorage.setItem("lastDepartment", dep);
      loadFromCache(dep);
      setTimeout(() => fetchLessons(dep), 400);
    });

    // Restore last selected department if available
    const last = localStorage.getItem("lastDepartment");
    if (last) {
      $('#departmentSelect').val(last).trigger("change");
    }
  });

  // Improved search handling: ignore spaces, dashes, case
  searchBox.addEventListener("input", () => {
    const q = normalizeText(searchBox.value);
    if (!currentLessons.length) return;
    const filtered = currentLessons.filter(l => normalizeText(l.name).includes(q));
    renderLessons(filtered);
  });

  // Utility to normalize text (handles “BİL 141”, “BİL141”, “BİL-141”)
  function normalizeText(str) {
    return str
      .toLowerCase()
      .replace(/[\s\-]/g, "") // remove spaces and dashes
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // strip accents
  }

  function parseAndRender(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = doc.querySelectorAll('a[href*="lesson.jsp"]');
    const lessons = Array.from(anchors).map(a => ({
      name: a.textContent.trim(),
      href: a.href
    }));
    currentLessons = lessons;
    renderLessons(lessons);
  }

  function renderLessons(list) {
    if (!list.length) {
      container.innerHTML = "<p>Hiç ders bulunamadı.</p>";
      return;
    }

    container.innerHTML = `
      <div class="lesson-grid">
        ${list.map(l => `
            <a href="${l.href}" target="_blank"><div class="lesson-card">${l.name}</div></a>
        `).join("")}
      </div>
    `;
  }

  async function fetchLessons(dep) {
    // Special handling for Hukuk and Tarih
    const suffix = (dep === "hukuk" || dep === "tarih") 
      ? "ders-mufredati-ingilizce"
      : "ders-mufredati";

    const targetUrl = `https://www.etu.edu.tr/tr/bolum/${dep}/${suffix}`;
    const cacheKey = CACHE_PREFIX + dep;

    for (const proxyFn of proxies) {
      const proxyUrl = proxyFn(targetUrl);
      try {
        const res = await fetch(proxyUrl, { cache: "no-store", mode: "cors" });
        if (res.ok) {
          const html = await res.text();
          localStorage.setItem(cacheKey, JSON.stringify({ html, timestamp: new Date().toISOString() }));
          parseAndRender(html);
          return;
        }
      } catch (err) {
        console.warn("Proxy failed:", proxyUrl, err);
      }
    }
    container.innerHTML = "<p>Tüm proxy bağlantıları başarısız oldu.</p>";
  }

  function loadFromCache(dep) {
    const cache = localStorage.getItem(CACHE_PREFIX + dep);
    if (cache) {
      const { html } = JSON.parse(cache);
      parseAndRender(html);
    } else {
      container.innerHTML = "<p>Yükleniyor...</p>";
    }
  }

  container.innerHTML = "<p>Lütfen bir bölüm seçin.</p>";
})();
