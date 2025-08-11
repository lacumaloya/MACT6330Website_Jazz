class TentedArch extends window.DigitalFingerprint {
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

  window.TentedArch = TentedArch;
 