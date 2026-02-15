// Design tokens
export * as tokens from './tokens';
export { nexara, moduleColors, sectorColors, chartColors } from './tokens';

// Utility functions
export { cn, formatDate, formatNumber, formatCurrency } from './utils';

// Login Page
export { LoginPage, type LoginPageProps } from './login-page';

// Button
export { Button, buttonVariants, type ButtonProps } from './button';

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';

// Input
export { Input, type InputProps } from './input';

// Select
export { Select, type SelectProps } from './select';

// Textarea
export { Textarea, type TextareaProps } from './textarea';

// Label
export { Label, type LabelProps } from './label';

// Badge
export { Badge, badgeVariants, type BadgeProps } from './badge';

// Modal
export { Modal, ModalFooter } from './modal';

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

// Export Dropdown
export { ExportDropdown } from './export-dropdown';

// AppShell
export { AppShell, type AppShellProps, type NavItem, type NavSection } from './app-shell';

// TopBar
export { TopBar, type TopBarProps } from './top-bar';

// PageHeader
export { PageHeader, type PageHeaderProps } from './page-header';

// EmptyState
export { EmptyState, type EmptyStateProps } from './empty-state';

// Spinner
export { Spinner, type SpinnerProps } from './spinner';

// AI Disclosure
export { AIDisclosure, type AIDisclosureProps } from './ai-disclosure';

// Human Review Gate
export { HumanReviewGate, type HumanReviewGateProps } from './human-review-gate';

// Dark Mode Toggle
export { DarkModeToggle, type DarkModeToggleProps } from './dark-mode-toggle';

// Global Search (Cmd+K)
export { GlobalSearch, type GlobalSearchProps, type SearchResult } from './global-search';

// Command Palette (Cmd+K)
export { CommandPalette, type CommandPaletteProps, type CommandItem } from './command-palette';

// Notification Centre
export { NotificationCentre, type NotificationCentreProps, type Notification } from './notification-centre';

// Onboarding Checklist
export { OnboardingChecklist, type OnboardingChecklistProps, type OnboardingStep } from './onboarding-checklist';

// Plan Badge
export { PlanBadge, type PlanBadgeProps, type PlanTier } from './plan-badge';

// DataTable
export { DataTable, type DataTableProps, type DataTableColumn } from './data-table';

// Form
export { FormGroup, FormField, FormError, FormActions, type FormGroupProps, type FormFieldProps, type FormErrorProps, type FormActionsProps } from './form';

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps, type TabsListProps, type TabsTriggerProps, type TabsContentProps } from './tabs';

// Status Indicator
export { StatusIndicator, type StatusIndicatorProps, type ServiceStatus } from './status-indicator';

// Confirm Dialog
export { ConfirmDialog, type ConfirmDialogProps } from './confirm-dialog';

// Toast
export { ToastProvider, useToast, type Toast, type ToastVariant } from './toast';

// Breadcrumbs
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from './breadcrumbs';

// Progress Bar
export { ProgressBar, type ProgressBarProps } from './progress-bar';

// Stepper
export { Stepper, type StepperProps, type StepperStep } from './stepper';

// Avatar
export { Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps } from './avatar';

// Tooltip
export { Tooltip, type TooltipProps } from './tooltip';

// Skeleton
export { Skeleton, type SkeletonProps } from './skeleton';

// Alert
export { Alert, type AlertProps, type AlertVariant } from './alert';

// Dropdown Menu
export { DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator, type DropdownMenuProps, type DropdownItemProps, type DropdownLabelProps } from './dropdown-menu';

// Stat Card
export { StatCard, type StatCardProps } from './stat-card';

// Timeline
export { Timeline, type TimelineProps, type TimelineItem } from './timeline';

// Gauge
export { Gauge, type GaugeProps } from './gauge';

// Chips
export { SeverityChip, StatusChip, ISOStatusChip } from './chips';

// Theme Toggle
export { ThemeToggle, type ThemeToggleProps } from './theme-toggle';

// Theme Switch (floating, Nexara-branded)
export { ThemeSwitch, type ThemeSwitchProps } from './theme-switch';

// Record Presence
export { RecordPresence, type RecordPresenceProps } from './record-presence';

// Activity Feed
export { ActivityFeed, ActivityFeedInline, type ActivityFeedProps, type ActivityFeedInlineProps, type ActivityEntry, type ActivityAction as ActivityActionType } from './activity-feed';

// Comment Thread
export { CommentThread, type CommentThreadProps } from './comment-thread';

// Quick Add Task
export { QuickAddTask, type QuickAddTaskProps } from './quick-add-task';

// Photo Capture
export { PhotoCapture, type PhotoCaptureProps } from './photo-capture';

// QR Code
export { QRCodeDisplay, QRScanner, type QRCodeDisplayProps, type QRScannerProps } from './qr-code';

// Bulk Import Wizard
export { BulkImportWizard, type BulkImportWizardProps } from './csv-import';

// Digital Signature
export { SignatureCapture, type SignatureCaptureProps, type SignatureData } from './signature-capture';

// GPS Location
export { useGeoLocation, type GeoLocation, type UseGeoLocationResult } from './use-geo-location';
export { LocationDisplay, type LocationDisplayProps } from './location-display';

// Offline Inspection Form
export { OfflineInspectionForm, type OfflineInspectionFormProps, type InspectionQuestion, type InspectionSection } from './offline-form';

// Tour Manager (Guided Tours)
export { TourManager, TourStep, useTour, TOURS, type TourManagerProps, type TourStepProps, type TourStepConfig, type TourConfig } from './tour-manager';

// Help Tooltip
export { HelpTooltip, type HelpTooltipProps } from './help-tooltip';

// Changelog Bell
export { ChangelogBell, type ChangelogBellProps, type ChangelogEntry as ChangelogEntryUI } from './changelog-bell';

// NPS Survey
export { NpsSurvey, type NpsSurveyProps } from './nps-survey';

// Cookie Consent
export { CookieConsent, type CookieConsentProps, type CookieChoices } from './cookie-consent';

// StatusBadge
export { StatusBadge, type StatusBadgeProps, type ComplianceStatus } from './status-badge';

// LoginModal
export { LoginModal, type LoginModalProps, type LoginEnvironment } from './login-modal';

// ── Nexara Brand Identity v3.0 Components ─────────────────────

// NexaraLogo
export { NexaraLogo, type NexaraLogoProps } from './nexara-logo';

// NexaraIcon
export { NexaraIcon, type NexaraIconProps } from './nexara-icon';

// AppNav
export { AppNav, NavTab, type AppNavProps, type NavTabProps } from './app-nav';

// AppSidebar
export { AppSidebar, type AppSidebarProps, type SidebarItem as NexaraSidebarItem } from './app-sidebar';

// KpiCard
export { KpiCard, type KpiCardProps } from './kpi-card';

// ModuleChip
export { ModuleChip, type ModuleChipProps } from './module-chip';

// SectorCard
export { SectorCard, type SectorCardProps } from './sector-card';

// NexaraTag
export { NexaraTag, type NexaraTagProps } from './nexara-tag';

// CodeBlock
export { CodeBlock, type CodeBlockProps } from './code-block';

// ChangelogBanner
export { ChangelogBanner, type ChangelogBannerProps } from './changelog-banner';

// PageShell
export { PageShell, type PageShellProps } from './page-shell';

// HeroSection
export { HeroSection, HeroButton, type HeroSectionProps, type HeroButtonProps } from './hero-section';
