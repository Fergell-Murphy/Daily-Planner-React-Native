export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  name: string;
  startTime: number;
  endTime: number;
  completion: number;
  categoryId: number;
  date: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  alarmEnabled: boolean;
  notificationId: string | null;
  category?: Category;
}

export interface TaskInput {
  name: string;
  startTime: number;
  endTime: number;
  completion: number;
  categoryId: number;
  date: string;
  alarmEnabled?: boolean;
}

export interface DayStats {
  total: number;
  completed: number;
  percentage: number;
}

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  EditTask: { taskId?: number; date?: string };
};

export type TabParamList = {
  Today: undefined;
  Progress: undefined;
  Settings: undefined;
};
