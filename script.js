(() => {
  const video = document.getElementById('scrub-video');
  const wrapper = document.querySelector('.chapters-wrapper');

  let videoDuration = 0;
  let videoReady = false;
  let latestProgress = 0;

  // ── Load video as blob ──
  // Fetching the entire file into memory guarantees it's fully buffered
  // before scrubbing starts. preload="auto" is just a hint that browsers
  // often ignore for large files.

  fetch('video5.mp4')
    .then(r => r.blob())
    .then(blob => {
      video.src = URL.createObjectURL(blob);
    });

  video.addEventListener('loadedmetadata', () => {
    videoDuration = video.duration;
    videoReady = true;
    update();
  });

  // ── Scroll progress (0–1) ──
  // Maps how far you've scrolled through the 700vh wrapper.

  function getProgress() {
    const rect = wrapper.getBoundingClientRect();
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(Math.max(-rect.top / scrollable, 0), 1);
  }

  // ── Scroll loop ──

  let ticking = false;

  function update() {
    const progress = getProgress();
    latestProgress = progress;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  // ── Video scrub loop ──
  // Runs independently of the scroll handler, on every animation frame.
  // Only issues a new seek once the previous one has finished (!video.seeking) —
  // requesting currentTime faster than the browser can seek just queues up
  // and causes visible jitter, so this always seeks toward the latest
  // scroll progress rather than replaying every intermediate value.

  function videoLoop() {
    if (videoReady && !video.seeking) {
      const target = latestProgress * videoDuration;
      if (Math.abs(video.currentTime - target) > 1 / 24) {
        video.currentTime = target;
      }
    }
    requestAnimationFrame(videoLoop);
  }
  requestAnimationFrame(videoLoop);
})();
