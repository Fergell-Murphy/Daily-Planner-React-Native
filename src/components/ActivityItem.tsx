import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Task } from '../types';
import { formatCompletedAt } from '../utils/format';
import { isTaskMarkedComplete } from '../utils/taskProgress';
import { CategoryChip } from './CategoryChip';

interface ActivityItemProps {
  task: Task;
  onPress?: () => void;
}

export function ActivityItem({ task, onPress }: ActivityItemProps) {
  const isComplete = isTaskMarkedComplete(task);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          isComplete ? 'bg-sage-100' : 'bg-red-50'
        }`}
      >
        {isComplete ? (
          <Check size={20} color="#4a9b75" strokeWidth={3} />
        ) : (
          <X size={20} color="#ef4444" strokeWidth={3} />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-navy-500">{task.name}</Text>
        <Text className="text-sm text-gray-400 mt-0.5">
          {isComplete ? formatCompletedAt(task.completedAt) : 'Left Over'}
        </Text>
      </View>

      {task.category && (
        <CategoryChip
          name={task.category.name}
          color={task.category.color}
          size="sm"
        />
      )}
    </Pressable>
  );
}
