# Mutation Testing Guide

Mutation testing systematically checks how well the test suite catches bugs by
introducing small code changes ("mutants") and verifying that at least one test
fails for each change.  A mutant that is NOT killed by any test is called a
**surviving mutant** — a potential gap in test coverage.

---

## Quick Start

```bash
# Validation package (baseline, ~30 s)
pnpm test:mutation

# Auth package
pnpm test:mutation:auth

# Security package
pnpm test:mutation:security

# RBAC package
pnpm test:mutation:rbac

# Finance-calculations package
pnpm test:mutation:finance

# All packages in sequence (CI)
pnpm test:mutation:all
```

HTML reports open automatically; they are also written to `reports/mutation/`.

---

## Stryker Config Files

| File | Package | Mutated files |
|------|---------|--------------|
| `stryker.config.mjs` | `packages/validation` | `sanitize.ts`, `schemas.ts` |
| `stryker.auth.config.mjs` | `packages/auth` | `jwt.ts`, `middleware.ts`, `password.ts`, `adaptive-auth.ts`, `magic-link.ts` |
| `stryker.security.config.mjs` | `packages/security` | `rasp.ts`, `behavioral-analytics.ts`, `credential-scanner.ts`, `siem.ts` |
| `stryker.rbac.config.mjs` | `packages/rbac` | `permissions.ts`, `roles.ts`, `middleware.ts` |
| `stryker.finance.config.mjs` | `packages/finance-calculations` | `currency.ts`, `interest.ts`, `depreciation.ts` |

Report output directories:

```
reports/mutation/
  validation/   index.html + mutation.json
  auth/         index.html + mutation.json
  security/     index.html + mutation.json
  rbac/         index.html + mutation.json
  finance/      index.html + mutation.json
```

---

## Baseline Mutation Scores

Scores recorded at the time mutation testing was first established.
Update this table after each run on main.

| Package | Score | High threshold | Low threshold | Break threshold | Last run |
|---------|-------|---------------|---------------|-----------------|----------|
| validation | ~80 % | 80 % | 60 % | 50 % | 2026-02-23 (baseline) |
| auth | TBD | 75 % | 60 % | 50 % | — |
| security | TBD | 70 % | 55 % | 45 % | — |
| rbac | TBD | 75 % | 60 % | 50 % | — |
| finance-calculations | TBD | 80 % | 65 % | 55 % | — |

A score above the **high** threshold is shown in green, between low and high in
yellow, and below low in red.  Below **break**, Stryker exits with a non-zero
code and fails the CI job.

---

## How to Interpret Results

### Mutation score

```
Mutation score = killed / (killed + survived + no-coverage)
```

- **Killed** — at least one test failed for this mutant (good).
- **Survived** — no test caught the change (test gap).
- **No coverage** — the line is not executed by any test at all.
- **Timeout** — the mutant caused an infinite loop or was too slow.

### Reading the HTML report

1. Open `reports/mutation/<package>/index.html` in a browser.
2. Each source file shows a mutation score bar.
3. Click into a file to see every mutant inline, colour-coded:
   - Green — killed.
   - Red — survived (needs a new test).
   - Orange — timed out.
   - Blue — no coverage.

---

## How to Kill a Surviving Mutant

A surviving mutant tells you that no existing test exercises the specific
branch or value that was changed.  The fix is always a new (or improved) test.

**Workflow**

1. Open the HTML report and find a red (survived) mutant.
2. Note the original code and what Stryker changed (e.g. `>` → `>=`,
   `true` → `false`, removed a `return`).
3. Write a test whose assertion would fail if that exact change were real.
4. Re-run the relevant Stryker config to confirm the new test kills it.

**Example — boundary condition mutant**

Original code in `packages/validation/src/sanitize.ts`:
```ts
if (value.length > 255) throw new Error('Too long');
```

Stryker changes it to `>= 255`.  A surviving mutant means no test passes
`value.length === 255` and expects no error.  Add:

