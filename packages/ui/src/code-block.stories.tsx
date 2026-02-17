import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './code-block';

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  argTypes: {
    language: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const JavaScript: Story = {
  args: {
    language: 'javascript',
    children: `const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});`,
  },
};

export const TypeScript: Story = {
  args: {
    language: 'typescript',
    children: `interface RiskAssessment {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  likelihood: number;
  impact: number;
}`,
  },
};

export const SQL: Story = {
  args: {
    language: 'sql',
    children: `SELECT r.id, r.title, r.severity
FROM risk_register r
JOIN risk_controls rc ON rc.risk_id = r.id
WHERE r.status = 'ACTIVE'
ORDER BY r.created_at DESC;`,
  },
};

export const NoLanguage: Story = {
  args: {
    children: 'npm install @ims/ui @ims/rbac @ims/database',
  },
};
