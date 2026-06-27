# Nano Banana Hero Section Movie Trailer Prompt

## **Overview**
This document provides optimized prompts for creating an 8-second Hollywood-style action-packed animated WebP trailer for the hero section using Nano Banana AI image creator.

## **Technical Specifications**

### **Output Requirements**
- **Format**: Animated WebP (`.webp`)
- **Duration**: 8 seconds
- **Frame Rate**: 12 fps (96 frames total for 8 seconds)
- **Dimensions**: 800×1200px (portrait, 2:3 aspect ratio)
- **File Size Target**: Under 500KB
- **Loop**: Seamless loop (end connects to beginning)
- **Style**: Hollywood movie trailer, action-packed, cinematic

---

## **Nano Banana Prompt Strategy**

Since Nano Banana generates static images, you'll need to create **key frames** that can be animated. Here's the recommended approach:

### **Option 1: Create Key Frames for Animation (Recommended)**

Generate 8-12 key frames using Nano Banana, then animate them using tools like:
- **After Effects** (professional)
- **Premiere Pro** (professional)
- **FFmpeg** (command-line)
- **Online tools** (CloudConvert, EZGIF)

---

## **Nano Banana Prompts for Key Frames**

### **Prompt Template (Base)**
```
Create a cinematic Hollywood movie trailer frame in portrait orientation (2:3 aspect ratio, 800×1200px). 
Action-packed scene with dramatic lighting, vibrant colors, and dynamic composition. 
High contrast, professional cinematography style, epic scale. 
Include motion blur effects and cinematic depth of field.
```

### **Frame-by-Frame Prompts (8 Key Frames)**

#### **Frame 1: Opening Shot (0-1 second)**
```
Cinematic opening shot: Dramatic wide-angle view of an epic event venue or cultural celebration. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Golden hour lighting, warm tones, shallow depth of field. 
Text overlay area in upper 60% of frame. 
Hollywood movie trailer style, action-packed, vibrant colors, high contrast. 
Motion blur suggesting forward movement. 
Professional cinematography, epic scale, dramatic composition.
```

#### **Frame 2: Dynamic Action (1-2 seconds)**
```
Cinematic action frame: Dynamic crowd scene or performers in motion. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Energy and movement, motion blur effects, vibrant colors. 
Center focus on main subject, dramatic lighting from side. 
Hollywood movie trailer style, action-packed, high contrast. 
Text overlay area in upper portion. 
Epic scale, cinematic depth, professional cinematography.
```

#### **Frame 3: Close-Up Intensity (2-3 seconds)**
```
Cinematic close-up: Intense performer or cultural element in dramatic close-up. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Shallow depth of field, bokeh background, dramatic side lighting. 
High contrast, vibrant colors, cinematic composition. 
Hollywood movie trailer style, action-packed, professional cinematography. 
Text overlay area in upper 60% of frame. 
Epic scale, emotional intensity, cinematic quality.
```

#### **Frame 4: Wide Epic Shot (3-4 seconds)**
```
Cinematic wide shot: Epic event scene with multiple elements in frame. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Deep focus, dramatic sky or background, golden hour lighting. 
Vibrant colors, high contrast, motion blur suggesting activity. 
Hollywood movie trailer style, action-packed, epic scale. 
Text overlay area in upper portion. 
Professional cinematography, cinematic depth, dramatic composition.
```

#### **Frame 5: Dynamic Movement (4-5 seconds)**
```
Cinematic movement frame: Dynamic action with performers or dancers in motion. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Strong motion blur, vibrant colors, dramatic lighting. 
Center composition, shallow depth of field. 
Hollywood movie trailer style, action-packed, high energy. 
Text overlay area in upper 60% of frame. 
Epic scale, cinematic quality, professional cinematography.
```

#### **Frame 6: Emotional Peak (5-6 seconds)**
```
Cinematic emotional peak: Powerful moment with cultural significance. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Dramatic lighting, vibrant colors, high contrast. 
Close-up to medium shot, shallow depth of field. 
Hollywood movie trailer style, action-packed, emotional intensity. 
Text overlay area in upper portion. 
Epic scale, cinematic composition, professional cinematography.
```

