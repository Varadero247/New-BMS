# Slide Deck Outline — Module 5: Audit Log Review

**Slides**: ~28
**Duration**: 90 minutes

---

## Slide Structure

| # | Slide Title | Type | Key Content |
|---|-------------|------|-------------|
| 1 | Module 5: Audit Log Review | Title | "In 5 minutes, you'll be able to find the smoking gun" |
| 2 | Opening Hook | Scenario | "Someone escalated their privileges at 11:47 PM last Tuesday. Find them." |
| 3 | Audit Architecture | Flow diagram | Action → Audit service → Hash → Append-only DB → Optional SIEM |
| 4 | Design Principles | Table | Append-only / Tamper-evident / Real-time / 7-year retention / Immutable storage |
| 5 | The Audit Event Schema | Schema diagram | All 9 fields with types and examples |
| 6 | Event Schema: Example | JSON code block | Full example event with real-looking data |
| 7 | Event Taxonomy Overview | 5-box diagram | AUTH / DATA / ADMIN / INTEGRATION / SYSTEM |
| 8 | AUTH Events | Table | 11 auth events with descriptions |
| 9 | DATA Events | Table | 7 data events with descriptions |
| 10 | ADMIN Events | Table | 11 admin events with descriptions |
| 11 | INTEGRATION Events | Table | 12 integration events with descriptions |
| 12 | SYSTEM Events | Table | 8 system events with descriptions |
| 13 | Navigating the Audit Log | Screenshot | Admin console audit log with UI annotated |
| 14 | Filter Options | Table | 7 filter dimensions with use case examples |
| 15 | Saved Filters | Screenshot | 3 pre-built saved filters shown |
| 16 | Export: CSV Format | Code block | CSV header row + 2 example rows |
| 17 | Export: JSON Format | Code block | JSON structure with events array |
| 18 | SIEM Integration Options | Logo grid | Splunk / Azure Sentinel / QRadar / Generic Syslog |
| 19 | Pre-Built Compliance Reports | Table | 5 reports: ISO 27001 / GDPR / SOC 2 / Auth / Change Mgmt |
| 20 | Tamper-Evidence: How It Works | Diagram | Hash chain: hash(N) = SHA256(data_N + hash(N-1)) |
| 21 | Integrity Verification | Screenshot | Admin console verify integrity tool |
| 22 | Investigation Workflow | 5-step flowchart | Define window → Filter → Find entry points → Pivot → Export |
| 23 | Exercise: Classify These Events | Interactive | 5 events for participants to classify — verbal answers |
| 24 | Module 5: Key Takeaways | Summary | 6 takeaways |
| 25 | LAB-05: Mock Incident Investigation | Lab slide | Scenario brief; 30 minutes; individual investigation |
| 26–28 | [Appendix] Complete Event Reference | Reference | All 47 event types with full descriptions |
