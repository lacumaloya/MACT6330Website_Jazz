class RadialLoop extends window.DigitalFingerprint {
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

  window.RadialLoop = RadialLoop;
