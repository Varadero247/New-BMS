import type { Meta, StoryObj } from '@storybook/react';
import { OfflineInspectionForm, type InspectionSection } from './offline-form';

const meta: Meta<typeof OfflineInspectionForm> = {
  title: 'Components/OfflineInspectionForm',
  component: OfflineInspectionForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OfflineInspectionForm>;

const sampleSections: InspectionSection[] = [
  {
    title: 'General Conditions',
    questions: [
      { id: 'q1', label: 'Is the work area clean and tidy?', type: 'checkbox', required: true },
      { id: 'q2', label: 'Are emergency exits clear?', type: 'checkbox', required: true },
      { id: 'q3', label: 'Housekeeping rating', type: 'number', required: true },
      { id: 'q4', label: 'General observations', type: 'text', required: false },
    ],
  },
  {
    title: 'PPE Compliance',
    questions: [
      { id: 'q5', label: 'Are all workers wearing required PPE?', type: 'checkbox', required: true },
      { id: 'q6', label: 'PPE condition', type: 'select', required: true, options: ['Good', 'Fair', 'Poor', 'Replace'] },
      { id: 'q7', label: 'PPE deficiencies found', type: 'text', required: false },
    ],
  },
  {
    title: 'Equipment',
    questions: [
      { id: 'q8', label: 'Equipment inspection date', type: 'datetime', required: true },
      { id: 'q9', label: 'Number of items checked', type: 'number', required: true },
      { id: 'q10', label: 'All equipment in safe working order?', type: 'checkbox', required: true },
    ],
  },
];

export const Default: Story = {
  args: {
    templateId: 'tpl-workplace-inspection',
    templateTitle: 'Workplace Safety Inspection',
    sections: sampleSections,
    onSubmit: async (responses) => {
      console.log('Inspection submitted:', responses);
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
};

export const SimpleForm: Story = {
  args: {
    templateId: 'tpl-fire-check',
    templateTitle: 'Daily Fire Equipment Check',
    sections: [
      {
        title: 'Fire Equipment',
        questions: [
          { id: 'f1', label: 'Are all fire extinguishers in place?', type: 'checkbox', required: true },
          { id: 'f2', label: 'Fire alarm panel status', type: 'select', required: true, options: ['Normal', 'Fault', 'Silenced'] },
          { id: 'f3', label: 'Notes', type: 'text', required: false },
        ],
      },
    ],
    onSubmit: async (responses) => console.log('Submitted:', responses),
  },
};
