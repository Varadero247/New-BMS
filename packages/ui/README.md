# @ims/ui

Shared React component library for all IMS web applications. Built with Tailwind CSS and class-variance-authority.

## Features

- 76 components from primitives to complex composites
- 76 Storybook stories with full component coverage and autodocs
- Nexara brand identity components (logo, icons, page shell)
- Dark mode support via `ThemeToggle` / `ThemeSwitch`
- Accessibility: ARIA labels, keyboard navigation, screen reader support
- Design tokens: colors, typography, spacing (via `@ims/ui/tokens`)
- Tailwind preset for consistent theming (via `@ims/ui/tailwind-preset`)
- Storybook v8.6 with Tailwind CSS integration, dark/light theme toggle

## Key Components

### Layout
`AppShell`, `AppSidebar`, `AppNav`, `PageShell`, `PageHeader`, `TopBar`

### Data Display
`DataTable`, `StatCard`, `KpiCard`, `Timeline`, `Gauge`, `Badge`, `StatusBadge`, `StatusIndicator`

### Forms
`Input`, `Select`, `Textarea`, `Label`, `FormGroup`, `FormField`, `FormError`

### Feedback
`Modal`, `ConfirmDialog`, `Alert`, `Spinner`, `Skeleton`, `ToastProvider`

### Navigation
`Breadcrumbs`, `Tabs`, `DropdownMenu`, `GlobalSearch`, `CommandPalette`

### Specialized
`LoginPage`, `ExportDropdown`, `BulkImportWizard`, `SignatureCapture`, `PhotoCapture`, `PhotoAnnotation`, `QRCodeDisplay`, `QRScanner`, `OfflineInspectionForm`, `GhsPictogram`

### Brand
`NexaraLogo`, `NexaraIcon`, `NexaraTag`, `ModuleChip`, `SectorCard`, `HeroSection`

## Usage

```typescript
import { Button, Card, Modal, DataTable } from '@ims/ui';
import { cn } from '@ims/ui';

<Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Item" size="lg">
  <Card>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </Card>
</Modal>
```

**Important:** The Modal component uses `isOpen` (not `open`) as its boolean prop.

## Storybook

```bash
# Development (http://localhost:6006)
pnpm storybook

# Build static site
pnpm build-storybook
```

76 stories organised by category: Layout, Data Display, Forms, Feedback, Navigation, Specialized, Brand, Interactive, and Advanced Inputs. Storybook includes Tailwind CSS support, dark/light theme toggle, and Nexara background presets.
