// --- Animation and cycling logic ---
(function() {
  // ===== CONSTANTS =====
  const ANIMATION_CONFIG = {
    DOTS_PER_FRAME: 10,
    TRANSITION_DELAY: 1800,
    INITIALIZATION_DELAY: 100,
    DOM_READY_DELAY: 100
  };

  const FINGERPRINT_CONFIG = {
    DEFAULT_RIDGES: 15,
    DEFAULT_POINTS_PER_RIDGE: 50,
    DOUBLE_LOOP_RIDGES: 15,
    DOUBLE_LOOP_POINTS: 120,
    RADIAL_LOOP_RIDGES: 15,
    RADIAL_LOOP_POINTS: 50
  };

  const PLAIN_ARCH_VARIATIONS = {
    COUNT: 12,
    ARCH_COUNT: 5,
    SIZE_MULTIPLIERS: [1.0, 0.85, 0.70, 0.55, 0.40],
    SPACING_BASE: 2.2,
    SPACING_INCREMENT: 0.2,
    ARCH_WIDTH_BASE: 1.1,
    ARCH_WIDTH_INCREMENT: 0.08,
    ARCH_HEIGHT_BASE: 0.7,
    ARCH_HEIGHT_INCREMENT: 0.04,
    ARCH_SEPARATION: 35,
    PARAMETER_EXTENSION: 1.4,
    PARAMETER_OFFSET: 0.2
  };

  const TENTED_ARCH_CONFIG = {
    RIDGE_MULTIPLIER: 3
  };

  // ===== STATE VARIABLES =====
  let types = [];
  let currentType = 0;
  let fingerprint = null;
  let dotsDrawn = [];
  let animating = true;
  let patternComplete = false;
  let plainArchCount = 0;
  let plainArchVariations = [];

  // ===== CANVAS SETUP =====
  const canvas = document.getElementById('fingerprint-canvas');
  if (!canvas) {
    console.error('Fingerprint canvas not found. Make sure the element with id "fingerprint-canvas" exists.');
    return;
  }
  console.log('Fingerprint canvas found:', canvas);
  const ctx = canvas.getContext('2d');

  // ===== PLAIN ARCH VARIATION FACTORY =====
  function createPlainArchVariations() {
    for (let i = 0; i < PLAIN_ARCH_VARIATIONS.COUNT; i++) {
      class PlainArchVariation extends DigitalFingerprint {
        constructor(canvas, ctx) {
          super(canvas, ctx);
          this.variationIndex = i;
        }
        
        generate() {
          this.ridgePaths = [];
          console.log('Generating PlainArchVariation with', this.ridges * PLAIN_ARCH_VARIATIONS.ARCH_COUNT, 'ridges (5 progressively smaller arches)');
          
          for (let r = 0; r < this.ridges * PLAIN_ARCH_VARIATIONS.ARCH_COUNT; r++) {
            let path = this.generatePath(r, 0);
            console.log('Ridge', r, 'has', path.length, 'points');
            this.ridgePaths.push(path);
          }
        }
        
        generatePath(r, baseOffset) {
          let path = [];
          let points = this.pointsPerRidge;
          
          // Determine which arch this ridge belongs to
          let archIndex = Math.floor(r / this.ridges);
          let ridgeIndex = (r % this.ridges) - this.ridges / 2;
          
          // Get size multiplier for this arch
          let sizeMultiplier = PLAIN_ARCH_VARIATIONS.SIZE_MULTIPLIERS[archIndex];
          
          // Calculate ridge spacing and arch dimensions
          let baseSpacing = PLAIN_ARCH_VARIATIONS.SPACING_BASE + (this.variationIndex * PLAIN_ARCH_VARIATIONS.SPACING_INCREMENT);
          let ridgeSpacing = baseSpacing * sizeMultiplier;
          
          let archWidth = this.maxR * (PLAIN_ARCH_VARIATIONS.ARCH_WIDTH_BASE + (this.variationIndex * PLAIN_ARCH_VARIATIONS.ARCH_WIDTH_INCREMENT)) * sizeMultiplier;
          let archHeight = this.maxR * (PLAIN_ARCH_VARIATIONS.ARCH_HEIGHT_BASE + (this.variationIndex * PLAIN_ARCH_VARIATIONS.ARCH_HEIGHT_INCREMENT)) * sizeMultiplier;
          
          console.log('generatePath called for ridge', r, 'ridgeIndex:', ridgeIndex);
          
          for (let i = 0; i < points; i++) {
            let t = (i / (points - 1)) * PLAIN_ARCH_VARIATIONS.PARAMETER_EXTENSION - PLAIN_ARCH_VARIATIONS.PARAMETER_OFFSET;
            
            // Calculate dynamic width with cleaner variations
            let dynamicWidth = archWidth + 2 * Math.sin(t * Math.PI * 2.2 + r * 0.5) + 
                              1 * Math.sin(t * Math.PI * 3.8 + r * 0.3) +
                              0.5 * Math.sin(t * Math.PI * 6.1 + r * 0.7);
            
            let x = this.cx - dynamicWidth * 0.5 + t * dynamicWidth;
            
            // Position arches progressively, centered as a group
            let y = this.cy + (archIndex - 2) * PLAIN_ARCH_VARIATIONS.ARCH_SEPARATION;
            
            // Apply arch curve only in main arch area
            let normalizedT = Math.max(0, Math.min(1, t));
            let archCurve = Math.sin(normalizedT * Math.PI) * archHeight * 0.85;
            
            // Simplified flow variations
            let flow = Math.sin(t * Math.PI * 1.5 + r * 0.2) * 0.15 + 
                       Math.sin(t * Math.PI * 2.8 + r * 0.4) * 0.08 +
                       Math.sin(t * Math.PI * 4.2 + r * 0.6) * 0.04;
            
            y -= archCurve + flow * archHeight * 0.15;
            
            // Enhanced tectonic plate layering
            let perpX = -Math.cos(normalizedT * Math.PI) * archHeight * 1.0;
            let perpY = 1.0;
            
            // Normalize perpendicular vector
            let perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
            perpX /= perpLength;
            perpY /= perpLength;
            
            // Whorl-like complex ridge spacing
            let dynamicSpacing = ridgeSpacing + Math.sin(t * Math.PI * 2.1 + r * 0.4) * 0.6 +
                                 Math.sin(t * Math.PI * 4.3 + r * 0.6) * 0.3 +
                                 Math.sin(t * Math.PI * 6.5 + r * 0.8) * 0.15 +
                                 Math.sin(t * Math.PI * 9.2 + r * 0.3) * 0.08 +
                                 Math.sin(t * Math.PI * 13.1 + r * 0.7) * 0.04;
            
            // Layer each ridge with stable spacing
            x += ridgeIndex * dynamicSpacing * perpX;
            y += ridgeIndex * dynamicSpacing * perpY;
            
            console.log('Ridge', r, 'point:', x, y, 'ridgeIndex:', ridgeIndex);
            
            path.push({x, y, t});
          }
          return path;
        }
      }
      plainArchVariations.push(PlainArchVariation);
    }
  }

  // ===== INITIALIZATION =====
  function initializeTypes() {
    // Wait for all fingerprint classes to be available
    if (!window.Whorl || !window.RadialLoop || !window.PlainArch || !window.TentedArch || !window.DoubleLoop) {
      console.log('Waiting for fingerprint classes to load...', {
        Whorl: !!window.Whorl,
        RadialLoop: !!window.RadialLoop,
        PlainArch: !!window.PlainArch,
        TentedArch: !!window.TentedArch,
        DoubleLoop: !!window.DoubleLoop
      });
      setTimeout(initializeTypes, ANIMATION_CONFIG.INITIALIZATION_DELAY);
      return false;
    }
    
    console.log('All fingerprint classes loaded successfully:', {
      Whorl: window.Whorl,
      RadialLoop: window.RadialLoop,
      PlainArch: window.PlainArch,
      TentedArch: window.TentedArch,
      DoubleLoop: window.DoubleLoop
    });
    
    types = [window.Whorl, window.RadialLoop, window.PlainArch, window.TentedArch, window.DoubleLoop];
    return true;
  }

  // ===== FINGERPRINT GENERATION =====
  function generateFingerprint() {
    // Ensure types are initialized
    if (!initializeTypes()) {
      return;
    }
    
    console.log('Generating fingerprint, currentType:', currentType, 'types array:', types);
    
    try {
      // Show 12 plain arch variations in sequence
      if (currentType === 2) { // PlainArch index
        plainArchCount = (plainArchCount + 1) % PLAIN_ARCH_VARIATIONS.COUNT;
        console.log('Creating PlainArchVariation', plainArchCount, 'from array:', plainArchVariations);
        fingerprint = new plainArchVariations[plainArchCount](canvas, ctx);
        console.log('Using PlainArchVariation', plainArchCount);
      } else {
        console.log('Creating fingerprint of type:', types[currentType], 'at index', currentType);
        fingerprint = new types[currentType](canvas, ctx);
        console.log('Using', types[currentType].name, 'at index', currentType);
      }
    } catch (error) {
      console.error('Error creating fingerprint:', error);
      return;
    }
    
    // Configure fingerprint parameters
    configureFingerprintParameters();
    
    if (!fingerprint) {
      console.error('Failed to create fingerprint instance');
      return;
    }
    
    fingerprint.generate();
    initializeDotsDrawn();
  }

  function configureFingerprintParameters() {
    if (fingerprint instanceof window.DoubleLoop) {
      console.log('DoubleLoop detected! Setting density...');
      fingerprint.ridges = FINGERPRINT_CONFIG.DOUBLE_LOOP_RIDGES;
      fingerprint.pointsPerRidge = FINGERPRINT_CONFIG.DOUBLE_LOOP_POINTS;
    } else if (fingerprint instanceof window.RadialLoop) {
      fingerprint.ridges = FINGERPRINT_CONFIG.RADIAL_LOOP_RIDGES;
      fingerprint.pointsPerRidge = FINGERPRINT_CONFIG.RADIAL_LOOP_POINTS;
    } else {
      fingerprint.ridges = FINGERPRINT_CONFIG.DEFAULT_RIDGES;
      fingerprint.pointsPerRidge = FINGERPRINT_CONFIG.DEFAULT_POINTS_PER_RIDGE;
    }
  }

  function initializeDotsDrawn() {
    if (fingerprint instanceof window.PlainArch || fingerprint.constructor.name.includes('PlainArchVariation')) {
      console.log('Creating PlainArch with 5x ridges');
      dotsDrawn = new Array(fingerprint.ridges * PLAIN_ARCH_VARIATIONS.ARCH_COUNT).fill(0);
      console.log('dotsDrawn array length:', dotsDrawn.length);
    } else if (fingerprint instanceof window.TentedArch) {
      console.log('Creating TentedArch with 3x ridges');
      dotsDrawn = new Array(fingerprint.ridges * TENTED_ARCH_CONFIG.RIDGE_MULTIPLIER).fill(0);
      console.log('dotsDrawn array length:', dotsDrawn.length);
    } else {
      // Default initialization for other fingerprint types
      dotsDrawn = new Array(fingerprint.ridges).fill(0);
      console.log('Creating', fingerprint.constructor.name, 'with', fingerprint.ridges, 'ridges');
      console.log('dotsDrawn array length:', dotsDrawn.length);
    }
  }

  // ===== DRAWING =====
  function drawFingerprint() {
    if (!fingerprint) {
      console.error('No fingerprint instance available for drawing');
      return;
    }
    if (!fingerprint.ridgePaths || !Array.isArray(fingerprint.ridgePaths)) {
      console.error('Fingerprint ridgePaths is not available or not an array');
      return;
    }
    if (!dotsDrawn || !Array.isArray(dotsDrawn)) {
      console.error('dotsDrawn is not available or not an array');
      return;
    }
    
    let stillDrawing = false;
    try {
      fingerprint.draw(dotsDrawn, ANIMATION_CONFIG.DOTS_PER_FRAME);
      for (let r = 0; r < fingerprint.ridgePaths.length; r++) {
        if (dotsDrawn[r] < fingerprint.ridgePaths[r].length) stillDrawing = true;
      }
    } catch (error) {
      console.error('Error during fingerprint drawing:', error);
      return;
    }
    
    if (!stillDrawing && !patternComplete) {
      patternComplete = true;
      setTimeout(() => {
        currentType = (currentType + 1) % types.length;
        generateFingerprint();
        patternComplete = false;
        requestAnimationFrame(drawFingerprint);
      }, ANIMATION_CONFIG.TRANSITION_DELAY);
    } else if (!patternComplete) {
      requestAnimationFrame(drawFingerprint);
    }
  }

  // ===== CONTROLS =====
  function restart() {
    generateFingerprint();
    patternComplete = false;
    animating = true;
    requestAnimationFrame(drawFingerprint);
  }

  // ===== EVENT LISTENERS =====
  window.addEventListener('resize', restart);

  // ===== INITIALIZATION =====
  function initializeFingerprints() {
    console.log('Starting fingerprint initialization after delay');
    try {
      createPlainArchVariations();
      generateFingerprint();
      requestAnimationFrame(drawFingerprint);
    } catch (error) {
      console.error('Error during fingerprint initialization:', error);
    }
  }

  // Wait for DOM to be ready before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM Content Loaded - initializing fingerprints');
      setTimeout(initializeFingerprints, ANIMATION_CONFIG.DOM_READY_DELAY);
    });
  } else {
    console.log('DOM already loaded - initializing fingerprints immediately');
    setTimeout(initializeFingerprints, ANIMATION_CONFIG.DOM_READY_DELAY);
  }

  console.log('Fingerprint script loaded successfully');
})(); 

