class BloodDrop {
    constructor(x, y, velocity) {
        // Position and initial state
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        
        // Current state
        this.currentX = x;
        this.currentY = y;
        this.currentVx = (Math.random() - 0.5) * velocity;
        this.currentVy = (Math.random() - 0.5) * velocity;
        
        // Drop properties
        this.size = 4 + Math.random() * 3; // Medium-sized drops
        this.opacity = 0.9 + Math.random() * 0.1;
        this.hasLanded = false;
        this.landingTime = 0;
        
        // Spatter properties
        this.spatterSize = 0;
        this.spatterPoints = [];
        this.dripDrops = [];
        
        // Physics constants
        this.gravity = 350; // ULTRA-EXTREME gravity for instant falling
        this.airResistance = 0.005; // Almost no air resistance for maximum speed
        
        // Disappearing properties
        this.fadeStartTime = 0;
        this.fadeDuration = 2000; // 2 seconds to fade (very slow for testing)
        this.isFading = false;
        
        // Debug counter
        this.updateCount = 0;
    }
    
    update(timeStep, surface) {
        if (this.hasLanded) {
            this.updateLandingEffects(timeStep);
            return;
        }
        
        // Apply gravity
        this.currentVy += this.gravity * timeStep;
        
        // Apply air resistance
        const speed = Math.sqrt(this.currentVx * this.currentVx + this.currentVy * this.currentVy);
        const airResistance = this.airResistance * speed * speed;
        
        if (speed > 0) {
            this.currentVx -= (this.currentVx / speed) * airResistance * timeStep;
            this.currentVy -= (this.currentVy / speed) * airResistance * timeStep;
        }
        
        // Update position
        this.currentX += this.currentVx * timeStep;
        this.currentY += this.currentVy * timeStep;
        
        // Check if landed on surface
        if (this.currentY >= surface.y && !this.hasLanded) {
            this.land(surface);
        }
    }
    
    updateLandingEffects(timeStep) {
        // Update drip drops
        this.dripDrops.forEach((drip, index) => {
            drip.y += drip.velocity * timeStep;
            drip.velocity += this.gravity * 2.5 * timeStep; // ULTRA-EXTREME gravity for instant dripping
            drip.life -= timeStep * 6000; // Ultra-fast life decrease
            
            // Remove dead drips
            if (drip.life <= 0) {
                this.dripDrops.splice(index, 1);
            }
        });
        
        // Update fade if already started
        if (this.isFading) {
            this.updateFade();
        }
    }
    
    land(surface) {
        this.hasLanded = true;
        this.landingTime = Date.now();
        
        // Calculate spatter size based on impact
        const impactVelocity = Math.sqrt(this.currentVx * this.currentVx + this.currentVy * this.currentVy);
        this.spatterSize = 1.5 + (impactVelocity * 0.3); // Subtle, minimal spatter
        
        // Generate spatter pattern
        this.generateSpatterPattern();
        this.generateDripEffect();
        
        // Start fading immediately
        this.startFading();
    }
    
    generateSpatterPattern() {
        this.spatterPoints = [];
        const numPoints = Math.floor(this.spatterSize * 0.8); // Minimal spatter points
        
        for (let i = 0; i < numPoints; i++) {
            // Create more realistic splatter pattern
            const angle = (Math.PI * 2 * i) / numPoints;
            const distance = Math.random() * this.spatterSize * 0.6; // Minimal spread
            
            let x = this.currentX + Math.cos(angle) * distance;
            let y = this.currentY + Math.sin(angle) * distance;
            
            // Add realistic randomness based on impact
            const randomSpread = this.spatterSize * 0.8;
            x += (Math.random() - 0.5) * randomSpread;
            y += (Math.random() - 0.5) * randomSpread;
            
            // Create different types of spatter
            const spatterType = Math.random();
            let size, opacity;
            
            if (spatterType < 0.3) {
                // Large spatter drops
                size = Math.random() * 2 + 1.5;
                opacity = Math.random() * 0.8 + 0.4;
            } else if (spatterType < 0.7) {
                // Medium spatter drops
                size = Math.random() * 1.5 + 0.8;
                opacity = Math.random() * 0.6 + 0.3;
            } else {
                // Small spatter drops
                size = Math.random() * 1 + 0.3;
                opacity = Math.random() * 0.5 + 0.2;
            }
            
            this.spatterPoints.push({
                x: x,
                y: y,
                size: size,
                opacity: opacity,
                originalOpacity: opacity, // Store original opacity for smooth fading
                type: spatterType < 0.3 ? 'large' : spatterType < 0.7 ? 'medium' : 'small'
            });
        }
    }
    
