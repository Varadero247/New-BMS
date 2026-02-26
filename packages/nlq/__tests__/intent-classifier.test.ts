// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { classifyIntent } from '../src/onboarding/intent-classifier';
import { searchKnowledgeBase, ONBOARDING_KNOWLEDGE_BASE } from '../src/onboarding/knowledge-base';
import type { OnboardingIntent, ConfidenceLevel } from '../src/onboarding/types';

// ---------------------------------------------------------------------------
// Section 1: Return shape validation (6 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — return shape', () => {
  it('returns an object', () => {
    const result = classifyIntent('hello');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('returns an object with intent property', () => {
    const result = classifyIntent('hello');
    expect(result).toHaveProperty('intent');
  });

  it('returns an object with confidence property', () => {
    const result = classifyIntent('hello');
    expect(result).toHaveProperty('confidence');
  });

  it('intent is always a string', () => {
    const result = classifyIntent('some random text xyz');
    expect(typeof result.intent).toBe('string');
  });

  it('confidence is always HIGH, MEDIUM or LOW', () => {
    const result = classifyIntent('some text');
    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(result.confidence);
  });

  it('is deterministic for the same input', () => {
    const r1 = classifyIntent('iso 9001 standard clause');
    const r2 = classifyIntent('iso 9001 standard clause');
    expect(r1.intent).toBe(r2.intent);
    expect(r1.confidence).toBe(r2.confidence);
  });
});

// ---------------------------------------------------------------------------
// Section 2: GENERAL_CHAT for unrecognised input (52 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — GENERAL_CHAT fallback', () => {
  const generalCases: string[] = [
    '',
    '   ',
    '\t\n',
    'xyz',
    'hello',
    'hi there',
    'good morning',
    'thank you',
    'thanks',
    'ok',
    'yes',
    'no',
    'maybe',
    '123',
    '!@#$%',
    'αβγδ',
    'привет',
    '你好',
    '  spaces  before  ',
    'A',
    'The',
    'And',
    'lorum ipsum dolor sit amet consectetur',
    'completely unrelated sentence about weather',
    'the quick brown fox jumps over the lazy dog',
    'this message has nothing to do with the system',
    'my favorite color is blue',
    'can I order pizza',
    'what is the capital of France',
    'who invented the telephone',
    'today is a sunny day',
    'I like coffee in the morning',
    'the train departs at noon',
    'please bring me a glass of water',
    'the movie was very entertaining',
    'football is popular worldwide',
    'I enjoy reading novels',
    'the garden looks beautiful today',
    'music makes everything better',
    'travelling is my hobby',
    'I finished the book last night',
    'the sky is clear and blue',
    'dinner was delicious tonight',
    'the cat sat on the mat',
    'winter is coming soon',
    'I went for a walk this morning',
    'the market opens at nine',
    'photography is a creative art',
    'the library closes at eight',
    'cycling is good exercise',
    'the park is crowded today',
    'painting relaxes my mind',
  ];

  it.each(generalCases)('classifies "%s" as GENERAL_CHAT', (message) => {
    expect(classifyIntent(message).intent).toBe('GENERAL_CHAT');
  });

  it('gives LOW confidence for empty string', () => {
    expect(classifyIntent('').confidence).toBe('LOW');
  });

  it('gives LOW confidence for unrelated text', () => {
    expect(classifyIntent('the quick brown fox').confidence).toBe('LOW');
  });
});

// ---------------------------------------------------------------------------
// Section 3: QUESTION_STANDARD intent (90 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — QUESTION_STANDARD', () => {
  // ISO number pattern
  const isoMessages = [
    'Tell me about iso 9001',
    'What does ISO 9001 require',
    'I need help with ISO 14001',
    'Does Nexara implement ISO 45001',
    'ISO 27001 certification process',
    'ISO9001 standard documentation',
    'iso 13485 medical devices standard',
    'ISO 50001 energy management',
    'iso 22000 food safety standard',
    'ISO 31000 risk management',
    'explain iso 9001 to me',
    'we are targeting iso 14001',
    'iso 45001 requirements for construction',
    'getting certified to iso 9001',
    'ISO 27001 controls and annexes',
  ];
  it.each(isoMessages)('classifies "%s" as QUESTION_STANDARD', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_STANDARD');
  });

  // IATF pattern
  const iatfMessages = [
    'What is IATF 16949',
    'iatf requirements for automotive',
    'IATF certification timeline',
    'how to get iatf certified',
    'explain iatf 16949 clauses',
    'iatf automotive quality standard',
    'IATF 16949 documentation requirements',
    'our customer requires iatf',
    'iatf vs iso 9001 difference',
    'IATF audit preparation',
  ];
  it.each(iatfMessages)('classifies "%s" as QUESTION_STANDARD', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_STANDARD');
  });

  // BRCGS pattern
  const brcgsMessages = [
    'What is BRCGS',
    'brcgs food safety standard',
    'BRCGS certification requirements',
    'how does brcgs audit work',
    'brcgs issue 9 requirements',
    'BRCGS unannounced audit',
    'getting brcgs certified',
    'brcgs grading system',
    'BRCGS fundamental requirements',
    'explain brcgs to me',
  ];
  it.each(brcgsMessages)('classifies "%s" as QUESTION_STANDARD', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_STANDARD');
  });

  // standard keyword
  const standardMessages = [
    'which standard should I choose',
    'what standard covers food safety',
    'explain the standard requirements',
    'the standard requires documented information',
    'standard certification process',
    'quality standard overview',
    'environmental standard requirements',
    'standard for occupational health',
    'information security standard',
    'automotive quality standard',
    'standard audit checklist',
  ];
  it.each(standardMessages)('classifies "%s" as QUESTION_STANDARD', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_STANDARD');
  });

  // certif pattern (certification, certify, certified, etc.)
  const certifMessages = [
    'how do we get certified',
    'what is the certification process',
    'how long does certification take',
    'certification audit preparation',
    'certify our QMS',
    'certification body selection',
    'getting certified to the standard',
    'certification requirements checklist',
    're-certification process',
    'surveillance certification audit',
  ];
  it.each(certifMessages)('classifies "%s" as QUESTION_STANDARD', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_STANDARD');
  });

  // clause keyword
  const clauseMessages = [
    'what does clause 4 require',
    'clause 6 planning requirements',
    'explain clause 8 of the standard',
    'clause 9 performance evaluation',
    'clause 10 continual improvement',
    'mandatory clause requirements',
    'which clause covers CAPA',
    'clause requirements for documentation',
    'understanding each clause',
    'clause by clause guidance',
  ];
  it.each(clauseMessages)('classifies "%s" as QUESTION_STANDARD', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_STANDARD');
  });

  // requirement keyword
  const requirementMessages = [
    'what are the requirements for ISO certification',
    'legal requirements for the organisation',
    'mandatory requirements for the system',
    'list all the requirements',
    'requirements for documented information',
    'customer requirements in quality standard',
    'specific requirements for our industry',
    'meeting all requirements before audit',
    'requirements checklist for managers',
    'understanding requirements of the clause',
    'requirements mapping exercise',
    'new requirements from the regulator',
    'third-party requirements overview',
    'requirements for annual surveillance',
    'reviewing all current requirements',
  ];
  it.each(requirementMessages)('classifies "%s" as QUESTION_STANDARD', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_STANDARD');
  });
});

// ---------------------------------------------------------------------------
// Section 4: QUESTION_MODULE intent (90 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — QUESTION_MODULE', () => {
  const moduleMessages = [
    'how do I use the module',
    'which module should I start with',
    'module configuration options',
    'tell me about each available module',
    'what module options are included',
    'module access control settings',
    'disable a module for a user',
    'module subscription and licensing',
    'can I add a custom module',
    'module dashboard overview',
  ];
  it.each(moduleMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const hsSafetyMessages = [
    'how does the health and safety module work',
    'health safety incident reporting',
    'health and safety dashboard',
    'tell me about health & safety features',
    'health and safety risk assessment',
    'health safety training records',
    'health and safety audit management',
    'using health safety module for inspections',
    'health and safety legislation overview',
    'health & safety near miss reporting',
  ];
  it.each(hsSafetyMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const envMessages = [
    'tell me about the environmental module',
    'environment management features',
    'environmental aspects and impacts',
    'environmental monitoring in the system',
    'environmental legal register',
    'environmental objectives tracking',
    'environmental event recording',
    'environment audit scheduling',
    'environmental dashboard overview',
    'using environment module for waste tracking',
  ];
  it.each(envMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const qualityMessages = [
    'how does the quality module work',
    'quality management features',
    'quality control dashboard',
    'quality nonconformance recording',
    'quality improvement tracking',
    'quality assurance workflows',
    'quality metrics and KPIs',
    'quality audit management',
    'quality system documentation',
    'tell me about quality management',
  ];
  it.each(qualityMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const incidentMessages = [
    'how do I record an incident',
    'incident reporting workflow',
    'incident investigation process',
    'incident dashboard and analytics',
    'incident severity classification',
    'managing each incident in the system',
    'incident root cause analysis',
    'incident corrective actions',
    'incident notification settings',
    'incident reporting template',
  ];
  it.each(incidentMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const riskMessages = [
    'how does risk management work in nexara',
    'risk register features',
    'risk assessment process',
    'risk scoring and matrix',
    'risk treatment options',
    'managing risk across departments',
    'risk reporting and dashboard',
    'risk review schedule',
    'risk escalation workflow',
    'risk tolerance settings',
  ];
  it.each(riskMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const auditMessages = [
    'how does the audit module work',
    'audit scheduling features',
    'audit checklist management',
    'internal audit programme',
    'audit finding recording',
    'audit nonconformance tracking',
    'audit reporting and close-out',
    'managing audit teams',
    'audit dashboard overview',
    'supplier audit features',
  ];
  it.each(auditMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const hrMessages = [
    'tell me about the hr module',
    'hr employee management features',
    'hr leave management',
    'hr training records',
    'hr performance reviews',
    'hr role management',
    'hr document storage',
    'hr reporting features',
    'hr payroll integration',
    'hr dashboard overview',
  ];
  it.each(hrMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });

  const infosecMessages = [
    'how does infosec module work',
    'infosec risk assessment features',
    'infosec control management',
    'infosec incident handling',
    'infosec asset register',
    'infosec audit scheduling',
    'infosec dashboard',
    'infosec policy management',
    'infosec training records',
    'infosec reporting overview',
  ];
  it.each(infosecMessages)('classifies "%s" as QUESTION_MODULE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_MODULE');
  });
});

// ---------------------------------------------------------------------------
// Section 5: QUESTION_SETUP intent (70 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — QUESTION_SETUP', () => {
  const setupMessages = [
    'how do I set up the system',
    'set up my organisation',
    'system setup guide',
    'setup wizard overview',
    'set up the platform for my team',
    'how to set up nexara',
    'set up user accounts',
    'set up email notifications',
    'set up approval workflows',
    'set up automated workflows',
    'how to set up integrations',
    'step by step setup guide',
  ];
  it.each(setupMessages)('classifies "%s" as QUESTION_SETUP', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_SETUP');
  });

  const configurMessages = [
    'how to configure the system',
    'configure notification settings',
    'configure user roles',
    'system configuration options',
    'configure approval workflows',
    'configuring reference numbers',
    'configure email alerts',
    'configuration best practices',
    'configure data retention',
    'configuring SSO settings',
  ];
  it.each(configurMessages)('classifies "%s" as QUESTION_SETUP', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_SETUP');
  });

  const installMessages = [
    'how do I install the system',
    'install the instant start pack',
    'installation guide for nexara',
    'installing on a new device',
    'install templates for our industry',
    'install configuration pack',
    'installation hardware specifications',
    'installing on mobile devices',
    'how to install the browser extension',
    'install and activate the pack',
  ];
  it.each(installMessages)('classifies "%s" as QUESTION_SETUP', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_SETUP');
  });

  const onboardMessages = [
    'onboarding new users to the system',
    'onboarding process overview',
    'onboarding guide for managers',
    'how to onboard a new department',
    'onboarding checklist for admins',
    'onboarding timeline for implementation',
    'onboarding assistant features',
    'onboarding wizard walkthrough',
    'onboarding training sessions',
    'new organisation onboarding steps',
  ];
  it.each(onboardMessages)('classifies "%s" as QUESTION_SETUP', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_SETUP');
  });

  const getStartMessages = [
    'how do I get started with nexara',
    'get started guide',
    'how to get started quickly',
    'get started using the platform',
    'get started after installation',
    'how do we begin the implementation',
    'get started with data migration',
    'get started with system administration',
    'where do I get started',
    'help me get started',
  ];
  it.each(getStartMessages)('classifies "%s" as QUESTION_SETUP', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_SETUP');
  });

  const wizardMessages = [
    'where is the setup wizard',
    'using the wizard to configure SSO',
    'wizard for SSO configuration',
    'onboarding wizard steps',
    'SSO wizard guide',
    'wizard overview and walkthrough',
    'instant start wizard',
    'setup wizard configuration',
  ];
  it.each(wizardMessages)('classifies "%s" as QUESTION_SETUP', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_SETUP');
  });
});

// ---------------------------------------------------------------------------
// Section 6: QUESTION_COMPLIANCE intent (60 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — QUESTION_COMPLIANCE', () => {
  const compliMessages = [
    'how do we demonstrate compliance',
    'compliance tracking features',
    'compliance dashboard overview',
    'compliance status report',
    'overall compliance monitoring approach',
    'compliance calendar management',
    'compliance scoring system',
    'compliance document management',
    'compliance monitoring features',
    'regulatory compliance tracking',
    'ongoing compliance programme',
    'compliance evidence submission',
  ];
  it.each(compliMessages)('classifies "%s" as QUESTION_COMPLIANCE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_COMPLIANCE');
  });

  const gapMessages = [
    'how does a gap analysis work',
    'conducting a gap analysis',
    'gap between current state and target',
    'closing the gap before the deadline',
    'gap analysis results interpretation',
    'gap scoring explanation',
    'how to reduce the identified gap',
    'addressing the identified gap',
    'gap remediation plan',
    'gap report summary',
  ];
  it.each(gapMessages)('classifies "%s" as QUESTION_COMPLIANCE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_COMPLIANCE');
  });

  const conformMessages = [
    'how to demonstrate conformance',
    'conformance evidence collection',
    'conformance deviation tracking',
    'maintaining conformance goals',
    'conformance level comparison',
    'achieving full conformance',
    'conformance level assessment',
    'conformance scoring report',
    'ensuring conformance across sites',
    'conformance monitoring schedule',
  ];
  it.each(conformMessages)('classifies "%s" as QUESTION_COMPLIANCE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_COMPLIANCE');
  });

  const assessMessages = [
    'how does the assessment work',
    'assessment scoring explained',
    'assessment report features',
    'running an assessment in nexara',
    'assessment dashboard overview',
    'assessment completion tracking',
    'how to interpret assessment results',
    'assessment templates available',
    'assessment scheduling features',
    'self-assessment completion tracking',
  ];
  it.each(assessMessages)('classifies "%s" as QUESTION_COMPLIANCE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_COMPLIANCE');
  });

  const readinessMessages = [
    'what is our current readiness level',
    'readiness assessment for the period',
    'readiness score meaning',
    'improving our readiness level',
    'readiness report generation',
    'go-live readiness checklist',
    'readiness preparation overview',
    'readiness dashboard overview',
    'how to improve readiness score',
    'readiness criteria explained',
    'readiness gap scoring',
    'periodic readiness review',
  ];
  it.each(readinessMessages)('classifies "%s" as QUESTION_COMPLIANCE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_COMPLIANCE');
  });
});

// ---------------------------------------------------------------------------
// Section 7: REQUEST_CHECKLIST intent (60 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — REQUEST_CHECKLIST', () => {
  const checklistMessages = [
    'where is the pre-departure checklist',
    'daily inspection checklist',
    'create a custom checklist',
    'monthly review checklist',
    'quarterly checklist review',
    'digital checklist features',
    'recurring checklist automation',
    'checklist for new employees',
    'printable checklist format',
    'checklist item tracking',
    'interactive checklist builder',
    'periodic checklist submission',
  ];
  it.each(checklistMessages)('classifies "%s" as REQUEST_CHECKLIST', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_CHECKLIST');
  });

  const listOfMessages = [
    'give me a list of integration options',
    'list of supported file formats',
    'list of available report types',
    'list of notification settings',
    'provide a list of KPIs',
    'list of available languages',
    'list of data export formats',
    'list of supported browsers',
    'list of available currencies',
    'list of supported timezones',
    'show a list of billing options',
    'list of available themes',
  ];
  it.each(listOfMessages)('classifies "%s" as REQUEST_CHECKLIST', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_CHECKLIST');
  });

  const stepsMessages = [
    'steps for completing the workflow',
    'steps for inviting new users',
    'steps for adding a new record',
    'steps for generating reports',
    'steps for exporting data',
    'key steps in the process',
    'mandatory steps for new accounts',
    'steps for uploading files',
    'steps for scheduling notifications',
    'follow these steps to proceed',
    'summary of the key steps',
    'numbered steps for new joiners',
  ];
  it.each(stepsMessages)('classifies "%s" as REQUEST_CHECKLIST', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_CHECKLIST');
  });

  const howDoIMessages = [
    'how do I view my dashboard',
    'how do I add a new user',
    'how do I export data to a file',
    'how do I generate a report',
    'how do I invite team members',
    'how do I update my profile',
    'how do I change my password',
    'how do I access archived records',
    'how do I navigate the platform',
    'how do I switch between views',
    'how do I adjust display settings',
    'how do I download my data',
  ];
  it.each(howDoIMessages)('classifies "%s" as REQUEST_CHECKLIST', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_CHECKLIST');
  });

  const whatDoINeedMessages = [
    'what do I need to export data',
    'what do I need to invite users',
    'what do I need to generate a report',
    'what do I need to view archived records',
    'what do I need to create a new account',
    'what do I need to update billing',
    'what do I need to change the timezone',
    'what do I need to switch languages',
    'what do I need to view the dashboard',
    'what do I need to upload files',
    'what do I need to enable notifications',
    'what do I need to adjust preferences',
  ];
  it.each(whatDoINeedMessages)('classifies "%s" as REQUEST_CHECKLIST', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_CHECKLIST');
  });
});

// ---------------------------------------------------------------------------
// Section 8: REQUEST_TEMPLATE intent (50 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — REQUEST_TEMPLATE', () => {
  const templateMessages = [
    'where can I find a procedure template',
    'do you have a corrective action template',
    'view a policy template',
    'audit report template download',
    'corrective action plan template',
    'policy template examples',
    'CAPA template for nonconformances',
    'management review template',
    'procedure template library',
    'supplier evaluation template',
    'operational procedures template',
    'work instruction template library',
  ];
  it.each(templateMessages)('classifies "%s" as REQUEST_TEMPLATE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_TEMPLATE');
  });

  const formMessages = [
    'where is the management review form',
    'risk assessment form template',
    'supplier evaluation form',
    'form for recording nonconformances',
    'inspection form download',
    'corrective action form',
    'corrective action tracking form',
    'employee expense claim form',
    'customer complaint form',
    'general enquiry form',
    'new supplier registration form',
    'annual review declaration form',
  ];
  it.each(formMessages)('classifies "%s" as REQUEST_TEMPLATE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_TEMPLATE');
  });

  const documentMessages = [
    'where is the document library',
    'document management features',
    'document control procedures',
    'mandatory document register',
    'document version control',
    'document approval workflow',
    'document storage and retrieval',
    'document retention policy',
    'document numbering system',
    'document library overview',
    'document archiving features',
    'document index and catalogue',
  ];
  it.each(documentMessages)('classifies "%s" as REQUEST_TEMPLATE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_TEMPLATE');
  });

  const downloadMessages = [
    'how do I download a template',
    'download the progress report',
    'download user import template',
    'download the inspection summary',
    'download the procedure template',
    'download the corrective action form',
    'download available reports',
    'download the risk matrix template',
    'download incident report template',
    'download the operational report',
    'download the supplier template',
    'download the annual review form',
  ];
  it.each(downloadMessages)('classifies "%s" as REQUEST_TEMPLATE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_TEMPLATE');
  });

  const exampleDocMessages = [
    'show me an example document layout',
    'example document for management review',
  ];
  it.each(exampleDocMessages)('classifies "%s" as REQUEST_TEMPLATE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_TEMPLATE');
  });
});

// ---------------------------------------------------------------------------
// Section 9: REQUEST_EXAMPLE intent (60 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — REQUEST_EXAMPLE', () => {
  const exampleMessages = [
    'give me an example of a CAPA',
    'example of a corrective action plan',
    'example management review agenda',
    'example supplier questionnaire format',
    'example business continuity plan',
    'example executive summary report',
    'example of a work instruction',
    'example board meeting report',
    'example process flow diagram',
    'example progress tracking sheet',
    'example of an improvement plan',
    'example briefing note format',
  ];
  it.each(exampleMessages)('classifies "%s" as REQUEST_EXAMPLE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_EXAMPLE');
  });

  const sampleMessages = [
    'sample management review minutes',
    'sample training plan outline',
    'sample CAPA workflow',
    'sample supplier questionnaire',
    'sample corrective action report',
    'sample board report summary',
    'sample process improvement plan',
    'sample meeting agenda format',
    'sample project closure report',
    'sample performance review format',
    'sample briefing note',
    'sample introduction letter',
  ];
  it.each(sampleMessages)('classifies "%s" as REQUEST_EXAMPLE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_EXAMPLE');
  });

  const showMeMessages = [
    'show me the dashboard',
    'show me the reporting features',
    'show me an example workflow',
    'show me how the screens look',
    'show me available integrations',
    'show me the data migration process',
    'show me how users are managed',
    'show me the approval workflow',
    'show me the reporting view',
    'show me the main navigation',
    'show me the user profile page',
    'show me the analytics overview',
  ];
  it.each(showMeMessages)('classifies "%s" as REQUEST_EXAMPLE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_EXAMPLE');
  });

  const demonstrateMessages = [
    'demonstrate how SSO works',
    'can you demonstrate the workflow',
    'demonstrate data import process',
    'demonstrate report generation',
    'demonstrate the approval process',
    'demonstrate the CAPA workflow',
    'demonstrate the main dashboard',
    'demonstrate the notification system',
    'demonstrate the export functionality',
    'demonstrate the supplier portal',
    'demonstrate the calendar view',
    'demonstrate the analytics panel',
  ];
  it.each(demonstrateMessages)('classifies "%s" as REQUEST_EXAMPLE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_EXAMPLE');
  });

  const howDoesMessages = [
    'how does data migration work',
    'how does SSO work in nexara',
    'how does the approval workflow work',
    'how does the reporting engine work',
    'how does the notification system work',
    'how does the billing system work',
    'how does the export process work',
    'how does the CAPA workflow work',
    'how does the email integration work',
    'how does the supplier portal work',
    'how does the analytics engine work',
    'how does the calendar synchronisation work',
  ];
  it.each(howDoesMessages)('classifies "%s" as REQUEST_EXAMPLE', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_EXAMPLE');
  });
});

// ---------------------------------------------------------------------------
// Section 10: REPORT_PROBLEM intent (80 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — REPORT_PROBLEM', () => {
  const errorMessages = [
    'I am getting an error on the login page',
    'error message when saving an incident',
    'database error after migration',
    'error 500 on the dashboard',
    'error loading the module',
    'error in the CSV import',
    'unexpected error occurred',
    'authentication error message',
    'validation error on the form',
    'error connecting to the database',
  ];
  it.each(errorMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });

  const bugMessages = [
    'I think I found a bug',
    'there is a bug in the report',
    'reporting a bug in the dashboard',
    'bug with the date picker',
    'bug when saving a risk assessment',
    'bug in the user import',
    'software bug preventing login',
    'known bug workaround needed',
    'bug with notification emails',
    'bug in the module configuration',
  ];
  it.each(bugMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });

  const brokenMessages = [
    'the login page is broken',
    'the report export is broken',
    'the dashboard is broken after update',
    'something is broken with notifications',
    'the workflow is broken',
    'the import tool is broken',
    'the SSO integration is broken',
    'module configuration is broken',
    'the audit scheduler is broken',
    'the API integration is broken',
  ];
  it.each(brokenMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });

  const notWorkingMessages = [
    'the login is not working',
    'SSO is not working properly',
    'notifications are not working',
    'the export feature is not working',
    'report generation is not working',
    'the mobile app is not working',
    'user import is not working',
    'the dashboard is not working',
    'email notifications are not working',
    'the calendar sync is not working',
  ];
  it.each(notWorkingMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });

  const cantMessages = [
    "I can't log in to my account",
    "can't access the dashboard",
    "can't save my changes",
    "can't generate the report",
    "can't import the CSV file",
    "cannot complete the assessment",
    "cannot see my organisations data",
    "cannot configure SSO settings",
    "cannot delete the record",
    "cannot access the module",
  ];
  it.each(cantMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });

  const failMessages = [
    'the login keeps failing',
    'CSV import fails every time',
    'data migration failed',
    'audit report failed to generate',
    'system failure during migration',
    'failed to connect to SSO provider',
    'report generation failed',
    'failed authentication attempt',
    'import failed with no error message',
    'the backup failed to complete',
  ];
  it.each(failMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });

  const problemMessages = [
    'I am having a problem with the login',
    'performance problem with the dashboard',
    'problem with data import',
    'reporting a problem I encountered',
    'problem accessing certain records',
    'authentication problem',
    'display problem on mobile',
    'problem with email notifications',
    'problem with CSV export format',
    'technical problem with the login',
  ];
  it.each(problemMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });

  const issueMessages = [
    'reporting an issue with SSO login',
    'issue with the data migration tool',
    'there is an issue with notifications',
    'access issue for certain users',
    'performance issue on the dashboard',
    'issue with report generation',
    'login issue since the update',
    'system issue affecting multiple users',
    'issue with module configuration',
    'urgent issue with data export',
  ];
  it.each(issueMessages)('classifies "%s" as REPORT_PROBLEM', (message) => {
    expect(classifyIntent(message).intent).toBe('REPORT_PROBLEM');
  });
});

// ---------------------------------------------------------------------------
// Section 11: REQUEST_HUMAN intent (70 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — REQUEST_HUMAN', () => {
  const humanMessages = [
    'I would like to speak to a human',
    'can I talk to a human agent',
    'please connect me to a human',
    'I need human assistance',
    'human support please',
    'stop the bot and connect me to a human',
    'is there a human I can talk to',
    'human agent request',
    'transfer me to a human',
    'I prefer to speak with a human',
  ];
  it.each(humanMessages)('classifies "%s" as REQUEST_HUMAN', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_HUMAN');
  });

  const supportMessages = [
    'I need technical support',
    'contact support team please',
    'support ticket for this issue',
    'how do I reach support',
    'customer support contact details',
    'support team availability',
    'request support for my issue',
    'enterprise support options',
    'premium support plan details',
    'support response time SLA',
  ];
  it.each(supportMessages)('classifies "%s" as REQUEST_HUMAN', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_HUMAN');
  });

  const callMessages = [
    'can I schedule a call with your team',
    'I want to call customer service',
    'call me back please',
    'phone call support option',
    'scheduled a discovery call',
    'can someone call me to help',
    'call our account manager',
    'request a phone call please',
    'schedule a training call',
    'book a support call',
  ];
  it.each(callMessages)('classifies "%s" as REQUEST_HUMAN', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_HUMAN');
  });

  const speakToMessages = [
    'I want to speak to your team',
    'speak to an expert please',
    'speak to someone about implementation',
    'can I speak to a consultant',
    'I need to speak to support',
    'speak to our account manager',
    'speak to a technical expert',
    'speak to customer success team',
    'can I speak to someone immediately',
    'please arrange for me to speak to a person',
  ];
  it.each(speakToMessages)('classifies "%s" as REQUEST_HUMAN', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_HUMAN');
  });

  const contactMessages = [
    'how do I contact nexara support',
    'contact the support team',
    'contact details for implementation help',
    'need to contact someone urgently',
    'contact us form submission',
    'how to contact our account manager',
    'contact information for billing',
    'contact for enterprise queries',
    'contact sales team',
    'how do I contact emergency support',
  ];
  it.each(contactMessages)('classifies "%s" as REQUEST_HUMAN', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_HUMAN');
  });

  const helpDeskMessages = [
    'where is the help desk',
    'help desk contact details',
    'raise a help desk ticket',
    'help desk opening hours',
    'help desk escalation process',
    'help desk priority levels',
    'access the help desk portal',
    'help desk response times',
    'help desk for critical issues',
    'help desk self-service portal',
  ];
  it.each(helpDeskMessages)('classifies "%s" as REQUEST_HUMAN', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_HUMAN');
  });

  const supportTicketMessages = [
    'how do I raise a support ticket',
    'create a support ticket for this issue',
    'support ticket tracking system',
    'check status of my support ticket',
    'support ticket escalation process',
    'support ticket priority levels',
    'log a support ticket',
    'support ticket for billing query',
    'raise a support ticket with details',
    'support ticket resolution time',
  ];
  it.each(supportTicketMessages)('classifies "%s" as REQUEST_HUMAN', (message) => {
    expect(classifyIntent(message).intent).toBe('REQUEST_HUMAN');
  });
});

// ---------------------------------------------------------------------------
// Section 12: QUESTION_FEATURE intent (50 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — QUESTION_FEATURE', () => {
  const featureMessages = [
    'what feature does the system include',
    'list the feature options available',
    'new feature in the latest release',
    'feature comparison between plans',
    'advanced feature for enterprise users',
    'feature request process',
    'upcoming feature on the roadmap',
    'reporting feature overview',
    'analytics feature available',
    'mobile feature of nexara',
  ];
  it.each(featureMessages)('classifies "%s" as QUESTION_FEATURE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_FEATURE');
  });

  const capabilityMessages = [
    'what are the capabilities of nexara',
    'capability overview of the platform',
    'capabilities comparison between tiers',
    'API capabilities for integration',
    'reporting capabilities in the system',
    'analytics capability description',
    'capabilities for food safety management',
    'AI capability details',
    'multi-site capabilities',
    'capabilities for large enterprises',
  ];
  it.each(capabilityMessages)('classifies "%s" as QUESTION_FEATURE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_FEATURE');
  });

  const whatCanMessages = [
    'what can nexara do for our business',
    'what can the system do with my data',
    'what can I do with the analytics panel',
    'what can I customise in the platform',
    'what can the AI assistant help with',
    'what can I integrate with nexara',
    'what can I automate in the system',
    'what can I report on in nexara',
    'what can I do with the API',
    'what can the mobile app do',
  ];
  it.each(whatCanMessages)('classifies "%s" as QUESTION_FEATURE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_FEATURE');
  });

  const doesNexaraMessages = [
    'does nexara integrate with SAP',
    'does nexara offer multi-tenancy',
    'does nexara have an API',
    'does ims offer offline mode',
    'does nexara have mobile apps',
    'does nexara offer SSO integration',
    'does ims have a REST API',
    'does nexara integrate with Xero',
    'does nexara enable multiple languages',
    'does ims provide dashboards',
  ];
  it.each(doesNexaraMessages)('classifies "%s" as QUESTION_FEATURE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_FEATURE');
  });

  const canNexaraMessages = [
    'can nexara handle multi-site operations',
    'can ims generate custom reports',
    'can it integrate with BambooHR',
    'can you connect to Workday',
    'can nexara send automated reminders',
    'can ims handle 10000 users',
    'can nexara enable offline access',
    'can it manage supplier relationships',
    'can nexara track expiry dates',
    'can you provide custom branding',
  ];
  it.each(canNexaraMessages)('classifies "%s" as QUESTION_FEATURE', (message) => {
    expect(classifyIntent(message).intent).toBe('QUESTION_FEATURE');
  });
});

// ---------------------------------------------------------------------------
// Section 13: Confidence level tests (80 tests)
// ---------------------------------------------------------------------------
describe('classifyIntent — confidence levels', () => {
  describe('HIGH confidence (score >= 6)', () => {
    const highConfidenceCases: Array<[string, OnboardingIntent]> = [
      // QUESTION_STANDARD weight=3: need 2+ matches
      ['iso 9001 certification standard', 'QUESTION_STANDARD'],
      ['iso 14001 requirement clause', 'QUESTION_STANDARD'],
      ['iso 27001 standard clause requirements', 'QUESTION_STANDARD'],
      ['iatf 16949 certification standard', 'QUESTION_STANDARD'],
      ['brcgs certification standard requirements', 'QUESTION_STANDARD'],
      // REQUEST_HUMAN weight=4: need 2+ matches
      ['I need human support now', 'REQUEST_HUMAN'],
      ['contact the support team urgently', 'REQUEST_HUMAN'],
      ['human agent via the help desk', 'REQUEST_HUMAN'],
      ['speak to support contact', 'REQUEST_HUMAN'],
      // REPORT_PROBLEM weight=3: need 2+ matches
      ['error bug in the system', 'REPORT_PROBLEM'],
      ['cannot access this is a problem', 'REPORT_PROBLEM'],
      ['broken and not working at all', 'REPORT_PROBLEM'],
      ['critical error causing system failure', 'REPORT_PROBLEM'],
      // QUESTION_MODULE weight=2: need 3+ matches
      ['quality module incident risk audit', 'QUESTION_MODULE'],
      ['health and safety incident audit module', 'QUESTION_MODULE'],
      ['environment quality module incident management', 'QUESTION_MODULE'],
      ['risk audit module for health and safety', 'QUESTION_MODULE'],
      ['infosec module for risk and audit', 'QUESTION_MODULE'],
      ['environment module quality incident audit', 'QUESTION_MODULE'],
      // More QUESTION_STANDARD HIGH confidence
      ['iatf 16949 mandatory clause requirements', 'QUESTION_STANDARD'],
      ['brcgs certification clause requirements', 'QUESTION_STANDARD'],
      ['iso 9001 standard requirements clause', 'QUESTION_STANDARD'],
      ['standard certification requirements for audit', 'QUESTION_STANDARD'],
      ['certification requirements and standard clauses', 'QUESTION_STANDARD'],
    ];

    it.each(highConfidenceCases)('"%s" has HIGH confidence for %s intent', (message, _intent) => {
      expect(classifyIntent(message).confidence).toBe('HIGH');
    });
  });

  describe('MEDIUM confidence (score 3-5)', () => {
    const mediumConfidenceCases: Array<[string, OnboardingIntent]> = [
      ['iso 9001 overview', 'QUESTION_STANDARD'],
      ['iatf overview', 'QUESTION_STANDARD'],
      ['brcgs overview', 'QUESTION_STANDARD'],
      ['risk and audit management', 'QUESTION_MODULE'],
      ['health and safety incident management', 'QUESTION_MODULE'],
      ['infosec module overview', 'QUESTION_MODULE'],
      ['I need support', 'REQUEST_HUMAN'],
      ['contact us please', 'REQUEST_HUMAN'],
      ['I found a bug', 'REPORT_PROBLEM'],
      ['there is an issue', 'REPORT_PROBLEM'],
      ['report a problem', 'REPORT_PROBLEM'],
      ['wizard for configuring the system', 'QUESTION_SETUP'],
      ['onboarding wizard overview', 'QUESTION_SETUP'],
      ['compliance gap check', 'QUESTION_COMPLIANCE'],
      ['compliance gap analysis', 'QUESTION_COMPLIANCE'],
      ['readiness assessment for the period', 'QUESTION_COMPLIANCE'],
      ['brcgs compliance overview', 'QUESTION_STANDARD'],
      ['iatf compliance overview', 'QUESTION_STANDARD'],
    ];

    it.each(mediumConfidenceCases)('"%s" has MEDIUM confidence', (message, _intent) => {
      expect(classifyIntent(message).confidence).toBe('MEDIUM');
    });
  });

  describe('LOW confidence (score < 3)', () => {
    const lowConfidenceCases: string[] = [
      '',
      'hello',
      'what',
      'ok',
      'yes',
      'no',
      'sure',
      'maybe',
      'fine',
      'alright',
      'thanks',
      'great',
      'good',
      'interesting',
      'I see',
      'understood',
      'noted',
      'of course',
      'absolutely',
      'definitely',
      'perhaps',
      'indeed',
      'right',
      'fair enough',
      'sounds good',
      'agreed',
      'no way',
      'got it',
    ];

    it.each(lowConfidenceCases)('"%s" has LOW confidence', (message) => {
      expect(classifyIntent(message).confidence).toBe('LOW');
    });
  });

  describe('confidence is HIGH MEDIUM or LOW', () => {
    const allMessages = [
      'iso 9001',
      'iatf standard',
      'health and safety risk',
      'I need support',
      'error in system',
      '',
      'checklist please',
      'template download',
      'how does the workflow work',
    ];
    it.each(allMessages)('"%s" produces valid confidence level', (message) => {
      const { confidence } = classifyIntent(message);
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(confidence);
    });
  });
});

