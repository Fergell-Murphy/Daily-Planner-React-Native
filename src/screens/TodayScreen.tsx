import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Plus, Search, User } from "lucide-react-native";
import { ScreenHeader } from "../components/ScreenHeader";
import { TodayTaskCard } from "../components/TodayTaskCard";
import { useTasks } from "../context/TaskContext";
import { useMinuteTicker } from "../hooks/useMinuteTicker";
import { RootStackParamList, Task } from "../types";
import { formatDateKey, getGreeting } from "../utils/date";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TodayScreen() {
  const navigation = useNavigation<NavigationProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const { isReady, userName, todayTasks, toggleTaskComplete } = useTasks();
  const [searchVisible, setSearchVisible] = useState(false);
  const now = useMinuteTicker();

  const today = formatDateKey(new Date());

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1a3a5c" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          right={
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setSearchVisible(true)}
                className="w-9 h-9 rounded-full bg-white items-center justify-center shadow-sm"
              >
                <Search size={18} color="#1a3a5c" />
              </Pressable>
              {/* <View className="w-10 h-10 rounded-full bg-navy-500 items-center justify-center">
                <User size={20} color="#fff" />
              </View> */}
            </View>
          }
        />

        <Text className="text-2xl font-bold text-navy-500 mb-1">
          {getGreeting()}, {userName}
        </Text>
        <Text className="text-gray-500 mb-6">
          You have {todayTasks.length} task{todayTasks.length !== 1 ? "s" : ""}{" "}
          scheduled for today.
        </Text>

        {todayTasks.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center shadow-sm">
            <Text className="text-lg font-semibold text-navy-500 mb-2">
              No tasks yet
            </Text>
            <Text className="text-gray-400 text-center">
              Tap the + button to add your first task for today.
            </Text>
          </View>
        ) : (
          todayTasks.map((task) => (
            <TodayTaskCard
              key={task.id}
              task={task}
              now={now}
              onPress={() =>
                navigation.navigate("EditTask", { taskId: task.id })
              }
              onToggleComplete={() => toggleTaskComplete(task.id)}
            />
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate("EditTask", { date: today })}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-navy-500 items-center justify-center shadow-lg"
      >
        <Plus size={28} color="#fff" />
      </Pressable>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelectTask={(taskId) => {
          setSearchVisible(false);
          navigation.navigate("EditTask", { taskId });
        }}
      />
    </SafeAreaView>
  );
}

function SearchModal({
  visible,
  onClose,
  onSelectTask,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectTask: (taskId: number) => void;
}) {
  const { findTasks } = useTasks();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Task[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim()) {
      const found = await findTasks(text);
      setResults(found);
    } else {
      setResults([]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-navy-500">
              Search Tasks
            </Text>
            <Pressable onPress={onClose}>
              <Text className="text-navy-500 font-semibold">Close</Text>
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search by task name..."
            className="bg-gray-100 rounded-2xl px-4 py-3 mb-4 text-base"
            autoFocus
          />
          <ScrollView>
            {results.map((task) => (
              <Pressable
                key={task.id}
                onPress={() => onSelectTask(task.id)}
                className="py-3 border-b border-gray-100"
              >
                <Text className="text-base font-semibold text-navy-500">
                  {task.name}
                </Text>
                <Text className="text-sm text-gray-400">{task.date}</Text>
              </Pressable>
            ))}
            {query.trim() && results.length === 0 && (
              <Text className="text-gray-400 text-center py-4">
                No tasks found
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
