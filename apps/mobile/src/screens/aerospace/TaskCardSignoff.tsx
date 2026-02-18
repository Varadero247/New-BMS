/**
 * MRO Task Card Sign-off Screen
 * Offline-capable: technician signs task cards offline
 */

export interface TaskCardSignoff {
  id: string;
  workOrderId: string;
  taskCardId: string;
  taskDescription: string;
  technicianId: string;
  technicianName: string;
  signoffType: 'PERFORMED' | 'INSPECTED' | 'APPROVED';
  stamp: string; // AME/AMO stamp number
  notes?: string;
  timestamp: string;
  synced: boolean;
}

export function createTaskCardSignoff(
  data: Omit<TaskCardSignoff, 'id' | 'timestamp' | 'synced'>
): TaskCardSignoff {
  return {
    ...data,
    id: `signoff_${Date.now()}`,
    timestamp: new Date().toISOString(),
    synced: false,
  };
}
