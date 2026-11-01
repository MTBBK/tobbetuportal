(function () {
  if (window.__TAKVIM_LOADED__) return;
  window.__TAKVIM_LOADED__ = true;

  const container = document.getElementById("timeline");
  const CACHE_KEY = "akademikTakvimCache_v7";
  const proxies = [`/apis/akademik-cache.html`];

  function parseAndRender(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    container.innerHTML = "";

    const lisansTab = doc.querySelector(".tabs__content") || doc;
    const headers = lisansTab.querySelectorAll(".timeline__header");

    for (let header of headers) {
      const title = (header.textContent || "").trim();

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

          if (desc.includes("(Tatil)") || desc.includes("(Yarım Gün)") || desc.includes("Bayramı")) {
              item.classList.add("tatil");
          }
          else if ((!desc.toLowerCase().includes("sonrası başarı notlarının"))&&(desc.toLowerCase().includes("sonu sınavları") || desc.toLowerCase().includes("bütünleme"))) {
              item.classList.add("onemli");
          }

          item.innerHTML = `<span>${date}</span><strong>${desc}</strong>`;
          container.appendChild(item);
        }
        node = node.nextElementSibling;
      }
    }

    const existingCounter = container.querySelector(".week-counter");
    if(existingCounter) existingCounter.remove();

    showWeekCounter(lisansTab);
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

  function showWeekCounter(lisansTab) {
    const items = [...lisansTab.querySelectorAll(".timeline__item")];

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
    if(container.innerHTML === "" || container.innerHTML.includes("Yükleniyor")) {
        container.innerHTML = "Takvim yüklenemedi.";
    }
  }

  function loadFromCache() {
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const { html } = JSON.parse(cache);
      parseAndRender(html);
    } else {
      fetchAkademikTakvim();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadFromCache, { once: true });
  } else {
    loadFromCache();
  }
})();
