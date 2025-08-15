// Test file to demonstrate Style class functionality
class StyleTest {
    constructor() {
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.styles = [];
        this.currentTime = 0;
        
        this.setupStyles();
        this.setupEventListeners();
        this.startTest();
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1000';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        return canvas;
    }
    
    setupStyles() {
        // Create different blood styles
        this.styles = [
            // Fresh blood - bright red
            new Style([255, 0, 0], [150, 0, 0], [100, 0, 0], 0.9),
            
            // Dried blood - darker red
            new Style([180, 0, 0], [120, 0, 0], [80, 0, 0], 0.8),
            
            // Arterial blood - bright red with blue tint
            new Style([255, 20, 20], [180, 0, 0], [120, 0, 0], 0.95),
            
            // Venous blood - darker red
            new Style([200, 0, 0], [140, 0, 0], [90, 0, 0], 0.85)
        ];
        
        // Customize some styles
        this.styles[1].setShadowState(false); // No shadow for dried blood
        this.styles[2].setHighlightState(true); // Bright highlights for arterial
        this.styles[3].setGradients(false); // No gradients for venous
    }
    
    setupEventListeners() {
        // Click to cycle through styles
        document.addEventListener('click', (e) => {
            if (e.target.closest('#contact-form')) return;
            this.cycleStyle();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    cycleStyle() {
        // Rotate through styles
        const currentStyle = this.styles.shift();
        this.styles.push(currentStyle);
        console.log('Switched to style:', currentStyle.fillColor);
    }
    
    startTest() {
        this.run();
    }
    
    run() {
        const animate = () => {
            this.update();
            this.draw();
            this.currentTime += 0.016;
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    update() {
        // Update any animations if needed
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw different blood drops with different styles
        this.drawBloodDropExamples();
        
        // Draw info
        this.drawInfo();
    }
    
    drawBloodDropExamples() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const spacing = 120;
        
        this.styles.forEach((style, index) => {
            const x = centerX + (index - 1.5) * spacing;
            const y = centerY;
            const size = 20 + Math.sin(this.currentTime + index) * 5;
            
            // Draw shadow first
            style.drawShadow(this.ctx, x, y, size, 0.8);
            
            // Draw main teardrop
            style.drawTeardrop(this.ctx, x, y, size, 0.9);
            
            // Draw highlights
            style.drawHighlight(this.ctx, x, y, size, 0.8);
            
            // Draw style label
            this.drawStyleLabel(x, y + size + 30, style, index);
        });
    }
    
    drawStyleLabel(x, y, style, index) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        
        const labels = ['Fresh Blood', 'Dried Blood', 'Arterial Blood', 'Venous Blood'];
        this.ctx.fillText(labels[index], x, y);
        
        // Show color values
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        this.ctx.fillText(`RGB: ${style.fillColor.join(', ')}`, x, y + 20);
        
        this.ctx.restore();
    }
    
    drawInfo() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText('Style Class Test - Click to cycle styles', 20, 30);
        this.ctx.fillText('Current Style Features:', 20, 60);
        this.ctx.fillText('• Shadow rendering', 20, 80);
        this.ctx.fillText('• Highlight effects', 20, 100);
        this.ctx.fillText('• Gradient support', 20, 120);
        this.ctx.fillText('• Opacity control', 20, 140);
        this.ctx.fillText('• Color variations', 20, 160);
        
        this.ctx.restore();
    }
}

// Initialize test when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Style class to load
    setTimeout(() => {
        if (window.Style) {
            new StyleTest();
        } else {
            console.error('Style class not found!');
        }
    }, 500);
});
