import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { setTaskNotificationId } from "../db/database";
import { Task } from "../types";
import { parseDateKey } from "../utils/date";

export const TASK_ALARM_CHANNEL_ID = "task-alarms";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function taskStartToDate(
  dateKey: string,
  startTimeMinutes: number,
): Date {
  const date = parseDateKey(dateKey);
  date.setHours(Math.floor(startTimeMinutes / 60), startTimeMinutes % 60, 0, 0);
  return date;
}

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(TASK_ALARM_CHANNEL_ID, {
    name: "Task alarms",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1a3a5c",
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });
}

export async function getNotificationPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined"
> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  await ensureAndroidNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function ensureNotificationInfrastructure(): Promise<boolean> {
  await ensureAndroidNotificationChannel();
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;

  const { status: requested } = await Notifications.requestPermissionsAsync();
  return requested === "granted";
}

export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Notification may already have fired or been removed
  }
}

export async function scheduleTaskAlarm(task: Task): Promise<string | null> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return null;

  const triggerDate = taskStartToDate(task.date, task.startTime);
  if (triggerDate.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Task starting",
      body: task.name,
      data: { taskId: task.id },
      sound: "default",
      ...(Platform.OS === "android" && { channelId: TASK_ALARM_CHANNEL_ID }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function syncTaskNotification(
  task: Task,
  notificationsEnabled: boolean,
): Promise<void> {
  if (task.notificationId) {
    await cancelNotification(task.notificationId);
    await setTaskNotificationId(task.id, null);
    task = { ...task, notificationId: null };
  }

  if (!notificationsEnabled || !task.alarmEnabled) return;

  const permitted = await ensureNotificationInfrastructure();
  if (!permitted) return;

  const notificationId = await scheduleTaskAlarm(task);
  if (notificationId) {
    await setTaskNotificationId(task.id, notificationId);
  }
}

export async function cancelAllTaskNotifications(tasks: Task[]): Promise<void> {
  await Promise.all(
    tasks
      .filter((t) => t.notificationId)
      .map(async (t) => {
        await cancelNotification(t.notificationId!);
        await setTaskNotificationId(t.id, null);
      }),
  );
}

export async function rescheduleAllTaskNotifications(
  tasks: Task[],
  notificationsEnabled: boolean,
): Promise<void> {
  if (!notificationsEnabled) {
    await cancelAllTaskNotifications(tasks);
    return;
  }

  const permitted = await ensureNotificationInfrastructure();
  if (!permitted) return;

  for (const task of tasks) {
    if (task.alarmEnabled) {
      await syncTaskNotification({ ...task, notificationId: null }, true);
    } else if (task.notificationId) {
      await cancelNotification(task.notificationId);
      await setTaskNotificationId(task.id, null);
    }
  }
}
