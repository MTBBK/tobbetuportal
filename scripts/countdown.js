(function () {
  const targetUrl = "https://www.etu.edu.tr/tr/akademik-takvim";
  const CACHE_KEY = "akademikTakvimCache_v7";

  const proxies = [`/apis/akademik-cache.html`];

  const box = document.getElementById("countdown-box");
  const updateTime = document.getElementById("update-time");

  function parseStartDate(text) {
    const months = {
      ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5,
      temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11
    };

    const match = text.toLowerCase().match(/(\d{1,2})\s*[-–]\s*\d{1,2}\s+([a-zçğıöşü]+)\s+(\d{4})/);
    if (match) {
      const day = parseInt(match[1]);
      const month = months[match[2]];
      const year = parseInt(match[3]);
      return new Date(year, month, day, 0, 0, 0);
    }

    const single = text.toLowerCase().match(/(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})/);
    if (single) {
      const day = parseInt(single[1]);
      const month = months[single[2]];
      const year = parseInt(single[3]);
      return new Date(year, month, day, 0, 0, 0);
    }

    return null;
  }

  async function fetchCalendar() {
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { cache: "no-store", mode: "cors" });
        if (res.ok) {
          let html = "";

          // JSON olarak dönen allorigins verisini ayıkla
          if (proxy.includes("allorigins.win/get")) {
            const data = await res.json();
            html = data.contents;
          } else {
            html = await res.text();
          }

          if (html && html.includes("timeline__item")) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              html,
              timestamp: new Date().toISOString()
            }));
            processCalendar(html);
            return;
          }
        }
      } catch (err) {
        console.warn("Proxy failed:", proxy);
      }
    }
    if(box) box.innerHTML = "<p>Bağlantı hatası: Proxy servisleri yanıt vermiyor.</p>";
  }

  let countdownTimer;

  function processCalendar(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Yalnızca Lisans sekmesini alıyoruz
    const lisansTab = doc.querySelector(".tabs__content");
    if (!lisansTab) {
      if(box) box.innerHTML = "<p>Takvim verisi bulunamadı.</p>";
      return;
    }

    // Elemanları tüm sayfadan değil, sadece Lisans sekmesinden seç
    const items = [...lisansTab.querySelectorAll(".timeline__item")];
    const now = new Date();

    const futureExamItem = items.find(i => {
      if (!i.textContent.includes("Dönem sonu sınavları")) return false;
      const dateText = i.querySelector("h4")?.textContent || "";
      const parsedDate = parseStartDate(dateText);
      return parsedDate && parsedDate > now;
    });

    if (!futureExamItem) {
      if(box) box.innerHTML = "<p>Gelecekteki bir sınav tarihi bulunamadı.</p>";
      return;
    }

    const finalDate = parseStartDate(futureExamItem.querySelector("h4").textContent);
    startCountdown(finalDate);
  }

  function startCountdown(targetDate) {
    if (countdownTimer) clearInterval(countdownTimer);

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;

      if (!box) return;

      if (diff <= 0) {
        box.innerHTML = "<h2>Dönem Sonu Sınavları Başladı!</h2>";
        clearInterval(countdownTimer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      document.title = `${days} Gün kaldı`;

      box.innerHTML = `
        <h2>Dönem Sonu Sınavlarına Kalan Süre</h2>
        <div class="countdown-values">
          <div><strong>${days}</strong><span>Gün</span></div>
          <div><strong>${hours}</strong><span>Saat</span></div>
          <div><strong>${minutes}</strong><span>Dakika</span></div>
          <div><strong>${seconds}</strong><span>Saniye</span></div>
        </div>
        <p>Sınavlar ${targetDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde başlayacak.</p>
      `;
    }

    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 1000);
  }

  function loadFromCache() {
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const { html, timestamp } = JSON.parse(cache);
      processCalendar(html);
      if (updateTime) updateTime.textContent = new Date(timestamp).toLocaleString("tr-TR");
    } else {
      fetchCalendar();
    }
  }

  function init() {
    loadFromCache();
    fetchCalendar();
    setInterval(fetchCalendar, 1000 * 60 * 60);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
