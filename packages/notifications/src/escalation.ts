import { Notification, EscalationRule, EscalationAction } from './types';

/**
 * Check if a notification should be escalated based on elapsed time and rules.
 *
 * @param notification - The notification to check
 * @param hoursElapsed - Hours since the notification was created
 * @param rules - Array of escalation rules, sorted by afterHours ascending
 * @returns Escalation action if a rule matches, null otherwise
 */
export function checkEscalation(
  notification: Notification,
  hoursElapsed: number,
  rules: EscalationRule[],
): EscalationAction | null {
  if (!rules || rules.length === 0) return null;
  if (notification.status === 'READ') return null;

  // Sort rules by afterHours descending to find the most relevant (highest) matching rule
  const sortedRules = [...rules].sort((a, b) => b.afterHours - a.afterHours);

  for (const rule of sortedRules) {
    if (hoursElapsed >= rule.afterHours) {
      return {
        rule,
        notificationId: notification.id,
        triggered: true,
        escalatedTo: rule.escalateTo,
        action: rule.action,
      };
    }
  }

  return null;
}

/**
 * Create default escalation rules for different notification priorities.
 * @param priority - Notification priority
 * @param managerId - ID of the manager to escalate to
 * @returns Array of escalation rules
 */
export function getDefaultEscalationRules(
  priority: string,
  managerId: string,
): EscalationRule[] {
  switch (priority) {
    case 'CRITICAL':
      return [
        { afterHours: 1, escalateTo: managerId, action: 'NOTIFY_MANAGER' },
        { afterHours: 4, escalateTo: managerId, action: 'REASSIGN' },
        { afterHours: 24, escalateTo: managerId, action: 'REASSIGN' },
      ];
    case 'HIGH':
      return [
        { afterHours: 4, escalateTo: managerId, action: 'NOTIFY_MANAGER' },
        { afterHours: 24, escalateTo: managerId, action: 'REASSIGN' },
      ];
    case 'MEDIUM':
      return [
        { afterHours: 24, escalateTo: managerId, action: 'NOTIFY_MANAGER' },
        { afterHours: 72, escalateTo: managerId, action: 'REASSIGN' },
      ];
    case 'LOW':
      return [
        { afterHours: 72, escalateTo: managerId, action: 'NOTIFY_MANAGER' },
        { afterHours: 168, escalateTo: managerId, action: 'AUTO_CLOSE' },
      ];
    default:
      return [];
  }
}
