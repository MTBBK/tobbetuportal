(function () {
  if (window.__TAKVIM_LOADED__) return;
  window.__TAKVIM_LOADED__ = true;

  const container = document.getElementById("timeline");
  const targetUrl = "https://www.etu.edu.tr/tr/akademik-takvim";
  const CACHE_KEY = "akademikTakvimCache_v2";

  const proxies = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  ];

  function parseAndRender(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    container.innerHTML = "";
    const headers = doc.querySelectorAll(".timeline__header");
    let guzCount = 0;

    for (let header of headers) {
      const title = (header.textContent || "").trim();
      if (title === "Güz Dönemi") {
        guzCount++;
        if (guzCount > 1) break;
      }

      const term = document.createElement("div");
      term.className = "term-header";
      term.textContent = title;
      container.appendChild(term);

      let node = header.nextElementSibling;
      while (node && !node.classList.contains("timeline__header")) {
        if (node.classList.contains("timeline__item")) {
          const date = node.querySelector("h4")?.textContent.trim() || "";
          const desc = node.querySelector("strong")?.textContent.trim() || "";

          const item = document.createElement("div");
          item.className = "item";
          if (node.classList.contains("tatil_gunu")) item.classList.add("tatil");
          if (node.classList.contains("onemli_gun")) item.classList.add("onemli");
          item.innerHTML = `<span>${date}</span><strong>${desc}</strong>`;
          container.appendChild(item);
        }
        node = node.nextElementSibling;
      }
    }

    setTimeout(() => showWeekCounter(doc), 300);
  }

  function parseDate(text) {
    const aylar = {
      ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5,
      temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11
    };
    const match = text.toLowerCase().match(/(\d{1,2})\s+([a-zçğıöşü]+)/i);
    if (!match) return null;
    const gun = parseInt(match[1]);
    const ay = aylar[match[2]];
    const yilMatch = text.match(/\d{4}/);
    const yil = yilMatch ? parseInt(yilMatch[0]) : new Date().getFullYear();
    return new Date(yil, ay, gun);
  }

  function showWeekCounter(doc) {
    const items = [...doc.querySelectorAll(".timeline__item")];
    const startItem = items.find(i =>
      i.textContent.includes("Derslerin ve Ortak Eğitim Döneminin başlaması")
    );
    const endItem = items.find(i =>
      i.textContent.includes("Derslerin son günü")
    );

    if (!startItem || !endItem) return;

    const startText = startItem.querySelector("h4")?.textContent || "";
    const endText = endItem.querySelector("h4")?.textContent || "";
    const startDate = parseDate(startText);
    const endDate = parseDate(endText);
    const today = new Date();

    const weekBox = document.createElement("div");
    weekBox.className = "week-counter";

    if (startDate && endDate && today >= startDate && today <= endDate) {
      const diffWeeks = Math.floor(
        (today - startDate) / (1000 * 60 * 60 * 24 * 7)
      ) + 1;
      weekBox.textContent = `Dönemin ${diffWeeks}. Haftasındayız.`;
    } else if (today < startDate) {
      weekBox.textContent = "Dersler henüz başlamadı.";
    } else {
      weekBox.textContent = "Ders dönemi sona erdi.";
    }

    container.prepend(weekBox);
  }

  async function fetchAkademikTakvim() {
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { cache: "no-store", mode: "cors" });
        if (res.ok) {
          const html = await res.text();
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            html,
            timestamp: new Date().toISOString()
          }));
          parseAndRender(html);
          return;
        }
      } catch (err) {
        console.warn("Proxy failed:", proxy, err);
      }
    }
    console.error("All proxies failed");
  }

  function loadFromCache() {
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const { html } = JSON.parse(cache);
      parseAndRender(html);
    } else {
      container.textContent = "Yükleniyor...";
    }
  }

  function loadAkademikTakvim() {
    loadFromCache();
    setTimeout(fetchAkademikTakvim, 500);
  }
  
  function academicCountdown(doc) {
	  const items = [...doc.querySelectorAll(".timeline__item")];
	  const startItem = items.find(i => i.textContent.includes("Derslerin ve Ortak Eğitim Döneminin başlaması"));
	  const endItem = items.find(i => i.textContent.includes("Derslerin son günü"));

	  if (!startItem || !endItem) return;

	  const startText = startItem.querySelector("h4")?.textContent || "";
	  const startDate = parseDate(startText);
	  const today = new Date();

	  const countdownBox = document.createElement("div");
	  countdownBox.className = "countdown-box";

	  const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
	  if (diffDays > 0)
		countdownBox.textContent = `Derslerin başlamasına ${diffDays} gün kaldı.`;
	  else
		countdownBox.textContent = "Ders dönemi başlamıştır.";

	  document.getElementById("timeline").prepend(countdownBox);
  }


  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", loadAkademikTakvim, { once: true });
  else loadAkademikTakvim();
})();
