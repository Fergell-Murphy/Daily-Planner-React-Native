import './global.css';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { TaskProvider, useTasks } from './src/context/TaskContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppContent() {
  const { isReady } = useTasks();

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#1a3a5c" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <TaskProvider>
        <AppContent />
        <StatusBar style="dark" />
      </TaskProvider>
    </SafeAreaProvider>
  );
}
