# Charity Theme Hero Section - Image Specifications & Guidelines

## 📋 **Overview**
This document provides comprehensive guidelines for optimizing images used in the charity theme hero section at `http://localhost:3000/charity-theme`. The hero section features a responsive grid layout with multiple image types that must work seamlessly across all device sizes.

## 🎯 **Hero Section Layout Structure**

### **Desktop Layout (lg: 1024px+)**
- **Grid**: `grid-cols-[3fr_7fr]` (3:7 ratio)
- **Cell 1**: Logo + Text (3fr width, 262px height)
- **Cell 2**: Hero Image (7fr width, 531px height) - spans 2 rows
- **Cell 3**: Unite India Image (3fr width, 262px height)

### **Mobile Layout (< 1024px)**
- **Row 1**: Logo + Unite India (side by side, 2 columns)
- **Row 2**: Hero Image (full width, bleeds to edges)

---

## 🖼️ **Image Type Specifications**

### **1. Logo Image (Cell 1)**
**Purpose**: Organization branding and identity

#### **Optimal Dimensions**
- **Desktop**: 240×240px (1:1 square)
- **Mobile**: 180×180px (1:1 square)
- **Aspect Ratio**: 1:1 (square)

#### **Technical Requirements**
- **Format**: WebP (preferred) or JPG
- **Quality**: 85-90%
- **File Size**: Under 50KB
- **Background**: Transparent (PNG) or white/light solid
- **Resolution**: 2x for retina displays (480×480px source)

#### **Content Guidelines**
- **Subject**: Organization logo with clear, readable text
- **Style**: Professional, clean, high contrast
- **Colors**: Should work on both light and dark backgrounds
- **Text**: Must be legible at small sizes

#### **Responsive Behavior**
- **Desktop**: 240×240px with larger text
- **Mobile**: 180×180px with smaller text
- **Scaling**: Maintains aspect ratio across all breakpoints

---

### **2. Hero Image (Main Home Page – Rotating Hero / Split Layout)**
**Purpose**: Dynamic event flyer rotation and visual impact in the **main home page** hero (split layout, right-panel slideshow).

The hero display area uses **object-contain** in a wide container (~65% viewport width) with **min-height 280–480px**. The component uses **1200×800** (3:2) intrinsic dimensions. **Portrait images (e.g. 800×1200) make the section excessively tall** and are not recommended.

#### **Optimal Dimensions**
- **Desktop**: **1200×800px (3:2 aspect ratio, landscape)**
- **Mobile**: **900×600px (3:2 ratio)** or same 1200×800 scales down
- **Aspect Ratio**: **3:2 (landscape)** — use landscape so the hero block height stays proportional

#### **Technical Requirements**
- **Format**: WebP (preferred) or JPG
- **Quality**: 80-85%
- **File Size**: Under 300KB
- **Resolution**: 2x for retina: 2400×1600px source optional

#### **Content Guidelines**
- **Subject**: Event flyers, promotional posters, or hero imagery
- **Composition**:
  - Main subject in center or upper 60% of frame
  - Text should be readable at 50% scale
  - High contrast for text overlay visibility
- **Style**: Professional, engaging, culturally relevant
- **Colors**: Vibrant but not overwhelming

#### **Dynamic Behavior**
- **Rotation**: Changes per image display duration (default 8s)
- **Fallback**: Default image for first 2 seconds
- **Event Integration**: Automatically loads from event media API
- **Click Action**: Routes to specific event or events page

---

### **3. Unite India Image (Cell 3)**
**Purpose**: Cultural unity messaging and visual appeal

#### **Optimal Dimensions**
- **Desktop**: 400×262px (3:2 aspect ratio)
- **Mobile**: 300×187px (8:5 aspect ratio)
- **Aspect Ratio**: 3:2 (landscape)

#### **Technical Requirements**
- **Format**: WebP (preferred) or JPG
- **Quality**: 85-90%
- **File Size**: Under 150KB
- **Background**: Clean, professional
- **Resolution**: 2x for retina displays (800×524px source)

