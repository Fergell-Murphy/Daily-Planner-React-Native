import * as SQLite from "expo-sqlite";
import { DEFAULT_CATEGORIES } from "../constants";
import { Category, DayStats, Task, TaskInput } from "../types";
import { addDays, formatDateKey } from "../utils/date";

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync("daily_planner.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      completion INTEGER NOT NULL DEFAULT 0,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
  `);

  await migrateSchema();
  await seedIfEmpty();
}

async function migrateSchema(): Promise<void> {
  const database = getDb();
  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(tasks)",
  );
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has("alarm_enabled")) {
    await database.execAsync(
      "ALTER TABLE tasks ADD COLUMN alarm_enabled INTEGER NOT NULL DEFAULT 1",
    );
  }
  if (!columnNames.has("notification_id")) {
    await database.execAsync(
      "ALTER TABLE tasks ADD COLUMN notification_id TEXT",
    );
  }
}

function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error("Database not initialized");
  return db;
}

async function seedIfEmpty(): Promise<void> {
  const database = getDb();
  const categoryCount = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories",
  );

  if ((categoryCount?.count ?? 0) > 0) return;

  for (const cat of DEFAULT_CATEGORIES) {
    await database.runAsync(
      "INSERT INTO categories (name, color) VALUES (?, ?)",
      cat.name,
      cat.color,
    );
  }

  const categories = await getCategories();
  const today = formatDateKey(new Date());
  const yesterday = formatDateKey(addDays(new Date(), -1));

  const sampleTasks: Array<TaskInput & { date: string; completedAt?: string }> =
    [
      // {
      //   name: "Review your daily tasks",
      //   startTime: 8 * 60,
      //   endTime: 9 * 60 + 30,
      //   completion: 50,
      //   categoryId: categories.find((c) => c.name === "Activity")?.id ?? 6,
      //   date: today,
      // },
    ];

  for (const task of sampleTasks) {
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT INTO tasks (name, start_time, end_time, completion, category_id, date, completed_at, created_at, updated_at, alarm_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      task.name,
      task.startTime,
      task.endTime,
      task.completion,
      task.categoryId,
      task.date,
      task.completedAt ?? null,
      now,
      now,
    );
  }
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    name: row.name as string,
    startTime: row.start_time as number,
    endTime: row.end_time as number,
    completion: row.completion as number,
    categoryId: row.category_id as number,
    date: row.date as string,
    completedAt: row.completed_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    alarmEnabled: (row.alarm_enabled as number | undefined) !== 0,
    notificationId: (row.notification_id as string | null) ?? null,
    category: row.category_name
      ? {
          id: row.category_id as number,
          name: row.category_name as string,
          color: row.category_color as string,
        }
      : undefined,
  };
}

const TASK_SELECT = `
  SELECT t.*, c.name as category_name, c.color as category_color
  FROM tasks t
  JOIN categories c ON t.category_id = c.id
`;

export async function getCategories(): Promise<Category[]> {
  return getDb().getAllAsync<Category>(
    "SELECT * FROM categories ORDER BY name",
  );
}

export async function createCategory(
  name: string,
  color: string,
): Promise<Category> {
  const result = await getDb().runAsync(
    "INSERT INTO categories (name, color) VALUES (?, ?)",
    name,
    color,
  );
  return { id: result.lastInsertRowId, name, color };
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const rows = await getDb().getAllAsync<Record<string, unknown>>(
    `${TASK_SELECT} WHERE t.date = ? ORDER BY t.start_time`,
    date,
  );
  return rows.map(mapTask);
}

export async function getTaskById(id: number): Promise<Task | null> {
  const row = await getDb().getFirstAsync<Record<string, unknown>>(
    `${TASK_SELECT} WHERE t.id = ?`,
    id,
  );
  return row ? mapTask(row) : null;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const now = new Date().toISOString();
  const completedAt = input.completion >= 100 ? now : null;

  const alarmEnabled = input.alarmEnabled !== false ? 1 : 0;

  const result = await getDb().runAsync(
    `INSERT INTO tasks (name, start_time, end_time, completion, category_id, date, completed_at, created_at, updated_at, alarm_enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.name,
    input.startTime,
    input.endTime,
    input.completion,
    input.categoryId,
    input.date,
    completedAt,
    now,
    now,
    alarmEnabled,
  );

  const task = await getTaskById(result.lastInsertRowId);
  if (!task) throw new Error("Failed to create task");
  return task;
}

