(function () {
  const THEME_KEY = "preferred-style";
  const defaultStyle = "/css/style.css";
  const fezaStyle = "/css/spacestyle.css";
  const retroStyle = "/css/oldstyle.css";
  const terminalStyle = "/css/terminalstyle.css";

  let link = document.querySelector('link[id="themeStylesheet"][href*="/css/"]');
  if (!link) return;

  const saved = localStorage.getItem(THEME_KEY);
  if (saved) link.href = saved;

  const switchBtn = document.getElementById("styleSwitcher");
  const soundBtn = document.getElementById("soundButton");
  const refreshBtn = document.getElementById("refreshButton");
  const languageBtn = document.getElementById("langSwitcher");
  
  let switchBtnTimeout = null; 
  
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      const current = link.getAttribute("href");
      const currentTheme = current.split("/").pop();
      let next, themeName;

      switch (currentTheme) {
        case "style.css":
          next = fezaStyle; themeName = "Feza"; break;
        case "spacestyle.css":
          next = retroStyle; themeName = "Retro"; break;
        case "oldstyle.css":
          next = terminalStyle; themeName = "Terminal"; break;
		case "terminalstyle.css":
		  next = defaultStyle; themeName = "Klasik"; break;
        default:
          next = defaultStyle; themeName = "Klasik";
      }
	  
      link.href = next;
      localStorage.setItem(THEME_KEY, next);
	  
	  if (refreshBtn && soundBtn) {
	    refreshBtn.classList.add("shifted");
        soundBtn.classList.add("shifted");
	  }
	  if (languageBtn) {
	    languageBtn.classList.add("shifted");
	  }
	  
      switchBtn.classList.add("expanded");
      switchBtn.textContent = themeName;

	  if (switchBtnTimeout) clearTimeout(switchBtnTimeout);
	  
      switchBtnTimeout = setTimeout(() => {
        switchBtn.classList.remove("expanded");
        switchBtn.innerHTML = '<i class="fa fa-paint-brush"></i>';
	    if (refreshBtn && soundBtn) {
		  refreshBtn.classList.remove("shifted");
		  soundBtn.classList.remove("shifted");
		}	    
		if (languageBtn) {
		  languageBtn.classList.remove("shifted");
		}
      }, 2500);
    });
  }

  window.addEventListener("storage", (e) => {
    if (e.key === THEME_KEY && e.newValue) {
      link.href = e.newValue;
    }
  });
})();