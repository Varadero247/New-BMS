'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

type Section = { heading: string; body: string };
type KnowledgeQ = { q: string; options: string[]; correct: number; feedback: string };

type ModuleConfig = {
  title: string;
  duration: string;
  intro: string;
  sections: Section[];
  knowledgeCheck: KnowledgeQ[];
  next: number | null;
};

const MODULE_CONFIG: Record<string, ModuleConfig> = {
  '1': {
    title: 'Platform Navigation',
    duration: '30 min',
    intro: 'Before you can record an incident or raise a permit, you need to find your way around the Nexara platform. This module walks you through the key areas of the interface.',
    sections: [
      {
        heading: 'Logging In',
        body: 'Navigate to your organisation\'s Nexara URL and enter your username and password. If your organisation uses Single Sign-On (SSO), click the "Sign in with [Provider]" button instead. On successful login you will land on your personalised Dashboard. If you see a "Portal not activated" message, contact your Nexara administrator — your organisation\'s activation key may not yet be entered.',
      },
      {
        heading: 'Dashboard Orientation',
        body: 'The dashboard is your home screen. It contains: My Tasks (action items assigned to you), My Training (upcoming deadlines and overdue items), Quick Actions (one-click shortcuts to the most common tasks), Recent Activity (a log of changes you have made in the last 7 days), and System Alerts (platform-wide notices from your administrator). The dashboard layout is the same for all users — your administrator can add or remove widgets.',
      },
      {
        heading: 'Sidebar Navigation',
        body: 'The left sidebar contains the main module navigation. Each module your organisation has activated appears here as an icon with a label. Click the icon to expand that module\'s menu. Common modules you will see: Health & Safety, Training, Permits, Quality. The sidebar can be collapsed to icon-only view by clicking the double-chevron at the bottom. On mobile, tap the hamburger menu (≡) to open the sidebar.',
      },
      {
        heading: 'Notifications & Profile',
        body: 'The bell icon (top right) shows your notification count. Click it to see all recent notifications: training deadlines, permit approvals, and incident updates. Notifications are colour-coded: blue = informational, amber = action required, red = overdue. Your profile avatar (top right) opens a menu where you can update your display name, change your password, set your preferred language, and sign out. Your job title and department are set by your administrator.',
      },
    ],
    knowledgeCheck: [
      {
        q: 'Where do you find action items assigned directly to you?',
        options: ['My Training widget', 'My Tasks widget', 'Recent Activity log', 'System Alerts section'],
        correct: 1,
        feedback: 'My Tasks shows action items assigned to you, such as incident investigations or permit approvals.',
      },
      {
        q: 'A notification with an amber colour means:',
        options: ['Informational only', 'System error', 'Action required', 'Overdue item'],
        correct: 2,
        feedback: 'Amber notifications require an action from you. Red means overdue; blue is informational.',
      },
      {
        q: 'If you see "Portal not activated" on login, what should you do?',
        options: ['Wait 24 hours and try again', 'Clear your browser cache', 'Contact your Nexara administrator', 'Create a new account'],
        correct: 2,
        feedback: 'The "Portal not activated" message means your organisation\'s activation key has not been entered. Contact your Nexara administrator.',
      },
      {
        q: 'How do you collapse the sidebar to icon-only view on desktop?',
        options: ['Click the profile avatar', 'Click the double-chevron at the bottom of the sidebar', 'Press Escape', 'Click the Nexara logo'],
        correct: 1,
        feedback: 'The double-chevron at the bottom of the sidebar toggles between full and icon-only view.',
      },
      {
        q: 'Which widget shows changes you have made in the last 7 days?',
        options: ['My Tasks', 'System Alerts', 'Quick Actions', 'Recent Activity'],
        correct: 3,
        feedback: 'Recent Activity logs your own recent changes to the platform over the past 7 days.',
      },
    ],
    next: 2,
  },
  '2': {
    title: 'Recording Incidents',
    duration: '40 min',
    intro: 'Accurate and timely incident recording is one of the most important things you can do to protect yourself and your colleagues. This module shows you exactly how to do it.',
    sections: [
      {
        heading: 'Incident vs Near Miss vs Observation',
        body: 'Use the correct record type for the event:\n\n**Incident** — something has happened that caused, or could have caused, harm to a person, asset, or the environment. Always record an incident when injury, illness, damage, or environmental release has occurred.\n\n**Near Miss** — something happened but no harm resulted. Recording near misses is equally important because they reveal hazards before someone gets hurt. Never dismiss a near miss as "nothing happened."\n\n**Observation** — you have noticed a hazard or unsafe condition that has not yet resulted in an event. This is proactive reporting and is strongly encouraged.',
      },
      {
        heading: 'Recording an Incident: Step by Step',
        body: 'Navigate to Health & Safety → Incidents → New Incident. Complete the mandatory fields:\n\n1. **Title** — a brief, factual description (e.g., "Slip on wet floor, Building 3 corridor")\n2. **Date & Time Occurred** — the time the event happened, not when you are reporting it\n3. **Record Type** — Incident, Near Miss, or Observation\n4. **Severity** — MINOR, MODERATE, MAJOR, CRITICAL, or CATASTROPHIC\n5. **Location** — use the site/building/area hierarchy\n6. **Description** — a factual account of what happened; avoid opinions and blame\n\nThen click Save. The system assigns a reference number (INC-YYYY-NNN) and notifies your line manager.',
      },
      {
        heading: 'Uploading Evidence',
        body: 'After saving the initial record, go to the Evidence tab. You can attach:\n- Photographs (JPG/PNG, max 10 MB per file)\n- Video clips (MP4, max 50 MB)\n- Witness statements (PDF or Word)\n- CCTV footage reference numbers\n\nUploads are timestamped and linked to your user account. You cannot delete evidence once submitted — contact your administrator if an upload was made in error. Good photographic evidence (close-up of hazard, wide-angle of area, any equipment involved) significantly supports investigation.',
      },
      {
        heading: 'Status Tracking',
        body: 'Once submitted, your incident moves through these statuses:\n- **Open** — recorded but not yet under investigation\n- **Under Investigation** — a responsible person has been assigned\n- **Action Required** — corrective actions have been raised; awaiting completion\n- **Closed** — investigation complete, actions verified\n\nYou can view the status of any incident you have submitted by going to Health & Safety → Incidents → My Incidents. You will receive a notification when the status changes.',
      },
    ],
    knowledgeCheck: [
      {
        q: 'A colleague slips on a wet floor but is uninjured. What record type should you create?',
        options: ['Incident', 'Near Miss', 'Observation', 'CAPA'],
        correct: 1,
        feedback: 'Something happened but no harm resulted — this is a Near Miss. Near misses are just as important to record as incidents.',
      },
      {
        q: 'Which field captures the moment the event actually happened?',
        options: ['Reported Date', 'Date & Time Occurred', 'Investigation Date', 'Created At'],
        correct: 1,
        feedback: '"Date & Time Occurred" is the time the event happened, which may differ from when you are submitting the form.',
      },
      {
        q: 'What severity level should you select for a CATASTROPHIC event?',
        options: ['MAJOR', 'CRITICAL', 'SEVERE', 'CATASTROPHIC'],
        correct: 3,
        feedback: 'CATASTROPHIC is the highest severity level in Nexara. Use it for events with the most serious potential or actual consequences.',
      },
      {
        q: 'After submitting an incident, where do you upload photographic evidence?',
        options: ['The Description field', 'The Evidence tab on the incident record', 'A separate email to your manager', 'The Attachments section in your profile'],
        correct: 1,
        feedback: 'Navigate to the Evidence tab on the saved incident record to upload photos, videos, and witness statements.',
      },
      {
        q: 'What status indicates that corrective actions have been raised and are awaiting completion?',
        options: ['Open', 'Under Investigation', 'Action Required', 'Closed'],
        correct: 2,
        feedback: '"Action Required" means the investigation has identified corrective actions but they have not yet been completed.',
      },
    ],
    next: 3,
  },
  '3': {
    title: 'Training Acknowledgements',
    duration: '30 min',
    intro: 'Your organisation uses Nexara to assign mandatory training and procedures. Completing and acknowledging your assigned training on time is a compliance requirement — and it protects you.',
    sections: [
      {
        heading: 'Finding Your Assigned Training',
        body: 'Your Dashboard shows a My Training widget with all training assignments due in the next 30 days. For a complete list, go to Training → My Assignments. Each assignment shows:\n- **Course title** and description\n- **Due date** — the deadline by which completion is required\n- **Status** — NOT_STARTED, IN_PROGRESS, COMPLETED, or OVERDUE\n- **Type** — whether it is a procedure to read, a video to watch, or an online module to complete\n\nAssignments are made by your HR or L&D team. If you believe an assignment is incorrect, contact your line manager — do not ignore it.',
      },
      {
        heading: 'Acknowledging a Procedure',
        body: 'For document-type assignments (procedures, policies, safe systems of work):\n\n1. Click the assignment title to open the document viewer\n2. Read the full document — the system tracks scroll position\n3. Complete the knowledge check questions at the end (if present)\n4. Click "I confirm I have read and understood this document"\n5. Enter your password to digitally sign the acknowledgement\n\nThe system records the date, time, and version of the document you acknowledged. This creates an auditable compliance record.',
      },
      {
        heading: 'RAG Status and What It Means',
        body: 'Your compliance status uses a RAG (Red-Amber-Green) traffic light system:\n\n- **Green** — all training is up to date\n- **Amber** — one or more assignments are due within 7 days\n- **Red** — one or more assignments are overdue\n\nYour RAG status is visible to your line manager and your HR team. If you are Red, your access to certain areas of the system may be restricted until training is completed. Contact your line manager if you cannot complete training by the due date — they can request an extension.',
      },
      {
        heading: 'Deadline Alert Notifications',
        body: 'Nexara sends automatic reminders:\n- **30 days before** — first reminder to plan ahead\n- **7 days before** — urgent reminder\n- **Day of deadline** — final prompt\n- **Day after** — overdue notification to you and your manager\n\nNotifications arrive in your platform inbox (bell icon) and by email. To check your notification preferences, go to Profile → Notifications. Some notification types are mandatory and cannot be turned off.',
      },
    ],
    knowledgeCheck: [
      {
        q: 'What does an OVERDUE assignment status mean?',
        options: ['The due date is approaching in 7 days', 'You have started but not finished the assignment', 'The deadline has passed and the assignment is incomplete', 'The assignment has been cancelled'],
        correct: 2,
        feedback: 'OVERDUE means the due date has passed without the assignment being completed. This makes your compliance status Red.',
      },
      {
        q: 'What does the Amber RAG status indicate?',
        options: ['All training is up to date', 'An assignment is due within 7 days', 'Training is overdue', 'Your access has been suspended'],
        correct: 1,
        feedback: 'Amber means one or more assignments are due within the next 7 days — action is needed soon.',
      },
      {
        q: 'When acknowledging a procedure, what confirms your digital signature?',
        options: ['Clicking Save', 'Entering your password', 'Completing all scroll sections', 'Emailing your manager'],
        correct: 1,
        feedback: 'Entering your password acts as a digital signature when acknowledging a procedure. This creates an auditable record.',
      },
      {
        q: 'How far in advance does Nexara send the first training deadline reminder?',
        options: ['7 days', '14 days', '21 days', '30 days'],
        correct: 3,
        feedback: 'The first reminder is sent 30 days before the deadline, followed by 7 days, the day of, and one day after.',
      },
      {
        q: 'If you believe a training assignment is incorrect, what should you do?',
        options: ['Ignore it', 'Delete the assignment', 'Contact your line manager', 'Complete it anyway without raising the issue'],
        correct: 2,
        feedback: 'Contact your line manager — they can investigate and request a correction from the L&D team. Never ignore an assignment.',
      },
    ],
    next: 4,
  },
  '4': {
    title: 'Permit to Work',
    duration: '40 min',
    intro: 'Permits to Work (PTW) are a critical safety control for high-risk activities. If you need to carry out work that requires a permit, you must request and receive approval before starting. This module explains the process.',
    sections: [
      {
        heading: 'Which Activities Require a Permit?',
        body: 'A Permit to Work is required for activities that pose significant risks that cannot be controlled by routine procedures alone. Common permit types in Nexara:\n\n- **Hot Work** — welding, grinding, cutting (fire/explosion risk)\n- **Confined Space** — entry into tanks, vessels, manholes (asphyxiation risk)\n- **Working at Height** — above 2 metres without permanent edge protection\n- **Isolation & LOTO** — electrical or mechanical isolation\n- **Excavation** — ground-breaking, trenching\n- **Chemical Handling** — use of hazardous substances not covered by standard COSHH procedures\n\nIf you are unsure whether a permit is required for your task, stop and ask your supervisor before starting.',
      },
      {
        heading: 'Submitting a Permit Request',
        body: 'Navigate to Permits → New Permit Request.\n\n1. Select the **Permit Type** (see list above)\n2. Enter the **Work Description** — be specific about what work will be done, by whom, and with what equipment\n3. Set the **Planned Start Date & Time** and **Planned End Time**\n4. Identify **Hazards** — the system presents a hazard checklist relevant to your permit type\n5. List **Control Measures** — what will be done to manage each hazard\n6. Add **Workers** — list all people who will work under this permit\n7. Attach any relevant **Risk Assessments** or method statements\n\nClick Submit. The permit enters the approval workflow. You will be notified when it is approved.',
      },
      {
        heading: 'Working Under a Permit',
        body: 'Before starting work:\n1. Receive written or digital confirmation that the permit is APPROVED\n2. Brief all workers on the hazards and control measures listed in the permit\n3. Ensure all control measures are in place (barriers, isolations, gas monitoring, etc.)\n4. Sign the permit — all workers listed must countersign\n\nDuring work:\n- Do not exceed the scope of work described in the permit\n- If conditions change (weather, new hazards, equipment failure), stop work and notify the permit authority\n- The permit can be suspended at any time by the permit authority for safety reasons\n\n⚠️ Starting work without a valid approved permit is a serious safety violation.',
      },
      {
        heading: 'Closing a Permit',
        body: 'When work is complete:\n1. Ensure the work area is left safe and tidy\n2. Remove all workers and equipment from the area\n3. Navigate to the permit record in Nexara (Permits → Active Permits)\n4. Click "Close Permit"\n5. Complete the closure checklist — confirm isolations removed, area restored, waste disposed\n6. Countersign the closure\n\nThe permit status changes to CLOSED and the record is retained for 7 years for audit purposes. Never leave an expired permit open — close it as soon as work is complete.',
      },
    ],
    knowledgeCheck: [
      {
        q: 'Which activity always requires a Permit to Work?',
        options: ['Changing a light bulb at ground level', 'Entering a confined space', 'Painting an interior wall', 'Replacing a keyboard'],
        correct: 1,
        feedback: 'Confined space entry always requires a Permit to Work due to the risk of asphyxiation and other hazards.',
      },
      {
        q: 'When should you start work that requires a permit?',
        options: ['When you have submitted the permit request', 'As soon as your supervisor verbally agrees', 'Only after receiving written or digital confirmation that the permit is APPROVED', 'Immediately if the risk assessment is complete'],
        correct: 2,
        feedback: 'You must not start work until you have received written or digital confirmation that the permit is APPROVED.',
      },
      {
        q: 'If conditions change significantly during permitted work, what should you do first?',
        options: ['Carry on and note the change in the closure section', 'Stop work and notify the permit authority', 'Extend the permit end time', 'Add the new hazard to the description field'],
        correct: 1,
        feedback: 'Stop work and notify the permit authority whenever conditions change significantly. They will decide whether to continue, amend, or suspend the permit.',
      },
      {
        q: 'How long are closed permit records retained in Nexara for audit purposes?',
        options: ['1 year', '3 years', '5 years', '7 years'],
        correct: 3,
        feedback: 'Permit records are retained for 7 years to support audit and legal requirements.',
      },
      {
        q: 'What is the correct permit type for welding work?',
        options: ['Working at Height', 'Confined Space', 'Hot Work', 'Isolation & LOTO'],
        correct: 2,
        feedback: 'Hot Work permits cover welding, grinding, and cutting activities due to fire and explosion risk.',
      },
    ],
    next: 5,
  },
  '5': {
    title: 'Observations',
    duration: '30 min',
    intro: 'Observations let you report hazards and good practices before they become incidents. Proactive reporting is everyone\'s responsibility and forms a critical part of your organisation\'s safety culture.',
    sections: [
      {
        heading: 'Positive vs Negative Observations',
        body: 'Nexara supports both types:\n\n**Positive Observations** — record when you see someone doing something safely and well. Examples: wearing correct PPE, following a procedure correctly, tidying up a work area. Positive observations reinforce good behaviours and provide data on what is working.\n\n**Negative (Unsafe) Observations** — record when you see a hazard, an unsafe condition, or a deviation from a safe procedure. Examples: a missing machine guard, a blocked fire exit, an unlabelled chemical container. These trigger a follow-up action to address the hazard.\n\nBoth types are equally valuable. An organisation with only negative observations has a reporting problem, not a safety problem.',
      },
      {
        heading: 'Completing the Observation Form',
        body: 'Navigate to Health & Safety → Observations → New Observation.\n\nComplete the form:\n- **Type** — Positive or Negative (Unsafe Condition / Unsafe Act)\n- **Location** — site, building, and area\n- **Category** — select from: PPE, Housekeeping, Equipment, Process Compliance, Environmental, other\n- **Description** — factual account of what you observed\n- **Photo** — attach a photo where safe and appropriate (max 10 MB)\n- **Immediate Action Taken** — note anything you did to make the situation immediately safer\n\nFor negative observations, Nexara automatically generates a follow-up action assigned to the area\'s responsible person.',
      },
      {
        heading: 'Anonymous Submission',
        body: 'If you do not want your name attached to an observation, you can submit anonymously. On the observation form, tick the "Submit anonymously" checkbox before saving.\n\nWhen submitted anonymously:\n- Your name is replaced with "Anonymous" in all records\n- You will not receive status update notifications for the observation\n- The content of the observation is still fully recorded and acted upon\n\nAnonymous reporting is encouraged — it removes the fear of raising concerns. Your administrator cannot reverse anonymisation once submitted.',
      },
      {
        heading: 'Tracking Your Observations',
        body: 'All observations you have submitted (including anonymous ones you chose to link to your account) are visible under Health & Safety → Observations → My Observations.\n\nEach observation has a status:\n- **Open** — logged and awaiting action\n- **In Progress** — a responsible person is addressing it\n- **Closed** — the hazard has been addressed and verified\n\nYou will be notified when the status of a named observation changes. For anonymous submissions, check the status manually by searching for the reference number (if you noted it down).',
      },
    ],
    knowledgeCheck: [
      {
        q: 'What is the purpose of a Positive Observation?',
        options: ['To report an unsafe condition', 'To record good safety behaviours that should be reinforced', 'To report a near miss', 'To request a permit to work'],
        correct: 1,
        feedback: 'Positive Observations reinforce good safety behaviours and provide data on what is working well.',
      },
      {
        q: 'A blocked fire exit is best recorded as:',
        options: ['A positive observation', 'An incident', 'A negative (unsafe condition) observation', 'A near miss'],
        correct: 2,
        feedback: 'A blocked fire exit is an unsafe condition — record it as a negative observation so a follow-up action is raised to clear it.',
      },
      {
        q: 'What happens to your identity when you submit an observation anonymously?',
        options: ['Your manager can see your name but others cannot', 'Your name is replaced with "Anonymous" in all records', 'Your name is encrypted and can be retrieved by the administrator', 'Your identity is revealed only if the observation leads to a formal investigation'],
        correct: 1,
        feedback: 'Your name is replaced with "Anonymous" in all records. Administrators cannot reverse anonymisation once submitted.',
      },
      {
        q: 'What status means a responsible person is actively addressing a hazard from your observation?',
        options: ['Open', 'In Progress', 'Under Review', 'Closed'],
        correct: 1,
        feedback: '"In Progress" means a responsible person has been assigned and is actively working to address the hazard.',
      },
      {
        q: 'After submitting a negative observation, what does Nexara automatically do?',
        options: ['Sends the observation to the HSE regulator', 'Closes the observation immediately after review', 'Generates a follow-up action assigned to the area\'s responsible person', 'Creates an incident record'],
        correct: 2,
        feedback: 'For negative observations, Nexara automatically generates a follow-up action assigned to the responsible person for that area.',
      },
    ],
    next: 6,
  },
  '6': {
    title: 'Reports & Dashboards',
    duration: '25 min',
    intro: 'Nexara gives you visibility of your own compliance status and the data relevant to your role. This module shows you how to read your dashboard and use pre-configured reports.',
    sections: [
      {
        heading: 'Your Personal Compliance Dashboard',
        body: 'Your dashboard has four key compliance widgets:\n\n**Training Compliance** — shows your overall RAG status. Green = all current; Amber = due within 7 days; Red = overdue.\n\n**Open Incidents** — the number of incidents you have submitted that are still open or under investigation.\n\n**Active Permits** — any permits currently in APPROVED or IN-PROGRESS status that you are listed on.\n\n**My Actions** — corrective actions assigned to you, with due dates. Click any widget to drill down into the detail.',
      },
      {
        heading: 'Pre-Configured Reports',
        body: 'Navigate to Reports → My Reports. Pre-configured reports available to you depend on your role. Common reports for end users:\n\n- **My Training Compliance** — full list of your assignments, statuses, and completion dates\n- **My Incident History** — all incidents you have submitted, with current status\n- **My Observations** — all observations you have submitted\n- **My Permit History** — all permits you have been listed on\n\nEach report can be filtered by date range. Reports show live data and refresh each time you open them.',
      },
      {
        heading: 'Exporting Data',
        body: 'On any report page, click the Export button (top right) to download in:\n- **CSV** — for use in Excel or Google Sheets\n- **PDF** — for printing or sharing\n\nExports capture the data visible on screen at the time of download. If you have applied filters (e.g., date range), only filtered data is exported.\n\nNote: Some reports may be restricted by your administrator. If you cannot see a report you expect, contact your line manager or administrator.',
      },
      {
        heading: 'Understanding RAG Status',
        body: 'RAG (Red-Amber-Green) is used across the platform to indicate status at a glance:\n\n**Green** — compliant / on track / complete\n**Amber** — approaching a deadline or threshold — action recommended\n**Red** — overdue or non-compliant — action required now\n\nWhen you see a Red status anywhere on the platform, it requires your attention. Do not dismiss Red statuses without taking action or escalating to your manager. RAG statuses are visible to your line manager and HR team in their management reports.',
      },
    ],
    knowledgeCheck: [
      {
        q: 'What does a Green Training Compliance widget mean?',
        options: ['All training is overdue', 'One assignment is due within 7 days', 'All training is up to date and no deadlines are approaching', 'Training module is loading'],
        correct: 2,
        feedback: 'Green means all your training is current and no deadlines are approaching within 7 days.',
      },
      {
        q: 'How do you export a report to use in Excel?',
        options: ['Use the Print button', 'Click Export → CSV', 'Copy and paste the table', 'Right-click and save as'],
        correct: 1,
        feedback: 'Click the Export button and select CSV to download the report data for use in Excel or Google Sheets.',
      },
      {
        q: 'If you filter a report by a specific date range and then export it, what data is included?',
        options: ['All historical data regardless of filter', 'Only the filtered data visible on screen at the time of download', 'Data from the current month only', 'Data from the previous 12 months'],
        correct: 1,
        feedback: 'Exports capture only the data visible on screen at the time of download, including any filters you have applied.',
      },
      {
        q: 'A Red RAG status in the platform means:',
        options: ['The system is loading', 'Action is recommended soon', 'Action is required now — you are overdue or non-compliant', 'All items are complete'],
        correct: 2,
        feedback: 'Red means you are overdue or non-compliant. It requires immediate action or escalation to your manager.',
      },
      {
        q: 'Where do you find reports for your training compliance and incident history?',
        options: ['Dashboard → My Tasks', 'Profile → Settings', 'Reports → My Reports', 'Health & Safety → Incidents'],
        correct: 2,
        feedback: 'Navigate to Reports → My Reports to access pre-configured compliance and history reports relevant to your role.',
      },
    ],
    next: null,
  },
};

