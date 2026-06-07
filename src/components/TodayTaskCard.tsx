import React from "react";
import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { Task } from "../types";
import {
  formatTimeRange,
  getStatusLabel,
  getTaskStatus,
} from "../utils/format";
import {
  getDisplayProgress,
  isTaskMarkedComplete,
} from "../utils/taskProgress";
import { ProgressBar } from "./ProgressBar";

interface TodayTaskCardProps {
  task: Task;
  now: Date;
  onPress: () => void;
  onToggleComplete?: () => void;
}

export function TodayTaskCard({
  task,
  now,
  onPress,
  onToggleComplete,
}: TodayTaskCardProps) {
  const displayProgress = getDisplayProgress(task, now);
  const status = getTaskStatus(task, now);
  const isCompleted = isTaskMarkedComplete(task);
  const statusColor =
    status === "done"
      ? "#4a9b75"
      : status === "in_progress"
        ? "#1a3a5c"
        : "#9ca3af";
  const categoryColor = task.category?.color ?? "#1a3a5c";

  return (
    <Pressable onPress={onPress} className="mb-4">
      <View className="bg-white rounded-3xl overflow-hidden shadow-sm">
        <View className="flex-row">
          <View className="w-1.5" style={{ backgroundColor: statusColor }} />
          <View className="flex-1 p-5">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1 mr-2">
                {onToggleComplete && (
                  <Pressable
                    onPress={onToggleComplete}
                    className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
                      isCompleted
                        ? "bg-sage-500 border-sage-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isCompleted && (
                      <Check size={14} color="#fff" strokeWidth={3} />
                    )}
                  </Pressable>
                )}
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${categoryColor}20` }}
                >
                  <Text
                    className="text-xs font-bold tracking-wide"
                    style={{ color: categoryColor }}
                  >
                    {task.category?.name.toUpperCase() ?? "TASK"}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-400">
                {formatTimeRange(task.startTime, task.endTime)}
              </Text>
            </View>

            <Text
              className={`text-xl font-bold mb-4 ${
                isCompleted ? "text-gray-400 line-through" : "text-navy-500"
              }`}
            >
              {task.name}
            </Text>

            <View className="flex-row items-center justify-between mb-2">
              <ProgressBar percentage={displayProgress} color={categoryColor} />
              <Text className="text-sm font-semibold text-navy-500 ml-3 w-10 text-right">
                {displayProgress}%
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: statusColor }}
              />
              <Text className="text-sm text-gray-500">
                {getStatusLabel(task, now)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