#### **Content Guidelines**
- **Subject**: Cultural unity, diversity, or community imagery
- **Style**: Professional, inclusive, culturally sensitive
- **Colors**: Warm, welcoming tones
- **Text**: Minimal or no text overlay needed

---

### **4. Donate Button (Top Right)**
**Purpose**: Call-to-action for donations

#### **Optimal Dimensions**
- **Size**: 120×60px (2:1 aspect ratio)
- **Aspect Ratio**: 2:1 (landscape)

#### **Technical Requirements**
- **Format**: WebP (preferred) or JPG
- **Quality**: 90-95%
- **File Size**: Under 30KB
- **Background**: Transparent or transparent wrapper

#### **Content Guidelines**
- **Subject**: Clear "Donate" or donation-related imagery
- **Style**: Eye-catching, professional
- **Colors**: High contrast, attention-grabbing
- **Positioning**: Top right corner, below header

---

### **5. Buy Tickets Button (Overlay)**
**Purpose**: Event ticket sales call-to-action

#### **Optimal Dimensions**
- **Size**: 180×90px (2:1 aspect ratio)
- **Aspect Ratio**: 2:1 (landscape)

#### **Technical Requirements**
- **Format**: WebP (preferred) or JPG
- **Quality**: 90-95%
- **File Size**: Under 40KB
- **Background**: Transparent or transparent wrapper

#### **Content Guidelines**
- **Subject**: "Buy Tickets" or ticket-related imagery
- **Style**: Action-oriented, professional
- **Colors**: High contrast, attention-grabbing
- **Positioning**: Bottom right overlay on hero images

---

### **6. Click to View All Events Button**
**Purpose**: Navigation to events page

#### **Optimal Dimensions**
- **Size**: 150×60px (5:2 aspect ratio)
- **Aspect Ratio**: 5:2 (landscape)

#### **Technical Requirements**
- **Format**: PNG (for transparency) or WebP
- **Quality**: 90-95%
- **File Size**: Under 35KB
- **Background**: Transparent or transparent wrapper

#### **Content Guidelines**
- **Subject**: "View All Events" or navigation-related imagery
- **Style**: Professional, clear call-to-action
- **Colors**: High contrast, professional
- **Positioning**: Below hero section, right-aligned

---

## 📱 **Responsive Design Considerations**

### **Breakpoint Strategy**
- **Mobile**: < 600px (single column, stacked layout)
- **Tablet**: 600px - 1023px (2-column grid)
- **Desktop**: 1024px+ (3-column grid with 3:7 ratio)

### **Image Scaling**
- **Mobile**: 100% width, maintain aspect ratio
- **Tablet**: 50% width per column, maintain aspect ratio
- **Desktop**: Fixed dimensions, maintain aspect ratio

### **Performance Optimization**
- **Lazy Loading**: Images load progressively
- **Format Priority**: WebP > JPG > PNG
- **Size Optimization**: Compress without quality loss
- **CDN Usage**: Leverage CDN for faster delivery

---

## 🎨 **Design Best Practices**

### **Visual Hierarchy**
1. **Hero Image**: Primary focus (largest, most prominent)
2. **Logo**: Brand identity (consistent positioning)
3. **Unite India**: Supporting message (complementary)
4. **Action Buttons**: Clear calls-to-action (high contrast)

### **Color Harmony**
- **Primary**: Brand colors (consistent with organization)
- **Secondary**: Supporting colors (complementary)
- **Accent**: Action colors (high contrast for buttons)
- **Neutral**: Background colors (subtle, professional)

### **Typography Integration**
- **Logo Text**: Clear, readable at all sizes
- **Hero Text**: High contrast, legible at 50% scale
- **Button Text**: Bold, action-oriented
- **Supporting Text**: Subtle, informative

---

## 🚀 **Implementation Details**

