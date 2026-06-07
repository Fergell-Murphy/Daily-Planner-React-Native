import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays } from 'lucide-react-native';
import { useTasks } from '../context/TaskContext';

export function OnboardingScreen() {
  const { completeOnboarding } = useTasks();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    setError('');
    await completeOnboarding(trimmed);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-full bg-navy-100 items-center justify-center mb-4">
            <CalendarDays size={32} color="#1a3a5c" />
          </View>
          <Text className="text-3xl font-bold text-navy-500 text-center mb-2">
            Welcome to Daily Planner
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            What should we call you? We will use your name in greetings on the Today screen.
          </Text>
        </View>

        <Text className="text-sm text-gray-500 mb-2">Your name</Text>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (error) setError('');
          }}
          placeholder="e.g., Murphy"
          autoCapitalize="words"
          autoCorrect={false}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-lg text-navy-500 mb-2"
        />
        {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : <View className="mb-4" />}

        <Pressable
          onPress={handleContinue}
          className="bg-navy-500 rounded-2xl py-4 items-center"
        >
          <Text className="text-white text-lg font-bold">Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
