class DoubleLoop extends window.DigitalFingerprint {
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
      
      // Transform left radial loop (defensive against undefined paths)
      const leftPaths = Array.isArray(leftRadial.ridgePaths) ? leftRadial.ridgePaths : [];
      for (let r = 0; r < leftPaths.length; r++) {
        const sourcePath = Array.isArray(leftPaths[r]) ? leftPaths[r] : [];
        const transformedPath = [];
        for (let idx = 0; idx < sourcePath.length; idx++) {
          const pt = sourcePath[idx];
          if (!pt || pt.t > 0.95) continue; // keep most of the core; light trim only
          let x = movedLeftCoreX + (pt.x - leftRadial.cx) * 0.8;
          let y = movedLeftCoreY + (pt.y - leftRadial.cy) * 0.8;
          // Small clockwise rotation towards the seam (~+6°)
          let centerX = this.cx, centerY = this.cy;
          let seamRot = Math.PI * (6 / 180);
          let rx = centerX + (x - centerX) * Math.cos(seamRot) - (y - centerY) * Math.sin(seamRot);
          let ry = centerY + (x - centerX) * Math.sin(seamRot) + (y - centerY) * Math.cos(seamRot);
          transformedPath.push({ x: rx, y: ry, t: pt.t, radial: true, side: 'L' });
        }
        this.ridgePaths.push(transformedPath);
      }
      
      // Transform right radial loop (mirrored; defensive)
      const rightPaths = Array.isArray(rightRadial.ridgePaths) ? rightRadial.ridgePaths : [];
      for (let r = 0; r < rightPaths.length; r++) {
        const sourcePath = Array.isArray(rightPaths[r]) ? rightPaths[r] : [];
        const transformedPath = [];
        for (let idx = 0; idx < sourcePath.length; idx++) {
          const pt = sourcePath[idx];
          if (!pt || pt.t <= 0.05) { /* trim tiny head if any */ }
          if (!pt || pt.t > 0.95) continue; // keep most of the core; light trim only
          let x = movedRightCoreX - (pt.x - rightRadial.cx) * 0.8; // Mirror horizontally
          let y = movedRightCoreY + (pt.y - rightRadial.cy) * 0.8; // Restore original vertical orientation
          // Apply counter-clockwise rotation specifically for right loop
          let centerX = this.cx;
          let centerY = this.cy;
          let counterClockwiseRotation = -Math.PI * (90 / 180); // 90 degrees counter-clockwise
          let rotatedX = centerX + (x - centerX) * Math.cos(counterClockwiseRotation) - (y - centerY) * Math.sin(counterClockwiseRotation);
          let rotatedY = centerY + (x - centerX) * Math.sin(counterClockwiseRotation) + (y - centerY) * Math.cos(counterClockwiseRotation);
          // Opposing tilt for yin–yang: right ~ +12° (match left)
          let seamRot = -Math.PI * (12 / 180);
          let rx = centerX + (rotatedX - centerX) * Math.cos(seamRot) - (rotatedY - centerY) * Math.sin(seamRot);
          let ry = centerY + (rotatedX - centerX) * Math.sin(seamRot) + (rotatedY - centerY) * Math.cos(seamRot);
          transformedPath.push({ x: rx, y: ry, t: pt.t, radial: true, side: 'R' });
        }
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
          let t = r / 4;
          let ar = (0x00bfff >> 16) & 255, ag = (0x00bfff >> 8) & 255, ab = 0x00bfff & 255;
          let br = (0x7c3aed >> 16) & 255, bg = (0x7c3aed >> 8) & 255, bb = 0x7c3aed & 255;
          ridgeColor = 'rgb(' + Math.round(ar + (br - ar) * t) + ',' + Math.round(ag + (bg - ag) * t) + ',' + Math.round(ab + (bb - ab) * t) + ')';
        } else if (r < 8) {
          // Right radial loop - purple to pink  
          let t = (r - 4) / 4;
          let ar = (0x7c3aed >> 16) & 255, ag = (0x7c3aed >> 8) & 255, ab = 0x7c3aed & 255;
          let br = (0xff69b4 >> 16) & 255, bg = (0xff69b4 >> 8) & 255, bb = 0xff69b4 & 255;
          ridgeColor = 'rgb(' + Math.round(ar + (br - ar) * t) + ',' + Math.round(ag + (bg - ag) * t) + ',' + Math.round(ab + (bb - ab) * t) + ')';
        } else {
          // No S-curve: fall back to right radial coloring for any residual ranges
          let t = Math.min(1, (r - 4) / Math.max(1, (this.ridgePaths.length - 4)));
          let ar = (0x7c3aed >> 16) & 255, ag = (0x7c3aed >> 8) & 255, ab = 0x7c3aed & 255;
          let br = (0xff69b4 >> 16) & 255, bg = (0xff69b4 >> 8) & 255, bb = 0xff69b4 & 255;
          ridgeColor = 'rgb(' + Math.round(ar + (br - ar) * t) + ',' + Math.round(ag + (bg - ag) * t) + ',' + Math.round(ab + (bb - ab) * t) + ')';
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
            let n = window.hash2D(i, r);
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
           let n2 = window.hash2D(i, r + 123.45);
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
             let a1 = window.hash2D(i + 7.77, r + 6.66) * Math.PI * 2;
             let rad1 = 2.6 + 1.8 * window.hash2D(i + 2.2, r + 4.4);
             let s1 = Math.max(0.45, size * (0.30 + 0.20 * window.hash2D(i + 9.1, r + 3.3)));
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

  window.DoubleLoop = DoubleLoop;