// Skeleton Favicon Generator using pure HTML5 Canvas
// No p5.js dependencies - clean, conflict-free implementation
// Based on your existing skeleton code but adapted for favicon size

class SkeletonFavicon {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.size = 32; // Standard favicon size
        this.time = 0;
        
        this.setupCanvas();
        this.createFavicon();
        this.startAnimation();
    }
    
    setupCanvas() {
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.display = 'none'; // Hide the canvas element
    }
    
    createFavicon() {
        // Convert canvas to favicon format
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = this.canvas.toDataURL();
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    startAnimation() {
        const animate = () => {
            this.time += 0.02;
            this.drawSkeleton();
            this.createFavicon(); // Update favicon each frame
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    drawSkeleton() {
        const ctx = this.ctx;
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const scale = this.size / 120; // Scale factor for favicon size
        
        // Clear canvas
        ctx.clearRect(0, 0, this.size, this.size);
        
        // Background
        ctx.fillStyle = '#f5f2e6';
        ctx.fillRect(0, 0, this.size, this.size);
        
        // Breathing animation
        const breathScale = 1 + Math.sin(this.time * 2) * 0.1;
        
        // Draw skeleton with breathing effect
        this.drawSkull(ctx, centerX, centerY - 8, 8 * scale * breathScale);
        this.drawSpine(ctx, centerX, centerY, 12 * scale * breathScale);
        this.drawRibs(ctx, centerX, centerY - 2, 10 * scale * breathScale);
        this.drawPelvis(ctx, centerX, centerY + 8, 8 * scale * breathScale);
        this.drawArms(ctx, centerX, centerY - 2, 10 * scale * breathScale);
        this.drawLegs(ctx, centerX, centerY + 8, 10 * scale * breathScale);
    }
    
    drawSkull(ctx, x, y, size) {
        // Skull
        ctx.strokeStyle = '#b4aa8c';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#f5f2e6';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Eye sockets
        ctx.fillStyle = '#b4aa8c';
        ctx.beginPath();
        ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Nasal cavity
        ctx.beginPath();
        ctx.arc(x, y + size * 0.1, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSpine(ctx, x, y, length) {
        ctx.strokeStyle = '#b4aa8c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - length / 2);
        ctx.lineTo(x, y + length / 2);
        ctx.stroke();
    }
    
    drawRibs(ctx, x, y, width) {
        ctx.strokeStyle = '#b4aa8c';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        
        // Simple rib representation
        for (let i = 0; i < 3; i++) {
            const ribY = y - 2 + i * 2;
            const ribWidth = width - i * 1.5;
            ctx.moveTo(x - ribWidth / 2, ribY);
            ctx.lineTo(x + ribWidth / 2, ribY);
        }
        ctx.stroke();
    }
    
    drawPelvis(ctx, x, y, size) {
        ctx.strokeStyle = '#b4aa8c';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#f5f2e6';
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    
    drawArms(ctx, x, y, length) {
        ctx.strokeStyle = '#b4aa8c';
        ctx.lineWidth = 1;
        
        // Left arm
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - length * 0.4, y);
        ctx.stroke();
        
        // Right arm
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length * 0.4, y);
        ctx.stroke();
        
        // Joints
        ctx.fillStyle = '#b4aa8c';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.arc(x - length * 0.4, y, 1.5, 0, Math.PI * 2);
        ctx.arc(x + length * 0.4, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawLegs(ctx, x, y, length) {
        ctx.strokeStyle = '#b4aa8c';
        ctx.lineWidth = 1;
        
        // Left leg
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - length * 0.3, y + length * 0.4);
        ctx.stroke();
        
        // Right leg
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length * 0.3, y + length * 0.4);
        ctx.stroke();
        
        // Joints
        ctx.fillStyle = '#b4aa8c';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.arc(x - length * 0.3, y + length * 0.4, 1.5, 0, Math.PI * 2);
        ctx.arc(x + length * 0.3, y + length * 0.4, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize the favicon when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SkeletonFavicon();
});
