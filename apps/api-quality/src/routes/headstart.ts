import { Router, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { scopeToUser } from '@ims/service-auth';
import { randomUUID } from 'crypto';

const logger = createLogger('api-quality:headstart');
const router: Router = Router();

router.use(authenticate);

// ── ISO Standard Templates ──────────────────────────────────────────

const STANDARD_TEMPLATES: Record<string, {
  name: string;
  clauses: { number: string; title: string; description: string }[];
  documents: { title: string; clause: string; description: string }[];
  risks: { title: string; clause: string; likelihood: number; impact: number; category: string }[];
  objectives: { title: string; clause: string; target: string; frequency: string }[];
  auditSchedule: { area: string; clause: string; frequency: string; month: number }[];
  legalRegister: { title: string; jurisdiction: string; clause: string }[];
}> = {
  ISO_9001: {
    name: 'ISO 9001:2015 Quality Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'Determine external and internal issues relevant to the QMS' },
      { number: '4.2', title: 'Understanding needs and expectations of interested parties', description: 'Determine interested parties and their requirements' },
      { number: '4.3', title: 'Determining the scope of the QMS', description: 'Define the boundaries and applicability of the QMS' },
      { number: '4.4', title: 'Quality management system and its processes', description: 'Establish, implement, maintain and continually improve the QMS' },
      { number: '5.1', title: 'Leadership and commitment', description: 'Top management shall demonstrate leadership and commitment' },
      { number: '5.2', title: 'Quality policy', description: 'Establish, implement and maintain a quality policy' },
      { number: '5.3', title: 'Organisational roles, responsibilities and authorities', description: 'Assign and communicate roles and responsibilities' },
      { number: '6.1', title: 'Actions to address risks and opportunities', description: 'Determine risks and opportunities and plan actions' },
      { number: '6.2', title: 'Quality objectives and planning', description: 'Establish quality objectives at relevant functions and levels' },
      { number: '6.3', title: 'Planning of changes', description: 'Plan changes to the QMS in a systematic manner' },
      { number: '7.1', title: 'Resources', description: 'Determine and provide resources needed for the QMS' },
      { number: '7.2', title: 'Competence', description: 'Determine necessary competence and ensure training' },
      { number: '7.3', title: 'Awareness', description: 'Ensure persons are aware of quality policy and objectives' },
      { number: '7.4', title: 'Communication', description: 'Determine internal and external communications' },
      { number: '7.5', title: 'Documented information', description: 'Control documented information required by the QMS' },
      { number: '8.1', title: 'Operational planning and control', description: 'Plan, implement and control processes needed' },
      { number: '8.2', title: 'Requirements for products and services', description: 'Determine requirements for products and services' },
      { number: '8.4', title: 'Control of externally provided processes', description: 'Ensure externally provided processes conform to requirements' },
      { number: '8.5', title: 'Production and service provision', description: 'Implement production and service provision under controlled conditions' },
      { number: '8.7', title: 'Control of nonconforming outputs', description: 'Identify and control nonconforming outputs' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Determine what needs to be monitored and measured' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct internal audits at planned intervals' },
      { number: '9.3', title: 'Management review', description: 'Review the QMS at planned intervals' },
      { number: '10.1', title: 'Nonconformity and corrective action', description: 'React to nonconformities and take corrective action' },
      { number: '10.2', title: 'Continual improvement', description: 'Continually improve the QMS' },
    ],
    documents: [
      { title: 'Quality Manual', clause: '4.4', description: 'Overview of QMS scope, processes, and interactions' },
      { title: 'Quality Policy', clause: '5.2', description: 'Signed quality policy statement from top management' },
      { title: 'Context of the Organisation', clause: '4.1', description: 'SWOT analysis and external/internal issues' },
      { title: 'Interested Parties Register', clause: '4.2', description: 'Register of interested parties and their requirements' },
      { title: 'QMS Scope Statement', clause: '4.3', description: 'Defined scope with justification for exclusions' },
      { title: 'Process Interaction Map', clause: '4.4', description: 'Turtle diagram or SIPOC for key processes' },
      { title: 'Organisational Chart', clause: '5.3', description: 'Roles, responsibilities and authorities' },
      { title: 'Risk and Opportunity Register', clause: '6.1', description: 'Risk assessment with treatment plans' },
      { title: 'Quality Objectives', clause: '6.2', description: 'SMART objectives with measurement plans' },
      { title: 'Competency Matrix', clause: '7.2', description: 'Skills matrix with training records' },
      { title: 'Document Control Procedure', clause: '7.5', description: 'Procedure for creating, reviewing and approving documents' },
      { title: 'Supplier Evaluation Procedure', clause: '8.4', description: 'Criteria for selecting and evaluating suppliers' },
      { title: 'NCR Procedure', clause: '8.7', description: 'Procedure for handling nonconforming products/services' },
      { title: 'Internal Audit Procedure', clause: '9.2', description: 'Procedure for planning and conducting internal audits' },
      { title: 'Management Review Procedure', clause: '9.3', description: 'Agenda and minutes template for management review' },
      { title: 'CAPA Procedure', clause: '10.1', description: 'Corrective and preventive action procedure' },
    ],
    risks: [
      { title: 'Customer requirements not fully understood', clause: '8.2', likelihood: 3, impact: 4, category: 'OPERATIONAL' },
      { title: 'Supplier delivers nonconforming material', clause: '8.4', likelihood: 3, impact: 3, category: 'SUPPLY_CHAIN' },
      { title: 'Key person dependency for critical processes', clause: '7.2', likelihood: 2, impact: 4, category: 'PEOPLE' },
      { title: 'Inadequate calibration of measurement equipment', clause: '7.1.5', likelihood: 2, impact: 4, category: 'EQUIPMENT' },
      { title: 'Document control failure — obsolete documents in use', clause: '7.5', likelihood: 2, impact: 3, category: 'SYSTEM' },
      { title: 'Loss of customer due to quality failures', clause: '9.1.2', likelihood: 2, impact: 5, category: 'STRATEGIC' },
    ],
    objectives: [
      { title: 'Customer satisfaction score ≥ 85%', clause: '9.1.2', target: '≥ 85%', frequency: 'QUARTERLY' },
      { title: 'Internal NCR rate < 2%', clause: '8.7', target: '< 2%', frequency: 'MONTHLY' },
      { title: 'Supplier on-time delivery ≥ 95%', clause: '8.4', target: '≥ 95%', frequency: 'MONTHLY' },
      { title: 'CAPA closure within 30 days ≥ 90%', clause: '10.1', target: '≥ 90%', frequency: 'MONTHLY' },
      { title: 'Internal audit programme 100% complete', clause: '9.2', target: '100%', frequency: 'ANNUAL' },
      { title: 'Training plan completion ≥ 95%', clause: '7.2', target: '≥ 95%', frequency: 'QUARTERLY' },
    ],
    auditSchedule: [
      { area: 'Context & Leadership (4.1-5.3)', clause: '4-5', frequency: 'ANNUAL', month: 1 },
      { area: 'Risk & Objectives (6.1-6.3)', clause: '6', frequency: 'ANNUAL', month: 3 },
      { area: 'Resources & Competence (7.1-7.5)', clause: '7', frequency: 'ANNUAL', month: 5 },
      { area: 'Operations (8.1-8.7)', clause: '8', frequency: 'SEMI_ANNUAL', month: 2 },
      { area: 'Performance Evaluation (9.1-9.3)', clause: '9', frequency: 'ANNUAL', month: 7 },
      { area: 'Improvement (10.1-10.2)', clause: '10', frequency: 'ANNUAL', month: 9 },
    ],
    legalRegister: [
      { title: 'Consumer Rights Act 2015', jurisdiction: 'UK', clause: '8.2' },
      { title: 'Sale of Goods Act 1979', jurisdiction: 'UK', clause: '8.5' },
      { title: 'Product Safety Regulations', jurisdiction: 'UK/EU', clause: '8.5' },
      { title: 'GDPR / Data Protection Act 2018', jurisdiction: 'UK/EU', clause: '7.5' },
    ],
  },
  ISO_14001: {
    name: 'ISO 14001:2015 Environmental Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'Determine environmental conditions and external/internal issues' },
      { number: '4.2', title: 'Understanding needs and expectations of interested parties', description: 'Identify interested parties relevant to the EMS' },
      { number: '4.3', title: 'Determining the scope of the EMS', description: 'Define boundaries considering environmental aspects' },
      { number: '4.4', title: 'Environmental management system', description: 'Establish, implement, maintain and improve the EMS' },
      { number: '5.1', title: 'Leadership and commitment', description: 'Top management environmental leadership' },
      { number: '5.2', title: 'Environmental policy', description: 'Establish environmental policy with commitments' },
      { number: '6.1', title: 'Actions to address risks, opportunities and environmental aspects', description: 'Determine significant environmental aspects and compliance obligations' },
      { number: '6.2', title: 'Environmental objectives and planning', description: 'Establish measurable environmental objectives' },
      { number: '7.1', title: 'Resources', description: 'Determine and provide EMS resources' },
      { number: '7.2', title: 'Competence', description: 'Ensure environmental competence' },
      { number: '7.5', title: 'Documented information', description: 'Control EMS documented information' },
      { number: '8.1', title: 'Operational planning and control', description: 'Plan and control operations for significant aspects' },
      { number: '8.2', title: 'Emergency preparedness and response', description: 'Prepare for and respond to environmental emergencies' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Monitor environmental performance and compliance' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct EMS internal audits' },
      { number: '9.3', title: 'Management review', description: 'Review EMS at planned intervals' },
      { number: '10.1', title: 'Nonconformity and corrective action', description: 'Address EMS nonconformities' },
      { number: '10.2', title: 'Continual improvement', description: 'Continually improve EMS' },
    ],
    documents: [
      { title: 'Environmental Policy', clause: '5.2', description: 'Signed environmental policy with pollution prevention commitment' },
      { title: 'Environmental Aspects & Impacts Register', clause: '6.1.2', description: 'Significance scoring matrix for all aspects' },
      { title: 'Legal & Compliance Obligations Register', clause: '6.1.3', description: 'Environmental legislation and permits' },
      { title: 'Environmental Objectives & Targets', clause: '6.2', description: 'Measurable targets with action plans' },
      { title: 'Emergency Response Plan', clause: '8.2', description: 'Spill response, fire, chemical release procedures' },
      { title: 'Waste Management Procedure', clause: '8.1', description: 'Waste segregation, storage, disposal and duty of care' },
      { title: 'Environmental Monitoring Procedure', clause: '9.1', description: 'Monitoring schedule for emissions, discharges, waste' },
    ],
    risks: [
      { title: 'Chemical spill to watercourse', clause: '8.2', likelihood: 2, impact: 5, category: 'ENVIRONMENTAL' },
      { title: 'Breach of environmental permit conditions', clause: '6.1.3', likelihood: 2, impact: 4, category: 'COMPLIANCE' },
      { title: 'Uncontrolled waste disposal by contractor', clause: '8.1', likelihood: 3, impact: 3, category: 'SUPPLY_CHAIN' },
      { title: 'Air quality exceedance', clause: '9.1', likelihood: 2, impact: 4, category: 'ENVIRONMENTAL' },
    ],
    objectives: [
      { title: 'Reduce carbon emissions by 10% year-on-year', clause: '6.2', target: '10% reduction', frequency: 'ANNUAL' },
      { title: 'Zero environmental permit breaches', clause: '6.1.3', target: '0 breaches', frequency: 'ANNUAL' },
      { title: 'Waste recycling rate ≥ 80%', clause: '8.1', target: '≥ 80%', frequency: 'QUARTERLY' },
      { title: 'Environmental training completion 100%', clause: '7.2', target: '100%', frequency: 'ANNUAL' },
    ],
    auditSchedule: [
      { area: 'Environmental Aspects & Legal Compliance', clause: '6.1', frequency: 'SEMI_ANNUAL', month: 2 },
      { area: 'Operational Controls & Emergency Response', clause: '8', frequency: 'ANNUAL', month: 5 },
      { area: 'Monitoring & Performance Evaluation', clause: '9', frequency: 'ANNUAL', month: 8 },
      { area: 'Leadership & Improvement', clause: '5,10', frequency: 'ANNUAL', month: 11 },
    ],
    legalRegister: [
      { title: 'Environmental Protection Act 1990', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'Environmental Permitting Regulations 2016', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'Waste (England and Wales) Regulations 2011', jurisdiction: 'UK', clause: '8.1' },
      { title: 'REACH Regulation (EC 1907/2006)', jurisdiction: 'EU', clause: '8.1' },
      { title: 'Climate Change Act 2008', jurisdiction: 'UK', clause: '6.2' },
    ],
  },
  ISO_45001: {
    name: 'ISO 45001:2018 Occupational Health & Safety Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'Determine OH&S issues and conditions' },
      { number: '4.2', title: 'Understanding needs and expectations of workers and interested parties', description: 'Consult with workers on OH&S matters' },
      { number: '4.3', title: 'Determining the scope of the OH&S MS', description: 'Define OH&S management system scope' },
      { number: '5.1', title: 'Leadership, commitment and worker participation', description: 'Top management OH&S leadership and worker consultation' },
      { number: '5.2', title: 'OH&S policy', description: 'Establish OH&S policy with commitments' },
      { number: '6.1', title: 'Actions to address risks and opportunities', description: 'Hazard identification, risk assessment, legal requirements' },
      { number: '6.2', title: 'OH&S objectives and planning', description: 'Establish measurable OH&S objectives' },
      { number: '7.1', title: 'Resources', description: 'Determine and provide OH&S resources' },
      { number: '7.2', title: 'Competence', description: 'Ensure OH&S competence' },
      { number: '7.4', title: 'Communication, participation and consultation', description: 'Internal and external OH&S communications' },
      { number: '8.1', title: 'Operational planning and control', description: 'Hierarchy of controls implementation' },
      { number: '8.2', title: 'Emergency preparedness and response', description: 'Emergency plans including first aid and evacuation' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Monitor OH&S performance indicators' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct OH&S internal audits' },
      { number: '9.3', title: 'Management review', description: 'Review OH&S MS at planned intervals' },
      { number: '10.1', title: 'Incident investigation', description: 'Investigate incidents and determine root causes' },
      { number: '10.2', title: 'Nonconformity and corrective action', description: 'Address OH&S nonconformities' },
      { number: '10.3', title: 'Continual improvement', description: 'Continually improve OH&S MS' },
    ],
    documents: [
      { title: 'OH&S Policy', clause: '5.2', description: 'Signed health & safety policy' },
      { title: 'Hazard Identification & Risk Assessment Register', clause: '6.1.2', description: 'HIRA with hierarchy of controls' },
      { title: 'Legal Requirements Register', clause: '6.1.3', description: 'OH&S legislation and regulations' },
      { title: 'Emergency Response Plan', clause: '8.2', description: 'Fire, evacuation, first aid, chemical spill procedures' },
      { title: 'Incident Investigation Procedure', clause: '10.1', description: 'Procedure for reporting and investigating incidents' },
      { title: 'Safety Committee Terms of Reference', clause: '5.4', description: 'Worker participation and consultation arrangements' },
      { title: 'Permit to Work Procedure', clause: '8.1', description: 'Hot work, confined space, working at height' },
    ],
    risks: [
      { title: 'Slip, trip and fall injuries', clause: '6.1.2', likelihood: 3, impact: 3, category: 'PHYSICAL' },
      { title: 'Manual handling injuries', clause: '6.1.2', likelihood: 3, impact: 3, category: 'ERGONOMIC' },
      { title: 'Chemical exposure — COSHH', clause: '8.1', likelihood: 2, impact: 4, category: 'CHEMICAL' },
      { title: 'Fire and explosion', clause: '8.2', likelihood: 1, impact: 5, category: 'FIRE' },
      { title: 'Working at height falls', clause: '8.1', likelihood: 2, impact: 5, category: 'PHYSICAL' },
      { title: 'Machinery entanglement', clause: '8.1', likelihood: 2, impact: 5, category: 'MECHANICAL' },
    ],
    objectives: [
      { title: 'LTIFR < 2.0', clause: '9.1', target: '< 2.0', frequency: 'MONTHLY' },
      { title: 'Zero RIDDOR reportable incidents', clause: '9.1', target: '0', frequency: 'ANNUAL' },
      { title: 'Safety training completion 100%', clause: '7.2', target: '100%', frequency: 'QUARTERLY' },
      { title: 'Near-miss reporting rate ≥ 5 per month', clause: '10.1', target: '≥ 5/month', frequency: 'MONTHLY' },
      { title: 'Risk assessment review 100% complete', clause: '6.1.2', target: '100%', frequency: 'ANNUAL' },
    ],
    auditSchedule: [
      { area: 'Hazard ID & Risk Assessment', clause: '6.1', frequency: 'SEMI_ANNUAL', month: 1 },
      { area: 'Operational Controls & PTW', clause: '8.1', frequency: 'QUARTERLY', month: 3 },
      { area: 'Emergency Preparedness', clause: '8.2', frequency: 'ANNUAL', month: 6 },
      { area: 'Incident Investigation & CAPA', clause: '10', frequency: 'SEMI_ANNUAL', month: 4 },
      { area: 'Performance Monitoring & KPIs', clause: '9.1', frequency: 'ANNUAL', month: 9 },
    ],
    legalRegister: [
      { title: 'Health and Safety at Work Act 1974', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'Management of Health and Safety at Work Regulations 1999', jurisdiction: 'UK', clause: '6.1.2' },
      { title: 'RIDDOR 2013', jurisdiction: 'UK', clause: '10.1' },
      { title: 'COSHH Regulations 2002', jurisdiction: 'UK', clause: '8.1' },
      { title: 'Work at Height Regulations 2005', jurisdiction: 'UK', clause: '8.1' },
      { title: 'Provision and Use of Work Equipment Regulations 1998', jurisdiction: 'UK', clause: '8.1' },
    ],
  },
  ISO_27001: {
    name: 'ISO 27001:2022 Information Security Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'ISMS context and information security issues' },
      { number: '4.2', title: 'Understanding needs and expectations of interested parties', description: 'Determine ISMS interested parties' },
      { number: '4.3', title: 'Determining the scope of the ISMS', description: 'Define ISMS boundaries' },
      { number: '5.1', title: 'Leadership and commitment', description: 'Top management information security leadership' },
      { number: '5.2', title: 'Information security policy', description: 'Establish information security policy' },
      { number: '6.1', title: 'Actions to address risks and opportunities', description: 'Information security risk assessment methodology' },
      { number: '6.2', title: 'Information security objectives', description: 'Establish ISMS objectives' },
      { number: '7.1', title: 'Resources', description: 'Determine and provide ISMS resources' },
      { number: '7.2', title: 'Competence', description: 'Information security competence and awareness' },
      { number: '7.5', title: 'Documented information', description: 'ISMS documented information control' },
      { number: '8.1', title: 'Operational planning and control', description: 'Implement information security risk treatment plan' },
      { number: '8.2', title: 'Information security risk assessment', description: 'Perform risk assessments at planned intervals' },
      { number: '8.3', title: 'Information security risk treatment', description: 'Implement risk treatment plan' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Monitor ISMS effectiveness' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct ISMS internal audits' },
      { number: '9.3', title: 'Management review', description: 'Review ISMS at planned intervals' },
      { number: '10.1', title: 'Continual improvement', description: 'Continually improve the ISMS' },
      { number: '10.2', title: 'Nonconformity and corrective action', description: 'Address ISMS nonconformities' },
    ],
    documents: [
      { title: 'Information Security Policy', clause: '5.2', description: 'Overarching information security policy' },
      { title: 'ISMS Scope Statement', clause: '4.3', description: 'Boundaries and applicability of the ISMS' },
      { title: 'Risk Assessment Methodology', clause: '6.1.2', description: 'Asset-threat-vulnerability model with 5x5 matrix' },
      { title: 'Statement of Applicability (SoA)', clause: '6.1.3', description: 'All 93 Annex A controls with justification' },
      { title: 'Information Asset Register', clause: 'A.5', description: 'Classified information assets with owners' },
      { title: 'Access Control Policy', clause: 'A.8', description: 'User access management and authentication' },
      { title: 'Incident Response Procedure', clause: 'A.5.24', description: 'Security incident management and GDPR notification' },
      { title: 'Business Continuity Plan', clause: 'A.5.30', description: 'ICT readiness for business continuity' },
      { title: 'Acceptable Use Policy', clause: 'A.5.10', description: 'Acceptable use of information and assets' },
    ],
    risks: [
      { title: 'Ransomware attack encrypts critical data', clause: '8.2', likelihood: 3, impact: 5, category: 'CYBER' },
      { title: 'Phishing attack compromises user credentials', clause: '8.2', likelihood: 4, impact: 3, category: 'CYBER' },
      { title: 'Insider threat — data exfiltration', clause: '8.2', likelihood: 2, impact: 4, category: 'PEOPLE' },
      { title: 'Third-party data breach via supply chain', clause: '8.2', likelihood: 3, impact: 4, category: 'SUPPLY_CHAIN' },
      { title: 'Loss of availability — system outage', clause: '8.2', likelihood: 3, impact: 3, category: 'TECHNICAL' },
    ],
    objectives: [
      { title: 'Zero critical security incidents', clause: '9.1', target: '0', frequency: 'ANNUAL' },
      { title: 'Security awareness training 100% complete', clause: '7.2', target: '100%', frequency: 'ANNUAL' },
      { title: 'Vulnerability remediation SLA ≤ 30 days (critical)', clause: '9.1', target: '≤ 30 days', frequency: 'MONTHLY' },
      { title: 'ISMS internal audit programme 100% complete', clause: '9.2', target: '100%', frequency: 'ANNUAL' },
    ],
    auditSchedule: [
      { area: 'Access Control & Authentication (A.8)', clause: 'A.8', frequency: 'SEMI_ANNUAL', month: 2 },
      { area: 'Organisational Controls (A.5)', clause: 'A.5', frequency: 'ANNUAL', month: 4 },
      { area: 'People Controls (A.6)', clause: 'A.6', frequency: 'ANNUAL', month: 6 },
      { area: 'Physical Controls (A.7)', clause: 'A.7', frequency: 'ANNUAL', month: 8 },
      { area: 'Technological Controls (A.8)', clause: 'A.8', frequency: 'ANNUAL', month: 10 },
      { area: 'ISMS Core Clauses (4-10)', clause: '4-10', frequency: 'ANNUAL', month: 1 },
    ],
    legalRegister: [
      { title: 'UK GDPR / Data Protection Act 2018', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'Computer Misuse Act 1990', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'NIS Regulations 2018', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'Privacy and Electronic Communications Regulations', jurisdiction: 'UK', clause: '6.1.3' },
    ],
  },
  ISO_22000: {
    name: 'ISO 22000:2018 Food Safety Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'Food safety context and issues' },
      { number: '5.1', title: 'Leadership and commitment', description: 'Top management food safety commitment' },
      { number: '5.2', title: 'Food safety policy', description: 'Establish food safety policy' },
      { number: '6.1', title: 'Actions to address risks and opportunities', description: 'Food safety risks and PRPs' },
      { number: '7.1', title: 'Resources', description: 'Food safety resources including infrastructure and work environment' },
      { number: '8.1', title: 'Operational planning and control', description: 'PRPs, traceability, emergency preparedness' },
      { number: '8.2', title: 'Prerequisite programmes (PRPs)', description: 'Cleaning, pest control, personal hygiene' },
      { number: '8.5', title: 'Hazard analysis', description: 'HACCP 7 principles — hazard identification and CCP determination' },
      { number: '8.8', title: 'Verification planning', description: 'Verify HACCP plan and PRPs are effective' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Food safety performance monitoring' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct food safety internal audits' },
      { number: '9.3', title: 'Management review', description: 'Review FSMS at planned intervals' },
      { number: '10.1', title: 'Nonconformity and corrective action', description: 'Address food safety nonconformities' },
    ],
    documents: [
      { title: 'Food Safety Policy', clause: '5.2', description: 'Food safety policy and objectives' },
      { title: 'HACCP Plan', clause: '8.5', description: 'Hazard analysis, CCPs, critical limits, monitoring' },
      { title: 'PRP Manual', clause: '8.2', description: 'Prerequisite programmes for food safety' },
      { title: 'Allergen Management Procedure', clause: '8.5', description: 'Allergen identification and control' },
      { title: 'Traceability Procedure', clause: '8.3', description: 'Forward and backward traceability' },
      { title: 'Product Recall Procedure', clause: '8.4', description: 'Recall and withdrawal procedures' },
    ],
    risks: [
      { title: 'Allergen cross-contamination', clause: '8.5', likelihood: 3, impact: 5, category: 'BIOLOGICAL' },
      { title: 'Foreign body contamination', clause: '8.5', likelihood: 2, impact: 5, category: 'PHYSICAL' },
      { title: 'Pathogen growth due to temperature abuse', clause: '8.5', likelihood: 3, impact: 5, category: 'BIOLOGICAL' },
      { title: 'Chemical contamination from cleaning agents', clause: '8.2', likelihood: 2, impact: 4, category: 'CHEMICAL' },
    ],
    objectives: [
      { title: 'Zero product recalls', clause: '8.4', target: '0', frequency: 'ANNUAL' },
      { title: 'CCP monitoring compliance 100%', clause: '8.5', target: '100%', frequency: 'DAILY' },
      { title: 'Food safety audit score ≥ AA (BRC)', clause: '9.2', target: '≥ AA', frequency: 'ANNUAL' },
    ],
    auditSchedule: [
      { area: 'HACCP Plan Verification', clause: '8.5', frequency: 'SEMI_ANNUAL', month: 3 },
      { area: 'PRPs & GMP', clause: '8.2', frequency: 'QUARTERLY', month: 1 },
      { area: 'Allergen Management', clause: '8.5', frequency: 'SEMI_ANNUAL', month: 6 },
      { area: 'Traceability Exercise (Mock Recall)', clause: '8.3', frequency: 'ANNUAL', month: 9 },
    ],
    legalRegister: [
      { title: 'Food Safety Act 1990', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'General Food Regulations 2004', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'EU Regulation 852/2004 (Hygiene)', jurisdiction: 'EU', clause: '8.2' },
      { title: 'Food Information Regulations 2014 (Allergens)', jurisdiction: 'UK', clause: '8.5' },
    ],
  },
  ISO_50001: {
    name: 'ISO 50001:2018 Energy Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'Energy context and issues' },
      { number: '5.1', title: 'Leadership and commitment', description: 'Top management energy management commitment' },
      { number: '5.2', title: 'Energy policy', description: 'Establish energy policy' },
      { number: '6.1', title: 'Actions to address risks and opportunities', description: 'Energy risks and opportunities' },
      { number: '6.2', title: 'Energy objectives, targets and action plans', description: 'Establish energy performance targets' },
      { number: '6.3', title: 'Energy review', description: 'Analyse energy use and consumption' },
      { number: '6.4', title: 'Energy performance indicators (EnPIs)', description: 'Establish and monitor EnPIs' },
      { number: '6.5', title: 'Energy baseline (EnB)', description: 'Establish energy baselines' },
      { number: '6.6', title: 'Planning for collection of energy data', description: 'Data collection plan for energy management' },
      { number: '8.1', title: 'Operational planning and control', description: 'Control significant energy uses' },
      { number: '8.2', title: 'Design', description: 'Consider energy performance in design' },
      { number: '8.3', title: 'Procurement', description: 'Energy performance in procurement' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Monitor energy performance' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct EnMS internal audits' },
      { number: '9.3', title: 'Management review', description: 'Review EnMS at planned intervals' },
    ],
    documents: [
      { title: 'Energy Policy', clause: '5.2', description: 'Energy policy with commitment to improve energy performance' },
      { title: 'Energy Review Report', clause: '6.3', description: 'Analysis of energy use, consumption and efficiency' },
      { title: 'Significant Energy Use (SEU) Register', clause: '6.3', description: 'Equipment/processes with significant energy use' },
      { title: 'EnPI & Baseline Documentation', clause: '6.4', description: 'Energy performance indicators and baselines' },
    ],
    risks: [
      { title: 'Energy price volatility', clause: '6.1', likelihood: 4, impact: 3, category: 'FINANCIAL' },
      { title: 'Non-compliance with ESOS regulations', clause: '6.1', likelihood: 2, impact: 4, category: 'COMPLIANCE' },
      { title: 'Equipment efficiency degradation', clause: '8.1', likelihood: 3, impact: 3, category: 'OPERATIONAL' },
    ],
    objectives: [
      { title: 'Reduce energy intensity by 5% year-on-year', clause: '6.2', target: '5% reduction', frequency: 'ANNUAL' },
      { title: 'EnPI improvement for top 3 SEUs', clause: '6.4', target: '≥ 3% improvement', frequency: 'QUARTERLY' },
      { title: 'ESOS Phase 3 compliance', clause: '6.1', target: 'Compliant', frequency: 'ANNUAL' },
    ],
    auditSchedule: [
      { area: 'Energy Review & SEU', clause: '6.3', frequency: 'ANNUAL', month: 2 },
      { area: 'EnPI Monitoring & Baselines', clause: '6.4-6.5', frequency: 'SEMI_ANNUAL', month: 5 },
      { area: 'Operational Controls', clause: '8', frequency: 'ANNUAL', month: 8 },
    ],
    legalRegister: [
      { title: 'Energy Savings Opportunity Scheme (ESOS)', jurisdiction: 'UK', clause: '6.1' },
      { title: 'Streamlined Energy and Carbon Reporting (SECR)', jurisdiction: 'UK', clause: '9.1' },
      { title: 'Climate Change Agreements (CCA)', jurisdiction: 'UK', clause: '6.1' },
      { title: 'Energy Performance of Buildings Regulations', jurisdiction: 'UK', clause: '8.2' },
    ],
  },
  ISO_42001: {
    name: 'ISO 42001:2023 AI Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'AI context, stakeholders and regulatory landscape' },
      { number: '4.2', title: 'Understanding needs and expectations of interested parties', description: 'AI stakeholders and their concerns' },
      { number: '5.1', title: 'Leadership and commitment', description: 'Top management AI governance leadership' },
      { number: '5.2', title: 'AI policy', description: 'Establish responsible AI policy' },
      { number: '6.1', title: 'Actions to address risks and opportunities', description: 'AI-specific risks including bias, safety, privacy' },
      { number: '6.2', title: 'AIMS objectives', description: 'Establish AI management objectives' },
      { number: '7.2', title: 'Competence', description: 'AI competence and skills development' },
      { number: '8.1', title: 'Operational planning and control', description: 'AI system lifecycle management' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Monitor AI system performance and fairness' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct AIMS internal audits' },
      { number: '10.1', title: 'Nonconformity and corrective action', description: 'Address AI incidents and nonconformities' },
    ],
    documents: [
      { title: 'AI Policy', clause: '5.2', description: 'Responsible AI use policy with ethical principles' },
      { title: 'AI System Register', clause: '8.1', description: 'Inventory of all AI systems in use' },
      { title: 'AI Risk Assessment Framework', clause: '6.1', description: 'AI-specific risk categories and assessment' },
      { title: 'AI Impact Assessment Template', clause: '8.1', description: 'For high-risk AI per EU AI Act classification' },
    ],
    risks: [
      { title: 'AI bias in decision-making outputs', clause: '6.1', likelihood: 3, impact: 4, category: 'ETHICAL' },
      { title: 'AI hallucination providing incorrect compliance advice', clause: '6.1', likelihood: 3, impact: 4, category: 'ACCURACY' },
      { title: 'Privacy violation through AI data processing', clause: '6.1', likelihood: 2, impact: 5, category: 'PRIVACY' },
      { title: 'Non-compliance with EU AI Act', clause: '6.1', likelihood: 2, impact: 4, category: 'REGULATORY' },
    ],
    objectives: [
      { title: 'AI incident response time ≤ 4 hours', clause: '10.1', target: '≤ 4 hours', frequency: 'MONTHLY' },
      { title: 'AI system register 100% complete', clause: '8.1', target: '100%', frequency: 'QUARTERLY' },
      { title: 'AI ethics training completion 100%', clause: '7.2', target: '100%', frequency: 'ANNUAL' },
    ],
    auditSchedule: [
      { area: 'AI System Inventory & Risk Assessment', clause: '6.1,8.1', frequency: 'SEMI_ANNUAL', month: 3 },
      { area: 'AI Ethics & Bias Monitoring', clause: '9.1', frequency: 'QUARTERLY', month: 1 },
      { area: 'AI Incident Management', clause: '10.1', frequency: 'ANNUAL', month: 7 },
    ],
    legalRegister: [
      { title: 'EU AI Act (Regulation 2024/1689)', jurisdiction: 'EU', clause: '6.1' },
      { title: 'UK AI Regulation (pro-innovation approach)', jurisdiction: 'UK', clause: '6.1' },
      { title: 'GDPR (automated decision-making, Art 22)', jurisdiction: 'UK/EU', clause: '6.1' },
    ],
  },
  ISO_37001: {
    name: 'ISO 37001:2016 Anti-Bribery Management System',
    clauses: [
      { number: '4.1', title: 'Understanding the organisation and its context', description: 'Bribery risk context' },
      { number: '4.5', title: 'Bribery risk assessment', description: 'Assess bribery risks for functions and categories' },
      { number: '5.1', title: 'Leadership and commitment', description: 'Top management anti-bribery commitment' },
      { number: '5.2', title: 'Anti-bribery policy', description: 'Establish anti-bribery policy' },
      { number: '5.3', title: 'Anti-bribery compliance function', description: 'Appoint compliance officer' },
      { number: '7.2', title: 'Competence', description: 'Anti-bribery competence and training' },
      { number: '7.3', title: 'Awareness', description: 'Anti-bribery awareness for all personnel' },
      { number: '8.1', title: 'Operational planning and control', description: 'Anti-bribery controls and due diligence' },
      { number: '8.2', title: 'Due diligence', description: 'Due diligence on business associates' },
      { number: '8.7', title: 'Gifts, hospitality and donations', description: 'Controls on gifts and hospitality' },
      { number: '8.9', title: 'Raising concerns', description: 'Whistleblowing mechanism' },
      { number: '8.10', title: 'Investigating and dealing with bribery', description: 'Investigation procedure' },
      { number: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Monitor anti-bribery performance' },
      { number: '9.2', title: 'Internal audit', description: 'Conduct ABMS internal audits' },
      { number: '10.1', title: 'Nonconformity and corrective action', description: 'Address ABMS nonconformities' },
    ],
    documents: [
      { title: 'Anti-Bribery Policy', clause: '5.2', description: 'Zero-tolerance anti-bribery policy' },
      { title: 'Due Diligence Procedure', clause: '8.2', description: 'Third-party due diligence assessment' },
      { title: 'Gifts & Hospitality Register', clause: '8.7', description: 'Register for recording and approving gifts' },
      { title: 'Whistleblowing Procedure', clause: '8.9', description: 'Confidential reporting mechanism' },
      { title: 'Bribery Risk Assessment', clause: '4.5', description: 'Assessment by function and jurisdiction' },
    ],
    risks: [
      { title: 'Facilitation payments in high-risk jurisdictions', clause: '4.5', likelihood: 3, impact: 5, category: 'BRIBERY' },
      { title: 'Gifts/hospitality exceeding thresholds', clause: '8.7', likelihood: 3, impact: 3, category: 'GIFTS' },
      { title: 'Third-party agent bribery on behalf of organisation', clause: '8.2', likelihood: 2, impact: 5, category: 'SUPPLY_CHAIN' },
      { title: 'Failure to report suspected bribery', clause: '8.9', likelihood: 2, impact: 4, category: 'GOVERNANCE' },
    ],
    objectives: [
      { title: 'Anti-bribery training completion 100%', clause: '7.2', target: '100%', frequency: 'ANNUAL' },
      { title: 'Due diligence completion for all high-risk third parties', clause: '8.2', target: '100%', frequency: 'QUARTERLY' },
      { title: 'Gifts register 100% up to date', clause: '8.7', target: '100%', frequency: 'MONTHLY' },
    ],
    auditSchedule: [
      { area: 'Bribery Risk Assessment Review', clause: '4.5', frequency: 'ANNUAL', month: 2 },
      { area: 'Due Diligence & Third Parties', clause: '8.2', frequency: 'SEMI_ANNUAL', month: 5 },
      { area: 'Gifts & Hospitality Controls', clause: '8.7', frequency: 'ANNUAL', month: 8 },
      { area: 'Whistleblowing & Investigations', clause: '8.9-8.10', frequency: 'ANNUAL', month: 11 },
    ],
    legalRegister: [
      { title: 'UK Bribery Act 2010', jurisdiction: 'UK', clause: '6.1.3' },
      { title: 'US Foreign Corrupt Practices Act (FCPA)', jurisdiction: 'US', clause: '6.1.3' },
      { title: 'Dubai Anti-Corruption Law', jurisdiction: 'UAE', clause: '6.1.3' },
      { title: 'UAE Federal Decree-Law No. 20/2018 on Anti-Money Laundering', jurisdiction: 'UAE', clause: '6.1.3' },
    ],
  },
};

// Industry-specific risk additions
const INDUSTRY_RISKS: Record<string, { title: string; clause: string; likelihood: number; impact: number; category: string }[]> = {
  MANUFACTURING: [
    { title: 'Production line stoppage due to quality failure', clause: '8.1', likelihood: 3, impact: 4, category: 'OPERATIONAL' },
    { title: 'Raw material supply disruption', clause: '8.4', likelihood: 3, impact: 4, category: 'SUPPLY_CHAIN' },
  ],
  HEALTHCARE: [
    { title: 'Patient safety incident', clause: '8.1', likelihood: 2, impact: 5, category: 'CLINICAL' },
    { title: 'Medical device failure', clause: '8.5', likelihood: 2, impact: 5, category: 'PRODUCT' },
  ],
  FOOD_BEVERAGE: [
    { title: 'Food safety incident requiring recall', clause: '8.1', likelihood: 2, impact: 5, category: 'FOOD_SAFETY' },
    { title: 'Allergen labelling error', clause: '8.5', likelihood: 3, impact: 5, category: 'LABELLING' },
  ],
  CONSTRUCTION: [
    { title: 'Site accident — working at height', clause: '8.1', likelihood: 3, impact: 5, category: 'SAFETY' },
    { title: 'Building regulation non-compliance', clause: '6.1.3', likelihood: 2, impact: 4, category: 'COMPLIANCE' },
  ],
  TECHNOLOGY: [
    { title: 'Data breach — customer PII exposure', clause: '8.1', likelihood: 3, impact: 5, category: 'CYBER' },
    { title: 'Service availability below SLA', clause: '8.1', likelihood: 3, impact: 3, category: 'SERVICE' },
  ],
};

// Validation schemas
const headstartSchema = z.object({
  standards: z.array(z.enum([
    'ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_27001',
    'ISO_22000', 'ISO_50001', 'ISO_42001', 'ISO_37001',
  ])).min(1).max(8),
  industry: z.enum([
    'MANUFACTURING', 'HEALTHCARE', 'FOOD_BEVERAGE', 'CONSTRUCTION',
    'TECHNOLOGY', 'PROFESSIONAL_SERVICES', 'ENERGY', 'AUTOMOTIVE',
    'AEROSPACE', 'LOGISTICS', 'RETAIL', 'OTHER',
  ]),
  organisationSize: z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE']),
  certificationStatus: z.enum([
    'WORKING_TOWARDS', 'ALREADY_CERTIFIED', 'UPGRADING', 'MULTI_STANDARD',
  ]),
  organisationName: z.string().min(1).max(200).optional(),
});

// In-memory store for headstart assessments
const headstartStore = new Map<string, any>();

// POST / — Run headstart assessment
router.post('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = headstartSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() },
      });
    }

    const { standards, industry, organisationSize, certificationStatus, organisationName } = parsed.data;
    const userId = req.user!.id;
    const orgId = (req.user as any)!.organisationId || 'default';

    // Build headstart pack for each selected standard
    const standardPacks = standards.map((standard) => {
      const template = STANDARD_TEMPLATES[standard];
      if (!template) return null;

      // Get industry-specific risks
      const industryRisks = INDUSTRY_RISKS[industry] || [];

      // Adjust document set based on certification status
      let documents = [...template.documents];
      if (certificationStatus === 'ALREADY_CERTIFIED') {
        documents = documents.map((doc) => ({
          ...doc,
          description: `[IMPORT] ${doc.description} — import your existing document`,
        }));
      } else if (certificationStatus === 'UPGRADING') {
        documents = documents.map((doc) => ({
          ...doc,
          description: `[GAP CHECK] ${doc.description} — review against latest standard version`,
        }));
      }

      // Adjust complexity based on org size
      let riskCount = template.risks.length;
      if (organisationSize === 'MICRO') riskCount = Math.min(riskCount, 3);
      if (organisationSize === 'LARGE') riskCount = template.risks.length + industryRisks.length;

      const risks = organisationSize === 'LARGE'
        ? [...template.risks, ...industryRisks]
        : template.risks.slice(0, riskCount);

      return {
        standard,
        standardName: template.name,
        clauses: template.clauses,
        documents,
        risks,
        objectives: template.objectives,
        auditSchedule: template.auditSchedule,
        legalRegister: template.legalRegister,
        completenessScore: certificationStatus === 'ALREADY_CERTIFIED' ? 85 : 90,
      };
    }).filter(Boolean);

    // Calculate convergence savings for multi-standard
    let convergenceInfo = null;
    if (standards.length > 1) {
      const sharedClauses = [
        '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2',
        '7.1', '7.2', '7.5', '8.1', '9.1', '9.2', '9.3', '10.1', '10.2',
      ];
      const totalClausesWithoutConvergence = standards.reduce((sum, s) => {
        return sum + (STANDARD_TEMPLATES[s]?.clauses.length || 0);
      }, 0);
      const savedClauses = sharedClauses.length * (standards.length - 1);
      const efficiencyGain = Math.round((savedClauses / totalClausesWithoutConvergence) * 100);

      convergenceInfo = {
        sharedClauseCount: sharedClauses.length,
        standardsCovered: standards.length,
        clausesSaved: savedClauses,
        efficiencyGain: `${efficiencyGain}%`,
        message: `By using Nexara's Standards Convergence Engine, ${savedClauses} shared Annex SL clauses are satisfied once across ${standards.length} standards — reducing compliance workload by approximately ${efficiencyGain}%.`,
      };
    }

    const id = randomUUID();
    const referenceNumber = `HS-${new Date().getFullYear()}-${String(headstartStore.size + 1).padStart(3, '0')}`;

    const assessment = {
      id,
      referenceNumber,
      organisationId: orgId,
      organisationName: organisationName || null,
      standards,
      industry,
      organisationSize,
      certificationStatus,
      standardPacks,
      convergenceInfo,
      totalDocuments: standardPacks.reduce((sum: number, p: any) => sum + p.documents.length, 0),
      totalRisks: standardPacks.reduce((sum: number, p: any) => sum + p.risks.length, 0),
      totalObjectives: standardPacks.reduce((sum: number, p: any) => sum + p.objectives.length, 0),
      totalAudits: standardPacks.reduce((sum: number, p: any) => sum + p.auditSchedule.length, 0),
      overallCompletenessScore: certificationStatus === 'ALREADY_CERTIFIED' ? 85 : 90,
      status: 'COMPLETE',
      generatedAt: new Date().toISOString(),
      generatedBy: userId,
    };

    headstartStore.set(id, assessment);

    logger.info('Headstart assessment generated', {
      id,
      standards,
      industry,
      organisationSize,
      certificationStatus,
      totalDocuments: assessment.totalDocuments,
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to generate headstart assessment', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate headstart assessment' },
    });
  }
});

// GET / — List headstart assessments
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const items = Array.from(headstartStore.values())
      .filter((a) => a.organisationId === ((req.user as any)!.organisationId || 'default'))
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
    const start = (page - 1) * limit;

    res.json({
      success: true,
      data: {
        items: items.slice(start, start + limit).map(({ standardPacks, ...rest }: Record<string, unknown>) => rest),
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list headstart assessments', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list headstart assessments' },
    });
  }
});

// GET /standards — List available standards and their template info
router.get('/standards', async (_req, res: Response) => {
  try {
    const standards = Object.entries(STANDARD_TEMPLATES).map(([key, template]) => ({
      code: key,
      name: template.name,
      clauseCount: template.clauses.length,
      documentCount: template.documents.length,
      riskCount: template.risks.length,
      objectiveCount: template.objectives.length,
    }));

    res.json({ success: true, data: standards });
  } catch (error) {
    logger.error('Failed to list headstart standards', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list available standards' } });
  }
});

// GET /:id — Get headstart assessment detail
router.get('/:id', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const assessment = headstartStore.get(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Headstart assessment not found' },
      });
    }

    if (assessment.organisationId !== ((req.user as any)!.organisationId || 'default')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to get headstart assessment', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get headstart assessment' },
    });
  }
});

export default router;
