# UAT Test Plan: Human Resources Management Module

**Document ID:** UAT-HR-001
**Version:** 1.0
**Date:** 2026-02-23
**Module:** Human Resources Management
**Environment:** Staging (api-hr:4006 / web-hr:3006)
**Tester:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Sign-Off Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***

---

## Employee Records (5 scenarios)

### TC-HR-001: Create Employee Record (EMP-YYYY-NNN)

**Given** I am logged in as an HR Manager
**When** I navigate to HR > Employees and click "New Employee"
**And** I fill in: First Name "Sarah", Last Name "Thornton", Job Title "Process Engineer", Email "s.thornton@nexara.com", Start Date "2026-03-01", Employment Type "FULL_TIME", Contract Type "PERMANENT"
**Then** the system creates the employee record with a reference "EMP-2026-NNN"
**And** the employee status is set to "ACTIVE"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-002: Assign Employee to Department and Manager

**Given** an employee record "EMP-2026-0001" exists with no department or manager assigned
**When** I edit the record and set: Department "Operations", Manager "James Carter (EMP-2025-0042)"
**Then** the employee record is updated with the department and reporting line
**And** the manager's direct report count increases by one
**And** the organisational chart reflects the new reporting relationship
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-003: Upload Contract Document to Employee Record

**Given** an employee record "EMP-2026-0001" exists
**When** I navigate to the Documents tab of the employee record and click "Upload Document"
**And** I select Document Type "EMPLOYMENT_CONTRACT", upload file "Thornton_Contract_2026.pdf", and enter Expiry Date "N/A"
**Then** the document is attached to the employee record
**And** the Documents tab shows the uploaded file with upload date and uploader name
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-004: Update Job Title (Promotion)

**Given** an employee record "EMP-2026-0001" with Job Title "Process Engineer"
**When** I click "Record Promotion" and enter: New Job Title "Senior Process Engineer", Effective Date "2026-07-01", New Salary "£52,000", Reason "Annual promotion review — exceeded all KPIs"
**Then** the employee record is updated with the new job title and salary effective from the specified date
**And** the previous job title and salary are retained in the employment history log
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-005: View Org Chart Position

**Given** employee "EMP-2026-0001" is assigned to the Operations department, reporting to "James Carter"
**When** I navigate to HR > Org Chart and search for "Sarah Thornton"
**Then** the org chart displays Sarah Thornton's node under James Carter in the Operations branch
**And** clicking the node shows employee summary: name, title, department, and contact details
**And** any direct reports are shown below
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Leave Management (5 scenarios)

### TC-HR-006: Submit Annual Leave Request (5 Days)

**Given** I am logged in as employee "EMP-2026-0001" (Sarah Thornton) with 20 days annual leave entitlement
**When** I navigate to HR > Leave and click "Request Leave"
**And** I enter: Leave Type "ANNUAL_LEAVE", Start Date "2026-04-14", End Date "2026-04-18" (5 working days), Notes "Easter holiday"
**Then** a leave request is created with status "PENDING_APPROVAL"
**And** the line manager receives a notification to review the request
**And** the 5 days are shown as "Pending" against the leave balance
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-007: Approve Leave Request by Line Manager

**Given** a leave request for "EMP-2026-0001" is in PENDING_APPROVAL status
**When** I log in as the line manager "James Carter" and navigate to HR > Leave > Pending Approvals
**And** I open the request and click "Approve" with comment "Confirmed — no conflicts with project deadlines"
**Then** the leave request status changes to "APPROVED"
**And** the employee receives a notification of approval
**And** the 5 days are deducted from the annual leave balance
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-008: Submit Sick Leave (Self-Certified)

**Given** I am logged in as employee "EMP-2026-0001"
**When** I navigate to HR > Leave and click "Request Leave"
**And** I enter: Leave Type "SICK_LEAVE", Start Date "2026-03-10", End Date "2026-03-12" (3 days), Self-Certification "Yes", Reason "Flu"
**Then** a sick leave record is created and automatically approved (self-certification for ≤7 days)
**And** the sick leave days are recorded in the absence log
**And** the Bradford Factor score is recalculated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-009: View Leave Balance

