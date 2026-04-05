(function() {
  const soundBtn = document.getElementById("soundButton");
  if (!soundBtn) return;

  const clickSound = new Audio("/sounds/fenerbahce.wav");
  clickSound.volume = 0.5;

  soundBtn.addEventListener("click", () => {
    clickSound.onended = () => {
      soundBtn.classList.remove("playing");
    };
    if (!clickSound.paused) {
      clickSound.pause();
      clickSound.currentTime = 0;
      soundBtn.classList.remove("playing");
    } else {
      clickSound.currentTime = 0;
      clickSound.play().catch(err => console.warn("Audio playback error:", err));
      soundBtn.classList.add("playing");
      clickSound.onended = () => {
        soundBtn.classList.remove("playing");
      };
      
      if (clickSound.duration > 0 && isFinite(clickSound.duration)) {
        setTimeout(() => soundBtn.classList.remove("playing"), clickSound.duration * 1000);
      }
    }
  });
})();
