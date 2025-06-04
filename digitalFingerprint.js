// Digital Fingerprint Effect for Hero Section (ES5)
(function() {
  var canvas = document.getElementById('fingerprint-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Color interpolation (blue to purple to pink)
  function lerpColor(a, b, t) {
    var ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    var br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
    return 'rgb(' +
      Math.round(ar + (br - ar) * t) + ',' +
      Math.round(ag + (bg - ag) * t) + ',' +
      Math.round(ab + (bb - ab) * t) + ')';
  }
  var blue = 0x00bfff, purple = 0x7c3aed, pink = 0xff69b4;

  // Ridge parameters (further optimized for performance)
  var cx, cy, maxR, ridges, pointsPerRidge, ridgePaths;
  function generateRidges() {
    ridgePaths = [];
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    maxR = Math.min(canvas.width, canvas.height) * 0.32; // smaller, centered
    ridges = 15;
    pointsPerRidge = 50;
    for (var r = 0; r < ridges; r++) {
      var path = [];
      var baseOffset = (r / ridges) * (maxR - 10) + 10;
      var spiralTurns = 2.2 + 2.5 * (r / ridges);
      for (var i = 0; i < pointsPerRidge * spiralTurns; i++) {
        var t = i / (pointsPerRidge * spiralTurns);
        var theta = t * Math.PI * 2 * spiralTurns;
        var flow = Math.sin(theta * 1.2 + r * 0.18) * 0.18 + Math.sin(theta * 3.1 + r * 0.5) * 0.07;
        var rr = baseOffset + 13 * t + 2 * Math.sin(theta * 2.5 + r * 0.7);
        var x = cx + rr * Math.cos(theta + flow) * 0.7;
        var y = cy + rr * Math.sin(theta + flow) * 1.15;
        path.push({x: x, y: y, t: t});
      }
      ridgePaths.push(path);
    }
  }

  // Animation state
  var dotsDrawn = [];
  var dotsPerFrame = 5; // faster per frame for snappier animation
  var animating = true;
  function drawFingerprint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Remove dark background fill
    // Draw ridges as animated dots (no scanlines or grid for speed)
    for (var r = 0; r < ridgePaths.length; r++) {
      var path = ridgePaths[r];
      var maxDots = dotsDrawn[r] || 0;
      for (var i = 0; i < maxDots && i < path.length; i++) {
        var pt = path[i];
        // Color gradient: blue (outside) to purple (middle) to pink (center)
        var color;
        if (pt.t < 0.5) color = lerpColor(blue, purple, pt.t * 2);
        else color = lerpColor(purple, pink, (pt.t - 0.5) * 2);
        // Fade out dots near the edge for a softer look
        var fade = 1.0;
        if (pt.t > 0.85) fade = Math.max(0, 1.0 - (pt.t - 0.85) * 4.5);
        ctx.save();
        ctx.globalAlpha = 0.85 * fade;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.1 + 1.2 * Math.sin(r + i * 0.13), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Animate: add more dots per frame
      if (animating && maxDots < path.length) {
        dotsDrawn[r] = maxDots + dotsPerFrame;
      }
    }
    // Continue animation if any ridge is still drawing
    var stillDrawing = false;
    for (var r = 0; r < ridgePaths.length; r++) {
      if (dotsDrawn[r] < ridgePaths[r].length) stillDrawing = true;
    }
    if (animating && stillDrawing) {
      requestAnimationFrame(drawFingerprint);
    } else if (animating) {
      // Pause, then restart
      setTimeout(function() {
        for (var r = 0; r < ridgePaths.length; r++) dotsDrawn[r] = 0;
        requestAnimationFrame(drawFingerprint);
      }, 1800);
    }
  }
  // Regenerate ridges and restart animation on resize
  function restart() {
    generateRidges();
    dotsDrawn = [];
    animating = true;
    requestAnimationFrame(drawFingerprint);
  }
  window.addEventListener('resize', restart);
  // Initial start
  generateRidges();
  requestAnimationFrame(drawFingerprint);
})(); 