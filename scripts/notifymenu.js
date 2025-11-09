if ("serviceWorker" in navigator && "Notification" in window) {
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("Service worker registered");
  });

  document.getElementById("notifyButton")?.addEventListener("click", async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Bildirim izni verilmedi!");
      return;
    }

    try {
      const url = "/jsons/menu.json";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
      const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
      const today = new Date();
      const todayFormatted = `${today.getDate()} ${months[today.getMonth()]} ${days[today.getDay()]}`;

      const week = data.find(w => w.days.some(d => d.date === todayFormatted));
      const day = week ? week.days.find(d => d.date === todayFormatted) : null;

      const bodyText = day
        ? `${day.corba || ""}\n${day.anayemek || ""}\n${day.yan || ""}\n${day.tatli || ""}`
        : "Bugün için menü bulunamadı.";

      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("Günün Menüsü", {
        body: bodyText,
        icon: "/cezeri.png",
        badge: "/cezeri.png",
		tag: "meal-notification",
        data: { url: "/" },
        vibrate: [200, 100, 200]
      });
    } catch (e) {
      console.error("Menü yüklenemedi:", e);
      alert("Menü alınamadı!");
    }
  });
}