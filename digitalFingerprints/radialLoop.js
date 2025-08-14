class RadialLoop extends window.DigitalFingerprint {
    // Constants for loop generation
    static LOOP_TURNS_BASE = 1.0;
    static LOOP_TURNS_VARIATION = 0.3;
    static FLOW_PRIMARY_FREQ = 1.4;
    static FLOW_PRIMARY_AMP = 0.22;
    static FLOW_SECONDARY_FREQ = 2.8;
    static FLOW_SECONDARY_AMP = 0.08;
    static RADIUS_BASE_MULTIPLIER = 0.4;
    static RADIUS_VARIATION_AMP = 8;
    static RADIUS_VARIATION_FREQ = 1.8;
    
    // Core positioning constants
    static CORE_X_OFFSET = 0.2;
    static CORE_Y_OFFSET = 0.25;
    static LOOP_CURVE_X = 0.6;
    static LOOP_CURVE_Y = 1.5;
    
    // Ridge spacing constants
    static BASE_RIDGE_SPACING = 2.5;
    static CORE_DISTANCE_MULTIPLIER = 0.15;
    static CORE_SPACING_TIGHT = 0.6;
    static CORE_SPACING_LOOSE = 1.0;
    static BROAD_SPACING_AMP = 0.5;
    static BROAD_SPACING_RANGE = 0.3;
    
    // Core enhancement constants
    static CORE_ENHANCEMENT_START = Math.PI * 0.8;
    static CORE_ENHANCEMENT_END = Math.PI * 2.2;
    static CORE_ENHANCEMENT_RANGE = Math.PI * 1.4;
    static CORE_ENHANCEMENT_AMP = 0.4;
    static CORE_ENHANCEMENT_REDUCTION = 0.6;
    
    // Tilt constants
    static TILT_ANGLE = Math.PI / 6; // 30 degrees clockwise
    

    
    // Trail constants
    static TRAIL_RIDGE_THRESHOLD = 0.6;
    static LEFT_TRAIL_START = Math.PI * 1.2;
    static LEFT_TRAIL_END = Math.PI * 1.9;
    static RIGHT_TRAIL_START = Math.PI * 0.1;
    static RIGHT_TRAIL_END = Math.PI * 0.8;
    static TRAIL_RANGE = Math.PI * 0.7;
    static TRAIL_OFFSET_SPREAD = Math.PI * 0.08;
    static TRAIL_PERPENDICULAR_OFFSET = Math.PI * 0.5;
    static TRAIL_BASE_LENGTH = 0.4;
    static TRAIL_LENGTH_INCREMENT = 0.1;
    static TRAIL_LENGTH_VARIATION = 0.4;
    static TRAIL_CURVATURE_AMP = 0.1;
    static TRAIL_T_OFFSET = 0.85;
    static TRAIL_T_RANGE = 0.15;

    // Fractal loop configurations
    static FRACTAL_LOOPS = [
        {
            name: 'inner',
            ridgeThreshold: 3,
            scale: 0.925,
            offsetX: 0.05,
            offsetY: 0.02,
            coreDistance: 0.06,
            spacingMultiplier: 1.5,
            broadRange: 0.12
        },
        {
            name: 'third',
            ridgeThreshold: 6,
            scale: 0.7,
            offsetX: 0.02,
            offsetY: 0.01,
            coreDistance: 0.03,
            spacingMultiplier: 1.0,
            broadRange: 0.06
        },
        {
            name: 'fourth',
            ridgeThreshold: 12,
            scale: 0.6,
            offsetX: 0.01,
            offsetY: 0.005,
            coreDistance: 0.015,
            spacingMultiplier: 0.8,
            broadRange: 0.03
        }
    ];

    // Helper method for applying tilt transformation
    applyTilt(x, y, centerX, centerY) {
    return {
            x: centerX + (x - centerX) * Math.cos(RadialLoop.TILT_ANGLE) - (y - centerY) * Math.sin(RadialLoop.TILT_ANGLE),
            y: centerY + (x - centerX) * Math.sin(RadialLoop.TILT_ANGLE) + (y - centerY) * Math.cos(RadialLoop.TILT_ANGLE)
        };
    }

    // Helper method for calculating adaptive ridge spacing
    calculateSpacing(distanceFromCore, coreDistance, broadRange = RadialLoop.BROAD_SPACING_RANGE) {
        if (distanceFromCore < coreDistance * 2) {
            // Near core - tighter spacing
            return RadialLoop.CORE_SPACING_TIGHT + 0.4 * (distanceFromCore / (coreDistance * 2));
        } else {
            // Broader areas - more spaced
            return RadialLoop.CORE_SPACING_LOOSE + RadialLoop.BROAD_SPACING_AMP * 
                   ((distanceFromCore - coreDistance * 2) / (this.maxR * broadRange));
        }
    }

    // Helper method for generating fractal loops
    generateFractalLoop(loopConfig, parentCoreX, parentCoreY, r, theta, flow, rr, ridgeIndex, centerX, centerY) {
        const { scale, offsetX, offsetY, coreDistance, spacingMultiplier, broadRange } = loopConfig;
        
        // Calculate core position
        const coreX = parentCoreX + this.maxR * offsetX;
        const coreY = parentCoreY + this.maxR * offsetY;
        
        // Generate loop coordinates
        let x = coreX + (rr * scale) * Math.cos(theta + flow) * RadialLoop.LOOP_CURVE_X;
        let y = coreY + (rr * scale) * Math.sin(theta + flow) * RadialLoop.LOOP_CURVE_Y;
        
        // Apply adaptive spacing
        const distanceFromCore = Math.sqrt((x - coreX) * (x - coreX) + (y - coreY) * (y - coreY));
        const spacingMultiplierValue = this.calculateSpacing(distanceFromCore, coreDistance, broadRange);
        
        // Apply perpendicular offset
        const offsetResult = this.applyPerpendicularOffset(x, y, theta, flow, ridgeIndex, spacingMultiplier, spacingMultiplierValue);
        x = offsetResult.x;
        y = offsetResult.y;
        
        // Apply core enhancement
        if (theta > RadialLoop.CORE_ENHANCEMENT_START && theta < RadialLoop.CORE_ENHANCEMENT_END) {
            const coreIntensity = Math.sin((theta - RadialLoop.CORE_ENHANCEMENT_START) / RadialLoop.CORE_ENHANCEMENT_RANGE) * RadialLoop.CORE_ENHANCEMENT_AMP;
            const coreRadius = this.maxR * coreDistance;
            x = coreX + coreRadius * Math.cos(theta + flow) + (x - coreX) * (1 - coreIntensity * RadialLoop.CORE_ENHANCEMENT_REDUCTION);
            y = coreY + coreRadius * Math.sin(theta + flow) + (y - coreY) * (1 - coreIntensity * RadialLoop.CORE_ENHANCEMENT_REDUCTION);
        }
        
        // Apply tilt
        const tilted = this.applyTilt(x, y, centerX, centerY);
        
        return { x: tilted.x, y: tilted.y, coreX, coreY };
    }

    // Helper method for generating terminal trails
    generateTrails(x, y, theta, trailT, centerX, centerY, isLeftSide) {
        const trails = [];
        
        // Create 2 trails with rounded/curved paths
        for (let trailIndex = 0; trailIndex < 2; trailIndex++) {
            const trailOffset = trailIndex * RadialLoop.TRAIL_OFFSET_SPREAD;
            const baseTrailAngle = theta + RadialLoop.TRAIL_PERPENDICULAR_OFFSET + trailOffset;
            const trailLength = this.maxR * (RadialLoop.TRAIL_BASE_LENGTH + trailIndex * RadialLoop.TRAIL_LENGTH_INCREMENT) * (1 + trailT * RadialLoop.TRAIL_LENGTH_VARIATION);
            
            // Add curvature to make trails rounded
            const curvature = Math.sin(trailT * Math.PI) * this.maxR * RadialLoop.TRAIL_CURVATURE_AMP;
            const curveDirection = baseTrailAngle + RadialLoop.TRAIL_PERPENDICULAR_OFFSET;
            
            let trailX = x + trailLength * Math.cos(baseTrailAngle);
            let trailY = y + trailLength * Math.sin(baseTrailAngle);
            
            // Apply the rounding/curvature
            trailX += curvature * Math.cos(curveDirection);
            trailY += curvature * Math.sin(curveDirection);
            
            // Apply tilt
            const trailTilted = this.applyTilt(trailX, trailY, centerX, centerY);
            
            trails.push({ x: trailTilted.x, y: trailTilted.y, t: RadialLoop.TRAIL_T_OFFSET + trailT * RadialLoop.TRAIL_T_RANGE });
        }
        
        return trails;
    }

    // Helper method for applying perpendicular offset
    applyPerpendicularOffset(x, y, theta, flow, ridgeIndex, spacingMultiplier, spacingMultiplierValue) {
        // Calculate tangent vectors
        const tangentX = -Math.sin(theta + flow);
        const tangentY = Math.cos(theta + flow);
        
        // Apply perpendicular offset
        x += ridgeIndex * spacingMultiplier * spacingMultiplierValue * tangentY;
        y -= ridgeIndex * spacingMultiplier * spacingMultiplierValue * tangentX;
        
        return { x, y };
    }

  generate() {
    this.ridgePaths = [];
    for (let r = 0; r < this.ridges; r++) {
      this.ridgePaths.push(this.generatePath(r, 0));
    }
  }
  
  generatePath(r, baseOffset) {
      let path = [];
      let loopTurns = RadialLoop.LOOP_TURNS_BASE + RadialLoop.LOOP_TURNS_VARIATION * (r / this.ridges); // Varies by ridge like whorl
    
    for (let i = 0; i < this.pointsPerRidge * loopTurns; i++) {
        let t = i / (this.pointsPerRidge * loopTurns);
        let theta = t * Math.PI * 2 * loopTurns;
        
        // Layered sine waves for natural flow - like whorl genius!
        let flow = Math.sin(theta * RadialLoop.FLOW_PRIMARY_FREQ + r * 0.15) * RadialLoop.FLOW_PRIMARY_AMP + Math.sin(theta * RadialLoop.FLOW_SECONDARY_FREQ + r * 0.4) * RadialLoop.FLOW_SECONDARY_AMP;
        
        // Dynamic radius with natural variation
        let rr = baseOffset + this.maxR * RadialLoop.RADIUS_BASE_MULTIPLIER + RadialLoop.RADIUS_VARIATION_AMP * Math.sin(theta * RadialLoop.RADIUS_VARIATION_FREQ + r * 0.6);
        
        // Core position - upper-left of the loop
        let coreX = this.cx - this.maxR * RadialLoop.CORE_X_OFFSET;
        let coreY = this.cy - this.maxR * RadialLoop.CORE_Y_OFFSET;
        
        // Create loop structure: right → around core → right
        let x = coreX + rr * Math.cos(theta + flow) * RadialLoop.LOOP_CURVE_X; // Stronger curve - reduced from 0.8
        let y = coreY + rr * Math.sin(theta + flow) * RadialLoop.LOOP_CURVE_Y; // Stronger curve - increased from 1.2
        
        // Adaptive ridge spacing - tighter around core, spaced in broader areas
        let ridgeSpacing = RadialLoop.BASE_RIDGE_SPACING; // Base spacing
        let ridgeIndex = r - this.ridges / 2;
        
        // Calculate distance from core to determine spacing
        let distanceFromCore = Math.sqrt((x - coreX) * (x - coreX) + (y - coreY) * (y - coreY));
        let coreDistance = this.maxR * RadialLoop.CORE_DISTANCE_MULTIPLIER; // Core radius
        
        // Adjust spacing based on position - tighter near core, spaced in broader areas
        let spacingMultiplier = this.calculateSpacing(distanceFromCore, coreDistance);
        
        // Apply perpendicular offset with adaptive spacing
        const offsetResult = this.applyPerpendicularOffset(x, y, theta, flow, ridgeIndex, ridgeSpacing, spacingMultiplier);
        x = offsetResult.x;
        y = offsetResult.y;
        
        // Core enhancement - tighter curves near core
        if (theta > RadialLoop.CORE_ENHANCEMENT_START && theta < RadialLoop.CORE_ENHANCEMENT_END) {
          let coreIntensity = Math.sin((theta - RadialLoop.CORE_ENHANCEMENT_START) / RadialLoop.CORE_ENHANCEMENT_RANGE) * RadialLoop.CORE_ENHANCEMENT_AMP;
          let coreRadius = this.maxR * RadialLoop.CORE_DISTANCE_MULTIPLIER;
          x = coreX + coreRadius * Math.cos(theta + flow) + (x - coreX) * (1 - coreIntensity * RadialLoop.CORE_ENHANCEMENT_REDUCTION);
          y = coreY + coreRadius * Math.sin(theta + flow) + (y - coreY) * (1 - coreIntensity * RadialLoop.CORE_ENHANCEMENT_REDUCTION);
        }
        
        // Tilt the loop anatomically to the right
        let centerX = this.cx;
        let centerY = this.cy;
        let tilted = this.applyTilt(x, y, centerX, centerY);
        
        path.push({x: tilted.x, y: tilted.y, t});
        
                        // Add inner fractal loop - smaller version inside
        if (r < this.ridges / 3) { // Only for inner ridges
          const innerLoop = this.generateFractalLoop(RadialLoop.FRACTAL_LOOPS[0], coreX, coreY, r, theta, flow, rr, ridgeIndex, centerX, centerY);
          path.push({x: innerLoop.x, y: innerLoop.y, t});
          
          // Add third fractal loop - even smaller version inside the inner loop
          if (r < this.ridges / 6) { // Only for innermost ridges
            const thirdLoop = this.generateFractalLoop(RadialLoop.FRACTAL_LOOPS[1], innerLoop.coreX, innerLoop.coreY, r, theta, flow, rr, ridgeIndex, centerX, centerY);
            path.push({x: thirdLoop.x, y: thirdLoop.y, t});
            
            // Add fourth fractal loop - smallest version inside the third loop
            if (r < this.ridges / 12) { // Only for the very innermost ridges
              const fourthLoop = this.generateFractalLoop(RadialLoop.FRACTAL_LOOPS[2], thirdLoop.coreX, thirdLoop.coreY, r, theta, flow, rr, ridgeIndex, centerX, centerY);
              path.push({x: fourthLoop.x, y: fourthLoop.y, t});
            }
          }
        }
        
                // Add terminal trails that wrap around the loop - looser coverage
        if (r < this.ridges * RadialLoop.TRAIL_RIDGE_THRESHOLD && theta > RadialLoop.LEFT_TRAIL_START && theta < RadialLoop.LEFT_TRAIL_END) { // Looser range
          let trailT = (theta - RadialLoop.LEFT_TRAIL_START) / RadialLoop.TRAIL_RANGE; // 0 to 1 progression over reduced range
          
          // Generate left side trails
          const leftTrails = this.generateTrails(x, y, theta, trailT, centerX, centerY, true);
          leftTrails.forEach(trail => path.push(trail));
        }
        
                // Add terminal trails on the right side - mirroring the left side
        if (r < this.ridges * RadialLoop.TRAIL_RIDGE_THRESHOLD && theta > RadialLoop.RIGHT_TRAIL_START && theta < RadialLoop.RIGHT_TRAIL_END) { // Right side range
          let trailT = (theta - RadialLoop.RIGHT_TRAIL_START) / RadialLoop.TRAIL_RANGE; // 0 to 1 progression
          
          // Generate right side trails
          const rightTrails = this.generateTrails(x, y, theta, trailT, centerX, centerY, false);
          rightTrails.forEach(trail => path.push(trail));
        }

      }
      return path;
  }
}

window.RadialLoop = RadialLoop;
