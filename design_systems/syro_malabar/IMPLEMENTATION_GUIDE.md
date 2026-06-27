# Syro-Malabar Design System - Implementation Guide

## ✅ Setup Complete

The Syro-Malabar design system has been successfully integrated into your Next.js + Tailwind CSS project. All tokens are **namespaced with `syro-` prefix** to ensure **zero conflicts** with existing MOSC styles.

## Files Modified/Created

1. ✅ **`tailwind.config.js`** - Added Syro-Malabar tokens to `extend` section (non-breaking)
2. ✅ **`src/styles/syro-malabar.css`** - Created CSS module for complex patterns

## Usage Instructions

### 1. Import CSS Module

In your Syro-Malabar layout or page component, import the CSS module:

```tsx
// src/app/syro-malabar/layout.tsx or page.tsx
import '@/styles/syro-malabar.css';
```

### 2. Use Tailwind Utilities

All Syro-Malabar design tokens are available as Tailwind utility classes:

#### Colors
```tsx
// Primary Colors
<div className="bg-syro-red text-white">Red Background</div>
<div className="bg-syro-red-darker">Darker Red</div>
<div className="bg-syro-red-light">Light Red (with opacity)</div>
<div className="text-syro-blue">Blue Text</div>
<div className="text-syro-blue-secondary">Secondary Blue</div>
<div className="text-syro-blue-light">Light Blue</div>

// Secondary Colors
<div className="bg-syro-orange">Orange</div>
<div className="bg-syro-purple">Purple</div>
<div className="bg-syro-maroon">Maroon</div>

// Neutrals
<div className="bg-syro-bg-gray">Background Gray</div>
<div className="text-syro-text-gray">Text Gray</div>
<div className="border-syro-table-border">Table Border</div>

// Semantic Colors
<div className="bg-syro-success text-white">Success</div>
<div className="bg-syro-success-bg text-syro-success">Success Background</div>
<div className="bg-syro-warning text-white">Warning</div>
<div className="bg-syro-warning-bg text-syro-warning">Warning Background</div>
```

#### Typography
```tsx
// Font Families
<div className="font-syro-primary">Poppins Font</div>
<div className="font-syro-display">Playfair Display Font</div>

// Font Sizes
<h1 className="text-syro-h1">Main Title (2.8rem)</h1>
<h2 className="text-syro-h2">Stat Card Value (2.2rem)</h2>
<h3 className="text-syro-h3">Chart Title (1.8rem)</h3>
<h4 className="text-syro-h4">Quick Actions Title (1.5rem)</h4>
<h6 className="text-syro-h6">Action Card Title (18px)</h6>
<p className="text-syro-body">Body Text (20px)</p>
<span className="text-syro-label">Label (16px)</span>
<small className="text-syro-small">Small Text (14px)</small>
```

#### Spacing
```tsx
<div className="p-syro-xs">5px padding</div>
<div className="m-syro-sm">10px margin</div>
<div className="gap-syro-md">15px gap</div>
<div className="space-y-syro-lg">20px vertical spacing</div>
<div className="mb-syro-xl">30px bottom margin</div>
<div className="py-syro-xxl">40px vertical padding</div>
<div className="px-syro-xxxl">60px horizontal padding</div>
```

#### Shadows
```tsx
<header className="shadow-syro-header">Header Shadow</header>
<div className="shadow-syro-card hover:shadow-syro-card-hover">Card with Hover</div>
```

#### Responsive Breakpoints
```tsx
<div className="syro-tablet:hidden">Hidden on tablet (991px+)</div>
<div className="syro-mobile:block">Block on mobile (576px+)</div>
```

### 3. Use Custom CSS Classes

For complex patterns (pseudo-elements, vertical text), use the custom CSS classes:

