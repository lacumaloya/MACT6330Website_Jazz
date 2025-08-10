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

  // Deterministic hash-based noise for stable per-dot variation (no flicker)
  function hash2D(a, b) {
    const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
    return s - Math.floor(s); // 0..1
  }

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
      console.log('Drawing', this.ridgePaths.length, 'ridges');
      for (let r = 0; r < this.ridgePaths.length; r++) {
        let path = this.ridgePaths[r];
        let maxDots = dotsDrawn[r] || 0;
        console.log('Ridge', r, 'drawing', maxDots, 'dots out of', path.length, 'archIndex:', Math.floor(r / this.ridges));
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

  class RadialLoop extends DigitalFingerprint {
    generate() {
      this.ridgePaths = [];
      for (let r = 0; r < this.ridges; r++) {
        this.ridgePaths.push(this.generatePath(r, 0));
      }
    }
    
    generatePath(r, baseOffset) {
      let path = [];
      let loopTurns = 1.0 + 0.3 * (r / this.ridges); // Varies by ridge like whorl
      
      for (let i = 0; i < this.pointsPerRidge * loopTurns; i++) {
        let t = i / (this.pointsPerRidge * loopTurns);
        let theta = t * Math.PI * 2 * loopTurns;
        
        // Layered sine waves for natural flow - like whorl genius!
        let flow = Math.sin(theta * 1.4 + r * 0.15) * 0.22 + Math.sin(theta * 2.8 + r * 0.4) * 0.08;
        
        // Dynamic radius with natural variation
        let rr = baseOffset + this.maxR * 0.4 + 8 * Math.sin(theta * 1.8 + r * 0.6);
        
        // Core position - upper-left of the loop
        let coreX = this.cx - this.maxR * 0.2;
        let coreY = this.cy - this.maxR * 0.25;
        
        // Create loop structure: right → around core → right
        let x = coreX + rr * Math.cos(theta + flow) * 0.6; // Stronger curve - reduced from 0.8
        let y = coreY + rr * Math.sin(theta + flow) * 1.5; // Stronger curve - increased from 1.2
        
        // Adaptive ridge spacing - tighter around core, spaced in broader areas
        let ridgeSpacing = 2.5; // Base spacing
        let ridgeIndex = r - this.ridges / 2;
        
        // Calculate distance from core to determine spacing
        let distanceFromCore = Math.sqrt((x - coreX) * (x - coreX) + (y - coreY) * (y - coreY));
        let coreDistance = this.maxR * 0.15; // Core radius
        
        // Adjust spacing based on position - tighter near core, spaced in broader areas
        let spacingMultiplier = 1.0;
        if (distanceFromCore < coreDistance * 2) {
          // Near core - tighter spacing
          spacingMultiplier = 0.6 + 0.4 * (distanceFromCore / (coreDistance * 2));
        } else {
          // Broader areas - more spaced
          spacingMultiplier = 1.0 + 0.5 * ((distanceFromCore - coreDistance * 2) / (this.maxR * 0.3));
        }
        
        // Apply perpendicular offset with adaptive spacing
        let tangentX = -Math.sin(theta + flow);
        let tangentY = Math.cos(theta + flow);
        x += ridgeIndex * ridgeSpacing * spacingMultiplier * tangentY;
        y -= ridgeIndex * ridgeSpacing * spacingMultiplier * tangentX;
        
        // Core enhancement - tighter curves near core
        if (theta > Math.PI * 0.8 && theta < Math.PI * 2.2) {
          let coreIntensity = Math.sin((theta - Math.PI * 0.8) / (Math.PI * 1.4)) * 0.4;
          let coreRadius = this.maxR * 0.15;
          x = coreX + coreRadius * Math.cos(theta + flow) + (x - coreX) * (1 - coreIntensity * 0.6);
          y = coreY + coreRadius * Math.sin(theta + flow) + (y - coreY) * (1 - coreIntensity * 0.6);
        }
        
        // Tilt the loop anatomically to the right
        let tiltAngle = Math.PI / 6; // 30 degrees clockwise
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({x: tiltedX, y: tiltedY, t});
        
        // Add inner fractal loop - smaller version inside
        if (r < this.ridges / 3) { // Only for inner ridges
          let innerScale = 0.925; // Half size larger
          let innerCoreX = coreX + this.maxR * 0.05;
          let innerCoreY = coreY + this.maxR * 0.02;
          
          // Inner loop with same structure but scaled down
          let innerX = innerCoreX + (rr * innerScale) * Math.cos(theta + flow) * 0.6;
          let innerY = innerCoreY + (rr * innerScale) * Math.sin(theta + flow) * 1.5;
          
          // Apply same adaptive spacing to inner loop
          let innerDistanceFromCore = Math.sqrt((innerX - innerCoreX) * (innerX - innerCoreX) + (innerY - innerCoreY) * (innerY - innerCoreY));
          let innerCoreDistance = this.maxR * 0.06; // Smaller core
          
          let innerSpacingMultiplier = 1.0;
          if (innerDistanceFromCore < innerCoreDistance * 2) {
            innerSpacingMultiplier = 0.6 + 0.4 * (innerDistanceFromCore / (innerCoreDistance * 2));
          } else {
            innerSpacingMultiplier = 1.0 + 0.5 * ((innerDistanceFromCore - innerCoreDistance * 2) / (this.maxR * 0.12));
          }
          
          // Apply perpendicular offset to inner loop
          let innerTangentX = -Math.sin(theta + flow);
          let innerTangentY = Math.cos(theta + flow);
          innerX += ridgeIndex * 1.5 * innerSpacingMultiplier * innerTangentY;
          innerY -= ridgeIndex * 1.5 * innerSpacingMultiplier * innerTangentX;
          
          // Core enhancement for inner loop
          if (theta > Math.PI * 0.8 && theta < Math.PI * 2.2) {
            let innerCoreIntensity = Math.sin((theta - Math.PI * 0.8) / (Math.PI * 1.4)) * 0.4;
            let innerCoreRadius = this.maxR * 0.06;
            innerX = innerCoreX + innerCoreRadius * Math.cos(theta + flow) + (innerX - innerCoreX) * (1 - innerCoreIntensity * 0.6);
            innerY = innerCoreY + innerCoreRadius * Math.sin(theta + flow) + (innerY - innerCoreY) * (1 - innerCoreIntensity * 0.6);
          }
          
          // Tilt inner loop the same way
          let innerTiltedX = centerX + (innerX - centerX) * Math.cos(tiltAngle) - (innerY - centerY) * Math.sin(tiltAngle);
          let innerTiltedY = centerY + (innerX - centerX) * Math.sin(tiltAngle) + (innerY - centerY) * Math.cos(tiltAngle);
          
          path.push({x: innerTiltedX, y: innerTiltedY, t});
          
          // Add third fractal loop - even smaller version inside the inner loop
          if (r < this.ridges / 6) { // Only for innermost ridges
            let thirdScale = 0.7; // Smaller than inner loop
            let thirdCoreX = innerCoreX + this.maxR * 0.02;
            let thirdCoreY = innerCoreY + this.maxR * 0.01;
            
            // Third loop with same structure but scaled down further
            let thirdX = thirdCoreX + (rr * thirdScale) * Math.cos(theta + flow) * 0.6;
            let thirdY = thirdCoreY + (rr * thirdScale) * Math.sin(theta + flow) * 1.5;
            
            // Apply same adaptive spacing to third loop
            let thirdDistanceFromCore = Math.sqrt((thirdX - thirdCoreX) * (thirdX - thirdCoreX) + (thirdY - thirdCoreY) * (thirdY - thirdCoreY));
            let thirdCoreDistance = this.maxR * 0.03; // Even smaller core
            
            let thirdSpacingMultiplier = 1.0;
            if (thirdDistanceFromCore < thirdCoreDistance * 2) {
              thirdSpacingMultiplier = 0.6 + 0.4 * (thirdDistanceFromCore / (thirdCoreDistance * 2));
            } else {
              thirdSpacingMultiplier = 1.0 + 0.5 * ((thirdDistanceFromCore - thirdCoreDistance * 2) / (this.maxR * 0.06));
            }
            
            // Apply perpendicular offset to third loop
            let thirdTangentX = -Math.sin(theta + flow);
            let thirdTangentY = Math.cos(theta + flow);
            thirdX += ridgeIndex * 1.0 * thirdSpacingMultiplier * thirdTangentY;
            thirdY -= ridgeIndex * 1.0 * thirdSpacingMultiplier * thirdTangentX;
            
            // Core enhancement for third loop
            if (theta > Math.PI * 0.8 && theta < Math.PI * 2.2) {
              let thirdCoreIntensity = Math.sin((theta - Math.PI * 0.8) / (Math.PI * 1.4)) * 0.4;
              let thirdCoreRadius = this.maxR * 0.03;
              thirdX = thirdCoreX + thirdCoreRadius * Math.cos(theta + flow) + (thirdX - thirdCoreX) * (1 - thirdCoreIntensity * 0.6);
              thirdY = thirdCoreY + thirdCoreRadius * Math.sin(theta + flow) + (thirdY - thirdCoreY) * (1 - thirdCoreIntensity * 0.6);
            }
            
            // Tilt third loop the same way
            let thirdTiltedX = centerX + (thirdX - centerX) * Math.cos(tiltAngle) - (thirdY - centerY) * Math.sin(tiltAngle);
            let thirdTiltedY = centerY + (thirdX - centerX) * Math.sin(tiltAngle) + (thirdY - centerY) * Math.cos(tiltAngle);
            
            path.push({x: thirdTiltedX, y: thirdTiltedY, t});
            
            // Add fourth fractal loop - smallest version inside the third loop
            if (r < this.ridges / 12) { // Only for the very innermost ridges
              let fourthScale = 0.6; // Even smaller than third loop
              let fourthCoreX = thirdCoreX + this.maxR * 0.01;
              let fourthCoreY = thirdCoreY + this.maxR * 0.005;
              
              // Fourth loop with same structure but scaled down further
              let fourthX = fourthCoreX + (rr * fourthScale) * Math.cos(theta + flow) * 0.6;
              let fourthY = fourthCoreY + (rr * fourthScale) * Math.sin(theta + flow) * 1.5;
              
              // Apply same adaptive spacing to fourth loop
              let fourthDistanceFromCore = Math.sqrt((fourthX - fourthCoreX) * (fourthX - fourthCoreX) + (fourthY - fourthCoreY) * (fourthY - fourthCoreY));
              let fourthCoreDistance = this.maxR * 0.015; // Even smaller core
              
              let fourthSpacingMultiplier = 1.0;
              if (fourthDistanceFromCore < fourthCoreDistance * 2) {
                fourthSpacingMultiplier = 0.6 + 0.4 * (fourthDistanceFromCore / (fourthCoreDistance * 2));
              } else {
                fourthSpacingMultiplier = 1.0 + 0.5 * ((fourthDistanceFromCore - fourthCoreDistance * 2) / (this.maxR * 0.03));
              }
              
              // Apply perpendicular offset to fourth loop
              let fourthTangentX = -Math.sin(theta + flow);
              let fourthTangentY = Math.cos(theta + flow);
              fourthX += ridgeIndex * 0.8 * fourthSpacingMultiplier * fourthTangentY;
              fourthY -= ridgeIndex * 0.8 * fourthSpacingMultiplier * fourthTangentX;
              
              // Core enhancement for fourth loop
              if (theta > Math.PI * 0.8 && theta < Math.PI * 2.2) {
                let fourthCoreIntensity = Math.sin((theta - Math.PI * 0.8) / (Math.PI * 1.4)) * 0.4;
                let fourthCoreRadius = this.maxR * 0.015;
                fourthX = fourthCoreX + fourthCoreRadius * Math.cos(theta + flow) + (fourthX - fourthCoreX) * (1 - fourthCoreIntensity * 0.6);
                fourthY = fourthCoreY + fourthCoreRadius * Math.sin(theta + flow) + (fourthY - fourthCoreY) * (1 - fourthCoreIntensity * 0.6);
              }
              
              // Tilt fourth loop the same way
              let fourthTiltedX = centerX + (fourthX - centerX) * Math.cos(tiltAngle) - (fourthY - centerY) * Math.sin(tiltAngle);
              let fourthTiltedY = centerY + (fourthX - centerX) * Math.sin(tiltAngle) + (fourthY - centerY) * Math.cos(tiltAngle);
              
              path.push({x: fourthTiltedX, y: fourthTiltedY, t});
            }
          }
        }
        
        // Add terminal trails that wrap around the loop - looser coverage
        if (r < this.ridges * 0.6 && theta > Math.PI * 1.2 && theta < Math.PI * 1.9) { // Looser range
          let trailT = (theta - Math.PI * 1.2) / (Math.PI * 0.7); // 0 to 1 progression over reduced range
          
          // Create 2-3 trails with rounded/curved paths
          for (let trailIndex = 0; trailIndex < 2; trailIndex++) {
            let trailOffset = trailIndex * Math.PI * 0.08; // Slightly smaller spread
            let baseTrailAngle = theta + Math.PI * 0.5 + trailOffset; // Perpendicular outward from the loop
            let trailLength = this.maxR * (0.4 + trailIndex * 0.1) * (1 + trailT * 0.4); // Longer trails while staying close to loop
            
            // Add curvature to make trails rounded
            let curvature = Math.sin(trailT * Math.PI) * this.maxR * 0.1; // Progressive curve
            let curveDirection = baseTrailAngle + Math.PI * 0.5; // Perpendicular for curve
            
            let trailX = x + trailLength * Math.cos(baseTrailAngle);
            let trailY = y + trailLength * Math.sin(baseTrailAngle);
            
            // Apply the rounding/curvature
            trailX += curvature * Math.cos(curveDirection);
            trailY += curvature * Math.sin(curveDirection);
            
            // Apply tilt
            let trailTiltedX = centerX + (trailX - centerX) * Math.cos(tiltAngle) - (trailY - centerY) * Math.sin(tiltAngle);
            let trailTiltedY = centerY + (trailX - centerX) * Math.sin(tiltAngle) + (trailY - centerY) * Math.cos(tiltAngle);
            
            path.push({x: trailTiltedX, y: trailTiltedY, t: 0.85 + trailT * 0.15});
          }
        }
        
        // Add terminal trails on the right side - mirroring the left side
        if (r < this.ridges * 0.6 && theta > Math.PI * 0.1 && theta < Math.PI * 0.8) { // Right side range
          let trailT = (theta - Math.PI * 0.1) / (Math.PI * 0.7); // 0 to 1 progression
          
          // Create 2-3 trails with rounded/curved paths for right side
          for (let trailIndex = 0; trailIndex < 2; trailIndex++) {
            let trailOffset = trailIndex * Math.PI * 0.08; // Slightly smaller spread
            let baseTrailAngle = theta + Math.PI * 0.5 + trailOffset; // Perpendicular outward from the loop
            let trailLength = this.maxR * (0.4 + trailIndex * 0.1) * (1 + trailT * 0.4); // Same length as left side
            
            // Add curvature to make trails rounded
            let curvature = Math.sin(trailT * Math.PI) * this.maxR * 0.1; // Progressive curve
            let curveDirection = baseTrailAngle + Math.PI * 0.5; // Perpendicular for curve
            
            let trailX = x + trailLength * Math.cos(baseTrailAngle);
            let trailY = y + trailLength * Math.sin(baseTrailAngle);
            
            // Apply the rounding/curvature
            trailX += curvature * Math.cos(curveDirection);
            trailY += curvature * Math.sin(curveDirection);
            
            // Apply tilt
            let trailTiltedX = centerX + (trailX - centerX) * Math.cos(tiltAngle) - (trailY - centerY) * Math.sin(tiltAngle);
            let trailTiltedY = centerY + (trailX - centerX) * Math.sin(tiltAngle) + (trailY - centerY) * Math.cos(tiltAngle);
            
            path.push({x: trailTiltedX, y: trailTiltedY, t: 0.85 + trailT * 0.15});
          }
        }

      }
      return path;
    }
  }

  class PlainArch extends DigitalFingerprint {
    generate() {
      this.ridgePaths = [];
      // Create double the ridges for two arches
      console.log('Generating PlainArch with', this.ridges * 2, 'ridges');
      for (let r = 0; r < this.ridges * 2; r++) {
        let path = this.generatePath(r, 0);
        console.log('Ridge', r, 'has', path.length, 'points, archIndex:', Math.floor(r / this.ridges));
        this.ridgePaths.push(path);
      }
    }
    
    generatePath(r, baseOffset) {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Determine which arch this ridge belongs to
      let archIndex = Math.floor(r / this.ridges);
      let ridgeIndex = (r % this.ridges) - this.ridges / 2;
      let ridgeSpacing = 1.8; // Tighter spacing for layered effect
      
      console.log('generatePath called for ridge', r, 'archIndex:', archIndex, 'ridgeIndex:', ridgeIndex);
        
      // Arch dimensions - make second arch much larger and more obvious
      let archWidth = this.maxR * (1.4 + archIndex * 0.3);
      let archHeight = this.maxR * (0.9 + archIndex * 0.2);
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Base arch curve
        let x = this.cx - archWidth * 0.5 + t * archWidth;
        let y = this.cy + archHeight * (0.3 + archIndex * 0.4); // Much closer positioning
        
        // Arch curve - smooth rise and fall
        let archCurve = Math.sin(t * Math.PI) * archHeight * 0.7;
        y -= archCurve;
        
        // Simple tectonic plate layering - just move each line over the next
        // Each ridge is offset perpendicular to the arch curve
        let perpX = -Math.cos(t * Math.PI) * archHeight * 1.0;
        let perpY = 1.0;
        
        // Normalize perpendicular vector
        let perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        perpX /= perpLength;
        perpY /= perpLength;
        
        // Layer each ridge directly on top of the next - like tectonic plates
        x += ridgeIndex * ridgeSpacing * perpX;
        y += ridgeIndex * ridgeSpacing * perpY;
        
        // Add some debugging - make second arch more obvious
        if (archIndex === 1) {
          x += 50; // Move second arch to the right
          console.log('Second arch point:', x, y, 'ridgeIndex:', ridgeIndex);
        } else {
          console.log('First arch point:', x, y, 'ridgeIndex:', ridgeIndex);
        }
        
        path.push({x, y, t});
      }
      return path;
    }
  }

  class TentedArch extends DigitalFingerprint {
    generate() {
      this.ridgePaths = [];
      // Create 3 progressively smaller tented arches in sequence
      console.log('Generating TentedArch with', this.ridges * 3, 'ridges (3 progressively smaller tented arches)');
      for (let r = 0; r < this.ridges * 3; r++) {
        let path = this.generatePath(r, 0);
        console.log('Ridge', r, 'has', path.length, 'points');
        this.ridgePaths.push(path);
      }
      
      // Add multiple parallel ridges for the first curve to give it more girth
      for (let ridgeIndex = 0; ridgeIndex < 3; ridgeIndex++) {
        let underCurve = this.generateUnderCurve(ridgeIndex);
        this.ridgePaths.push(underCurve);
      }
      // Add multiple parallel ridges for the second curve to match the first curve's thickness
      for (let ridgeIndex = 0; ridgeIndex < 3; ridgeIndex++) {
        let underCurve2 = this.generateUnderCurve2(ridgeIndex);
        this.ridgePaths.push(underCurve2);
      }
      let underCurve3 = this.generateUnderCurve3();
      this.ridgePaths.push(underCurve3);
      let underCurve4 = this.generateUnderCurve4();
      this.ridgePaths.push(underCurve4);
      
                   // Add left-side curves to complement the under curves
             // Add multiple parallel ridges for the first left curve to give it more thickness
             for (let ridgeIndex = 0; ridgeIndex < 3; ridgeIndex++) {
               let leftCurve1 = this.generateLeftCurve1(ridgeIndex);
               this.ridgePaths.push(leftCurve1);
             }
             // Add multiple parallel ridges for the second left curve to match the first curve's thickness
             for (let ridgeIndex = 0; ridgeIndex < 3; ridgeIndex++) {
               let leftCurve2 = this.generateLeftCurve2(ridgeIndex);
               this.ridgePaths.push(leftCurve2);
             }
    }
    
    generatePath(r, baseOffset) {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Determine which arch this ridge belongs to (0, 1, or 2)
      let archIndex = Math.floor(r / this.ridges); // 0, 1, or 2 (progressively smaller arches)
      let ridgeIndex = (r % this.ridges) - this.ridges / 2;
      
      // Progressive size reduction: 100%, 85%, 70%
      let sizeMultiplier;
      if (archIndex === 0) sizeMultiplier = 1.0;      // Largest arch
      else if (archIndex === 1) sizeMultiplier = 0.85; // Second arch
      else sizeMultiplier = 0.70;                      // Third arch
      
      // Adjust ridge spacing based on sub-arch size for cleaner nesting
      let baseSpacing = 2.8;
      let ridgeSpacing = baseSpacing * sizeMultiplier; // Smaller arches have tighter ridge spacing
      
      // Triangle dimensions using whorl scale, scaled by arch size
      let triangleWidth = this.maxR * 1.6 * sizeMultiplier;
      let triangleHeight = this.maxR * 0.8 * sizeMultiplier;
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Start with base horizontal line
        let x = this.cx - triangleWidth * 0.5 + t * triangleWidth;
        // Position arches progressively - centered as a group
        // With 3 arches (0,1,2), center the group by offsetting by -1 * 35 = -35
        let y = this.cy + (archIndex - 1) * 35 + triangleHeight * 0.3; // Stack arches 35px apart, centered as group
        
        // Create a curved "tent" peak that's more organic
        // Use a combination of arch curve and center spike
        let archCurve = Math.sin(t * Math.PI) * triangleHeight * 0.6; // Basic arch shape
        let centerSpike = 0;
        
        // Add a more blunted spike in the center region
        if (t > 0.3 && t < 0.7) {
          let spikeT = (t - 0.3) / 0.4; // 0 to 1 in spike zone
          // Use smooth curve but make it less sharp/more blunted
          centerSpike = Math.sin(spikeT * Math.PI) * triangleHeight * 0.6;
        }
        
        // Combine arch and spike for natural tent shape
        let tentHeight = archCurve + centerSpike;
        y -= tentHeight;
        
        // Gentle convergence toward center (not sharp pull like compass)
        let convergenceFactor = Math.sin(t * Math.PI); // Smooth curve, strongest at center
        let pullToCenter = convergenceFactor * centerSpike * 0.1; // Much gentler pull
        x += (this.cx - x) * pullToCenter / triangleWidth;
        
        // Calculate slope at current point for perpendicular ridge layering
        // Use smooth curved slope instead of sharp triangle slopes
        let slopeX = Math.cos(t * Math.PI) * triangleHeight * 0.6; // Arch slope
        
        // Add center spike slope contribution (more blunted)
        if (t > 0.3 && t < 0.7) {
          let spikeT = (t - 0.3) / 0.4;
          let spikeSlopeContribution = Math.cos(spikeT * Math.PI) * triangleHeight * 0.6;
          slopeX += spikeSlopeContribution;
        }
        
        // Perpendicular to the curved surface
        let perpX = -slopeX / triangleWidth; // Negative for proper perpendicular direction
        let perpY = 1;
        
        // Normalize perpendicular vector
        let perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        if (perpLength > 0) {
          perpX /= perpLength;
          perpY /= perpLength;
        }
        
        // Apply ridge offset
        x += ridgeIndex * ridgeSpacing * perpX;
        y += ridgeIndex * ridgeSpacing * perpY;
        
        // Add subtle natural variations
        let naturalFlow = Math.sin(t * Math.PI * 2 + r * 0.3) * 0.5 +
                         Math.sin(t * Math.PI * 4 + r * 0.7) * 0.2;
        
        // TESTING: EXTREMELY dramatic hills - should be impossible to miss
        let baseHillsY = Math.sin(t * Math.PI * 3) * 12.0;  // Flattened hills
        let baseHillsX = 0;
        
        x += naturalFlow + baseHillsX;
        y += naturalFlow * 0.3 + baseHillsY;
        
        // Tilt the entire pattern 10 degrees to the left (from viewer's perspective)
        let tiltAngle = Math.PI / 18; // +10 degrees in radians
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
    
    generateUnderCurve(ridgeIndex = 0) {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Create a smooth curve underneath the main arch
      let curveWidth = this.maxR * 0.6;  // Even shorter curve
      let curveDepth = this.maxR * 0.24;  // Flattened by 40% (0.4 * 0.6)
      let baseY = this.cy + this.maxR * 0.35; // Move down very slightly
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Create a smooth arc underneath, pulled northwest
        let x = this.cx - curveWidth * 0.5 + t * curveWidth;
        let y = baseY - Math.sin(t * Math.PI) * curveDepth; // Downward arc (flipped)
        
        // Reduce diagonal pull - less northeast, more balanced
        let diagonalPull = (t - 0.5) * this.maxR * 0.3; // Reduced pull toward the right
        y -= diagonalPull; // Less dramatic slope
        
        // Pull northwest - shift slightly left
        x -= this.maxR * 0.05;
        
        // Move two steps to the right (user's right, assistant's left)
        x += this.maxR * 0.15;
        
        // Add parallel ridge spacing for multiple ridges
        let ridgeSpacing = 2.5;
        let ridgeOffset = (ridgeIndex - 1) * ridgeSpacing; // Center the middle ridge
        x += ridgeOffset;
        
        // Apply clockwise tilt to the first curve
        let tiltAngle = Math.PI / 6 + Math.PI / 36; // +35 degrees in radians (clockwise)
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
    
    generateUnderCurve2(ridgeIndex = 0) {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Create a second, smaller curve underneath the first one
      let curveWidth = this.maxR * 0.5;  // Longer to match the first curve better
      let curveDepth = this.maxR * 0.1;  // Much flatter - almost straight
      let baseY = this.cy + this.maxR * 0.35; // Move up one position
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Create a smooth arc underneath, similar to first curve
        let x = this.cx - curveWidth * 0.5 + t * curveWidth;
        let y = baseY - Math.sin(t * Math.PI) * curveDepth; // Downward arc (flipped)
        
        // Add similar diagonal pull but slightly less
        let diagonalPull = (t - 0.5) * this.maxR * 0.2; // Less diagonal pull
        y -= diagonalPull;
        
        // Pull northwest - shift slightly left
        x -= this.maxR * 0.05;
        
        // Move to align with the first curve
        x += this.maxR * 0.15;
        
        // Add parallel ridge spacing for multiple ridges
        let ridgeSpacing = 2.5;
        let ridgeOffset = (ridgeIndex - 1) * ridgeSpacing; // Center the middle ridge
        x += ridgeOffset;
        
        // Apply slightly less clockwise tilt than the first curve
        let tiltAngle = Math.PI / 6 - Math.PI / 72; // +27.5 degrees in radians (clockwise)
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
    
    generateUnderCurve3() {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Create a third, smallest curve underneath the second one
      let curveWidth = this.maxR * 0.35;  // Even smaller than the second curve
      let curveDepth = this.maxR * 0.05;  // Even flatter - very straight
      let baseY = this.cy + this.maxR * 0.05; // Move up much higher
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Create a smooth arc underneath, similar to other curves
        let x = this.cx - curveWidth * 0.5 + t * curveWidth;
        let y = baseY - Math.sin(t * Math.PI) * curveDepth; // Downward arc (flipped)
        
        // Add minimal diagonal pull
        let diagonalPull = (t - 0.5) * this.maxR * 0.15; // Very minimal diagonal pull
        y -= diagonalPull;
        
        // Pull northwest - shift slightly left
        x -= this.maxR * 0.05;
        
        // Move two stages behind (to the left)
        x -= this.maxR * 0.1;
        
        // Apply clockwise tilt
        let tiltAngle = Math.PI / 9; // +20 degrees in radians (clockwise)
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
    
    generateUnderCurve4() {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Create a fourth curve underneath the second one
      let curveWidth = this.maxR * 0.25;  // Smaller than the second curve
      let curveDepth = this.maxR * 0.05;  // Very flat - almost straight
      let baseY = this.cy + this.maxR * 0.35; // Move up much higher
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Create a smooth arc underneath, similar to other curves
        let x = this.cx - curveWidth * 0.5 + t * curveWidth;
        let y = baseY - Math.sin(t * Math.PI) * curveDepth; // Downward arc (flipped)
        
        // Add minimal diagonal pull
        let diagonalPull = (t - 0.5) * this.maxR * 0.1; // Very minimal diagonal pull
        y -= diagonalPull;
        
        // Pull northwest - shift slightly left
        x -= this.maxR * 0.05;
        
        // Move to align with the second curve
        x += this.maxR * 0.15;
        
        // Apply the same tilt as the second curve
        let tiltAngle = Math.PI / 6 - Math.PI / 72; // +27.5 degrees in radians (clockwise)
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
    
    generateLeftCurve1(ridgeIndex = 0) {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Create a left-side curve to complement the under curves
      let curveWidth = this.maxR * 1.6;  // Elongated
      let curveDepth = this.maxR * 0.25;  // Stronger curvature
      let baseX = this.cx - this.maxR * 0.7; // Move slightly left
      let baseY = this.cy + this.maxR * 0.25; // Move slightly up
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Create a vertical curve on the left side
        let x = baseX + Math.sin(t * Math.PI) * curveDepth; // Horizontal curve (convex away from arch)
        let y = baseY - curveWidth * 0.5 + t * curveWidth + Math.sin(t * Math.PI) * curveDepth * 0.8 - (t * 0.3) * this.maxR; // Curve over top, trail down
        
        // Add parallel ridge spacing for thickness
        let ridgeSpacing = 2.5;
        x += (ridgeIndex - 1) * ridgeSpacing;
        
        // Add slight diagonal pull towards the arch
        let diagonalPull = (t - 0.5) * this.maxR * 0.2;
        x += diagonalPull;
        
        // Rotate to 2 o'clock position from top right
        let tiltAngle = Math.PI / 3; // +60 degrees in radians (2 o'clock)
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
    
    generateLeftCurve2(ridgeIndex = 0) {
      let path = [];
      let points = this.pointsPerRidge;
      
      // Create a second, smaller left-side curve
      let curveWidth = this.maxR * 1.4;  // Elongated
      let curveDepth = this.maxR * 0.2;  // Stronger curvature
      let baseX = this.cx - this.maxR * 0.8; // Move slightly left
      let baseY = this.cy + this.maxR * 0.3; // Move slightly up
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // hard-trim 4% at both ends to clean caps
        if (t < 0.04 || t > 0.96) continue;
        
        // Create a vertical curve on the left side
        let x = baseX + Math.sin(t * Math.PI) * curveDepth; // Horizontal curve (convex away from arch)
        let y = baseY - curveWidth * 0.5 + t * curveWidth + Math.sin(t * Math.PI) * curveDepth * 0.8 - (t * 0.25) * this.maxR; // Curve over top, trail down
        
        // Add parallel ridge spacing for thickness
        let ridgeSpacing = 2.5;
        x += (ridgeIndex - 1) * ridgeSpacing;
        
        // Add slight diagonal pull towards the arch
        let diagonalPull = (t - 0.5) * this.maxR * 0.15;
        x += diagonalPull;
        
        // Rotate to 2 o'clock position from top right
        let tiltAngle = Math.PI / 3; // +60 degrees in radians (2 o'clock)
        let centerX = this.cx;
        let centerY = this.cy;
        let tiltedX = centerX + (x - centerX) * Math.cos(tiltAngle) - (y - centerY) * Math.sin(tiltAngle);
        let tiltedY = centerY + (x - centerX) * Math.sin(tiltAngle) + (y - centerY) * Math.cos(tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
  }

  class DoubleLoop extends DigitalFingerprint {
    generate() {
      console.log('DoubleLoop.generate() called!');
      this.ridgePaths = [];
      
      // Create radial loop instances for inner loops
      const leftRadial = new RadialLoop(this.canvas, this.ctx);
      const rightRadial = new RadialLoop(this.canvas, this.ctx);
      
      // Configure radial loops for inner placement
      leftRadial.maxR = this.maxR * 0.74; // Larger for fuller coverage
      rightRadial.maxR = this.maxR * 0.74;
      leftRadial.ridges = 6; // More ridges for fill
      rightRadial.ridges = 6;
      // radial loops at 50% density of S-curve
      leftRadial.pointsPerRidge = Math.max(10, Math.floor(this.pointsPerRidge * 0.5));
      rightRadial.pointsPerRidge = Math.max(10, Math.floor(this.pointsPerRidge * 0.5));
      
      // Generate radial loops
      leftRadial.generate();
      rightRadial.generate();
      
      // Position and transform radial loops
      const leftCoreX = this.cx - this.maxR * 0.25;
      const leftCoreY = this.cy + this.maxR * 0.82;
      const rightCoreX = this.cx + this.maxR * 0.25;
      const rightCoreY = this.cy - this.maxR * 0.10; // move further north by one step
      
      // Apply northeastern movement to core positions - SIMPLIFIED APPROACH
      const northeastOffsetX = this.maxR * 0.08; // subtle NE shift
      const northeastOffsetY = -this.maxR * 0.06; // subtle NE lift
      
      // Move the core positions directly
      const movedLeftCoreX = leftCoreX + northeastOffsetX;
      const movedLeftCoreY = leftCoreY + northeastOffsetY;
      const movedRightCoreX = rightCoreX;
      const movedRightCoreY = rightCoreY;
      
      console.log('Northeastern movement applied:', northeastOffsetX, northeastOffsetY);
      console.log('Left core moved from', leftCoreX, leftCoreY, 'to', movedLeftCoreX, movedLeftCoreY);
      console.log('Right core moved from', rightCoreX, rightCoreY, 'to', movedRightCoreX, movedRightCoreY);
      
      // Transform left radial loop
      for (let r = 0; r < leftRadial.ridgePaths.length; r++) {
        const transformedPath = leftRadial.ridgePaths[r]
          .filter(pt => pt.t <= 0.95) // keep most of the core; light trim only
          .map(pt => {
          let x = movedLeftCoreX + (pt.x - leftRadial.cx) * 0.8;
          let y = movedLeftCoreY + (pt.y - leftRadial.cy) * 0.8;
          
          // Small clockwise rotation towards the seam (~+6°)
          let centerX = this.cx, centerY = this.cy;
          let seamRot = Math.PI * (6 / 180);
          let rx = centerX + (x - centerX) * Math.cos(seamRot) - (y - centerY) * Math.sin(seamRot);
          let ry = centerY + (x - centerX) * Math.sin(seamRot) + (y - centerY) * Math.cos(seamRot);
            
          return { x: rx, y: ry, t: pt.t, radial: true, side: 'L' };
        });
        this.ridgePaths.push(transformedPath);
      }
      
      // Transform right radial loop (mirrored)
      for (let r = 0; r < rightRadial.ridgePaths.length; r++) {
        const transformedPath = rightRadial.ridgePaths[r]
          .filter(pt => pt.t <= 0.95) // keep most of the core; light trim only
          .map(pt => {
          let x = movedRightCoreX - (pt.x - rightRadial.cx) * 0.8; // Mirror horizontally
          let y = movedRightCoreY + (pt.y - rightRadial.cy) * 0.8; // Restore original vertical orientation
          
          // Apply counter-clockwise rotation specifically for right loop
          let centerX = this.cx;
          let centerY = this.cy;
          let counterClockwiseRotation = -Math.PI * (90 / 180); // 90 degrees counter-clockwise
          let rotatedX = centerX + (x - centerX) * Math.cos(counterClockwiseRotation) - (y - centerY) * Math.sin(counterClockwiseRotation);
          let rotatedY = centerY + (x - centerX) * Math.sin(counterClockwiseRotation) + (y - centerY) * Math.cos(counterClockwiseRotation);
          
          // Opposing tilt for yin–yang: right ~ +12°
          // Match blue loop tilt (−12°)
          let seamRot = -Math.PI * (12 / 180);
          let rx = centerX + (rotatedX - centerX) * Math.cos(seamRot) - (rotatedY - centerY) * Math.sin(seamRot);
          let ry = centerY + (rotatedX - centerX) * Math.sin(seamRot) + (rotatedY - centerY) * Math.cos(seamRot);
          
          return { x: rx, y: ry, t: pt.t, radial: true, side: 'R' };
        });
        this.ridgePaths.push(transformedPath);
      }
      
      // Generate outer S-curve ridges (remaining ridges)
      const outerRidges = 0; // kill S-curve: no additional ridges
      // no S-curve paths pushed
    }
    
    draw(dotsDrawn, dotsPerFrame) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let r = 0; r < this.ridgePaths.length; r++) {
        let path = this.ridgePaths[r];
        let maxDots = dotsDrawn[r] || 0;
        
        // Use ridge-based colors like the whorl
        // Inner radial loops get their own color scheme
        let ridgeColor;
        if (r < 4) {
          // Left radial loop - blue to purple
          ridgeColor = lerpColor(blue, purple, r / 4);
        } else if (r < 8) {
          // Right radial loop - purple to pink  
          ridgeColor = lerpColor(purple, pink, (r - 4) / 4);
        } else {
          // No S-curve: fall back to right radial coloring for any residual ranges
          ridgeColor = lerpColor(purple, pink, Math.min(1, (r - 4) / Math.max(1, (this.ridgePaths.length - 4))));
        }
        
        for (let i = 0; i < maxDots && i < path.length; i++) {
          let pt = path[i];
          let fade = 1.0;
          if (pt.t > 0.78) fade = Math.max(0, 1.0 - (pt.t - 0.78) * 5.0);
          this.ctx.save();
          // Slight alpha emphasis at the seam to crispen the interlock
          const seamMaskDraw = Math.exp(-Math.pow((pt.t - 0.5) / 0.05, 2));
          const alphaBoost = 1 + 0.12 * seamMaskDraw;
          this.ctx.globalAlpha = Math.min(1, 0.85 * fade * alphaBoost);
          this.ctx.fillStyle = ridgeColor;
          this.ctx.beginPath();
          
          // If this point belongs to a radial loop, draw clean (no jitter), slightly smaller
          if (pt.radial) {
            let halfProgress = pt.t < 0.5 ? (pt.t / 0.5) : ((pt.t - 0.5) / 0.5);
            let seamMask = Math.exp(-Math.pow((pt.t - 0.5) / 0.05, 2));
            let coreMask = 1 - Math.pow(Math.sin(halfProgress * Math.PI), 2);
            // end taper
            let edge = 0.18; let tIn = Math.min(1, Math.max(0, pt.t / edge)); let tOut = Math.min(1, Math.max(0, (1 - pt.t) / edge));
            let tail = Math.min(tIn, tOut); let smooth = tail * tail * (3 - 2 * tail);
            // stable noise for alpha/size (stronger)
            let n = hash2D(i, r);
            this.ctx.globalAlpha *= smooth * (0.8 + 0.4 * (n - 0.5));
            let baseSize = 2.1 + 1.2 * Math.sin(r + i * 0.13);
            // whorl-inspired size modulation (multi-frequency flow), solid-only (no position change)
            let whorlMod = 1 + 0.10 * Math.sin(pt.t * Math.PI * 2.2 + r * 0.3) + 0.05 * Math.sin(pt.t * Math.PI * 4.1 + r * 0.5);
            let size = baseSize * (1 - 0.15 * (0.6 * coreMask + 0.4 * seamMask)) * (0.7 + 0.3 * smooth) * (0.88 + 0.24 * n) * whorlMod;
            
            // Fractile reinforcement (radial): solid on-center overdraw to thicken ridge
            if (i % 1 === 0) {
              this.ctx.save();
              // strong visible reinforcement
              this.ctx.globalAlpha = 1.0;
              this.ctx.beginPath(); this.ctx.arc(pt.x, pt.y, size * 1.15, 0, Math.PI * 2); this.ctx.fill();
              this.ctx.restore();
            }
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            continue;
          }
          // Default S-curve point draw with slight size modulation
          let halfProgress = pt.t < 0.5 ? (pt.t / 0.5) : ((pt.t - 0.5) / 0.5);
          let seamMask = Math.exp(-Math.pow((pt.t - 0.5) / 0.05, 2));
          let coreMask = 1 - Math.pow(Math.sin(halfProgress * Math.PI), 2); // high near ends/seam, low mid-arc
          // Smoothly taper ends and, if outer S-curve ridge, taper a bit more
          let edge = 0.18; let tIn = Math.min(1, Math.max(0, pt.t / edge)); let tOut = Math.min(1, Math.max(0, (1 - pt.t) / edge));
          let tail = Math.min(tIn, tOut); let smooth = tail * tail * (3 - 2 * tail);
          let n2 = hash2D(i, r + 123.45);
          let baseAlphaScale = smooth * (0.8 + 0.4 * (n2 - 0.5));
          // extra softness for outermost ridges
          if (r >= 8) {
            let outerIndex = r - 8; let outerRidges = this.ridgePaths.length - 8;
            let isEdge = (outerIndex === 0) || (outerIndex === outerRidges - 1);
            if (isEdge) baseAlphaScale *= 0.8 + 0.2 * smooth;
          }
          this.ctx.globalAlpha *= baseAlphaScale;
          let baseSize = 2.1 + 1.2 * Math.sin(r + i * 0.13);
          // whorl-inspired size modulation (multi-frequency flow), solid-only (no position change)
          let whorlMod2 = 1 + 0.10 * Math.sin(pt.t * Math.PI * 2.0 + r * 0.25) + 0.05 * Math.sin(pt.t * Math.PI * 3.6 + r * 0.45);
          let size = baseSize * (1 - 0.15 * (0.6 * coreMask + 0.4 * seamMask)) * (0.7 + 0.3 * baseAlphaScale) * (0.88 + 0.24 * n2) * whorlMod2;
          
          // Targeted 'arm claw' fade: only S-curve ridges (r >= 8) and very early t
          if (r >= 8 && pt.t < 0.22) {
            let armIn = Math.min(1, pt.t / 0.22);
            let armSmooth = armIn * armIn * (3 - 2 * armIn);
            this.ctx.globalAlpha *= armSmooth;
            size *= (0.7 + 0.3 * armSmooth);
          }
          
          // Sparkle micro-bubbles (S-curve): sparser, scaled by taper
          if (((i + r) % 3) === 0) {
            this.ctx.save();
            let a1 = hash2D(i + 7.77, r + 6.66) * Math.PI * 2;
            let rad1 = 2.6 + 1.8 * hash2D(i + 2.2, r + 4.4);
            let s1 = Math.max(0.45, size * (0.30 + 0.20 * hash2D(i + 9.1, r + 3.3)));
            this.ctx.globalAlpha *= 0.5 * baseAlphaScale;
            this.ctx.beginPath(); this.ctx.arc(pt.x + Math.cos(a1) * rad1, pt.y + Math.sin(a1) * rad1, s1, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.restore();
          }
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
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
      // Slightly wider and flatter to emphasize a classic double-loop silhouette
      let loopWidth = this.maxR * 1.35;
      let loopHeight = this.maxR * 0.95;
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
        // remove most of the top (start) tail; keep bottom end intact
        if (t < 0.12) continue;
        
        // Create the true double loop structure - two separate loop systems
        let x, y;
        
        if (t < 0.5) {
          // Left loop system - curves inward from left side with natural flow
          let loopT = t * 2; // 0 to 1 for left loop
          
          // Use even smoother curve interpolation
          let smoothT = loopT * loopT * loopT * (10 - 15 * loopT + 6 * loopT * loopT); // Smootherstep function
          
          // Balanced core structure - left core
          let startX = this.cx - loopWidth * 0.58; // nudge inward slightly
          let startY = this.cy + loopHeight * 0.40; // small recenter for balance
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

          // Local delta (negative space) near the left core via gentle radial repulsion
          {
            let coreX = this.cx - loopWidth * 0.52;
            let coreY = this.cy + loopHeight * 0.36;
            let toCoreX = x - coreX;
            let toCoreY = y - coreY;
            let dist = Math.sqrt(toCoreX * toCoreX + toCoreY * toCoreY) + 1e-6;
            let coreInfluence = Math.exp(-Math.pow((loopT - 0.18) / 0.18, 2));
            x += (toCoreX / dist) * 10 * coreInfluence;
            y += (toCoreY / dist) * 10 * coreInfluence;
          }
          
          // Remove arc curvature to eliminate fish tail effect
          
          // Natural edge termination - no fish tail
          // Let the ridges naturally end without position adjustments
          
          // Enhanced S-curve with layered ridge stacking
          if (loopT > 0.3 && loopT < 0.9) {
            let sCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6) * 0.8; // Back to original strength
            // Primary S-curve movement
            x += sCurve * loopWidth * 0.45; // Back to original movement
            y += sCurve * loopHeight * 0.4;
            
            // Secondary echo curve for ridge layering
            let echoCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6 + Math.PI * 0.3) * 0.4; // Back to original
            x += echoCurve * loopWidth * 0.2;
            y += echoCurve * loopHeight * 0.15;
            
            // Enhanced ridge variation for more hills
            let ridgeVariation = Math.sin(r * 0.3 + loopT * Math.PI * 1.5) * 0.12; // More pronounced hills
            x += ridgeVariation * loopWidth * 0.15;
            y += ridgeVariation * loopHeight * 0.12;
          }
          
          
        } else {
          // Right loop system - curves inward from right side with natural flow
          let loopT = (t - 0.5) * 2; // 0 to 1 for right loop
          
          // Use even smoother curve interpolation
          let smoothT = loopT * loopT * loopT * (10 - 15 * loopT + 6 * loopT * loopT); // Smootherstep function
          
          // Balanced core structure - right core
          let startX = this.cx + loopWidth * 0.58; // nudge inward slightly
          let startY = this.cy - loopHeight * 0.40; // small recenter for balance
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

          // Local delta (negative space) near the right core via gentle radial repulsion
          {
            let coreX = this.cx + loopWidth * 0.52;
            let coreY = this.cy - loopHeight * 0.36;
            let toCoreX = x - coreX;
            let toCoreY = y - coreY;
            let dist = Math.sqrt(toCoreX * toCoreX + toCoreY * toCoreY) + 1e-6;
            let coreInfluence = Math.exp(-Math.pow((loopT - 0.18) / 0.18, 2));
            x += (toCoreX / dist) * 10 * coreInfluence;
            y += (toCoreY / dist) * 10 * coreInfluence;
          }
          
          // Remove arc curvature to eliminate fish tail effect
          
          // Natural edge termination - no fish tail
          // Let the ridges naturally end without position adjustments
          
          // Enhanced S-curve with layered ridge stacking
          if (loopT > 0.3 && loopT < 0.9) {
            let sCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6) * 0.8; // Back to original strength
            // Primary S-curve movement
            x -= sCurve * loopWidth * 0.45; // Back to original movement
            y -= sCurve * loopHeight * 0.4;
            
            // Secondary echo curve for ridge layering
            let echoCurve = Math.sin((loopT - 0.3) * Math.PI / 0.6 + Math.PI * 0.3) * 0.4; // Back to original
            x -= echoCurve * loopWidth * 0.2;
            y -= echoCurve * loopHeight * 0.15;
            
            // Enhanced ridge variation for more hills
            let ridgeVariation = Math.sin(r * 0.3 + loopT * Math.PI * 1.5) * 0.12; // More pronounced hills
            x -= ridgeVariation * loopWidth * 0.15;
            y -= ridgeVariation * loopHeight * 0.12;
          }
          

        }
        
        // Add ridge offset for parallel ridges with adaptive spacing across each half-loop
        let ridgeSpacing = 12;
        let ridgeIndex = r - this.ridges / 2;
        let halfProgress = t < 0.5 ? (t / 0.5) : ((t - 0.5) / 0.5); // 0→1 within each half
        let spacingMid = Math.sin(halfProgress * Math.PI);
        let spacingMask = 0.8 + 0.55 * Math.pow(spacingMid, 2.2); // much sharper mid emphasis
        x += ridgeIndex * ridgeSpacing * 0.8 * spacingMask;
        y += ridgeIndex * ridgeSpacing * 0.6 * spacingMask;
        
        // Additional suppression near very ends
        let tailTrim = Math.min(t / 0.15, (1 - t) / 0.15); // 0..1 within trimmed zones
        spacingMask *= Math.max(0, Math.min(1, tailTrim));
        
        // Apply whorl-style texture with layered sine waves
        let flowX = Math.sin(t * Math.PI * 1.2 + r * 0.18) * 0.18 + Math.sin(t * Math.PI * 3.1 + r * 0.5) * 0.07;
        let flowY = Math.sin(t * Math.PI * 1.5 + r * 0.22) * 0.15 + Math.sin(t * Math.PI * 2.8 + r * 0.4) * 0.09;
        // Dampen flow near cores; strongest in broad arcs within each half (even stronger damping at ends)
        let noiseMask = 0.18 + 0.82 * Math.sin(halfProgress * Math.PI);
        noiseMask *= Math.max(0, Math.min(1, tailTrim));
        flowX *= noiseMask;
        flowY *= noiseMask;
        
        x += flowX * loopWidth * 0.3;
        y += flowY * loopHeight * 0.25;

        // Pouch shaping: bend outer ends inward and downward to form a cup
        if (t < 0.22 || t > 0.78) {
          let edgeSpan = 0.22; // end window
          let endT = t < 0.5 ? (edgeSpan - Math.min(edgeSpan, t)) / edgeSpan : (Math.min(1 - t, edgeSpan)) / edgeSpan;
          // smootherstep falloff
          let endSmooth = Math.max(0, Math.min(1, endT));
          endSmooth = endSmooth * endSmooth * (3 - 2 * endSmooth);
          // Stronger on the outermost ridges (approximate: outerRidges = this.ridges - 8)
          let outerRidges = Math.max(1, this.ridges - 8);
          let edgeBoost = (r === 0 || r === outerRidges - 1) ? 1.0 : (r === 1 || r === outerRidges - 2 ? 0.6 : 0.35);
          // Target cup center below
          let pouchCx = this.cx;
          let pouchCy = this.cy + this.maxR * 0.55;
          // Pull toward center and downward to cup
          x += (pouchCx - x) * 0.45 * endSmooth * edgeBoost;
          y += (pouchCy - y) * 0.60 * endSmooth * edgeBoost;
        }

        // Central seam convergence and slight interleave for left/right ridges
        let seamMask = Math.exp(-Math.pow((t - 0.5) / 0.05, 2)); // slightly tighter band
        x += (this.cx - x) * 0.07 * seamMask; // mild pull toward center
        y += (this.cy - y) * 0.035 * seamMask;
        let interleave = ((r & 1) === 0 ? 1 : -1) * 4.5 * seamMask; // softer interleave
        y += interleave;
        
        // Rotate the entire pattern for better balance (~-65deg)
        let rotationAngle = -Math.PI * (65 / 180);
        let centerX = this.cx;
        let centerY = this.cy;
        let rotatedX = centerX + (x - centerX) * Math.cos(rotationAngle) - (y - centerY) * Math.sin(rotationAngle);
        let rotatedY = centerY + (x - centerX) * Math.sin(rotationAngle) + (y - centerY) * Math.cos(rotationAngle);
        
        // Apply slight northeastern movement and clockwise rotation
        let finalRotation = Math.PI * (5 / 180); // 5 degrees clockwise
        let northeastX = rotatedX + this.maxR * 0.5; // DRAMATIC northeastern movement for testing
        let northeastY = rotatedY - this.maxR * 0.4;
        let finalX = centerX + (northeastX - centerX) * Math.cos(finalRotation) - (northeastY - centerY) * Math.sin(finalRotation);
        let finalY = centerY + (northeastX - centerX) * Math.sin(finalRotation) + (northeastY - centerY) * Math.cos(finalRotation);
        
        // No additional screen-space clipping; preserve S-curve body
         
        path.push({ x: finalX, y: finalY, t });
      }
      
      return path;
    }
    

    

    

    

  }

  // --- Animation and cycling logic ---
  const types = [Whorl, RadialLoop, PlainArch, TentedArch, DoubleLoop];
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

  function generateFingerprint() {
    // Show 12 plain arch variations in sequence
    if (currentType === 2) { // PlainArch index
      plainArchCount = (plainArchCount + 1) % 12; // Cycle through 12 variations
      fingerprint = new plainArchVariations[plainArchCount](canvas, ctx);
      console.log('Using PlainArchVariation', plainArchCount);
    } else {
    fingerprint = new types[currentType](canvas, ctx);
      console.log('Using', types[currentType].name, 'at index', currentType);
    }
    
    // Set density for double loop
    if (fingerprint instanceof DoubleLoop) {
      console.log('DoubleLoop detected! Setting density...');
      fingerprint.ridges = 15;
      fingerprint.pointsPerRidge = 120; // keep S-curve at 100%
    } else if (fingerprint instanceof RadialLoop) {
      fingerprint.ridges = 15; // Same as whorl for proper aeration
      fingerprint.pointsPerRidge = 50; // Same as whorl for proper spacing
    } else {
      fingerprint.ridges = 15;
      fingerprint.pointsPerRidge = 50;
    }
    fingerprint.generate();
    dotsDrawn = [];
    
    // Initialize dotsDrawn for PlainArch with 5x ridges and TentedArch with 3x ridges
    if (fingerprint instanceof PlainArch || fingerprint.constructor.name.includes('PlainArchVariation')) {
      console.log('Creating PlainArch with 5x ridges');
              dotsDrawn = new Array(fingerprint.ridges * 5).fill(0);
      console.log('dotsDrawn array length:', dotsDrawn.length);
    } else if (fingerprint instanceof TentedArch) {
      console.log('Creating TentedArch with 3x ridges');
      dotsDrawn = new Array(fingerprint.ridges * 3).fill(0);
      console.log('dotsDrawn array length:', dotsDrawn.length);
    }
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