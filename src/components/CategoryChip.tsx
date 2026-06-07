import React from 'react';
import { Pressable, Text } from 'react-native';

interface CategoryChipProps {
  name: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export function CategoryChip({
  name,
  color,
  selected = false,
  onPress,
  size = 'md',
}: CategoryChipProps) {
  const padding = size === 'sm' ? 'px-2.5 py-1' : 'px-4 py-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full ${padding} ${selected ? 'border-2' : 'border border-gray-200'}`}
      style={{
        backgroundColor: selected ? `${color}20` : '#fff',
        borderColor: selected ? color : '#e5e7eb',
      }}
    >
      <Text className={`${textSize} font-medium`} style={{ color: selected ? color : '#374151' }}>
        {name}
      </Text>
    </Pressable>
  );
}
