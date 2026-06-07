import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Database, User } from "lucide-react-native";
import { CategoryChip } from "../components/CategoryChip";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTasks } from "../context/TaskContext";

export function SettingsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const {
    userName,
    setUserName,
    categories,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useTasks();
  const [name, setName] = useState(userName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(userName);
  }, [userName]);

  const handleSaveName = async () => {
    if (name.trim()) {
      await setUserName(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    const success = await setNotificationsEnabled(enabled);
    if (!success && enabled) {
      Alert.alert(
        "Notifications disabled",
        "Enable notifications in your device settings to receive task alarms.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Settings" />

        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-navy-100 items-center justify-center">
              <User size={20} color="#1a3a5c" />
            </View>
            <Text className="text-lg font-bold text-navy-500">Profile</Text>
          </View>

          <Text className="text-sm text-gray-500 mb-2">Your Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-base text-navy-500 mb-3"
          />
          <Pressable
            onPress={handleSaveName}
            className="bg-navy-500 rounded-full py-3 items-center"
          >
            <Text className="text-white font-semibold">
              {saved ? "Saved!" : "Save Name"}
            </Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
              <Bell size={20} color="#d97706" />
            </View>
            <Text className="text-lg font-bold text-navy-500">
              Notifications
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base font-medium text-navy-500">
                Task alarms
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Get notified when a task is scheduled to start.
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: "#e5e7eb", true: "#7e96ba" }}
              thumbColor={notificationsEnabled ? "#1a3a5c" : "#f3f4f6"}
            />
          </View>
        </View>

        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-sage-100 items-center justify-center">
              <Database size={20} color="#4a9b75" />
            </View>
            <Text className="text-lg font-bold text-navy-500">Categories</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => (
              <CategoryChip key={cat.id} name={cat.name} color={cat.color} />
            ))}
          </View>
          <Text className="text-sm text-gray-400 mt-4">
            Add new categories when creating or editing tasks.
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-bold text-navy-500 mb-2">About</Text>
          <Text className="text-gray-500 leading-6">
            Daily Planner stores all your tasks locally on your device using
            SQLite. Your data works fully offline and persists between sessions
            — no account or internet required.
          </Text>
          <Text className="text-gray-400 text-sm mt-4">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
