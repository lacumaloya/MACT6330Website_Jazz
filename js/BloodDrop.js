class BloodDrop {
    constructor(x, y, height, angle, velocity) {
        // Position and initial state
        this.x = x;
        this.y = y;
        this.height = height;
        this.angle = angle;
        this.angleRad = (angle * Math.PI) / 180;
        this.velocity = velocity;
        
        // Initial velocity components
        this.initialVx = velocity * Math.cos(this.angleRad);
        this.initialVy = velocity * Math.sin(this.angleRad);
        
        // Current state
        this.currentX = x;
        this.currentY = y;
        this.currentVx = this.initialVx;
        this.currentVy = this.initialVy;
        
        // Drop properties
        this.size = 4 + Math.random() * 3;
        this.opacity = 0.8 + Math.random() * 0.2;
        this.trajectory = [];
        this.hasLanded = false;
        this.landingTime = 0;
        
        // Spatter properties
        this.spatterSize = 0;
        this.spatterShape = 'circular';
        this.spatterPoints = [];
        
        // Physics constants
        this.gravity = 9.81;
        this.airResistance = 0.02;
        this.bounce = 0.7;
    }
    
    update(timeStep, surface) {
        if (this.hasLanded) return;
        
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
        
        // Store trajectory point
        this.trajectory.push({
            x: this.currentX,
            y: this.currentY,
            vx: this.currentVx,
            vy: this.currentVy
        });
        
        // Check if landed on surface
        if (this.currentY >= surface.y && !this.hasLanded) {
            this.land(surface);
        }
    }
    
    land(surface) {
        this.hasLanded = true;
        this.landingTime = Date.now();
        
        // Calculate spatter properties based on impact
        const impactVelocity = Math.sqrt(this.currentVx * this.currentVx + this.currentVy * this.currentVy);
        this.spatterSize = 3 + (impactVelocity * 2);
        
        // Generate spatter pattern
        this.generateSpatterPattern();
    }
    
    generateSpatterPattern() {
        this.spatterPoints = [];
        const numPoints = Math.floor(this.spatterSize * 2);
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 * i) / numPoints;
            const distance = Math.random() * this.spatterSize;
            
            let x = this.currentX + Math.cos(angle) * distance;
            let y = this.currentY + Math.sin(angle) * distance;
            
            // Add some randomness to spatter points
            x += (Math.random() - 0.5) * 5;
            y += (Math.random() - 0.5) * 5;
            
            this.spatterPoints.push({
                x: x,
                y: y,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    draw(ctx) {
        if (!this.hasLanded) {
            this.drawTrajectory(ctx);
            this.drawDrop(ctx);
        } else {
            this.drawSpatter(ctx);
        }
    }
    
    drawTrajectory(ctx) {
        if (this.trajectory.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.trajectory.length; i++) {
            const point = this.trajectory[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        
        ctx.stroke();
        ctx.restore();
    }
    
    drawDrop(ctx) {
        ctx.save();
        
        // Main drop
        ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.currentX, this.currentY, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.currentX - this.size * 0.3, this.currentY - this.size * 0.3, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawSpatter(ctx) {
        ctx.save();
        
        // Main impact point
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.currentX, this.currentY, this.spatterSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Spatter points
        this.spatterPoints.forEach(point => {
            ctx.fillStyle = `rgba(255, 0, 0, ${point.opacity})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    getAnalysisData() {
        if (!this.hasLanded) return null;
        
        return {
            impactVelocity: Math.sqrt(this.currentVx * this.currentVx + this.currentVy * this.currentVy),
            impactAngle: Math.atan2(Math.abs(this.currentVy), Math.abs(this.currentVx)) * 180 / Math.PI,
            spatterSize: this.spatterSize,
            spatterShape: this.spatterShape,
            landingTime: this.landingTime
        };
    }
}

// Make BloodDrop available globally
window.BloodDrop = BloodDrop;
