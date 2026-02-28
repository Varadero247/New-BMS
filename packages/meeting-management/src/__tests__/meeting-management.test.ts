// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { MeetingScheduler } from '../meeting-scheduler';
import { MinutesTracker } from '../minutes-tracker';
import {
  MeetingType,
  MeetingStatus,
  AttendeeRole,
  ActionItemStatus,
  MinutesStatus,
} from '../types';

// ─── MeetingScheduler ────────────────────────────────────────────────────────

describe('MeetingScheduler', () => {
  let scheduler: MeetingScheduler;

  beforeEach(() => {
    scheduler = new MeetingScheduler();
  });

  // ── schedule ────────────────────────────────────────────────────────────────

  describe('schedule()', () => {
    const types: MeetingType[] = [
      'MANAGEMENT_REVIEW',
      'TEAM',
      'ONE_ON_ONE',
      'BOARD',
      'COMMITTEE',
      'EMERGENCY',
    ];

    types.forEach((type) => {
      it(`creates a SCHEDULED meeting of type ${type}`, () => {
        const m = scheduler.schedule(
          type,
          `${type} meeting`,
          '2026-03-01T09:00:00Z',
          '2026-03-01T10:00:00Z',
          'organizer@ims.local',
          ['Agenda item'],
        );
        expect(m.type).toBe(type);
        expect(m.status).toBe('SCHEDULED');
      });
    });

    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`schedule() assigns unique id for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'TEAM',
          `Meeting ${i}`,
          `2026-03-${String(i % 28 + 1).padStart(2, '0')}T09:00:00Z`,
          `2026-03-${String(i % 28 + 1).padStart(2, '0')}T10:00:00Z`,
          `org${i}@ims.local`,
          [`Agenda ${i}`],
        );
        expect(m.id).toBeDefined();
        expect(typeof m.id).toBe('string');
        expect(m.id.length).toBeGreaterThan(0);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`schedule() stores title correctly for meeting ${i}`, () => {
        const title = `Project Review Meeting ${i}`;
        const m = scheduler.schedule(
          'MANAGEMENT_REVIEW',
          title,
          '2026-04-01T10:00:00Z',
          '2026-04-01T11:00:00Z',
          'chair@ims.local',
          ['Topic A', 'Topic B'],
        );
        expect(m.title).toBe(title);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`schedule() stores organizer correctly for meeting ${i}`, () => {
        const org = `organizer${i}@ims.local`;
        const m = scheduler.schedule(
          'BOARD',
          `Board Meeting ${i}`,
          '2026-05-01T09:00:00Z',
          '2026-05-01T12:00:00Z',
          org,
          ['Finance Review'],
        );
        expect(m.organizer).toBe(org);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`schedule() stores agenda items for meeting ${i}`, () => {
        const agenda = [`Item A-${i}`, `Item B-${i}`, `Item C-${i}`];
        const m = scheduler.schedule(
          'COMMITTEE',
          `Committee Meeting ${i}`,
          '2026-06-01T08:00:00Z',
          '2026-06-01T09:00:00Z',
          'sec@ims.local',
          agenda,
        );
        expect(m.agenda).toEqual(agenda);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`schedule() stores location when provided for meeting ${i}`, () => {
        const location = `Room ${i + 1}`;
        const m = scheduler.schedule(
          'TEAM',
          `Team Meeting ${i}`,
          '2026-07-01T09:00:00Z',
          '2026-07-01T10:00:00Z',
          'lead@ims.local',
          ['Sprint review'],
          location,
        );
        expect(m.location).toBe(location);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`schedule() starts with empty attendees list for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'ONE_ON_ONE',
          `1:1 Meeting ${i}`,
          '2026-08-01T09:00:00Z',
          '2026-08-01T09:30:00Z',
          'mgr@ims.local',
          ['Performance review'],
        );
        expect(m.attendees).toEqual([]);
      });
    });

    it('schedule() without location leaves location undefined', () => {
      const m = scheduler.schedule(
        'EMERGENCY',
        'Emergency Call',
        '2026-03-10T14:00:00Z',
        '2026-03-10T15:00:00Z',
        'ceo@ims.local',
        ['Crisis response'],
      );
      expect(m.location).toBeUndefined();
    });

    it('schedule() stores scheduledStart correctly', () => {
      const start = '2026-09-15T10:30:00Z';
      const m = scheduler.schedule('TEAM', 'Test', start, '2026-09-15T11:30:00Z', 'u@ims.local', []);
      expect(m.scheduledStart).toBe(start);
    });

    it('schedule() stores scheduledEnd correctly', () => {
      const end = '2026-09-15T11:30:00Z';
      const m = scheduler.schedule('TEAM', 'Test', '2026-09-15T10:30:00Z', end, 'u@ims.local', []);
      expect(m.scheduledEnd).toBe(end);
    });

    it('schedule() increments getCount()', () => {
      expect(scheduler.getCount()).toBe(0);
      scheduler.schedule('TEAM', 'M1', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'a@b.com', []);
      expect(scheduler.getCount()).toBe(1);
      scheduler.schedule('BOARD', 'M2', '2026-03-02T09:00:00Z', '2026-03-02T10:00:00Z', 'a@b.com', []);
      expect(scheduler.getCount()).toBe(2);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`schedule() agenda is a copy (mutation safe) for meeting ${i}`, () => {
        const agenda = [`Agenda ${i}`];
        const m = scheduler.schedule('TEAM', 'Test', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', agenda);
        agenda.push('extra item');
        expect(m.agenda).toHaveLength(1);
      });
    });
  });

  // ── start ────────────────────────────────────────────────────────────────────

  describe('start()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`start() sets status to IN_PROGRESS for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'TEAM',
          `Meeting ${i}`,
          `2026-03-01T09:00:00Z`,
          `2026-03-01T10:00:00Z`,
          `org${i}@ims.local`,
          ['Item'],
        );
        const started = scheduler.start(m.id, `2026-03-01T09:0${i % 10}:00Z`);
        expect(started.status).toBe('IN_PROGRESS');
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`start() records actualStart for meeting ${i}`, () => {
        const m = scheduler.schedule('TEAM', `M${i}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const actualStart = `2026-03-01T09:0${i % 10}:00Z`;
        scheduler.start(m.id, actualStart);
        expect(scheduler.get(m.id)?.actualStart).toBe(actualStart);
      });
    });

    it('start() throws for unknown id', () => {
      expect(() => scheduler.start('nonexistent', '2026-03-01T09:00:00Z')).toThrow('Meeting not found');
    });

    it('start() returns the updated meeting', () => {
      const m = scheduler.schedule('TEAM', 'Test', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      const result = scheduler.start(m.id, '2026-03-01T09:01:00Z');
      expect(result.id).toBe(m.id);
      expect(result.status).toBe('IN_PROGRESS');
    });
  });

  // ── complete ─────────────────────────────────────────────────────────────────

  describe('complete()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`complete() sets status to COMPLETED for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'MANAGEMENT_REVIEW',
          `MR ${i}`,
          '2026-04-01T09:00:00Z',
          '2026-04-01T11:00:00Z',
          'coo@ims.local',
          ['Review KPIs'],
        );
        scheduler.start(m.id, '2026-04-01T09:05:00Z');
        const completed = scheduler.complete(m.id, `2026-04-01T10:${String(i % 60).padStart(2, '0')}:00Z`);
        expect(completed.status).toBe('COMPLETED');
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`complete() records actualEnd for meeting ${i}`, () => {
        const m = scheduler.schedule('BOARD', `B${i}`, '2026-05-01T09:00:00Z', '2026-05-01T12:00:00Z', 'x', []);
        const actualEnd = `2026-05-01T11:${String(i % 60).padStart(2, '0')}:00Z`;
        scheduler.complete(m.id, actualEnd);
        expect(scheduler.get(m.id)?.actualEnd).toBe(actualEnd);
      });
    });

    it('complete() throws for unknown id', () => {
      expect(() => scheduler.complete('ghost', '2026-05-01T10:00:00Z')).toThrow('Meeting not found');
    });

    it('complete() returns the updated meeting', () => {
      const m = scheduler.schedule('TEAM', 'Test', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      const result = scheduler.complete(m.id, '2026-03-01T10:05:00Z');
      expect(result.id).toBe(m.id);
      expect(result.status).toBe('COMPLETED');
    });
  });

  // ── cancel ───────────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`cancel() sets status to CANCELLED for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'COMMITTEE',
          `Committee ${i}`,
          '2026-06-01T09:00:00Z',
          '2026-06-01T10:00:00Z',
          'admin@ims.local',
          ['Agenda'],
        );
        const cancelled = scheduler.cancel(m.id);
        expect(cancelled.status).toBe('CANCELLED');
      });
    });

    it('cancel() throws for unknown id', () => {
      expect(() => scheduler.cancel('bad-id')).toThrow('Meeting not found');
    });

    it('cancel() returns the updated meeting', () => {
      const m = scheduler.schedule('EMERGENCY', 'Emerg', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      const result = scheduler.cancel(m.id);
      expect(result.id).toBe(m.id);
    });
  });

  // ── postpone ─────────────────────────────────────────────────────────────────

  describe('postpone()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`postpone() sets status to POSTPONED for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'BOARD',
          `Board ${i}`,
          '2026-03-01T09:00:00Z',
          '2026-03-01T10:00:00Z',
          'ceo@ims.local',
          ['Q1 Results'],
        );
        const postponed = scheduler.postpone(
          m.id,
          `2026-03-${String(i % 28 + 2).padStart(2, '0')}T09:00:00Z`,
          `2026-03-${String(i % 28 + 2).padStart(2, '0')}T10:00:00Z`,
        );
        expect(postponed.status).toBe('POSTPONED');
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`postpone() updates scheduledStart for meeting ${i}`, () => {
        const m = scheduler.schedule('TEAM', `T${i}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const newStart = `2026-04-${String(i % 28 + 1).padStart(2, '0')}T09:00:00Z`;
        const newEnd = `2026-04-${String(i % 28 + 1).padStart(2, '0')}T10:00:00Z`;
        scheduler.postpone(m.id, newStart, newEnd);
        expect(scheduler.get(m.id)?.scheduledStart).toBe(newStart);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`postpone() updates scheduledEnd for meeting ${i}`, () => {
        const m = scheduler.schedule('TEAM', `T${i}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const newStart = `2026-05-${String(i % 28 + 1).padStart(2, '0')}T09:00:00Z`;
        const newEnd = `2026-05-${String(i % 28 + 1).padStart(2, '0')}T11:00:00Z`;
        scheduler.postpone(m.id, newStart, newEnd);
        expect(scheduler.get(m.id)?.scheduledEnd).toBe(newEnd);
      });
    });

    it('postpone() throws for unknown id', () => {
      expect(() => scheduler.postpone('nope', '2026-04-01T09:00:00Z', '2026-04-01T10:00:00Z')).toThrow('Meeting not found');
    });
  });

  // ── addAttendee ───────────────────────────────────────────────────────────────

  describe('addAttendee()', () => {
    const roles: AttendeeRole[] = ['CHAIR', 'SECRETARY', 'PRESENTER', 'ATTENDEE', 'OBSERVER'];

    roles.forEach((role) => {
      it(`addAttendee() adds attendee with role ${role}`, () => {
        const m = scheduler.schedule('TEAM', 'Test', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        scheduler.addAttendee(m.id, `user-${role}@ims.local`, role, false);
        const updated = scheduler.get(m.id);
        const attendee = updated?.attendees.find((a) => a.role === role);
        expect(attendee).toBeDefined();
        expect(attendee?.role).toBe(role);
      });
    });

    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`addAttendee() pushes attendee userId correctly for index ${i}`, () => {
        const m = scheduler.schedule('BOARD', 'Board', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const userId = `user${i}@ims.local`;
        scheduler.addAttendee(m.id, userId, 'ATTENDEE', i % 2 === 0);
        const updated = scheduler.get(m.id);
        expect(updated?.attendees.some((a) => a.userId === userId)).toBe(true);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`addAttendee() sets confirmed=${i % 2 === 0} for attendee ${i}`, () => {
        const m = scheduler.schedule('TEAM', 'T', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const confirmed = i % 2 === 0;
        scheduler.addAttendee(m.id, `u${i}@ims.local`, 'ATTENDEE', confirmed);
        const att = scheduler.get(m.id)?.attendees.find((a) => a.userId === `u${i}@ims.local`);
        expect(att?.confirmed).toBe(confirmed);
      });
    });

    it('addAttendee() throws for unknown meeting id', () => {
      expect(() => scheduler.addAttendee('ghost', 'user@ims.local', 'ATTENDEE', false)).toThrow('Meeting not found');
    });

    it('addAttendee() can add multiple attendees', () => {
      const m = scheduler.schedule('COMMITTEE', 'C', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      scheduler.addAttendee(m.id, 'a@b.com', 'CHAIR', true);
      scheduler.addAttendee(m.id, 'b@b.com', 'SECRETARY', true);
      scheduler.addAttendee(m.id, 'c@b.com', 'ATTENDEE', false);
      expect(scheduler.get(m.id)?.attendees).toHaveLength(3);
    });
  });

  // ── confirmAttendance ────────────────────────────────────────────────────────

  describe('confirmAttendance()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`confirmAttendance() sets confirmed=true for attendee ${i}`, () => {
        const m = scheduler.schedule('TEAM', `TM${i}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const userId = `confirm${i}@ims.local`;
        scheduler.addAttendee(m.id, userId, 'ATTENDEE', false);
        scheduler.confirmAttendance(m.id, userId);
        const att = scheduler.get(m.id)?.attendees.find((a) => a.userId === userId);
        expect(att?.confirmed).toBe(true);
      });
    });

    it('confirmAttendance() throws for unknown meeting', () => {
      expect(() => scheduler.confirmAttendance('x', 'u@b.com')).toThrow('Meeting not found');
    });

    it('confirmAttendance() throws when attendee not in meeting', () => {
      const m = scheduler.schedule('TEAM', 'Test', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      expect(() => scheduler.confirmAttendance(m.id, 'nobody@ims.local')).toThrow('Attendee not found');
    });

    it('confirmAttendance() already-true stays true', () => {
      const m = scheduler.schedule('BOARD', 'Board', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      scheduler.addAttendee(m.id, 'ceo@ims.local', 'CHAIR', true);
      scheduler.confirmAttendance(m.id, 'ceo@ims.local');
      expect(scheduler.get(m.id)?.attendees[0].confirmed).toBe(true);
    });
  });

  // ── markAttended ─────────────────────────────────────────────────────────────

  describe('markAttended()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`markAttended() sets attended=${i % 3 !== 0} for attendee ${i}`, () => {
        const m = scheduler.schedule('TEAM', `T${i}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const userId = `mark${i}@ims.local`;
        const attended = i % 3 !== 0;
        scheduler.addAttendee(m.id, userId, 'ATTENDEE', true);
        scheduler.markAttended(m.id, userId, attended);
        const att = scheduler.get(m.id)?.attendees.find((a) => a.userId === userId);
        expect(att?.attended).toBe(attended);
      });
    });

    it('markAttended() throws for unknown meeting', () => {
      expect(() => scheduler.markAttended('xxx', 'u@b.com', true)).toThrow('Meeting not found');
    });

    it('markAttended() throws when attendee not in meeting', () => {
      const m = scheduler.schedule('TEAM', 'T', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      expect(() => scheduler.markAttended(m.id, 'ghost@ims.local', true)).toThrow('Attendee not found');
    });
  });

  // ── get / getAll ────────────────────────────────────────────────────────────

  describe('get() and getAll()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`get() retrieves scheduled meeting ${i} by id`, () => {
        const m = scheduler.schedule(
          'TEAM',
          `Meeting ${i}`,
          '2026-03-01T09:00:00Z',
          '2026-03-01T10:00:00Z',
          `org${i}@ims.local`,
          [],
        );
        const retrieved = scheduler.get(m.id);
        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(m.id);
        expect(retrieved?.title).toBe(`Meeting ${i}`);
      });
    });

    it('get() returns undefined for unknown id', () => {
      expect(scheduler.get('unknown-id')).toBeUndefined();
    });

    it('getAll() returns all scheduled meetings', () => {
      const count = 5;
      for (let i = 0; i < count; i++) {
        scheduler.schedule('TEAM', `M${i}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      }
      expect(scheduler.getAll()).toHaveLength(count);
    });

    it('getAll() returns empty array when no meetings', () => {
      expect(scheduler.getAll()).toEqual([]);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getAll() length equals getCount() after ${i + 1} meetings`, () => {
        for (let j = 0; j <= i; j++) {
          scheduler.schedule('TEAM', `M${j}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        }
        expect(scheduler.getAll()).toHaveLength(scheduler.getCount());
        scheduler = new MeetingScheduler();
      });
    });
  });

  // ── getByType ────────────────────────────────────────────────────────────────

  describe('getByType()', () => {
    const types: MeetingType[] = [
      'MANAGEMENT_REVIEW',
      'TEAM',
      'ONE_ON_ONE',
      'BOARD',
      'COMMITTEE',
      'EMERGENCY',
    ];

    types.forEach((type) => {
      it(`getByType() filters by ${type}`, () => {
        scheduler.schedule(type, `${type} 1`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        scheduler.schedule(type, `${type} 2`, '2026-03-02T09:00:00Z', '2026-03-02T10:00:00Z', 'x', []);
        // Add other types as noise
        const otherType = types.find((t) => t !== type)!;
        scheduler.schedule(otherType, 'noise', '2026-03-03T09:00:00Z', '2026-03-03T10:00:00Z', 'x', []);
        const result = scheduler.getByType(type);
        expect(result.length).toBe(2);
        result.forEach((m) => expect(m.type).toBe(type));
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByType(TEAM) returns correct count for iteration ${i}`, () => {
        for (let j = 0; j <= i; j++) {
          scheduler.schedule('TEAM', `Team ${j}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        }
        scheduler.schedule('BOARD', 'Board noise', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        expect(scheduler.getByType('TEAM')).toHaveLength(i + 1);
        scheduler = new MeetingScheduler();
      });
    });

    it('getByType() returns empty array when no matching type', () => {
      scheduler.schedule('TEAM', 'T', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
      expect(scheduler.getByType('EMERGENCY')).toHaveLength(0);
    });
  });

  // ── getByStatus ──────────────────────────────────────────────────────────────

  describe('getByStatus()', () => {
    const statuses: MeetingStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'];

    statuses.forEach((status) => {
      it(`getByStatus() returns meetings in status ${status}`, () => {
        const m1 = scheduler.schedule('TEAM', 'M1', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        const m2 = scheduler.schedule('TEAM', 'M2', '2026-03-02T09:00:00Z', '2026-03-02T10:00:00Z', 'x', []);
        if (status === 'IN_PROGRESS') {
          scheduler.start(m1.id, '2026-03-01T09:05:00Z');
          scheduler.start(m2.id, '2026-03-02T09:05:00Z');
        } else if (status === 'COMPLETED') {
          scheduler.complete(m1.id, '2026-03-01T10:05:00Z');
          scheduler.complete(m2.id, '2026-03-02T10:05:00Z');
        } else if (status === 'CANCELLED') {
          scheduler.cancel(m1.id);
          scheduler.cancel(m2.id);
        } else if (status === 'POSTPONED') {
          scheduler.postpone(m1.id, '2026-04-01T09:00:00Z', '2026-04-01T10:00:00Z');
          scheduler.postpone(m2.id, '2026-04-02T09:00:00Z', '2026-04-02T10:00:00Z');
        }
        const result = scheduler.getByStatus(status);
        expect(result.length).toBe(2);
        result.forEach((m) => expect(m.status).toBe(status));
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByStatus(SCHEDULED) count matches ${i + 1} scheduled meetings`, () => {
        for (let j = 0; j <= i; j++) {
          scheduler.schedule('TEAM', `M${j}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        }
        expect(scheduler.getByStatus('SCHEDULED')).toHaveLength(i + 1);
        scheduler = new MeetingScheduler();
      });
    });
  });

  // ── getByOrganizer ───────────────────────────────────────────────────────────

  describe('getByOrganizer()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getByOrganizer() filters by organizer for meeting ${i}`, () => {
        const org = `org${i}@ims.local`;
        scheduler.schedule('TEAM', `M${i}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', org, []);
        scheduler.schedule('BOARD', `Other`, '2026-03-02T09:00:00Z', '2026-03-02T10:00:00Z', 'noise@ims.local', []);
        const result = scheduler.getByOrganizer(org);
        expect(result.length).toBeGreaterThanOrEqual(1);
        result.forEach((m) => expect(m.organizer).toBe(org));
        scheduler = new MeetingScheduler();
      });
    });

    it('getByOrganizer() returns empty when no match', () => {
      scheduler.schedule('TEAM', 'Test', '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'a@ims.local', []);
      expect(scheduler.getByOrganizer('nobody@ims.local')).toHaveLength(0);
    });
  });

  // ── getUpcoming ──────────────────────────────────────────────────────────────

  describe('getUpcoming()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getUpcoming() returns SCHEDULED meetings with start >= asOf (iteration ${i})`, () => {
        const asOf = '2026-06-01T00:00:00Z';
        // Future meeting
        scheduler.schedule(
          'TEAM',
          `Future ${i}`,
          `2026-0${6 + (i % 3)}T09:00:00Z`,
          `2026-0${6 + (i % 3)}T10:00:00Z`,
          'x',
          [],
        );
        // Past meeting
        scheduler.schedule('BOARD', `Past ${i}`, '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', 'x', []);
        const upcoming = scheduler.getUpcoming(asOf);
        upcoming.forEach((m) => {
          expect(m.status).toBe('SCHEDULED');
          expect(m.scheduledStart >= asOf).toBe(true);
        });
        scheduler = new MeetingScheduler();
      });
    });

    it('getUpcoming() does not return cancelled meetings', () => {
      const m = scheduler.schedule('TEAM', 'Test', '2026-12-01T09:00:00Z', '2026-12-01T10:00:00Z', 'x', []);
      scheduler.cancel(m.id);
      expect(scheduler.getUpcoming('2026-01-01T00:00:00Z')).toHaveLength(0);
    });

    it('getUpcoming() does not return postponed meetings', () => {
      const m = scheduler.schedule('TEAM', 'Test', '2026-12-01T09:00:00Z', '2026-12-01T10:00:00Z', 'x', []);
      scheduler.postpone(m.id, '2026-12-15T09:00:00Z', '2026-12-15T10:00:00Z');
      expect(scheduler.getUpcoming('2026-01-01T00:00:00Z')).toHaveLength(0);
    });

    it('getUpcoming() returns empty when all past', () => {
      scheduler.schedule('TEAM', 'Past', '2025-01-01T09:00:00Z', '2025-01-01T10:00:00Z', 'x', []);
      expect(scheduler.getUpcoming('2026-01-01T00:00:00Z')).toHaveLength(0);
    });
  });

  // ── getCount ─────────────────────────────────────────────────────────────────

  describe('getCount()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getCount() returns ${i + 1} after ${i + 1} schedules`, () => {
        for (let j = 0; j <= i; j++) {
          scheduler.schedule('TEAM', `M${j}`, '2026-03-01T09:00:00Z', '2026-03-01T10:00:00Z', 'x', []);
        }
        expect(scheduler.getCount()).toBe(i + 1);
        scheduler = new MeetingScheduler();
      });
    });

    it('getCount() is 0 initially', () => {
      expect(scheduler.getCount()).toBe(0);
    });
  });

  // ── end-to-end transitions ───────────────────────────────────────────────────

  describe('status transitions', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`full lifecycle SCHEDULED→IN_PROGRESS→COMPLETED for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'MANAGEMENT_REVIEW',
          `Review ${i}`,
          '2026-03-01T09:00:00Z',
          '2026-03-01T11:00:00Z',
          'coo@ims.local',
          ['KPI Review', 'Action Items', 'Next Steps'],
          'Boardroom',
        );
        expect(m.status).toBe('SCHEDULED');
        scheduler.start(m.id, '2026-03-01T09:05:00Z');
        expect(scheduler.get(m.id)?.status).toBe('IN_PROGRESS');
        scheduler.complete(m.id, '2026-03-01T10:55:00Z');
        expect(scheduler.get(m.id)?.status).toBe('COMPLETED');
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`lifecycle SCHEDULED→CANCELLED for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'BOARD',
          `Board ${i}`,
          '2026-04-01T09:00:00Z',
          '2026-04-01T12:00:00Z',
          'ceo@ims.local',
          ['Strategy'],
        );
        expect(m.status).toBe('SCHEDULED');
        scheduler.cancel(m.id);
        expect(scheduler.get(m.id)?.status).toBe('CANCELLED');
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`lifecycle SCHEDULED→POSTPONED for meeting ${i}`, () => {
        const m = scheduler.schedule(
          'COMMITTEE',
          `Committee ${i}`,
          '2026-05-01T09:00:00Z',
          '2026-05-01T11:00:00Z',
          'secretary@ims.local',
          ['Budget', 'HR Policy'],
        );
        expect(m.status).toBe('SCHEDULED');
        scheduler.postpone(m.id, '2026-05-15T09:00:00Z', '2026-05-15T11:00:00Z');
        expect(scheduler.get(m.id)?.status).toBe('POSTPONED');
      });
    });
  });
});

// ─── MinutesTracker ──────────────────────────────────────────────────────────

describe('MinutesTracker', () => {
  let tracker: MinutesTracker;

  beforeEach(() => {
    tracker = new MinutesTracker();
  });

  // ── create ────────────────────────────────────────────────────────────────────

  describe('create()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`create() produces DRAFT minutes for meeting ${i}`, () => {
        const minutes = tracker.create(
          `meeting-${i}`,
          `sec${i}@ims.local`,
          '2026-03-01T12:00:00Z',
          `Minutes content for meeting ${i}`,
        );
        expect(minutes.status).toBe('DRAFT');
        expect(minutes.meetingId).toBe(`meeting-${i}`);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`create() stores preparedBy for minutes ${i}`, () => {
        const preparedBy = `secretary${i}@ims.local`;
        const minutes = tracker.create(`mtg-${i}`, preparedBy, '2026-03-01T12:00:00Z', 'Content');
        expect(minutes.preparedBy).toBe(preparedBy);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`create() stores preparedAt for minutes ${i}`, () => {
        const preparedAt = `2026-03-${String(i % 28 + 1).padStart(2, '0')}T12:00:00Z`;
        const minutes = tracker.create(`mtg-${i}`, 'sec@ims.local', preparedAt, 'Content');
        expect(minutes.preparedAt).toBe(preparedAt);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`create() stores content for minutes ${i}`, () => {
        const content = `Meeting content block ${i}: decisions made, actions agreed.`;
        const minutes = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', content);
        expect(minutes.content).toBe(content);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`create() starts with empty actionItems for minutes ${i}`, () => {
        const minutes = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        expect(minutes.actionItems).toEqual([]);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`create() assigns unique id for minutes ${i}`, () => {
        const minutes = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        expect(minutes.id).toBeDefined();
        expect(typeof minutes.id).toBe('string');
        expect(minutes.id.length).toBeGreaterThan(0);
      });
    });

    it('create() increments getMinutesCount()', () => {
      expect(tracker.getMinutesCount()).toBe(0);
      tracker.create('m1', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      expect(tracker.getMinutesCount()).toBe(1);
      tracker.create('m2', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      expect(tracker.getMinutesCount()).toBe(2);
    });

    it('create() leaves approvedBy undefined initially', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      expect(m.approvedBy).toBeUndefined();
    });

    it('create() leaves approvedAt undefined initially', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      expect(m.approvedAt).toBeUndefined();
    });
  });

  // ── submitForApproval ────────────────────────────────────────────────────────

  describe('submitForApproval()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`submitForApproval() sets PENDING_APPROVAL for minutes ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        tracker.submitForApproval(m.id);
        expect(tracker.getByMeeting(`mtg-${i}`)[0].status).toBe('PENDING_APPROVAL');
      });
    });

    it('submitForApproval() throws for unknown id', () => {
      expect(() => tracker.submitForApproval('ghost-minutes')).toThrow('Minutes not found');
    });

    it('submitForApproval() returns updated minutes', () => {
      const m = tracker.create('mtg-a', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const result = tracker.submitForApproval(m.id);
      expect(result.status).toBe('PENDING_APPROVAL');
      expect(result.id).toBe(m.id);
    });
  });

  // ── approve ───────────────────────────────────────────────────────────────────

  describe('approve()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`approve() sets APPROVED for minutes ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        tracker.submitForApproval(m.id);
        tracker.approve(m.id, `mgr${i}@ims.local`, '2026-03-02T09:00:00Z');
        expect(tracker.getByMeeting(`mtg-${i}`)[0].status).toBe('APPROVED');
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`approve() records approvedBy for minutes ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const approvedBy = `manager${i}@ims.local`;
        tracker.approve(m.id, approvedBy, '2026-03-02T09:00:00Z');
        expect(tracker.getByMeeting(`mtg-${i}`)[0].approvedBy).toBe(approvedBy);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`approve() records approvedAt for minutes ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const approvedAt = `2026-03-${String(i % 28 + 2).padStart(2, '0')}T09:00:00Z`;
        tracker.approve(m.id, 'mgr@ims.local', approvedAt);
        expect(tracker.getByMeeting(`mtg-${i}`)[0].approvedAt).toBe(approvedAt);
      });
    });

    it('approve() throws for unknown id', () => {
      expect(() => tracker.approve('ghost', 'mgr@ims.local', '2026-03-02T09:00:00Z')).toThrow('Minutes not found');
    });

    it('approve() returns updated minutes', () => {
      const m = tracker.create('mtg-z', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const result = tracker.approve(m.id, 'mgr@ims.local', '2026-03-02T09:00:00Z');
      expect(result.status).toBe('APPROVED');
      expect(result.id).toBe(m.id);
    });
  });

  // ── publish ───────────────────────────────────────────────────────────────────

  describe('publish()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`publish() sets PUBLISHED for minutes ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        tracker.approve(m.id, 'mgr@ims.local', '2026-03-02T09:00:00Z');
        tracker.publish(m.id);
        expect(tracker.getByMeeting(`mtg-${i}`)[0].status).toBe('PUBLISHED');
      });
    });

    it('publish() throws for unknown id', () => {
      expect(() => tracker.publish('no-such-minutes')).toThrow('Minutes not found');
    });

    it('publish() returns updated minutes', () => {
      const m = tracker.create('mtg-pub', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const result = tracker.publish(m.id);
      expect(result.status).toBe('PUBLISHED');
      expect(result.id).toBe(m.id);
    });
  });

  // ── addActionItem ─────────────────────────────────────────────────────────────

  describe('addActionItem()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`addActionItem() creates OPEN action item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `Fix issue ${i}`, `user${i}@ims.local`, '2026-04-01');
        expect(ai.status).toBe('OPEN');
        expect(ai.description).toBe(`Fix issue ${i}`);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`addActionItem() assigns correct minutesId for item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `Task ${i}`, `u${i}@ims.local`, '2026-04-15');
        expect(ai.minutesId).toBe(m.id);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`addActionItem() stores assignedTo for item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const assignedTo = `assignee${i}@ims.local`;
        const ai = tracker.addActionItem(m.id, `Task ${i}`, assignedTo, '2026-04-15');
        expect(ai.assignedTo).toBe(assignedTo);
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`addActionItem() stores dueDate for item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const dueDate = `2026-04-${String(i % 28 + 1).padStart(2, '0')}`;
        const ai = tracker.addActionItem(m.id, `Task ${i}`, 'u@ims.local', dueDate);
        expect(ai.dueDate).toBe(dueDate);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`addActionItem() pushes item into minutes.actionItems (iteration ${i})`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        tracker.addActionItem(m.id, `Task A${i}`, 'u@ims.local', '2026-04-01');
        tracker.addActionItem(m.id, `Task B${i}`, 'v@ims.local', '2026-04-02');
        const byMeeting = tracker.getByMeeting(`mtg-${i}`);
        expect(byMeeting[0].actionItems).toHaveLength(2);
      });
    });

    it('addActionItem() throws for unknown minutesId', () => {
      expect(() => tracker.addActionItem('ghost-minutes', 'Task', 'u@ims.local', '2026-04-01')).toThrow('Minutes not found');
    });

    it('addActionItem() increments getActionItemCount()', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      expect(tracker.getActionItemCount()).toBe(0);
      tracker.addActionItem(m.id, 'Task 1', 'u@ims.local', '2026-04-01');
      expect(tracker.getActionItemCount()).toBe(1);
      tracker.addActionItem(m.id, 'Task 2', 'v@ims.local', '2026-04-02');
      expect(tracker.getActionItemCount()).toBe(2);
    });

    it('addActionItem() leaves completedDate undefined', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
      expect(ai.completedDate).toBeUndefined();
    });
  });

  // ── startActionItem ───────────────────────────────────────────────────────────

  describe('startActionItem()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`startActionItem() sets IN_PROGRESS for action item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `Task ${i}`, `u${i}@ims.local`, '2026-04-01');
        const result = tracker.startActionItem(ai.id);
        expect(result.status).toBe('IN_PROGRESS');
      });
    });

    it('startActionItem() throws for unknown id', () => {
      expect(() => tracker.startActionItem('ghost-action')).toThrow('Action item not found');
    });

    it('startActionItem() returns updated action item', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
      const result = tracker.startActionItem(ai.id);
      expect(result.id).toBe(ai.id);
      expect(result.status).toBe('IN_PROGRESS');
    });
  });

  // ── completeActionItem ────────────────────────────────────────────────────────

  describe('completeActionItem()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`completeActionItem() sets COMPLETED for action item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `Task ${i}`, `u${i}@ims.local`, '2026-04-01');
        tracker.startActionItem(ai.id);
        const result = tracker.completeActionItem(ai.id, `2026-03-${String(i % 28 + 2).padStart(2, '0')}`);
        expect(result.status).toBe('COMPLETED');
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`completeActionItem() records completedDate for item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `Task ${i}`, `u${i}@ims.local`, '2026-04-01');
        const completedDate = `2026-03-${String(i % 28 + 2).padStart(2, '0')}`;
        tracker.completeActionItem(ai.id, completedDate);
        expect(ai.completedDate).toBe(completedDate);
      });
    });

    it('completeActionItem() throws for unknown id', () => {
      expect(() => tracker.completeActionItem('ghost', '2026-03-10')).toThrow('Action item not found');
    });

    it('completeActionItem() returns updated action item', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
      const result = tracker.completeActionItem(ai.id, '2026-03-15');
      expect(result.id).toBe(ai.id);
      expect(result.status).toBe('COMPLETED');
    });
  });

  // ── cancelActionItem ──────────────────────────────────────────────────────────

  describe('cancelActionItem()', () => {
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`cancelActionItem() sets CANCELLED for action item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `Task ${i}`, `u${i}@ims.local`, '2026-04-01');
        const result = tracker.cancelActionItem(ai.id);
        expect(result.status).toBe('CANCELLED');
      });
    });

    it('cancelActionItem() throws for unknown id', () => {
      expect(() => tracker.cancelActionItem('no-such-item')).toThrow('Action item not found');
    });

    it('cancelActionItem() returns updated action item', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
      const result = tracker.cancelActionItem(ai.id);
      expect(result.id).toBe(ai.id);
    });
  });

  // ── getByMeeting ──────────────────────────────────────────────────────────────

  describe('getByMeeting()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getByMeeting() returns minutes for meetingId mtg-${i}`, () => {
        tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', `Content ${i}`);
        tracker.create(`mtg-${i}`, 'sec2@ims.local', '2026-03-02T12:00:00Z', `Amended content ${i}`);
        tracker.create('other-mtg', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Other');
        const result = tracker.getByMeeting(`mtg-${i}`);
        expect(result.length).toBe(2);
        result.forEach((m) => expect(m.meetingId).toBe(`mtg-${i}`));
        tracker = new MinutesTracker();
      });
    });

    it('getByMeeting() returns empty for unknown meetingId', () => {
      tracker.create('mtg-a', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      expect(tracker.getByMeeting('unknown-meeting')).toHaveLength(0);
    });
  });

  // ── getOpenActionItems ────────────────────────────────────────────────────────

  describe('getOpenActionItems()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getOpenActionItems() returns ${i + 1} open items after creating ${i + 1} items`, () => {
        const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        for (let j = 0; j <= i; j++) {
          tracker.addActionItem(m.id, `Task ${j}`, `u${j}@ims.local`, '2026-04-01');
        }
        const open = tracker.getOpenActionItems();
        expect(open.length).toBe(i + 1);
        open.forEach((ai) => expect(ai.status).toBe('OPEN'));
        tracker = new MinutesTracker();
      });
    });

    it('getOpenActionItems() excludes IN_PROGRESS items', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
      tracker.startActionItem(ai.id);
      expect(tracker.getOpenActionItems()).toHaveLength(0);
    });

    it('getOpenActionItems() excludes COMPLETED items', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
      tracker.completeActionItem(ai.id, '2026-03-10');
      expect(tracker.getOpenActionItems()).toHaveLength(0);
    });

    it('getOpenActionItems() excludes CANCELLED items', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
      tracker.cancelActionItem(ai.id);
      expect(tracker.getOpenActionItems()).toHaveLength(0);
    });

    it('getOpenActionItems() returns empty when no action items', () => {
      expect(tracker.getOpenActionItems()).toHaveLength(0);
    });
  });

  // ── getOverdueActionItems ─────────────────────────────────────────────────────

  describe('getOverdueActionItems()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getOverdueActionItems() returns overdue OPEN item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        tracker.addActionItem(m.id, `Old task ${i}`, `u${i}@ims.local`, '2026-01-01');
        const overdue = tracker.getOverdueActionItems('2026-03-01');
        expect(overdue.length).toBeGreaterThanOrEqual(1);
        overdue.forEach((ai) => {
          expect(['OPEN', 'IN_PROGRESS'].includes(ai.status)).toBe(true);
          expect(ai.dueDate < '2026-03-01').toBe(true);
        });
        tracker = new MinutesTracker();
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getOverdueActionItems() returns overdue IN_PROGRESS item ${i}`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `WIP task ${i}`, `u${i}@ims.local`, '2025-12-01');
        tracker.startActionItem(ai.id);
        const overdue = tracker.getOverdueActionItems('2026-03-01');
        expect(overdue.length).toBeGreaterThanOrEqual(1);
        tracker = new MinutesTracker();
      });
    });

    it('getOverdueActionItems() excludes future due dates', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      tracker.addActionItem(m.id, 'Future Task', 'u@ims.local', '2026-12-31');
      expect(tracker.getOverdueActionItems('2026-03-01')).toHaveLength(0);
    });

    it('getOverdueActionItems() excludes COMPLETED items past due', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Old Task', 'u@ims.local', '2026-01-01');
      tracker.completeActionItem(ai.id, '2026-02-01');
      expect(tracker.getOverdueActionItems('2026-03-01')).toHaveLength(0);
    });

    it('getOverdueActionItems() excludes CANCELLED items past due', () => {
      const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
      const ai = tracker.addActionItem(m.id, 'Old Task', 'u@ims.local', '2026-01-01');
      tracker.cancelActionItem(ai.id);
      expect(tracker.getOverdueActionItems('2026-03-01')).toHaveLength(0);
    });

    it('getOverdueActionItems() returns empty with no action items', () => {
      expect(tracker.getOverdueActionItems('2026-03-01')).toHaveLength(0);
    });
  });

  // ── getMinutesCount / getActionItemCount ──────────────────────────────────────

  describe('getMinutesCount() and getActionItemCount()', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getMinutesCount() equals ${i + 1} after ${i + 1} creates`, () => {
        for (let j = 0; j <= i; j++) {
          tracker.create(`mtg-${j}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        }
        expect(tracker.getMinutesCount()).toBe(i + 1);
        tracker = new MinutesTracker();
      });
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getActionItemCount() equals ${i + 1} after ${i + 1} items added`, () => {
        const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        for (let j = 0; j <= i; j++) {
          tracker.addActionItem(m.id, `Task ${j}`, `u${j}@ims.local`, '2026-04-01');
        }
        expect(tracker.getActionItemCount()).toBe(i + 1);
        tracker = new MinutesTracker();
      });
    });

    it('getMinutesCount() is 0 initially', () => {
      expect(tracker.getMinutesCount()).toBe(0);
    });

    it('getActionItemCount() is 0 initially', () => {
      expect(tracker.getActionItemCount()).toBe(0);
    });
  });

  // ── full lifecycle ────────────────────────────────────────────────────────────

  describe('minutes full lifecycle', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`full minutes lifecycle DRAFT→PENDING_APPROVAL→APPROVED→PUBLISHED (iteration ${i})`, () => {
        const m = tracker.create(
          `meeting-${i}`,
          `secretary${i}@ims.local`,
          `2026-03-${String(i % 28 + 1).padStart(2, '0')}T12:00:00Z`,
          `Full meeting minutes for meeting ${i}. Decisions: A, B, C.`,
        );
        expect(m.status).toBe('DRAFT');

        tracker.submitForApproval(m.id);
        expect(tracker.getByMeeting(`meeting-${i}`)[0].status).toBe('PENDING_APPROVAL');

        tracker.approve(m.id, `manager${i}@ims.local`, `2026-03-${String(i % 28 + 2).padStart(2, '0')}T09:00:00Z`);
        const approved = tracker.getByMeeting(`meeting-${i}`)[0];
        expect(approved.status).toBe('APPROVED');
        expect(approved.approvedBy).toBe(`manager${i}@ims.local`);

        tracker.publish(m.id);
        expect(tracker.getByMeeting(`meeting-${i}`)[0].status).toBe('PUBLISHED');
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`action item lifecycle OPEN→IN_PROGRESS→COMPLETED (iteration ${i})`, () => {
        const m = tracker.create(`mtg-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(
          m.id,
          `Complete quality audit section ${i}`,
          `auditor${i}@ims.local`,
          `2026-04-${String(i % 28 + 1).padStart(2, '0')}`,
        );
        expect(ai.status).toBe('OPEN');

        tracker.startActionItem(ai.id);
        expect(ai.status).toBe('IN_PROGRESS');

        const completedDate = `2026-03-${String(i % 28 + 15).padStart(2, '0')}`;
        tracker.completeActionItem(ai.id, completedDate);
        expect(ai.status).toBe('COMPLETED');
        expect(ai.completedDate).toBe(completedDate);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`action item lifecycle OPEN→CANCELLED (iteration ${i})`, () => {
        const m = tracker.create(`mtg-cancel-${i}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, `Cancelled task ${i}`, `u${i}@ims.local`, '2026-04-01');
        expect(ai.status).toBe('OPEN');
        tracker.cancelActionItem(ai.id);
        expect(ai.status).toBe('CANCELLED');
      });
    });
  });

  // ── MinutesStatus transitions ─────────────────────────────────────────────────

  describe('MinutesStatus enum coverage', () => {
    const statusFlow: MinutesStatus[] = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED'];
    statusFlow.forEach((status, idx) => {
      it(`minutes reaches ${status} at step ${idx} in flow`, () => {
        const m = tracker.create('mtg-x', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        if (idx === 0) {
          expect(m.status).toBe('DRAFT');
        } else if (idx === 1) {
          tracker.submitForApproval(m.id);
          expect(tracker.getByMeeting('mtg-x')[0].status).toBe('PENDING_APPROVAL');
        } else if (idx === 2) {
          tracker.submitForApproval(m.id);
          tracker.approve(m.id, 'mgr@ims.local', '2026-03-02T09:00:00Z');
          expect(tracker.getByMeeting('mtg-x')[0].status).toBe('APPROVED');
        } else {
          tracker.submitForApproval(m.id);
          tracker.approve(m.id, 'mgr@ims.local', '2026-03-02T09:00:00Z');
          tracker.publish(m.id);
          expect(tracker.getByMeeting('mtg-x')[0].status).toBe('PUBLISHED');
        }
      });
    });

    const actionStatuses: ActionItemStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    actionStatuses.forEach((status) => {
      it(`action item can reach status ${status}`, () => {
        const m = tracker.create('mtg-status', 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
        const ai = tracker.addActionItem(m.id, 'Task', 'u@ims.local', '2026-04-01');
        if (status === 'OPEN') {
          expect(ai.status).toBe('OPEN');
        } else if (status === 'IN_PROGRESS') {
          tracker.startActionItem(ai.id);
          expect(ai.status).toBe('IN_PROGRESS');
        } else if (status === 'COMPLETED') {
          tracker.completeActionItem(ai.id, '2026-03-10');
          expect(ai.status).toBe('COMPLETED');
        } else {
          tracker.cancelActionItem(ai.id);
          expect(ai.status).toBe('CANCELLED');
        }
      });
    });
  });

  // ── cross-minutes action items ─────────────────────────────────────────────────

  describe('cross-minutes action item aggregation', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getOpenActionItems() aggregates across ${i + 2} minutes objects`, () => {
        for (let j = 0; j <= i + 1; j++) {
          const m = tracker.create(`mtg-agg-${i}-${j}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
          tracker.addActionItem(m.id, `Task ${j}`, `u${j}@ims.local`, '2026-05-01');
        }
        expect(tracker.getOpenActionItems().length).toBe(i + 2);
        tracker = new MinutesTracker();
      });
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getActionItemCount() aggregates across multiple minutes (iteration ${i})`, () => {
        for (let j = 0; j <= i; j++) {
          const m = tracker.create(`mtg-cnt-${i}-${j}`, 'sec@ims.local', '2026-03-01T12:00:00Z', 'Content');
          tracker.addActionItem(m.id, `Task`, 'u@ims.local', '2026-05-01');
          tracker.addActionItem(m.id, `Task2`, 'v@ims.local', '2026-05-01');
        }
        expect(tracker.getActionItemCount()).toBe((i + 1) * 2);
        tracker = new MinutesTracker();
      });
    });
  });
});
