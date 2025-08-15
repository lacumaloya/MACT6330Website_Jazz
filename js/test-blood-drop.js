// Simple test to demonstrate BloodDrop functionality
class BloodDropTest {
    constructor() {
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.bloodDrops = [];
        this.surface = { y: this.canvas.height - 50 };
        this.isRunning = false;
        
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
    
    setupEventListeners() {
        // Click anywhere to create a blood drop
        document.addEventListener('click', (e) => {
            if (e.target.closest('#contact-form')) return; // Don't interfere with form
            
            this.createBloodDrop(e.clientX, e.clientY);
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.surface.y = this.canvas.height - 50;
        });
    }
    
    createBloodDrop(x, y) {
        const drop = new BloodDrop(
            x,                    // x position
            y,                    // y position
            100,                  // height
            (Math.random() - 0.5) * 30,  // random angle
            2 + Math.random() * 2         // random velocity
        );
        
        this.bloodDrops.push(drop);
    }
    
    startTest() {
        // Create a few initial drops to demonstrate
        setTimeout(() => this.createBloodDrop(100, 100), 1000);
        setTimeout(() => this.createBloodDrop(300, 150), 2000);
        setTimeout(() => this.createBloodDrop(500, 120), 3000);
        
        this.run();
    }
    
    run() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        const animate = () => {
            this.update();
            this.draw();
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    update() {
        this.bloodDrops.forEach(drop => {
            drop.update(0.016, this.surface);
        });
        
        // Remove drops that are off-screen
        this.bloodDrops = this.bloodDrops.filter(drop => {
            return drop.currentX > -50 && 
                   drop.currentX < this.canvas.width + 50 &&
                   drop.currentY > -50 && 
                   drop.currentY < this.canvas.height + 50;
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw surface line
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.surface.y);
        this.ctx.lineTo(this.canvas.width, this.surface.y);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Draw all blood drops
        this.bloodDrops.forEach(drop => {
            drop.draw(this.ctx);
        });
        
        // Draw info
        this.drawInfo();
    }
    
    drawInfo() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Blood Drops: ${this.bloodDrops.length}`, 20, 30);
        this.ctx.fillText('Click anywhere to create blood drops!', 20, 50);
        this.ctx.restore();
    }
}

// Initialize test when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for BloodDrop class to load
    setTimeout(() => {
        if (window.BloodDrop) {
            new BloodDropTest();
        } else {
            console.error('BloodDrop class not found!');
        }
    }, 500);
});
