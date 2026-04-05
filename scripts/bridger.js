document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menuContainer");
  const addPageBtn = document.getElementById("addPageBtn");
  const addPageModal = document.getElementById("addPageModal");
  const savePageBtn = document.getElementById("savePageBtn");
  const cancelPageBtn = document.getElementById("cancelPageBtn");
  const pageNameInput = document.getElementById("pageName");
  const pageURLInput = document.getElementById("pageURL");
  const modalTitle = document.getElementById("modalTitle");

  let editIndex = null;

  let customPages = JSON.parse(localStorage.getItem("customPages")) || [];

  function renderButtons() {
    const oldButtons = document.querySelectorAll(".custom-page");
    oldButtons.forEach(btn => btn.remove());

    customPages.forEach((page, index) => {
      const div = document.createElement("div");
      div.classList.add("menu-button", "custom-page");
      div.style.position = "relative";

      div.innerHTML = `
        <a href="${page.url}" target="_blank" style="color:inherit;text-decoration:none;">
          <i class="fa fa-link"></i> ${page.name}
        </a>
        <div style="position:absolute;top:8px;right:10px;">
          <button class="edit-btn" data-index="${index}" title="Düzenle"><i class="fa fa-pencil"></i></button>
          <button class="delete-btn" data-index="${index}" title="Sil">X</button>
        </div>
      `;
      menuContainer.appendChild(div);
    });

    // Add listeners
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        openEditModal(index);
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        if (confirm("Bu sayfayı silmek istediğinizden emin misiniz?")) {
          customPages.splice(index, 1);
          savePages();
          renderButtons();
        }
      });
    });
  }

  function savePages() {
    localStorage.setItem("customPages", JSON.stringify(customPages));
  }

  function openEditModal(index) {
    editIndex = index;
    modalTitle.textContent = "Sayfa Düzenle";
    pageNameInput.value = customPages[index].name;
    pageURLInput.value = customPages[index].url;
    addPageModal.style.display = "flex";
  }

  addPageBtn.addEventListener("click", () => {
    editIndex = null;
    modalTitle.textContent = "Yeni Sayfa Ekle";
    pageNameInput.value = "";
    pageURLInput.value = "";
    addPageModal.style.display = "flex";
  });

  cancelPageBtn.addEventListener("click", () => {
    addPageModal.style.display = "none";
  });

  savePageBtn.addEventListener("click", () => {
    const name = pageNameInput.value.trim();
    const url = pageURLInput.value.trim();
    if (!name || !url) {
      alert("Lütfen hem isim hem URL girin.");
      return;
    }

    if (editIndex !== null) {
      // Edit mode
      customPages[editIndex] = { name, url };
    } else {
      // Add mode
      customPages.push({ name, url });
    }

    savePages();
    renderButtons();
    addPageModal.style.display = "none";
  });

  // Render existing
  renderButtons();
});
