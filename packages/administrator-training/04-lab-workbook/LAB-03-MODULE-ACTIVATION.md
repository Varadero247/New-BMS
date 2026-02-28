# LAB-03 — Module Activation & Configuration

**Module**: 3
**Duration**: 35 minutes (split: 15 min Part 1 immediately post-lunch, 20 min Part 2 after presentation)
**Mode**: Live (hosted sandbox)

---

## Part 1: Immediate Re-energiser (15 min)

*This part runs immediately on return from lunch before the Module 3 presentation.*

### Task: Activate the Risk Module

1. Navigate to **Admin Console → Module Registry**
2. Find the **Risk Register** module
3. Check its dependency status (what must be active first?)
4. Activate it

**Expected result**: Risk module transitions through ACTIVATING → ACTIVE.

**Record your observations:**

| Observation | Your notes |
|-------------|-----------|
| Activation time (seconds) | |
| Any dependency warnings? | |
| Configuration parameters shown? | |

---

## Part 2: Configure 3 Modules End-to-End (20 min)

### Target Modules

Activate and configure all three of the following modules:

**Module A: Audit Management**

1. Check dependencies: requires nothing specific — confirm ACTIVE state
2. Activate
3. Configure organisation-level parameters:
   - `auditCycleDays`: 90 (quarterly internal audits)
   - `findingCategories`: Major NC, Minor NC, Observation, Opportunity for Improvement
   - `reportingEmail`: your training email
4. Navigate to the Audit module and create a test audit: name "Quarterly System Audit Q1 2026"

**Module B: Document Control**

1. Activate
2. Configure:
   - `reviewCycleDays`: 365 (annual document review)
   - `approvalLevels`: 2 (author → approver)
   - `documentPrefix`: "DOC"
3. Create a test document category: "Procedures"

**Module C: Training & Competency**

1. Check dependencies: requires HR module (confirm active)
2. Activate
3. Configure:
   - `certificateExpiryDays`: 365
   - `trainingReminderDays`: 30
4. Create a test training record: "IMS Administrator Induction"

---

## Intentional Failure Exercise

**Task**: Attempt to activate the Complaints Management module.

Complaints requires Quality to be active. Quality is not in your wave sequence.

**What happens?**

_____________________________________________________________

**Steps to diagnose and resolve:**

1. Check the error in: Admin Console → Audit Log → Filter: `MODULE_ACTIVATION_FAILED`
2. Identify the missing dependency
3. Activate the prerequisite first
4. Retry

---

## Live Extension (Fast Finishers)

Map out the full dependency graph for your organisation's planned IMS deployment:

1. List all modules your organisation plans to activate
2. Draw the dependency graph (or list it)
3. Define your activation waves
4. Estimate time to full activation (assume 60 seconds per module)
