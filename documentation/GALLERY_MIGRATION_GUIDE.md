# Gallery Migration Guide - MOSC Website

## Overview

This guide documents the migration of the MOSC photo gallery from the legacy WordPress site to the new Next.js application with modern UI and design patterns.

## What Was Migrated

- ✅ **26 Photo Albums** - All major gallery albums from the legacy site
- ✅ **300+ Photos** - Extracted image paths from legacy HTML files
- ✅ **Modern UI Components** - Reusable `GalleryAlbum` component with lightbox functionality
- ✅ **Responsive Design** - Following MOSC styling standards with sacred design elements
- ✅ **Individual Album Pages** - Each album has its own dedicated page

## Files Created

### Components
- `src/app/mosc/gallery/components/GalleryAlbum.tsx` - Reusable gallery component with:
  - Responsive photo grid
  - Lightbox/modal view with navigation
  - Keyboard controls (Arrow keys, Escape)
  - Photo counter
  - "Back to Gallery" navigation

### Album Pages (26 pages generated)
All album pages are located in `src/app/mosc/gallery/[album-slug]/page.tsx`:

1. `enthronement-mathews-iii` - Enthronement Ceremony of His Holiness (2021) - 49 photos
2. `russia-visit` - Russia Visit of H.H Baselios Marthoma Mathews III (2019) - 61 photos
3. `ceremonial-reception-russian-orthodox` - Ceremonial Reception by Russian Orthodox Church (2019) - 10 photos
4. `ethiopian-visit` - Ethiopian Visit (2013) - 6 photos
5. `vatican-visit` - Vatican Visit (2016) - 43 photos
6. `visit-abune-mathias` - Visit of Abune Mathias (2016) - 4 photos
7. `order-st-thomas-abune-mathias` - Order of St.Thomas Ceremony (2016) - 8 photos
8. `armenian-genocide-100th` - 100th Anniversary of Armenian Genocide (2015) - 6 photos
9. `armenian-genocide-canonization` - Canonization of Armenian Genocide Victims (2015) - 6 photos
10. `private-audience-aram` - Private Audience with H.H Aram (2015) - 6 photos
11. `private-audience-karekin` - Private Audience with Karekin I (2015) - 5 photos
12. `armenian-president` - With Armenian President (2015) - 2 photos
13. `blessing-holy-myron` - Blessing of Holy Myron (2015) - 6 photos
14. `enthronement-coptic-pope` - Coptic Pope Enthronement (2012) - 4 photos
15. `paulose-ii-with-kiril` - Paulose II with Kiril Patriarch (2012) - 20 photos
16. `rome-visit` - Rome Visit (2015) - 6 photos
17. `canberra-visit` - Canberra Visit (2015) - 6 photos
18. `reception-tikon-puthupally` - Reception to H.B.Tikon at Puthupally (2015) - 12 photos
19. `private-audience-tikon-devalokam` - Private Audience with H.B.Tikon (2015) - 10 photos
20. `offering-incense-st-thomas` - Offering Incense at St.Thomas Relics (2016) - 3 photos
21. `website-inauguration` - Official Website Inauguration (2015) - 8 photos
22. `pokrovsky-monastery` - Pokrovsky Monastery Chapel (2019) - 3 photos
23. `vienna-fraternity` - Fraternity at Vienna (2013) - 6 photos
24. `st-cyril-methodius` - Reception at St. Cyril and Methodius Institute (2019) - 4 photos
25. `mother-feofania` - Mother Feofania and Little Flowers (2019) - 2 photos
26. `dharma-dhamma-conference` - 3rd International Dharma-Dhamma Conference (2015) - 6 photos

### Scripts
- `scripts/generate-gallery-pages.cjs` - Automated page generation script

## Next Steps: Image Migration

### 1. Create Directory Structure

Create the gallery image directories in your public folder:

```bash
mkdir -p public/images/mosc/gallery
```

### 2. Copy Images from Legacy Site

For each album, copy images from the legacy site to the new structure. The script output shows the exact paths:

**Example for Enthronement album:**

```bash
# Source (legacy)
code_clone_ref/mosc_in/photo-gallery/enthronement-ceremony-of-his-holiness-baselios-marthoma-mathews-iii/

# Destination (new site)
public/images/mosc/gallery/enthronement-mathews-iii/
```

### 3. Image Filename Cleanup

The legacy site uses multiple image sizes with suffixes like `-1024x683.jpg`, `-150x150.jpg`, etc.

**You need to:**
1. Copy the **highest quality version** of each image (usually the one without size suffix or the largest size)
2. Rename files to remove size suffixes
3. Ensure filenames match what's in the page.tsx files

**Example:**
- Legacy: `C1-1024x629.jpg`, `C1-300x184.jpg`, `C1-768x472.jpg`
- New site needs: `C1.jpg` (use the original or highest quality version)

