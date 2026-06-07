import React, { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { formatDateKey, getDayLabel, getDayNumber, isSameDay, parseDateKey } from '../utils/date';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dates: Date[];
}

export function DateSelector({ selectedDate, onSelectDate, dates }: DateSelectorProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selected = parseDateKey(selectedDate);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-1"
    >
      {dates.map((date) => {
        const isSelected = isSameDay(date, selected);
        const dateKey = formatDateKey(date);

        return (
          <Pressable
            key={dateKey}
            onPress={() => onSelectDate(dateKey)}
            className={`items-center justify-center rounded-2xl px-4 py-3 min-w-[56px] ${
              isSelected ? 'bg-navy-500' : 'bg-white'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isSelected ? 'text-white/80' : 'text-gray-400'
              }`}
            >
              {getDayLabel(date)}
            </Text>
            <Text
              className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-navy-500'}`}
            >
              {getDayNumber(date)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
