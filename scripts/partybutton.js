document.addEventListener("DOMContentLoaded", () => {
  const topPartyBar = document.querySelector(".party-top-bar");
  const kapatPartyBtns = document.querySelectorAll(".kapatPartyR, .kapatPartyL");

  if (localStorage.getItem("partyBarClosed") === "true") {
    topPartyBar.style.display = "none";
  }

  kapatPartyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      topPartyBar.style.display = "none";
      localStorage.setItem("partyBarClosed", "true");
    });
  });
});
