#!/bin/bash
set -e
cd /home/dyl/New-BMS
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +"%B %d, %Y at %H:%M:%S")
mkdir -p reports/daily

# Get uncommitted work
MODIFIED=$(git diff --name-only | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
TOTAL=$((MODIFIED + UNTRACKED))

# Create report
cat > reports/daily/report-$DATE.md << EOF
# IMS Daily Status Report
**Date**: $TIMESTAMP

## 🔨 Work in Progress
- Modified files: $MODIFIED
- Untracked files: $UNTRACKED
- **Total uncommitted**: $TOTAL files

$(if [ $TOTAL -gt 0 ]; then
    echo "### Changed Files:"
    echo '```'
    git status --short
    echo '```'
fi)

## 📝 Recent Commits
\`\`\`
$(git log --oneline -5)
\`\`\`

---
**Next report**: Tomorrow at 8:00 AM
EOF

# Commit and push
git add reports/daily/report-$DATE.md
git commit -m "chore: Daily report $DATE (uncommitted: $TOTAL files)"
git push origin main
echo "✅ Report generated and pushed!"
