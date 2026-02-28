# E-Learning Design Guide — End User Training

---

## SCORM Package Specification

| Parameter | Specification |
|-----------|--------------|
| SCORM version | SCORM 2004 4th Edition (preferred); SCORM 1.2 (compatibility fallback) |
| Package structure | 6 content modules + 1 summative assessment module = 7 SCORM packages |
| LMS compatibility | Any SCORM 2004-compliant LMS; tested on: Moodle 4.x, Cornerstone, SAP SuccessFactors, Docebo |
| Launch mode | New browser window (not iframe) — required for Nexara sandbox integration |
| Screen dimensions | Design for 1024×768 minimum; responsive scaling to 1920×1080 |
| Completion tracking | SCORM `cmi.completion_status` = "completed" on passing the module knowledge check |
| Score tracking | SCORM `cmi.score.scaled` — reported to LMS after knowledge check submission |
| Suspend/resume | Must support — participants may exit mid-module and resume |

---

## Interaction Types

Each e-learning module should include the following interaction types to maintain engagement and meet WCAG 2.1 AA accessibility requirements:

### Click-Reveal (Information Architecture)

Use for: Feature tours, field explanations, process steps

**Example (Module 1 — Navigation)**: Show a screenshot of the Nexara dashboard. Each labelled component (navigation bar, module sidebar, notification bell) is clickable. Clicking reveals an explanation panel.

**Accessibility**: Ensure click-reveal areas are keyboard-navigable (Tab key); each area has an ARIA label; revelation text is screen-reader accessible.

### Drag-and-Drop Matching

Use for: Categorisation exercises — matching situations to record types, matching fields to their descriptions

**Example (Module 2 — Incidents)**: Present 4 scenarios. Participants drag each scenario card to the correct record type (Incident / Near Miss / Observation). Immediate feedback: green border = correct, red border = incorrect with explanation.

**Accessibility**: Drag-and-drop must have a keyboard alternative (dropdown or list select). Include a "Switch to keyboard mode" option.

### Branching Scenario

Use for: Decision-making exercises — PTW decisions, observation reporting

**Example (Module 4 — PTW)**: "You're about to start hot work. What should you do first?"
- Branch A: Check if a PTW is needed → shows correct permit submission flow
- Branch B: Start work immediately → shows consequence slide + retry
- Branch C: Ask your supervisor → shows "good approach; here's how to complete the PTW"

**Branching rules**: Each wrong branch shows the consequence, explains the correct action, and returns to the decision point. No dead ends.

### Image Annotation

Use for: Interface tours — labelling Nexara screens

**Example**: A screenshot of the incident recording form with numbered hotspots. Participants click each hotspot to see the field name, purpose, and example entry.

---

## Accessibility (WCAG 2.1 AA)

All e-learning modules must meet WCAG 2.1 AA:

| Requirement | Implementation |
|-------------|---------------|
| Perceivable | All images have descriptive alt text; videos have captions; colour is not the only indicator of meaning |
| Operable | All interactions keyboard-navigable; no time limits on content (only on the summative assessment) |
| Understandable | Plain language (Flesch Reading Ease > 60); consistent navigation; error messages are descriptive |
| Robust | Compatible with JAWS, NVDA, and VoiceOver screen readers |

**Minimum font size**: 14pt for body text; 12pt for captions. Never smaller.

**Colour contrast**: All text must meet 4.5:1 contrast ratio against background (WCAG AA). Test with the WebAIM Contrast Checker before sign-off.

---

## Voiceover Script Format

All e-learning modules must include professional voiceover. Script format for Nexara's voiceover recording sessions:

```
[SCREEN: 01-02]
[NARRATION]:
"Welcome to Module 1 — Platform Navigation. In the next 30 minutes,
you'll learn how to log in to Nexara IMS, find your way around the
dashboard, and set up your profile. Let's start by logging in."

[TIMING]: 7 seconds
[VISUAL CUE]: Login screen animation — cursor moves to email field
[TRANSITION]: Fade to next screen
```

- Every screen must have narration
- Narration tone: professional but warm; second-person ("you'll learn" not "learners will learn")
- Reading pace: 130–150 words per minute (typical e-learning rate)
- No background music during narration
- Narration should not simply read the on-screen text — add interpretation and guidance
