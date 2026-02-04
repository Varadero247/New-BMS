#!/bin/bash

# Daily IMS Status Report Generator
set -e

PROJECT_DIR="/home/dyl/New-BMS"
REPORT_DIR="$PROJECT_DIR/reports/daily"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +"%B %d, %Y at %H:%M:%S")
REPORT_FILE="$REPORT_DIR/report-$DATE.md"

cd "$PROJECT_DIR"
mkdir -p "$REPORT_DIR"

echo "Generating report for $DATE..."

# Check services
check_service() {
    if lsof -i :$1 > /dev/null 2>&1; then
        echo "✅ $2 ($1)"
    else
        echo "❌ $2 ($1)"
    fi
}

# Generate the report
cat > "$REPORT_FILE" << REPORT
# IMS Daily Status Report
**Date**: $TIMESTAMP  
**Generated**: Automatically

---

## 🚀 Services Status

### API Services Running
$(check_service 4000 "API Gateway")
$(check_service 4006 "HR API")
$(check_service 4007 "Payroll API")

### Web Services Running
$(check_service 3000 "Dashboard")
$(check_service 3006 "HR Web")
$(check_service 3007 "Payroll Web")

---

## 📝 Recent Git Activity

**Last 5 Commits**:
\`\`\`
$(git log --oneline -5)
\`\`\`

---

## 📊 System Info

- **Report generated at**: $TIMESTAMP
- **Services checked**: 6
- **Active services**: $(lsof -i :4000,:4006,:4007,:3000,:3006,:3007 2>/dev/null | wc -l)

---

**Next report**: Tomorrow at 8:00 AM
REPORT

echo "Report generated at: $REPORT_FILE"

# Commit to git
git add "$REPORT_FILE"
git commit -m "chore: Daily status report for $DATE"
git push origin main

echo "✅ Report pushed to GitHub!"
