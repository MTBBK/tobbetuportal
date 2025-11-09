document.addEventListener("DOMContentLoaded", () => {
  const shirvanBtn = document.getElementById("shirvan-button");
  const ahmethocaBtn = document.getElementById("ahmethoca-button");
  const osmankuruBtn = document.getElementById("osmankuru-button");
  const shirvanContainer = document.getElementById("shirvan-container");
  const ahmethocaContainer = document.getElementById("ahmethoca-container");
  const osmankuruContainer = document.getElementById("osmankuru-container");
  const shirvan = document.getElementById("shirvan");
  const ahmethoca = document.getElementById("ahmethoca");
  const osmankuru = document.getElementById("osmankuru");
  const sbubble = document.getElementById("shirvan-bubble");
  const abubble = document.getElementById("ahmethoca-bubble");
  const obubble = document.getElementById("osmankuru-bubble");
  let asistanTimeout;
  const hour = new Date().getHours();

  const messages_shirvan = [
    "Çöplüğe niye kokuyorsun denmez.",
    "Fırtınaya karşı koyan ağacın gövdesi değil köküdür.",
    "Tutarsız bir insandan tutarlı sonuçlar beklemeyin.",
    "Önce fiziği öğren sonra metafiziği öğrenirsin.",
    "Kendi üzerimde çalışıyorum ama daha bitmedi.",
    "Ahlaksız olmanın daha ahlaklı yolu yoktur.",
    "Düşüncen fakir ise diğer zenginlikler seni kurtarmaz",
    "Nokta her zaman bir son değildir, bazen kendinden sonraki harfin büyük olacağını gösterir."
  ];
  
  const messages_ahmethoca = [
    "Aaaarrrrmut gibi!",
  ];

  let messages_osmankuru = [
    "Merhaba",
  ];

  shirvanBtn.addEventListener("click", () => {
    shirvanBtn.style.display = "none";
	ahmethocaBtn.style.display = "none";
    osmankuruBtn.style.display = "none";
    shirvanContainer.style.display = "block";
  });
  
  ahmethocaBtn.addEventListener("click", () => {
    shirvanBtn.style.display = "none";
    ahmethocaBtn.style.display = "none";
    osmankuruBtn.style.display = "none";
    ahmethocaContainer.style.display = "block";
  });
  
  osmankuruBtn.addEventListener("click", () => {
    shirvanBtn.style.display = "none";
    ahmethocaBtn.style.display = "none";
    osmankuruBtn.style.display = "none";
    osmankuruContainer.style.display = "block";
  });
  
  shirvan.addEventListener("click", () => {
    const randomText = messages_shirvan[Math.floor(Math.random() * messages_shirvan.length)];
    sbubble.textContent = randomText;
    sbubble.style.display = "block";
	
    clearTimeout(asistanTimeout);
    asistanTimeout = setTimeout(() => {
        sbubble.style.display = "none";
    }, 4000);
  });
    
  ahmethoca.addEventListener("click", () => {
    const randomText = messages_ahmethoca[Math.floor(Math.random() * messages_ahmethoca.length)];
    abubble.textContent = randomText;
    abubble.style.display = "block";

    clearTimeout(asistanTimeout);
    asistanTimeout = setTimeout(() => {
        sbubble.style.display = "none";
    }, 4000);
  });
  
  osmankuru.addEventListener("click", () => {
    if(hour<10 && hour>5){
		messages_osmankuru.push("Günaydın?");
		messages_osmankuru.push("Sabahı şerifleriniz hayrola!");
		messages_osmankuru.push("Buongiorno!");
		messages_osmankuru.push("Çarşambadan selamlar.");
	}
    else if(hour==12){
		messages_osmankuru.push("Saat 12.");
	}
    else if(hour>21 || hour<3){
		messages_osmankuru.push("Gece yarısı da çalışılmaz ki...");
		messages_osmankuru.push("Hayırlı Akşamlar.");
	}
    const randomText = messages_osmankuru[Math.floor(Math.random() * messages_osmankuru.length)];
    obubble.textContent = randomText;
    obubble.style.display = "block";

    clearTimeout(asistanTimeout);
    asistanTimeout = setTimeout(() => {
        sbubble.style.display = "none";
    }, 4000);
  });
});
