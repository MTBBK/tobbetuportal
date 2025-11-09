async function loadRing() {
  const container = document.getElementById("ring");
  container.innerHTML = '<p class="loading">Yükleniyor...</p>';

  const targetUrl = "https://www.etu.edu.tr/tr/iletisim/ulasim";
  const CACHE_KEY = "ringServisleriCache_v3";

  const proxies = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  ];

  function parseAndRender(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headers = doc.querySelectorAll("h3");
    let ringTable = null;

    // Find the <h3> containing “RİNG SERVİS” and its following <table>
    headers.forEach(h => {
      if ((h.textContent || "").toUpperCase().includes("RİNG SERVİS")) {
        let next = h.nextElementSibling;
        while (next && next.tagName !== "TABLE") next = next.nextElementSibling;
        if (next) ringTable = next;
      }
    });

    if (!ringTable) {
      container.innerHTML = "<p>RİNG Servis tablosu bulunamadı.</p>";
      return;
    }

    // Remove inline styles for clean display
    ringTable.querySelectorAll("*").forEach(el => el.removeAttribute("style"));

    // Extract headers and rows
    const headersRow = [...ringTable.querySelectorAll("th")].map(th => th.textContent.trim());
    const rows = [...ringTable.querySelectorAll("tr")]
      .slice(1)
      .map(tr => [...tr.querySelectorAll("td")].map(td => td.textContent.trim()))
      .filter(cells => cells.length >= 4);

    const htmlTable = `
      <table>
        <thead>
          <tr>${headersRow.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              r => `
              <tr>
                <td>${r[0]}</td>
                <td>${r[1]}</td>
                <td>${r[2]}</td>
                <td>${r[3]}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>`;

    container.innerHTML = `
      <div id="ring-table">
        ${htmlTable}
      </div>
    `;
  }

  async function fetchAndUpdateCache() {
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { cache: "no-store" });
        if (res.ok) {
          const html = await res.text();
          localStorage.setItem(CACHE_KEY, JSON.stringify({ html, timestamp: Date.now() }));
          console.log("Ring Servisleri cache updated");
          parseAndRender(html);
          return true;
        }
      } catch (err) {
        console.warn("Proxy failed:", proxy, err);
      }
    }
    return false;
  }

  // Always try to load from cache first (offline support)
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const { html } = JSON.parse(cache);
    parseAndRender(html);
    // Fetch in background to refresh silently if online
    fetchAndUpdateCache();
  } else {
    // No cache → must fetch from web
    const success = await fetchAndUpdateCache();
    if (!success) {
      container.innerHTML = "<p>Veri alınamadı ve önbellek yok.</p>";
    }
  }
}

document.addEventListener("DOMContentLoaded", loadRing);
