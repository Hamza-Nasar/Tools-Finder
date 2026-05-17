# Shadcn Component Audit and Mapping (Phase 1)

## Already in use
- `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Dialog`, `Sheet`, `Separator`, `Label`, `Alert`, `Skeleton`

## Added in this pass
- `Accordion`, `Avatar`, `Breadcrumb`, `Dropdown Menu`, `Navigation Menu`, `Progress`, `Select`, `Sonner`, `Switch`, `Table`, `Tabs`, `Tooltip`

## Mapping Plan (requested master list)
- Accordion: pricing FAQ, tool detail FAQ block (`app/pricing/page.tsx`, `components/tools/tool-detail.tsx`)
- Alert: finder notices, errors (`components/tools/ai-tool-finder.tsx`)
- Alert Dialog: destructive actions in dashboard/admin (`components/admin/*`, `components/dashboard/*`)
- Aspect Ratio: tool logos and screenshots (`components/tools/tool-card.tsx`)
- Avatar: user menu and testimonials (`components/layout/header-auth-controls.tsx`)
- Badge: tags, pricing chips, status (`components/tools/*`, `app/pricing/page.tsx`)
- Breadcrumb: tool details and alternatives pages (`app/tools/[slug]/page.tsx`, `app/alternatives/[slug]/page.tsx`)
- Button: global CTA/action
- Button Group: compare/finder actions (`components/tools/tool-grid-with-compare.tsx`)
- Calendar + Date Picker: alerts scheduling (`components/dashboard/alerts-manager.tsx`)
- Card: all section containers
- Carousel: homepage highlights (`app/page.tsx`)
- Chart: admin analytics (`components/admin/analytics-dashboard.tsx`)
- Checkbox: multi-filter selection (`components/tools/tool-filters.tsx`)
- Collapsible: advanced filter groups (`components/tools/tool-filters.tsx`)
- Combobox + Command: smart search/finder prompt select (`components/tools/ai-tool-finder.tsx`)
- Context Menu: tool cards quick actions (`components/tools/tool-card.tsx`)
- Data Table: admin tables (`components/admin/*`)
- Direction: RTL/LTR support wrapper at layout level
- Drawer: mobile compare tray and mobile filter panel (`components/tools/*`)
- Dropdown Menu: account and item menus (`components/layout/header-auth-controls.tsx`)
- Empty: empty state (`components/shared/empty-state.tsx`)
- Field + Label: forms
- Hover Card: quick preview on cards (`components/tools/tool-card.tsx`)
- Input + Input Group + Input OTP: search/auth forms
- Item + Kbd: command palette rows
- Menubar: desktop top utilities
- Native Select/Select: tool filter selects (`components/tools/tool-filters.tsx`)
- Navigation Menu: desktop header nav (`components/layout/site-header.tsx`)
- Pagination: listing pages
- Popover: advanced filter popovers
- Progress: fit score visuals (`components/tools/tool-detail.tsx`)
- Radio Group: pricing/sort modes where single select
- Resizable: compare page columns (`app/compare/[slug]/page.tsx`)
- Scroll Area: long lists and command results
- Sheet/Sidebar: mobile nav + dashboard
- Slider: budget/score controls
- Sonner/Toast: action feedback (save shortlist, compare)
- Spinner: async loading indicators
- Switch: quick toggles in filters
- Table: compare and admin data views
- Tabs: filter mode switching (`components/tools/tool-filters.tsx`)
- Toggle/Toggle Group: chip-like multi-select filters
- Tooltip: icon/action explanation
- Typography: content pages style standardization

## Applied now (concrete)
- `components/tools/tool-filters.tsx` migrated from native selects to `Select` and grouped filters with `Tabs`
- `components/layout/header-auth-controls.tsx` migrated custom menu to `DropdownMenu + Avatar`
- New UI primitives available for further rollout in remaining pages/modules

## Next rollout batches
1. Tools card/detail upgrade: `Tooltip`, `HoverCard`, `Progress`, `AspectRatio`, `ContextMenu`
2. Admin upgrade: `Table/DataTable`, `AlertDialog`, `Checkbox`, `Switch`, `Toast`
3. Finder upgrade: `Command`, `Combobox`, `Popover`, `ScrollArea`, `Spinner`
4. Homepage premium visuals: `Carousel`, `Accordion`, `Chart` spotlight
