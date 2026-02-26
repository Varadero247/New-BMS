# UAT Test Plan: Training Management Module

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


**Document ID:** UAT-TRN-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Training Management
**Environment:** Staging (api-training:4028 / web-training:3032)
**Tester:** ****************\_\_\_\_****************
**Sign-Off Date:** ****************\_\_\_\_****************

---

## Course Management (5 scenarios)

### TC-TRN-001: Create Training Course (Online/Classroom)

**Given** I am logged in as a Training Manager
**When** I navigate to Training > Courses and click "New Course"
**And** I enter: Title "Manual Handling Safety", Code "TRN-MHS-001", Delivery Type "CLASSROOM", Duration "4 hours", Department "All", Mandatory "Yes", Validity Period "12 months", Description "Covers safe manual handling techniques and risk assessment per HSE guidelines"
**Then** the course is created with reference "CRS-2602-XXXX" and status "DRAFT"
**And** the course appears in the course list with delivery type and mandatory flag displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-002: Set Duration and Passing Score

**Given** a course "CRS-2602-0001" (Manual Handling Safety) in DRAFT status
**When** I open the course settings and set: Duration "240 minutes", Assessment Type "MULTIPLE_CHOICE", Number of Questions "20", Passing Score "75%", Maximum Attempts "3"
**Then** the duration and assessment settings are saved against the course
**And** the course detail page shows duration "4 hrs", passing score "75%", and max attempts "3"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-003: Assign Competency Tags to Course

**Given** course "CRS-2602-0001" and competency tags "Manual Handling", "Risk Assessment", "Health & Safety Awareness" exist in the system
**When** I open the course and navigate to the "Competencies" tab
**And** I add all three competency tags to the course
**Then** all three tags are linked to the course
**And** completing this course will contribute towards the linked competencies in the employee's competency profile
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-004: Publish Course

**Given** course "CRS-2602-0001" in DRAFT status with duration, assessment settings, and competency tags all configured
**When** I click "Publish Course" and confirm
**Then** the course status changes to "PUBLISHED"
**And** the course becomes visible in the course catalogue for employees to view
**And** the Training Manager can now create enrolments for this course
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-005: View Course Catalogue

**Given** multiple courses exist with statuses DRAFT, PUBLISHED, and ARCHIVED
**When** I navigate to Training > Course Catalogue
**Then** only PUBLISHED courses are displayed in the default catalogue view
**And** each course card shows: title, code, delivery type, duration, mandatory flag, and validity period
**And** I can filter by delivery type (ONLINE/CLASSROOM/BLENDED), mandatory flag, and department
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Enrollments (5 scenarios)

### TC-TRN-006: Enrol Employee on Course

**Given** course "CRS-2602-0001" (Manual Handling Safety) is PUBLISHED and employee "E. Kowalski" exists
**When** I navigate to Training > Enrollments and click "New Enrollment"
**And** I select: Course "Manual Handling Safety", Employee "E. Kowalski", Scheduled Date "2026-03-15", Delivery Method "CLASSROOM"
**Then** an enrollment record "ENR-2602-XXXX" is created with status "ENROLLED"
**And** the enrollment is linked to both the employee and the course
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-007: Send Enrolment Notification

**Given** enrollment "ENR-2602-0001" has been created for employee "E. Kowalski" on course "Manual Handling Safety" scheduled for "2026-03-15"
**When** the enrollment is saved (or I click "Send Notification" manually)
**Then** "E. Kowalski" receives a notification containing: course name, scheduled date, delivery method, location (if classroom), and a link to view the course details
**And** the enrollment record shows a notification-sent timestamp
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-008: Mark Course as In-Progress

**Given** enrollment "ENR-2602-0001" with status "ENROLLED" and scheduled date reached
**When** I open the enrollment and click "Start Course" (or the employee begins the online module)
**Then** the enrollment status changes to "IN_PROGRESS" with the start timestamp recorded
**And** the employee's training dashboard shows the course as in-progress
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-009: Complete Course with Assessment Score

