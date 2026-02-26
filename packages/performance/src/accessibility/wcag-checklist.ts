// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * WCAG 2.2 AA Checklist
 *
 * Comprehensive structured data for all WCAG 2.2 Level A and AA success criteria.
 * Each criterion indicates whether it can be tested with automated tools (axe-core)
 * or requires manual review.
 */

export interface WcagCriterion {
  id: string;
  level: 'A' | 'AA';
  name: string;
  description: string;
  automated: boolean;
}

export const WCAG_22_AA_CHECKLIST: WcagCriterion[] = [
  // Principle 1: Perceivable
  // Guideline 1.1 - Text Alternatives
  {
    id: '1.1.1',
    level: 'A',
    name: 'Non-text Content',
    description:
      'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
    automated: true,
  },

  // Guideline 1.2 - Time-based Media
  {
    id: '1.2.1',
    level: 'A',
    name: 'Audio-only and Video-only (Prerecorded)',
    description:
      'For prerecorded audio-only and prerecorded video-only media, an alternative is provided.',
    automated: false,
  },
  {
    id: '1.2.2',
    level: 'A',
    name: 'Captions (Prerecorded)',
    description: 'Captions are provided for all prerecorded audio content in synchronized media.',
    automated: true,
  },
  {
    id: '1.2.3',
    level: 'A',
    name: 'Audio Description or Media Alternative (Prerecorded)',
    description:
      'An alternative for time-based media or audio description of the prerecorded video content is provided.',
    automated: false,
  },
  {
    id: '1.2.4',
    level: 'AA',
    name: 'Captions (Live)',
    description: 'Captions are provided for all live audio content in synchronized media.',
    automated: false,
  },
  {
    id: '1.2.5',
    level: 'AA',
    name: 'Audio Description (Prerecorded)',
    description:
      'Audio description is provided for all prerecorded video content in synchronized media.',
    automated: false,
  },

  // Guideline 1.3 - Adaptable
  {
    id: '1.3.1',
    level: 'A',
    name: 'Info and Relationships',
    description:
      'Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.',
    automated: true,
  },
  {
    id: '1.3.2',
    level: 'A',
    name: 'Meaningful Sequence',
    description:
      'When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.',
    automated: false,
  },
  {
    id: '1.3.3',
    level: 'A',
    name: 'Sensory Characteristics',
    description:
      'Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components.',
    automated: false,
  },
  {
    id: '1.3.4',
    level: 'AA',
    name: 'Orientation',
    description:
      'Content does not restrict its view and operation to a single display orientation unless a specific orientation is essential.',
    automated: true,
  },
  {
    id: '1.3.5',
    level: 'AA',
    name: 'Identify Input Purpose',
    description:
      'The purpose of each input field collecting information about the user can be programmatically determined.',
    automated: true,
  },

  // Guideline 1.4 - Distinguishable
  {
    id: '1.4.1',
    level: 'A',
    name: 'Use of Color',
    description:
      'Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.',
    automated: false,
  },
  {
    id: '1.4.2',
    level: 'A',
    name: 'Audio Control',
    description:
      'If any audio on a web page plays automatically for more than 3 seconds, a mechanism is available to pause, stop, or control the volume.',
    automated: true,
  },
  {
    id: '1.4.3',
    level: 'AA',
    name: 'Contrast (Minimum)',
    description:
      'The visual presentation of text and images of text has a contrast ratio of at least 4.5:1.',
    automated: true,
  },
  {
    id: '1.4.4',
    level: 'AA',
    name: 'Resize Text',
    description:
      'Text can be resized without assistive technology up to 200 percent without loss of content or functionality.',
    automated: false,
  },
  {
    id: '1.4.5',
    level: 'AA',
    name: 'Images of Text',
    description:
      'If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.',
    automated: false,
  },
  {
    id: '1.4.10',
    level: 'AA',
    name: 'Reflow',
    description:
      'Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions.',
    automated: false,
  },
  {
    id: '1.4.11',
    level: 'AA',
    name: 'Non-text Contrast',
    description:
      'The visual presentation of UI components and graphical objects have a contrast ratio of at least 3:1 against adjacent colors.',
    automated: true,
  },
  {
    id: '1.4.12',
    level: 'AA',
    name: 'Text Spacing',
    description:
      'No loss of content or functionality occurs when the user overrides text spacing properties.',
    automated: false,
  },
  {
    id: '1.4.13',
    level: 'AA',
    name: 'Content on Hover or Focus',
    description:
      'Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible, the additional content is dismissible, hoverable, and persistent.',
    automated: false,
  },

  // Principle 2: Operable
  // Guideline 2.1 - Keyboard Accessible
  {
    id: '2.1.1',
    level: 'A',
    name: 'Keyboard',
    description:
      'All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.',
    automated: false,
  },
  {
    id: '2.1.2',
    level: 'A',
    name: 'No Keyboard Trap',
    description:
      'If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface.',
    automated: true,
  },
  {
    id: '2.1.4',
    level: 'A',
    name: 'Character Key Shortcuts',
    description:
      'If a keyboard shortcut is implemented using only letter, punctuation, number, or symbol characters, it can be turned off, remapped, or is only active on focus.',
    automated: false,
  },

  // Guideline 2.2 - Enough Time
  {
    id: '2.2.1',
    level: 'A',
    name: 'Timing Adjustable',
    description:
      'For each time limit that is set by the content, the user can turn off, adjust, or extend the time limit.',
    automated: false,
  },
  {
    id: '2.2.2',
    level: 'A',
    name: 'Pause, Stop, Hide',
    description:
      'For moving, blinking, scrolling, or auto-updating information, there is a mechanism for the user to pause, stop, or hide it.',
    automated: false,
  },

  // Guideline 2.3 - Seizures and Physical Reactions
  {
    id: '2.3.1',
    level: 'A',
    name: 'Three Flashes or Below Threshold',
    description:
      'Web pages do not contain anything that flashes more than three times in any one second period.',
    automated: false,
  },

  // Guideline 2.4 - Navigable
  {
    id: '2.4.1',
    level: 'A',
    name: 'Bypass Blocks',
    description:
      'A mechanism is available to bypass blocks of content that are repeated on multiple web pages.',
    automated: true,
  },
  {
    id: '2.4.2',
    level: 'A',
    name: 'Page Titled',
    description: 'Web pages have titles that describe topic or purpose.',
    automated: true,
  },
  {
    id: '2.4.3',
    level: 'A',
    name: 'Focus Order',
    description:
      'If a web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.',
    automated: false,
  },
  {
    id: '2.4.4',
    level: 'A',
    name: 'Link Purpose (In Context)',
    description:
      'The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.',
    automated: true,
  },
  {
    id: '2.4.5',
    level: 'AA',
    name: 'Multiple Ways',
    description: 'More than one way is available to locate a web page within a set of web pages.',
    automated: false,
  },
  {
    id: '2.4.6',
    level: 'AA',
    name: 'Headings and Labels',
    description: 'Headings and labels describe topic or purpose.',
    automated: true,
  },
  {
    id: '2.4.7',
    level: 'AA',
    name: 'Focus Visible',
    description:
      'Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.',
    automated: false,
  },
  {
    id: '2.4.11',
    level: 'AA',
    name: 'Focus Not Obscured (Minimum)',
    description:
      'When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.',
    automated: false,
  },

  // Guideline 2.5 - Input Modalities
  {
    id: '2.5.1',
    level: 'A',
    name: 'Pointer Gestures',
    description:
      'All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.',
    automated: false,
  },
  {
    id: '2.5.2',
    level: 'A',
    name: 'Pointer Cancellation',
    description:
      'For functionality that can be operated using a single pointer, at least one of the following is true: no down-event, abort/undo, up reversal, or essential.',
    automated: false,
  },
  {
    id: '2.5.3',
    level: 'A',
    name: 'Label in Name',
    description:
      'For user interface components with labels that include text or images of text, the name contains the text that is presented visually.',
    automated: true,
  },
  {
    id: '2.5.4',
    level: 'A',
    name: 'Motion Actuation',
    description:
      'Functionality that can be operated by device motion or user motion can also be operated by user interface components and can be disabled.',
    automated: false,
  },
  {
    id: '2.5.7',
    level: 'AA',
    name: 'Dragging Movements',
    description:
      'All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging.',
    automated: false,
  },
  {
    id: '2.5.8',
    level: 'AA',
    name: 'Target Size (Minimum)',
    description:
      'The size of the target for pointer inputs is at least 24 by 24 CSS pixels, with certain exceptions.',
    automated: true,
  },

  // Principle 3: Understandable
  // Guideline 3.1 - Readable
  {
    id: '3.1.1',
    level: 'A',
    name: 'Language of Page',
    description: 'The default human language of each web page can be programmatically determined.',
    automated: true,
  },
  {
    id: '3.1.2',
    level: 'AA',
    name: 'Language of Parts',
    description:
      'The human language of each passage or phrase in the content can be programmatically determined.',
    automated: true,
  },

  // Guideline 3.2 - Predictable
  {
    id: '3.2.1',
    level: 'A',
    name: 'On Focus',
    description:
      'When any user interface component receives focus, it does not initiate a change of context.',
    automated: false,
  },
  {
    id: '3.2.2',
    level: 'A',
    name: 'On Input',
    description:
      'Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.',
    automated: false,
  },
  {
    id: '3.2.3',
    level: 'AA',
    name: 'Consistent Navigation',
    description:
      'Navigational mechanisms that are repeated on multiple web pages occur in the same relative order each time they are repeated.',
    automated: false,
  },
  {
    id: '3.2.4',
    level: 'AA',
    name: 'Consistent Identification',
    description:
      'Components that have the same functionality within a set of web pages are identified consistently.',
    automated: false,
  },
  {
    id: '3.2.6',
    level: 'AA',
    name: 'Consistent Help',
    description:
      'If a web page contains help mechanisms, they occur in the same relative order on each page.',
    automated: false,
  },

  // Guideline 3.3 - Input Assistance
  {
    id: '3.3.1',
    level: 'A',
    name: 'Error Identification',
    description:
      'If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.',
    automated: true,
  },
  {
    id: '3.3.2',
    level: 'A',
    name: 'Labels or Instructions',
    description: 'Labels or instructions are provided when content requires user input.',
    automated: true,
  },
  {
    id: '3.3.3',
    level: 'AA',
    name: 'Error Suggestion',
    description:
      'If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user.',
    automated: false,
  },
  {
    id: '3.3.4',
    level: 'AA',
    name: 'Error Prevention (Legal, Financial, Data)',
    description:
      'For web pages that cause legal commitments or financial transactions, submissions are reversible, checked, or confirmed.',
    automated: false,
  },
  {
    id: '3.3.7',
    level: 'A',
    name: 'Redundant Entry',
    description:
      'Information previously entered by or provided to the user that is required to be entered again in the same process is either auto-populated or available for the user to select.',
    automated: false,
  },
  {
    id: '3.3.8',
    level: 'AA',
    name: 'Accessible Authentication (Minimum)',
    description:
      'A cognitive function test is not required for any step in an authentication process unless an alternative is available.',
    automated: false,
  },

  // Principle 4: Robust
  // Guideline 4.1 - Compatible
  {
    id: '4.1.1',
    level: 'A',
    name: 'Parsing',
    description:
      'In content implemented using markup languages, elements have complete start and end tags, are nested according to their specifications, do not contain duplicate attributes, and any IDs are unique.',
    automated: true,
  },
  {
    id: '4.1.2',
    level: 'A',
    name: 'Name, Role, Value',
    description:
      'For all user interface components, the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set.',
    automated: true,
  },
  {
    id: '4.1.3',
    level: 'AA',
    name: 'Status Messages',
    description:
      'In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.',
    automated: true,
  },
];
