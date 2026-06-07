import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowLeft,
  Bell,
  MoreVertical,
  Save,
  Trash2,
} from "lucide-react-native";
import { CategoryChip } from "../components/CategoryChip";
import { useTasks } from "../context/TaskContext";
import { RootStackParamList } from "../types";
import { formatDateKey } from "../utils/date";
import {
  dateToMinutes,
  minutesToDate,
  minutesToTimeString,
} from "../utils/format";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditTaskRoute = RouteProp<RootStackParamList, "EditTask">;

const CATEGORY_COLORS = [
  "#4a9b75",
  "#7e96ba",
  "#b8956a",
  "#5373a3",
  "#67b38f",
  "#e879a9",
  "#f59e0b",
];

export function EditTaskScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditTaskRoute>();
  const { taskId, date: paramDate } = route.params ?? {};
  const {
    categories,
    addTask,
    editTask,
    removeTask,
    getTask,
    addCategory,
    isReady,
  } = useTasks();

  const [loading, setLoading] = useState(!!taskId);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState(8 * 60);
  const [endTime, setEndTime] = useState(9 * 60);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [taskDate, setTaskDate] = useState(
    paramDate ?? formatDateKey(new Date()),
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [alarmEnabled, setAlarmEnabled] = useState(true);

  const isEditing = !!taskId;

  useEffect(() => {
    if (categories.length > 0) {
      setCategoryId((current) => current || categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    if (taskId) {
      (async () => {
        const task = await getTask(taskId);
        if (task) {
          setName(task.name);
          setStartTime(task.startTime);
          setEndTime(task.endTime);
          setCategoryId(task.categoryId);
          setTaskDate(task.date);
          setAlarmEnabled(task.alarmEnabled);
        }
        setLoading(false);
      })();
    }
  }, [taskId, getTask]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a task name.");
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Invalid Time", "End time must be after start time.");
      return;
    }

    const input = {
      name: name.trim(),
      startTime,
      endTime,
      categoryId,
      date: taskDate,
      alarmEnabled,
    };

    if (isEditing && taskId) {
      await editTask(taskId, input);
    } else {
      await addTask({ ...input, completion: 0 });
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (taskId) {
            await removeTask(taskId);
            navigation.goBack();
          }
        },
      },
    ]);
  };

  const handleAddCategory = async (catName: string) => {
    if (!catName.trim()) return;
    const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];
    const cat = await addCategory(catName.trim(), color);
    setCategoryId(cat.id);
  };

  if (!isReady || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1a3a5c" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-5 py-4">
        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#1a3a5c" />
        </Pressable>
        <Text className="text-xl font-bold text-navy-500">
          {isEditing ? "Edit Task" : "New Task"}
        </Text>
        <Pressable onPress={() => setShowMenu(true)} className="p-2 -mr-2">
          <MoreVertical size={24} color="#1a3a5c" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Text className="text-sm font-medium text-gray-500 mb-2">
          Task Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g., Morning Medication"
          className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-lg text-navy-500 mb-6"
        />

        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-2">
              Start Time
            </Text>
            <Pressable
              onPress={() => setShowStartPicker(true)}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-4"
            >
              <Text className="text-base text-navy-500">
                {minutesToTimeString(startTime)}
              </Text>
            </Pressable>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-2">
              End Time
            </Text>
            <Pressable
              onPress={() => setShowEndPicker(true)}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-4"
            >
              <Text className="text-base text-navy-500">
                {minutesToTimeString(endTime)}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-4">
            <Bell size={20} color="#1a3a5c" />
            <View>
              <Text className="text-base font-medium text-navy-500">Alarm</Text>
              <Text className="text-sm text-gray-500">
                Notify at start time
              </Text>
            </View>
          </View>
          <Switch
            value={alarmEnabled}
            onValueChange={setAlarmEnabled}
            trackColor={{ false: "#e5e7eb", true: "#7e96ba" }}
            thumbColor={alarmEnabled ? "#1a3a5c" : "#f3f4f6"}
          />
        </View>

        <Text className="text-sm font-medium text-gray-500 mb-3">
          Categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        >
          <View className="flex-row gap-2">
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                name={cat.name}
                color={cat.color}
                selected={categoryId === cat.id}
                onPress={() => setCategoryId(cat.id)}
              />
            ))}
            <Pressable
              onPress={() => setShowNewCategory(true)}
              className="px-4 py-2 rounded-full border border-dashed border-gray-300"
            >
              <Text className="text-sm text-gray-500">+ New Category</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScrollView>

      <View className="px-5 pb-6">
        <Pressable
          onPress={handleSave}
          className="bg-navy-500 rounded-full py-4 flex-row items-center justify-center gap-2"
        >
          <Save size={20} color="#fff" />
          <Text className="text-white text-lg font-bold">Save Task</Text>
        </Pressable>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={minutesToDate(startTime)}
          mode="time"
          display="spinner"
          onChange={(_, date) => {
            setShowStartPicker(false);
            if (date) setStartTime(dateToMinutes(date));
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={minutesToDate(endTime)}
          mode="time"
          display="spinner"
          onChange={(_, date) => {
            setShowEndPicker(false);
            if (date) setEndTime(dateToMinutes(date));
          }}
        />
      )}

      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setShowMenu(false)}
        >
          <View className="absolute top-20 right-5 bg-white rounded-2xl shadow-lg overflow-hidden">
            {isEditing && (
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
                className="flex-row items-center gap-3 px-5 py-4"
              >
                <Trash2 size={20} color="#ef4444" />
                <Text className="text-red-500 font-medium">Delete Task</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>

      <NewCategoryModal
        visible={showNewCategory}
        name={newCategoryName}
        onChangeName={setNewCategoryName}
        onClose={() => setShowNewCategory(false)}
        onSave={handleAddCategory}
      />
    </SafeAreaView>
  );
}

function NewCategoryModal({
  visible,
  name,
  onChangeName,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  onChangeName: (v: string) => void;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-5">
          <Text className="text-xl font-bold text-navy-500 mb-4">
            New Category
          </Text>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder="Category name"
            className="bg-gray-100 rounded-2xl px-4 py-3 mb-4 text-base"
            autoFocus
          />
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 rounded-2xl bg-gray-100"
            >
              <Text className="text-center font-semibold text-gray-600">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onSave(name);
                onChangeName("");
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-navy-500"
            >
              <Text className="text-center font-semibold text-white">Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
