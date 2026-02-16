-- Marketplace Seed Data: Initial plugins for the IMS plugin marketplace
-- Run after deploying marketplace.prisma schema tables

-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE "PluginCategory" AS ENUM ('INTEGRATION', 'REPORTING', 'AUTOMATION', 'COMPLIANCE', 'ANALYTICS', 'COMMUNICATION', 'DOCUMENT_MANAGEMENT', 'FIELD_SERVICE', 'SAFETY', 'QUALITY', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PluginStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'SUSPENDED', 'DEPRECATED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InstallStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'UNINSTALLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed plugins
INSERT INTO mkt_plugins (id, name, slug, description, author, "authorEmail", category, "iconUrl", "repositoryUrl", "documentationUrl", permissions, "webhookEvents", "isPublic", "isVerified", status, downloads, rating, "ratingCount", "createdAt", "updatedAt")
VALUES
  -- Integration plugins
  ('10000000-0000-0000-0000-000000000001', 'Slack Notifications', 'slack-notifications',
   'Send real-time IMS notifications, alerts, and audit updates directly to Slack channels. Supports custom channel routing per module, threaded replies for incidents, and rich message formatting with action buttons.',
   'Nexara', 'plugins@nexara.io', 'INTEGRATION', NULL, NULL, NULL,
   ARRAY['notifications:read', 'incidents:read', 'audits:read'], ARRAY['incident.created', 'audit.completed', 'capa.overdue', 'risk.threshold_exceeded'],
   true, true, 'PUBLISHED', 2847, 4.7, 156, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000002', 'Microsoft Teams', 'microsoft-teams',
   'Integrate IMS with Microsoft Teams for notifications, approval workflows, and document sharing. Includes adaptive cards for incident declarations, audit findings, and CAPA actions.',
   'Nexara', 'plugins@nexara.io', 'INTEGRATION', NULL, NULL, NULL,
   ARRAY['notifications:read', 'workflows:read', 'documents:read'], ARRAY['incident.created', 'workflow.step_completed', 'document.approved'],
   true, true, 'PUBLISHED', 1923, 4.5, 98, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000003', 'Jira Sync', 'jira-sync',
   'Bi-directional synchronisation between IMS CAPA actions and Jira issues. Automatically creates Jira tickets from non-conformances, syncs status updates, and maps custom fields.',
   'Nexara', 'plugins@nexara.io', 'INTEGRATION', NULL, NULL, NULL,
   ARRAY['capa:read', 'capa:write', 'risks:read'], ARRAY['capa.created', 'capa.status_changed', 'risk.action_created'],
   true, true, 'PUBLISHED', 1456, 4.3, 72, NOW(), NOW()),

  -- Reporting plugins
  ('10000000-0000-0000-0000-000000000004', 'Advanced PDF Reports', 'advanced-pdf-reports',
   'Generate professional PDF reports with custom branding, charts, and executive summaries. Supports scheduled report generation, multi-language output, and bulk export across all IMS modules.',
   'Nexara', 'plugins@nexara.io', 'REPORTING', NULL, NULL, NULL,
   ARRAY['reports:read', 'templates:read'], ARRAY['report.generated', 'report.scheduled'],
   true, true, 'PUBLISHED', 3201, 4.8, 189, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000005', 'Power BI Connector', 'power-bi-connector',
   'Connect IMS data to Microsoft Power BI for advanced visualisations and custom dashboards. Includes pre-built dataset templates for H&S KPIs, environmental metrics, and quality trends.',
   'Nexara', 'plugins@nexara.io', 'ANALYTICS', NULL, NULL, NULL,
   ARRAY['analytics:read', 'kpi:read'], ARRAY['data.refreshed'],
   true, true, 'PUBLISHED', 987, 4.4, 45, NOW(), NOW()),

  -- Automation plugins
  ('10000000-0000-0000-0000-000000000006', 'Email Digest Scheduler', 'email-digest-scheduler',
   'Automated email digests for management reviews, overdue actions, expiring documents, and upcoming audit schedules. Configurable frequency (daily/weekly/monthly) per recipient group.',
   'Nexara', 'plugins@nexara.io', 'AUTOMATION', NULL, NULL, NULL,
   ARRAY['notifications:write', 'users:read', 'actions:read'], ARRAY['digest.sent', 'reminder.sent'],
   true, true, 'PUBLISHED', 2134, 4.6, 112, NOW(), NOW()),

  -- Compliance plugins
  ('10000000-0000-0000-0000-000000000007', 'GDPR Compliance Pack', 'gdpr-compliance-pack',
   'Pre-configured GDPR compliance templates, data processing registers, DPIA assessments, and breach notification workflows. Includes 30+ document templates aligned with ICO guidance.',
   'Nexara', 'plugins@nexara.io', 'COMPLIANCE', NULL, NULL, NULL,
   ARRAY['templates:read', 'documents:write', 'infosec:read'], ARRAY['breach.reported', 'dpia.completed'],
   true, true, 'PUBLISHED', 1678, 4.5, 87, NOW(), NOW()),

  ('10000000-0000-0000-0000-000000000008', 'SOC 2 Toolkit', 'soc2-toolkit',
   'SOC 2 Type I and Type II preparation toolkit with evidence collection automation, control mapping, and readiness assessments. Maps IMS controls to Trust Services Criteria.',
   'Nexara', 'plugins@nexara.io', 'COMPLIANCE', NULL, NULL, NULL,
   ARRAY['controls:read', 'evidence:read', 'audits:read'], ARRAY['control.tested', 'evidence.collected'],
   true, true, 'PUBLISHED', 834, 4.2, 38, NOW(), NOW()),

  -- Communication plugins
  ('10000000-0000-0000-0000-000000000009', 'SMS Alerts', 'sms-alerts',
   'Critical SMS alerts for emergency incidents, overdue CAPA actions, and equipment failures. Supports Twilio and MessageBird providers with delivery tracking and escalation chains.',
   'Nexara', 'plugins@nexara.io', 'COMMUNICATION', NULL, NULL, NULL,
   ARRAY['notifications:write', 'incidents:read', 'emergency:read'], ARRAY['incident.critical', 'emergency.declared', 'equipment.failure'],
   true, true, 'PUBLISHED', 1245, 4.4, 63, NOW(), NOW()),

  -- Field Service plugins
  ('10000000-0000-0000-0000-000000000010', 'QR Code Asset Tags', 'qr-code-asset-tags',
   'Generate and print QR code labels for assets, equipment, and locations. Scan to view asset details, log inspections, report issues, or access maintenance history directly from mobile.',
   'Nexara', 'plugins@nexara.io', 'FIELD_SERVICE', NULL, NULL, NULL,
   ARRAY['assets:read', 'equipment:read', 'inspections:write'], ARRAY['asset.scanned', 'inspection.submitted'],
   true, true, 'PUBLISHED', 1567, 4.6, 84, NOW(), NOW()),

  -- Safety plugins
  ('10000000-0000-0000-0000-000000000011', 'Near-Miss Reporter', 'near-miss-reporter',
   'Simplified near-miss and hazard reporting with photo capture, GPS location, and voice-to-text. Includes anonymous reporting option and automatic trend analysis with heat maps.',
   'Nexara', 'plugins@nexara.io', 'SAFETY', NULL, NULL, NULL,
   ARRAY['incidents:write', 'hs:read'], ARRAY['nearmiss.reported', 'hazard.identified'],
   true, true, 'PUBLISHED', 2456, 4.7, 134, NOW(), NOW()),

  -- Quality plugins
  ('10000000-0000-0000-0000-000000000012', 'SPC Charts', 'spc-charts',
   'Statistical Process Control charts with automated out-of-control detection. Supports X-bar/R, X-bar/S, p-charts, c-charts, and u-charts with Western Electric rules and Nelson rules.',
   'Nexara', 'plugins@nexara.io', 'QUALITY', NULL, NULL, NULL,
   ARRAY['quality:read', 'analytics:read'], ARRAY['spc.out_of_control', 'process.capability_alert'],
   true, true, 'PUBLISHED', 1890, 4.8, 97, NOW(), NOW())

ON CONFLICT (slug) DO NOTHING;

-- Seed initial versions for each plugin
INSERT INTO mkt_plugin_versions (id, "pluginId", version, changelog, manifest, "isLatest", "publishedAt", "createdAt")
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '1.2.0', 'Added threaded replies and custom channel routing', '{"minPlatform": "1.0.0", "hooks": ["onIncidentCreated", "onAuditCompleted"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '1.1.0', 'Added adaptive cards for audit findings', '{"minPlatform": "1.0.0", "hooks": ["onIncidentCreated", "onWorkflowStep"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '1.0.0', 'Initial release with bi-directional sync', '{"minPlatform": "1.0.0", "hooks": ["onCapaCreated", "onCapaStatusChanged"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '2.0.0', 'Multi-language support and bulk export', '{"minPlatform": "1.0.0", "hooks": ["onReportGenerated"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '1.0.0', 'Initial release with 5 dataset templates', '{"minPlatform": "1.0.0", "hooks": ["onDataRefreshed"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', '1.3.0', 'Added monthly management review digest', '{"minPlatform": "1.0.0", "hooks": ["onDigestScheduled"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', '1.1.0', 'Updated for UK GDPR post-Brexit requirements', '{"minPlatform": "1.0.0", "hooks": ["onBreachReported"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', '1.0.0', 'Initial release with TSC mapping', '{"minPlatform": "1.0.0", "hooks": ["onControlTested"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', '1.0.0', 'Twilio and MessageBird support', '{"minPlatform": "1.0.0", "hooks": ["onCriticalIncident"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', '1.1.0', 'Added bulk label printing', '{"minPlatform": "1.0.0", "hooks": ["onAssetScanned"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '1.2.0', 'Voice-to-text and heat maps', '{"minPlatform": "1.0.0", "hooks": ["onNearMissReported"]}', true, NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', '1.0.0', 'Initial release with 6 chart types', '{"minPlatform": "1.0.0", "hooks": ["onSpcAlert"]}', true, NOW(), NOW())
ON CONFLICT ("pluginId", version) DO NOTHING;
