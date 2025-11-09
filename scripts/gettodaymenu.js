(async function() {
  const container = document.getElementById("meal-widget");
  const CACHE_KEY = "widgetMealCache";
  const url = "/jsons/menu.json";

  function render(meal) {
    if (!meal) {
      container.innerHTML = "<p>Bugün için menü bulunamadı.</p>";
      return;
    }
    container.innerHTML = `
      <a href="/menu"><h2>Günün Menüsü</h2>
      <p>${meal.corba || ""}</p>
      <p>${meal.anayemek || ""}</p>
      <p>${meal.yan || ""}</p>
      <p>${meal.tatli || ""}</p></a>
    `;
  }

  function formatTurkishDate(dateObj) {
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const d = dateObj.getDate();
    const m = months[dateObj.getMonth()];
    const dayName = days[dateObj.getDay()];
    return `${d} ${m} ${dayName}`; // matches "27 Ekim Pazartesi" style
  }

  async function fetchMeal() {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));

      const todayFormatted = formatTurkishDate(new Date());
      const week = data.find(w => w.days.some(d => d.date === todayFormatted));
      const day = week ? week.days.find(d => d.date === todayFormatted) : null;

      render(day);
    } catch (e) {
      console.warn("Meal fetch failed:", e);
      const cache = localStorage.getItem(CACHE_KEY);
      if (cache) {
        const { data } = JSON.parse(cache);
        const todayFormatted = formatTurkishDate(new Date());
        const week = data.find(w => w.days.some(d => d.date === todayFormatted));
        const day = week ? week.days.find(d => d.date === todayFormatted) : null;
        render(day);
      } else {
        container.innerHTML = "<p>Veri alınamadı.</p>";
      }
    }
  }

  fetchMeal();
  // Refresh once per hour (not every minute)
  setInterval(() => { if (navigator.onLine) fetchMeal(); }, 60 * 60 * 1000);
})();
