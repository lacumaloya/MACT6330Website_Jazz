class SpatterExplosion {
    constructor(formElement) {
        this.formElement = formElement;
        this.explosionIntensity = 1.0;
        this.bloodDrops = [];
        this.isExploding = false;
        this.canvas = this.createExplosionCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.explosionStartTime = 0;
        
        // Explosion settings
        this.dropCount = 20;
        this.explosionDuration = 2000; // 2 seconds
        this.formShakeIntensity = 10;
    }
    
    createExplosionCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'explosion-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1001';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        return canvas;
    }
    
    trigger(formData) {
        if (this.isExploding) return;
        
        this.isExploding = true;
        this.explosionStartTime = Date.now();
        
        // Create explosion effect
        this.createExplosionEffect();
        this.generateBloodDrops(formData);
        this.animateExplosion();
        
        // Cleanup after explosion
        setTimeout(() => {
            this.cleanupAfterExplosion();
        }, this.explosionDuration);
    }
    
    createExplosionEffect() {
        // Form shake animation
        this.formElement.style.animation = 'none';
        this.formElement.offsetHeight; // Trigger reflow
        this.formElement.style.animation = `explosion ${this.explosionDuration}ms ease-out`;
        
        // Add explosion sound effect (optional)
        this.playExplosionSound();
        
        // Add visual explosion indicator
        this.addExplosionIndicator();
    }
    
    addExplosionIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'explosion-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255, 107, 107, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: explosionPulse 0.5s ease-out;
        `;
        
        this.formElement.style.position = 'relative';
        this.formElement.appendChild(indicator);
        
        // Remove indicator after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 500);
    }
    
    generateBloodDrops(formData) {
        const formRect = this.formElement.getBoundingClientRect();
        const centerX = formRect.left + formRect.width / 2;
        const centerY = formRect.top + formRect.height / 2;
        
        // Calculate drop count based on form data
        const messageLength = formData.message ? formData.message.length : 10;
        const emailLength = formData.email ? formData.email.length : 5;
        const nameLength = formData.name ? formData.name.length : 5;
        
        // More form content = more dramatic explosion
        const dropCount = Math.min(
            Math.floor((messageLength + emailLength + nameLength) / 3) + 10,
            this.dropCount
        );
        
        for (let i = 0; i < dropCount; i++) {
            const drop = new BloodDrop(
                centerX,
                centerY,
                this.calculateDropHeight(formData, i),
                this.calculateDropAngle(i, dropCount),
                this.calculateDropVelocity(formData, i)
            );
            this.bloodDrops.push(drop);
        }
    }
    
    calculateDropHeight(formData, index) {
        // Message length affects drop height
        const baseHeight = formData.message ? formData.message.length * 2 : 50;
        const variation = (Math.random() - 0.5) * 100;
        return Math.max(50, Math.min(300, baseHeight + variation));
    }
    
    calculateDropAngle(index, total) {
        // Spread drops in a circle with some randomness
        const baseAngle = (360 / total) * index;
        const randomVariation = (Math.random() - 0.5) * 30;
        return baseAngle + randomVariation;
    }
    
    calculateDropVelocity(formData, index) {
        // Email length affects velocity
        const baseVelocity = formData.email ? formData.email.length * 0.3 : 2;
        const randomBoost = Math.random() * 3;
        return Math.max(1, Math.min(8, baseVelocity + randomBoost));
    }
    
    animateExplosion() {
        const animate = () => {
            if (!this.isExploding) return;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let activeDrops = 0;
            
            this.bloodDrops.forEach(drop => {
                if (!drop.hasLanded) {
                    drop.update(0.016, { y: this.canvas.height - 50 });
                    drop.draw(this.ctx);
                    activeDrops++;
                } else {
                    drop.draw(this.ctx);
                }
            });
            
            // Draw explosion center indicator
            this.drawExplosionCenter();
            
            if (activeDrops > 0 || this.isExploding) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    drawExplosionCenter() {
        const formRect = this.formElement.getBoundingClientRect();
        const centerX = formRect.left + formRect.width / 2;
        const centerY = formRect.top + formRect.height / 2;
        
        // Draw explosion center glow
        const elapsed = Date.now() - this.explosionStartTime;
        const intensity = Math.max(0, 1 - (elapsed / this.explosionDuration));
        
        this.ctx.save();
        this.ctx.globalAlpha = intensity * 0.6;
        
        // Create radial gradient for explosion center
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 100
        );
        gradient.addColorStop(0, 'rgba(255, 107, 107, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    cleanupAfterExplosion() {
        this.isExploding = false;
        this.formElement.style.animation = '';
        
        // Remove explosion canvas
        if (this.canvas.parentNode) {
            this.canvas.remove();
        }
        
        // Clear blood drops array
        this.bloodDrops = [];
        
        // Trigger forensic analysis
        this.triggerForensicAnalysis();
    }
    
    triggerForensicAnalysis() {
        // This will be connected to the ForensicAnalysis class
        if (window.forensicAnalysis) {
            window.forensicAnalysis.processEvidence(this.getExplosionData());
        }
    }
    
    getExplosionData() {
        return {
            dropCount: this.bloodDrops.length,
            explosionDuration: this.explosionDuration,
            intensity: this.explosionIntensity,
            timestamp: new Date().toISOString()
        };
    }
    
    playExplosionSound() {
        // Optional: Add explosion sound effect
        // For now, we'll just log that sound would play
        console.log('💥 EXPLOSION SOUND EFFECT!');
        
        // Future enhancement: Add actual audio
        // this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // ... sound generation code
    }
    
    // Handle window resize
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}

// Make SpatterExplosion available globally
window.SpatterExplosion = SpatterExplosion;
