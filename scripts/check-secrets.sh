#!/usr/bin/env bash
# Secret detection pre-commit hook
# Install: cp scripts/check-secrets.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
# Or run manually: ./scripts/check-secrets.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

ERRORS=0

# Patterns that indicate potential secrets
PATTERNS=(
  'AKIA[0-9A-Z]{16}'                    # AWS Access Key
  'ghp_[a-zA-Z0-9]{36}'                 # GitHub PAT
  'gho_[a-zA-Z0-9]{36}'                 # GitHub OAuth
  'github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}'  # GitHub fine-grained PAT
  'sk-[a-zA-Z0-9]{48}'                  # OpenAI API Key
  'sk-ant-[a-zA-Z0-9-]{95}'             # Anthropic API Key
  'xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}'    # Slack Bot Token
  'xoxp-[0-9]{11}-[0-9]{11}-[0-9]{11}-[a-f0-9]{32}' # Slack User Token
  'SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}'    # SendGrid
  'sk_live_[a-zA-Z0-9]{24,}'            # Stripe Secret Key
  'rk_live_[a-zA-Z0-9]{24,}'            # Stripe Restricted Key
  'sq0csp-[a-zA-Z0-9_-]{43}'            # Square OAuth Secret
  'eyJ[a-zA-Z0-9_-]{20,}\.eyJ'          # JWT token (long form)
)

# Files to scan (staged files if in git hook context, or all tracked files)
if git rev-parse --git-dir > /dev/null 2>&1; then
  FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || git ls-files)
else
  FILES=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*')
fi

# Exclude binary files, lockfiles, and test fixtures
EXCLUDE_PATTERNS="\.lock$|\.png$|\.jpg$|\.ico$|\.woff|\.ttf|\.eot|node_modules|\.git/|dist/|\.next/|coverage/|generated/|\.test\.|\.spec\.|__tests__|jest\.config|\.env\.example$"

for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(echo "$FILES" | grep -vE "$EXCLUDE_PATTERNS" | xargs grep -lE "$pattern" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "${RED}POTENTIAL SECRET DETECTED:${NC} Pattern '$pattern' found in:"
    echo "$MATCHES" | while read -r file; do
      echo "  - $file"
    done
    ERRORS=$((ERRORS + 1))
  fi
done

# Check for common secret file patterns in staged files
SECRET_FILES=$(echo "$FILES" | grep -iE '(\.pem|\.key|id_rsa|id_ed25519|credentials\.json|service-account.*\.json)$' 2>/dev/null || true)
if [ -n "$SECRET_FILES" ]; then
  echo -e "${RED}POTENTIAL SECRET FILES DETECTED:${NC}"
  echo "$SECRET_FILES" | while read -r file; do
    echo "  - $file"
  done
  ERRORS=$((ERRORS + 1))
fi

# Check for .env files (should never be committed)
ENV_FILES=$(echo "$FILES" | grep -E '\.env$' | grep -v '\.env\.example$' | grep -v '\.env\.test$' 2>/dev/null || true)
if [ -n "$ENV_FILES" ]; then
  echo -e "${RED}.env FILES SHOULD NOT BE COMMITTED:${NC}"
  echo "$ENV_FILES" | while read -r file; do
    echo "  - $file"
  done
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}No secrets detected.${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}Found $ERRORS potential secret issue(s). Please review before committing.${NC}"
  echo "If these are false positives, you can skip with: git commit --no-verify"
  exit 1
fi