### 4. Automated Image Copy Script (Optional)

You can create a PowerShell script to automate the copying:

```powershell
# copy-gallery-images.ps1
$legacyBase = "code_clone_ref\mosc_in\photo-gallery"
$newBase = "public\images\mosc\gallery"

# Example for one album
$albums = @{
    "enthronement-ceremony-of-his-holiness-baselios-marthoma-mathews-iii" = "enthronement-mathews-iii"
    "russia-visit-of-h-h-baselios-marthoma-mathews-iii" = "russia-visit"
    # ... add all albums
}

foreach ($legacy in $albums.Keys) {
    $newSlug = $albums[$legacy]
    $sourcePath = Join-Path $legacyBase $legacy
    $destPath = Join-Path $newBase $newSlug
    
    # Create destination directory
    New-Item -ItemType Directory -Force -Path $destPath
    
    # Copy images (you'll need to manually select the right versions)
    Write-Host "Copy from: $sourcePath"
    Write-Host "       to: $destPath"
}
```

## Testing Gallery Pages

### 1. Start Development Server
```bash
npm run dev
```

### 2. Visit Gallery Pages

- Main gallery: `http://localhost:3000/mosc/gallery`
- Individual albums: `http://localhost:3000/mosc/gallery/[album-slug]`

**Examples:**
- http://localhost:3000/mosc/gallery/enthronement-mathews-iii
- http://localhost:3000/mosc/gallery/russia-visit
- http://localhost:3000/mosc/gallery/vatican-visit

### 3. Test Checklist

For each album page, verify:
- [ ] Page loads without errors
- [ ] All images display correctly (no broken images)
- [ ] Photo grid is responsive (mobile, tablet, desktop)
- [ ] Lightbox opens when clicking photos
- [ ] Navigation works (previous/next buttons, arrow keys)
- [ ] Close button and Escape key work
- [ ] "Back to Gallery" link works
- [ ] Photo counter shows correct numbers

## Design Features

### MOSC Styling Standards
The gallery follows all MOSC design standards:

- **Color Palette**: Warm earth tones (`#F5F1E8` background, `#8B7D6B` primary)
- **Typography**: 
  - `font-heading` (Crimson Text) for titles
  - `font-body` (Source Sans Pro) for content
- **Spacing**: Sacred spacing patterns (`space-sacred`)
- **Shadows**: Custom sacred shadows (`sacred-shadow`, `sacred-shadow-lg`)
- **Transitions**: Reverent transitions (`reverent-transition`)
- **Responsive Design**: Mobile-first with proper breakpoints

### Component Features
- **Grid Layout**: Responsive 1-4 column grid based on screen size
- **Lightbox Modal**: Full-screen image viewer with navigation
- **Keyboard Navigation**: Arrow keys for previous/next, Escape to close
- **Touch Gestures**: Click/tap to view, swipe gestures on mobile
- **Loading States**: Next.js Image optimization with proper sizing
- **Accessibility**: Proper ARIA labels and keyboard support

## Notes for Missing Albums

The following albums were skipped due to missing legacy folders:
- `reception-mathews-iii` - HTML file not found in legacy structure
- `vatican-visit-1` through `vatican-visit-5` - May be duplicate or alternate views

These can be added manually if needed by creating the page files following the same pattern.

## Troubleshooting

### Images Not Loading
1. Check that images are in correct path: `public/images/mosc/gallery/[album-slug]/[image-name].jpg`
2. Verify filenames match exactly (case-sensitive)
3. Check browser console for 404 errors

### Lightbox Not Working
1. Ensure JavaScript is enabled
2. Check browser console for errors
3. Verify the GalleryAlbum component is client-side (`'use client'` directive)

### Layout Issues
1. Verify MOSC styling standards are imported in `src/app/mosc/layout.tsx`
2. Check that Tailwind config includes MOSC custom classes
3. Test on different screen sizes

## Future Enhancements

Possible improvements for future iterations:
- [ ] Image lazy loading optimization
- [ ] Photo download functionality
- [ ] Social sharing buttons
- [ ] Album search/filter by category
- [ ] Slideshow autoplay mode
- [ ] Photo captions and descriptions
- [ ] Admin interface for managing albums
- [ ] Integration with backend API for dynamic galleries

## Summary

✅ **Complete:**
- 26 album pages generated
- Modern UI component created
- Responsive design implemented
- MOSC styling standards applied
- Automated generation script

⏳ **In Progress:**
- Image migration from legacy to new structure

🔜 **Next:**
- Copy all gallery images
- Test all gallery pages
- Update main gallery page cards with correct counts

---

**Generated:** $(date)
**Last Updated:** Check git history

