document.addEventListener("DOMContentLoaded", () => {
  const topBar = document.querySelector(".notification-top-bar");
  const kapatBtns = document.querySelectorAll(".kapatR, .kapatL");

  if (localStorage.getItem("notificationBarClosed") === "true") {
    topBar.style.display = "none";
  }

  kapatBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      topBar.style.display = "none";
      localStorage.setItem("notificationBarClosed", "true");
    });
  });
});