**Given** enrollment "ENR-2602-0001" in "IN_PROGRESS" status for course with passing score "75%"
**When** I open the enrollment and click "Record Completion"
**And** I enter: Completion Date "2026-03-15", Assessment Score "82%", Trainer "F. Mbeki", Notes "Practical handling exercises completed satisfactorily"
**Then** the enrollment status changes to "COMPLETED"
**And** the assessment score "82%" is recorded (above passing threshold of 75%)
**And** the certificate generation is triggered automatically
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-010: Verify Certificate Generated on Pass

**Given** enrollment "ENR-2602-0001" has been marked COMPLETED with assessment score "82%" (above passing score "75%")
**When** I open the enrollment and navigate to the "Certificate" tab
**Then** a certificate record is created showing: employee name, course name, completion date, score, certificate number, and expiry date (completion date + validity period)
**And** the certificate is downloadable as a PDF
**And** the employee's training profile shows the certificate as current and valid
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Competency Framework (5 scenarios)

### TC-TRN-011: Define Competency with Required Level

**Given** I am logged in as a Training Manager or HR Manager
**When** I navigate to Training > Competency Framework and click "New Competency"
**And** I enter: Name "Forklift Operation", Code "COMP-FLT-001", Description "Safe operation of counterbalance and reach forklifts", Required Level "PROFICIENT", Evidence Required "Valid FLT certificate (RTITB or ITSSAR)", Renewal Period "36 months"
**Then** the competency is created with reference "CMP-2602-XXXX"
**And** the competency appears in the competency library with required level and renewal period
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-012: Link Competency to Job Role

**Given** competency "Forklift Operation" (CMP-2602-0001) and job role "Warehouse Operative" exist
**When** I open the competency and navigate to the "Job Roles" tab
**And** I click "Link Job Role" and select "Warehouse Operative" with Required Level "PROFICIENT"
**Then** the competency is linked to the "Warehouse Operative" job role
**And** the job role profile shows "Forklift Operation" as a required competency at PROFICIENT level
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-013: Assign Employees to Competency Framework

**Given** the "Warehouse Operative" job role has required competencies defined including "Forklift Operation"
**When** I navigate to Training > Competency Framework > Assignments
**And** I assign employees "G. Andersen", "H. Osei", and "I. Novak" to the "Warehouse Operative" framework
**Then** all three employees are enrolled in the framework
**And** each employee's competency profile is initialised showing all required competencies for "Warehouse Operative" with current level "NOT_ASSESSED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-014: View Competency Gap Report

**Given** employees are assigned to the "Warehouse Operative" framework with competency levels recorded (some PROFICIENT, some DEVELOPING, some NOT_ASSESSED)
**When** I navigate to Training > Reports > Competency Gap Report
**And** I filter by Job Role "Warehouse Operative"
**Then** the report displays a matrix of employees vs. required competencies
**And** each cell shows the employee's current level vs. required level
**And** cells where the current level is below the required level are highlighted as gaps
**And** the total gap count per employee and per competency is summarised
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-015: Update Competency Level After Training

**Given** employee "G. Andersen" completed course "Forklift Operation Safety" which is linked to competency "Forklift Operation"
**When** the training completion is recorded with a passing score
**Then** the competency level for "G. Andersen" on "Forklift Operation" automatically updates to "PROFICIENT"
**And** the competency gap report no longer shows a gap for "G. Andersen" on this competency
**And** a competency achievement record is created with the training reference and effective date
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Training Compliance (5 scenarios)

### TC-TRN-016: View Training Compliance Matrix (Employee x Mandatory Training)

**Given** mandatory courses are defined and employees are enrolled (or have completed, or have overdue training)
**When** I navigate to Training > Compliance > Compliance Matrix
**Then** a grid is displayed with employees as rows and mandatory courses as columns
**And** each cell shows the compliance status: COMPLIANT (green), OVERDUE (red), DUE_SOON (amber), or NOT_ENROLLED (grey)
**And** the matrix can be filtered by department and course
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-017: Identify Overdue Mandatory Training

**Given** employees have enrollment records for mandatory courses where the certificate expiry date has passed
**When** I navigate to Training > Compliance > Overdue Training
**Then** a list of overdue enrollments is displayed showing: employee name, department, course name, original completion date, certificate expiry date, and days overdue
**And** the list is sortable by days overdue (most overdue first)
**And** a total count of overdue employees is shown at the top
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-018: Send Overdue Training Reminder

