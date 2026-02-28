# Assessment — Day C: HR & Payroll

**Format**: 20 MCQ | **Time**: 30 minutes | **Pass**: ≥ 75% (15/20) | **Delivery**: `/module-owner/hr-payroll/assessment`

---

**Q1.** A new employee starts today. Which action in Nexara creates their master record?
- A) Payroll → Pay Periods → New Employee
- B) HR → Employees → New Employee
- C) Training → Courses → Assign → New User
- D) Settings → Users → Create User

**Q2.** The `accessRevocationDate` field on a leaver record should be set to:
- A) The day after the employee's last working day
- B) 30 days after the termination date (to allow handover)
- C) The employee's last working day (same day)
- D) The date the employee submitted their resignation

**Q3.** Under UK GDPR, how long should employee records be retained after an employee leaves?
- A) 1 year
- B) 3 years
- C) 5 years
- D) Employment duration plus 7 years (standard UK practice)

**Q4.** A training course set to `validityPeriod = 12 months` means:
- A) The course content must be updated every 12 months
- B) A completion certificate is valid for 12 months; after expiry, the employee is marked as requiring a refresher
- C) Employees must complete the course within 12 months of joining
- D) The course is available in the training library for 12 months only

**Q5.** Which absence type should be used when an employee takes 2 days off following a bereavement?
- A) Unpaid Leave
- B) Sick Leave
- C) Compassionate Leave
- D) Annual Leave

**Q6.** The compliance matrix report in Nexara Training shows a cell coloured red for an employee. This means:
- A) The employee failed the course assessment
- B) The course completion is overdue or the certificate has expired
- C) The employee has been exempted from this course
- D) The training provider has not uploaded the certificate yet

**Q7.** A payroll period is **Locked** status. What can still be changed?
- A) Gross pay adjustments and deductions
- B) Period start and end dates
- C) Nothing — Lock prevents all modifications until the period is unlocked by a payroll administrator
- D) Journal export format only

**Q8.** A payroll administrator has entered an overtime adjustment of 20 hours for an employee who worked a 4-day week. What is the correct response before approving?
- A) Approve immediately — the payroll administrator is trusted to check this
- B) Review the employee's timesheet or manager-approved overtime record to verify the 20 hours before approving
- C) Request that the employee self-reports overtime through the portal
- D) Escalate to SUPER_ADMIN before approving any overtime above 15 hours

**Q9.** The Payroll Variance Report shows a 22% increase in total gross pay compared to the previous period. What is the correct immediate action?
- A) Export the journal immediately — variances are normal
- B) Investigate the variance: identify which employees or adjustment types caused the increase; obtain explanations before exporting the journal
- C) Lock and reverse the payroll period and start again
- D) Notify the HR director and suspend all payroll processing

**Q10.** For ISO 9001 clause 7.2 (Competence), which Nexara report provides the most direct compliance evidence?
- A) The payroll variance report for the audit period
- B) The training compliance matrix filtered by role-mandatory courses
- C) The employee headcount trend report
- D) The HR analytics absence rate dashboard

**Q11.** An employee bulk-assigned to Fire Safety training has not completed it by the deadline. Who receives an escalation notification?
- A) SUPER_ADMIN only
- B) The HR Manager and the employee's Line Manager (as configured in the notification rules)
- C) The employee only — line managers are not notified about training
- D) The training provider who delivered the course

**Q12.** A contractor whose assignment ends on 31 March should have their Nexara access revoked:
- A) 30 days before 31 March
- B) On 31 March (the last day of their assignment)
- C) On 1 April (the day after their assignment ends)
- D) Only after they return equipment and complete an exit checklist

**Q13.** The journal export file from Nexara Payroll is used to:
- A) Send payslips to employees
- B) Generate the payroll statutory returns (P60, P11D)
- C) Import payroll entries into the finance system's chart of accounts
- D) Reconcile holiday pay against the HMRC national minimum wage

**Q14.** A payroll correction is needed after the period has been marked as Paid. The correct approach is:
- A) Modify the Paid period record directly with the correction
- B) Create a correction adjustment in the following payroll period, referencing the original period
- C) Contact Nexara Support to unlock the Paid period
- D) Issue a manual cheque and record it outside the system

**Q15.** Mandatory training completion records should include which minimum set of information?
- A) Employee name and course title only
- B) Employee name, course title, completion date, result, and certificate (where applicable)
- C) Employee name, course title, and the trainer's signature
- D) Employee name, course title, and the delivery date

**Q16.** A line manager asks to see an employee's salary information. Under standard Nexara RBAC configuration, can they access this?
- A) Yes — line managers can see all information for their direct reports
- B) No — salary and payroll data is restricted to HR Admin and Payroll roles by default
- C) Yes, if they have HR_VIEWER permission
- D) Only with SUPER_ADMIN approval

**Q17.** An employee's return-to-work interview should be recorded in Nexara:
- A) Before the employee returns, by the HR manager
- B) Immediately after the employee returns from a sick absence, documenting fitness and any adjustments
- C) Only for absences lasting more than 10 days
- D) By the payroll team to confirm sick pay calculations

**Q18.** A training course marked as `courseType = Regulatory` indicates:
- A) The course is delivered by a regulatory body
- B) Completion of this course is required by law or a regulatory authority
- C) The course content is approved by a certification body
- D) The course is only available to compliance and legal team members

**Q19.** Which report would you use to identify all employees whose Moving and Handling certificates expire within the next 60 days?
- A) HR → Employees → Filter by hire date
- B) Training → Reports → Compliance Matrix → filter by course, sort by expiry date
- C) Payroll → Reports → Variance Report
- D) HR → Reports → Headcount Trend

**Q20.** A benefit-in-kind (BIK) payroll adjustment must be recorded because:
- A) It affects the employee's gross pay for pension contribution calculation
- B) It is taxable; the system generates P11D data for HMRC reporting
- C) It replaces the salary payment for that period
- D) It is required only if the BIK value exceeds £1,000
