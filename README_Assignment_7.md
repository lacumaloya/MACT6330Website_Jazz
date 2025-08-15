# Assignment 7: Compositional Design in Modern JavaScript (ES6)

## Overview
This assignment demonstrates the implementation of compositional design principles in modern JavaScript (ES6) by refactoring a blood spatter simulation system. The project showcases how helper classes can better organize and abstract complex functionality, following Object-Oriented Programming best practices.

## Learning Objectives
- Implement compositional design using ES6 classes
- Reduce constructor parameter complexity through encapsulation
- Separate concerns into logical, reusable components
- Demonstrate code maintainability and reusability

## Project Structure

### Core Files
- **`js/Style.js`** - The main Style class implementing compositional design
- **`js/test-style.js`** - Demonstration and testing of the Style class
- **`index.html`** - Main HTML file with integrated Style class
- **`style.css`** - Styling for the demonstration

### Supporting Files
- **`js/BloodDrop.js`** - Original blood drop simulation class (for comparison)
- **`js/test-blood-drop.js`** - Original test implementation
- **`js/SpatterExplosion.js`** - Additional spatter effects

## Implementation Details

### Style Class (`js/Style.js`)
The Style class encapsulates all visual properties and rendering methods:

#### Key Features:
- **Color Management**: RGB arrays for fill, stroke, shadow, and highlight colors
- **Rendering Methods**: `drawTeardrop()`, `drawCircle()`, `drawShadow()`, `drawHighlight()`
- **Style Controls**: Enable/disable shadows, highlights, gradients, and 3D effects
- **Opacity & Blending**: Full control over transparency and blend modes
- **Variation System**: Easy creation of style variations and clones

#### Constructor Parameters:
```javascript
new Style(fillColor, strokeColor, shadowColor, opacity)
// Reduced from 8+ parameters to just 4
```

#### Example Usage:
```javascript
// Create different blood styles
const freshBlood = new Style([255, 0, 0], [150, 0, 0], [100, 0, 0], 0.9);
const driedBlood = new Style([180, 0, 0], [120, 0, 0], [80, 0, 0], 0.8);

// Customize styles
freshBlood.setShadowState(true);
driedBlood.setHighlightState(false);

// Render with style
freshBlood.drawTeardrop(ctx, x, y, size, alpha);
```

### Test Implementation (`js/test-style.js`)
Demonstrates the Style class capabilities:

#### Features Demonstrated:
- **Multiple Blood Types**: Fresh, dried, arterial, and venous blood styles
- **Real-time Switching**: Click to cycle through different styles
- **Visual Comparison**: Side-by-side display of different blood effects
- **Animation**: Animated blood drops with varying properties

## Compositional Design Benefits

### 1. Parameter Reduction
- **Before**: 8+ constructor parameters
- **After**: 4 focused parameters
- **Result**: Cleaner, more maintainable constructors

### 2. Single Responsibility
- **Style Class**: Handles only visual rendering
- **Physics Class**: Would handle only movement and forces
- **BloodDrop Class**: Focuses on lifecycle and coordination

### 3. Reusability
- Style objects can be used across multiple projects
- Easy to create variations and modifications
- Consistent visual behavior across different simulations

### 4. Team Development
- Different developers can work on separate classes
- Clear interfaces between components
- Easier testing and debugging

## How to Run

### Basic Setup
1. Extract all files to a web directory
2. Open `index.html` in a modern web browser
3. The Style class demonstration will automatically load

### Testing the Style Class
1. **Visual Test**: Four animated blood drops will appear
2. **Interaction**: Click anywhere to cycle through blood styles
3. **Console**: Check browser console for style change logs
4. **Inspection**: Observe different visual effects for each style

### Integration with Existing Code
The Style class is designed to work alongside existing code:
```javascript
// In your existing BloodDrop class
const style = new Style([255, 0, 0], [100, 0, 0], [100, 0, 0], 0.9);
style.drawTeardrop(ctx, this.x, this.y, this.size, this.opacity);
```

## Technical Implementation

### ES6 Features Used
- **Classes**: Modern class syntax with constructors and methods
- **Arrow Functions**: For event handlers and callbacks
- **Template Literals**: For dynamic string construction
- **Destructuring**: For array and object manipulation
- **Default Parameters**: For flexible constructor options

### Canvas Rendering
- **2D Context**: Uses HTML5 Canvas 2D rendering
- **Path Drawing**: Custom teardrop and circle shapes
- **Gradients**: Radial gradients for 3D effects
- **Blend Modes**: Support for different compositing operations

## Future Enhancements

### Planned Improvements
1. **Physics Class**: Encapsulate movement and force calculations
2. **SpatterManager Class**: Handle spatter pattern generation
3. **Animation Controller**: Manage timing and transitions
4. **Style Presets**: Pre-built blood type configurations

### Integration Path
The Style class serves as the foundation for:
- Complete BloodDrop refactoring
- Additional visual effect classes
- Animation and timing systems
- User interface controls

## Conclusion

This assignment successfully demonstrates:
- **Compositional Design**: Using helper classes to organize code
- **Modern JavaScript**: ES6 features for clean, maintainable code
- **Separation of Concerns**: Visual logic separated from simulation logic
- **Reusability**: Components that can be used across projects
- **Maintainability**: Code that's easier to modify and extend

The Style class implementation provides a solid foundation for continued refactoring and demonstrates the power of compositional design in modern JavaScript development.

## Files Included in Zip
- `js/Style.js` - Main Style class implementation
- `js/test-style.js` - Style class demonstration
- `index.html` - Integrated demonstration page
- `style.css` - Page styling
- `js/BloodDrop.js` - Original implementation for comparison
- `js/test-blood-drop.js` - Original test implementation
- `js/SpatterExplosion.js` - Additional effects
- `README_Assignment_7.md` - This documentation file
