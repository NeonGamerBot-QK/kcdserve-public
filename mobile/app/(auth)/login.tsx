import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import { USE_API } from '../../lib/config';
import { useLogin } from '../../hooks/useLogin';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const pinInputRef = useRef<TextInput>(null);

  const loginMutation = useLogin();

  /** Handle sign-in press — real API or dev bypass. */
  function handleSignIn() {
    if (!USE_API) {
      // Dev mode without SERVER_URL — skip auth entirely
      router.replace('/(tabs)/dashboard');
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
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

        {/* Email / Password Card */}
        <View className="px-5 mb-4">
          <Card>
            <Text className="font-inter-medium text-sm text-slate-700 mb-1.5">
              Email
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-inter text-base text-slate-900 mb-4"
              placeholder="student@school.edu"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loginMutation.isPending}
            />

            <Text className="font-inter-medium text-sm text-slate-700 mb-1.5">
              Password
            </Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-inter text-base text-slate-900 mb-5"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loginMutation.isPending}
            />

            {loginMutation.isError && (
              <Text className="font-inter text-sm text-red-500 mb-3">
                {loginMutation.error?.message || 'Login failed. Please try again.'}
              </Text>
            )}

            <Pressable
              className={`rounded-xl py-3.5 items-center ${loginMutation.isPending ? 'bg-primary-300' : 'bg-primary-500'}`}
              onPress={handleSignIn}
              disabled={loginMutation.isPending}
            >
              <Text className="font-inter-semibold text-base text-white">
                {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
              </Text>
            </Pressable>
          </Card>
        </View>

        {/* PIN Card */}
        <View className="px-5 mb-6">
          <Card>
            <Text className="font-inter-medium text-sm text-slate-700 mb-3">
              Quick sign in with PIN
            </Text>
            <View className="flex-row justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Pressable
                  key={i}
                  onPress={() => pinInputRef.current?.focus()}
                  className="w-14 h-14 rounded-xl border-2 border-slate-200 bg-slate-50 items-center justify-center"
                >
                  <Text className="font-inter-semibold text-2xl text-slate-900">
                    {pin[i] ? '•' : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              ref={pinInputRef}
              value={pin}
              onChangeText={(t) => setPin(t.slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              className="absolute opacity-0"
            />
          </Card>
        </View>

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
