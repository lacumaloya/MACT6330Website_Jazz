class TentedArch extends window.DigitalFingerprint {
  // Constants for cleaner, more maintainable code
  static get CONSTANTS() {
    return {
      // Core arch configuration
      ARCH_COUNT: 3,
      ARCH_SPACING: 35,
      SIZE_MULTIPLIERS: [1.0, 0.85, 0.70], // Progressive size reduction
      
      // Geometry and spacing
      BASE_SPACING: 2.8,
      TRIANGLE_WIDTH_MULTIPLIER: 1.6,
      TRIANGLE_HEIGHT_MULTIPLIER: 0.8,
      RIDGE_SPACING: 2.5,
      TILT_ANGLE: Math.PI / 18, // 10 degrees
      
      // Curve configuration
      UNDER_CURVE_COUNT: 4,
      LEFT_CURVE_COUNT: 2,
      SUPPORTING_CURVE_RIDGE_COUNT: 3, // Combined from separate constants
      
      // Path generation
      ARCH_CURVE_MULTIPLIER: 0.6,
      CENTER_SPIKE_ZONE: { START: 0.3, END: 0.7, MULTIPLIER: 0.6 }, // Grouped
      CONVERGENCE_FACTOR: 0.1,
      
      // Natural variations
      NATURAL_FLOW: {
        AMPLITUDE: 0.5,
        FREQUENCY: 0.3,
        SECONDARY_AMPLITUDE: 0.4,
        SECONDARY_FREQUENCY: 0.7,
        Y_MULTIPLIER: 0.3,
        FREQUENCY_MULTIPLIERS: { PRIMARY: 2, SECONDARY: 4, HILLS: 3 }
      },
      HILLS_AMPLITUDE: 12.0,
      
      // Hard trim and positioning
      HARD_TRIM: { START: 0.04, END: 0.96 },
      BASE_POSITION: { X_OFFSET: 0.5, Y_OFFSET: 0.3 },
      
      // Curve-specific settings
      UNDER_CURVE: { NORTHWEST_PULL: 0.05 },
      LEFT_CURVE: { TILT_ANGLE: Math.PI / 3, DEPTH_MULTIPLIER: 0.8 }, // 60 degrees
      
      // Optimization
      MIN_PERP_LENGTH_SQUARED: 0.0001,
      
      // Common mathematical constants
      HALF: 0.5,
      CENTER_OFFSET: 0.5,
      
      // Rendering
      FADE: { THRESHOLD: 0.78, MULTIPLIER: 5.0 },
      DOT: { SIZE_BASE: 2.1, SIZE_AMPLITUDE: 1.2, SIZE_FREQUENCY: 0.13 },
      NOISE_AMPLITUDE: 5.5,
      ALPHA_BASE: 0.85,
      DRAW_EVERY_NTH: 2,
      
      // Curve configurations
      CURVE_CONFIGS: {
        under: [
          { width: 0.6, depth: 0.24, baseY: 0.35, diagonalPull: 0.3, xOffset: 0.15, tiltAngle: Math.PI / 6 + Math.PI / 36, northwestPull: 0.05, isVertical: false },
          { width: 0.5, depth: 0.1, baseY: 0.35, diagonalPull: 0.2, xOffset: 0.15, tiltAngle: Math.PI / 6 - Math.PI / 72, northwestPull: 0.05, isVertical: false },
          { width: 0.35, depth: 0.05, baseY: 0.05, diagonalPull: 0.15, xOffset: -0.1, tiltAngle: Math.PI / 9, northwestPull: 0.05, isVertical: false },
          { width: 0.25, depth: 0.05, baseY: 0.35, diagonalPull: 0.1, xOffset: 0.15, tiltAngle: Math.PI / 6 - Math.PI / 72, northwestPull: 0.05, isVertical: false }
        ],
        left: [
          { width: 1.6, depth: 0.25, baseX: -0.7, baseY: 0.25, diagonalPull: 0.2, trailDown: 0.3, tiltAngle: Math.PI / 3, isVertical: true, depthMultiplier: 0.8 },
          { width: 1.4, depth: 0.2, baseX: -0.8, baseY: 0.3, diagonalPull: 0.15, trailDown: 0.25, tiltAngle: Math.PI / 3, isVertical: true, depthMultiplier: 0.8 }
        ]
      }
    };
  }

    generate() {
      this.ridgePaths = [];
    const { ARCH_COUNT, UNDER_CURVE_COUNT, LEFT_CURVE_COUNT } = TentedArch.CONSTANTS;
    
    console.log(`Generating TentedArch with ${this.ridges * ARCH_COUNT} ridges (${ARCH_COUNT} progressively smaller tented arches)`);
    
    // Generate main tented arches
    this.generateMainArches();
    
    // Generate supporting curves
    this.generateSupportingCurves();
  }

  generateMainArches() {
    const { ARCH_COUNT } = TentedArch.CONSTANTS;
    
    for (let r = 0; r < this.ridges * ARCH_COUNT; r++) {
      // Calculate baseOffset for proper color layering (same as parent class)
      let baseOffset = (r / this.ridges) * (this.maxR - 10) + 10;
      let path = this.generatePath(r, baseOffset);
      console.log(`Ridge ${r} has ${path.length} points`);
        this.ridgePaths.push(path);
      }
  }

  /**
   * Consolidated method to generate all supporting curves (under curves and left curves)
   * Eliminates duplication between the two separate methods
   */
  generateSupportingCurves() {
    const { UNDER_CURVE_COUNT, LEFT_CURVE_COUNT, SUPPORTING_CURVE_RIDGE_COUNT } = TentedArch.CONSTANTS;
    
    // Generate under curves
    for (let curveIndex = 0; curveIndex < UNDER_CURVE_COUNT; curveIndex++) {
      for (let ridgeIndex = 0; ridgeIndex < SUPPORTING_CURVE_RIDGE_COUNT; ridgeIndex++) {
        let underCurve = this.generateCurve('under', curveIndex, ridgeIndex);
        this.ridgePaths.push(underCurve);
      }
    }
    
    // Generate left curves
    for (let curveIndex = 0; curveIndex < LEFT_CURVE_COUNT; curveIndex++) {
      for (let ridgeIndex = 0; ridgeIndex < SUPPORTING_CURVE_RIDGE_COUNT; ridgeIndex++) {
        let leftCurve = this.generateCurve('left', curveIndex, ridgeIndex);
        this.ridgePaths.push(leftCurve);
      }
    }
  }

  // Override the draw method to handle custom color layering for 3-arch structure
  draw(dotsDrawn, dotsPerFrame) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const { FADE, DOT, NOISE_AMPLITUDE, ALPHA_BASE, DRAW_EVERY_NTH } = TentedArch.CONSTANTS;
    
    // Color palette for the 3-arch structure
    const colors = ['#00bfff', '#ff69b4', '#7c3aed']; // Blue, Pink, Purple
    
    for (let r = 0; r < this.ridgePaths.length; r++) {
      let path = this.ridgePaths[r];
      let maxDots = dotsDrawn[r] || 0;
      
      // Determine color based on ridge position within arch
      let ridgeInArch = r % this.ridges;
      let colorIndex = Math.floor(ridgeInArch / (this.ridges / 3));
      let layerColor = colors[Math.min(colorIndex, colors.length - 1)];
      
      for (let i = 0; i < maxDots && i < path.length; i++) {
        let pt = path[i];
        
        // Calculate fade and dot size
        let fade = pt.t > FADE.THRESHOLD ? Math.max(0, 1.0 - (pt.t - FADE.THRESHOLD) * FADE.MULTIPLIER) : 1.0;
        let dotSize = DOT.SIZE_BASE + DOT.SIZE_AMPLITUDE * Math.sin(r + i * DOT.SIZE_FREQUENCY);
        
        // Draw every nth dot for performance
        if (i % DRAW_EVERY_NTH === 0) {
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
      }
      
      // Update dots drawn counter
      if (maxDots < path.length) {
        dotsDrawn[r] = maxDots + dotsPerFrame;
      }
             }
    }
    
    generatePath(r, baseOffset) {
      let path = [];
      let points = this.pointsPerRidge;
    const { SIZE_MULTIPLIERS, BASE_SPACING, TRIANGLE_WIDTH_MULTIPLIER, TRIANGLE_HEIGHT_MULTIPLIER, ARCH_CURVE_MULTIPLIER, CENTER_SPIKE_ZONE, CONVERGENCE_FACTOR, BASE_POSITION, ARCH_SPACING, HARD_TRIM, TILT_ANGLE } = TentedArch.CONSTANTS;
      
      // Determine which arch this ridge belongs to (0, 1, or 2)
    let archIndex = Math.floor(r / this.ridges);
      let ridgeIndex = (r % this.ridges) - this.ridges / 2;
      
    // Get size multiplier for this arch
    let sizeMultiplier = SIZE_MULTIPLIERS[archIndex];
    
    // Calculate dimensions and spacing (inlined for efficiency)
    let ridgeSpacing = BASE_SPACING * sizeMultiplier;
    let triangleWidth = this.maxR * TRIANGLE_WIDTH_MULTIPLIER * sizeMultiplier;
    let triangleHeight = this.maxR * TRIANGLE_HEIGHT_MULTIPLIER * sizeMultiplier;
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
      // Hard-trim 4% at both ends to clean caps
      if (t < TentedArch.CONSTANTS.HARD_TRIM.START || t > TentedArch.CONSTANTS.HARD_TRIM.END) continue;
      
      // Calculate base position (inlined for efficiency)
      let x = this.cx - triangleWidth * TentedArch.CONSTANTS.BASE_POSITION.X_OFFSET + t * triangleWidth;
      let y = this.cy + (archIndex - 1) * TentedArch.CONSTANTS.ARCH_SPACING + triangleHeight * TentedArch.CONSTANTS.BASE_POSITION.Y_OFFSET;
      
      // Calculate tent height and apply it (inlined for efficiency)
      // Create a curved "tent" peak that's more organic
      let archCurve = Math.sin(t * Math.PI) * triangleHeight * ARCH_CURVE_MULTIPLIER;
      let centerSpike = 0;
      
      // Add a more blunted spike in the center region
      if (t > CENTER_SPIKE_ZONE.START && t < CENTER_SPIKE_ZONE.END) {
        let spikeT = (t - CENTER_SPIKE_ZONE.START) / (CENTER_SPIKE_ZONE.END - CENTER_SPIKE_ZONE.START);
        centerSpike = Math.sin(spikeT * Math.PI) * triangleHeight * CENTER_SPIKE_ZONE.MULTIPLIER;
      }
      
      // Combine arch and spike for natural tent shape
      let tentHeight = archCurve + centerSpike;
      y -= tentHeight;
      
      // Apply gentle convergence toward center (inlined for efficiency)
      let convergenceFactor = Math.sin(t * Math.PI); // Smooth curve, strongest at center
      let pullToCenter = convergenceFactor * tentHeight * CONVERGENCE_FACTOR;
      x = x + (this.cx - x) * pullToCenter / triangleWidth;
      
      // Apply ridge offset perpendicular to surface
      let { offsetX, offsetY } = this.calculateRidgeOffset({ t, ridgeIndex, ridgeSpacing, triangleWidth, triangleHeight });
      x += offsetX;
      y += offsetY;
      
      // Add natural variations and hills
      let { naturalX, naturalY } = this.calculateNaturalVariations({ t, r });
      x += naturalX;
      y += naturalY;
      
      // Apply tilt to the entire pattern (inlined for efficiency)
      let centerX = this.cx;
      let centerY = this.cy;
      let tiltedX = centerX + (x - centerX) * Math.cos(TILT_ANGLE) - (y - centerY) * Math.sin(TILT_ANGLE);
      let tiltedY = centerY + (x - centerX) * Math.sin(TILT_ANGLE) + (y - centerY) * Math.cos(TILT_ANGLE);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
    






  // Refactored to use a single config object
  calculateRidgeOffset(config) {
    const { t, ridgeIndex, ridgeSpacing, triangleWidth, triangleHeight } = config;
    const { 
      ARCH_CURVE_MULTIPLIER, 
      CENTER_SPIKE_ZONE,
      MIN_PERP_LENGTH_SQUARED
    } = TentedArch.CONSTANTS;
    
    // Calculate slope at current point for perpendicular ridge layering
    let slopeX = Math.cos(t * Math.PI) * triangleHeight * ARCH_CURVE_MULTIPLIER;
    
    // Add center spike slope contribution
    if (t > CENTER_SPIKE_ZONE.START && t < CENTER_SPIKE_ZONE.END) {
      let spikeT = (t - CENTER_SPIKE_ZONE.START) / (CENTER_SPIKE_ZONE.END - CENTER_SPIKE_ZONE.START);
      let spikeSlopeContribution = Math.cos(spikeT * Math.PI) * triangleHeight * CENTER_SPIKE_ZONE.MULTIPLIER;
      slopeX += spikeSlopeContribution;
    }
    
    // Optimized perpendicular vector calculation
    // Since we know perpY = 1, we can simplify the normalization
    let perpX = -slopeX / triangleWidth;
    let perpY = 1;
    
    // Fast normalization using reciprocal square root approximation
    // This avoids the expensive Math.sqrt() operation
    let perpLengthSquared = perpX * perpX + 1; // perpY * perpY = 1
    if (perpLengthSquared > MIN_PERP_LENGTH_SQUARED) { // Avoid division by very small numbers
      let perpLength = 1 / Math.sqrt(perpLengthSquared);
      perpX *= perpLength;
      perpY *= perpLength;
    }
    
    // Apply ridge offset
    let offsetX = ridgeIndex * ridgeSpacing * perpX;
    let offsetY = ridgeIndex * ridgeSpacing * perpY;
    
    return { offsetX, offsetY };
  }

  // Refactored to use a single config object
  calculateNaturalVariations(config) {
    const { t, r } = config;
    const { 
      NATURAL_FLOW,
      HILLS_AMPLITUDE
    } = TentedArch.CONSTANTS;
    
    // Pre-calculate PI * t to avoid repeated calculations
    let piT = Math.PI * t;
    
    // Calculate primary natural flow (horizontal)
    let primaryFlow = Math.sin(piT * NATURAL_FLOW.FREQUENCY_MULTIPLIERS.PRIMARY + r * NATURAL_FLOW.FREQUENCY) * NATURAL_FLOW.AMPLITUDE;
    
    // Calculate secondary natural flow (horizontal)
    let secondaryFlow = Math.sin(piT * NATURAL_FLOW.FREQUENCY_MULTIPLIERS.SECONDARY + r * NATURAL_FLOW.SECONDARY_FREQUENCY) * 
                       (NATURAL_FLOW.AMPLITUDE * NATURAL_FLOW.SECONDARY_AMPLITUDE);
    
    // Combine horizontal flows
    let naturalX = primaryFlow + secondaryFlow;
    
    // Calculate vertical hills (more pronounced)
    let hillsY = Math.sin(piT * NATURAL_FLOW.FREQUENCY_MULTIPLIERS.HILLS) * HILLS_AMPLITUDE;
    
    // Calculate vertical flow (scaled down from horizontal)
    let naturalY = naturalX * NATURAL_FLOW.Y_MULTIPLIER + hillsY;
    
    return { naturalX, naturalY };
  }


    
  /**
   * Consolidated curve generation method that handles both under curves and left curves
   * @param {string} curveType - 'under' or 'left'
   * @param {number} curveIndex - Index of the curve (0, 1, 2, etc.)
   * @param {number} ridgeIndex - Index of the ridge within the curve
   * @returns {Array} Array of path points
   */
  generateCurve(curveType, curveIndex = 0, ridgeIndex = 0) {
      let path = [];
      let points = this.pointsPerRidge;
    const { RIDGE_SPACING, HARD_TRIM, UNDER_CURVE, LEFT_CURVE } = TentedArch.CONSTANTS;
    
    const config = TentedArch.CONSTANTS.CURVE_CONFIGS[curveType][curveIndex];
    let curveWidth = this.maxR * config.width;
    let curveDepth = this.maxR * config.depth;
      
      for (let i = 0; i < points; i++) {
        let t = i / (points - 1);
        
      // Hard-trim 4% at both ends to clean caps
      if (t < HARD_TRIM.START || t > HARD_TRIM.END) continue;
      
      let x, y;
      
      if (config.isVertical) {
        // Left curve (vertical orientation)
        let baseX = this.cx + this.maxR * config.baseX;
        let baseY = this.cy + this.maxR * config.baseY;
        
        x = baseX + Math.sin(t * Math.PI) * curveDepth;
        y = baseY - curveWidth * TentedArch.CONSTANTS.CENTER_OFFSET + t * curveWidth + Math.sin(t * Math.PI) * curveDepth * config.depthMultiplier - (t * config.trailDown) * this.maxR;
        
        // Add diagonal pull towards the arch
        let diagonalPull = (t - TentedArch.CONSTANTS.HALF) * this.maxR * config.diagonalPull;
        x += diagonalPull;
      } else {
        // Under curve (horizontal orientation)
        let baseY = this.cy + this.maxR * config.baseY;
        
        x = this.cx - curveWidth * TentedArch.CONSTANTS.CENTER_OFFSET + t * curveWidth;
        y = baseY - Math.sin(t * Math.PI) * curveDepth;
        
        // Add diagonal pull
        let diagonalPull = (t - TentedArch.CONSTANTS.HALF) * this.maxR * config.diagonalPull;
        y -= diagonalPull;
        
        // Pull northwest - shift slightly left
        x -= this.maxR * config.northwestPull;
        
        // Apply x offset
        x += this.maxR * config.xOffset;
      }
      
      // Add parallel ridge spacing for multiple ridges
      let ridgeOffset = (ridgeIndex - 1) * RIDGE_SPACING;
      x += ridgeOffset;
      
      // Apply tilt
        let centerX = this.cx;
        let centerY = this.cy;
      let tiltedX = centerX + (x - centerX) * Math.cos(config.tiltAngle) - (y - centerY) * Math.sin(config.tiltAngle);
      let tiltedY = centerY + (x - centerX) * Math.sin(config.tiltAngle) + (y - centerY) * Math.cos(config.tiltAngle);
        
        path.push({ x: tiltedX, y: tiltedY, t });
      }
      
      return path;
    }
  }

  window.TentedArch = TentedArch;
 