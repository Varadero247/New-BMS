'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Clock, UserCheck, UserX, AlertTriangle, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Attendance {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  workedHours?: number;
  overtimeHours?: number;
  lateMinutes: number;
  status: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

const statusColors: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  LATE: 'bg-orange-100 text-orange-700',
  HALF_DAY: 'bg-yellow-100 text-yellow-700',
  ON_LEAVE: 'bg-purple-100 text-purple-700',
  WORK_FROM_HOME: 'bg-blue-100 text-blue-700',
  HOLIDAY: 'bg-gray-100 text-gray-700',
};

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadAttendance();
    loadSummary();
  }, [selectedDate]);

  async function loadAttendance() {
    try {
      const res = await api.get(`/attendance?startDate=${selectedDate}&endDate=${selectedDate}`);
      setAttendances(res.data.data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      const res = await api.get(`/attendance/summary?startDate=${selectedDate}&endDate=${selectedDate}`);
      setSummary(res.data.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    present: attendances.filter(a => a.status === 'PRESENT').length,
    late: attendances.filter(a => a.status === 'LATE').length,
    absent: attendances.filter(a => a.status === 'ABSENT').length,
    onLeave: attendances.filter(a => a.status === 'ON_LEAVE').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-500 mt-1">Daily attendance tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Late</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">On Leave</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.onLeave}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {attendances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Clock In</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Clock Out</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Hours</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Overtime</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{attendance.employee.firstName} {attendance.employee.lastName}</p>
                            <p className="text-sm text-gray-500">{attendance.employee.employeeNumber}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[attendance.status] || 'bg-gray-100'}>
                            {attendance.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{formatTime(attendance.clockIn)}</td>
                        <td className="py-3 px-4">{formatTime(attendance.clockOut)}</td>
                        <td className="py-3 px-4">
                          {attendance.workedHours ? `${attendance.workedHours.toFixed(1)}h` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {attendance.overtimeHours ? (
                            <span className="text-blue-600 font-medium">+{attendance.overtimeHours.toFixed(1)}h</span>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {attendance.lateMinutes > 0 ? (
                            <span className="text-orange-600">{attendance.lateMinutes}m</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
