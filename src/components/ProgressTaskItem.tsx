import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Task } from '../types';
import { formatCompletedAt, formatTimeRange } from '../utils/format';

interface ProgressTaskItemProps {
  task: Task;
  variant: 'todo' | 'completed';
  onPress?: () => void;
  onToggle?: () => void;
}

export function ProgressTaskItem({
  task,
  variant,
  onPress,
  onToggle,
}: ProgressTaskItemProps) {
  const isCompleted = variant === 'completed';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <Pressable
        onPress={onToggle}
        className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
          isCompleted ? 'bg-sage-500 border-sage-500' : 'border-gray-300'
        }`}
      >
        {isCompleted && <Check size={14} color="#fff" strokeWidth={3} />}
      </Pressable>

      <View
        className="w-1 h-10 rounded-full mr-3"
        style={{ backgroundColor: task.category?.color ?? '#1a3a5c' }}
      />

      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            isCompleted ? 'text-gray-400 line-through' : 'text-navy-500'
          }`}
        >
          {task.name}
        </Text>
        <Text className="text-sm text-gray-400 mt-0.5">
          {isCompleted
            ? formatCompletedAt(task.completedAt)
            : formatTimeRange(task.startTime, task.endTime)}
        </Text>
      </View>

      {!isCompleted && task.category && (
        <View
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${task.category.color}20` }}
        >
          <Text className="text-xs font-medium" style={{ color: task.category.color }}>
            {task.category.name}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
