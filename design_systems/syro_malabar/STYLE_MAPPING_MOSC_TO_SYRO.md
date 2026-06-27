# Style Mapping: MOSC/Sacred → Syro-Malabar

Use this reference when copying MOSC app content to Syro. Replace MOSC/sacred class names with Syro design system tokens so content is identical and only styling changes.

## Class replacements

| MOSC / Sacred | Syro |
|---------------|------|
| `bg-background` | `bg-syro-bg-gray` |
| `text-foreground` | `text-syro-blue` |
| `text-muted-foreground` | `text-syro-dark-gray` or `text-syro-medium-gray` |
| `font-heading` | `font-syro-display` (or `font-syro-primary` for UI) |
| `font-body`, `font-caption` | `font-syro-primary` |
| `text-primary` (accents) | `text-syro-red` or `text-syro-blue` as appropriate |
| `bg-primary`, `bg-primary/10` | `bg-syro-red`, `bg-syro-red/10` or `bg-syro-blue/10` |
| `bg-card`, `bg-muted` | `bg-white`, `bg-syro-bg-gray` |
| `border-border` | `border-syro-table-border` |
| `sacred-shadow`, `sacred-shadow-lg` | `shadow-syro-card`, `shadow-syro-card-hover` |
| `reverent-transition` | `transition-all duration-300` |
| Section title (hero/subsection) | `syro-section-title` + red bar where design matches; else `text-syro-h1`/`text-syro-h2`/`text-syro-h3` with `text-syro-blue` |
| Buttons (primary CTA) | `syro-primary-button` (from syro-malabar.css) |
| Links (inline, "Read more") | `text-syro-red` or `text-syro-blue` with hover states |

## Typography (Tailwind)

- `text-syro-h1` … `text-syro-h6`, `text-syro-body`, `text-syro-label`, `text-syro-small`, `text-syro-section-title`
- Fonts: `font-syro-primary`, `font-syro-display`

## Spacing

- `syro-xs` … `syro-xxxl` (e.g. `p-syro-xxl`, `mb-syro-xl`, `gap-syro-lg`)

## Colors

- `syro-red`, `syro-blue`, `syro-maroon`, `syro-dark-gray`, `syro-medium-gray`, `syro-success`, `syro-warning`, `syro-table-border`, `syro-bg-gray`
- Success/warning backgrounds: `bg-syro-success-bg`, `bg-syro-warning-bg`

## Links

- Replace all `href="/mosc/..."` and `href: '/mosc/...'` with `href="/syro/..."` / `href: '/syro/...'` in copied files.
