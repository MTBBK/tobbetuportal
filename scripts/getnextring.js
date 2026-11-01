(async function() {
  const container = document.getElementById("ring-widget");
  const targetUrl = "https://www.etu.edu.tr/tr/iletisim/ulasim";
  const CACHE_KEY = "widgetRingCache_v2";

  const proxies = [
    `/apis/ulasim-cache.html`
  ];

  function render(nextRing) {
    if (!nextRing) {
      container.innerHTML = "<p>Bugün için başka ring bulunamadı.</p>";
      return;
    }
    container.innerHTML = `
      <a href="/ringler"><h2 data-translate-key="nextring">Sonraki Ring</h2>
      <p><b>${nextRing.time}</b></p>
      <p>${nextRing.from} → ${nextRing.to}</p></a>
    `;
  }

  // Updated to look for specific day headers (e.g., "RİNG" or "CUMARTESİ")
  function parseRings(html, keyword) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const h3 = [...doc.querySelectorAll("h3")]
      .find(h => (h.textContent || "").toUpperCase().includes(keyword.toUpperCase()));
    if (!h3) return [];

    let table = h3.nextElementSibling;
    while (table && table.tagName !== "TABLE") table = table.nextElementSibling;
    if (!table) return [];

    const rows = [...table.querySelectorAll("tr")].slice(1).map(tr => {
      const tds = tr.querySelectorAll("td");
      return {
        no: tds[0]?.textContent.trim(),
        time: tds[1]?.textContent.trim(),
        from: tds[2]?.textContent.trim(),
        to: tds[3]?.textContent.trim()
      };
    });
    return rows.filter(r => r.time && r.from && r.to);
  }

  async function fetchRings(keyword) {
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { cache: "no-store" });
        if (res.ok) {
          const html = await res.text();
          localStorage.setItem(CACHE_KEY, JSON.stringify({ html, ts: Date.now() }));
          return parseRings(html, keyword);
        }
      } catch {}
    }
    return null;
  }

  async function loadRings() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Sunday skip remains the same
    if (day === 0) {
      container.innerHTML = "<p>Pazar günleri ring servisi bulunmamaktadır.</p>";
      return;
    }

    // Determine which table header to look for based on the day
    const keyword = (day === 6) ? "CUMARTESİ" : "RİNG";

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let rings = null;

    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      rings = parseRings(JSON.parse(cache).html, keyword);
    } else {
      rings = await fetchRings(keyword);
    }

    if (!rings || rings.length === 0) {
      container.innerHTML = "<p>Veri alınamadı veya ring bulunamadı.</p>";
      return;
    }

    const next = rings.find(r => {
      const [h, m] = r.time.split(":").map(Number);
      return h * 60 + m > currentMinutes;
    });

    render(next);
    if (!cache) await fetchRings(keyword); // refresh if no cache
  }

  loadRings();
  setInterval(() => { if (navigator.onLine) loadRings(); }, 60 * 1000);
})();