### **Next.js Image Component Usage**
```tsx
// Logo Image
<Image
  src="logo-url.webp"
  alt="Malayalees Friends Logo"
  width={240}
  height={240}
  className="mx-auto mb-4"
  priority
/>

// Hero Image
<Image
  src={dynamicImages[currentImageIndex]}
  alt="Dynamic Hero Image"
  fill
  className="object-fill w-full h-full cursor-pointer"
  sizes="(max-width: 1024px) 100vw, 50vw"
/>

// Action Button
<Image
  src="/images/buy_tickets_click_here_red.webp"
  alt="Buy Tickets Click Here"
  width={180}
  height={90}
  className="cursor-pointer hover:scale-105 transition-transform duration-300"
/>
```

### **CSS Grid Implementation**
```css
/* Desktop Layout */
.lg\:grid-cols-\[3fr_7fr\] {
  grid-template-columns: 3fr 7fr;
}

/* Mobile Layout */
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* Responsive Heights */
.min-h-\[187px\] /* Mobile */
.h-\[262px\] /* Desktop */
.h-\[531px\] /* Hero Image */
```

---

## 📊 **Quick Reference Checklist**

### **Before Upload**
- [ ] **Dimensions**: Match specified aspect ratios exactly
- [ ] **Format**: WebP preferred, JPG acceptable
- [ ] **Quality**: 80-95% depending on image type
- [ ] **File Size**: Under specified limits
- [ ] **Resolution**: 2x for retina displays
- [ ] **Background**: Transparent or clean solid

### **Content Requirements**
- [ ] **Logo**: Clear, professional, readable text
- [ ] **Hero**: High contrast, event-focused, text legible
- [ ] **Unite India**: Cultural, inclusive, professional
- [ ] **Buttons**: High contrast, action-oriented
- [ ] **Overall**: Consistent with brand identity

### **Technical Validation**
- [ ] **Responsive**: Works on all breakpoints
- [ ] **Performance**: Optimized file sizes
- [ ] **Accessibility**: Alt text and contrast
- [ ] **Integration**: Works with dynamic loading
- [ ] **Fallbacks**: Graceful degradation

---

## 🔧 **Troubleshooting Common Issues**

### **Image Not Displaying**
- Check file format compatibility
- Verify file size limits
- Ensure proper URL structure
- Check browser console for errors

### **Responsive Issues**
- Verify aspect ratios match specifications
- Check CSS grid implementation
- Test on multiple device sizes
- Validate breakpoint logic

### **Performance Problems**
- Optimize image compression
- Use WebP format when possible
- Implement lazy loading
- Leverage CDN delivery

### **Layout Breaking**
- Ensure consistent dimensions
- Check CSS grid configuration
- Validate responsive breakpoints
- Test image scaling behavior

---

## 📚 **Additional Resources**

### **Image Optimization Tools**
- **Online**: TinyPNG, Squoosh, ImageOptim
- **Desktop**: ImageOptim (Mac), FileOptimizer (Windows)
- **Command Line**: ImageMagick, Sharp

### **Format Conversion**
- **WebP**: Google WebP converter, Squoosh
- **JPG**: Standard image editors, online converters
- **PNG**: For transparency requirements

### **Testing Tools**
- **Responsive**: Chrome DevTools, Firefox Responsive Design Mode
- **Performance**: Lighthouse, PageSpeed Insights
- **Cross-browser**: BrowserStack, Sauce Labs

---

## 📝 **Version History**

- **v1.0**: Initial specifications based on HeroSection component analysis
- **Date**: December 2024
- **Component**: `src/components/charity-sections/HeroSection.tsx`
- **Layout**: Responsive grid with 3:7 ratio on desktop, stacked on mobile

---

## 🎯 **Summary**

The charity theme hero section requires carefully optimized images across multiple types and sizes. By following these specifications, you'll ensure:

1. **Consistent Layout**: Images fit perfectly in the responsive grid
2. **Optimal Performance**: Fast loading and smooth user experience
3. **Professional Appearance**: High-quality visuals across all devices
4. **Brand Consistency**: Unified visual identity and messaging
5. **User Engagement**: Clear calls-to-action and navigation

Remember to test all images across different device sizes and browsers to ensure consistent behavior and appearance.
