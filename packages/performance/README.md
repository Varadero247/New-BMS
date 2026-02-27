# @ims/performance

Performance testing and accessibility auditing toolkit for IMS.

## Features

- k6 load test scripts for all 42 API services (4001–4041 + api-search:4050)
- Large dataset stress testing (25 scenarios)
- Lighthouse CI configuration for web performance
- axe-core WCAG 2.2 AA accessibility auditing
- 56-item performance checklist

## Load Testing (k6)

```bash
# Test individual services
k6 run packages/performance/k6/individual-services.js

# Large dataset stress test
k6 run packages/performance/k6/large-dataset.js

# Test specific service
k6 run --env SERVICE=health-safety packages/performance/k6/individual-services.js
```

### k6 Scripts

| Script                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `individual-services.js` | Tests all 42 API services with CRUD operations |
| `large-dataset.js`       | 25 stress scenarios with large payloads        |

## Accessibility

```bash
# Run axe-core audit against running app
node packages/performance/a11y/audit.js http://localhost:3000
```

Checks for WCAG 2.2 AA compliance including color contrast, ARIA attributes, keyboard navigation, and heading hierarchy.

## Lighthouse CI

```bash
# Run Lighthouse CI
lhci autorun --config packages/performance/lighthouse/lighthouserc.js
```
