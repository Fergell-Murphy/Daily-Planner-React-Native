import React from "react";
import { Text, View } from "react-native";
import { CalendarDays } from "lucide-react-native";

interface ScreenHeaderProps {
  title?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({
  title = "Daily Planner",
  right,
}: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-6 h-10">
      <View className="flex-row items-center gap-2">
        <CalendarDays size={26} color="#1a3a5c" />
        <Text className="text-2xl font-bold text-navy-500">{title}</Text>
      </View>
      {right}
    </View>
  );
}
