/**
 * Generates a plain arch fingerprint pattern with layered ridges
 * Creates two overlapping arches with tectonic plate-like layering effect
 * @extends DigitalFingerprint
 */
class PlainArch extends window.DigitalFingerprint {
  // Constants for better maintainability
  static RIDGE_SPACING = 1.8;
  static ARCH_WIDTH_MULTIPLIER = 1.4;
  static ARCH_WIDTH_INCREMENT = 0.3;
  static ARCH_HEIGHT_MULTIPLIER = 0.9;
  static ARCH_HEIGHT_INCREMENT = 0.2;
  static SECOND_ARCH_OFFSET = 50;
  static TRIM_START = 0.04;
  static TRIM_END = 0.96;
  static ARCH_CURVE_MULTIPLIER = 0.7;
  static PERPENDICULAR_MULTIPLIER = 1.0;
  static BASE_Y_OFFSET = 0.3;
  static ARCH_SPACING = 0.4;

  /**
   * Generates the complete fingerprint pattern with two overlapping arches
   */
  generate() {
    this.ridgePaths = [];
    // Create double the ridges for two arches
    for (let ridgeIndex = 0; ridgeIndex < this.ridges * 2; ridgeIndex++) {
      let path = this.generatePath(ridgeIndex);
      this.ridgePaths.push(path);
    }
  }
  
  /**
   * Generates a single ridge path for the specified ridge index
   * @param {number} ridgeIndex - The index of the ridge to generate
   * @returns {Array} Array of points representing the ridge path
   */
  generatePath(ridgeIndex) {
    let path = [];
    let points = this.pointsPerRidge;
    
    // Determine which arch this ridge belongs to
    let archIndex = Math.floor(ridgeIndex / this.ridges);
    let ridgeInArch = (ridgeIndex % this.ridges) - this.ridges / 2;
    
    // Calculate arch dimensions
    let archWidth = this.calculateArchWidth(archIndex);
    let archHeight = this.calculateArchHeight(archIndex);
    
    // Generate each point along the ridge
    for (let pointIndex = 0; pointIndex < points; pointIndex++) {
      let progress = pointIndex / (points - 1);
      
      // Skip trimmed ends for clean caps
      if (this.shouldSkipPoint(progress)) continue;
      
      // Generate the point with all effects applied
      let point = this.generatePoint(progress, archWidth, archHeight, archIndex, ridgeInArch);
      path.push(point);
    }
    
    return path;
  }

  /**
   * Determines if a point should be skipped based on trimming rules
   * @param {number} progress - Progress along the arch (0 to 1)
   * @returns {boolean} True if the point should be skipped
   */
  shouldSkipPoint(progress) {
    return progress < PlainArch.TRIM_START || progress > PlainArch.TRIM_END;
  }

  /**
   * Generates a single point with all effects applied
   * @param {number} progress - Progress along the arch (0 to 1)
   * @param {number} archWidth - Width of the arch
   * @param {number} archHeight - Height of the arch
   * @param {number} archIndex - Index of the arch
   * @param {number} ridgeInArch - Ridge index within the arch
   * @returns {Object} Point object with x, y coordinates and progress
   */
  generatePoint(progress, archWidth, archHeight, archIndex, ridgeInArch) {
    // Start with base position
    let point = this.calculateBasePosition(progress, archWidth, archHeight, archIndex);
    
    // Apply arch curve
    point.y -= this.calculateArchCurve(progress, archHeight);
    
    // Apply tectonic plate layering
    this.applyTectonicLayering(point, progress, archHeight, ridgeInArch);
    
    // Offset second arch for visibility
    if (archIndex === 1) {
      point.x += PlainArch.SECOND_ARCH_OFFSET;
    }
    
    return { x: point.x, y: point.y, t: progress };
  }

  /**
   * Calculates the width of an arch based on its index
   * @param {number} archIndex - The index of the arch (0 or 1)
   * @returns {number} The calculated arch width
   */
  calculateArchWidth(archIndex) {
    return this.maxR * (PlainArch.ARCH_WIDTH_MULTIPLIER + archIndex * PlainArch.ARCH_WIDTH_INCREMENT);
  }

  /**
   * Calculates the height of an arch based on its index
   * @param {number} archIndex - The index of the arch (0 or 1)
   * @returns {number} The calculated arch height
   */
  calculateArchHeight(archIndex) {
    return this.maxR * (PlainArch.ARCH_HEIGHT_MULTIPLIER + archIndex * PlainArch.ARCH_HEIGHT_INCREMENT);
  }

  /**
   * Calculates the base position of a point on the arch
   * @param {number} progress - Progress along the arch (0 to 1)
   * @param {number} archWidth - Width of the arch
   * @param {number} archHeight - Height of the arch
   * @param {number} archIndex - Index of the arch
   * @returns {Object} Object with x and y coordinates
   */
  calculateBasePosition(progress, archWidth, archHeight, archIndex) {
    let x = this.cx - archWidth * 0.5 + progress * archWidth;
    let y = this.cy + archHeight * (PlainArch.BASE_Y_OFFSET + archIndex * PlainArch.ARCH_SPACING);
    return { x, y };
  }

  /**
   * Calculates the arch curve offset for a given progress
   * @param {number} progress - Progress along the arch (0 to 1)
   * @param {number} archHeight - Height of the arch
   * @returns {number} The curve offset to apply
   */
  calculateArchCurve(progress, archHeight) {
    return Math.sin(progress * Math.PI) * archHeight * PlainArch.ARCH_CURVE_MULTIPLIER;
  }

  /**
   * Applies tectonic plate layering effect to a point
   * @param {Object} point - The point to modify
   * @param {number} progress - Progress along the arch
   * @param {number} archHeight - Height of the arch
   * @param {number} ridgeInArch - Ridge index within the arch
   */
  applyTectonicLayering(point, progress, archHeight, ridgeInArch) {
    // Get the perpendicular direction for layering
    let perpVector = this.calculatePerpendicularVector(progress, archHeight);
    
    // Apply layering offset based on ridge position
    let offset = ridgeInArch * PlainArch.RIDGE_SPACING;
    point.x += offset * perpVector.x;
    point.y += offset * perpVector.y;
  }

  /**
   * Calculates the perpendicular vector for tectonic layering
   * @param {number} progress - Progress along the arch
   * @param {number} archHeight - Height of the arch
   * @returns {Object} Normalized perpendicular vector with x and y components
   */
  calculatePerpendicularVector(progress, archHeight) {
    // Calculate perpendicular direction
    let perpX = -Math.cos(progress * Math.PI) * archHeight * PlainArch.PERPENDICULAR_MULTIPLIER;
    let perpY = 1.0;
    
    // Normalize the vector
    let perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    
    return {
      x: perpX / perpLength,
      y: perpY / perpLength
    };
  }
}

window.PlainArch = PlainArch;