// ===============================
// Cezeri / TOBB ETÜ Language Switcher
// ===============================

const LANG_KEY = "preferred-language";
const languageBtn = document.getElementById("langSwitcher");
const soundBtn = document.getElementById("soundButton");
const refreshBtn = document.getElementById("refreshButton");
  
let languageBtnTimeout;
let currentLang = localStorage.getItem(LANG_KEY) || "tr";

// --- Load translations from separate JSON file ---
let translations = {};
fetch("/jsons/translations.json")
  .then(res => res.json())
  .then(data => {
    translations = data;
    updateLanguage(currentLang);
    updateLangButton();
  })
  .catch(err => console.warn("Translation load failed:", err));


// --- Core updateLanguage function ---
function updateLanguage(lang) {
  if (!translations[lang]) return;

  document.querySelectorAll("[data-translate-key]").forEach((el) => {
    const key = el.getAttribute("data-translate-key");
    const newText = translations[lang][key];
    if (!newText) return;

    // Replace only text nodes, not icons or nested HTML
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        node.textContent = " " + newText;
      }
    });

    // Optional placeholder translation
    if (translations[lang][`placeholder_${key}`]) {
      el.placeholder = translations[lang][`placeholder_${key}`];
    }

    // Optional tooltip translation
    if (translations[lang][`tooltip_${key}`]) {
      el.title = translations[lang][`tooltip_${key}`];
    }
  });

  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  updateLangButton();
}


// --- Update button label and tooltip ---
function updateLangButton() {
  if (!languageBtn) return;

  const langNames = {
    tr: "Türkçe",
    en: "English",
    jg: "Jargon",
    fr: "Français",
    es: "Español",
  };

  const available = Object.keys(translations);
  const currentLangName = langNames[currentLang] || currentLang.toUpperCase();
  const idx = available.indexOf(currentLang);
  const nextLang = available[(idx + 1) % available.length];
  const nextLangName = langNames[nextLang] || nextLang.toUpperCase();

  languageBtn.title = `${nextLangName}`;
}


// --- Click Handler (switch + animation) ---
if (languageBtn) {
  languageBtn.addEventListener("click", () => {
    const langs = Object.keys(translations);
    if (!langs.length) return;

    const idx = langs.indexOf(currentLang);
    const nextLang = langs[(idx + 1) % langs.length];

    updateLanguage(nextLang);

    // Animated expansion
    const langNames = {
      tr: "Türkçe",
      en: "English",
      jg: "Jargon",
      fr: "Français",
      es: "Español",
    };
    const langName = langNames[nextLang] || nextLang.toUpperCase();

    languageBtn.classList.add("expanded");
    languageBtn.innerHTML = `<i class="fa fa-globe"></i> ${langName}`;
	
	if (refreshBtn && soundBtn) {
	  refreshBtn.classList.add("shifted");
	  soundBtn.classList.add("shifted");
	}
	  
    clearTimeout(languageBtnTimeout);
	
    languageBtnTimeout = setTimeout(() => {
      languageBtn.classList.remove("expanded");
      languageBtn.innerHTML = `<i class="fa fa-globe"></i>`;
      if (refreshBtn && soundBtn) {
        refreshBtn.classList.remove("shifted");
        soundBtn.classList.remove("shifted");
      }
    }, 2500);
  });
}
