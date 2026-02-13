'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Zap,
  GitBranch,
  Filter,
  Bell,
  Trash2,
  Save,
  Play,
  Power,
  ChevronDown,
  ArrowDown,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NodeCategory = 'trigger' | 'condition' | 'action' | 'notification';

interface SubTypeOption {
  value: string;
  label: string;
}

interface PaletteItem {
  category: NodeCategory;
  subTypes: SubTypeOption[];
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  icon: typeof Zap;
}

interface WorkflowNode {
  id: string;
  type: NodeCategory;
  subType: string;
  config: Record<string, string>;
  position: number;
}

interface WorkflowState {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  status: 'DRAFT' | 'ACTIVE';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PALETTE: Record<NodeCategory, PaletteItem> = {
  trigger: {
    category: 'trigger',
    subTypes: [
      { value: 'record_created', label: 'Record Created' },
      { value: 'field_changed', label: 'Field Changed' },
      { value: 'date_reached', label: 'Date Reached' },
      { value: 'webhook_received', label: 'Webhook Received' },
      { value: 'event_bus_event', label: 'Event Bus Event' },
      { value: 'schedule_cron', label: 'Schedule (Cron)' },
    ],
    color: 'green',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-700',
    icon: Zap,
  },
  condition: {
    category: 'condition',
    subTypes: [
      { value: 'field_equals', label: 'Field Equals' },
      { value: 'field_contains', label: 'Field Contains' },
      { value: 'field_greater_than', label: 'Field Greater Than' },
      { value: 'field_less_than', label: 'Field Less Than' },
      { value: 'role_is', label: 'Role Is' },
      { value: 'status_is', label: 'Status Is' },
      { value: 'custom_expression', label: 'Custom Expression' },
    ],
    color: 'yellow',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-700',
    icon: Filter,
  },
  action: {
    category: 'action',
    subTypes: [
      { value: 'create_record', label: 'Create Record' },
      { value: 'update_field', label: 'Update Field' },
      { value: 'send_email', label: 'Send Email' },
      { value: 'send_notification', label: 'Send Notification' },
      { value: 'create_task', label: 'Create Task' },
      { value: 'assign_user', label: 'Assign User' },
      { value: 'publish_event', label: 'Publish Event' },
      { value: 'call_webhook', label: 'Call Webhook' },
    ],
    color: 'blue',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-700',
    icon: GitBranch,
  },
  notification: {
    category: 'notification',
    subTypes: [
      { value: 'email', label: 'Email' },
      { value: 'in_app', label: 'In-App' },
      { value: 'sms', label: 'SMS' },
      { value: 'escalation', label: 'Escalation' },
    ],
    color: 'purple',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-700',
    icon: Bell,
  },
};

const CATEGORY_ORDER: NodeCategory[] = ['trigger', 'condition', 'action', 'notification'];

// ---------------------------------------------------------------------------
// ISO Templates
// ---------------------------------------------------------------------------

interface TemplateDefinition {
  name: string;
  description: string;
  nodes: Omit<WorkflowNode, 'id' | 'position'>[];
}

const ISO_TEMPLATES: TemplateDefinition[] = [
  {
    name: 'NCR Approval Chain',
    description: 'Non-conformance report approval with severity routing',
    nodes: [
      { type: 'trigger', subType: 'record_created', config: { module: 'NCR', record_type: 'non_conformance' } },
      { type: 'condition', subType: 'field_greater_than', config: { field: 'severity', value: 'HIGH', operator: '>=' } },
      { type: 'action', subType: 'assign_user', config: { role: 'quality_manager', reason: 'NCR review assignment' } },
      { type: 'notification', subType: 'email', config: { recipient: 'assigned_user', template: 'ncr_review_required' } },
      { type: 'action', subType: 'create_task', config: { task_type: 'review', title: 'Review NCR', due_days: '5' } },
    ],
  },
  {
    name: 'CAPA Lifecycle',
    description: 'Corrective/preventive action full lifecycle management',
    nodes: [
      { type: 'trigger', subType: 'record_created', config: { module: 'CAPA', record_type: 'corrective_action' } },
      { type: 'action', subType: 'assign_user', config: { role: 'capa_owner', reason: 'CAPA investigation assignment' } },
      { type: 'condition', subType: 'custom_expression', config: { expression: 'due_date < NOW()', label: 'Overdue check' } },
      { type: 'notification', subType: 'escalation', config: { recipient: 'manager', escalation_level: '1' } },
      { type: 'action', subType: 'update_field', config: { field: 'status', value: 'ESCALATED' } },
    ],
  },
  {
    name: 'Audit Scheduling',
    description: 'Monthly automated audit creation and assignment',
    nodes: [
      { type: 'trigger', subType: 'schedule_cron', config: { schedule: '0 9 1 * *', label: 'Monthly 1st at 09:00' } },
      { type: 'action', subType: 'create_record', config: { module: 'audit', record_type: 'internal_audit' } },
      { type: 'action', subType: 'assign_user', config: { role: 'lead_auditor', reason: 'Audit assignment' } },
      { type: 'notification', subType: 'email', config: { recipient: 'assigned_user', template: 'audit_scheduled' } },
    ],
  },
  {
    name: 'PTW Approval',
    description: 'Permit to work risk-based approval routing',
    nodes: [
      { type: 'trigger', subType: 'record_created', config: { module: 'permit', record_type: 'permit_to_work' } },
      { type: 'condition', subType: 'field_greater_than', config: { field: 'risk_level', value: 'MEDIUM', operator: '>=' } },
      { type: 'action', subType: 'assign_user', config: { role: 'hse_manager', reason: 'High risk PTW approval' } },
      { type: 'notification', subType: 'in_app', config: { recipient: 'assigned_user', message: 'New PTW requires approval' } },
    ],
  },
  {
    name: 'Document Review',
    description: 'Automated document review cycle with escalation',
    nodes: [
      { type: 'trigger', subType: 'date_reached', config: { field: 'review_due_date', offset_days: '0' } },
      { type: 'notification', subType: 'email', config: { recipient: 'document_controller', template: 'review_due' } },
      { type: 'condition', subType: 'field_greater_than', config: { field: 'days_overdue', value: '7', operator: '>' } },
      { type: 'notification', subType: 'escalation', config: { recipient: 'manager', escalation_level: '1' } },
    ],
  },
  {
    name: 'Incident Escalation',
    description: 'Major incident automatic escalation and investigation',
    nodes: [
      { type: 'trigger', subType: 'record_created', config: { module: 'incident', record_type: 'safety_incident' } },
      { type: 'condition', subType: 'field_greater_than', config: { field: 'severity', value: 'MAJOR', operator: '>=' } },
      { type: 'notification', subType: 'email', config: { recipient: 'hse_manager', template: 'major_incident_alert' } },
      { type: 'action', subType: 'create_task', config: { task_type: 'investigation', title: 'Investigate Incident', due_days: '3' } },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

let nodeCounter = 0;

function createNodeId(): string {
  nodeCounter += 1;
  return `node-${Date.now()}-${nodeCounter}`;
}

function getSubTypeLabel(type: NodeCategory, subType: string): string {
  const item = PALETTE[type];
  return item.subTypes.find((s) => s.value === subType)?.label || subType;
}

function summarizeConfig(config: Record<string, string>): string {
  const parts = Object.entries(config)
    .filter(([, v]) => v)
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${v}`);
  return parts.length > 0 ? parts.join(', ') : 'Not configured';
}

// ---------------------------------------------------------------------------
// Properties panels per type
// ---------------------------------------------------------------------------

function TriggerProperties({
  node,
  onChange,
}: {
  node: WorkflowNode;
  onChange: (updated: WorkflowNode) => void;
}) {
  const setConfig = (key: string, value: string) =>
    onChange({ ...node, config: { ...node.config, [key]: value } });

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Trigger Type</label>
        <select
          value={node.subType}
          onChange={(e) => onChange({ ...node, subType: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        >
          {PALETTE.trigger.subTypes.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Module</label>
        <input
          type="text"
          value={node.config.module || ''}
          onChange={(e) => setConfig('module', e.target.value)}
          placeholder="e.g. NCR, CAPA, incident"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Record Type</label>
        <input
          type="text"
          value={node.config.record_type || ''}
          onChange={(e) => setConfig('record_type', e.target.value)}
          placeholder="e.g. non_conformance"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
      </div>
      {(node.subType === 'schedule_cron') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Cron Expression</label>
          <input
            type="text"
            value={node.config.schedule || ''}
            onChange={(e) => setConfig('schedule', e.target.value)}
            placeholder="0 9 1 * *"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>
      )}
      {(node.subType === 'date_reached') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Date Field</label>
          <input
            type="text"
            value={node.config.field || ''}
            onChange={(e) => setConfig('field', e.target.value)}
            placeholder="review_due_date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>
      )}
      {(node.subType === 'field_changed') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Field Name</label>
          <input
            type="text"
            value={node.config.field || ''}
            onChange={(e) => setConfig('field', e.target.value)}
            placeholder="status"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

function ConditionProperties({
  node,
  onChange,
}: {
  node: WorkflowNode;
  onChange: (updated: WorkflowNode) => void;
}) {
  const setConfig = (key: string, value: string) =>
    onChange({ ...node, config: { ...node.config, [key]: value } });

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Condition Type</label>
        <select
          value={node.subType}
          onChange={(e) => onChange({ ...node, subType: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
        >
          {PALETTE.condition.subTypes.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Field</label>
        <input
          type="text"
          value={node.config.field || ''}
          onChange={(e) => setConfig('field', e.target.value)}
          placeholder="severity"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Operator</label>
        <select
          value={node.config.operator || '=='}
          onChange={(e) => setConfig('operator', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
        >
          <option value="==">Equals (==)</option>
          <option value="!=">Not Equals (!=)</option>
          <option value=">">Greater Than (&gt;)</option>
          <option value=">=">Greater Than or Equal (&gt;=)</option>
          <option value="<">Less Than (&lt;)</option>
          <option value="<=">Less Than or Equal (&lt;=)</option>
          <option value="contains">Contains</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Value</label>
        <input
          type="text"
          value={node.config.value || ''}
          onChange={(e) => setConfig('value', e.target.value)}
          placeholder="HIGH"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
        />
      </div>
      {node.subType === 'custom_expression' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Expression</label>
          <textarea
            value={node.config.expression || ''}
            onChange={(e) => setConfig('expression', e.target.value)}
            placeholder="due_date < NOW()"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

function ActionProperties({
  node,
  onChange,
}: {
  node: WorkflowNode;
  onChange: (updated: WorkflowNode) => void;
}) {
  const setConfig = (key: string, value: string) =>
    onChange({ ...node, config: { ...node.config, [key]: value } });

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Action Type</label>
        <select
          value={node.subType}
          onChange={(e) => onChange({ ...node, subType: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {PALETTE.action.subTypes.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      {(node.subType === 'create_record' || node.subType === 'update_field') && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Target Module</label>
            <input
              type="text"
              value={node.config.module || ''}
              onChange={(e) => setConfig('module', e.target.value)}
              placeholder="audit, task, NCR"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Field</label>
            <input
              type="text"
              value={node.config.field || ''}
              onChange={(e) => setConfig('field', e.target.value)}
              placeholder="status"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Value</label>
            <input
              type="text"
              value={node.config.value || ''}
              onChange={(e) => setConfig('value', e.target.value)}
              placeholder="ACTIVE"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </>
      )}
      {node.subType === 'assign_user' && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Role</label>
            <input
              type="text"
              value={node.config.role || ''}
              onChange={(e) => setConfig('role', e.target.value)}
              placeholder="quality_manager"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Reason</label>
            <input
              type="text"
              value={node.config.reason || ''}
              onChange={(e) => setConfig('reason', e.target.value)}
              placeholder="Assignment reason"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </>
      )}
      {node.subType === 'create_task' && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Task Type</label>
            <input
              type="text"
              value={node.config.task_type || ''}
              onChange={(e) => setConfig('task_type', e.target.value)}
              placeholder="review, investigation"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Title</label>
            <input
              type="text"
              value={node.config.title || ''}
              onChange={(e) => setConfig('title', e.target.value)}
              placeholder="Review NCR"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Due (days)</label>
            <input
              type="number"
              value={node.config.due_days || ''}
              onChange={(e) => setConfig('due_days', e.target.value)}
              placeholder="5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </>
      )}
      {(node.subType === 'send_email' || node.subType === 'send_notification') && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Recipient</label>
            <input
              type="text"
              value={node.config.recipient || ''}
              onChange={(e) => setConfig('recipient', e.target.value)}
              placeholder="assigned_user, manager"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Template</label>
            <input
              type="text"
              value={node.config.template || ''}
              onChange={(e) => setConfig('template', e.target.value)}
              placeholder="notification_template"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </>
      )}
      {node.subType === 'call_webhook' && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">URL</label>
            <input
              type="text"
              value={node.config.url || ''}
              onChange={(e) => setConfig('url', e.target.value)}
              placeholder="https://example.com/webhook"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Method</label>
            <select
              value={node.config.method || 'POST'}
              onChange={(e) => setConfig('method', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </>
      )}
      {node.subType === 'publish_event' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Event Name</label>
          <input
            type="text"
            value={node.config.event_name || ''}
            onChange={(e) => setConfig('event_name', e.target.value)}
            placeholder="record.updated"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

function NotificationProperties({
  node,
  onChange,
}: {
  node: WorkflowNode;
  onChange: (updated: WorkflowNode) => void;
}) {
  const setConfig = (key: string, value: string) =>
    onChange({ ...node, config: { ...node.config, [key]: value } });

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Channel</label>
        <select
          value={node.subType}
          onChange={(e) => onChange({ ...node, subType: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        >
          {PALETTE.notification.subTypes.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Recipient</label>
        <input
          type="text"
          value={node.config.recipient || ''}
          onChange={(e) => setConfig('recipient', e.target.value)}
          placeholder="assigned_user, manager, hse_manager"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        />
      </div>
      {(node.subType === 'email' || node.subType === 'sms') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Message Template</label>
          <input
            type="text"
            value={node.config.template || ''}
            onChange={(e) => setConfig('template', e.target.value)}
            placeholder="ncr_review_required"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>
      )}
      {node.subType === 'in_app' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Message</label>
          <textarea
            value={node.config.message || ''}
            onChange={(e) => setConfig('message', e.target.value)}
            placeholder="New PTW requires approval"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>
      )}
      {node.subType === 'escalation' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">Escalation Level</label>
          <select
            value={node.config.escalation_level || '1'}
            onChange={(e) => setConfig('escalation_level', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="1">Level 1 - Direct Manager</option>
            <option value="2">Level 2 - Department Head</option>
            <option value="3">Level 3 - Executive</option>
          </select>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WorkflowBuilderClient() {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    name: 'New Workflow',
    description: '',
    nodes: [],
    status: 'DRAFT',
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [draggedType, setDraggedType] = useState<{ type: NodeCategory; subType: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId) || null;

  // --- Toast ---
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // --- Node management ---
  const addNode = useCallback(
    (type: NodeCategory, subType: string) => {
      const newNode: WorkflowNode = {
        id: createNodeId(),
        type,
        subType,
        config: {},
        position: workflow.nodes.length,
      };
      setWorkflow((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));
      setSelectedNodeId(newNode.id);
    },
    [workflow.nodes.length],
  );

  const updateNode = useCallback((updated: WorkflowNode) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  }, []);

  const removeNode = useCallback(
    (nodeId: string) => {
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes
          .filter((n) => n.id !== nodeId)
          .map((n, i) => ({ ...n, position: i })),
      }));
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [selectedNodeId],
  );

  // --- Templates ---
  const loadTemplate = useCallback((template: TemplateDefinition) => {
    const nodes: WorkflowNode[] = template.nodes.map((n, i) => ({
      ...n,
      id: createNodeId(),
      position: i,
    }));
    setWorkflow({
      name: template.name,
      description: template.description,
      nodes,
      status: 'DRAFT',
    });
    setSelectedNodeId(null);
    setTemplateDropdownOpen(false);
    showToast(`Loaded template: ${template.name}`, 'success');
  }, [showToast]);

  // --- Save ---
  const handleSave = useCallback(async () => {
    if (!workflow.name.trim()) {
      showToast('Workflow name is required', 'error');
      return;
    }
    if (workflow.nodes.length === 0) {
      showToast('Add at least one node before saving', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/workflows/definitions', {
        name: workflow.name,
        description: workflow.description,
        category: 'CUSTOM',
        triggerType: workflow.nodes[0]?.subType?.toUpperCase() || 'MANUAL',
        steps: workflow.nodes.map((n, i) => ({
          stepOrder: i + 1,
          name: getSubTypeLabel(n.type, n.subType),
          type: n.type.toUpperCase(),
          config: { subType: n.subType, ...n.config },
        })),
        status: workflow.status,
      });
      showToast('Workflow saved successfully', 'success');
    } catch {
      showToast('Failed to save workflow', 'error');
    } finally {
      setSaving(false);
    }
  }, [workflow, showToast]);

  // --- Test ---
  const handleTest = useCallback(() => {
    if (workflow.nodes.length === 0) {
      showToast('Add nodes to test the workflow', 'error');
      return;
    }
    const triggerNodes = workflow.nodes.filter((n) => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      showToast('Workflow needs at least one trigger node', 'error');
      return;
    }
    showToast(`Validation passed: ${workflow.nodes.length} nodes, flow is valid`, 'success');
  }, [workflow.nodes, showToast]);

  // --- Toggle active ---
  const toggleStatus = useCallback(() => {
    setWorkflow((prev) => ({
      ...prev,
      status: prev.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE',
    }));
  }, []);

  // --- Drag & Drop handlers ---
  const handleDragStart = (type: NodeCategory, subType: string) => {
    setDraggedType({ type, subType });
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedType) {
      addNode(draggedType.type, draggedType.subType);
      setDraggedType(null);
    }
  };

  // --- Render helpers ---

  const renderNodeCard = (node: WorkflowNode, index: number) => {
    const palette = PALETTE[node.type];
    const Icon = palette.icon;
    const isSelected = selectedNodeId === node.id;

    return (
      <div key={node.id}>
        {/* Connector line */}
        {index > 0 && (
          <div className="flex justify-center py-1">
            <svg width="24" height="32" viewBox="0 0 24 32" className="text-gray-400">
              <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="2" />
              <polygon points="6,24 12,32 18,24" fill="currentColor" />
            </svg>
          </div>
        )}

        {/* Node card */}
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`group relative mx-auto w-80 cursor-pointer rounded-xl border-2 p-4 shadow-sm transition-all hover:shadow-md ${
            isSelected
              ? `${palette.borderColor} ${palette.bgLight} ring-2 ring-offset-2 ring-${palette.color}-300`
              : `border-gray-200 bg-white hover:${palette.borderColor}`
          }`}
        >
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
            className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 group-hover:block"
          >
            <X className="h-3 w-3" />
          </button>

          <div className="flex items-start space-x-3">
            <div className={`rounded-lg ${palette.bgLight} p-2`}>
              <Icon className={`h-5 w-5 ${palette.textColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${palette.bgLight} ${palette.textColor}`}>
                  {node.type}
                </span>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {getSubTypeLabel(node.type, node.subType)}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {summarizeConfig(node.config)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Layout ---

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center space-x-2 rounded-lg px-4 py-3 shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => setWorkflow((prev) => ({ ...prev, name: e.target.value }))}
            className="border-b border-transparent bg-transparent text-lg font-semibold text-gray-900 focus:border-indigo-500 focus:outline-none"
            placeholder="Workflow Name"
          />
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              workflow.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {workflow.status}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Template dropdown */}
          <div className="relative">
            <button
              onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
              className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>ISO Templates</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {templateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setTemplateDropdownOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="p-2">
                    <p className="px-2 py-1 text-xs font-semibold uppercase text-gray-400">
                      Built-in Templates
                    </p>
                    {ISO_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        onClick={() => loadTemplate(tpl)}
                        className="w-full rounded-md px-2 py-2 text-left hover:bg-indigo-50"
                      >
                        <p className="text-sm font-medium text-gray-900">{tpl.name}</p>
                        <p className="text-xs text-gray-500">{tpl.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleTest}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Play className="h-4 w-4" />
            <span>Test</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={toggleStatus}
            className={`flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium ${
              workflow.status === 'ACTIVE'
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            <Power className="h-4 w-4" />
            <span>{workflow.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
          </button>
        </div>
      </div>

      {/* Description row */}
      <div className="border-b border-gray-100 bg-white px-4 py-2">
        <input
          type="text"
          value={workflow.description}
          onChange={(e) => setWorkflow((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full bg-transparent text-sm text-gray-500 placeholder-gray-400 focus:outline-none"
          placeholder="Add a description for this workflow..."
        />
      </div>

      {/* Main area: sidebar + canvas + properties */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-60 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Node Palette
          </h3>
          {CATEGORY_ORDER.map((cat) => {
            const palette = PALETTE[cat];
            const Icon = palette.icon;

            return (
              <div key={cat} className="mb-5">
                <div className="mb-2 flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${palette.textColor}`} />
                  <span className={`text-xs font-semibold uppercase ${palette.textColor}`}>
                    {cat}
                  </span>
                </div>
                <div className="space-y-1">
                  {palette.subTypes.map((st) => (
                    <div
                      key={st.value}
                      draggable
                      onDragStart={() => handleDragStart(cat, st.value)}
                      onClick={() => addNode(cat, st.value)}
                      className={`cursor-grab rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:border-${palette.color}-300 hover:${palette.bgLight} hover:shadow-sm active:cursor-grabbing`}
                    >
                      {st.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Canvas */}
        <div
          ref={canvasRef}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white"
        >
          <div className="mx-auto max-w-lg px-4 py-8">
            {workflow.nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="rounded-full bg-indigo-100 p-4">
                  <GitBranch className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Start Building Your Workflow
                </h3>
                <p className="mt-2 max-w-xs text-sm text-gray-500">
                  Click a node type from the left palette or drag it onto this canvas. Load an ISO
                  template from the toolbar to get started quickly.
                </p>
                <div className="mt-6 flex items-center space-x-3">
                  <button
                    onClick={() => addNode('trigger', 'record_created')}
                    className="flex items-center space-x-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Trigger</span>
                  </button>
                  <button
                    onClick={() => setTemplateDropdownOpen(true)}
                    className="flex items-center space-x-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span>Load Template</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {workflow.nodes.map((node, index) => renderNodeCard(node, index))}

                {/* Add node button */}
                <div className="flex justify-center py-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-300">
                    <line x1="12" y1="0" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
                  </svg>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    {CATEGORY_ORDER.map((cat) => {
                      const palette = PALETTE[cat];
                      const Icon = palette.icon;
                      return (
                        <button
                          key={cat}
                          onClick={() => addNode(cat, palette.subTypes[0].value)}
                          className={`flex items-center space-x-1 rounded-lg border-2 border-dashed px-3 py-2 text-xs font-medium transition-colors ${palette.borderColor} ${palette.textColor} hover:${palette.bgLight}`}
                          title={`Add ${cat} node`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="capitalize">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-72 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
          {selectedNode ? (
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Node Properties</h3>
                <button
                  onClick={() => removeNode(selectedNode.id)}
                  className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                  title="Delete node"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const p = PALETTE[selectedNode.type];
                    const Icon = p.icon;
                    return (
                      <>
                        <div className={`rounded-lg ${p.bgLight} p-2`}>
                          <Icon className={`h-5 w-5 ${p.textColor}`} />
                        </div>
                        <div>
                          <span className={`text-xs font-semibold uppercase ${p.textColor}`}>
                            {selectedNode.type}
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {getSubTypeLabel(selectedNode.type, selectedNode.subType)}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <hr className="mb-4" />

              {selectedNode.type === 'trigger' && (
                <TriggerProperties node={selectedNode} onChange={updateNode} />
              )}
              {selectedNode.type === 'condition' && (
                <ConditionProperties node={selectedNode} onChange={updateNode} />
              )}
              {selectedNode.type === 'action' && (
                <ActionProperties node={selectedNode} onChange={updateNode} />
              )}
              {selectedNode.type === 'notification' && (
                <NotificationProperties node={selectedNode} onChange={updateNode} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-gray-100 p-3">
                <Filter className="h-6 w-6 text-gray-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-500">No Node Selected</p>
              <p className="mt-1 text-xs text-gray-400">
                Click a node on the canvas to view and edit its properties.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
