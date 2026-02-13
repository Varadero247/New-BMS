#!/usr/bin/env bash
#
# Run all k6 load tests for the IMS platform
#
# Usage:
#   bash scripts/run-all-load-tests.sh
#   BASE_URL=http://staging:4000 bash scripts/run-all-load-tests.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="${PACKAGE_DIR}/load-test-results"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================================================"
echo "  IMS Load Test Suite"
echo "======================================================================"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed.${NC}"
    echo ""
    echo "Install k6:"
    echo "  Ubuntu/Debian: sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68 && echo 'deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main' | sudo tee /etc/apt/sources.list.d/k6.list && sudo apt-get update && sudo apt-get install k6"
    echo "  macOS:         brew install k6"
    echo "  Docker:        docker run --rm -i grafana/k6 run -"
    echo ""
    exit 1
fi

echo "k6 version: $(k6 version)"
echo "Base URL: ${BASE_URL:-http://localhost:4000}"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

OVERALL_EXIT=0
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Test 1: API Gateway Load Test
echo "----------------------------------------------------------------------"
echo "  Test 1: API Gateway Load Test (50 VUs, 3 min)"
echo "----------------------------------------------------------------------"
echo ""

GATEWAY_RESULT="${RESULTS_DIR}/gateway_${TIMESTAMP}.json"

if k6 run \
    --out json="${GATEWAY_RESULT}" \
    --summary-export="${RESULTS_DIR}/gateway_summary_${TIMESTAMP}.json" \
    "${PACKAGE_DIR}/src/load-tests/api-gateway.js" 2>&1; then
    echo ""
    echo -e "${GREEN}Gateway load test: PASSED${NC}"
else
    echo ""
    echo -e "${RED}Gateway load test: FAILED${NC}"
    OVERALL_EXIT=1
fi

echo ""

# Test 2: Individual Services Load Test
echo "----------------------------------------------------------------------"
echo "  Test 2: Individual Services Load Test (10 VUs, 1.5 min)"
echo "----------------------------------------------------------------------"
echo ""

SERVICES_RESULT="${RESULTS_DIR}/services_${TIMESTAMP}.json"

if k6 run \
    --out json="${SERVICES_RESULT}" \
    --summary-export="${RESULTS_DIR}/services_summary_${TIMESTAMP}.json" \
    "${PACKAGE_DIR}/src/load-tests/individual-services.js" 2>&1; then
    echo ""
    echo -e "${GREEN}Individual services load test: PASSED${NC}"
else
    echo ""
    echo -e "${RED}Individual services load test: FAILED${NC}"
    OVERALL_EXIT=1
fi

echo ""

# Combined Summary
echo "======================================================================"
echo "  Combined Summary"
echo "======================================================================"
echo ""
echo "  Results saved to: ${RESULTS_DIR}/"
echo ""

if [ -f "${RESULTS_DIR}/gateway_summary_${TIMESTAMP}.json" ]; then
    echo "  Gateway Summary:"
    if command -v jq &> /dev/null; then
        jq -r '
            "    p95 Response Time: \(.metrics.http_req_duration.values."p(95)" // "N/A")ms",
            "    Error Rate:        \(.metrics.http_req_failed.values.rate // "N/A")",
            "    Total Requests:    \(.metrics.http_reqs.values.count // "N/A")"
        ' "${RESULTS_DIR}/gateway_summary_${TIMESTAMP}.json" 2>/dev/null || echo "    (install jq for detailed summary)"
    else
        echo "    (install jq for detailed summary)"
    fi
    echo ""
fi

if [ -f "${RESULTS_DIR}/services_summary_${TIMESTAMP}.json" ]; then
    echo "  Services Summary:"
    if command -v jq &> /dev/null; then
        jq -r '
            "    p95 Response Time: \(.metrics.http_req_duration.values."p(95)" // "N/A")ms",
            "    Error Rate:        \(.metrics.http_req_failed.values.rate // "N/A")",
            "    Total Requests:    \(.metrics.http_reqs.values.count // "N/A")"
        ' "${RESULTS_DIR}/services_summary_${TIMESTAMP}.json" 2>/dev/null || echo "    (install jq for detailed summary)"
    else
        echo "    (install jq for detailed summary)"
    fi
    echo ""
fi

echo "  Thresholds:"
echo "    p95 Response Time: < 200ms"
echo "    Error Rate:        < 1%"
echo ""

if [ $OVERALL_EXIT -eq 0 ]; then
    echo -e "${GREEN}  ALL LOAD TESTS PASSED${NC}"
else
    echo -e "${RED}  SOME LOAD TESTS FAILED${NC}"
fi

echo ""
echo "======================================================================"

exit $OVERALL_EXIT
