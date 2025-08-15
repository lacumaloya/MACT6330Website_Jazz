// Digital Fingerprint Effect with Multiple Patterns (ES6 Class Refactor)
(function() {
  'use strict';

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

  // ===== COLOR CONSTANTS =====
  const COLORS = {
    blue: 0x00bfff,
    purple: 0x7c3aed,
    pink: 0xff69b4,
    teal: 'teal'
  };

  // ===== ERROR HANDLING =====
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
  
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
  });

  // ===== CANVAS SETUP =====
  const canvas = document.getElementById('fingerprint-canvas');
  if (!canvas) {
    console.error('Fingerprint canvas not found. Make sure the element with id "fingerprint-canvas" exists.');
    return;
  }
  
  console.log('Fingerprint canvas found:', canvas);
  const ctx = canvas.getContext('2d');
  
  // ===== UTILITY FUNCTIONS =====
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  // Color interpolation (blue to purple to pink)
  function lerpColor(a, b, t) {
    const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
    return 'rgb(' +
      Math.round(ar + (br - ar) * t) + ',' +
      Math.round(ag + (bg - ag) * t) + ',' +
      Math.round(ab + (bb - ab) * t) + ')';
  }

  // Deterministic hash-based noise for stable per-dot variation (no flicker)
  function hash2D(a, b) {
    const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
    return s - Math.floor(s); // 0..1
  }

  // ===== EXPOSE UTILITIES GLOBALLY =====
  window.lerpColor = lerpColor;
  window.hash2D = hash2D;

  // ===== MAIN FINGERPRINT CLASS =====
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
        const baseOffset = (r / this.ridges) * (this.maxR - BASE_OFFSET_MIN) + BASE_OFFSET_MIN;
        this.ridgePaths.push(this.generatePath(r, baseOffset));
      }
    }
    
    draw(dotsDrawn, dotsPerFrame) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (let r = 0; r < this.ridgePaths.length; r++) {
        const path = this.ridgePaths[r];
        const maxDots = dotsDrawn[r] || 0;
        
        this.drawRidge(r, path, maxDots);
        
        // Update dots drawn count
        if (maxDots < path.length) {
          dotsDrawn[r] = maxDots + dotsPerFrame;
        }
      }
    }

    drawRidge(ridgeIndex, path, maxDots) {
      const isArchPattern = this.isArchPattern();
      
      for (let i = 0; i < maxDots && i < path.length; i++) {
        const pt = path[i];
        const fade = this.calculateFade(pt.t);
        const dotSize = this.calculateDotSize(ridgeIndex, i);
        
        if (isArchPattern) {
          this.drawArchDot(pt, ridgeIndex, i, fade, dotSize);
        } else {
          this.drawStandardDot(pt, fade, dotSize);
        }
      }
    }

    isArchPattern() {
      const className = this.constructor.name;
      return className === 'PlainArch' || 
             className.includes('PlainArchVariation') || 
             className === 'TentedArch';
    }

    calculateFade(t) {
      if (t > FADE_THRESHOLD) {
        return Math.max(0, 1.0 - (t - FADE_THRESHOLD) * FADE_MULTIPLIER);
      }
      return 1.0;
    }

    calculateDotSize(ridgeIndex, pointIndex) {
      return DOT_SIZE_BASE + DOT_SIZE_AMPLITUDE * Math.sin(ridgeIndex + pointIndex * DOT_SIZE_FREQUENCY);
    }

    drawStandardDot(pt, fade, dotSize) {
      const color = pt.t < 0.5 ? 
        lerpColor(COLORS.blue, COLORS.purple, pt.t * 2) : 
        lerpColor(COLORS.purple, COLORS.pink, (pt.t - 0.5) * 2);
      
      this.drawDot(pt.x, pt.y, dotSize, color, fade);
    }

    drawArchDot(pt, ridgeIndex, pointIndex, fade, dotSize) {
      if (pointIndex % 2 === 0) {
        const layerColor = this.getArchLayerColor(ridgeIndex);
        const noiseX = (Math.random() - 0.5) * NOISE_AMPLITUDE;
        const noiseY = (Math.random() - 0.5) * NOISE_AMPLITUDE;
        
        this.drawDot(pt.x + noiseX, pt.y + noiseY, dotSize, layerColor, fade);
      }
    }

    getArchLayerColor(ridgeIndex) {
      const ridgeInArch = ridgeIndex % this.ridges;
      if (ridgeInArch < this.ridges / RIDGE_DIVISOR) {
        return '#' + COLORS.blue.toString(16).padStart(6, '0');
      } else if (ridgeInArch < (this.ridges * 2) / RIDGE_DIVISOR) {
        return '#' + COLORS.purple.toString(16).padStart(6, '0');
      } else {
        return '#' + COLORS.pink.toString(16).padStart(6, '0');
      }
    }

    drawDot(x, y, size, color, fade) {
      this.ctx.save();
      this.ctx.globalAlpha = ALPHA_BASE * fade;
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
  
  // ===== INITIALIZATION =====
  resize();
  window.addEventListener('resize', resize);
  
  console.log('Fingerprint script loaded successfully');
})();