// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type MeetingType = 'MANAGEMENT_REVIEW' | 'TEAM' | 'ONE_ON_ONE' | 'BOARD' | 'COMMITTEE' | 'EMERGENCY';
export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
export type AttendeeRole = 'CHAIR' | 'SECRETARY' | 'PRESENTER' | 'ATTENDEE' | 'OBSERVER';
export type ActionItemStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MinutesStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED';

export interface MeetingRecord {
  id: string;
  type: MeetingType;
  title: string;
  status: MeetingStatus;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  location?: string;
  agenda: string[];
  attendees: MeetingAttendee[];
  organizer: string;
  notes?: string;
}

export interface MeetingAttendee {
  userId: string;
  role: AttendeeRole;
  confirmed: boolean;
  attended?: boolean;
}

export interface MeetingMinutes {
  id: string;
  meetingId: string;
  status: MinutesStatus;
  preparedBy: string;
  preparedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  content: string;
  actionItems: ActionItem[];
}

export interface ActionItem {
  id: string;
  minutesId: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: ActionItemStatus;
  completedDate?: string;
}
