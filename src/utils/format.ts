export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

export function timeStringToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + mins;
}

export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function minutesToDate(minutes: number, baseDate: Date = new Date()): Date {
  const result = new Date(baseDate);
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return result;
}

export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  return `${minutesToTimeString(startMinutes)} - ${minutesToTimeString(endMinutes)}`;
}

export function formatCompletedAt(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `Completed at ${minutesToTimeString(dateToMinutes(date))}`;
}

import { Task } from '../types';
import { getScheduledProgress, isTaskMarkedComplete } from './taskProgress';

export function getTaskStatus(
  task: Task,
  now = new Date(),
): 'done' | 'in_progress' | 'not_started' {
  if (isTaskMarkedComplete(task)) return 'done';
  if (getScheduledProgress(task, now) > 0) return 'in_progress';
  return 'not_started';
}

export function getStatusLabel(task: Task, now = new Date()): string {
  const status = getTaskStatus(task, now);
  if (status === 'done') return 'Done';
  if (status === 'in_progress') return 'In Progress';
  return 'Not Started';
}