// ---------------------------------------------------------------------------
// Section 14: searchKnowledgeBase tests (90 tests)
// ---------------------------------------------------------------------------
describe('searchKnowledgeBase', () => {
  describe('returns empty array for unrelated queries', () => {
    const unrelatedQueries = [
      'the weather today',
      'recipe for chocolate cake',
      'best football league',
      'favourite movie',
      'completely unrelated xyz',
      'what time is it',
      'who is the president',
      'capital city of australia',
      'popular songs of 2025',
      'best restaurants near me',
      'holiday destination ideas',
      'stock market prices',
      'sports results today',
      'cooking tips and tricks',
      'fitness exercise routine',
    ];
    it.each(unrelatedQueries)('returns empty for query "%s"', (query) => {
      const results = searchKnowledgeBase(query);
      expect(results).toEqual([]);
    });
  });

  describe('returns results for knowledge base topics', () => {
    it('returns results for "instant start"', () => {
      const results = searchKnowledgeBase('instant start');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "instant start packs" is instant-start-packs entry', () => {
      const results = searchKnowledgeBase('instant start packs');
      expect(results[0].id).toBe('instant-start-packs');
    });

    it('returns results for "gap assessment"', () => {
      const results = searchKnowledgeBase('gap assessment');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "gap assessment" contains gap-assessment entry', () => {
      const results = searchKnowledgeBase('gap assessment');
      expect(results.some(r => r.id === 'gap-assessment')).toBe(true);
    });

    it('returns results for "sso"', () => {
      const results = searchKnowledgeBase('sso');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "single sign-on" is sso-setup entry', () => {
      const results = searchKnowledgeBase('single sign-on');
      expect(results[0].id).toBe('sso-setup');
    });

    it('returns results for "data migration"', () => {
      const results = searchKnowledgeBase('data migration');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "data migration" is data-migration entry', () => {
      const results = searchKnowledgeBase('data migration');
      expect(results[0].id).toBe('data-migration');
    });

    it('returns results for "module configuration"', () => {
      const results = searchKnowledgeBase('module configuration');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns results for "user management"', () => {
      const results = searchKnowledgeBase('user management');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "user management" is user-management entry', () => {
      const results = searchKnowledgeBase('user management');
      expect(results.some(r => r.id === 'user-management')).toBe(true);
    });

    it('returns results for "go live"', () => {
      const results = searchKnowledgeBase('go live');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "go live" is go-live-checklist entry', () => {
      const results = searchKnowledgeBase('go live');
      expect(results[0].id).toBe('go-live-checklist');
    });

    it('returns results for "erp integration"', () => {
      const results = searchKnowledgeBase('erp integration');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "erp integration" is erp-integration entry', () => {
      const results = searchKnowledgeBase('erp integration');
      expect(results[0].id).toBe('erp-integration');
    });

    it('returns results for "certification timeline"', () => {
      const results = searchKnowledgeBase('certification timeline');
      expect(results.length).toBeGreaterThan(0);
    });

    it('first result for "certification timeline" is certification-timeline entry', () => {
      const results = searchKnowledgeBase('certification timeline');
      expect(results[0].id).toBe('certification-timeline');
    });
  });

  describe('keyword matching', () => {
    it('matches on keyword "pack"', () => {
      const results = searchKnowledgeBase('pack');
      expect(results.some(r => r.id === 'instant-start-packs')).toBe(true);
    });

    it('matches on keyword "saml"', () => {
      const results = searchKnowledgeBase('saml');
      expect(results.some(r => r.id === 'sso-setup')).toBe(true);
    });

    it('matches on keyword "oidc"', () => {
      const results = searchKnowledgeBase('oidc');
      expect(results.some(r => r.id === 'sso-setup')).toBe(true);
    });

    it('matches on keyword "okta"', () => {
      const results = searchKnowledgeBase('okta');
      expect(results.some(r => r.id === 'sso-setup')).toBe(true);
    });

    it('matches on keyword "azure"', () => {
      const results = searchKnowledgeBase('azure');
      expect(results.some(r => r.id === 'sso-setup')).toBe(true);
    });

    it('matches on keyword "import"', () => {
      const results = searchKnowledgeBase('import');
      expect(results.length).toBeGreaterThan(0);
    });

    it('matches on keyword "csv"', () => {
      const results = searchKnowledgeBase('csv');
      expect(results.some(r => r.id === 'data-migration')).toBe(true);
    });

    it('matches on keyword "excel"', () => {
      const results = searchKnowledgeBase('excel');
      expect(results.some(r => r.id === 'data-migration')).toBe(true);
    });

    it('matches on keyword "role"', () => {
      const results = searchKnowledgeBase('role');
      expect(results.some(r => r.id === 'user-management')).toBe(true);
    });

    it('matches on keyword "permission"', () => {
      const results = searchKnowledgeBase('permission');
      expect(results.some(r => r.id === 'user-management')).toBe(true);
    });

    it('matches on keyword "bamboohr"', () => {
      const results = searchKnowledgeBase('bamboohr');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });

    it('matches on keyword "workday"', () => {
      const results = searchKnowledgeBase('workday');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });

    it('matches on keyword "sap"', () => {
      const results = searchKnowledgeBase('sap');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });

    it('matches on keyword "launch"', () => {
      const results = searchKnowledgeBase('launch');
      expect(results.some(r => r.id === 'go-live-checklist')).toBe(true);
    });

    it('matches on keyword "golive"', () => {
      const results = searchKnowledgeBase('golive');
      expect(results.some(r => r.id === 'go-live-checklist')).toBe(true);
    });

    it('matches on keyword "snapshot"', () => {
      const results = searchKnowledgeBase('snapshot');
      expect(results.some(r => r.id === 'gap-assessment')).toBe(true);
    });

    it('matches on keyword "readiness"', () => {
      const results = searchKnowledgeBase('readiness');
      expect(results.length).toBeGreaterThan(0);
    });

    it('matches on keyword "conformance"', () => {
      const results = searchKnowledgeBase('conformance');
      expect(results.some(r => r.id === 'gap-assessment')).toBe(true);
    });

    it('matches on keyword "connector"', () => {
      const results = searchKnowledgeBase('connector');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });

    it('matches on keyword "sync"', () => {
      const results = searchKnowledgeBase('sync');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });

    it('matches on keyword "automotive"', () => {
      const results = searchKnowledgeBase('automotive');
      expect(results.some(r => r.id === 'instant-start-packs')).toBe(true);
    });

    it('matches on keyword "template"', () => {
      const results = searchKnowledgeBase('template');
      expect(results.length).toBeGreaterThan(0);
    });

    it('matches on keyword "invite"', () => {
      const results = searchKnowledgeBase('invite');
      expect(results.some(r => r.id === 'user-management')).toBe(true);
    });

    it('matches on keyword "compliance"', () => {
      const results = searchKnowledgeBase('compliance');
      expect(results.some(r => r.id === 'gap-assessment')).toBe(true);
    });

    it('matches on keyword "clause"', () => {
      const results = searchKnowledgeBase('clause');
      expect(results.some(r => r.id === 'gap-assessment')).toBe(true);
    });

    it('matches on keyword "auth0"', () => {
      const results = searchKnowledgeBase('auth0');
      expect(results.some(r => r.id === 'sso-setup')).toBe(true);
    });

    it('matches on keyword "dynamics"', () => {
      const results = searchKnowledgeBase('dynamics');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });

    it('matches on keyword "xero"', () => {
      const results = searchKnowledgeBase('xero');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });

    it('matches on keyword "legacy"', () => {
      const results = searchKnowledgeBase('legacy');
      expect(results.some(r => r.id === 'data-migration')).toBe(true);
    });

    it('matches on keyword "staff"', () => {
      const results = searchKnowledgeBase('staff');
      expect(results.some(r => r.id === 'user-management')).toBe(true);
    });

    it('matches on keyword "access"', () => {
      const results = searchKnowledgeBase('access');
      expect(results.some(r => r.id === 'user-management')).toBe(true);
    });

    it('matches on keyword "production"', () => {
      const results = searchKnowledgeBase('production');
      expect(results.some(r => r.id === 'go-live-checklist')).toBe(true);
    });

    it('matches on keyword "accreditation"', () => {
      const results = searchKnowledgeBase('accreditation');
      expect(results.some(r => r.id === 'certification-timeline')).toBe(true);
    });

    it('matches on keyword "migration"', () => {
      const results = searchKnowledgeBase('migration');
      expect(results.some(r => r.id === 'data-migration')).toBe(true);
    });
  });

  describe('result ordering', () => {
    it('returns results sorted by score descending', () => {
      const results = searchKnowledgeBase('gap assessment');
      if (results.length > 1) {
        expect(results[0].id).toBe('gap-assessment');
      }
    });

    it('returns array type', () => {
      expect(Array.isArray(searchKnowledgeBase('iso 9001'))).toBe(true);
    });

    it('returns only entries with score > 0', () => {
      const results = searchKnowledgeBase('completely unrelated query xyz');
      expect(results).toEqual([]);
    });

    it('multiple related entries returned when query is broad', () => {
      const results = searchKnowledgeBase('migration');
      expect(results.some(r => r.id === 'data-migration')).toBe(true);
    });

    it('returns valid KnowledgeEntry objects', () => {
      const results = searchKnowledgeBase('sso');
      for (const result of results) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('topic');
        expect(result).toHaveProperty('keywords');
        expect(result).toHaveProperty('content');
      }
    });
  });

  describe('topic matching gives higher score', () => {
    it('topic match for "Gap Assessment" scores higher', () => {
      const results = searchKnowledgeBase('gap assessment');
      const idx = results.findIndex(r => r.id === 'gap-assessment');
      expect(idx).toBe(0);
    });

    it('topic match for "SSO" scores higher than content match', () => {
      const results = searchKnowledgeBase('sso');
      expect(results[0].id).toBe('sso-setup');
    });

    it('topic match for "Data Migration" returns that entry first', () => {
      const results = searchKnowledgeBase('data migration');
      expect(results[0].id).toBe('data-migration');
    });

    it('topic match for "Instant Start Packs" returns that entry first', () => {
      const results = searchKnowledgeBase('instant start packs');
      expect(results[0].id).toBe('instant-start-packs');
    });

    it('topic match for "Go-Live Readiness" returns that entry first', () => {
      const results = searchKnowledgeBase('go live');
      expect(results[0].id).toBe('go-live-checklist');
    });
  });

  describe('content matching', () => {
    it('matches content about SAML in sso-setup', () => {
      const results = searchKnowledgeBase('SAML 2.0 configuration');
      expect(results.some(r => r.id === 'sso-setup')).toBe(true);
    });

    it('matches content about ISO 9001 in gap-assessment', () => {
      const results = searchKnowledgeBase('ISO 9001:2015');
      expect(results.some(r => r.id === 'gap-assessment')).toBe(true);
    });

    it('matches content about Xero in erp-integration', () => {
      const results = searchKnowledgeBase('xero financial');
      expect(results.some(r => r.id === 'erp-integration')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Section 15: ONBOARDING_KNOWLEDGE_BASE structure tests (130 tests)
// ---------------------------------------------------------------------------
describe('ONBOARDING_KNOWLEDGE_BASE', () => {
  it('is an array', () => {
    expect(Array.isArray(ONBOARDING_KNOWLEDGE_BASE)).toBe(true);
  });

  it('has 9 entries', () => {
    expect(ONBOARDING_KNOWLEDGE_BASE).toHaveLength(9);
  });

  const expectedIds = [
    'instant-start-packs',
    'gap-assessment',
    'sso-setup',
    'data-migration',
    'module-configuration',
    'user-management',
    'go-live-checklist',
    'erp-integration',
    'certification-timeline',
  ];

  describe('all expected IDs are present', () => {
    it.each(expectedIds)('entry "%s" exists', (id) => {
      expect(ONBOARDING_KNOWLEDGE_BASE.some(e => e.id === id)).toBe(true);
    });
  });

  describe('each entry has required fields', () => {
    ONBOARDING_KNOWLEDGE_BASE.forEach((entry, idx) => {
      it(`entry[${idx}] (${entry.id}) has id string`, () => {
        expect(typeof entry.id).toBe('string');
        expect(entry.id.length).toBeGreaterThan(0);
      });

      it(`entry[${idx}] (${entry.id}) has topic string`, () => {
        expect(typeof entry.topic).toBe('string');
        expect(entry.topic.length).toBeGreaterThan(0);
      });

      it(`entry[${idx}] (${entry.id}) has keywords array`, () => {
        expect(Array.isArray(entry.keywords)).toBe(true);
      });

      it(`entry[${idx}] (${entry.id}) has non-empty keywords array`, () => {
        expect(entry.keywords.length).toBeGreaterThan(0);
      });

      it(`entry[${idx}] (${entry.id}) has content string`, () => {
        expect(typeof entry.content).toBe('string');
        expect(entry.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('all IDs are unique', () => {
    it('no duplicate IDs', () => {
      const ids = ONBOARDING_KNOWLEDGE_BASE.map(e => e.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('all topics are unique', () => {
    it('no duplicate topics', () => {
      const topics = ONBOARDING_KNOWLEDGE_BASE.map(e => e.topic);
      const unique = new Set(topics);
      expect(unique.size).toBe(topics.length);
    });
  });

  describe('all keywords are strings', () => {
    ONBOARDING_KNOWLEDGE_BASE.forEach((entry) => {
      it(`${entry.id} keywords are all strings`, () => {
        for (const keyword of entry.keywords) {
          expect(typeof keyword).toBe('string');
        }
      });
    });
  });

  describe('specific content checks', () => {
    it('instant-start-packs mentions Automotive', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'instant-start-packs')!;
      expect(entry.content).toContain('Automotive');
    });

    it('instant-start-packs mentions Medical', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'instant-start-packs')!;
      expect(entry.content).toContain('Medical');
    });

    it('gap-assessment mentions ISO 9001:2015', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'gap-assessment')!;
      expect(entry.content).toContain('ISO 9001:2015');
    });

    it('gap-assessment mentions Conformant', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'gap-assessment')!;
      expect(entry.content).toContain('Conformant');
    });

    it('sso-setup mentions SAML 2.0', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'sso-setup')!;
      expect(entry.content).toContain('SAML 2.0');
    });

    it('sso-setup mentions Azure', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'sso-setup')!;
      expect(entry.content).toContain('Azure');
    });

    it('sso-setup mentions Okta', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'sso-setup')!;
      expect(entry.content).toContain('Okta');
    });

    it('data-migration mentions CSV', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'data-migration')!;
      expect(entry.content).toContain('CSV');
    });

    it('user-management mentions RBAC', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'user-management')!;
      expect(entry.content).toContain('RBAC');
    });

    it('erp-integration mentions BambooHR', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'erp-integration')!;
      expect(entry.content).toContain('BambooHR');
    });

    it('erp-integration mentions SAP', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'erp-integration')!;
      expect(entry.content).toContain('SAP');
    });

    it('erp-integration mentions Workday', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'erp-integration')!;
      expect(entry.content).toContain('Workday');
    });

    it('go-live-checklist mentions SSO', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'go-live-checklist')!;
      expect(entry.content).toContain('SSO');
    });

    it('certification-timeline has phase descriptions', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'certification-timeline')!;
      expect(entry.content).toContain('Phase');
    });

    it('module-configuration mentions custom fields', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'module-configuration')!;
      expect(entry.content).toContain('Custom fields');
    });

    it('instant-start-packs has Install instructions', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'instant-start-packs')!;
      expect(entry.content.toLowerCase()).toContain('install');
    });

    it('data-migration mentions AI', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'data-migration')!;
      expect(entry.content).toContain('AI');
    });

    it('sso-setup mentions OIDC', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'sso-setup')!;
      expect(entry.content).toContain('OIDC');
    });

    it('gap-assessment mentions ISO 45001', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'gap-assessment')!;
      expect(entry.content).toContain('ISO 45001');
    });

    it('go-live-checklist has training section', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'go-live-checklist')!;
      expect(entry.content.toLowerCase()).toContain('training');
    });

    it('user-management mentions email', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'user-management')!;
      expect(entry.content.toLowerCase()).toContain('email');
    });
  });

  describe('suggestedActions structure', () => {
    const entriesWithActions = ONBOARDING_KNOWLEDGE_BASE.filter(e => e.suggestedActions);

    it('entries with suggestedActions have array value', () => {
      for (const entry of entriesWithActions) {
        expect(Array.isArray(entry.suggestedActions)).toBe(true);
      }
    });

    it('instant-start-packs has suggestedActions', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'instant-start-packs')!;
      expect(entry.suggestedActions).toBeDefined();
      expect((entry.suggestedActions ?? []).length).toBeGreaterThan(0);
    });

    it('sso-setup has suggestedActions', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'sso-setup')!;
      expect(entry.suggestedActions).toBeDefined();
    });

    it('data-migration has suggestedActions', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'data-migration')!;
      expect(entry.suggestedActions).toBeDefined();
    });

    it('user-management has suggestedActions', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'user-management')!;
      expect(entry.suggestedActions).toBeDefined();
    });

    it('suggestedActions have label property', () => {
      for (const entry of entriesWithActions) {
        for (const action of entry.suggestedActions ?? []) {
          expect(typeof action.label).toBe('string');
        }
      }
    });

    it('suggestedActions have action property', () => {
      for (const entry of entriesWithActions) {
        for (const action of entry.suggestedActions ?? []) {
          expect(typeof action.action).toBe('string');
        }
      }
    });

    it('suggestedActions labels are non-empty', () => {
      for (const entry of entriesWithActions) {
        for (const action of entry.suggestedActions ?? []) {
          expect(action.label.length).toBeGreaterThan(0);
        }
      }
    });

    it('suggestedActions action strings are non-empty', () => {
      for (const entry of entriesWithActions) {
        for (const action of entry.suggestedActions ?? []) {
          expect(action.action.length).toBeGreaterThan(0);
        }
      }
    });

    it('instant-start-packs first action navigates to instant-start', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'instant-start-packs')!;
      const firstAction = (entry.suggestedActions ?? [])[0];
      expect(firstAction.action).toContain('navigate:');
    });
  });

  describe('relatedTopics structure', () => {
    const entriesWithTopics = ONBOARDING_KNOWLEDGE_BASE.filter(e => e.relatedTopics);

    it('entries with relatedTopics have array value', () => {
      for (const entry of entriesWithTopics) {
        expect(Array.isArray(entry.relatedTopics)).toBe(true);
      }
    });

    it('instant-start-packs has relatedTopics', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'instant-start-packs')!;
      expect(entry.relatedTopics).toBeDefined();
    });

    it('gap-assessment has relatedTopics', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'gap-assessment')!;
      expect(entry.relatedTopics).toBeDefined();
    });

    it('sso-setup has relatedTopics', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'sso-setup')!;
      expect(entry.relatedTopics).toBeDefined();
    });

    it('relatedTopics are non-empty strings', () => {
      for (const entry of entriesWithTopics) {
        for (const topic of entry.relatedTopics ?? []) {
          expect(typeof topic).toBe('string');
          expect(topic.length).toBeGreaterThan(0);
        }
      }
    });

    it('go-live-checklist relatedTopics includes data-migration', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'go-live-checklist')!;
      expect(entry.relatedTopics).toContain('data-migration');
    });

    it('erp-integration relatedTopics includes user-management', () => {
      const entry = ONBOARDING_KNOWLEDGE_BASE.find(e => e.id === 'erp-integration')!;
      expect(entry.relatedTopics).toContain('user-management');
    });
  });

  // -------------------------------------------------------------------------
  // Section 16 — additional edge cases and combinatorial checks
  // -------------------------------------------------------------------------
  describe('Section 16 — additional edge-case coverage', () => {
    // classifyIntent: empty/whitespace
    it('empty string returns GENERAL_CHAT', () => {
      expect(classifyIntent('').intent).toBe('GENERAL_CHAT');
    });
    it('whitespace-only returns GENERAL_CHAT', () => {
      expect(classifyIntent('   ').intent).toBe('GENERAL_CHAT');
    });
    it('single digit returns GENERAL_CHAT', () => {
      expect(classifyIntent('7').intent).toBe('GENERAL_CHAT');
    });
    it('punctuation only returns GENERAL_CHAT', () => {
      expect(classifyIntent('???').intent).toBe('GENERAL_CHAT');
    });
    it('newline only returns GENERAL_CHAT', () => {
      expect(classifyIntent('\n').intent).toBe('GENERAL_CHAT');
    });

    // classifyIntent: known words — quick checks
    it('"bug" → REPORT_PROBLEM', () => {
      expect(classifyIntent('bug').intent).toBe('REPORT_PROBLEM');
    });
    it('"error" → REPORT_PROBLEM', () => {
      expect(classifyIntent('error').intent).toBe('REPORT_PROBLEM');
    });
    it('"issue" → REPORT_PROBLEM', () => {
      expect(classifyIntent('issue').intent).toBe('REPORT_PROBLEM');
    });
    it('"human" → REQUEST_HUMAN', () => {
      expect(classifyIntent('human').intent).toBe('REQUEST_HUMAN');
    });
    it('"wizard" → QUESTION_SETUP', () => {
      expect(classifyIntent('wizard').intent).toBe('QUESTION_SETUP');
    });
    it('"onboard" → QUESTION_SETUP', () => {
      expect(classifyIntent('onboard').intent).toBe('QUESTION_SETUP');
    });
    it('"template" → REQUEST_TEMPLATE', () => {
      expect(classifyIntent('template').intent).toBe('REQUEST_TEMPLATE');
    });
    it('"form" → REQUEST_TEMPLATE', () => {
      expect(classifyIntent('form').intent).toBe('REQUEST_TEMPLATE');
    });
    it('"checklist" → REQUEST_CHECKLIST', () => {
      expect(classifyIntent('checklist').intent).toBe('REQUEST_CHECKLIST');
    });
    it('"example" → REQUEST_EXAMPLE', () => {
      expect(classifyIntent('example').intent).toBe('REQUEST_EXAMPLE');
    });
    it('"sample" → REQUEST_EXAMPLE', () => {
      expect(classifyIntent('sample').intent).toBe('REQUEST_EXAMPLE');
    });
    it('"clause" → QUESTION_STANDARD', () => {
      expect(classifyIntent('clause').intent).toBe('QUESTION_STANDARD');
    });
    it('"gap" → QUESTION_COMPLIANCE', () => {
      expect(classifyIntent('gap').intent).toBe('QUESTION_COMPLIANCE');
    });
    it('"conform" → QUESTION_COMPLIANCE', () => {
      expect(classifyIntent('conform').intent).toBe('QUESTION_COMPLIANCE');
    });
    it('"audit" → QUESTION_MODULE', () => {
      expect(classifyIntent('audit').intent).toBe('QUESTION_MODULE');
    });
    it('"risk" → QUESTION_MODULE', () => {
      expect(classifyIntent('risk').intent).toBe('QUESTION_MODULE');
    });
    it('"quality" → QUESTION_MODULE', () => {
      expect(classifyIntent('quality').intent).toBe('QUESTION_MODULE');
    });

    // confidence on short single-keyword messages
    it('"bug" confidence is MEDIUM (score 3)', () => {
      expect(classifyIntent('bug').confidence).toBe('MEDIUM');
    });
    it('"error" confidence is MEDIUM', () => {
      expect(classifyIntent('error').confidence).toBe('MEDIUM');
    });
    it('"clause" confidence is MEDIUM', () => {
      expect(classifyIntent('clause').confidence).toBe('MEDIUM');
    });
    it('"template" confidence is LOW (score 2)', () => {
      expect(classifyIntent('template').confidence).toBe('LOW');
    });
    it('"example" confidence is LOW (score 1)', () => {
      expect(classifyIntent('example').confidence).toBe('LOW');
    });
    it('"human" confidence is MEDIUM (score 4)', () => {
      expect(classifyIntent('human').confidence).toBe('MEDIUM');
    });
  });
});
