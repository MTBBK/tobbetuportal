document.addEventListener("DOMContentLoaded", function() {
	const end = Date.now() + 3 * 1000;
	const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];
		(function frame() {
	  confetti({
	    particleCount: 2,
	    angle: 60,
	    spread: 55,
	    origin: { x: 0, y: 0 },
	    colors: colors,
	  });
	  confetti({
	    particleCount: 2,
	    angle: 120,
	    spread: 55,
	    origin: { x: 1, y:0},
	    colors: colors,
	  });
	  if (Date.now() < end) {
	    requestAnimationFrame(frame);
	  }
	})();
});

