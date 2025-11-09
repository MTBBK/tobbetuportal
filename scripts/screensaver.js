(function() {
  const idleLimit = 180000;
  let idleTimer;
  let screensaverActive = false;
  let screensaverEl;
  let x = 100, y = 100;
  let dx = 2.5, dy = 2.2;
  let lastChange = 0;
  const iconPaths = ["/darkicon.png", "/lighticon.png", "/fancyicon.png"];
  const icons = iconPaths.map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });

  const messages_goingout = [
    "Gitmeeee...",
    "Gitmeeee...",
    "Gitmeeee...",
    "Gitmeeee...",
    "Nereye Gittin?",
    "Ders Zamanı",
    "Duyurular Sayfasına bir göz at derim.",
    "https://cezeri.tech",
    "(cezeri.xyz)",
    "Süper Site"
  ];
  const originalTitle = document.title;
  document.addEventListener("visibilitychange", () => {
    const randomText = messages_goingout[Math.floor(Math.random() * messages_goingout.length)];
	if(document.location != "https://tobbetu.org/sayac/"){
		if (document.hidden) document.title = randomText;
		else document.title = originalTitle;
	}
  });

  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    switch (e.key) {
      case "1": window.location.href = "/"; break;
      case "2": window.location.href = "/duyurular"; break;
      case "3": window.location.href = "/kopru"; break;
      case "4": window.location.href = "/akademik"; break;
      case "5": window.location.href = "/arsiv"; break;
   	  case "7": window.location.href = "/ringler"; break;
      case "6": window.location.href = "/menu"; break;
	  case "8": window.location.href = "/program"; break;
	  case "9": window.location.href = "/sayac"; break;
	}
  });
  
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 dakika

setInterval(() => {
  if (navigator.onLine) {
    console.log("Connected — performing hard refresh");

    // Force browser to bypass cache by appending a version param
    const url = new URL(window.location.href);
    url.searchParams.set("guncel", Date.now());
    window.location.replace(url.toString());
  } else {
    console.log("Offline — skipping auto refresh");
  }
}, AUTO_REFRESH_INTERVAL);

  
  function createScreensaver() {
    screensaverEl = document.createElement("img");
    screensaverEl.src = "/fancyicon.png";
    screensaverEl.style.position = "fixed";
    screensaverEl.style.width = "150px";
    screensaverEl.style.height = "auto";
    screensaverEl.style.left = "100px";
    screensaverEl.style.top = "100px";
    screensaverEl.style.zIndex = "9999";
    screensaverEl.style.pointerEvents = "none";
    screensaverEl.style.display = "none";
    screensaverEl.style.opacity = "0";
    screensaverEl.style.transition = "opacity 1s ease, filter 0.8s ease";
    document.body.appendChild(screensaverEl);
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function changeIcon() {
    const c = getRandomInt(3);
    screensaverEl.src = icons[c].src;
  }

  function changeColorOverlay() {
    const now = performance.now();
    if (now - lastChange < 150) return;
    lastChange = now;

    const hue = Math.floor(Math.random() * 360);
    const sat = 70 + Math.random() * 30;
    const brightness = 0.8 + Math.random() * 0.3;
    const contrast = 1 + Math.random() * 0.3;

    screensaverEl.style.filter = `
      hue-rotate(${hue}deg)
      saturate(${sat}%)
      brightness(${brightness})
      contrast(${contrast})
    `;
  }

  function bounce() {
    if (!screensaverActive) return;
    const w = window.innerWidth - screensaverEl.clientWidth;
    const h = window.innerHeight - screensaverEl.clientHeight;

    x += dx;
    y += dy;

    if (x <= 0 || x >= w) {
      dx = -dx;
      changeIcon();
    }
    if (y <= 0 || y >= h) {
      dy = -dy;
      changeIcon();
    }

    screensaverEl.style.left = x + "px";
    screensaverEl.style.top = y + "px";

    requestAnimationFrame(bounce);
  }

  function showScreensaver() {
    if (screensaverActive) return;
    screensaverActive = true;
    screensaverEl.style.display = "block";
    requestAnimationFrame(() => (screensaverEl.style.opacity = "1"));
    bounce();
  }

  function hideScreensaver() {
    if (!screensaverActive) return;
    screensaverActive = false;
    screensaverEl.style.opacity = "0";
    setTimeout(() => (screensaverEl.style.display = "none"), 1000);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    hideScreensaver();
    idleTimer = setTimeout(showScreensaver, idleLimit);
  }

  ["mousemove", "keydown", "mousedown", "touchstart"].forEach(evt =>
    document.addEventListener(evt, resetIdleTimer, { passive: true })
  );

  createScreensaver();
  resetIdleTimer();
})();