async function loadMenu() {
  try {
	const res = await fetch('/jsons/menu.json');
    const weeks = await res.json();
    const container = document.getElementById('menu');
    container.innerHTML = '';

    weeks.forEach(week => {
      const table = document.createElement('table');
      table.innerHTML = `
        <caption>${week.week}</caption>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Çorba</th>
            <th>Ana Yemek</th>
            <th>İkincil Yemek</th>
            <th>Tatlı / İçecek</th>
          </tr>
        </thead>
        <tbody>
          ${week.days.map(day => {
            const isHoliday = day.corba && day.corba.toLowerCase().includes("resm");
            if (isHoliday) {
              return `
                <tr>
                  <td>${day.date}</td>
                  <td colspan="4"><b>${day.corba}</b></td>
                </tr>
              `;
            } else {
              return `
                <tr>
                  <td>${day.date}</td>
                  <td>${day.corba || ""}</td>
                  <td>${day.anayemek || ""}</td>
                  <td>${day.yan || ""}</td>
                  <td>${day.tatli || ""}</td>
                </tr>
              `;
            }
          }).join('')}
        </tbody>
      `;
      container.appendChild(table);
    });
  } catch (err) {
    console.error('Menü yüklenemedi:', err);
    document.getElementById('menu').innerHTML =
      '<p style="color:red;">Menü yüklenemedi.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadMenu);