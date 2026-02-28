# Assessment — Day A: Quality & Non-Conformance

**Format**: 20 MCQ | **Time**: 30 minutes | **Pass**: ≥ 75% (15/20) | **Delivery**: Web portal `/module-owner/quality-nc/assessment`

*This file contains the 20 questions and answer options. Answers and explanations are in ANSWER-KEY-DAY-A.md (FACILITATOR ONLY).*

---

## Instructions for Participants

You have 30 minutes to complete 20 multiple-choice questions covering Quality Workflows, Document Control, and Non-Conformance Management. Select one answer per question. You may review and change answers before submitting. The timer starts when you click **Begin Assessment**. A score of 75% or above (15 correct) earns your Nexara Certified Module Owner — Quality & Non-Conformance certificate.

---

## Question Bank

**Q1.** In Nexara IMS, what is the correct reference number format for a non-conformance record raised in 2026?
- A) NC-001-2026
- B) QMS-NC-2026-001
- C) QUALITY-NC-2026-001
- D) IMS/NC/2026/001

**Q2.** A dimensional defect is found during final inspection on a batch of machined components produced entirely in-house. Which NC category is correct?
- A) Supplier
- B) System
- C) Product
- D) Process

**Q3.** Which NC severity level should be assigned when a non-conformance has caused an actual impact on product safety or regulatory compliance?
- A) Minor
- B) Moderate
- C) Major
- D) Critical

**Q4.** Under ISO 9001:2015 clause 7.5, which of the following is a control requirement for documented information?
- A) All documents must be printed and signed by a director
- B) Documents must be available, protected, and managed for changes
- C) Documents must be stored in a certified document management system
- D) All versions must be sent to the certification body on update

**Q5.** An NC is raised because the assembly sequence procedure was not followed by a technician, resulting in a subassembly being assembled incorrectly. Which NC category applies?
- A) Product
- B) Process
- C) System
- D) Supplier

**Q6.** The `detectionPoint` field on an NC record captures which information?
- A) The root cause of the non-conformance
- B) The person who approved the NC investigation
- C) The stage in the value chain where the NC was first identified
- D) The date the NC was reported to the customer

**Q7.** A containment action on an NC record should describe:
- A) The root cause analysis method used
- B) The corrective action that prevents recurrence
- C) The immediate steps taken to control and isolate the non-conformance
- D) The verification that the non-conformance has been resolved

**Q8.** In Nexara, what prevents an NC from being closed before the corrective action is proven effective?
- A) A manual checklist that the quality manager must complete
- B) A system constraint — the linked CAPA must have status Effective or Closed before NC closure is permitted
- C) An approval from SUPER_ADMIN is required for all NC closures
- D) The NC status field is locked until 30 days have elapsed

**Q9.** Which of the following root cause categories should be selected when an NC occurred because the calibration procedure for a measurement instrument did not exist?
- A) Human error
- B) Equipment failure
- C) Inadequate procedure
- D) Environmental factor

**Q10.** A CAPA should be created:
- A) As a standalone record; the NC and CAPA are separate processes
- B) From within the NC record using Actions → Create CAPA, to establish the parent-child relationship
- C) By the Nexara administrator after the quality manager submits a request
- D) Only when the NC is classified as Major or Critical

**Q11.** The CAPA effectiveness review date should be set to:
- A) The same date as the NC due date
- B) 30 days after the CAPA is created
- C) A date after all corrective actions are expected to be implemented, allowing time to verify effectiveness
- D) The date of the next management review meeting

**Q12.** A CAPA has status "Ineffective" after the effectiveness review. What is the correct next step?
- A) Close the NC and document the ineffective CAPA as a lesson learned
- B) Escalate to SUPER_ADMIN for system deletion of the ineffective CAPA
- C) Raise a new CAPA with a revised root cause analysis, as the first root cause was evidently incorrect
- D) Change the CAPA status to "Effective" and add a note explaining the review finding

**Q13.** Under ISO 9001:2015 clause 10.2, which evidence combination is required to demonstrate NC management compliance?
- A) NC record only — no CAPA required for Minor NCs
- B) NC record + investigation + root cause + corrective action + effectiveness evidence
- C) CAPA record only — NC records are optional for internal quality management
- D) NC record + customer approval of the corrective action

**Q14.** The Nexara Quality dashboard shows a Repeat NC Rate of 18%. What does this indicate?
- A) 18% of NCs were raised in error and subsequently retracted
- B) 18% of NCs raised in the period are categorised as repeats — same root cause, same process area, within 12 months
- C) 18% of NCs were not assigned to a responsible owner within the SLA
- D) 18% of NCs are still open beyond their 30-day due date

**Q15.** Which KPI most directly measures the efficiency of the corrective action process?
- A) NC Open Rate
- B) Repeat NC Rate
- C) CAPA Effectiveness Rate
- D) Average Days to Close

**Q16.** A quality manager wants to see all open NCs categorised as "Supplier" that are overdue. Which dashboard action achieves this?
- A) Export the full NC list and filter in Excel
- B) Apply filters: Category = Supplier, Status = Open, Due Date = Past on the NC module list view
- C) Contact the Nexara administrator to run a custom database query
- D) Generate an ISO evidence package filtered by Supplier category

**Q17.** In the document version scheme, what does upgrading from v1.3 to v2.0 indicate?
- A) A minor editorial correction
- B) Addition of a new optional section
- C) A significant scope change requiring full re-approval
- D) The document was superseded and archived

**Q18.** A non-conformance arising from a supplier's failure to meet contractual material specifications should be mapped to which ISO 9001:2015 clause?
- A) 8.7 — Control of nonconforming outputs
- B) 8.4 — Control of externally provided processes, products and services
- C) 10.2 — Nonconformity and corrective action
- D) 9.1.3 — Analysis and evaluation

**Q19.** When generating an ISO 9001 evidence package in Nexara, what does the evidence index contain?
- A) A list of all system users and their permission levels
- B) A clause-mapped list of records grouped by ISO 9001:2015 requirement with links to each record
- C) A summary of audit findings from the current year
- D) The complete text of the ISO 9001:2015 standard with annotations

**Q20.** A quality manager needs to prove to an external auditor that Document Control (ISO 9001 clause 7.5) is being maintained. Which combination of Nexara reports provides this evidence most efficiently?
- A) NC list report + CAPA list report
- B) Document version history report + approval workflow log + superseded document archive
- C) KPI dashboard export + management review minutes
- D) Training records + competency matrix
