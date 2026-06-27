# Image Resizing Guide for Media Upload

## Overview

This guide provides instructions for resizing images before uploading them to the event media management system. Properly sized images ensure optimal display quality, faster page load times, and better user experience across all devices.

## Quick Reference: Image Resizer Tool

### Recommended Tool

**Image Resizer**: [https://imageresizer.com/resize/editor](https://imageresizer.com/resize/editor)

This online tool is recommended for resizing images before upload. It's free, easy to use, and works directly in your web browser.

## Step-by-Step Resizing Instructions

### Using ImageResizer.com

1. **Access the Tool**
   - Navigate to [https://imageresizer.com/resize/editor](https://imageresizer.com/resize/editor) in your web browser

2. **Upload Your Image**
   - Click the upload area or drag and drop your image file
   - Supported formats: JPG, PNG, GIF, WebP, and other common image formats

3. **Configure Resize Settings**
   - In the "Resize Settings" section, locate the checkboxes:
     - **Uncheck** the **'Lock Aspect Ratio'** checkbox
     - **Uncheck** the **'Background Fill'** checkbox
   - ⚠️ **Important**: Unchecking these options allows you to set exact dimensions

4. **Set Dimensions**
   - Enter the desired **width** in pixels in the width text field
   - Enter the desired **height** in pixels in the height text field
   - Reference the specifications below for recommended dimensions

5. **Export the Resized Image**
   - Click the **Export** button to download your resized image
   - The tool will process and provide a download link

6. **Upload to System**
   - Use the downloaded resized image when uploading to the media management page

## Image Specifications by Type

### Hero Images (Home Page Hero Section)

**Recommended Dimensions:**
- **Desktop**: 800×1200px (2:3 aspect ratio)
- **Mobile**: 600×900px (2:3 aspect ratio)
- **Format**: WebP preferred, JPG acceptable
- **Quality**: 80-85%
- **File Size**: Under 300KB

**To Display as Hero Image:**
- After uploading, check the **'Home Page Hero Image'** checkbox in the upload form
- This ensures the image appears in the home page hero section rotation

### Featured Event Images

**Recommended Dimensions:**
- **Desktop**: 1920×1080px (16:9 aspect ratio)
- **Mobile**: 800×450px (16:9 aspect ratio)
- **Format**: WebP preferred, JPG acceptable
- **Quality**: 85-90%
- **File Size**: Under 500KB

### Gallery Images

**Recommended Dimensions:**
- **Standard**: 1200×800px (3:2 aspect ratio)
- **Square**: 1080×1080px (1:1 aspect ratio)
- **Format**: WebP preferred, JPG acceptable
- **Quality**: 80-90%
- **File Size**: Under 500KB

### Profile Images (Executive Committee, etc.)

**Recommended Dimensions:**
- **Standard**: 800×1000px (4:5 aspect ratio)
- **Format**: JPG or PNG
- **Quality**: 85-90%
- **File Size**: Under 200KB

## Why Uncheck "Lock Aspect Ratio"?

The "Lock Aspect Ratio" option maintains the original width-to-height relationship of your image. By unchecking it:

- You can set **exact dimensions** required by the system
- Images will match the specified aspect ratios (2:3, 16:9, etc.)
- You have full control over width and height independently

## Why Uncheck "Background Fill"?

The "Background Fill" option adds colored backgrounds when resizing to different aspect ratios. By unchecking it:

- Images maintain their original appearance without artificial backgrounds
- No unwanted color padding is added
- The resize operation focuses purely on dimension adjustment

## Best Practices

### Before Resizing

1. **Start with High-Quality Source Images**
   - Use original, high-resolution images when possible
   - Avoid starting with already-compressed images

2. **Consider the Final Display Context**
   - Check which type of image you're creating (Hero, Featured, Gallery, etc.)
   - Refer to the specifications above for exact dimensions

3. **Maintain Image Quality**
   - Don't over-compress images
   - Keep file sizes reasonable but maintain visual quality

### During Resizing

1. **Use Exact Dimensions**
   - Enter the exact pixel dimensions recommended for your image type
   - Don't approximate or round up/down unnecessarily

2. **Preserve Important Content**
   - Ensure important subjects remain visible after resizing
   - Consider how the crop/resize will affect composition

### After Resizing

1. **Verify Dimensions**
   - Check the downloaded image dimensions match your requirements
   - Verify file size is within recommended limits

2. **Test Display**
   - Upload and preview the image in the system
   - Check how it appears on different screen sizes if possible

## Home Page Hero Image Checkbox

### When to Use

Check the **'Home Page Hero Image'** checkbox when uploading images that should appear in the home page hero section. This checkbox:

- Marks the image for inclusion in the hero image rotation
- Only images with this checkbox checked and `isHomePageHeroImage = true` will appear
- Works in combination with event criteria (future events, active status, within 3 months)

### Selection Criteria

Hero images are selected based on:
1. Event must be in the future (`startDate >= today`)
2. Media must have `isHomePageHeroImage = true`
3. Event must be active (`isActive = true`)
4. Event must be within 3 months of the current date

## Troubleshooting

### Image Appears Stretched or Distorted

- **Solution**: Ensure you unchecked "Lock Aspect Ratio" and entered exact dimensions
- **Alternative**: Use dimensions that match the required aspect ratio

### Image File Size Too Large

- **Solution**: Use the target file size feature in ImageResizer (if available) or compress further
- **Alternative**: Reduce quality settings slightly or use WebP format

### Image Not Appearing in Hero Section

- **Solution**: Verify the "Home Page Hero Image" checkbox is checked after upload
- **Check**: Ensure the associated event meets the hero image selection criteria
- **Verify**: Image dimensions match hero image specifications (800×1200px recommended)

### Resized Image Quality Looks Poor

- **Solution**: Start with a higher resolution source image
- **Alternative**: Adjust quality settings to 85-90% during export
- **Note**: Some quality loss is normal when resizing, but should be minimal

## Alternative Image Resizing Tools

While ImageResizer.com is recommended, you can also use:

- **Online**: TinyPNG, Squoosh, ImageOptim
- **Desktop**: ImageOptim (Mac), FileOptimizer (Windows), GIMP, Photoshop
- **Command Line**: ImageMagick, Sharp (for developers)

## Related Documentation

- [Hero Section Image Specifications](./HERO_SECTION_IMAGE_SPECIFICATIONS.md)
- [Our Team Image Specifications](./OUR_TEAM_IMAGE_SPECIFICATIONS.md)
- [Hero Image Selection & Overlay Logic](./hero-image-selection-overlay-logic.md)

## Version History

- **v1.0**: Initial guide created
- **Date**: January 2025
- **Page Reference**: `/admin/events/[id]/media`

---

**Last Updated**: January 2025
**Maintained By**: Development Team