```ts
it('accepts a 255-character string', () => {
  expect(() => sanitize('a'.repeat(255))).not.toThrow();
});
it('rejects a 256-character string', () => {
  expect(() => sanitize('a'.repeat(256))).toThrow('Too long');
});
```

---

## Known Gotchas

### 1. `toEqual` and `-0 !== 0`

JavaScript treats `-0 === 0` but `Object.is(-0, 0)` is `false`.  Jest's
`toEqual` uses `Object.is` internally, so `expect(-0).toEqual(0)` fails.
Avoid zero inputs to negation/multiplication when writing mutation-killer
tests; or use `toBe(0)` which uses `===`.

### 2. Arrow function parameter scope

Stryker sometimes generates mutants that reference arrow function parameters
outside their body.  This causes a `ReferenceError` at runtime, which Stryker
counts as a timeout rather than a kill.  Keep test helper lambdas short and
self-contained to avoid confusion.

### 3. `\1` backreference in double-quoted JavaScript strings

`"\1"` in a JS string is the byte `0x01`, NOT a regex backreference.  If a
source file uses `"\1"` in a regex-like context, write test assertions against
the actual character (or use the loop-based reference implementation), not a
backreference.

### 4. `jest.clearAllMocks()` does not drain `mockResolvedValueOnce` queues

`clearAllMocks` only resets `calls`/`instances`/`results`.  If you share a
mock across `describe` blocks, leftover `Once` entries from a prior describe
shift the queue and cause wrong values.  Call `mockFn.mockReset()` in
`beforeEach` instead.

### 5. `enableFindRelatedTests: true` and per-package configs

Each Stryker config points at the package-local jest config
(`packages/<name>/jest.config.js`).  `enableFindRelatedTests` tells Jest to
run only the tests that import the mutated file.  This is what keeps mutation
runs fast (seconds per mutant instead of minutes).  Do NOT point a per-package
Stryker config at the root `jest.config.js`, because the root config uses
`projects:` mode which would run every suite in the monorepo for every mutant.

### 6. `coverageAnalysis: 'perTest'` requirement

`perTest` is the most accurate coverage mode — it tells Stryker exactly which
tests cover each statement, so only relevant tests are re-run per mutant.
Requires `--coverage` support in the jest config.  If a package's jest config
is missing `collectCoverageFrom`, Stryker may fall back to running all tests
for every mutant (slower but still correct).

---

## Adding a New Package

1. Confirm the package has a `jest.config.js` with `testMatch` and `transform`.
2. Create `stryker.<name>.config.mjs` following the pattern of the existing
   configs.  Set `configFile` to the package-local jest config.  List only the
   source files you want mutated under `mutate`.
3. Add a report output directory:
   ```bash
   mkdir -p reports/mutation/<name>
   ```
4. Add a script to `package.json`:
   ```json
   "test:mutation:<name>": "stryker run stryker.<name>.config.mjs"
   ```
5. Append `&& pnpm test:mutation:<name>` to `test:mutation:all`.
6. Run the config once to establish a baseline score and record it in the
   table above.

---

## CI Integration

To run mutation tests in CI, add a step after the regular unit-test step:

```yaml
- name: Mutation tests (validation)
  run: pnpm test:mutation

- name: Mutation tests (auth)
  run: pnpm test:mutation:auth
```

The `break` threshold in each config causes Stryker to exit with code 1 if the
score drops too far, failing the CI job automatically.

For long CI pipelines, consider running only the packages that changed in the
current PR rather than all packages every time.

---

## References

- [Stryker Mutator documentation](https://stryker-mutator.io/docs/)
- [Stryker thresholds](https://stryker-mutator.io/docs/stryker-js/configuration/#thresholds-object)
- [Stryker Jest runner](https://stryker-mutator.io/docs/stryker-js/jest-runner/)
- [Mutation testing introduction](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/)
