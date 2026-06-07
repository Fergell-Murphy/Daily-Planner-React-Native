import { Task } from '../types';
import { formatDateKey } from './date';
import { dateToMinutes } from './format';

export function isTaskMarkedComplete(task: Task): boolean {
  return task.completion >= 100;
}

export function getScheduledProgress(task: Task, now = new Date()): number {
  const today = formatDateKey(now);

  if (task.date > today) return 0;
  if (task.date < today) return 100;

  const nowMinutes = dateToMinutes(now);

  if (nowMinutes <= task.startTime) return 0;
  if (nowMinutes >= task.endTime) return 100;

  const duration = task.endTime - task.startTime;
  if (duration <= 0) return 0;

  return Math.round(((nowMinutes - task.startTime) / duration) * 100);
}

export function getDisplayProgress(task: Task, now = new Date()): number {
  return isTaskMarkedComplete(task) ? 100 : getScheduledProgress(task, now);
}
