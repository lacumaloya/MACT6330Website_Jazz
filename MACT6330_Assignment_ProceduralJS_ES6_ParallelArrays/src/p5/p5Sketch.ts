import p5 from 'p5';

export function initP5(): void {
    new p5((p: p5) => {
        p.setup = () => {
            p.createCanvas(400, 400);
            p.background(220);
        };

        p.draw = () => {
            // Draw a circle that follows the mouse
            p.fill(255, 0, 0);
            p.noStroke();
            p.ellipse(p.mouseX, p.mouseY, 50, 50);
        };

        p.mousePressed = () => {
            // Change background color on mouse click
            p.background(p.random(255), p.random(255), p.random(255));
        };
    });
} 