#### **Frame 7: Climactic Action (6-7 seconds)**
```
Cinematic climactic frame: High-energy action scene with multiple elements. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Strong motion blur, vibrant colors, dramatic side lighting. 
Dynamic composition, deep focus with selective blur. 
Hollywood movie trailer style, action-packed, epic scale. 
Text overlay area in upper 60% of frame. 
Professional cinematography, cinematic depth, high contrast.
```

#### **Frame 8: Closing/Transition (7-8 seconds)**
```
Cinematic closing frame: Dramatic final shot that loops seamlessly to beginning. 
Portrait orientation (800×1200px), 2:3 aspect ratio. 
Similar composition to Frame 1 for seamless loop. 
Golden hour lighting, warm tones, motion blur. 
Hollywood movie trailer style, action-packed, vibrant colors. 
Text overlay area in upper portion. 
Epic scale, cinematic quality, professional cinematography, seamless loop transition.
```

---

## **Alternative: Single Comprehensive Prompt (For Video-to-WebP Conversion)**

If you're creating a video first and converting to WebP, use this prompt for video generation tools:

```
Create an 8-second Hollywood-style movie trailer in portrait orientation (800×1200px, 2:3 aspect ratio).
Action-packed cinematic sequence with:
- Dramatic opening wide shot (0-1s)
- Dynamic action scenes with motion blur (1-3s)
- Intense close-ups with shallow depth of field (3-5s)
- Epic wide shots with golden hour lighting (5-7s)
- Seamless loop transition back to opening (7-8s)

Style: Hollywood movie trailer, action-packed, vibrant colors, high contrast, professional cinematography.
Lighting: Golden hour, dramatic side lighting, cinematic depth.
Motion: Smooth camera movements, motion blur effects, dynamic composition.
Text overlay area: Upper 60% of frame reserved for text.
Loop: Seamless loop (end connects to beginning).
Frame rate: 24fps (192 frames total).
Quality: High definition, cinematic quality, epic scale.
```

---

## **Nano Banana Pro V2 Settings (Recommended)**

### **Model Selection**
- **Use**: Nano Banana Pro V2 (Gemini 3 Pro)
- **Reason**: Superior quality, better prompt understanding, sharp text rendering
- **Credits**: 8 credits (1K/2K) or 16 credits (4K)

### **Resolution Settings**
- **Recommended**: 2K (1600×2400px source)
- **Reason**: Matches hero section 2x retina display requirement
- **Final Output**: Scale down to 800×1200px for WebP conversion

### **Aspect Ratio**
- **Select**: Portrait (2:3 ratio)
- **Or**: Custom 800×1200px

---

## **Post-Processing Workflow**

### **Step 1: Generate Key Frames**
1. Use Nano Banana Pro V2 with prompts above
2. Generate 8-12 key frames (one per second or more for smoother animation)
3. Download all frames in high resolution (2K or 4K)

### **Step 2: Create Animation Sequence**
**Option A: Using FFmpeg (Recommended)**
```bash
# Combine frames into animated WebP
ffmpeg -framerate 12 -i frame_%02d.png \
  -vf "scale=800:1200:flags=lanczos,loop=0:32767" \
  -quality 85 -lossless 0 \
  -loop 0 \
  hero-trailer.webp

# Optimize file size
ffmpeg -i hero-trailer.webp -vf "scale=800:1200:flags=lanczos" \
  -quality 85 -lossless 0 \
  -loop 0 \
  hero-trailer-optimized.webp
```

**Option B: Using Online Tools**
1. Upload frames to **EZGIF** (ezgif.com)
2. Select "Animated GIF/WebP Maker"
3. Set frame rate: 12 fps
4. Set loop: Infinite
5. Convert to WebP format
6. Optimize file size

**Option C: Using After Effects**
1. Import all frames as image sequence
2. Set frame rate: 12 fps
3. Add smooth transitions between frames
4. Export as animated WebP using WebP export plugin
5. Optimize for web (<500KB)

### **Step 3: Optimize for Hero Section**
```bash
# Final optimization
ffmpeg -i hero-trailer.webp \
  -vf "scale=800:1200:flags=lanczos" \
  -quality 85 \
  -lossless 0 \
  -loop 0 \
  -an \
  hero-trailer-final.webp
```

---

## **Content Theme Variations**

