import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createCategory,
  createTask,
  deleteTask,
  getCategories,
  getDayStats,
  getSetting,
  getStreak,
  getTasksByDate,
  getTaskById,
  getUpcomingAlarmTasks,
  getWeeklyAverage,
  initDatabase,
  moveUnfinishedTasks,
  searchTasks,
  setSetting,
  updateTask,
  updateTaskCompletion,
} from "../db/database";
import {
  cancelNotification,
  // ensureNotificationInfrastructure,
  // requestNotificationPermissions,
  rescheduleAllTaskNotifications,
  syncTaskNotification,
} from "../services/notifications";
import { Category, DayStats, Task, TaskInput } from "../types";
import { formatDateKey } from "../utils/date";

interface TaskContextValue {
  isReady: boolean;
  needsOnboarding: boolean;
  userName: string;
  notificationsEnabled: boolean;
  categories: Category[];
  selectedDate: string;
  tasks: Task[];
  todayTasks: Task[];
  dayStats: DayStats;
  streak: number;
  weeklyAverage: number;
  setSelectedDate: (date: string) => void;
  setUserName: (name: string) => Promise<void>;
  completeOnboarding: (name: string) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  refresh: () => Promise<void>;
  addTask: (input: TaskInput) => Promise<Task>;
  editTask: (id: number, input: Partial<TaskInput>) => Promise<Task>;
  removeTask: (id: number) => Promise<void>;
  toggleTaskComplete: (id: number) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<Category>;
  moveLeftoverTasks: (fromDate: string, toDate: string) => Promise<number>;
  findTasks: (query: string) => Promise<Task[]>;
  getTask: (id: number) => Promise<Task | null>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

function parseNotificationsEnabled(value: string | null): boolean {
  return value !== "false";
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [userName, setUserNameState] = useState("");
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [dayStats, setDayStats] = useState<DayStats>({
    total: 0,
    completed: 0,
    percentage: 0,
  });
  const [streak, setStreak] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);

  const needsOnboarding = isReady && !userName.trim();

  const syncNotificationsForTask = useCallback(
    async (task: Task) => {
      const fresh = await getTaskById(task.id);
      if (!fresh) return;
      await syncTaskNotification(fresh, notificationsEnabled);
    },
    [notificationsEnabled],
  );

  const loadData = useCallback(async () => {
    const today = formatDateKey(new Date());
    const [
      cats,
      name,
      notifSetting,
      dateTasks,
      todaysTasks,
      stats,
      streakCount,
      weekly,
    ] = await Promise.all([
      getCategories(),
      getSetting("userName"),
      getSetting("notificationsEnabled"),
      getTasksByDate(selectedDate),
      getTasksByDate(today),
      getDayStats(selectedDate),
      getStreak(),
      getWeeklyAverage(),
    ]);

    setCategories(cats);
    setUserNameState(name ?? "");
    setNotificationsEnabledState(parseNotificationsEnabled(notifSetting));
    setTasks(dateTasks);
    setTodayTasks(todaysTasks);
    setDayStats(stats);
    setStreak(streakCount);
    setWeeklyAverage(weekly);
  }, [selectedDate]);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await loadData();
      const notifSetting = await getSetting("notificationsEnabled");
      const enabled = parseNotificationsEnabled(notifSetting);
      if (enabled) {
        // await ensureNotificationInfrastructure();
        const upcoming = await getUpcomingAlarmTasks();
        await rescheduleAllTaskNotifications(upcoming, true);
      }
      setIsReady(true);
    })();
  }, [loadData]);

  useEffect(() => {
    if (isReady) loadData();
  }, [isReady, loadData]);

  const setUserName = useCallback(async (name: string) => {
    await setSetting("userName", name);
    setUserNameState(name);
  }, []);

  const completeOnboarding = useCallback(
    async (name: string) => {
      await setUserName(name);
      //await ensureNotificationInfrastructure();
      const upcoming = await getUpcomingAlarmTasks();
      await rescheduleAllTaskNotifications(upcoming, true);
    },
    [setUserName],
  );

  const setNotificationsEnabled = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (enabled) {
        //const granted = await requestNotificationPermissions();
        // if (!granted) return false;
      }

      await setSetting("notificationsEnabled", enabled ? "true" : "false");
      setNotificationsEnabledState(enabled);

      const upcoming = await getUpcomingAlarmTasks();
      await rescheduleAllTaskNotifications(upcoming, enabled);
      await loadData();
      return true;
    },
    [loadData],
  );

  const addTask = useCallback(
    async (input: TaskInput) => {
      const task = await createTask(input);
      await syncNotificationsForTask(task);
      await loadData();
      return (await getTaskById(task.id)) ?? task;
    },
    [loadData, syncNotificationsForTask],
  );

  const editTask = useCallback(
    async (id: number, input: Partial<TaskInput>) => {
      const existing = await getTaskById(id);
      if (existing?.notificationId) {
        await cancelNotification(existing.notificationId);
      }

      const task = await updateTask(id, input);
      await syncNotificationsForTask(task);
      await loadData();
      return (await getTaskById(task.id)) ?? task;
    },
    [loadData, syncNotificationsForTask],
  );

  const removeTask = useCallback(
    async (id: number) => {
      const existing = await getTaskById(id);
      if (existing?.notificationId) {
        await cancelNotification(existing.notificationId);
      }
      await deleteTask(id);
      await loadData();
    },
    [loadData],
  );

  const toggleTaskComplete = useCallback(
    async (id: number) => {
      const task = await getTaskById(id);
      if (!task) return;
      const newCompletion = task.completion >= 100 ? 0 : 100;
      await updateTaskCompletion(id, newCompletion);
      await loadData();
    },
    [loadData],
  );

  const addCategory = useCallback(
    async (name: string, color: string) => {
      const category = await createCategory(name, color);
      await loadData();
      return category;
    },
    [loadData],
  );

  const moveLeftoverTasks = useCallback(
    async (fromDate: string, toDate: string) => {
      const count = await moveUnfinishedTasks(fromDate, toDate);
      if (notificationsEnabled) {
        const upcoming = await getUpcomingAlarmTasks();
        await rescheduleAllTaskNotifications(upcoming, true);
      }
      await loadData();
      return count;
    },
    [loadData, notificationsEnabled],
  );

  const value = useMemo(
    () => ({
      isReady,
      needsOnboarding,
      userName,
      notificationsEnabled,
      categories,
      selectedDate,
      tasks,
      todayTasks,
      dayStats,
      streak,
      weeklyAverage,
      setSelectedDate,
      setUserName,
      completeOnboarding,
      setNotificationsEnabled,
      refresh: loadData,
      addTask,
      editTask,
      removeTask,
      toggleTaskComplete,
      addCategory,
      moveLeftoverTasks,
      findTasks: searchTasks,
      getTask: getTaskById,
    }),
    [
      isReady,
      needsOnboarding,
      userName,
      notificationsEnabled,
      categories,
      selectedDate,
      tasks,
      todayTasks,
      dayStats,
      streak,
      weeklyAverage,
      setUserName,
      completeOnboarding,
      setNotificationsEnabled,
      loadData,
      addTask,
      editTask,
      removeTask,
      toggleTaskComplete,
      addCategory,
      moveLeftoverTasks,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within TaskProvider");
  return context;
}
