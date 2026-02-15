# @ims/api-project-management

**Type**: API Service (Express.js)  
**Port**: 4009  
**Standard/Domain**: Project Management  
**Part of**: [Nexara IMS](../../README.md)

## Purpose

Project management service with projects, tasks, sprints, milestones, resources, timesheets, risks, and stakeholder management.

## Running standalone

```bash
pnpm --filter @ims/api-project-management dev
```

## API Endpoints

- `/api/benefits`
- `/api/changes`
- `/api/documents`
- `/api/issues`
- `/api/milestones`
- `/api/projects`
- `/api/reports`
- `/api/resources`
- `/api/risks`
- `/api/sprints`
- `/api/stakeholders`
- `/api/tasks`
- `/api/timesheets`

## Dependencies

- @ims/auth
- @ims/database
- @ims/monitoring
- @ims/rbac
- @ims/service-auth
- @ims/shared
- @ims/types
- @ims/validation
