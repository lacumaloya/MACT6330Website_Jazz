// Digital Fingerprint Effect with Multiple Patterns (ES6 Class Refactor)
(function() {
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
  var canvas = document.getElementById('fingerprint-canvas');
  if (!canvas) {
    console.error('Fingerprint canvas not found. Make sure the element with id "fingerprint-canvas" exists.');
    return;
  }
  console.log('Fingerprint canvas found:', canvas);
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
  // Make lerpColor available globally for other classes
  window.lerpColor = lerpColor;
  var blue = 0x00bfff, purple = 0x7c3aed, pink = 0xff69b4;

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
      this.maxR = Math.min(canvas.width, canvas.height) * 0.32;
      this.ridges = 15;
      this.pointsPerRidge = 50;
      this.ridgePaths = [];
    }
    generate() {
      this.ridgePaths = [];
      for (let r = 0; r < this.ridges; r++) {
        let baseOffset = (r / this.ridges) * (this.maxR - 10) + 10;
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
          if (pt.t > 0.78) fade = Math.max(0, 1.0 - (pt.t - 0.78) * 5.0);
          let dotSize = 2.1 + 1.2 * Math.sin(r + i * 0.13);
          if (this.constructor.name === 'PlainArch' || this.constructor.name.includes('PlainArchVariation') || this.constructor.name === 'TentedArch') {
            let ridgeInArch = r % this.ridges;
            let layerColor;
            if (ridgeInArch < this.ridges / 3) {
              layerColor = '#' + blue.toString(16).padStart(6, '0');
            } else if (ridgeInArch < (this.ridges * 2) / 3) {
              layerColor = '#' + purple.toString(16).padStart(6, '0');
            } else {
              layerColor = '#' + pink.toString(16).padStart(6, '0');
            }
            if (i % 2 === 0) {
              let noiseX = (Math.random() - 0.5) * 5.5;
              let noiseY = (Math.random() - 0.5) * 5.5;
              this.ctx.save();
              this.ctx.globalAlpha = 0.85 * fade;
              this.ctx.fillStyle = layerColor;
              this.ctx.beginPath();
              this.ctx.arc(pt.x + noiseX, pt.y + noiseY, dotSize, 0, Math.PI * 2);
              this.ctx.fill();
              this.ctx.restore();
            }
            continue;
          }
          this.ctx.save();
          this.ctx.globalAlpha = 0.85 * fade;
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

  // --- Animation and cycling logic ---
  let types = [];
  let currentType = 0;
  let fingerprint = null;
  let dotsDrawn = [];
  let dotsPerFrame = 10; // Increase this value for faster animation
  let animating = true;
  let patternComplete = false;
  let transitionDelay = 1800;
  
  // Create 12 plain arch variations
  let plainArchCount = 0;
  let plainArchVariations = [];
  
  // Create 12 different plain arch classes
  for (let i = 0; i < 12; i++) {
    class PlainArchVariation extends DigitalFingerprint {
      constructor(canvas, ctx) {
        super(canvas, ctx);
        this.variationIndex = i;
      }
      
      generate() {
        this.ridgePaths = [];
        // Create 5 progressively smaller arches in sequence
        console.log('Generating PlainArchVariation with', this.ridges * 5, 'ridges (5 progressively smaller arches)');
        for (let r = 0; r < this.ridges * 5; r++) {
          let path = this.generatePath(r, 0);
          console.log('Ridge', r, 'has', path.length, 'points');
          this.ridgePaths.push(path);
        }
      }
      
      generatePath(r, baseOffset) {
        let path = [];
        let points = this.pointsPerRidge;
        
        // Determine which arch this ridge belongs to (0, 1, 2, 3, or 4)
        let archIndex = Math.floor(r / this.ridges); // 0, 1, 2, 3, or 4 (progressively smaller arches)
        let ridgeIndex = (r % this.ridges) - this.ridges / 2;
        
        // Progressive size reduction: 100%, 85%, 70%, 55%, 40%
        let sizeMultiplier;
        if (archIndex === 0) sizeMultiplier = 1.0;      // Largest arch
        else if (archIndex === 1) sizeMultiplier = 0.85; // Second arch
        else if (archIndex === 2) sizeMultiplier = 0.70; // Third arch
        else if (archIndex === 3) sizeMultiplier = 0.55; // Fourth arch
        else sizeMultiplier = 0.40;                      // Smallest arch (fifth)
        
        // Adjust ridge spacing based on sub-arch size for cleaner nesting
        let baseSpacing = 2.2 + (this.variationIndex * 0.2);
        let ridgeSpacing = baseSpacing * sizeMultiplier; // Smaller arches have tighter ridge spacing
        
        // Arch dimensions - scaled to match whorl size (smaller than before)
        let archWidth = this.maxR * (1.1 + (this.variationIndex * 0.08)) * sizeMultiplier;
        let archHeight = this.maxR * (0.7 + (this.variationIndex * 0.04)) * sizeMultiplier;
        
        console.log('generatePath called for ridge', r, 'ridgeIndex:', ridgeIndex);
        
        for (let i = 0; i < points; i++) {
          // Extend the parameter range to make ridges longer while keeping arch width
          let t = (i / (points - 1)) * 1.4 - 0.2; // Extends from -0.2 to 1.2 instead of 0 to 1
          
          // Simplified dynamic width for more natural arch shape
          let dynamicWidth = archWidth + 2 * Math.sin(t * Math.PI * 2.2 + r * 0.5) + 
                            1 * Math.sin(t * Math.PI * 3.8 + r * 0.3) +
                            0.5 * Math.sin(t * Math.PI * 6.1 + r * 0.7); // Cleaner, less chaotic variations
          let x = this.cx - dynamicWidth * 0.5 + t * dynamicWidth;
          // Position arches progressively - centered as a group
          // With 5 arches (0,1,2,3,4), center the group by offsetting by -2 * 35 = -70
          let y = this.cy + (archIndex - 2) * 35; // Stack arches 35px apart, centered as group
          
          // More natural arch curve - handle extended range for longer ridges
          // Only apply arch curve in the main arch area (t between 0 and 1)
          let normalizedT = Math.max(0, Math.min(1, t)); // Clamp t to 0-1 for arch curve
          let archCurve = Math.sin(normalizedT * Math.PI) * archHeight * 0.85;
          // Simplified, more natural flow variations
          let flow = Math.sin(t * Math.PI * 1.5 + r * 0.2) * 0.15 + 
                     Math.sin(t * Math.PI * 2.8 + r * 0.4) * 0.08 +
                     Math.sin(t * Math.PI * 4.2 + r * 0.6) * 0.04;
          y -= archCurve + flow * archHeight * 0.15; // Reduced flow intensity for cleaner look
          
          // Enhanced tectonic plate layering - use normalized t for consistent perpendicular direction
          let perpX = -Math.cos(normalizedT * Math.PI) * archHeight * 1.0;
          let perpY = 1.0;
          
          // Normalize perpendicular vector
          let perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
          perpX /= perpLength;
          perpY /= perpLength;
          
          // Whorl-like complex ridge spacing with organic variations
          let dynamicSpacing = ridgeSpacing + Math.sin(t * Math.PI * 2.1 + r * 0.4) * 0.6 +
                               Math.sin(t * Math.PI * 4.3 + r * 0.6) * 0.3 +
                               Math.sin(t * Math.PI * 6.5 + r * 0.8) * 0.15 +
                               Math.sin(t * Math.PI * 9.2 + r * 0.3) * 0.08 +
                               Math.sin(t * Math.PI * 13.1 + r * 0.7) * 0.04;
          
          // Layer each ridge with stable spacing - like tectonic plates
          x += ridgeIndex * dynamicSpacing * perpX;
          y += ridgeIndex * dynamicSpacing * perpY;
          
          console.log('Ridge', r, 'point:', x, y, 'ridgeIndex:', ridgeIndex);
          
          path.push({x, y, t});
        }
        return path;
      }
    }
    plainArchVariations.push(PlainArchVariation);
  }

  function initializeTypes() {
    // Wait for all fingerprint classes to be available
    if (!window.Whorl || !window.RadialLoop || !window.PlainArch || !window.TentedArch || !window.DoubleLoop) {
      console.log('Waiting for fingerprint classes to load...', {
        Whorl: !!window.Whorl,
        RadialLoop: !!window.RadialLoop,
        PlainArch: !!window.PlainArch,
        TentedArch: !!window.TentedArch,
        DoubleLoop: !!window.DoubleLoop
      });
      setTimeout(initializeTypes, 100);
      return false;
    }
    
    console.log('All fingerprint classes loaded successfully:', {
      Whorl: window.Whorl,
      RadialLoop: window.RadialLoop,
      PlainArch: window.PlainArch,
      TentedArch: window.TentedArch,
      DoubleLoop: window.DoubleLoop
    });
    
    types = [window.Whorl, window.RadialLoop, window.PlainArch, window.TentedArch, window.DoubleLoop];
    return true;
  }

  function generateFingerprint() {
    // Ensure types are initialized
    if (!initializeTypes()) {
      return;
    }
    
    console.log('Generating fingerprint, currentType:', currentType, 'types array:', types);
    
    try {
      // Show 12 plain arch variations in sequence
      if (currentType === 2) { // PlainArch index
        plainArchCount = (plainArchCount + 1) % 12; // Cycle through 12 variations
        console.log('Creating PlainArchVariation', plainArchCount, 'from array:', plainArchVariations);
        fingerprint = new plainArchVariations[plainArchCount](canvas, ctx);
        console.log('Using PlainArchVariation', plainArchCount);
      } else {
        console.log('Creating fingerprint of type:', types[currentType], 'at index', currentType);
        fingerprint = new types[currentType](canvas, ctx);
        console.log('Using', types[currentType].name, 'at index', currentType);
      }
    } catch (error) {
      console.error('Error creating fingerprint:', error);
      return;
    }
    
    // Set density for double loop
    if (fingerprint instanceof window.DoubleLoop) {
      console.log('DoubleLoop detected! Setting density...');
      fingerprint.ridges = 15;
      fingerprint.pointsPerRidge = 120; // keep S-curve at 100%
    } else if (fingerprint instanceof window.RadialLoop) {
      fingerprint.ridges = 15; // Same as whorl for proper aeration
      fingerprint.pointsPerRidge = 50; // Same as whorl for proper spacing
    } else {
      fingerprint.ridges = 15;
      fingerprint.pointsPerRidge = 50;
    }
    if (!fingerprint) {
      console.error('Failed to create fingerprint instance');
      return;
    }
    
    fingerprint.generate();
    
    // Initialize dotsDrawn for all fingerprint types
    if (fingerprint instanceof window.PlainArch || fingerprint.constructor.name.includes('PlainArchVariation')) {
      console.log('Creating PlainArch with 5x ridges');
      dotsDrawn = new Array(fingerprint.ridges * 5).fill(0);
      console.log('dotsDrawn array length:', dotsDrawn.length);
    } else if (fingerprint instanceof window.TentedArch) {
      console.log('Creating TentedArch with 3x ridges');
      dotsDrawn = new Array(fingerprint.ridges * 3).fill(0);
      console.log('dotsDrawn array length:', dotsDrawn.length);
    } else {
      // Default initialization for other fingerprint types
      dotsDrawn = new Array(fingerprint.ridges).fill(0);
      console.log('Creating', fingerprint.constructor.name, 'with', fingerprint.ridges, 'ridges');
      console.log('dotsDrawn array length:', dotsDrawn.length);
    }
  }

  function drawFingerprint() {
    if (!fingerprint) {
      console.error('No fingerprint instance available for drawing');
      return;
    }
    if (!fingerprint.ridgePaths || !Array.isArray(fingerprint.ridgePaths)) {
      console.error('Fingerprint ridgePaths is not available or not an array');
      return;
    }
    if (!dotsDrawn || !Array.isArray(dotsDrawn)) {
      console.error('dotsDrawn is not available or not an array');
      return;
    }
    
    let stillDrawing = false;
    try {
      fingerprint.draw(dotsDrawn, dotsPerFrame);
      for (let r = 0; r < fingerprint.ridgePaths.length; r++) {
        if (dotsDrawn[r] < fingerprint.ridgePaths[r].length) stillDrawing = true;
      }
    } catch (error) {
      console.error('Error during fingerprint drawing:', error);
      return;
    }
    if (!stillDrawing && !patternComplete) {
      patternComplete = true;
      setTimeout(() => {
        currentType = (currentType + 1) % types.length;
        generateFingerprint();
        patternComplete = false;
        requestAnimationFrame(drawFingerprint);
      }, transitionDelay);
    } else if (!patternComplete) {
      requestAnimationFrame(drawFingerprint);
    }
  }

  function restart() {
    generateFingerprint();
    patternComplete = false;
    animating = true;
    requestAnimationFrame(drawFingerprint);
  }
  window.addEventListener('resize', restart);
  // Wait for DOM to be ready before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM Content Loaded - initializing fingerprints');
      // Add a small delay to ensure all scripts are loaded
      setTimeout(function() {
        console.log('Starting fingerprint initialization after delay');
        try {
          generateFingerprint();
          requestAnimationFrame(drawFingerprint);
        } catch (error) {
          console.error('Error during fingerprint initialization:', error);
        }
      }, 100);
    });
  } else {
    console.log('DOM already loaded - initializing fingerprints immediately');
    // Add a small delay to ensure all scripts are loaded
    setTimeout(function() {
      console.log('Starting fingerprint initialization after delay');
      try {
        generateFingerprint();
        requestAnimationFrame(drawFingerprint);
      } catch (error) {
        console.error('Error during fingerprint initialization:', error);
      }
    }, 100);
  }
  
  console.log('Fingerprint script loaded successfully');
})(); 