import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import { USE_API } from '../../lib/config';
import { useRequestPin, useVerifyPin } from '../../hooks/useLogin';

export default function LoginScreen() {
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const pinInputRef = useRef<TextInput>(null);

  const requestPinMutation = useRequestPin();
  const verifyPinMutation = useVerifyPin();

  // Auto-focus the hidden PIN input when entering the PIN step
  useEffect(() => {
    if (step === 'pin') {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (pin.length === 6 && step === 'pin') {
      handlePinSubmit(pin);
    }
  }, [pin]);

  function handleEmailContinue() {
    if (!USE_API) {
      router.replace('/(tabs)/dashboard');
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    requestPinMutation.mutate(
      { email: trimmed },
      { onSuccess: () => setStep('pin') }
    );
  }

  function handlePinSubmit(submittedPin: string) {
    if (!USE_API) {
      router.replace('/(tabs)/dashboard');
      return;
    }

    verifyPinMutation.mutate(
      { email: email.trim(), pin: submittedPin },
      {
        onError: () => {
          setPin('');
          pinInputRef.current?.focus();
        },
      }
    );
  }

  function handleBackToEmail() {
    setStep('email');
    setPin('');
    requestPinMutation.reset();
    verifyPinMutation.reset();
  }

  function handleResendPin() {
    setPin('');
    verifyPinMutation.reset();
    requestPinMutation.mutate({ email: email.trim() });
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <TopBar />

        {/* Welcome heading */}
        <View className="px-5 mt-4 mb-6">
          <Text className="font-inter-semibold text-2xl text-slate-900">
            Welcome back
          </Text>
          <Text className="font-inter text-base text-slate-500 mt-1">
            Sign in to continue logging your service hours
          </Text>
          {!USE_API && (
            <View className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Text className="font-inter text-xs text-amber-700">
                Dev mode — no SERVER_URL set. Auth is bypassed.
              </Text>
            </View>
          )}
        </View>

        {step === 'email' ? (
          /* Step 1: Email */
          <View className="px-5 mb-4">
            <Card>
              <Text className="font-inter-medium text-sm text-slate-700 mb-1.5">
                Email
              </Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-inter text-base text-slate-900 mb-5"
                placeholder="student@school.edu"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={handleEmailContinue}
                returnKeyType="next"
                editable={!requestPinMutation.isPending}
              />

              {requestPinMutation.isError && (
                <Text className="font-inter text-sm text-red-500 mb-3">
                  {requestPinMutation.error?.message || 'Something went wrong. Try again.'}
                </Text>
              )}

              <Pressable
                className={`rounded-xl py-3.5 items-center ${requestPinMutation.isPending ? 'bg-primary-300' : 'bg-primary-500'}`}
                onPress={handleEmailContinue}
                disabled={requestPinMutation.isPending}
              >
                <Text className="font-inter-semibold text-base text-white">
                  {requestPinMutation.isPending ? 'Sending code…' : 'Send login code'}
                </Text>
              </Pressable>
            </Card>
          </View>
        ) : (
          /* Step 2: PIN verification */
          <View className="px-5 mb-4">
            <Card>
              <View className="flex-row items-center mb-2">
                <Pressable onPress={handleBackToEmail} className="mr-2 p-1">
                  <Ionicons name="arrow-back" size={20} color="#475569" />
                </Pressable>
                <Text className="font-inter text-sm text-slate-500 flex-1" numberOfLines={1}>
                  {email}
                </Text>
              </View>

              <Text className="font-inter text-sm text-slate-500 mb-4 text-center">
                We sent a 6-digit code to your email
              </Text>

              <Text className="font-inter-medium text-sm text-slate-700 mb-4 text-center">
                Enter your code
              </Text>

              <Pressable
                onPress={() => pinInputRef.current?.focus()}
                className="flex-row justify-center gap-2 mb-5"
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    className={`w-11 h-14 rounded-xl border-2 items-center justify-center ${
                      pin.length === i
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <Text className="font-inter-semibold text-xl text-slate-900">
                      {pin[i] ?? ''}
                    </Text>
                  </View>
                ))}
              </Pressable>

              <TextInput
                ref={pinInputRef}
                value={pin}
                onChangeText={(t) => {
                  if (!verifyPinMutation.isPending) {
                    setPin(t.replace(/[^0-9]/g, '').slice(0, 6));
                  }
                }}
                keyboardType="number-pad"
                maxLength={6}
                className="absolute opacity-0"
                autoFocus
              />

              {verifyPinMutation.isError && (
                <Text className="font-inter text-sm text-red-500 text-center mb-3">
                  {verifyPinMutation.error?.message || 'Invalid or expired code. Try again.'}
                </Text>
              )}

              {verifyPinMutation.isPending && (
                <Text className="font-inter text-sm text-slate-400 text-center mb-3">
                  Verifying…
                </Text>
              )}

              <Pressable onPress={handleResendPin} disabled={requestPinMutation.isPending}>
                <Text className="font-inter-medium text-sm text-primary-500 text-center">
                  {requestPinMutation.isPending ? 'Resending…' : "Didn't get the code? Resend"}
                </Text>
              </Pressable>
            </Card>
          </View>
        )}

        {/* OR Divider */}
        <View className="flex-row items-center px-5 mb-6">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="font-inter-medium text-sm text-slate-400 mx-4">
            OR
          </Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>

        {/* Google Sign-In Button */}
        <View className="px-5 mb-8">
          <Pressable className="flex-row items-center justify-center bg-white border border-slate-200 rounded-xl py-3.5">
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text className="font-inter-medium text-base text-slate-700 ml-3">
              Continue with Google
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