**Given** employee "EMP-2026-0001" has taken 3 days sick leave and has 5 days approved annual leave pending
**When** I navigate to HR > Leave > My Balance
**Then** the balance summary shows: Annual Leave Entitlement 20 days, Taken 0, Approved/Pending 5, Remaining 15
**And** sick leave is shown separately with Bradford Factor score
**And** carry-over days from the previous year (if any) are displayed
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-010: Check Leave Calendar for Conflicts

**Given** multiple leave requests exist for the Operations department in April 2026
**When** I navigate to HR > Leave Calendar and filter by Department "Operations" and Month "April 2026"
**Then** the calendar displays all approved and pending leave for the Operations team
**And** days with multiple staff absent are highlighted to indicate potential resource conflicts
**And** I can click a day to see which employees are absent
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Performance Reviews (5 scenarios)

### TC-HR-011: Create Performance Review Cycle

**Given** I am logged in as an HR Manager
**When** I navigate to HR > Performance Reviews and click "New Review Cycle"
**And** I enter: Cycle Name "FY2026 Mid-Year Review", Review Type "MID_YEAR", Start Date "2026-07-01", End Date "2026-07-31", Eligible Employees "All active employees with 6+ months service"
**Then** the review cycle is created with status "PLANNED"
**And** eligible employees are enrolled automatically based on the criteria
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-012: Assign Reviewers to Performance Review

**Given** a review cycle "FY2026 Mid-Year Review" exists with employee "EMP-2026-0001" enrolled
**When** I open the review for EMP-2026-0001 and click "Assign Reviewers"
**And** I add: Primary Reviewer "James Carter (line manager)", 360 Reviewer 1 "R. Chen", 360 Reviewer 2 "S. Patel"
**Then** the reviewers are assigned and each receives a notification to complete their assessment
**And** the review status changes to "IN_PROGRESS"
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-013: Complete Self-Assessment

**Given** I am logged in as employee "EMP-2026-0001" and my performance review is IN_PROGRESS
**When** I navigate to HR > My Reviews and open the self-assessment form
**And** I complete all sections: Achievements "Delivered Process Optimisation Project 3 weeks early", Areas for Development "Stakeholder communication", Goals for Next Period "Lead ISO 9001 audit by Q4"
**And** I click "Submit Self-Assessment"
**Then** the self-assessment is recorded with status "COMPLETED"
**And** the line manager is notified that the self-assessment is ready to review
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-014: Complete Manager Assessment

**Given** the employee self-assessment for "EMP-2026-0001" is completed
**When** I log in as line manager "James Carter" and open the manager assessment for EMP-2026-0001
**And** I complete all rating sections with scores and comments
**And** I enter an Overall Rating "EXCEEDS_EXPECTATIONS" and click "Submit"
**Then** the manager assessment is recorded with status "COMPLETED"
**And** the review is marked ready for the appraisal meeting
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-015: Generate Performance Rating Report

**Given** performance reviews for the Operations department are completed for the FY2026 Mid-Year cycle
**When** I navigate to HR > Reports and click "Performance Rating Report"
**And** I filter by Department "Operations" and Cycle "FY2026 Mid-Year Review"
**Then** the report displays a distribution of ratings (Outstanding / Exceeds / Meets / Below / Unsatisfactory)
**And** each employee's rating is listed with reviewer name and completion date
**And** the report can be exported as CSV or PDF
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Training & Certifications (5 scenarios)

### TC-HR-016: Record Employee Training Completion

**Given** I am logged in as an HR Manager
**When** I navigate to HR > Training and click "Record Training"
**And** I enter: Employee "EMP-2026-0001", Training Name "Manual Handling (Level 2)", Provider "In-house", Completion Date "2026-03-05", Duration "4 hours", Outcome "PASSED", Score "92%"
**Then** the training completion is recorded against the employee's training history
**And** the training compliance matrix shows the course as completed for that employee
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-017: Add Certification with Expiry Date

**Given** an employee "EMP-2026-0001" exists
**When** I navigate to the employee's Certifications tab and click "Add Certification"
**And** I enter: Certification Name "NEBOSH General Certificate", Issuing Body "NEBOSH", Certificate Number "00123456/NGC1", Issue Date "2024-06-15", Expiry Date "2027-06-14"
**Then** the certification is added to the employee's record
**And** the status is set to "VALID" with days remaining calculated
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-018: Trigger Expiry Reminder (30 Days)

