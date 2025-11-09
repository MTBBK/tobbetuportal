(async function() {
  const container = document.getElementById("ring-widget");
  const targetUrl = "https://www.etu.edu.tr/tr/iletisim/ulasim";
  const CACHE_KEY = "widgetRingCache";

  const proxies = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  ];

  function render(nextRing) {
    if (!nextRing) {
      container.innerHTML = "<p>Bugün için ring bulunamadı.</p>";
      return;
    }
    container.innerHTML = `
      <a href="/ringler"><h2>Sonraki Ring</h2>
      <p><b>${nextRing.time}</b></p>
      <p>${nextRing.from} → ${nextRing.to}</p></a>
    `;
  }

  function parseRings(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const h3 = [...doc.querySelectorAll("h3")]
      .find(h => (h.textContent || "").toUpperCase().includes("RİNG"));
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

  async function fetchRings() {
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { cache: "no-store" });
        if (res.ok) {
          const html = await res.text();
          localStorage.setItem(CACHE_KEY, JSON.stringify({ html, ts: Date.now() }));
          return parseRings(html);
        }
      } catch {}
    }
    return null;
  }

  async function loadRings() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Skip weekends
    if (day === 0) {
      container.innerHTML = "<p>Pazar günleri ring servisi bulunmamaktadır.</p>";
      return;
    }
	else if(day === 6) {
	  container.innerHTML = "<a href=\"https://www.etu.edu.tr/tr/iletisim/ulasim#:~:text=CUMARTES%C4%B0%20SERV%C4%B0SLER%C4%B0\"><p>Cumartesi ringleri sisteme henüz eklenmemiştir.</p></a>";
	  return;
	}

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let rings = null;

    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) rings = parseRings(JSON.parse(cache).html);
    else rings = await fetchRings();

    if (!rings) {
      container.innerHTML = "<p>Veri alınamadı.</p>";
      return;
    }

    const next = rings.find(r => {
      const [h, m] = r.time.split(":").map(Number);
      return h * 60 + m > currentMinutes;
    });

    render(next);
    if (!cache) await fetchRings(); // refresh if no cache
  }

  loadRings();
  setInterval(() => { if (navigator.onLine) loadRings(); }, 60 * 1000);
})();
