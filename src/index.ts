import { initThreeJS } from './three/threeScene';
import { initD3 } from './d3/d3Visualization';
import { initP5 } from './p5/p5Sketch';
import { initWallet } from './wallet/walletManager';

// Initialize all components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js scene
    initThreeJS();
    
    // Initialize D3 visualization
    initD3();
    
    // Initialize P5 sketch
    initP5();
    
    // Initialize wallet connection
    initWallet();
}); 