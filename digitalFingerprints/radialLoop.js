class RadialLoop extends window.DigitalFingerprint {
    // Consolidated configuration - all constants in one place
    static CONFIG = {
        loop: {
            turns: { base: 1.0, variation: 0.3 },
            flow: { primary: { freq: 1.4, amp: 0.22 }, secondary: { freq: 2.8, amp: 0.08 } },
            radius: { base: 0.4, variation: { amp: 8, freq: 1.8 } }
        },
        core: {
            position: { xOffset: 0.2, yOffset: 0.25 },
            curve: { x: 0.6, y: 1.5 },
            enhancement: { start: Math.PI * 0.8, end: Math.PI * 2.2, amp: 0.4, reduction: 0.6 }
        },
        spacing: {
            base: 2.5, coreDistance: 0.15,
            core: { tight: 0.6, loose: 1.0 },
            broad: { amp: 0.5, range: 0.3 }
        },
        tilt: Math.PI / 6,
        trails: {
            ridgeThreshold: 0.6,
            left: { start: Math.PI * 1.2, end: Math.PI * 1.9 },
            right: { start: Math.PI * 0.1, end: Math.PI * 0.8 },
            offset: { spread: Math.PI * 0.08, perpendicular: Math.PI * 0.5 },
            length: { base: 0.4, increment: 0.1, variation: 0.4 },
            curvature: 0.1, timing: { offset: 0.85, range: 0.15 }
        },
        fractal: {
            inner: { scale: 0.925, offsetX: 0.05, offsetY: 0.02, coreDistance: 0.06, spacingMultiplier: 1.5 },
            third: { scale: 0.7, offsetX: 0.02, offsetY: 0.01, coreDistance: 0.03, spacingMultiplier: 1.0 },
            fourth: { scale: 0.6, offsetX: 0.01, offsetY: 0.005, coreDistance: 0.015, spacingMultiplier: 0.8 }
        }
    };
    


    applyTilt(x, y, centerX, centerY) {
        const cos = Math.cos(RadialLoop.CONFIG.tilt), sin = Math.sin(RadialLoop.CONFIG.tilt);
        const dx = x - centerX, dy = y - centerY;
        return {
            x: centerX + dx * cos - dy * sin,
            y: centerY + dx * sin + dy * cos
        };
    }

    calculateSpacingMultiplier(d, coreDist) {
        const t = coreDist * 2;
        return d < t ? 
            RadialLoop.CONFIG.spacing.core.tight + 0.4 * (d / t) :
            RadialLoop.CONFIG.spacing.core.loose + RadialLoop.CONFIG.spacing.broad.amp * ((d - t) / (this.maxR * RadialLoop.CONFIG.spacing.broad.range));
    }

    applyCoreEnhancement(x, y, coreX, coreY, theta, flow, coreRadius) {
        const c = RadialLoop.CONFIG.core.enhancement;
        if (theta > c.start && theta < c.end) {
            const intensity = Math.sin((theta - c.start) / (c.end - c.start)) * c.amp;
            const factor = 1 - intensity * c.reduction;
            return {
                x: coreX + coreRadius * Math.cos(theta + flow) + (x - coreX) * factor,
                y: coreY + coreRadius * Math.sin(theta + flow) + (y - coreY) * factor
            };
        }
        return {x, y};
    }

    generateTrails(x, y, theta, trailT, centerX, centerY) {
        const trails = [];
        const t = RadialLoop.CONFIG.trails;
        
        for (let i = 0; i < 2; i++) {
            const offset = i * t.offset.spread;
            const angle = theta + t.offset.perpendicular + offset;
            const length = this.maxR * (t.length.base + i * t.length.increment) * (1 + trailT * t.length.variation);
            const curvature = Math.sin(trailT * Math.PI) * this.maxR * t.curvature;
            
            let trailX = x + length * Math.cos(angle) + curvature * Math.cos(angle + t.offset.perpendicular);
            let trailY = y + length * Math.sin(angle) + curvature * Math.sin(angle + t.offset.perpendicular);
            
            const tilted = this.applyTilt(trailX, trailY, centerX, centerY);
            // Trails get progressively more pink based on their position
            const pinkT = t.timing.offset + trailT * t.timing.range + (i * 0.1); // Enhanced pink for trails
            trails.push([tilted.x, tilted.y, Math.min(pinkT, 1.0)]);
        }
        
        return trails;
    }

    applyPerpendicularOffset(x, y, theta, flow, ridgeIndex, spacingMultiplier, baseSpacing = RadialLoop.CONFIG.spacing.base) {
        const sin = -Math.sin(theta + flow), cos = Math.cos(theta + flow);
        const offset = ridgeIndex * baseSpacing * spacingMultiplier;
        return {x: x + offset * cos, y: y - offset * sin};
    }

    generateFractalLoop(rr, theta, flow, baseCoreX, baseCoreY, ridgeIndex, loopConfig) {
        const coreX = baseCoreX + this.maxR * loopConfig.offsetX;
        const coreY = baseCoreY + this.maxR * loopConfig.offsetY;
        let x = coreX + (rr * loopConfig.scale) * Math.cos(theta + flow) * RadialLoop.CONFIG.core.curve.x;
        let y = coreY + (rr * loopConfig.scale) * Math.sin(theta + flow) * RadialLoop.CONFIG.core.curve.y;
        
        const distanceFromCore = Math.sqrt(this.calculateSquaredDistanceFromCore(x, y, coreX, coreY));
        const coreDistance = this.maxR * loopConfig.coreDistance;
        const spacingMultiplier = this.calculateSpacingMultiplier(distanceFromCore, coreDistance);
        
        ({x, y} = this.applyPerpendicularOffset(x, y, theta, flow, ridgeIndex, spacingMultiplier));
        ({x, y} = this.applyCoreEnhancement(x, y, coreX, coreY, theta, flow, coreDistance));
        const tilted = this.applyTilt(x, y, this.cx, this.cy);
        
        return {x: tilted.x, y: tilted.y, coreX, coreY};
    }

    generateNestedFractalLoops(r, rr, theta, flow, coreX, coreY, ridgeIndex) {
        const points = [];
        if (r < this.ridges / 3) {
            const inner = this.generateFractalLoop(rr, theta, flow, coreX, coreY, ridgeIndex, RadialLoop.CONFIG.fractal.inner);
            // Inner loop gets purple-pink transition
            points.push([inner.x, inner.y, 0.6]);
            
            if (r < this.ridges / 6) {
                const third = this.generateFractalLoop(rr, theta, flow, inner.coreX, inner.coreY, ridgeIndex, RadialLoop.CONFIG.fractal.third);
                // Third loop gets more pink
                points.push([third.x, third.y, 0.75]);
                
                if (r < this.ridges / 12) {
                    const fourth = this.generateFractalLoop(rr, theta, flow, third.coreX, third.coreY, ridgeIndex, RadialLoop.CONFIG.fractal.fourth);
                    // Fourth loop gets full pink
                    points.push([fourth.x, fourth.y, 0.9]);
                }
            }
        }
        return points;
    }

    /**
     * Generates all trails for a given position and angle
     * @param {number} r - Ridge index
     * @param {number} theta - Current angle
     * @param {number} x - Current X coordinate
     * @param {number} y - Current Y coordinate
     * @param {number} centerX - Center X for tilt
     * @param {number} centerY - Center Y for tilt
     * @returns {Array} Array of trail points to add to path
     */
    generateAllTrails(r, theta, x, y, centerX, centerY) {
        const points = [];
        const t = RadialLoop.CONFIG.trails;
        
        if (r < this.ridges * t.ridgeThreshold && theta > t.left.start && theta < t.left.end) {
            const trailT = (theta - t.left.start) / (t.left.end - t.left.start);
            points.push(...this.generateTrails(x, y, theta, trailT, centerX, centerY));
        }
        
        if (r < this.ridges * t.ridgeThreshold && theta > t.right.start && theta < t.right.end) {
            const trailT = (theta - t.right.start) / (t.right.end - t.right.start);
            points.push(...this.generateTrails(x, y, theta, trailT, centerX, centerY));
        }
        
        return points;
    }

    calculateFlow(theta, r) {
        const f = RadialLoop.CONFIG.loop.flow;
        return Math.sin(theta * f.primary.freq + r * 0.15) * f.primary.amp + 
               Math.sin(theta * f.secondary.freq + r * 0.4) * f.secondary.amp;
    }

    calculateRadius(baseOffset, theta, r) {
        const rad = RadialLoop.CONFIG.loop.radius;
        return baseOffset + this.maxR * rad.base + rad.variation.amp * Math.sin(theta * rad.variation.freq + r * 0.6);
    }

    generateLoopPath(rr, theta, flow, coreX, coreY) {
        const curve = RadialLoop.CONFIG.core.curve;
        return {
            x: coreX + rr * Math.cos(theta + flow) * curve.x,
            y: coreY + rr * Math.sin(theta + flow) * curve.y
        };
    }



    calculateDistanceFromCore(x, y, coreX, coreY) {
        return Math.sqrt((x - coreX) ** 2 + (y - coreY) ** 2);
    }

    calculateSquaredDistanceFromCore(x, y, coreX, coreY) {
        const dx = x - coreX, dy = y - coreY;
        return dx * dx + dy * dy;
    }

  generate() {
    this.ridgePaths = [];
    for (let r = 0; r < this.ridges; r++) {
      this.ridgePaths.push(this.generatePath(r, 0));
    }
  }
  
      generatePath(r, baseOffset) {
        const path = [];
        const loopTurns = RadialLoop.CONFIG.loop.turns.base + RadialLoop.CONFIG.loop.turns.variation * (r / this.ridges);
        const coreX = this.cx - this.maxR * RadialLoop.CONFIG.core.position.xOffset;
        const coreY = this.cy - this.maxR * RadialLoop.CONFIG.core.position.yOffset;
        const ridgeIndex = r - this.ridges / 2;
        
        for (let i = 0; i < this.pointsPerRidge * loopTurns; i++) {
          const t = i / (this.pointsPerRidge * loopTurns);
          const theta = t * Math.PI * 2 * loopTurns;
          const flow = this.calculateFlow(theta, r);
          const rr = this.calculateRadius(baseOffset, theta, r);
          
          let {x, y} = this.generateLoopPath(rr, theta, flow, coreX, coreY);
          const distanceFromCore = Math.sqrt(this.calculateSquaredDistanceFromCore(x, y, coreX, coreY));
          const spacingMultiplier = this.calculateSpacingMultiplier(distanceFromCore, this.maxR * RadialLoop.CONFIG.spacing.coreDistance);
          
          ({x, y} = this.applyPerpendicularOffset(x, y, theta, flow, ridgeIndex, spacingMultiplier));
          ({x, y} = this.applyCoreEnhancement(x, y, coreX, coreY, theta, flow, this.maxR * RadialLoop.CONFIG.spacing.coreDistance));
          const tilted = this.applyTilt(x, y, this.cx, this.cy);
          
          // Main loop point with color graduation (blue → purple → pink)
          path.push([tilted.x, tilted.y, t]);
          
          // Fractal loops with enhanced color progression
          const fractalPoints = this.generateNestedFractalLoops(r, rr, theta, flow, coreX, coreY, ridgeIndex);
          fractalPoints.forEach((point, index) => {
            // Create smooth color transition for fractal loops
            const fractalT = t + (index + 1) * 0.1; // Gradual color progression
            path.push([point[0], point[1], Math.min(fractalT, 1.0)]);
          });
          
          // Trails with color graduation
          const trailPoints = this.generateAllTrails(r, theta, x, y, this.cx, this.cy);
          trailPoints.forEach((trail, index) => {
            // Trails get progressively more pink
            const trailT = t + (index + 1) * 0.15; // Enhanced pink progression
            path.push([trail[0], trail[1], Math.min(trailT, 1.0)]);
          });
        }
        return path.map(point => ({x: point[0], y: point[1], t: point[2]}));
      }
}

window.RadialLoop = RadialLoop;