    generateDripEffect() {
        this.dripDrops = [];
        const dripCount = Math.floor(this.spatterSize * 0.4) + 1; // Minimal drips
        
        for (let i = 0; i < dripCount; i++) {
            // Create different types of drips
            const dripType = Math.random();
            let size, velocity, life;
            
            if (dripType < 0.2) {
                // Heavy drips
                size = Math.random() * 2.5 + 1.5;
                velocity = Math.random() * 40 + 25;
                life = Math.random() * 300 + 200;
            } else if (dripType < 0.6) {
                // Medium drips
                size = Math.random() * 1.8 + 1.0;
                velocity = Math.random() * 35 + 20;
                life = Math.random() * 250 + 150;
            } else {
                // Light drips
                size = Math.random() * 1.2 + 0.6;
                velocity = Math.random() * 30 + 15;
                life = Math.random() * 200 + 100;
            }
            
            this.dripDrops.push({
                x: this.currentX + (Math.random() - 0.5) * this.spatterSize * 0.5,
                y: this.currentY,
                velocity: velocity,
                size: size,
                opacity: Math.random() * 0.7 + 0.3,
                originalOpacity: Math.random() * 0.7 + 0.3, // Store original opacity for smooth fading
                life: life,
                type: dripType < 0.2 ? 'heavy' : dripType < 0.6 ? 'medium' : 'light'
            });
        }
    }
    
    startFading() {
        this.isFading = true;
        this.fadeStartTime = Date.now();
    }
    
    updateFade() {
        const elapsed = Date.now() - this.fadeStartTime;
        const fadeProgress = elapsed / this.fadeDuration;
        
        if (fadeProgress >= 1) {
            this.opacity = 0;
            // Ensure all spatter and drips are completely faded
            this.spatterPoints.forEach(point => {
                point.opacity = 0;
            });
            this.dripDrops.forEach(drip => {
                drip.opacity = 0;
            });
            return;
        }
        
        // Force opacity to decrease every frame
        this.opacity = Math.max(0, 1 - fadeProgress);
        
        // Also decrease opacity by a small amount each frame for immediate effect
        this.opacity = Math.max(0, this.opacity - 0.01);
        
        // Fade out spatter points immediately
        this.spatterPoints.forEach(point => {
            point.opacity = Math.max(0, point.opacity - 0.05); // Faster fade
        });
        
        // Fade out drip drops immediately
        this.dripDrops.forEach(drip => {
            drip.opacity = Math.max(0, drip.opacity - 0.05); // Faster fade
        });
    }
    
    draw(ctx) {
        if (!this.hasLanded) {
            this.drawDrop(ctx);
        } else {
                    // Force fade update every frame when drawing
        if (this.isFading) {
            this.updateFade(); // Force fade update every frame
        }
            this.drawSpatter(ctx);
            this.drawDrips(ctx);
        }
    }
    