```tsx
// Section Title with Vertical Text and Accent Bar
<div className="syro-section-title">
  <h6>Overview</h6>
</div>

// Stat Card Icon with Gradient
<div className="w-[65px] h-[65px] rounded-[5px] flex items-center justify-center text-white syro-stat-icon">
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {/* Icon SVG */}
  </svg>
</div>

// User Avatar with Gradient
<div className="w-10 h-10 rounded-full flex items-center justify-center text-white syro-user-avatar">
  JD
</div>

// Chart Placeholder with Gradient
<div className="h-[400px] rounded-[5px] syro-chart-placeholder flex items-center justify-center">
  Chart Placeholder
</div>

// Primary Button (optional - can also use Tailwind classes)
<a href="#" className="syro-primary-button">
  View All
</a>
```

## Complete Component Examples

### Stat Card
```tsx
<div className="bg-white p-10 rounded-[5px] shadow-syro-card hover:shadow-syro-card-hover transition-all duration-500 relative">
  <div className="flex justify-between items-center mb-5">
    <div className="w-[65px] h-[65px] rounded-[5px] flex items-center justify-center text-white text-[26px] syro-stat-icon">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  </div>
  <div className="text-syro-h2 font-bold text-syro-blue mb-1">124.5K</div>
  <div className="text-syro-label text-syro-medium-gray font-light">Total Views</div>
  <div className="text-syro-small font-medium mt-2.5 text-syro-success">+12.5%</div>
</div>
```

### Primary Button
```tsx
<a 
  href="#" 
  className="no-underline text-white bg-syro-red py-2.5 px-5 border-r-[7px] border-syro-red-darker font-light inline-block transition-all duration-1000 hover:bg-syro-red-darker hover:border-r-[6px] hover:border-syro-red hover:text-white"
>
  <span>View All</span>
  <svg className="w-4 h-4 ml-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
</a>
```

### Badge
```tsx
<span className="py-1 px-3 rounded text-syro-small font-medium bg-syro-success-bg text-syro-success">
  Active
</span>
```

### Data Table
```tsx
<div className="bg-white p-10 rounded-[5px] shadow-syro-card">
  <table className="w-full border-collapse">
    <thead>
      <tr>
        <th className="text-left p-4 font-semibold text-syro-blue border-b-2 border-syro-table-border">
          Name
        </th>
        <th className="text-left p-4 font-semibold text-syro-blue border-b-2 border-syro-table-border">
          Status
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="hover:bg-syro-red-light">
        <td className="p-4 border-b border-syro-table-border text-syro-dark-gray">John Doe</td>
        <td className="p-4 border-b border-syro-table-border text-syro-dark-gray">Active</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Important Notes

### ✅ **Zero Conflicts Guaranteed**
- All Syro-Malabar tokens use `syro-` prefix
- Existing MOSC styles remain completely unaffected
- You can use both design systems in the same project

### ✅ **Isolation**
- Syro-Malabar styles are completely separate
- Only imported where needed (via CSS import)
- No global style pollution

### ✅ **Best Practices**
1. **Always import CSS module** in Syro-Malabar layouts/pages
2. **Use Tailwind utilities** for 90% of styling
3. **Use custom CSS classes** only for complex patterns (pseudo-elements, vertical text)
4. **Use inline SVG icons** (matching project pattern, not Font Awesome)
5. **Test responsive breakpoints** (991px tablet, 576px mobile)

## Next Steps

1. Create your Syro-Malabar layout/page
2. Import `@/styles/syro-malabar.css`
3. Start building components using the Tailwind utilities
4. Reference `syromalabar_site_general_design_final.json` for complete specifications

## Troubleshooting

### Colors not working?
- Make sure you're using the `syro-` prefix (e.g., `bg-syro-red`, not `bg-red`)
- Verify Tailwind config was saved and dev server restarted

### Custom CSS classes not working?
- Make sure you've imported `@/styles/syro-malabar.css` in your layout/page
- Check that the CSS file is in the correct location

### Conflicts with existing styles?
- All Syro-Malabar tokens are prefixed with `syro-` to prevent conflicts
- If you see conflicts, check for typos (missing `syro-` prefix)