export async function updateTask(
  id: number,
  input: Partial<TaskInput>,
): Promise<Task> {
  const existing = await getTaskById(id);
  if (!existing) throw new Error("Task not found");

  const now = new Date().toISOString();
  const completion = input.completion ?? existing.completion;
  const completedAt =
    completion >= 100
      ? (existing.completedAt ?? now)
      : completion < 100
        ? null
        : existing.completedAt;

  const alarmEnabled =
    input.alarmEnabled !== undefined
      ? input.alarmEnabled
        ? 1
        : 0
      : existing.alarmEnabled
        ? 1
        : 0;

  await getDb().runAsync(
    `UPDATE tasks SET
      name = ?, start_time = ?, end_time = ?, completion = ?,
      category_id = ?, date = ?, completed_at = ?, updated_at = ?, alarm_enabled = ?
     WHERE id = ?`,
    input.name ?? existing.name,
    input.startTime ?? existing.startTime,
    input.endTime ?? existing.endTime,
    completion,
    input.categoryId ?? existing.categoryId,
    input.date ?? existing.date,
    completedAt,
    now,
    alarmEnabled,
    id,
  );

  const task = await getTaskById(id);
  if (!task) throw new Error("Failed to update task");
  return task;
}

export async function deleteTask(id: number): Promise<void> {
  await getDb().runAsync("DELETE FROM tasks WHERE id = ?", id);
}

export async function setTaskNotificationId(
  taskId: number,
  notificationId: string | null,
): Promise<void> {
  await getDb().runAsync(
    "UPDATE tasks SET notification_id = ? WHERE id = ?",
    notificationId,
    taskId,
  );
}

export async function getUpcomingAlarmTasks(): Promise<Task[]> {
  const today = formatDateKey(new Date());
  const rows = await getDb().getAllAsync<Record<string, unknown>>(
    `${TASK_SELECT} WHERE t.date >= ? AND t.alarm_enabled = 1 ORDER BY t.date, t.start_time`,
    today,
  );
  return rows.map(mapTask);
}

export async function updateTaskCompletion(
  id: number,
  completion: number,
): Promise<Task> {
  return updateTask(id, { completion });
}

export async function moveUnfinishedTasks(
  fromDate: string,
  toDate: string,
): Promise<number> {
  const result = await getDb().runAsync(
    `UPDATE tasks SET date = ?, updated_at = ?
     WHERE date = ? AND completion < 100`,
    toDate,
    new Date().toISOString(),
    fromDate,
  );
  return result.changes;
}

export async function getDayStats(date: string): Promise<DayStats> {
  const row = await getDb().getFirstAsync<{ total: number; completed: number }>(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN completion >= 100 THEN 1 ELSE 0 END) as completed
     FROM tasks WHERE date = ?`,
    date,
  );

  const total = row?.total ?? 0;
  const completed = row?.completed ?? 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}

export async function getStreak(): Promise<number> {
  let streak = 0;
  let checkDate = new Date();

  while (true) {
    const dateKey = formatDateKey(checkDate);
    const stats = await getDayStats(dateKey);

    if (stats.total === 0) break;
    if (stats.percentage < 75) break;

    streak++;
    checkDate = addDays(checkDate, -1);
  }

  return streak;
}

export async function getWeeklyAverage(): Promise<number> {
  const dates = Array.from({ length: 7 }, (_, i) =>
    formatDateKey(addDays(new Date(), -i)),
  );

  let totalPercentage = 0;
  let daysWithTasks = 0;

  for (const date of dates) {
    const stats = await getDayStats(date);
    if (stats.total > 0) {
      totalPercentage += stats.percentage;
      daysWithTasks++;
    }
  }

  return daysWithTasks > 0 ? Math.round(totalPercentage / daysWithTasks) : 0;
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await getDb().runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    key,
    value,
  );
}

export async function searchTasks(query: string): Promise<Task[]> {
  const rows = await getDb().getAllAsync<Record<string, unknown>>(
    `${TASK_SELECT} WHERE t.name LIKE ? ORDER BY t.date DESC, t.start_time`,
    `%${query}%`,
  );
  return rows.map(mapTask);
}
