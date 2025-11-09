const DRIVE_FOLDER_ID = "15NME6J7DsDarn5DWpTA8OKhwMlUJPdYP";
const API_KEY = "your_general_api_key";

let cache = {};
let pathStack = [];

function formatSize(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  else if((kb/1024)<1024)return (kb / 1024).toFixed(2) + " MB";
  return ((kb / 1024)/1024).toFixed(2) + " GB";
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    year: "numeric", month: "long", day: "numeric"
  });
}

async function listFiles(folderId) {
  if (cache[folderId]) return cache[folderId];
  const url =
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&orderBy=folder,name&fields=files(id,name,mimeType,size,modifiedTime)&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  cache[folderId] = data.files || [];
  return cache[folderId];
}

function clearList() {
  const ul = document.getElementById("driveList");
  while (ul.firstChild) ul.removeChild(ul.firstChild);
}

function updateBreadcrumbs() {
  const bar = document.getElementById("breadcrumbs");
  bar.innerHTML = "";
  pathStack.forEach((p, i) => {
    const span = document.createElement("span");
    span.textContent = p.name;
    span.addEventListener("click", () => {
      pathStack = pathStack.slice(0, i + 1);
      openFolder(p.id, p.name, true);
    });
    bar.appendChild(span);
    if (i < pathStack.length - 1) bar.appendChild(document.createTextNode(" / "));
  });
}

async function buildTree(container, folderId) {
  const files = await listFiles(folderId);
  for (const f of files) {
    const li = document.createElement("li");

    const row = document.createElement("div");
    row.classList.add("row");

    if (f.mimeType === "application/vnd.google-apps.folder") {
      li.classList.add("folder");

      const icon = document.createElement("i");
      icon.classList.add("fa", "fa-folder");
      icon.style.color = "var(--yazi)";
	  
      const name = document.createElement("span");
      name.classList.add("folder-name");
      name.textContent = f.name;

      const sub = document.createElement("ul");
      sub.classList.add("hidden");

      row.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (sub.childElementCount === 0) await buildTree(sub, f.id);
        sub.classList.toggle("hidden");
      });

      row.appendChild(icon);
      row.appendChild(name);
      li.appendChild(row);
      li.appendChild(sub);

    } else {
      li.classList.add("file");

      const icon = document.createElement("i");
      icon.classList.add("fa", "fa-file-o");
      icon.style.color = "var(--yazi)";

      const name = document.createElement("span");
      name.classList.add("file-name");
      name.textContent = f.name;

      const details = document.createElement("span");
      details.classList.add("details");
      details.textContent = `(${formatSize(f.size)} • ${formatDate(f.modifiedTime)})`;

      name.addEventListener("click", (e) => {
        e.stopPropagation();
        window.open(`https://drive.google.com/file/d/${f.id}/view`, "_blank");
      });

      row.appendChild(icon);
      row.appendChild(name);
      row.appendChild(details);
      li.appendChild(row);
    }

    container.appendChild(li);
  }
}

function collapseAll() {
  document.querySelectorAll("#driveList ul").forEach(ul => ul.classList.add("hidden"));
}

async function openFolder(folderId, name, fromBreadcrumb = false) {
  clearList();
  const ul = document.getElementById("driveList");
  await buildTree(ul, folderId);
}

async function openFolder(folderId, name, fromBreadcrumb=false) {
  if (!fromBreadcrumb) pathStack.push({ id: folderId, name });
  updateBreadcrumbs();
  clearList();
  const ul = document.getElementById("driveList");
  await buildTree(ul, folderId);
}

pathStack = [{ id: DRIVE_FOLDER_ID, name: "Klasörleri Kapat" }];
updateBreadcrumbs();
buildTree(document.getElementById("driveList"), DRIVE_FOLDER_ID);