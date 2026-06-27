'use client';

import React from 'react';

/**
 * Help content for media management pages: hero section and event media image specifications.
 * Rendered inside EventFormHelpTooltip via customContent.
 */
export default function MediaImageSpecHelpContent() {
  return (
    <div className="space-y-6 text-sm text-gray-800">
      <h4 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2">
        Image specifications for hero and event media
      </h4>

      {/* Section 1 - Left panel (home page hero left; see docs/hero-section-1-image-resize-prompt.md) */}
      <section>
        <h5 className="font-semibold text-blue-700 mb-2">Section 1 — Left panel (Kerala / MALAYALEES.US banner)</h5>
        <p className="text-xs text-gray-600 mb-2">
          Full resize prompt: <code className="bg-gray-100 px-1 rounded">docs/hero-section-1-image-resize-prompt.md</code>. Example file: <code className="bg-gray-100 px-1 rounded">public/images/hero_section/wooden-boat-under-coconut-tree-riverside_ver_2.jpg</code>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Output:</strong> 1000 × 1200 px or 1200 × 1440 px (aspect ratio 5:6 portrait)</li>
          <li><strong>Method:</strong> Reduce height of the visual content and add padding to top and bottom inside the image (soft gradient or solid tone) so the banner fits the frame without being cropped.</li>
          <li><strong>Preserve:</strong> Full vertical &quot;MALAYALEES.US&quot; text, yellow circular logo (palm frond + &quot;malayalees Friends&quot;), US flag elements, palm trees, water, tropical scene — all visible and legible; scale down, never crop.</li>
          <li><strong>Padding:</strong> Equal padding above and below; center content vertically. Use dark blue/purple gradient or solid, or gentle sky/water extension.</li>
          <li>High quality (e.g. 90%+); same format as source (PNG or JPEG).</li>
        </ul>
      </section>

      {/* Section 2 - Slideshow */}
      <section>
        <h5 className="font-semibold text-blue-700 mb-2">Section 2 — Right panel (slideshow / event images)</h5>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Aspect ratio:</strong> 5:2 wide landscape (2.5:1)</li>
          <li><strong>Recommended:</strong> 2000 × 800 px (also 2500×1000 or 1500×600)</li>
          <li><strong>Minimum:</strong> 1200 × 480 px</li>
          <li><strong>Fit:</strong> object-cover — center 60% is the safe zone; edges may be cropped by viewport</li>
        </ul>
      </section>

      {/* Section 3 - Mission card */}
      <section>
        <h5 className="font-semibold text-blue-700 mb-2">Section 3 — Mission card (Unite India banner)</h5>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Recommended:</strong> 1000 × 200 px (aspect ratio 5:1 wide)</li>
          <li><strong>Minimum:</strong> 680 × 140 px (keep 5:1)</li>
          <li>Wide horizontal banner; keep main message and branding centered</li>
        </ul>
      </section>

      {/* Featured event image (isFeaturedEventImage) */}
      <section>
        <h5 className="font-semibold text-blue-700 mb-2">Featured event image</h5>
        <p className="mb-2 text-gray-600">Used for events marked as Featured: banner below hero and/or Featured Events cards.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Recommended:</strong> 1920 × 1080 px (16:9 aspect ratio)</li>
          <li><strong>Mobile:</strong> 800 × 450 px (16:9)</li>
          <li><strong>Format:</strong> WebP preferred, JPEG acceptable; quality 85–90%</li>
          <li><strong>File size:</strong> Under 500 KB</li>
          <li>16:9 fills the container without padding on all screen sizes</li>
        </ul>
      </section>
    </div>
  );
}
