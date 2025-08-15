// Test file to demonstrate the SpatterExplosion effect
class ExplosionTest {
    constructor() {
        this.formElement = document.getElementById('contact-form');
        this.spatterExplosion = null;
        this.cursorX = 0;
        this.cursorY = 0;
        this.setupForm();
        this.setupTestButton();
        this.setupCursorTracking();
    }
    
    setupForm() {
        if (!this.formElement) {
            console.error('Contact form not found!');
            return;
        }
        
        // Add forensic styling
        this.formElement.classList.add('forensic-form');
        
        // Change submit button text
        const submitButton = this.formElement.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = '🔍 Submit Evidence';
            submitButton.classList.add('forensic-submit');
        }
        
        // Initialize spatter explosion
        this.spatterExplosion = new SpatterExplosion(this.formElement);
        
        // Override form submission
        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }
    
    setupCursorTracking() {
        // Track cursor position for explosion origin
        document.addEventListener('mousemove', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
        });
        
        // Track cursor position on click
        document.addEventListener('click', (e) => {
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
        });
    }
    
    setupTestButton() {
        // Add a test button above the form
        const testButton = document.createElement('button');
        testButton.textContent = '🧪 Test Explosion';
        testButton.style.cssText = `
            background: linear-gradient(45deg, #4a90e2, #357abd);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
            font-weight: bold;
        `;
        
        testButton.addEventListener('click', () => {
            this.testExplosion();
        });
        
        // Insert before the form
        this.formElement.parentNode.insertBefore(testButton, this.formElement);
    }
    
    handleFormSubmission() {
        const formData = this.collectFormData();
        
        // Trigger the epic explosion from cursor position!
        if (this.spatterExplosion) {
            this.spatterExplosion.trigger(formData, this.cursorX, this.cursorY);
        }
        
        // Show success message
        this.showSuccessMessage();
    }
    
    testExplosion() {
        // Test with sample data
        const testData = {
            name: 'Test Investigator',
            email: 'test@forensics.com',
            message: 'This is a test message to demonstrate the blood spatter explosion effect. The longer the message, the more dramatic the explosion will be!'
        };
        
        if (this.spatterExplosion) {
            this.spatterExplosion.trigger(testData, this.cursorX, this.cursorY);
        }
        
        console.log('🧪 Test explosion triggered from cursor position!');
    }
    
    collectFormData() {
        const formData = new FormData(this.formElement);
        return {
            name: formData.get('name') || 'Anonymous',
            email: formData.get('email') || 'no-email@provided.com',
            message: formData.get('message') || 'No message provided'
        };
    }
    
    showSuccessMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1003;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        message.textContent = '✅ Evidence Submitted Successfully!';
        
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for classes to load
    setTimeout(() => {
        if (window.SpatterExplosion) {
            new ExplosionTest();
            console.log('🧪 Explosion test system initialized!');
        } else {
            console.error('SpatterExplosion class not found!');
        }
    }, 500);
});
