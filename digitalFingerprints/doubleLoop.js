class DoubleLoop extends window.DigitalFingerprint {
    generate() {
      console.log('DoubleLoop.generate() called!');
      this.ridgePaths = [];
      
      // Create and configure radial loops for inner placement
      const leftRadial = this.createRadialLoop();
      const rightRadial = this.createRadialLoop();
      
      // Generate radial loops
      leftRadial.generate();
      rightRadial.generate();
      
      // Position and transform radial loops
      const leftCore = { 
        x: this.cx - this.maxR * 0.25, 
        y: this.cy + this.maxR * 0.82 
      };
      const rightCore = { 
        x: this.cx + this.maxR * 0.25, 
        y: this.cy - this.maxR * 0.10 
      };
      
      // Apply northeastern movement to left core only
      const movedLeftCore = {
        x: leftCore.x + this.maxR * 0.08,
        y: leftCore.y - this.maxR * 0.06
      };
      
      console.log('Northeastern movement applied: left core moved from', leftCore.x, leftCore.y, 'to', movedLeftCore.x, movedLeftCore.y);
      
      // Transform and add radial loop paths
      this.transformAndAddRadialPaths(leftRadial, movedLeftCore, 'L', 0.8, 6);
      this.transformAndAddRadialPaths(rightRadial, rightCore, 'R', -0.8, -90, -12);
    }
    
    createRadialLoop() {
      const radial = new RadialLoop(this.canvas, this.ctx);
      radial.maxR = this.maxR * 0.74;
      radial.ridges = 6;
      radial.pointsPerRidge = Math.max(10, Math.floor(this.pointsPerRidge * 0.5));
      return radial;
    }
    
    transformAndAddRadialPaths(radial, core, side, scaleX, rotationAngle = 0, seamRotation = 6) {
      const paths = Array.isArray(radial.ridgePaths) ? radial.ridgePaths : [];
      
      for (let r = 0; r < paths.length; r++) {
        const sourcePath = Array.isArray(paths[r]) ? paths[r] : [];
        const transformedPath = [];
        
        for (let idx = 0; idx < sourcePath.length; idx++) {
          const pt = sourcePath[idx];
          if (!pt || pt.t > 0.95) continue;
          
          // Transform position
          let x = core.x + (pt.x - radial.cx) * scaleX;
          let y = core.y + (pt.y - radial.cy) * 0.8;
          
          // Apply rotation if specified
          if (rotationAngle !== 0) {
            const cos = Math.cos(Math.PI * (rotationAngle / 180));
            const sin = Math.sin(Math.PI * (rotationAngle / 180));
            const rx = this.cx + (x - this.cx) * cos - (y - this.cy) * sin;
            const ry = this.cy + (x - this.cx) * sin + (y - this.cy) * cos;
            x = rx; y = ry;
          }
          
          // Apply seam rotation
          const seamRot = Math.PI * (seamRotation / 180);
          const cos = Math.cos(seamRot);
          const sin = Math.sin(seamRot);
          const finalX = this.cx + (x - this.cx) * cos - (y - this.cy) * sin;
          const finalY = this.cy + (x - this.cx) * sin + (y - this.cy) * cos;
          
          transformedPath.push({ 
            x: finalX, 
            y: finalY, 
            t: pt.t, 
            radial: true, 
            side: side 
          });
        }
        
        this.ridgePaths.push(transformedPath);
      }
    }
    
    draw(dotsDrawn, dotsPerFrame) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (let r = 0; r < this.ridgePaths.length; r++) {
        const path = this.ridgePaths[r];
        const maxDots = dotsDrawn[r] || 0;
        
        // Get ridge color based on position
        const ridgeColor = this.getRidgeColor(r);
        
        // Draw path points
        this.drawRadialPoints(path, maxDots, ridgeColor, r);
        
        // Update dots drawn counter
        if (maxDots < path.length) {
          dotsDrawn[r] = maxDots + dotsPerFrame;
        }
      }
    }
    
    getRidgeColor(ridgeIndex) {
      if (ridgeIndex < 4) {
        // Left radial loop - blue to purple
        return this.interpolateColor(0x00bfff, 0x7c3aed, ridgeIndex / 4);
      } else if (ridgeIndex < 8) {
        // Right radial loop - purple to pink
        return this.interpolateColor(0x7c3aed, 0xff69b4, (ridgeIndex - 4) / 4);
      } else {
        // Fallback coloring
        const t = Math.min(1, (ridgeIndex - 4) / Math.max(1, this.ridgePaths.length - 4));
        return this.interpolateColor(0x7c3aed, 0xff69b4, t);
      }
    }
    
    interpolateColor(colorA, colorB, t) {
      const ar = (colorA >> 16) & 255, ag = (colorA >> 8) & 255, ab = colorA & 255;
      const br = (colorB >> 16) & 255, bg = (colorB >> 8) & 255, bb = colorB & 255;
      return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
    }
    
    drawRadialPoints(path, maxDots, ridgeColor, ridgeIndex) {
      for (let i = 0; i < maxDots && i < path.length; i++) {
        const pt = path[i];
        this.drawRadialPoint(pt, ridgeColor, i, ridgeIndex);
      }
    }
    
    drawRadialPoint(pt, ridgeColor, pointIndex, ridgeIndex) {
      const fade = pt.t > 0.78 ? Math.max(0, 1.0 - (pt.t - 0.78) * 5.0) : 1.0;
      const seamMask = Math.exp(-Math.pow((pt.t - 0.5) / 0.05, 2));
      const alphaBoost = 1 + 0.12 * seamMask;
      
      this.ctx.save();
      this.ctx.globalAlpha = Math.min(1, 0.85 * fade * alphaBoost);
      this.ctx.fillStyle = ridgeColor;
      
      // Calculate size with whorl-style modulation
      const size = this.calculateRadialSize(pt, pointIndex, ridgeIndex);
      
      // Draw reinforcement dot
      if (pointIndex % 1 === 0) {
        this.ctx.save();
        this.ctx.globalAlpha = 1.0;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, size * 1.15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
      
      // Draw main dot
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    
    calculateRadialSize(pt, pointIndex, ridgeIndex) {
      const halfProgress = pt.t < 0.5 ? (pt.t / 0.5) : ((pt.t - 0.5) / 0.5);
      const seamMask = Math.exp(-Math.pow((pt.t - 0.5) / 0.05, 2));
      const coreMask = 1 - Math.pow(Math.sin(halfProgress * Math.PI), 2);
      
      // Calculate edge taper
      const edge = 0.18;
      const tIn = Math.min(1, Math.max(0, pt.t / edge));
      const tOut = Math.min(1, Math.max(0, (1 - pt.t) / edge));
      const tail = Math.min(tIn, tOut);
      const smooth = tail * tail * (3 - 2 * tail);
      
      // Stable noise for alpha/size
      const n = window.hash2D(pointIndex, ridgeIndex);
      const baseSize = 2.1 + 1.2 * Math.sin(ridgeIndex + pointIndex * 0.13);
      
      // Whorl-inspired size modulation
      const whorlMod = 1 + 0.10 * Math.sin(pt.t * Math.PI * 2.2 + ridgeIndex * 0.3) + 
                       0.05 * Math.sin(pt.t * Math.PI * 4.1 + ridgeIndex * 0.5);
      
      return baseSize * (1 - 0.15 * (0.6 * coreMask + 0.4 * seamMask)) * 
             (0.7 + 0.3 * smooth) * (0.88 + 0.24 * n) * whorlMod;
    }
}

window.DoubleLoop = DoubleLoop;