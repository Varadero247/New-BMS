# Slide Deck Outline — Module 6: Backup & Restore Procedures

**Slides**: ~25
**Duration**: 90 minutes

---

## Slide Structure

| # | Slide Title | Type | Key Content |
|---|-------------|------|-------------|
| 1 | Module 6: Backup & Restore | Title | "An unverified backup is not a backup." |
| 2 | Backup Architecture | Three-tier diagram | Full (daily) / Incremental (4-hourly) / WAL (continuous) |
| 3 | RPO and RTO Defined | Comparison | RPO = max data loss; RTO = max restore time; IMS values |
| 4 | Full Backup: pg_dump | Code block | Full pg_dump command with all flags explained inline |
| 5 | Schema-Specific Backup | Code block | pg_dump with --schema flags; safety note for multi-schema |
| 6 | Backup Integrity Verification | Code block | 3 steps: ls / sha256sum / pg_restore --list |
| 7 | Automated Backup Schedule | Table | Job / Frequency / Retention / Storage (4 tiers) |
| 8 | Admin Console Backup Config | Screenshot | Backup schedule configuration form in admin console |
| 9 | WAL Archiving (Advanced) | Config block | postgresql.conf settings; archive_command example |
| 10 | Pre-Restore Checklist | 5-item checklist | Verify backup / Target environment / Notify users / Change ticket / Rollback plan |
| 11 | Restore to Staging | Code block | 3-command restore sequence: createdb / pg_restore / verify |
| 12 | Restore to Production | Warning + steps | Two-admin authorisation; stop services; full restore sequence |
| 13 | Post-Restore Validation | Code block | Row count query; smoke test commands |
| 14 | Disaster Recovery: Invocation Criteria | 4-bullet list | Database inaccessible / Data corruption / Ransomware / Infrastructure failure |
| 15 | DR Runbook: 8 Steps | Numbered table | Step / Action / Responsible / SLA time |
| 16 | PITR: Point-in-Time Recovery | Code block | recovery.conf settings; restore_command; recovery_target_time |
| 17 | Backup Audit Report | Screenshot | Admin console backup audit report view |
| 18 | Backup Audit: Red Flags | Red flag table | 5 red flags with immediate actions |
| 19 | Module 6: Key Takeaways | Summary | 6 takeaways |
| 20 | LAB-06 Instructions | Lab slide | Backup + restore sequence; 35 minutes; terminal access required |
| 21–25 | [Appendix] pg_dump Reference | Reference | All relevant flags; common error codes; restore troubleshooting |
