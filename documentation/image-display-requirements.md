# Image Display Requirements for Event Cards

## Overview
This document provides a comprehensive guide for implementing proper image display in event cards with rounded corners, full area filling, and no edge cropping.

## Requirements
- **Rounded Corners**: Images must have rounded top corners that match the card design
- **Full Area Filling**: Images should fill the designated area without gaps
- **No Cropping**: Complete image visibility without any edges being cut off
- **Seamless Integration**: Images should blend with the card's gradient background

## Technical Implementation

### HTML Structure
```tsx
{/* Image Container with Rounded Top Corners */}
<div className="relative w-full h-80 rounded-t-2xl overflow-hidden">
  {event.thumbnailUrl ? (
    <Image
      src={event.thumbnailUrl}
      alt={event.title}
      fill
      className="object-contain group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
      style={{
        backgroundColor: 'transparent'
      }}
    />
  ) : (
    <div
      className="w-full h-full flex items-center justify-center rounded-t-2xl"
      style={{
        backgroundColor: 'transparent'
      }}
    >
      <span className="text-gray-400 text-4xl">📅</span>
    </div>
  )}
</div>
```

### Key CSS Classes and Properties

#### Container Requirements
- `relative` - For absolute positioning of child elements
- `w-full` - Full width of parent container
- `h-80` - Fixed height (320px)
- `rounded-t-2xl` - Rounded top corners (1rem radius)
- `overflow-hidden` - Clips content to rounded corners

#### Image Requirements
- `fill` - Fills the entire container
- `object-contain` - **CRITICAL**: Shows complete image without cropping
- `rounded-t-2xl` - Matches container's rounded corners
- `group-hover:scale-105` - Hover effect for interactivity
- `transition-transform duration-300` - Smooth hover animation
- `backgroundColor: 'transparent'` - Allows card gradient to show through

#### Placeholder Requirements
- `w-full h-full` - Fills entire container
- `flex items-center justify-center` - Centers placeholder content
- `rounded-t-2xl` - Matches image rounded corners
- `backgroundColor: 'transparent'` - Blends with card background

## Critical Rules

### ✅ DO
1. **Use `object-contain`** - Prevents edge cropping
2. **Apply `rounded-t-2xl` to both container AND image** - Ensures consistent rounded corners
3. **Use `overflow-hidden` on container** - Creates clean rounded corner clipping
4. **Set `backgroundColor: 'transparent'`** - Allows card gradient to show through
5. **No padding around image** - Ensures images touch card edges

### ❌ DON'T
1. **Use `object-cover`** - This crops images to fill container
2. **Add padding around images** - Creates gaps between image and card edges
3. **Use `bg-white` or solid backgrounds** - Breaks gradient blending
4. **Forget `overflow-hidden`** - Results in square corners showing through
5. **Apply rounded corners only to container** - Image will have square corners

## Common Issues and Solutions

### Issue: Square Image Corners
**Problem**: Images appear with square corners despite container having rounded corners
**Solution**: Apply `rounded-t-2xl` class directly to the Image component

### Issue: Image Cropping
**Problem**: Parts of the image are cut off
**Solution**: Use `object-contain` instead of `object-cover`

### Issue: Gaps Around Images
**Problem**: White space or gaps between image and card edges
**Solution**: Remove padding and ensure `backgroundColor: 'transparent'`

### Issue: Background Color Mismatch
**Problem**: Image background doesn't match card gradient
**Solution**: Set `backgroundColor: 'transparent'` on both image and placeholder

## Responsive Considerations

### Mobile Devices
- Maintain same rounded corner approach
- Ensure `object-contain` works across all screen sizes
- Test hover effects on touch devices

### Desktop Devices
- Hover effects should work smoothly
- Images should scale appropriately
- Rounded corners should remain consistent

## Testing Checklist

- [ ] Images display with rounded top corners
- [ ] No parts of the image are cropped or cut off
- [ ] Images fill the designated area without gaps
- [ ] Background blends seamlessly with card gradient
- [ ] Hover effects work smoothly
- [ ] Placeholder displays correctly when no image
- [ ] Responsive behavior works on all screen sizes

## Browser Compatibility

### Supported
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Notes
- `object-contain` is well-supported across modern browsers
- `rounded-t-2xl` uses CSS `border-radius` which has excellent support
- `overflow-hidden` is universally supported

## Performance Considerations

### Image Optimization
- Use Next.js Image component for automatic optimization
- Consider WebP format for better compression
- Implement lazy loading for better performance

### CSS Performance
- Rounded corners use GPU acceleration
- Hover effects are hardware-accelerated
- Minimal CSS properties for optimal performance

## Troubleshooting

### Images Not Showing Rounded Corners
1. Check if `rounded-t-2xl` is applied to both container and image
2. Verify `overflow-hidden` is on the container
3. Ensure no conflicting CSS is overriding the border-radius

### Images Being Cropped
1. Confirm `object-contain` is being used
2. Check if container has proper dimensions
3. Verify no `object-cover` is being applied

### Background Color Issues
1. Set `backgroundColor: 'transparent'` on image
2. Check if card gradient is properly applied
3. Verify no solid background colors are interfering

## Code Examples

### Complete Event Card Image Section
```tsx
{/* Event Card Image Section */}
<div className="relative w-full h-80 rounded-t-2xl overflow-hidden">
  {event.thumbnailUrl ? (
    <Image
      src={event.thumbnailUrl}
      alt={event.title}
      fill
      className="object-contain group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
      style={{
        backgroundColor: 'transparent'
      }}
    />
  ) : (
    <div
      className="w-full h-full flex items-center justify-center rounded-t-2xl"
      style={{
        backgroundColor: 'transparent'
      }}
    >
      <span className="text-gray-400 text-4xl">📅</span>
    </div>
  )}
  {/* Past Event Badge */}
  {showPastEvents && (
    <div className="absolute top-3 right-3">
      <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
        Past Event
      </span>
    </div>
  )}
</div>
```

### Tailwind CSS Classes Reference
```css
/* Container */
.relative { position: relative; }
.w-full { width: 100%; }
.h-80 { height: 20rem; /* 320px */ }
.rounded-t-2xl { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }
.overflow-hidden { overflow: hidden; }

/* Image */
.fill { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.object-contain { object-fit: contain; }
.group-hover\:scale-105:hover { transform: scale(1.05); }
.transition-transform { transition-property: transform; }
.duration-300 { transition-duration: 300ms; }
```

## Conclusion

This implementation ensures that event card images display with perfect rounded corners, fill the designated area completely, and show the entire image without any cropping. The solution is responsive, performant, and maintains visual consistency across all devices and browsers.

For any questions or issues, refer to the troubleshooting section or test against the provided checklist.
