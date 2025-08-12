class TentedArch extends window.DigitalFingerprint {
  // Constants for cleaner, more maintainable code
  static get CONSTANTS() {
    return {
      ARCH_COUNT: 3,
      ARCH_SPACING: 35,
      SIZE_MULTIPLIERS: [1.0, 0.85, 0.70], // Progressive size reduction
      BASE_SPACING: 2.8,
      TRIANGLE_WIDTH_MULTIPLIER: 1.6,
      TRIANGLE_HEIGHT_MULTIPLIER: 0.8,
      RIDGE_SPACING: 2.5,
      TILT_ANGLE: Math.PI / 18, // 10 degrees
      UNDER_CURVE_COUNT: 4,
      LEFT_CURVE_COUNT: 2,
      // Additional constants for generatePath
      ARCH_CURVE_MULTIPLIER: 0.6,
      CENTER_SPIKE_ZONE_START: 0.3,
      CENTER_SPIKE_ZONE_END: 0.7,
      CENTER_SPIKE_MULTIPLIER: 0.6,
      CONVERGENCE_FACTOR: 0.1,
      NATURAL_FLOW_AMPLITUDE: 0.5,
      NATURAL_FLOW_FREQUENCY: 0.3,
      HILLS_AMPLITUDE: 12.0,
      HILLS_FREQUENCY: 3,
      // Hard trim constants
      HARD_TRIM_START: 0.04,
      HARD_TRIM_END: 0.96,
      // Position and sizing constants
      BASE_POSITION_X_OFFSET: 0.5,
      BASE_POSITION_Y_OFFSET: 0.3,
      // Natural flow constants
      NATURAL_FLOW_SECONDARY_AMPLITUDE: 0.4,
      NATURAL_FLOW_SECONDARY_FREQUENCY: 0.7,
      NATURAL_FLOW_Y_MULTIPLIER: 0.3,
      // Under curve constants
      UNDER_CURVE_NORTHWEST_PULL: 0.05,
      UNDER_CURVE_RIDGE_COUNT: 3,
      // Left curve constants
      LEFT_CURVE_TILT_ANGLE: Math.PI / 3, // 60 degrees
      LEFT_CURVE_DEPTH_MULTIPLIER: 0.8,
      // Natural variation constants
      PRIMARY_FLOW_FREQUENCY_MULTIPLIER: 2,
      SECONDARY_FLOW_FREQUENCY_MULTIPLIER: 4,
      HILLS_FREQUENCY_MULTIPLIER: 3,
      // Perpendicular vector optimization
      MIN_PERP_LENGTH_SQUARED: 0.0001
    };
  }

    generate() {
      this.ridgePaths = [];
    const { ARCH_COUNT, UNDER_CURVE_COUNT, LEFT_CURVE_COUNT } = TentedArch.CONSTANTS;
    
    console.log(`Generating TentedArch with ${this.ridges * ARCH_COUNT} ridges (${ARCH_COUNT} progressively smaller tented arches)`);
    
    // Generate main tented arches
    this.generateMainArches();
    
    // Generate supporting curves
    this.generateUnderCurves();
    this.generateLeftCurves();
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

  generateUnderCurves() {
    const { UNDER_CURVE_COUNT, UNDER_CURVE_RIDGE_COUNT } = TentedArch.CONSTANTS;
    
    // Generate multiple parallel ridges for each under curve
    for (let curveIndex = 0; curveIndex < UNDER_CURVE_COUNT; curveIndex++) {
      for (let ridgeIndex = 0; ridgeIndex < UNDER_CURVE_RIDGE_COUNT; ridgeIndex++) {
        let underCurve = this.generateUnderCurve(curveIndex, ridgeIndex);
        this.ridgePaths.push(underCurve);
      }
    }
  }

  generateLeftCurves() {
    const { LEFT_CURVE_COUNT, UNDER_CURVE_RIDGE_COUNT } = TentedArch.CONSTANTS;
    
    // Generate multiple parallel ridges for each left curve
    for (let curveIndex = 0; curveIndex < LEFT_CURVE_COUNT; curveIndex++) {
      for (let ridgeIndex = 0; ridgeIndex < UNDER_CURVE_RIDGE_COUNT; ridgeIndex++) {
        let leftCurve = this.generateLeftCurve(curveIndex, ridgeIndex);
        this.ridgePaths.push(leftCurve);
      }
    }
  }

  // Override the draw method to handle custom color layering for 3-arch structure
  draw(dotsDrawn, dotsPerFrame) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const { ARCH_COUNT } = TentedArch.CONSTANTS;
    
    for (let r = 0; r < this.ridgePaths.length; r++) {
      let path = this.ridgePaths[r];
      let maxDots = dotsDrawn[r] || 0;
      
      for (let i = 0; i < maxDots && i < path.length; i++) {
        let pt = path[i];
        
        // Determine color based on which arch this ridge belongs to
        let archIndex = Math.floor(r / this.ridges);
        let ridgeInArch = r % this.ridges;
        
        let layerColor;
        if (ridgeInArch < this.ridges / 3) {
          layerColor = '#00bfff'; // Blue
        } else if (ridgeInArch < (this.ridges * 2) / 3) {
          layerColor = '#7c3aed'; // Purple
        } else {
          layerColor = '#ff69b4'; // Pink
        }
        
        let fade = 1.0;
        if (pt.t > 0.78) fade = Math.max(0, 1.0 - (pt.t - 0.78) * 5.0);
        let dotSize = 2.1 + 1.2 * Math.sin(r + i * 0.13);
        
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
      }
      
      if (maxDots < path.length) {
        dotsDrawn[r] = maxDots + dotsPerFrame;
      }
             }
    }
    
  generatePath(r, baseOffset) {
    let path = [];
    let points = this.pointsPerRidge;
    const { ARCH_COUNT, SIZE_MULTIPLIERS, BASE_SPACING, TRIANGLE_WIDTH_MULTIPLIER, TRIANGLE_HEIGHT_MULTIPLIER } = TentedArch.CONSTANTS;
    
    // Determine which arch this ridge belongs to (0, 1, or 2)
    let archIndex = Math.floor(r / this.ridges);
    let ridgeIndex = (r % this.ridges) - this.ridges / 2;
    
    // Get size multiplier for this arch
    let sizeMultiplier = SIZE_MULTIPLIERS[archIndex];
    
    // Calculate dimensions and spacing
    let { triangleWidth, triangleHeight, ridgeSpacing } = this.calculateArchDimensions({ sizeMultiplier, baseSpacing: BASE_SPACING, widthMultiplier: TRIANGLE_WIDTH_MULTIPLIER, heightMultiplier: TRIANGLE_HEIGHT_MULTIPLIER });
    
    for (let i = 0; i < points; i++) {
      let t = i / (points - 1);
      
      // Hard-trim 4% at both ends to clean caps
      if (t < TentedArch.CONSTANTS.HARD_TRIM_START || t > TentedArch.CONSTANTS.HARD_TRIM_END) continue;
      
      // Calculate base position
      let { x, y } = this.calculateBasePosition({ t, archIndex, triangleWidth, triangleHeight });
      
      // Calculate tent height and apply it
      let tentHeight = this.calculateTentHeight({ t, triangleHeight });
      y -= tentHeight;
      
      // Apply gentle convergence toward center
      x = this.applyCenterConvergence({ x, t, tentHeight, triangleWidth });
      
      // Apply ridge offset perpendicular to surface
      let { offsetX, offsetY } = this.calculateRidgeOffset({ t, ridgeIndex, ridgeSpacing, triangleWidth, triangleHeight });
      x += offsetX;
      y += offsetY;
      
      // Add natural variations and hills
      let { naturalX, naturalY } = this.calculateNaturalVariations({ t, r });
      x += naturalX;
      y += naturalY;
      
      // Apply tilt to the entire pattern
      let { tiltedX, tiltedY } = this.applyTilt({ x, y });
      
      path.push({ x: tiltedX, y: tiltedY, t });
    }
    
    return path;
  }

  /**
   * Calculates arch dimensions using a configuration object
   * @param {Object} config - Configuration object
   * @param {number} config.sizeMultiplier - Size multiplier for this arch
   * @param {number} config.baseSpacing - Base spacing value
   * @param {number} config.widthMultiplier - Width multiplier
   * @param {number} config.heightMultiplier - Height multiplier
   * @returns {Object} Object containing triangleWidth, triangleHeight, and ridgeSpacing
   */
  calculateArchDimensions(config) {
    const { sizeMultiplier, baseSpacing, widthMultiplier, heightMultiplier } = config;
    
    let ridgeSpacing = baseSpacing * sizeMultiplier;
    let triangleWidth = this.maxR * widthMultiplier * sizeMultiplier;
    let triangleHeight = this.maxR * heightMultiplier * sizeMultiplier;
    
    return { triangleWidth, triangleHeight, ridgeSpacing };
  }

  /**
   * Calculates base position using a configuration object
   * @param {Object} config - Configuration object
   * @param {number} config.t - Parameter t (0 to 1)
   * @param {number} config.archIndex - Index of the arch (0, 1, or 2)
   * @param {number} config.triangleWidth - Width of the triangle
   * @param {number} config.triangleHeight - Height of the triangle
   * @returns {Object} Object containing x and y coordinates
   */
  calculateBasePosition(config) {
    const { t, archIndex, triangleWidth, triangleHeight } = config;
    const { ARCH_SPACING, BASE_POSITION_X_OFFSET, BASE_POSITION_Y_OFFSET } = TentedArch.CONSTANTS;
    
    let x = this.cx - triangleWidth * BASE_POSITION_X_OFFSET + t * triangleWidth;
    let y = this.cy + (archIndex - 1) * ARCH_SPACING + triangleHeight * BASE_POSITION_Y_OFFSET;
    
    return { x, y };
  }

  // Refactored to use a single config object
  calculateTentHeight(config) {
    const { t, triangleHeight } = config;
    const { ARCH_CURVE_MULTIPLIER, CENTER_SPIKE_ZONE_START, CENTER_SPIKE_ZONE_END, CENTER_SPIKE_MULTIPLIER } = TentedArch.CONSTANTS;
    
    // Create a curved "tent" peak that's more organic
    let archCurve = Math.sin(t * Math.PI) * triangleHeight * ARCH_CURVE_MULTIPLIER;
    let centerSpike = 0;
    
    // Add a more blunted spike in the center region
    if (t > CENTER_SPIKE_ZONE_START && t < CENTER_SPIKE_ZONE_END) {
      let spikeT = (t - CENTER_SPIKE_ZONE_START) / (CENTER_SPIKE_ZONE_END - CENTER_SPIKE_ZONE_START);
      centerSpike = Math.sin(spikeT * Math.PI) * triangleHeight * CENTER_SPIKE_MULTIPLIER;
    }
    
    // Combine arch and spike for natural tent shape
    return archCurve + centerSpike;
  }

  // Refactored to use a single config object
  applyCenterConvergence(config) {
    const { x, t, tentHeight, triangleWidth } = config;
    const { CONVERGENCE_FACTOR } = TentedArch.CONSTANTS;
    
    // Gentle convergence toward center (not sharp pull like compass)
    let convergenceFactor = Math.sin(t * Math.PI); // Smooth curve, strongest at center
    let pullToCenter = convergenceFactor * tentHeight * CONVERGENCE_FACTOR;
    return x + (this.cx - x) * pullToCenter / triangleWidth;
  }

  // Refactored to use a single config object
  calculateRidgeOffset(config) {
    const { t, ridgeIndex, ridgeSpacing, triangleWidth, triangleHeight } = config;
    const { 
      ARCH_CURVE_MULTIPLIER, 
      CENTER_SPIKE_ZONE_START, 
      CENTER_SPIKE_ZONE_END, 
      CENTER_SPIKE_MULTIPLIER,
      MIN_PERP_LENGTH_SQUARED
    } = TentedArch.CONSTANTS;
    
    // Calculate slope at current point for perpendicular ridge layering
    let slopeX = Math.cos(t * Math.PI) * triangleHeight * ARCH_CURVE_MULTIPLIER;
    
    // Add center spike slope contribution
    if (t > CENTER_SPIKE_ZONE_START && t < CENTER_SPIKE_ZONE_END) {
      let spikeT = (t - CENTER_SPIKE_ZONE_START) / (CENTER_SPIKE_ZONE_END - CENTER_SPIKE_ZONE_START);
      let spikeSlopeContribution = Math.cos(spikeT * Math.PI) * triangleHeight * CENTER_SPIKE_MULTIPLIER;
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
      NATURAL_FLOW_AMPLITUDE, 
      NATURAL_FLOW_FREQUENCY, 
      HILLS_AMPLITUDE, 
      HILLS_FREQUENCY, 
      NATURAL_FLOW_SECONDARY_AMPLITUDE, 
      NATURAL_FLOW_SECONDARY_FREQUENCY, 
      NATURAL_FLOW_Y_MULTIPLIER,
      PRIMARY_FLOW_FREQUENCY_MULTIPLIER,
      SECONDARY_FLOW_FREQUENCY_MULTIPLIER,
      HILLS_FREQUENCY_MULTIPLIER
    } = TentedArch.CONSTANTS;
    
    // Pre-calculate PI * t to avoid repeated calculations
    let piT = Math.PI * t;
    
    // Calculate primary natural flow (horizontal)
    let primaryFlow = Math.sin(piT * PRIMARY_FLOW_FREQUENCY_MULTIPLIER + r * NATURAL_FLOW_FREQUENCY) * NATURAL_FLOW_AMPLITUDE;
    
    // Calculate secondary natural flow (horizontal)
    let secondaryFlow = Math.sin(piT * SECONDARY_FLOW_FREQUENCY_MULTIPLIER + r * NATURAL_FLOW_SECONDARY_FREQUENCY) * 
                       (NATURAL_FLOW_AMPLITUDE * NATURAL_FLOW_SECONDARY_AMPLITUDE);
    
    // Combine horizontal flows
    let naturalX = primaryFlow + secondaryFlow;
    
    // Calculate vertical hills (more pronounced)
    let hillsY = Math.sin(piT * HILLS_FREQUENCY_MULTIPLIER) * HILLS_AMPLITUDE;
    
    // Calculate vertical flow (scaled down from horizontal)
    let naturalY = naturalX * NATURAL_FLOW_Y_MULTIPLIER + hillsY;
    
    return { naturalX, naturalY };
  }

  // Refactored to use a single config object
  applyTilt(config) {
    const { x, y } = config;
    const { TILT_ANGLE } = TentedArch.CONSTANTS;
    
    let centerX = this.cx;
    let centerY = this.cy;
    let tiltedX = centerX + (x - centerX) * Math.cos(TILT_ANGLE) - (y - centerY) * Math.sin(TILT_ANGLE);
    let tiltedY = centerY + (x - centerX) * Math.sin(TILT_ANGLE) + (y - centerY) * Math.cos(TILT_ANGLE);
    
    return { tiltedX, tiltedY };
  }
    
  generateUnderCurve(curveIndex = 0, ridgeIndex = 0) {
    let path = [];
    let points = this.pointsPerRidge;
    const { RIDGE_SPACING, UNDER_CURVE_NORTHWEST_PULL, HARD_TRIM_START, HARD_TRIM_END } = TentedArch.CONSTANTS;
    
    // Curve configuration based on index
    const curveConfigs = [
      { width: 0.6, depth: 0.24, baseY: 0.35, diagonalPull: 0.3, xOffset: 0.15, tiltAngle: Math.PI / 6 + Math.PI / 36 },
      { width: 0.5, depth: 0.1, baseY: 0.35, diagonalPull: 0.2, xOffset: 0.15, tiltAngle: Math.PI / 6 - Math.PI / 72 },
      { width: 0.35, depth: 0.05, baseY: 0.05, diagonalPull: 0.15, xOffset: -0.1, tiltAngle: Math.PI / 9 },
      { width: 0.25, depth: 0.05, baseY: 0.35, diagonalPull: 0.1, xOffset: 0.15, tiltAngle: Math.PI / 6 - Math.PI / 72 }
    ];
    
    const config = curveConfigs[curveIndex];
    let curveWidth = this.maxR * config.width;
    let curveDepth = this.maxR * config.depth;
    let baseY = this.cy + this.maxR * config.baseY;
    
    for (let i = 0; i < points; i++) {
      let t = i / (points - 1);
      
      // Hard-trim 4% at both ends to clean caps
      if (t < HARD_TRIM_START || t > HARD_TRIM_END) continue;
      
      // Create a smooth arc underneath
      let x = this.cx - curveWidth * 0.5 + t * curveWidth;
      let y = baseY - Math.sin(t * Math.PI) * curveDepth;
      
      // Add diagonal pull
      let diagonalPull = (t - 0.5) * this.maxR * config.diagonalPull;
      y -= diagonalPull;
      
      // Pull northwest - shift slightly left
      x -= this.maxR * UNDER_CURVE_NORTHWEST_PULL;
      
      // Apply x offset
      x += this.maxR * config.xOffset;
      
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
    
  generateLeftCurve(curveIndex = 0, ridgeIndex = 0) {
    let path = [];
    let points = this.pointsPerRidge;
    const { RIDGE_SPACING, LEFT_CURVE_TILT_ANGLE, LEFT_CURVE_DEPTH_MULTIPLIER, HARD_TRIM_START, HARD_TRIM_END } = TentedArch.CONSTANTS;
    
    // Left curve configuration based on index
    const leftCurveConfigs = [
      { width: 1.6, depth: 0.25, baseX: -0.7, baseY: 0.25, diagonalPull: 0.2, trailDown: 0.3 },
      { width: 1.4, depth: 0.2, baseX: -0.8, baseY: 0.3, diagonalPull: 0.15, trailDown: 0.25 }
    ];
    
    const config = leftCurveConfigs[curveIndex];
    let curveWidth = this.maxR * config.width;
    let curveDepth = this.maxR * config.depth;
    let baseX = this.cx + this.maxR * config.baseX;
    let baseY = this.cy + this.maxR * config.baseY;
    
    for (let i = 0; i < points; i++) {
      let t = i / (points - 1);
      
      // Hard-trim 4% at both ends to clean caps
      if (t < HARD_TRIM_START || t > HARD_TRIM_END) continue;
      
      // Create a vertical curve on the left side
      let x = baseX + Math.sin(t * Math.PI) * curveDepth;
      let y = baseY - curveWidth * 0.5 + t * curveWidth + Math.sin(t * Math.PI) * curveDepth * LEFT_CURVE_DEPTH_MULTIPLIER - (t * config.trailDown) * this.maxR;
      
      // Add parallel ridge spacing for thickness
      let ridgeOffset = (ridgeIndex - 1) * RIDGE_SPACING;
      x += ridgeOffset;
      
      // Add slight diagonal pull towards the arch
      let diagonalPull = (t - 0.5) * this.maxR * config.diagonalPull;
      x += diagonalPull;
      
      // Rotate to 2 o'clock position from top right
      let centerX = this.cx;
      let centerY = this.cy;
      let tiltedX = centerX + (x - centerX) * Math.cos(LEFT_CURVE_TILT_ANGLE) - (y - centerY) * Math.sin(LEFT_CURVE_TILT_ANGLE);
      let tiltedY = centerY + (x - centerX) * Math.sin(LEFT_CURVE_TILT_ANGLE) + (y - centerY) * Math.cos(LEFT_CURVE_TILT_ANGLE);
      
      path.push({ x: tiltedX, y: tiltedY, t });
    }
    
    return path;
  }
  }

  window.TentedArch = TentedArch;
 