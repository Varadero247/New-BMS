# @ims/templates

Built-in document and report template library for IMS. Provides 192 templates across 34 modules.

## Features

- 192 pre-built templates covering all ISO management system domains
- Template categories: policies, procedures, forms, registers, reports, plans, checklists
- Prisma models for template storage and customization (Template, TemplateVersion, TemplateCategory)
- 12 API endpoints for template CRUD, versioning, and export
- DOCX generation via `docx` package

## Template Modules

Templates cover all 34 `TemplateModule` values including: health-safety, environment, quality, hr, finance, crm, infosec, esg, cmms, food-safety, energy, risk, training, suppliers, assets, documents, complaints, contracts, ptw, incidents, audits, chemicals, emergency, and more.

## Usage

### API Endpoints (via api-gateway)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/templates` | List all templates (filterable by module) |
| GET | `/api/templates/:id` | Get template details |
| POST | `/api/templates` | Create custom template |
| PUT | `/api/templates/:id` | Update template |
| POST | `/api/templates/:id/export` | Export template as DOCX |
| GET | `/api/templates/modules` | List available modules |

### Seeding

```bash
pnpm --filter @ims/database seed:templates
```

This loads all 192 built-in templates into the database.

## See Also

- `docs/TEMPLATES.md` — Full template developer guide
- `docs/compliance-templates/` — DOCX template source files