**Given** employee "EMP-2026-0001" holds a certification "NEBOSH General Certificate" expiring in 28 days
**When** the system runs the daily certification expiry check
**Then** an automated reminder notification is sent to the employee and their line manager
**And** the certification status on the dashboard changes to "EXPIRING_SOON"
**And** the certification appears in the HR Manager's "Action Required" list
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-019: View Training Compliance Matrix

**Given** training records exist for multiple employees across several mandatory courses
**When** I navigate to HR > Training > Compliance Matrix and filter by Department "Operations"
**Then** a grid is displayed with employees as rows and mandatory courses as columns
**And** each cell shows COMPLETED (green), OVERDUE (red), DUE_SOON (amber), or NOT_REQUIRED (grey)
**And** an overall compliance percentage is shown per employee and per course
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-020: Search Training Records by Skill or Certification

**Given** training and certification records exist across all departments
**When** I navigate to HR > Training > Search and enter search term "First Aid"
**Then** the system returns all employees who hold a First Aid certification or have completed First Aid training
**And** results show employee name, department, completion date, expiry date, and status
**And** results can be filtered further by department, status, or expiry window
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Recruitment (5 scenarios)

### TC-HR-021: Create Job Vacancy

**Given** I am logged in as an HR Manager
**When** I navigate to HR > Recruitment and click "New Vacancy"
**And** I enter: Job Title "Quality Assurance Analyst", Department "Quality", Salary Range "£32,000–£38,000", Location "Manchester", Contract Type "PERMANENT", Closing Date "2026-04-30", Hiring Manager "R. Chen"
**Then** the vacancy is created with reference "VAC-2026-XXXX" and status "OPEN"
**And** it appears in the recruitment pipeline dashboard
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-022: Move Candidate Through Recruitment Pipeline

**Given** a vacancy "VAC-2026-0001" exists and a candidate "Alex Reeves" has applied
**When** I move Alex Reeves through the pipeline stages sequentially: "Applied" → "Screening" → "Interview" → "Offer" → "Hired"
**And** I add notes and a scheduled date at each stage (e.g., Interview date "2026-04-08 10:00")
**Then** each stage transition is recorded with timestamp and status
**And** the candidate's current stage is reflected on the pipeline Kanban board
**And** the hiring manager is notified at each stage progression
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-023: Reject Candidate with Reason

**Given** a candidate "Jordan Miles" is at the "Screening" stage for vacancy "VAC-2026-0001"
**When** I select the candidate and click "Reject"
**And** I enter: Rejection Reason "INSUFFICIENT_EXPERIENCE", Notes "Candidate lacks required 3 years QA experience"
**Then** the candidate status changes to "REJECTED" with the reason recorded
**And** an automated rejection notification is sent to the candidate
**And** the candidate is removed from the active pipeline view
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-024: Generate Offer Letter

**Given** candidate "Alex Reeves" has been moved to the "Offer" stage for vacancy "VAC-2026-0001"
**When** I click "Generate Offer Letter" and confirm: Salary "£35,500", Start Date "2026-06-02", Probation Period "6 months"
**Then** the system generates a formatted offer letter document with the candidate's name, role, salary, and start date
**And** the letter is attached to the candidate record
**And** the offer letter reference number is recorded against the vacancy
**Result:** [ ] Pass / [ ] Fail
**Notes:**

### TC-HR-025: Onboard New Hire to Employee Record

**Given** candidate "Alex Reeves" has status "HIRED" in vacancy "VAC-2026-0001"
**When** I click "Onboard" and confirm the start date "2026-06-02"
**Then** the system creates a new employee record "EMP-2026-XXXX" pre-populated with Alex Reeves' details from the recruitment record
**And** the vacancy status changes to "FILLED"
**And** an onboarding checklist is generated and assigned to the HR Manager and hiring manager
**Result:** [ ] Pass / [ ] Fail
**Notes:**

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| HR Manager            |      |           |      |
| Product Owner         |      |           |      |
| UAT Lead              |      |           |      |
| Regulatory/Compliance |      |           |      |

**Overall Result:** [ ] PASS -- All scenarios passed / [ ] FAIL -- See notes above
**Release Recommendation:** [ ] Approved for Production / [ ] Requires remediation
