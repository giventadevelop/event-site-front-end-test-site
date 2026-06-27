# Our Team Section - Image Specifications & Guidelines

## 📸 **Optimal Image Specifications**

### **Dimensions & Aspect Ratio**
- **Recommended Size**: `800px × 1000px` (4:5 aspect ratio)
- **Minimum Size**: `600px × 750px` (4:5 aspect ratio)
- **Maximum Size**: `1200px × 1500px` (4:5 aspect ratio)
- **Aspect Ratio**: **4:5 (Portrait)** - This is crucial for consistent card heights

### **Why 4:5 Aspect Ratio?**
- **Card Layout**: Our cards use `h-[400px] lg:h-[450px]` for the image section
- **Responsive Design**: 4:5 ratio works perfectly across all breakpoints
- **Professional Look**: Standard LinkedIn/portfolio photo ratio
- **Consistent Heights**: Ensures all cards maintain the same height regardless of content

## 🎯 **Image Characteristics**

### **Content Guidelines**
- **Subject Positioning**: Center the face/head in the upper 60% of the image
- **Background**: Clean, professional background (office, studio, or solid color)
- **Lighting**: Even, professional lighting (avoid harsh shadows)
- **Expression**: Professional, approachable expression
- **Clothing**: Business professional attire

### **Technical Requirements**
- **Format**: `.jpg` or `.webp` (recommended for web optimization)
- **Quality**: 80-85% JPEG quality (good balance of quality vs file size)
- **File Size**: Keep under 200KB for optimal loading performance
- **Color Space**: sRGB (standard web color space)

## 📱 **Responsive Behavior**

### **How Images Scale in Our Layout**
```css
/* Current image container dimensions */
.image-container {
  height: 400px;  /* Mobile */
  height: 450px;  /* Desktop (lg breakpoint) */
  object-fit: cover;
  object-position: center top;
}
```

### **Breakpoint Behavior**
- **Mobile (<600px)**: 1 column, full width
- **Tablet (600-899px)**: 2 columns, optimized for medium screens
- **Large Tablet (900-1199px)**: 3 columns, balanced layout
- **Desktop (1200px+)**: 4 columns, optimal spacing

## 🚀 **Upload & Optimization Tips**

### **Before Upload**
1. **Crop to 4:5 ratio** using any image editor
2. **Resize to 800×1000px** for optimal quality
3. **Optimize file size** to under 200KB
4. **Test responsiveness** by resizing browser window

### **Image Processing Tools**
- **Online**: TinyPNG, Squoosh.app, ImageOptim
- **Desktop**: Photoshop, GIMP, Affinity Photo
- **Mobile**: Snapseed, Lightroom Mobile

### **Example Image Dimensions**
```
Original: 4000×3000px (4:3 ratio)
↓ Crop to 4:5
Cropped: 4000×5000px (4:5 ratio)
↓ Resize for web
Final: 800×1000px (4:5 ratio, optimized)
```

## 🔧 **Current Implementation Details**

### **Image Container CSS**
```css
/* From our TeamSection.module.css */
.teamCard {
  min-height: 600px;  /* Ensures consistent card height */
  display: flex;
  flex-direction: column;
}

/* Image section maintains consistent height */
.image-section {
  height: 400px;  /* Mobile */
  height: 450px;  /* Desktop */
}
```

### **Next.js Image Component**
```tsx
<Image
  src={getDefaultProfileImage(member)}
  alt={getFullName(member)}
  fill
  className="object-cover object-top"  /* Covers container, positions at top */
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{ objectPosition: 'center top' }}
/>
```

## 📋 **Quick Reference Checklist**

- ✅ **Aspect Ratio**: 4:5 (Portrait)
- ✅ **Dimensions**: 800×1000px (recommended)
- ✅ **Format**: JPG or WebP
- ✅ **File Size**: Under 200KB
- ✅ **Quality**: 80-85%
- ✅ **Subject**: Centered in upper portion
- ✅ **Background**: Clean and professional
- ✅ **Lighting**: Even and flattering

## 🎨 **Design Benefits**

