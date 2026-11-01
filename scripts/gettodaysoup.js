(async function() {
  const container = document.getElementById("soup-widget");
  const soupData = {
    "6 Ağustos Perşembe": ["TANDIR ÇORBA", "SEBZE ÇORBA"],
    "7 Ağustos Cuma": ["KIRMIZI MERCİMEK ÇORBA", "BROKOLİ ÇORBA"],
    "8 Ağustos Cumartesi": ["TAVUKLU ŞEHRİYE ÇORBA", "SOĞUK ÇORBA"],
    "9 Ağustos Pazar": ["KÖZ BİBER ÇORBASI", "KREMALI MANTAR ÇORBASI"],
    "10 Ağustos Pazartesi": ["MERCİMEK ÇORBASI", "KREMALI TAVUK ÇORBASI"],
    "11 Ağustos Salı": ["TARHANA ÇORBASI", "DOMATES ÇORBASI - KAŞARLI"],
    "12 Ağustos Çarşamba": ["TANDIR ÇORBA", "YEŞİL MERCİMEK ÇORBA"],
    "13 Ağustos Perşembe": ["KREMALI MANTAR ÇORBASI", "SEBZE ÇORBA"],
    "14 Ağustos Cuma": ["DOMATES ÇORBASI - KAŞARLI", "TAVUKLU ŞEHRİYE ÇORBA"],
    "15 Ağustos Cumartesi": ["KÖZ BİBER ÇORBASI", "TANDIR ÇORBA"],
    "16 Ağustos Pazar": ["MERCİMEK ÇORBASI", "BROKOLİ ÇORBA"],
    "17 Ağustos Pazartesi": ["SOĞUK ÇORBA", "KREMALI MANTAR ÇORBASI"]
  };

  function render(soups, dateStr, isServingTime) {
    if (!soups) {
      container.innerHTML = "<p>Bu gece için çorba menüsü bulunamadı.</p>";
      return;
    }

    const statusHtml = isServingTime
        ? '<p font-size: 0.85em; margin: 0;">Şu an servis ediliyor olabilir (23:00 - 05:00)</p>'
        : '<p font-size: 0.85em; margin: 0;">Servis saatleri: 23:00 - 05:00</p>';

    container.innerHTML = `
      <a href="/menu"><h2 data-translate-key="corbamenu">Gece Çorbası (${dateStr})</h2>
      ${statusHtml}
      <p style="margin-top: 10px;">${soups[0]}</p>
      <p>${soups[1]}</p></a>
    `;
  }

  function formatTurkishDate(dateObj) {
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const d = dateObj.getDate();
    const m = months[dateObj.getMonth()];
    const dayName = days[dateObj.getDay()];
    return `${d} ${m} ${dayName}`;
  }

  function updateWidget() {
    const now = new Date();
    const hour = now.getHours();

    // Create a copy of the current date to manipulate
    let targetDate = new Date(now);

    if (hour < 5) {
        targetDate.setDate(targetDate.getDate() - 1);
    }

    const isServingTime = (hour >= 23 || hour < 5);

    const targetDateStr = formatTurkishDate(targetDate);

    const todaySoups = soupData[targetDateStr];

    render(todaySoups, targetDateStr, isServingTime);
  }

  updateWidget();

  setInterval(updateWidget, 60 * 60 * 1000);
})();
