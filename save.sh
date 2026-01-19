#!/bin/bash
git add .
git commit -m "${1:-Auto-save: $(date '+%Y-%m-%d %H:%M:%S')}"
git push origin main
echo "✅ Saved to GitHub!"
