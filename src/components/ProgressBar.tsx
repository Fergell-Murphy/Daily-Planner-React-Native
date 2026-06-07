import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ percentage, color = '#1a3a5c', height = 6 }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <View className="w-full rounded-full bg-gray-200" style={{ height }}>
      <View
        className="rounded-full"
        style={{
          width: `${clamped}%`,
          height,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
