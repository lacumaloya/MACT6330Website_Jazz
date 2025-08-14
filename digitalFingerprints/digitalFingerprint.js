// Digital Fingerprint Effect with Multiple Patterns (ES6 Class Refactor)
(function() {
  // ===== CONSTANTS =====
  const CANVAS_SCALE_FACTOR = 0.32;
  const DEFAULT_RIDGES = 15;
  const DEFAULT_POINTS_PER_RIDGE = 50;
  const BASE_OFFSET_MIN = 10;
  const FADE_THRESHOLD = 0.78;
  const FADE_MULTIPLIER = 5.0;
  const DOT_SIZE_BASE = 2.1;
  const DOT_SIZE_AMPLITUDE = 1.2;
  const DOT_SIZE_FREQUENCY = 0.13;
  const NOISE_AMPLITUDE = 5.5;
  const ALPHA_BASE = 0.85;
  const RIDGE_DIVISOR = 3;

  // Global error handler to catch any JavaScript errors
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    console.error('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
  
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  const canvas = document.getElementById('fingerprint-canvas');
  if (!canvas) {
    console.error('Fingerprint canvas not found. Make sure the element with id "fingerprint-canvas" exists.');
    return;
  }
  console.log('Fingerprint canvas found:', canvas);
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Color interpolation (blue to purple to pink)
  function lerpColor(a, b, t) {
    const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
    return 'rgb(' +
      Math.round(ar + (br - ar) * t) + ',' +
      Math.round(ag + (bg - ag) * t) + ',' +
      Math.round(ab + (bb - ab) * t) + ')';
  }
  // Make lerpColor available globally for other classes
  window.lerpColor = lerpColor;
  const blue = 0x00bfff, purple = 0x7c3aed, pink = 0xff69b4;

  // Deterministic hash-based noise for stable per-dot variation (no flicker)
  window.hash2D = function(a, b) {
    const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
    return s - Math.floor(s); // 0..1
  };

  // --- Base Class ---
  window.DigitalFingerprint = class DigitalFingerprint {
    constructor(canvas, ctx) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.cx = canvas.width / 2;
      this.cy = canvas.height / 2;
      this.maxR = Math.min(canvas.width, canvas.height) * CANVAS_SCALE_FACTOR;
      this.ridges = DEFAULT_RIDGES;
      this.pointsPerRidge = DEFAULT_POINTS_PER_RIDGE;
      this.ridgePaths = [];
    }
    
    generate() {
      this.ridgePaths = [];
      for (let r = 0; r < this.ridges; r++) {
        let baseOffset = (r / this.ridges) * (this.maxR - BASE_OFFSET_MIN) + BASE_OFFSET_MIN;
        this.ridgePaths.push(this.generatePath(r, baseOffset));
      }
    }
    
    draw(dotsDrawn, dotsPerFrame) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let r = 0; r < this.ridgePaths.length; r++) {
        let path = this.ridgePaths[r];
        let maxDots = dotsDrawn[r] || 0;
        for (let i = 0; i < maxDots && i < path.length; i++) {
          let pt = path[i];
          // Use debug color for riverbend ridges
          let color;
          if (pt.riverbend) {
            color = 'teal'; // Debug color for riverbends
          } else {
            color = pt.t < 0.5 ? lerpColor(blue, purple, pt.t * 2) : lerpColor(purple, pink, (pt.t - 0.5) * 2);
          }
          let fade = 1.0;
          if (pt.t > FADE_THRESHOLD) fade = Math.max(0, 1.0 - (pt.t - FADE_THRESHOLD) * FADE_MULTIPLIER);
          let dotSize = DOT_SIZE_BASE + DOT_SIZE_AMPLITUDE * Math.sin(r + i * DOT_SIZE_FREQUENCY);
          
          if (this.constructor.name === 'PlainArch' || this.constructor.name.includes('PlainArchVariation') || this.constructor.name === 'TentedArch') {
            let ridgeInArch = r % this.ridges;
            let layerColor;
            if (ridgeInArch < this.ridges / RIDGE_DIVISOR) {
              layerColor = '#' + blue.toString(16).padStart(6, '0');
            } else if (ridgeInArch < (this.ridges * 2) / RIDGE_DIVISOR) {
              layerColor = '#' + purple.toString(16).padStart(6, '0');
            } else {
              layerColor = '#' + pink.toString(16).padStart(6, '0');
            }
            if (i % 2 === 0) {
              let noiseX = (Math.random() - 0.5) * NOISE_AMPLITUDE;
              let noiseY = (Math.random() - 0.5) * NOISE_AMPLITUDE;
              this.ctx.save();
              this.ctx.globalAlpha = ALPHA_BASE * fade;
              this.ctx.fillStyle = layerColor;
              this.ctx.beginPath();
              this.ctx.arc(pt.x + noiseX, pt.y + noiseY, dotSize, 0, Math.PI * 2);
              this.ctx.fill();
              this.ctx.restore();
            }
            continue;
          }
          this.ctx.save();
          this.ctx.globalAlpha = ALPHA_BASE * fade;
          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, dotSize, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
        if (maxDots < path.length) {
          dotsDrawn[r] = maxDots + dotsPerFrame;
        }
      }
    }
  }
  
  console.log('Fingerprint script loaded successfully');
})();