import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertTriangle, Check, Star, TrendingUp } from 'lucide-react-native';
import { ActivityItem } from '../components/ActivityItem';
import { CircularProgress } from '../components/CircularProgress';
import { DateSelector } from '../components/DateSelector';
import { ProgressBar } from '../components/ProgressBar';
import { ProgressTaskItem } from '../components/ProgressTaskItem';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTasks } from '../context/TaskContext';
import { RootStackParamList } from '../types';
import {
  formatDateKey,
  getRelativeDayLabel,
  getWeekDates,
  parseDateKey,
} from '../utils/date';
import { isTaskMarkedComplete } from '../utils/taskProgress';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    isReady,
    selectedDate,
    setSelectedDate,
    tasks,
    dayStats,
    streak,
    weeklyAverage,
    moveLeftoverTasks,
    toggleTaskComplete,
  } = useTasks();

  const [viewMode, setViewMode] = useState<'history' | 'detail'>('history');

  const weekDates = useMemo(
    () => getWeekDates(parseDateKey(selectedDate)),
    [selectedDate]
  );

  const today = formatDateKey(new Date());

  const unfinishedCount = useMemo(
    () => tasks.filter((t) => !isTaskMarkedComplete(t)).length,
    [tasks]
  );

  const todoTasks = useMemo(
    () => tasks.filter((t) => !isTaskMarkedComplete(t)),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => isTaskMarkedComplete(t)),
    [tasks]
  );

  const handleMoveToToday = async () => {
    const count = await moveLeftoverTasks(selectedDate, today);
    Alert.alert(
      'Tasks Moved',
      count > 0
        ? `${count} unfinished task${count !== 1 ? 's' : ''} moved to today.`
        : 'No unfinished tasks to move.'
    );
    setSelectedDate(today);
  };

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1a3a5c" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader />

        <DateSelector
          dates={weekDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <View className="flex-row gap-2 mt-4 mb-6">
          <Pressable
            onPress={() => setViewMode('history')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              viewMode === 'history' ? 'bg-navy-500' : 'bg-white'
            }`}
          >
            <Text
              className={`font-semibold ${
                viewMode === 'history' ? 'text-white' : 'text-navy-500'
              }`}
            >
              History
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('detail')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              viewMode === 'detail' ? 'bg-navy-500' : 'bg-white'
            }`}
          >
            <Text
              className={`font-semibold ${
                viewMode === 'detail' ? 'text-white' : 'text-navy-500'
              }`}
            >
              Analytics
            </Text>
          </Pressable>
        </View>

        {viewMode === 'history' ? (
          <>
            <View className="bg-navy-500 rounded-3xl p-5 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white/80 text-sm font-medium">
                  {getRelativeDayLabel(selectedDate)}
                </Text>
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                  <Check size={18} color="#fff" />
                </View>
              </View>
              <Text className="text-white text-xl font-bold mb-3">
                {dayStats.completed} of {dayStats.total} tasks completed
              </Text>
              <ProgressBar percentage={dayStats.percentage} color="#fff" height={8} />
            </View>

            {unfinishedCount > 0 && selectedDate !== today && (
              <Pressable
                onPress={handleMoveToToday}
                className="bg-cream-100 rounded-3xl p-5 mb-4 flex-row items-start"
              >
                <AlertTriangle size={22} color="#ef4444" className="mr-3" />
                <View className="flex-1 ml-3">
                  <Text className="text-navy-500 font-semibold mb-1">
                    {unfinishedCount} item{unfinishedCount !== 1 ? 's' : ''} were left unfinished
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    and may need your attention today.{' '}
                    <Text className="text-navy-500 font-semibold">Move to Today →</Text>
                  </Text>
                </View>
              </Pressable>
            )}

            <Text className="text-lg font-bold text-navy-500 mb-3">Activities List</Text>
            {tasks.length === 0 ? (
              <Text className="text-gray-400 text-center py-8">No activities for this day.</Text>
            ) : (
              tasks.map((task) => (
                <ActivityItem
                  key={task.id}
                  task={task}
                  onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
                />
              ))
            )}
          </>
        ) : (
          <>
            <View className="bg-white rounded-3xl p-6 mb-4 items-center shadow-sm">
              <CircularProgress percentage={dayStats.percentage} />
              <Text className="text-center text-gray-500 mt-4 px-4 leading-6">
                You've completed {dayStats.completed} out of {dayStats.total} of your scheduled
                tasks. {dayStats.percentage >= 75 ? 'Almost there!' : 'Keep going!'}
              </Text>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-navy-500 rounded-3xl p-5">
                <Star size={24} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-white/80 text-sm mt-3">Great Streak!</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {streak} day{streak !== 1 ? 's' : ''}
                </Text>
              </View>
              <View className="flex-1 bg-sage-100 rounded-3xl p-5">
                <TrendingUp size={24} color="#4a9b75" />
                <Text className="text-gray-500 text-sm mt-3">Weekly Average</Text>
                <Text className="text-navy-500 text-2xl font-bold mt-1">{weeklyAverage}%</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-navy-500">Still to Do</Text>
              <Text className="text-sm text-gray-400">{todoTasks.length} Left</Text>
            </View>
            {todoTasks.map((task) => (
              <ProgressTaskItem
                key={task.id}
                task={task}
                variant="todo"
                onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
                onToggle={() => toggleTaskComplete(task.id)}
              />
            ))}

            <View className="flex-row items-center gap-2 mt-4 mb-3">
              <Check size={20} color="#4a9b75" />
              <Text className="text-lg font-bold text-navy-500">Completed</Text>
            </View>
            {completedTasks.map((task) => (
              <ProgressTaskItem
                key={task.id}
                task={task}
                variant="completed"
                onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
                onToggle={() => toggleTaskComplete(task.id)}
              />
            ))}

          
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