    drawDrop(ctx) {
        ctx.save();
        
        // 3D Base shadow for depth
        ctx.fillStyle = `rgba(100, 0, 0, ${this.opacity * 0.3})`;
        ctx.beginPath();
        const shadowOffset = 2;
        const shadowTopX = this.currentX + shadowOffset;
        const shadowTopY = this.currentY - this.size + shadowOffset;
        const shadowBottomX = this.currentX + shadowOffset;
        const shadowBottomY = this.currentY + this.size * 0.8 + shadowOffset;
        const shadowLeftX = this.currentX - this.size * 0.6 + shadowOffset;
        const shadowRightX = this.currentX + this.size * 0.6 + shadowOffset;
        const shadowMidY = this.currentY + shadowOffset;
        
        ctx.moveTo(shadowTopX, shadowTopY);
        ctx.quadraticCurveTo(shadowLeftX, shadowMidY, shadowBottomX, shadowBottomY);
        ctx.quadraticCurveTo(shadowRightX, shadowMidY, shadowTopX, shadowTopY);
        ctx.closePath();
        ctx.fill();
        
        // Main teardrop shape with gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            this.currentX - this.size * 0.3, 
            this.currentY - this.size * 0.2, 
            0,
            this.currentX, 
            this.currentY, 
            this.size
        );
        gradient.addColorStop(0, `rgba(255, 0, 0, ${this.opacity})`);
        gradient.addColorStop(0.7, `rgba(200, 0, 0, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(150, 0, 0, ${this.opacity})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Teardrop path: start from top, curve down to bottom point, then back up
        const topX = this.currentX;
        const topY = this.currentY - this.size;
        const bottomX = this.currentX;
        const bottomY = this.currentY + this.size * 0.8;
        const leftX = this.currentX - this.size * 0.6;
        const rightX = this.currentX + this.size * 0.6;
        const midY = this.currentY;
        
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(leftX, midY, bottomX, bottomY);
        ctx.quadraticCurveTo(rightX, midY, topX, topY);
        ctx.closePath();
        ctx.fill();
        
        // Subtle 3D highlight (smaller and more focused)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.currentX - this.size * 0.25, this.currentY - this.size * 0.15, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Secondary highlight for more 3D depth
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(this.currentX - this.size * 0.4, this.currentY - this.size * 0.1, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawSpatter(ctx) {
        ctx.save();
        
        // Natural blood colors - no more purple test
        const bloodColor = 'rgba(255, 0, 0, '; // Natural red
        const shadowColor = 'rgba(100, 0, 0, '; // Dark red shadow
        
        // No large central geometry - just the natural splatter patterns
        
        // Spatter points with varied shapes and 3D effects
        this.spatterPoints.forEach(point => {
            // Different drawing styles based on spatter type
            if (point.type === 'large') {
                // Large spatter with 3D effect
                const shadowOffset = 1;
                ctx.fillStyle = `rgba(100, 0, 0, ${point.opacity * this.opacity * 0.3})`;
                ctx.beginPath();
                ctx.arc(point.x + shadowOffset, point.y + shadowOffset, point.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Main large spatter with gradient
                const gradient = ctx.createRadialGradient(
                    point.x - point.size * 0.3, point.y - point.size * 0.2, 0,
                    point.x, point.y, point.size
                );
                gradient.addColorStop(0, `rgba(255, 0, 0, ${point.opacity * this.opacity})`);
                gradient.addColorStop(0.8, `rgba(200, 0, 0, ${point.opacity * this.opacity * 0.8})`);
                gradient.addColorStop(1, `rgba(150, 0, 0, ${point.opacity * this.opacity * 0.6})`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Highlight for large spatter
                ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity * this.opacity * 0.4})`;
                ctx.beginPath();
                ctx.arc(point.x - point.size * 0.3, point.y - point.size * 0.2, point.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
                
            } else if (point.type === 'medium') {
                // Medium spatter with teardrop shape
                ctx.fillStyle = `rgba(255, 0, 0, ${point.opacity * this.opacity})`;
                ctx.beginPath();
                
                const pointTopX = point.x;
                const pointTopY = point.y - point.size;
                const pointBottomX = point.x;
                const pointBottomY = point.y + point.size * 0.8;
                const pointLeftX = point.x - point.size * 0.6;
                const pointRightX = point.x + point.size * 0.6;
                const pointMidY = point.y;
                
                ctx.moveTo(pointTopX, pointTopY);
                ctx.quadraticCurveTo(pointLeftX, pointMidY, pointBottomX, pointBottomY);
                ctx.quadraticCurveTo(pointRightX, pointMidY, pointTopX, pointTopY);
                ctx.closePath();
                ctx.fill();
                
            } else {
                // Small spatter as simple circles
                ctx.fillStyle = `rgba(255, 0, 0, ${point.opacity * this.opacity})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.restore();
    }
    
    drawDrips(ctx) {
        ctx.save();
        
        this.dripDrops.forEach(drip => {
            // Different drawing styles based on drip type
            if (drip.type === 'heavy') {
                // Heavy drips with 3D effect and long trails
                const shadowOffset = 1;
                ctx.fillStyle = `rgba(100, 0, 0, ${drip.opacity * this.opacity * 0.4})`;
                ctx.beginPath();
                ctx.arc(drip.x + shadowOffset, drip.y + shadowOffset, drip.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Main heavy drip with gradient
                const gradient = ctx.createRadialGradient(
                    drip.x - drip.size * 0.3, drip.y - drip.size * 0.2, 0,
                    drip.x, drip.y, drip.size
                );
                gradient.addColorStop(0, `rgba(255, 0, 0, ${drip.opacity * this.opacity})`);
                gradient.addColorStop(0.8, `rgba(200, 0, 0, ${drip.opacity * this.opacity * 0.8})`);
                gradient.addColorStop(1, `rgba(150, 0, 0, ${drip.opacity * this.opacity * 0.6})`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(drip.x, drip.y, drip.size, 0, Math.PI * 2);
                ctx.fill();
                
                // No trail lines - just the drip drops
                
            } else if (drip.type === 'medium') {
                // Medium drips with teardrop shape
                ctx.fillStyle = `rgba(255, 0, 0, ${drip.opacity * this.opacity})`;
                ctx.beginPath();
                
                const topX = drip.x;
                const topY = drip.y - drip.size;
                const bottomX = drip.x;
                const bottomY = drip.y + drip.size * 0.8;
                const leftX = drip.x - drip.size * 0.6;
                const rightX = drip.x + drip.size * 0.6;
                const midY = drip.y;
                
                ctx.moveTo(topX, topY);
                ctx.quadraticCurveTo(leftX, midY, bottomX, bottomY);
                ctx.quadraticCurveTo(rightX, midY, topX, topY);
                ctx.closePath();
                ctx.fill();
                
                // No trail lines - just the drip drops
                
            } else {
                // Light drips as simple circles with short trails
                ctx.fillStyle = `rgba(255, 0, 0, ${drip.opacity * this.opacity})`;
                ctx.beginPath();
                ctx.arc(drip.x, drip.y, drip.size, 0, Math.PI * 2);
                ctx.fill();
                
                // No trail lines - just the drip drops
            }
        });
        
        ctx.restore();
    }
    
    isCompletelyFaded() {
        return this.isFading && this.opacity < 0.01; // Use small threshold instead of exact 0
    }
}

// Make BloodDrop available globally
window.BloodDrop = BloodDrop;
