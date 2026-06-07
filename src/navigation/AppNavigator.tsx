import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { CalendarDays, BarChart3, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTasks } from "../context/TaskContext";
import { EditTaskScreen } from "../screens/EditTaskScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TodayScreen } from "../screens/TodayScreen";
import { RootStackParamList, TabParamList } from "../types";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_BAR_CONTENT_HEIGHT = 49;

function TabNavigator() {
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      safeAreaInsets={{
        top: 0,
        left: 0,
        right: 0,
        bottom: bottomInset,
      }}
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
        tabBarActiveTintColor: "#1a3a5c",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#f3f4f6",
          paddingTop: 8,
          paddingBottom: bottomInset,
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset + 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  const { needsOnboarding } = useTasks();

  return (
    <Stack.Navigator
      key={needsOnboarding ? "onboarding" : "main"}
      screenOptions={{ headerShown: false }}
      initialRouteName={needsOnboarding ? "Onboarding" : "MainTabs"}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
