// Digital Fingerprint Effect with Multiple Patterns (ES6 Class Refactor)
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

  // --- Base Class ---
  class DigitalFingerprint {
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
          let color = pt.t < 0.5 ? lerpColor(blue, purple, pt.t * 2) : lerpColor(purple, pink, (pt.t - 0.5) * 2);
          let fade = 1.0;
          if (pt.t > 0.85) fade = Math.max(0, 1.0 - (pt.t - 0.85) * 4.5);
          this.ctx.save();
          this.ctx.globalAlpha = 0.85 * fade;
          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 2.1 + 1.2 * Math.sin(r + i * 0.13), 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
        if (maxDots < path.length) {
          dotsDrawn[r] = maxDots + dotsPerFrame;
        }
      }
    }
  }

  // --- Subclasses for each fingerprint type ---
  class Whorl extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let spiralTurns = 2.2 + 2.5 * (r / this.ridges);
      for (let i = 0; i < this.pointsPerRidge * spiralTurns; i++) {
        let t = i / (this.pointsPerRidge * spiralTurns);
        let theta = t * Math.PI * 2 * spiralTurns;
        let flow = Math.sin(theta * 1.2 + r * 0.18) * 0.18 + Math.sin(theta * 3.1 + r * 0.5) * 0.07;
        let rr = baseOffset + 13 * t + 2 * Math.sin(theta * 2.5 + r * 0.7);
        let x = this.cx + rr * Math.cos(theta + flow) * 0.7;
        let y = this.cy + rr * Math.sin(theta + flow) * 1.15;
        path.push({x, y, t});
      }
      return path;
    }
  }

  class Loop extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      // Parameters for a realistic loop
      let loopWidth = this.maxR * 1.15;
      let loopHeight = this.maxR * 0.85;
      let coreX = this.cx - loopWidth * 0.35; // More offset for realism
      let coreY = this.cy + loopHeight * 0.08;
      let ridgeOffset = (r - this.ridges / 2) * 8.5; // Slightly more spread
      for (let i = 0; i < this.pointsPerRidge; i++) {
        let t = i / (this.pointsPerRidge - 1);
        // Use a non-semicircular arc, more open at the top
        let angle = Math.PI * (0.78 * t + 0.13);
        let x = coreX + Math.cos(angle) * (loopWidth * (0.68 - 0.18 * t));
        let y = coreY + Math.sin(angle) * (loopHeight * (1.0 - 0.38 * t)) + ridgeOffset;
        // Add a pronounced hook at the end
        if (t > 0.72) {
          x += 18 * (t - 0.72);
          y -= 10 * (t - 0.72);
        }
        // Add a subtle delta at the start
        if (t < 0.12) {
          y += 12 * (0.12 - t);
        }
        // Add noise for realism
        y += Math.sin(t * Math.PI * 2 + r * 0.19) * 1.5;
        x += Math.sin(t * Math.PI + r * 0.13) * 0.7;
        path.push({x, y, t});
      }
      return path;
    }
  }

  class Arch extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let archRadius = this.maxR * 0.9 - r * (this.maxR * 0.035);
      let centerY = this.cy + this.maxR * 0.7;
      let sweep = Math.PI * 0.95;
      let ridgeOffset = (r - this.ridges / 2) * 2.2;
      for (let i = 0; i < this.pointsPerRidge; i++) {
        let t = i / (this.pointsPerRidge - 1);
        let theta = Math.PI + sweep * (t - 0.5);
        let x = this.cx + archRadius * Math.cos(theta);
        let y = centerY + archRadius * Math.sin(theta) + ridgeOffset;
        y += Math.sin(t * Math.PI * 2 + r * 0.18) * 0.6;
        path.push({ x, y, t });
      }
      return path;
    }
  }

  class TentedArch extends DigitalFingerprint {
    generatePath(r, baseOffset) {
      let path = [];
      let archRadius = this.maxR * 0.9 - r * (this.maxR * 0.035);
      let centerY = this.cy + this.maxR * 0.7;
      let sweep = Math.PI * 0.95;
      let ridgeOffset = (r - this.ridges / 2) * 2.2;
      for (let i = 0; i < this.pointsPerRidge; i++) {
        let t = i / (this.pointsPerRidge - 1);
        let theta = Math.PI + sweep * (t - 0.5);
        let x = this.cx + archRadius * Math.cos(theta);
        let y = centerY + archRadius * Math.sin(theta) + ridgeOffset;
        if (t > 0.45 && t < 0.55) {
          y -= Math.sin((t - 0.5) * Math.PI * 10) * 20;
        }
        y += Math.sin(t * Math.PI * 2 + r * 0.18) * 0.6;
        path.push({ x, y, t });
      }
      return path;
    }
  }

  class DoubleLoop extends DigitalFingerprint {
    generate() {
      this.ridgePaths = [];
    
    // Generate multiple parallel ridges that follow the same S-curve spine
    for (let r = 0; r < this.ridges; r++) {
      let ridgeOffset = (r - this.ridges / 2) * 4; // Tighter spacing for more ridges
      this.ridgePaths.push(this.generatePath(r, ridgeOffset));
    }
  }
    
    draw(dotsDrawn, dotsPerFrame) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let r = 0; r < this.ridgePaths.length; r++) {
        let path = this.ridgePaths[r];
        let maxDots = dotsDrawn[r] || 0;
        
        // Use ridge-based colors like the whorl
        let ridgeColor = r < this.ridges / 2 ? 
          lerpColor(blue, purple, r / (this.ridges / 2)) : 
          lerpColor(purple, pink, (r - this.ridges / 2) / (this.ridges / 2));
        
                  for (let i = 0; i < maxDots && i < path.length; i++) {
            let pt = path[i];
            let fade = 1.0;
            if (pt.t > 0.85) fade = Math.max(0, 1.0 - (pt.t - 0.85) * 4.5);
            this.ctx.save();
            this.ctx.globalAlpha = 0.85 * fade;
            this.ctx.fillStyle = ridgeColor;
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, 2.1 + 1.2 * Math.sin(r + i * 0.13), 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
          }
        if (maxDots < path.length) {
          dotsDrawn[r] = maxDots + dotsPerFrame;
        }
      }
    }
    
    generatePath(r, ridgeOffset) {
      let path = [];
      let points = this.pointsPerRidge;
      let loopWidth = this.maxR * 1.25;
      let loopHeight = this.maxR * 1.05;
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // Create the true double loop structure - two separate loop systems
        let x, y;
        
        if (t < 0.5) {
          // Left loop system - curves inward from left side with natural flow
          let loopT = t * 2; // 0 to 1 for left loop
          
          // Use even smoother curve interpolation
          let smoothT = loopT * loopT * loopT * (10 - 15 * loopT + 6 * loopT * loopT); // Smootherstep function
          
          // Balanced core structure - left core
          let startX = this.cx - loopWidth * 0.6;
          let startY = this.cy + loopHeight * 0.42;
          let endX = this.cx; // Meet in the center
          let endY = this.cy;
          
          // Create the natural inward curve with enhanced smoothness
          x = startX + (endX - startX) * smoothT;
          y = startY + (endY - startY) * smoothT;
          
          // Core flow enhancement - stronger curve near the core
          let coreFlow = Math.sin(loopT * Math.PI) * 0.2;
          x += coreFlow * loopWidth * 0.15;
          y += coreFlow * loopHeight * 0.12;
          
          // Micro-curves within the arches for detail
          let microCurve = Math.sin(loopT * Math.PI * 3) * 0.08;
          x += microCurve * loopWidth * 0.1;
          y += microCurve * loopHeight * 0.08;
          
          // Remove arc curvature to eliminate fish tail effect
          
          // Natural edge termination - no fish tail
          // Let the ridges naturally end without position adjustments
          
          // Enhanced S-curve with layered ridge stacking
          if (loopT > 0.3 && loopT < 0.9) {
            let sCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6) * 0.8;
            // Primary S-curve movement
            x += sCurve * loopWidth * 0.45;
            y += sCurve * loopHeight * 0.4;
            
            // Secondary echo curve for ridge layering
            let echoCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6 + Math.PI * 0.3) * 0.4;
            x += echoCurve * loopWidth * 0.2;
            y += echoCurve * loopHeight * 0.15;
            
            // Minimal ridge variation for cleaner parallelism
            let ridgeVariation = Math.sin(r * 0.2 + loopT * Math.PI * 1.0) * 0.03;
            x += ridgeVariation * loopWidth * 0.05;
            y += ridgeVariation * loopHeight * 0.04;
          }
        } else {
          // Right loop system - curves inward from right side with natural flow
          let loopT = (t - 0.5) * 2; // 0 to 1 for right loop
          
          // Use even smoother curve interpolation
          let smoothT = loopT * loopT * loopT * (10 - 15 * loopT + 6 * loopT * loopT); // Smootherstep function
          
          // Balanced core structure - right core
          let startX = this.cx + loopWidth * 0.6;
          let startY = this.cy - loopHeight * 0.42;
          let endX = this.cx; // Meet in the center
          let endY = this.cy;
          
          // Create the natural inward curve with enhanced smoothness
          x = startX + (endX - startX) * smoothT;
          y = startY + (endY - startY) * smoothT;
          
          // Core flow enhancement - stronger curve near the core
          let coreFlow = Math.sin(loopT * Math.PI) * 0.2;
          x -= coreFlow * loopWidth * 0.15;
          y -= coreFlow * loopHeight * 0.12;
          
          // Micro-curves within the arches for detail
          let microCurve = Math.sin(loopT * Math.PI * 3) * 0.08;
          x -= microCurve * loopWidth * 0.1;
          y -= microCurve * loopHeight * 0.08;
          
          // Remove arc curvature to eliminate fish tail effect
          
          // Natural edge termination - no fish tail
          // Let the ridges naturally end without position adjustments
          
          // Enhanced S-curve with layered ridge stacking
          if (loopT > 0.3 && loopT < 0.9) {
            let sCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6) * 0.8;
            // Primary S-curve movement
            x -= sCurve * loopWidth * 0.45;
            y -= sCurve * loopHeight * 0.4;
            
            // Secondary echo curve for ridge layering
            let echoCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6 + Math.PI * 0.3) * 0.4;
            x -= echoCurve * loopWidth * 0.2;
            y -= echoCurve * loopHeight * 0.15;
            
            // Minimal ridge variation for cleaner parallelism
            let ridgeVariation = Math.sin(r * 0.2 + loopT * Math.PI * 1.0) * 0.03;
            x -= ridgeVariation * loopWidth * 0.05;
            y -= ridgeVariation * loopHeight * 0.04;
          }
        }
        
        // Add ridge offset for parallel ridges - more distinct spacing
        let ridgeSpacing = 6;
        let ridgeIndex = r - this.ridges / 2;
        x += ridgeIndex * ridgeSpacing * 0.8;
        y += ridgeIndex * ridgeSpacing * 0.6;
        
        // Apply whorl-style texture with layered sine waves
        let flowX = Math.sin(t * Math.PI * 1.2 + r * 0.18) * 0.18 + Math.sin(t * Math.PI * 3.1 + r * 0.5) * 0.07;
        let flowY = Math.sin(t * Math.PI * 1.5 + r * 0.22) * 0.15 + Math.sin(t * Math.PI * 2.8 + r * 0.4) * 0.09;
        
        x += flowX * loopWidth * 0.3;
        y += flowY * loopHeight * 0.25;
        
        // Rotate the entire pattern for better balance
        let rotationAngle = -Math.PI / 2.2; // Slightly less than 90 degrees for better balance
        let centerX = this.cx;
        let centerY = this.cy;
        let rotatedX = centerX + (x - centerX) * Math.cos(rotationAngle) - (y - centerY) * Math.sin(rotationAngle);
        let rotatedY = centerY + (x - centerX) * Math.sin(rotationAngle) + (y - centerY) * Math.cos(rotationAngle);
        
        path.push({ x: rotatedX, y: rotatedY, t });
      }
      
      return path;
    }
  }

  // --- Animation and cycling logic ---
  const types = [Whorl, Loop, Arch, TentedArch, DoubleLoop];
  let currentType = 0;
  let fingerprint = null;
  let dotsDrawn = [];
  let dotsPerFrame = 10; // Increase this value for faster animation
  let animating = true;
  let patternComplete = false;
  let transitionDelay = 1800;

  function generateFingerprint() {
    fingerprint = new types[currentType](canvas, ctx);
    // Set density for double loop
    if (fingerprint instanceof DoubleLoop) {
      fingerprint.ridges = 15;
      fingerprint.pointsPerRidge = 120;
    } else if (fingerprint instanceof Loop) {
      fingerprint.ridges = 35; // Keep more layers
      fingerprint.pointsPerRidge = 120; // Increased for denser, smoother ridges
    } else {
      fingerprint.ridges = 15;
      fingerprint.pointsPerRidge = 50;
    }
    fingerprint.generate();
    dotsDrawn = [];
  }

  function drawFingerprint() {
    fingerprint.draw(dotsDrawn, dotsPerFrame);
    let stillDrawing = false;
    for (let r = 0; r < fingerprint.ridgePaths.length; r++) {
      if (dotsDrawn[r] < fingerprint.ridgePaths[r].length) stillDrawing = true;
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
  generateFingerprint();
  requestAnimationFrame(drawFingerprint);
})(); 