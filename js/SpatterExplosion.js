class SpatterExplosion {
    constructor(formElement) {
        this.formElement = formElement;
        this.bloodDrops = [];
        this.isExploding = false;
        this.canvas = this.createExplosionCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.explosionStartTime = 0;
        
        // Explosion settings
        this.dropCount = 8; // Minimal drops for subtle effect
        this.explosionDuration = 1000; // 1 second
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
    
    trigger(formData, cursorX, cursorY) {
        if (this.isExploding) return;
        
        this.isExploding = true;
        this.explosionStartTime = Date.now();
        
        // Generate blood drops immediately
        this.generateBloodDrops(cursorX, cursorY, formData);
        
        // Create explosion effect
        this.createExplosionEffect();
        
        // Start animation immediately
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
    }
    
    generateBloodDrops(cursorX, cursorY, formData) {
        // Use cursor position as origin
        const originX = cursorX || window.innerWidth / 2;
        const originY = cursorY || window.innerHeight / 2;
        
        // Calculate drop count based on form data
        const messageLength = formData.message ? formData.message.length : 10;
        const dropCount = Math.min(
            Math.floor(messageLength / 8) + 3, // Reduced base count
            this.dropCount
        );
        
        for (let i = 0; i < dropCount; i++) {
            const drop = new BloodDrop(
                originX,
                originY,
                this.calculateDropVelocity(formData, i)
            );
            this.bloodDrops.push(drop);
        }
    }
    
    calculateDropVelocity(formData, index) {
        // Email length affects velocity
        const baseVelocity = formData.email ? formData.email.length * 0.2 : 3;
        const randomBoost = Math.random() * 2;
        return Math.max(2, Math.min(6, baseVelocity + randomBoost));
    }
    
    animateExplosion() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            let activeDrops = 0;
            let allDropsFaded = true;
            
            this.bloodDrops.forEach(drop => {
                if (!drop.hasLanded) {
                    drop.update(0.016, { y: this.canvas.height - 50 });
                    drop.draw(this.ctx);
                    activeDrops++;
                } else {
                    drop.draw(this.ctx);
                    if (!drop.isCompletelyFaded()) {
                        allDropsFaded = false;
                        // Add debugging for fade status
                        console.log(`Drop not completely faded: opacity=${drop.opacity.toFixed(3)}, isFading=${drop.isFading}`);
                    }
                }
            });
            
            // Draw explosion center indicator
            if (this.isExploding) {
                this.drawExplosionCenter();
            }
            
            // Continue animation if there are active drops or if drops are still fading
            if (activeDrops > 0 || !allDropsFaded) {
                requestAnimationFrame(animate);
            } else {
                // All drops have faded out, clean up
                console.log('🎯 All drops faded - cleaning up animation');
                this.finalCleanup();
            }
        };
        
        animate();
    }
    
    drawExplosionCenter() {
        // Find the center of all blood drops
        if (this.bloodDrops.length === 0) return;
        
        let centerX = 0, centerY = 0;
        this.bloodDrops.forEach(drop => {
            centerX += drop.x;
            centerY += drop.y;
        });
        centerX /= this.bloodDrops.length;
        centerY /= this.bloodDrops.length;
        
        // Draw explosion center glow
        const elapsed = Date.now() - this.explosionStartTime;
        const intensity = Math.max(0, 1 - (elapsed / this.explosionDuration));
        
        this.ctx.save();
        this.ctx.globalAlpha = intensity * 0.4;
        
        // Create radial gradient for explosion center
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 80
        );
        gradient.addColorStop(0, 'rgba(255, 107, 107, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    cleanupAfterExplosion() {
        this.isExploding = false;
        this.formElement.style.animation = '';
        
        // Don't remove canvas yet - let blood drops fade out naturally
        // The canvas will be removed when all drops are completely faded
    }
    
    finalCleanup() {
        // Remove explosion canvas
        if (this.canvas.parentNode) {
            this.canvas.remove();
        }
        
        // Clear blood drops array
        this.bloodDrops = [];
        
        console.log('🧹 Blood spatter cleanup complete');
    }
    
    playExplosionSound() {
        // Optional: Add explosion sound effect
        console.log('💥 EXPLOSION SOUND EFFECT!');
    }
    
    // Handle window resize
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}

// Make SpatterExplosion available globally
window.SpatterExplosion = SpatterExplosion;
