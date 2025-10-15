/* script.js - starfield (Three.js), clock & ring sync, button handlers */
(function(){
  // open URL (use chrome.tabs if in extension)
  function openUrl(url){
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create){
      chrome.tabs.create({ url: url });
    } else {
      window.open(url, '_blank');
    }
  }
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = btn.dataset.url;
      if (url) openUrl(url);
      btn.animate([{transform:'scale(.98)'},{transform:'scale(1)'}], {duration:160, easing:'ease-out'});
      // Ripple effect
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
    // Entrance animation
    btn.animate([
      { transform: 'translateY(8px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], { duration: 260, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });
  });

  // Clock update
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  function updateClock(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    timeEl.textContent = `${hh}:${mm}:${ss}`;
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Simple starfield using vanilla JS
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const starCount = 300;
  const stars = Array.from({length: starCount}, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.2 + 0.3,
    dx: (Math.random()-0.5) * 0.1,
    dy: (Math.random()-0.5) * 0.1
  }));

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#eaf6ff';
    for (const star of stars) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI*2);
      ctx.fill();
      star.x += star.dx;
      star.y += star.dy;
      if (star.x < 0 || star.x > width) star.dx *= -1;
      if (star.y < 0 || star.y > height) star.dy *= -1;
    }
  }

  function animateStars() {
    drawStars();
    requestAnimationFrame(animateStars);
  }
  animateStars();

  function onResize(){
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener('resize', onResize);
  // Ring rotation (vanilla JS)
  let rot = 0;
  const ringOuter = document.querySelector('.ring-outer');
  const ringMid = document.querySelector('.ring-mid');
  const ringInner = document.querySelector('.ring-inner');

  function animateRings() {
    const now = performance.now();
    const t = now * 0.00015;
    if (ringOuter) ringOuter.style.transform = `translate(-50%,-50%) rotate(${t * 20}deg)`;
    if (ringMid) ringMid.style.transform = `translate(-50%,-50%) rotate(${-t * 38}deg)`;
    if (ringInner) ringInner.style.transform = `translate(-50%,-50%) rotate(${t * 56}deg)`;
    requestAnimationFrame(animateRings);
  }
  animateRings();

  // Mouse parallax for rings (vanilla JS)
  let mx=0,my=0;
  window.addEventListener('mousemove', (e)=>{
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    if (ringOuter) ringOuter.style.marginLeft = `${nx * 10}px`;
    if (ringMid) ringMid.style.marginTop = `${ny * 10}px`;
  });

  // reduce updates when hidden
  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden){
      // stop heavy updates if needed
    }
  });

  // --- Draggable Panels Feature ---
  function makePanelDraggable(panel) {
    // Create a handle
    const handle = document.createElement('div');
    handle.className = 'panel-drag-handle';
    handle.title = 'Drag to move';
    handle.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:18px;cursor:grab;z-index:10;background:rgba(0,0,0,0.04);border-radius:16px 16px 0 0;';
    panel.prepend(handle);

    let offsetX = 0, offsetY = 0, dragging = false;
    let startX, startY;

    handle.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      offsetX = startX - rect.left;
      offsetY = startY - rect.top;
      panel.style.zIndex = 99;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      panel.style.left = x + 'px';
      panel.style.top = y + 'px';
      panel.style.right = '';
      panel.style.bottom = '';
      panel.style.transform = '';
    });
    handle.addEventListener('pointerup', (e) => {
      dragging = false;
      panel.style.zIndex = 2;
      // Save position
      const pos = { left: panel.style.left, top: panel.style.top };
      localStorage.setItem('panel-pos-' + panel.id, JSON.stringify(pos));
      handle.releasePointerCapture(e.pointerId);
    });
    // Restore position
    const saved = localStorage.getItem('panel-pos-' + panel.id);
    if (saved) {
      const pos = JSON.parse(saved);
      panel.style.left = pos.left;
      panel.style.top = pos.top;
      panel.style.right = '';
      panel.style.bottom = '';
      panel.style.transform = '';
    }
  }
  ['panel-social','panel-ai','panel-google-workspace','panel-trading'].forEach(id => {
    const panel = document.getElementById(id);
    if (panel) makePanelDraggable(panel);
  });
})();