With these specifications, your team photos will:
- **Maintain consistent card heights** across all screen sizes
- **Look professional** on both mobile and desktop
- **Load quickly** due to optimized file sizes
- **Scale beautifully** across all responsive breakpoints
- **Create visual harmony** in the grid layout

## 📁 **File Structure**

### **Current Implementation Files**
```
src/
├── components/
│   └── charity-sections/
│       ├── TeamSection.tsx                    # Main component
│       └── TeamSection.module.css             # CSS Grid layout
├── app/
│   └── charity-theme/
│       ├── page.tsx                           # Page component
│       └── ApiServerActions.ts                # Server actions
└── pages/
    └── api/
        └── proxy/
            └── executive-committee-team-members/
                └── [...slug].ts                # Proxy handler
```

### **Key Features Implemented**
- **Dynamic Data Loading**: Fetches active team members from backend
- **Responsive Grid Layout**: 4/3/2/1 columns based on screen size
- **Equal Distribution**: Fixed column counts prevent scattered layouts
- **Consistent Card Heights**: All cards maintain same height
- **Last Row Centering**: Remaining items properly centered
- **Delayed Image Loading**: 3-5 second delay after page load
- **Fallback Images**: Graceful handling of missing images
- **Expertise Parsing**: Handles JSON expertise arrays from API

## 🔍 **API Integration**

### **Backend Endpoint**
```
GET /api/executive-committee-team-members?isActive.equals=true&sort=priorityOrder,asc
```

### **Response Structure**
```json
[
  {
    "id": 4051,
    "firstName": "Gain",
    "lastName": "Joseph",
    "title": "chairman",
    "designation": "",
    "bio": "",
    "email": "giventauser@gmail.com",
    "profileImageUrl": "https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/...",
    "expertise": "[\"leader\", \"Finance\"]",
    "isActive": true,
    "priorityOrder": 1
  }
]
```

### **Data Processing**
- **Active Members Only**: Filters by `isActive.equals=true`
- **Priority Sorting**: Orders by `priorityOrder,asc`
- **Expertise Parsing**: Converts JSON strings to arrays
- **Fallback Handling**: Uses placeholder images for missing photos

## 🎯 **Testing & Validation**

### **Responsive Testing**
1. **Desktop (1200px+)**: Verify 4-column layout
2. **Large Tablet (900-1199px)**: Verify 3-column layout
3. **Tablet (600-899px)**: Verify 2-column layout
4. **Mobile (<600px)**: Verify 1-column layout

### **Image Quality Testing**
1. **Load Performance**: Check image loading times
2. **Visual Quality**: Verify images look crisp on all devices
3. **Layout Consistency**: Ensure all cards have same height
4. **Centering Logic**: Verify last row items are properly centered

## 🚨 **Common Issues & Solutions**

### **Issue: Images Appear Stretched**
**Solution**: Ensure 4:5 aspect ratio and use `object-fit: cover`

### **Issue: Cards Have Different Heights**
**Solution**: Verify `min-height: 600px` and flexbox structure

### **Issue: Last Row Not Centered**
**Solution**: Check `getLastRowClasses` function and CSS positioning

### **Issue: Images Load Slowly**
**Solution**: Optimize file sizes to under 200KB and use WebP format

## 📚 **Additional Resources**

### **Image Optimization Tools**
- [TinyPNG](https://tinypng.com/) - Online image compression
- [Squoosh](https://squoosh.app/) - Google's image optimization tool
- [ImageOptim](https://imageoptim.com/) - Desktop optimization for Mac

### **Aspect Ratio Calculator**
- [Aspect Ratio Calculator](https://calculateaspectratio.com/) - Easy ratio calculations

### **Professional Photo Guidelines**
- [LinkedIn Photo Guidelines](https://www.linkedin.com/help/linkedin/answer/a522) - Professional standards
- [Corporate Headshot Tips](https://www.shutterstock.com/blog/corporate-headshot-tips) - Photography best practices

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: Production Ready ✅

Following these guidelines will ensure your "Our Team" section looks polished and professional across all devices! 🎯
