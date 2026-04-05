(function () {
  const targetUrl = "https://www.etu.edu.tr/tr/akademik-takvim";
  const proxies = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  ];
  const CACHE_KEY = "akademikTakvimCache_v2";

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
          const html = await res.text();
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            html,
            timestamp: new Date().toISOString()
          }));
          processCalendar(html);
          return;
        }
      } catch (err) {
        console.warn("Proxy failed:", proxy);
      }
    }
    box.innerHTML = "<p>Veri alınamadı.</p>";
  }

// ... (keep parseStartDate and other functions as they are)

let countdownTimer; // Global variable to manage the timer

function processCalendar(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items = [...doc.querySelectorAll(".timeline__item")];
  
  const now = new Date();
  
  // FIX: Find the first exam period that is actually in the FUTURE
  const futureExamItem = items.find(i => {
    if (!i.textContent.includes("Dönem sonu sınavları")) return false;
    const dateText = i.querySelector("h4")?.textContent || "";
    const parsedDate = parseStartDate(dateText);
    return parsedDate && parsedDate > now; // Only pick if date is after today
  });

  if (!futureExamItem) {
    box.innerHTML = "<p>Gelecekteki bir sınav tarihi bulunamadı.</p>";
    return;
  }

  const finalDate = parseStartDate(futureExamItem.querySelector("h4").textContent);
  startCountdown(finalDate);
}

function startCountdown(targetDate) {
  // Clear any existing timer to prevent multiple intervals running
  if (countdownTimer) clearInterval(countdownTimer);

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    
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

// FIX: Improved Loading Logic
function init() {
  loadFromCache();    // Show cached data immediately if available
  fetchCalendar();    // Then immediately fetch fresh data to update
  setInterval(fetchCalendar, 1000 * 60 * 60); // Refresh every hour
}

init();

  function loadFromCache() {
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const { html, timestamp } = JSON.parse(cache);
      processCalendar(html);
	  //Yazı olarak son güncellemeyi kaydetmek için.
      //updateTime.textContent = new Date(timestamp).toLocaleString("tr-TR");
    } else {
      fetchCalendar();
    }
  }
})();
