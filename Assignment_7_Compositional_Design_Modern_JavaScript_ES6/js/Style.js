/**
 * Style class to encapsulate visual properties and rendering methods
 * Encapsulates: fill colors, stroke colors, shadows, highlights, opacity, and rendering styles
 */
class Style {
    constructor(fillColor, strokeColor, shadowColor, opacity = 1.0) {
        // Core colors (RGB arrays for easy manipulation)
        this.fillColor = fillColor || [255, 0, 0];        // Default blood red
        this.strokeColor = strokeColor || [100, 0, 0];    // Default dark red
        this.shadowColor = shadowColor || [100, 0, 0];    // Default shadow red
        
        // Visual properties
        this.opacity = opacity;
        this.hasShadow = true;
        this.hasHighlight = true;
        this.shadowOffset = 2;
        this.highlightIntensity = 0.5;
        
        // Rendering options
        this.useGradients = true;
        this.use3DEffects = true;
        this.blendMode = 'source-over';
    }

    // Getter methods for colors with opacity
    getFillStyle(alpha = 1.0) {
        const finalAlpha = alpha * this.opacity;
        return `rgba(${this.fillColor[0]}, ${this.fillColor[1]}, ${this.fillColor[2]}, ${finalAlpha})`;
    }

    getStrokeStyle(alpha = 1.0) {
        const finalAlpha = alpha * this.opacity;
        return `rgba(${this.strokeColor[0]}, ${this.strokeColor[1]}, ${this.strokeColor[2]}, ${finalAlpha})`;
    }

    getShadowStyle(alpha = 1.0) {
        const finalAlpha = alpha * this.opacity * 0.3; // Shadows are always darker
        return `rgba(${this.shadowColor[0]}, ${this.shadowColor[1]}, ${this.shadowColor[2]}, ${finalAlpha})`;
    }

    getHighlightStyle(alpha = 1.0) {
        const finalAlpha = alpha * this.opacity * this.highlightIntensity;
        return `rgba(255, 255, 255, ${finalAlpha})`;
    }

    // Style state management
    setFillState(enabled) {
        this.hasFill = enabled;
    }

    setStrokeState(enabled) {
        this.hasStroke = enabled;
    }

    setShadowState(enabled) {
        this.hasShadow = enabled;
    }

    setHighlightState(enabled) {
        this.hasHighlight = enabled;
    }

    // Color manipulation methods
    setFillColor(r, g, b) {
        this.fillColor = [r, g, b];
    }

    setStrokeColor(r, g, b) {
        this.strokeColor = [r, g, b];
    }

    setShadowColor(r, g, b) {
        this.shadowColor = [r, g, b];
    }

    // Opacity and blending
    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
    }

    setBlendMode(mode) {
        this.blendMode = mode;
    }

    // Gradient creation helpers
    createBloodGradient(ctx, x, y, size, alpha = 1.0) {
        if (!this.useGradients) {
            return this.getFillStyle(alpha);
        }

        const gradient = ctx.createRadialGradient(
            x - size * 0.3, 
            y - size * 0.2, 
            0,
            x, 
            y, 
            size
        );
        
        gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha * this.opacity})`);
        gradient.addColorStop(0.7, `rgba(200, 0, 0, ${alpha * this.opacity})`);
        gradient.addColorStop(1, `rgba(150, 0, 0, ${alpha * this.opacity})`);
        
        return gradient;
    }

    // Shadow rendering
    drawShadow(ctx, x, y, size, alpha = 1.0) {
        if (!this.hasShadow) return;

        ctx.fillStyle = this.getShadowStyle(alpha);
        ctx.beginPath();
        
        const shadowOffset = this.shadowOffset;
        const shadowTopX = x + shadowOffset;
        const shadowTopY = y - size + shadowOffset;
        const shadowBottomX = x + shadowOffset;
        const shadowBottomY = y + size * 0.8 + shadowOffset;
        const shadowLeftX = x - size * 0.6 + shadowOffset;
        const shadowRightX = x + size * 0.6 + shadowOffset;
        const shadowMidY = y + shadowOffset;
        
        ctx.moveTo(shadowTopX, shadowTopY);
        ctx.quadraticCurveTo(shadowLeftX, shadowMidY, shadowBottomX, shadowBottomY);
        ctx.quadraticCurveTo(shadowRightX, shadowMidY, shadowTopX, shadowTopY);
        ctx.closePath();
        ctx.fill();
    }

    // Highlight rendering
    drawHighlight(ctx, x, y, size, alpha = 1.0) {
        if (!this.hasHighlight) return;

        // Primary highlight
        ctx.fillStyle = this.getHighlightStyle(alpha);
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.15, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Secondary highlight for more depth
        ctx.fillStyle = this.getHighlightStyle(alpha * 0.6);
        ctx.beginPath();
        ctx.arc(x - size * 0.4, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    // Teardrop shape rendering
    drawTeardrop(ctx, x, y, size, alpha = 1.0, useGradient = true) {
        ctx.save();
        
        // Set blend mode if specified
        if (this.blendMode !== 'source-over') {
            ctx.globalCompositeOperation = this.blendMode;
        }
        
        // Fill style
        if (useGradient && this.useGradients) {
            ctx.fillStyle = this.createBloodGradient(ctx, x, y, size, alpha);
        } else {
            ctx.fillStyle = this.getFillStyle(alpha);
        }
        
        // Teardrop path
        ctx.beginPath();
        const topX = x;
        const topY = y - size;
        const bottomX = x;
        const bottomY = y + size * 0.8;
        const leftX = x - size * 0.6;
        const rightX = x + size * 0.6;
        const midY = y;
        
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(leftX, midY, bottomX, bottomY);
        ctx.quadraticCurveTo(rightX, midY, topX, topY);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    // Circle rendering
    drawCircle(ctx, x, y, size, alpha = 1.0, useGradient = false) {
        ctx.save();
        
        if (useGradient && this.useGradients) {
            ctx.fillStyle = this.createBloodGradient(ctx, x, y, size, alpha);
        } else {
            ctx.fillStyle = this.getFillStyle(alpha);
        }
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Apply style to context
    applyToContext(ctx) {
        ctx.globalCompositeOperation = this.blendMode;
        ctx.globalAlpha = this.opacity;
    }

    // Reset context to default
    resetContext(ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    }

    // Clone style for variations
    clone() {
        return new Style(
            [...this.fillColor],
            [...this.strokeColor],
            [...this.shadowColor],
            this.opacity
        );
    }

    // Create style variations
    createVariation(opacityMultiplier = 1.0, sizeMultiplier = 1.0) {
        const variation = this.clone();
        variation.opacity *= opacityMultiplier;
        variation.shadowOffset *= sizeMultiplier;
        return variation;
    }
}

// Make Style available globally
window.Style = Style;
