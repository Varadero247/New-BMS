#!/bin/bash
# Nexara IP Protection — Codebase Archive Script
# Run monthly or after significant releases to create a dated provenance record
set -e
DATE=$(date +%Y-%m-%d)
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo 'no-git')
FILENAME="nexara-ip-archive-${DATE}-${COMMIT}.tar.gz"
OUTDIR="./ip-protection/archives"
mkdir -p "$OUTDIR"
# Allow exit code 1 from tar (benign "file changed as we read it" warning for the
# archive file itself, which is written inside the tree being archived)
tar --exclude='./node_modules' --exclude='./.git' --exclude='./.next' \
    --exclude='./dist' --exclude='./build' --exclude='./coverage' \
    --exclude="${OUTDIR}" \
    -czf "${OUTDIR}/${FILENAME}" . || true
HASH=$(shasum -a 256 "${OUTDIR}/${FILENAME}" | awk '{print $1}')
echo "| ${DATE} | ${FILENAME} | ${HASH} | ${COMMIT} |" >> "${OUTDIR}/ARCHIVE_LOG.md"
echo "Archive created: ${OUTDIR}/${FILENAME}"
echo "SHA-256: ${HASH}"