**Given** the overdue training list shows employees with expired mandatory training
**When** I select three overdue employees and click "Send Reminder"
**And** I confirm the reminder message
**Then** reminder notifications are sent to each selected employee and their line manager
**And** the enrollment record shows a "last reminded" timestamp
**And** a confirmation message confirms "3 reminders sent"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-019: View Compliance Percentage by Department

**Given** training compliance data exists across multiple departments
**When** I navigate to Training > Reports > Compliance by Department
**And** I set the scope to "All Mandatory Courses"
**Then** the report displays each department with: total employees, compliant count, overdue count, and compliance percentage
**And** departments with compliance below a threshold (e.g., 90%) are highlighted in amber or red
**And** the report can be sorted by compliance percentage ascending to identify the lowest-performing departments
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-020: Filter Non-Compliant Employees

**Given** the compliance matrix displays employees with varying compliance statuses
**When** I apply the filter Status = "NON_COMPLIANT" (includes OVERDUE and NOT_ENROLLED)
**Then** only employees with at least one non-compliant mandatory training item are shown
**And** the filtered list shows which specific courses are non-compliant for each employee
**And** I can select all filtered employees to send bulk reminders
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Training Needs Analysis (5 scenarios)

### TC-TRN-021: Create TNA Record Linked to Employee Review

**Given** employee "J. Larsson" has an annual performance review record "REV-2026-0042"
**When** I navigate to Training > Training Needs Analysis and click "New TNA"
**And** I enter: Employee "J. Larsson", Linked Review "REV-2026-0042", Review Period "2026", TNA Date "2026-02-20", Conducted By "Line Manager K. Sato"
**Then** a TNA record "TNA-2602-XXXX" is created with status "IN_PROGRESS"
**And** the TNA is linked to the employee's performance review record
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-022: Identify Skill Gaps in TNA

**Given** TNA record "TNA-2602-0001" for employee "J. Larsson" is in progress
**When** I navigate to the "Skill Gaps" section of the TNA
**And** I add gap: Skill "Data Analysis using Excel", Current Level "BASIC", Required Level "INTERMEDIATE", Gap Notes "Role requires pivot table and VLOOKUP proficiency for reporting tasks"
**And** I add a second gap: Skill "ISO 14001 Environmental Management", Current Level "AWARENESS", Required Level "COMPETENT"
**Then** both skill gaps are recorded against the TNA
**And** the TNA shows 2 identified gaps with their current vs. required levels
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-023: Recommend Training Courses from TNA

**Given** TNA "TNA-2602-0001" with 2 identified skill gaps
**When** I open the skill gap "Data Analysis using Excel" and click "Recommend Course"
**And** I search the course catalogue and select "Advanced Excel for Business" (CRS-2602-0015)
**And** I repeat the step for the second gap, selecting "ISO 14001 Internal Auditor" (CRS-2602-0022)
**Then** both courses are linked to their respective skill gaps in the TNA
**And** the TNA summary shows 2 gaps identified, 2 courses recommended
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-024: Assign Training Plan from TNA

**Given** TNA "TNA-2602-0001" with courses recommended for each skill gap
**When** I click "Create Training Plan" from the TNA
**And** I set target completion dates: "Advanced Excel for Business" by "2026-05-31", "ISO 14001 Internal Auditor" by "2026-07-31"
**And** I click "Assign Plan"
**Then** a Training Plan "TP-2602-XXXX" is created linked to the TNA and employee "J. Larsson"
**And** enrollment records are created for both courses with status "ENROLLED"
**And** the TNA status updates to "PLAN_ASSIGNED"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-TRN-025: Review TNA Completion at Year-End

**Given** TNA "TNA-2602-0001" has a training plan assigned with two courses, both now completed
**When** I navigate to the TNA record and open the "Review" section
**And** I enter: Review Date "2026-12-15", Reviewer "K. Sato", Overall Assessment "All identified gaps addressed", TNA Outcome "COMPLETED", Notes "J. Larsson completed both courses with distinction; competency levels updated accordingly"
**Then** the TNA status changes to "COMPLETED"
**And** the completion date and outcome are recorded
**And** the employee's training history shows the TNA as closed with the associated course completions
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| QA Manager            |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
