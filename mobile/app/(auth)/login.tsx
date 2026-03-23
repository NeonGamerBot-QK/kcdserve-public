import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import TopBar from "../../components/TopBar";
import Card from "../../components/Card";
import { USE_API, SERVER_URL } from "../../lib/config";
import { useRequestPin, useVerifyPin } from "../../hooks/useLogin";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../hooks/useTheme";

export default function LoginScreen() {
  const [step, setStep] = useState<"email" | "pin">("email");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const pinInputRef = useRef<TextInput>(null);
  const { isDark } = useTheme();

  const requestPinMutation = useRequestPin();
  const verifyPinMutation = useVerifyPin();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto-focus the hidden PIN input when entering the PIN step
  useEffect(() => {
    if (step === "pin") {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (pin.length === 6 && step === "pin") {
      handlePinSubmit(pin);
    }
  }, [pin]);

  function handleEmailContinue() {
    if (!USE_API) {
      router.replace("/(tabs)/dashboard");
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }

    requestPinMutation.mutate(
      { email: trimmed },
      { onSuccess: () => setStep("pin") },
    );
  }

  function handlePinSubmit(submittedPin: string) {
    if (!USE_API) {
      router.replace("/(tabs)/dashboard");
      return;
    }

    verifyPinMutation.mutate(
      { email: email.trim(), pin: submittedPin },
      {
        onError: () => {
          setPin("");
          pinInputRef.current?.focus();
        },
      },
    );
  }

  function handleBackToEmail() {
    setStep("email");
    setPin("");
    requestPinMutation.reset();
    verifyPinMutation.reset();
  }

  function handleResendPin() {
    setPin("");
    verifyPinMutation.reset();
    requestPinMutation.mutate({ email: email.trim() });
  }

  async function handleGoogleSignIn() {
    if (!USE_API || !SERVER_URL) {
      router.replace("/(tabs)/dashboard");
      return;
    }

    const scheme = Linking.createURL("/").split("://")[0];
    const returnUrl = `${scheme}://auth/success`;
    const authUrl = `${SERVER_URL}/api/v1/login/google/redirect?scheme=${encodeURIComponent(scheme)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

    if (result.type !== "success") return;

    // Parse the token from the deep-link URL
    const url = new URL(result.url);
    const token = url.searchParams.get("token");
    const expiresAt = url.searchParams.get("expires_at");

    console.log("[GoogleOAuth] result URL:", result.url);

    if (token && expiresAt) {
      const user = {
        id: Number(url.searchParams.get("user_id")),
        email: url.searchParams.get("email") ?? "",
        first_name: url.searchParams.get("first_name") ?? "",
        last_name: url.searchParams.get("last_name") ?? "",
        role: url.searchParams.get("role") ?? "volunteer",
        total_approved_hours: 0,
      };
      setAuth(token, expiresAt, user);
      router.replace("/(tabs)/dashboard");
    } else {
      const errorMsg = url.searchParams.get("message") || "unknown";
      console.log("[GoogleOAuth] error:", errorMsg);
      Alert.alert("Sign-in failed", `Google sign-in error: ${errorMsg}`);
    }
  }

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const bgInput = isDark ? "bg-slate-800" : "bg-slate-50";
  const borderInput = isDark ? "border-slate-700" : "border-slate-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";
  const dividerBg = isDark ? "bg-slate-700" : "bg-slate-200";
  const googleBtnBg = isDark ? "bg-slate-900" : "bg-white";

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <TopBar />

        {/* Welcome heading */}
        <View className="px-5 mt-4 mb-6">
          <Text className={`font-inter-semibold text-2xl ${textPrimary}`}>
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

        {step === "email" ? (
          /* Step 1: Email */
          <View className="px-5 mb-4">
            <Card>
              <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5`}>
                Email
              </Text>
              <TextInput
                className={`${bgInput} border ${borderInput} rounded-xl px-4 py-3 font-inter text-base ${textPrimary} mb-5`}
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
                  {requestPinMutation.error?.message ||
                    "Something went wrong. Try again."}
                </Text>
              )}

              <Pressable
                className={`rounded-xl py-3.5 items-center ${requestPinMutation.isPending ? "bg-primary-300" : "bg-primary-500"}`}
                onPress={handleEmailContinue}
                disabled={requestPinMutation.isPending}
              >
                <Text className="font-inter-semibold text-base text-white">
                  {requestPinMutation.isPending
                    ? "Sending code…"
                    : "Send login code"}
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
                <Text
                  className="font-inter text-sm text-slate-500 flex-1"
                  numberOfLines={1}
                >
                  {email}
                </Text>
              </View>

              <Text className="font-inter text-sm text-slate-500 mb-4 text-center">
                We sent a 6-digit code to your email
              </Text>

              <Text
                className={`font-inter-medium text-sm ${textLabel} mb-4 text-center`}
              >
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
                        ? "border-primary-500 bg-primary-50"
                        : `border-slate-200 ${isDark ? "bg-slate-800" : "bg-slate-50"}`
                    }`}
                  >
                    <Text
                      className={`font-inter-semibold text-xl ${textPrimary}`}
                    >
                      {pin[i] ?? ""}
                    </Text>
                  </View>
                ))}
              </Pressable>

              <TextInput
                ref={pinInputRef}
                value={pin}
                onChangeText={(t) => {
                  if (!verifyPinMutation.isPending) {
                    setPin(t.replace(/[^0-9]/g, "").slice(0, 6));
                  }
                }}
                keyboardType="number-pad"
                maxLength={6}
                className="absolute opacity-0"
                autoFocus
              />

              {verifyPinMutation.isError && (
                <Text className="font-inter text-sm text-red-500 text-center mb-3">
                  {verifyPinMutation.error?.message ||
                    "Invalid or expired code. Try again."}
                </Text>
              )}

              {verifyPinMutation.isPending && (
                <Text className="font-inter text-sm text-slate-400 text-center mb-3">
                  Verifying…
                </Text>
              )}

              <Pressable
                onPress={handleResendPin}
                disabled={requestPinMutation.isPending}
              >
                <Text className="font-inter-medium text-sm text-primary-500 text-center">
                  {requestPinMutation.isPending
                    ? "Resending…"
                    : "Didn't get the code? Resend"}
                </Text>
              </Pressable>
            </Card>
          </View>
        )}

        {/* OR Divider */}
        <View className="flex-row items-center px-5 mb-6">
          <View className={`flex-1 h-px ${dividerBg}`} />
          <Text className="font-inter-medium text-sm text-slate-400 mx-4">
            OR
          </Text>
          <View className={`flex-1 h-px ${dividerBg}`} />
        </View>

        {/* Google Sign-In Button */}
        <View className="px-5 mb-8">
          <Pressable
            className={`flex-row items-center justify-center ${googleBtnBg} border ${borderInput} rounded-xl py-3.5 ${googleLoading ? "opacity-60" : ""}`}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text className={`font-inter-medium text-base ${textLabel} ml-3`}>
              {googleLoading ? "Signing in…" : "Continue with Google"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
