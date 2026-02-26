// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export interface Job {
  id: number;
  burst: number;    // CPU burst time
  arrival: number;  // arrival time
  priority?: number; // higher = more important
}

export interface ScheduleResult {
  order: number[];     // job IDs in completion order
  waiting: number[];   // waiting time per job (indexed by job id)
  turnaround: number[]; // turnaround time per job
  avgWaiting: number;
  avgTurnaround: number;
}

function computeMetrics(jobs: Job[], startTimes: number[]): ScheduleResult {
  const order = jobs.map(j => j.id);
  const waiting = jobs.map((j, i) => startTimes[i] - j.arrival);
  const turnaround = jobs.map((j, i) => waiting[i] + j.burst);
  const avgWaiting = waiting.reduce((s, w) => s + w, 0) / jobs.length;
  const avgTurnaround = turnaround.reduce((s, t) => s + t, 0) / jobs.length;
  return { order, waiting, turnaround, avgWaiting, avgTurnaround };
}

// First Come First Served
export function fcfs(jobs: Job[]): ScheduleResult {
  const sorted = [...jobs].sort((a, b) => a.arrival - b.arrival);
  const starts: number[] = [];
  let time = 0;
  for (const j of sorted) {
    time = Math.max(time, j.arrival);
    starts.push(time);
    time += j.burst;
  }
  return computeMetrics(sorted, starts);
}

// Shortest Job First (non-preemptive)
export function sjf(jobs: Job[]): ScheduleResult {
  const remaining = [...jobs];
  const done: Job[] = [];
  const starts: number[] = [];
  let time = 0;
  while (remaining.length) {
    const available = remaining.filter(j => j.arrival <= time);
    if (!available.length) { time = Math.min(...remaining.map(j => j.arrival)); continue; }
    const next = available.sort((a, b) => a.burst - b.burst)[0];
    starts.push(time);
    done.push(next);
    remaining.splice(remaining.indexOf(next), 1);
    time += next.burst;
  }
  return computeMetrics(done, starts);
}

// Priority Scheduling (non-preemptive, higher priority value = higher priority)
export function priorityScheduling(jobs: Job[]): ScheduleResult {
  const remaining = [...jobs];
  const done: Job[] = [];
  const starts: number[] = [];
  let time = 0;
  while (remaining.length) {
    const available = remaining.filter(j => j.arrival <= time);
    if (!available.length) { time = Math.min(...remaining.map(j => j.arrival)); continue; }
    const next = available.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
    starts.push(time);
    done.push(next);
    remaining.splice(remaining.indexOf(next), 1);
    time += next.burst;
  }
  return computeMetrics(done, starts);
}

// Round Robin
export function roundRobin(jobs: Job[], quantum: number): ScheduleResult {
  const queue: Job[] = [...jobs].sort((a, b) => a.arrival - b.arrival);
  const remaining = new Map(jobs.map(j => [j.id, j.burst]));
  const starts: Map<number, number> = new Map();
  const completionTime: Map<number, number> = new Map();
  let time = 0;
  const readyQueue: Job[] = [queue.shift()!];
  while (readyQueue.length) {
    const j = readyQueue.shift()!;
    if (!starts.has(j.id)) starts.set(j.id, time);
    const rem = remaining.get(j.id)!;
    const exec = Math.min(rem, quantum);
    time += exec;
    remaining.set(j.id, rem - exec);
    // Enqueue newly arrived
    while (queue.length && queue[0].arrival <= time) readyQueue.push(queue.shift()!);
    if (remaining.get(j.id)! > 0) readyQueue.push(j);
    else completionTime.set(j.id, time);
  }
  const order = jobs.map(j => j.id);
  const waiting = jobs.map(j => (completionTime.get(j.id) ?? 0) - j.arrival - j.burst);
  const turnaround = jobs.map(j => (completionTime.get(j.id) ?? 0) - j.arrival);
  const avgWaiting = waiting.reduce((s,w) => s+w, 0) / jobs.length;
  const avgTurnaround = turnaround.reduce((s,t) => s+t, 0) / jobs.length;
  return { order, waiting, turnaround, avgWaiting, avgTurnaround };
}