### **Cultural Event Theme**
Add to base prompt:
```
Malayalee cultural celebration, traditional dance, vibrant costumes, 
festive atmosphere, community gathering, cultural heritage, 
colorful decorations, traditional music performance.
```

### **Sports Event Theme**
Add to base prompt:
```
Competitive sports event, athletes in action, dynamic movement, 
stadium atmosphere, cheering crowd, victory moment, 
high energy, athletic performance, sports celebration.
```

### **Concert/Performance Theme**
Add to base prompt:
```
Live music performance, stage lighting, performers in action, 
audience engagement, concert atmosphere, musical instruments, 
dramatic stage presence, entertainment event, cultural performance.
```

---

## **Quality Checklist**

Before uploading to hero section:
- [ ] File format: `.webp` (animated)
- [ ] Dimensions: 800×1200px (portrait, 2:3 ratio)
- [ ] Duration: 8 seconds (±0.5s acceptable)
- [ ] Frame rate: 10-15 fps (12 fps recommended)
- [ ] File size: Under 500KB
- [ ] Loop: Seamless (end connects to beginning)
- [ ] Quality: High contrast, vibrant colors, cinematic
- [ ] Text area: Upper 60% reserved for overlays
- [ ] Motion: Smooth, no stuttering
- [ ] Browser test: Works in Chrome, Firefox, Safari 14+

---

## **Upload Instructions**

1. **Generate Frames**: Use Nano Banana Pro V2 with prompts above
2. **Create Animation**: Use FFmpeg or online tools to create animated WebP
3. **Optimize**: Ensure file size <500KB and dimensions 800×1200px
4. **Upload**: Use existing media upload interface
5. **Mark as Hero**: Set `isHomePageHeroImage = true` in media settings
6. **Test**: Verify animation plays smoothly in hero section rotation

---

## **Troubleshooting**

### **File Too Large?**
- Reduce frame rate to 10 fps
- Lower quality setting (80-85% instead of 90%+)
- Reduce dimensions slightly (750×1125px)
- Remove unnecessary frames

### **Animation Not Smooth?**
- Increase frame rate to 15 fps
- Add more intermediate frames
- Use motion interpolation in post-processing
- Check for frame timing issues

### **Loop Not Seamless?**
- Ensure Frame 8 matches Frame 1 composition
- Add transition frames between end and beginning
- Use crossfade effect for smooth loop
- Test loop multiple times

### **Colors Not Vibrant?**
- Increase saturation in post-processing
- Use Nano Banana Pro V2 for better color rendering
- Adjust contrast and brightness
- Test on multiple displays

---

## **Example Nano Banana Prompt (Complete)**

```
Create a cinematic Hollywood movie trailer frame in portrait orientation (800×1200px, 2:3 aspect ratio).
Malayalee cultural celebration with traditional dancers in vibrant costumes performing on stage.
Dramatic golden hour lighting from the side, creating depth and cinematic atmosphere.
Motion blur effects suggesting dynamic movement and energy.
High contrast, vibrant colors (reds, golds, greens), professional cinematography style.
Shallow depth of field with bokeh background, epic scale composition.
Text overlay area reserved in upper 60% of frame.
Hollywood movie trailer style, action-packed, cinematic quality, seamless loop potential.
Professional grade, 2K resolution, sharp details, vibrant colors.
```

---

## **Resources**

- **Nano Banana**: https://nanabanana.ai/ai-image
- **Nano Banana Pro**: https://www.nano-banana.ai/
- **FFmpeg Documentation**: https://ffmpeg.org/documentation.html
- **EZGIF WebP Converter**: https://ezgif.com/webp-maker
- **CloudConvert**: https://cloudconvert.com/

---

## **Summary**

**Best Approach:**
1. Generate 8-12 key frames using Nano Banana Pro V2 with detailed prompts
2. Use FFmpeg or online tools to create animated WebP sequence
3. Optimize to 800×1200px, <500KB, 12 fps, seamless loop
4. Upload through existing media interface
5. Mark as `isHomePageHeroImage = true`

**Key Success Factors:**
- Use Nano Banana Pro V2 for superior quality
- Generate enough frames for smooth animation (8-12 minimum)
- Ensure seamless loop (Frame 8 matches Frame 1)
- Optimize file size while maintaining quality
- Test in multiple browsers before deploying
