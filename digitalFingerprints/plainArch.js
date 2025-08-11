class PlainArch extends window.DigitalFingerprint {
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

  window.PlainArch = PlainArch;