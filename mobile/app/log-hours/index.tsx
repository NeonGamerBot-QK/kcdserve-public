import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Ionicons } from '@expo/vector-icons';
import { serviceHourSchema, ServiceHourFormValues } from '../../lib/schemas/serviceHour';

export default function LogHoursScreen() {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceHourFormValues>({
    resolver: standardSchemaResolver(serviceHourSchema),
  });

  const onSubmit = async (_data: ServiceHourFormValues) => {
    // TODO: call mutation hook once API is wired up
    router.replace('/(tabs)/dashboard');
  };

  const inputClass = (field: string) =>
    `bg-slate-50 border rounded-xl px-4 py-3 font-inter text-base text-slate-900 ${
      focusedField === field ? 'border-primary-500' : 'border-slate-200'
    }`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Ionicons name="close" size={24} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-inter-semibold text-lg text-slate-900">
          Log Hours
        </Text>
        {/* Spacer to balance the close button */}
        <View className="w-9" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        >
          {/* Organization Name */}
          <Text className="font-inter-medium text-sm text-slate-700 mb-1.5">
            Organization Name
          </Text>
          <Controller
            control={control}
            name="organizationName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={inputClass('organizationName')}
                placeholder="e.g. Red Cross, Local Food Bank"
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocusedField('organizationName')}
                onBlur={() => { onBlur(); setFocusedField(null); }}
              />
            )}
          />
          {errors.organizationName && (
            <Text className="text-xs text-red-500 mt-1">{errors.organizationName.message}</Text>
          )}

          {/* Service Date */}
          <Text className="font-inter-medium text-sm text-slate-700 mb-1.5 mt-5">
            Service Date
          </Text>
          <Controller
            control={control}
            name="serviceDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={inputClass('serviceDate')}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocusedField('serviceDate')}
                onBlur={() => { onBlur(); setFocusedField(null); }}
              />
            )}
          />
          {errors.serviceDate && (
            <Text className="text-xs text-red-500 mt-1">{errors.serviceDate.message}</Text>
          )}

          {/* Hours */}
          <Text className="font-inter-medium text-sm text-slate-700 mb-1.5 mt-5">
            Hours
          </Text>
          <Controller
            control={control}
            name="hours"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={inputClass('hours')}
                placeholder="e.g. 2.5"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={value !== undefined ? String(value) : ''}
                onChangeText={onChange}
                onFocus={() => setFocusedField('hours')}
                onBlur={() => { onBlur(); setFocusedField(null); }}
              />
            )}
          />
          {errors.hours && (
            <Text className="text-xs text-red-500 mt-1">{errors.hours.message}</Text>
          )}

          {/* Description */}
          <Text className="font-inter-medium text-sm text-slate-700 mb-1.5 mt-5">
            Description
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={inputClass('description')}
                placeholder="Describe what you did (at least 10 characters)"
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                style={{ minHeight: 96 }}
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => { onBlur(); setFocusedField(null); }}
              />
            )}
          />
          {errors.description && (
            <Text className="text-xs text-red-500 mt-1">{errors.description.message}</Text>
          )}

          {/* Submit */}
          <Pressable
            className={`mt-8 rounded-xl py-3.5 items-center ${isSubmitting ? 'bg-primary-300' : 'bg-primary-500'}`}
            onPress={() => handleSubmit(onSubmit)()}
            disabled={isSubmitting}
          >
            <Text className="font-inter-semibold text-base text-white">
              {isSubmitting ? 'Submitting…' : 'Submit Hours'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
