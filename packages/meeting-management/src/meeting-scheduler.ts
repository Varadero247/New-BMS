// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { MeetingRecord, MeetingType, MeetingStatus, AttendeeRole } from './types';

let _idCounter = 0;

function generateId(): string {
  return `meeting-${++_idCounter}-${Date.now()}`;
}

export class MeetingScheduler {
  private meetings: Map<string, MeetingRecord> = new Map();

  schedule(
    type: MeetingType,
    title: string,
    scheduledStart: string,
    scheduledEnd: string,
    organizer: string,
    agenda: string[],
    location?: string,
  ): MeetingRecord {
    const id = generateId();
    const record: MeetingRecord = {
      id,
      type,
      title,
      status: 'SCHEDULED',
      scheduledStart,
      scheduledEnd,
      organizer,
      agenda: [...agenda],
      attendees: [],
      location,
    };
    this.meetings.set(id, record);
    return record;
  }

  start(id: string, actualStart: string): MeetingRecord {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    meeting.status = 'IN_PROGRESS';
    meeting.actualStart = actualStart;
    return meeting;
  }

  complete(id: string, actualEnd: string): MeetingRecord {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    meeting.status = 'COMPLETED';
    meeting.actualEnd = actualEnd;
    return meeting;
  }

  cancel(id: string): MeetingRecord {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    meeting.status = 'CANCELLED';
    return meeting;
  }

  postpone(id: string, newStart: string, newEnd: string): MeetingRecord {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    meeting.status = 'POSTPONED';
    meeting.scheduledStart = newStart;
    meeting.scheduledEnd = newEnd;
    return meeting;
  }

  addAttendee(id: string, userId: string, role: AttendeeRole, confirmed: boolean): MeetingRecord {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    meeting.attendees.push({ userId, role, confirmed });
    return meeting;
  }

  confirmAttendance(id: string, userId: string): MeetingRecord {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    const attendee = meeting.attendees.find((a) => a.userId === userId);
    if (!attendee) throw new Error(`Attendee not found: ${userId}`);
    attendee.confirmed = true;
    return meeting;
  }

  markAttended(id: string, userId: string, attended: boolean): MeetingRecord {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    const attendee = meeting.attendees.find((a) => a.userId === userId);
    if (!attendee) throw new Error(`Attendee not found: ${userId}`);
    attendee.attended = attended;
    return meeting;
  }

  get(id: string): MeetingRecord | undefined {
    return this.meetings.get(id);
  }

  getAll(): MeetingRecord[] {
    return Array.from(this.meetings.values());
  }

  getByType(type: MeetingType): MeetingRecord[] {
    return Array.from(this.meetings.values()).filter((m) => m.type === type);
  }

  getByStatus(status: MeetingStatus): MeetingRecord[] {
    return Array.from(this.meetings.values()).filter((m) => m.status === status);
  }

  getByOrganizer(organizer: string): MeetingRecord[] {
    return Array.from(this.meetings.values()).filter((m) => m.organizer === organizer);
  }

  getUpcoming(asOf: string): MeetingRecord[] {
    return Array.from(this.meetings.values()).filter(
      (m) => m.status === 'SCHEDULED' && m.scheduledStart >= asOf,
    );
  }

  getCount(): number {
    return this.meetings.size;
  }
}
