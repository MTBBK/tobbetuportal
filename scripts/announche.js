async function loadAnnouncements() {
  try {
    const res = await fetch('/jsons/cezerixyzannouncements.json');
    const posts = await res.json();
    const container = document.getElementById('posts');
    container.innerHTML = ''; // clear loading text

    posts.forEach(post => {
      const div = document.createElement('div');
      div.classList.add('post');
      div.innerHTML = `
        <h2>${post.title}</h2>
        <div class="meta">Yayın Tarihi: ${post.date}</div>
        <p>${post.content}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Duyurular yüklenemedi:', err);
    document.getElementById('posts').innerHTML =
      '<p style="color:red;">Duyurular yüklenemedi.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadAnnouncements);