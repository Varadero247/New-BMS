// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  createTask, priorityScore, comparePriority,
  createTaskQueue, createScheduler,
  groupByPriority, sortByPriority, filterByPriority, taskStats,
  type Task, type Priority,
} from '../task-scheduler';

const noop = async () => {};

describe('createTask', () => {
  it('createTask name and priority #1', () => {
    const t = createTask('task1', noop, 'HIGH');
    expect(t.name).toBe('task1');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #2', () => {
    const t = createTask('task2', noop, 'MEDIUM');
    expect(t.name).toBe('task2');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #3', () => {
    const t = createTask('task3', noop, 'LOW');
    expect(t.name).toBe('task3');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #4', () => {
    const t = createTask('task4', noop, 'HIGH');
    expect(t.name).toBe('task4');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #5', () => {
    const t = createTask('task5', noop, 'MEDIUM');
    expect(t.name).toBe('task5');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #6', () => {
    const t = createTask('task6', noop, 'LOW');
    expect(t.name).toBe('task6');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #7', () => {
    const t = createTask('task7', noop, 'HIGH');
    expect(t.name).toBe('task7');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #8', () => {
    const t = createTask('task8', noop, 'MEDIUM');
    expect(t.name).toBe('task8');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #9', () => {
    const t = createTask('task9', noop, 'LOW');
    expect(t.name).toBe('task9');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #10', () => {
    const t = createTask('task10', noop, 'HIGH');
    expect(t.name).toBe('task10');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #11', () => {
    const t = createTask('task11', noop, 'MEDIUM');
    expect(t.name).toBe('task11');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #12', () => {
    const t = createTask('task12', noop, 'LOW');
    expect(t.name).toBe('task12');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #13', () => {
    const t = createTask('task13', noop, 'HIGH');
    expect(t.name).toBe('task13');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #14', () => {
    const t = createTask('task14', noop, 'MEDIUM');
    expect(t.name).toBe('task14');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #15', () => {
    const t = createTask('task15', noop, 'LOW');
    expect(t.name).toBe('task15');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #16', () => {
    const t = createTask('task16', noop, 'HIGH');
    expect(t.name).toBe('task16');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #17', () => {
    const t = createTask('task17', noop, 'MEDIUM');
    expect(t.name).toBe('task17');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #18', () => {
    const t = createTask('task18', noop, 'LOW');
    expect(t.name).toBe('task18');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #19', () => {
    const t = createTask('task19', noop, 'HIGH');
    expect(t.name).toBe('task19');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #20', () => {
    const t = createTask('task20', noop, 'MEDIUM');
    expect(t.name).toBe('task20');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #21', () => {
    const t = createTask('task21', noop, 'LOW');
    expect(t.name).toBe('task21');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #22', () => {
    const t = createTask('task22', noop, 'HIGH');
    expect(t.name).toBe('task22');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #23', () => {
    const t = createTask('task23', noop, 'MEDIUM');
    expect(t.name).toBe('task23');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #24', () => {
    const t = createTask('task24', noop, 'LOW');
    expect(t.name).toBe('task24');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #25', () => {
    const t = createTask('task25', noop, 'HIGH');
    expect(t.name).toBe('task25');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #26', () => {
    const t = createTask('task26', noop, 'MEDIUM');
    expect(t.name).toBe('task26');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #27', () => {
    const t = createTask('task27', noop, 'LOW');
    expect(t.name).toBe('task27');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #28', () => {
    const t = createTask('task28', noop, 'HIGH');
    expect(t.name).toBe('task28');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #29', () => {
    const t = createTask('task29', noop, 'MEDIUM');
    expect(t.name).toBe('task29');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #30', () => {
    const t = createTask('task30', noop, 'LOW');
    expect(t.name).toBe('task30');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #31', () => {
    const t = createTask('task31', noop, 'HIGH');
    expect(t.name).toBe('task31');
    expect(t.priority).toBe('HIGH');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #32', () => {
    const t = createTask('task32', noop, 'MEDIUM');
    expect(t.name).toBe('task32');
    expect(t.priority).toBe('MEDIUM');
    expect(typeof t.id).toBe('string');
  });
  it('createTask name and priority #33', () => {
    const t = createTask('task33', noop, 'LOW');
    expect(t.name).toBe('task33');
    expect(t.priority).toBe('LOW');
    expect(typeof t.id).toBe('string');
  });
  it('createTask default priority MEDIUM #1', () => {
    const t = createTask('t1', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #2', () => {
    const t = createTask('t2', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #3', () => {
    const t = createTask('t3', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #4', () => {
    const t = createTask('t4', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #5', () => {
    const t = createTask('t5', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #6', () => {
    const t = createTask('t6', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #7', () => {
    const t = createTask('t7', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #8', () => {
    const t = createTask('t8', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #9', () => {
    const t = createTask('t9', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #10', () => {
    const t = createTask('t10', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #11', () => {
    const t = createTask('t11', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #12', () => {
    const t = createTask('t12', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #13', () => {
    const t = createTask('t13', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #14', () => {
    const t = createTask('t14', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #15', () => {
    const t = createTask('t15', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #16', () => {
    const t = createTask('t16', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #17', () => {
    const t = createTask('t17', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #18', () => {
    const t = createTask('t18', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #19', () => {
    const t = createTask('t19', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #20', () => {
    const t = createTask('t20', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #21', () => {
    const t = createTask('t21', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #22', () => {
    const t = createTask('t22', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #23', () => {
    const t = createTask('t23', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #24', () => {
    const t = createTask('t24', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #25', () => {
    const t = createTask('t25', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #26', () => {
    const t = createTask('t26', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #27', () => {
    const t = createTask('t27', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #28', () => {
    const t = createTask('t28', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #29', () => {
    const t = createTask('t29', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #30', () => {
    const t = createTask('t30', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #31', () => {
    const t = createTask('t31', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #32', () => {
    const t = createTask('t32', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask default priority MEDIUM #33', () => {
    const t = createTask('t33', noop);
    expect(t.priority).toBe('MEDIUM');
  });
  it('createTask has createdAt #1', () => {
    const t = createTask('t1', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #2', () => {
    const t = createTask('t2', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #3', () => {
    const t = createTask('t3', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #4', () => {
    const t = createTask('t4', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #5', () => {
    const t = createTask('t5', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #6', () => {
    const t = createTask('t6', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #7', () => {
    const t = createTask('t7', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #8', () => {
    const t = createTask('t8', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #9', () => {
    const t = createTask('t9', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #10', () => {
    const t = createTask('t10', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #11', () => {
    const t = createTask('t11', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #12', () => {
    const t = createTask('t12', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #13', () => {
    const t = createTask('t13', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #14', () => {
    const t = createTask('t14', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #15', () => {
    const t = createTask('t15', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #16', () => {
    const t = createTask('t16', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #17', () => {
    const t = createTask('t17', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #18', () => {
    const t = createTask('t18', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #19', () => {
    const t = createTask('t19', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #20', () => {
    const t = createTask('t20', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #21', () => {
    const t = createTask('t21', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #22', () => {
    const t = createTask('t22', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #23', () => {
    const t = createTask('t23', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #24', () => {
    const t = createTask('t24', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #25', () => {
    const t = createTask('t25', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #26', () => {
    const t = createTask('t26', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #27', () => {
    const t = createTask('t27', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #28', () => {
    const t = createTask('t28', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #29', () => {
    const t = createTask('t29', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #30', () => {
    const t = createTask('t30', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #31', () => {
    const t = createTask('t31', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #32', () => {
    const t = createTask('t32', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
  it('createTask has createdAt #33', () => {
    const t = createTask('t33', noop);
    expect(t.createdAt).toBeGreaterThan(0);
  });
});

describe('priorityScore', () => {
  it('HIGH score is 3 #1', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #2', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #3', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #4', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #5', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #6', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #7', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #8', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #9', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #10', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #11', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #12', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #13', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #14', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #15', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #16', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #17', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #18', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #19', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #20', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #21', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #22', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #23', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #24', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #25', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #26', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #27', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #28', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #29', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #30', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #31', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #32', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('HIGH score is 3 #33', () => { expect(priorityScore('HIGH')).toBe(3); });
  it('MEDIUM score is 2 #1', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #2', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #3', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #4', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #5', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #6', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #7', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #8', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #9', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #10', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #11', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #12', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #13', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #14', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #15', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #16', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #17', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #18', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #19', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #20', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #21', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #22', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #23', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #24', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #25', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #26', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #27', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #28', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #29', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #30', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #31', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #32', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('MEDIUM score is 2 #33', () => { expect(priorityScore('MEDIUM')).toBe(2); });
  it('LOW score is 1 #1', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #2', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #3', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #4', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #5', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #6', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #7', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #8', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #9', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #10', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #11', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #12', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #13', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #14', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #15', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #16', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #17', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #18', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #19', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #20', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #21', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #22', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #23', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #24', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #25', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #26', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #27', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #28', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #29', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #30', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #31', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #32', () => { expect(priorityScore('LOW')).toBe(1); });
  it('LOW score is 1 #33', () => { expect(priorityScore('LOW')).toBe(1); });
});

describe('comparePriority', () => {
  it('HIGH before MEDIUM #1', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #2', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #3', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #4', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #5', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #6', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #7', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #8', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #9', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #10', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #11', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #12', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #13', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #14', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #15', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #16', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #17', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #18', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #19', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #20', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #21', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #22', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #23', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #24', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #25', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #26', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #27', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #28', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #29', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #30', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #31', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #32', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('HIGH before MEDIUM #33', () => {
    const h = createTask('h', noop, 'HIGH'); const m = createTask('m', noop, 'MEDIUM');
    expect(comparePriority(h, m)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #1', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #2', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #3', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #4', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #5', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #6', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #7', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #8', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #9', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #10', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #11', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #12', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #13', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #14', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #15', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #16', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #17', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #18', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #19', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #20', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #21', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #22', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #23', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #24', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #25', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #26', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #27', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #28', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #29', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #30', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #31', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #32', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('MEDIUM before LOW #33', () => {
    const m = createTask('m', noop, 'MEDIUM'); const l = createTask('l', noop, 'LOW');
    expect(comparePriority(m, l)).toBeLessThan(0);
  });
  it('same priority equals 0 #1', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #2', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #3', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #4', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #5', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #6', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #7', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #8', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #9', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #10', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #11', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #12', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #13', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #14', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #15', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #16', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #17', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #18', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #19', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #20', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #21', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #22', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #23', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #24', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #25', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #26', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #27', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #28', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #29', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #30', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #31', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #32', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
  it('same priority equals 0 #33', () => {
    const a = createTask('a', noop, 'HIGH'); const b = createTask('b', noop, 'HIGH');
    expect(comparePriority(a, b)).toBe(0);
  });
});

describe('TaskQueue add/peek/poll', () => {
  it('peek returns highest priority #1', () => {
    const q = createTaskQueue();
    q.add(createTask('l1', noop, 'LOW'));
    q.add(createTask('h1', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #2', () => {
    const q = createTaskQueue();
    q.add(createTask('l2', noop, 'LOW'));
    q.add(createTask('h2', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #3', () => {
    const q = createTaskQueue();
    q.add(createTask('l3', noop, 'LOW'));
    q.add(createTask('h3', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #4', () => {
    const q = createTaskQueue();
    q.add(createTask('l4', noop, 'LOW'));
    q.add(createTask('h4', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #5', () => {
    const q = createTaskQueue();
    q.add(createTask('l5', noop, 'LOW'));
    q.add(createTask('h5', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #6', () => {
    const q = createTaskQueue();
    q.add(createTask('l6', noop, 'LOW'));
    q.add(createTask('h6', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #7', () => {
    const q = createTaskQueue();
    q.add(createTask('l7', noop, 'LOW'));
    q.add(createTask('h7', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #8', () => {
    const q = createTaskQueue();
    q.add(createTask('l8', noop, 'LOW'));
    q.add(createTask('h8', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #9', () => {
    const q = createTaskQueue();
    q.add(createTask('l9', noop, 'LOW'));
    q.add(createTask('h9', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #10', () => {
    const q = createTaskQueue();
    q.add(createTask('l10', noop, 'LOW'));
    q.add(createTask('h10', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #11', () => {
    const q = createTaskQueue();
    q.add(createTask('l11', noop, 'LOW'));
    q.add(createTask('h11', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #12', () => {
    const q = createTaskQueue();
    q.add(createTask('l12', noop, 'LOW'));
    q.add(createTask('h12', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #13', () => {
    const q = createTaskQueue();
    q.add(createTask('l13', noop, 'LOW'));
    q.add(createTask('h13', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #14', () => {
    const q = createTaskQueue();
    q.add(createTask('l14', noop, 'LOW'));
    q.add(createTask('h14', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #15', () => {
    const q = createTaskQueue();
    q.add(createTask('l15', noop, 'LOW'));
    q.add(createTask('h15', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #16', () => {
    const q = createTaskQueue();
    q.add(createTask('l16', noop, 'LOW'));
    q.add(createTask('h16', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #17', () => {
    const q = createTaskQueue();
    q.add(createTask('l17', noop, 'LOW'));
    q.add(createTask('h17', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #18', () => {
    const q = createTaskQueue();
    q.add(createTask('l18', noop, 'LOW'));
    q.add(createTask('h18', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #19', () => {
    const q = createTaskQueue();
    q.add(createTask('l19', noop, 'LOW'));
    q.add(createTask('h19', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #20', () => {
    const q = createTaskQueue();
    q.add(createTask('l20', noop, 'LOW'));
    q.add(createTask('h20', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #21', () => {
    const q = createTaskQueue();
    q.add(createTask('l21', noop, 'LOW'));
    q.add(createTask('h21', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #22', () => {
    const q = createTaskQueue();
    q.add(createTask('l22', noop, 'LOW'));
    q.add(createTask('h22', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #23', () => {
    const q = createTaskQueue();
    q.add(createTask('l23', noop, 'LOW'));
    q.add(createTask('h23', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #24', () => {
    const q = createTaskQueue();
    q.add(createTask('l24', noop, 'LOW'));
    q.add(createTask('h24', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #25', () => {
    const q = createTaskQueue();
    q.add(createTask('l25', noop, 'LOW'));
    q.add(createTask('h25', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #26', () => {
    const q = createTaskQueue();
    q.add(createTask('l26', noop, 'LOW'));
    q.add(createTask('h26', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #27', () => {
    const q = createTaskQueue();
    q.add(createTask('l27', noop, 'LOW'));
    q.add(createTask('h27', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #28', () => {
    const q = createTaskQueue();
    q.add(createTask('l28', noop, 'LOW'));
    q.add(createTask('h28', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #29', () => {
    const q = createTaskQueue();
    q.add(createTask('l29', noop, 'LOW'));
    q.add(createTask('h29', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #30', () => {
    const q = createTaskQueue();
    q.add(createTask('l30', noop, 'LOW'));
    q.add(createTask('h30', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #31', () => {
    const q = createTaskQueue();
    q.add(createTask('l31', noop, 'LOW'));
    q.add(createTask('h31', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #32', () => {
    const q = createTaskQueue();
    q.add(createTask('l32', noop, 'LOW'));
    q.add(createTask('h32', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #33', () => {
    const q = createTaskQueue();
    q.add(createTask('l33', noop, 'LOW'));
    q.add(createTask('h33', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #34', () => {
    const q = createTaskQueue();
    q.add(createTask('l34', noop, 'LOW'));
    q.add(createTask('h34', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #35', () => {
    const q = createTaskQueue();
    q.add(createTask('l35', noop, 'LOW'));
    q.add(createTask('h35', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #36', () => {
    const q = createTaskQueue();
    q.add(createTask('l36', noop, 'LOW'));
    q.add(createTask('h36', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #37', () => {
    const q = createTaskQueue();
    q.add(createTask('l37', noop, 'LOW'));
    q.add(createTask('h37', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #38', () => {
    const q = createTaskQueue();
    q.add(createTask('l38', noop, 'LOW'));
    q.add(createTask('h38', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #39', () => {
    const q = createTaskQueue();
    q.add(createTask('l39', noop, 'LOW'));
    q.add(createTask('h39', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #40', () => {
    const q = createTaskQueue();
    q.add(createTask('l40', noop, 'LOW'));
    q.add(createTask('h40', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #41', () => {
    const q = createTaskQueue();
    q.add(createTask('l41', noop, 'LOW'));
    q.add(createTask('h41', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #42', () => {
    const q = createTaskQueue();
    q.add(createTask('l42', noop, 'LOW'));
    q.add(createTask('h42', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #43', () => {
    const q = createTaskQueue();
    q.add(createTask('l43', noop, 'LOW'));
    q.add(createTask('h43', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #44', () => {
    const q = createTaskQueue();
    q.add(createTask('l44', noop, 'LOW'));
    q.add(createTask('h44', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #45', () => {
    const q = createTaskQueue();
    q.add(createTask('l45', noop, 'LOW'));
    q.add(createTask('h45', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #46', () => {
    const q = createTaskQueue();
    q.add(createTask('l46', noop, 'LOW'));
    q.add(createTask('h46', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #47', () => {
    const q = createTaskQueue();
    q.add(createTask('l47', noop, 'LOW'));
    q.add(createTask('h47', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #48', () => {
    const q = createTaskQueue();
    q.add(createTask('l48', noop, 'LOW'));
    q.add(createTask('h48', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #49', () => {
    const q = createTaskQueue();
    q.add(createTask('l49', noop, 'LOW'));
    q.add(createTask('h49', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('peek returns highest priority #50', () => {
    const q = createTaskQueue();
    q.add(createTask('l50', noop, 'LOW'));
    q.add(createTask('h50', noop, 'HIGH'));
    expect(q.peek()?.priority).toBe('HIGH');
  });
  it('poll removes and returns highest #1', () => {
    const q = createTaskQueue();
    q.add(createTask('m1', noop, 'MEDIUM'));
    q.add(createTask('h1', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #2', () => {
    const q = createTaskQueue();
    q.add(createTask('m2', noop, 'MEDIUM'));
    q.add(createTask('h2', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #3', () => {
    const q = createTaskQueue();
    q.add(createTask('m3', noop, 'MEDIUM'));
    q.add(createTask('h3', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #4', () => {
    const q = createTaskQueue();
    q.add(createTask('m4', noop, 'MEDIUM'));
    q.add(createTask('h4', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #5', () => {
    const q = createTaskQueue();
    q.add(createTask('m5', noop, 'MEDIUM'));
    q.add(createTask('h5', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #6', () => {
    const q = createTaskQueue();
    q.add(createTask('m6', noop, 'MEDIUM'));
    q.add(createTask('h6', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #7', () => {
    const q = createTaskQueue();
    q.add(createTask('m7', noop, 'MEDIUM'));
    q.add(createTask('h7', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #8', () => {
    const q = createTaskQueue();
    q.add(createTask('m8', noop, 'MEDIUM'));
    q.add(createTask('h8', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #9', () => {
    const q = createTaskQueue();
    q.add(createTask('m9', noop, 'MEDIUM'));
    q.add(createTask('h9', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #10', () => {
    const q = createTaskQueue();
    q.add(createTask('m10', noop, 'MEDIUM'));
    q.add(createTask('h10', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #11', () => {
    const q = createTaskQueue();
    q.add(createTask('m11', noop, 'MEDIUM'));
    q.add(createTask('h11', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #12', () => {
    const q = createTaskQueue();
    q.add(createTask('m12', noop, 'MEDIUM'));
    q.add(createTask('h12', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #13', () => {
    const q = createTaskQueue();
    q.add(createTask('m13', noop, 'MEDIUM'));
    q.add(createTask('h13', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #14', () => {
    const q = createTaskQueue();
    q.add(createTask('m14', noop, 'MEDIUM'));
    q.add(createTask('h14', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #15', () => {
    const q = createTaskQueue();
    q.add(createTask('m15', noop, 'MEDIUM'));
    q.add(createTask('h15', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #16', () => {
    const q = createTaskQueue();
    q.add(createTask('m16', noop, 'MEDIUM'));
    q.add(createTask('h16', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #17', () => {
    const q = createTaskQueue();
    q.add(createTask('m17', noop, 'MEDIUM'));
    q.add(createTask('h17', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #18', () => {
    const q = createTaskQueue();
    q.add(createTask('m18', noop, 'MEDIUM'));
    q.add(createTask('h18', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #19', () => {
    const q = createTaskQueue();
    q.add(createTask('m19', noop, 'MEDIUM'));
    q.add(createTask('h19', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #20', () => {
    const q = createTaskQueue();
    q.add(createTask('m20', noop, 'MEDIUM'));
    q.add(createTask('h20', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #21', () => {
    const q = createTaskQueue();
    q.add(createTask('m21', noop, 'MEDIUM'));
    q.add(createTask('h21', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #22', () => {
    const q = createTaskQueue();
    q.add(createTask('m22', noop, 'MEDIUM'));
    q.add(createTask('h22', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #23', () => {
    const q = createTaskQueue();
    q.add(createTask('m23', noop, 'MEDIUM'));
    q.add(createTask('h23', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #24', () => {
    const q = createTaskQueue();
    q.add(createTask('m24', noop, 'MEDIUM'));
    q.add(createTask('h24', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #25', () => {
    const q = createTaskQueue();
    q.add(createTask('m25', noop, 'MEDIUM'));
    q.add(createTask('h25', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #26', () => {
    const q = createTaskQueue();
    q.add(createTask('m26', noop, 'MEDIUM'));
    q.add(createTask('h26', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #27', () => {
    const q = createTaskQueue();
    q.add(createTask('m27', noop, 'MEDIUM'));
    q.add(createTask('h27', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #28', () => {
    const q = createTaskQueue();
    q.add(createTask('m28', noop, 'MEDIUM'));
    q.add(createTask('h28', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #29', () => {
    const q = createTaskQueue();
    q.add(createTask('m29', noop, 'MEDIUM'));
    q.add(createTask('h29', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #30', () => {
    const q = createTaskQueue();
    q.add(createTask('m30', noop, 'MEDIUM'));
    q.add(createTask('h30', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #31', () => {
    const q = createTaskQueue();
    q.add(createTask('m31', noop, 'MEDIUM'));
    q.add(createTask('h31', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #32', () => {
    const q = createTaskQueue();
    q.add(createTask('m32', noop, 'MEDIUM'));
    q.add(createTask('h32', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #33', () => {
    const q = createTaskQueue();
    q.add(createTask('m33', noop, 'MEDIUM'));
    q.add(createTask('h33', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #34', () => {
    const q = createTaskQueue();
    q.add(createTask('m34', noop, 'MEDIUM'));
    q.add(createTask('h34', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #35', () => {
    const q = createTaskQueue();
    q.add(createTask('m35', noop, 'MEDIUM'));
    q.add(createTask('h35', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #36', () => {
    const q = createTaskQueue();
    q.add(createTask('m36', noop, 'MEDIUM'));
    q.add(createTask('h36', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #37', () => {
    const q = createTaskQueue();
    q.add(createTask('m37', noop, 'MEDIUM'));
    q.add(createTask('h37', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #38', () => {
    const q = createTaskQueue();
    q.add(createTask('m38', noop, 'MEDIUM'));
    q.add(createTask('h38', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #39', () => {
    const q = createTaskQueue();
    q.add(createTask('m39', noop, 'MEDIUM'));
    q.add(createTask('h39', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #40', () => {
    const q = createTaskQueue();
    q.add(createTask('m40', noop, 'MEDIUM'));
    q.add(createTask('h40', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #41', () => {
    const q = createTaskQueue();
    q.add(createTask('m41', noop, 'MEDIUM'));
    q.add(createTask('h41', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #42', () => {
    const q = createTaskQueue();
    q.add(createTask('m42', noop, 'MEDIUM'));
    q.add(createTask('h42', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #43', () => {
    const q = createTaskQueue();
    q.add(createTask('m43', noop, 'MEDIUM'));
    q.add(createTask('h43', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #44', () => {
    const q = createTaskQueue();
    q.add(createTask('m44', noop, 'MEDIUM'));
    q.add(createTask('h44', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #45', () => {
    const q = createTaskQueue();
    q.add(createTask('m45', noop, 'MEDIUM'));
    q.add(createTask('h45', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #46', () => {
    const q = createTaskQueue();
    q.add(createTask('m46', noop, 'MEDIUM'));
    q.add(createTask('h46', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #47', () => {
    const q = createTaskQueue();
    q.add(createTask('m47', noop, 'MEDIUM'));
    q.add(createTask('h47', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #48', () => {
    const q = createTaskQueue();
    q.add(createTask('m48', noop, 'MEDIUM'));
    q.add(createTask('h48', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #49', () => {
    const q = createTaskQueue();
    q.add(createTask('m49', noop, 'MEDIUM'));
    q.add(createTask('h49', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll removes and returns highest #50', () => {
    const q = createTaskQueue();
    q.add(createTask('m50', noop, 'MEDIUM'));
    q.add(createTask('h50', noop, 'HIGH'));
    expect(q.poll()?.priority).toBe('HIGH');
    expect(q.size()).toBe(1);
  });
  it('poll empty returns undefined #1', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #2', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #3', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #4', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #5', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #6', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #7', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #8', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #9', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #10', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #11', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #12', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #13', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #14', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #15', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #16', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #17', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #18', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #19', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #20', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #21', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #22', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #23', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #24', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #25', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #26', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #27', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #28', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #29', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #30', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #31', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #32', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #33', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #34', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #35', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #36', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #37', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #38', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #39', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #40', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #41', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #42', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #43', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #44', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #45', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #46', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #47', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #48', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #49', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('poll empty returns undefined #50', () => {
    const q = createTaskQueue();
    expect(q.poll()).toBeUndefined();
  });
  it('peek empty returns undefined #1', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #2', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #3', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #4', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #5', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #6', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #7', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #8', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #9', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #10', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #11', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #12', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #13', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #14', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #15', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #16', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #17', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #18', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #19', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #20', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #21', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #22', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #23', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #24', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #25', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #26', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #27', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #28', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #29', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #30', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #31', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #32', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #33', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #34', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #35', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #36', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #37', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #38', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #39', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #40', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #41', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #42', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #43', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #44', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #45', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #46', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #47', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #48', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #49', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
  it('peek empty returns undefined #50', () => {
    const q = createTaskQueue();
    expect(q.peek()).toBeUndefined();
  });
});

describe('TaskQueue size/isEmpty/contains/remove/drain/clear', () => {
  it('isEmpty on empty queue #1', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #2', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #3', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #4', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #5', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #6', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #7', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #8', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #9', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #10', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #11', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #12', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #13', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #14', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #15', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #16', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #17', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #18', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #19', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #20', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #21', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #22', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #23', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #24', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('isEmpty on empty queue #25', () => { const q = createTaskQueue(); expect(q.isEmpty()).toBe(true); });
  it('size after add #1', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #2', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #3', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #4', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #5', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #6', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #7', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #8', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #9', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #10', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #11', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #12', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #13', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #14', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #15', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #16', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #17', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #18', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #19', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #20', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #21', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #22', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #23', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #24', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('size after add #25', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); expect(q.size()).toBe(1);
  });
  it('contains returns true after add #1', () => {
    const q = createTaskQueue(); const t = createTask('t1', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #2', () => {
    const q = createTaskQueue(); const t = createTask('t2', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #3', () => {
    const q = createTaskQueue(); const t = createTask('t3', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #4', () => {
    const q = createTaskQueue(); const t = createTask('t4', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #5', () => {
    const q = createTaskQueue(); const t = createTask('t5', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #6', () => {
    const q = createTaskQueue(); const t = createTask('t6', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #7', () => {
    const q = createTaskQueue(); const t = createTask('t7', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #8', () => {
    const q = createTaskQueue(); const t = createTask('t8', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #9', () => {
    const q = createTaskQueue(); const t = createTask('t9', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #10', () => {
    const q = createTaskQueue(); const t = createTask('t10', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #11', () => {
    const q = createTaskQueue(); const t = createTask('t11', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #12', () => {
    const q = createTaskQueue(); const t = createTask('t12', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #13', () => {
    const q = createTaskQueue(); const t = createTask('t13', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #14', () => {
    const q = createTaskQueue(); const t = createTask('t14', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #15', () => {
    const q = createTaskQueue(); const t = createTask('t15', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #16', () => {
    const q = createTaskQueue(); const t = createTask('t16', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #17', () => {
    const q = createTaskQueue(); const t = createTask('t17', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #18', () => {
    const q = createTaskQueue(); const t = createTask('t18', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #19', () => {
    const q = createTaskQueue(); const t = createTask('t19', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #20', () => {
    const q = createTaskQueue(); const t = createTask('t20', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #21', () => {
    const q = createTaskQueue(); const t = createTask('t21', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #22', () => {
    const q = createTaskQueue(); const t = createTask('t22', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #23', () => {
    const q = createTaskQueue(); const t = createTask('t23', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #24', () => {
    const q = createTaskQueue(); const t = createTask('t24', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('contains returns true after add #25', () => {
    const q = createTaskQueue(); const t = createTask('t25', noop); q.add(t);
    expect(q.contains(t.id)).toBe(true);
  });
  it('remove returns true and shrinks #1', () => {
    const q = createTaskQueue(); const t = createTask('t1', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #2', () => {
    const q = createTaskQueue(); const t = createTask('t2', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #3', () => {
    const q = createTaskQueue(); const t = createTask('t3', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #4', () => {
    const q = createTaskQueue(); const t = createTask('t4', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #5', () => {
    const q = createTaskQueue(); const t = createTask('t5', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #6', () => {
    const q = createTaskQueue(); const t = createTask('t6', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #7', () => {
    const q = createTaskQueue(); const t = createTask('t7', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #8', () => {
    const q = createTaskQueue(); const t = createTask('t8', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #9', () => {
    const q = createTaskQueue(); const t = createTask('t9', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #10', () => {
    const q = createTaskQueue(); const t = createTask('t10', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #11', () => {
    const q = createTaskQueue(); const t = createTask('t11', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #12', () => {
    const q = createTaskQueue(); const t = createTask('t12', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #13', () => {
    const q = createTaskQueue(); const t = createTask('t13', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #14', () => {
    const q = createTaskQueue(); const t = createTask('t14', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #15', () => {
    const q = createTaskQueue(); const t = createTask('t15', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #16', () => {
    const q = createTaskQueue(); const t = createTask('t16', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #17', () => {
    const q = createTaskQueue(); const t = createTask('t17', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #18', () => {
    const q = createTaskQueue(); const t = createTask('t18', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #19', () => {
    const q = createTaskQueue(); const t = createTask('t19', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #20', () => {
    const q = createTaskQueue(); const t = createTask('t20', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #21', () => {
    const q = createTaskQueue(); const t = createTask('t21', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #22', () => {
    const q = createTaskQueue(); const t = createTask('t22', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #23', () => {
    const q = createTaskQueue(); const t = createTask('t23', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #24', () => {
    const q = createTaskQueue(); const t = createTask('t24', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('remove returns true and shrinks #25', () => {
    const q = createTaskQueue(); const t = createTask('t25', noop); q.add(t);
    expect(q.remove(t.id)).toBe(true); expect(q.size()).toBe(0);
  });
  it('drain returns all tasks #1', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #2', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #3', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #4', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #5', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #6', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #7', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #8', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #9', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #10', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #11', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #12', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #13', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #14', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #15', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #16', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #17', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #18', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #19', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #20', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #21', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #22', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #23', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #24', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('drain returns all tasks #25', () => {
    const q = createTaskQueue(); q.add(createTask('a', noop, 'HIGH')); q.add(createTask('b', noop, 'LOW'));
    const all = q.drain(); expect(all.length).toBe(2); expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #1', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #2', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #3', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #4', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #5', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #6', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #7', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #8', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #9', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #10', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #11', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #12', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #13', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #14', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #15', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #16', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #17', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #18', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #19', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #20', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #21', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #22', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #23', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #24', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
  it('clear empties queue #25', () => {
    const q = createTaskQueue(); q.add(createTask('t', noop)); q.clear();
    expect(q.isEmpty()).toBe(true);
  });
});

describe('groupByPriority', () => {
  it('groups by priority #1', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #2', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #3', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #4', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #5', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #6', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #7', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #8', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #9', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #10', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #11', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #12', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #13', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #14', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #15', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #16', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #17', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #18', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #19', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #20', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #21', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #22', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #23', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #24', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #25', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #26', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #27', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #28', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #29', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #30', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #31', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #32', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('groups by priority #33', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(1); expect(g.MEDIUM.length).toBe(1); expect(g.LOW.length).toBe(1);
  });
  it('empty groups when no tasks #1', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #2', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #3', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #4', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #5', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #6', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #7', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #8', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #9', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #10', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #11', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #12', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #13', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #14', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #15', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #16', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #17', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #18', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #19', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #20', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #21', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #22', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #23', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #24', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #25', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #26', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #27', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #28', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #29', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #30', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #31', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #32', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
  it('empty groups when no tasks #33', () => {
    const g = groupByPriority([]);
    expect(g.HIGH).toEqual([]); expect(g.MEDIUM).toEqual([]); expect(g.LOW).toEqual([]);
  });
});

describe('sortByPriority', () => {
  it('HIGH first #1', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #2', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #3', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #4', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #5', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #6', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #7', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #8', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #9', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #10', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #11', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #12', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #13', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #14', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #15', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #16', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #17', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #18', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #19', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #20', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #21', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #22', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #23', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #24', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #25', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #26', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #27', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #28', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #29', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #30', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #31', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #32', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('HIGH first #33', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('LOW');
  });
  it('does not mutate original #1', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #2', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #3', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #4', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #5', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #6', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #7', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #8', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #9', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #10', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #11', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #12', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #13', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #14', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #15', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #16', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #17', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #18', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #19', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #20', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #21', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #22', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #23', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #24', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #25', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #26', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #27', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #28', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #29', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #30', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #31', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #32', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
  it('does not mutate original #33', () => {
    const tasks = [createTask('l', noop, 'LOW'), createTask('h', noop, 'HIGH')];
    const sorted = sortByPriority(tasks);
    expect(tasks[0].priority).toBe('LOW');
  });
});

describe('filterByPriority', () => {
  it('filters HIGH #1', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #2', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #3', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #4', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #5', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #6', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #7', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #8', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #9', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #10', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #11', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #12', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #13', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #14', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #15', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #16', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #17', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #18', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #19', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #20', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #21', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #22', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #23', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #24', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #25', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #26', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #27', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #28', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #29', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #30', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #31', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #32', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters HIGH #33', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM')];
    expect(filterByPriority(tasks, 'HIGH').length).toBe(1);
  });
  it('filters LOW #1', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #2', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #3', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #4', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #5', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #6', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #7', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #8', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #9', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #10', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #11', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #12', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #13', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #14', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #15', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #16', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #17', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #18', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #19', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #20', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #21', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #22', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #23', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #24', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #25', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #26', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #27', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #28', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #29', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #30', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #31', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #32', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
  it('filters LOW #33', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('l', noop, 'LOW')];
    expect(filterByPriority(tasks, 'LOW').length).toBe(1);
  });
});

describe('taskStats', () => {
  it('taskStats total #1', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #2', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #3', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #4', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #5', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #6', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #7', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #8', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #9', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #10', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #11', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #12', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #13', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #14', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #15', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #16', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #17', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #18', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #19', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #20', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #21', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #22', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #23', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #24', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #25', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #26', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #27', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #28', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #29', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #30', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #31', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #32', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #33', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #34', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #35', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #36', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #37', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #38', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #39', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #40', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #41', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #42', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #43', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #44', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #45', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #46', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #47', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #48', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #49', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats total #50', () => {
    const tasks = [createTask('h', noop, 'HIGH'), createTask('m', noop, 'MEDIUM'), createTask('l', noop, 'LOW')];
    const s = taskStats(tasks);
    expect(s.total).toBe(3); expect(s.high).toBe(1); expect(s.medium).toBe(1); expect(s.low).toBe(1);
  });
  it('taskStats empty #1', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #2', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #3', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #4', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #5', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #6', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #7', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #8', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #9', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #10', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #11', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #12', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #13', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #14', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #15', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #16', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #17', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #18', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #19', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #20', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #21', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #22', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #23', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #24', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #25', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #26', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #27', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #28', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #29', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #30', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #31', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #32', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #33', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #34', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #35', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #36', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #37', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #38', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #39', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #40', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #41', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #42', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #43', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #44', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #45', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #46', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #47', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #48', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #49', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
  it('taskStats empty #50', () => {
    const s = taskStats([]);
    expect(s.total).toBe(0); expect(s.high).toBe(0);
  });
});

describe('Scheduler cancel/pending', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });
  it('schedule increments pending #1', () => {
    const s = createScheduler();
    const t = createTask('t1', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #2', () => {
    const s = createScheduler();
    const t = createTask('t2', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #3', () => {
    const s = createScheduler();
    const t = createTask('t3', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #4', () => {
    const s = createScheduler();
    const t = createTask('t4', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #5', () => {
    const s = createScheduler();
    const t = createTask('t5', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #6', () => {
    const s = createScheduler();
    const t = createTask('t6', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #7', () => {
    const s = createScheduler();
    const t = createTask('t7', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #8', () => {
    const s = createScheduler();
    const t = createTask('t8', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #9', () => {
    const s = createScheduler();
    const t = createTask('t9', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #10', () => {
    const s = createScheduler();
    const t = createTask('t10', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #11', () => {
    const s = createScheduler();
    const t = createTask('t11', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #12', () => {
    const s = createScheduler();
    const t = createTask('t12', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #13', () => {
    const s = createScheduler();
    const t = createTask('t13', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #14', () => {
    const s = createScheduler();
    const t = createTask('t14', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #15', () => {
    const s = createScheduler();
    const t = createTask('t15', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #16', () => {
    const s = createScheduler();
    const t = createTask('t16', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #17', () => {
    const s = createScheduler();
    const t = createTask('t17', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #18', () => {
    const s = createScheduler();
    const t = createTask('t18', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #19', () => {
    const s = createScheduler();
    const t = createTask('t19', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #20', () => {
    const s = createScheduler();
    const t = createTask('t20', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #21', () => {
    const s = createScheduler();
    const t = createTask('t21', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #22', () => {
    const s = createScheduler();
    const t = createTask('t22', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #23', () => {
    const s = createScheduler();
    const t = createTask('t23', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #24', () => {
    const s = createScheduler();
    const t = createTask('t24', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('schedule increments pending #25', () => {
    const s = createScheduler();
    const t = createTask('t25', noop);
    s.schedule(t, 10000);
    expect(s.pending()).toBe(1);
    s.cancel(s.schedule(t, 10000));
  });
  it('cancel returns true for valid id #1', () => {
    const s = createScheduler();
    const t = createTask('t1', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #2', () => {
    const s = createScheduler();
    const t = createTask('t2', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #3', () => {
    const s = createScheduler();
    const t = createTask('t3', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #4', () => {
    const s = createScheduler();
    const t = createTask('t4', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #5', () => {
    const s = createScheduler();
    const t = createTask('t5', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #6', () => {
    const s = createScheduler();
    const t = createTask('t6', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #7', () => {
    const s = createScheduler();
    const t = createTask('t7', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #8', () => {
    const s = createScheduler();
    const t = createTask('t8', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #9', () => {
    const s = createScheduler();
    const t = createTask('t9', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #10', () => {
    const s = createScheduler();
    const t = createTask('t10', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #11', () => {
    const s = createScheduler();
    const t = createTask('t11', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #12', () => {
    const s = createScheduler();
    const t = createTask('t12', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #13', () => {
    const s = createScheduler();
    const t = createTask('t13', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #14', () => {
    const s = createScheduler();
    const t = createTask('t14', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #15', () => {
    const s = createScheduler();
    const t = createTask('t15', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #16', () => {
    const s = createScheduler();
    const t = createTask('t16', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #17', () => {
    const s = createScheduler();
    const t = createTask('t17', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #18', () => {
    const s = createScheduler();
    const t = createTask('t18', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #19', () => {
    const s = createScheduler();
    const t = createTask('t19', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #20', () => {
    const s = createScheduler();
    const t = createTask('t20', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #21', () => {
    const s = createScheduler();
    const t = createTask('t21', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #22', () => {
    const s = createScheduler();
    const t = createTask('t22', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #23', () => {
    const s = createScheduler();
    const t = createTask('t23', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #24', () => {
    const s = createScheduler();
    const t = createTask('t24', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
  it('cancel returns true for valid id #25', () => {
    const s = createScheduler();
    const t = createTask('t25', noop);
    const id = s.schedule(t, 10000);
    expect(s.cancel(id)).toBe(true);
    expect(s.pending()).toBe(0);
  });
});

describe('extra coverage', () => {
  it('toArray returns copy', () => {
    const q = createTaskQueue();
    q.add(createTask('a', noop, 'HIGH'));
    const arr = q.toArray();
    expect(arr.length).toBe(1);
    expect(q.size()).toBe(1);
  });
  it('contains returns false for unknown id', () => {
    const q = createTaskQueue();
    expect(q.contains('nonexistent-id')).toBe(false);
  });
  it('remove returns false for unknown id', () => {
    const q = createTaskQueue();
    expect(q.remove('nonexistent-id')).toBe(false);
  });
  it('priorityScore HIGH gt MEDIUM', () => {
    expect(priorityScore('HIGH')).toBeGreaterThan(priorityScore('MEDIUM'));
  });
  it('priorityScore MEDIUM gt LOW', () => {
    expect(priorityScore('MEDIUM')).toBeGreaterThan(priorityScore('LOW'));
  });
  it('filterByPriority MEDIUM', () => {
    const tasks = [createTask('m', noop, 'MEDIUM'), createTask('h', noop, 'HIGH')];
    expect(filterByPriority(tasks, 'MEDIUM').length).toBe(1);
  });
  it('taskStats multiple high', () => {
    const tasks = [createTask('h1', noop, 'HIGH'), createTask('h2', noop, 'HIGH')];
    expect(taskStats(tasks).high).toBe(2);
  });
  it('sortByPriority single item', () => {
    const tasks = [createTask('a', noop, 'LOW')];
    expect(sortByPriority(tasks)[0].priority).toBe('LOW');
  });
  it('scheduler runNow executes fn', async () => {
    const s = createScheduler();
    let ran = false;
    const t = createTask('run', async () => { ran = true; });
    await s.runNow(t);
    expect(ran).toBe(true);
  });
  it('createScheduler starts with 0 pending', () => {
    const s = createScheduler();
    expect(s.pending()).toBe(0);
  });
  it('cancel unknown id returns false', () => {
    const s = createScheduler();
    expect(s.cancel('unknown-id')).toBe(false);
  });
  it('groupByPriority multiple HIGH', () => {
    const tasks = [createTask('h1', noop, 'HIGH'), createTask('h2', noop, 'HIGH')];
    const g = groupByPriority(tasks);
    expect(g.HIGH.length).toBe(2);
  });
});
