// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { MeetingMinutes, ActionItem, ActionItemStatus } from './types';

let _minutesCounter = 0;
let _actionCounter = 0;

function generateMinutesId(): string {
  return `minutes-${++_minutesCounter}-${Date.now()}`;
}

function generateActionId(): string {
  return `action-${++_actionCounter}-${Date.now()}`;
}

export class MinutesTracker {
  private minutesMap: Map<string, MeetingMinutes> = new Map();
  private actionItemMap: Map<string, ActionItem> = new Map();

  create(meetingId: string, preparedBy: string, preparedAt: string, content: string): MeetingMinutes {
    const id = generateMinutesId();
    const minutes: MeetingMinutes = {
      id,
      meetingId,
      status: 'DRAFT',
      preparedBy,
      preparedAt,
      content,
      actionItems: [],
    };
    this.minutesMap.set(id, minutes);
    return minutes;
  }

  submitForApproval(id: string): MeetingMinutes {
    const minutes = this.minutesMap.get(id);
    if (!minutes) throw new Error(`Minutes not found: ${id}`);
    minutes.status = 'PENDING_APPROVAL';
    return minutes;
  }

  approve(id: string, approvedBy: string, approvedAt: string): MeetingMinutes {
    const minutes = this.minutesMap.get(id);
    if (!minutes) throw new Error(`Minutes not found: ${id}`);
    minutes.status = 'APPROVED';
    minutes.approvedBy = approvedBy;
    minutes.approvedAt = approvedAt;
    return minutes;
  }

  publish(id: string): MeetingMinutes {
    const minutes = this.minutesMap.get(id);
    if (!minutes) throw new Error(`Minutes not found: ${id}`);
    minutes.status = 'PUBLISHED';
    return minutes;
  }

  addActionItem(
    minutesId: string,
    description: string,
    assignedTo: string,
    dueDate: string,
  ): ActionItem {
    const minutes = this.minutesMap.get(minutesId);
    if (!minutes) throw new Error(`Minutes not found: ${minutesId}`);
    const id = generateActionId();
    const item: ActionItem = {
      id,
      minutesId,
      description,
      assignedTo,
      dueDate,
      status: 'OPEN',
    };
    this.actionItemMap.set(id, item);
    minutes.actionItems.push(item);
    return item;
  }

  startActionItem(actionItemId: string): ActionItem {
    const item = this.actionItemMap.get(actionItemId);
    if (!item) throw new Error(`Action item not found: ${actionItemId}`);
    item.status = 'IN_PROGRESS';
    return item;
  }

  completeActionItem(actionItemId: string, completedDate: string): ActionItem {
    const item = this.actionItemMap.get(actionItemId);
    if (!item) throw new Error(`Action item not found: ${actionItemId}`);
    item.status = 'COMPLETED';
    item.completedDate = completedDate;
    return item;
  }

  cancelActionItem(actionItemId: string): ActionItem {
    const item = this.actionItemMap.get(actionItemId);
    if (!item) throw new Error(`Action item not found: ${actionItemId}`);
    item.status = 'CANCELLED';
    return item;
  }

  getByMeeting(meetingId: string): MeetingMinutes[] {
    return Array.from(this.minutesMap.values()).filter((m) => m.meetingId === meetingId);
  }

  getOpenActionItems(): ActionItem[] {
    return Array.from(this.actionItemMap.values()).filter((a) => a.status === 'OPEN');
  }

  getOverdueActionItems(asOf: string): ActionItem[] {
    return Array.from(this.actionItemMap.values()).filter(
      (a) => (a.status === 'OPEN' || a.status === 'IN_PROGRESS') && a.dueDate < asOf,
    );
  }

  getMinutesCount(): number {
    return this.minutesMap.size;
  }

  getActionItemCount(): number {
    return this.actionItemMap.size;
  }
}