export default function EndUserModulePage() {
  const params = useParams<{ id: string }>();
  const config = MODULE_CONFIG[params.id];
  if (!config) notFound();

  const [kqAnswers, setKqAnswers] = useState<Record<number, number>>({});
  const [kqSubmitted, setKqSubmitted] = useState(false);

  const handleKqSelect = (qi: number, opt: number) => {
    if (kqSubmitted) return;
    setKqAnswers((prev) => ({ ...prev, [qi]: opt }));
  };

  const allAnswered = config.knowledgeCheck.every((_, i) => kqAnswers[i] !== undefined);
  const correctCount = kqSubmitted
    ? config.knowledgeCheck.filter((q, i) => kqAnswers[i] === q.correct).length
    : 0;

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <div>
            <span className="font-semibold text-white text-sm">Nexara IMS — Training Portal</span>
            <span className="text-slate-500 text-xs ml-3">/ End User / Module {params.id}</span>
          </div>
        </div>
        <Link href="/end-user/modules" className="text-sm text-slate-400 hover:text-white transition-colors">← All Modules</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#B8860B] mb-2">
            Module {params.id} · {config.duration}
          </div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {config.title}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">{config.intro}</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 mb-12">
          {config.sections.map(({ heading, body }) => (
            <div key={heading} className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#B8860B]" />
                <h2 className="font-semibold text-white">{heading}</h2>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{body}</div>
            </div>
          ))}
        </div>

        {/* Knowledge Check */}
        <div className="bg-[#091628] border border-[#B8860B]/40 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-1">Knowledge Check</h2>
          <p className="text-sm text-slate-400 mb-6">
            5 questions · unscored · instant feedback. This check does not count toward your certificate.
          </p>

          <div className="space-y-8">
            {config.knowledgeCheck.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-semibold text-white mb-3">{qi + 1}. {q.q}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = kqAnswers[qi] === oi;
                    const isCorrect = oi === q.correct;
                    let cls = 'border border-[#1E3A5F] text-slate-300 bg-[#091628]';
                    if (kqSubmitted) {
                      if (isCorrect) cls = 'border-green-500 text-green-300 bg-green-900/20';
                      else if (selected && !isCorrect) cls = 'border-red-500 text-red-300 bg-red-900/20';
                    } else if (selected) {
                      cls = 'border-[#B8860B] text-white bg-[#B8860B]/10';
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => handleKqSelect(qi, oi)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${cls}`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    );
                  })}
                </div>
                {kqSubmitted && (
                  <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${kqAnswers[qi] === q.correct ? 'bg-green-900/20 text-green-300' : 'bg-amber-900/20 text-amber-300'}`}>
                    <span className="font-semibold">{kqAnswers[qi] === q.correct ? '✓ Correct — ' : '✗ Incorrect — '}</span>
                    {q.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!kqSubmitted ? (
            <button
              onClick={() => { if (allAnswered) setKqSubmitted(true); }}
              disabled={!allAnswered}
              className={`mt-8 w-full py-3 rounded-lg font-semibold text-sm transition-colors ${allAnswered ? 'bg-[#B8860B] text-white hover:bg-[#D4A017]' : 'bg-[#1E3A5F]/40 text-slate-500 cursor-not-allowed'}`}
            >
              {allAnswered ? 'Check Answers' : `Answer all ${config.knowledgeCheck.length} questions to check`}
            </button>
          ) : (
            <div className="mt-8 text-center">
              <div className={`text-2xl font-bold mb-1 ${correctCount >= 4 ? 'text-green-400' : 'text-amber-400'}`}>
                {correctCount}/{config.knowledgeCheck.length} correct
              </div>
              <p className="text-slate-400 text-sm mb-4">
                {correctCount === 5 ? 'Perfect score!' : correctCount >= 4 ? 'Well done — review any incorrect answers above.' : 'Review the incorrect answers and re-read the relevant sections before moving on.'}
              </p>
              <div className="flex items-center justify-center gap-4">
                {config.next !== null ? (
                  <Link
                    href={`/end-user/modules/${config.next}`}
                    className="inline-flex items-center gap-2 bg-[#B8860B] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors"
                  >
                    Next Module <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/end-user/assessment"
                    className="inline-flex items-center gap-2 bg-[#B8860B] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors"
                  >
                    Take Summative Assessment <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Module Navigation */}
        <div className="flex items-center justify-between mt-8">
          {parseInt(params.id) > 1 ? (
            <Link
              href={`/end-user/modules/${parseInt(params.id) - 1}`}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Module
            </Link>
          ) : (
            <div />
          )}
          {config.next !== null ? (
            <Link
              href={`/end-user/modules/${config.next}`}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Next Module <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      <footer className="border-t border-[#1E3A5F] px-6 py-6 mt-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">© 2026 Nexara DMCC</div>
          <Link href="/end-user/modules" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← All Modules</Link>
        </div>
      </footer>
    </main>
  );
}

