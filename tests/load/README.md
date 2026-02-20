# IMS Load Tests

k6 load test scenarios for the IMS platform. Covers four test types:

| Scenario | File | Purpose |
|---|---|---|
| Baseline | `scenarios/baseline.js` | Smoke test at 10 VUs — verify setup & establish latency baseline |
| Stress | `scenarios/stress.js` | Ramp to 3× production load (300 VUs) — find breaking point |
| Soak | `scenarios/soak.js` | 45-minute sustained load at 50 VUs — detect memory leaks |
| Spike | `scenarios/spike.js` | Sudden 10× burst (500 VUs) — verify circuit breaker / rate limiter |

## Prerequisites

```bash
# Install k6 (Linux)
curl https://dl.k6.io/key.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/k6.gpg
echo "deb [signed-by=/usr/share/keyrings/k6.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install k6
```

## Running

```bash
# Baseline (always run this first)
k6 run tests/load/scenarios/baseline.js

# Stress test (local)
k6 run tests/load/scenarios/stress.js

# Stress test (against staging)
k6 run -e BASE_URL=https://api-staging.example.com tests/load/scenarios/stress.js

# Soak test (45m)
k6 run tests/load/scenarios/soak.js

# Soak test with custom duration and VU count
k6 run -e VUS=80 -e DURATION=90m tests/load/scenarios/soak.js

# Spike test
k6 run tests/load/scenarios/spike.js

# Disable rate limiting during load tests (gateway env)
RATE_LIMIT_ENABLED=false k6 run tests/load/scenarios/stress.js
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:4000` | Gateway URL |
| `TEST_EMAIL` | `admin@ims.local` | Login email |
| `TEST_PASSWORD` | `admin123` | Login password |
| `VUS` | `50` | VU count (soak test) |
| `DURATION` | `45m` | Soak test duration |

## Interpreting Results

- **`http_req_failed`** < 1% at baseline, < 5% at stress, < 15% at spike
- **p95 latency** < 500ms at baseline/normal, < 1000ms at stress
- **Circuit breakers** activate at ~50% error rate — expected during spike
- **Rate limiter** returns 429 — these are NOT counted as failures in spike test
- **Soak test**: watch for latency trend increasing over time (memory leak indicator)

## CI Integration

Add to `.github/workflows/load-test.yml`:

```yaml
- name: k6 baseline smoke test
  run: k6 run --exit-on-running-error tests/load/scenarios/baseline.js
  env:
    BASE_URL: http://localhost:4000
```
